"use client";

import React, { useRef } from "react";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { formatRupiah } from "@/lib/utils";

interface BarcodePrint {
  oldPrice: string;
  newPrice: string;
  barcode: string;
  category: string;
  discount?: string;
  isBundle?: boolean;
  colorHex?: string;
  cancel?: () => void;
}

const BarcodePrinted: React.FC<BarcodePrint> = ({
  oldPrice,
  newPrice,
  barcode,
  category,
  discount,
  isBundle,
  colorHex,
  cancel,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  return (
    <div>
      <div className="border rounded-md border-gray-500 p-2 w-fit">
        <div
          className="w-[7cm] h-[4cm] flex justify-start items-center font-sans p-1"
          ref={componentRef}
        >
          <div className="w-full">
            <div className="flex items-center justify-between w-full">
              {barcode && (
                <Barcode
                  fontOptions="bold"
                  textMargin={3}
                  fontSize={16}
                  font="sans-serif"
                  value={barcode}
                  width={1.2}
                  height={50}
                />
              )}
              <div className="border w-[80] py-1 px-2 text-center border-black">
                <p className="font-bold text-[10px] leading-3 break-all">
                  {colorHex && (
                    <span
                      className="inline-block mr-1"
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        backgroundColor: colorHex,
                        borderRadius: "50%",
                        border: "1px solid #000",
                      }}
                    />
                  )}
                  {category}{" "}
                  {discount && (
                    <span className="whitespace-nowrap">({discount}%)</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex text-base font-semibold gap-1">
              <div className="flex flex-col">
                <p>{!isBundle ? "Harga Retail" : "Total Awal"}</p>
                <p>{!isBundle ? "Harga Diskon" : "Custom Display"}</p>
              </div>
              <div className="flex flex-col">
                <p>
                  :{" "}
                  <span className="line-through">
                    {formatRupiah(parseFloat(oldPrice))}
                  </span>
                </p>
                <p>: {formatRupiah(parseFloat(newPrice))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-6">
        {cancel && (
          <button
            onClick={(e) => {
              e.preventDefault();
              cancel();
            }}
            className="py-2 px-8 bg-gray-300/80 text-black rounded-full hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => handlePrint()}
          className="py-2 px-8 bg-sky-400/80 text-black rounded-full hover:bg-sky-400"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default BarcodePrinted;
