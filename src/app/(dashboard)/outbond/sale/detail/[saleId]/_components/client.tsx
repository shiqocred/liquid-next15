"use client";

import {
  ArrowLeft,
  ArrowLeftRight,
  CircleDollarSign,
  FileDown,
  Loader2,
  Package,
  PercentCircle,
  Plus,
  PlusCircle,
  Printer,
  RefreshCw,
  ScanBarcode,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { useGetDetailChasier } from "../_api/use-get-detail-cashier";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useUpdateCartonBox } from "../_api/use-update-carton-box";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useGetListProduct } from "../_api/use-get-list-product";
import { useGaborProduct } from "../_api/use-gabor-product";
import { useUpdatePriceProduct } from "../_api/use-update-price-product";
import { useParams } from "next/navigation";
import { useExport } from "../_api/use-export";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});
const DialogGabor = dynamic(() => import("./dialog-gabor"), {
  ssr: false,
});
const DialogUpdatePrice = dynamic(() => import("./dialog-update-price"), {
  ssr: false,
});
const DialogCarton = dynamic(() => import("./dialog-carton"), {
  ssr: false,
});
const DialogExportData = dynamic(() => import("./dialog-export-data"), {
  ssr: false,
});
const DialogExportProduct = dynamic(() => import("./dialog-export-product"), {
  ssr: false,
});

