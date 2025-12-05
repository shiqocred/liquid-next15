import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useScrapQCDAll = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, void>({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseUrl}/product-qcd/scrap-all`,
        null,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("QCD successfully scrap all");
      queryClient.invalidateQueries({ queryKey: ["list-qcd"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: ${(err?.response?.data as any)?.message || "Product failed to scrap all"} `);
        console.log("ERROR_ALL_SCRAP_QCD:", err);
      }
    },
  });
  return mutation;
};
