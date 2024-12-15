"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
  MapPinned,
  Minus,
  Palette,
  Plus,
  PlusCircle,
  ReceiptText,
  Send,
  Triangle,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetListColorMigrate } from "../_api/use-get-list-color-migrate-color";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetListDestinationMigrateColor } from "../_api/use-get-list-list-destination-migrate-color";
import { useAddFilterCreateQCD } from "../_api/use-add-filter-create-qcd";
import { useSubmitQCD } from "../_api/use-submit-qcd";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export const Client = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [input, setInput] = useState({
    destination: "",
    color: "",
    count: 0,
    qty: "0",
  });

  const { mutate: mutateAddFilter, isPending: isPendingAddFilter } =
    useAddFilterCreateQCD();
  const {
    // mutate: mutateSubmit,
    isPending: isPendingDoneCheckAll,
  } = useSubmitQCD();

  const {
    data,
    // refetch,
    // isLoading,
    // isRefetching,
    // isPending,
    error,
    isError,
    // isSuccess,
  } = useGetListColorMigrate();

  const {
    data: dataDestination,
    // refetch: refetchFiltered,
    // isSuccess: isSuccessFiltered,
  } = useGetListDestinationMigrateColor();

  const dataList: any = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListDestination: any[] = useMemo(() => {
    return dataDestination?.data.data.resource.data;
  }, [dataDestination]);

  // const loading = isLoading || isRefetching || isPending;

  const handleAddFilter = (id: any) => {
    mutateAddFilter({ id });
  };

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   const body = {};
  //   mutateSubmit({ body });
  // };

  // autoFill 0
  useEffect(() => {
    // if (isNaN(parseFloat(input.custom))) {
    //   setInput((prev) => ({ ...prev, custom: "0" }));
    // }
  }, [input]);

  const columnColorMigrate: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "code_document_migrate",
      header: "Barcode",
    },
    {
      accessorKey: "product_color",
      header: "Color",
    },
    {
      accessorKey: "product_total",
      header: () => <div className="text-center">Total</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.product_total.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_price_product||old_price_product",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Badge className="bg-gray-300 hover:bg-gray-300 text-black capitalize rounded">
            {row.original.status_migrate}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingAddFilter || isPendingDoneCheckAll}
              onClick={(e) => {
                e.preventDefault();
                handleAddFilter(row.original.id);
              }}
            >
              {isPendingAddFilter ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

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

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/migrate-color/list">
              Migrate Color
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full px-5 py-3 rounded bg-red-300 flex items-center">
        <AlertCircle className="size-4 mr-1" />
        <p>Nunggu api select</p>
      </div>
      <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
        <Link href="/outbond/migrate-color/list">
          <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Create Migrate</h1>
      </div>
      <div className="grid grid-cols-5 gap-4 w-full">
        <div className="col-span-2 bg-white px-5 py-3 rounded-md shadow w-full flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-gray-500 border-b">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center bg-sky-100 shadow">
                <MapPinned className="size-4" />
              </div>
              <h5 className="font-bold">Destination</h5>
            </div>
            <Button className="" variant={"liquid"}>
              <Send className="size-3 mr-1" />
              Submit
            </Button>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-transparent h-10 text-base hover:bg-transparent text-black shadow-none justify-between group">
                Not Selected
                <div className="size-9 flex items-center justify-center rounded-full group-hover:bg-sky-100">
                  <ArrowLeftRight className="size-4" />
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="p-3">
              <DialogHeader>
                <DialogTitle>Select Destination</DialogTitle>
              </DialogHeader>
              <Command>
                <CommandInput placeholder="Search destination..." />
                <CommandList>
                  <CommandEmpty>No Destination yet.</CommandEmpty>
                  <CommandGroup>
                    {dataListDestination?.map((item) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => {
                          setInput((prev) => ({
                            ...prev,
                            destination: item.shop_name,
                          }));
                          setIsOpen(false);
                        }}
                        className="py-2.5 px-3 capitalize"
                      >
                        <CheckCircle2
                          className={cn(
                            "fill-black stroke-white mr-2 w-5 h-5",
                            input.destination === item.shop_name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {item.shop_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </DialogContent>
          </Dialog>
        </div>
        <div className="col-span-3 bg-white px-5 py-3 rounded-md shadow w-full">
          <div className="flex items-center justify-between pb-3 mb-3 border-gray-500 border-b">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center bg-sky-100 shadow">
                <Palette className="size-4" />
              </div>
              <h5 className="font-bold">Color Product</h5>
            </div>
            <Button className="" variant={"liquid"}>
              <PlusCircle className="size-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="flex w-full items-center px-5 gap-4">
            <Button className="w-full bg-transparent h-10 text-base hover:bg-transparent text-black shadow-none justify-between group px-0">
              Not Selected
              <div className="size-9 flex items-center justify-center rounded-full group-hover:bg-sky-100">
                <ArrowLeftRight className="size-4" />
              </div>
            </Button>
            <div className="flex items-center flex-none">
              <div className="flex h-10 relative items-center justify-center">
                <Triangle className="rotate-90 size-3 absolute mx-auto my-auto mt-0.5 fill-gray-500 stroke-none" />
                <div className="h-5 border-t-2 border-gray-500 w-5 mt-auto" />
              </div>
              <div className="size-9 flex items-center justify-center rounded-full border-gray-500 border-2">
                <Truck className="size-4" />
              </div>
              <div className="flex h-10 relative items-center justify-center">
                <Triangle className="rotate-90 size-3 absolute mx-auto my-auto mt-0.5 fill-gray-500 stroke-none" />
                <div className="h-5 border-t-2 border-gray-500 w-5 mt-auto" />
              </div>
            </div>
            <div className="w-2/6 flex-none flex relative items-center justify-center">
              <Input
                type="number"
                className="border-none focus-visible:ring-0 shadow-none placeholder:text-gray-500 px-0"
                placeholder="Total to be sent..."
              />
              <div className="flex items-center absolute right-0">
                <Button className="bg-transparent p-0 size-9 rounded-full shadow-none hover:bg-sky-100 text-black">
                  <Minus className="size-4" />
                </Button>
                <Button className="bg-transparent p-0 size-9 rounded-full shadow-none hover:bg-sky-100 text-black">
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <div className="flex flex-col w-full gap-4">
          <h3 className="border-b border-gray-500 pr-10 pb-1 w-fit font-semibold">
            List Color Filtered
          </h3>
          <DataTable
            columns={columnColorMigrate}
            data={dataList?.migrates ?? []}
          />
        </div>
      </div>
    </div>
  );
};
