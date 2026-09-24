import { useQueries, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getPouleStandings, type PouleResult } from "@/server/standings.functions";
import { PouleStandingsCard } from "@/components/PouleStandingsCard";
import { klasseRank, pouleSubSort } from "@/lib/klasse";
import type { DisplayMode } from "@/config/poules";

export const pouleQuery = (pouleId: number, force = false) =>
  queryOptions({
    queryKey: ["poule", pouleId],
    queryFn: async (): Promise<PouleResult> => {
      try {
        const r = await getPouleStandings({ data: { pouleId, force } });
        if (!r) return { ok: false, pouleId, error: "Geen antwoord" };
        return r;
      } catch (err) {
        return {
          ok: false,
          pouleId,
          error: err instanceof Error ? err.message : "Netwerkfout",
        };
      }
    },
    staleTime: force ? 0 : 5 * 60 * 1000,
    retry: 1,
  });

type Entry = { id: number; result: PouleResult };

function entrySortName(entry: Entry) {
  return entry.result.ok
    ? (entry.result.data.competition.class_name ??
      entry.result.data.competition.poule_name ??
      entry.result.data.matches.find((match) => match.poule_name)?.poule_name ??
      entry.result.data.name)
    : `Poule ${entry.id}`;
}

function groupByKlasse(entries: Entry[]) {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const klasse = e.result.ok
      ? (e.result.data.competition.class_name ?? e.result.data.competition.name ?? "Onbekend")
      : "Laden…";
    const arr = map.get(klasse) ?? [];
    arr.push(e);
    map.set(klasse, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => {
      const an = entrySortName(a);
      const bn = entrySortName(b);
      const ar = klasseRank(an);
      const br = klasseRank(bn);
      if (ar !== br) return ar - br;
      return pouleSubSort(an).localeCompare(pouleSubSort(bn));
    });
  }
  return Array.from(map.entries()).sort(([a], [b]) => {
    const ra = klasseRank(a);
    const rb = klasseRank(b);
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

export function StandingsView({ title, pouleIds, displayMode = "standings" }: { title: string; pouleIds: number[]; displayMode?: DisplayMode }) {
  const queryClient = useQueryClient();
  const [reloadingPouleId, setReloadingPouleId] = useState<number | null>(null);
  const [queriesEnabled, setQueriesEnabled] = useState(false);

  useEffect(() => {
    setQueriesEnabled(true);
  }, []);

  const results = useQueries({
    queries: pouleIds.map((id) => ({ ...pouleQuery(id), enabled: queriesEnabled })),
  });

  const reloadPoule = async (pouleId: number) => {
    setReloadingPouleId(pouleId);
    try {
      await queryClient.fetchQuery(pouleQuery(pouleId, true));
    } finally {
      setReloadingPouleId(null);
    }
  };

  const entries: Entry[] = pouleIds.map((id, i) => {
    const q = results[i];
    const result: PouleResult = q.data ?? {
      ok: false,
      pouleId: id,
      error: q.isLoading ? "Laden…" : (q.error?.message ?? "Onbekende fout"),
    };
    return { id, result };
  });

  const klasses = groupByKlasse(entries);
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>

      {klasses.map(([klasse, items]) => (
        <div key={klasse} className="space-y-3">
          {!title.toLowerCase().endsWith(klasse.toLowerCase()) && (
            <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">
              {klasse}
            </h2>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((entry, index) => {
              const { id, result } = entry;
              const startsNewSortGroup =
                index > 0 &&
                klasseRank(entrySortName(entry)) !== klasseRank(entrySortName(items[index - 1]));

              return (
                <>
                  {startsNewSortGroup && <div className="col-span-full h-0" aria-hidden="true" />}
                  <PouleStandingsCard
                    key={id}
                    result={result}
                    displayMode={displayMode}
                    onReload={() => void reloadPoule(id)}
                    reloading={reloadingPouleId === id}
                  />
                </>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}