const HISCORE_URL =
  'https://secure.runescape.com/m=hiscore_oldschool/index_lite.json?player=';

const BOSS_NAMES = [
  'Abyssal Sire',
  'Alchemical Hydra',
  'Amoxliatl',
  'Araxxor',
  'Artio',
  'Barrows Chests',
  'Bryophyta',
  'Callisto',
  "Calvar'ion",
  'Cerberus',
  'Chambers of Xeric',
  'Chambers of Xeric: Challenge Mode',
  'Chaos Elemental',
  'Chaos Fanatic',
  'Commander Zilyana',
  'Corporeal Beast',
  'Crazy Archaeologist',
  'Dagannoth Prime',
  'Dagannoth Rex',
  'Dagannoth Supreme',
  'Deranged Archaeologist',
  'Doom of Mokhaiotl',
  'Duke Sucellus',
  'General Graardor',
  'Giant Mole',
  'Grotesque Guardians',
  'Hespori',
  'Kalphite Queen',
  'King Black Dragon',
  'Kraken',
  "Kree'Arra",
  "K'ril Tsutsaroth",
  'Lunar Chests',
  'Mimic',
  'Nex',
  'Nightmare',
  "Phosani's Nightmare",
  'Obor',
  'Phantom Muspah',
  'Sarachnis',
  'Scorpia',
  'Scurrius',
  'Shellbane Gryphon',
  'Skotizo',
  'Sol Heredit',
  'Spindel',
  'Tempoross',
  'The Gauntlet',
  'The Corrupted Gauntlet',
  'The Hueycoatl',
  'The Leviathan',
  'The Royal Titans',
  'The Whisperer',
  'Theatre of Blood',
  'Theatre of Blood: Hard Mode',
  'Thermonuclear Smoke Devil',
  'Tombs of Amascut',
  'Tombs of Amascut: Expert Mode',
  'TzKal-Zuk',
  'TzTok-Jad',
  'Vardorvis',
  'Venenatis',
  "Vet'ion",
  'Vorkath',
  'Wintertodt',
  'Yama',
  'Zalcano',
  'Zulrah'
];

const BOSS_SET = new Set(BOSS_NAMES);

export async function fetchHiscoreBossKc(username) {
  const url = `${HISCORE_URL}${encodeURIComponent(username)}`;
  const res = await fetch(url);
  if (!res.ok) {
    return {};
  }

  const data = await res.json();
  const activities = Array.isArray(data?.activities) ? data.activities : [];
  const out = {};

  for (const activity of activities) {
    if (!activity?.name || !BOSS_SET.has(activity.name)) {
      continue;
    }

    const score = Number(activity.score);
    if (!Number.isFinite(score) || score < 0) {
      continue;
    }

    out[activity.name] = score;
  }

  return out;
}
