import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetListFilterCreateMC = () => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["list-filter-create-mc"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/migrate-bulky-product`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
