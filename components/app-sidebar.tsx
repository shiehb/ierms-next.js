"use client";

import type * as React from "react";
import { Building, LayoutDashboard, Users2 } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard", // Direct link
      icon: LayoutDashboard,
      isActive: true,
      items: [], // No sub-items
    },
    {
      title: "Establishments",
      url: "/establishments",
      icon: Building,
      isActive: false,
      items: [
        {
          title: "All Establishments",
          url: "/establishments",
        },
        {
          title: "Add Establishment",
          url: "/establishments/add",
        },
      ],
    },
    {
      title: "Users",
      url: "/users",
      icon: Users2,
      isActive: false,
      items: [
        // Has sub-items
        {
          title: "All Users",
          url: "/users",
        },
        {
          title: "Add User",
          url: "/users/add",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-4 h-14 grid grid-cols-[100%]">
        <div className="flex items-center gap-2 min-w-[32px]">
          <img
            src="/assets/DENR-Logo.svg"
            className="size-8 shrink-0"
            alt="DENR Logo"
          />
          <div className="transition-all duration-300 overflow-hidden data-[collapsed=true]:w-0 data-[collapsed=true]:opacity-0">
            <div className="text-xs font-medium whitespace-nowrap">
              Integrated Establishment Regulatory
            </div>
            <div className="text-xs font-medium whitespace-nowrap">
              Management System
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
