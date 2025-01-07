import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetPriceProductPA = ({ price }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["price-manual-inbound", price],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/get-latestPrice?old_price_product=${price}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    enabled: !!price,
  });
  return query;
};
