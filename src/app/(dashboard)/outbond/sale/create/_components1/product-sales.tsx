import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { setPaginate } from "@/lib/utils";
import { parseAsInteger, useQueryState } from "nuqs";
import React, { useEffect, useMemo, useState } from "react";
import { columnSales } from "./columns";
import { useGetListChasier } from "../_api/use-get-list-cashier";
import { Input } from "@/components/ui/input";
import { ArrowUpRightFromSquare, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const ProductSales = ({ columnData, setInput }: any) => {
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetListChasier({ p: page });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: data?.data.data.resource,
      setPage: setPage,
      setMetaPage: setMetaPage,
    });
    setInput((prev: any) => ({
      ...prev,
      buyerAddress: data?.data.data.resource.buyer_address,
      buyerPhone: data?.data.data.resource.buyer_phone,
      buyer: data?.data.data.resource.sale_buyer_name,
      buyerId: data?.data.data.resource.sale_buyer_id,
      discount: Math.round(
        data?.data.data.resource.data?.[0]?.new_discount_sale ?? "0"
      ).toString(),
      discountFor: data?.data.data.resource.data?.[0]?.type_discount ?? "",
      price: Math.round(data?.data.data.resource.total_sale ?? "0").toString(),
    }));
  }, [data]);

  return (
    <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
      <div className="flex items-center w-full gap-4">
        <div className="flex items-center w-full relative">
          <Input className="rounded-r-none border-r-0 pl-9 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100" />
          <Label className="left-3 absolute">
            <Search className="size-4" />
          </Label>
          <Button
            className="flex-none rounded-l-none"
            variant={"liquid"}
            size={"icon"}
          >
            <ArrowUpRightFromSquare />
          </Button>
        </div>
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
          ...columnData,
        })}
        data={dataList ?? []}
      />
      <Pagination
        pagination={{ ...metaPage, current: page }}
        setPagination={setPage}
      />
    </div>
  );
};
