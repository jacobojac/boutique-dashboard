"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import Link from "next/link";

type PageProps = {
  title: string;
  buttonText?: string;
  buttonUrl?: string;
};

export function SiteHeader(props: PageProps) {
  /* const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentPage = segments[segments.length - 1] || "Dashboard";
  const formatPageName = (str: string) => {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }; */

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{props.title}</h1>
        {props.buttonText && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              {props.buttonUrl && (
                <Link href={props.buttonUrl} className="flex gap-2">
                  <IconCirclePlusFilled />
                  {props.buttonText}
                </Link>
              )}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
