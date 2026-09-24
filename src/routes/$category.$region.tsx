
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCategory, getDisplayMode, getGroup, type Category, type PouleGroup } from "@/config/poules";
import { StandingsView } from "@/components/StandingsView";

export const Route = createFileRoute("/$category/$region")({
  loader: ({ params }) => {
    const cat = getCategory(params.category);
    if (!cat) throw notFound();
    const group = getGroup(cat, params.region);
    if (!group) throw notFound();
    return { category: cat, group };
  },
  component: RegionPage,
});

function RegionPage() {
  const { category, group } = Route.useLoaderData() as { category: Category; group: PouleGroup };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/$category" params={{ category: category.key }} className="hover:text-foreground">
          {category.label}
        </Link>
        <span>/</span>
        <span className="text-foreground">{group.label}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {category.groups.map((g) => (
          <Link
            key={g.key}
            to="/$category/$region"
            params={{ category: category.key, region: g.key }}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            activeProps={{
              className: "px-3 py-1.5 rounded-md text-sm font-medium bg-foreground text-background",
            }}
          >
            {g.label}
          </Link>
        ))}
      </div>
      <StandingsView
        title={`${category.label} — ${group.label}`}
        pouleIds={group.pouleIds}
        displayMode={getDisplayMode(category, group.key)}
      />
    </div>
  );
}
