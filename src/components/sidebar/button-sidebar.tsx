"use client";

import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface SidebarButtonProps {
  label: string;
  href?: string;
  icon: ReactNode;
  sidebarMenu: any[];
  subMenu?: { title: string; href: string }[];
  query?: string;
  pathname: string;
  setOpenMenu: Dispatch<SetStateAction<string>>;
  openMenu: string;
  setOpenSubMenu: Dispatch<SetStateAction<string>>;
  openSubMenu: string;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export const ButtonSidebar = ({
  label,
  href,
  icon,
  query,
  subMenu = [],
  pathname,
  openMenu,
  setOpenMenu,
  setOpenSubMenu,
  // openSubMenu,
  setOpen,
}: SidebarButtonProps) => {
  const queryClient = useQueryClient();
  const isActive = href ? pathname === href : false;
  const isSubMenuActive = useMemo(() => {
    return subMenu.some((item) => pathname === item.href);
  }, [pathname, subMenu]);

  const isParentActive = isActive || isSubMenuActive;

  /* =========================
   * AUTO OPEN MENU
   * ========================= */
  useEffect(() => {
    if (isSubMenuActive) {
      setOpenMenu(label);
      const activeSub = subMenu.find((s) => s.href === pathname);
      if (activeSub) {
        setOpenSubMenu(activeSub.href);
      }
    }
  }, [pathname]);

  const chevronVariant = {
    close: { rotate: 0 },
    open: { rotate: 90 },
  };

  return (
    <div className="w-full">
      {href ? (
        <Button
          asChild
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md bg-transparent px-3 text-sm font-medium shadow-none transition-all hover:bg-sky-200/70",
            isActive && "bg-sky-200/60 border border-sky-300",
          )}
          onClick={() => {
            setOpen?.(false);
            if (query) {
              queryClient.invalidateQueries({ queryKey: [query] });
            }
          }}
        >
          <Link href={href}>
            <div className="flex items-center gap-2 capitalize text-sky-900">
              <span className="h-4 w-4">{icon}</span>
              <span>{label}</span>
            </div>
          </Link>
        </Button>
      ) : (
        <>
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md px-3 text-sm font-medium transition-all hover:bg-sky-200/70",
              isParentActive && "bg-sky-200/60 border border-sky-300",
            )}
            onClick={() =>
              openMenu === label ? setOpenMenu("") : setOpenMenu(label)
            }
          >
            <div className="flex items-center gap-2 capitalize text-sky-900">
              <span className="h-5 w-5">{icon}</span>
              <span>{label}</span>
            </div>

            <motion.span
              variants={chevronVariant}
              animate={openMenu === label ? "open" : "close"}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="h-4 w-4 text-sky-900" />
            </motion.span>
          </button>

          <AnimatePresence>
            {openMenu === label && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-1 flex flex-col overflow-hidden"
              >
                {subMenu.map((item) => {
                  const isSubActive = pathname === item.href;

                  return (
                    <Link href={item.href} key={item.href} className="w-full">
                      <button
                        type="button"
                        onClick={() => setOpen?.(false)}
                        className={cn(
                          "flex h-10 w-full items-center rounded-md pl-6 pr-3 text-sm font-light capitalize text-sky-900 transition-all hover:bg-sky-200/50",
                          isSubActive &&
                            "bg-sky-200/60 border border-sky-300 font-medium",
                        )}
                      >
                        <span className="mr-1">-</span>
                        {item.title}
                      </button>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};
