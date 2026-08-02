export interface CetusCycle {
  id: string;
  activation: string;
  expiry: string;
  isDay: boolean;
  state: 'day' | 'night';
  timeLeft: string;
  isCetus: boolean;
}

export interface BountyDrop {
  item: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | string;
  chance: number;
  count?: number;
}

export interface BountyJob {
  id: string;
  type: string;
  enemyLevels: [number, number];
  standingStages: number[];
  minMR: number;
  expiry: string;
  uniqueName: string;
  rewardPool: string[];
  rewardPoolDrops: BountyDrop[];
  timeBound?: string;
}

export interface OstronSyndicateData {
  id: string;
  syndicate: string;
  expiry: string;
  jobs: BountyJob[];
}

export type RotationType = 'A' | 'B' | 'C';

export interface RotationDrop {
  item: string;
  rarity: string;
  chance: number;
}

export interface RotationScheduleItem {
  cycleIndex: number;
  startTime: Date;
  endTime: Date;
  rotation: RotationType;
  isCurrent: boolean;
  dayStartTime: Date;
  nightStartTime: Date;
}

/**
 * Detect active rotation from uniqueName (e.g. TierATableBRewards => B)
 */
export function getRotationFromUniqueName(uniqueName?: string): RotationType {
  if (!uniqueName) return 'A';
  if (uniqueName.includes('TableARewards')) return 'A';
  if (uniqueName.includes('TableBRewards')) return 'B';
  if (uniqueName.includes('TableCRewards')) return 'C';
  return 'A';
}

/**
 * Check if a bounty contract should be marked green (Find the Hidden Artifact, Search and Rescue, Capture the Grineer Agent)
 * All other contracts are marked red.
 */
export function isGreenBounty(bountyName?: string): boolean {
  if (!bountyName) return false;
  const lower = bountyName.toLowerCase().trim();

  // Cull The Enemy (T5) must always be red
  if (lower.includes('cull the enemy') || lower.includes('cull')) return false;

  return (
    lower.includes('find the hidden artifact') ||
    lower.includes('search and rescue') ||
    lower.includes('capture the grineer agent')
  );
}

export function isAyaFastBounty(bountyName: string): boolean {
  return isGreenBounty(bountyName);
}

/**
 * Fetch Cetus Day/Night Cycle
 */
