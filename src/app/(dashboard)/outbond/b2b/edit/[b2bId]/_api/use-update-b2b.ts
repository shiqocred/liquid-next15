import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
  body: any;
};

type Error = AxiosError;

export const useUpdateB2B = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body }) => {
      const res = await axios.put(`${baseUrl}/bulky-documents/${id}`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
     onSuccess: () => {
      toast.success("successfuly updated B2B");
      queryClient.invalidateQueries({
        queryKey: ["list-bag-by-user-b2b"],
      });
      queryClient.invalidateQueries({
        queryKey: ["list-product-b2b"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        console
        toast.error(`ERROR ${err?.status}: b2b failed to update`);
        console.log("ERROR_UPDATE_B2B:", err);
      }
    },
  });
  return mutation;
};
