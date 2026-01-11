import { toast } from "sonner";
import { useMutate } from "@/lib/query";

export const useExportNon = (id: number) => {
  return useMutate<any, undefined>({
    endpoint: `/non/${id}/export`,
    method: "get",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      title: "EXPORT_NON_DATA",
      message: "Export Non Data failed to export",
    },
  });
};
