import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: any;
};

type Error = AxiosError;

export const useCreateConditionPalet = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/product-conditions`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Condition successfully created");
      queryClient.invalidateQueries({ queryKey: ["list-condition-palet"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Condition failed to create`);
        console.log("ERROR_CREATE_CONDITION:", err);
      }
    },
  });
  return mutation;
};
