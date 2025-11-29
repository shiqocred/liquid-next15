"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Edit3,
  FileDown,
  Loader2,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { parseAsBoolean, useQueryState } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetListRacks } from "../_api/use-get-list-racks";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { Input } from "@/components/ui/input";
import { useCreateRack } from "../_api/use-create-rack";
import { useUpdateRack } from "../_api/use-update-rack";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteRack } from "../_api/use-delete-rack";
import { useGetListProduct } from "../_api/use-get-list-product";
import Pagination from "@/components/pagination";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useDeleteProductCategory } from "../_api/use-delete-product-category";
import { useExportProductCategory } from "../_api/use-export-product-category";
import { useUpdateProductCategory } from "../_api/use-update-product-category";
import { useGetProductCategoryDetail } from "../_api/use-get-product-category-detail";
import { DialogDetail } from "./dialog-detail";
import { useGetPriceProductCategory } from "../_api/use-get-price-product-category";
import { useQueryClient } from "@tanstack/react-query";
const DialogCreateEdit = dynamic(() => import("./dialog-create-edit"), {
  ssr: false,
});

interface QualityData {
  lolos: string | null;
  damaged: string | null;
  abnormal: string | null;
}

export const Client = () => {
  const queryClient = useQueryClient();
  const [openCreateEdit, setOpenCreateEdit] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [isOpenDetailProduct, setIsOpenDetailProduct] = useQueryState(
    "dialog2",
    parseAsBoolean.withDefault(false)
  );
  // rack Id for Edit
  const [rackId, setRackId] = useQueryState("rackId", {
    defaultValue: "",
  });
  const [productId, setProductId] = useQueryState("productId", {
    defaultValue: "",
  });
  const [isMounted, setIsMounted] = useState(false);
  const {
    search: searchRack,
    searchValue: searchValueRack,
    setSearch: setSearchRack,
  } = useSearchQuery("qRack");
  const {
    search: searchProduct,
    searchValue: searchValueProduct,
    setSearch: setSearchProduct,
  } = useSearchQuery("qProduct");
  const [searchRackInput, setSearchRackInput] = useState<string>(
    (searchRack as string) ?? ""
  );
  const [searchProductInput, setSearchProductInput] = useState<string>(
    (searchProduct as string) ?? ""
  );

  const { metaPage, page, setPage, setPagination } = usePagination();
  const {
    metaPage: metaPageProduct,
    page: pageProduct,
    setPage: setPageProduct,
    setPagination: setPaginationProduct,
  } = usePagination();

  // data form create edit
  const [input, setInput] = useState({
    name: "",
    source: "Display",
  });

  // data form edit product
  const [inputProduct, setInputProduct] = useState({
    barcode: "",
    oldBarcode: "",
    name: "",
    oldName: "",
    price: "0",
    oldPrice: "0",
    qty: "1",
    oldQty: "1",
    category: "",
    discount: "0",
    displayPrice: "0",
  });

  // confirm delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Rack Display",
    "This action cannot be undone",
    "destructive"
  );
  const [DeleteDialogProduct, confirmDeleteProduct] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "liquid"
  );

  // mutate DELETE, UPDATE, CREATE, EXPORT
  const { mutate: mutateDelete, isPending: isPendingDelete } = useDeleteRack();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdateRack();
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreateRack();
  const { mutate: mutateDeleteProduct, isPending: isPendingDeleteProduct } =
    useDeleteProductCategory();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportProductCategory();

  const {
    mutate: updateProduct,
    isSuccess: isSuccessUpdate,
    isPending: isPendingUpdateProduct,
  } = useUpdateProductCategory();

  const {
    data: dataProduct,
    isSuccess: isSuccessProduct,
    isError: isErrorProduct,
    error: errorProduct,
    isLoading: isLoadingDetailProduct,
  } = useGetProductCategoryDetail({ id: productId });

  const {
    data: dataRacks,
    refetch: refetchRacks,
    isLoading: isLoadingRacks,
    isError: isErrorRacks,
    error: errorRacks,
    isSuccess: isSuccessRacks,
  } = useGetListRacks({
    p: page,
    q: searchValueRack,
  });

  const {
    data: dataProducts,
    refetch: refetchProducts,
    isLoading: isLoadingProducts,
    isRefetching: isRefetchingProducts,
    isPending: isPendingProducts,
    isError: isErrorProducts,
    error: errorProducts,
    isSuccess: isSuccessProducts,
  } = useGetListProduct({
    p: pageProduct,
    q: searchValueProduct, // product tab has its own search input `dataSearch`
  });

  const rackData = useMemo(() => {
    return dataRacks?.data.data.resource;
  }, [dataRacks]);
  const racksData = rackData?.racks;
  const totalRacks = rackData?.total_racks;

  const productData = useMemo(() => {
    return dataProducts?.data.data.resource.data;
  }, [dataProducts]);

  const dataDetailProduct: any = useMemo(() => {
    return dataProduct?.data.data.resource;
  }, [dataProduct]);

  const { data: dataPrice } = useGetPriceProductCategory({
    price: dataDetailProduct?.old_price_product,
  });

  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Data Detail",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  useEffect(() => {
    if (isSuccessProduct && dataProduct) {
      setInputProduct({
        barcode: dataProduct?.data.data.resource.new_barcode_product ?? "",
        name: dataProduct?.data.data.resource.new_name_product ?? "",
        price: dataProduct?.data.data.resource.new_price_product ?? "0",
        qty: dataProduct?.data.data.resource.new_quantity_product ?? "1",
        oldBarcode: dataProduct?.data.data.resource.old_barcode_product ?? "",
        oldName: dataProduct?.data.data.resource.new_name_product ?? "",
        oldPrice: dataProduct?.data.data.resource.old_price_product ?? "0",
        oldQty: dataProduct?.data.data.resource.new_quantity_product ?? "1",
        category: dataProduct?.data.data.resource.new_category_product ?? "",
        discount: dataProduct?.data.data.resource.new_discount ?? "0",
        displayPrice: dataProduct?.data.data.resource.display_price ?? "0",
      });
    }
  }, [dataProduct]);

  const categories: any[] = useMemo(() => {
    return dataPrice?.data.data.resource.category ?? [];
  }, [dataPrice]);

  const handleUpdateProduct = () => {
    const body = {
      code_document: dataDetailProduct?.code_document,
      old_barcode_product: inputProduct.oldBarcode,
      new_barcode_product: inputProduct.barcode,
      new_name_product: inputProduct.name,
      new_quantity_product: inputProduct.qty,
      new_price_product: inputProduct.price,
      old_price_product: inputProduct.oldPrice,
      new_date_in_product: dataDetailProduct?.new_date_in_product,
      new_status_product: dataDetailProduct?.new_status_product,
      condition: Object.keys(JSON.parse(dataDetailProduct?.new_quality)).find(
        (key) =>
          JSON.parse(dataDetailProduct?.new_quality)[
            key as keyof QualityData
          ] !== null
      ),
      new_category_product:
        inputProduct.category ?? dataDetailProduct?.new_category_product,
      new_tag_product: dataDetailProduct?.new_tag_product,
      display_price: inputProduct.displayPrice,
      new_discount: inputProduct.discount,
    };

    updateProduct(
      { body, params: { id: dataDetailProduct.id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["product-detail-product-detail", dataDetailProduct.id],
          });
        },
      }
    );
  };

  const loading =
    isLoadingProducts || isRefetchingProducts || isPendingProducts;

  // handle close
  const handleClose = () => {
    setOpenCreateEdit(false);
    setRackId("");
    setInput((prev) => ({
      ...prev,
      name: "",
    }));
  };

  const handleCloseProduct = () => {
    setIsOpenDetailProduct(false);
    setProductId("");
    if (isSuccessUpdate) {
      queryClient.invalidateQueries({
        queryKey: ["list-product-by-category"],
      });
    }
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name: input.name,
      source: "display",
    };
    mutateCreate(
      { body },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  // handle update
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name: input.name,
      source: "Display",
    };
    mutateUpdate(
      { id: rackId, body },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  // handle delete product
  const handleDeleteProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateDeleteProduct({ params: { id } });
  };

  // handle export
  const handleExport = async () => {
    mutateExport(
      {},
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

  useEffect(() => {
    setSearchRackInput((searchRack as string) ?? "");
  }, [searchRack]);

  useEffect(() => {
    setSearchProductInput((searchProduct as string) ?? "");
  }, [searchProduct]);

  useEffect(() => {
    if (dataProducts && isSuccessProducts) {
      setPaginationProduct(dataProducts?.data.data.resource);
    }
  }, [dataProducts, isSuccessProducts]);

  useEffect(() => {
    if (dataRacks && isSuccessRacks) {
      setPagination(dataRacks?.data.data.resource.racks);
    }
  }, [dataRacks, isSuccessRacks]);

  useEffect(() => {
    if (isNaN(parseFloat(inputProduct.qty))) {
      setInputProduct((prev) => ({ ...prev, qty: "0" }));
    }
    if (isNaN(parseFloat(inputProduct.discount))) {
      setInputProduct((prev) => ({ ...prev, discount: "0" }));
    }
    if (isNaN(parseFloat(inputProduct.displayPrice))) {
      setInputProduct((prev) => ({ ...prev, displayPrice: "0" }));
    }
    if (isNaN(parseFloat(inputProduct.price))) {
      setInputProduct((prev) => ({ ...prev, price: "0" }));
    }
    if (isNaN(parseFloat(inputProduct.oldPrice))) {
      setInputProduct((prev) => ({ ...prev, oldPrice: "0" }));
    }
  }, [inputProduct]);

  useEffect(() => {
    setInputProduct((prev) => ({
      ...prev,
      displayPrice: Math.round(
        parseFloat(inputProduct.price ?? "0") -
          (parseFloat(inputProduct.price ?? "0") / 100) *
            parseFloat(inputProduct.discount ?? "0")
      ).toString(),
    }));
  }, [inputProduct.discount, inputProduct.price]);

  const columnProductDisplay = ({ metaPageProduct }: any): ColumnDef<any>[] => [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageProduct.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_barcode_product||old_barcode_product",
      header: "Barcode",
      cell: ({ row }) =>
        row.original.new_barcode_product ??
        row.original.old_barcode_product ??
        "-",
    },
    {
      accessorKey: "new_name_product",
      header: () => <div className="text-center">Product Name</div>,
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      accessorKey: "new_category_product||new_tag_product",
      header: "Category",
      cell: ({ row }) =>
        row.original.new_category_product ??
        row.original.new_tag_product ??
        "-",
    },
    {
      accessorKey: "new_price_product||old_price_product",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(
            row.original.new_price_product ?? row.original.old_price_product
          )}
        </div>
      ),
    },
    {
      accessorKey: "new_date_in_product",
      header: "Date",
      cell: ({ row }) => (
        <div className="">
          {format(
            new Date(row.original.new_date_in_product),
            "iii, dd MMM yyyy"
          )}
        </div>
      ),
    },
    {
      accessorKey: "new_status_product",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.new_status_product;
        const color = {
          display: "bg-green-400/80 hover:bg-green-400/80",
          expired: "bg-rose-400/80 hover:bg-rose-400/80",
          slowmoving: "bg-yellow-400/80 hover:bg-yellow-400/80",
        };
        return (
          <Badge
            className={cn(
              "font-normal rounded-full text-black capitalize",
              color[
                status.replace(/\s+/g, "").toLowerCase() as
                  | "display"
                  | "expired"
                  | "slowmoving"
              ]
            )}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isLoadingDetailProduct}
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setIsOpenDetailProduct(true);
              }}
            >
              {isLoadingDetailProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingDeleteProduct}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteProduct(row.original.id);
              }}
            >
              {isPendingDeleteProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (
    (isErrorRacks && (errorRacks as AxiosError).status === 403) ||
    (isErrorProducts && (errorProducts as AxiosError).status === 403)
  ) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DeleteDialog />
      <DialogCreateEdit
        open={openCreateEdit} // open modal
        onCloseModal={() => {
          if (openCreateEdit) {
            handleClose();
          }
        }} // handle close modal
        rackId={rackId} // rackId
        input={input} // input form
        setInput={setInput} // setInput Form
        handleClose={handleClose} // handle close for cancel
        handleCreate={handleCreate} // handle create rack
        handleUpdate={handleUpdate} // handle update rack
        isPendingCreate={isPendingCreate} // loading create
        isPendingUpdate={isPendingUpdate} // loading update
      />
      <DeleteDialogProduct />
      <DialogDetail
        isOpen={isOpenDetailProduct}
        handleClose={handleCloseProduct}
        isLoadingProduct={isLoadingDetailProduct}
        isLoadingUpdate={isPendingUpdateProduct}
        handleUpdate={handleUpdateProduct}
        input={inputProduct}
        setInput={setInputProduct}
        data={dataDetailProduct}
        isOpenCategory={isOpenCategory}
        setIsOpenCategory={setIsOpenCategory}
        categories={categories}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Display</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Rack</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4 mb-6">
        {/* Card: Total Rack */}
        <div className="bg-white shadow rounded-xl p-5 flex flex-col border border-gray-200">
          <h4 className="text-sm text-gray-500">Total Rack</h4>
          <p className="text-3xl font-bold mt-2">{totalRacks} </p>
        </div>

        {/* Card: Total Product */}
        <div className="bg-white shadow rounded-xl p-5 flex flex-col border border-gray-200">
          <h4 className="text-sm text-gray-500">Total Products</h4>
          <p className="text-3xl font-bold mt-2">
            {rackData?.total_products_in_racks}{" "}
          </p>
        </div>
      </div>
      <Tabs className="w-full mt-5" defaultValue="rack">
        <div className="relative w-full flex justify-center">
          <TabsList className="absolute -top-12 p-1 h-auto border-2 border-white shadow bg-gray-200">
            <TabsTrigger
              className="px-5 py-2 data-[state=active]:text-black text-gray-700"
              value="rack"
            >
              List Rak
            </TabsTrigger>
            <TabsTrigger
              className="px-5 py-2 data-[state=active]:text-black text-gray-700"
              value="product"
            >
              List Product
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="rack" className="w-full gap-4 flex flex-col">
          <div className="flex w-full bg-white rounded-md shadow p-5 gap-6 flex-col">
            <div className="w-full flex flex-col gap-4">
              <h3 className="text-lg font-semibold">List Rak</h3>
              <div className="flex items-center gap-3 w-full">
                <Input
                  className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                  value={searchRackInput}
                  onChange={(e) => {
                    setSearchRackInput(e.target.value);
                    setSearchRack(e.target.value);
                  }}
                  placeholder="Search..."
                  autoFocus
                />
                <TooltipProviderPage value={"Reload Data"}>
                  <Button
                    onClick={() => refetchRacks()}
                    className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                    variant={"outline"}
                  >
                    <RefreshCw
                      className={cn(
                        "w-4 h-4",
                        isLoadingRacks ? "animate-spin" : ""
                      )}
                    />
                  </Button>
                </TooltipProviderPage>
                <div className="flex gap-4 items-center ml-auto">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenCreateEdit(true);
                    }}
                    // disabled={
                    //   isLoadingBuyer || isPendingUpdate || isPendingCreate
                    // }
                    className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                    variant={"outline"}
                  >
                    {/* {isLoadingBuyer || isPendingUpdate || isPendingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : ( */}
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    {/* )} */}
                    Add Rack
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 w-full p-4">
              {searchValueRack ? (
                racksData?.data.filter((item: any) =>
                  (item.name ?? "")
                    .toLowerCase()
                    .includes((searchValueRack ?? "").toLowerCase())
                ).length > 0 ? (
                  racksData?.data
                    .filter((item: any) =>
                      (item.name ?? "")
                        .toLowerCase()
                        .includes((searchValueRack ?? "").toLowerCase())
                    )
                    .map((item: any, i: any) => (
                      <div
                        key={`${item.code_document_sale}-${i}`}
                        className="relative flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border"
                      >
                        {/* CONTENT */}
                        <div className="flex w-full items-center gap-4">
                          <p className="text-sm font-bold text-black w-full">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex flex-col mt-2">
                          <p className="text-xs font-light text-gray-500">
                            Total Product
                          </p>
                          <p className="text-sm font-light text-gray-800">
                            {item.total_data}
                          </p>
                        </div>

                        {/* --- ACTION BUTTONS (ICON ONLY) --- */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-end items-end sm:items-center">
                          <TooltipProviderPage value={<p>Detail</p>}>
                            <Button
                              className="items-center w-7 px-0 flex-none h-7 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                              variant={"outline"}
                              asChild
                            >
                              <Link href={`/inventory/product/rack/details/2`}>
                                <ReceiptText className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TooltipProviderPage>

                          <TooltipProviderPage value={<p>Edit</p>}>
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                setRackId(item.id);
                                setInput((prev) => ({
                                  ...prev,
                                  name: item.name,
                                }));
                                setOpenCreateEdit(true);
                              }}
                              className="items-center w-7 px-0 flex-none h-7 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                              variant={"outline"}
                              asChild
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </TooltipProviderPage>

                          <TooltipProviderPage value={<p>Delete</p>}>
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(item.id);
                              }}
                              className="items-center w-7 px-0 flex-none h-7 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                              variant={"outline"}
                              asChild
                              disabled={isPendingDelete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipProviderPage>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 hover:border-sky-500 border-b border-sky-200">
                    <div className="w-full flex-none text-center font-semibold">
                      No Data Viewed.
                    </div>
                  </div>
                )
              ) : racksData?.data.length > 0 ? (
                racksData?.data.map((item: any, i: any) => (
                  <div
                    key={`${item.code_document_sale}-${i}`}
                    className="relative flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border"
                  >
                    {/* CONTENT */}
                    <div className="flex w-full items-center gap-4">
                      <p className="text-sm font-bold text-black w-full">
                        {item.name}
                      </p>
                    </div>
                    <div className="flex flex-col mt-2">
                      <p className="text-xs font-light text-gray-500">
                        Total Product
                      </p>
                      <p className="text-sm font-light text-gray-800">
                        {item.total_data}
                      </p>
                    </div>

                    {/* --- ACTION BUTTONS (ICON ONLY) --- */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end items-end sm:items-center">
                      <TooltipProviderPage value={<p>Detail</p>}>
                        <Button
                          className="items-center w-7 px-0 flex-none h-7 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                          variant={"outline"}
                          asChild
                        >
                          <Link
                            href={`/inventory/product/rack/details/${item.id}`}
                          >
                            <ReceiptText className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TooltipProviderPage>

                      <TooltipProviderPage value={<p>Edit</p>}>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            setRackId(item.id);
                            setInput((prev) => ({
                              ...prev,
                              name: item.name,
                            }));
                            setOpenCreateEdit(true);
                          }}
                          className="items-center w-7 px-0 flex-none h-7 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                          variant={"outline"}
                          asChild
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </TooltipProviderPage>

                      <TooltipProviderPage value={<p>Delete</p>}>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(item.id);
                          }}
                          className="items-center w-7 px-0 flex-none h-7 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                          variant={"outline"}
                          asChild
                          disabled={isPendingDelete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipProviderPage>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 hover:border-sky-500 border-b border-sky-200">
                  <div className="w-full flex-none text-center font-semibold">
                    No Data Viewed.
                  </div>
                </div>
              )}
            </div>

            <div className="w-full p-4 bg-white">
              <Pagination
                pagination={{ ...metaPage, current: page }}
                setPagination={setPage}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="product" className="w-full gap-4 flex flex-col">
          {/* <div className="flex w-full bg-white rounded-md shadow p-5 gap-6 flex-col">
            <div className="w-full flex flex-col gap-4">
              <h3 className="text-lg font-semibold">List Product</h3>
              <div
                className="relative w-full flex items-center mb-4"
                style={{ width: "40%" }}
              >
                <Label className="absolute left-3" htmlFor="search-annualy">
                  <Search className="w-4 h-4" />
                </Label>
                <input
                  id="search-annualy"
                  value={dataSearch}
                  onChange={(e) => setDataSearch(e.target.value)}
                  className="w-full h-9 rounded outline-none px-10 text-xs border border-gray-500"
                  placeholder="Search Product Category..."
                />
                <button
                  className={cn(
                    "h-5 w-5 absolute right-2 items-center justify-center outline-none",
                    dataSearch.length > 0 ? "flex" : "hidden"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <DataTable
                columns={columnProductDisplay({
                  metaPageProduct,
                })}
                data={productData ?? []}
              />
              <Pagination
                pagination={{ ...metaPageProduct, current: pageProduct }}
                setPagination={setPageProduct}
              />
            </div>
          </div> */}

          <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
            <h2 className="text-xl font-bold">List Product by Category</h2>
            <div className="flex flex-col w-full gap-4">
              <div className="flex gap-2 items-center w-full justify-between">
                <div className="flex items-center gap-3 w-full">
                  <Input
                    className="w-[250px] border-sky-400/80 focus-visible:ring-sky-400"
                    value={searchProductInput}
                    onChange={(e) => {
                      setSearchProductInput(e.target.value);
                      setSearchProduct(e.target.value);
                    }}
                    placeholder="Search..."
                  />
                  <TooltipProviderPage value={"Reload Data"}>
                    <Button
                      onClick={() => refetchProducts()}
                      className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                      variant={"outline"}
                    >
                      <RefreshCw
                        className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                      />
                    </Button>
                  </TooltipProviderPage>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleExport();
                    }}
                    className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                    disabled={isPendingExport}
                    variant={"outline"}
                  >
                    {isPendingExport ? (
                      <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                    ) : (
                      <FileDown className={"w-4 h-4 mr-1"} />
                    )}
                    Export Data
                  </Button>
                </div>
              </div>
              <DataTable
                columns={columnProductDisplay({
                  metaPageProduct,
                })}
                data={productData ?? []}
              />
              <Pagination
                pagination={{ ...metaPageProduct, current: pageProduct }}
                setPagination={setPageProduct}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
