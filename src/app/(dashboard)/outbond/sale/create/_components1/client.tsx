"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRightFromSquare,
  Check,
  CheckCircle2,
  PackagePlus,
  Percent,
  PercentCircle,
  RefreshCcw,
  Search,
  TicketPercent,
  User,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductSales } from "./product-sales";
import { useGetListChasier } from "../_api/use-get-list-cashier";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useSubmit } from "../_api/use-submit";
import { useGaborProduct } from "../_api/use-gabor-product";
import { useCreatePPN } from "../_api/use-create-ppn";
import { useUpdatePPN } from "../_api/use-update-ppn";
import { useDeletePPN } from "../_api/use-delete-ppn";
import { useUpdatePriceProduct } from "../_api/use-update-price-product";
import { useConfirm } from "@/hooks/use-confirm";
import { Separator } from "@/components/ui/separator";
import { formatRupiah, numericString } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import DialogBuyer from "./dialog/dialog-buyer";
import { usePagination, useSearchQuery } from "@/lib/utils-client";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { columnSales } from "./columns";
import DialogDiscount from "./dialog/dialog-discount";
import DialogVoucher from "./dialog/dialog-voucher";
import DialogCarton from "./dialog/dialog-carton";
import { DialogPPN } from "./dialog/dialog-ppn";

