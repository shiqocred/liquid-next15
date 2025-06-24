import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListBagByUser = ({ b2bId, ids }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-bag-by-user-b2b"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/bag_by_user?id=${b2bId}&bag_id=${ids}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
