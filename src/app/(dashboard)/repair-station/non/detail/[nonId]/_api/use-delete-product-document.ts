import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  non_document_id: string;
  product_id: string;
  source: string;
};

type Error = AxiosError;

export const useRemoveProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (body) => {
      const res = await axios.delete(`${baseUrl}/non/remove-product`, {
        data: body, 
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully removed");
      queryClient.invalidateQueries({ queryKey: ["list-data-dmg"] });
    },
    onError: (err) => {
      toast.error(
        `ERROR ${err?.status}: ${
          (err.response?.data as any)?.data?.message ||
          "Failed to remove product"
        }`
      );
      console.error("ERROR_REMOVE_PRODUCT:", err);
    },
  });
};
