// Consistent klasse ordering + parsing utilities.
// Klasse names come from the KNHB API field `competition.class_name`,
// e.g. "Hoofdklasse", "Promotieklasse", "Overgangsklasse",
// "1e klasse", "2e klasse" ... or for reserves "Reserve 1e klasse" etc.

const NAMED_ORDER: Record<string, number> = {
  Hoofdklasse: 0,
  Promotieklasse: 1,
  Overgangsklasse: 2,
  landelijk: 0,
  super: 1,
  subtop: 2,
  topklasse: 3,
  subtopklasse: 4,
  "silver cup - finale": 0,
  "silver cup - halve finale": 1,
  "silver cup - kwartfinale": 2,
  "silver cup - ko ronde 7": 3,
  "silver cup - ko ronde 6": 4,
  "silver cup - ko ronde 5": 5,
  "silver cup - ko ronde 4": 6,
  "silver cup - ko ronde 3": 7,
  "silver cup - ko ronde 2": 8,
  "silver cup - ko ronde 1": 9,
  "gold cup - ko ronde 2": 8,
  "gold cup - ko ronde 1": 9,

};

// Returns a sortable rank. Lower = earlier (higher up the pyramid).
export function klasseRank(className: string | undefined | null): number {
  if (!className) return 9999;
  const norm = className.toLowerCase().trim().replace(/[–—]/g, "-");

  // Strip leading "reserve " so reserves sort alongside their klasse,
  // but bump them after the standaard equivalents using +0.5.
  const isReserve = norm.startsWith("reserve ");
  const core = isReserve ? norm.slice("reserve ".length) : norm;
  const offset = isReserve ? 0.5 : 0;


  if (core in NAMED_ORDER) return NAMED_ORDER[core] + offset;

  const namedClass = Object.keys(NAMED_ORDER).find(
    (name) => core.startsWith(`${name} - `),
  );
  if (namedClass) return NAMED_ORDER[namedClass] + offset;
  
  // Numeric klasses: "1e klasse", "12e klasse", ...
  const m = core.match(/^(\d+)e\s+klasse/);
  if (m) return 10 + parseInt(m[1], 10) + offset;

  
  return 9999;
  
}

// Sorts a poule's display label inside a klasse, e.g. "Poule A" before "Poule B".
export function pouleSubSort(name: string | undefined | null): string {
  return (name ?? "").toLowerCase();
}
