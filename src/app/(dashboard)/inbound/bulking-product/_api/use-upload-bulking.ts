import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type RequestType = {
  value: FormData;
  type: string;
};

type Error = AxiosError;

export const useUploadBulking = () => {
  const accessToken = useCookies().get("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ value, type }) => {
      const res = await axios.post(
        `${baseUrl}/${type === "category" ? "excelOld" : "bulking_tag_warna"}`,
        value,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("File successfuly Uploaded");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR: ${(err?.response?.data as any)?.data?.message}`);
        console.log("ERROR_UPLOAD_FILE:", err);
      }
    },
  });
  return mutation;
};
