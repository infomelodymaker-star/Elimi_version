import { ArrowUpRight, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const links: { title: string; items: string[] }[] = [
  { title: "Product", items: ["Blocks", "Pricing", "Docs", "Changelog"] },
  { title: "Resources", items: ["Guides", "Showcase", "Templates", "Roadmap"] },
  { title: "Company", items: ["About", "Contact", "Press kit"] },
  { title: "Legal", items: ["License", "Privacy", "Terms"] },
]

const socials = [
  {
    label: "X",
    path: "M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.5L4.7 21H1.5l7.5-8.5L1.1 3h6.5l4.5 6 5.4-6Zm-1.1 16h1.8L7.6 4.9H5.7L16.4 19Z",
  },
  {
    label: "GitHub",
    path: "M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.3 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5Z",
  },
]

export default function Footer02() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 pt-20 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <a href="#" className="inline-flex items-center gap-2 font-semibold tracking-tight">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://blockus.lndevui.com/brand/logo.svg"
                alt="blockus"
                className="size-6 dark:invert"
              />
              blockus
            </a>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              by lndev-ui
            </span>
          </div>

          <form className="flex w-full items-center gap-2 rounded-full border border-border bg-card p-1 sm:w-auto sm:min-w-[320px]">
            <Mail className="ml-2.5 size-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Get a new block in your inbox"
              className="h-9 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:outline-none focus-visible:ring-0"
            />
            <Button size="sm" className="rounded-full">
              Subscribe
            </Button>
          </form>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4">
          {links.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {column.items.map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 pb-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>&copy; {year} blockus. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="#status"
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <span className="relative grid size-2 place-items-center">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span
                  aria-hidden
                  className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50"
                />
              </span>
              All systems normal
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <div className="flex items-center gap-1">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={`#${s.label.toLowerCase()}`}
                  aria-label={s.label}
                  className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="relative -mt-2 select-none overflow-hidden">
        <p
          className="block w-full text-center font-semibold leading-none text-foreground"
          style={{
            fontSize: "clamp(4rem, 22vw, 18rem)",
            letterSpacing: "-0.05em",
            background:
              "linear-gradient(180deg, hsl(var(--foreground) / 0.85) 0%, hsl(var(--background) / 0) 95%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          blockus
        </p>
      </div>
    </footer>
  )
}
