import { toast } from "sonner";
import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateFormatBarcode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<{ format: string }>({
    endpoint: "/format-barcodes",
    method: "post",
    onSuccess: (res) => {
      toast.success("Format successfully created");
      invalidateQuery(queryClient, [
        ["list-format-barcode"],
        ["select-panel-spv"],
        ["format-barcode-detail", res.data.data.resource.id],
      ]);
    },
    onError: {
      message: "Format failed to create",
      title: "CREATE_FORMAT",
    },
  });

  return mutation;
};
