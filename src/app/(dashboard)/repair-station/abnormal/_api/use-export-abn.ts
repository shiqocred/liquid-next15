import { toast } from "sonner";
import { useMutate } from "@/lib/query";

export const useExportABN = (id: number) => {
  return useMutate<any, undefined>({
    endpoint: `/abnormal/${id}/export`,
    method: "get",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      title: "EXPORT_ABNORMAL_DATA",
      message: "Export Abnormal Data failed to export",
    },
  });
};
