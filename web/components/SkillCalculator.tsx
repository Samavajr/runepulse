'use client';

import { useEffect, useMemo, useState } from 'react';
import { actionsForSkill, SKILL_ORDER } from '@/lib/skillActions';
import type { SkillAction } from '@/lib/skillActions';
import { API_BASE } from '@/lib/api';
import { levelForXp, xpForLevel, xpToTarget } from '@/lib/osrsXp';

const LOOKUP_API_BASE = API_BASE;

const PRAYER_BONUSES = [
  { id: 'none', label: 'None', multiplier: 1, categories: ['Bones', 'Ashes'] },
  { id: 'gilded', label: 'Lit Gilded Altar', detail: '350% XP', multiplier: 3.5, categories: ['Bones'] },
  { id: 'ectofuntus', label: 'Ectofuntus', detail: '400% XP', multiplier: 4, categories: ['Bones'] },
  { id: 'chaos', label: 'Chaos Altar', detail: '700% averaged', multiplier: 7, categories: ['Bones'] },
  { id: 'burner', label: 'Sacred Bone Burner', detail: '300% XP', multiplier: 3, categories: ['Bones'] },
  { id: 'offering', label: 'Demonic Offering', detail: '300% ashes', multiplier: 3, categories: ['Ashes'] }
];

const SKILL_BONUSES: Record<string, Array<{
  id: string;
  label: string;
  detail?: string;
  multiplier: number;
  matches: (action: SkillAction) => boolean;
}>> = {
  Smithing: [
    {
      id: 'goldsmith',
      label: 'Goldsmith gauntlets',
      detail: 'Gold bars',
      multiplier: 56.2 / 22.5,
      matches: (action) => action.name === 'Gold bar'
    }
  ],
  Runecraft: [
    {
      id: 'daeyalt',
      label: 'Daeyalt essence',
      detail: '150% XP',
      multiplier: 1.5,
      matches: (action) => action.name.includes('rune essence') && !action.name.includes('tiara')
    }
  ]
};

const GATHERING_SKILLS = new Set(['Woodcutting', 'Fishing', 'Mining', 'Farming', 'Hunter']);

const ITEM_NAME_ALIASES: Record<string, Record<string, string>> = {
  Cooking: {
    Shrimp: 'Shrimps',
    Karambwan: 'Cooked karambwan'
  },
  Fishing: {
    Shrimp: 'Raw shrimps',
    Sardine: 'Raw sardine',
    Herring: 'Raw herring',
    Anchovies: 'Raw anchovies',
    Mackerel: 'Raw mackerel',
    Cod: 'Raw cod',
    Trout: 'Raw trout',
    Salmon: 'Raw salmon',
    Pike: 'Raw pike',
    Lobster: 'Raw lobster',
    Tuna: 'Raw tuna',
    Swordfish: 'Raw swordfish',
    Karambwan: 'Raw karambwan',
    Bass: 'Raw bass',
    'Cave eel': 'Raw cave eel',
    'Lava eel': 'Raw lava eel',
    Monkfish: 'Raw monkfish',
    Shark: 'Raw shark',
    Anglerfish: 'Raw anglerfish',
    'Dark crab': 'Raw dark crab',
    'Sea turtle': 'Raw sea turtle',
    'Manta ray': 'Raw manta ray',
    Karambwanji: 'Raw karambwanji'
  }
};

const ITEM_ID_FALLBACKS: Record<string, ItemMapEntry> = {
  'raw karambwanji': { id: 3150, name: 'Raw karambwanji' },
  'raw lava eel': { id: 2148, name: 'Raw lava eel' },
  'lava eel': { id: 2149, name: 'Lava eel' },
  'sacred eel': { id: 13339, name: 'Sacred eel' },
  'infernal eel': { id: 21293, name: 'Infernal eel' },
  minnow: { id: 21356, name: 'Minnow' }
};

