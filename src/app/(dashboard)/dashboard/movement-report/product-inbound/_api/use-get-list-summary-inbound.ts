import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListSummaryInbound = ({ p, q, from, to }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-summary-inbound", { p, q, from, to }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/list-summary-inbound?page=${p}&q=${q}&from=${from}&to=${to}`,
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
