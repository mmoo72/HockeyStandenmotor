export type DisplayMode = "standings" | "matches" | "both";

export type PouleGroup = {
  key: string;
  label: string;
  pouleIds: number[];
  displayMode?: DisplayMode;
};

export type Category = {
  key: string;
  label: string;
  groups: PouleGroup[];
  phases?: PoulePhase[];
  displayMode?: DisplayMode;
};

export type PoulePhase = {
  key: string;
  label: string;
  groupKeys: string[];
};


export const CATEGORIES: Category[] = [
  { key: "heren", label: "Heren", displayMode: 'standings'
    , groups: [
      { key: "all", label: "Heren", pouleIds: [ 180864, 182075, 182076, 182077
                                              , 182651, 182652, 182653, 182654
                                              , 182655, 182656, 182657, 182658
                                              , 182659, 182660, 182661, 182662
                                              , 182663, 182664, 182917 ] },
      { key: "goldcup", label: "Gold Cup", displayMode:'matches'
        , pouleIds: [ 183128, 183129, 183130, 183171 ,183172 ,183170 ]},
      { key: "silvercup", label: "Silver Cup", displayMode:'matches'
        , pouleIds: [ 183131, 183132,183133, 183156 ,183157, 183158, 183159 ] }
    ] },
  { key: "dames", label: "Dames", displayMode: 'standings'
    , groups: [
      { key: "all", label: "Dames", pouleIds: [ 180863, 182072, 182073, 182074
                                              , 182665, 182666, 182667, 182668
                                              , 182669, 182670, 182671, 182672
                                              , 182673, 182674, 182675, 182676
                                              , 182677, 182678, 182679, 182680] },
      { key: "goldcup", label: "Gold Cup", displayMode:'matches'
        , pouleIds: [ 183121, 183122, 183123]},
      { key: "silvercup", label: "Silver Cup", displayMode:'matches'
        , pouleIds: [ 183124,183125,183126,183127, 183173, 183174, 183175, 183176 ]},
] },
  
  {
    key: "heren-reserve",
    label: "Heren reserve",
    displayMode: 'standings',
    groups: [
      { key: "bond", label: "Bond"
        , pouleIds: [182693, 182694, 182695, 182696, 182697, 182698, 182699, 182700] },
      { key: "midden-nederland", label: "Midden Nederland"
        , pouleIds: [181319, 181320, 181321, 181322, 181323, 181324, 181325] },
      { key: "noord-holland", label: "Noord-Holland"
        , pouleIds: [182899, 182900, 182901, 182902, 182903, 182904, 182905, 182906] },
      { key: "zuid-holland", label: "Zuid-Holland"
        , pouleIds: [182766, 182767, 182768, 182769, 182770, 182771, 182772, 182773, 182774, 182775] },
      { key: "zuid-nederland", label: "Zuid Nederland"
        , pouleIds: [182839, 182840, 182841, 182842, 182843, 182844, 182845, 182846, 182847, 182848, 182849, 182850, 182851] },
      { key: "noord-oost-nederland", label: "Noord+Oost Nederland"
        , pouleIds: [182970, 182971, 182972, 182973, 182974, 182975, 182976, 182977, 182978, 182979] },
    ],
  },
  {
    key: "dames-reserve",
    label: "Dames reserve",
    displayMode: 'standings',
    groups: [
      { key: "bond", label: "Bond"
        , pouleIds: [ 182681,182682,182683,182684,182685,182686,182687,182688    ] },  
      { key: "midden-nederland", label: "Midden Nederland"
        , pouleIds: [ 181308,181309,181310,181311,181312,181313,181314,181315,181316,181317, 181318 ] },
      { key: "noord-holland", label: "Noord-Holland"
        , pouleIds: [ 182868,182869,182870,182871,182872,182873,182874,182875,182876,182877,182878,182879      ] },
      { key: "zuid-holland", label: "Zuid-Holland"
        , pouleIds: [ 182784,182785,182786,182787,182788,182789,182790,182791,182792,182793,182794,182795,182796      ] },
      { key: "zuid-nederland", label: "Zuid Nederland"
        , pouleIds: [ 182704,182705,182706,182707,182708,182709,182710,182711,182712
                    , 182713,182714,182715,182716,182717,182718,182719,182720,182721
                    , 182722,182723,182724,182725 ] },
      { key: "noord-oost-nederland", label: "Noord+Oost Nederland"
        , pouleIds: [ 182929,182930,182931,182932,182933,182934,182935,182936,182937
                    , 182938,182939,182940,182941,182942,182943,182944,182945,182946
                    , 182947,182948,182949,182950 ] },
    ],
  },
  { key: "jo18", 
    label: "JO18",     
    displayMode: 'standings',
    phases: [ { key: "voorcompetitie",
                label: "V",
                groupKeys: [ "bond_top_V", "bond_subtop_V", "midden-nederland_V", "noord-holland_V",
                             "zuid-holland_V", "zuid-nederland_V", "noord-nederland_V" ],
      },
      { key: "zaal", label: "Z", groupKeys: [] },
      { key: "periode-2", label: "P2", groupKeys: [] },
    ],
    groups: [
    { key: "bond_top_V", label: "Landelijke Topklasse", pouleIds: [180907,180908,180909,180910,180911,180912,180913,180914]},
    { key: "bond_subtop_V", label: "Landelijke Subtopklasse", pouleIds:[180915,180916,180917,
                                                180918,180919,180920,180921,180922,180923,180924,180925,180926,180927,180928,180929,180930]},
    { key: "midden-nederland_V", label: "Midden Nederland", pouleIds: [181245, 181246,181247, 181248,181249, 181250,181251, 181252] },
    { key: "noord-holland_V", label: "Noord-Holland", pouleIds: [ 182152, 182152,182153,182154,182155,182156,182157,182158,182159] },
    { key: "zuid-holland_V", label: "Zuid-Holland", pouleIds: [ 181445, 181446, 181447, 181448, 181449, 181450, 181451, 181452] },
    { key: "zuid-nederland_V", label: "Zuid Nederland", pouleIds: [ 181737,181738,181745,181746,181747,181748,181753,181754,181755,181756,181757] },
    { key: "noord-nederland_V", label: "Noord+Oost Nederland", pouleIds: [ 182549,182550,182551,182552,182553,182554] },  ] },
  { key: "mo18", label: "MO18",    displayMode: 'standings'
    , groups: [
      { key: "bond", label: "Landelijke Topklasse"
        , pouleIds: [ 180867,180868,180869,180870,180871,180872,180873,180874   ]},
      { key: "bond_subtop_V", label: "Landelijke Subtopklasse"
        , pouleIds: [ 180875,180876,180877,180878,180879, 180880,180881,180882,180883
                    , 180884,180885,180886,180887,180888,180889,180890 ]},
    { key: "midden-nederland", label: "Midden Nederland"
      , pouleIds: [ 181114, 181115, 181116, 181117, 181118, 181119, 181120,181121, 181122, 181123,
                    181124, 181125, 181126, 181127, 181128, 181129, 181130,181131, 181132, 181133,
                    181134, 181135, 181136, 181137, 181138, 181139, 181140 ] },
    { key: "noord-holland", label: "Noord-Holland"
      , pouleIds: [ 182327, 182328, 182329,
                    182330, 182331, 182332, 182333, 182334, 182335, 182336, 182337, 182338, 182339,
                    182340, 182341, 182342, 182343, 182344, 182345, 182346, 182347, 182348, 182349 ]},
    { key: "zuid-holland", label: "Zuid-Holland"
      , pouleIds: [ 181453,181454,181455,181456,181457,181458,181459,181460,181461,
                    181462,181463,181464,181465,181466,181467,181468,181469,181470,
                    181471,181472,181473,181474,181475,181476,181477,181478,181479 ] },
    { key: "zuid-nederland", label: "Zuid Nederland"
      , pouleIds: [ 181706, 181707, 181708,
                    181709, 181710,181711,181712,181713,181714,181715,181716,181717,181718,
                    181719,181720,181721,181722,181723,181724,181725,181726,181727,181728,
                    181729,181730,181731,181732,181733,181734,181735,181736,181739,181740,
                    181741,181742,181743,181744  ] },
    { key: "noord-nederland", label: "Noord+Oost Nederland"
      , pouleIds: [ 182350, 182351, 182352,
                    182353,182354,182355,182356,182357,182358,182359,182360,182361,182362,182363,
                    182364,182365,182366,182367,182368,182369,182370,182627,182628,182629,182630 ] },

  ] },
    { key: "jo16", label: "JO16",     displayMode: 'standings',
    groups: [
    { key: "bond", label: "Landelijke Topklasse"
      , pouleIds: [ 180931,180932,180933,180934,180935,180936,180937,180938]},
    { key: "bond2", label: "Landelijke Subtopklasse"
      , pouleIds: [180939,180940,180941,180942,180943,180944,180945,180946]},
    { key: "midden-nederland", label: "Midden Nederland"
      , pouleIds: [181254,181255,181256,181257,181258,181259,181260,181261,181262,181371,181372,181373    ] },
    { key: "noord-holland", label: "Noord-Holland", pouleIds: [ 182143,182144,182145,182146,182147,182148,182149,182150,182151] },
    { key: "zuid-holland", label: "Zuid-Holland", pouleIds: [ 181434,181435,181436,181437,181438,181439,181440,181441,181442,181443,181444,] },
    { key: "zuid-nederland", label: "Zuid Nederland", pouleIds: [ 181777,181778,181779,181798,181799,181800,181801,181802,181803,181804] },
    { key: "noord-nederland", label: "Noord+Oost Nederland", pouleIds: [ 182555,182556,182557,182558,182559,182560,182561,182562] },
  ] },
  { key: "mo16", label: "MO16",     displayMode: 'standings',
    groups: [
    { key: "bond", label: "Landelijke Topklasse"
      , pouleIds: [180891,180892,180893,180894,180895,180896,180897,180898]},
    { key: "bond2", label: "Landelijke Subtopklasse"
      , pouleIds: [180899,180900,180901,180902,180903,180904,180905,180906] },
    { key: "midden-nederland", label: "Midden Nederland"
      , pouleIds: [ 181141,181142,181143,181144,181145,181146,181147,181148,181149,181150,
                    181151,181152,181153,181154,181155,181156,181157,181158,181159,181160,181161,
                    181162,181163,181164,181165,181166,181167,181374,181375,181376       ] },
    { key: "noord-holland", label: "Noord-Holland", pouleIds: [ 182301,182302,182303,182304,
                    182305,182306,182307,182308,182309,182310,182311,182312,182313,182314,
                    182315,182316,182317,182318,182319,182320,182321,182322,182323,182324,
                    182325,182326] },
    { key: "zuid-holland", label: "Zuid-Holland"
      , pouleIds: [181480,181481,181482,181483,181484,181485,181486,181487,181488,
                    181489,181490,181491,181492,181493,181494,181495,181496,181497,181498,181499,
                    181500,181501,181502,181503,181504,181505,181506,181507,181508,181509,181510,181511,181687     ] },
    { key: "zuid-nederland", label: "Zuid Nederland", pouleIds: [ 181749,181750,181751,181752,181758,181759,181760,
                    181761,181762,181763,181764,181765,181766,181767,181768,181769,181770,
                    181771,181772,181773,181774,181775,181776,181780,181781,181782,181783,
                    181784,181785,181786,181787,181788,181789,181790,181791,181792,
                    181793,181794,181795,181796,181797 ] },
    { key: "noord-nederland", label: "Noord+Oost Nederland", pouleIds: [ 182371,182372,182373,182374,
                    182375,182376,182377,182378,182379,182380,182381,182382,182383,182384,
                    182385,182386,182387,182388,182389,182390,182391,182392,182393,182394,
                    182395,182396,182397,182398    ] },
  ] },
    { key: "jo14", label: "JO14",     displayMode: 'standings',
    groups: [ 
      { key: "midden-nederland", label: "Midden Nederland", pouleIds: [ 180947,180948,180949,180950 ] },
      { key: "zuid-holland", label: "Zuid Holland", pouleIds: [ 181432,181433, 181704, 181705 ]}, //, 181688, 181689,181690,181691,181692  ]},
      { key: "noord-holland", label: "Noord-Holland", pouleIds: [182129,182130, 182131,182132]}, //182133,182134,182135,182136] },
      { key: "zuid-nederland", label: "Zuid Nederland", pouleIds: [ 181112,181820,181821]},//181830,181831,181832,181851,181852,181853,181858,181859,181860,181861    ] },
      { key: "noord-nederland", label: "Noord+Oost Nederland", pouleIds: [182563, 182564, 182565] }, //, 182566 
    ]}
];

export function getCategory(key: string): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

export function getGroup(cat: Category, regionKey: string): PouleGroup | undefined {
  return cat.groups.find((g) => g.key === regionKey);
}

export function getDisplayMode(cat: Category, regionKey?: string): DisplayMode {
  const group = regionKey ? getGroup(cat, regionKey) : undefined;
  return group?.displayMode ?? cat.displayMode ?? "standings";
}

export function getAllPouleIds(cat: Category): number[] {
  return cat.groups.flatMap((g) => g.pouleIds);
}

export function hasRegions(cat: Category): boolean {
  return cat.groups.length > 1;
}