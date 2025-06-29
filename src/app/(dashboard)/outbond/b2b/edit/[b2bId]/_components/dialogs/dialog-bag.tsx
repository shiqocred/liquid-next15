"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import React, { FormEvent, useEffect, useState } from "react";

export const DialogBag = ({
  open,
  onOpenChange,
  data,
  setData,
  handleSubmit,
  categories,
}: {
  open: boolean;
  onOpenChange: () => void;
  data: any;
  setData: any;
  handleSubmit: (input: { name: string; category: string }) => void;
  categories: string[];
}) => {
  const [input, setInput] = useState({ name: "", category: [] as string[] });

  const handleApply = (e: FormEvent) => {
    e.preventDefault();
    setData((prev: any) => ({
      ...prev,
      name_bag: input.name,
      category_bag: input.category.join(","), // <-- jadi string
    }));
    handleSubmit({
      name: input.name,
      category: input.category.join(","), // <-- jadi string
    });
  };

  useEffect(() => {
    if (open) {
      setInput({
        name: data?.name_bag || "",
        category: Array.isArray(data?.category_bag)
          ? data.category_bag
          : data?.category_bag
          ? [data.category_bag]
          : [],
      });
    } else {
      setInput({ name: "", category: [] });
    }
  }, [open, data]);

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bag</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <form onSubmit={handleApply} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1 w-full relative">
              <Label>Name</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="Type bag name"
                value={input.name}
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-4 w-full relative">
              <Label>Category</Label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border rounded p-2 bg-white">
                {categories.map((cat: any) => {
                  const categoryName = String(cat.name_category ?? cat); // pastikan string
                  return (
                    <label
                      key={categoryName}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="checkbox"
                        checked={input.category.includes(categoryName)}
                        onChange={(e) => {
                          setInput((prev) => ({
                            ...prev,
                            category: e.target.checked
                              ? [...prev.category, categoryName]
                              : prev.category.filter((c) => c !== categoryName),
                          }));
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
                disabled={!input.name || !input.category}
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
