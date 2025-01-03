import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetNotifWidget = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["notif_widget"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/notif_widget`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    refetchInterval: 60000,
  });
  return query;
};
