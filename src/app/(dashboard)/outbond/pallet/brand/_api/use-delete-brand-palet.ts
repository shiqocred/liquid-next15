import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
};

type Error = AxiosError;

export const useDeleteBrandPalet = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.delete(`${baseUrl}/product-brands/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: (data) => {
      toast.success("Brand successfully Deleted");
      queryClient.invalidateQueries({ queryKey: ["list-brand-palet"] });
      queryClient.invalidateQueries({
        queryKey: ["brand-palet-detail", data.data.data.resource.id],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Brand failed to delete`);
        console.log("ERROR_DELETE_BRAND:", err);
      }
    },
  });
  return mutation;
};
