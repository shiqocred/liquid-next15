import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useStartSOCategory = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, any>({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseUrl}/start_so`,
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
      toast.success("SO Category successfully started");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err?.response?.data as any)?.data?.message ??
            "SO Category failed to start"
          }`
        );
        console.log("ERROR_START_SO_Category:", err);
      }
    },
  });
  return mutation;
};
