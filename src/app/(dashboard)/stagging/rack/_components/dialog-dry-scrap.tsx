import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import React, { useState } from "react";
import { useLPRProductStaging } from "../_api/use-lpr-product-staging";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

export const DialogDryScrap = ({
  open,
  productId,
  onOpenChange,
}: {
  open: boolean;
  productId: string;
  onOpenChange: () => void;
}) => {
  const { mutate: mutateToLPR, isPending: isPendingToLPR } =
    useLPRProductStaging();

  const [reason, setReason] = useState("");

  const handleDryScrap = () => {
    mutateToLPR(
      {
        id: productId,
        status: "dry_scrap",
        description: reason,
      },
      {
        onSuccess: () => {
          setReason("");
          onOpenChange();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClose={false}
        className="max-w-xl"
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Dry Scrap Product
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

        <div className="flex flex-col gap-4">
          <div className="flex flex-col w-full gap-1">
            <Label>Description</Label>
            <Textarea
              disabled={isPendingToLPR}
              rows={6}
              placeholder="Type reason for dry scrap"
              className="resize-none border border-sky-400/80 focus-visible:ring-transparent focus-visible:outline-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button
            disabled={isPendingToLPR}
            className="bg-red-400/80 hover:bg-red-400 text-black"
            onClick={() => handleDryScrap()}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
