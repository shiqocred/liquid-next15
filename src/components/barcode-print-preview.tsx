"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import BarcodePrinted from "@/components/barcode";

interface BarcodeItem {
  barcode: string;
  oldPrice: string;
  newPrice: string;
  category: string;
  discount?: string;
  isBundle?: boolean;
  colorHex?: string;
}

interface Props {
  items: BarcodeItem[];
  onClose: () => void;
}

const BarcodePrintPreview: React.FC<Props> = ({ items, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Barcode Bundle (${items.length})`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        .page-break {
          page-break-after: always;
        }
      }
    `,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* PREVIEW AREA */}
      <div
        ref={printRef}
        className="grid grid-cols-2 gap-4"
      >
        {items.map((item, index) => (
          <div
            key={item.barcode}
            className={(index + 1) % 8 === 0 ? "page-break" : ""}
          >
            <BarcodePrinted {...item} />
          </div>
        ))}
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            // if (
            //   confirm(
            //     `Print ${items.length} barcode?\nPastikan printer sudah siap.`,
            //   )
            // ) {
              handlePrint();
            // }
          }}
          className="px-6 py-2 rounded bg-sky-400 hover:bg-sky-500 text-black"
        >
          Print All ({items.length})
        </button>
      </div>
    </div>
  );
};

export default BarcodePrintPreview;
