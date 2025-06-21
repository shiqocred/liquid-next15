"use client";

import {
  Tag,
  SaveIcon,
  Briefcase,
  PercentCircle,
  Box,
  BadgeDollarSign,
  DollarSign,
  ArrowLeft,
  ScanText,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import Loading from "@/app/(dashboard)/loading";
import { formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { DialogBuyer, DialogDiscount, DialogCategory, DialogName } from "./dialogs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateB2B } from "../_api";

const initialValue = {
  buyer_id: "",
  name_buyer: "",
  discount_bulky: "0",
  category_bulky: "",
  total_old_price_bulky: "0",
  after_price_bulky: "0",
  total_product_bulky: "0",
  name_document: "",
};

export const Client = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [dialog, setDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault("")
  );

  const [input, setInput] = useState(initialValue);
  const { mutate: createB2B } = useCreateB2B();

  const handleCreateB2B = async () => {
    createB2B(
      {
        body: {
          buyer_id: input.buyer_id,
          discount_bulky: input.discount_bulky,
          category_bulky: input.category_bulky,
          name_document: input.name_document,
        },
      },
      {
        onSuccess: (data) => {
          console.log("Create B2B Success", data?.data);
          router.push(`/outbond/b2b/edit/${data?.data?.data?.resource?.id}`);
        },
      }
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DialogBuyer
        open={dialog === "buyer"}
        onOpenChange={() => {
          if (dialog === "buyer") {
            setDialog("");
          }
        }}
        setInput={setInput}
      />
      <DialogDiscount
        open={dialog === "discount"}
        onOpenChange={() => {
          if (dialog === "discount") {
            setDialog("");
          }
        }}
        data={input}
        setData={setInput}
      />
      <DialogCategory
        open={dialog === "category"}
        onOpenChange={() => {
          if (dialog === "category") {
            setDialog("");
          }
        }}
        data={input}
        setData={setInput}
      />
      <DialogName
        open={dialog === "name"}
        onOpenChange={() => {
          if (dialog === "name") {
            setDialog("");
          }
        }}
        data={input}
        setData={setInput}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/b2b">B2B</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full relative flex flex-col gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
          <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
            <Link href="/outbond/b2b">
              <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Create B2B</h1>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center gap-4">
                <TooltipProviderPage value={input.name_buyer}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("buyer")}
                  >
                    <Briefcase />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="w-72 text-left truncate">
                      {input.buyer_id ? input.name_buyer : "Select Buyer"}
                    </p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage
                  value={
                    <div className="flex flex-col max-w-72">
                      <p>Discount: {input.discount_bulky}%</p>
                    </div>
                  }
                >
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("discount")}
                  >
                    <PercentCircle />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="min-w-5">{input.discount_bulky}%</p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage value={input.category_bulky}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("category")}
                  >
                    <Tag />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="min-w-5 max-w-52 truncate">
                      {input.category_bulky ? input.category_bulky : "-"}
                    </p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage value={input.name_document}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("name")}
                    // disabled={listData.length > 0}
                  >
                    <ScanText />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="min-w-5 max-w-52 truncate">
                      {input.name_document ? input.name_document : "-"}
                    </p>
                  </Button>
                </TooltipProviderPage>
              </div>
              <Button onClick={handleCreateB2B} variant={"liquid"}>
                <SaveIcon />
                Save
              </Button>
            </div>
            <Separator className="bg-sky-400/80" />
            <div className="flex items-center gap-4">
              <TooltipProviderPage value={"Total Product"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <Box />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {parseFloat(input.total_product_bulky).toLocaleString()}
                  </p>
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Total all product price"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <BadgeDollarSign />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {formatRupiah(parseFloat(input.total_old_price_bulky))}
                  </p>
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Total final price"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <DollarSign />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {formatRupiah(parseFloat(input.after_price_bulky))}
                  </p>
                </Button>
              </TooltipProviderPage>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
