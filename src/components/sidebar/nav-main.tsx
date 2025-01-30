"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const NavMain = ({
  items,
}: {
  items: {
    id: number;
    title: string;
    href?: string;
    menu: {
      title: string;
      href?: string;
      icon: LucideIcon;
      query?: string;
      sub_menu: {
        title: string;
        href: string;
      }[];
    }[];
  }[];
}) => {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState("");

  const findActiveMenuTitle = () => {
    for (const menu of items) {
      for (const item of menu.menu) {
        // Check direct href match
        if (menu.href && pathname.includes(menu.href)) {
          return menu.title;
        }
        // Check sub_menu href match
        for (const subItem of item.sub_menu) {
          if (subItem.href && pathname.includes(subItem.href)) {
            return item.title;
          }
        }
      }
    }
    return null;
  };
  const findActiveSubMenuTitle = () => {
    for (const menu of items) {
      for (const item of menu.menu) {
        for (const subItem of item.sub_menu) {
          if (subItem.href && pathname.includes(subItem.href)) {
            return subItem.title;
          }
        }
      }
    }
    return null;
  };

  console.log(findActiveMenuTitle(), openMenu);
  return (
    <SidebarContent>
      {items.map((itemFirst) => (
        <SidebarGroup key={itemFirst.id}>
          <SidebarGroupLabel>{itemFirst.title}</SidebarGroupLabel>
          <SidebarMenu>
            {itemFirst.menu.map((itemSecond: any) => {
              if (itemSecond.sub_menu.length === 0) {
                return (
                  <SidebarMenuItem key={itemSecond.title}>
                    <SidebarMenuButton
                      isActive={pathname.includes(itemSecond.href)}
                      asChild
                    >
                      <Link href={itemSecond.href}>
                        <itemSecond.icon className="size-5 stroke-[1.5]" />
                        <span className="text-xs">{itemSecond.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible
                  key={itemSecond.title}
                  asChild
                  defaultOpen={findActiveMenuTitle() === itemSecond.title}
                  open={openMenu === itemSecond.title}
                  onOpenChange={() => setOpenMenu(itemSecond.title)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={itemSecond.title}
                        className="last:[&_svg]:size-3"
                      >
                        <itemSecond.icon className="size-5 stroke-[1.5]" />
                        <span className="text-xs">{itemSecond.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {itemSecond.sub_menu.map((itemThird: any) => (
                          <SidebarMenuSubItem key={itemThird.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={itemThird.href}>
                                <span className="text-xs">
                                  {itemThird.title}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
};
