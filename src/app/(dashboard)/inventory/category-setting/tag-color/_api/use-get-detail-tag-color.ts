import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetDetailTagColor = ({
  id,
  isAPK,
}: {
  id: any;
  isAPK: boolean;
}) => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["tag-color-detail", id, isAPK],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/${isAPK ? "color_tags2" : "color_tags"}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    enabled: !!id,
  });
  return query;
};
