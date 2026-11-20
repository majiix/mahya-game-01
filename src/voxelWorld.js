import * as THREE from 'three';
import { createSignTexture, createVoxelTextures } from './sakuraTextures.js';

export const HOTBAR_BLOCKS = [
  { id: 'hanok_wood', name: 'چوب هانوک', color: '#a3683b', category: 'block' },
  { id: 'white_plaster', name: 'دیوار سفید', color: '#f3ede4', category: 'block' },
  { id: 'stone', name: 'سنگ کره‌ای', color: '#7c8594', category: 'block' },
  { id: 'brick', name: 'آجر سئول', color: '#c95649', category: 'block' },
  { id: 'hanok_roof', name: 'سفال گیوا', color: '#2f3847', category: 'block' },
  { id: 'glass', name: 'شیشه', color: '#7dd3fc', category: 'block' },
  { id: 'wooden_door', name: 'در چوبی', color: '#8c522b', isDoor: true, doorStyle: 'korean_wood', category: 'door' },
  { id: 'bookshelf', name: 'قفسه کتاب', color: '#945b31', category: 'block' },
  { id: 'bamboo', name: 'بامبو', color: '#52b748', category: 'block' },
  { id: 'tall_grass', name: 'چمن بلند', color: '#5ea83c', isPlant: true, category: 'plant' },
  { id: 'lantern', name: 'فانوس', color: '#fde047', category: 'block' },
  { id: 'sakura_leaves', name: 'شکوفه', color: '#ff9ec4', category: 'block' },
];

export const EXTRA_BLOCKS = [
  { id: 'hanok_door', name: 'در کشویی هانوک', color: '#f5ebd6', isDoor: true, doorStyle: 'hanok_sliding', category: 'door' },
  { id: 'glass_door', name: 'در شیشه‌ای کافه', color: '#38bdf8', isDoor: true, doorStyle: 'glass_modern', category: 'door' },
  { id: 'sand', name: 'شن ساحلی', color: '#f3dfa2', category: 'block' },
  { id: 'marble', name: 'سنگ مرمر سفید', color: '#f1f5f9', category: 'block' },
  { id: 'cherry_planks', name: 'تخته چوب گیلاس', color: '#f5b5c8', category: 'block' },
  { id: 'dark_oak', name: 'چوب بلوط تیره', color: '#4a2e1b', category: 'block' },
  { id: 'amethyst_crystal', name: 'کریستال آمیتیست', color: '#9333ea', category: 'special' },
  { id: 'emerald_block', name: 'بلوک زمرد درخشان', color: '#10b981', category: 'special' },
  { id: 'snow_block', name: 'بلوک برف کوهستان', color: '#e0f2fe', category: 'block' },
  { id: 'obsidian_stone', name: 'سنگ فضایی ابسیدین', color: '#2e2942', category: 'special' },
  { id: 'alien_metal', name: 'فلز سفینه فضایی', color: '#475569', category: 'special' },
  { id: 'alien_glow', name: 'هسته سبز فضایی', color: '#84cc16', category: 'special' },
  { id: 'autumn_leaves', name: 'برگ پاییزی نارنجی', color: '#ea580c', category: 'block' },
  { id: 'neon_pink', name: 'نئون صورتی سئول', color: '#ff4fa3', category: 'special' },
  { id: 'neon_cyan', name: 'نئون آبی فضایی', color: '#22d3ee', category: 'special' },
  { id: 'sea_lantern', name: 'فانوس دریایی', color: '#67e8f9', category: 'special' },
  { id: 'coral_pink', name: 'مرجان دریایی صورتی', color: '#fb7185', category: 'block' },
  { id: 'gold_block', name: 'بلوک طلایی قصر', color: '#facc15', category: 'special' },
  { id: 'pink_wool', name: 'پشم صورتی', color: '#f472b6', category: 'block' },
  { id: 'cobble_moss', name: 'سنگ خزه‌دار', color: '#5ea83c', category: 'block' },
  { id: 'grass', name: 'چمن جنگل', color: '#69b844', category: 'block' },
  { id: 'dirt', name: 'خاک جنگل', color: '#825636', category: 'block' },
  { id: 'fence_post', name: 'نرده چوبی', color: '#b37544', category: 'block' },
  { id: 'water', name: 'بلوک آب', color: '#0ea5e9', category: 'block' },
  { id: 'underground_water', name: 'آب چشمه زیرزمینی', color: '#06b6d4', category: 'special' },
  { id: 'lava', name: 'مواد مذاب آتشفشانی', color: '#f97316', category: 'special' },
  { id: 'magma_rock', name: 'سنگ ماگمای داغ', color: '#7c2d12', category: 'special' },
  { id: 'waterfall', name: 'آبشار روان', color: '#38bdf8', category: 'special' },
  { id: 'pink_flower', name: 'گل صورتی ساکورا', color: '#ff69b4', isPlant: true, category: 'plant' },
  { id: 'yellow_flower', name: 'گل زرد آفتابگردان', color: '#facc15', isPlant: true, category: 'plant' },
  { id: 'flower_blue', name: 'گل آبی دریاچه', color: '#38bdf8', isPlant: true, category: 'plant' },
  { id: 'flower_tulip', name: 'لاله قرمز جنگلی', color: '#ef4444', isPlant: true, category: 'plant' },
  { id: 'lotus_pad', name: 'نیلوفر آبی دریاچه', color: '#22c55e', isPlant: true, category: 'plant' },
  { id: 'fern_bush', name: 'بوته سرخس جنگلی', color: '#15803d', isPlant: true, category: 'plant' },
  { id: 'bush_berry', name: 'بوته تمشک وحشی', color: '#166534', isPlant: true, category: 'plant' },
  { id: 'mushroom_red', name: 'قارچ قرمز جنگلی', color: '#dc2626', isPlant: true, category: 'plant' },
  { id: 'glow_mushroom', name: 'قارچ درخشان غار', color: '#06b6d4', isPlant: true, category: 'plant' },
];

export const ALL_BLOCK_NAMES = {
  grass: 'چمن جنگل',
  dirt: 'خاک جنگل',
  stone: 'سنگ کره‌ای',
  cobble_moss: 'سنگ خزه‌دار',
  hanok_wood: 'چوب هانوک',
  cherry_planks: 'تخته چوب گیلاس',
  white_plaster: 'دیوار سفید هانوک',
  wood_log: 'تنه درخت',
  brick: 'آجر سئول',
  hanok_roof: 'سفال سقف گیوا',
  pine_leaves: 'برگ کاج',
  sakura_leaves: 'شکوفه ساکورا',
  autumn_leaves: 'برگ پاییزی',
  glass: 'شیشه پنجره',
  wooden_door: 'در چوبی کره‌ای',
  hanok_door: 'در کشویی هانوک',
  glass_door: 'در شیشه‌ای کافه',
  bookshelf: 'قفسه کتاب',
  bamboo: 'بامبوی سبز',
  fence_post: 'نرده چوبی',
  gold_block: 'بلوک طلایی قصر',
  pink_wool: 'پشم صورتی',
  lantern: 'فانوس درخشان',
  water: 'آب زلال',
  underground_water: 'آب چشمه زیرزمینی',
  lava: 'مواد مذاب',
  magma_rock: 'سنگ ماگمای داغ',
  waterfall: 'آبشار روان',
  sand: 'شن ساحلی',
  marble: 'سنگ مرمر سفید',
  dark_oak: 'چوب بلوط تیره',
  amethyst_crystal: 'کریستال آمیتیست',
  emerald_block: 'بلوک زمرد',
  coral_pink: 'مرجان دریایی',
  snow_block: 'بلوک برف',
  obsidian_stone: 'سنگ فضایی ابسیدین',
  alien_metal: 'فلز سفینه فضایی',
  alien_glow: 'هسته سبز فضایی',
  neon_pink: 'نئون صورتی',
  neon_cyan: 'نئون آبی فضایی',
  sea_lantern: 'فانوس دریایی',
  bedrock: 'سنگ بستر اعماق زمین',
  tall_grass: 'چمن بلند جنگل',
  pink_flower: 'گل صورتی ساکورا',
  yellow_flower: 'گل زرد آفتابگردان',
  flower_blue: 'گل آبی دریاچه',
  flower_tulip: 'لاله قرمز جنگلی',
  lotus_pad: 'نیلوفر آبی دریاچه',
  fern_bush: 'بوته سرخس',
  bush_berry: 'بوته تمشک وحشی',
  mushroom_red: 'قارچ قرمز جنگلی',
  glow_mushroom: 'قارچ درخشان غار',
};

export const PLANT_IDS = new Set([
  'tall_grass',
  'pink_flower',
  'yellow_flower',
  'flower_blue',
  'flower_tulip',
  'lotus_pad',
  'fern_bush',
  'bush_berry',
  'mushroom_red',
  'glow_mushroom',
]);

export const BUILD_TOOLS = [
  { id: 'single', name: 'تک‌بلوک', desc: 'گذاشتن یا کندن ۱ بلوک' },
  { id: 'tunnel', name: 'تونل ۲×۲', desc: 'حفر تونل زیرزمینی یا ساخت مکعب ۲×۲×۲' },
  { id: 'wall3', name: 'دیوار ۳×۳', desc: 'ساخت یا تخریب دیوار ۳ در ۳' },
  { id: 'floor3', name: 'کف و سقف ۳×۳', desc: 'ساخت یا کندن صفحه ۳ در ۳' },
  { id: 'pillar4', name: 'ستون ۱×۴', desc: 'ساخت ستون ۴تایی یا بریدن کامل تنه' },
  { id: 'stairs4', name: 'پله‌ساز', desc: 'ساخت ۴ پله بالارونده' },
  { id: 'doorway', name: 'دربازکن / نصب در', desc: 'باز کردن دهانه ۱×۲ در دیوار یا نصب در چوبی' },
];

