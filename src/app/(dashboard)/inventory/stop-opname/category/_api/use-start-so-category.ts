import { toast } from "sonner";

import { useMutate } from "@/lib/query";

export const useStartSOCategory = () => {
  const mutation = useMutate({
    endpoint: "/start_so",
    method: "post",
    onSuccess: () => {
      toast.success("SO Category successfully started");
    },
    onError: {
      message: "SO Category failed to start",
      title: "START_SO_CATEGORY",
    },
  });
  return mutation;
};
