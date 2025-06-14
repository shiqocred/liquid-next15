"use client";

import {
  ArrowLeft,
  ChevronDownCircle,
  Circle,
  Loader2,
  PencilRuler,
  Percent,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  alertError,
  base64ToBlob,
  cn,
  formatRupiah,
  setPaginate,
} from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetCreatePalet } from "../_api/use-get-create-palet";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useSubmit } from "../_api/use-submit";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { useGetListProduct } from "../_api/use-get-list-product";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useGetSelect } from "../_api/use-get-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProceeedImage } from "../_api/use-proceed-image";
import PopoverWithTrigger from "./popover-with-trigger";
import { RichInput } from "@/components/ui/rich-input";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});
const DialogUpload = dynamic(() => import("./dialog-upload"), {
  ssr: false,
});
const UploadImage = dynamic(() => import("./upload-image"), {
  ssr: false,
});

export const Client = () => {
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [isOpenWarehouse, setIsOpenWarehouse] = useState(false);
  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const [isOpenCondition, setIsOpenCondition] = useState(false);
  const [isOpenBrand, setIsOpenBrand] = useState(false);
  const [isProduct, setIsProduct] = useState(false);
  const [isOpenImage, setIsOpenImage] = useState(false);
  const [isOpenUpload, setIsOpenUpload] = useState(false);

  const [resProceedImage, setResProceedImage] = useState<string[]>([]);
  const [urlDialog, setUrlDialog] = useState("/images/liquid8_og_800x800.png");
  const [input, setInput] = useState({
    name: "",
    category: { id: "", name: "" },
    warehouse: { id: "", name: "" },
    condition: { id: "", name: "" },
    status: { id: "", name: "" },
    brand: [] as { id: string; name: string }[],
    description: "",
    total: "0",
    totalNew: "0",
    discount: "0",
  });

  // search, debounce, paginate strat ----------------------------------------------------------------

  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [productSearch, setProductSearch] = useState("");
  const searchProductValue = useDebounce(productSearch);
  const [pageProduct, setPageProduct] = useState(1);
  const [metaPageProduct, setMetaPageProduct] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // search, debounce, paginate end ----------------------------------------------------------------

  // confirm strat ----------------------------------------------------------------

  const [SubmitDialog, confirmSubmit] = useConfirm(
    "Create Palet",
    "This action cannot be undone",
    "liquid"
  );

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Remove Product From Filter",
    "This action cannot be undone",
    "destructive"
  );

  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();
  const { mutate: mutateProceed, isPending: isPendingProceed } =
    useProceeedImage();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetCreatePalet({ p: page });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProduct({ p: pageProduct, q: searchProductValue });

  const {
    data: dataSelect,
    error: errorSelect,
    isError: isErrorSelect,
  } = useGetSelect();

  // query end ----------------------------------------------------------------

  // memeo strat ----------------------------------------------------------------

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data.data;
  }, [data]);

  const dataListCategories: any[] = useMemo(() => {
    return dataSelect?.data.data.resource.categories ?? [];
  }, [dataSelect]);

  const dataListWarehouses: any[] = useMemo(() => {
    return dataSelect?.data.data.resource.warehouses ?? [];
  }, [dataSelect]);

  const dataListProductBrands: any[] = useMemo(() => {
    return dataSelect?.data.data.resource.product_brands ?? [];
  }, [dataSelect]);

  const dataListProductConditions: any[] = useMemo(() => {
    return dataSelect?.data.data.resource.product_conditions ?? [];
  }, [dataSelect]);

  const dataListProductStatus: any[] = useMemo(() => {
    return dataSelect?.data.data.resource.product_status ?? [];
  }, [dataSelect]);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------

  useEffect(() => {
    const dataResource = data?.data.data.resource;
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: dataResource?.data,
      setPage: setPage,
      setMetaPage: setMetaPage,
    });
    setInput((prev) => ({
      ...prev,
      total: Math.ceil(dataResource?.total_old_price).toString(),
      totalNew: Math.ceil(dataResource?.total_new_price).toString(),
    }));
  }, [data]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessProduct,
      data: dataProduct,
      dataPaginate: dataProduct?.data.data.resource,
      setPage: setPageProduct,
      setMetaPage: setMetaPageProduct,
    });
  }, [dataProduct]);

  // paginate end ----------------------------------------------------------------

  // handling action strat ----------------------------------------------------------------

  const handleAddProduct = (id: any) => {
    mutateAddProduct({ id });
  };

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  const handleSubmit = async () => {
    const ok = await confirmSubmit();

    if (!ok) return;

    const body = new FormData();
    body.append("name_palet", input.name);
    body.append(
      "total_price_palet",
      parseFloat(input.discount) > 0
        ? (
            parseFloat(input.total) -
            (parseFloat(input.total) / 100) * parseFloat(input.discount)
          ).toString()
        : input.totalNew
    );
    body.append("discount", input.discount);
    body.append("total_product_palet", metaPage.total.toString());
    body.append("category_palet_id", input.category.id);
    body.append("category_palet", input.category.name);
    body.append("description", input.description);
    body.append("is_active", "1");
    body.append("warehouse_id", input.warehouse.id);
    body.append("product_condition_id", input.condition.id);
    body.append("product_status_id", input.status.id);
    body.append("is_sale", "0");
    input.brand.map((item) => body.append("product_brand_ids[]", item.id));
    if (resProceedImage.length > 0) {
      for (const element of resProceedImage) {
        const mimeType = "image/jpeg"; // Sesuaikan dengan tipe MIME
        const blob = base64ToBlob(element, mimeType);
        body.append("images[]", blob);
      }
    }

    mutateSubmit({ body });
  };

  const handleProceedImage = (files: File[]) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    mutateProceed(
      { body: formData },
      {
        onSuccess: (data) => {
          setResProceedImage((prev) => [...prev, ...data.data.processedImages]);
          setIsOpenUpload(false);
        },
      }
    );
  };

  // handling action end ----------------------------------------------------------------

  // handling close strat ----------------------------------------------------------------

  const handleCloseProduct = () => {
    setIsProduct(false);
    setProductSearch("");
    setPageProduct(1);
    setMetaPageProduct({
      from: 0,
      last: 0,
      perPage: 0,
      total: 0,
    });
  };

  // Menghapus file berdasarkan index
  const handleRemoveFile = (index: number) => {
    setResProceedImage((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // handling close end ----------------------------------------------------------------

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // handle error product
  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Product",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  useEffect(() => {
    alertError({
      isError: isErrorSelect,
      error: errorSelect as AxiosError,
      data: "Select Palet",
      action: "get data",
      method: "GET",
    });
  }, [isErrorSelect, errorSelect]);

  useEffect(() => {
    if (isNaN(parseFloat(input.discount))) {
      setInput((prev) => ({ ...prev, discount: "0" }));
    }
  }, [input]);

  const columnPalet: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPage.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_barcode_product",
      header: "Barcode",
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      accessorKey: "old_price_product",
      header: "Price",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {formatRupiah(row.original.old_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <Button
            className="items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50"
            variant={"outline"}
            type="button"
            disabled={isPendingRemoveProduct || isPendingSubmit}
            onClick={() => {
              handleRemoveProduct(row.original.id);
            }}
          >
            {isPendingRemoveProduct ? (
              <Loader2 className="w-4 h-4 mr-1" />
            ) : (
              <Trash2 className="w-4 h-4 mr-1" />
            )}
            <div>Delete</div>
          </Button>
        </div>
      ),
    },
  ];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <SubmitDialog />
      <DeleteProductDialog />
      <DialogProduct
        open={isProduct}
        onCloseModal={() => {
          if (isProduct) {
            handleCloseProduct();
          }
        }}
        search={productSearch}
        setSearch={setProductSearch}
        refetch={refetchProduct}
        isRefetching={isRefetchingProduct}
        dataTable={dataListProduct}
        page={pageProduct}
        metaPage={metaPageProduct}
        setPage={setPageProduct}
        handleAdd={handleAddProduct}
        isPendingAdd={isPendingAddProduct}
      />
      <DialogUpload
        open={isOpenUpload}
        onClose={() => {
          if (isOpenUpload) {
            setIsOpenUpload(false);
          }
        }}
        handleProceed={handleProceedImage}
        setIsOpenImage={setIsOpenImage}
        setUrlDialog={setUrlDialog}
        isPending={isPendingProceed}
        images={resProceedImage.length}
      />
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="z-10" href="/">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Inventory</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="z-10" href="/inventory/pallet/list">
                Palet
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Create</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Button
            asChild
            className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none z-10"
          >
            <Link href="/inventory/pallet/list">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold z-10">Create Palet</h1>
        </div>
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <PencilRuler className="size-4" />
              </div>
              <h5 className="z-10 font-bold text-xl">Data Palet</h5>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              variant={"liquid"}
              disabled={
                !input.name ||
                dataList?.length === 0 ||
                !input.category.id ||
                !input.warehouse.id ||
                !input.condition.id ||
                !input.status.id ||
                input.brand.length === 0
              }
            >
              <Send className="size-4 mr-1" />
              Create
            </Button>
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="z-10 flex flex-col gap-1">
              <Label>Palet Name</Label>
              <Input
                className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline"
                placeholder="Palet Name..."
                value={input.name}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="z-10 w-full flex gap-4 border-y py-5 my-1 border-gray-500">
              <div className="w-full flex flex-col gap-1">
                <Label>Total Old Price</Label>
                <Input
                  className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                  value={formatRupiah(parseFloat(input.total))}
                  disabled
                />
              </div>
              <div className="w-full flex flex-col gap-1 group">
                <Label>Discount</Label>
                <div className="relative w-24 flex items-center">
                  <Input
                    className="border-0 pr-10 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 group-hover:underline group-hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                    value={input.discount}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        discount: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                  />
                  <Percent className="size-4 right-3 absolute" />
                </div>
              </div>
              <div className="w-full flex flex-col gap-1">
                <Label>
                  {parseFloat(input.discount)
                    ? "Total Price After Discount"
                    : "Total New Price"}
                </Label>
                <Input
                  className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                  value={formatRupiah(
                    parseFloat(input.discount)
                      ? parseFloat(input.total) -
                          (parseFloat(input.total) / 100) *
                            parseFloat(input.discount)
                      : parseFloat(input.totalNew)
                  )}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-3 w-full gap-4">
              <div className="flex flex-col w-full gap-[30.75px] col-span-1">
                <div className="z-10 w-full flex flex-col gap-1.5">
                  <Label>Category</Label>
                  <PopoverWithTrigger
                    open={isOpenCategory}
                    setIsOpen={setIsOpenCategory}
                    data={dataListCategories}
                    dataId={input.category.id}
                    trigger={
                      input.category.name
                        ? input.category.name
                        : "Select Category..."
                    }
                    onSelect={(item: any) => {
                      setInput((prev) => ({
                        ...prev,
                        category: {
                          id: item.id,
                          name: item.name_category,
                        },
                      }));
                      setIsOpenCategory(false);
                    }}
                    itemSelect={(item: any) => (
                      <div className="w-full font-medium">
                        {item.name_category}
                      </div>
                    )}
                  />
                </div>
                <div className="z-10 w-full flex flex-col gap-1.5">
                  <Label>Warehouse</Label>
                  <PopoverWithTrigger
                    open={isOpenWarehouse}
                    setIsOpen={setIsOpenWarehouse}
                    data={dataListWarehouses}
                    dataId={input.warehouse.id}
                    trigger={
                      input.warehouse.name
                        ? input.warehouse.name
                        : "Select Warehouse..."
                    }
                    onSelect={(item: any) => {
                      setInput((prev) => ({
                        ...prev,
                        warehouse: {
                          id: item.id,
                          name: item.nama,
                        },
                      }));
                      setIsOpenWarehouse(false);
                    }}
                    itemSelect={(item: any) => (
                      <div className="w-full flex flex-col gap-1">
                        <div className="w-full font-medium capitalize">
                          {item.nama}
                        </div>
                        <Separator className="bg-gray-500" />
                        <p className="text-xs text-start w-full text-gray-500">
                          Lat. {item.latitude} | Long. {item.longitude}
                        </p>
                        <p className="text-xs text-start w-full text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.alamat}
                        </p>
                        <p className="text-xs text-start w-full text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.kecamatan}, {item.kabupaten}, {item.provinsi}
                        </p>
                      </div>
                    )}
                  />
                </div>
                <div className="z-10 w-full flex flex-col gap-1.5">
                  <Label>Condition</Label>
                  <PopoverWithTrigger
                    open={isOpenCondition}
                    setIsOpen={setIsOpenCondition}
                    data={dataListProductConditions}
                    dataId={input.condition.id}
                    trigger={
                      input.condition.name
                        ? input.condition.name
                        : "Select Condition..."
                    }
                    onSelect={(item: any) => {
                      setInput((prev) => ({
                        ...prev,
                        condition: {
                          id: item.id,
                          name: item.condition_name,
                        },
                      }));
                      setIsOpenCondition(false);
                    }}
                    itemSelect={(item: any) => (
                      <div className="w-full font-medium">
                        {item.condition_name}
                      </div>
                    )}
                  />
                </div>
                <div className="z-10 w-full flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <PopoverWithTrigger
                    open={isOpenStatus}
                    setIsOpen={setIsOpenStatus}
                    data={dataListProductStatus}
                    dataId={input.status.id}
                    trigger={
                      input.status.name ? input.status.name : "Select Status..."
                    }
                    onSelect={(item: any) => {
                      setInput((prev) => ({
                        ...prev,
                        status: {
                          id: item.id,
                          name: item.status_name,
                        },
                      }));
                      setIsOpenStatus(false);
                    }}
                    itemSelect={(item: any) => (
                      <div className="w-full font-medium">
                        {item.status_name}
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full col-span-2 gap-1.5">
                <Label>Description</Label>
                <RichInput
                  content={input.description}
                  className="min-h-[250px]"
                  editorClassName={"max-h-[235px]"}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      description: e,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex pt-5 mt-5 border-gray-500 border-t gap-1 w-full flex-col">
            <div className="flex w-full gap-4 px-3 rounded-md z-10">
              <Dialog open={isOpenBrand} onOpenChange={setIsOpenBrand}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    className="flex items-center gap-3 font-normal text-black hover:bg-sky-100 h-auto bg-transparent p-0 px-1.5 rounded-sm shadow-none"
                  >
                    <h5 className=" flex-none font-semibold">Brands</h5>
                    <ChevronDownCircle className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-3">
                  <DialogHeader>
                    <DialogTitle>Multi Select Brands</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col w-full gap-3">
                    <div className="w-full p-3 border border-sky-400/80 rounded flex flex-wrap gap-3 justify-center items-center">
                      {input.brand.length > 0 && (
                        <div className="w-full text-sm flex justify-between items-center border-b border-sky-400/80 pb-2">
                          <p className="font-semibold w-full text-center">
                            Selected Brands
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setInput((prev) => ({ ...prev, brand: [] }))
                            }
                            className="flex items-center gap-2 px-3 border-l border-sky-400/80 hover:underline hover:underline-offset-2"
                          >
                            <h5 className=" font-semibold">Reset</h5>
                            <XCircle className="size-4" />
                          </button>
                        </div>
                      )}
                      {input.brand.length > 0 ? (
                        input.brand.map((item) => (
                          <div
                            key={item.id}
                            className="flex rounded overflow-hidden border border-sky-300"
                          >
                            <div className="px-3 py-0.5 bg-sky-100/80  text-xs font-medium cursor-default capitalize">
                              {item.name}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setInput((prev) => ({
                                  ...prev,
                                  brand: prev.brand.filter(
                                    (brand) => brand.id !== item.id
                                  ),
                                }))
                              }
                              className="bg-sky-100/80 flex items-center justify-center px-1 border-l border-sky-300 hover:bg-red-200"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm font-medium h-7 flex items-center">
                          Select a brand...
                        </p>
                      )}
                    </div>
                    <div className="w-full border border-sky-400/80 rounded">
                      <Command>
                        <CommandInput />
                        <CommandList className="max-h-[280px] rounded-none">
                          <CommandEmpty className="text-sm font-medium h-[150px] w-full flex items-center justify-center">
                            No Data Found.
                          </CommandEmpty>
                          <CommandGroup
                            className="min-h-[200px]"
                            heading="List Brands"
                          >
                            {dataListProductBrands.filter(
                              (v) => !input.brand.some((s) => s.id === v.id)
                            ).length > 0 ? (
                              dataListProductBrands
                                .filter(
                                  (v) => !input.brand.some((s) => s.id === v.id)
                                )
                                .map((item) => (
                                  <CommandItem
                                    className="border border-gray-500 my-2 first:mt-0 last:mb-0 flex gap-2 items-center group"
                                    onSelect={() => {
                                      setInput((prev) => ({
                                        ...prev,
                                        brand: [
                                          ...prev.brand,
                                          {
                                            id: item.id,
                                            name: item.brand_name,
                                          },
                                        ],
                                      }));
                                    }}
                                    key={item.id}
                                  >
                                    <div className="size-4 rounded-full border border-gray-500 flex-none flex items-center justify-center">
                                      <Circle className="fill-black size-2.5 group-hover:flex hidden" />
                                    </div>
                                    <div className="w-full font-medium">
                                      {item.brand_name}
                                    </div>
                                  </CommandItem>
                                ))
                            ) : (
                              <div className="w-full h-[150px] flex items-center justify-center text-sm font-medium">
                                <p>No Data viewed.</p>
                              </div>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </div>
                    <Button
                      type="button"
                      className="w-full bg-sky-400/80 hover:bg-sky-500 text-black"
                      onClick={() => setIsOpenBrand(false)}
                    >
                      Done
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <div
                className={cn(
                  "w-full flex gap-3 flex-wrap h-full  border-gray-500 ",
                  input.brand.length === 0 ? "border-l pl-4" : "border-x px-4"
                )}
              >
                {input.brand.length === 0 ? (
                  <>
                    <div className="px-3 py-0.5 bg-sky-100/80 rounded border border-sky-300 text-xs font-medium cursor-default">
                      Multi Select Input
                    </div>
                    <div className="px-3 py-0.5 bg-sky-100/80 rounded border border-sky-300 text-xs font-medium cursor-default">
                      Select Brand...
                    </div>
                  </>
                ) : (
                  <>
                    {input.brand.map((item) => (
                      <div
                        key={item.id}
                        className="flex rounded overflow-hidden border border-sky-300"
                      >
                        <div className="px-3 py-0.5 bg-sky-100/80  text-xs font-medium cursor-default capitalize">
                          {item.name}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setInput((prev) => ({
                              ...prev,
                              brand: prev.brand.filter(
                                (brand) => brand.id !== item.id
                              ),
                            }))
                          }
                          className="bg-sky-100/80 flex items-center justify-center px-1 border-l border-sky-300 hover:bg-red-200"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
              {input.brand.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInput((prev) => ({ ...prev, brand: [] }))}
                  className="flex items-center gap-2 p-0 flex-none hover:underline hover:underline-offset-2"
                >
                  <h5 className=" font-semibold">Reset</h5>
                  <XCircle className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <UploadImage
          setIsOpenUpload={setIsOpenUpload}
          resProceedImage={resProceedImage}
          handleRemoveFile={handleRemoveFile}
          setIsOpenImage={setIsOpenImage}
          setUrlDialog={setUrlDialog}
        />
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <div className="flex w-full justify-between gap-4 items-center">
            <h5 className="pr-5 border-b border-gray-500 text-lg h-fit font-bold z-10">
              List Product Filtered
            </h5>
            <div className="flex gap-4 items-center">
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50 z-10"
                  variant={"outline"}
                  disabled={isPendingSubmit || isRefetching}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : ""
                    )}
                  />
                </Button>
              </TooltipProviderPage>
              <Button
                variant={"liquid"}
                disabled={isPendingSubmit || isPendingAddProduct}
                onClick={() => setIsProduct(true)}
                className="z-10"
              >
                <Plus className="size-4 mr-1" />
                Add Product
              </Button>
            </div>
          </div>
          <div className="flex flex-col w-full gap-4 z-10">
            <DataTable
              isLoading={isRefetching}
              columns={columnPalet}
              data={dataList ?? []}
            />
            <Pagination
              pagination={{ ...metaPage, current: page }}
              setPagination={setPage}
            />
          </div>
        </div>
      </div>
      <Dialog open={isOpenImage} onOpenChange={setIsOpenImage}>
        <DialogContent onClose={false} className="p-3 max-w-2xl">
          <DialogHeader className="hidden">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div
            className={cn(
              "w-full aspect-square relative overflow-hidden rounded",
              urlDialog ? "flex" : "hidden"
            )}
          >
            <Image src={urlDialog} fill alt="image" className="object-cover" />
          </div>
          <Separator />
          <DialogFooter>
            <Button
              className="bg-sky-400/80 hover:bg-sky-400 text-black"
              type="button"
              onClick={() => setIsOpenImage(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
