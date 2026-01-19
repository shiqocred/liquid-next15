import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";

export const useGetSummaryEndBalance = () => {
  const accessToken = getCookie("accessToken");

  return useQuery({
    queryKey: ["summary-end-balance"],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/summary-ending-balance`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res.data;
    },
    meta: {
      onError: (err: any) => {
        if (err?.response?.status === 403) {
          toast.error("Error 403: Restricted Access");
        } else {
          toast.error(
            err?.response?.data?.message ||
              "Failed to get summary end balance",
          );
        }
      },
    },
  });
};
