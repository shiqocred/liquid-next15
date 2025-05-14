import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { getCookie } from "cookies-next/client";
import { useMutation } from "@tanstack/react-query";

import { baseUrl } from "@/lib/baseUrl";

type RequestType = {
  id: string;
};

type Error = AxiosError;

export const useApproveEditProduct = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.post(
        `${baseUrl}/approve-edit/${id}`,
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
      toast.success("Edit product successfully approved");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Edit product failed to approve`);
        console.log("ERROR_APPROVE_EDIT_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
