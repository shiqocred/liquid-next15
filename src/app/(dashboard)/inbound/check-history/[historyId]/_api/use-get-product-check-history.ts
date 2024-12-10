import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetProductDetailCheckHistory = ({ type, code, p, q }: any) => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["product-detail-check-history", code, { p, q, type }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/${
          type === "good"
            ? "getProductLolos"
            : type === "damaged"
            ? "getProductDamaged"
            : type === "abnormal"
            ? "getProductAbnormal"
            : type === "discrepancy"
            ? "discrepancy"
            : ""
        }/${code}?page=${p}&q=${q}`,
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
