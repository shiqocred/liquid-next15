import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type RequestType = FormData;

type Error = AxiosError;

export const useUploadInbound = () => {
  const accessToken = useCookies().get("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (value) => {
      const res = await axios.post(`${baseUrl}/generate`, value, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("File successfully uploaded");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`Error ${err?.response?.status}: failed to upload file`);
        console.log("ERROR_GENERATE_FILE:", err);
      }
    },
  });
  return mutation;
};
