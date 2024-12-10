import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type RequestType = {
  code_document: any;
  headerMappings: {
    old_barcode_product: string[];
    old_name_product: string[];
    old_quantity_product: string[];
    old_price_product: string[];
  };
};

type Error = AxiosError;

export const useMergeHeader = () => {
  const accessToken = useCookies().get("accessToken");
  const router = useRouter();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (value) => {
      const res = await axios.post(`${baseUrl}/generate/merge-headers`, value, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("File successfully merged");
      router.push("/inbound/check-product/manifest-inbound");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`Error ${err?.response?.status}: failed to merge file`);
        console.log("ERROR_MERGE_FILE:", err);
      }
    },
  });
  return mutation;
};
