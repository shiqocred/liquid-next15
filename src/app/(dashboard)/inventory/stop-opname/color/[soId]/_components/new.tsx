"use client";

import {
  AlertCircle,
  CheckIcon,
  ChevronDown,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { cn, numericString } from "@/lib/utils";
import Loading from "@/app/(dashboard)/loading";

import { useSubmitSOColor } from "../_api/use-submit-so-color";
import { useGetListColorSOColor } from "../_api/use-get-list-color-so-color";
import { useQueryClient } from "@tanstack/react-query";

interface ItemsProps {
  name_color: string;
  total_all: string;
  product_damaged: string;
  product_abnormal: string;
  lost: string;
  addition: string;
}

export const NewSection = ({
  listData,
  soId,
}: {
  listData: any;
  soId: any;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isColor, setIsColor] = useState<boolean>(false);
  const [items, setItems] = useState<ItemsProps[]>([]);
  const [dataItem, setDataItem] = useState<ItemsProps>({
    name_color: "",
    total_all: "0",
    product_damaged: "0",
    product_abnormal: "0",
    lost: "0",
    addition: "0",
  });

  const { mutate: mutateSubmit, isPending: isPendingSubmit } =
    useSubmitSOColor();
  const { data: dataColor, isPending } = useGetListColorSOColor();

  const loading = isPendingSubmit || isPending;

  const listColor: any[] = useMemo(() => {
    return dataColor?.data.data.resource ?? [];
  }, [dataColor]);

  const listColorFiltered: any[] = listColor.filter(
    (res) => !items.some((item) => item.name_color === res.name_color)
  );

  const handleAddItem = () => {
    setItems([...items, dataItem]);
    setDataItem({
      name_color: "",
      total_all: "0",
      product_damaged: "0",
      product_abnormal: "0",
      lost: "0",
      addition: "0",
    });
  };

  const handleRemoveItem = (color: string) => {
    setItems(items.filter((item) => item.name_color !== color));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    relate: string,
    data: string
  ) => {
    setItems((prev) =>
      prev.map((subItem) =>
        subItem.name_color === relate
          ? {
              ...subItem,
              [data]:
                e.target.value === "" ? "0" : numericString(e.target.value),
            }
          : subItem
      )
    );
  };

  const handleSubmit = () => {
    mutateSubmit(
      { body: { colors: items } },
      {
        onSuccess: () => {
          router.push("/inventory/stop-opname/color");
          queryClient.invalidateQueries({
            queryKey: ["detail-so-color", { id: soId }],
          });
        },
      }
    );
  };

  useEffect(() => {
    if (listData.length > 0) {
      const mapped: ItemsProps[] = listData.map((item: any) => ({
        name_color: item.color,
        total_all: String(item.total_color),
        product_damaged: String(item.product_damaged),
        product_abnormal: String(item.product_abnormal),
        lost: String(item.product_lost),
        addition: String(item.product_addition),
      }));

      setItems(mapped);
    }
  }, [listData]);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted) return <Loading />;
  return (
    <div className="flex flex-col gap-4 w-full">
      <Accordion type="multiple" className="flex flex-col gap-4">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <AccordionItem
              key={`${item.name_color}-${idx}`}
              value={`${item.name_color}-${idx}`}
              className="border rounded-lg"
            >
              <AccordionTrigger className="px-5 group hover:no-underline">
                <p className="whitespace-nowrap group-hover:underline font-bold">
                  Color: {item.name_color}
                </p>
                <div className="w-1/2 justify-between flex gap-3 ">
                  <p className="group-data-[state=open]:hidden">
                    Total Item: {item.total_all}
                  </p>
                  <p className="group-data-[state=open]:hidden">
                    Damaged Item: {item.product_damaged}
                  </p>
                  <p className="group-data-[state=open]:hidden">
                    Abnormal Item: {item.product_abnormal}
                  </p>
                  <p className="group-data-[state=open]:hidden">
                    Lost Item: {item.lost}
                  </p>
                  <p className="group-data-[state=open]:hidden">
                    Additional Item: {item.addition}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3 px-5">
                <div className="grid grid-cols-5 gap-3">
                  <div className="flex flex-col gap-1 w-full">
                    <Label>Total Item</Label>
                    <Input
                      type="number"
                      value={item.total_all}
                      onChange={(e) =>
                        handleChange(e, item.name_color, "total_all")
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <Label>Damaged Item</Label>
                    <Input
                      type="number"
                      value={item.product_damaged}
                      onChange={(e) =>
                        handleChange(e, item.name_color, "product_damaged")
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <Label>Abnormal Item</Label>
                    <Input
                      type="number"
                      value={item.product_abnormal}
                      onChange={(e) =>
                        handleChange(e, item.name_color, "product_abnormal")
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <Label>Lost Item</Label>
                    <Input
                      type="number"
                      value={item.lost}
                      onChange={(e) => handleChange(e, item.name_color, "lost")}
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <Label>Additional Item</Label>
                    <Input
                      type="number"
                      value={item.addition}
                      onChange={(e) =>
                        handleChange(e, item.name_color, "addition")
                      }
                    />
                  </div>
                </div>
                <div className="w-full flex justify-end">
                  <Button
                    variant={"destructive"}
                    onClick={() => handleRemoveItem(item.name_color)}
                  >
                    <Trash2Icon />
                    Remove Item
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))
        ) : (
          <div className="p-5 gap-2 bg-yellow-100 border flex items-center w-full text-sm">
            <AlertCircle className="size-5" />
            <p>
              The data is still empty, please add color below so you can enter
              data.
            </p>
          </div>
        )}
      </Accordion>
      <div className="w-full flex items-center gap-4">
        <div className="w-full flex justify-between">
          <Popover open={isColor} onOpenChange={setIsColor}>
            <PopoverTrigger asChild>
              <Button
                disabled={listColorFiltered.length === 0}
                variant={"outline"}
                className="w-full justify-between h-9 rounded-r-none border-r-0"
              >
                {dataItem.name_color
                  ? `Color: ${dataItem.name_color}`
                  : "Select Color"}
                <ChevronDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {listColorFiltered.map((item) => (
                      <CommandItem
                        onSelect={() => {
                          setIsColor(false);
                          setDataItem((subItem) => ({
                            ...subItem,
                            name_color: item.name_color,
                          }));
                        }}
                        key={item.id}
                      >
                        {item.name_color}
                        <CheckIcon
                          className={cn(
                            "size-4 ml-auto",
                            dataItem.name_color === item.name_color
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            disabled={
              !dataItem.name_color || listColorFiltered.length === 0 || loading
            }
            variant={"outline"}
            className="rounded-l-none"
            onClick={handleAddItem}
            type="submit"
          >
            <PlusIcon />
            Add Item
          </Button>
        </div>
        <Button
          disabled={items.length === 0 || loading}
          variant={"liquid"}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
