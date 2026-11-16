import type { WishlistItem } from "@/db/schema";

/** Read-only list of wishes. */
export default function WishList({ items }: { items: Pick<WishlistItem, "position" | "title" | "url" | "description">[] }) {
  return (
    <ol className="grid gap-3">
      {items.map((item) => (
        <li key={item.position} className="flex gap-3 rounded-xl border border-line bg-cream/60 p-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-berry font-bold text-white">
            {item.position}
          </span>
          <div className="min-w-0">
            <p className="font-bold">{item.title}</p>
            {item.description && <p className="whitespace-pre-line text-muted">{item.description}</p>}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-1 inline-block max-w-full truncate text-sm font-semibold text-pine underline underline-offset-4"
              >
                🔗 {prettyUrl(item.url)}
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function prettyUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + (u.pathname.length > 1 ? u.pathname : "");
  } catch {
    return url;
  }
}
