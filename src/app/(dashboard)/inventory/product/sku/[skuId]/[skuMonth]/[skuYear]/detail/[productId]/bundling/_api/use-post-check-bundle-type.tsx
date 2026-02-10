import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  product_id: string;
  items_per_bundle: string;
  selected_type: string;
};

type ResponseType = {
  message: string;
  is_mismatch: any;
  data: {
    is_mismatch: boolean;
    message?: string;
  };
};

type Error = AxiosError;

export const useCheckBundleType = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<
    AxiosResponse<ResponseType>,
    Error,
    RequestType
  >({
    mutationFn: async (value) => {
      const res = await axios.post(
        `${baseUrl}/sku-products/check-type`,
        value,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },

    onError: (err) => {
      if (err.status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err.response?.data as any)?.data?.message ||
            "Gagal cek tipe bundle"
          }`,
        );
        console.error("ERROR_CHECK_BUNDLE_TYPE:", err);
      }
    },
  });

  return mutation;
};
