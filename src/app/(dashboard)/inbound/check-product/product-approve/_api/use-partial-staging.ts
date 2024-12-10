import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type RequestType = {
  code_document: string;
};

type Error = AxiosError;

export const usePartialStaging = () => {
  const accessToken = useCookies().get("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ code_document }) => {
      const res = await axios.post(
        `${baseUrl}/partial-staging/${code_document}`,
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
      toast.success("Document successfully sended to staging");
      queryClient.invalidateQueries({ queryKey: ["product-approve"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Document failed send to staging`);
        console.log("ERROR_PARTIAL_STAGING:", err);
      }
    },
  });
  return mutation;
};
