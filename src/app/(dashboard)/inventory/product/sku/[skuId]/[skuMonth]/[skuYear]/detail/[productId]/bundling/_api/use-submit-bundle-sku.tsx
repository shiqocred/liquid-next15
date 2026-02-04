import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  items_per_bundle: string;
  bundle_quantity: string;
  new_category_product?: string;
};

type Error = AxiosError;

export const useAddBundle = ({ id }: any) => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (value) => {
      const res = await axios.post(
        `${baseUrl}/sku-products/add-bundle/${id}`,
        value,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },

    onSuccess: () => {
      toast.success("Bundle berhasil ditambahkan");
    },

    onError: (err) => {
      if (err.status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err.response?.data as any)?.data?.message ||
            "Bundle gagal ditambahkan"
          }`,
        );
        console.error("ERROR_ADD_BUNDLE:", err);
      }
    },
  });

  return mutation;
};
