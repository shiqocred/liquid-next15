import { AlertCircle } from "lucide-react";
import React from "react";

export const DetailSection = ({ listData }: { listData: any }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {listData.length > 0 ? (
        listData.map((item: any) => (
          <div
            key={item.id}
            className="p-5 hover:bg-sky-50 border flex items-center w-full justify-between text-sm"
          >
            <p className="whitespace-nowrap font-bold">Color: {item.color}</p>
            <div className="w-3/4 justify-between flex gap-3 ">
              <p>Total Item: {item.total_color}</p>
              <p>Damaged Item: {item.product_damaged}</p>
              <p>Abnormal Item: {item.product_abnormal}</p>
              <p>Lost Item: {item.product_lost}</p>
              <p>Additional Item: {item.product_addition}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="p-5 gap-2 bg-yellow-100 border flex items-center w-full text-sm">
          <AlertCircle className="size-5" />
          <p>The data is still empty.</p>
        </div>
      )}
    </div>
  );
};
