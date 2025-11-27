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

const DialogRegisterEmail = ({
  open,
  onClose,
  input,
  setInput,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  input: any;
  setInput: any;
  onSubmit: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register Email Baru</DialogTitle>
          <DialogDescription>
            Email belum terdaftar, no telepon wajib diisi apabila buyer belum
            memiliki nomor telepon.{" "}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <Label>Email</Label>
            <Input value={input.email} disabled />
          </div>
          <div>
            <Label>Payment Type</Label>
            <Input value={input.payment_type} disabled />
          </div>
          <div>
            <Label>Nomor Telepon</Label>
            <Input
              value={input.phone_number}
              onChange={(e) =>
                setInput((prev: any) => ({
                  ...prev,
                  phone_number: e.target.value,
                }))
              }
              placeholder="Masukkan nomor telepon"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Register Email</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogRegisterEmail;
