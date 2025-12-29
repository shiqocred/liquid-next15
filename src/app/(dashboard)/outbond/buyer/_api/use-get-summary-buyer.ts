import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetSummaryBuyer = ({ month, year }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["summary-buyers", month, year],
    enabled: !!month && !!year,
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/summary-buyers?month=${month}&year=${year}`,
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
