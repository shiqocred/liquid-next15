import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { invalidateQuery, useMutate } from "@/lib/query";

type Body = {
  format: string;
  total_scan: any;
  total_user: any;
};

type Params = { id: string };

export const useUpdateFormatBarcode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/format-barcodes/:id",
    method: "put",
    onSuccess: (res) => {
      toast.success("Format successfully updated");
      invalidateQuery(queryClient, [
        ["list-format-barcode"],
        ["select-panel-spv"],
        ["format-barcode-detail", res.data.data.resource.id],
      ]);
    },
    onError: {
      message: "Format failed to update",
      title: "UPDATE_FORMAT",
    },
  });

  return mutation;
};
