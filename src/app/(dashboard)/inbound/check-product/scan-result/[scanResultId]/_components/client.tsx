"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ScanBarcode,
  Send,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import {
  parseAsBoolean,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useGetDetailScanResult } from "../_api/use-get-detail-scan-result";
import { useGetCategoriesMI } from "../_api/use-get-categories-mi";
import Loading from "@/app/(dashboard)/loading";
import { useSubmitProduct } from "../_api/use-submit-product";
import { format } from "date-fns";
import BarcodePrinted from "@/components/barcode";
import Image from "next/image";

export const Client = () => {
  const { scanResultId } = useParams();
  const router = useRouter();

  const [metaData, setMetaData] = useState({
    abnormal: "",
    damaged: "",
    name: "",
    discount: 0,
    qty: "0",
  });

  const [barcodeOpen, setBarcodeOpen] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  const [{ barcode, newPrice, oldPrice, category }, setMetaBarcode] =
    useQueryStates(
      {
        barcode: parseAsString.withDefault(""),
        newPrice: parseAsString.withDefault(""),
        oldPrice: parseAsString.withDefault(""),
        category: parseAsString.withDefault(""),
      },
      {
        urlKeys: {
          newPrice: "new-price",
          oldPrice: "old-price",
        },
      }
    );

  const { mutate } = useSubmitProduct();

  const { data, error, isError } = useGetDetailScanResult({
    id: scanResultId,
  });

  const { data: dataCategories } = useGetCategoriesMI();

  const dataDetail: any = useMemo(() => {
    return data?.data.data.resource.product;
  }, [data]);

  const tagColor = useMemo(() => {
    return (
      data?.data.data.resource?.color_tags ?? {
        id: "0",
        hexa_code_color: "",
        name_color: "",
        fixed_price_color: "0",
      }
    );
  }, [data]);

  const categories: any[] = useMemo(() => {
    return dataCategories?.data.data.resource ?? [];
  }, [dataCategories]);

  const handleSubmit = (e: FormEvent, type: string) => {
    e.preventDefault();
    const body = {
      code_document: null,
      old_barcode_product: dataDetail?.old_barcode_product,
      new_barcode_product: dataDetail?.old_barcode_product, // Kirim barcode yang sesuai
      new_name_product: dataDetail?.product_name,
      old_name_product: dataDetail?.product_name,
      new_quantity_product: metaData.qty,
      new_price_product:
        parseFloat(dataDetail?.product_price) -
        (parseFloat(dataDetail?.product_price) / 100) * metaData.discount,
      old_price_product: dataDetail?.product_price,
      new_date_in_product: format(
        new Date(dataDetail?.created_at),
        "yyyy-MM-dd"
      ),
      new_status_product: "display",
      condition: type,
      new_category_product: type === "lolos" ? metaData.name : "",
      new_tag_product: tagColor?.name_color ?? "",
      description:
        type === "abnormal"
          ? metaData.abnormal
          : type === "damaged"
          ? metaData.damaged
          : "",
    };

    mutate(body, {
      onSuccess: (data) => {
        if (data.data.data.resource?.new_category_product) {
          setBarcodeOpen(true);
          setMetaBarcode({
            barcode: data.data.data.resource.new_barcode_product,
            newPrice: data.data.data.resource.new_price_product,
            oldPrice: data.data.data.resource.old_price_product,
            category: data.data.data.resource.new_category_product,
          });
        } else {
          router.push("/inbound/check-product/scan-result");
        }
      },
    });
  };

  useEffect(() => {
    if (isNaN(parseFloat(metaData.qty))) {
      setMetaData((prev) => ({ ...prev, qty: "0" }));
    }
  }, [metaData]);
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

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
  if (isError && (error as AxiosError)?.status === 404) {
    notFound();
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inbound/check-product/scan-result">
              Scan Result
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
        <Link href="/inbound/check-product/scan-result">
          <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Check Product</h1>
      </div>
      <div className="w-full flex gap-4">
        <div className="w-2/5 flex-none relative bg-white p-5 rounded-md">
          <div className="w-full relative aspect-square rounded overflow-hidden">
            <Image
              src={dataDetail?.image ?? "/images/liquid8.png"}
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex flex-col text-base text-gray-700 px-10 py-7 rounded-md shadow bg-white w-full gap-6 relative">
          <div className="w-full flex justify-between items-center border-b border-gray-500 pb-5">
            <div className="flex items-center gap-2">
              <div className="size-9 flex items-center justify-center rounded-full bg-sky-100 text-black">
                <ScanBarcode className="size-5" />
              </div>
              <h3 className="text-2xl font-semibold text-black">
                {dataDetail?.old_barcode_product}
              </h3>
            </div>
            <Badge className="bg-sky-100 hover:bg-sky-100 border border-sky-500 text-black py-0.5 gap-1 rounded-full shadow-none mt-1">
              {parseFloat(dataDetail?.product_price) > 100000 ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
              <p>100K</p>
            </Badge>
          </div>
          <div className="flex flex-col gap-6 pl-3 h-full">
            <div className="border-l-2 border-gray-300 pl-3">
              <p>Product Name</p>
              <h3 className="text-black font-semibold text-base">
                {dataDetail?.product_name}
              </h3>
            </div>
            <div className="flex w-full gap-4">
              <div className="border-l-2 border-gray-300 pl-3 w-full">
                <p>Old Price</p>
                <h3 className="text-black font-semibold text-base">
                  {formatRupiah(parseFloat(dataDetail?.product_price))}
                </h3>
              </div>
              <div className="border-l-2 border-gray-300 pl-3 w-full">
                <p>New Price</p>
                <h3 className="text-black font-semibold text-base">
                  {parseFloat(dataDetail?.product_price) > 100000
                    ? formatRupiah(
                        parseFloat(dataDetail?.product_price) -
                          (parseFloat(dataDetail?.product_price) / 100) *
                            metaData.discount
                      )
                    : formatRupiah(parseFloat(tagColor.fixed_price_color))}
                </h3>
              </div>
            </div>
            {parseFloat(dataDetail?.product_price) < 100000 && (
              <div className="border-l-2 border-gray-300 pl-3 w-full">
                <p>Tag Color</p>
                <div className="flex w-1/2 gap-2 items-center cursor-default">
                  <div
                    className="size-4 rounded-full border border-black"
                    style={{ background: tagColor?.hexa_code_color }}
                  />
                  <p className="text-black font-semibold">
                    {tagColor.name_color}
                  </p>
                </div>
              </div>
            )}
            <div className="border-l-2 border-gray-300 pl-3 flex flex-col gap-1 pb-1">
              <p>Qty</p>
              <div className="relative flex items-center w-1/2 text-black">
                <Input
                  value={metaData.qty}
                  onChange={(e) =>
                    setMetaData((prev) => ({
                      ...prev,
                      qty: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                  className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                />
                <div className="flex absolute right-2 gap-1">
                  <button
                    onClick={() =>
                      setMetaData((prev) => ({
                        ...prev,
                        qty: (parseFloat(prev.qty) - 1).toString(),
                      }))
                    }
                    disabled={parseFloat(metaData.qty) === 0}
                    className="w-6 h-6 flex items-center justify-center rounded bg-sky-100 hover:bg-sky-200 disabled:hover:bg-sky-100 disabled:opacity-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() =>
                      setMetaData((prev) => ({
                        ...prev,
                        qty: (parseFloat(prev.qty) + 1).toString(),
                      }))
                    }
                    className="w-6 h-6 flex items-center justify-center rounded bg-sky-100 hover:bg-sky-200"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center">
        <Tabs defaultValue="good" className="w-full">
          <div className="w-full flex justify-center">
            <TabsList className="bg-sky-100">
              <TabsTrigger className="w-32" value="good">
                Good
              </TabsTrigger>
              <TabsTrigger className="w-32" value="damaged">
                Damaged
              </TabsTrigger>
              <TabsTrigger className="w-32" value="abnormal">
                Abnormal
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="good">
            <form
              onSubmit={(e) => handleSubmit(e, "lolos")}
              className="w-full space-y-6 mt-6"
            >
              {parseFloat(dataDetail?.product_price) >= 100000 && (
                <div className="w-full flex flex-col gap-3">
                  <RadioGroup
                    onValueChange={(e) => {
                      const selectedCategory = categories?.find(
                        (item) => item.name_category === e
                      );
                      setMetaData((prev) => ({
                        ...prev,
                        name: selectedCategory?.name_category ?? "",
                        discount: parseFloat(
                          selectedCategory?.discount_category ?? "0"
                        ),
                      }));
                    }}
                    className="grid grid-cols-4 w-full gap-6"
                  >
                    {categories?.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-4 w-full border px-4 py-2.5 rounded-md",
                          metaData.name === item.name_category
                            ? "border-gray-500 bg-sky-100"
                            : "border-gray-300"
                        )}
                      >
                        <RadioGroupItem
                          value={item.name_category}
                          id={item.id}
                          className="flex-none"
                        />
                        <Label
                          htmlFor={item.id}
                          className="flex flex-col gap-1.5 w-full"
                        >
                          <p
                            className={cn(
                              "font-bold border-b pb-1.5",
                              metaData.name === item.name_category
                                ? "border-gray-500"
                                : "border-gray-300"
                            )}
                          >
                            {item.name_category}
                          </p>
                          <p className="text-xs font-light flex items-center gap-1">
                            <span>{item.discount_category}%</span>
                            <span>-</span>
                            <span>
                              Max.{" "}
                              {formatRupiah(
                                parseFloat(item.max_price_category)
                              )}
                            </span>
                          </p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                disabled={
                  (!metaData.name &&
                    parseFloat(dataDetail?.product_price) > 100000) ||
                  parseFloat(metaData.qty) === 0
                }
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="damaged">
            <form
              onSubmit={(e) => handleSubmit(e, "damaged")}
              className="w-full space-y-6 mt-6"
            >
              <Label>Description:</Label>
              <Textarea
                rows={6}
                className="border-sky-400/80 focus-visible:ring-sky-400"
                value={metaData.damaged}
                onChange={(e) =>
                  setMetaData((prev) => ({
                    ...prev,
                    damaged: e.target.value,
                  }))
                }
              />
              <Button
                type="submit"
                className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                disabled={!metaData.damaged || parseFloat(metaData.qty) === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="abnormal">
            <form
              onSubmit={(e) => handleSubmit(e, "abnormal")}
              className="w-full space-y-6 mt-6"
            >
              <Label>Description:</Label>
              <Textarea
                rows={6}
                className="border-sky-400/80 focus-visible:ring-sky-400"
                value={metaData.abnormal}
                onChange={(e) =>
                  setMetaData((prev) => ({
                    ...prev,
                    abnormal: e.target.value,
                  }))
                }
              />
              <Button
                type="submit"
                className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                disabled={!metaData.abnormal || parseFloat(metaData.qty) === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog
        open={barcodeOpen}
        onOpenChange={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
            setMetaBarcode({
              barcode: "",
              category: "",
              newPrice: "",
              oldPrice: "",
            });
            router.push("/inbound/check-product/scan-result");
          } else {
            setBarcodeOpen(true);
          }
        }}
      >
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle>Barcode Printered</DialogTitle>
          </DialogHeader>
          <BarcodePrinted
            oldPrice={oldPrice ?? "0"}
            barcode={barcode ?? ""}
            category={category ?? ""}
            newPrice={newPrice ?? "0"}
            cancel={() => {
              setBarcodeOpen(false);
              setMetaBarcode({
                barcode: "",
                category: "",
                newPrice: "",
                oldPrice: "",
              });
              router.push("/inbound/check-product/scan-result");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
