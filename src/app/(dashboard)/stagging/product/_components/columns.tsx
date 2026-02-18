import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Drill,
  Loader2,
  LucideIcon,
  PlusCircle,
  ReceiptText,
  XCircle,
} from "lucide-react";
import { MouseEvent } from "react";

const ButtonAction = ({
  isLoading,
  label,
  onClick,
  type,
  icon: Icon,
}: {
  isLoading: boolean;
  label: string;
  onClick: (e: MouseEvent) => void;
  type: "red" | "yellow" | "sky";
  icon: LucideIcon;
}) => {
  const colorMap = {
    red: "border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:hover:bg-red-50",
    yellow:
      "border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:hover:bg-yellow-50",
    sky: "border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:hover:bg-sky-50",
  };

  return (
    <TooltipProviderPage value={label}>
      <Button
        className={cn(
          "items-center p-0 w-9 disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed",
          colorMap[type]
        )}
        disabled={isLoading}
        variant={"outline"}
        type="button"
        onClick={onClick}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </Button>
    </TooltipProviderPage>
  );
};

export const columnProductStaging = ({
  metaPage,
  isLoading,
  handleAddFilter,
  setProductId,
  setIsOpen,
}: any): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "new_barcode_product||old_barcode_product",
    header: "Barcode",
    cell: ({ row }) =>
      row.original.new_barcode_product ??
      row.original.old_barcode_product ??
      "-",
  },
  {
    accessorKey: "new_name_product",
    header: () => <div className="text-center">Product Name</div>,
    cell: ({ row }) => (
      <div className="max-w-[300px] break-all">
        {row.original.new_name_product}
      </div>
    ),
  },
  {
    accessorKey: "new_category_product||new_tag_product",
    header: "Category",
    cell: ({ row }) =>
      row.original.new_category_product ?? row.original.new_tag_product ?? "-",
  },
  {
    accessorKey: "new_price_product||old_price_product",
    header: "Price",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {formatRupiah(
          row.original.new_price_product ?? row.original.old_price_product
        )}
      </div>
    ),
  },
  {
    accessorKey: "new_date_in_product",
    header: "Input Date",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {format(new Date(row.original.new_date_in_product), "iii, dd MMM yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "new_status_product",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.new_status_product;
      return (
        <Badge
          className={cn(
            "shadow-none font-normal rounded-full capitalize text-black",
            status === "display" && "bg-green-400/80 hover:bg-green-400/80",
            status === "expired" && "bg-red-400/80 hover:bg-red-400/80",
            status === "slow_moving" &&
              "bg-yellow-400/80 hover:bg-yellow-400/80"
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ButtonAction
          icon={PlusCircle}
          isLoading={isLoading}
          type="sky"
          onClick={(e) => {
            e.preventDefault();
            handleAddFilter(row.original.id);
          }}
          label="Add to Filter"
        />
        <ButtonAction
          icon={ReceiptText}
          isLoading={isLoading}
          type="yellow"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen("detail");
            setProductId(row.original.id);
          }}
          label="Detail"
        />
        <ButtonAction
          icon={Drill}
          isLoading={isLoading}
          type="red"
          onClick={(e) => {
            e.preventDefault();
            setProductId(row.original.id);
            setIsOpen("lpr");
          }}
          label="To LPR"
        />
      </div>
    ),
  },
];

export const columnFilteredProductStaging = ({
  metaPage,
  isLoading,
  handleRemoveFilter,
}: any): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "new_barcode_product||old_barcode_product",
    header: "Barcode",
    cell: ({ row }) =>
      row.original.new_barcode_product ??
      row.original.old_barcode_product ??
      "-",
  },
  {
    accessorKey: "new_name_product",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.new_name_product}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ButtonAction
          label="Delete"
          onClick={(e) => {
            e.preventDefault();
            handleRemoveFilter(row.original.id);
          }}
          isLoading={isLoading}
          icon={XCircle}
          type="red"
        />
      </div>
    ),
  },
];
