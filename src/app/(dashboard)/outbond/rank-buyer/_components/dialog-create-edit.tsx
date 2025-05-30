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

const DialogCreateEdit = ({
  open,
  onCloseModal,
  rankBuyerId,
  input,
  setInput,
  handleClose,
  handleCreate,
  handleUpdate,
}: {
  open: boolean;
  onCloseModal: () => void;
  rankBuyerId: any;
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
            {rankBuyerId ? "Edit Rank Buyer" : "Create Rank Buyer"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex w-full gap-4">
          <form
            onSubmit={!rankBuyerId ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Rank</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Rank..."
                  value={input.rank}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      rank: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Min Transactions</Label>
                <Input
                  type="number"
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  value={input.min_transactions}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      min_transactions: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Min Amount Transaction</Label>
                <Input
                  type="number"
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="5000000"
                  value={input.min_amount_transaction}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      min_amount_transaction: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Percentage Discount</Label>
                <Input
                  type="number"
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  value={input.percentage_discount}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      percentage_discount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Expired Weeks</Label>
                <Input
                  type="number"
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  value={input.expired_weeks}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      expired_weeks: Number(e.target.value),
                    }))
                  }
                />
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
                  rankBuyerId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                // disabled={!input.name || !input.address || !input.phone}
              >
                {rankBuyerId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEdit;
