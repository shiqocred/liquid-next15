import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type Error = AxiosError;

export const useExportProductCategory = () => {
  const accessToken = useCookies().get("accessToken");

  const mutation = useMutation<AxiosResponse, Error, "">({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseUrl}/export_product_byCategory`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: Product by Category failed to export`
        );
        console.log("ERROR_EXPORT_PRODUCT_CATEGORY:", err);
      }
    },
  });
  return mutation;
};
