import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { invalidateQuery, useMutate } from "@/lib/query";

type Body = {
  format_barcode_id: string;
  user_id: string;
};

export const useSubmitMatch = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/panel-spv/add-barcode",
    method: "put",
    onSuccess: (res) => {
      toast.success("User successfully matched");
      invalidateQuery(queryClient, [
        ["list-format-barcode"],
        ["format-barcode-detail", res.data.data.resource.id],
      ]);
    },
    onError: {
      message: "User failed to match",
      title: "MATCH_USER",
    },
  });

  return mutation;
};
