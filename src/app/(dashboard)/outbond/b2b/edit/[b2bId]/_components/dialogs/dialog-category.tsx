"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import React, { FormEvent, useEffect, useState } from "react";

export const DialogCategory = ({
  open,
  onOpenChange,
  data,
  setData,
  categories = [],
}: {
  open: boolean;
  onOpenChange: () => void;
  data: any;
  setData: any;
  categories?: any[];
}) => {
  const [input, setInput] = useState<string[]>([]);

  const handleApply = (e: FormEvent) => {
    e.preventDefault();
    setData((prev: any) => ({
      ...prev,
      category_bulky: input.join(","),
    }));
    onOpenChange();
  };

  useEffect(() => {
    if (open) {
      if (Array.isArray(data.category_bulky)) {
        setInput(data.category_bulky);
      } else if (
        typeof data.category_bulky === "string" &&
        data.category_bulky
      ) {
        setInput(data.category_bulky.split(","));
      } else {
        setInput([]);
      }
    } else {
      setInput([]);
    }
  }, [open, data]);

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Category B2B</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <form onSubmit={handleApply} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1 w-full relative">
              <Label>Category</Label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border rounded p-2 bg-white">
                {categories.map((cat: any) => {
                  const categoryName = String(cat.name_category ?? cat);
                  return (
                    <label
                      key={categoryName}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="checkbox"
                        checked={input.includes(categoryName)}
                        onChange={(e) => {
                          setInput((prev) =>
                            e.target.checked
                              ? [...prev, categoryName]
                              : prev.filter((c) => c !== categoryName)
                          );
                        }}
                      />
                      {categoryName}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant={"outline"}
                className="border-black w-full"
                onClick={onOpenChange}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="bg-sky-400 hover:bg-sky-400/80 text-black w-full"
                type="submit"
              >
                Apply
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
