"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Bell,
  Circle,
  Crown,
  LogOut,
  Menu,
  RefreshCw,
  ScanLine,
  Wifi,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { MenuSidebar } from "../sidebar/menu";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie, getCookie, hasCookie } from "cookies-next/client";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { urlWeb } from "@/lib/baseUrl";
import { alertError, cn, setPaginate } from "@/lib/utils";
import { formatDistanceStrict } from "date-fns";
import { id as indonesia } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useGetScan } from "./_api/get-scan";
import Pagination from "../pagination";
import { DataTable } from "../data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "../ui/input";
import { useGetNotifWidget } from "./_api/get-notif-widget";

const Navbar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openScan, setOpenScan] = useState(false);
  const [isNotif, setIsNotif] = useState(false);
  const [profileData, setProfileData] = useState<any>();
  const [ping, setPing] = useState<number | null | "connecting">("connecting");

  const [dataSearch, setDataSearch] = useState("");
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useState(1);
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const handleLogout = () => {
    deleteCookie("profile");
    deleteCookie("accessToken");
    toast.success("Logout successfully");
    router.push("/login");
  };

  const {
    data: dataScan,
    isSuccess: isSuccessScan,
    isError: isErrorScan,
    error: errorScan,
    refetch: refetchScan,
    isLoading: isLoadingScan,
  } = useGetScan({
    p: page,
    q: searchValue,
    role: profileData?.check_scan ?? "false",
    open: openScan,
  });

  const {
    data: dataNotif,
    isError: isErrorNotif,
    error: errorNotif,
    isLoading: isLoadingNotif,
  } = useGetNotifWidget({ open: isNotif });

  const scanData: any[] = useMemo(() => {
    return dataScan?.data?.data?.resource?.data;
  }, [dataScan]);

  const notifData: any[] = useMemo(() => {
    return dataNotif?.data?.data?.resource;
  }, [dataNotif]);

  // get pagetination
  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessScan,
      data: dataScan,
      dataPaginate: dataScan?.data.data.resource,
      setMetaPage: setMetaPage,
      setPage: setPage,
    });
  }, [dataScan]);

  useEffect(() => {
    alertError({
      isError: isErrorScan,
      error: errorScan as AxiosError,
      action: "get data",
      data: "Scan Data",
      method: "GET",
    });
  }, [isErrorScan, errorScan]);

  useEffect(() => {
    alertError({
      isError: isErrorNotif,
      error: errorNotif as AxiosError,
      action: "get data",
      data: "Notif Data",
      method: "GET",
    });
  }, [isErrorNotif, errorNotif]);

  const handleGetSpeed = async () => {
    const startTime = performance.now();
    try {
      await axios.get(
        `${urlWeb}/storage/image-for-check-connection/423kb_image.png`,
        { responseType: "blob" }
      );
      const endTime = performance.now();
      const duration = endTime - startTime;
      setPing(Math.round(duration));
    } catch (err: any) {
      console.log("ERROR_GET_PING:", err);
      setPing(null);
    }
  };

  useEffect(() => {
    if (hasCookie("profile")) {
      const data = JSON.parse(getCookie("profile") ?? "");
      setProfileData(data);
    }
  }, [hasCookie("profile")]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleGetSpeed();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const columnListScan: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPage.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "total_scans_today",
      header: () => <div className="text-center">Scan Today</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_scans_today?.toLocaleString() ?? "-"}
        </div>
      ),
    },
  ];

  if (!isMounted) {
    return (
      <div className="w-full h-16 shadow-md flex justify-between items-center px-4 gap-4 py-2 flex-none bg-white border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-md xl:hidden" />
          <Link href={"/"}>
            <button
              type="button"
              className="flex items-center leading-none h-10 transition-all rounded-md justify-start"
            >
              <h3 className="w-40 relative aspect-[260/87]">
                <Image src={"/images/liquid8.png"} alt="" fill />
              </h3>
            </button>
          </Link>
        </div>
        <div className="flex gap-4 h-full items-center">
          <Skeleton className="w-28 h-6 rounded-full" />
          <Separator orientation="vertical" />
          <div className="flex items-center text-sm gap-3">
            <Skeleton className="w-7 h-7 rounded-full" />
            <div className="flex flex-col min-w-24 gap-1">
              <Skeleton className="w-16 h-3 rounded-full" />
              <Skeleton className="w-24 h-3 rounded-full" />
            </div>
          </div>
          <Separator orientation="vertical" />
          <div className="flex gap-2 items-center">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          <Separator orientation="vertical" />
          <Skeleton className="w-8 h-8 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-16 shadow-md flex justify-between items-center px-4 gap-4 py-2 flex-none bg-white border-b">
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size={"icon"} variant={"outline"} className="xl:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="bg-white overflow-y-scroll w-80 p-0"
            side={"left"}
          >
            <SheetHeader className="px-5 py-3">
              <SheetTitle className="text-lg font-bold text-black flex items-center">
                <Menu className="w-5 h-5 mr-2" />
                Navigation
              </SheetTitle>
            </SheetHeader>
            <MenuSidebar pathname={pathname} setOpen={setOpen} />
          </SheetContent>
        </Sheet>
        <Link href={"/"}>
          <button
            type="button"
            className="flex items-center leading-none h-10 transition-all rounded-md justify-start"
          >
            <h3 className="w-40 relative aspect-[260/87]">
              <Image src={"/images/liquid8.png"} alt="" fill />
            </h3>
          </button>
        </Link>
      </div>
      <div className="flex gap-4 h-full items-center">
        <div>
          <Badge className="bg-sky-500 hover:bg-sky-500 text-white rounded-full gap-2 p-1 pr-2">
            <div className="h-4 w-4 bg-white flex items-center justify-center text-yellow-500 rounded-full">
              <Crown className="w-2.5 h-2.5 fill-yellow-500" />
            </div>
            {profileData?.role_name}
          </Badge>
        </div>
        <Separator orientation="vertical" />
        <div className="flex items-center text-sm gap-3">
          <div className="w-7 h-7 relative ">
            <Image
              className="object-cover"
              src={"/images/liquid.png"}
              alt=""
              fill
            />
          </div>
          <div className="flex flex-col min-w-24 gap-1">
            <p className="capitalize font-semibold leading-none">
              {profileData?.name}
            </p>
            <p className="lowercase text-xs text-gray-500 font-light leading-none">
              {profileData?.email}
            </p>
          </div>
        </div>
        <Separator orientation="vertical" />
        <div className="flex gap-2 items-center">
          <TooltipProviderPage
            className="bg-white border text-black"
            sideOffset={15}
            value={
              <div
                className={cn(
                  "flex items-center gap-2 relative",
                  ping === null && "*:bg-red-500",
                  ping === "connecting" && "*:bg-sky-500",
                  ping !== "connecting" &&
                    ping &&
                    ping < 80 &&
                    "*:bg-green-500",
                  ping !== "connecting" &&
                    ping &&
                    ping > 80 &&
                    "*:bg-yellow-500"
                )}
              >
                <div className="w-3 h-3 rounded-full relative" />
                <div className="w-3 h-3 rounded-full absolute animate-ping opacity-75" />
                <p className="!bg-transparent">
                  {ping !== "connecting" && ping && ping + " ms"}
                  {ping === "connecting" && "connecting..."}
                  {!ping && "error"}
                </p>
              </div>
            }
          >
            <div
              className={cn(
                "flex h-8 w-auto items-center justify-center shadow rounded-full px-2 gap-2  border ",
                ping === null && "bg-red-50 border-red-500 text-red-500",
                ping === "connecting" &&
                  "bg-sky-50 border-sky-500 text-sky-500",
                ping !== "connecting" &&
                  ping &&
                  ping < 80 &&
                  "bg-green-50 border-green-500 text-green-500",
                ping !== "connecting" &&
                  ping &&
                  ping > 80 &&
                  "bg-yellow-50 border-yellow-500 text-yellow-500"
              )}
            >
              <Wifi className="w-4 h-4" />
            </div>
          </TooltipProviderPage>
          <Popover open={isNotif} onOpenChange={setIsNotif}>
            <PopoverTrigger asChild>
              <Button
                disabled={isLoadingNotif}
                className="w-8 h-8 p-0 rounded-full bg-transparent hover:bg-gray-50 text-black relative border-sky-400 border"
              >
                <Bell className="w-4 h-4" />
                <div className="w-2.5 h-2.5 rounded-full absolute -top-[0.5px] -right-[0.5px] bg-sky-500" />
                <div className="w-2.5 h-2.5 rounded-full absolute -top-[0.5px] -right-[0.5px] bg-sky-500 animate-ping opacity-75" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-1 gap-1 flex flex-col w-full max-w-2xl"
              align="end"
              sideOffset={15}
            >
              <div className="flex justify-between w-full items-center px-2.5 py-1">
                <p className="text-sm font-semibold">Notification</p>
                <Button
                  asChild
                  type="button"
                  onClick={() => {
                    setIsNotif(false);
                  }}
                  className="text-xs h-auto py-1 px-2 bg-sky-400/80 hover:bg-sky-400 font-normal rounded-sm text-black"
                >
                  <Link href={"/notification"}>Read More</Link>
                </Button>
              </div>
              <Separator />
              {notifData?.map((item) => (
                <div
                  key={item.id}
                  className=" flex hover:bg-gray-50 px-2.5 py-2 rounded items-center cursor-default justify-between"
                >
                  <div
                    className={cn(
                      "flex-col flex border-l-4 pl-2",
                      item.status === "done" && "border-green-500",
                      item.status === "pending" && "border-yellow-500",
                      item.status === "display" && "border-sky-500",
                      item.status === "sale" && "border-indigo-500"
                    )}
                  >
                    <p className="text-xs capitalize flex gap-1">
                      {item.notification_name}
                      <span className="font-semibold underline">
                        {item.status === "sale" && item.approved === "0"
                          ? " - Required"
                          : ""}
                        {item.status === "sale" && item.approved === "1"
                          ? " - Rejected"
                          : ""}
                        {item.status === "sale" && item.approved === "2"
                          ? " - Approved"
                          : ""}
                      </span>
                    </p>
                    <p className="text-xs font-light text-gray-500">
                      {formatDistanceStrict(
                        new Date(item.created_at),
                        new Date(),
                        {
                          addSuffix: true,
                          locale: indonesia,
                        }
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex border-t text-xs ">
                <div className="flex items-center w-full px-2.5 pt-2 pb-1 justify-center">
                  <Circle className="size-3 mr-2 fill-yellow-500 text-transparent" />
                  <p>Pending</p>
                </div>
                <div className="flex items-center w-full border-x border-gray-300 px-2.5 pt-2 pb-1 justify-center">
                  <Circle className="size-3 mr-2 fill-green-500 text-transparent" />
                  <p>Done</p>
                </div>
                <div className="flex items-center w-full border-r border-gray-300 px-2.5 pt-2 pb-1 justify-center">
                  <Circle className="size-3 mr-2 fill-sky-500 text-transparent" />
                  <p>Display</p>
                </div>
                <div className="flex items-center w-full px-2.5 pt-2 pb-1 justify-center">
                  <Circle className="size-3 mr-2 fill-indigo-500 text-transparent" />
                  <p>Sale</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {profileData?.check_scan === "true" && (
            <Dialog open={openScan} onOpenChange={setOpenScan}>
              <TooltipProviderPage
                value="Monitoring Scan"
                className="bg-white border text-black"
                align="end"
                sideOffset={15}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={isLoadingScan}
                    className="w-8 h-8 p-0 rounded-full bg-transparent hover:bg-gray-50 text-black relative border border-amber-500"
                  >
                    <ScanLine className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              </TooltipProviderPage>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Monitoring Scan</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-3 w-full">
                  <Input
                    className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                    value={dataSearch}
                    onChange={(e) => setDataSearch(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                  />
                  <TooltipProviderPage value={"Reload Data"}>
                    <Button
                      onClick={() => refetchScan()}
                      className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                      variant={"outline"}
                    >
                      <RefreshCw
                        className={cn(
                          "w-4 h-4",
                          isLoadingScan ? "animate-spin" : ""
                        )}
                      />
                    </Button>
                  </TooltipProviderPage>
                </div>
                <DataTable
                  columns={columnListScan}
                  data={scanData ?? []}
                  isLoading={isLoadingScan}
                  isSticky
                  maxHeight="max-h-[60vh]"
                />
                <Pagination
                  pagination={{ ...metaPage, current: page }}
                  setPagination={setPage}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Separator orientation="vertical" />
        <TooltipProviderPage value="Logout" align="end" sideOffset={15}>
          <Button
            type="button"
            onClick={handleLogout}
            className="w-8 h-8 p-0 bg-red-100 text-red-500 hover:bg-red-200"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </TooltipProviderPage>
      </div>
    </div>
  );
};

export default Navbar;
