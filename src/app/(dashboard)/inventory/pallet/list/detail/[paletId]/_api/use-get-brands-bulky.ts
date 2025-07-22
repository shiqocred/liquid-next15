import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrlApiBulky } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetBrandsBulky = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-brands-detail-palet"],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrlApiBulky}/products/filter/brands`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
  });
  return query;
};
