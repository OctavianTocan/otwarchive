import type { ReactNode } from "react";

export type TagRef = {
  readonly name: string;
  readonly url: string | null;
  readonly type: string;
};

export type WorkAuthorRef = {
  readonly name: string;
  readonly url: string | null;
};

export type WorkStats = {
  readonly language?: string;
  readonly words?: number;
  readonly chapters?: string;
  readonly comments?: number;
  readonly kudos?: number;
  readonly bookmarks?: number;
  readonly hits?: number;
};

export type WorkBlurb = {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly authors: readonly WorkAuthorRef[];
  readonly anonymous: boolean;
  readonly fandoms: readonly TagRef[];
  readonly ratings: readonly TagRef[];
  readonly warnings: readonly TagRef[];
  readonly categories: readonly TagRef[];
  readonly relationships: readonly TagRef[];
  readonly characters: readonly TagRef[];
  readonly freeforms: readonly TagRef[];
  readonly summaryHtml: string | null;
  readonly stats: WorkStats;
  readonly published?: string;
  readonly updated?: string;
  readonly complete?: boolean;
};

export type Pagination = {
  readonly page: number;
  readonly pages: number;
  readonly count: number;
};

export type FacetItem = {
  readonly value: string;
  readonly label: string;
  readonly count: number;
  readonly active: boolean;
};

export type FacetGroup = {
  readonly key: string;
  readonly label: string;
  readonly items: readonly FacetItem[];
};

export type StatItem = {
  readonly label: string;
  readonly value: ReactNode;
  readonly hidden?: boolean;
};
