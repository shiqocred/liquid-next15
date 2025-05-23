import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { RefreshCcw, FileSpreadsheet, X, UploadCloud } from "lucide-react";

import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

interface UploadedFileProps {
  file: File;
  name: string;
  size: number;
}

export const DialogUpload = ({
  open,
  onOpenChange,
  handleAddProduct,
}: {
  open: boolean;
  onOpenChange: () => void;
  handleAddProduct: ({
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
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      return setSelectedFile({
        file,
        name: file.name,
        size: file.size,
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1, // Limit file upload to only one
  });
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
                onClick={() => {
                  setSelectedFile(null);
                }}
              >
                <RefreshCcw className="size-2" />
                Change File
              </Button>
              <Button
                variant={"liquid"}
                size={"sm"}
                onClick={() => {
                  handleAddProduct({ type: "file", file: selectedFile.file });
                }}
              >
                <UploadCloud className="size-2" />
                Upload
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
