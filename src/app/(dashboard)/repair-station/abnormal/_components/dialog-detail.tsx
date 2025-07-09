"use client";

import BarcodePrinted from "@/components/barcode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatRupiah } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  Circle,
  Loader,
  Minus,
  Palette,
  Plus,
  X,
} from "lucide-react";
import React, { useEffect } from "react";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import {
  PopoverPortal,
  PopoverPortalContent,
  PopoverPortalTrigger,
} from "@/components/ui/popover-portal";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetPriceProductPA } from "../_api/use-get-price-product-pa";

const DialogDetail = ({
  open,
  handleClose,
  isLoading,
  isSubmit,
  data,
  dataColor,
  input,
  setInput,
  categories,
  handleSubmit,
}: {
  open: boolean;
  handleClose: any;
  isLoading: boolean;
  isSubmit: boolean;
  data: any;
  dataColor: any;
  input: any;
  setInput: any;
  categories: any;
  handleSubmit: any;
}) => {
  const [isOpenCategory, setIsOpenCategory] = React.useState(false);
  const findNotNull = (v: any) => {
    if (v) {
      const qualityObject = JSON.parse(v);

      const filteredEntries = Object.entries(qualityObject).find(
        ([, value]) => value !== null
      );

      return filteredEntries?.[0] ?? "";
    }
  };

  const priceValue = useDebounce(input.oldPrice, 500);
  const { data: dataPrice } = useGetPriceProductPA({
    price: priceValue,
  });

  const color = dataPrice?.data?.data?.resource?.warna;
  const isColorPrice = !!color;

  useEffect(() => {
    if (isColorPrice && color?.name_color) {
      setInput((prev: any) => ({
        ...prev,
        new_tag_product: color.name_color,
        category: null,
        price: color.fixed_price_color?.toString() ?? "",
      }));
    } else {
      setInput((prev: any) => ({
        ...prev,
        new_tag_product: "",
      }));
    }
  }, [isColorPrice, color, setInput]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-6xl"
        onClose={false}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            <div className="flex items-center gap-4">
              To Display Product
              {!isLoading && (
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "border rounded-full",
                      findNotNull(data?.new_quality) === "damaged" &&
                        "bg-red-200 hover:bg-red-200 border-red-700 text-red-700",
                      findNotNull(data?.new_quality) === "abnormal" &&
                        "bg-orange-200 hover:bg-orange-200 border-orange-700 text-orange-700"
                    )}
                  >
                    {findNotNull(data?.new_quality)}
                  </Badge>
                  <ArrowRight className="size-4" />
                  <Badge
                    className={cn(
                      "border rounded-full bg-green-200 hover:bg-green-200 border-green-700 text-green-700"
                    )}
                  >
                    lolos
                  </Badge>
                </div>
              )}
            </div>
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => handleClose()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
        </DialogHeader>
        {isLoading || isSubmit ? (
          <div className="w-full h-[408px] flex items-center justify-center flex-col gap-3">
            <Loader className="size-6 animate-spin" />
            <p className="text-sm ml-1">
              {isLoading ? "Getting Data..." : "Submiting..."}
            </p>
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex flex-col gap-3 w-full"
            >
              <div className="flex gap-3">
                <div className="w-full h-full p-3 gap-3 rounded-md border border-sky-400 flex flex-col">
                  <div className="items-center flex justify-center h-9 rounded w-full bg-sky-100 font-semibold">
                    Old Data
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col  w-full  gap-1">
                      <Label
                        htmlFor="barcodeOld"
                        className="text-xs font-semibold"
                      >
                        Barcode
                      </Label>
                      <Input
                        id="barcodeOld"
                        className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent disabled:opacity-100 disabled:cursor-default"
                        value={input.oldBarcode}
                        disabled
                        placeholder="Custom Barcode..."
                      />
                    </div>
                    <div className="flex flex-col  w-full  gap-1">
                      <Label
                        htmlFor="nameOld"
                        className="text-xs font-semibold"
                      >
                        Name Product
                      </Label>
                      <Input
                        id="nameOld"
                        className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent disabled:opacity-100 disabled:cursor-default"
                        value={input.oldName}
                        disabled
                        placeholder="Custom Barcode..."
                      />
                    </div>
                    <div className="flex flex-col w-full gap-1">
                      <Label className="text-xs font-semibold">Qty</Label>
                      <div className="relative flex items-center">
                        <Input
                          value={input.oldQty}
                          disabled
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent  disabled:opacity-100 disabled:cursor-default"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col w-full  gap-1">
                      <Label
                        htmlFor="priceOld"
                        className="text-xs font-semibold"
                      >
                        Price
                      </Label>
                      <div className="w-full relative flex items-center">
                        <Input
                          id="priceOld"
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                          value={
                            isNaN(parseFloat(input.oldPrice))
                              ? "0"
                              : String(Math.round(parseFloat(input.oldPrice)))
                          }
                          onChange={(e) =>
                            setInput((prev: any) => ({
                              ...prev,
                              oldPrice: e.target.value.startsWith("0")
                                ? e.target.value.replace(/^0+/, "")
                                : e.target.value,
                            }))
                          }
                          placeholder="Custom Price..."
                        />
                        <p className="absolute right-3 text-xs text-gray-500">
                          {formatRupiah(parseFloat(input.oldPrice))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-full p-3 gap-3 rounded-md border border-sky-400 flex flex-col">
                  <div className="items-center flex justify-center h-9 rounded w-full bg-sky-100 font-semibold">
                    New Data
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col  w-full  gap-1">
                      <Label
                        htmlFor="barcodeOld"
                        className="text-xs font-semibold"
                      >
                        Barcode
                      </Label>
                      <Input
                        id="barcodeOld"
                        className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent disabled:opacity-100 disabled:cursor-default"
                        value={input.barcode}
                        disabled
                        placeholder="Custom Barcode..."
                      />
                    </div>
                    <div className="flex flex-col  w-full  gap-1">
                      <Label
                        htmlFor="nameNew"
                        className="text-xs font-semibold"
                      >
                        Name Product
                      </Label>
                      <Input
                        id="nameNew"
                        className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                        value={input.name}
                        onChange={(e) =>
                          setInput((prev: any) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Custom Barcode..."
                      />
                    </div>
                    <div className="w-full flex-none  flex gap-2 ">
                      <div className="flex flex-col w-full  gap-1">
                        <Label
                          htmlFor="priceNew"
                          className="text-xs font-semibold"
                        >
                          Price
                        </Label>
                        <Input
                          id="priceNew"
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                          value={
                            isColorPrice
                              ? color?.fixed_price_color ?? ""
                              : isNaN(parseFloat(input.price))
                              ? ""
                              : String(Math.round(parseFloat(input.price)))
                          }
                          onChange={(e) =>
                            !isColorPrice &&
                            setInput((prev: any) => ({
                              ...prev,
                              price: e.target.value.startsWith("0")
                                ? e.target.value.replace(/^0+/, "")
                                : e.target.value,
                            }))
                          }
                          disabled={isColorPrice}
                          placeholder="Custom Barcode..."
                        />
                      </div>
                      <div className="flex flex-col w-full gap-1">
                        <Label className="text-xs font-semibold">Qty</Label>
                        <div className="relative flex items-center">
                          <Input
                            value={input.qty}
                            onChange={(e) =>
                              setInput((prev: any) => ({
                                ...prev,
                                qty: e.target.value.startsWith("0")
                                  ? e.target.value.replace(/^0+/, "")
                                  : e.target.value,
                              }))
                            }
                            className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent  disabled:opacity-100 disabled:cursor-default"
                          />
                          <div className="flex absolute right-2 gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setInput((prev: any) => ({
                                  ...prev,
                                  qty: (parseFloat(prev.qty) - 1).toString(),
                                }))
                              }
                              disabled={parseFloat(input.qty) === 0}
                              className="w-6 h-6 flex items-center justify-center rounded bg-sky-100 hover:bg-sky-200 disabled:hover:bg-sky-100 disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setInput((prev: any) => ({
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
                    <div className="flex flex-col gap-1 ">
                      <Label className="text-xs font-semibold">Category</Label>
                      <PopoverPortal
                        open={!isColorPrice && isOpenCategory}
                        onOpenChange={setIsOpenCategory}
                      >
                        <PopoverPortalTrigger asChild>
                          <Button
                            type="button"
                            disabled={isColorPrice}
                            className="border-0 border-b  rounded-none justify-between border-sky-400/80 focus:border-sky-400 focus-visible:ring-transparent focus:ring-1 hover:bg-sky-50 focus:bg-sky-50 shadow-none"
                            variant={"outline"}
                          >
                            <p>
                              {isColorPrice ? (
                                <span className="italic underline">
                                  No Category (color)
                                </span>
                              ) : (
                                input.category ??
                                data?.new_category_product ?? (
                                  <span className="italic underline">
                                    No Category yet.
                                  </span>
                                )
                              )}
                            </p>
                            <ChevronDown />
                          </Button>
                        </PopoverPortalTrigger>
                        <PopoverPortalContent
                          className="p-0"
                          style={{
                            width: "var(--radix-popover-trigger-width)",
                          }}
                        >
                          <Command>
                            <CommandInput />
                            <CommandList className="p-1">
                              <CommandGroup>
                                <CommandEmpty>No Data Found.</CommandEmpty>
                                {categories.map((item: any) => (
                                  <CommandItem
                                    key={item.id}
                                    className={cn(
                                      "my-2 first:mt-0 last:mb-0 flex gap-2 items-center border",
                                      input.category === item.name_category
                                        ? "border-gray-500"
                                        : "border-gray-300"
                                    )}
                                    onSelect={() => {
                                      const discount = parseFloat(
                                        item?.discount_category ?? "0"
                                      );
                                      const maxPrice = parseFloat(
                                        item?.max_price_category ?? "0"
                                      );
                                      const oldPrice = parseFloat(
                                        input.oldPrice
                                      );

                                      let calculatedPrice =
                                        oldPrice - (oldPrice * discount) / 100;

                                      if (calculatedPrice > maxPrice) {
                                        calculatedPrice = oldPrice - maxPrice;
                                      }

                                      setInput((prev: any) => ({
                                        ...prev,
                                        category: item?.name_category ?? "",
                                        price:
                                          Math.round(
                                            calculatedPrice
                                          ).toString(),
                                      }));
                                      setIsOpenCategory(false);
                                    }}
                                  >
                                    <div className="size-4 rounded-full border border-gray-500 flex-none flex items-center justify-center">
                                      {input.category ===
                                        item.name_category && (
                                        <Circle className="fill-black !size-2.5" />
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <p
                                        className={cn(
                                          "font-bold border-b pb-1.5 whitespace-nowrap text-ellipsis overflow-hidden w-full",
                                          input.category === item.name_category
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
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverPortalContent>
                      </PopoverPortal>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                disabled={
                  !input.name ||
                  parseFloat(input.qty) === 0 ||
                  (input.oldPrice >= 100000 && !input.category)
                }
                className="bg-sky-400/80 hover:bg-sky-400 text-black"
                type="submit"
              >
                To Display
              </Button>
            </form>
            <div className="w-fit flex flex-none flex-col gap-4">
              {!dataColor ? (
                <BarcodePrinted
                  barcode={input.oldBarcode}
                  newPrice={input.price}
                  oldPrice={input.oldPrice}
                  category={isColorPrice ? color?.name_color : input.category}
                />
              ) : (
                <div className="w-auto">
                  <div className="w-[282px] p-3 flex flex-col gap-3 border border-gray-300 rounded text-sm">
                    <div className="flex items-center text-sm font-semibold border-b border-gray-300 pb-2">
                      <Palette className="w-4 h-4 mr-2" />
                      <p>Color</p>
                    </div>
                    <div className="flex items-center gap-2 pl-5">
                      <span
                        style={{ background: dataColor?.hexa_code_color }}
                        className="size-4 rounded-full border border-gray-500"
                      />
                      <p>{dataColor?.name_color}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogDetail;
