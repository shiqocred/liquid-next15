import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: any;
};
type Error = AxiosError;

export const useProceeedImage = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`/api/proceed-image`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Image successfully proceed");
    },
    onError: (err) => {
      toast.error(`ERROR ${err?.status}: Image failed to process`);
      console.log("ERROR_PROCEED_PALET:", err);
    },
  });
  return mutation;
};
