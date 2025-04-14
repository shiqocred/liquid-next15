import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { CircleDollarSign, Loader2, PercentCircle, Trash2 } from "lucide-react";

export const columnSales = ({
  metaPage,
  isPendingUpdatePrice,
  isPendingGabor,
  isPendingRemoveProduct,
  isPendingSubmit,
  setIsUpdatePrice,
  setIsGabor,
  setInputEdit,
  handleRemoveProduct,
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
    accessorKey: "product_barcode_sale",
    header: "Barcode",
  },
  {
    accessorKey: "product_name_sale",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.product_name_sale}
      </div>
    ),
  },
  {
    accessorKey: "product_price_sale",
    header: "Price",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {formatRupiah(row.original.product_price_sale)}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <Button
          className="items-center border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50"
          variant={"outline"}
          disabled={isPendingUpdatePrice || isPendingSubmit}
          type="button"
          onClick={() => {
            setIsUpdatePrice(true);
            setInputEdit({
              id: row.original.id,
              price: row.original.product_price_sale,
            });
          }}
        >
          {isPendingUpdatePrice ? (
            <Loader2 className="w-4 h-4 mr-1" />
          ) : (
            <CircleDollarSign className="w-4 h-4 mr-1" />
          )}
          <div>Update Price</div>
        </Button>
        <Button
          className="items-center border-violet-400 text-violet-700 hover:text-violet-700 hover:bg-violet-50"
          variant={"outline"}
          type="button"
          disabled={isPendingGabor || isPendingSubmit}
          onClick={() => {
            setIsGabor(true);
            setInputEdit({
              id: row.original.id,
              price: row.original.product_price_sale,
            });
          }}
        >
          {isPendingGabor ? (
            <Loader2 className="w-4 h-4 mr-1" />
          ) : (
            <PercentCircle className="w-4 h-4 mr-1" />
          )}
          <div>Gabor</div>
        </Button>
        <Button
          className="items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50"
          variant={"outline"}
          type="button"
          disabled={isPendingRemoveProduct || isPendingSubmit}
          onClick={() => {
            handleRemoveProduct(row.original.id);
          }}
        >
          {isPendingRemoveProduct ? (
            <Loader2 className="w-4 h-4 mr-1" />
          ) : (
            <Trash2 className="w-4 h-4 mr-1" />
          )}
          <div>Delete</div>
        </Button>
      </div>
    ),
  },
];
