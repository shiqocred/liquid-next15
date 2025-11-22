"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Book,
  Edit3,
  PlusCircle,
  ReceiptText,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { cn, formatRupiah } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { parseAsBoolean, useQueryState } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAnalyticSaleMonthly } from "../_api/use-get-analytic-sale-monthly";
import { useGetAnalyticSaleYearly } from "../_api/use-get-analytic-sale-yearly";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
const DialogCreateEdit = dynamic(() => import("./dialog-create-edit"), {
  ssr: false,
});
export const columnsAnalytic: ColumnDef<any>[] = [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(row.index + 1).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "product_category_sale",
    header: "Category Name",
    cell: ({ row }) => (
      <div className="break-all max-w-[500px]">
        {row.original.product_category_sale}
      </div>
    ),
  },
  {
    accessorKey: "total_category",
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {row.original.total_category}
      </div>
    ),
  },
  {
    accessorKey: "display_price_sale",
    header: "Display Price",
    cell: ({ row }) => {
      const formated = formatRupiah(row.original.display_price_sale);
      return <div className="tabular-nums">{formated}</div>;
    },
  },
  {
    accessorKey: "purchase",
    header: "Sale Price",
    cell: ({ row }) => {
      const formated = formatRupiah(row.original.purchase);
      return <div className="tabular-nums">{formated}</div>;
    },
  },
];

