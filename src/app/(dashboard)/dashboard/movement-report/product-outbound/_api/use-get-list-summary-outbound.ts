import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListSummaryOutbound = ({ p, q, from, to }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-summary-outbound", { p, q, from, to }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/list-summary-outbound?page=${p}&q=${q}&from=${from}&to=${to}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
  });
  return query;
};
