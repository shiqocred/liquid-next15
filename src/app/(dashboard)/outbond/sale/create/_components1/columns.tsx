import {
  Trash2,
  Loader2,
  PlusCircle,
  CheckCircle2,
  PercentCircle,
  CircleDollarSign,
} from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { cn, formatRupiah } from "@/lib/utils";
import { MetaPageProps } from "@/lib/utils-client";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

interface ColumnSalesProps {
  metaPage: MetaPageProps;
  isLoadingSale: boolean;
  setProductDetail: Dispatch<SetStateAction<any>>;
  setOpenDialog: Dispatch<SetStateAction<any>>;
  handleRemoveProduct: (id: string) => void;
}

interface ColumnProductProps {
  metaPage: MetaPageProps;
  handleAdd: (barcode: string) => void;
  isLoading: boolean;
}

interface ColumnBuyerProps {
  metaPage: MetaPageProps;
  handleClose: () => void;
  setInput: Dispatch<SetStateAction<any>>;
  disabled: boolean;
}

interface ActionSalesProps {
  color: "yellow" | "violet" | "red";
  onClick: () => void;
  isLoading: boolean;
  icon: React.ReactNode;
  label: string;
}

interface ActionButtonProps {
  label: string;
  isLoading: boolean;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isBuyer?: boolean;
}

const ActionSales = ({
  color,
  onClick,
  isLoading,
  icon,
  label,
}: ActionSalesProps) => {
  const colorMap = {
    yellow:
      "border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50",
    violet:
      "border-violet-400 text-violet-700 hover:text-violet-700 hover:bg-violet-50",
    red: "border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50",
  };

  return (
    <Button
      className={cn("items-center", colorMap[color])}
      variant={"outline"}
      disabled={isLoading}
      type="button"
      onClick={onClick}
    >
      {isLoading ? <Loader2 className="size-4 mr-1" /> : icon}
      <div>{label}</div>
    </Button>
  );
};

const ActionButton = ({
  label,
  isLoading,
  icon,
  onClick,
  isBuyer = false,
}: ActionButtonProps) => {
  return (
    <TooltipProviderPage value={label}>
      <Button
        className="items-center border-sky-400 text-black hover:bg-sky-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
        variant={"outline"}
        disabled={isLoading}
        onClick={onClick}
        type="button"
      >
        {isBuyer ? (
          icon
        ) : isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          icon
        )}
      </Button>
    </TooltipProviderPage>
  );
};

export const columnSales = ({
  metaPage,
  isLoadingSale,
  setProductDetail,
  setOpenDialog,
  handleRemoveProduct,
}: ColumnSalesProps): ColumnDef<any>[] => [
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
        <ActionSales
          color="yellow"
          onClick={() => {
            setOpenDialog("update-price");
            setProductDetail({
              id: row.original.id,
              price: row.original.product_price_sale,
            });
          }}
          isLoading={isLoadingSale}
          icon={<CircleDollarSign className="size-4 mr-1" />}
          label="Update Price"
        />
        <ActionSales
          color="violet"
          onClick={() => {
            setOpenDialog("gabor");
            setProductDetail({
              id: row.original.id,
              price: row.original.product_price_sale,
            });
          }}
          isLoading={isLoadingSale}
          icon={<PercentCircle className="size-4 mr-1" />}
          label="Gabor"
        />
        <ActionSales
          color="red"
          onClick={() => handleRemoveProduct(row.original.id)}
          isLoading={isLoadingSale}
          icon={<Trash2 className="size-4 mr-1" />}
          label="Delete"
        />
      </div>
    ),
  },
];

export const columnBuyer = ({
  metaPage,
  handleClose,
  setInput,
  disabled,
}: ColumnBuyerProps): ColumnDef<any>[] => [
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
    accessorKey: "name_buyer",
    header: "Buyer Name",
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.original.name_buyer}</div>
    ),
  },
  {
    accessorKey: "phone_buyer",
    header: "No. Hp",
  },
  {
    accessorKey: "address_buyer",
    header: "Address",
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.original.address_buyer}</div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ActionButton
          label={"Select"}
          isLoading={disabled}
          icon={<CheckCircle2 className="size-4" />}
          onClick={(e) => {
            e.preventDefault();
            handleClose();
            setInput((prev: any) => ({
              ...prev,
              buyer: row.original.name_buyer,
              buyerId: row.original.id,
              buyerPhone: row.original.phone_buyer,
              buyerAddress: row.original.address_buyer,
            }));
          }}
          isBuyer
        />
      </div>
    ),
  },
];

export const columnProduct = ({
  metaPage,
  handleAdd,
  isLoading,
}: ColumnProductProps): ColumnDef<any>[] => [
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
    accessorKey: "barcode",
    header: "Barcode",
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ActionButton
          label={"Add Product"}
          isLoading={isLoading}
          icon={<PlusCircle className="size-4" />}
          onClick={(e) => {
            e.preventDefault();
            handleAdd(row.original.barcode);
          }}
        />
      </div>
    ),
  },
];
