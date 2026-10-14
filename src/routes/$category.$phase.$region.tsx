import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  getCategory,
  getGroup,
  getPhase,
  type Category,
  type PouleGroup,
  type PoulePhase,
} from "@/config/poules";
import { StandingsView } from "@/components/StandingsView";

export const Route = createFileRoute("/$category/$phase/$region")({
  loader: ({ params }) => {
    const category = getCategory(params.category);
    if (!category) throw notFound();

    const phase = getPhase(category, params.phase);
    if (!phase) throw notFound();

    const group = getGroup(category, params.region);
    if (!group || !phase.groupKeys.includes(group.key)) throw notFound();

    return { category, phase, group };
  },
  component: PhaseRegionPage,
});

function PhaseRegionPage() {
  const { category, phase, group } = Route.useLoaderData() as {
    category: Category;
    phase: PoulePhase;
    group: PouleGroup;
  };
  const groups = category.groups.filter((item) => phase.groupKeys.includes(item.key));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/$category" params={{ category: category.key }} className="hover:text-foreground">
          {category.label}
        </Link>
        <span>/</span>
        <span>{phase.label}</span>
        <span>/</span>
        <span className="text-foreground">{group.label}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {category.phases?.map((item) => {
          const firstGroup = category.groups.find((candidate) => item.groupKeys.includes(candidate.key));
          if (!firstGroup) return null;

          return (
            <Link
              key={item.key}
              to="/$category/$phase/$region"
              params={{
                category: category.key,
                phase: item.pathKey ?? item.key,
                region: firstGroup.pathKey ?? firstGroup.key,
              }}
              className={item.key === phase.key
                ? "rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {groups.map((item) => (
          <Link
            key={item.key}
            to="/$category/$phase/$region"
            params={{
              category: category.key,
              phase: phase.pathKey ?? phase.key,
              region: item.pathKey ?? item.key,
            }}
            className={item.key === group.key
              ? "rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
              : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <StandingsView title={`${category.label} — ${phase.label} — ${group.label}`} pouleIds={group.pouleIds} />
    </div>
  );
}