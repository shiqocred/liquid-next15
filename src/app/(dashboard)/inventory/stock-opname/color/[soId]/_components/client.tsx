"use client";

import { ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import Loading from "@/app/(dashboard)/loading";
import { useGetDetailSOColor } from "../_api/use-get-detail-so-color";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { NewSection } from "./new";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { DetailSection } from "./detail";

export const Client = () => {
  const { soId } = useParams();

  const [isMounted, setIsMounted] = useState<boolean>(false);

  const { data, refetch, isRefetching } = useGetDetailSOColor({ id: soId });

  const dataDetail: any = useMemo(() => {
    return data?.data.data.resource ?? {};
  }, [data]);

  const listData: any[] = useMemo(() => {
    return data?.data.data.resource.so_colors ?? [];
  }, [data]);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted) return <Loading />;

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Stock Opname</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inventory/stock-opname/color">
              Color
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {dataDetail.type === "process" ? "Create" : "Detail"}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="p-4 bg-white rounded shadow-md flex flex-col gap-4 w-full">
        <div className="w-full flex gap-2 justify-between items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <div className="flex items-center gap-2">
            <Link href="/inventory/stock-opname/color">
              <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">
              {dataDetail.type === "process" ? "Create" : "Detail"} Stock Opname
              Color
            </h1>
          </div>
          <TooltipProviderPage value="Reload Data">
            <Button onClick={() => refetch()} size={"icon"} variant={"outline"}>
              <RefreshCcw className={cn(isRefetching && "animate-spin")} />
            </Button>
          </TooltipProviderPage>
        </div>
        <div className="flex items-center w-full text-sm py-5">
          <div className="flex items-center gap-1 w-full">
            <p>Period Start:</p>
            <p className="font-bold underline">
              {dataDetail.start_date
                ? format(dataDetail.start_date, "PPP", {
                    locale: id,
                  })
                : "-"}
            </p>
          </div>
          <div className="flex items-center gap-1 w-full">
            <p>Period End:</p>
            <p className="font-bold underline">
              {dataDetail.end_date
                ? format(dataDetail.end_date, "PPP", { locale: id })
                : "-"}
            </p>
          </div>
          <div className="flex items-center gap-1 w-full">
            <p>Status:</p>
            <Badge
              className={cn(
                "text-black font-semibold capitalize",
                dataDetail.type === "done"
                  ? "bg-green-500 hover:bg-green-500"
                  : "bg-yellow-400 hover:bg-yellow-400"
              )}
            >
              {dataDetail.type}
            </Badge>
          </div>
        </div>
        {dataDetail.type === "process" && (
          <NewSection listData={listData} soId={soId} />
        )}
        {dataDetail.type === "done" && <DetailSection listData={listData} />}
      </div>
    </div>
  );
};
