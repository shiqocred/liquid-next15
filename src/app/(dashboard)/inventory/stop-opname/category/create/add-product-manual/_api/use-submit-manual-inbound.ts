import { toast } from "sonner";
import { useMutate } from "@/lib/query";

type Body = {
  new_name_product: string;
  new_quantity_product: string;
  old_price_product: string;
  new_status_product: string;
  new_category_product: string;
  new_price_product: string;
  new_tag_product: any;
  condition: string;
  type: string;
  description: string;
};

export const useSubmitManualInbound = () => {
  const mutation = useMutate<Body>({
    endpoint: "/additionalProductSo",
    method: "post",
    onSuccess: () => {
      toast.success("Product successfully added");
    },
    onError: {
      message: "Product failed to submit",
      title: "SUBMIT_MANUAL_PRODUCT",
    },
  });

  return mutation;
};
