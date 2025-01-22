"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Expand, Loader, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useProceeedImage } from "../_api/use-proceed-image";

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 2;
const TOAST_DELAY_MS = 500;

const DialogUpload = ({
  open,
  onClose,
  handleUpload,
  setIsOpenImage,
  setUrlDialog,
  isPending,
  images,
  isSuccess,
}: {
  open: boolean;
  onClose: () => void;
  handleUpload: any;
  setIsOpenImage: any;
  setUrlDialog: any;
  isPending: boolean;
  images: number;
  isSuccess: boolean;
}) => {
  const [fileUpload, setFileUpload] = useState<File[]>([]);

  const { mutate: mutateProceed, isPending: isPendingProceed } =
    useProceeedImage();

  const handleProceedImage = () => {
    const formData = new FormData();
    fileUpload.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    mutateProceed(
      { body: formData },
      {
        onSuccess: (data) => {
          handleUpload(data.data.processedImages);
        },
      }
    );
  };

  // *
  // images
  // *
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      toast.dismiss(); // Menutup semua toast yang aktif

      // Total file yang akan ada setelah menambahkan file baru
      const totalFiles = images + acceptedFiles.length + fileUpload.length;
      const remainingFileSlots = MAX_FILES - (fileUpload.length + images);

      // Menyimpan error baru
      const newErrors: string[] = [];

      // Cek batas jumlah file
      if (totalFiles > MAX_FILES) {
        newErrors.push(
          `You can only upload ${remainingFileSlots} more file(s).`
        );
      }

      // Cek batas ukuran file dan hanya tambahkan file yang valid
      const validFiles: File[] = [];
      acceptedFiles.slice(0, remainingFileSlots).forEach((file) => {
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
      toast.error(`You can only upload up to ${MAX_FILES} files.`);
    }
  }, []);

  // Menghapus file berdasarkan index
  const handleRemoveFile = (index: number) => {
    setFileUpload((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Menggunakan react-dropzone untuk menangani drag-and-drop
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openImage,
  } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/*": [] }, // Hanya mengizinkan gambar
    noClick: true, // Tidak memicu file picker saat halaman diklik, kecuali tombol kecil
    noKeyboard: true, // Mencegah file picker terbuka dengan keyboard
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024, // Konversi dari MB ke byte
  });

  useEffect(() => {
    if (!open) {
      setFileUpload([]);
    }
  }, [open]);
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        onClose();
      }}
    >
      <DialogContent onClose={false} className="max-w-[100vw] h-[100vh]">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        {isPending || isPendingProceed || isSuccess ? (
          <div className="w-full h-[calc(100vh-130px)] border-2 border-sky-400 border-dashed rounded-md flex flex-col gap-2 items-center justify-center">
            <Loader className="size-6 animate-spin" />
            <p className="ml-1 text-sm">
              {isPendingProceed
                ? "Processing..."
                : isSuccess
                ? "Closing Dialog..."
                : "Uploading..."}
            </p>
          </div>
        ) : (
          <>
            <div className="w-full h-[calc(100vh-130px)] gap-4 flex flex-col items-center justify-center">
              <div
                className={cn(
                  "w-full grid gap-4",
                  fileUpload.length === 1 && "max-w-[20vw] grid-cols-1",
                  fileUpload.length === 2 && "max-w-[30vw] grid-cols-2",
                  fileUpload.length === 3 && "max-w-[50vw] grid-cols-3",
                  fileUpload.length === 4 && "max-w-[70vw] grid-cols-4",
                  fileUpload.length === 5 && "max-w-[90vw] grid-cols-5",
                  fileUpload.length === 6 && "grid-cols-6",
                  fileUpload.length === 7 &&
                    "max-w-[70vw] grid-rows-2 grid-cols-4",
                  fileUpload.length === 8 && "grid-rows-2 grid-cols-4"
                )}
              >
                {fileUpload.length > 0 &&
                  fileUpload.map((item, i) => (
                    <div
                      key={item.name}
                      className="relative w-full aspect-square shadow border z-10"
                    >
                      <div className="relative w-full h-full overflow-hidden rounded group">
                        <Image
                          alt=""
                          fill
                          src={URL.createObjectURL(item)}
                          className="object-cover group-hover:scale-110 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpenImage(true);
                            setUrlDialog(URL.createObjectURL(item));
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
              </div>
              {fileUpload.length + images < 8 && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 border-2 border-dashed border-sky-400 rounded">
                  <Button
                    className="bg-sky-400/80 hover:bg-sky-400 text-black rounded-full z-10"
                    onClick={openImage}
                  >
                    Upload
                  </Button>
                  <div className="bg-sky-100 flex items-center justify-center rounded-full size-8">
                    <p className="text-sm font-bold">or</p>
                  </div>
                  <p className="text-sm">Drop File Here</p>
                </div>
              )}
            </div>
            {fileUpload.length + images < 8 && (
              <div
                {...getRootProps()}
                className={`top-0 left-0 w-full h-full flex items-center justify-center p-6 bg-black/45 backdrop-blur-sm pointer-events-auto ${
                  isDragActive
                    ? "opacity-100 z-20 fixed"
                    : "opacity-0 z-0 absolute"
                }`}
              >
                <div className="w-full h-full flex items-center justify-center border-4 border-sky-100 rounded-lg border-dashed">
                  <input {...getInputProps()} />
                  <p className="text-5xl text-sky-100 font-bold uppercase">
                    Drop image anywhere
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="justify-end">
              <Button
                variant={"outline"}
                className="z-10 border-gray-500"
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                className="border-sky-400 hover:bg-sky-100 text-sky-700 hover:text-sky-800 z-10"
                variant={"outline"}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleProceedImage();
                }}
              >
                Upload
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogUpload;
