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

export const useStaffExportBuyer = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.get(`${baseUrl}/export-buyers/download/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully exported");
      queryClient.invalidateQueries({
        queryKey: ["list-filter-export-buyers-approvals"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(
          `Error 403: Restricted Access, ${
            (err?.response?.data as any).message
          }`
        );
      } else {
        toast.error(`ERROR ${err?.status}: failed to export buyer`);
        console.log("ERROR_EXPORT_FILTER_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
