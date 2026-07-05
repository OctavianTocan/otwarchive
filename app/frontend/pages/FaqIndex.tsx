import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";

type Faq = { title: string; url: string };
type Props = {
  context: { heading: string };
  faqs: Faq[];
};

export default function FaqIndex({ context, faqs }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-4 md:px-5 pt-6 pb-16">
        <main className="flex flex-col gap-5">
          <header>
            <h2 className="font-semibold text-lg leading-tight">{context.heading}</h2>
          </header>

          {faqs.length > 0 ? (
            <Card className="px-5">
              <h3 className="font-semibold text-base">Available Categories</h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {faqs.map((faq, i) => (
                  <li key={i}>
                    <a href={faq.url} className="text-link hover:underline">
                      {faq.title}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <p className="text-muted-foreground text-sm">
              We're sorry, there are currently no entries in the FAQ System.
            </p>
          )}
        </main>
      </div>
    </AppShell>
  );
}
