"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDown,
  ArrowUpRightFromSquare,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 5;
const TOAST_DELAY_MS = 500;

const UploadPDF = ({
  files,
  setFiles,
  input,
  setInput,
  isEdit,
  setOpenPDF,
  handleRemove,
  isPendingDelete,
}: {
  files: File[];
  setFiles: any;
  input: any;
  setInput: any;
  setOpenPDF: any;
  handleRemove: any;
  isPendingDelete: boolean;
  isEdit: boolean;
}) => {
  // *
  // images
  // *
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      toast.dismiss(); // Menutup semua toast yang aktif

      // Menyimpan error baru
      const newErrors: string[] = [];

      // Cek batas ukuran file dan hanya tambahkan file yang valid
      const validFiles: File[] = [];
      acceptedFiles.forEach((file) => {
        const fileSizeMB = file.size / (1024 * 1024); // Mengonversi byte ke MB
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          newErrors.push(
            `File ${file.name} is larger than ${MAX_FILE_SIZE_MB} MB.`
          );
        } else {
          validFiles.push(file);
        }
      });

      // Menampilkan toast dengan delay untuk setiap error
      newErrors.forEach((error, index) => {
        setTimeout(() => {
          toast.error(error); // Menampilkan toast error
        }, index * TOAST_DELAY_MS); // Delay berdasarkan urutan error
      });

      // Jika tidak ada error, tambahkan file yang valid
      if (validFiles.length > 0) {
        setFiles((prevFiles: any) => [...prevFiles, ...validFiles]); // Tambahkan file yang valid
      }
    },
    [files]
  );

  // Menangani file yang ditolak
  const onDropRejected = useCallback((rejectedFiles: any[]) => {
    toast.dismiss(); // Menutup semua toast yang aktif

    rejectedFiles.forEach((rejectedFile, index) => {
      const { file, errors } = rejectedFile;
      errors.forEach((error: any, errorIndex: number) => {
        setTimeout(() => {
          if (error.code === "file-too-large") {
            toast.error(
              `File ${file.name} is larger than ${MAX_FILE_SIZE_MB} MB.`
            );
          }
        }, (index + errorIndex) * TOAST_DELAY_MS); // Delay berdasarkan urutan error
      });
    });
    if (rejectedFiles[0].errors[0].code === "too-many-files") {
      toast.error(`You can only upload up to ${1} files.`);
    }
  }, []);

  // Menggunakan react-dropzone untuk menangani drag-and-drop
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    noClick: true, // Tidak memicu file picker saat halaman diklik, kecuali tombol kecil
    noKeyboard: true, // Mencegah file picker terbuka dengan keyboard
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024, // Konversi dari MB ke byte
  });
  return (
    <div className="flex flex-col w-full gap-4 bg-white p-5 rounded-md shadow">
      <div className="w-full flex justify-between items-center border-b border-gray-500 pb-4">
        <div className="flex gap-2 items-center">
          <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center flex-none">
            <FileText className="size-4" />
          </div>
          <h5 className="z-10 font-semibold">Upload PDF</h5>
        </div>
      </div>
      <div className="flex w-full gap-4">
        {!isEdit ? (
          <div className="flex flex-col w-full gap-1.5">
            <Label>Upload File</Label>
            {input.pdf ? (
              <div className="w-full p-3 flex bg-sky-50 rounded-md border-sky-400/80 border gap-3">
                <div className="size-9 flex-none rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white shadow">
                  {isPendingDelete ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => setOpenPDF(true)}
                  disabled={isPendingDelete}
                  className="flex pl-3 border-x border-sky-400/80 items-center justify-start [&_svg]:size-3 w-full rounded-none hover:bg-transparent hover:underline hover:underline-offset-2 disabled:opacity-100 disabled:pointer-events-auto"
                  variant={"ghost"}
                >
                  {isPendingDelete ? (
                    "Deleting file..."
                  ) : (
                    <>
                      <p className="line-clamp-1 font-semibold text-sm">
                        Uploaded file
                      </p>
                      <ArrowUpRightFromSquare />
                    </>
                  )}
                </Button>
                <Button
                  className="rounded-full ml-auto flex-none bg-transparent hover:bg-red-50 text-red-500 shadow-none [&_svg]:size-5"
                  size={"icon"}
                  type="button"
                  onClick={handleRemove}
                >
                  <Trash2 />
                </Button>
              </div>
            ) : (
              <div className="w-full p-3 flex bg-sky-50 rounded-md border-sky-400/80 border gap-3 items-center justify-center">
                <p className="line-clamp-1 font-semibold text-sm">
                  No file uploaded.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col w-full gap-1.5">
            <Label>Upload File</Label>
            {files.length === 0 ? (
              <div
                {...getRootProps()}
                className="w-full h-full flex items-center justify-center gap-2 border-[1.5px] border-dashed border-sky-400 rounded"
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <>
                    <ArrowDown className="animate-bounce size-4" />
                    <p className="text-sm">Drop File Here</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">Drop File Here</p>
                    <p className="text-sm font-semibold text-gray-500">or</p>
                    <Button
                      className="rounded-full z-10 p-0 h-auto underline hover:bg-transparent text-sky-700 hover:text-sky-900 underline-offset-2"
                      variant={"ghost"}
                      onClick={open}
                    >
                      Upload
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full p-3 flex bg-sky-50 rounded-md border-sky-400/80 border gap-3">
                <div className="size-9 flex-none rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white shadow">
                  <FileText className="size-4" />
                </div>
                <div className="flex flex-col pl-3 border-x border-sky-400/80 justify-center w-full">
                  <p className="line-clamp-1 font-semibold text-sm">
                    {files[0].name}
                  </p>
                  <p className="text-xs">
                    {(files[0].size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  className="rounded-full ml-auto flex-none bg-transparent hover:bg-red-50 text-red-500 shadow-none [&_svg]:size-5"
                  size={"icon"}
                  onClick={() => setFiles([])}
                >
                  <Trash2 />
                </Button>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col w-full gap-1.5">
          <Label>Description</Label>
          <Textarea
            rows={6}
            disabled={!isEdit}
            className="resize-none border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-0 disabled:opacity-100 disabled:cursor-default"
            value={input.description}
            onChange={(e) =>
              setInput((prev: any) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
};

export default UploadPDF;