function getMaxInstances(type) {
  if (type === 'grass' || type === 'dirt') return 26000;
  if (type === 'stone') return 32000;
  if (type === 'water') return 24000;
  if (type === 'sand' || type === 'pine_leaves' || type === 'sakura_leaves') return 15000;
  if (type === 'cobble_moss' || type === 'obsidian_stone' || type === 'magma_rock') return 10000;
  if (type === 'tall_grass' || type === 'autumn_leaves' || type === 'snow_block') return 10000;
  if (type === 'lava' || type === 'underground_water') return 6500;
  return 5500;
}

function createCrossedPlantGeometry() {
  const w = 0.44;
  const yBot = -0.5;
  const yTop = 0.42;
  const diag = w * Math.SQRT1_2;

  const positions = new Float32Array([
    -diag, yBot, -diag,
    diag, yBot, diag,
    diag, yTop, diag,
    -diag, yTop, -diag,
    -diag, yBot, diag,
    diag, yBot, -diag,
    diag, yTop, -diag,
    -diag, yTop, diag,
  ]);

  const uvs = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    0, 1,
    0, 0,
    1, 0,
    1, 1,
    0, 1,
  ]);

  const indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function createFlatPadGeometry() {
  const geo = new THREE.PlaneGeometry(0.92, 0.92);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -0.44, 0);
  return geo;
}

const _dummy = new THREE.Object3D();

export class VoxelWorld {
  constructor(scene) {
    this.scene = scene;
    this.blocks = new Map();
    this.batches = {};
    this.dirtyTypes = new Set();
    this.undoStack = [];
    this.activeEditBatch = null;
    this.blockedDoorKeys = new Set();
    this.doorCellMap = new Map();
    this.initialDoorAnchors = [];
    this.waterfallAnchors = [];

    this.deltas = new Map();
    this.dugCells = new Set();

    this.worldRadius = 86;
    this.maxRadius = 200;
    this.minY = -16;
    this.maxY = 48;
    this.renderCenterX = 0;
    this.renderCenterZ = 0;
    this.renderRadius = 68;
    this._lastSubCellKey = '';

    this.textures = createVoxelTextures();
    this.unitGeo = new THREE.BoxGeometry(1, 1, 1);
    this.plantGeo = createCrossedPlantGeometry();
    this.flatPadGeo = createFlatPadGeometry();

    this.initMaterialsAndBatches();
    this.generateKoreanForestWorld();
    this.flushBatches();
  }

  scrollWaterfall(dt) {
    if (this.textures.waterfall) {
      this.textures.waterfall.offset.y = (this.textures.waterfall.offset.y + dt * 1.45) % 1;
    }
    if (this.textures.lava) {
      this.textures.lava.offset.y = (this.textures.lava.offset.y + dt * 0.24) % 1;
      this.textures.lava.offset.x = (this.textures.lava.offset.x + dt * 0.14) % 1;
    }
    if (this.textures.underground_water) {
      this.textures.underground_water.offset.x = (this.textures.underground_water.offset.x + dt * 0.18) % 1;
    }
  }

  updateRenderWindow(px, pz) {
    if (Math.hypot(px - this.renderCenterX, pz - this.renderCenterZ) > 12) {
      this.renderCenterX = Math.round(px);
      this.renderCenterZ = Math.round(pz);
      Object.keys(this.batches).forEach((t) => this.dirtyTypes.add(t));
      this.flushBatches();
    }
  }

  key(x, y, z) {
    return `${x},${y},${z}`;
  }

  initMaterialsAndBatches() {
    const t = this.textures;
    const makeStd = (map, extra = {}) =>
      new THREE.MeshStandardMaterial({
        map,
        roughness: 0.85,
        metalness: 0.04,
        ...extra,
      });

    const grassSideMat = makeStd(t.grass_side);
    const grassTopMat = makeStd(t.grass_top);
    const dirtMat = makeStd(t.dirt);

    const materials = {
      grass: [grassSideMat, grassSideMat, grassTopMat, dirtMat, grassSideMat, grassSideMat],
      dirt: dirtMat,
      stone: makeStd(t.stone, { roughness: 0.78 }),
      hanok_wood: makeStd(t.hanok_wood, { roughness: 0.7 }),
      wood_log: makeStd(t.wood_log, { roughness: 0.88 }),
      brick: makeStd(t.brick, { roughness: 0.8 }),
      hanok_roof: makeStd(t.hanok_roof, { roughness: 0.55, metalness: 0.15 }),
      pine_leaves: makeStd(t.pine_leaves, { roughness: 0.9 }),
      sakura_leaves: makeStd(t.sakura_leaves, {
        roughness: 0.75,
        emissive: '#ff7aa8',
        emissiveIntensity: 0.12,
      }),
      autumn_leaves: makeStd(t.autumn_leaves, { roughness: 0.85 }),
      glass: new THREE.MeshStandardMaterial({
        map: t.glass,
        transparent: true,
        opacity: 0.62,
        roughness: 0.15,
        metalness: 0.1,
        depthWrite: false,
      }),
      lantern: new THREE.MeshStandardMaterial({
        map: t.lantern,
        emissive: '#fbbf24',
        emissiveIntensity: 1.15,
        roughness: 0.4,
      }),
      water: new THREE.MeshStandardMaterial({
        map: t.water,
        transparent: true,
        opacity: 0.76,
        roughness: 0.15,
        metalness: 0.15,
      }),
      bamboo: makeStd(t.bamboo, { roughness: 0.65 }),
      white_plaster: makeStd(t.white_plaster, { roughness: 0.85 }),
      gold_block: makeStd(t.gold_block, { roughness: 0.25, metalness: 0.8 }),
      pink_wool: makeStd(t.pink_wool, { roughness: 0.92 }),
      bookshelf: makeStd(t.bookshelf, { roughness: 0.78 }),
      cobble_moss: makeStd(t.cobble_moss, { roughness: 0.85 }),
      wooden_door: makeStd(t.wooden_door, { roughness: 0.68 }),
      fence_post: makeStd(t.fence_post, { roughness: 0.75 }),
      sand: makeStd(t.sand, { roughness: 0.9 }),
      marble: makeStd(t.marble, { roughness: 0.35, metalness: 0.08 }),
      dark_oak: makeStd(t.dark_oak, { roughness: 0.76 }),
      amethyst_crystal: makeStd(t.amethyst_crystal, {
        roughness: 0.25,
        metalness: 0.25,
        emissive: '#7e22ce',
        emissiveIntensity: 0.38,
      }),
      snow_block: makeStd(t.snow_block, { roughness: 0.72 }),
      obsidian_stone: makeStd(t.obsidian_stone, { roughness: 0.52, metalness: 0.22 }),
      neon_pink: makeStd(t.neon_pink, {
        roughness: 0.3,
        emissive: '#ff4fa3',
        emissiveIntensity: 0.95,
      }),
      neon_cyan: makeStd(t.neon_cyan, {
        roughness: 0.3,
        emissive: '#22d3ee',
        emissiveIntensity: 0.95,
      }),
      sea_lantern: makeStd(t.sea_lantern, {
        roughness: 0.25,
        emissive: '#67e8f9',
        emissiveIntensity: 1.05,
      }),
      cherry_planks: makeStd(t.cherry_planks, { roughness: 0.72 }),
      emerald_block: makeStd(t.emerald_block, {
        roughness: 0.25,
        metalness: 0.35,
        emissive: '#059669',
        emissiveIntensity: 0.28,
      }),
      coral_pink: makeStd(t.coral_pink, { roughness: 0.8 }),
      waterfall: new THREE.MeshStandardMaterial({
        map: t.waterfall,
        transparent: true,
        opacity: 0.84,
        roughness: 0.14,
        emissive: '#38bdf8',
        emissiveIntensity: 0.24,
      }),
      underground_water: new THREE.MeshStandardMaterial({
        map: t.underground_water,
        transparent: true,
        opacity: 0.8,
        roughness: 0.12,
        metalness: 0.1,
        emissive: '#0891b2',
        emissiveIntensity: 0.34,
      }),
      lava: new THREE.MeshStandardMaterial({
        map: t.lava,
        roughness: 0.28,
        emissive: '#ea580c',
        emissiveIntensity: 1.55,
      }),
      magma_rock: makeStd(t.magma_rock, {
        roughness: 0.85,
        emissive: '#9a3412',
        emissiveIntensity: 0.32,
      }),
      alien_metal: makeStd(t.alien_metal, { roughness: 0.28, metalness: 0.78 }),
      alien_glow: makeStd(t.alien_glow, {
        roughness: 0.25,
        emissive: '#84cc16',
        emissiveIntensity: 0.95,
      }),
      bedrock: makeStd(t.bedrock, { roughness: 0.95 }),
      // Cutout plant types
      tall_grass: new THREE.MeshStandardMaterial({
        map: t.tall_grass,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.85,
      }),
      pink_flower: new THREE.MeshStandardMaterial({
        map: t.pink_flower,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.8,
      }),
      yellow_flower: new THREE.MeshStandardMaterial({
        map: t.yellow_flower,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.8,
      }),
      flower_blue: new THREE.MeshStandardMaterial({
        map: t.flower_blue,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.8,
      }),
      flower_tulip: new THREE.MeshStandardMaterial({
        map: t.flower_tulip,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.8,
      }),
      lotus_pad: new THREE.MeshStandardMaterial({
        map: t.lotus_pad,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.75,
      }),
      fern_bush: new THREE.MeshStandardMaterial({
        map: t.fern_bush,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.88,
      }),
      bush_berry: new THREE.MeshStandardMaterial({
        map: t.bush_berry,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.85,
      }),
      mushroom_red: new THREE.MeshStandardMaterial({
        map: t.mushroom_red,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.82,
      }),
      glow_mushroom: new THREE.MeshStandardMaterial({
        map: t.glow_mushroom,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        emissive: '#22d3ee',
        emissiveIntensity: 0.85,
        roughness: 0.5,
      }),
    };

    Object.entries(materials).forEach(([type, mat]) => {
      const isPlant = PLANT_IDS.has(type);
      const geo = type === 'lotus_pad' ? this.flatPadGeo : isPlant ? this.plantGeo : this.unitGeo;
      const inst = new THREE.InstancedMesh(geo, mat, getMaxInstances(type));
      inst.count = 0;
      const isLiquid = type === 'water' || type === 'waterfall' || type === 'underground_water' || type === 'lava';
      inst.castShadow = !isPlant && !isLiquid && type !== 'glass';
      inst.receiveShadow = !isPlant && type !== 'lava';
      inst.frustumCulled = false;
      this.scene.add(inst);
      this.batches[type] = inst;
    });
  }

