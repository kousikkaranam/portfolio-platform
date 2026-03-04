import ReactMarkdown from "react-markdown";
import SectionTitle from "@/templates/default/components/SectionTitle";

interface Props {
  title: string;
  content: string | null;
  accentColor: string;
}

export default function CustomSectionRenderer({ title, content, accentColor }: Props) {
  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <SectionTitle title={title} accent={accentColor} />
      {content && (
        <div className="mt-8 prose prose-invert prose-sm max-w-none"
          style={{
            "--tw-prose-body": "var(--text-secondary)",
            "--tw-prose-headings": "var(--text)",
            "--tw-prose-bold": "var(--text)",
            "--tw-prose-bullets": "var(--text-muted)",
            "--tw-prose-counters": "var(--text-muted)",
            "--tw-prose-links": accentColor,
            "--tw-prose-hr": "var(--border)",
            "--tw-prose-quotes": "var(--text-muted)",
            "--tw-prose-quote-borders": "var(--border)",
          } as React.CSSProperties}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </section>
  );
}
