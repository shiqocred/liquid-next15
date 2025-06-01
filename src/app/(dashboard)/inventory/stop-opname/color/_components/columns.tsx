import { MetaPageProps } from "@/lib/utils-client";
import { ColumnDef } from "@tanstack/react-table";

export const columnsSOColor = ({
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
    accessorKey: "new_barcode_product||old_barcode_product",
    header: "Barcode",
    cell: ({ row }) =>
      row.original.new_barcode_product ??
      row.original.old_barcode_product ??
      "-",
  },
];
