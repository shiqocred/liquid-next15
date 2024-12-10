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

export const useRemoveFilterProductInput = () => {
  const accessToken = useCookies().get("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.delete(
        `${baseUrl}/filter-product-input/destroy/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully removed to filter");
      queryClient.invalidateQueries({ queryKey: ["list-product-input"] });
      queryClient.invalidateQueries({
        queryKey: ["list-filter-product-input"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Product failed to remove to filter`);
        console.log("ERROR_REMOVE_FILTER_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
