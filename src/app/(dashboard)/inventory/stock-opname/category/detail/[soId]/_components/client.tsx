"use client";

import { ArrowBigRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useGetDetailSOCategory } from "../_api/use-get-detail-so-category";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export const Client = () => {
  const { soId } = useParams();

  const [isMounted, setIsMounted] = useState<boolean>(false);

  const { data } = useGetDetailSOCategory({ id: soId });

  const dataDetail: any = useMemo(() => {
    return data?.data.data.resource ?? {};
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
            <BreadcrumbLink href="/inventory/stock-opname/category">
              Category
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="p-4 bg-white rounded shadow-md flex flex-col gap-4 w-full">
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/inventory/stock-opname/category">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          {dataDetail.type === "process" && (
            <Link href="/inventory/stock-opname/category/create">
              <Button
                size={"icon"}
                variant={"outline"}
                className="border-sky-400/80 hover:bg-sky-50 hover:border-sky-400"
              >
                <ArrowBigRight />
              </Button>
            </Link>
          )}
          <h1 className="text-2xl font-semibold">
            Detail Stock Opname Category
          </h1>
        </div>
        <div className="flex items-center w-full text-sm py-5">
          <div className="flex items-center gap-1 w-full">
            <p>Period Start:</p>
            <p className="font-bold underline">
              {format(dataDetail.start_date ?? new Date(), "PPP", {
                locale: id,
              })}
            </p>
          </div>
          <div className="flex items-center gap-1 w-full">
            <p>Period End:</p>
            <p className="font-bold underline">
              {format(dataDetail.end_date ?? new Date(), "PPP", { locale: id })}
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
        <Accordion type="multiple" className="flex flex-col gap-4">
          <AccordionItem
            key={dataDetail?.id}
            value={dataDetail?.id}
            className="border rounded-lg disabled:opacity-100"
            disabled
          >
            <AccordionTrigger className="px-5 group hover:no-underline">
              <p className="whitespace-nowrap group-hover:underline font-bold">
                Category: {dataDetail?.category}
              </p>
              <div className="w-2/3 grid grid-cols-5 gap-3 ">
                <p className="group-data-[state=open]:hidden">
                  Bundle Item:{" "}
                  <span className="font-semibold">
                    {dataDetail?.product_bundle}
                  </span>
                </p>
                <p className="group-data-[state=open]:hidden">
                  Stagging Item:{" "}
                  <span className="font-semibold">
                    {dataDetail?.product_staging}
                  </span>
                </p>
                <p className="group-data-[state=open]:hidden">
                  Inventory Item:{" "}
                  <span className="font-semibold">
                    {dataDetail?.product_inventory}
                  </span>
                </p>
                <p className="group-data-[state=open]:hidden">
                  Damaged Item:{" "}
                  <span className="font-semibold">
                    {dataDetail?.product_damaged}
                  </span>
                </p>
                <p className="group-data-[state=open]:hidden">
                  Abnormal Item:{" "}
                  <span className="font-semibold">
                    {dataDetail?.product_abnormal}
                  </span>
                </p>
                <p className="group-data-[state=open]:hidden">
                  Lost Item:{" "}
                  <span className="font-semibold">
                    {dataDetail?.product_lost}
                  </span>
                </p>
                <p className="group-data-[state=open]:hidden">
                  Additional Item:{" "}
                  <span className="font-semibold">
                    {dataDetail?.product_addition}
                  </span>
                </p>
              </div>
            </AccordionTrigger>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
