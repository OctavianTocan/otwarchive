import { ContentList } from "../components/ContentPage";
type Props = { context: { heading: string }; items: { title: string; url: string }[] };
export default function KnownIssuesIndex({ context, items }: Props) {
  return <ContentList heading={context.heading} items={items} />;
}
