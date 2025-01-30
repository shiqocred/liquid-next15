"use client";

import * as React from "react";

// import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
// import { NavSecondary } from "@/components/nav-secondary";
// import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  BadgeDollarSign,
  BarChartBig,
  Blocks,
  Boxes,
  CandlestickChart,
  Container,
  Drill,
  FileCog,
  FolderClock,
  IdCard,
  Layers3,
  LineChart,
  PackageSearch,
  RailSymbol,
  Recycle,
  ScanText,
  ShoppingBasket,
  SquareLibrary,
  SwatchBook,
  Target,
  Truck,
  User,
  Warehouse,
} from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const menu = [
  {
    id: 1,
    title: "Dashboard",
    href: undefined,
    menu: [
      {
        title: "Storage Report",
        href: "/dashboard/storage-report",
        icon: LineChart,
        query: "storage-report",
        sub_menu: [],
      },
      {
        title: "General Sale",
        href: "/dashboard/general-sale",
        icon: BarChartBig,
        query: "general-sale",
        sub_menu: [],
      },
      {
        title: "Analytic Sale",
        href: "/dashboard/analytic-sale",
        icon: CandlestickChart,
        query: "analytic-sale",
        sub_menu: [],
      },
    ],
  },
  {
    id: 2,
    title: "Inbound",
    href: undefined,
    menu: [
      {
        title: "Inbound Process",
        href: "/inbound/inbound-process",
        icon: FileCog,
        sub_menu: [],
      },
      {
        title: "Bulking Product",
        href: "/inbound/bulking-product",
        icon: Target,
        sub_menu: [],
      },
      {
        title: "Check Product",
        href: undefined,
        icon: PackageSearch,
        sub_menu: [
          {
            title: "Manifest Inbound",
            href: "/inbound/check-product/manifest-inbound",
          },
          {
            title: "Product Approve",
            href: "/inbound/check-product/product-approve",
          },
          {
            title: "Manual Inbound",
            href: "/inbound/check-product/manual-inbound",
          },
          {
            title: "Scan Result",
            href: "/inbound/check-product/scan-result",
          },
          {
            title: "Product Input",
            href: "/inbound/check-product/product-input",
          },
        ],
      },
      {
        title: "Check History",
        href: "/inbound/check-history",
        icon: FolderClock,
        query: "check-history",
        sub_menu: [],
      },
    ],
  },
  {
    id: 3,
    title: "Stagging",
    href: undefined,
    menu: [
      {
        title: "Product Stagging",
        href: "/stagging/product",
        icon: Layers3,
        sub_menu: [],
      },
      {
        title: "Approvement Stagging",
        href: "/stagging/approvement",
        icon: SquareLibrary,
        sub_menu: [],
      },
    ],
  },
  {
    id: 4,
    title: "Inventory",
    href: undefined,
    menu: [
      {
        title: "Product",
        href: undefined,
        icon: Boxes,
        sub_menu: [
          {
            title: "by category",
            href: "/inventory/product/category",
          },
          {
            title: "by color",
            href: "/inventory/product/color",
          },
        ],
      },
      {
        title: "Category Setting",
        href: undefined,
        icon: Blocks,
        sub_menu: [
          {
            title: "sub category",
            href: "/inventory/category-setting/sub-category",
          },
          {
            title: "tag color",
            href: "/inventory/category-setting/tag-color",
          },
        ],
      },
      {
        title: "Moving Product",
        href: undefined,
        icon: RailSymbol,
        sub_menu: [
          {
            title: "bundle",
            href: "/inventory/moving-product/bundle",
          },
          {
            title: "repair",
            href: "/inventory/moving-product/repair",
          },
        ],
      },
      {
        title: "Slow Moving Product",
        href: undefined,
        icon: Warehouse,
        sub_menu: [
          {
            title: "list product",
            href: "/inventory/slow-moving-product/list-product",
          },
          {
            title: "promo product",
            href: "/inventory/slow-moving-product/promo-product",
          },
          {
            title: "BKL",
            href: "/inventory/slow-moving-product/bkl",
          },
        ],
      },
      {
        title: "Pallet",
        href: undefined,
        icon: SwatchBook,
        sub_menu: [
          {
            title: "list Pallet",
            href: "/inventory/pallet/list",
          },
          {
            title: "Warehouse",
            href: "/inventory/pallet/warehouse",
          },
          {
            title: "Condition",
            href: "/inventory/pallet/condition",
          },
          {
            title: "Status",
            href: "/inventory/pallet/status",
          },
          {
            title: "Brand",
            href: "/inventory/pallet/brand",
          },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Repair Station",
    href: undefined,
    menu: [
      {
        title: "List Product Repair",
        href: "/repair-station/list-product-repair",
        icon: Drill,
        sub_menu: [],
      },
      {
        title: "QCD",
        href: "/repair-station/qcd",
        icon: Recycle,
        sub_menu: [],
      },
    ],
  },
  {
    id: 6,
    title: "Outbond",
    href: undefined,
    menu: [
      {
        title: "migrate color",
        href: undefined,
        icon: Truck,
        sub_menu: [
          {
            title: "List Migrate",
            href: "/outbond/migrate-color/list",
          },
          {
            title: "destination",
            href: "/outbond/migrate-color/destination",
          },
        ],
      },
      {
        title: "migrate category",
        href: "/outbond/migrate-category",
        icon: Container,
        sub_menu: [],
      },
      {
        title: "sale",
        href: "/outbond/sale",
        icon: ShoppingBasket,
        sub_menu: [],
      },
      {
        title: "B2B",
        href: "/outbond/b2b",
        icon: ScanText,
        sub_menu: [],
      },
      {
        title: "buyer",
        href: "/outbond/buyer",
        icon: BadgeDollarSign,
        sub_menu: [],
      },
    ],
  },
  {
    id: 7,
    title: "Account",
    href: undefined,
    menu: [
      {
        title: "Account Setting",
        href: "/account/setting",
        icon: User,
        sub_menu: [],
      },
      {
        title: "Panel SPV",
        href: "/account/panel-spv",
        icon: IdCard,
        sub_menu: [],
      },
    ],
  },
];

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-transparent"
              size="lg"
              asChild
            >
              <Link href={"/"}>
                <div className="flex w-40 aspect-[260/87] items-center justify-center rounded-lg  relative">
                  <Image src={"/images/liquid8.png"} alt="" fill />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <NavMain items={menu} />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
