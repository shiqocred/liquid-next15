import { ColumnDef } from "@tanstack/react-table";
import { Edit3, Loader2, ReceiptText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

interface ColumnListDataProps {
  metaPage: { from: number };
  loadingDetail: boolean;
  setFormatId: (value: string) => Promise<URLSearchParams>;
  setOpenDialog: (value: string) => Promise<URLSearchParams>;
  handleDelete: (id: any) => Promise<void>;
}

interface ActionButtonProps {
  tooltip: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: "yellow" | "sky" | "red";
  loading: boolean;
}

const ActionButton = ({
  tooltip,
  icon,
  onClick,
  color,
  loading,
}: ActionButtonProps) => {
  const colorMap = {
    yellow:
      "border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:hover:bg-yellow-50",
    sky: "border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:hover:bg-sky-50",
    red: "border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:hover:bg-red-50",
  };

  return (
    <TooltipProviderPage value={<p>{tooltip}</p>}>
      <Button
        className={`items-center w-9 px-0 flex-none h-9 ${colorMap[color]} disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed`}
        variant="outline"
        disabled={loading}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      </Button>
    </TooltipProviderPage>
  );
};

export const columnListDetail: ColumnDef<any>[] = [
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
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "scan_today",
    header: () => <div className="text-center">Scan Today</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.scan_today?.toLocaleString() ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "scan_date",
    header: "Date",
  },
];

// column data
export const columnListData = ({
  metaPage,
  loadingDetail,
  setFormatId,
  setOpenDialog,
  handleDelete,
}: ColumnListDataProps): ColumnDef<any>[] => [
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
    accessorKey: "format",
    header: "Format",
  },
  {
    accessorKey: "total_user",
    header: () => <div className="text-center">Total User</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.total_user?.toLocaleString() ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "total_scan",
    header: () => <div className="text-center">Total Scan</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.total_scan?.toLocaleString() ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ActionButton
          tooltip={"Edit"}
          icon={<Edit3 className="w-4 h-4" />}
          onClick={() => {
            setFormatId(row.original.id);
            setOpenDialog("edit");
          }}
          color={"yellow"}
          loading={loadingDetail}
        />
        <ActionButton
          tooltip={"Detail"}
          icon={<ReceiptText className="w-4 h-4" />}
          onClick={() => {
            setFormatId(row.original.id);
            setOpenDialog("detail");
          }}
          color={"sky"}
          loading={loadingDetail}
        />
        <ActionButton
          tooltip={"Delete"}
          icon={<Trash2 className="w-4 h-4" />}
          onClick={() => handleDelete(row.original.id)}
          color={"red"}
          loading={loadingDetail}
        />
      </div>
    ),
  },
];
