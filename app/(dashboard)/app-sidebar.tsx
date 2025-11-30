"use client";

import {
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconInnerShadowTop,
  IconLogout,
  IconMenu,
  IconPackage,
  IconPalette,
  IconRosetteDiscount,
  IconSettings,
  IconShoppingCart,
  IconTag,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { LogOutAction } from "@app/(admin)/logout.action";
import { NavMain } from "@app/(dashboard)/nav-main";
import { NavUser } from "@app/(dashboard)/nav-user";
import { NavWebSite } from "./nav-website";

const data = {
  /*  user: {
    name: "ELITE CORNER",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  }, */
  navMain: [
    {
      title: "Commandes",
      url: "/commandes",
      icon: IconShoppingCart,
    },
    {
      title: "Produits",
      url: "/produits",
      icon: IconPackage,
    },
    {
      title: "Collection",
      url: "/collections",
      icon: IconTag,
    },
    {
      title: "Réductions",
      url: "/reductions",
      icon: IconRosetteDiscount,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "#",
      icon: IconSettings,
    },
  ],
  website: [
    {
      name: "Personnaliser",
      url: "/personnaliser",
      icon: IconPalette,
    },
    {
      name: "Menu",
      url: "/menu",
      icon: IconMenu,
    },
    /* {
      name: "Studio photos",
      url: "/studio-photo",
      icon: IconCamera,
    }, */
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();
  console.log("session: ", session);
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ELITE CORNER</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavWebSite items={data.website} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <form action={LogOutAction} className="w-full">
          <Button
            variant="ghost"
            size="sm"
            className="w-full mb-4 mt-2 cursor-pointer justify-start gap-2"
            type="submit"
          >
            <IconLogout className="size-4" />
            Se déconnecter
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
