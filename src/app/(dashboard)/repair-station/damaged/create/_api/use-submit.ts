import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";
import { invalidateQuery } from "@/lib/query";

type RequestType = {
  body: any;
  id: string;
};
type Error = AxiosError;

export const useSubmit = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body }) => {
      const res = await axios.put(`${baseUrl}/damaged/${id}/finish`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: (res) => {
      toast.success("Dmg successfully created");
      invalidateQuery(queryClient, [
        ["list-dmg"],
        ["list-detail-dmg", res.data.data.resource.id],
      ]);
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Dmg failed to create`);
        console.log("ERROR_CREATE_DMG:", err);
      }
    },
  });
  return mutation;
};
