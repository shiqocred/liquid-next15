import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetAnalyticSaleYearly = (year: any) => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["analytic-sale-yearly"],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/dashboard/yearly-analytic-sales?y=${year}`,
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