export const Client = () => {
  const [openDialog, setOpenDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault("")
  );
  const [onBoarding, setOnBoarding] = useQueryState(
    "onBoarding",
    parseAsBoolean.withDefault(false)
  );

  const [isComplete, setIsComplete] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdatePrice, setIsUpdatePrice] = useState(false);
  const [isGabor, setIsGabor] = useState(false);

  const [inputEdit, setInputEdit] = useState({
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
    discountFor: "",
  });

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );

  // data search, page
  const { page, metaPage, setPage, setPagination } = usePagination();

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetListChasier({ p: page });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();

  const { mutate: mutateGabor, isPending: isPendingGabor } = useGaborProduct();
  const { mutate: mutateCreatePPN, isPending: isPendingCreatePPN } =
    useCreatePPN();
  const { mutate: mutateUpdatePPN, isPending: isPendingUpdatePPN } =
    useUpdatePPN();
  const { mutate: mutateDeletePPN, isPending: isPendingDeletePPN } =
    useDeletePPN();

  const { mutate: mutateUpdatePrice, isPending: isPendingUpdatePrice } =
    useUpdatePriceProduct();

  // mutate end ----------------------------------------------------------------

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
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
      }));
    }
  }, [data]);

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
    //   if (!input.buyerId) {
    //     setOnBoarding(true);
    //   }
  }, [input, openDialog]);

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
      <DialogBuyer
        open={openDialog === "buyer"}
        setInput={setInput}
        onCloseModal={() => setOpenDialog("")}
        disabled={dataList?.length > 0}
      />
      <DialogDiscount
        open={openDialog === "discount"}
        onCloseModal={() => setOpenDialog("")}
        setInput={setInput}
        input={input}
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
      <DialogPPN
        open={openDialog === "ppn"}
        onCloseModal={() => setOpenDialog("")}
        setInputData={setInput}
        inputData={input}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
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
            <div className="flex flex-col gap-3 w-full bg-white rounded-md shadow p-5">
              <div className="flex items-center flex-wrap gap-3 w-full">
                <TooltipProviderPage
                  value={
                    input.buyerId ? (
                      <div className="max-w-32 2xl:max-w-64">
                        <p>Buyer: {input.buyer}</p>
                        <p>Phone: {input.buyerPhone}</p>
                        <p>Address: {input.buyerAddress}</p>
                        {dataList?.length > 0 && (
                          <p className="flex items-center text-red-300 pt-2 mt-2 border-t border-red-300 font-semibold">
                            <AlertCircle className="size-3 mr-2" />
                            Clear product to change
                          </p>
                        )}
                      </div>
                    ) : (
                      <p>Select Buyer</p>
                    )
                  }
                >
                  <Button
                    variant={"outline"}
                    className="border-black disabled:pointer-events-auto disabled:opacity-100"
                    onClick={() => setOpenDialog("buyer")}
                    disabled={dataList?.length > 0}
                  >
                    <User className="size-4" />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="w-32 2xl:w-64 text-start truncate">
                      {input.buyerId ? input.buyer : "Select Buyer"}
                    </p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage
                  value={
                    <div>
                      <p>Discount</p>
                      {dataList?.length > 0 && (
                        <p className="flex items-center text-red-300 pt-2 mt-2 border-t border-red-300 font-semibold">
                          <AlertCircle className="size-3 mr-2" />
                          Clear product to change
                        </p>
                      )}
                    </div>
                  }
                >
                  <Button
                    variant={"outline"}
                    className="border-black disabled:pointer-events-auto disabled:opacity-100"
                    onClick={() => setOpenDialog("discount")}
                    disabled={dataList?.length > 0}
                  >
                    <PercentCircle className="size-4" />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p>{input.discount}%</p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage value={<p>Voucher</p>}>
                  <Button
                    variant={"outline"}
                    className="border-black"
                    onClick={() => setOpenDialog("voucher")}
                  >
                    <TicketPercent className="size-4" />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p>{formatRupiah(parseFloat(input.voucher))}</p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage value={<p>Carton Box</p>}>
                  <Button
                    variant={"outline"}
                    className="border-black"
                    onClick={() => setOpenDialog("carton")}
                  >
                    <PackagePlus className="size-4" />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p>{input.cartonQty}</p>
                    <p>@{formatRupiah(parseFloat(input.cartonUnit))}</p>
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p>
                      {formatRupiah(
                        parseFloat(input.cartonQty) *
                          parseFloat(input.cartonUnit)
                      )}
                    </p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage value={<p>PPN Enabled</p>}>
                  <Button
                    variant={"outline"}
                    className="relative border-black"
                    onClick={() => setOpenDialog("ppn")}
                  >
                    <CheckCircle2 className="size-3 absolute -top-1.5 -right-1.5 fill-white" />
                    <p className="text-xs font-bold">PPN</p>
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p>40%</p>
                  </Button>
                </TooltipProviderPage>
              </div>
              <div className="flex w-full gap-3 items-center">
                <p className="text-sm font-semibold text-gray-500">Price</p>
                <Separator className="bg-gray-500 flex-auto" />
              </div>
              <div className="flex items-center gap-3 w-full justify-between flex-wrap">
                <div className="flex items-center flex-wrap gap-3">
                  <TooltipProviderPage value={<p>Dasar Pengenaan Pajak</p>}>
                    <Button
                      variant={"outline"}
                      className="border-black disabled:opacity-100 disabled:pointer-events-auto disabled:bg-transparent"
                      disabled
                    >
                      <p className="text-xs font-bold">DPP</p>
                      <Separator
                        orientation="vertical"
                        className="bg-gray-500"
                      />
                      <p>{formatRupiah(10000000)}</p>
                    </Button>
                  </TooltipProviderPage>
                  <TooltipProviderPage value={<p>Pajak Pertambahan Nilai</p>}>
                    <Button
                      variant={"outline"}
                      className="border-black disabled:opacity-100 disabled:pointer-events-auto disabled:bg-transparent"
                      disabled
                    >
                      <p className="text-xs font-bold">PPN</p>
                      <Separator
                        orientation="vertical"
                        className="bg-gray-500"
                      />
                      <p>{formatRupiah(10000000)}</p>
                    </Button>
                  </TooltipProviderPage>
                  <TooltipProviderPage value={<p>Total Harga</p>}>
                    <Button
                      variant={"outline"}
                      className="border-black disabled:opacity-100 disabled:pointer-events-auto disabled:bg-transparent"
                      disabled
                    >
                      <p className="text-xs font-bold">Total</p>
                      <Separator
                        orientation="vertical"
                        className="bg-gray-500"
                      />
                      <p>{formatRupiah(10000000)}</p>
                    </Button>
                  </TooltipProviderPage>
                </div>
                <Button variant={"liquid"} className="flex-none">
                  Checkout
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
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
                      disabled={!input.buyerId}
                      className="rounded-r-none border-r-0 pl-9 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100 disabled:cursor-default"
                    />
                    <Label className="left-3 absolute">
                      <Search className="size-4" />
                    </Label>
                    <Button
                      className="flex-none rounded-l-none disabled:opacity-100 disabled:pointer-events-auto disabled:hover:bg-sky-400/80"
                      variant={"liquid"}
                      size={"icon"}
                      disabled={!input.buyerId}
                    >
                      <ArrowUpRightFromSquare />
                    </Button>
                  </div>
                </TooltipProviderPage>
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                >
                  <RefreshCcw />
                </Button>
              </div>
              <DataTable
                isLoading={isRefetching}
                columns={columnSales({
                  metaPage,
                  isPendingUpdatePrice,
                  isPendingGabor,
                  isPendingRemoveProduct,
                  isPendingSubmit,
                  setIsUpdatePrice,
                  setIsGabor,
                  setInputEdit,
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
