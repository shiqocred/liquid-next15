"use client";

import React, { useRef } from "react";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";

interface OnlyQRPrint {
  qr: string;
  qty: string;
  cancel?: () => void;
}

const OnlyQRPrinted: React.FC<OnlyQRPrint> = ({ qr, qty, cancel }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const qrValue = qty !== undefined ? `barcode: ${qr} Qty: ${qty}` : qr;

  return (
    <div>
      <div className="border rounded-md border-gray-500 p-2 w-fit">
        <div
          className="w-[7cm] h-[4cm] flex justify-center items-center font-sans p-1"
          ref={componentRef}
        >
          <div className="flex flex-row w-full items-start">
            <div className="flex flex-col items-center">
              {qr && <QRCode value={qrValue} size={80} level="H" />}
              <div className="mt-2 text-left text-sm font-semibold">{qr}</div>
            </div>
            <div className="flex flex-col ml-6 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-base">Qty : </span>
                <div className="border border-black w-16 h-8 flex items-center justify-center text-lg font-bold">
                  <span className="font-semibold text-base">{qty}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">Batch : </span>
                <div className="border border-black w-16 h-8 flex items-center justify-center text-lg font-bold" />
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

export default OnlyQRPrinted;
