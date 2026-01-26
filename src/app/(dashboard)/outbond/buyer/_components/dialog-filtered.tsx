import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTable } from "@/components/data-table";

import { AxiosError } from "axios";
import React, { useEffect, useMemo } from "react";
import { alertError } from "@/lib/utils";
import { useGetListFilterExportBuyerApprovals } from "../_api/use-get-list-filter-export-buyers-approvals";
import { useConfirm } from "@/hooks/use-confirm";
import { useApproveSpvExportBuyer } from "../_api/use-approve-spv-export-buyer";
import { useStaffExportBuyer } from "../_api/use-staff-export-buyer";
import { columnFilteredExportBuyer } from "./columns";
import { usePagination } from "@/lib/pagination";
import Pagination from "@/components/pagination";

export const DialogFiltered = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) => {
  const [ApprovedDialog, confirmApprovedDialog] = useConfirm(
    "Approved Export Buyer",
    "This action cannot be undone",
    "liquid"
  );

  // data search, page
  const { metaPage, page, setPage, setPagination } = usePagination("page");

  const {
    mutate: mutateApproveSpvFilter,
    isPending: isPendingApproveSpvFilter,
  } = useApproveSpvExportBuyer();
  const {
    mutate: mutateStaffExportFilter,
    isPending: isPendingStaffExportFilter,
  } = useStaffExportBuyer();

  const { data, error, isError, isRefetching, isSuccess, isPending } =
    useGetListFilterExportBuyerApprovals({ p: page});

  const isLoading =
    isPendingStaffExportFilter ||
    isPendingApproveSpvFilter ||
    isRefetching ||
    isPending;

  const dataListFiltered: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const handleApproveSpvFilter = async (id: any) => {
    const ok = await confirmApprovedDialog();

    if (!ok) return;
    mutateApproveSpvFilter({ id });
  };

  const handleStaffExportFilter = async (id: any) => {
    mutateStaffExportFilter(
      { id },
      {
        onSuccess: (res: any) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource.download_url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      }
    );
  };

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.resource);
    }
  }, [data]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <ApprovedDialog />
      <SheetContent className="min-w-[75vw]">
        <SheetHeader>
          <SheetTitle>List Export (Filtered)</SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <div className="w-full flex flex-col gap-5 mt-5 text-sm">
          <div className="flex gap-4 items-center w-full">
            {/* <Input
              className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
              value={searchFiltered}
              onChange={(e) => setSearchFiltered(e.target.value)}
              placeholder="Search..."
              autoFocus
            />
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefetching ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage> */}
          </div>
          <DataTable
            isSticky
            columns={columnFilteredExportBuyer({
              metaPage,
              isLoading,
              handleApproveSpvFilter,
              handleStaffExportFilter,
            })}
            data={dataListFiltered ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
