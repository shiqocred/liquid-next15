import { toast } from "sonner";
import { useMutate } from "@/lib/query";

export const useExportDMG = (id: number) => {
  return useMutate<any, undefined>({
    endpoint: `/damaged/${id}/export`,
    method: "get",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      title: "EXPORT_DMG_DATA",
      message: "Export DMG Data failed to export",
    },
  });
};
