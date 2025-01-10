import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetSelect = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-select-create-palet"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/palet-select`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
