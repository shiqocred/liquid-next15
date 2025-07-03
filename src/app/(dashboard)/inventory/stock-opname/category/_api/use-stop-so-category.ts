import { toast } from "sonner";
import { useMutate } from "@/lib/query";

export const useStopSOCategory = () => {
  const mutation = useMutate({
    endpoint: "/stop_so",
    method: "put",
    onSuccess: () => {
      toast.success("SO Category successfully stoped");
    },
    onError: {
      message: "SO Category failed to stop",
      title: "STOP_SO_CATEGORY",
    },
  });
  return mutation;
};
