export const skillIcons: Record<string, string> = {
  Attack: 'Attack_icon.png',
  Strength: 'Strength_icon.png',
  Defence: 'Defence_icon.png',
  Ranged: 'Ranged_icon.png',
  Prayer: 'Prayer_icon.png',
  Magic: 'Magic_icon.png',
  Runecraft: 'Runecraft_icon.png',
  Hitpoints: 'Hitpoints_icon.png',
  Crafting: 'Crafting_icon.png',
  Mining: 'Mining_icon.png',
  Smithing: 'Smithing_icon.png',
  Fishing: 'Fishing_icon.png',
  Cooking: 'Cooking_icon.png',
  Firemaking: 'Firemaking_icon.png',
  Woodcutting: 'Woodcutting_icon.png',
  Agility: 'Agility_icon.png',
  Herblore: 'Herblore_icon.png',
  Thieving: 'Thieving_icon.png',
  Fletching: 'Fletching_icon.png',
  Slayer: 'Slayer_icon.png',
  Farming: 'Farming_icon.png',
  Construction: 'Construction_icon.png',
  Hunter: 'Hunter_icon.png',
  Sailing: 'Sailing_icon.png'
};

const bossImages: Record<string, string> = {
  'Abyssal Sire': 'Abyssal_Sire.png',
  'Alchemical Hydra': 'Alchemical_Hydra_(serpentine).png',
  Araxxor: 'Araxxor.png',
  Artio: 'Artio.png',
  'Barrows Chests': 'Chest_(Barrows).png',
  Brutus: 'Brutus.png',
  Bryophyta: 'Bryophyta.png',
  Callisto: 'Callisto.png',
  "Calvar'ion": "Calvar'ion.png",
  Cerberus: 'Cerberus.png',
  'Chambers of Xeric': 'Great_Olm.png',
  'Chambers of Xeric: Challenge Mode': 'Great_Olm.png',
  'Chaos Elemental': 'Chaos_Elemental.png',
  'Chaos Fanatic': 'Chaos_Fanatic.png',
  'Commander Zilyana': 'Commander_Zilyana.png',
  'Corporeal Beast': 'Corporeal_Beast.png',
  'Crazy Archaeologist': 'Crazy_archaeologist.png',
  'Dagannoth Prime': 'Dagannoth_Prime.png',
  'Dagannoth Rex': 'Dagannoth_Rex.png',
  'Dagannoth Supreme': 'Dagannoth_Supreme.png',
  'Deranged Archaeologist': 'Deranged_archaeologist.png',
  'Duke Sucellus': 'Duke_Sucellus.png',
  'General Graardor': 'General_Graardor.png',
  'Giant Mole': 'Giant_Mole.png',
  'Grotesque Guardians': 'Dusk.png',
  Hespori: 'Hespori.png',
  'Kalphite Queen': 'Kalphite_Queen.png',
  'King Black Dragon': 'King_Black_Dragon.png',
  Kraken: 'Kraken.png',
  "Kree'Arra": "Kree'arra.png",
  "K'ril Tsutsaroth": "K'ril_Tsutsaroth.png",
  'Lunar Chests': 'Lunar_Chest_(closed).png',
  Mimic: 'The_Mimic.png',
  Nex: 'Nex.png',
  Nightmare: 'The_Nightmare.png',
  "Phosani's Nightmare": "Phosani's_Nightmare.png",
  Obor: 'Obor.png',
  'Phantom Muspah': 'Phantom_Muspah.png',
  Sarachnis: 'Sarachnis.png',
  Scorpia: 'Scorpia.png',
  Scurrius: 'Scurrius.png',
  Skotizo: 'Skotizo.png',
  'Sol Heredit': 'Sol_Heredit.png',
  Spindel: 'Spindel.png',
  Tempoross: 'Tempoross.png',
  'The Gauntlet': 'Crystalline_Hunllef.png',
  'The Corrupted Gauntlet': 'Corrupted_Hunllef.png',
  'The Hueycoatl': 'The_Hueycoatl.png',
  'The Leviathan': 'The_Leviathan.png',
  'The Royal Titans': 'Brandr_the_Fire_Queen.png',
  'The Whisperer': 'The_Whisperer.png',
  'Theatre of Blood': 'Verzik_Vitur.png',
  'Theatre of Blood: Hard Mode': 'Verzik_Vitur.png',
  'Thermonuclear Smoke Devil': 'Thermonuclear_smoke_devil.png',
  'Tombs of Amascut': "Tumeken's_Warden.png",
  'Tombs of Amascut: Expert Mode': "Tumeken's_Warden.png",
  'TzKal-Zuk': 'TzKal-Zuk.png',
  'TzTok-Jad': 'TzTok-Jad.png',
  Vardorvis: 'Vardorvis.png',
  Venenatis: 'Venenatis.png',
  "Vet'ion": "Vet'ion.png",
  Vorkath: 'Vorkath.png',
  Wintertodt: 'Wintertodt_Camp.png',
  Yama: 'Yama.png',
  Zalcano: 'Zalcano.png',
  Zulrah: 'Zulrah.png'
};

function wikiImage(file: string) {
  return `https://oldschool.runescape.wiki/images/${encodeURIComponent(file)}`;
}

export function getSkillIcon(skill: string) {
  const file = skillIcons[skill];
  return file ? wikiImage(file) : null;
}

export function getBossImage(boss: string) {
  const file = bossImages[boss];
  return file ? wikiImage(file) : null;
}

export function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
