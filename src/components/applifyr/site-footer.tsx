import { Brand } from "./brand";
export function SiteFooter() {
  return <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8"><Brand /><p className="font-mono text-[11px] uppercase text-muted-foreground">Discover · Amplify · Distribute</p><p className="text-xs text-muted-foreground">© 2026 APPLIFYR</p></div></footer>;
}
