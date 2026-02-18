import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;
type SubmitDocumentSkuPayload = {
  code_document: string;
};

export const useSubmitDocumentSku = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, SubmitDocumentSkuPayload>({
    mutationFn: async (payload) => {
      const res = await axios.post(`${baseUrl}/sku-product-old`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Document SKU successfully submited");
      window.location.href = "/inventory/product/sku";
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err.response?.data as any).data.message || "Product failed to submit"
          } `,
        );
        console.log("ERROR_CREATE_MIGRATE_CATEGORY:", err);
      }
    },
  });
  return mutation;
};
