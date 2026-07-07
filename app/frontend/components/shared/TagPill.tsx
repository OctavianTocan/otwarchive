import { Badge } from "@/design-system/components/ui/badge";
import type { TagRef } from "./archiveTypes";

type TagPillVariant = "secondary" | "outline" | "destructive";
type TagPillTag = Pick<TagRef, "name" | "url">;

type TagPillProps = {
  readonly tag: TagPillTag;
  readonly variant?: TagPillVariant;
};

export function TagPill({ tag, variant = "secondary" }: TagPillProps) {
  return (
    <Badge variant={variant} render={<a aria-label={tag.name} href={tag.url ?? "#"} />}>
      {tag.name}
    </Badge>
  );
}
