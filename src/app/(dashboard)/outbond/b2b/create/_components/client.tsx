"use client";

import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Percent,
  RefreshCcw,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn, formatRupiah } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs";
import { useUploadCreateB2B } from "../_api/use-upload-create-b2b";
import Loading from "@/app/(dashboard)/loading";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface UploadedFileProps {
  file: File;
  name: string;
  size: number;
}

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);

  const [input, setInput] = useState({
    discount: "0",
    priceAfterDiscount: "0",
  });

  const { mutate } = useUploadCreateB2B();

  // state data
  const [selectedFile, setSelectedFile] = useState<UploadedFileProps | null>(
    null
  );

  const handleComplete = async () => {
    const body = new FormData();
    if (selectedFile?.file) {
      body.append("file_import", selectedFile.file);
    }
    body.append("discount_bulky", input.discount);
    body.append("after_price_bulky", input.priceAfterDiscount);

    mutate(
      { body },
      {
        onSuccess: () => {
          setSelectedFile(null);
        },
      }
    );
  };

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

  useEffect(() => {
    if (isNaN(parseFloat(input.discount))) {
      setInput({
        ...input,
        discount: "0",
      });
    }
    if (isNaN(parseFloat(input.priceAfterDiscount))) {
      setInput({
        ...input,
        priceAfterDiscount: "0",
      });
    }
  }, [input]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/b2b">B2B</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full relative">
        <div className="p-4 bg-white rounded shadow">
          {!selectedFile ? (
            <>
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex gap-3 items-center">
                  <h2 className="text-xl font-bold">Create B2B</h2>
                </div>
              </div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded h-52 flex items-center justify-center text-center cursor-default ${
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
            </>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold">Selected File</h2>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-sm flex gap-4 w-1/2 h-80 rounded-md bg-gradient-to-tl from-gray-200 to-gray-100 flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full shadow justify-center flex items-center bg-gradient-to-br from-green-400 to-green-600 text-white">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-semibold">{selectedFile.name}</p>
                    <p className="font-light text-gray-500 text-xs">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex flex-col w-1/3 gap-4">
                  <div className="flex flex-col gap-1 w-full relative">
                    <Label>Discount</Label>
                    <Input
                      className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                      placeholder="0"
                      value={input.discount}
                      onChange={(e) =>
                        setInput({
                          ...input,
                          discount: e.target.value.startsWith("0")
                            ? e.target.value.replace(/^0+/, "")
                            : e.target.value,
                        })
                      }
                    />
                    <Percent className="w-4 h-4 absolute right-3 bottom-2" />
                  </div>
                  <div className="flex flex-col gap-1 w-full relative">
                    <Label>Price After Discount</Label>
                    <Input
                      className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                      placeholder="0"
                      value={input.priceAfterDiscount}
                      onChange={(e) =>
                        setInput({
                          ...input,
                          priceAfterDiscount: e.target.value.startsWith("0")
                            ? e.target.value.replace(/^0+/, "")
                            : e.target.value,
                        })
                      }
                    />
                    <p className="absolute right-3 bottom-2 text-xs text-gray-500">
                      {formatRupiah(parseFloat(input.priceAfterDiscount))}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleComplete}
                      className="bg-sky-300/80 hover:bg-sky-300 text-black w-1/2"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <button
                      className="flex text-sm items-center text-gray-500 hover:underline flex-none"
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                      }}
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Change File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
