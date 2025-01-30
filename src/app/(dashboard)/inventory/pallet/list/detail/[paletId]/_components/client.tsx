"use client";

import {
  ArrowLeft,
  ArrowUpRightFromSquare,
  ChevronDown,
  ChevronDownCircle,
  Circle,
  Edit3,
  FileDown,
  Loader2,
  Percent,
  Plus,
  Printer,
  RefreshCw,
  ScanBarcode,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useDeleteImage } from "../_api/use-delete-image";
import { useUpdateImage } from "../_api/use-update-image";
import { useExportPalet } from "../_api/use-export-palet";
import PopoverWithTrigger from "./popover-with-trigger";
import { useRemovePDF } from "../_api/use-remove-pdf";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useExportPaletExcel } from "../_api/use-export-palet-excel";
import { RichInput } from "@/components/ui/rich-input";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});
const DialogBarcode = dynamic(() => import("./dialog-barcode"), {
  ssr: false,
});
const UploadImage = dynamic(() => import("./upload-image"), {
  ssr: false,
});
const DialogUpload = dynamic(() => import("./dialog-upload"), {
  ssr: false,
});
const DialogPDF = dynamic(() => import("./dialog-pdf"), {
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
  const [isOpenPDF, setIsOpenPDF] = useState(false);

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
    pdf: "",
    discount: "0",
    totalNewPrice: "0",
  });
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fileType, setFileType] = useState("Select file type");

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

  const [DeletePDFDialog, confirmDeletePDF] = useConfirm(
    "Delete PDF File",
    "This action cannot be undone",
    "destructive"
  );

  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  const { mutate: mutateRemovePDF, isPending: isPendingRemovePDF } =
    useRemovePDF();

  const {
    mutate: mutateDeleteImage,
    // isPending: isPendingDeleteImage
  } = useDeleteImage();

  const {
    mutate: mutateUpdateImage,
    isPending: isPendingUpdateImage,
    isSuccess: isSuccessUpdateImage,
  } = useUpdateImage();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdate();
  const { mutate: mutateExport, isPending: isPendingExport } = useExportPalet();
  const { mutate: mutateExportExcel, isPending: isPendingExportExcel } =
    useExportPaletExcel();

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
          id: i.brand_id.toString() ?? "",
          name: i.palet_brand_name ?? "",
        })) ?? [],
      description: dataResource?.description ?? "",
      total: Math.round(dataResource?.total_harga_lama).toString() ?? "0",
      totalNew: Math.round(dataResource?.total_price_palet).toString() ?? "0",
      pdf: dataResource?.file_pdf ?? "",
      discount: Math.round(dataResource?.discount).toString() ?? "0",
      totalNewPrice:
        Math.round(
          dataResource?.palet_products.reduce(
            (acc: any, item: any) => acc + item.total_new_price,
            0
          )
        ).toString() ?? "0",
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

  const handleUploadImage = async (files: string[]) => {
    const body = new FormData();
    if (paletId) {
      body.append("palet_id", paletId?.toString());
    }
    if (files.length > 0) {
      files.map((item) => {
        const mimeType = "image/jpeg"; // Sesuaikan dengan tipe MIME
        const blob = base64ToBlob(item, mimeType);
        body.append("images[]", blob);
      });
    }

    mutateUpdateImage(
      { body },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["list-detail-palet", paletId],
          });
          setIsOpenUpload(false);
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

  const handleDeletePDF = async () => {
    const ok = await confirmDeletePDF();

    if (!ok) return;

    mutateRemovePDF(
      { id: paletId ? paletId.toString() : "" },
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
    const body = new FormData();
    body.append("palet_barcode", data?.data.data.resource.palet_barcode);
    body.append("name_palet", input.name);
    body.append(
      "total_price_palet",
      (parseFloat(data?.data.data.resource.discount) === 0 &&
        parseFloat(input.discount) === 0) ||
        (parseFloat(input.discount) > 0 &&
          parseFloat(input.discount) ===
            parseFloat(data?.data.data.resource.discount))
        ? input.totalNew
        : parseFloat(input.discount) > 0 &&
          parseFloat(input.discount) !==
            parseFloat(data?.data.data.resource.discount)
        ? (
            parseFloat(input.total) -
            (parseFloat(input.total) / 100) * parseFloat(input.discount)
          ).toString()
        : parseFloat(data?.data.data.resource.discount) > 0 &&
          parseFloat(input.discount) === 0
        ? input.totalNewPrice
        : "0"
    );
    body.append("total_product_palet", dataList?.length.toString());
    body.append("category_id", input.category.id);
    body.append("category_palet", input.category.name);
    body.append("description", input.description);
    body.append("is_active", "1");
    body.append("warehouse_id", input.warehouse.id);
    body.append("product_condition_id", input.condition.id);
    body.append("product_status_id", input.status.id);
    body.append("discount", input.discount);
    body.append("is_sale", "0");
    body.append(
      "product_brand_ids",
      `${
        input.brand.length > 0
          ? input.brand.map((item) => item.id.toString()).join(",")
          : ""
      }`
    );
    body.append("_method", "PUT");
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

  // Handler for exporting Excel
  const handleExportPaletExcel = async () => {
    if (fileType !== "excel" && fileType !== "pdf") {
      alert("Please select excel or pdf as the file type.");
      return;
    }

    mutateExportExcel(
      { id: paletId, body: { type: fileType } },
      {
        onSuccess: (res) => {
          if (fileType === "pdf") {
            window.open(res.data.data.resource, "_blank");
          } else {
            const link = document.createElement("a");
            link.href = res.data.data.resource;
            link.download = `${paletId}_exported.${fileType.toLowerCase()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        },
        onError: (error) => {
          alert("Failed to export Excel: " + error.message);
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
        <div className="max-w-[500px] break-all">
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
      <DeletePDFDialog />
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
        handleUpload={handleUploadImage}
        setIsOpenImage={setIsOpenImage}
        setUrlDialog={setUrlDialog}
        isPending={isPendingUpdateImage}
        images={dataListImages.length}
        isSuccess={isSuccessUpdateImage}
      />
      <DialogPDF
        open={isOpenPDF}
        onCloseModal={() => {
          if (isOpenPDF) {
            setIsOpenPDF(false);
          }
        }}
        file={input.pdf}
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
                <div className="flex items-center gap-4">
                  <div
                    className="w-full flex items-center justify-start px-3 border border-sky-400/80 rounded h-9 bg-sky-500 hover:bg-sky-500 cursor-pointer"
                    onClick={handleExportPaletExcel}
                  >
                    <FileDown className="size-4 mr-1" />
                    {fileType.toUpperCase()}{" "}
                  </div>
                  <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <Button
                        className="flex-none border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 rounded text-blue-500"
                        variant={"outline"}
                        size={"icon"}
                        disabled={isPendingExportExcel}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-fit" align="end">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setFileType("excel");
                                setIsOpen(false);
                              }}
                            >
                              Excel
                            </CommandItem>
                            <CommandItem
                              onSelect={() => {
                                setFileType("pdf");
                                setIsOpen(false);
                              }}
                            >
                              PDF
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
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
                    disabled={!isEdit}
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
                    (parseFloat(data?.data.data.resource.discount) === 0 &&
                      parseFloat(input.discount) === 0) ||
                      (parseFloat(input.discount) > 0 &&
                        parseFloat(input.discount) ===
                          parseFloat(data?.data.data.resource.discount))
                      ? parseFloat(input.totalNew)
                      : parseFloat(input.discount) > 0 &&
                        parseFloat(input.discount) !==
                          parseFloat(data?.data.data.resource.discount)
                      ? parseFloat(input.total) -
                        (parseFloat(input.total) / 100) *
                          parseFloat(input.discount)
                      : parseFloat(data?.data.data.resource.discount) > 0 &&
                        parseFloat(input.discount) === 0
                      ? parseFloat(input.totalNewPrice)
                      : 0
                  )}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-3 w-full gap-4">
              <div className="flex flex-col w-full gap-4 col-span-1">
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
                      <div className="w-full font-medium">
                        {item.status_name}
                      </div>
                    )}
                  />
                </div>
                <div className="z-10 w-full flex flex-col gap-1">
                  <Label>File PDF</Label>
                  <Button
                    type="button"
                    onClick={() => setIsOpenPDF(true)}
                    disabled={isPendingRemovePDF}
                    className="flex pl-4 items-center justify-start [&_svg]:size-3 w-full hover:bg-transparent hover:underline hover:underline-offset-2 disabled:opacity-100 disabled:pointer-events-auto border border-sky-400/80 hover:border-sky-400"
                    variant={"ghost"}
                  >
                    <p className="line-clamp-1 font-semibold text-sm">
                      Uploaded file
                    </p>
                    <ArrowUpRightFromSquare />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col w-full col-span-2 gap-1.5">
                <Label>Description</Label>
                {isEdit ? (
                  <RichInput
                    content={input.description}
                    className="min-h-[268.5px]"
                    editorClassName={"max-h-[250px]"}
                    onChange={(e) =>
                      setInput((prev: any) => ({
                        ...prev,
                        description: e,
                      }))
                    }
                  />
                ) : (
                  <div className="w-full px-3 py-2 h-[314px] overflow-y-scroll border border-sky-400/80 rounded-md">
                    <div
                      className="prose prose-sm w-full"
                      dangerouslySetInnerHTML={{ __html: input.description }}
                    />
                  </div>
                )}
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
          images={dataListImages}
          handleRemoveFile={handleDeleteImage}
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
              <TooltipProviderPage value={"Unduh Data"}>
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
