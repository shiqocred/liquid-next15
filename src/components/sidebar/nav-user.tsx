"use client";

import { getCookie, hasCookie } from "cookies-next/client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";

export const NavUser = () => {
  const [profileData, setProfileData] = useState<any>();

  useEffect(() => {
    if (hasCookie("profile")) {
      const data = JSON.parse(getCookie("profile") ?? "");
      setProfileData(data);
    }
  }, [hasCookie("profile")]);

  return (
    <SidebarMenu className="border border-sidebar-border">
      <SidebarMenuItem>
        <div className="flex items-center text-sm gap-3 border">
          <div className="w-7 h-7 relative ">
            <Image
              className="object-cover"
              src={"/images/liquid.png"}
              alt=""
              fill
            />
          </div>
          <div className="flex flex-col min-w-24 gap-1">
            <p className="capitalize font-semibold leading-none">
              {profileData?.name}
            </p>
            <p className="lowercase text-xs text-gray-500 font-light leading-none">
              {profileData?.email}
            </p>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
