import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListActiveSOCategory = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-data-active-so-category"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/active_so_category`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
