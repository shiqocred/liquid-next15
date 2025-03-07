import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { setPaginate } from "@/lib/utils";
import { parseAsInteger, useQueryState } from "nuqs";
import React, { useEffect, useMemo, useState } from "react";
import { columnSales } from "./columns";
import { useGetListChasier } from "../_api/use-get-list-cashier";

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
