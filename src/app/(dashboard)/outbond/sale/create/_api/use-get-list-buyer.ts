import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetListBuyer = ({ p, q }: any) => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["list-buyer-cashier", { p, q }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/buyers?page=${p}&q=${q}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
