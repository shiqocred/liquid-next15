import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: any;
};

type Error = AxiosError;

export const useAddProductB2B = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/bulky-sales`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfuly added to B2B");
      queryClient.invalidateQueries({
        queryKey: ["list-sale-b2b"],
      });
      queryClient.invalidateQueries({
        queryKey: ["list-product-b2b"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR: ${
            (err?.response?.data as any)?.data?.message ??
            "Failed to add Product to B2B"
          }`
        );
        console.log("ERROR_ADD_PRODUCT_B2B:", err);
      }
    },
  });
  return mutation;
};
