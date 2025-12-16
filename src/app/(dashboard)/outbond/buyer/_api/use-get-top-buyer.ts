import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetTopBuyer = ({ month, year }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-top-buyer", month, year],
    enabled: !!month && !!year,
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/top-buyers?month=${month}&year=${year}`,
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
