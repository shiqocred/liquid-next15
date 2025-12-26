import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, FileDown, Loader2, LucideIcon } from "lucide-react";
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
  type: "red" | "yellow" | "sky" | "green";
  icon: LucideIcon;
}) => {
  const colorMap = {
    red: "border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:hover:bg-red-50",
    yellow:
      "border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:hover:bg-yellow-50",
    sky: "border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:hover:bg-sky-50",
    green:
      "border-green-400 text-green-700 hover:text-green-700 hover:bg-green-50 disabled:hover:bg-green-50",
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

export const columnFilteredExportBuyer = ({
  metaPage,
  isLoading,
  handleApproveSpvFilter,
  handleStaffExportFilter,
}: any): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage?.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "month",
    header: "bulan - tahun",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.filter_data?.month} - {row.original.filter_data?.year}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.requester?.name}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.requester?.email}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        <Badge
          className={cn(
            "rounded w-20 px-0 justify-center text-black font-normal capitalize",
            row.original.status.toLowerCase() === "approved"
              ? "bg-green-400 hover:bg-green-400"
              : "bg-yellow-400 hover:bg-yellow-400"
          )}
        >
          {row.original.status}
        </Badge>
      </div>
    ),
  },

  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ButtonAction
          label="Approve"
          onClick={(e) => {
            e.preventDefault();
            handleApproveSpvFilter(row.original.id);
          }}
          isLoading={isLoading}
          icon={CheckCircle}
          type="green"
        />
        <ButtonAction
          label="Download"
          onClick={(e) => {
            e.preventDefault();
            handleStaffExportFilter(row.original.id);
          }}
          isLoading={isLoading}
          icon={FileDown}
          type="sky"
        />
      </div>
    ),
  },
];