export const Client = () => {
  const { saleId } = useParams();

  const [isUpdatePrice, setIsUpdatePrice] = useState(false);
  const [isGabor, setIsGabor] = useState(false);
  const [isCarton, setIsCarton] = useState(false);
  const [isProduct, setIsProduct] = useState(false);
  const [isExportData, setIsExportData] = useState(false);
  const [isExportProduct, setIsExportProduct] = useState(false);

  const [inputEdit, setInputEdit] = useState({
    id: "",
    price: "0",
  });
  const [inputProceed, setInputProceed] = useState({
    qty: "0",
    unit: "0",
  });
  const [dataExport, setDataExport] = useState<any>(null);

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

  const { mutate: mutateUpdateCarton, isPending: isPendingCarton } =
    useUpdateCartonBox();

  const { mutate: mutateGabor, isPending: isPendingGabor } = useGaborProduct();

  const { mutate: mutateUpdatePrice, isPending: isPendingUpdatePrice } =
    useUpdatePriceProduct();

  const { mutate: mutateExport, isPending: isPendingExport } = useExport();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetDetailChasier({ id: saleId });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProduct({ p: pageProduct, q: searchProductValue });

  // query end ----------------------------------------------------------------

  // memeo strat ----------------------------------------------------------------

  const dataRes: any = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.sales;
  }, [data]);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------

  useEffect(() => {
    if (isSuccess && data) {
      setInputProceed({
        qty: Math.round(data?.data.data.resource.cardbox_qty).toString() ?? "0",
        unit:
          Math.round(data?.data.data.resource.cardbox_unit_price).toString() ??
          "0",
      });
    }
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

  const handleAddProduct = (barcode: string) => {
    const body = {
      sale_barcode: barcode,
      sale_document_id: saleId,
    };
    mutateAddProduct({ body });
  };

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  const handleGabor = async (price: any) => {
    mutateGabor(
      { id: inputEdit.id, body: { product_price_sale: price } },
      {
        onSuccess: () => {
          handleCloseGabor();
        },
      }
    );
  };

  const handleUpdatePrice = async (price: any) => {
    mutateUpdatePrice(
      { id: inputEdit.id, body: { update_price_sale: price } },
      {
        onSuccess: () => {
          handleCloseUpdatePrice();
        },
      }
    );
  };

  const handleUpdateCarton = async () => {
    mutateUpdateCarton(
      {
        id: saleId,
        body: {
          cardbox_qty: inputProceed.qty,
          cardbox_unit_price: inputProceed.unit,
        },
      },
      {
        onSuccess: () => {
          handleCloseUpdateCarton();
        },
      }
    );
  };

  const handleExport = async (type: "data" | "product") => {
    mutateExport(
      { barcode: dataRes?.code_document_sale },
      {
        onSuccess: (res) => {
          if (type === "data") {
            setIsExportData(true);
          } else {
            setIsExportProduct(true);
          }
          setDataExport(res.data);
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

  const handleCloseGabor = () => {
    setIsGabor(false);
    setInputEdit({
      id: "",
      price: "0",
    });
  };

  const handleCloseUpdatePrice = () => {
    setIsUpdatePrice(false);
    setInputEdit({
      id: "",
      price: "0",
    });
  };
  const handleCloseUpdateCarton = () => {
    setIsCarton(false);
    setInputProceed({
      qty: "0",
      unit: "0",
    });
  };

  // handling close end ----------------------------------------------------------------

  useEffect(() => {
    if (isNaN(parseFloat(inputEdit.price))) {
      setInputEdit((prev) => ({ ...prev, price: "0" }));
    }
  }, [inputEdit]);

  useEffect(() => {
    if (isNaN(parseFloat(inputProceed.qty))) {
      setInputProceed((prev) => ({ ...prev, qty: "0" }));
    }
    if (isNaN(parseFloat(inputProceed.unit))) {
      setInputProceed((prev) => ({ ...prev, unit: "0" }));
    }
  }, [inputProceed]);

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

  const columnSales: ColumnDef<any>[] = [
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
      accessorKey: "product_barcode_sale",
      header: "Barcode",
    },
    {
      accessorKey: "product_name_sale",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] hyphens-auto">
          {row.original.product_name_sale}
        </div>
      ),
    },
    {
      accessorKey: "product_price_sale",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.product_price_sale)}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <Button
            className="items-center border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50"
            variant={"outline"}
            disabled={isPendingUpdatePrice}
            type="button"
            onClick={() => {
              setIsUpdatePrice(true);
              setInputEdit({
                id: row.original.id,
                price: row.original.product_price_sale,
              });
            }}
          >
            {isPendingUpdatePrice ? (
              <Loader2 className="w-4 h-4 mr-1" />
            ) : (
              <CircleDollarSign className="w-4 h-4 mr-1" />
            )}
            <div>Update Price</div>
          </Button>
          <Button
            className="items-center border-violet-400 text-violet-700 hover:text-violet-700 hover:bg-violet-50"
            variant={"outline"}
            type="button"
            disabled={isPendingGabor}
            onClick={() => {
              setIsGabor(true);
              setInputEdit({
                id: row.original.id,
                price: row.original.product_price_sale,
              });
            }}
          >
            {isPendingGabor ? (
              <Loader2 className="w-4 h-4 mr-1" />
            ) : (
              <PercentCircle className="w-4 h-4 mr-1" />
            )}
            <div>Gabor</div>
          </Button>
          <Button
            className="items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50"
            variant={"outline"}
            type="button"
            disabled={isPendingRemoveProduct}
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

  const columnProduct: ColumnDef<any>[] = [
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
      accessorKey: "barcode",
      header: "Barcode",
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] hyphens-auto">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Add Product"}>
            <Button
              className="items-center border-sky-400 text-black hover:bg-sky-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                handleCloseProduct();
                handleAddProduct(row.original.barcode);
              }}
              type="button"
            >
              {isPendingAddProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
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

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <DeleteProductDialog />
      <DialogExportData
        open={isExportData}
        onCloseModal={() => {
          if (isExportData) {
            setIsExportData(false);
          }
          setDataExport(null);
        }}
        data={dataExport}
      />
      <DialogExportProduct
        open={isExportProduct}
        onCloseModal={() => {
          if (isExportProduct) {
            setIsExportProduct(false);
          }
          setDataExport(null);
        }}
        data={dataExport}
      />
      <DialogCarton
        open={isCarton}
        onCloseModal={() => {
          if (isCarton) {
            setIsCarton(false);
          }
        }}
        input={inputProceed}
        setInput={setInputProceed}
        handleSubmit={handleUpdateCarton}
      />
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
        columns={columnProduct}
        dataTable={dataListProduct}
        page={pageProduct}
        metaPage={metaPageProduct}
        setPage={setPageProduct}
      />
      <DialogGabor
        open={isGabor}
        onCloseModal={() => {
          if (isGabor) {
            handleCloseGabor();
          }
        }}
        data={inputEdit.price}
        handleSubmit={handleGabor}
      />
      <DialogUpdatePrice
        open={isUpdatePrice}
        onCloseModal={() => {
          if (isUpdatePrice) {
            handleCloseUpdatePrice();
          }
        }}
        data={inputEdit.price}
        handleSubmit={handleUpdatePrice}
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
            <BreadcrumbItem>Detail</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/outbond/sale">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Detail Sale</h1>
        </div>
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <ScanBarcode className="size-4" />
              </div>
              <h5 className="font-bold text-xl">
                {dataRes?.code_document_sale}
              </h5>
            </div>
            <div className="flex gap-4 items-center">
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                  disabled={isRefetching}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : ""
                    )}
                  />
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Add Product"} align="end">
                <Button
                  onClick={() => setIsProduct(true)}
                  className="items-center w-9 px-0 flex-none h-9 bg-sky-400/80 text-black hover:bg-sky-400"
                >
                  <Plus className="size-4" />
                </Button>
              </TooltipProviderPage>
            </div>
          </div>
          <div className="flex w-full gap-4">
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Buyer</p>
                <p className="font-semibold">
                  {dataRes?.buyer_name_document_sale}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Buyer Phone</p>
                <p className="font-semibold">
                  {dataRes?.buyer_phone_document_sale}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Buyer Address</p>
                <p className="font-semibold">
                  {dataRes?.buyer_address_document_sale}
                </p>
              </div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Total Product</p>
                <p className="font-semibold">
                  {dataRes?.total_product_document_sale}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Total Diskon</p>
                <p className="font-semibold">{dataRes?.new_discount_sale}%</p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Total Voucher</p>
                <p className="font-semibold">
                  {formatRupiah(dataRes?.voucher)}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-500 w-full pt-3 mt-5">
            <div className="flex flex-col">
              <p className="text-sm">Total Product Price</p>
              <p className="font-semibold">
                {formatRupiah(dataRes?.total_price_document_sale)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <Package className="size-4" />
              </div>
              <h5 className="font-bold text-xl">Carton Box</h5>
            </div>
            <TooltipProviderPage value={"Edit Carton Box"} align="end">
              <Button
                onClick={() => setIsCarton(true)}
                disabled={isPendingCarton}
                className="items-center w-9 px-0 flex-none h-9 bg-yellow-400/80 text-black hover:bg-yellow-400"
              >
                <ArrowLeftRight className="size-4" />
              </Button>
            </TooltipProviderPage>
          </div>
          <div className="flex w-full gap-4">
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Qty</p>
                <p className="font-semibold">{dataRes?.cardbox_qty}</p>
              </div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Per Unit</p>
                <p className="font-semibold">
                  {formatRupiah(dataRes?.cardbox_unit_price)}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-500 w-full pt-3 mt-5">
            <div className="flex flex-col">
              <p className="text-sm">Total Carton Box Price</p>
              <p className="font-semibold">
                {formatRupiah(dataRes?.cardbox_total_price)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full bg-sky-400/80 rounded-md overflow-hidden shadow p-5">
          <div className="flex items-center gap-4 text-lg">
            <div className="h-full pr-4 border-r border-black flex items-center whitespace-nowrap">
              <p className="font-semibold">Grand Total</p>
            </div>
            <p className="font-semibold w-full text-center">
              {formatRupiah(dataRes?.grand_total)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              onClick={() => handleExport("product")}
              disabled={isPendingExport}
              className="bg-white text-black hover:bg-sky-50"
            >
              <Printer className="size-4 ml-1" />
              Export By Product
            </Button>
            <Button
              type="button"
              onClick={() => handleExport("data")}
              disabled={isPendingExport}
              className="bg-white text-black hover:bg-sky-50"
            >
              <FileDown className="size-4 ml-1" />
              Export Data
            </Button>
          </div>
        </div>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <DataTable
            isLoading={isRefetching}
            columns={columnSales}
            data={dataList ?? []}
          />
        </div>
      </div>
    </div>
  );
};
