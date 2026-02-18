import { Button } from "@/components/ui/button";
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, LucideIcon, XCircle } from "lucide-react";
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

export const columnFilteredToBulky = ({
  isLoading,
  handleRemoveFilter,
}: any): ColumnDef<any>[] => [
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
    accessorKey: "palet_barcod",
    header: "Barcode",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.palet_barcode}
      </div>
    ),
  },
  {
    accessorKey: "name_palet",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.name_palet}
      </div>
    ),
  },
    {
    accessorKey: "category_palet",
    header: "Category",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.category_palet}
      </div>
    ),
  },
   {
    accessorKey: "total_product_palet",
    header: "Total Product",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.total_product_palet}
      </div>
    ),
  },
  {
    accessorKey: "total_price_palet",
    header: "Total Price",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {formatRupiah(row.original.total_price_palet)}
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
