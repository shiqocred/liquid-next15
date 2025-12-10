"use client";

import { ArrowLeft } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Loading from "@/app/(dashboard)/loading";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useGetListTagColorWMS } from "../_api/use-get-list-tag-color-wms";
import { useQueryState } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBKL } from "../_api";
import { useRouter } from "next/navigation";
import { useGetListBKL } from "../_api/use-get-list-bkl";

export const Client = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [dataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreateBKL();

  const { data } = useGetListTagColorWMS({ q: searchValue });

  const {
    data: dataBKL,
  } = useGetListBKL({ q: searchValue });

  const dataListColor: any[] = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataListBKL: any[] = useMemo(() => {
    return dataBKL?.data.data.resource.data;
  }, [dataBKL]);

  type ColorItem = { color: string; qty: string };
  const [formState, setFormState] = useState<{
    name: string;
    damaged: string;
    quantity: string;
    colors: ColorItem[];
  }>({
    name: "",
    damaged: "",
    quantity: "",
    colors: [{ color: "", qty: "" }],
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();

    if (!dataListColor) return;

    // Mapping warna → format API
    const mappedColors = formState.colors
      .filter((c) => c.color && c.qty) // hanya yang terisi
      .map((c) => {
        const found = dataListColor.find(
          (item: any) => item.name_color === c.color
        );

        return {
          color_tag_id: found?.id, // sesuaikan jika API pakai field lain
          qty: Number(c.qty),
        };
      })
      .filter((c) => c.color_tag_id); // buang jika id tidak ada

    // Body API
    const body = {
      name_document: formState.name,
      type: "in",
      damage_qty: formState.quantity,
      colors: mappedColors,
    };

    mutateCreate(
      { body },
      {
        onSuccess: () => {
          router.push("/inventory/slow-moving-product/bkl");
        },
      }
    );
  };

  useEffect(() => {
    if (!dataListBKL) return;

    // Ambil nama yang formatnya BKL-XXXXXX (6 digit)
    const names = dataListBKL
      .map((item) => item?.code_document_bkl)
      .filter(
        (v) => typeof v === "string" && /^BKL-\d{6}$/.test(v) // hanya BKL-000001 format 6 digit
      );

    const numbers = names
      .map((n) => parseInt(n.replace("BKL-", ""), 10))
      .filter((num) => !isNaN(num));

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;

    const nextNumber = maxNumber + 1;
    const padded = String(nextNumber).padStart(6, "0");

    setFormState((s) => ({
      ...s,
      name: `BKL-${padded}`,
    }));
  }, [dataListBKL]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Slow Moving Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inventory/slow-moving-product/bkl">
              BKL
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full relative flex flex-col gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
          <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
            <Link href="/inventory/slow-moving-product/bkl">
              <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Create BKL</h1>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-full flex items-start justify-between">
              <h2 className="text-lg font-semibold">Create BKL</h2>
              <Button
                onClick={handleCreate}
                disabled={isPendingCreate}
                className="bg-sky-500 text-white"
              >
                Submit
              </Button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex gap-4 items-center">
                <Input
                  disabled
                  placeholder="Nama"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, name: e.target.value }))
                  }
                  className="px-3 py-2 border rounded w-1/3 border-sky-400/80 focus-visible:ring-sky-400 "
                />
              </div>
              <div className="flex gap-3 items-center">
                <Input
                  placeholder="Damaged"
                  value={formState.damaged}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, damaged: e.target.value }))
                  }
                  className="px-3 py-2 border rounded w-1/2 border-sky-400/80 focus-visible:ring-sky-400"
                  disabled
                />
                <Input
                  placeholder="Quantity"
                  value={formState.quantity}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, quantity: e.target.value }))
                  }
                  className="px-3 py-2 border rounded w-1/2 border-sky-400/80 focus-visible:ring-sky-400"
                />
              </div>

              <hr className="border-t my-2" />

              <div className="flex flex-col gap-3">
                {formState.colors.map((c, idx) => (
                  <div key={idx} className="flex gap-3 items-center ">
                    <Select
                      value={c.color}
                      onValueChange={(val) =>
                        setFormState((s) => {
                          const next = { ...s };
                          next.colors[idx].color = val;
                          return next;
                        })
                      }
                    >
                      <SelectTrigger className="px-3 py-2 border rounded w-1/2 border-sky-400/80 focus-visible:ring-sky-400">
                        <SelectValue placeholder="Pilih Warna" />
                      </SelectTrigger>

                      <SelectContent>
                        {dataListColor?.map((item, i) => (
                          <SelectItem key={i} value={item.name_color}>
                            {item.name_color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Quantity"
                      value={c.qty}
                      onChange={(e) =>
                        setFormState((s) => {
                          const next = { ...s };
                          next.colors[idx].qty = e.target.value;
                          return next;
                        })
                      }
                      className="px-3 py-2 border rounded w-1/3 border-sky-400/80 focus-visible:ring-sky-400"
                    />
                    <Button
                      type="button"
                      variant={"outline"}
                      className=" border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                      onClick={() =>
                        setFormState((s) => ({
                          ...s,
                          colors: s.colors.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  className="bg-sky-400 border-sky-400 text-white hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  onClick={() =>
                    setFormState((s) => ({
                      ...s,
                      colors: [...s.colors, { color: "", qty: "" }],
                    }))
                  }
                >
                  Tambah +
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
