import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type Error = AxiosError;

export const useCreateMC = () => {
  const accessToken = useCookies().get("accessToken");

  const mutation = useMutation<AxiosResponse, Error, any>({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseUrl}/migrate-bulky-finish`,
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
      toast.success("Migrate Category successfully created");
      window.location.href = "/outbond/migrate-category";
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Migrate Category failed to create`);
        console.log("ERROR_CREATE_MIGRATE_CATEGORY:", err);
      }
    },
  });
  return mutation;
};
