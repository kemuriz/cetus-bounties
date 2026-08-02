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

export interface StageGroup {
  stageName: string;
  drops: BountyDrop[];
}

export function groupRewardPoolDropsByStage(drops: BountyDrop[]): StageGroup[] {
  if (!drops || drops.length === 0) return [];

  const rawGroups: BountyDrop[][] = [];
  let currentGroup: BountyDrop[] = [];
  let currentSum = 0;

  for (const drop of drops) {
    currentGroup.push(drop);
    currentSum += drop.chance;
    if (currentSum >= 99.5) {
      rawGroups.push(currentGroup);
      currentGroup = [];
      currentSum = 0;
    }
  }
  if (currentGroup.length > 0) {
    rawGroups.push(currentGroup);
  }

  const totalGroups = rawGroups.length;
  return rawGroups.map((groupDrops, idx) => {
    let stageName = `Stage ${idx + 1}`;
    if (totalGroups === 4) {
      if (idx === 0) stageName = 'Stage 1';
      else if (idx === 1) stageName = 'Stage 2 & 3';
      else if (idx === 2) stageName = 'Stage 4';
      else if (idx === 3) stageName = 'Final Stage';
    } else if (totalGroups === 3) {
      if (idx === 0) stageName = 'Stage 1';
      else if (idx === 1) stageName = 'Stage 2 & 3';
      else if (idx === 2) stageName = 'Final Stage';
    } else if (totalGroups === 2) {
      if (idx === 0) stageName = 'Stage 1';
      else if (idx === 1) stageName = 'Final Stage';
    }
    return {
      stageName,
      drops: groupDrops,
    };
  });
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

export interface LocationBountiesData {
  expiry?: number;
  CetusSyndicate?: {
    TentA?: string[];
    TentB?: string[];
    TentC?: string[];
  };
}

/**
 * Fetch Full Warframe PC Worldstate from https://api.warframestat.us/pc and https://oracle.browse.wf/location-bounties
 */
export async function fetchWarframeWorldstate(): Promise<{
  cetusCycle: CetusCycle;
  ostronData: OstronSyndicateData;
  locationData: LocationBountiesData | null;
}> {
  try {
    const [wfRes, oracleRes] = await Promise.all([
      fetch('https://api.warframestat.us/pc', { cache: 'no-store' }),
      fetch('https://oracle.browse.wf/location-bounties', { cache: 'no-store' }).catch(() => null),
    ]);

    if (!wfRes.ok) throw new Error('Error al obtener datos de WarframeStat PC');
    const data = await wfRes.json();
    const locationData: LocationBountiesData | null = oracleRes && oracleRes.ok ? await oracleRes.json() : null;

    const cetusCycle: CetusCycle = data.cetusCycle || {
      id: 'cetusCycle',
      expiry: new Date(Date.now() + 1500000).toISOString(),
      activation: new Date().toISOString(),
      isDay: true,
      state: 'day',
      timeLeft: '25m 00s',
      isCetus: true,
      shortString: '25m to Night',
    };

    const ostronData: OstronSyndicateData | undefined = (data.syndicateMissions || []).find(
      (s: { syndicate: string }) => s.syndicate === 'Ostrons'
    );

    if (!ostronData) {
      throw new Error('No se encontraron contratos de Ostron en WarframeStat PC');
    }

    return { cetusCycle, ostronData, locationData };
  } catch (err) {
    console.error('Error in fetchWarframeWorldstate:', err);
    throw err;
  }
}

/**
 * Fetch Cetus Day/Night Cycle
 */
export async function fetchCetusCycle(): Promise<CetusCycle> {
  const { cetusCycle } = await fetchWarframeWorldstate();
  return cetusCycle;
}

/**
 * Fetch Ostron Syndicate Missions / Bounties
 */
export async function fetchOstronBounties(): Promise<OstronSyndicateData> {
  const { ostronData } = await fetchWarframeWorldstate();
  return ostronData;
}

/**
 * Fetch Live Field Location Bounties (Tent A, B, C)
 */
export async function fetchLocationBounties(): Promise<LocationBountiesData | null> {
  const { locationData } = await fetchWarframeWorldstate();
  return locationData;
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
  const lowerName = (typeName || '').toLowerCase();
  if (lowerName.includes('narmer')) {
    return { prefix: 'T7', name: typeName, badge: 'Narmer', color: '#ef4444', tent: 'Tent C' };
  }
  if (levelMin === 100 || levelMax === 100) {
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
  
  if (levelMax <= 30) {
    return { prefix: `T${index + 1}`, name: typeName, badge: `Lv ${levelMin}-${levelMax}`, color: '#10b981', tent: 'Tent A' };
  } else if (levelMax <= 50) {
    return { prefix: `T${index + 1}`, name: typeName, badge: `Lv ${levelMin}-${levelMax}`, color: '#3b82f6', tent: 'Tent B' };
  } else {
    return { prefix: `T${index + 1}`, name: typeName, badge: `Lv ${levelMin}-${levelMax}`, color: '#ec4899', tent: 'Tent C' };
  }
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

const LOTUS_BOUNTY_NAME_MAP: Record<string, string> = {
  attritionbountylib: 'Weaken The Grineer Foothold',
  attritionbountycap: 'Capture Their Leader',
  reclamationbountycache: 'Find The Hidden Artifact',
  reclamationbountytheft: 'Reclaim The Stolen Artifact',
  assassinatebountyass: 'Assassinate The Commander',
  assassinatebountycap: 'Capture The New Grineer Commander',
  attritionbountysab: 'Sabotage Grineer Supply Lines',
  sabotagebountysab: 'Sabotage Grineer Supply Lines',
  capturebountycaptwo: 'Spy Catcher',
  attritionbountyext: 'Cull The Enemy',
  rescuebountyresc: 'Search And Rescue',
  prototypesabotage: 'Prototype Sabotage',
};

export function getBountyNameFromLotusPath(path: string, fallbackName?: string): string {
  if (!path) return fallbackName || 'Cetus Bounty';
  const filename = path.split('/').pop() || path;
  const lower = filename.toLowerCase().replace(/\d+$/, '').trim();

  if (LOTUS_BOUNTY_NAME_MAP[lower]) {
    return LOTUS_BOUNTY_NAME_MAP[lower];
  }

  // Keyword fallbacks
  if (lower.includes('rescue')) return 'Search And Rescue';
  if (lower.includes('reclamation') && lower.includes('cache')) return 'Find The Hidden Artifact';
  if (lower.includes('reclamation') || lower.includes('theft')) return 'Reclaim The Stolen Artifact';
  if (lower.includes('assassinate') && lower.includes('ass')) return 'Assassinate The Commander';
  if (lower.includes('assassinate') || (lower.includes('capture') && lower.includes('commander'))) return 'Capture The New Grineer Commander';
  if (lower.includes('capture') && lower.includes('agent')) return 'Capture The Grineer Agent';
  if (lower.includes('sabotage') || lower.includes('sab')) return 'Sabotage Grineer Supply Lines';
  if (lower.includes('attrition') && lower.includes('lib')) return 'Weaken The Grineer Foothold';
  if (lower.includes('attrition') && lower.includes('cap')) return 'Capture Their Leader';
  if (lower.includes('attrition') && lower.includes('ext')) return 'Cull The Enemy';
  if (lower.includes('spy') || lower.includes('captwo')) return 'Spy Catcher';

  return fallbackName || filename;
}

const BOUNTY_NAME_MAP_EN: Record<string, string> = {
  'search and rescue': 'Search And Rescue',
  'find the hidden artifact': 'Find The Hidden Artifact',
  'reclaim the stolen artifact': 'Reclaim The Stolen Artifact',
  'capture the grineer agent': 'Capture The Grineer Agent',
  'capture the new grineer commander': 'Capture The New Grineer Commander',
  'capture the grineer commander': 'Capture The New Grineer Commander',
  'assassinate the commander': 'Assassinate The Commander',
  'sabotage grineer supply lines': 'Sabotage Grineer Supply Lines',
  'sabotage bounty': 'Sabotage Grineer Supply Lines',
  'spy catcher': 'Spy Catcher',
  'weaken the grineer foothold': 'Weaken The Grineer Foothold',
  'cull the enemy': 'Cull The Enemy',
  'prototype sabotage': 'Prototype Sabotage',
  'capture their leader': 'Capture Their Leader',
};

export function translateBountyName(name: string, _lang?: string): string {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  return BOUNTY_NAME_MAP_EN[lower] || name;
}

export function translateItemName(itemName: string, _lang?: string): string {
  return itemName || '';
}



