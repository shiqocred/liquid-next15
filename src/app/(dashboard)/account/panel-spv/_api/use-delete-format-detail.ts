import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { invalidateQuery, useMutate } from "@/lib/query";

export const useDeleteFormatBarcode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, { id: string }>({
    endpoint: "/format-barcodes/:id",
    method: "delete",
    onSuccess: (res) => {
      toast.success("Format successfully deleted");
      invalidateQuery(queryClient, [
        ["list-format-barcode"],
        ["select-panel-spv"],
        ["format-barcode-detail", res.data.data.resource.id],
      ]);
    },
    onError: {
      message: "Format failed to delete",
      title: "DELETE_FORMAT",
    },
  });

  return mutation;
};
