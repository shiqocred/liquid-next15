import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type RequestType = {
  body: any;
};

type Error = AxiosError;

export const useCreateBuyer = () => {
  const accessToken = useCookies().get("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/buyers`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: (res) => {
      toast.success("Buyer successfully created");
      queryClient.invalidateQueries({ queryKey: ["list-buyer"] });
      queryClient.invalidateQueries({
        queryKey: ["buyer-detail", res.data.data.resource.id],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Buyer failed to create`);
        console.log("ERROR_CREATE_BUYER:", err);
      }
    },
  });
  return mutation;
};
