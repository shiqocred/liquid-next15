import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetDetailCategoryPallet = ({ id }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["category-detail-pallet", id],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/category_palets/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    enabled: !!id,
  });
  return query;
};
