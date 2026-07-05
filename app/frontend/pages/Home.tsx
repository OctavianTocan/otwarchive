import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";

type Link = { text: string; url: string };
type TagRef = { name: string; url: string | null; type: string };
type WorkBlurb = {
  id: number; title: string; url: string;
  authors: { name: string; url: string | null }[]; anonymous: boolean;
  fandoms: TagRef[]; ratings: TagRef[]; warnings: TagRef[]; categories: TagRef[];
  relationships: TagRef[]; characters: TagRef[]; freeforms: TagRef[];
  summaryHtml: string | null;
  stats: { language?: string; words?: number; chapters?: string; comments?: number; kudos?: number; bookmarks?: number; hits?: number };
  published?: string; updated?: string; complete?: boolean;
};
type NewsPost = {
  id: number; title: string; url: string | null; published: string | null;
  commentsCount: number; commentsUrl: string | null; previewHtml: string | null;
};
type Intro = {
  description: string;
  parentOrgIntro: string;
  parentOrg: Link;
  stats: { fandoms: number; users: number; works: number };
  account: {
    shortName: string;
    inviteNotice: { newsUrl: string; statusUrl: string } | null;
    cta: { label: string; url: string; note: string | null } | null;
  };
};
type Props = {
  context: { heading: string };
  loggedIn: boolean;
  intro: Intro | null;
  favorites: { name: string; url: string | null }[];
  browse: { heading: string; allFandomsUrl: string; media: { name: string; url: string | null }[]; note: string | null };
  news: NewsPost[];
  readings: WorkBlurb[];
  readingsUrl: string | null;
  inbox: { count: number; url: string | null } | null;
  social: {
    heading: string; note: string; otherOutlets: Link;
    bluesky: { label: string; url: string }; tumblr: { label: string; url: string };
  };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

// Split an I18n *_html template on its single interpolation slot ("%{link}")
// so the anchor can be rendered inline as JSX rather than raw HTML.
function withLink(template: string, link: Link) {
  const [before, after] = template.split("%{link}");
  return (
    <>
      {before}
      <a href={link.url} className="text-link hover:underline">{link.text}</a>
      {after}
    </>
  );
}

function Section({ title, link, children }: { title: string; link?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-bold text-lg">{title}</h3>
        {link}
      </div>
      {children}
    </section>
  );
}

function Blurb({ w }: { w: WorkBlurb }) {
  const hasWarnings = w.warnings.some((x) => x.name !== "No Archive Warnings Apply");
  return (
    <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words font-semibold text-[15px] leading-snug">
          <a href={w.url} className="text-link hover:underline">{w.title}</a>
          <span className="font-normal text-muted-foreground"> by </span>
          {w.authors.map((a, i) => (
            <span key={i}>{i > 0 && ", "}<a href={a.url ?? "#"} className="text-link hover:underline">{a.name}</a></span>
          ))}
        </h4>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {w.ratings[0] && <Badge variant="outline">{w.ratings[0].name}</Badge>}
          <Badge variant={hasWarnings ? "destructive" : "outline"}>{hasWarnings ? "⚠" : "✓"}</Badge>
          <Badge variant="outline">{w.complete ? "Complete" : "WIP"}</Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {w.fandoms.map((t, i) => <Badge key={i} variant="secondary" render={<a href={t.url ?? "#"} />}>{t.name}</Badge>)}
      </div>
      {w.summaryHtml && <div className="text-foreground/90 [&_p]:my-1" dangerouslySetInnerHTML={{ __html: w.summaryHtml }} />}
      <dl className="flex flex-wrap gap-x-4 gap-y-0.5 border-border border-t border-dashed pt-3 text-muted-foreground text-xs tabular-nums">
        <span><dt className="inline font-semibold">Words:</dt> <dd className="inline">{n(w.stats.words)}</dd></span>
        <span><dt className="inline font-semibold">Chapters:</dt> <dd className="inline">{w.stats.chapters}</dd></span>
        <span><dt className="inline font-semibold">Kudos:</dt> <dd className="inline">{n(w.stats.kudos)}</dd></span>
        <span><dt className="inline font-semibold">Hits:</dt> <dd className="inline">{n(w.stats.hits)}</dd></span>
      </dl>
    </Card>
  );
}

function IntroBlock({ intro }: { intro: Intro }) {
  const { account } = intro;
  return (
    <Card className="px-5">
      <h2 className="font-semibold text-lg leading-snug">{intro.description}</h2>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm tabular-nums">
        <span><span className="font-semibold text-foreground">{n(intro.stats.fandoms)}</span> fandoms</span>
        <span><span className="font-semibold text-foreground">{n(intro.stats.users)}</span> users</span>
        <span><span className="font-semibold text-foreground">{n(intro.stats.works)}</span> works</span>
      </p>
      <p className="text-foreground/90 text-sm">{withLink(intro.parentOrgIntro, intro.parentOrg)}</p>

      <div className="mt-1 border-border border-t border-dashed pt-3">
        {account.inviteNotice && (
          <p className="text-foreground/90 text-sm">
            Joining the Archive currently requires an invitation; however, we are not accepting new invitation
            requests at this time. Please check the{" "}
            <a href={account.inviteNotice.newsUrl} className="text-link hover:underline">"Invitations" tag on AO3 News</a>{" "}
            for more information, or if you have already requested an invitation, you can{" "}
            <a href={account.inviteNotice.statusUrl} className="text-link hover:underline">check your position on the waiting list</a>.
          </p>
        )}
        <h4 className="mt-2 font-semibold text-base">With an {account.shortName} account, you can:</h4>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground/90 text-sm">
          <li>Share your own fanworks</li>
          <li>Get notified when your favorite works, series, or users update</li>
          <li>Participate in challenges</li>
          <li>Keep track of works you've visited and works you want to check out later</li>
        </ul>
        {account.cta && (
          <div className="mt-3">
            {account.cta.note && <p className="mb-2 text-foreground/90 text-sm">{account.cta.note}</p>}
            <Button variant="default" render={<a href={account.cta.url} />}>{account.cta.label}</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function FavoritesOrBrowse({ favorites, browse }: Pick<Props, "favorites" | "browse">) {
  if (favorites.length > 0) {
    return (
      <Section title={browse.heading}>
        <div className="flex flex-wrap gap-1.5">
          {favorites.map((f, i) => (
            <Badge key={i} variant="secondary" render={<a href={f.url ?? "#"} />}>{f.name}</Badge>
          ))}
        </div>
      </Section>
    );
  }
  return (
    <Section title={browse.heading}>
      {browse.note && <p className="mb-2 text-muted-foreground text-sm">{browse.note}</p>}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" render={<a href={browse.allFandomsUrl} />}>All Fandoms</Badge>
        {browse.media.map((m, i) => (
          <Badge key={i} variant="secondary" render={<a href={m.url ?? "#"} />}>{m.name}</Badge>
        ))}
      </div>
    </Section>
  );
}

function NewsList({ news }: { news: NewsPost[] }) {
  return (
    <Section
      title="News"
      link={<a href="/admin_posts" className="text-link text-sm hover:underline">All News</a>}
    >
      <ol className="flex flex-col divide-y divide-border">
        {news.map((p) => (
          <li key={p.id}>
            <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
              <h4 className="min-w-0 break-words font-semibold text-[15px] leading-snug">
                <a href={p.url ?? "#"} className="text-link hover:underline" dangerouslySetInnerHTML={{ __html: p.title }} />
              </h4>
              <p className="flex flex-wrap gap-x-3 text-muted-foreground text-xs tabular-nums">
                {p.published && <span>Published: {fmtDate(p.published)}</span>}
                <span>Comments: <a href={p.commentsUrl ?? "#"} className="text-link hover:underline">{n(p.commentsCount)}</a></span>
              </p>
              {p.previewHtml && (
                <blockquote
                  className="border-border border-l-2 pl-3 text-foreground/90 text-sm [&_p]:my-1"
                  dangerouslySetInnerHTML={{ __html: p.previewHtml }}
                />
              )}
              <p><a href={p.url ?? "#"} className="text-link text-sm hover:underline">Read more...</a></p>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export default function Home({ loggedIn, intro, favorites, browse, news, readings, readingsUrl, inbox, social }: Props) {
  return (
    <AppShell>

      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5">
        <main>
          {!loggedIn && intro && <IntroBlock intro={intro} />}

          <FavoritesOrBrowse favorites={favorites} browse={browse} />

          {news.length > 0 && <NewsList news={news} />}

          {loggedIn && readings.length > 0 && (
            <Section
              title="Is it later already?"
              link={<a href={readingsUrl ?? "#"} className="text-link text-sm hover:underline">My History</a>}
            >
              <p className="mb-3 text-muted-foreground text-sm">Some works you've marked for later.</p>
              <ol className="flex flex-col divide-y divide-border">{readings.map((w) => <li key={w.id}><Blurb w={w} /></li>)}</ol>
            </Section>
          )}

          {loggedIn && inbox && (
            <Section title="Unread messages">
              <Card className="px-5">
                <p className="text-foreground/90 text-sm">
                  You have <span className="font-semibold tabular-nums">{n(inbox.count)}</span>{" "}
                  unread {inbox.count === 1 ? "item" : "items"} in your inbox.{" "}
                  <a href={inbox.url ?? "#"} className="text-link hover:underline">Go to My Inbox</a>
                </p>
              </Card>
            </Section>
          )}

          <Section title={social.heading}>
            <p className="text-foreground/90 text-sm">
              {withLink(social.note, { text: social.otherOutlets.text, url: social.otherOutlets.url })}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" render={<a href={social.bluesky.url} />}>{social.bluesky.label}</Button>
              <Button variant="outline" render={<a href={social.tumblr.url} />}>{social.tumblr.label}</Button>
            </div>
          </Section>
        </main>
      </div>
    </AppShell>
  );
}
