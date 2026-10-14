import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES, type PouleGroup } from "@/config/poules";

export const Route = createFileRoute("/sitemap")({
  component: SitemapPage,
});

function SitemapPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Navigatie
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Sitemap</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Alle beschikbare categorie- en poulepagina’s. De lijst wordt opgebouwd uit de actuele pouleconfiguratie.
        </p>
        <Link
          to="/"
          className="inline-flex rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Home
        </Link>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((category) => {
          const defaultPhase = category.phases?.[0];
          const defaultGroup = defaultPhase
            ? category.groups.find((group) => defaultPhase.groupKeys.includes(group.key))
            : category.groups[0];
          const phaseGroupKeys = new Set(category.phases?.flatMap((phase) => phase.groupKeys) ?? []);
          const unassignedGroups = category.groups.filter((group) => !phaseGroupKeys.has(group.key));

          return (
            <section key={category.key} className="space-y-4 rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  <Link
                    to="/$category"
                    params={{ category: category.key }}
                    className="hover:underline"
                  >
                    {category.label}
                  </Link>
                </h2>
                {defaultGroup && <PouleCount count={defaultGroup.pouleIds.length} />}
              </div>

              <ul className="space-y-2 border-b pb-4 text-sm">
                <li>
                  <Link
                    to="/$category"
                    params={{ category: category.key }}
                    className="font-medium text-primary hover:underline"
                  >
                    Overzicht
                  </Link>
                  <span className="ml-2 text-muted-foreground">{defaultGroup ? `${defaultGroup.pouleIds.length} poules` : "geen poules"}</span>
                </li>
              </ul>

              {category.phases?.map((phase) => {
                const groups = phase.groupKeys
                  .map((key) => category.groups.find((group) => group.key === key))
                  .filter((group): group is PouleGroup => Boolean(group));

                if (groups.length === 0) return null;

                return (
                  <div key={phase.key} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {phase.label}
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {groups.map((group) => (
                        <li key={group.key} className="flex items-baseline justify-between gap-3">
                          <Link
                            to="/$category/$phase/$region"
                            params={{
                              category: category.key,
                              phase: phase.pathKey ?? phase.key,
                              region: group.pathKey ?? group.key,
                            }}
                            className="text-primary hover:underline"
                          >
                            {group.label}
                          </Link>
                          <PouleCount count={group.pouleIds.length} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {unassignedGroups.length > 0 && (
                <ul className="space-y-2 text-sm">
                  {unassignedGroups.map((group) => (
                    <li key={group.key} className="flex items-baseline justify-between gap-3">
                      <Link
                        to="/$category/$region"
                        params={{ category: category.key, region: group.pathKey ?? group.key }}
                        className="text-primary hover:underline"
                      >
                        {group.label}
                      </Link>
                      <PouleCount count={group.pouleIds.length} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function PouleCount({ count }: { count: number }) {
  return <span className="shrink-0 text-xs text-muted-foreground">{count} poules</span>;
}
