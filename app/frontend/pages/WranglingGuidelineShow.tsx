import { ContentArticle } from "../components/ContentPage";
type Props = { context: { heading: string; indexUrl: string }; title: string; contentHtml: string | null };
export default function WranglingGuidelineShow({ context, title, contentHtml }: Props) {
  return <ContentArticle heading="Wrangling Guidelines" title={title} contentHtml={contentHtml} indexUrl={context.indexUrl} />;
}
