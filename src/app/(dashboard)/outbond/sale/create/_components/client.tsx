"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRightCircle,
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  Percent,
  PercentCircle,
  PlusCircle,
  RefreshCw,
  ScanBarcode,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
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
import { useGetListChasier } from "../_api/use-get-list-cashier";
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
import { Badge } from "@/components/ui/badge";
import { useGetListBuyer } from "../_api/use-get-list-buyer";
import dynamic from "next/dynamic";
import { useGetListProduct } from "../_api/use-get-list-product";
import { useGaborProduct } from "../_api/use-gabor-product";
import { useUpdatePriceProduct } from "../_api/use-update-price-product";

const DialogBuyer = dynamic(() => import("./dialog-buyer"), {
  ssr: false,
});
const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});
const DialogGabor = dynamic(() => import("./dialog-gabor"), {
  ssr: false,
});
const DialogUpdatePrice = dynamic(() => import("./dialog-update-price"), {
  ssr: false,
});
const DialogProceed = dynamic(() => import("./dialog-proceed"), {
  ssr: false,
});

export const Client = () => {
  const [isComplete, setIsComplete] = useState(false);

  const [isProceed, setIsProceed] = useState(false);
  const [isUpdatePrice, setIsUpdatePrice] = useState(false);
  const [isGabor, setIsGabor] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [isProduct, setIsProduct] = useState(false);

  const addRef = useRef<HTMLInputElement | null>(null);

  const [input, setInput] = useState({
    discount: "0",
    buyer: "",
    buyerId: "",
    price: "0",
  });
  const [inputEdit, setInputEdit] = useState({
    id: "",
    price: "0",
  });
  const [inputProceed, setInputProceed] = useState({
    qty: "0",
    unit: "0",
    voucher: "0",
  });

  // search, debounce, paginate strat ----------------------------------------------------------------

  const [addProductSearch, setAddProductSearch] = useState("");
  const searchAddProductValue = useDebounce(addProductSearch);

  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [buyerSearch, setBuyerSearch] = useState("");
  const searchBuyerValue = useDebounce(buyerSearch);
  const [pageBuyer, setPageBuyer] = useState(1);
  const [metaPageBuyer, setMetaPageBuyer] = useState({
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
    "Create Sale",
    "This action cannot be undone",
    "liquid"
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

  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();

  const { mutate: mutateGabor, isPending: isPendingGabor } = useGaborProduct();

  const { mutate: mutateUpdatePrice, isPending: isPendingUpdatePrice } =
    useUpdatePriceProduct();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetListChasier({ p: page });

  const {
    data: dataBuyer,
    refetch: refetchBuyer,
    isRefetching: isRefetchingBuyer,
    error: errorBuyer,
    isError: isErrorBuyer,
    isSuccess: isSuccessBuyer,
  } = useGetListBuyer({ p: pageBuyer, q: searchBuyerValue });

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
    return data?.data.data.resource.data;
  }, [data]);

  const dataListBuyer: any[] = useMemo(() => {
    return dataBuyer?.data.data.resource.data;
  }, [dataBuyer]);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: data?.data.data.resource,
      setPage: setPage,
      setMetaPage: setMetaPage,
    });
    setInput((prev) => ({
      ...prev,
      buyer: data?.data.data.resource.sale_buyer_name,
      buyerId: data?.data.data.resource.sale_buyer_id,
      discount: Math.round(
        data?.data.data.resource.data?.[0]?.new_discount_sale ?? "0"
      ).toString(),
      price: Math.round(data?.data.data.resource.total_sale ?? "0").toString(),
    }));
  }, [data]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessBuyer,
      data: dataBuyer,
      dataPaginate: dataBuyer?.data.data.resource,
      setPage: setPageBuyer,
      setMetaPage: setMetaPageBuyer,
    });
  }, [dataBuyer]);

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
      buyer_id: input.buyerId,
      new_discount_sale: input.discount,
      sale_barcode: barcode,
      voucher: "",
    };
    mutateAddProduct(
      { body },
      {
        onSuccess: () => {
          if (addRef.current) {
            addRef.current.focus();
          }
          setAddProductSearch("");
        },
      }
    );
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

  const handleSubmit = async () => {
    setIsComplete(true);

    const ok = await confirmSubmit();

    if (!ok) return;

    const body = {
      cardbox_qty: inputProceed.qty,
      cardbox_unit_price: inputProceed.unit,
      total_price_document_sale:
        parseFloat(dataRes?.total_sale ?? 0) +
        parseFloat(inputProceed.qty) * parseFloat(inputProceed.unit) -
        parseFloat(inputProceed.voucher),
      voucher: inputProceed.voucher,
    };

    mutateSubmit({ body });
  };

  // handling action end ----------------------------------------------------------------

  // handling close strat ----------------------------------------------------------------

  const handleCloseBuyer = () => {
    setIsBuyer(false);
    setBuyerSearch("");
    setPageBuyer(1);
    setMetaPageBuyer({
      from: 0,
      last: 0,
      perPage: 0,
      total: 0,
    });
  };

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

  // handling close end ----------------------------------------------------------------

  useEffect(() => {
    if (isNaN(parseFloat(input.discount))) {
      setInput((prev) => ({ ...prev, discount: "0" }));
    }
  }, [input]);

  useEffect(() => {
    if (isNaN(parseFloat(inputEdit.price))) {
      setInputEdit((prev) => ({ ...prev, price: "0" }));
    }
  }, [inputEdit]);

  useEffect(() => {
    if (isNaN(parseFloat(inputProceed.voucher))) {
      setInputProceed((prev) => ({ ...prev, voucher: "0" }));
    }
    if (isNaN(parseFloat(inputProceed.qty))) {
      setInputProceed((prev) => ({ ...prev, qty: "0" }));
    }
    if (isNaN(parseFloat(inputProceed.unit))) {
      setInputProceed((prev) => ({ ...prev, unit: "0" }));
    }
  }, [inputProceed]);

  // handle add by input
  useEffect(() => {
    if (searchAddProductValue) {
      handleAddProduct(searchAddProductValue);
    }
  }, [searchAddProductValue]);

  // handle error buyer
  useEffect(() => {
    alertError({
      isError: isErrorBuyer,
      error: errorBuyer as AxiosError,
      data: "Buyer",
      action: "get data",
      method: "GET",
    });
  }, [isErrorBuyer, errorBuyer]);

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
          {(metaPage.from + row.index).toLocaleString()}
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
        <div className="max-w-[500px]">{row.original.product_name_sale}</div>
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
            disabled={isPendingUpdatePrice || isPendingSubmit}
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
            disabled={isPendingGabor || isPendingSubmit}
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

  const columnBuyer: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageBuyer.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "name_buyer",
      header: "Buyer Name",
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.original.name_buyer}</div>
      ),
    },
    {
      accessorKey: "phone_buyer",
      header: "No. Hp",
    },
    {
      accessorKey: "address_buyer",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.original.address_buyer}</div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Select"}>
            <Button
              className="items-center border-sky-400 text-black hover:bg-sky-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={dataList?.length > 0}
              onClick={(e) => {
                e.preventDefault();
                handleCloseBuyer();
                setInput((prev) => ({
                  ...prev,
                  buyer: row.original.name_buyer,
                  buyerId: row.original.id,
                }));
              }}
              type="button"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
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
        <div className="max-w-[500px]">{row.original.name}</div>
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
                handleCloseBuyer();
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

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isComplete) {
        event.preventDefault();
        event.returnValue = ""; // Beberapa browser memerlukan nilai kosong untuk menampilkan dialog.
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isComplete]);

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
      <DialogProceed
        open={isProceed}
        onCloseModal={() => setIsProceed(false)}
        data={{
          barcode: dataRes?.code_document_sale ?? "-",
          buyer: input.buyer ?? "-",
          discount: input.discount ?? "0",
          totalProduct: dataList?.length ?? 0,
          totalPrice: dataRes?.total_sale ?? 0,
          voucher: inputProceed.voucher ?? "0",
          cartonQty: inputProceed.qty ?? "0",
          cartonUnit: inputProceed.unit ?? "0",
        }}
        setData={setInputProceed}
        handleSubmit={handleSubmit}
      />
      <DialogBuyer
        open={isBuyer}
        onCloseModal={() => {
          if (isBuyer) {
            handleCloseBuyer();
          }
        }}
        search={buyerSearch}
        setSearch={setBuyerSearch}
        refetch={refetchBuyer}
        isRefetching={isRefetchingBuyer}
        columns={columnBuyer}
        dataTable={dataListBuyer}
        page={pageBuyer}
        metaPage={metaPageBuyer}
        setPage={setPageBuyer}
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
        <div className="grid w-full grid-cols-7 relative gap-4">
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
            <div className="flex items-center gap-4 pb-3 mb-3 border-gray-500 border-b w-full">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <ScanBarcode className="size-4" />
              </div>
              <h5 className="font-bold">Barcode</h5>
            </div>
            <div className="flex items-center h-10 text-base px-3">
              {dataRes?.code_document_sale}
            </div>
          </div>
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-1">
            <div className="flex items-center gap-4 pb-3 mb-3 border-gray-500 border-b w-full">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <Percent className="size-4" />
              </div>
              <h5 className="font-bold">Disc.</h5>
            </div>
            {dataList?.length === 0 ? (
              <div className="flex items-center gap-2 border-b border-gray-500 border-dashed">
                <Input
                  disabled={dataList?.length > 0 || isPendingSubmit}
                  value={input.discount}
                  type="number"
                  onChange={(e) =>
                    e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value
                  }
                  className="border-none focus-visible:ring-0 shadow-none"
                />
                <Percent className="size-4" />
              </div>
            ) : (
              <div className="flex items-center h-10 justify-center">
                <p className="tracking-wide text-lg font-semibold">
                  {input.discount}%
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
            <div className="flex items-center gap-4 pb-3 mb-3 border-gray-500 border-b w-full">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <BriefcaseBusiness className="size-4" />
              </div>
              <h5 className="font-bold">Buyer</h5>
            </div>
            <Button
              type="button"
              onClick={() => setIsBuyer(true)}
              disabled={dataRes?.sale_buyer_name || isPendingSubmit}
              className="bg-transparent h-10 text-base hover:bg-transparent text-black shadow-none justify-between group disabled:opacity-100"
            >
              {input.buyer ? input.buyer : "Not Selected"}
              {!dataRes?.sale_buyer_name && (
                <div className="size-9 flex items-center justify-center rounded-full group-hover:bg-sky-100">
                  <ArrowLeftRight className="size-4" />
                </div>
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between w-full bg-sky-400/80 rounded-md overflow-hidden shadow p-5">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-sm">
              Proceed to complete the transaction
            </p>
            <TooltipProviderPage
              value={
                <div className="flex flex-col">
                  <p>- Filling in the discount voucher </p>
                  <p>- Configuring the carton box</p>
                </div>
              }
            >
              <AlertCircle className="size-3" />
            </TooltipProviderPage>
          </div>
          <Button
            type="button"
            onClick={() => setIsProceed(true)}
            disabled={isPendingSubmit}
            className="bg-white text-black hover:bg-sky-50"
          >
            Proceed
            <ArrowRightCircle className="size-4 ml-1" />
          </Button>
        </div>
        <div className="flex w-full gap-4">
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5">
            <div
              className={cn(
                "w-full flex justify-between items-center relative group",
                !input.buyer && "cursor-not-allowed"
              )}
            >
              <Label
                htmlFor="search"
                className="flex gap-2 absolute left-2 items-center"
              >
                <Badge className="bg-black text-xs hover:bg-black rounded-full text-white">
                  Add Product
                </Badge>
              </Label>
              <TooltipProviderPage
                className={cn(!input.buyer ? "opacity-100" : "opacity-0")}
                value={<p>Select Buyer First.</p>}
              >
                <Input
                  id="search"
                  ref={addRef}
                  className="rounded-r-none border-r-0 pl-28 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100"
                  autoFocus
                  autoComplete="off"
                  disabled={!input.buyer || isPendingSubmit}
                  value={addProductSearch}
                  onChange={(e) => setAddProductSearch(e.target.value)}
                />
              </TooltipProviderPage>
              <Button
                disabled={!input.buyer || isPendingSubmit}
                onClick={() => setIsProduct(true)}
                className="bg-sky-300/80 w-10 p-0 hover:bg-sky-300 text-black rounded-l-none border border-sky-300/80 hover:border-sky-300 focus-visible:ring-0 disabled:opacity-100"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-none bg-white rounded-md overflow-hidden shadow p-5">
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
                disabled={isPendingSubmit || isRefetching}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefetching ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
          </div>
          <div className="flex items-center w-full bg-white rounded-md overflow-hidden shadow p-5">
            <div className="size-9 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow mr-2">
              <BadgeDollarSign className="size-5" />
            </div>
            <p className="font-semibold">
              {formatRupiah(dataRes?.total_sale ?? 0)}
            </p>
          </div>
        </div>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <DataTable
            isLoading={isRefetching}
            columns={columnSales}
            data={dataList ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
