import { toast } from "sonner";
import { useMutate } from "@/lib/query";

type Params = {
  id: string;
};

type Body = {
  code_document: any;
  old_barcode_product: string;
  new_barcode_product: string;
  new_name_product: string;
  new_quantity_product: string;
  new_price_product: string;
  old_price_product: string;
  new_date_in_product: any;
  new_status_product: any;
  condition: string | undefined;
  new_category_product: string;
  new_tag_product: any;
  display_price: string;
  new_discount: string;
};

export const useUpdateProductCategory = () => {
  const mutation = useMutate<Body, Params>({
    endpoint: "/new_products/:id",
    method: "put",
    onSuccess: () => {
      toast.success("Product successfully Deleted");
    },
    onError: {
      message: "Product failed to update",
      title: "UPDATE_PRODUCT",
    },
  });

  return mutation;
};
