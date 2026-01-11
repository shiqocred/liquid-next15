import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListNon = ({ p }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-data-non", { p }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/non/active-session?page=${p}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
