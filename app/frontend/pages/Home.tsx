import type { ReactNode } from "react";
import { Button } from "@/design-system/components/ui/button";
import { Card } from "@/design-system/components/ui/card";
import {
  PageFrame,
  SectionHeader,
  TagPill,
  WorkBlurbCard,
  formatCount,
  type WorkBlurb,
} from "../components/shared";

type Link = { readonly text: string; readonly url: string };

type NewsPost = {
  readonly id: number;
  readonly title: string;
  readonly url: string | null;
  readonly published: string | null;
  readonly commentsCount: number;
  readonly commentsUrl: string | null;
  readonly previewHtml: string | null;
};

type Intro = {
  readonly description: string;
  readonly parentOrgIntro: string;
  readonly parentOrg: Link;
  readonly stats: { readonly fandoms: number; readonly users: number; readonly works: number };
  readonly account: {
    readonly shortName: string;
    readonly inviteNotice: { readonly newsUrl: string; readonly statusUrl: string } | null;
    readonly cta: { readonly label: string; readonly url: string; readonly note: string | null } | null;
  };
};

type TagLink = { readonly name: string; readonly url: string | null };

type Props = {
  readonly context: { readonly heading: string };
  readonly loggedIn: boolean;
  readonly intro: Intro | null;
  readonly favorites: readonly TagLink[];
  readonly browse: {
    readonly heading: string;
    readonly allFandomsUrl: string;
    readonly media: readonly TagLink[];
    readonly note: string | null;
  };
  readonly news: readonly NewsPost[];
  readonly readings: readonly WorkBlurb[];
  readonly readingsUrl: string | null;
  readonly inbox: { readonly count: number; readonly url: string | null } | null;
  readonly social: {
    readonly heading: string;
    readonly note: string;
    readonly otherOutlets: Link;
    readonly bluesky: { readonly label: string; readonly url: string };
    readonly tumblr: { readonly label: string; readonly url: string };
  };
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

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

function Module({ title, link, children, className = "" }: { readonly title: string; readonly link?: ReactNode; readonly children: ReactNode; readonly className?: string }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <SectionHeader title={title} action={link} />
      {children}
    </section>
  );
}

function IntroBlock({ intro }: { readonly intro: Intro }) {
  const { account } = intro;
  return (
    <Card className="px-5">
      <h2 className="font-semibold text-lg leading-snug">{intro.description}</h2>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm tabular-nums">
        <span><span className="font-semibold text-foreground">{formatCount(intro.stats.fandoms)}</span> fandoms</span>
        <span><span className="font-semibold text-foreground">{formatCount(intro.stats.users)}</span> users</span>
        <span><span className="font-semibold text-foreground">{formatCount(intro.stats.works)}</span> works</span>
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
      <Module title={browse.heading} className="md:col-span-5 md:row-start-2">
        <div className="flex flex-wrap gap-1.5">
          {favorites.map((favorite, index) => (
            <TagPill key={`${favorite.name}-${index}`} tag={favorite} />
          ))}
        </div>
      </Module>
    );
  }

  return (
    <Module title={browse.heading} className="md:col-span-5 md:row-start-2">
      {browse.note && <p className="mb-2 text-muted-foreground text-sm">{browse.note}</p>}
      <div className="flex flex-wrap gap-1.5">
        <TagPill tag={{ name: "All Fandoms", url: browse.allFandomsUrl }} variant="outline" />
        {browse.media.map((media, index) => (
          <TagPill key={`${media.name}-${index}`} tag={media} />
        ))}
      </div>
    </Module>
  );
}

function NewsList({ news }: { readonly news: readonly NewsPost[] }) {
  return (
    <Module
      title="News"
      link={<a href="/admin_posts" className="text-link text-sm hover:underline">All News</a>}
    >
      <ol className="flex flex-col divide-y divide-border">
        {news.map((post) => (
          <li key={post.id}>
            <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
              <h4 className="min-w-0 break-words font-semibold text-[15px] leading-snug">
                <a href={post.url ?? "#"} className="text-link hover:underline" dangerouslySetInnerHTML={{ __html: post.title }} />
              </h4>
              <p className="flex flex-wrap gap-x-3 text-muted-foreground text-xs tabular-nums">
                {post.published && <span>Published: {formatDate(post.published)}</span>}
                <span>
                  Comments: <a href={post.commentsUrl ?? "#"} className="text-link hover:underline">{formatCount(post.commentsCount)}</a>
                </span>
              </p>
              {post.previewHtml && (
                <blockquote
                  className="border-border border-l-2 pl-3 text-foreground/90 text-sm [&_p]:my-1"
                  dangerouslySetInnerHTML={{ __html: post.previewHtml }}
                />
              )}
              <p><a href={post.url ?? "#"} className="text-link text-sm hover:underline">Read more...</a></p>
            </Card>
          </li>
        ))}
      </ol>
    </Module>
  );
}

export default function Home({ loggedIn, intro, favorites, browse, news, readings, readingsUrl, inbox, social }: Props) {
  return (
    <PageFrame>
      <div className="grid auto-rows-max gap-x-7 gap-y-8 md:grid-cols-12">
        {!loggedIn && intro && (
          <section className="md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1">
            <IntroBlock intro={intro} />
          </section>
        )}

        <FavoritesOrBrowse favorites={favorites} browse={browse} />

        {news.length > 0 && (
          <section className="md:col-span-5 md:row-start-3">
            <NewsList news={news} />
          </section>
        )}

        {loggedIn && readings.length > 0 && (
          <Module
            title="Is it later already?"
            link={<a href={readingsUrl ?? "#"} className="text-link text-sm hover:underline">My History</a>}
            className="md:col-span-6"
          >
            <p className="mb-3 text-muted-foreground text-sm">Some works you've marked for later.</p>
            <ol className="flex flex-col divide-y divide-border">
              {readings.map((work) => (
                <li key={work.id}>
                  <WorkBlurbCard
                    work={work}
                    statsDensity="compact"
                    showCategories={false}
                    showTagDetails={false}
                    showLanguage={false}
                  />
                </li>
              ))}
            </ol>
          </Module>
        )}

        {loggedIn && inbox && (
          <Module title="Unread messages" className="md:col-span-6">
            <Card className="px-5">
              <p className="text-foreground/90 text-sm">
                You have <span className="font-semibold tabular-nums">{formatCount(inbox.count)}</span>{" "}
                unread {inbox.count === 1 ? "item" : "items"} in your inbox.{" "}
                <a href={inbox.url ?? "#"} className="text-link hover:underline">Go to My Inbox</a>
              </p>
            </Card>
          </Module>
        )}

        <Module title={social.heading} className="md:col-span-7 md:col-start-6 md:row-start-3">
          <p className="text-foreground/90 text-sm">
            {withLink(social.note, { text: social.otherOutlets.text, url: social.otherOutlets.url })}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" render={<a href={social.bluesky.url} />}>{social.bluesky.label}</Button>
            <Button variant="outline" render={<a href={social.tumblr.url} />}>{social.tumblr.label}</Button>
          </div>
        </Module>
      </div>
    </PageFrame>
  );
}
