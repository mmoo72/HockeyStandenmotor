import { createFileRoute, notFound, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { getCategory, getAllPouleIds, hasRegions, type Category, type PouleGroup, type PoulePhase } from "@/config/poules";

import { StandingsView } from "#/components/StandingsView";

export const Route = createFileRoute("/$category")({
  loader: ({ params }) => {
    const cat = getCategory(params.category);
    if (!cat) throw notFound();
    return { category: cat };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData() as { category: Category };
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const [phaseKey, setPhaseKey] = useState(category.phases?.[0]?.key);

  if (pathSegments.length > 1) {
    return <Outlet />;
  }

  const selectedPhase = category.phases?.find((phase) => phase.key === phaseKey);
  const groups: PouleGroup[] = selectedPhase
    ? category.groups.filter((group) => selectedPhase.groupKeys.includes(group.key))
    : category.groups;

  if (groups.length === 0) {
    return (
      <div className="space-y-6">
        {category.phases && (
          <PhaseMenu category={category} phaseKey={phaseKey} onSelect={setPhaseKey} />
        )}
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h2 className="text-lg font-medium">{selectedPhase?.label ?? category.label}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Poules nog niet geconfigureerd.</p>
        </div>
      </div>
    );
  }

  if (hasRegions({ ...category, groups })) {
    const defaultGroup = groups[0];
    
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          {category.phases && (
            <PhaseMenu category={category} phaseKey={phaseKey} onSelect={setPhaseKey} />
          )}
          <GroupMenu category={category} groups={groups} phase={selectedPhase} activeGroupKey={defaultGroup.key} />
        </div>
        <StandingsView
          title={`${category.label} — ${defaultGroup.label}`}
          pouleIds={defaultGroup.pouleIds}
        />
      </div>
      

    );
  }

  return <StandingsView title={category.label} pouleIds={getAllPouleIds(category)} />;
}

function PhaseMenu({
  category,
  phaseKey,
  onSelect,
}: {
  category: Category;
  phaseKey?: string;
  onSelect: (key: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <span>Fase</span>
      <select
        value={phaseKey}
        onChange={(event) => onSelect(event.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium"
      >
        {category.phases?.map((phase) => (
          <option key={phase.key} value={phase.key}>
            {phase.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function GroupMenu({
  category,
  groups,
  phase,
  activeGroupKey,
}: {
  category: Category;
  groups: PouleGroup[];
  phase?: PoulePhase;
  activeGroupKey: string;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {groups.map((group) => {
        const className =
          group.key === activeGroupKey
            ? "px-3 py-1.5 rounded-md text-sm font-medium bg-foreground text-background"
            : "px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors";
        const region = group.pathKey ?? group.key;

        return phase ? (
          <Link
            key={group.key}
            to="/$category/$phase/$region"
            params={{ category: category.key, phase: phase.pathKey ?? phase.key, region }}
            className={className}
          >
            {group.label}
          </Link>
        ) : (
          <Link
            key={group.key}
            to="/$category/$region"
            params={{ category: category.key, region }}
            className={className}
          >
            {group.label}
          </Link>
        );
      })}
    </div>
  );
}