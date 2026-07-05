import AppShell from "../components/AppShell";
import { router } from "@inertiajs/react";
type Post = { id: number; title: string; url: string; published: string | null; contentHtml: string | null };
type Props = { context: { heading: string }; posts: Post[]; pagination: { page: number; pages: number; count: number } };
export default function AdminPostsIndex({ context, posts, pagination }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-4 pt-6 pb-16 md:px-5">
        <h2 className="mb-4 font-semibold text-base">{context.heading}</h2>
        {posts.length === 0 && <p className="py-6 text-muted-foreground">No news posts yet.</p>}
        <div className="flex flex-col divide-y divide-border">
          {posts.map((p) => (
            <article key={p.id} className="py-6">
              <h3 className="font-semibold text-base"><a href={p.url} className="text-link hover:underline">{p.title}</a></h3>
              {p.published && <p className="mt-0.5 text-muted-foreground text-xs">{p.published}</p>}
              {p.contentHtml && <div className="userstuff mt-3 line-clamp-4 text-foreground/90 [&_a]:text-link" dangerouslySetInnerHTML={{ __html: p.contentHtml }} />}
              <a href={p.url} className="mt-2 inline-block text-link text-sm hover:underline">Read more →</a>
            </article>
          ))}
        </div>
        {pagination.pages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-4 text-muted-foreground text-sm">
            <button disabled={pagination.page <= 1} onClick={() => router.get(`?page=${pagination.page - 1}`)} className="disabled:opacity-40">← Prev</button>
            <span>Page {pagination.page} / {pagination.pages}</span>
            <button disabled={pagination.page >= pagination.pages} onClick={() => router.get(`?page=${pagination.page + 1}`)} className="disabled:opacity-40">Next →</button>
          </nav>
        )}
      </div>
    </AppShell>
  );
}
