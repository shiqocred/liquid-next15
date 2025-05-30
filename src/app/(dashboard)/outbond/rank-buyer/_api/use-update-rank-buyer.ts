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

export const useUpdateRankBuyer = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body }) => {
      const res = await axios.put(`${baseUrl}/loyalty_ranks/${id}`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: (res) => {
      toast.success("Buyer successfully updated");
      queryClient.invalidateQueries({ queryKey: ["list-rank-buyer"] });
      queryClient.invalidateQueries({
        queryKey: ["rank-buyer-detail", res.data.data.resource.id],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Buyer failed to update`);
        console.log("ERROR_UPDATE_RANK_BUYER:", err);
      }
    },
  });
  return mutation;
};
