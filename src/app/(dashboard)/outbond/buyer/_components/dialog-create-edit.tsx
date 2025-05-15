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
import React, { useEffect, useState } from "react";
import { useAddBuyerPoints } from "../_api/use-add-point-buyer";
import { useReduceBuyerPoints } from "../_api/use-reduce-point-buyer";

const MapPicker = dynamic(
  () => import("../../../../../components/map-picker"),
  { ssr: false }
);

const DialogCreateEdit = ({
  open,
  onCloseModal,
  buyerId,
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
  buyerId: any;
  address: any;
  setAddress: any;
  input: any;
  setInput: any;
  handleClose: () => void;
  handleCreate: any;
  handleUpdate: any;
}) => {
  const [point, setPoint] = useState(0); // State for buyer points

  // Fetch initial points when editing
  useEffect(() => {
    if (buyerId) {
      setPoint(input.points || 0); // Assume `input.points` contains the buyer's current points
    }
  }, [buyerId, input]);

  const { mutate: addPoints, isPending: isAddingPoints } = useAddBuyerPoints();
  const { mutate: reducePoints, isPending: isReducingPoints } =
    useReduceBuyerPoints();

  // Handle Add Points
  const handleAddPoints = () => {
    if (!buyerId) return;

    addPoints(
      { id: buyerId, point_buyer: point },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  // Handle Reduce Points
  const handleReducePoints = () => {
    if (!buyerId) return;

    reducePoints(
      { id: buyerId, point_buyer: point },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{buyerId ? "Edit Buyer" : "Create Buyer"}</DialogTitle>
        </DialogHeader>
        <div className="flex w-full gap-4">
          <MapPicker input={address} setInput={setAddress} />
          <form
            onSubmit={!buyerId ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Buyer name..."
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
                <Label>Total Points Now</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Point buyer..."
                  value={input.point_buyer}
                  disabled={true}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Change Points</Label>
                <div className="flex items-center gap-2">
                  <Input
                    className="text-center w-20 border-sky-400/80 focus-visible:ring-0"
                    type="number"
                    value={point}
                    onChange={(e) => setPoint(Number(e.target.value))}
                  />
                  <Button
                    className="bg-green-400 hover:bg-green-500 text-white"
                    type="button"
                    onClick={handleAddPoints}
                    disabled={isAddingPoints}
                  >
                    {isAddingPoints ? "Adding..." : "Add Points"}
                  </Button>
                  <Button
                    className="bg-red-400 hover:bg-red-500 text-white"
                    type="button"
                    onClick={handleReducePoints}
                    disabled={isReducingPoints}
                  >
                    {isReducingPoints ? "Reducing..." : "Reduce Points"}
                  </Button>
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
                  buyerId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={!input.name || !input.address || !input.phone}
              >
                {buyerId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEdit;
