"use client";

import {
  ArrowLeft,
  ChevronDown,
  ChevronDownCircle,
  Circle,
  CloudUpload,
  Edit3,
  Expand,
  FileDown,
  Loader2,
  Plus,
  PlusCircle,
  Printer,
  RefreshCw,
  ScanBarcode,
  Send,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetDetailPalet } from "../_api/use-get-detail-palet";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useGetListProduct } from "../_api/use-get-list-product";
import { notFound, useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdate } from "../_api/use-update";
import { Badge } from "@/components/ui/badge";
import { useGetSelect } from "../_api/use-get-select";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { urlWeb } from "@/lib/baseUrl";
import { useDeleteImage } from "../_api/use-delete-image";
import { useUpdateImage } from "../_api/use-update-image";
import { useExportPalet } from "../_api/use-export-palet";
import PopoverWithTrigger from "./popover-with-trigger";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});
const DialogBarcode = dynamic(() => import("./dialog-barcode"), {
  ssr: false,
});
const UploadImage = dynamic(() => import("./upload-image"), {
  ssr: false,
});

export const Client = () => {
  const { paletId } = useParams();

  const queryClient = useQueryClient();

  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [isOpenWarehouse, setIsOpenWarehouse] = useState(false);
  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const [isOpenCondition, setIsOpenCondition] = useState(false);
  const [isOpenBrand, setIsOpenBrand] = useState(false);
  const [isProduct, setIsProduct] = useState(false);
  const [isOpenImage, setIsOpenImage] = useState(false);
  const [isOpenUpload, setIsOpenUpload] = useState(false);

  const [uploadPDF, setUploadPDF] = useState<File[]>([]);
  const [resProceedImage, setResProceedImage] = useState<string[]>([]);
  const [urlDialog, setUrlDialog] = useState("/images/liquid8_og_800x800.png");
  const [input, setInput] = useState({
    name: "",
    category: { id: "", name: "" },
    warehouse: { id: "", name: "" },
    condition: { id: "", name: "" },
    status: { id: "", name: "" },
    brand: [] as { id: string; name: string }[],
    total: "0",
    totalNew: "0",
  });
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // search, debounce, paginate strat ----------------------------------------------------------------

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

  const [DeleteImageDialog, confirmDeleteImage] = useConfirm(
    "Delete Image",
    "This action cannot be undone",
    "destructive"
  );

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );

  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  const {
    mutate: mutateDeleteImage,
    // isPending: isPendingDeleteImage
  } = useDeleteImage();

  const {
    mutate: mutateUpdateImage,
    // isPending: isPendingUpdateImage
  } = useUpdateImage();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdate();
  const { mutate: mutateExport, isPending: isPendingExport } = useExportPalet();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError } = useGetDetailPalet({
    id: paletId,
  });

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
    return data?.data.data.resource.palet_products;
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

  const dataListImages: any[] = useMemo(() => {
    return data?.data.data.resource.palet_images ?? [];
  }, [data]);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------

  useEffect(() => {
    const dataResource = data?.data.data.resource;
    setInput({
      name: dataResource?.name_palet ?? "",
      category: {
        id: dataResource?.category_id ?? "",
        name: dataResource?.category_palet ?? "",
      },
      warehouse: {
        id: dataResource?.warehouse_id ?? "",
        name: dataResource?.warehouse_name ?? "",
      },
      condition: {
        id: dataResource?.product_condition_id ?? "",
        name: dataResource?.product_condition_name ?? "",
      },
      status: {
        id: dataResource?.product_status_id ?? "",
        name: dataResource?.product_status_name ?? "",
      },
      brand:
        dataResource?.palet_brands.map((i: any) => ({
          id: i.id.toString() ?? "",
          name: i.palet_brand_name ?? "",
        })) ?? [],
      total: Math.round(dataResource?.total_harga_lama).toString() ?? "0",
      totalNew: Math.round(dataResource?.total_price_palet).toString() ?? "0",
    });
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

  const handleAddProduct = (id: string) => {
    mutateAddProduct(
      { id, idDetail: paletId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["list-detail-palet", paletId],
          });
        },
      }
    );
  };

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["list-detail-palet", paletId],
          });
        },
      }
    );
  };

  const handleUploadImage = async () => {
    const ok = await confirmDeleteImage();

    if (!ok) return;

    const body = new FormData();
    if (paletId) {
      body.append("palet_id", paletId?.toString());
    }
    if (resProceedImage.length > 0) {
      resProceedImage.map((item) => {
        body.append("images[]", item);
      });
    }

    mutateUpdateImage(
      { body },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["list-detail-palet", paletId],
          });
        },
      }
    );
  };

  const handleDeleteImage = async (id: any) => {
    const ok = await confirmDeleteImage();

    if (!ok) return;

    mutateDeleteImage(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["list-detail-palet", paletId],
          });
        },
      }
    );
  };

  const handleUpdate = async () => {
    const body = {
      name_palet: input.name,
      total_price_palet: input.total,
      total_product_palet: dataList?.length,
      category_id: input.category.id,
      category_palet: input.category.name,
      description: "",
      is_active: 1,
      warehouse_id: input.warehouse.id,
      product_condition_id: input.condition.id,
      product_status_id: input.status.id,
      "product_brand_ids[]": input.brand.map((item) => item.id.toString()),
      palet_barcode: data?.data.data.resource.palet_barcode,
    };
    mutateUpdate(
      { id: paletId, body },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["list-detail-palet", paletId],
          });
          setIsEdit(false);
        },
      }
    );
  };

  const handleExport = async () => {
    mutateExport(
      { id: paletId },
      {
        onSuccess: (res) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
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

  const columnPalet: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "code_document",
      header: "Document Code",
    },
    {
      accessorKey: "new_barcode_product??old_barcode_product",
      header: "Barcode",
      cell: ({ row }) =>
        row.original.new_barcode_product ?? row.original.old_barcode_product,
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] hyphens-auto">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      accessorKey: "new_category_product??new_tag_product",
      header: "Category",
      cell: ({ row }) =>
        row.original.new_category_product ?? row.original.new_tag_product,
    },
    {
      accessorKey: "new_price_product",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.new_price_product),
    },
    {
      accessorKey: "new_status_product",
      header: () => <div className="text-center">Price</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className="bg-sky-400/80 hover:bg-sky-400/80 text-black rounded font-normal capitalize">
            {row.original.new_status_product.split("_").join(" ")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Remove"}>
            <Button
              className="w-9 px-0 items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50"
              variant={"outline"}
              type="button"
              disabled={isPendingRemoveProduct || isPendingUpdate}
              onClick={() => {
                handleRemoveProduct(row.original.id);
              }}
            >
              {isPendingRemoveProduct ? (
                <Loader2 className="w-4 h-4" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
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

  if (isError && (error as AxiosError)?.status === 404) {
    notFound();
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <DialogBarcode
        onCloseModal={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
          }
        }}
        open={barcodeOpen}
        oldPrice={input.total ?? "0"}
        barcode={data?.data.data.resource.palet_barcode ?? ""}
        category={input.name ?? ""}
        newPrice={input.totalNew ?? "0"}
        handleCancel={() => {
          setBarcodeOpen(false);
        }}
      />
      <DeleteImageDialog />
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
      {/* <Dialog
        open={isOpenUpload}
        onOpenChange={() => {
          if (isOpenUpload) {
            setSecond([]);
            setIsOpenUpload(false);
          }
        }}
      >
        <DialogContent onClose={false} className="max-w-[100vw] h-[100vh]">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div className="w-full h-[calc(100vh-130px)] gap-4 flex flex-col items-center justify-center">
            <div
              className={cn(
                "w-full grid gap-4",
                second.length === 1 && "max-w-md grid-cols-1",
                second.length === 2 && "max-w-md grid-cols-2",
                second.length === 3 && "max-w-md grid-cols-3",
                second.length === 4 && "max-w-md grid-cols-4",
                second.length === 5 && "max-w-md grid-cols-5",
                second.length === 6 && "max-w-md grid-cols-6",
                second.length === 7 && "max-w-md grid-cols-7",
                second.length === 8 && "max-w-md grid-cols-8"
              )}
            >
              {second.length > 0 &&
                second.map((item, i) => (
                  <div
                    key={item.name}
                    className="relative w-full aspect-square shadow border z-10"
                  >
                    <div className="relative w-full h-full overflow-hidden rounded group">
                      <Image
                        alt=""
                        fill
                        src={URL.createObjectURL(item)}
                        className="object-cover group-hover:scale-110 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpenImage(true);
                          setUrlDialog(URL.createObjectURL(item));
                        }}
                        className="w-full h-full group-hover:delay-500 delay-0 transition-all duration-300 group-hover:opacity-100 opacity-0 flex items-center justify-center absolute top-0 left-0 bg-black/5 backdrop-blur-sm border text-black rounded"
                      >
                        <div className="size-8 flex items-center justify-center bg-white rounded-full">
                          <Expand className="size-5" />
                        </div>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="size-5 hover:scale-110 transition-all rounded-full flex items-center justify-center shadow absolute -top-2 -right-2 bg-red-500 border-2 border-white text-white"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
            </div>
            {dataListImages?.length + second.length < 8 && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 border-2 border-dashed border-sky-400 rounded">
                <Button
                  className="bg-sky-400/80 hover:bg-sky-400 text-black rounded-full z-10"
                  onClick={open}
                >
                  Upload
                </Button>
                <div className="bg-sky-100 flex items-center justify-center rounded-full size-8">
                  <p className="text-sm font-bold">or</p>
                </div>
                <p className="text-sm">Drop File Here</p>
              </div>
            )}
          </div>
          {second.length < 8 && (
            <div
              {...getRootProps()}
              className={`top-0 left-0 w-full h-full flex items-center justify-center p-6 bg-black/45 backdrop-blur-sm pointer-events-auto ${
                isDragActive
                  ? "opacity-100 z-20 fixed"
                  : "opacity-0 z-0 absolute"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center border-4 border-sky-100 rounded-lg border-dashed">
                <input {...getInputProps()} />
                <p className="text-5xl text-sky-100 font-bold uppercase">
                  Drop image anywhere
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="justify-end">
            <Button
              variant={"outline"}
              className="z-10 border-gray-500"
              onClick={() => {
                setIsOpenUpload(false);
                setSecond([]);
              }}
            >
              Cancel
            </Button>
            <Button
              className="border-sky-400 hover:bg-sky-100 text-sky-700 hover:text-sky-800 z-10"
              variant={"outline"}
              type="button"
              onClick={handleUploadImage}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
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
            <BreadcrumbItem>Detail</BreadcrumbItem>
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
          <h1 className="text-2xl font-semibold z-10">Detail Palet</h1>
        </div>
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <ScanBarcode className="size-4" />
              </div>
              <h5 className="z-10 font-bold text-xl">
                {data?.data.data.resource.palet_barcode}
              </h5>
            </div>
            {!isEdit ? (
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setBarcodeOpen(true);
                  }}
                  className="bg-sky-300 hover:bg-sky-400 text-black"
                >
                  <Printer className="size-4 mr-1" />
                  Barcode
                </Button>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEdit(true);
                  }}
                  className="bg-yellow-300 hover:bg-yellow-400 text-black"
                >
                  <Edit3 className="size-4 mr-1" />
                  Edit
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEdit(false);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-black"
                >
                  <X className="size-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleUpdate();
                  }}
                  variant={"liquid"}
                  disabled={
                    !input.name ||
                    dataList?.length === 0 ||
                    !input.category.id ||
                    !input.warehouse.id ||
                    !input.condition.id ||
                    !input.status.id ||
                    input.brand.length === 0 ||
                    !isEdit
                  }
                >
                  <Send className="size-4 mr-1" />
                  Update
                </Button>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="z-10 flex flex-col gap-1">
              <Label>Palet Name</Label>
              <Input
                className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                placeholder="Palet Name..."
                value={input.name}
                disabled={!isEdit}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="z-10 w-full flex gap-4">
              <div className="w-2/3 flex flex-col gap-1">
                <Label>Total Old Price</Label>
                <Input
                  className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                  value={formatRupiah(parseFloat(input.total))}
                  disabled
                />
              </div>
              <div className="w-2/3 flex flex-col gap-1">
                <Label>Total New Price</Label>
                <Input
                  className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                  value={formatRupiah(parseFloat(input.totalNew))}
                  disabled
                />
              </div>
              <div className="w-1/3 flex flex-col gap-1">
                <Label>Total Product</Label>
                <Input
                  className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                  value={dataList?.length.toLocaleString() + " Products"}
                  disabled
                />
              </div>
            </div>
            <div className="flex w-full gap-4">
              <div className="z-10 w-full flex flex-col gap-1">
                <Label>Category</Label>
                <PopoverWithTrigger
                  open={isOpenCategory}
                  setIsOpen={setIsOpenCategory}
                  data={dataListCategories}
                  dataId={input.category.id}
                  isEdit={isEdit}
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
              <div className="z-10 w-full flex flex-col gap-1">
                <Label>Warehouse</Label>
                <PopoverWithTrigger
                  open={isOpenWarehouse}
                  setIsOpen={setIsOpenWarehouse}
                  data={dataListWarehouses}
                  dataId={input.warehouse.id}
                  isEdit={isEdit}
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
            </div>
            <div className="flex w-full gap-4">
              <div className="z-10 w-full flex flex-col gap-1">
                <Label>Condition</Label>
                <PopoverWithTrigger
                  open={isOpenCondition}
                  setIsOpen={setIsOpenCondition}
                  data={dataListProductConditions}
                  dataId={input.condition.id}
                  isEdit={isEdit}
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
              <div className="z-10 w-full flex flex-col gap-1">
                <Label>Status</Label>
                <PopoverWithTrigger
                  open={isOpenStatus}
                  setIsOpen={setIsOpenStatus}
                  data={dataListProductStatus}
                  dataId={input.status.id}
                  isEdit={isEdit}
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
                    <div className="w-full font-medium">{item.status_name}</div>
                  )}
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
                    className="flex items-center gap-3 font-normal text-black hover:bg-transparent h-auto bg-transparent p-0 shadow-none disabled:pointer-events-auto disabled:opacity-100"
                    disabled={!isEdit}
                  >
                    <h5 className=" flex-none font-semibold">Brands</h5>
                    {isEdit && <ChevronDownCircle className="size-4" />}
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
                  input.brand.length === 0 || !isEdit
                    ? "border-l pl-4"
                    : "border-x px-4"
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
                        {isEdit && (
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
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
              {input.brand.length > 0 && isEdit && (
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
          handleRemoveFile={handleDeleteImage}
          setIsOpenImage={setIsOpenImage}
          setUrlDialog={setUrlDialog}
        />
        <div className="flex flex-col w-full gap-4 bg-white p-5 rounded-md shadow">
          <div className="w-full flex justify-between items-center border-b border-gray-500 pb-4">
            <div className="flex gap-2 items-center">
              <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center flex-none">
                <CloudUpload className="size-4" />
              </div>
              <h5 className="z-10 font-semibold">Upload Image</h5>
            </div>
            <div className="flex items-center">
              <Button
                type={"button"}
                onClick={() => setIsOpenUpload(true)}
                variant={"liquid"}
                className="z-10"
              >
                <Upload className="size-4 mr-1" />
                Upload File
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-8 gap-4">
            {dataListImages.length > 0 ? (
              <>
                {dataListImages.map((item) => (
                  <div
                    key={item.filename}
                    className="relative w-full aspect-square shadow border"
                  >
                    <div className="relative w-full h-full overflow-hidden rounded group">
                      <Image
                        alt=""
                        fill
                        src={urlWeb + item.file_path}
                        className="object-cover group-hover:scale-110 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpenImage(true);
                          setUrlDialog(urlWeb + item.file_path);
                        }}
                        className="w-full h-full group-hover:delay-500 delay-0 transition-all duration-300 group-hover:opacity-100 opacity-0 flex items-center justify-center absolute top-0 left-0 bg-black/5 backdrop-blur-sm border text-black rounded"
                      >
                        <div className="size-8 flex items-center justify-center bg-white rounded-full">
                          <Expand className="size-5" />
                        </div>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteImage(item.id);
                      }}
                      className="size-5 hover:scale-110 transition-all rounded-full flex items-center justify-center shadow absolute -top-2 -right-2 bg-red-500 border-2 border-white text-white"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <div className="col-span-8 h-36 w-full flex items-center justify-center border-2 border-dashed border-sky-400/80 rounded">
                <p className="text-sm font-medium">No image yet.</p>
              </div>
            )}
          </div>
        </div>
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
                  disabled={isPendingUpdate || isRefetching || isPendingExport}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : ""
                    )}
                  />
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExport();
                  }}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50 z-10"
                  variant={"outline"}
                  disabled={isPendingUpdate || isRefetching || isPendingExport}
                >
                  <FileDown className={cn("w-4 h-4")} />
                </Button>
              </TooltipProviderPage>
              <Button
                variant={"liquid"}
                disabled={
                  isPendingUpdate || isPendingAddProduct || isPendingExport
                }
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
