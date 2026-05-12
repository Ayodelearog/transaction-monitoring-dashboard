"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { fetchTransactions } from "@/lib/api/transactions";
import { queryKeys } from "@/lib/query/keys";
import { cn, formatCurrency } from "@/lib/utils";
import { riskLabel, riskTone, statusLabel, statusTone } from "@/lib/ui-mappings";
import type { Transaction } from "@/lib/types";

const MIN_QUERY = 2;
const RESULT_LIMIT = 5;

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeKey, setActiveKey] = useState("");

  const debounced = useDebouncedValue(query, 250);
  const trimmed = debounced.trim();
  const ready = trimmed.length >= MIN_QUERY;

  if (activeKey !== trimmed) {
    setActiveKey(trimmed);
    setActiveIndex(0);
  }

  const queryArgs = { search: trimmed, page: 1, pageSize: RESULT_LIMIT };
  const { data, isFetching } = useQuery({
    queryKey: queryKeys.transactions(queryArgs),
    queryFn: () => fetchTransactions(queryArgs),
    enabled: ready,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasFooter = ready && total > 0;
  const optionCount = items.length + (hasFooter ? 1 : 0);

  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    inputRef.current?.blur();
  }, []);

  const goToResults = useCallback(
    (extraParams?: Record<string, string>) => {
      const params = new URLSearchParams({ search: trimmed, ...extraParams });
      router.push(`/dashboard/transactions?${params.toString()}`);
      close();
    },
    [router, trimmed, close],
  );

  const handleSelect = useCallback(
    (transaction: Transaction) => goToResults({ open: transaction.id }),
    [goToResults],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (optionCount === 0) return;
      setActiveIndex((i) => (i + 1) % optionCount);
      setOpen(true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (optionCount === 0) return;
      setActiveIndex((i) => (i - 1 + optionCount) % optionCount);
    } else if (event.key === "Enter") {
      if (!ready) return;
      event.preventDefault();
      if (activeIndex < items.length) {
        handleSelect(items[activeIndex]);
      } else {
        goToResults();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (query) {
        setQuery("");
      } else {
        close();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative hidden sm:flex flex-1 max-w-md"
    >
      <Input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        leading={<Search className="h-4 w-4" />}
        trailing={
          !open ? (
            <kbd className="hidden md:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          ) : undefined
        }
        placeholder="Search transactions, customers..."
        aria-label="Global search"
        aria-autocomplete="list"
        aria-expanded={open && ready}
        aria-controls="global-search-results"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        className="w-full"
      />

      {open && ready && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          {items.length === 0 && !isFetching && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No transactions match{" "}
              <span className="font-medium text-foreground">
                &ldquo;{trimmed}&rdquo;
              </span>
              .
            </div>
          )}

          {items.length === 0 && isFetching && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Searching…
            </div>
          )}

          {items.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Transactions
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isFetching ? "Updating…" : `${total} match${total === 1 ? "" : "es"}`}
                </span>
              </div>

              <ul className="max-h-[360px] overflow-auto">
                {items.map((transaction, index) => (
                  <ResultRow
                    key={transaction.id}
                    transaction={transaction}
                    query={trimmed}
                    active={activeIndex === index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(transaction)}
                  />
                ))}
              </ul>

              {hasFooter && (
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(items.length)}
                  onClick={() => goToResults()}
                  className={cn(
                    "flex w-full items-center justify-between border-t border-border px-3.5 py-2.5 text-xs text-muted-foreground hover:bg-muted",
                    activeIndex === items.length && "bg-muted text-foreground",
                  )}
                >
                  <span>
                    View all {total} result{total === 1 ? "" : "s"} for{" "}
                    <span className="font-medium text-foreground">
                      &ldquo;{trimmed}&rdquo;
                    </span>
                  </span>
                  <span aria-hidden>↵</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface ResultRowProps {
  transaction: Transaction;
  query: string;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}

function ResultRow({
  transaction,
  query,
  active,
  onMouseEnter,
  onClick,
}: ResultRowProps) {
  return (
    <li
      role="option"
      aria-selected={active}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-3 px-3.5 py-2.5 border-l-2 border-transparent",
        active && "bg-muted border-l-primary",
      )}
    >
      <Avatar name={transaction.customer.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-foreground">
            <HighlightMatch text={transaction.customer.name} query={query} />
          </p>
          <span className="text-xs text-muted-foreground">·</span>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            <HighlightMatch text={transaction.reference} query={query} />
          </p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge tone={statusTone[transaction.status]} className="text-[10px]">
            {statusLabel[transaction.status]}
          </Badge>
          <Badge tone={riskTone[transaction.risk]} dot className="text-[10px]">
            {riskLabel[transaction.risk]} risk
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(transaction.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
      <p className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
        {formatCurrency(transaction.amount, transaction.currency)}
      </p>
    </li>
  );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  const index = lower.indexOf(needle);
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-primary/15 px-0.5 text-primary">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}
