import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  code_document: string;
};

type Error = AxiosError;

export const useDelDocPA = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ code_document }) => {
      const res = await axios.delete(
        `${baseUrl}/delete_all_by_codeDocument?code_document=${code_document}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Document successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["product-approve"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Document failed to delete`);
        console.log("ERROR_DELETE_DOCUMENT:", err);
      }
    },
  });
  return mutation;
};
