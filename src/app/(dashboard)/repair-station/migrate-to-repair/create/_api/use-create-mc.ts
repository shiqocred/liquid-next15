import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useCreateMC = () => {
  const accessToken = getCookie("accessToken");

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
      toast.success("Migrate to Repair successfully created");
      window.location.href = "/repair-station/migrate-to-repair";
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Migrate to Repair failed to create`);
        console.log("ERROR_CREATE_MIGRATE_CATEGORY:", err);
      }
    },
  });
  return mutation;
};
