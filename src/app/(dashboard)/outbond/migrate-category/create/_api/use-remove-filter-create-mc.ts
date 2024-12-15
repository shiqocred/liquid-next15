import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type RequestType = {
  id: string;
};

type Error = AxiosError;

export const useRemoveFilterCreateMC = () => {
  const accessToken = useCookies().get("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.delete(
        `${baseUrl}/migrate-bulky-product/${id}/delete`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully removed from filter");
      queryClient.invalidateQueries({ queryKey: ["list-create-mc"] });
      queryClient.invalidateQueries({
        queryKey: ["list-filter-create-mc"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: Product failed to remove from filter`
        );
        console.log("ERROR_REMOVE_FILTER_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
