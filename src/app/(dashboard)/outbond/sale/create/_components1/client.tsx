"use client";

import { ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductSales } from "./product-sales";
import { useGetListChasier } from "../_api/use-get-list-cashier";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useSubmit } from "../_api/use-submit";
import { useGaborProduct } from "../_api/use-gabor-product";
import { useCreatePPN } from "../_api/use-create-ppn";
import { useUpdatePPN } from "../_api/use-update-ppn";
import { useDeletePPN } from "../_api/use-delete-ppn";
import { useUpdatePriceProduct } from "../_api/use-update-price-product";
import { useConfirm } from "@/hooks/use-confirm";

export const Client = () => {
  const [isUpdatePrice, setIsUpdatePrice] = useState(false);
  const [isGabor, setIsGabor] = useState(false);

  const [inputEdit, setInputEdit] = useState({
    id: "",
    price: "0",
  });
  const [input, setInput] = useState({
    discount: "0",
    buyer: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerId: "",
    price: "0",
    cartonQty: "0",
    cartonUnit: "0",
    voucher: "0",
    ppnActive: 0,
    discountFor: "",
  });

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();

  const { mutate: mutateGabor, isPending: isPendingGabor } = useGaborProduct();
  const { mutate: mutateCreatePPN, isPending: isPendingCreatePPN } =
    useCreatePPN();
  const { mutate: mutateUpdatePPN, isPending: isPendingUpdatePPN } =
    useUpdatePPN();
  const { mutate: mutateDeletePPN, isPending: isPendingDeletePPN } =
    useDeletePPN();

  const { mutate: mutateUpdatePrice, isPending: isPendingUpdatePrice } =
    useUpdatePriceProduct();

  // mutate end ----------------------------------------------------------------

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Outbond</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/outbond/sale">Sale</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Cashier</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/outbond/sale">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Cashier</h1>
        </div>
        <ProductSales
          setInput={setInput}
          columnData={{
            isPendingUpdatePrice,
            isPendingGabor,
            isPendingRemoveProduct,
            isPendingSubmit,
            setIsUpdatePrice,
            setIsGabor,
            setInputEdit,
            handleRemoveProduct,
          }}
        />
      </div>
    </div>
  );
};
