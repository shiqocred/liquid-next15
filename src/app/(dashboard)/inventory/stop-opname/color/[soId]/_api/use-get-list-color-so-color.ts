import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListColorSOColor = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-color-so-color"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/color_tags`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
