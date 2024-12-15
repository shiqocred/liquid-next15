"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatRupiah } from "@/lib/utils";
import { AlertCircle, Minus, Plus } from "lucide-react";
import React, { useState } from "react";

const DialogProceed = ({
  open,
  onCloseModal,
  data,
  setData,
  handleSubmit,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
  setData: any;
  handleSubmit: any;
}) => {
  const [step, setStep] = useState(1);

  return (
    <div>
      <Dialog open={open}>
        <DialogContent
          onClose={false}
          className="max-w-2xl h-[645px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-0 gap-4">
            <DialogTitle>
              {step === 1 && "Configure Carton Box & Enter Voucher"}
              {step === 2 && "Summary Sale"}
            </DialogTitle>
            <Progress
              className="h-1"
              value={(100 / 3) * step}
              classNameIndicator="bg-sky-500"
            />
            <div className="flex gap-2 items-center px-5 py-3 bg-red-50 border border-red-300 rounded">
              <AlertCircle className="size-4" />
              <p className="text-sm font-semibold">
                Reloading the page may result in data loss
              </p>
            </div>
          </DialogHeader>
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 border border-gray-500 p-3 rounded">
                <h5 className="pb-3 font-semibold border-b border-gray-500">
                  Carton Box
                </h5>
                <div className="flex flex-col gap-1 w-full relative">
                  <Label>Qty</Label>
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    placeholder="0"
                    value={data.cartonQty}
                    onChange={(e) =>
                      setData((prev: any) => ({
                        ...prev,
                        qty: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                  />
                  <div className="flex items-center gap-2 absolute right-3 bottom-2">
                    <Button
                      type="button"
                      className="w-9 p-0 bg-transparent hover:bg-sky-100 border border-gray-300 hover:border-gray-500 text-black"
                      onClick={() =>
                        setData((prev: any) => ({
                          ...prev,
                          qty: (parseFloat(prev.qty) - 1).toString(),
                        }))
                      }
                      disabled={parseFloat(data.cartonQty) <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      className="w-9 p-0 bg-transparent hover:bg-sky-100 border border-gray-300 hover:border-gray-500 text-black"
                      onClick={() =>
                        setData((prev: any) => ({
                          ...prev,
                          qty: (parseFloat(prev.qty) + 1).toString(),
                        }))
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Label>Unit Price</Label>
                  <div className="w-full relative flex items-center">
                    <Input
                      className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                      placeholder="0"
                      value={data.cartonUnit}
                      // disabled={loadingSubmit}
                      onChange={(e) =>
                        setData((prev: any) => ({
                          ...prev,
                          unit: e.target.value.startsWith("0")
                            ? e.target.value.replace(/^0+/, "")
                            : e.target.value,
                        }))
                      }
                    />
                    <p className="absolute right-3 text-xs text-gray-500">
                      {formatRupiah(parseFloat(data.cartonUnit))}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Label>Total Price</Label>
                  <div className="text-sm font-bold border border-sky-500 rounded-md flex px-5 items-center justify-center h-9">
                    {formatRupiah(
                      parseFloat(data.cartonQty) * parseFloat(data.cartonUnit)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 border border-gray-500 p-3 rounded">
                <h5 className="pb-3 font-semibold border-b border-gray-500">
                  Voucher
                </h5>
                <div className="flex flex-col gap-1 w-full">
                  <Label>Voucher</Label>
                  <div className="w-full relative flex items-center">
                    <Input
                      className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                      placeholder="0"
                      value={data.voucher}
                      // disabled={loadingSubmit}
                      onChange={(e) =>
                        setData((prev: any) => ({
                          ...prev,
                          voucher: e.target.value.startsWith("0")
                            ? e.target.value.replace(/^0+/, "")
                            : e.target.value,
                        }))
                      }
                    />
                    <p className="absolute right-3 text-xs text-gray-500">
                      {formatRupiah(parseFloat(data.voucher))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col p-3 rounded border border-sky-400/80">
              <div className="flex flex-col">
                <h5 className="font-semibold pb-2 mb-2 border-b">Sale</h5>
                <div className="flex-col flex gap-1 ml-3 group">
                  <div className="flex justify-between items-center group-hover:hover:opacity-100 hover:font-semibold group-hover:opacity-50 ">
                    <p>Barcode</p>
                    <p>{data.barcode}</p>
                  </div>
                  <div className="flex justify-between items-center group-hover:hover:opacity-100 hover:font-semibold group-hover:opacity-50 ">
                    <p>Buyer</p>
                    <p>{data.buyer}</p>
                  </div>
                  <div className="flex justify-between items-center group-hover:hover:opacity-100 hover:font-semibold group-hover:opacity-50 ">
                    <p>Discount</p>
                    <p>{data.discount}%</p>
                  </div>
                  <div className="flex justify-between items-center group-hover:hover:opacity-100 hover:font-semibold group-hover:opacity-50 ">
                    <p>Total Product</p>
                    <p>{data.totalProduct} Products</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <h5 className="font-semibold py-2 my-2 border-y">Carton Box</h5>
                <div className="flex-col flex gap-1 ml-3 group">
                  <div className="flex justify-between items-center group-hover:hover:opacity-100 hover:font-semibold group-hover:opacity-50">
                    <p>Qty</p>
                    <p>{data.cartonQty}</p>
                  </div>
                  <div className="flex justify-between items-center group-hover:hover:opacity-100 hover:font-semibold group-hover:opacity-50">
                    <p>Price Per Unit</p>
                    <p>{formatRupiah(parseFloat(data.cartonUnit))}</p>
                  </div>
                </div>
              </div>
              <div className="flex py-2 my-2 border-y flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold">Total Sale</h5>
                  <p>{formatRupiah(data.totalPrice)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold">Total Carton Box</h5>
                  <p>
                    {formatRupiah(
                      parseFloat(data.cartonQty) * parseFloat(data.cartonUnit)
                    )}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold">Voucher</h5>
                  <p>- {formatRupiah(parseFloat(data.voucher))}</p>
                </div>
              </div>
              <div className="flex items-center text-xl justify-between">
                <h5 className="font-bold">Grand Total</h5>
                <p className="font-semibold">
                  {formatRupiah(
                    parseFloat(data.totalPrice) +
                      parseFloat(data.cartonQty) * parseFloat(data.cartonUnit) -
                      parseFloat(data.voucher)
                  )}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-4 mt-auto">
            <Button
              variant={"outline"}
              className="w-full border-gray-500"
              onClick={(e) => {
                e.preventDefault();
                if (step === 1) {
                  onCloseModal();
                } else {
                  setStep((prev: any) => prev - 1);
                }
              }}
            >
              {step === 1 ? "Cancel" : "Prev"}
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                if (step === 2) {
                  handleSubmit();
                } else {
                  setStep((prev: any) => prev + 1);
                }
              }}
              variant={"liquid"}
              className="w-full"
            >
              {step === 2 ? "Submit" : "Next"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogProceed;
