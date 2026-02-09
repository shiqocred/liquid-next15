import { toast } from "sonner";
import { useMutate } from "@/lib/query";

export const useExportSKU = (id: number) => {
  return useMutate<any, undefined>({
    endpoint: `/sku-product-old/${id}/export`,
    method: "get",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      title: "EXPORT_SKU_DATA",
      message: "Export SKU Data failed to export",
    },
  });
};