const ACTION_LEVELS: Record<string, Record<string, number>> = {
  Attack: {
    'Shared melee training': 1,
    'Sand Crab': 1,
    'Ammonite Crab': 1,
    Experiments: 1,
    'Slayer monster': 1,
    'Nightmare Zone absorption hour': 1,
    'Pest Control novice point': 1,
    'Pest Control veteran point': 1
  },
  Strength: {
    'Shared melee training': 1,
    'Sand Crab': 1,
    'Ammonite Crab': 1,
    Experiments: 1,
    'Slayer monster': 1,
    'Nightmare Zone absorption hour': 1,
    'Pest Control novice point': 1,
    'Pest Control veteran point': 1
  },
  Defence: {
    'Shared melee training': 1,
    'Sand Crab': 1,
    'Ammonite Crab': 1,
    Experiments: 1,
    'Slayer monster': 1,
    'Nightmare Zone absorption hour': 1,
    'Pest Control novice point': 1,
    'Pest Control veteran point': 1
  },
  Hitpoints: {
    'Combat damage': 10,
    'Sand Crab kill': 10,
    'Ammonite Crab kill': 10,
    'Slayer monster kill': 10,
    'Nightmare Zone hour': 10,
    'Pest Control novice point': 10,
    'Pest Control veteran point': 10
  },
  Ranged: {
    'Ranged damage': 1,
    'Cannonball damage': 1,
    'Sand Crab kill': 1,
    'Ammonite Crab kill': 1,
    'Chinchompa throw': 45,
    'Red chinchompa throw': 55,
    'Black chinchompa throw': 65,
    'Nightmare Zone hour': 1
  },
  Magic: {
    'Wind Strike cast': 1,
    'Water Strike cast': 5,
    'Earth Strike cast': 9,
    'Fire Strike cast': 13,
    'Wind Bolt cast': 17,
    'Water Bolt cast': 23,
    'Earth Bolt cast': 29,
    'Fire Bolt cast': 35,
    'Wind Blast cast': 41,
    'Water Blast cast': 47,
    'Earth Blast cast': 53,
    'Fire Blast cast': 59,
    'Wind Wave cast': 62,
    'Water Wave cast': 65,
    'Earth Wave cast': 70,
    'Fire Wave cast': 75,
    'Wind Surge cast': 81,
    'Water Surge cast': 85,
    'Earth Surge cast': 90,
    'Fire Surge cast': 95,
    'Low Level Alchemy cast': 21,
    'High Level Alchemy cast': 55,
    'Superheat Item cast': 43,
    'Varrock Teleport cast': 25,
    'Lumbridge Teleport cast': 31,
    'Falador Teleport cast': 37,
    'Camelot Teleport cast': 45,
    'Ardougne Teleport cast': 51,
    'Watchtower Teleport cast': 58,
    'Bones to Peaches cast': 60,
    'Enchant sapphire jewellery': 7,
    'Enchant emerald jewellery': 27,
    'Enchant ruby jewellery': 49,
    'Enchant diamond jewellery': 57,
    'Enchant onyx jewellery': 87,
    'Enchant zenyte jewellery': 93,
    'Telekinetic Grab cast': 33,
    'Stun cast': 80,
    'Humidify cast': 68,
    'Ice Burst cast': 70,
    'Blood Burst cast': 68,
    'Ice Barrage cast': 94,
    'Blood Barrage cast': 92,
    'Plank Make cast': 86,
    'String Jewellery cast': 80
  },
  Cooking: {
    Shrimp: 1,
    Sardine: 1,
    Herring: 5,
    Anchovies: 1,
    Trout: 15,
    Salmon: 25,
    Tuna: 30,
    Karambwan: 30,
    Lobster: 40,
    Swordfish: 45,
    'Potato with cheese': 47,
    Curry: 60,
    'Ugthanki kebab': 58,
    Monkfish: 62,
    Shark: 80,
    'Sea turtle': 82,
    'Manta ray': 91,
    Anglerfish: 84,
    'Dark crab': 90,
    'Plain pizza': 35,
    'Pineapple pizza': 65,
    'Tuna potato': 68,
    'Jug of wine': 35,
    Cake: 40,
    'Chocolate cake': 50
  },
  Woodcutting: {
    Logs: 1,
    'Achey tree logs': 1,
    'Oak logs': 15,
    'Willow logs': 30,
    'Teak logs': 35,
    'Maple logs': 45,
    'Hollow tree bark': 45,
    'Mahogany logs': 50,
    'Arctic pine logs': 54,
    'Yew logs': 60,
    'Magic logs': 75,
    'Redwood logs': 90,
    'Blisterwood logs': 76,
    'Sulliuscep cap': 65,
    'Bruma root': 1,
    'Ent trunk': 1
  },
  Fletching: {
    'Arrow shafts': 1,
    'Headless arrows': 1,
    'Bronze arrows': 1,
    'Iron arrows': 15,
    'Steel arrows': 30,
    'Mithril arrows': 45,
    'Adamant arrows': 60,
    'Rune arrows': 75,
    'Amethyst arrows': 82,
    'Bronze darts': 10,
    'Iron darts': 22,
    'Steel darts': 37,
    'Mithril darts': 52,
    'Adamant darts': 67,
    'Rune darts': 81,
    'Dragon darts': 95,
    Shortbow: 5,
    Longbow: 10,
    'Oak shortbow': 20,
    'Oak longbow': 25,
    'Willow shortbow': 35,
    'Willow longbow': 40,
    'Maple shortbow': 50,
    'Maple longbow': 55,
    'Yew shortbow': 65,
    'Yew longbow': 70,
    'Magic shortbow': 80,
    'Magic longbow': 85,
    'Redwood shield': 92,
    'Broad arrows': 52,
    'Broad bolts': 55,
    'Ruby bolts': 63,
    'Diamond bolts': 65,
    'Dragon bolts': 84,
    'Ruby dragon bolts': 84
  },
  Fishing: {
    Shrimp: 1,
    Sardine: 5,
    Herring: 10,
    Anchovies: 15,
    Trout: 20,
    Salmon: 30,
    Pike: 25,
    Lobster: 40,
    Tuna: 35,
    Swordfish: 50,
    Karambwan: 65,
    Monkfish: 62,
    Shark: 76,
    Anglerfish: 82,
    'Leaping trout': 48,
    'Leaping salmon': 58,
    'Leaping sturgeon': 70,
    'Sacred eel': 87,
    'Infernal eel': 80,
    'Dark crab': 85,
    Minnow: 82,
    Karambwanji: 5
  },
  Firemaking: {
    Logs: 1,
    'Achey logs': 1,
    'Oak logs': 15,
    'Willow logs': 30,
    'Teak logs': 35,
    'Arctic pine logs': 42,
    'Maple logs': 45,
    'Mahogany logs': 50,
    'Yew logs': 60,
    'Magic logs': 75,
    'Redwood logs': 90,
    'Pyre logs': 5,
    'Oak pyre logs': 20,
    'Willow pyre logs': 35,
    'Maple pyre logs': 50,
    'Yew pyre logs': 65,
    'Magic pyre logs': 80,
    'Redwood pyre logs': 95,
    'Wintertodt point': 50,
    'Shades pyre log': 5
  },
  Crafting: {
    'Leather gloves': 1,
    'Leather boots': 7,
    'Leather cowl': 9,
    'Leather vambraces': 11,
    'Leather body': 14,
    'Hardleather body': 28,
    Coif: 38,
    'Air battlestaff': 66,
    'Water battlestaff': 54,
    'Earth battlestaff': 58,
    'Fire battlestaff': 62,
    'Gold ring': 5,
    'Gold necklace': 6,
    'Gold bracelet': 7,
    'Gold amulet': 8,
    'Sapphire ring': 20,
    'Sapphire necklace': 22,
    'Sapphire bracelet': 23,
    'Sapphire amulet': 24,
    'Emerald ring': 27,
    'Emerald necklace': 29,
    'Emerald bracelet': 30,
    'Emerald amulet': 31,
    'Ruby ring': 34,
    'Ruby necklace': 40,
    'Ruby bracelet': 42,
    'Ruby amulet': 50,
    'Diamond ring': 43,
    'Diamond necklace': 56,
    'Diamond bracelet': 58,
    'Diamond amulet': 70,
    'Dragonstone ring': 55,
    'Dragonstone necklace': 72,
    'Dragonstone bracelet': 74,
    'Dragonstone amulet': 80,
    'Green d\'hide vambraces': 57,
    'Green d\'hide chaps': 60,
    'Green d\'hide body': 63,
    'Blue d\'hide vambraces': 66,
    'Blue d\'hide chaps': 68,
    'Blue d\'hide body': 71,
    'Red d\'hide vambraces': 73,
    'Red d\'hide chaps': 75,
    'Red d\'hide body': 77,
    'Black d\'hide vambraces': 79,
    'Black d\'hide chaps': 82,
    'Black d\'hide body': 84,
    Battlestaff: 54
  },
  Smithing: {
    'Bronze bar': 1,
    'Iron bar': 15,
    'Steel bar': 30,
    'Silver bar': 20,
    'Gold bar': 40,
    'Mithril bar': 50,
    'Adamantite bar': 70,
    'Runite bar': 85,
    'Cannonball set': 35,
    'Gold bar with gauntlets': 40,
    'Bronze platebody': 18,
    'Iron platebody': 33,
    'Steel platebody': 48,
    'Mithril platebody': 68,
    'Adamant platebody': 88,
    'Rune platebody': 99,
    'Bronze dart tips': 4,
    'Iron dart tips': 19,
    'Steel dart tips': 34,
    'Mithril dart tips': 54,
    'Adamant dart tips': 74,
    'Rune dart tips': 89,
    'Giant\'s Foundry sword': 15
  },
  Mining: {
    'Copper or tin ore': 1,
    Clay: 1,
    'Rune essence': 1,
    'Blurite ore': 10,
    'Iron ore': 15,
    'Silver ore': 20,
    Coal: 30,
    'Gold ore': 40,
    'Gem rock': 40,
    'Granite 500g': 45,
    'Granite 2kg': 45,
    'Granite 5kg': 45,
    'Sandstone 1kg': 35,
    'Sandstone 2kg': 35,
    'Sandstone 5kg': 35,
    'Sandstone 10kg': 35,
    'Mithril ore': 55,
    'Adamantite ore': 70,
    'Runite ore': 85,
    'Lovakite ore': 30,
    Amethyst: 92,
    'Motherlode pay-dirt': 30,
    'Volcanic Mine point': 50
  },
  Herblore: {
    'Guam tar': 19,
    'Marrentill tar': 31,
    'Tarromin tar': 39,
    'Harralander tar': 44,
    'Attack potion': 3,
    Antipoison: 5,
    'Relicym\'s balm': 8,
    'Strength potion': 12,
    'Serum 207': 15,
    'Compost potion': 21,
    'Restore potion': 22,
    'Energy potion': 26,
    'Defence potion': 30,
    'Agility potion': 34,
    'Prayer potion': 38,
    'Super attack': 45,
    Superantipoison: 48,
    'Fishing potion': 50,
    'Super energy': 52,
    'Super strength': 55,
    'Weapon poison': 60,
    'Super restore': 63,
    'Super defence': 66,
    'Antifire potion': 69,
    'Ranging potion': 72,
    'Magic potion': 76,
    'Zamorak brew': 78,
    'Saradomin brew': 81,
    'Antidote+': 68,
    'Antidote++': 79,
    'Anti-venom': 87,
    'Anti-venom+': 94,
    'Stamina potion': 77,
    'Super combat potion': 90,
    'Extended antifire': 84,
    'Divine ranging potion': 74,
    'Divine super combat potion': 97
  },
  Agility: {
    'Gnome Stronghold lap': 1,
    'Shayzien basic lap': 5,
    'Draynor Village lap': 10,
    'Al Kharid lap': 20,
    'Penguin agility lap': 30,
    'Barbarian Outpost lap': 35,
    'Ape Atoll lap': 48,
    'Canifis lap': 40,
    'Falador lap': 50,
    'Seers\' Village lap': 60,
    'Pollnivneach lap': 70,
    'Rellekka lap': 80,
    'Ardougne lap': 90,
    'Prifddinas lap': 75,
    'Wilderness lap': 52,
    'Dorgesh-Kaan lap': 80,
    'Werewolf course lap': 60,
    'Hallowed Sepulchre floor 1': 52,
    'Hallowed Sepulchre floor 2': 62,
    'Hallowed Sepulchre floor 3': 72,
    'Hallowed Sepulchre floor 4': 82,
    'Hallowed Sepulchre floor 5': 92
  },
  Thieving: {
    'Man/Woman pickpocket': 1,
    'Tea stall': 5,
    'Cake stall': 5,
    'Silk stall': 20,
    'Fruit stall': 25,
    'Warrior woman pickpocket': 25,
    'Rogue pickpocket': 32,
    'Cave goblin pickpocket': 36,
    'Master farmer pickpocket': 38,
    'Guard pickpocket': 40,
    'Fremennik citizen pickpocket': 45,
    'Bearded Pollnivnian bandit': 45,
    'Menaphite thug': 65,
    'Paladin pickpocket': 70,
    'Knight of Ardougne pickpocket': 55,
    'Gnome pickpocket': 75,
    'Hero pickpocket': 80,
    'Elf pickpocket': 85,
    'Pyramid Plunder room': 21,
    'Vyrewatch Sentinel pickpocket': 82,
    'Elven worker pickpocket': 85,
    'Blackjacking action': 45
  },
  Slayer: {
    'Low-level task monster': 1,
    'Mid-level task monster': 1,
    'High-level task monster': 1,
    'Dust devil': 65,
    Nechryael: 80,
    'Abyssal demon': 85,
    Gargoyle: 75,
    Kurask: 70,
    Bloodveld: 50,
    Hydra: 95
  },
  Farming: {
    'Potato harvest': 1,
    'Onion harvest': 5,
    'Cabbage harvest': 7,
    'Marigold harvest': 2,
    'Rosemary harvest': 11,
    'Nasturtium harvest': 24,
    'Limpwurt root harvest': 26,
    'Strawberry harvest': 31,
    'Sweetcorn harvest': 20,
    'Watermelon harvest': 47,
    'Guam herb harvest': 9,
    'Marrentill herb harvest': 14,
    'Tarromin herb harvest': 19,
    'Ranarr herb harvest': 32,
    'Toadflax herb harvest': 38,
    'Irit herb harvest': 44,
    'Avantoe herb harvest': 50,
    'Kwuarm herb harvest': 56,
    'Snapdragon herb harvest': 62,
    'Cadantine herb harvest': 67,
    'Lantadyme herb harvest': 73,
    'Dwarf weed herb harvest': 79,
    'Torstol herb harvest': 85,
    'Oak tree check-health': 15,
    'Willow tree check-health': 30,
    'Maple tree check-health': 45,
    'Yew tree check-health': 60,
    'Magic tree check-health': 75,
    'Redwood tree check-health': 90,
    'Apple tree check-health': 27,
    'Banana tree check-health': 33,
    'Orange tree check-health': 39,
    'Curry tree check-health': 42,
    'Papaya tree check-health': 57,
    'Palm tree check-health': 68,
    'Calquat tree check-health': 72,
    'Dragonfruit tree check-health': 81
  },
  Runecraft: {
    'Air rune essence': 1,
    'Mind rune essence': 2,
    'Water rune essence': 5,
    'Earth rune essence': 9,
    'Fire rune essence': 14,
    'Body rune essence': 20,
    'Cosmic rune essence': 27,
    'Chaos rune essence': 35,
    'Astral rune essence': 40,
    'Nature rune essence': 44,
    'Law rune essence': 54,
    'Death rune essence': 65,
    'Blood rune essence': 77,
    'Soul rune essence': 90,
    'Wrath rune essence': 95,
    'Lava rune essence': 23,
    'Steam rune essence': 19,
    'Smoke rune essence': 15,
    'Mist rune essence': 6,
    'Dust rune essence': 10,
    'Mud rune essence': 13,
    'Guardians of the Rift point': 27
  },
  Hunter: {
    'Polar kebbit': 1,
    'Crimson swift': 1,
    'Common kebbit': 3,
    'Golden warbler': 5,
    'Feldip weasel': 7,
    'Copper longtail': 9,
    'Cerulean twitch': 11,
    'Desert devil': 13,
    'Ruby harvest': 15,
    'Tropical wagtail': 19,
    'Wild kebbit': 23,
    'Swamp lizard': 29,
    'Orange salamander': 47,
    Chinchompa: 53,
    'Falconry spotted kebbit': 43,
    'Falconry dark kebbit': 57,
    'Falconry dashing kebbit': 69,
    'Red salamander': 59,
    'Red chinchompa': 63,
    'Black chinchompa': 73,
    'Black salamander': 67,
    'Carnivorous chinchompa': 63,
    'Dragon impling': 83,
    'Herbiboar harvest': 80,
    'Bird house run': 5,
    'Maniacal monkey': 60,
    'Sunlight antelope': 72
  },
  Construction: {
    'Crude wooden chair': 1,
    'Wooden chair': 1,
    'Wooden bookcase': 4,
    'Oak chair': 19,
    'Oak bookcase': 29,
    'Oak larder': 33,
    'Oak dining table': 22,
    'Carved oak table': 31,
    'Teak dining table': 38,
    'Teak table': 38,
    'Carved teak bench': 44,
    'Teak garden bench': 66,
    'Teak wardrobe': 63,
    'Mahogany table': 52,
    'Mahogany armchair': 50,
    'Mahogany wardrobe': 75,
    'Gnome bench': 77,
    'Mahogany bench': 77,
    'Mounted mythical cape': 47,
    'Mounted glory': 47,
    'Oak dungeon door': 74,
    'Teak magic wardrobe': 66,
    'Mahogany magic wardrobe': 78,
    'Marble block build': 1,
    'Mahogany homes beginner contract': 1,
    'Mahogany homes novice contract': 20,
    'Mahogany homes adept contract': 50,
    'Mahogany homes expert contract': 70
  },
  Sailing: {
    'Navigation contract': 1,
    'Delivery contract': 1,
    'Salvage action': 1,
    'Charting discovery': 1,
    'Ship upgrade project': 1,
    'Sea monster encounter': 1
  }
};

