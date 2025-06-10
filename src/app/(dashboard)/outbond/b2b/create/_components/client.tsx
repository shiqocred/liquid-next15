"use client";

import {
  Tag,
  Upload,
  Search,
  SaveIcon,
  Briefcase,
  RefreshCcw,
  PercentCircle,
  ArrowUpRightFromSquare,
  Box,
  BadgeDollarSign,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { AxiosError } from "axios";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { columnProductB2B } from "./columns";
import Loading from "@/app/(dashboard)/loading";
import { DataTable } from "@/components/data-table";
import { alertError, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import {
  DialogBuyer,
  DialogUpload,
  DialogProduct,
  DialogDiscount,
  DialogCategory,
} from "./dialogs";

import {
  useAddProductB2B,
  useFinishB2B,
  useGetListSaleB2B,
  useRemoveProductB2B,
} from "../_api";
import { useSearch } from "@/lib/search";
import { useConfirm } from "@/hooks/use-confirm";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialValue = {
  buyer_id: "",
  name_buyer: "",
  discount_bulky: "0",
  category_bulky: "",
  total_old_price_bulky: "0",
  after_price_bulky: "0",
  total_product_bulky: "0",
};

export const Client = () => {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [dialog, setDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault("")
  );

  const [RemoveDialog, confirmRemove] = useConfirm(
    "Delete Product B2B",
    "This action cannot be undone",
    "destructive"
  );
  const [FinishDialog, confirmFinish] = useConfirm(
    "Create B2B",
    "This action cannot be undone",
    "liquid"
  );

  const [input, setInput] = useState(initialValue);

  const addProductMutate = useAddProductB2B();
  const { mutate: addProduct, isPending: isPendingAddProduct } =
    addProductMutate;
  const { mutate: removeProduct, isPending: isPendingRemoveProduct } =
    useRemoveProductB2B();
  const { mutate: finishB2B, isPending: isPendingFinishB2B } = useFinishB2B();

  const { search, searchValue, setSearch } = useSearch();

  const { data, isPending, isSuccess, refetch, isRefetching, error, isError } =
    useGetListSaleB2B();

  const isLoading = isPending || isRefetching || isPendingFinishB2B;

  const listData: any[] = useMemo(() => {
    return data?.data.data.resource?.bulky_sales ?? [];
  }, [data]);

  const handleFinish = async () => {
    const ok = await confirmFinish();

    if (!ok) return;

    finishB2B(
      {},
      {
        onSuccess: () => {
          router.push("/outbond/b2b");
        },
      }
    );
  };

  const handleAddProduct = ({
    type,
    barcode,
    file,
  }: {
    type: "product" | "file";
    barcode?: string;
    file?: File;
  }) => {
    const bodyProduct = {
      barcode_product: barcode,
      buyer_id: input.buyer_id,
      discount_bulky: input.discount_bulky,
      category_bulky: input.category_bulky,
    };

    const bodyFile = new FormData();
    if (file) {
      bodyFile.append("file_import", file);
    }
    bodyFile.append("buyer_id", input.buyer_id);
    bodyFile.append("discount_bulky", input.discount_bulky);
    bodyFile.append("category_bulky", input.category_bulky);

    addProduct(
      { body: type === "product" ? bodyProduct : bodyFile },
      {
        onSuccess: () => {
          if (dialog === "product") {
            setDialog("");
          }
          setSearch("");
          if (searchRef.current) {
            searchRef.current.focus();
          }
        },
      }
    );
  };

  const handleRemoveProduct = async (id: string) => {
    const ok = await confirmRemove();

    if (!ok) return;

    removeProduct({ id });
  };

  useEffect(() => {
    if (searchValue) {
      handleAddProduct({ type: "product", barcode: searchValue });
    }
  }, [searchValue]);

  useEffect(() => {
    if (data && data.data.data.resource && isSuccess) {
      setInput(data.data.data.resource);
    } else {
      setInput(initialValue);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data Buyer",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
      <RemoveDialog />
      <FinishDialog />
      <DialogProduct
        open={dialog === "product"}
        onOpenChange={() => {
          if (dialog === "product") {
            setDialog("");
          }
        }}
        isPendingAddProduct={isPendingAddProduct}
        handleAddProduct={handleAddProduct}
      />
      <DialogBuyer
        open={dialog === "buyer"}
        onOpenChange={() => {
          if (dialog === "buyer") {
            setDialog("");
          }
        }}
        setInput={setInput}
      />
      <DialogUpload
        open={dialog === "upload"}
        onOpenChange={() => {
          if (dialog === "upload") {
            setDialog("");
          }
        }}
        handleAddProduct={handleAddProduct}
        addProductMutate={addProductMutate}
      />
      <DialogDiscount
        open={dialog === "discount"}
        onOpenChange={() => {
          if (dialog === "discount") {
            setDialog("");
          }
        }}
        data={input}
        setData={setInput}
      />
      <DialogCategory
        open={dialog === "category"}
        onOpenChange={() => {
          if (dialog === "category") {
            setDialog("");
          }
        }}
        data={input}
        setData={setInput}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/b2b">B2B</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full relative flex flex-col gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
          <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
            <Link href="/outbond/b2b">
              <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Create B2B</h1>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center gap-4">
                <TooltipProviderPage
                  value={
                    !input.name_buyer ? (
                      "Add Buyer"
                    ) : (
                      <div className="flex flex-col max-w-72">
                        <p>Buyer: {input.name_buyer}</p>
                        {listData.length > 0 && (
                          <p className="text-red-300">
                            (Delete all product to change)
                          </p>
                        )}
                      </div>
                    )
                  }
                >
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("buyer")}
                    disabled={listData.length > 0}
                  >
                    <Briefcase />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="w-72 text-left truncate">
                      {input.buyer_id ? input.name_buyer : "Select Buyer"}
                    </p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage
                  value={
                    <div className="flex flex-col max-w-72">
                      <p>Discount: {input.discount_bulky}%</p>
                      {listData.length > 0 && (
                        <p className="text-red-300">
                          (Delete all product to change)
                        </p>
                      )}
                    </div>
                  }
                >
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("discount")}
                    disabled={listData.length > 0}
                  >
                    <PercentCircle />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="min-w-5">{input.discount_bulky}%</p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage
                  value={
                    !input.category_bulky ? (
                      "Add Category"
                    ) : (
                      <div className="flex flex-col max-w-72">
                        <p>Category: {input.category_bulky}</p>
                        {listData.length > 0 && (
                          <p className="text-red-300">
                            (Delete all product to change)
                          </p>
                        )}
                      </div>
                    )
                  }
                >
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("category")}
                    disabled={listData.length > 0}
                  >
                    <Tag />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="min-w-5 max-w-52 truncate">
                      {input.category_bulky ? input.category_bulky : "-"}
                    </p>
                  </Button>
                </TooltipProviderPage>
              </div>
              <Button
                onClick={handleFinish}
                variant={"liquid"}
                disabled={listData.length === 0 || isPendingFinishB2B}
              >
                <SaveIcon />
                Save
              </Button>
            </div>
            <Separator className="bg-sky-400/80" />
            <div className="flex items-center gap-4">
              <TooltipProviderPage value={"Total Product"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <Box />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {parseFloat(input.total_product_bulky).toLocaleString()}
                  </p>
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Total all product price"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <BadgeDollarSign />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {formatRupiah(parseFloat(input.total_old_price_bulky))}
                  </p>
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Total final price"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <DollarSign />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {formatRupiah(parseFloat(input.after_price_bulky))}
                  </p>
                </Button>
              </TooltipProviderPage>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-b rounded-tr shadow flex flex-col gap-4">
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center w-full">
              <TooltipProviderPage value={"Add Product"}>
                <div className="relative flex w-full items-center">
                  <Search className="absolute size-4 ml-3" />
                  <Input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={!input.buyer_id || !input.category_bulky}
                    className="border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-0 border-r-0 rounded-r-none pl-10 disabled:opacity-100"
                  />
                </div>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Open List Products"}>
                <Button
                  size={"icon"}
                  variant={"liquid"}
                  className="rounded-l-none"
                  disabled={!input.buyer_id || !input.category_bulky}
                  onClick={() => setDialog("product")}
                >
                  <ArrowUpRightFromSquare />
                </Button>
              </TooltipProviderPage>
            </div>
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                variant={"outline"}
                className="border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 flex-none"
                size={"icon"}
                onClick={() => refetch()}
              >
                <RefreshCcw className={isLoading ? "animate-spin" : ""} />
              </Button>
            </TooltipProviderPage>
            <Button
              variant={"liquid"}
              onClick={() => setDialog("upload")}
              disabled={!input.buyer_id || !input.category_bulky}
            >
              <Upload />
              Import File
            </Button>
          </div>
          <DataTable
            columns={columnProductB2B({
              handleRemoveProduct,
              isLoading: isPendingRemoveProduct,
            })}
            data={listData ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
