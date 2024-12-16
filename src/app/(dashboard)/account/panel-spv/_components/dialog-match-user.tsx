"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  PopoverPortal,
  PopoverPortalContent,
  PopoverPortalTrigger,
} from "@/components/ui/popover-portal";
import { ChevronDown, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

const DialogMatchUser = ({
  open,
  onCloseModal,
  format,
  users,
  input,
  setInput,
  isLoading,
  handleClose,
  handleSubmit,
}: {
  open: boolean;
  onCloseModal: () => void;
  format: any[];
  users: any[];
  input: any;
  setInput: any;
  isLoading: boolean;
  handleClose: () => void;
  handleSubmit: any;
}) => {
  const [isFormat, setIsFormat] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsFormat(false);
      setIsOpen(false);
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Match User</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="h-[420px] flex items-center justify-center">
            <Loader className="size-5 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Format</Label>
                <PopoverPortal open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverPortalTrigger asChild>
                    <Button className="justify-between border-b bg-transparent hover:bg-transparent text-black shadow-none border-sky-400/80 rounded-none">
                      <p>
                        {input.formatId
                          ? format.find((item) => item.id === input.formatId)
                              ?.format
                          : "Select Format"}
                      </p>
                      <ChevronDown className="size-4" />
                    </Button>
                  </PopoverPortalTrigger>
                  <PopoverPortalContent
                    className="p-0"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                  >
                    <Command>
                      <CommandInput placeholder="Search Format..." />
                      <CommandList>
                        <CommandEmpty>No Data Found.</CommandEmpty>
                        <CommandGroup>
                          {format.map((item) => (
                            <CommandItem
                              onSelect={() => {
                                setIsOpen(false);
                                setInput((prev: any) => ({
                                  ...prev,
                                  formatId: item.id,
                                }));
                              }}
                              key={item.id}
                            >
                              {item.format}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverPortalContent>
                </PopoverPortal>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>User</Label>
                <PopoverPortal open={isFormat} onOpenChange={setIsFormat}>
                  <PopoverPortalTrigger asChild>
                    <Button className="justify-between border-b bg-transparent hover:bg-transparent text-black shadow-none border-sky-400/80 rounded-none">
                      <p>
                        {input.userId
                          ? users.find((item) => item.id === input.userId)?.name
                          : "Select User"}
                      </p>
                      <ChevronDown className="size-4" />
                    </Button>
                  </PopoverPortalTrigger>
                  <PopoverPortalContent
                    className="p-0"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                  >
                    <Command>
                      <CommandInput placeholder="Search User..." />
                      <CommandList>
                        <CommandEmpty>No Data Found.</CommandEmpty>
                        <CommandGroup>
                          {users.map((item) => (
                            <CommandItem
                              onSelect={() => {
                                setIsFormat(false);
                                setInput((prev: any) => ({
                                  ...prev,
                                  userId: item.id,
                                }));
                              }}
                              key={item.id}
                            >
                              {item.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverPortalContent>
                </PopoverPortal>
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
                className="text-black w-full bg-sky-400 hover:bg-sky-400/80"
                type="submit"
                disabled={!input.userId || !input.formatId}
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogMatchUser;
