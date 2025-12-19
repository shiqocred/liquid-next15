"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  RefreshCcw,
  FileSpreadsheet,
  X,
  UploadCloud,
  Check,
  XCircle,
} from "lucide-react";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { UseMutationResult } from "@tanstack/react-query";
// import axios from "axios";
import type { AxiosResponse } from "axios";

interface UploadedFileProps {
  file: File;
  name: string;
  size: number;
}

export const DialogUploadExcel = ({
  open,
  onOpenChange,
  handleAddProductExcel,
  addProductExcelMutate,
  isPendingAddProductExcel,
}: {
  open: boolean;
  onOpenChange: () => void;
  isPendingAddProductExcel: boolean;
  addProductExcelMutate: UseMutationResult<
    AxiosResponse<any, any>,
    Error,
    any,
    unknown
  >;
  handleAddProductExcel: ({
    type,
    barcode,
    file,
  }: {
    type: "product" | "file";
    barcode?: string;
    file?: File;
  }) => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<UploadedFileProps | null>(
    null
  );
  const [isNotif, setIsNotif] = useState<"success" | "warning" | "error" | "">(
    ""
  );
  const [count, setCount] = useState(0);
  const [errorResponse, setErrorResponse] = useState<any>(null);
  const [successResponse, setSuccessResponse] = useState<any>(null);

  const { data, isSuccess, reset, isError, error } = addProductExcelMutate;
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile({
        file,
        name: file.name,
        size: file.size,
      });
    }
  };
  const dataResponse = data?.data ?? null;

  useEffect(() => {
    if (isError && (error as any)?.response?.status === 422) {
      const errData = (error as any)?.response?.data;
      setErrorResponse(errData);
      setIsNotif("error");
    }
  }, [isError, error]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  useEffect(() => {
    if (count === 0) {
      setIsNotif("");
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if ((open && isSuccess) || !open) {
      setSelectedFile(null);
    }

    if (open && isSuccess && dataResponse) {
      if (dataResponse?.status === "true") {
        setIsNotif("warning");
        setCount(5);
      } else {
        setIsNotif("success");
        setCount(5);
        setSuccessResponse(dataResponse);
        reset();
      }
    }

    if (isNotif === "success" && count === 0) {
      onOpenChange();
    }

    if (!open) {
      setIsNotif("");
      setErrorResponse(null);
      reset();
    }
  }, [open, isSuccess, count]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClose={false}
        className="max-w-6xl"
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Upload File
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onOpenChange()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {/* ================== DEFAULT (UPLOAD) ================== */}
        {isNotif === "" && (
          <div className="w-full">
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded h-80 flex items-center justify-center text-center cursor-default ${
                  isDragActive ? "border-blue-500" : "border-gray-300"
                }`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-blue-500">Drop the files here ...</p>
                ) : (
                  <div className="flex justify-center flex-col items-center gap-2">
                    <p>Drag & drop some files here, or click to select files</p>
                    <p className="text-sky-500 text-sm font-semibold">
                      (.xlsx, .xls)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm flex gap-4 h-80 rounded-md bg-gradient-to-tl from-gray-200 to-gray-100 flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full shadow justify-center flex items-center bg-gradient-to-br from-green-400 to-green-600 text-white">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-semibold">{selectedFile.name}</p>
                  <p className="font-light text-gray-500 text-xs">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant={"outline"}
                    className="bg-transparent border-gray-500"
                    size={"sm"}
                    onClick={() => setSelectedFile(null)}
                  >
                    <RefreshCcw className="size-2" />
                    Change File
                  </Button>
                  <Button
                    variant={"liquid"}
                    size={"sm"}
                    disabled={isPendingAddProductExcel}
                    onClick={() =>
                      handleAddProductExcel({
                        type: "file",
                        file: selectedFile.file,
                      })
                    }
                  >
                    <UploadCloud className="size-2" />
                    {isPendingAddProductExcel ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================== SUCCESS ================== */}
        {isNotif === "success" && (
          <div className="w-full h-80 flex flex-col items-center justify-center gap-3">
            <div className="size-14 flex justify-center items-center bg-green-500 text-white rounded-full shadow">
              <Check className="size-10" />
            </div>
            <h5 className="text-xl font-bold">
              {" "}
              {successResponse?.data?.message ?? "File Successfuly Uploaded"}
            </h5>
            <p>
              Data Found:{" "}
              {successResponse?.data?.resource?.processed_count.toLocaleString()}
            </p>
            <p>Notif will be close in {count} second</p>
          </div>
        )}

        {/* ================== ERROR 422 ================== */}
        {isNotif === "error" && (
          <div className="w-full h-80 flex flex-col items-center justify-center gap-3 text-center">
            <div className="size-14 flex justify-center items-center bg-red-500 text-white rounded-full shadow">
              <XCircle className="size-10" />
            </div>
            <h5 className="text-xl font-bold">Upload Gagal</h5>
            <p className="text-gray-600">
              {errorResponse?.message ?? "Terjadi kesalahan saat upload file."}
            </p>

            {errorResponse?.data.resource?.missing_barcodes?.length > 0 && (
              <div className="w-full max-w-lg text-left mt-4">
                <p className="font-semibold text-red-700 mb-2">
                  Data tidak ditemukan:
                </p>
                <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                  {errorResponse?.data?.resource?.missing_barcodes.map(
                    (item: string, i: number) => (
                      <li key={i}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            )}
            <Button
              variant={"outline"}
              onClick={() => {
                setIsNotif("");
                setErrorResponse(null);
                reset();
              }}
            >
              Coba Lagi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
