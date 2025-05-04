"use client";

import {
  Ban,
  User,
  Check,
  Circle,
  ArrowRight,
  PackagePlus,
  ChevronDown,
  CheckCircle2,
  PercentCircle,
  TicketPercent,
  ShoppingBasket,
  ScanBarcode,
} from "lucide-react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { useGetListPPN } from "../_api/use-get-list-ppn";
import { Badge } from "@/components/ui/badge";

export const TopMenu = ({
  input,
  setInput,
  dataList,
  openDialog,
  setOpenDialog,
  handleSubmit,
}: {
  input: any;
  dataList: any[];
  openDialog: string;
  setInput: Dispatch<SetStateAction<any>>;
  setOpenDialog: (value: string) => Promise<URLSearchParams>;
  handleSubmit: () => void;
}) => {
  const { data } = useGetListPPN();

  const dataPPN: any[] = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const totalPriceBeforeTax =
    parseFloat(input.price) +
    parseFloat(input.cartonQty) * parseFloat(input.cartonUnit) -
    parseFloat(input.voucher);
  const taxPrice = (totalPriceBeforeTax / 100) * input.ppnActive;

  useEffect(() => {
    if (!input.ppnActive && dataPPN?.length > 0) {
      setInput((prev: any) => ({
        ...prev,
        ppnActive: parseFloat(
          dataPPN.find((item: any) => item.is_tax_default === 1)?.ppn
        ),
      }));
    }
  }, [dataPPN]);

  const renderPriceSummary = () => {
    const items = [
      {
        label: ["", "Product Price"],
        icon: <ShoppingBasket />,
        value: input.price,
      },
      { label: ["DPP", "Dasar Pengenaan Pajak"], value: totalPriceBeforeTax },
      {
        label: ["PPN", "Pajak Penambahan Nilai"],
        value: taxPrice,
        className: !input.isTax && "line-through",
      },
      {
        label: ["Total", "Total Harga"],
        value: input.isTax
          ? totalPriceBeforeTax + taxPrice
          : totalPriceBeforeTax,
      },
    ];

    return items.map(({ label, icon, value, className }) => (
      <TooltipProviderPage key={label[0]} value={<p>{label[1]}</p>}>
        <Button
          variant="outline"
          className={cn(
            "border-black disabled:opacity-100 disabled:pointer-events-auto disabled:bg-transparent",
            className
          )}
          disabled
        >
          {icon ? icon : <p className="text-xs font-bold">{label[0]}</p>}
          <Separator orientation="vertical" className="bg-gray-500" />
          <p>{formatRupiah(value)}</p>
        </Button>
      </TooltipProviderPage>
    ));
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-white rounded-md shadow p-5">
      <div className="flex items-center flex-wrap gap-3 w-full">
        <TooltipProviderPage value={"Barcode"}>
          <Button
            variant={"outline"}
            className="border-black disabled:pointer-events-auto disabled:opacity-100"
            disabled
          >
            <ScanBarcode className="size-4" />
            <Separator orientation="vertical" className="bg-gray-500" />
            <p>{input.barcode}</p>
          </Button>
        </TooltipProviderPage>
        <TooltipProviderPage
          value={
            input.buyerId ? (
              <div className="max-w-32 2xl:max-w-64">
                <p>Buyer: {input.buyer}</p>
                <p>Phone: {input.buyerPhone}</p>
                <p>Address: {input.buyerAddress}</p>
                {dataList?.length > 0 && (
                  <p className="flex items-center text-red-300 pt-2 mt-2 border-t border-red-300 font-semibold">
                    <AlertCircle className="size-3 mr-2" />
                    Clear product to change
                  </p>
                )}
              </div>
            ) : (
              <p>Select Buyer</p>
            )
          }
        >
          <Button
            variant={"outline"}
            className="border-black disabled:pointer-events-auto disabled:opacity-100"
            onClick={() => setOpenDialog("buyer")}
            disabled={dataList?.length > 0}
          >
            <User className="size-4" />
            <Separator orientation="vertical" className="bg-gray-500" />
            <p className="w-32 2xl:w-64 text-start truncate">
              {input.buyerId ? input.buyer : "Select Buyer"}
            </p>
          </Button>
        </TooltipProviderPage>
        <TooltipProviderPage
          value={
            <div>
              <p>Discount</p>
              {dataList?.length > 0 && (
                <p className="flex items-center text-red-300 pt-2 mt-2 border-t border-red-300 font-semibold">
                  <AlertCircle className="size-3 mr-2" />
                  Clear product to change
                </p>
              )}
            </div>
          }
        >
          <Button
            variant={"outline"}
            className="border-black disabled:pointer-events-auto disabled:opacity-100"
            onClick={() => setOpenDialog("discount")}
            disabled={dataList?.length > 0}
          >
            <PercentCircle className="size-4" />
            <Separator orientation="vertical" className="bg-gray-500" />
            <p>{input.discount}%</p>
            {input.discount > 0 && (
              <>
                <Separator orientation="vertical" className="bg-gray-500" />
                <Badge className="bg-sky-400/80 hover:bg-sky-400/80 text-black font-medium">
                  {input.discountFor === "old" ? "Old Price" : "New Price"}
                </Badge>
              </>
            )}
          </Button>
        </TooltipProviderPage>
        <TooltipProviderPage value={<p>Voucher</p>}>
          <Button
            variant={"outline"}
            className="border-black"
            size={parseFloat(input.voucher) > 0 ? "default" : "icon"}
            onClick={() => setOpenDialog("voucher")}
          >
            <TicketPercent className="size-4" />
            {parseFloat(input.voucher) > 0 && (
              <>
                <Separator orientation="vertical" className="bg-gray-500" />
                <p>{formatRupiah(parseFloat(input.voucher))}</p>
              </>
            )}
          </Button>
        </TooltipProviderPage>
        <TooltipProviderPage value={<p>Carton Box</p>}>
          <Button
            variant={"outline"}
            className="border-black"
            size={parseFloat(input.cartonQty) > 0 ? "default" : "icon"}
            onClick={() => setOpenDialog("carton")}
          >
            <PackagePlus className="size-4" />
            {parseFloat(input.cartonQty) > 0 && (
              <>
                <Separator orientation="vertical" className="bg-gray-500" />
                <p>{input.cartonQty}</p>
                <p>@{formatRupiah(parseFloat(input.cartonUnit))}</p>
                <Separator orientation="vertical" className="bg-gray-500" />
                <p>
                  {formatRupiah(
                    parseFloat(input.cartonQty) * parseFloat(input.cartonUnit)
                  )}
                </p>
              </>
            )}
          </Button>
        </TooltipProviderPage>
        {dataPPN?.length === 0 ? (
          <TooltipProviderPage value={<p>PPN Not Found, Create First!</p>}>
            <Button variant={"outline"} className="border-black" asChild>
              <Link href={"#"}>
                <p className="text-xs font-bold">Create PPN</p>
                <ArrowRight />
              </Link>
            </Button>
          </TooltipProviderPage>
        ) : (
          <div className="flex items-center border border-black rounded-md">
            <TooltipProviderPage
              value={
                <p>
                  {!input.ppnActive
                    ? "Select PPN first to enable"
                    : input.isTax
                    ? "PPN Enabled"
                    : "PPN Disabled"}
                </p>
              }
            >
              <Button
                variant={"ghost"}
                className="pr-2 rounded-r-none disabled:pointer-events-auto disabled:opacity-100 disabled:hover:bg-white"
                onClick={() =>
                  setInput((prev: any) => ({ ...prev, isTax: !prev.isTax }))
                }
                disabled={!input.ppnActive}
              >
                {!input.ppnActive ? (
                  <Ban />
                ) : input.isTax ? (
                  <CheckCircle2 />
                ) : (
                  <Circle />
                )}
                <p className="text-xs font-bold">PPN</p>
                <Separator orientation="vertical" className="bg-gray-500" />
              </Button>
            </TooltipProviderPage>
            <TooltipProviderPage value={<p>Select Presentase PPN</p>}>
              <Popover
                open={openDialog === "ppn"}
                onOpenChange={() =>
                  setOpenDialog(openDialog === "ppn" ? "" : "ppn")
                }
              >
                <PopoverTrigger asChild>
                  <Button variant={"ghost"} className="pl-2 rounded-l-none">
                    <p>{input.ppnActive}%</p>
                    <ChevronDown />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-20">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {dataPPN
                          ?.sort(
                            (a, b) => parseFloat(a.ppn) - parseFloat(b.ppn)
                          )
                          .map((item) => (
                            <CommandItem
                              key={item.id}
                              onSelect={() => {
                                setInput((prev: any) => ({
                                  ...prev,
                                  ppnActive: parseFloat(item.ppn),
                                }));
                                setOpenDialog("");
                              }}
                            >
                              <p>{parseFloat(item.ppn)}%</p>
                              <Check
                                className={cn(
                                  input.ppnActive !== parseFloat(item.ppn)
                                    ? "opacity-0"
                                    : "opacity-100",
                                  "size-3"
                                )}
                              />
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </TooltipProviderPage>
          </div>
        )}
      </div>
      <div className="flex w-full gap-3 items-center">
        <p className="text-sm font-semibold text-gray-500">Price</p>
        <Separator className="bg-gray-500 flex-auto" />
      </div>
      <div className="flex items-center gap-3 w-full justify-between flex-wrap">
        <div className="flex items-center flex-wrap gap-3">
          {renderPriceSummary()}
        </div>
        <Button onClick={handleSubmit} variant={"liquid"} className="flex-none">
          Checkout
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
