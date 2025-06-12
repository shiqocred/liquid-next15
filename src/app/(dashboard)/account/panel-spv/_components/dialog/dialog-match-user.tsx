"use client";

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PopoverPortal,
  PopoverPortalContent,
  PopoverPortalTrigger,
} from "@/components/ui/popover-portal";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { AxiosError } from "axios";
import { ChevronDown, Loader } from "lucide-react";
import React, { FormEvent, useEffect, useMemo, useState } from "react";

import { useSubmitMatch } from "../../_api/mutation/use-submit-match";
import { useGetSelectPanelSPV } from "../../_api/query/use-get-select";

import { alertError } from "@/lib/utils";

export const DialogMatchUser = ({
  open,
  onCloseModal,
}: {
  open: boolean;
  onCloseModal: () => void;
}) => {
  const initialValue = {
    formatId: "",
    userId: "",
  };
  const [isFormat, setIsFormat] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState(initialValue);

  // mutation data
  const { mutate: mutateSubmit, isPending } = useSubmitMatch();

  // fetching data
  const { data, error, isError, isLoading } = useGetSelectPanelSPV();

  // memoize data
  const dataFormat: any = useMemo(() => {
    return data?.data.data.resource.format_barcode ?? [];
  }, [data]);

  const dataUser: any = useMemo(() => {
    return data?.data.data.resource.users ?? [];
  }, [data]);

  // handle submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const body = {
      format_barcode_id: input.formatId,
      user_id: input.userId,
    };

    mutateSubmit(
      { body },
      {
        onSuccess: () => {
          onCloseModal();
        },
      }
    );
  };

  // isError get select data
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      action: "get data",
      data: "Select",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    if (!open) {
      setIsFormat(false);
      setIsOpen(false);
      setInput(initialValue);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Match User</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        {isPending ? (
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
                    <Button
                      disabled={isLoading}
                      className="justify-between border-b bg-transparent hover:bg-transparent text-black shadow-none border-sky-400/80 rounded-none"
                    >
                      <p>
                        {input.formatId
                          ? dataFormat.find(
                              (item: any) => item.id === input.formatId
                            )?.format
                          : isLoading
                          ? "Loading..."
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
                          {dataFormat.map((item: any) => (
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
                    <Button
                      disabled={isLoading}
                      className="justify-between border-b bg-transparent hover:bg-transparent text-black shadow-none border-sky-400/80 rounded-none"
                    >
                      <p>
                        {input.userId
                          ? dataUser.find(
                              (item: any) => item.id === input.userId
                            )?.name
                          : isLoading
                          ? "Loading..."
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
                          {dataUser.map((item: any) => (
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
                onClick={onCloseModal}
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
