import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListFilterCreateMC = () => {
  const accessToken = getCookie("accessToken");
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
