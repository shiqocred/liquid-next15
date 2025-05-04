"use client";

import {
  User,
  Search,
  Percent,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  ArrowUpRightFromSquare,
  Check,
} from "lucide-react";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/pagination";
import { DataTable } from "@/components/data-table";
import { Separator } from "@/components/ui/separator";

import { useSubmit } from "../_api/use-submit";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useGetListChasier } from "../_api/use-get-list-cashier";

import { columnSales } from "./columns";
import { useConfirm } from "@/hooks/use-confirm";
import { alertError, cn, numericString } from "@/lib/utils";
import { useDebounceSearch, usePagination } from "@/lib/utils-client";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { TopMenu } from "./top-menu";
import DialogBuyer from "./dialog/dialog-buyer";
import DialogCarton from "./dialog/dialog-carton";
import { DialogGabor } from "./dialog/dialog-gabor";
import DialogVoucher from "./dialog/dialog-voucher";
import DialogDiscount from "./dialog/dialog-discount";
import { DialogProduct } from "./dialog/dialog-product";
import { DialogUpdatePrice } from "./dialog/dialog-update-price";

export const Client = () => {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault("")
  );
  const [onBoarding, setOnBoarding] = useQueryState(
    "onBoarding",
    parseAsBoolean.withDefault(false)
  );
  const addRef = useRef<HTMLInputElement | null>(null);

  const [isComplete, setIsComplete] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoadingSale, setisLoadingSale] = useState(false);

  const [productDetail, setProductDetail] = useState({
    id: "",
    price: "0",
  });
  const [input, setInput] = useState({
    discount: "0",
    buyer: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerId: "",
    price: "0",
    cartonQty: "0",
    cartonUnit: "0",
    voucher: "0",
    ppnActive: 0,
    isTax: false,
    discountFor: "",
    barcode: "",
  });

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );
  const [SubmitDialog, confirmSubmit] = useConfirm(
    "Create Sale",
    "This action cannot be undone",
    "liquid"
  );

  // data search, page
  const { search, searchValue, setSearch } = useDebounceSearch();
  const { page, metaPage, setPage, setPagination } = usePagination();
  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetListChasier({ p: page });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();

  // mutate end ----------------------------------------------------------------

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  const handleSubmit = async () => {
    const ok = await confirmSubmit();

    if (!ok) return;
    setIsComplete(true);

    const totalPriceBeforeTax =
      parseFloat(input.price) +
      parseFloat(input.cartonQty) * parseFloat(input.cartonUnit) -
      parseFloat(input.voucher);
    const taxPrice = (totalPriceBeforeTax / 100) * input.ppnActive;

    const body = {
      cardbox_qty: input.cartonQty,
      cardbox_unit_price: input.cartonUnit,
      total_price_document_sale: totalPriceBeforeTax,
      voucher: input.voucher,
      is_tax: input.isTax ? 1 : 0,
      tax: input.ppnActive,
      price_after_tax: totalPriceBeforeTax + (input.isTax ? taxPrice : 0),
    };

    mutateSubmit(
      { body },
      {
        onSuccess: () => {
          router.push("/outbond/sale");
        },
      }
    );
  };

  useEffect(() => {
    if (isSuccess && data) {
      const resData = data?.data.data.resource;
      setPagination(resData);
      setInput((prev) => ({
        ...prev,
        buyerAddress: resData.buyer_address,
        buyerPhone: resData.buyer_phone,
        buyer: resData.sale_buyer_name,
        buyerId: resData.sale_buyer_id,
        discount: Math.round(
          resData.data?.[0]?.new_discount_sale ?? "0"
        ).toString(),
        discountFor: resData.data?.[0]?.type_discount ?? "",
        price: Math.round(resData.total_sale ?? "0").toString(),
        barcode: resData?.code_document_sale,
      }));
    }
  }, [data]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // handle input error
  useEffect(() => {
    if (isNaN(parseFloat(input.discount))) {
      setInput((prev: any) => ({ ...prev, discount: "0", discountFor: "" }));
    }
    if (parseFloat(input.discount) === 0 && input.discountFor) {
      setInput((prev: any) => ({ ...prev, discountFor: "" }));
    }
    if (parseFloat(input.discount) > 0 && !input.discountFor) {
      setInput((prev: any) => ({ ...prev, discountFor: "old" }));
    }
    if (isNaN(input.ppnActive)) {
      setInput((prev) => ({ ...prev, ppnActive: 0 }));
    }
    if (openDialog === "product" && !input.buyerId) {
      setOpenDialog("");
    }
    if (!input.buyerId) {
      setOnBoarding(true);
    }
  }, [input, openDialog]);

  // hanlde warning before unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isComplete && isDirty) {
        event.preventDefault();
        event.returnValue = ""; // Beberapa browser memerlukan nilai kosong untuk menampilkan dialog.
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isComplete, isDirty]);

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <DeleteProductDialog />
      <SubmitDialog />
      <DialogBuyer
        open={openDialog === "buyer"}
        setInput={setInput}
        onCloseModal={() => setOpenDialog("")}
        disabled={dataList?.length > 0}
      />
      <DialogDiscount
        open={openDialog === "discount"}
        onCloseModal={() => setOpenDialog("")}
        setData={setInput}
        data={input}
      />
      <DialogVoucher
        open={openDialog === "voucher"}
        onCloseModal={() => setOpenDialog("")}
        setInputData={setInput}
        inputData={input}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      />
      <DialogCarton
        open={openDialog === "carton"}
        onCloseModal={() => setOpenDialog("")}
        setInputData={setInput}
        inputData={input}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      />
      <DialogGabor
        open={openDialog === "gabor" && !!productDetail.id}
        onCloseModal={() => {
          setOpenDialog("");
          setProductDetail({ id: "", price: "0" });
        }}
        productDetail={productDetail}
        setLoading={setisLoadingSale}
      />
      <DialogUpdatePrice
        open={openDialog === "update-price" && !!productDetail.id}
        onCloseModal={() => {
          setOpenDialog("");
          setProductDetail({ id: "", price: "0" });
        }}
        productDetail={productDetail}
        setLoading={setisLoadingSale}
      />
      <DialogProduct
        open={openDialog === "product"}
        onCloseModal={() => setOpenDialog("")}
        inputData={input}
        addRef={addRef}
        setLoading={setisLoadingSale}
        addProductValue={searchValue}
        setAddProductValue={setSearch}
      />
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Outbond</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/outbond/sale">Sale</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Cashier</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/outbond/sale">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Cashier</h1>
        </div>
        {onBoarding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOnBoarding(false);
            }}
            className="flex flex-col gap-3 w-full bg-white rounded-md shadow p-5"
          >
            <p className="font-bold text-lg">Onboarding Cashier</p>
            <div className="flex gap-3 w-full">
              <div className="flex flex-col gap-1 w-full">
                <Label>Buyer</Label>
                <Button
                  variant={"outline"}
                  className="border-black"
                  type="button"
                  onClick={() => setOpenDialog("buyer")}
                >
                  <User className="size-4" />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="w-full text-start truncate">
                    {input.buyerId ? input.buyer : "Select Buyer"}
                  </p>
                </Button>
              </div>
              <div className="flex gap-4 items-center w-full">
                <div className="flex flex-col gap-1 w-full relative">
                  <Label>Discount</Label>
                  <Input
                    value={input.discount}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        discount: numericString(e.target.value),
                      }))
                    }
                    className="border-black focus-visible:ring-0 pr-9"
                  />
                  <Label className="absolute right-3 bottom-2.5">
                    <Percent className="size-4" />
                  </Label>
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-1 w-full",
                    !input.discountFor && "opacity-50"
                  )}
                >
                  <Label>Discount for</Label>
                  <div className="flex gap-2 w-full">
                    <Button
                      type="button"
                      disabled={!input.discountFor}
                      className={cn(
                        "w-full pr-6",
                        input.discountFor !== "old" &&
                          "bg-sky-200 hover:bg-sky-300"
                      )}
                      variant={"liquid"}
                      size="sm"
                      onClick={() =>
                        setInput((prev: any) => ({
                          ...prev,
                          discountFor: "old",
                        }))
                      }
                    >
                      <Check
                        className={cn(
                          "opacity-0",
                          input.discountFor === "old" && "opacity-100"
                        )}
                      />
                      Old Price
                    </Button>
                    <Button
                      type="button"
                      disabled={!input.discountFor}
                      className={cn(
                        "w-full pr-6",
                        input.discountFor !== "new" &&
                          "bg-sky-200 hover:bg-sky-300"
                      )}
                      variant={"liquid"}
                      size="sm"
                      onClick={() =>
                        setInput((prev: any) => ({
                          ...prev,
                          discountFor: "new",
                        }))
                      }
                    >
                      <Check
                        className={cn(
                          "opacity-0",
                          input.discountFor === "new" && "opacity-100"
                        )}
                      />
                      New Price
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Button
              disabled={!input.buyerId}
              type="submit"
              variant={"liquid"}
              className="w-full"
            >
              Next
              <ArrowRight />
            </Button>
          </form>
        ) : (
          <>
            <TopMenu
              input={input}
              setInput={setInput}
              dataList={dataList}
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
              handleSubmit={handleSubmit}
            />
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
              <div className="flex items-center w-full gap-4">
                <TooltipProviderPage
                  value={
                    !input.buyerId ? (
                      <p>Select Buyer First</p>
                    ) : (
                      <p>Add Product</p>
                    )
                  }
                >
                  <div className="flex items-center w-full relative">
                    <Input
                      disabled={!input.buyerId || isPendingSubmit}
                      className="rounded-r-none border-r-0 pl-9 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100 disabled:cursor-default"
                      autoComplete="off"
                      value={search ?? ""}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Label className="left-3 absolute">
                      <Search className="size-4" />
                    </Label>
                    <Button
                      className="flex-none rounded-l-none disabled:opacity-100 disabled:pointer-events-auto disabled:hover:bg-sky-400/80"
                      variant={"liquid"}
                      size={"icon"}
                      disabled={!input.buyerId || isPendingSubmit}
                      onClick={() => setOpenDialog("product")}
                    >
                      <ArrowUpRightFromSquare />
                    </Button>
                  </div>
                </TooltipProviderPage>
                <TooltipProviderPage value={"Reload Data"}>
                  <Button
                    size={"icon"}
                    variant={"outline"}
                    className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                    onClick={(e) => {
                      e.preventDefault();
                      refetch();
                    }}
                    disabled={isRefetching || isPendingSubmit}
                  >
                    <RefreshCcw
                      className={cn(
                        isRefetching || (isPendingSubmit && "animate-spin")
                      )}
                    />
                  </Button>
                </TooltipProviderPage>
              </div>
              <DataTable
                isLoading={isRefetching}
                columns={columnSales({
                  metaPage,
                  isLoadingSale:
                    isLoadingSale || isPendingRemoveProduct || isPendingSubmit,
                  setProductDetail,
                  setOpenDialog,
                  handleRemoveProduct,
                })}
                data={dataList ?? []}
              />
              <Pagination
                pagination={{ ...metaPage, current: page }}
                setPagination={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
