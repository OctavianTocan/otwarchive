const FOOTER_GROUPS = [
  {
    heading: "About the Archive",
    links: [
      { label: "Site Map", href: "/site_map" },
      { label: "Diversity Statement", href: "/diversity" },
      { label: "Terms of Service", href: "/tos" },
      { label: "Content Policy", href: "/content" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Takedown Policy", href: "/takedown" },
      { label: "Status Page", href: "https://www.otwstatus.org" },
    ],
  },
  {
    heading: "Contact Us",
    links: [
      { label: "Policy Questions & Abuse Reports", href: "/abuse_reports/new" },
      { label: "Technical Support & Feedback", href: "/feedbacks/new" },
    ],
  },
  {
    heading: "Development",
    links: [
      { label: "Known Issues", href: "/known_issues" },
      { label: "GPL-2.0-or-later license", href: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html" },
      { label: "Organization for Transformative Works", href: "https://transformativeworks.org/" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer
      className="mt-auto border-footer/30 border-t px-6 py-10 text-footer-foreground"
      role="contentinfo"
      style={{ backgroundColor: "var(--footer)", backgroundImage: "var(--footer-texture)" }}
    >
      <h2 className="sr-only">Footer</h2>
      <nav aria-label="Footer" className="mx-auto grid max-w-[1180px] gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {FOOTER_GROUPS.map((group) => (
          <section key={group.heading}>
            <h3 className="mb-2 font-semibold text-footer-foreground-strong text-sm tracking-tight">{group.heading}</h3>
            <ul className="space-y-1.5 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <a
                    className="rounded-sm transition-[color] duration-150 ease-out hover:text-footer-foreground-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-foreground-strong/70"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </footer>
  );
}
