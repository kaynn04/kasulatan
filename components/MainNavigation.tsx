"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationLink = {
  href: string;
  label: string;
};

export default function MainNavigation({ links }: { links: NavigationLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="site-main-nav" aria-label="Main navigation">
      {links.map(({ href, label }) => {
        const isAnchorLink = href.includes("#");
        const isActive = !isAnchorLink && (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));

        return (
          <Link
            key={href}
            href={href}
            className={`site-nav-link${isActive ? " site-nav-link-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
