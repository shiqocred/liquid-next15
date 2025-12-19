"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React from "react";

const MapPicker = dynamic(
  () => import("../../../../../../components/map-picker"),
  { ssr: false }
);

const DialogCreateEdit = ({
  open,
  onCloseModal,
  warehouseId,
  address,
  setAddress,
  input,
  setInput,
  handleClose,
  handleCreate,
  handleUpdate,
}: {
  open: boolean;
  onCloseModal: () => void;
  warehouseId: any;
  address: any;
  setAddress: any;
  input: any;
  setInput: any;
  handleClose: () => void;
  handleCreate: any;
  handleUpdate: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {warehouseId ? "Edit Warehouse" : "Create Warehouse"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex w-full gap-4">
          <MapPicker input={address} setInput={setAddress} />
          <form
            onSubmit={!warehouseId ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Warehouse name..."
                  value={input.name}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>No. Phone</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="088888888888"
                  value={input.phone}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Address</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Address..."
                  value={input.address}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Kecamatan</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Kecamatan..."
                  value={input.kecamatan}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      kecamatan: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Kabupaten</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Kabupaten..."
                  value={input.kabupaten}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      kabupaten: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Provinsi</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Provinsi..."
                  value={input.provinsi}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      provinsi: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="w-full flex items-center gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <Label>Latitude</Label>
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    value={input.latitude}
                    // disabled={loadingSubmit}
                    type="number"
                    onChange={(e) => {
                      setInput((prev: any) => ({
                        ...prev,
                        latitude: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }));
                      setAddress((prev: any) => ({
                        ...prev,
                        latitude: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Label>Longitude</Label>
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    value={input.longitude}
                    type="number"
                    // disabled={loadingSubmit}
                    onChange={(e) => {
                      setInput((prev: any) => ({
                        ...prev,
                        longitude: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }));
                      setAddress((prev: any) => ({
                        ...prev,
                        longitude: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "text-black w-full",
                  warehouseId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={
                  !input.name ||
                  !input.address ||
                  !input.kabupaten ||
                  !input.kecamatan ||
                  !input.latitude ||
                  !input.longitude ||
                  !input.phone ||
                  !input.provinsi
                }
              >
                {warehouseId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEdit;
