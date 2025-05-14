import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
  point_buyer: number;
};

type Error = AxiosError;

export const useAddBuyerPoints = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, point_buyer }) => {
      const res = await axios.put(
        `${baseUrl}/buyer/add-point/${id}`,
        { point_buyer },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: (res) => {
      toast.success("Points successfully added");
      queryClient.invalidateQueries({ queryKey: ["list-buyer"] });
      queryClient.invalidateQueries({
        queryKey: ["buyer-detail", res.data.data.resource.id],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Failed to add points`);
        console.log("ERROR_ADD_BUYER_POINTS:", err);
      }
    },
  });
  return mutation;
};