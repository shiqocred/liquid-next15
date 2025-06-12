import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetSelectPanelSPV = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["select-panel-spv"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/format-user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
