import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
};

type Error = AxiosError;

export const useRemoveProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ idProduct, idDocument }) => {
      const res = await axios.delete(
        `${baseUrl}/sale-document/${idDocument}/${idProduct}/delete-product`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully removed");
      queryClient.invalidateQueries({ queryKey: ["list-product-cashier"] });
      queryClient.invalidateQueries({
        queryKey: ["list-detail-cashier"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Product failed to remove`);
        console.log("ERROR_REMOVE_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
