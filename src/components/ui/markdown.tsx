import { Fragment } from "react";
import { cn } from "@/lib/utils";

/** Render inline `**bold**` segments within a line of text. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/**
 * Minimal markdown renderer for AI output — handles `##` headings, `-`/`*`
 * bullet lists, and inline bold. Intentionally tiny; no external dependency.
 */
export function Markdown({ content, className }: { content: string; className?: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-2 space-y-1 pl-4">
        {list.map((item, i) => (
          <li key={i} className="list-disc text-sm text-muted-foreground marker:text-muted-foreground">
            {inline(item)}
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const heading = line.match(/^(#{1,4})\s+(.*)$/);

    if (bullet) {
      list.push(bullet[1]);
      continue;
    }
    flushList();

    if (heading) {
      blocks.push(
        <h4
          key={`h-${blocks.length}`}
          className="mt-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0"
        >
          {inline(heading[2])}
        </h4>,
      );
    } else if (line.trim()) {
      blocks.push(
        <p key={`p-${blocks.length}`} className="text-sm text-foreground/90 leading-relaxed">
          {inline(line)}
        </p>,
      );
    }
  }
  flushList();

  return <div className={cn("space-y-1", className)}>{blocks}</div>;
}
