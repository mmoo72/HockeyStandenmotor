import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/config/poules";

import appCss from "../styles.css?url";
const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hockey op zaterdag en zondag" },
      { name: "description", content: "Live hockey-standen per poule." },
      { property: "og:title", content: "Hockeystanden op zaterdag en zondag" },
      { property: "og:description", content: "Live KNHB hockey-standen per poule." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
       <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [hydrated, setHydrated] = useState(false);
  //useEffect(() => {}, [queryClient]);

    // Sidebar width state
  const [sidebarWidth, setSidebarWidth] = useState(160);
  const [dragging, setDragging] = useState(false);

  function startDrag(e: React.MouseEvent) {
    setDragging(true);
    e.preventDefault();
  }

function onDrag(e: MouseEvent) {
  if (!dragging) return;
  const newWidth = Math.max(140, Math.min(260, e.clientX)); // min 140, max 260
  setSidebarWidth(newWidth);
}

  function stopDrag() {
    setDragging(false);
  }

    useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragging]);

useEffect(() => {
  document.documentElement.style.setProperty("--sidebar-width", `${sidebarWidth}px`);
}, [sidebarWidth]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Hele pagina: sidebar + rechterkolom */}
      <div className="min-h-screen bg-background flex">

        {/* Sidebar links */}
    <aside
  className="sticky top-[60px] h-screen overflow-y-auto border-r bg-background flex flex-col gap-1 p-4"
  style={{ width: sidebarWidth }}
>
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              to="/$category"
              params={{ category: c.key }}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              activeProps={{
                className:
                  "px-3 py-1.5 rounded-md text-sm font-medium bg-foreground text-background",
              }}
            >
              {c.label}
            </Link>
          ))}

          {/* Drag handle */}
          <div
            onMouseDown={startDrag}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-muted"
          />
        </aside>

        {/* Rechterkolom: header + content */}
        <div className="flex flex-1 flex-col">

          <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              <Link to="/" className="text-lg font-semibold tracking-tight">
                Hockeystanden
              </Link>
            </div>
          </header>

          <main className="flex-1 px-6 py-8 max-w-[1800px]">
            <Outlet />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
