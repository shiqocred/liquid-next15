"use client";

import { Button } from "@/components/ui/button";
import { CloudUpload, Expand, Upload, X } from "lucide-react";
import Image from "next/image";

const UploadImage = ({
  setIsOpenUpload,
  resProceedImage,
  handleRemoveFile,
  setIsOpenImage,
  setUrlDialog,
}: {
  setIsOpenUpload: any;
  resProceedImage: any[];
  handleRemoveFile: any;
  setIsOpenImage: any;
  setUrlDialog: any;
}) => {
  return (
    <div className="flex flex-col w-full gap-4 bg-white p-5 rounded-md shadow">
      <div className="w-full flex justify-between items-center border-b border-gray-500 pb-4">
        <div className="flex gap-2 items-center">
          <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center flex-none">
            <CloudUpload className="size-4" />
          </div>
          <h5 className="z-10 font-semibold">Upload Image</h5>
        </div>
        <div className="flex items-center">
          <Button
            type={"button"}
            onClick={() => setIsOpenUpload(true)}
            variant={"liquid"}
            className="z-10"
          >
            <Upload className="size-4 mr-1" />
            Upload File
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-8 gap-4">
        {resProceedImage.length > 0 ? (
          <>
            {resProceedImage.map((item, i) => (
              <div
                key={item + i}
                className="relative w-full aspect-square shadow border"
              >
                <div className="relative w-full h-full overflow-hidden rounded group">
                  <Image
                    alt=""
                    fill
                    src={item}
                    className="object-cover group-hover:scale-110 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpenImage(true);
                      setUrlDialog(item);
                    }}
                    className="w-full h-full group-hover:delay-500 delay-0 transition-all duration-300 group-hover:opacity-100 opacity-0 flex items-center justify-center absolute top-0 left-0 bg-black/5 backdrop-blur-sm border text-black rounded"
                  >
                    <div className="size-8 flex items-center justify-center bg-white rounded-full">
                      <Expand className="size-5" />
                    </div>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(i)}
                  className="size-5 hover:scale-110 transition-all rounded-full flex items-center justify-center shadow absolute -top-2 -right-2 bg-red-500 border-2 border-white text-white"
                >
                  <X className="size-2.5" />
                </button>
              </div>
            ))}
          </>
        ) : (
          <div className="col-span-8 h-36 w-full flex items-center justify-center border-2 border-dashed border-sky-400/80 rounded">
            <p className="text-sm font-medium">No image yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImage;
