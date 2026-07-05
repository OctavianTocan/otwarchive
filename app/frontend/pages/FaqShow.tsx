import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";

type Question = { anchor: string; question: string; answerHtml: string | null };
type Props = {
  context: { heading: string; indexUrl: string };
  title: string;
  questions: Question[];
};

export default function FaqShow({ context, title, questions }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-4 md:px-5 pt-6 pb-16">
        <main className="flex flex-col gap-5">
          <header className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">
              <a href={context.indexUrl} className="text-link hover:underline">
                {context.heading}
              </a>
            </p>
            <h2 className="break-words font-bold text-2xl leading-tight">{title}</h2>
          </header>

          {questions.length > 0 ? (
            <>
              <Card className="px-5">
                <h3 className="font-semibold text-base">{title}</h3>
                <ul className="mt-2 flex flex-col gap-1 text-sm">
                  {questions.map((q, i) => (
                    <li key={i}>
                      <a href={`#${q.anchor}`} className="text-link hover:underline">
                        {q.question}
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="flex flex-col gap-6">
                {questions.map((q, i) => (
                  <section key={i} id={q.anchor} className="scroll-mt-20">
                    <h3 className="font-semibold text-lg">{q.question}</h3>
                    {q.answerHtml && (
                      <div
                        className="userstuff mt-2 text-foreground/90 text-sm [&_a]:text-primary [&_a]:hover:underline [&_p]:my-2"
                        dangerouslySetInnerHTML={{ __html: q.answerHtml }}
                      />
                    )}
                  </section>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              We're sorry, there are currently no entries in this category.
            </p>
          )}
        </main>
      </div>
    </AppShell>
  );
}
