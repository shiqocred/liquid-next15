"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 5;
const TOAST_DELAY_MS = 500;

const UploadPDF = () => {
  const [fileUpload, setFileUpload] = useState<File[]>([]);

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
        setFileUpload((prevFiles) => [...prevFiles, ...validFiles]); // Tambahkan file yang valid
      }
    },
    [fileUpload]
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

  // Menghapus file berdasarkan index
  //   const handleRemoveFile = (index: number) => {
  //     setFileUpload((prevFiles) => prevFiles.filter((_, i) => i !== index));
  //   };

  // Menggunakan react-dropzone untuk menangani drag-and-drop
  const {
    // getRootProps,
    // getInputProps,
    isDragActive,
    // open: openImage,
  } = useDropzone({
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
        <div className="flex flex-col w-full gap-1.5">
          <Label>Upload File</Label>
          {isDragActive ? (
            <div className="w-full h-full flex items-center justify-center gap-2 border-[1.5px] border-dashed border-sky-400 rounded">
              <p className="text-sm">Drop File Here</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center gap-2 border-[1.5px] border-dashed border-sky-400 rounded">
              <p className="text-sm">Drop File Here</p>
              <p className="text-sm font-semibold text-gray-500">or</p>
              <Button
                className="rounded-full z-10 p-0 h-auto underline hover:bg-transparent text-sky-700 hover:text-sky-900 underline-offset-2"
                variant={"ghost"}
              >
                Upload
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col w-full gap-1.5">
          <Label>Description</Label>
          <Textarea
            rows={6}
            className="resize-none border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  );
};

export default UploadPDF;
