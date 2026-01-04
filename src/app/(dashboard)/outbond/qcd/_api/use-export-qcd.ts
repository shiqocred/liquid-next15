import { toast } from "sonner";
import { useMutate } from "@/lib/query";

export const useExportQcd = (id: number) => {
  return useMutate<any, undefined>({
    endpoint: `/scrap/${id}/export`,
    method: "get",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      title: "EXPORT_QCD_DATA",
      message: "Export QCD Data failed to export",
    },
  });
};
