import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, Minus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PouleResult, StandingRow } from "@/server/standings.functions";
import type { DisplayMode } from "@/config/poules";

function formatMatchDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
  });
}

function isScheduled(match: { status: string }) {
  return match.status.trim().toLowerCase() === "scheduled";
}

function formatMatchResult(match: { status: string; score: { home: number; away: number }; shootouts: { home: number; away: number } }) {
  if (match.status.trim().toLowerCase() === "cancelled") return "AFG";
  if (isScheduled(match)) return "";
  const score = `${match.score.home}-${match.score.away}`;
  const shootouts = match.shootouts;
  if (shootouts.home === 0 && shootouts.away === 0) return score;
  return `${score} (shootouts ${shootouts.home}-${shootouts.away})`;
}

function formatMatchResultTeams(match: { status: string; home: { name: string }; away: { name: string }; score: { home: number; away: number }; shootouts: { home: number; away: number } }) {
  if (isScheduled(match) || match.status.trim().toLowerCase() === "cancelled") {
    return `${match.home.name}-${match.away.name}`;
  }
  const shootouts = match.shootouts;
  const homeTotal = match.score.home + shootouts.home;
  const awayTotal = match.score.away + shootouts.away;

  const homeIsWinner = homeTotal > awayTotal;

  return (
    <>
      {homeIsWinner ? (
        <>
          <span className="font-bold">{match.home.name}</span>-{match.away.name}
        </>
      ) : (
        <>
          {match.home.name}-<span className="font-bold">{match.away.name}</span>
        </>
      )}
    </>
  );
}

function RankChange({ change }: { change: StandingRow["change"] }) {
  if (change === "up") return <ArrowUp className="h-3 w-3 text-emerald-600" />;
  if (change === "down") return <ArrowDown className="h-3 w-3 text-red-600" />;
  return <Minus className="h-3 w-3 text-muted-foreground/50" />;
}

export function PouleStandingsCard({ result, groupLabel, displayMode = "standings", onReload, reloading = false }: { result: PouleResult; groupLabel?: string; displayMode?: DisplayMode; onReload?: () => void; reloading?: boolean }) {
  if (!result.ok) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{groupLabel ?? `Poule ${result.pouleId}`}</CardTitle>
            {onReload ? (
              <Button type="button" variant="ghost" size="icon" onClick={onReload} disabled={reloading} aria-label={`Poule ${result.pouleId} opnieuw laden`} title={`Poule ${result.pouleId} opnieuw laden`}>
                <RefreshCw className={reloading ? "animate-spin" : ""} />
              </Button>
            ) : null}
          </div>
          <CardDescription className="text-destructive">Failed to load: {result.error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const { data } = result;
  const mode = displayMode ?? "standings";
  const showStandings = mode == "standings" && data.standings.length > 0;
  const showMatches = mode !== "standings" && data.matches.length > 0;
  const isCup = /^(gold|silver) cup\b/i.test(data.competition.name);
  const cupPouleName = data.matches.find((match) => match.poule_name)?.poule_name;
  const displayName = isCup ? (data.competition.poule_name ?? cupPouleName ?? data.name) : data.name;
  const matches = isCup
    ? [...data.matches].sort((a, b) => b.round - a.round)
    : data.matches;
  
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-base uppercase tracking-wide">
            {groupLabel ?? displayName}
          </CardDescription>
          {onReload ? (
            <Button type="button" variant="ghost" size="icon" onClick={onReload} disabled={reloading} aria-label={`Poule ${data.pouleId} opnieuw laden`} title={`Poule ${data.pouleId} opnieuw laden`}>
              <RefreshCw className={reloading ? "animate-spin" : ""} />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        {showStandings ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8 px-2 text-xs">#</TableHead>
                <TableHead className="px-2 text-xs">Team</TableHead>
                <TableHead className="px-1 text-right text-xs">GP</TableHead>
                <TableHead className="px-1 text-right text-xs">W</TableHead>
                <TableHead className="px-1 text-right text-xs">D</TableHead>
                <TableHead className="px-1 text-right text-xs">L</TableHead>
                <TableHead className="px-1 text-right text-xs">+/-</TableHead>
                <TableHead className="px-2 text-right text-xs font-semibold">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.standings.map((row) => (
                <TableRow key={row.team.id} className="hover:bg-muted/30 border-b-0">
                  <TableCell className="px-2 py-1.5">
                    <div className="flex items-center gap-1 text-xs tabular-nums">
                      <span>{row.rank}</span>
                      <RankChange change={row.change} />
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {row.team.logo ? (
                        <img
                          src={row.team.logo}
                          alt=""
                          className="h-5 w-5 shrink-0 rounded-sm object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-5 w-5 shrink-0 rounded-sm bg-muted" />
                      )}
                      <span className="truncate text-xs">{row.team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-1.5 text-right text-xs tabular-nums text-muted-foreground">
                    {row.played}
                  </TableCell>
                  <TableCell className="px-1 py-1.5 text-right text-xs tabular-nums">{row.wins}</TableCell>
                  <TableCell className="px-1 py-1.5 text-right text-xs tabular-nums">{row.draws}</TableCell>
                  <TableCell className="px-1 py-1.5 text-right text-xs tabular-nums">{row.losses}</TableCell>
                  <TableCell className="px-1 py-1.5 text-right text-xs tabular-nums text-muted-foreground">
                    {row.goals_for}-{row.goals_against}
                  </TableCell>
                  <TableCell className="px-2 py-1.5 text-right text-xs font-semibold tabular-nums">
                    {row.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}

        {showMatches ? (
          <div className={showStandings ? "mt-4 text-right" : ""}>
            
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-2 text-xs">Datum</TableHead>
                  <TableHead className="px-2 text-xs">Wedstrijd</TableHead>
                  <TableHead className="px-1 text-right text-xs">Uitslag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id} className="hover:bg-muted/30 border-b-0">
                    <TableCell className="px-2 py-1.5 text-xs text-muted-foreground">
                      {formatMatchDate(match.date)}
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-xs">                      
                      {formatMatchResultTeams(match)}
                    </TableCell>
                    <TableCell className="px-1 py-1.5 text-right text-xs tabular-nums">
                      {formatMatchResult(match)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}