  getBlock(x, y, z) {
    return this.blocks.get(this.key(x, y, z)) || null;
  }

  isSolid(x, y, z) {
    const k = this.key(x, y, z);
    if (this.blockedDoorKeys.has(k)) return true;
    const b = this.blocks.get(k) || null;
    return (
      b !== null &&
      b !== 'water' &&
      b !== 'waterfall' &&
      b !== 'underground_water' &&
      b !== 'lava' &&
      b !== 'wooden_door' &&
      !PLANT_IDS.has(b)
    );
  }

  isWaterAt(x, y, z) {
    const b = this.getBlock(Math.round(x), Math.floor(y), Math.round(z));
    return b === 'water' || b === 'waterfall' || b === 'underground_water';
  }

  isLavaAt(x, y, z) {
    const b = this.getBlock(Math.round(x), Math.floor(y), Math.round(z));
    return b === 'lava';
  }

  hasRoofAbove(x, y, z) {
    const ix = Math.round(x);
    const iz = Math.round(z);
    const startY = Math.floor(y) + 2;
    for (let cy = startY; cy <= 4; cy += 1) {
      if (this.isSolid(ix, cy, iz)) return true;
    }
    return false;
  }

  setDoorRegistration(ix, iy, iz, doorId, blocked) {
    const k0 = this.key(ix, iy, iz);
    const k1 = this.key(ix, iy + 1, iz);
    this.doorCellMap.set(k0, doorId);
    this.doorCellMap.set(k1, doorId);
    if (blocked) {
      this.blockedDoorKeys.add(k0);
      this.blockedDoorKeys.add(k1);
    } else {
      this.blockedDoorKeys.delete(k0);
      this.blockedDoorKeys.delete(k1);
    }
  }

  unregisterDoorCells(ix, iy, iz) {
    const k0 = this.key(ix, iy, iz);
    const k1 = this.key(ix, iy + 1, iz);
    this.doorCellMap.delete(k0);
    this.doorCellMap.delete(k1);
    this.blockedDoorKeys.delete(k0);
    this.blockedDoorKeys.delete(k1);
  }

  beginEdit() {
    this.activeEditBatch = new Map();
  }

  commitEdit() {
    if (this.activeEditBatch && this.activeEditBatch.size > 0) {
      this.undoStack.push(this.activeEditBatch);
      if (this.undoStack.length > 35) {
        this.undoStack.shift();
      }
    }
    this.activeEditBatch = null;
  }

  undoLastAction() {
    const batch = this.undoStack.pop();
    if (!batch) return 0;
    let restored = 0;
    batch.forEach((prevType, k) => {
      const curType = this.blocks.get(k);
      if (curType) this.dirtyTypes.add(curType);
      if (prevType === null) {
        this.blocks.delete(k);
        this.deltas.set(k, null);
      } else {
        this.blocks.set(k, prevType);
        this.deltas.set(k, prevType);
        this.dugCells.delete(k);
        this.dirtyTypes.add(prevType);
      }
      restored += 1;
    });
    this.flushBatches();
    return restored;
  }

  recordPrev(k) {
    if (this.activeEditBatch && !this.activeEditBatch.has(k)) {
      this.activeEditBatch.set(k, this.blocks.get(k) || null);
    }
  }

  setBlock(x, y, z, type, immediate = false, recordDelta = true) {
    if (y < this.minY || y > this.maxY) return false;
    if (Math.abs(x) > this.worldRadius || Math.abs(z) > this.worldRadius) return false;
    if (!this.batches[type]) return false;
    const k = this.key(x, y, z);
    const prev = this.blocks.get(k);
    if (prev === type) return false;
    this.recordPrev(k);
    if (prev) this.dirtyTypes.add(prev);
    this.blocks.set(k, type);
    this.dirtyTypes.add(type);
    if (recordDelta) {
      this.deltas.set(k, type);
      this.dugCells.delete(k);
    }
    if (immediate) this.flushBatches();
    return true;
  }

  isSurfaceWaterColumn(x, z) {
    const coastX = this.getCoastlineX(z);
    if (x >= coastX - 2) return true;
    if (Math.hypot(x + 36, z + 32) <= 9.5) return true;
    if (Math.hypot(x + 14, z - 34) <= 7.5) return true;
    if (z >= -35 && z <= 47 && Math.abs(x - this.getRiverCenterX(z)) <= 3.0) return true;
    return false;
  }

  getNaturalSubterraneanBlock(x, y, z) {
    if (y <= this.minY) return 'bedrock';
    if (y >= -2) return 'dirt';
    if (y === -3) return 'stone';

    // Seal directly beneath surface water features so rivers/sea never bleed into caves
    if (y >= -5 && this.isSurfaceWaterColumn(x, z)) {
      return 'stone';
    }

    const caveVal =
      Math.sin(x * 0.19) * Math.cos(z * 0.19) + Math.sin(y * 0.45 + x * 0.11 - z * 0.09);
    const aqNoise = Math.sin(x * 0.15 - z * 0.12) + Math.cos((x + z) * 0.11);
    const lavaNoise =
      Math.cos(x * 0.16 + 0.5) * Math.sin(z * 0.16 - 0.3) + Math.sin((x - z) * 0.1);
    const oreHash = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453) % 1;

    // Layer A: Dry Crystal Caves (y = -4..-8) with occasional deep aquifer pocket at y = -8
    if (y <= -4 && y >= -8) {
      if (caveVal > 0.78) {
        if (y === -8 && aqNoise > 0.72) return 'underground_water';
        return null; // Hollow cave air
      }
    }

    // Layer B: Deep Underground Water Caverns (y = -9..-11)
    if (y <= -9 && y >= -11) {
      if (aqNoise > 0.72) {
        if (y === -11) return 'underground_water';
        return null; // Cavern above underground spring
      }
    }

    // Layer C: Deep Volcanic Lava Chambers (y = -12..-15)
    if (y <= -12 && y >= -15) {
      if (lavaNoise > 0.58) {
        if (y <= -14) return 'lava';
        return null; // Air chamber above molten lava
      }
      if (lavaNoise > 0.32) {
        return oreHash > 0.7 ? 'obsidian_stone' : 'magma_rock';
      }
    }

