import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;
type RequestType = {
  body: any;
};

export const useExportBuyer = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/export-buyers/request`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: (res) => {
      toast.success(
        `${res?.data?.data?.message || "Buyer successfully exported"}`
      );
      queryClient.invalidateQueries({
        queryKey: ["list-filter-export-buyers-approvals"],
      });
    },
    onError: (err) => {
      if (err.response?.status === 403) {
        toast.error(
          `Error 403: Restricted Access, ${
            (err?.response?.data as any).message
          }`
        );
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err?.response?.data as any).message || "Buyer failed to export"
          }`
        );
        console.log("ERROR_EXPORT_BUYER:", err);
      }
    },
  });
  return mutation;
};
