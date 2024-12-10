import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type RequestType = {
  id: string;
};

type Error = AxiosError;

export const useDeleteProductSlow = () => {
  const accessToken = useCookies().get("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.delete(`${baseUrl}/new_products/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully Deleted");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Product failed to delete`);
        console.log("ERROR_DELETE_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
