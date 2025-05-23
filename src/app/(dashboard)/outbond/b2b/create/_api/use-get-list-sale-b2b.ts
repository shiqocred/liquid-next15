import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListSaleB2B = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-sale-b2b"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/bulky-sales`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
