"use client";

import React, { useRef } from "react";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";

interface OnlyQRPrint {
  qr: string;
  cancel?: () => void;
}

const OnlyQRPrinted: React.FC<OnlyQRPrint> = ({ qr, cancel }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  return (
    <div>
      <div className="border rounded-md border-gray-500 p-2 w-fit">
        <div
          className="w-[7cm] h-[4cm] flex justify-center items-center font-sans p-1"
          ref={componentRef}
        >
          <div className="w-full flex flex-col justify-center items-center">
            {qr && <QRCode value={qr} size={128} level="H" />}
            <div className="mt-2 text-center text-sm font-semibold">{qr}</div>
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
