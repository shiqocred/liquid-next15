"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState, useEffect } from "react";
import { useGetCategoriesBundlingBySku } from "../_api/use-get-categories-sku";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, formatRupiah } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useGetTagBundlingBySku } from "../_api/use-get-tag-bundling";
import { useParams } from "next/navigation";
import { useGetDetailProduct } from "../_api/use-get-detail-product";
import { useAddBundle } from "../_api/use-submit-bundle-sku";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BarcodePrintPreview from "@/components/barcode-print-preview";

export const Client = () => {
  const { skuId, skuMonth, skuYear, productId } = useParams();
  const codeDocument = `${skuId}/${skuMonth}/${skuYear}`;
  const queryClient = useQueryClient();
  const [input, setInput] = useState({
    perBundle: "0",
    bundle: "1",
  });

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcodeItems, setBarcodeItems] = useState<any[]>([]);

  const { mutate: submitBundle, isPending } = useAddBundle({ id: productId });
  const { data: dataProduct } = useGetDetailProduct({ id: productId });

  const detailsProduct = useMemo(() => {
    return dataProduct?.data?.data?.resource || {};
  }, [dataProduct]);
  
  /* =======================
   * PRICE
   * ======================= */
  const hargaSatuan = Number(detailsProduct?.price_product) || 0;
  const hargaBundle = useMemo(() => {
    const result = (Number(input.perBundle) || 0) * hargaSatuan;

    return Math.round(result);
  }, [input.perBundle, hargaSatuan]);

  const showCategory = hargaBundle >= 100000;
  const isBelow100k = hargaBundle < 100000;

  /* =======================
   * STOCK
   * ======================= */
  const totalSekarang = Number(detailsProduct?.quantity_product) || 0;

  const totalSesudah = useMemo(() => {
    const result =
      totalSekarang -
      (Number(input.bundle) || 0) * (Number(input.perBundle) || 0);

    return Math.round(result);
  }, [totalSekarang, input.bundle, input.perBundle]);

  /* =======================
   * TAG (<100K)
   * ======================= */
  const bodyTag = useMemo(
    () => ({
      items_per_bundle: Math.round(Number(input.perBundle) || 0),
    }),
    [input.perBundle],
  );

  const { data: dataTag, isFetching } = useGetTagBundlingBySku(
    productId,
    bodyTag,
    isBelow100k,
  );

  const tag = useMemo(() => {
    return dataTag?.data?.resource;
  }, [dataTag]);

  /* =======================
   * CATEGORY
   * ======================= */
  const { data: dataCategories } = useGetCategoriesBundlingBySku();

  const categories: any[] = useMemo(() => {
    return dataCategories?.data?.data?.resource || [];
  }, [dataCategories]);

  /* =======================
   * DISCOUNT (ROUND)
   * ======================= */
  const discountAmount = useMemo(() => {
    if (!showCategory || !selectedCategory) return 0;

    const percentDiscount =
      hargaBundle * (Number(selectedCategory.discount_category) / 100);

    const discount = Math.min(
      percentDiscount,
      Number(selectedCategory.max_price_category),
    );

    return Math.round(discount);
  }, [hargaBundle, selectedCategory, showCategory]);

  const priceAfterDiscount = useMemo(() => {
    if (!showCategory) return hargaBundle;

    return Math.round(hargaBundle - discountAmount);
  }, [hargaBundle, discountAmount, showCategory]);

  const handleSubmit = () => {
    if (!input.perBundle || !input.bundle) {
      toast.error("Per bundle dan bundle wajib diisi");
      return;
    }

    if (showCategory && !selectedCategory) {
      toast.error("Category wajib dipilih");
      return;
    }

    submitBundle(
      {
        items_per_bundle: input.perBundle,
        bundle_quantity: input.bundle,
        ...(showCategory && {
          new_category_product: selectedCategory.name_category,
        }),
      },
      {
        onSuccess: (res) => {
          const products = res.data.data.resource.generated_products || [];

          if (!products.length) {
            toast.error("Barcode tidak ditemukan");
            return;
          }

          const mappedBarcodes = products.map((item: any) => ({
            barcode: item.new_barcode_product,
            oldPrice: String(item.old_price_product),
            newPrice: String(item.new_price_product),
            category: item.category ?? item.tag,
            discount: selectedCategory
              ? String(selectedCategory.discount_category)
              : undefined,
            isBundle: true,
            colorHex: item.tag?.hex_color,
          }));

          setBarcodeItems(mappedBarcodes);
          setBarcodeOpen(true);
          setInput({ perBundle: "0", bundle: "1" });
          queryClient.invalidateQueries({
            queryKey: ["detail-bundling-product-sku", productId],
          });

          queryClient.invalidateQueries({
            queryKey: ["detail-bundling-product-sku", codeDocument, productId],
          });
          queryClient.invalidateQueries({
            queryKey: ["check-categories-product-by-sku-bundling"],
          });
          queryClient.invalidateQueries({
            queryKey: ["check-tag-product-by-sku-bundling"],
          });
        },
      },
    );
  };

  useEffect(() => {
    if (!showCategory) {
      setSelectedCategory(null);
    }
  }, [showCategory]);

  return (
    <div className="flex flex-col bg-gray-100 w-full px-4 gap-4 py-4">
      <Dialog open={barcodeOpen} onOpenChange={setBarcodeOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview Barcode ({barcodeItems.length})</DialogTitle>
          </DialogHeader>

          <BarcodePrintPreview
            items={barcodeItems}
            onClose={() => {
              setBarcodeOpen(false);
              setBarcodeItems([]);
            }}
          />
        </DialogContent>
      </Dialog>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <button
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["list-document-sku"],
                })
              }
            >
              <BreadcrumbLink href="/inventory/product/sku">Sku</BreadcrumbLink>
            </button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Bundling</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Sekarang</p>
              <p className="font-semibold">{totalSekarang}</p>
            </div>

            <div>
              <p className="text-gray-500">Total Sesudah</p>
              <p className="font-semibold">{totalSesudah}</p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Per Bundle</p>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={input.perBundle}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    perBundle: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <p className="text-gray-500 mb-1">Bundle</p>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={input.bundle}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    bundle: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <p className="text-gray-500">Harga Satuan</p>
              <p className="font-semibold">{formatRupiah(hargaSatuan)}</p>
            </div>

            <div>
              <p className="text-gray-500">Harga Bundle</p>
              <p className="font-semibold">{formatRupiah(hargaBundle)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 flex flex-col justify-between">
          {isBelow100k ? (
            <div>
              <p className="text-gray-500 text-sm">Tag Color</p>
              {isFetching ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : tag ? (
                <>
                  <span
                    className="px-3 py-1 rounded-full text-white text-sm"
                    style={{ backgroundColor: tag.hex_color }}
                  >
                    {tag.tag_name}
                  </span>
                  <p className="font-semibold mt-2">
                    {formatRupiah(Math.round(tag.fixed_price))}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">No tag</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-500 text-sm">Price After Discount</p>
              <p className="text-lg font-semibold text-black mt-3">
                {formatRupiah(priceAfterDiscount)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-sky-400 hover:bg-sky-500 disabled:opacity-50 px-6 py-2 rounded"
        >
          {isPending ? "Submitting..." : "Submit"}
        </button>
      </div>

      {showCategory && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Pilih Kategori Diskon</h3>
          <RadioGroup
            className="grid grid-cols-4 gap-6"
            onValueChange={(value) => {
              const cat = categories.find(
                (item) => item.name_category === value,
              );
              setSelectedCategory(cat);
            }}
          >
            {categories.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "border rounded-md px-4 py-3 bg-sky-50",
                  selectedCategory?.id === item.id
                    ? "border-sky-500 bg-sky-100"
                    : "border-gray-300",
                )}
              >
                <RadioGroupItem
                  value={item.name_category}
                  id={String(item.id)}
                />
                <Label htmlFor={String(item.id)}>
                  <p className="font-bold">{item.name_category}</p>
                  <p className="text-xs">
                    {item.discount_category}% - Max{" "}
                    {formatRupiah(Math.round(item.max_price_category))}
                  </p>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
};
