import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";
import { invalidateQuery } from "@/lib/query";

type RequestType = {
  id: string;
};
type Error = AxiosError;

export const useFinish = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.post(
        `${baseUrl}/scrap/${id}/lock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: (res) => {
      toast.success("Qcd successfully locked");
      invalidateQuery(queryClient, [["list-qcd"]]);
      invalidateQuery(queryClient, [
        ["list-detail-qcd", res.data.data.resource.id],
      ]);
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Qcd failed to finish`);
        console.log("ERROR_Finish_QCD:", err);
      }
    },
  });
  return mutation;
};