type HiscoreSkill = {
  name: string;
  level: number;
  xp: number;
};

type PriceMap = Record<string, { high?: number; low?: number }>;

type ItemMapEntry = {
  id: number;
  name: string;
};

function toNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatXp(value: number) {
  return Math.floor(value).toLocaleString();
}

function formatActionXp(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1
  });
}

function actionLevel(skill: string, action: SkillAction) {
  return action.level || ACTION_LEVELS[skill]?.[action.name] || 99;
}

export default function SkillCalculator({
  initialUsername = '',
  initialSkill = 'Prayer'
}: {
  initialUsername?: string;
  initialSkill?: string;
}) {
  const [skill, setSkill] = useState(SKILL_ORDER.includes(initialSkill) ? initialSkill : 'Prayer');
  const [currentMode, setCurrentMode] = useState<'level' | 'xp'>('level');
  const [currentLevel, setCurrentLevel] = useState('1');
  const [currentXpInput, setCurrentXpInput] = useState('0');
  const [targetMode, setTargetMode] = useState<'level' | 'xp'>('level');
  const [targetLevel, setTargetLevel] = useState('99');
  const [targetXpInput, setTargetXpInput] = useState('13,034,431');
  const [username, setUsername] = useState(initialUsername);
  const [lookupStatus, setLookupStatus] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [prayerBonus, setPrayerBonus] = useState('none');
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [pricesEnabled, setPricesEnabled] = useState(false);
  const [sortBy, setSortBy] = useState<'level' | 'xp' | 'number' | 'name' | 'profit'>('level');
  const [skillBonus, setSkillBonus] = useState('none');
  const [itemMap, setItemMap] = useState<Record<string, ItemMapEntry>>({});
  const [prices, setPrices] = useState<PriceMap>({});
  const [marketStatus, setMarketStatus] = useState('');

  const currentXp = currentMode === 'level'
    ? xpForLevel(toNumber(currentLevel, 1))
    : Math.max(toNumber(currentXpInput, 0), 0);

  const currentDisplayLevel = levelForXp(currentXp);
  const targetValue = targetMode === 'level'
    ? toNumber(targetLevel, 99)
    : toNumber(targetXpInput, 13_034_431);
  const { targetXp, remaining } = xpToTarget(currentXp, targetValue, targetMode);
  const actions = useMemo(() => actionsForSkill(skill), [skill]);
  const selectedPrayerBonus = PRAYER_BONUSES.find((bonus) => bonus.id === prayerBonus) || PRAYER_BONUSES[0];
  const availableSkillBonuses = SKILL_BONUSES[skill] || [];
  const selectedSkillBonus = availableSkillBonuses.find((bonus) => bonus.id === skillBonus);
  const nextLevelXp = currentDisplayLevel >= 99 ? currentXp : xpForLevel(currentDisplayLevel + 1);
  const nextRemaining = Math.max(nextLevelXp - currentXp, 0);
  const currentLevelXp = xpForLevel(currentDisplayLevel);
  const levelSpan = Math.max(nextLevelXp - currentLevelXp, 1);
  const levelProgress = currentDisplayLevel >= 99
    ? 100
    : Math.min(Math.max(((currentXp - currentLevelXp) / levelSpan) * 100, 0), 100);

  const itemForAction = (action: SkillAction) => {
    const itemName = action.itemName || ITEM_NAME_ALIASES[skill]?.[action.name] || action.name;
    const normalizedName = itemName.toLowerCase();
    return itemMap[normalizedName] || ITEM_ID_FALLBACKS[normalizedName];
  };

  const priceForItem = (item?: ItemMapEntry) => {
    if (!item) return null;
    const row = prices[String(item.id)];
    return row?.high || row?.low || null;
  };

  const effectiveXp = (action: SkillAction) => {
    if (skill !== 'Prayer') {
      return selectedSkillBonus?.matches(action) ? action.xp * selectedSkillBonus.multiplier : action.xp;
    }

    const actionCategory = action.category || 'Methods';
    if (!selectedPrayerBonus.categories.includes(actionCategory)) {
      return action.xp;
    }

    return action.xp * selectedPrayerBonus.multiplier;
  };

  const actionCount = (action: SkillAction) => {
    const xpEach = effectiveXp(action);
    return remaining === 0 ? 0 : Math.ceil(remaining / xpEach);
  };

  const materialCostEach = (action: SkillAction) => {
    const materials = action.materials;
    if (!materials?.length) {
      if (skill === 'Prayer') {
        return priceForItem(itemForAction(action));
      }
      return null;
    }

    let total = 0;
    let known = false;

    for (const material of materials) {
      const item = itemMap[material.itemName.toLowerCase()];
      const price = priceForItem(item);
      if (price) {
        known = true;
        total += price * material.quantity;
      }
    }

    return known ? total : null;
  };

  const profitEach = (action: SkillAction) => {
    if (!pricesEnabled) return null;
    const cost = materialCostEach(action);
    const output = priceForItem(itemForAction(action));

    if (skill === 'Prayer') {
      return cost == null ? null : -cost;
    }

    if (GATHERING_SKILLS.has(skill) && output != null && !action.materials?.length) {
      return output;
    }

    if (cost == null) return null;
    return (output || 0) - cost;
  };

  const visibleActions = useMemo(() => {
    const filter = methodFilter.trim().toLowerCase();
    return actions
      .filter((action) =>
        (!hideUnavailable || actionLevel(skill, action) <= currentDisplayLevel) &&
        (!filter ||
          action.name.toLowerCase().includes(filter) ||
          action.notes?.toLowerCase().includes(filter))
      )
      .sort((left, right) => {
        if (sortBy === 'xp') return effectiveXp(right) - effectiveXp(left) || left.name.localeCompare(right.name);
        if (sortBy === 'number') return actionCount(left) - actionCount(right) || left.name.localeCompare(right.name);
        if (sortBy === 'name') return left.name.localeCompare(right.name);
        if (sortBy === 'profit') return (profitEach(right) ?? -Infinity) - (profitEach(left) ?? -Infinity) || left.name.localeCompare(right.name);
        return actionLevel(skill, left) - actionLevel(skill, right) || left.name.localeCompare(right.name);
      });
  }, [actions, skill, methodFilter, hideUnavailable, currentDisplayLevel, sortBy, prayerBonus, remaining, itemMap, prices, pricesEnabled]);

  const bonusNote = (action: SkillAction) => {
    if (skill !== 'Prayer' || selectedPrayerBonus.id === 'none') {
      return action.notes || '';
    }

    const actionCategory = action.category || 'Methods';
    if (!selectedPrayerBonus.categories.includes(actionCategory)) {
      return action.notes || '';
    }

    return selectedPrayerBonus.label;
  };

  const loadMarketData = async () => {
    setMarketStatus('Loading prices...');
    try {
      const pricesRes = await fetch(`${LOOKUP_API_BASE}/prices/latest`);

      if (!pricesRes.ok) {
        setMarketStatus('Prices unavailable');
        return;
      }

      const latest = await pricesRes.json();
      setPrices(latest?.data || {});
      setMarketStatus('Prices loaded');
    } catch {
      setMarketStatus('Prices unavailable');
    }
  };

  const loadItemMapping = async () => {
    try {
      const mappingRes = await fetch(`${LOOKUP_API_BASE}/prices/mapping`);
      if (!mappingRes.ok) {
        return;
      }

      const mapping = await mappingRes.json();
      const nextMap: Record<string, ItemMapEntry> = {};
      for (const item of Array.isArray(mapping) ? mapping : []) {
        if (item?.name && item?.id) {
          nextMap[item.name.toLowerCase()] = { id: item.id, name: item.name };
        }
      }

      setItemMap(nextMap);
    } catch {
      // Icons are nice-to-have; calculator math still works without them.
    }
  };

  useEffect(() => {
    if (pricesEnabled && Object.keys(prices).length === 0) {
      loadMarketData();
    }
  }, [pricesEnabled]);

  useEffect(() => {
    if (Object.keys(itemMap).length === 0) {
      loadItemMapping();
    }
  }, []);

  const loadHiscore = async () => {
    const name = username.trim();
    if (!name) {
      setLookupStatus('Enter a username');
      return;
    }

    setLookupStatus('Looking up...');
    try {
      const res = await fetch(`${LOOKUP_API_BASE}/hiscore/${encodeURIComponent(name)}/skills`);
      if (!res.ok) {
        setLookupStatus('Player not found');
        return;
      }

      const data = await res.json();
      const rows = Array.isArray(data?.skills) ? data.skills as HiscoreSkill[] : [];
      const row = rows.find((entry) => entry.name === skill);
      if (!row) {
        setLookupStatus(`${skill} was not found`);
        return;
      }

      setCurrentMode('xp');
      setCurrentXpInput(formatXp(row.xp));
      setCurrentLevel(String(row.level));
      setLookupStatus(`Loaded ${name}: ${skill} ${row.level}`);
    } catch {
      setLookupStatus('Lookup failed');
    }
  };

  return (
    <div className="calculator-layout">
      <section className="section calculator-panel">
        <div className="calculator-header">
          <div>
            <h2>Skill calculator</h2>
          </div>
          <select
            className="select"
            value={skill}
            onChange={(event) => {
              setSkill(event.target.value);
              setMethodFilter('');
              setPrayerBonus('none');
              setSkillBonus('none');
            }}
          >
            {SKILL_ORDER.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="calculator-grid">
          <div className="calc-field">
            <label className="mono" htmlFor="calc-username">RuneScape name</label>
            <div className="calc-inline">
              <input
                id="calc-username"
                className="input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
                autoComplete="off"
              />
              <button className="button" type="button" onClick={loadHiscore}>Lookup</button>
            </div>
            {lookupStatus ? <div className="mono">{lookupStatus}</div> : null}
          </div>

          <div className="calc-field">
            <label className="mono">Current</label>
            <div className="toggle calc-toggle">
              <button
                className={`toggle-btn ${currentMode === 'level' ? 'active' : ''}`}
                type="button"
                onClick={() => setCurrentMode('level')}
              >
                Level
              </button>
              <button
                className={`toggle-btn ${currentMode === 'xp' ? 'active' : ''}`}
                type="button"
                onClick={() => setCurrentMode('xp')}
              >
                XP
              </button>
            </div>
            {currentMode === 'level' ? (
              <input
                className="input"
                value={currentLevel}
                onChange={(event) => setCurrentLevel(event.target.value)}
                inputMode="numeric"
              />
            ) : (
              <input
                className="input"
                value={currentXpInput}
                onChange={(event) => setCurrentXpInput(event.target.value)}
                inputMode="numeric"
              />
            )}
          </div>

          <div className="calc-field">
            <label className="mono">Target</label>
            <div className="toggle calc-toggle">
              <button
                className={`toggle-btn ${targetMode === 'level' ? 'active' : ''}`}
                type="button"
                onClick={() => setTargetMode('level')}
              >
                Level
              </button>
              <button
                className={`toggle-btn ${targetMode === 'xp' ? 'active' : ''}`}
                type="button"
                onClick={() => setTargetMode('xp')}
              >
                XP
              </button>
            </div>
            {targetMode === 'level' ? (
              <input
                className="input"
                value={targetLevel}
                onChange={(event) => setTargetLevel(event.target.value)}
                inputMode="numeric"
              />
            ) : (
              <input
                className="input"
                value={targetXpInput}
                onChange={(event) => setTargetXpInput(event.target.value)}
                inputMode="numeric"
              />
            )}
          </div>
        </div>
      </section>

      <section className="section calculator-summary">
        <div className="summary-stat">
          <span className="mono">Current level</span>
          <strong>{currentDisplayLevel}</strong>
        </div>
        <div className="summary-stat">
          <span className="mono">Current XP</span>
          <strong>{formatXp(currentXp)}</strong>
        </div>
        <div className="summary-stat">
          <span className="mono">Target XP</span>
          <strong>{formatXp(targetXp)}</strong>
        </div>
        <div className="summary-stat">
          <span className="mono">Remaining</span>
          <strong className="xp-number">{formatXp(remaining)}</strong>
        </div>
        <div className="summary-stat">
          <span className="mono">Next level</span>
          <strong>{formatXp(nextRemaining)} XP</strong>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="stat-row">
          <h2 style={{ margin: 0 }}>{skill} methods</h2>
          <span className="pill">{visibleActions.length} / {actions.length} methods</span>
        </div>

        <div className="calculator-options">
          {skill === 'Prayer' ? (
            <div className="calc-option-group">
              <div className="mono">Bonuses</div>
              <div className="bonus-grid">
                {PRAYER_BONUSES.map((bonus) => (
                  <button
                    key={bonus.id}
                    type="button"
                    className={`bonus-option ${prayerBonus === bonus.id ? 'active' : ''}`}
                    onClick={() => setPrayerBonus(bonus.id)}
                  >
                    <span className="bonus-check" />
                    <span>
                      {bonus.label}
                      {bonus.detail ? <span className="mono"> {bonus.detail}</span> : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {availableSkillBonuses.length > 0 ? (
            <div className="calc-option-group">
              <div className="mono">Bonuses</div>
              <div className="bonus-grid">
                <button
                  type="button"
                  className={`bonus-option ${skillBonus === 'none' ? 'active' : ''}`}
                  onClick={() => setSkillBonus('none')}
                >
                  <span className="bonus-check" />
                  <span>None</span>
                </button>
                {availableSkillBonuses.map((bonus) => (
                  <button
                    key={bonus.id}
                    type="button"
                    className={`bonus-option ${skillBonus === bonus.id ? 'active' : ''}`}
                    onClick={() => setSkillBonus(bonus.id)}
                  >
                    <span className="bonus-check" />
                    <span>
                      {bonus.label}
                      {bonus.detail ? <span className="mono"> {bonus.detail}</span> : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="calc-option-group">
            <div className="mono">Filters</div>
            <input
              className="input"
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value)}
              placeholder="Filter actions by name"
            />
            <label className="pill calc-checkbox">
              <input
                type="checkbox"
                checked={hideUnavailable}
                onChange={(event) => setHideUnavailable(event.target.checked)}
              />
              <span>Hide unavailable</span>
            </label>
            <label className="pill calc-checkbox">
              <input
                type="checkbox"
                checked={pricesEnabled}
                onChange={(event) => setPricesEnabled(event.target.checked)}
              />
              <span>Enable prices</span>
            </label>
            <label className="calc-select-row">
              <span>Sort</span>
              <select className="select" value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                <option value="level">Level</option>
                <option value="xp">XP each</option>
                <option value="number">Number needed</option>
                <option value="profit">Profit</option>
                <option value="name">Name</option>
              </select>
            </label>
            {marketStatus ? <span className="mono">{marketStatus}</span> : null}
          </div>
        </div>

        <table className="table calculator-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'right' }}>Level</th>
              <th style={{ textAlign: 'left' }}>Action / product</th>
              <th style={{ textAlign: 'right' }}>XP each</th>
              <th style={{ textAlign: 'right' }}>Number</th>
              <th style={{ textAlign: 'right' }}>GP each</th>
              <th style={{ textAlign: 'right' }}>Profit</th>
              <th style={{ textAlign: 'left' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {visibleActions.map((action) => {
              const xpEach = effectiveXp(action);
              const count = actionCount(action);
              const item = itemForAction(action);
              const cost = pricesEnabled ? materialCostEach(action) : null;
              const profit = profitEach(action);
              return (
              <tr key={action.name}>
                <td style={{ textAlign: 'right' }} className="calc-level-cell">{actionLevel(skill, action)}</td>
                <td>
                  <div className="calc-action-cell">
                    {item ? (
                      <img
                        className="calc-item-icon"
                        src={`https://static.runelite.net/cache/item/icon/${item.id}.png`}
                        alt=""
                      />
                    ) : null}
                    <span>{action.name}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>{formatActionXp(xpEach)}</td>
                <td style={{ textAlign: 'right' }} className="xp-number">
                  {count.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {cost == null
                    ? (pricesEnabled && priceForItem(item) != null ? Math.round(priceForItem(item) || 0).toLocaleString() : '-')
                    : Math.round(cost).toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }} className={profit != null && profit > 0 ? 'profit-positive' : 'profit-negative'}>
                  {profit == null ? '-' : Math.round(profit * count).toLocaleString()}
                </td>
                <td className="mono">{bonusNote(action)}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </section>
    </div>
  );
}
