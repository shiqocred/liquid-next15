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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PopoverPortal,
  PopoverPortalContent,
  PopoverPortalTrigger,
} from "@/components/ui/popover-portal";
import { cn } from "@/lib/utils";
import { ChevronDown, Eye, EyeOff, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

const DialogCreateEdit = ({
  open,
  onCloseModal,
  userId,
  role,
  input,
  setInput,
  isLoading,
  handleClose,
  handleCreate,
  handleUpdate,
}: {
  open: boolean;
  onCloseModal: () => void;
  role: any[];
  userId: any;
  input: any;
  setInput: any;
  isLoading: boolean;
  handleClose: () => void;
  handleCreate: any;
  handleUpdate: any;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      setIsOpen(false);
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {userId ? "Edit Account" : "Create Account"}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="h-[420px] flex items-center justify-center">
            <Loader className="size-5 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={!userId ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Name..."
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
                <Label>Role</Label>
                <PopoverPortal open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverPortalTrigger asChild>
                    <Button className="justify-between border-b bg-transparent hover:bg-transparent text-black shadow-none border-sky-400/80 rounded-none">
                      <p>
                        {input.roleId
                          ? role.find((item) => item.id === input.roleId)
                              ?.role_name
                          : "Select Role"}
                      </p>
                      <ChevronDown className="size-4" />
                    </Button>
                  </PopoverPortalTrigger>
                  <PopoverPortalContent
                    className="p-0"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                  >
                    <Command>
                      <CommandInput placeholder="Search Role..." />
                      <CommandList>
                        <CommandEmpty>No Data Found.</CommandEmpty>
                        <CommandGroup>
                          {role.map((item) => (
                            <CommandItem
                              onSelect={() => {
                                setIsOpen(false);
                                setInput((prev: any) => ({
                                  ...prev,
                                  roleId: item.id,
                                }));
                              }}
                              key={item.id}
                            >
                              {item.role_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverPortalContent>
                </PopoverPortal>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Username</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="username"
                  value={input.username}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Email</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Email..."
                  type="email"
                  value={input.email}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Password</Label>
                <div className="relative w-full flex items-center">
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    placeholder="****"
                    type={isVisible ? "text" : "password"}
                    value={input.password}
                    // disabled={loadingSubmit}
                    onChange={(e) =>
                      setInput((prev: any) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type={"button"}
                    variant={"ghost"}
                    size={"icon"}
                    className="size-fit absolute right-3"
                    onClick={() => setIsVisible(!isVisible)}
                  >
                    {isVisible ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
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
                  userId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={
                  !input.name ||
                  !input.username ||
                  !input.roleId ||
                  !input.email ||
                  (!userId && !input.password)
                }
              >
                {userId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEdit;
