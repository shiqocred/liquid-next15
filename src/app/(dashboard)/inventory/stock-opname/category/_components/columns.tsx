import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MetaPageProps } from "@/lib/pagination";
import { ColumnDef } from "@tanstack/react-table";
import { ReceiptText } from "lucide-react";
import Link from "next/link";

export const columnsSOCategory = ({
  metaPage,
}: {
  metaPage: MetaPageProps;
}): ColumnDef<any>[] => [
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
    accessorKey: "start_date",
    header: "Period Start",
  },
  {
    accessorKey: "end_date",
    header: "Period End",
    cell: ({ row }) => (row.original.end_date ? row.original.end_date : "-"),
  },
  {
    accessorKey: "type",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.type;
      return (
        <Badge
          className={cn(
            "text-black font-normal capitalize",
            status === "done"
              ? "bg-green-500 hover:bg-green-500"
              : "bg-yellow-400 hover:bg-yellow-400"
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center p-2 gap-2">
        <Link
          href={
            row.original.type === "process"
              ? "/inventory/stock-opname/category/create"
              : `/inventory/stock-opname/category/detail/${row.original.id}`
          }
        >
          <Button
            size={"icon"}
            variant={"outline"}
            className="items-center border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50"
          >
            <ReceiptText />
          </Button>
        </Link>
      </div>
    ),
  },
];
