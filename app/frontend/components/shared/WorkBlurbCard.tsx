import type { MouseEvent } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Card } from "@/design-system/components/ui/card";
import { formatCount } from "./archiveFormat";
import { StatRow } from "./StatRow";
import { TagPill } from "./TagPill";
import type { StatItem, WorkBlurb } from "./archiveTypes";

type WorkStatsDensity = "compact" | "full";

type WorkBlurbCardProps = {
  readonly work: WorkBlurb;
  readonly onOpen?: (work: WorkBlurb) => void;
  readonly statsDensity?: WorkStatsDensity;
  readonly showCategories?: boolean;
  readonly showTagDetails?: boolean;
  readonly showLanguage?: boolean;
};

function workStats(
  work: WorkBlurb,
  density: WorkStatsDensity,
  showLanguage: boolean,
): readonly StatItem[] {
  const baseStats = [
    { label: "Language", value: work.stats.language, hidden: !showLanguage || !work.stats.language },
    { label: "Words", value: formatCount(work.stats.words) },
    { label: "Chapters", value: work.stats.chapters },
  ];

  if (density === "compact") {
    return [
      ...baseStats,
      { label: "Kudos", value: formatCount(work.stats.kudos) },
      { label: "Hits", value: formatCount(work.stats.hits) },
    ];
  }

  return [
    ...baseStats,
    { label: "Comments", value: formatCount(work.stats.comments) },
    { label: "Kudos", value: formatCount(work.stats.kudos) },
    { label: "Bookmarks", value: formatCount(work.stats.bookmarks) },
    { label: "Hits", value: formatCount(work.stats.hits) },
  ];
}

export function WorkBlurbCard({
  work,
  onOpen,
  statsDensity = "full",
  showCategories = true,
  showTagDetails = true,
  showLanguage = true,
}: WorkBlurbCardProps) {
  const warnings = work.warnings.filter(
    (warning) => warning.name !== "No Archive Warnings Apply",
  );
  const hasWarnings = warnings.length > 0;

  const handleTitleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      !onOpen ||
      typeof window === "undefined" ||
      !window.matchMedia("(max-width: 767px)").matches
    ) {
      return;
    }

    event.preventDefault();
    onOpen(work);
  };

  return (
    <Card className="rounded-none border-x-0 border-t-0 px-4 py-4 transition-[background-color,box-shadow] duration-150 ease-out last:border-b-0 hover:bg-muted/35 hover:shadow-[inset_3px_0_0_var(--link)] md:px-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 text-pretty break-words font-semibold text-[15px] leading-snug">
          <a
            href={work.url}
            className="rounded-sm text-link underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/35"
            onClick={handleTitleClick}
          >
            {work.title}
          </a>
          <span className="font-normal text-muted-foreground"> by </span>
          {work.authors.map((author, index) => (
            <span key={`${author.name}-${author.url ?? "anonymous"}-${index}`}>
              {index > 0 && ", "}
              <a
                href={author.url ?? "#"}
                className="rounded-sm text-link underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/35"
              >
                {author.name}
              </a>
            </span>
          ))}
        </h4>
        <div className="flex shrink-0 flex-wrap gap-1 sm:max-w-[45%] sm:justify-end">
          {work.ratings[0] && <Badge variant="outline">{work.ratings[0].name}</Badge>}
          <Badge
            variant={hasWarnings ? "destructive" : "outline"}
            aria-label={hasWarnings ? "Archive warnings apply" : "No archive warnings apply"}
            title={hasWarnings ? "Archive warnings apply" : "No archive warnings apply"}
          >
            {hasWarnings ? <TriangleAlert aria-hidden="true" /> : <Check aria-hidden="true" />}
          </Badge>
          {showCategories && work.categories[0] && (
            <Badge variant="outline">
              {work.categories.map((category) => category.name).join(", ")}
            </Badge>
          )}
          <Badge variant="outline">{work.complete ? "Complete" : "WIP"}</Badge>
        </div>
      </div>

      {work.fandoms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 leading-none">
          {work.fandoms.map((tag, index) => (
            <TagPill key={`${tag.name}-${index}`} tag={tag} variant="secondary" />
          ))}
        </div>
      )}

      {showTagDetails && (warnings.length > 0 ||
        work.relationships.length > 0 ||
        work.characters.length > 0 ||
        work.freeforms.length > 0) && (
        <div className="flex flex-wrap gap-1 leading-none">
          {warnings.map((tag, index) => (
            <TagPill key={`warning-${tag.name}-${index}`} tag={tag} variant="destructive" />
          ))}
          {[...work.relationships, ...work.characters, ...work.freeforms].map((tag, index) => (
            <TagPill key={`tag-${tag.name}-${index}`} tag={tag} variant="outline" />
          ))}
        </div>
      )}

      {work.summaryHtml && (
        <div
          className="text-pretty text-foreground/90 text-sm leading-6 [&_p]:my-1"
          dangerouslySetInnerHTML={{ __html: work.summaryHtml }}
        />
      )}

      <StatRow items={workStats(work, statsDensity, showLanguage)} />
    </Card>
  );
}
