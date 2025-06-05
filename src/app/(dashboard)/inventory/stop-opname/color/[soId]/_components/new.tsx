"use client";

import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { numericString } from "@/lib/utils";
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
  const [items, setItems] = useState<ItemsProps[]>([]);

  const { mutate: mutateSubmit, isPending: isPendingSubmit } =
    useSubmitSOColor();
  const { data: dataColor, isPending, isSuccess } = useGetListColorSOColor();

  const loading = isPendingSubmit || isPending;

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
    if (dataColor && isSuccess) {
      const list: any[] = dataColor.data.data.resource;
      const listDataRes: any[] = listData ?? [];
      const summaryState = listDataRes.map((item: any) => ({
        name_color: item.color,
        total_all: item.total_color ?? "0",
        product_damaged: item.product_damaged ?? "0",
        product_abnormal: item.product_abnormal ?? "0",
        lost: item.product_lost ?? "0",
        addition: item.product_addition ?? "0",
      }));
      const summarizedNames = new Set(
        listDataRes.map((item: any) => item.color)
      );
      const missingColors = list
        .filter((c) => !summarizedNames.has(c.name_color))
        .map((c) => ({
          name_color: c.name_color,
          total_all: "0",
          product_damaged: "0",
          product_abnormal: "0",
          lost: "0",
          addition: "0",
        }));
      const finalState = [...summaryState, ...missingColors];
      setItems(finalState);
    }
  }, [dataColor, isSuccess, listData]);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted) return <Loading />;
  return (
    <div className="flex flex-col gap-4 w-full">
      <Accordion type="multiple" className="flex flex-col gap-4">
        {items.map((item, idx) => (
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="w-full flex items-center gap-4">
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