export const Client = () => {
  const [openCreateEdit, setOpenCreateEdit] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  // rack Id for Edit
  const [rackId, setRackId] = useQueryState("rackId", {
    defaultValue: "",
  });
  const [isMounted, setIsMounted] = useState(false);
  const [year] = useState(new Date().getFullYear());
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [date] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  // data form create edit
  const [input, setInput] = useState({
    name: "",
  });

  const {
    data: dataMonthly,
    refetch: refetchMonthly,
    // isPending: isPendingMonthly,
    // isRefetching: isRefetchingMonthly,
    // isLoading: isLoadingMonthly,
    isError: isErrorMonthly,
    error: errorMonthly,
  } = useGetAnalyticSaleMonthly({
    from: date?.from ? format(date.from, "dd-MM-yyyy") : "",
    to: date?.to ? format(date.to, "dd-MM-yyyy") : "",
  });

  const {
    data: dataYearly,
    refetch: refetchYearly,
    // isPending: isPendingYearly,
    // isRefetching: isRefetchingYearly,
    // isLoading: isLoadingYearly,
    isError: isErrorYearly,
    error: errorYearly,
  } = useGetAnalyticSaleYearly(year);

  const monthlyData = useMemo(() => {
    return dataMonthly?.data.data.resource;
  }, [dataMonthly]);

  const yearlyData = useMemo(() => {
    return dataYearly?.data.data.resource;
  }, [dataYearly]);

  const clearSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDataSearch("");
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name_buyer: input.name,
    };
    // mutateCreate(
    //   { body },
    //   {
    //     onSuccess: () => {
    //       handleClose();
    //     },
    //   }
    // );
  };

  // handle update
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name_buyer: input.name,
    };
    // mutateUpdate(
    //   { id: buyerId, body },
    //   {
    //     onSuccess: () => {
    //       handleClose();
    //     },
    //   }
    // );
  };

  // handle close
  const handleClose = () => {
    setOpenCreateEdit(false);
    setInput((prev) => ({
      ...prev,
      name: "",
    }));
  };

  useEffect(() => {
    refetchMonthly();
  }, [date]);

  useEffect(() => {
    refetchYearly();
  }, [year]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (
    (isErrorMonthly && (errorMonthly as AxiosError).status === 403) ||
    (isErrorYearly && (errorYearly as AxiosError).status === 403)
  ) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
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
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Stagging</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Rack</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4 mb-6">
        {/* Card: Total Rack */}
        <div className="bg-white shadow rounded-xl p-5 flex flex-col border border-gray-200">
          <h4 className="text-sm text-gray-500">Total Rack</h4>
          <p className="text-3xl font-bold mt-2">50 </p>
        </div>

        {/* Card: Total Product */}
        <div className="bg-white shadow rounded-xl p-5 flex flex-col border border-gray-200">
          <h4 className="text-sm text-gray-500">Total Products</h4>
          <p className="text-3xl font-bold mt-2">1000 </p>
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
              <div className="w-full flex justify-between items-center">
                <div
                  className="flex items-center gap-5"
                  style={{ width: "60%" }}
                >
                  <div className="relative w-full flex items-center mb-0">
                    <Label className="absolute left-3" htmlFor="search">
                      <Search className="w-4 h-4" />
                    </Label>
                    <input
                      id="search"
                      value={dataSearch}
                      onChange={(e) => setDataSearch(e.target.value)}
                      className="w-full h-9 rounded outline-none px-10 text-xs border border-gray-500"
                    />
                    <button
                      onClick={clearSearch}
                      className={cn(
                        "h-5 w-5 absolute right-2 items-center justify-center outline-none",
                        dataSearch.length > 0 ? "flex" : "hidden"
                      )}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
              {searchValue ? (
                monthlyData?.list_analytic_sale.filter((item: any) =>
                  item.product_category_sale
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                ).length > 0 ? (
                  monthlyData?.list_analytic_sale
                    .filter((item: any) =>
                      item.product_category_sale
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                    )
                    .map((item: any, i: any) => (
                      <div
                        key={`${item.code_document_sale}-${i}`}
                        className="relative flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border"
                      >
                        {/* CONTENT */}
                        <div className="flex w-full items-center gap-4">
                          <p className="text-sm font-bold text-black w-full">
                            {item.product_category_sale}
                          </p>
                        </div>
                        <div className="flex flex-col mt-2">
                          <p className="text-xs font-light text-gray-500">
                            Total Product
                          </p>
                          <p className="text-sm font-light text-gray-800">
                            {item.total_category}
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
                              <Link href={`/stagging/rack/details/2`}>
                                <ReceiptText className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TooltipProviderPage>

                          <TooltipProviderPage value={<p>Edit</p>}>
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
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
                              className="items-center w-7 px-0 flex-none h-7 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                              variant={"outline"}
                              asChild
                            >
                              <Link href={`/stagging/rack/details/2`}>
                                <Trash2 className="w-4 h-4" />
                              </Link>
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
              ) : monthlyData?.list_analytic_sale.length > 0 ? (
                monthlyData?.list_analytic_sale.map((item: any, i: any) => (
                  <div
                    key={`${item.code_document_sale}-${i}`}
                    className="relative flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border"
                  >
                    {/* CONTENT */}
                    <div className="flex w-full items-center gap-4">
                      <p className="text-sm font-bold text-black w-full">
                        {item.product_category_sale}
                      </p>
                    </div>
                    <div className="flex flex-col mt-2">
                      <p className="text-xs font-light text-gray-500">
                        Total Product
                      </p>
                      <p className="text-sm font-light text-gray-800">
                        {item.total_category}
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
                          <Link href={`/stagging/rack/details/2`}>
                            <ReceiptText className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TooltipProviderPage>

                      <TooltipProviderPage value={<p>Edit</p>}>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
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
                          className="items-center w-7 px-0 flex-none h-7 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                          variant={"outline"}
                          asChild
                        >
                          <Link href={`/stagging/rack/details/2`}>
                            <Trash2 className="w-4 h-4" />
                          </Link>
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
          </div>
        </TabsContent>
        <TabsContent value="product" className="w-full gap-4 flex flex-col">
          <div className="flex w-full bg-white rounded-md shadow p-5 gap-6 flex-col">
            <div className="w-full flex flex-col gap-4">
              <h3 className="text-lg font-semibold">List Product</h3>

              {/* Search */}
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
                  onClick={clearSearch}
                  className={cn(
                    "h-5 w-5 absolute right-2 items-center justify-center outline-none",
                    dataSearch.length > 0 ? "flex" : "hidden"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* TABLE */}
              {yearlyData?.list_analytic_sale ? (
                <DataTable
                  columns={columnsAnalytic}
                  data={yearlyData.list_analytic_sale.filter((item: any) =>
                    item.product_category_sale
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  )}
                />
              ) : (
                <div className="w-full text-center py-10 font-semibold">
                  No Data Viewed.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
