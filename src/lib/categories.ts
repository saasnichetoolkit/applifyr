export const categories = [
  { slug: "productivity", label: "Productivity", code: "PRD", description: "Tools that make focused work faster and more deliberate." },
  { slug: "finance", label: "Finance", code: "FIN", description: "Modern money, accounting, and operational finance software." },
  { slug: "developer_tools", label: "Developer Tools", code: "DEV", description: "Infrastructure and utilities for teams that ship software." },
  { slug: "marketing_seo", label: "Marketing & SEO", code: "MKT", description: "Growth, analytics, publishing, and search intelligence." },
  { slug: "design_creative", label: "Design & Creative", code: "DSN", description: "Tools for visual craft, collaboration, and production." },
  { slug: "ai_tools", label: "AI Tools", code: "AIX", description: "Applied intelligence for research, creation, and automation." },
  { slug: "web3", label: "Web3", code: "WEB", description: "Wallets, protocols, and onchain apps." },
  { slug: "utilities", label: "Utilities", code: "UTL", description: "Small, sharp tools that solve everyday problems." },
  { slug: "advocacy", label: "Advocacy", code: "ADV", description: "Software for causes, communities, and civic action." },
  { slug: "other", label: "Other", code: "OTH", description: "Useful software that crosses categories or creates a new one." },
] as const;
export const categoryLabels: Record<string, string> = Object.fromEntries(categories.map((item) => [item.slug, item.label]));
