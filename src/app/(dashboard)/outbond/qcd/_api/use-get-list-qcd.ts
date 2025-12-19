import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListQCD = ({ p, q }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-qcd", { p, q }],
    queryFn: async () => {
      // const res = await axios.get(`${baseUrl}/dumps?page=${p}&q=${q}`, {
      const res = await axios.get(`${baseUrl}/scrap?page=${p}&q=${q}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
