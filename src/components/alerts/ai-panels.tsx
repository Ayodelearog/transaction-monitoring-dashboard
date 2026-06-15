"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/ui/markdown";
import { useStreamingGeneration } from "@/hooks/use-streaming";
import { useSaveSar } from "@/hooks/use-alerts";
import type { SarReport } from "@/lib/types";

function StreamingError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-xs text-danger">
      <TriangleAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

function Cursor() {
  return (
    <motion.span
      aria-hidden
      className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 rounded-sm bg-primary"
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
  );
}

/** Streaming AI risk assessment for a case. */
export function AiAnalysisPanel({ caseId }: { caseId: string }) {
  const gen = useStreamingGeneration(`/api/alerts/${caseId}/analyze`);

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">AI triage assistant</p>
            <p className="text-[11px] text-muted-foreground">
              Claude-drafted risk assessment · analyst makes the final call
            </p>
          </div>
        </div>
        {(gen.done || gen.error) && !gen.isStreaming && (
          <Button size="sm" variant="ghost" onClick={gen.start}>
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </Button>
        )}
      </div>

      <div className="mt-3">
        {gen.error && <StreamingError message={gen.error} />}

        {!gen.text && !gen.isStreaming && !gen.error && (
          <Button size="sm" onClick={gen.start} className="w-full sm:w-auto">
            <Sparkles className="h-3.5 w-3.5" />
            Generate analysis
          </Button>
        )}

        {(gen.isStreaming || gen.text) && (
          <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
            <Markdown content={gen.text} />
            {gen.isStreaming && <Cursor />}
          </div>
        )}
      </div>
    </div>
  );
}

interface SarPanelProps {
  caseId: string;
  existing: SarReport | null;
}

/** Streaming AI SAR-narrative drafting with an editable, savable result. */
export function SarPanel({ caseId, existing }: SarPanelProps) {
  // The hook owns the narrative text — seeded from any saved draft, then
  // overwritten by streaming, then editable by the analyst.
  const gen = useStreamingGeneration(
    `/api/alerts/${caseId}/sar/draft`,
    existing?.narrative ?? "",
  );
  const save = useSaveSar(caseId);
  const [draftedByAi, setDraftedByAi] = useState(existing?.draftedBy === "ai");

  const editorValue = gen.text;

  const generate = () => {
    setDraftedByAi(true);
    void gen.start();
  };

  const persist = (status: SarReport["status"]) => {
    const narrative = editorValue.trim();
    if (!narrative) return;
    save.mutate({ narrative, draftedBy: draftedByAi ? "ai" : "analyst", status });
  };

  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Suspicious Activity Report
            </p>
            <p className="text-[11px] text-muted-foreground">
              Draft the regulatory narrative, then review & file
            </p>
          </div>
        </div>
        {existing && (
          <Badge tone={existing.status === "approved" ? "success" : "warning"}>
            {existing.status === "approved" ? "Filed" : "Draft saved"}
          </Badge>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {gen.error && <StreamingError message={gen.error} />}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={generate}
            loading={gen.isStreaming}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {editorValue || existing ? "Redraft with AI" : "Draft with AI"}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {(editorValue || gen.isStreaming) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Textarea
                value={editorValue}
                onChange={(e) => {
                  gen.setText(e.target.value);
                  setDraftedByAi(false);
                }}
                readOnly={gen.isStreaming}
                rows={8}
                placeholder="SAR narrative…"
                aria-label="SAR narrative"
              />
              {draftedByAi && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Drafted with AI assistance. Review carefully before filing — you are
                  responsible for the final report.
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => persist("draft")}
                  loading={save.isPending}
                  disabled={gen.isStreaming || !editorValue.trim()}
                >
                  Save draft
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => persist("approved")}
                  loading={save.isPending}
                  disabled={gen.isStreaming || !editorValue.trim()}
                >
                  Approve & file SAR
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
