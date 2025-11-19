import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListSummaryInbound = ({ q, date_from, date_to }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-summary-inbound", { q, date_from, date_to }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/list-summary-inbound?q=${q}&date_from=${date_from}&date_to=${date_to}`,
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
