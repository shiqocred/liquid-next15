"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DialogAddItem } from "./dialogs/dialog-add-item";
import { parseAsString, useQueryState } from "nuqs";

export const Client = () => {
  const [dialog, setDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault("")
  );

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DialogAddItem
        open={dialog === "new"}
        onOpenChange={() => {
          if (dialog === "new") {
            setDialog("");
          }
        }}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Stop Opname</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inventory/stop-opname/color">
              Color
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="p-4 bg-white rounded shadow-md flex flex-col gap-4 w-full">
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/outbond/b2b">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Create Stop Opname Color</h1>
        </div>
        <Accordion type="multiple">
          <AccordionItem value="new" defaultChecked>
            <AccordionTrigger>Add New</AccordionTrigger>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
