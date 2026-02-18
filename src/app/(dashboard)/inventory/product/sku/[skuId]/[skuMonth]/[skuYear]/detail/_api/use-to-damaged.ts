import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: any;
  id: string;
};

type Error = AxiosError;

export const useToDamaged = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body, id }) => {
      const res = await axios.post(`${baseUrl}/sku-products/add-damaged/${id}`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: (res) => {
      toast.success("Product to damaged successfully");
      queryClient.invalidateQueries({ queryKey: ["list-racks"] });
      queryClient.invalidateQueries({ queryKey: ["list-product-staging"] });
      queryClient.invalidateQueries({
        queryKey: ["rack-detail", res.data.data.resource.id],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Product failed to damaged`);
        console.log("ERROR_PRODUCT_TO_DAMAGED:", err);
      }
    },
  });
  return mutation;
};
