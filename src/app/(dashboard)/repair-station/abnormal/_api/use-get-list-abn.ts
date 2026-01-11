import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListABN = ({ p, q }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-abn", { p, q }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/abnormal?page=${p}&q=${q}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
