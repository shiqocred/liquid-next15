import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetBarcodeMI = ({ code, barcode }: any) => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["check-barcode-manifest-inbound", code, barcode],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/search_barcode_product?code_document=${code}&old_barcode_product=${barcode}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    enabled: !!barcode,
  });
  return query;
};
