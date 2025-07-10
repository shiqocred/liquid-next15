"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

const DialogOnlinePayment = ({
  open,
  onCloseModal,
  input,
  setInput,
  handleSubmit,
}: {
  open: boolean;
  onCloseModal: () => void;
  input: any;
  setInput: any;
  handleSubmit: any;
}) => {
  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Online Payment</DialogTitle>
            <DialogDescription>Re-configurate Online Payment</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="w-full flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1 w-full">
              <Label>Email</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="example@email.com"
                type="email"
                value={input.email}
                onChange={(e) =>
                  setInput((prev: any) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <Label>Payment Type</Label>
              <select
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100 bg-white mb-2"
                value={input.payment_type}
                onChange={(e) =>
                  setInput((prev: any) => ({
                    ...prev,
                    payment_type: e.target.value,
                  }))
                }
                required
              >
                <option value="">Pilih tipe pembayaran</option>
                <option value="single_payment">Single Payment</option>
                <option value="split_payment">Split Payment</option>
              </select>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                onClick={onCloseModal}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="bg-yellow-400 hover:bg-yellow-400/80 text-black w-full"
                type="submit"
              >
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogOnlinePayment;
