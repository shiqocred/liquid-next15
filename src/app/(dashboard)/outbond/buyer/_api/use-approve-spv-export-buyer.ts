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

export const useApproveSpvExportBuyer = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.post(
        `${baseUrl}/export-buyers/action/${id}`,
        {
          action: "approve",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Buyer successfully Approved by SPV");
      queryClient.invalidateQueries({
        queryKey: ["list-filter-export-buyers-approvals"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(
          `Error 403: Restricted Access, ${
            (err?.response?.data as any).data?.message
          }`
        );
      } else {
        toast.error(
          `ERROR ${err?.status}: failed to approved export buyer by spv`
        );
        console.log("ERROR_APPROVE_BUYER_BY_SPV:", err);
      }
    },
  });
  return mutation;
};