export async function fetchCetusCycle(): Promise<CetusCycle> {
  const res = await fetch('https://api.warframestat.us/pc/cetusCycle', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Error al obtener ciclo de Cetus');
  return res.json();
}

/**
 * Fetch Ostron Syndicate Missions / Bounties
 */
export async function fetchOstronBounties(): Promise<OstronSyndicateData> {
  const res = await fetch('https://api.warframestat.us/pc/syndicateMissions', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Error al obtener contratos de Konzu');
  const data = await res.json();
  const ostron = data.find((s: { syndicate: string }) => s.syndicate === 'Ostrons');
  if (!ostron) throw new Error('No se encontraron contratos de Ostron/Konzu');
  return ostron;
}

/**
 * Dummy export for drop tables compatibility
 */
export async function fetchCetusDropTables(): Promise<Record<string, RotationDrop[]>> {
  return {};
}

/**
 * Dummy export for rotation schedule compatibility
 */
export function calculateRotationSchedule(): RotationScheduleItem[] {
  return [];
}

/**
 * Human friendly Spanish category details for bounty tiers & tents
 */
export function getTierCategoryDetails(levelMin: number, levelMax: number, typeName: string, index: number = 0): {
  prefix: string;
  name: string;
  badge: string;
  color: string;
  tent: 'Tent A' | 'Tent B' | 'Tent C';
} {
  if (typeName.includes('Narmer')) {
    return { prefix: 'T7', name: typeName, badge: 'Narmer', color: '#ef4444', tent: 'Tent C' };
  }
  if (levelMin === 100) {
    return { prefix: 'T6', name: typeName, badge: 'Steel Path', color: '#f59e0b', tent: 'Tent C' };
  }
  if (levelMin === 5 && levelMax === 15) {
    return { prefix: 'T1', name: typeName, badge: 'Tier 1', color: '#10b981', tent: 'Tent A' };
  }
  if (levelMin === 10 && levelMax === 30) {
    return { prefix: 'T2', name: typeName, badge: 'Tier 2', color: '#06b6d4', tent: 'Tent A' };
  }
  if (levelMin === 20 && levelMax === 40) {
    return { prefix: 'T3', name: typeName, badge: 'Tier 3', color: '#3b82f6', tent: 'Tent B' };
  }
  if (levelMin === 30 && levelMax === 50) {
    return { prefix: 'T4', name: typeName, badge: 'Tier 4', color: '#8b5cf6', tent: 'Tent B' };
  }
  if (levelMin === 40 && levelMax === 60) {
    return { prefix: 'T5', name: typeName, badge: 'Tier 5', color: '#ec4899', tent: 'Tent C' };
  }
  return { prefix: `T${index + 1}`, name: typeName, badge: `Lv ${levelMin}-${levelMax}`, color: '#6b7280', tent: 'Tent A' };
}

/**
 * Get direct icon image URL from Warframe Wiki
 */
/**
 * Get direct icon image URL for Warframe items, resources, mods, and bounties.
 * Resolves high-resolution official CDN assets with wiki fallbacks.
 */
export function getWikiIconUrl(itemName: string): string {
  if (!itemName) return '';

  // Clean quantities like 100X Oxium, 1,500 Credits Cache, 15X Iradite, etc.
  const clean = itemName
    .replace(/^(\d+[\d,]*|[\d,]+[xX]?)\s+/i, '')
    .replace(/\s+[xX]\d+$/i, '')
    .trim();

  const lower = clean.toLowerCase();

  // 1. High priority curated dictionary for Cetus bounties & Warframe resources
  if (lower === 'aya') return 'https://cdn.warframestat.us/img/Aya.png';
  if (lower.includes('endo')) return 'https://wiki.warframe.com/w/Special:FilePath/Endo.png';
  if (lower.includes('credit')) return 'https://wiki.warframe.com/w/Special:FilePath/Credits.png';
  if (lower.includes('gara')) return 'https://cdn.warframestat.us/img/Gara.png';
  if (lower.includes('revenant')) return 'https://cdn.warframestat.us/img/Revenant.png';
  if (lower.includes('caliban')) return 'https://cdn.warframestat.us/img/Caliban.png';
  if (lower.includes('furax')) return 'https://cdn.warframestat.us/img/FuraxWraith.png';
  if (lower.includes('isoplast')) return 'https://cdn.warframestat.us/img/RailjackComponentProgens.png';
  if (lower.includes('breath of the eidolon')) return 'https://cdn.warframestat.us/img/Eidolonium.png';
  if (lower.includes('cetus wisp')) return 'https://wiki.warframe.com/w/Special:FilePath/CetusWisp.png';
  if (lower.includes('relic') || lower.includes('reliquia')) return 'https://wiki.warframe.com/w/Special:FilePath/VoidRelicIntact.png';
  if (lower.includes('forma')) return 'https://wiki.warframe.com/w/Special:FilePath/Forma.png';
  if (lower.includes('kuva')) return 'https://wiki.warframe.com/w/Special:FilePath/Kuva.png';
  if (lower.includes('lens') || lower.includes('lente')) return 'https://cdn.warframestat.us/img/FocusLens3Rank.png';
  if (lower.includes('oxium')) return 'https://cdn.warframestat.us/img/ComponentOxium.png';
  if (lower.includes('iradite')) return 'https://cdn.warframestat.us/img/Iradite.png';
  if (lower.includes('grokdrul')) return 'https://cdn.warframestat.us/img/Grokdrul.png';
  if (lower.includes('morphic')) return 'https://cdn.warframestat.us/img/ComponentMorphic.png';
  if (lower.includes('control module')) return 'https://cdn.warframestat.us/img/ControlModule.png';
  if (lower.includes('konzu')) return 'https://wiki.warframe.com/w/Special:FilePath/Konzu.png';
  if (lower.includes('ostron')) return 'https://wiki.warframe.com/w/Special:FilePath/OstronSigil.png';

  // 2. Curated Mod & Item mapping dictionary
  const knownItemMap: Record<string, string> = {
    'point blank': 'https://cdn.warframestat.us/img/ShotgunDamageAmountMod.jpg',
    'charged chamber': 'https://cdn.warframestat.us/img/RifleChargedChamberMod.jpg',
    'burning wasp': 'https://cdn.warframestat.us/img/WhipCombo1a.jpg',
    'gladiator aegis': 'https://cdn.warframestat.us/img/GladiatorAegis.jpg',
    'gladiator might': 'https://cdn.warframestat.us/img/GladiatorMight.jpg',
    'gladiator resolve': 'https://cdn.warframestat.us/img/GladiatorResolve.jpg',
    'gladiator vice': 'https://cdn.warframestat.us/img/GladiatorVice.jpg',
    'gladiator finesse': 'https://cdn.warframestat.us/img/GladiatorFinesse.jpg',
    'gladiator rush': 'https://cdn.warframestat.us/img/GladiatorRush.jpg',
    'augur secrets': 'https://cdn.warframestat.us/img/AugurSecrets.jpg',
    'augur reach': 'https://cdn.warframestat.us/img/AugurReach.jpg',
    'augur message': 'https://cdn.warframestat.us/img/AugurMessage.jpg',
    'augur accord': 'https://cdn.warframestat.us/img/AugurAccord.jpg',
    'augur pact': 'https://cdn.warframestat.us/img/AugurPact.jpg',
    'augur seeker': 'https://cdn.warframestat.us/img/AugurSeeker.jpg',
    'vigilante supplies': 'https://cdn.warframestat.us/img/VigilanteSupplies.jpg',
    'vigilante pursuit': 'https://cdn.warframestat.us/img/VigilantePursuit.jpg',
    'vigilante armaments': 'https://cdn.warframestat.us/img/VigilanteArmaments.jpg',
    'vigilante offense': 'https://cdn.warframestat.us/img/VigilanteOffense.jpg',
    'vigilante fervor': 'https://cdn.warframestat.us/img/VigilanteFervor.jpg',
    'vigilante vigor': 'https://cdn.warframestat.us/img/VigilanteVigor.jpg',
    'steel fiber': 'https://cdn.warframestat.us/img/ArmourMod.jpg',
    'redirection': 'https://cdn.warframestat.us/img/ShieldMaxMod.jpg',
    'vitality': 'https://cdn.warframestat.us/img/HealthMod.jpg',
    'streamline': 'https://cdn.warframestat.us/img/AbilityEfficiencyMod.jpg',
    'flow': 'https://cdn.warframestat.us/img/MaxPowerMod.jpg',
    'intensify': 'https://cdn.warframestat.us/img/AbilityStrengthMod.jpg',
    'continuity': 'https://cdn.warframestat.us/img/AbilityDurationMod.jpg',
    'stretch': 'https://cdn.warframestat.us/img/AbilityRangeMod.jpg',
    'shattering impact': 'https://cdn.warframestat.us/img/ShatteringImpact.jpg',
    'spring-loaded blade': 'https://cdn.warframestat.us/img/SpringLoadedBlade.jpg',
    'target acquired': 'https://cdn.warframestat.us/img/TargetAcquired.jpg',
    'kinetic collision': 'https://cdn.warframestat.us/img/KineticCollision.jpg',
  };

  if (knownItemMap[lower]) {
    return knownItemMap[lower];
  }

  // 3. Fallback: Strip Component suffix for Warframe wiki (e.g. Point Blank -> PointBlank)
  const camelFormatted = clean.replace(/\s+/g, '');
  return `https://wiki.warframe.com/w/Special:FilePath/${encodeURIComponent(camelFormatted)}.png`;
}

/**
 * Spanish Translation Dictionaries for Cetus Bounties & Rewards
 */
const BOUNTY_TRANSLATIONS_ES: Record<string, string> = {
  'find the hidden artifact': 'Encontrar el artefacto oculto',
  'search and rescue': 'Búsqueda y rescate',
  'capture the grineer agent': 'Capturar al agente Grineer',
  'prototype sabotage': 'Sabotaje de prototipo',
  'sabotage grineer supply lines': 'Sabotaje de suministros Grineer',
  'capture the grineer commander': 'Capturar al comandante Grineer',
  'reclaim the stolen artifact': 'Recuperar el artefacto robado',
  'cull the enemy': 'Limpieza de enemigos',
  'weaken the grineer foothold': 'Debilitar el bastión Grineer',
  'sabotage supply lines': 'Sabotaje de suministros',
  'capture the new grineer commander': 'Capturar al nuevo comandante Grineer',
  'for the unum (narmer)': 'Por el Unum (Narmer)',
  'rise and fall (narmer)': 'Ascenso y caída (Narmer)',
};

const ITEM_TRANSLATIONS_ES: Record<string, string> = {
  'aya': 'Aya',
  'endo': 'Endo',
  'credits': 'Créditos',
  'credit cache': 'Reserva de créditos',
  'gara neuroptics blueprint': 'Plano de Neurópticas de Gara',
  'gara chassis blueprint': 'Plano de Chasis de Gara',
  'gara systems blueprint': 'Plano de Sistemas de Gara',
  'gara blueprint': 'Plano de Gara',
  'revenant neuroptics blueprint': 'Plano de Neurópticas de Revenant',
  'revenant chassis blueprint': 'Plano de Chasis de Revenant',
  'revenant systems blueprint': 'Plano de Sistemas de Revenant',
  'revenant blueprint': 'Plano de Revenant',
  'caliban neuroptics blueprint': 'Plano de Neurópticas de Caliban',
  'caliban chassis blueprint': 'Plano de Chasis de Caliban',
  'caliban systems blueprint': 'Plano de Sistemas de Caliban',
  'furax wraith gauntlet': 'Guantelete de Furax Wraith',
  'furax wraith blueprint': 'Plano de Furax Wraith',
  'narmer isoplast': 'Isoplasto Narmer',
  'breath of the eidolon': 'Aliento de Eidolon',
  'cetus wisp': 'Duende de Cetus',
  'eidolon lens blueprint': 'Plano de Lente Eidolon',
  'ostron lens blueprint': 'Plano de Lente Ostron',
  'naramon lens': 'Lente Naramon',
  'zenurik lens': 'Lente Zenurik',
  'vazarin lens': 'Lente Vazarin',
  'unairu lens': 'Lente Unairu',
  'madurai lens': 'Lente Madurai',
  'kuva': 'Kuva',
  'oxium': 'Oxio',
  'iradite': 'Iradita',
  'grokdrul': 'Grokdrul',
  'morphics': 'Mórficos',
  'control module': 'Módulo de control',
  'lith relic': 'Reliquia Lith',
  'meso relic': 'Reliquia Meso',
  'neo relic': 'Reliquia Neo',
  'axi relic': 'Reliquia Axi',
  'augur secrets': 'Secretos del Augur',
  'augur reach': 'Alcance del Augur',
  'augur message': 'Mensaje del Augur',
  'augur accord': 'Acuerdo del Augur',
  'augur seekers': 'Buscadores del Augur',
  'augur pact': 'Pacto del Augur',
  'gladiator vice': 'Vicio de Gladiador',
  'gladiator might': 'Poder de Gladiador',
  'gladiator aegis': 'Égida de Gladiador',
  'gladiator finesse': 'Finura de Gladiador',
  'gladiator rush': 'Impulso de Gladiador',
  'gladiator resolve': 'Resolución de Gladiador',
  'vigilante pursuit': 'Persecución de Vigilante',
  'vigilante offense': 'Ofensiva de Vigilante',
  'vigilante armaments': 'Armamento de Vigilante',
  'vigilante supplies': 'Suministros de Vigilante',
  'vigilante vigor': 'Vigor de Vigilante',
  'hunter synergy': 'Sinergia de Cazador',
  'hunter recovery': 'Recuperación de Cazador',
  'hunter command': 'Mando de Cazador',
  'hunter adrenaline': 'Adrenalina de Cazador',
  'hunter track': 'Rastreo de Cazador',
  'hunter munitions': 'Munición de Cazador',
};

export function translateBountyName(name: string, lang: 'es' | 'en'): string {
  if (lang !== 'es' || !name) return name;
  const lower = name.toLowerCase().trim();
  return BOUNTY_TRANSLATIONS_ES[lower] || name;
}

export function translateItemName(itemName: string, lang: 'es' | 'en'): string {
  if (lang !== 'es' || !itemName) return itemName;
  
  const countMatch = itemName.match(/^(\d+[\d,]*|[\d,]+[xX]?)\s+(.*)$/i);
  let prefix = '';
  let cleanName = itemName.trim();
  if (countMatch) {
    prefix = countMatch[1] + ' ';
    cleanName = countMatch[2].trim();
  }

  const lower = cleanName.toLowerCase();
  
  if (BOUNTY_TRANSLATIONS_ES[lower]) {
    return prefix + BOUNTY_TRANSLATIONS_ES[lower];
  }
  if (ITEM_TRANSLATIONS_ES[lower]) {
    return prefix + ITEM_TRANSLATIONS_ES[lower];
  }

  let translated = cleanName
    .replace(/Relic\s+([A-Z0-9]+)/i, 'Reliquia $1')
    .replace(/Blueprint/i, 'Plano')
    .replace(/Neuroptics/i, 'Neurópticas')
    .replace(/Chassis/i, 'Chasis')
    .replace(/Systems/i, 'Sistemas')
    .replace(/Gauntlet/i, 'Guantelete')
    .replace(/Lens/i, 'Lente');

  return prefix + translated;
}