    if (y <= -10 && oreHash > 0.93) return 'amethyst_crystal';
    if (y <= -7 && oreHash > 0.88 && oreHash <= 0.93) return 'emerald_block';
    if (y <= -6 && oreHash > 0.83 && oreHash <= 0.88) return 'gold_block';
    if (oreHash < 0.14) return 'cobble_moss';
    return 'stone';
  }

  revealSubterraneanAround(cx, cy, cz, maxReveal = 260) {
    const queue = [[cx, cy, cz, 0]];
    const queued = new Set([this.key(cx, cy, cz)]);
    let revealedCount = 0;

    // Seed full 5x5x5 cube around dig/player center so no diagonal cracks ever show sky void
    for (let dx = -2; dx <= 2; dx += 1) {
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dz = -2; dz <= 2; dz += 1) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;
          const nz = cz + dz;
          if (ny < this.minY || ny > -1) continue;
          if (Math.abs(nx) > this.worldRadius || Math.abs(nz) > this.worldRadius) continue;
          const nk = this.key(nx, ny, nz);
          if (this.blocks.has(nk) || this.dugCells.has(nk) || this.deltas.has(nk)) continue;

          const nat = this.getNaturalSubterraneanBlock(nx, ny, nz);
          if (nat === null) {
            this.dugCells.add(nk);
            if (!queued.has(nk)) {
              queued.add(nk);
              queue.push([nx, ny, nz, 1]);
            }
          } else {
            this.blocks.set(nk, nat);
            this.dirtyTypes.add(nat);
            revealedCount += 1;
          }
        }
      }
    }

    while (queue.length > 0 && revealedCount < maxReveal) {
      const [x, y, z, depth] = queue.shift();
      // Inspect all 26 3D neighbors around hollow/liquid cells so caves & lava pools stay enclosed
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dz = -1; dz <= 1; dz += 1) {
            if (dx === 0 && dy === 0 && dz === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;
            if (ny < this.minY || ny > -1) continue;
            if (Math.abs(nx) > this.worldRadius || Math.abs(nz) > this.worldRadius) continue;

            const nk = this.key(nx, ny, nz);
            if (this.blocks.has(nk) || this.dugCells.has(nk) || this.deltas.has(nk)) continue;

            const nat = this.getNaturalSubterraneanBlock(nx, ny, nz);
            if (nat === null) {
              this.dugCells.add(nk);
              if (depth < 4 && !queued.has(nk)) {
                queued.add(nk);
                queue.push([nx, ny, nz, depth + 1]);
              }
            } else {
              this.blocks.set(nk, nat);
              this.dirtyTypes.add(nat);
              revealedCount += 1;
              if ((nat === 'lava' || nat === 'underground_water') && depth < 4 && !queued.has(nk)) {
                queued.add(nk);
                queue.push([nx, ny, nz, depth + 1]);
              }
            }
          }
        }
      }
    }
  }

  ensureSubterraneanAroundPlayer(px, py, pz) {
    if (py > 1.2) return;
    const ix = Math.round(px);
    const iy = Math.max(this.minY + 1, Math.min(-1, Math.floor(py)));
    const iz = Math.round(pz);
    const ck = `${ix},${iy},${iz}`;
    if (ck === this._lastSubCellKey) return;
    this._lastSubCellKey = ck;
    this.revealSubterraneanAround(ix, iy, iz, 200);
    if (this.dirtyTypes.size > 0) {
      this.flushBatches();
    }
  }

  removeBlock(x, y, z, immediate = false, recordDelta = true) {
    if (y <= this.minY) return null;
    const k = this.key(x, y, z);
    const prev = this.blocks.get(k);
    if (!prev || prev === 'bedrock') return null;
    this.recordPrev(k);
    this.blocks.delete(k);
    this.dirtyTypes.add(prev);
    if (recordDelta) {
      this.deltas.set(k, null);
      this.dugCells.add(k);
    }
    if (y <= 1) {
      this.revealSubterraneanAround(x, y, z, 280);
    }
    if (immediate) this.flushBatches();
    return prev;
  }

  flushBatches() {
    if (this.dirtyTypes.size === 0) return;

    const grouped = {};
    this.dirtyTypes.forEach((t) => {
      grouped[t] = [];
    });

    const rcx = this.renderCenterX;
    const rcz = this.renderCenterZ;
    const rRad = this.renderRadius;

    this.blocks.forEach((type, k) => {
      if (!grouped[type]) return;
      const parts = k.split(',');
      const bx = Number(parts[0]);
      const by = Number(parts[1]);
      const bz = Number(parts[2]);
      if (Math.abs(bx - rcx) > rRad || Math.abs(bz - rcz) > rRad) return;
      grouped[type].push([bx, by, bz]);
    });

    this.dirtyTypes.forEach((type) => {
      const inst = this.batches[type];
      if (!inst) return;
      const list = grouped[type] || [];
      const maxLim = getMaxInstances(type);
      const count = Math.min(list.length, maxLim);
      for (let i = 0; i < count; i += 1) {
        const [bx, by, bz] = list[i];
        _dummy.position.set(bx, by + 0.5, bz);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.set(1, 1, 1);
        _dummy.updateMatrix();
        inst.setMatrixAt(i, _dummy.matrix);
      }
      inst.count = count;
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
    });

    this.dirtyTypes.clear();
  }

  isProtectedColumn(x, z) {
    if (Math.abs(x) <= 4 || Math.abs(z - 4) <= 3) return true; // Main roads
    if (Math.abs(x) <= 10 && z >= -24 && z <= -9) return true; // School
    if (x >= -30 && x <= -15 && z >= 8 && z <= 23) return true; // Cabin
    if (x >= 14 && x <= 27 && z >= 8 && z <= 21) return true; // Cafe
    if (x >= 21 && x <= 35 && z >= -28 && z <= -15) return true; // Yakuza
    if (Math.hypot(x + 24, z + 22) < 6) return true; // Temple Gate
    if (Math.hypot(x + 56, z - 42) < 10) return true; // Alien UFO landing pad
    return false;
  }

  getRiverCenterX(z) {
    return -13 + Math.sin(z * 0.14) * 5.2 - (z < -16 ? (z + 16) * 0.95 : 0);
  }

  getCoastlineX(z) {
    return 50 + Math.sin(z * 0.08) * 3.5 + Math.cos(z * 0.04) * 2.0;
  }

  generateRingTerrain(minR, maxR, isInitial = false) {
    const seaEnd = maxR;
    for (let x = -maxR; x <= maxR; x += 1) {
      for (let z = -maxR; z <= maxR; z += 1) {
        const cheb = Math.max(Math.abs(x), Math.abs(z));
        if (!isInitial && cheb < minR) continue;

        const coastX = this.getCoastlineX(z);
        const distLake = Math.hypot(x + 36, z + 32);
        const distPond = Math.hypot(x + 14, z - 34);
        const distMount = Math.hypot(x + 48, z + 44);
        const distAlienPad = Math.hypot(x + 56, z - 42);
        const riverX = this.getRiverCenterX(z);
        const onRiver = z >= -34 && z <= 46 && Math.abs(x - riverX) <= 2.1;

        // 1. Eastern Sea & Beach
        if (x >= coastX - 3 && x <= seaEnd) {
          if (x < coastX) {
            this.setBlock(x, 0, z, 'sand', false, false);
            continue;
          }
          // Sea bed and water with sealed stone beneath
          this.setBlock(x, -3, z, 'stone', false, false);
          this.setBlock(x, -2, z, 'sand', false, false);
          this.setBlock(x, -1, z, 'water', false, false);
          this.setBlock(x, 0, z, 'water', false, false);
          const seaMod = Math.abs(x * 7 + z * 11) % 53;
          if (seaMod === 0 && x > coastX + 4) {
            this.setBlock(x, -2, z, 'sea_lantern', false, false);
          } else if (seaMod === 13 && x > coastX + 3) {
            this.setBlock(x, -2, z, 'coral_pink', false, false);
          }
          continue;
        }

        // 2. Mountain Lake & Sakura Pond & River
        if (distLake <= 8.5 || distPond <= 6.5 || onRiver) {
          this.setBlock(x, -3, z, 'stone', false, false);
          this.setBlock(x, -2, z, 'cobble_moss', false, false);
          this.setBlock(x, -1, z, 'water', false, false);
          this.setBlock(x, 0, z, 'water', false, false);
          const hash = Math.abs(Math.sin(x * 13.7 + z * 29.3) * 43758.5) % 1;
          if ((distLake <= 7.5 || distPond <= 5.5) && hash > 0.9 && Math.abs(z - 4) > 3) {
            this.setBlock(x, 1, z, 'lotus_pad', false, false);
          }
          continue;
        }

        // 3. Alien Crater Plateau
        if (distAlienPad <= 8.5) {
          const isRim = distAlienPad > 6.8;
          const tile = isRim
            ? 'alien_metal'
            : Math.round(distAlienPad) % 3 === 0
              ? 'neon_cyan'
              : 'obsidian_stone';
          this.setBlock(x, 0, z, tile, false, false);
          continue;
        }

        // 4. Mountain Peak (Northwest behind lake for waterfall)
        let h = 0;
        if (distMount < 15 && distLake > 8.2) {
          const rawPeak = Math.round((15 - distMount) * 1.15);
          h = Math.max(0, Math.min(14, rawPeak));
        } else {
          const dist = Math.hypot(x, z);
          if (dist > 26 && !this.isProtectedColumn(x, z)) {
            const wave = Math.sin(x * 0.13) * Math.cos(z * 0.12) + Math.sin((x - z) * 0.07);
            h = Math.max(0, Math.min(4, Math.floor((dist - 26) * 0.08 + (wave + 1) * 0.7)));
          }
        }

        const onMainPath = (Math.abs(x) <= 2 && Math.abs(z) <= 44) || (Math.abs(z - 4) <= 2 && x >= -32 && x <= 46);
        if (onMainPath || this.isProtectedColumn(x, z)) {
          h = 0;
        }

        for (let y = 0; y <= h; y += 1) {
          const isTop = y === h;
          let blockType = isTop ? 'grass' : y >= h - 1 ? 'dirt' : 'stone';
          if (h >= 9 && isTop) blockType = 'snow_block';
          else if (h >= 4 && isTop) blockType = y % 2 === 0 ? 'stone' : 'grass';
          if (onMainPath && y === 0) blockType = 'stone';
          this.setBlock(x, y, z, blockType, false, false);
        }

        // Scatter rich variety of flowers, grasses, ferns, berry bushes & mushrooms
        if (h <= 3 && !onMainPath && !this.isProtectedColumn(x, z)) {
          const flHash = Math.abs(Math.sin(x * 41.3 + z * 19.7) * 19384.2) % 1;
          if (flHash > 0.94) {
            this.setBlock(x, h + 1, z, 'tall_grass', false, false);
          } else if (flHash > 0.918) {
            this.setBlock(x, h + 1, z, 'pink_flower', false, false);
          } else if (flHash > 0.902) {
            this.setBlock(x, h + 1, z, 'yellow_flower', false, false);
          } else if (flHash > 0.89) {
            this.setBlock(x, h + 1, z, 'flower_blue', false, false);
          } else if (flHash > 0.878) {
            this.setBlock(x, h + 1, z, 'flower_tulip', false, false);
          } else if (flHash > 0.866) {
            this.setBlock(x, h + 1, z, 'fern_bush', false, false);
          } else if (flHash > 0.858) {
            this.setBlock(x, h + 1, z, 'bush_berry', false, false);
          } else if (flHash > 0.852) {
            this.setBlock(x, h + 1, z, 'mushroom_red', false, false);
          }
        }
      }
    }

    // Add dense Korean forest trees & bamboo clusters in this ring
    const treeCount = isInitial ? 265 : 130;
    for (let i = 0; i < treeCount; i += 1) {
      const ang = (i + (isInitial ? 0 : minR)) * 2.39996;
      const span = Math.max(4, maxR - Math.max(14, minR));
      const rad = Math.max(14, minR) + ((i * 23) % span);
      const tx = Math.round(Math.cos(ang) * rad);
      const tz = Math.round(Math.sin(ang) * rad);
      if (Math.abs(tx) > maxR - 2 || Math.abs(tz) > maxR - 2) continue;
      if (tx >= this.getCoastlineX(tz) - 4) continue;
      if (this.isProtectedColumn(tx, tz)) continue;
      if (Math.hypot(tx + 36, tz + 32) < 10) continue;
      if (Math.hypot(tx + 14, tz - 34) < 8) continue;
      if (Math.abs(tx - this.getRiverCenterX(tz)) < 4) continue;
      if (Math.hypot(tx + 48, tz + 44) < 12) continue;

      const groundY = this.getTopSolidY(tx, tz);
      const topBlk = this.getBlock(tx, groundY, tz);
      if (!topBlk || topBlk === 'water' || topBlk === 'sand' || topBlk === 'obsidian_stone' || topBlk === 'alien_metal') continue;

      if (i % 7 === 0) {
        const bh = 4 + (i % 4);
        for (let by = 1; by <= bh; by += 1) {
          this.setBlock(tx, groundY + by, tz, 'bamboo', false, false);
        }
      } else {
        const leafPool = ['pine_leaves', 'pine_leaves', 'sakura_leaves', 'autumn_leaves'];
        const leafType = leafPool[i % leafPool.length];
        this.buildVoxelTree(tx, groundY + 1, tz, leafType, 4 + (i % 3), false);
      }
    }
  }

  expandWorldBy(delta = 24) {
    if (this.worldRadius >= this.maxRadius) return 0;
    const prevR = this.worldRadius;
    const nextR = Math.min(this.maxRadius, prevR + delta);
    this.worldRadius = nextR;
    this.generateRingTerrain(prevR + 1, nextR, false);
    this.flushBatches();
    return nextR - prevR;
  }

  generateKoreanForestWorld() {
    this.generateRingTerrain(0, this.worldRadius, true);

    // Scenic Wooden Bridge over the river at z = 3..5
    for (let bx = -17; bx <= -10; bx += 1) {
      for (let bz = 3; bz <= 5; bz += 1) {
        this.setBlock(bx, 1, bz, 'hanok_wood', false, false);
      }
    }
    this.setBlock(-17, 2, 3, 'lantern', false, false);
    this.setBlock(-10, 2, 5, 'lantern', false, false);

    // Coastal Wooden Pier into Eastern Sea (z = 3..5, x = 49..60)
    for (let px = 49; px <= 60; px += 1) {
      for (let pz = 3; pz <= 5; pz += 1) {
        this.setBlock(px, 1, pz, 'hanok_wood', false, false);
      }
      if (px % 4 === 0) {
        this.setBlock(px, 2, 3, 'fence_post', false, false);
        this.setBlock(px, 2, 5, 'fence_post', false, false);
      }
    }
    this.setBlock(60, 2, 3, 'sea_lantern', false, false);
    this.setBlock(60, 2, 5, 'sea_lantern', false, false);
    this.addVoxelSign('اسکله ساحلی و دریای شرق', 'شنا و غواصی آزاد', '#0284c7', 52, 4.4, 2.2);

    // Cascading Mountain Waterfall into Mountain Lake (-41, 1..11, -36)
    for (let wy = 1; wy <= 11; wy += 1) {
      this.setBlock(-41, wy, -36, 'waterfall', false, false);
      this.setBlock(-40, wy, -36, 'waterfall', false, false);
      this.setBlock(-42, wy, -37, 'cobble_moss', false, false);
      this.setBlock(-39, wy, -37, 'cobble_moss', false, false);
    }
    this.waterfallAnchors = [{ x: -40.5, yTop: 11.5, yBot: 0.6, z: -35.8 }];
    this.addVoxelSign('آبشار و دریاچه کوهستان', 'چشمه بلورین جنگل', '#0e7490', -36, 4.2, -23.5);

    // Alien UFO Crater Monuments & Crystals (-56, z = 42)
    [
      [-62, 42],
      [-50, 42],
      [-56, 36],
      [-56, 48],
    ].forEach(([ax, az]) => {
      this.setBlock(ax, 1, az, 'alien_metal', false, false);
      this.setBlock(ax, 2, az, 'amethyst_crystal', false, false);
      this.setBlock(ax, 3, az, 'alien_glow', false, false);
    });
    this.addVoxelSign('منطقه فرود سفینه فضایی', 'بازدید از مهمانان کهکشانی', '#581c87', -56, 4.6, 34);

    // Grand Subterranean Cave System near (-18, z = -34..-62): Crystal Cave -> Underground Water -> Lava Chamber
    const clearCavernBox = (x0, x1, y0, y1, z0, z1, wallMat = 'stone', floorMat = 'stone') => {
      for (let bx = x0 - 1; bx <= x1 + 1; bx += 1) {
        for (let by = y0 - 1; by <= y1 + 1; by += 1) {
          for (let bz = z0 - 1; bz <= z1 + 1; bz += 1) {
            const isShell = bx < x0 || bx > x1 || by < y0 || by > y1 || bz < z0 || bz > z1;
            const k = this.key(bx, by, bz);
            if (isShell) {
              if (by <= 0 && !this.blocks.has(k)) {
                this.setBlock(bx, by, bz, by === y0 - 1 ? floorMat : wallMat, false, false);
              }
            } else {
              this.blocks.delete(k);
              this.dugCells.add(k);
            }
          }
        }
      }
    };

    // 1) Descending Stone Staircase Entrance from (-18, 0, -34) to (-18, -7, -40)
    for (let step = 0; step <= 7; step += 1) {
      const sy = -step;
      const sz = -34 - step;
      for (let dx = -2; dx <= 2; dx += 1) {
        for (let hy = 0; hy <= 3; hy += 1) {
          const ay = sy + hy;
          const k = this.key(-18 + dx, ay, sz);
          if (dx === -2 || dx === 2 || (hy === 3 && ay <= 0)) {
            if (ay <= 0) this.setBlock(-18 + dx, ay, sz, 'stone', false, false);
          } else {
            this.blocks.delete(k);
            this.dugCells.add(k);
          }
        }
        this.setBlock(-18 + dx, sy - 1, sz, 'stone', false, false);
      }
    }

    // 2) Crystal & Underground Water Grotto (x = -23..-13, y = -8..-4, z = -49..-40)
    clearCavernBox(-23, -13, -8, -4, -49, -40, 'stone', 'cobble_moss');
    for (let wx = -22; wx <= -14; wx += 1) {
      for (let wz = -48; wz <= -44; wz += 1) {
        this.setBlock(wx, -8, wz, 'underground_water', false, false);
      }
    }
    this.setBlock(-21, -8, -46, 'sea_lantern', false, false);
    this.setBlock(-15, -8, -46, 'sea_lantern', false, false);
    this.setBlock(-22, -7, -41, 'glow_mushroom', false, false);
    this.setBlock(-14, -7, -41, 'glow_mushroom', false, false);
    this.setBlock(-23, -6, -45, 'amethyst_crystal', false, false);
    this.setBlock(-13, -6, -45, 'amethyst_crystal', false, false);

    // 3) Deep Connector Stairs from Water Grotto (-18, -7, -49) down to Lava Chamber (-18, -12, -53)
    for (let step = 0; step <= 4; step += 1) {
      const sy = -8 - step;
      const sz = -49 - step;
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let hy = 0; hy <= 3; hy += 1) {
          const k = this.key(-18 + dx, sy + hy, sz);
          this.blocks.delete(k);
          this.dugCells.add(k);
        }
        this.setBlock(-18 + dx, sy - 1, sz, 'obsidian_stone', false, false);
      }
    }

    // 4) Volcanic Molten Lava Cavern (x = -24..-12, y = -14..-9, z = -63..-53)
    clearCavernBox(-24, -12, -14, -9, -63, -53, 'magma_rock', 'obsidian_stone');
    for (let lx = -23; lx <= -13; lx += 1) {
      for (let lz = -62; lz <= -56; lz += 1) {
        this.setBlock(lx, -14, lz, 'lava', false, false);
        this.setBlock(lx, -15, lz, 'obsidian_stone', false, false);
      }
    }
    // Walkable Obsidian Walkway over Lava + Gold/Amethyst Veins
    for (let bz = -62; bz <= -54; bz += 1) {
      for (let bx = -19; bx <= -17; bx += 1) {
        this.setBlock(bx, -13, bz, 'obsidian_stone', false, false);
      }
    }
    this.setBlock(-23, -12, -55, 'gold_block', false, false);
    this.setBlock(-13, -12, -55, 'emerald_block', false, false);
    this.setBlock(-20, -12, -54, 'lantern', false, false);
    this.setBlock(-16, -12, -54, 'lantern', false, false);

    this.setBlock(-20, 1, -33, 'lantern', false, false);
    this.setBlock(-16, 1, -33, 'lantern', false, false);
    this.addVoxelSign('ورودی غار و معدن زیرزمینی', 'دریاچه زیرزمینی و غار مواد مذاب', '#4338ca', -18, 4.2, -32.5);

    // Korean Hanok Schoolhouse (North-center: x = -7..7, z = -23..-13)
    this.buildVoxelHanok(0, 1, -18, 13, 9, 4, true, true);
    this.addVoxelSign('دبیرستان هانوک ساکورا', 'جنگل کره جنوبی', '#7c3f23', 0, 5.2, -13.2);

    // Starter Cozy Forest Cabin (Southwest: x = -23, z = 15)
    this.buildVoxelHanok(-23, 1, 15, 7, 7, 3, false, true);
    this.addVoxelSign('کلبه جنگلی مین‌جی و جون‌هو', 'قابل تخریب و بازسازی', '#be185d', -23, 4.4, 18.8);

    // Seoul Forest Brick Cafe (Southeast: x = 20, z = 14)
    this.buildVoxelCafe(20, 1, 14);
    this.addVoxelSign('کافه آجری سئول', 'خرید بوبا و هدیه (E)', '#b91c1c', 20, 4.8, 18.2);

    // Korean Mountain Temple Iljumun Gate (Northwest: x = -24, z = -22)
    this.buildKoreanGate(-24, 1, -22);

    // Yakuza Forest Fortress (Northeast: x = 28, z = -22)
    this.buildYakuzaFortress(28, 1, -22);
    this.addVoxelSign('پایگاه یاکوزا موموگومی', 'دیوارها را بشکنید!', '#18181b', 28, 4.5, -17.3);

    // Starter courtyard lamps
    [[-4, 10], [4, 10], [-4, -6], [4, -6]].forEach(([lx, lz]) => {
      this.setBlock(lx, 1, lz, 'stone', false, false);
      this.setBlock(lx, 2, lz, 'hanok_wood', false, false);
      this.setBlock(lx, 3, lz, 'lantern', false, false);
    });
  }

  addVoxelSign(title, sub, bg, x, y, z) {
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 1.15, 0.18),
      new THREE.MeshStandardMaterial({
        map: createSignTexture(title, sub, bg),
        roughness: 0.45,
      }),
    );
    sign.position.set(x, y, z);
    this.scene.add(sign);
  }

  buildVoxelHanok(cx, baseY, cz, width, depth, wallH, isSchool, registerAnchor = true, recordDelta = false) {
    const hw = Math.floor(width / 2);
    const hd = Math.floor(depth / 2);

    for (let x = cx - hw - 1; x <= cx + hw + 1; x += 1) {
      for (let z = cz - hd - 1; z <= cz + hd + 1; z += 1) {
        this.setBlock(x, baseY - 1, z, 'stone', false, recordDelta);
      }
    }

    for (let y = baseY; y < baseY + wallH; y += 1) {
      for (let x = cx - hw; x <= cx + hw; x += 1) {
        for (let z = cz - hd; z <= cz + hd; z += 1) {
          const onX = x === cx - hw || x === cx + hw;
          const onZ = z === cz - hd || z === cz + hd;
          if (!onX && !onZ) continue;
          const isDoorCol = isSchool ? x === cx || x === cx + 1 : x === cx;
          if (z === cz + hd && isDoorCol && y < baseY + 2) continue;
          const isMidY = y === baseY + 1;
          const isWinPos = (Math.abs(x - cx) === 3 || Math.abs(z - cz) === 2) && isMidY;
          this.setBlock(x, y, z, isWinPos ? 'glass' : 'hanok_wood', false, recordDelta);
        }
      }
    }

    if (registerAnchor) {
      if (isSchool) {
        this.initialDoorAnchors.push(
          { ix: cx, iy: baseY, iz: cz + hd, yaw: 0, style: 'glass_modern', mirror: false },
          { ix: cx + 1, iy: baseY, iz: cz + hd, yaw: 0, style: 'glass_modern', mirror: true },
        );
      } else {
        this.initialDoorAnchors.push({
          ix: cx,
          iy: baseY,
          iz: cz + hd,
          yaw: 0,
          style: 'hanok_sliding',
          mirror: false,
        });
      }
    }

    this.setBlock(cx - 2, baseY + 2, cz + hd + 1, 'lantern', false, recordDelta);
    this.setBlock(cx + 2, baseY + 2, cz + hd + 1, 'lantern', false, recordDelta);

    const roofBaseY = baseY + wallH;
    for (let tier = 0; tier < (isSchool ? 3 : 2); tier += 1) {
      const ew = hw + 1 - tier * 2;
      const ed = hd + 1 - tier;
      if (ew < 1 || ed < 1) break;
      for (let x = cx - ew; x <= cx + ew; x += 1) {
        for (let z = cz - ed; z <= cz + ed; z += 1) {
          this.setBlock(x, roofBaseY + tier, z, 'hanok_roof', false, recordDelta);
        }
      }
    }
  }

  buildVoxelCafe(cx, baseY, cz) {
    const hw = 4;
    const hd = 3;
    for (let x = cx - hw; x <= cx + hw; x += 1) {
      for (let z = cz - hd; z <= cz + hd; z += 1) {
        this.setBlock(x, baseY - 1, z, 'stone', false, false);
      }
    }
    for (let y = baseY; y < baseY + 3; y += 1) {
      for (let x = cx - hw; x <= cx + hw; x += 1) {
        for (let z = cz - hd; z <= cz + hd; z += 1) {
          const onEdge = x === cx - hw || x === cx + hw || z === cz - hd || z === cz + hd;
          if (!onEdge) continue;
          if (z === cz + hd && x === cx && y < baseY + 2) continue;
          const isGlass = z === cz + hd && y === baseY + 1 && Math.abs(x - cx) >= 2;
          this.setBlock(x, y, z, isGlass ? 'glass' : 'brick', false, false);
        }
      }
    }
    this.initialDoorAnchors.push({
      ix: cx,
      iy: baseY,
      iz: cz + hd,
      yaw: 0,
      style: 'glass_modern',
      mirror: false,
    });
    for (let x = cx - hw - 1; x <= cx + hw + 1; x += 1) {
      for (let z = cz - hd - 1; z <= cz + hd + 1; z += 1) {
        this.setBlock(x, baseY + 3, z, 'hanok_roof', false, false);
      }
    }
    this.setBlock(cx - 2, baseY + 2, cz + hd + 1, 'lantern', false, false);
    this.setBlock(cx + 2, baseY + 2, cz + hd + 1, 'lantern', false, false);
  }

  buildKoreanGate(cx, baseY, cz) {
    for (let y = baseY; y < baseY + 4; y += 1) {
      this.setBlock(cx - 2, y, cz, 'brick', false, false);
      this.setBlock(cx + 2, y, cz, 'brick', false, false);
    }
    for (let x = cx - 4; x <= cx + 4; x += 1) {
      this.setBlock(x, baseY + 4, cz, 'hanok_roof', false, false);
      if (Math.abs(x - cx) <= 3) {
        this.setBlock(x, baseY + 5, cz, 'hanok_roof', false, false);
      }
    }
    this.setBlock(cx - 2, baseY + 3, cz + 1, 'lantern', false, false);
    this.setBlock(cx + 2, baseY + 3, cz + 1, 'lantern', false, false);
  }

  buildYakuzaFortress(cx, baseY, cz) {
    const hw = 4;
    const hd = 4;
    for (let y = baseY; y < baseY + 3; y += 1) {
      for (let x = cx - hw; x <= cx + hw; x += 1) {
        for (let z = cz - hd; z <= cz + hd; z += 1) {
          const onEdge = x === cx - hw || x === cx + hw || z === cz - hd || z === cz + hd;
          if (!onEdge) continue;
          if (z === cz + hd && x === cx && y < baseY + 2) continue;
          this.setBlock(x, y, z, y === baseY ? 'stone' : 'hanok_roof', false, false);
        }
      }
    }
    this.initialDoorAnchors.push({
      ix: cx,
      iy: baseY,
      iz: cz + hd,
      yaw: 0,
      style: 'korean_wood',
      mirror: false,
    });
    this.setBlock(cx - 2, baseY + 2, cz + hd + 1, 'lantern', false, false);
    this.setBlock(cx + 2, baseY + 2, cz + hd + 1, 'lantern', false, false);
  }

  buildVoxelTree(tx, baseY, tz, leafType, trunkHeight, recordDelta = false) {
    for (let y = 0; y < trunkHeight; y += 1) {
      this.setBlock(tx, baseY + y, tz, 'wood_log', false, recordDelta);
    }
    const topY = baseY + trunkHeight;
    for (let dy = -1; dy <= 2; dy += 1) {
      const r = dy === 2 ? 1 : 2;
      for (let dx = -r; dx <= r; dx += 1) {
        for (let dz = -r; dz <= r; dz += 1) {
          if (Math.abs(dx) === r && Math.abs(dz) === r && dy >= 1) continue;
          if (dx === 0 && dz === 0 && dy < 1) continue;
          this.setBlock(tx + dx, topY + dy, tz + dz, leafType, false, recordDelta);
        }
      }
    }
  }

  spawnHanokHouseBlueprint(cx, baseY, cz) {
    this.beginEdit();
    this.buildVoxelHanok(cx, baseY, cz, 7, 7, 3, false, false, true);
    this.setBlock(cx - 2, baseY, cz - 2, 'bookshelf');
    this.setBlock(cx + 2, baseY, cz - 2, 'bookshelf');
    this.setBlock(cx, baseY, cz - 2, 'lantern');
    this.commitEdit();
    this.flushBatches();
    return [{ ix: cx, iy: baseY, iz: cz + 3, yaw: 0, style: 'hanok_sliding', mirror: false }];
  }

  spawnTwoStoryVillaBlueprint(cx, baseY, cz) {
    this.beginEdit();
    const hw = 4;
    const hd = 4;
    for (let x = cx - hw - 1; x <= cx + hw + 1; x += 1) {
      for (let z = cz - hd - 1; z <= cz + hd + 1; z += 1) {
        this.setBlock(x, baseY - 1, z, 'cobble_moss');
      }
    }
    for (let y = baseY; y < baseY + 3; y += 1) {
      for (let x = cx - hw; x <= cx + hw; x += 1) {
        for (let z = cz - hd; z <= cz + hd; z += 1) {
          const edge = x === cx - hw || x === cx + hw || z === cz - hd || z === cz + hd;
          if (!edge) continue;
          if (z === cz + hd && x === cx && y < baseY + 2) continue;
          const isWin = y === baseY + 1 && (Math.abs(x - cx) === 2 || Math.abs(z - cz) === 2);
          this.setBlock(x, y, z, isWin ? 'glass' : 'white_plaster');
        }
      }
    }
    for (let x = cx - hw; x <= cx + hw; x += 1) {
      for (let z = cz - hd; z <= cz + hd + 2; z += 1) {
        this.setBlock(x, baseY + 3, z, 'hanok_wood');
      }
    }
    for (let x = cx - hw; x <= cx + hw; x += 1) {
      this.setBlock(x, baseY + 4, cz + hd + 2, 'fence_post');
    }
    for (let y = baseY + 4; y < baseY + 7; y += 1) {
      for (let x = cx - hw; x <= cx + hw; x += 1) {
        for (let z = cz - hd; z <= cz + hd; z += 1) {
          const edge = x === cx - hw || x === cx + hw || z === cz - hd || z === cz + hd;
          if (!edge) continue;
          if (z === cz + hd && x === cx && y < baseY + 6) continue;
          const isWin = y === baseY + 5 && (Math.abs(x - cx) === 2 || Math.abs(z - cz) === 2);
          this.setBlock(x, y, z, isWin ? 'glass' : 'hanok_wood');
        }
      }
    }
    for (let s = 0; s < 4; s += 1) {
      this.setBlock(cx + hw + 1, baseY + s, cz + s, 'hanok_wood');
    }
    for (let tier = 0; tier < 2; tier += 1) {
      const rw = hw + 1 - tier;
      const rd = hd + 1 - tier;
      for (let x = cx - rw; x <= cx + rw; x += 1) {
        for (let z = cz - rd; z <= cz + rd; z += 1) {
          this.setBlock(x, baseY + 7 + tier, z, 'hanok_roof');
        }
      }
    }
    this.setBlock(cx, baseY + 9, cz, 'gold_block');
    this.setBlock(cx - 2, baseY + 4, cz + hd + 2, 'lantern');
    this.setBlock(cx + 2, baseY + 4, cz + hd + 2, 'lantern');
    this.commitEdit();
    this.flushBatches();
    return [
      { ix: cx, iy: baseY, iz: cz + hd, yaw: 0, style: 'korean_wood', mirror: false },
      { ix: cx, iy: baseY + 4, iz: cz + hd, yaw: 0, style: 'glass_modern', mirror: false },
    ];
  }

  spawnWatchtowerBlueprint(cx, baseY, cz) {
    this.beginEdit();
    for (let y = baseY; y < baseY + 8; y += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        for (let dz = -2; dz <= 2; dz += 1) {
          const onCorner = Math.abs(dx) === 2 && Math.abs(dz) === 2;
          const onWall = Math.abs(dx) === 2 || Math.abs(dz) === 2;
          if (!onWall) continue;
          if (dz === 2 && dx === 0 && y < baseY + 2) continue;
          if (y === baseY + 7) {
            this.setBlock(cx + dx, y, cz + dz, 'fence_post');
          } else {
            this.setBlock(cx + dx, y, cz + dz, onCorner ? 'stone' : 'hanok_wood');
          }
        }
      }
    }
    for (let dx = -2; dx <= 2; dx += 1) {
      for (let dz = -2; dz <= 2; dz += 1) {
        this.setBlock(cx + dx, baseY + 6, cz + dz, 'hanok_wood');
        this.setBlock(cx + dx, baseY + 9, cz + dz, 'hanok_roof');
      }
    }
    this.setBlock(cx, baseY + 10, cz, 'lantern');
    this.commitEdit();
    this.flushBatches();
    return [{ ix: cx, iy: baseY, iz: cz + 2, yaw: 0, style: 'korean_wood', mirror: false }];
  }

  spawnPavilionBlueprint(cx, baseY, cz) {
    this.beginEdit();
    for (let dx = -3; dx <= 3; dx += 1) {
      for (let dz = -3; dz <= 3; dz += 1) {
        this.setBlock(cx + dx, baseY, cz + dz, 'hanok_wood');
      }
    }
    [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([px, pz]) => {
      for (let y = 1; y <= 3; y += 1) {
        this.setBlock(cx + px, baseY + y, cz + pz, 'brick');
      }
    });
    for (let dx = -4; dx <= 4; dx += 1) {
      for (let dz = -4; dz <= 4; dz += 1) {
        this.setBlock(cx + dx, baseY + 4, cz + dz, 'hanok_roof');
      }
    }
    for (let dx = -2; dx <= 2; dx += 1) {
      for (let dz = -2; dz <= 2; dz += 1) {
        this.setBlock(cx + dx, baseY + 5, cz + dz, 'sakura_leaves');
      }
    }
    this.setBlock(cx, baseY + 3, cz, 'lantern');
    this.commitEdit();
    this.flushBatches();
  }

  spawnBridgeBlueprint(cx, baseY, cz, yaw) {
    this.beginEdit();
    const fwdX = Math.abs(Math.sin(yaw)) >= Math.abs(Math.cos(yaw)) ? Math.sign(Math.sin(yaw)) : 0;
    const fwdZ = fwdX === 0 ? Math.sign(Math.cos(yaw)) : 0;
    const sideX = -fwdZ;
    const sideZ = fwdX;
    for (let i = -4; i <= 4; i += 1) {
      const archY = baseY + (Math.abs(i) <= 2 ? 1 : 0);
      for (let w = -1; w <= 1; w += 1) {
        this.setBlock(cx + fwdX * i + sideX * w, archY, cz + fwdZ * i + sideZ * w, 'hanok_wood');
      }
      this.setBlock(cx + fwdX * i + sideX * 2, archY + 1, cz + fwdZ * i + sideZ * 2, i % 4 === 0 ? 'lantern' : 'fence_post');
      this.setBlock(cx + fwdX * i - sideX * 2, archY + 1, cz + fwdZ * i - sideZ * 2, i % 4 === 0 ? 'lantern' : 'fence_post');
    }
    this.commitEdit();
    this.flushBatches();
  }

  spawnGardenPoolBlueprint(cx, baseY, cz) {
    this.beginEdit();
    for (let dx = -3; dx <= 3; dx += 1) {
      for (let dz = -3; dz <= 3; dz += 1) {
        const edge = Math.abs(dx) === 3 || Math.abs(dz) === 3;
        if (edge) {
          this.setBlock(cx + dx, baseY, cz + dz, 'cobble_moss');
          if ((dx + dz) % 2 === 0) {
            this.setBlock(cx + dx, baseY + 1, cz + dz, 'bamboo');
          }
        } else {
          this.setBlock(cx + dx, baseY - 1, cz + dz, 'water');
          this.removeBlock(cx + dx, baseY, cz + dz);
        }
      }
    }
    this.setBlock(cx - 3, baseY + 2, cz - 3, 'sakura_leaves');
    this.setBlock(cx + 3, baseY + 2, cz + 3, 'sakura_leaves');
    this.setBlock(cx, baseY + 1, cz, 'lantern');
    this.commitEdit();
    this.flushBatches();
  }

  spawnBlueprint(id, cx, baseY, cz, yaw = 0) {
    if (id === 'hanok_house') {
      return this.spawnHanokHouseBlueprint(cx, baseY, cz);
    } else if (id === 'seoul_villa') {
      return this.spawnTwoStoryVillaBlueprint(cx, baseY, cz);
    } else if (id === 'watchtower') {
      return this.spawnWatchtowerBlueprint(cx, baseY, cz);
    } else if (id === 'pavilion') {
      this.spawnPavilionBlueprint(cx, baseY, cz);
    } else if (id === 'bridge') {
      this.spawnBridgeBlueprint(cx, baseY, cz, yaw);
    } else if (id === 'garden_pool') {
      this.spawnGardenPoolBlueprint(cx, baseY, cz);
    }
    return [];
  }

  applyBuildTool(toolId, mode, origin, blockId, playerYaw, playerPos) {
    const { ix, iy, iz } = origin;
    this.beginEdit();
    const changes = [];

    const sinY = Math.sin(playerYaw);
    const cosY = Math.cos(playerYaw);
    const fwdX = Math.abs(sinY) >= Math.abs(cosY) ? Math.sign(sinY) || 1 : 0;
    const fwdZ = fwdX === 0 ? Math.sign(cosY) || 1 : 0;
    const rightX = -fwdZ;
    const rightZ = fwdX;

    const isInsidePlayer = (bx, by, bz) => {
      if (!playerPos || PLANT_IDS.has(blockId)) return false;
      const px = Math.round(playerPos.x);
      const pz = Math.round(playerPos.z);
      const py = Math.floor(playerPos.y);
      return bx === px && bz === pz && (by === py || by === py + 1);
    };

    const tryOp = (bx, by, bz) => {
      if (mode === 'break') {
        if (this.removeBlock(bx, by, bz)) changes.push({ x: bx, y: by, z: bz });
      } else if (!isInsidePlayer(bx, by, bz)) {
        if (this.setBlock(bx, by, bz, blockId)) changes.push({ x: bx, y: by, z: bz });
      }
    };

    if (toolId === 'tunnel') {
      for (let dy = 0; dy < 2; dy += 1) {
        for (let s = 0; s <= 1; s += 1) {
          for (let f = 0; f <= 1; f += 1) {
            tryOp(ix + rightX * s + fwdX * f, iy + dy, iz + rightZ * s + fwdZ * f);
          }
        }
      }
    } else if (toolId === 'wall3') {
      const startY = mode === 'break' ? Math.max(this.minY + 1, iy - 1) : iy;
      for (let dy = 0; dy < 3; dy += 1) {
        for (let s = -1; s <= 1; s += 1) {
          tryOp(ix + rightX * s, startY + dy, iz + rightZ * s);
        }
      }
    } else if (toolId === 'floor3') {
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dz = -1; dz <= 1; dz += 1) {
          tryOp(ix + dx, iy, iz + dz);
        }
      }
    } else if (toolId === 'pillar4') {
      for (let dy = 0; dy < 4; dy += 1) {
        tryOp(ix, iy + dy, iz);
      }
    } else if (toolId === 'stairs4') {
      for (let step = 0; step < 4; step += 1) {
        tryOp(ix + fwdX * step, iy + step, iz + fwdZ * step);
      }
    } else if (toolId === 'doorway') {
      if (mode === 'break') {
        tryOp(ix, Math.max(this.minY + 1, iy), iz);
        tryOp(ix, Math.max(this.minY + 1, iy) + 1, iz);
      } else {
        tryOp(ix, iy, iz);
        tryOp(ix, iy + 1, iz);
      }
    } else {
      tryOp(ix, iy, iz);
    }

    this.commitEdit();
    this.flushBatches();
    return changes;
  }

  getTopSolidY(x, z) {
    const ix = Math.round(x);
    const iz = Math.round(z);
    for (let y = this.maxY; y >= this.minY; y -= 1) {
      if (this.isSolid(ix, y, iz)) {
        return y;
      }
    }
    return this.minY;
  }

  // Pull camera inside when a solid underground or indoor wall sits between focus point and camera
  getCameraClipDistance(origin, target) {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    const fullDist = Math.hypot(dx, dy, dz);
    if (fullDist < 0.2) return fullDist;
    const step = 0.2;
    for (let d = 0.45; d < fullDist; d += step) {
      const t = d / fullDist;
      const ix = Math.round(origin.x + dx * t);
      const iy = Math.floor(origin.y + dy * t);
      const iz = Math.round(origin.z + dz * t);
      if (this.isSolid(ix, iy, iz)) {
        return Math.max(0.45, d - 0.35);
      }
    }
    return fullDist;
  }

  raycast(origin, dir, maxDist = 8.5) {
    const stepSize = 0.11;
    let prevX = Math.round(origin.x);
    let prevY = Math.floor(origin.y);
    let prevZ = Math.round(origin.z);

    for (let d = 0.55; d <= maxDist; d += stepSize) {
      const sx = origin.x + dir.x * d;
      const sy = origin.y + dir.y * d;
      const sz = origin.z + dir.z * d;
      const ix = Math.round(sx);
      const iy = Math.floor(sy);
      const iz = Math.round(sz);

      const doorId = this.doorCellMap.get(this.key(ix, iy, iz));
      if (doorId) {
        const nx = prevX - ix;
        const ny = prevY - iy;
        const nz = prevZ - iz;
        const sumN = Math.abs(nx) + Math.abs(ny) + Math.abs(nz);
        return {
          ix,
          iy,
          iz,
          type: 'wooden_door',
          isDoor: true,
          doorId,
          placeX: sumN === 1 ? prevX : ix,
          placeY: sumN === 1 ? prevY : iy + 1,
          placeZ: sumN === 1 ? prevZ : iz,
        };
      }

      const type = this.getBlock(ix, iy, iz);
      if (type && type !== 'water' && type !== 'underground_water' && type !== 'lava') {
        const nx = prevX - ix;
        const ny = prevY - iy;
        const nz = prevZ - iz;
        const sumN = Math.abs(nx) + Math.abs(ny) + Math.abs(nz);
        return {
          ix,
          iy,
          iz,
          type,
          isDoor: false,
          placeX: sumN === 1 ? prevX : ix,
          placeY: sumN === 1 ? prevY : iy + 1,
          placeZ: sumN === 1 ? prevZ : iz,
        };
      }
      prevX = ix;
      prevY = iy;
      prevZ = iz;
    }
    return null;
  }

  resolveEntityMovement(x, y, z, vx, vz, dt, radius = 0.36, height = 1.7) {
    let nextX = THREE.MathUtils.clamp(x + vx * dt, -this.worldRadius + 1, this.worldRadius - 1);
    let nextZ = THREE.MathUtils.clamp(z + vz * dt, -this.worldRadius + 1, this.worldRadius - 1);

    const checkOverlap = (cx, cy, cz) => {
      const minBx = Math.round(cx - radius);
      const maxBx = Math.round(cx + radius);
      const minBz = Math.round(cz - radius);
      const maxBz = Math.round(cz + radius);
      const minBy = Math.floor(cy + 0.18);
      const maxBy = Math.floor(cy + height - 0.08);

      for (let bx = minBx; bx <= maxBx; bx += 1) {
        for (let bz = minBz; bz <= maxBz; bz += 1) {
          for (let by = minBy; by <= maxBy; by += 1) {
            if (this.isSolid(bx, by, bz)) {
              return true;
            }
          }
        }
      }
      return false;
    };

    if (checkOverlap(nextX, y, z)) {
      if (!checkOverlap(nextX, y + 1.02, z)) {
        y += 1.02;
      } else {
        nextX = x;
      }
    }

    if (checkOverlap(nextX, y, nextZ)) {
      if (!checkOverlap(nextX, y + 1.02, nextZ)) {
        y += 1.02;
      } else {
        nextZ = z;
      }
    }

    const minBx = Math.round(nextX - radius * 0.8);
    const maxBx = Math.round(nextX + radius * 0.8);
    const minBz = Math.round(nextZ - radius * 0.8);
    const maxBz = Math.round(nextZ + radius * 0.8);
    const footBlockY = Math.floor(y + 0.05);

    let floorY = this.minY + 1;
    for (let bx = minBx; bx <= maxBx; bx += 1) {
      for (let bz = minBz; bz <= maxBz; bz += 1) {
        for (let by = footBlockY; by >= this.minY; by -= 1) {
          if (this.isSolid(bx, by, bz)) {
            floorY = Math.max(floorY, by + 1);
            break;
          }
        }
      }
    }

    return { x: nextX, y, z: nextZ, floorY };
  }

  exportWorldState() {
    return {
      worldRadius: this.worldRadius,
      dugCells: Array.from(this.dugCells),
      deltas: Array.from(this.deltas.entries()),
    };
  }

  importWorldState(saved) {
    if (!saved) return;
    if (saved.worldRadius && saved.worldRadius > this.worldRadius) {
      this.expandWorldBy(saved.worldRadius - this.worldRadius);
    }
    if (Array.isArray(saved.dugCells)) {
      saved.dugCells.forEach((k) => {
        this.dugCells.add(k);
        const cur = this.blocks.get(k);
        if (cur) {
          this.blocks.delete(k);
          this.dirtyTypes.add(cur);
        }
      });
    }
    if (Array.isArray(saved.deltas)) {
      saved.deltas.forEach(([k, val]) => {
        this.deltas.set(k, val);
        const cur = this.blocks.get(k);
        if (cur) this.dirtyTypes.add(cur);
        if (val === null) {
          this.blocks.delete(k);
          this.dugCells.add(k);
        } else if (this.batches[val]) {
          this.blocks.set(k, val);
          this.dugCells.delete(k);
          this.dirtyTypes.add(val);
        }
      });
    }
    // Re-reveal subterranean neighbor walls around dug cells
    this.dugCells.forEach((k) => {
      const [x, y, z] = k.split(',').map(Number);
      if (y <= 1) this.revealSubterraneanAround(x, y, z);
    });
    this.flushBatches();
  }
}
