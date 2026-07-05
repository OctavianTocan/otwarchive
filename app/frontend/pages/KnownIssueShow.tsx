import { ContentArticle } from "../components/ContentPage";
type Props = { context: { heading: string; indexUrl: string }; title: string; contentHtml: string | null };
export default function KnownIssueShow({ context, title, contentHtml }: Props) {
  return <ContentArticle heading="Known Issues" title={title} contentHtml={contentHtml} indexUrl={context.indexUrl} />;
}
