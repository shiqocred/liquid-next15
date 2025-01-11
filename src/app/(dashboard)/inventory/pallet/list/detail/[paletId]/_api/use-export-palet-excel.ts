import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: any;
  body: any;
};
type Error = AxiosError;

export const useExportPaletExcel = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body }) => {
      const res = await axios.post(`${baseUrl}/export-palet/${id}`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Palet successfully exported to Excel");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Palet failed to exported to Excel`);
        console.log("ERROR_EXPORTTED_TO_EXCEL_PALET:", err);
      }
    },
  });
  return mutation;
};
