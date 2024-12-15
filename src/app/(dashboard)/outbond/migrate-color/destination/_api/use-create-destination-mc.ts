import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type RequestType = {
  body: any;
};

type Error = AxiosError;

export const useCreateDestinationMC = () => {
  const accessToken = useCookies().get("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/destinations`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Destination successfully created");
      queryClient.invalidateQueries({ queryKey: ["list-destination-mc"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Destination failed to create`);
        console.log("ERROR_CREATE_DESTINATION:", err);
      }
    },
  });
  return mutation;
};
