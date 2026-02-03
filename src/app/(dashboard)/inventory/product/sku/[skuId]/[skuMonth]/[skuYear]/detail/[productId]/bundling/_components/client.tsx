"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";

export const Client = () => {
  const queryClient = useQueryClient();

  const [perBundle, setPerBundle] = useState(10);
  const [bundle, setBundle] = useState(10);

  const hargaSatuan = 12000;

  const hargaBundle = useMemo(() => {
    return perBundle * hargaSatuan;
  }, [perBundle, hargaSatuan]);

  const showCategory = hargaBundle >= 100000;
  const isBelow100k = hargaBundle < 100000;

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
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
              type="button"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["list-document-sku"],
                })
              }
            >
              <BreadcrumbLink href="/inventory/product/sku">
                Sku{" "}
              </BreadcrumbLink>
            </button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Bundling</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT BOX */}
          <div className="col-span-2 bg-white border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Sekarang</p>
                <p className="font-semibold">980</p>
              </div>

              <div>
                <p className="text-gray-500">Total Sesudah</p>
                <p className="font-semibold">960</p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Per Bundle</p>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={perBundle}
                  onChange={(e) => setPerBundle(Number(e.target.value))}
                />
              </div>

              <div>
                <p className="text-gray-500 mb-1">Bundle</p>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={bundle}
                  onChange={(e) => setBundle(Number(e.target.value))}
                />
              </div>

              <div>
                <p className="text-gray-500">Harga Satuan</p>
                <p className="font-semibold">
                  Rp {hargaSatuan.toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Harga Bundle</p>
                <p className="font-semibold">
                  Rp {hargaBundle.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT BOX */}
          <div className="bg-white border rounded-lg p-4 flex flex-col justify-between">
            {isBelow100k ? (
              // ===== TAG COLOR =====
              <div className="flex flex-col gap-3">
                <p className="text-gray-500 text-sm">Tag Color</p>

                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600">
                    Red
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-600">
                    Yellow
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-600">
                    Green
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Tag color muncul karena harga bundle &lt; Rp 100.000
                </p>
              </div>
            ) : (
              // ===== PRICE AFTER DISCOUNT =====
              <div>
                <p className="text-gray-500 text-sm">Price After Discount</p>
                <div className="h-24 border rounded mt-2 flex items-center justify-center font-semibold text-lg">
                  Rp 0
                </div>
              </div>
            )}
          </div>

          <div className="col-span-3 flex justify-end">
            <button
              type="button"
              className="mt-4 bg-sky-400/80 hover:bg-sky-400 text-black px-4 py-2 rounded"
            >
              Submit
            </button>
          </div>
        </div>

        {showCategory && (
          <div className="bg-white border rounded-lg min-h-[200px] flex items-center justify-center text-gray-400">
            Kategori
          </div>
        )}
      </div>
    </div>
  );
};
