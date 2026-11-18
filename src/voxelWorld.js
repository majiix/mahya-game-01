import * as THREE from 'three';
import { createSignTexture, createVoxelTextures } from './sakuraTextures.js';

export const HOTBAR_BLOCKS = [
  { id: 'hanok_wood', name: 'چوب هانوک', color: '#a3683b' },
  { id: 'white_plaster', name: 'دیوار سفید', color: '#f3ede4' },
  { id: 'stone', name: 'سنگ کره‌ای', color: '#7c8594' },
  { id: 'brick', name: 'آجر سئول', color: '#c95649' },
  { id: 'hanok_roof', name: 'سفال گیوا', color: '#2f3847' },
  { id: 'glass', name: 'شیشه', color: '#7dd3fc' },
  { id: 'wooden_door', name: 'در چوبی', color: '#8c522b', isDoor: true, doorStyle: 'korean_wood' },
  { id: 'bookshelf', name: 'قفسه کتاب', color: '#945b31' },
  { id: 'bamboo', name: 'بامبو', color: '#52b748' },
  { id: 'fence_post', name: 'نرده چوبی', color: '#b37544' },
  { id: 'lantern', name: 'فانوس', color: '#fde047' },
  { id: 'sakura_leaves', name: 'شکوفه', color: '#ff9ec4' },
];

export const EXTRA_BLOCKS = [
  { id: 'hanok_door', name: 'در کشویی هانوک', color: '#f5ebd6', isDoor: true, doorStyle: 'hanok_sliding' },
  { id: 'glass_door', name: 'در شیشه‌ای کافه', color: '#38bdf8', isDoor: true, doorStyle: 'glass_modern' },
  { id: 'gold_block', name: 'بلوک طلایی قصر', color: '#facc15' },
  { id: 'pink_wool', name: 'پشم صورتی', color: '#f472b6' },
  { id: 'cobble_moss', name: 'سنگ خزه‌دار', color: '#5ea83c' },
  { id: 'grass', name: 'چمن جنگل', color: '#69b844' },
];

export const ALL_BLOCK_NAMES = {
  grass: 'چمن جنگل',
  dirt: 'خاک جنگل',
  stone: 'سنگ کره‌ای',
  cobble_moss: 'سنگ خزه‌دار',
  hanok_wood: 'چوب هانوک',
  white_plaster: 'دیوار سفید هانوک',
  wood_log: 'تنه درخت',
  brick: 'آجر سئول',
  hanok_roof: 'سفال سقف گیوا',
  pine_leaves: 'برگ کاج',
  sakura_leaves: 'شکوفه ساکورا',
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
  water: 'آب رودخانه',
};

export const BUILD_TOOLS = [
  { id: 'single', name: 'تک‌بلوک', desc: 'گذاشتن یا کندن ۱ بلوک' },
  { id: 'wall3', name: 'دیوار ۳×۳', desc: 'ساخت یا تخریب دیوار ۳ در ۳' },
  { id: 'floor3', name: 'کف و سقف ۳×۳', desc: 'ساخت یا کندن صفحه ۳ در ۳' },
  { id: 'pillar4', name: 'ستون ۱×۴', desc: 'ساخت ستون ۴تایی یا بریدن کامل تنه' },
  { id: 'stairs4', name: 'پله‌ساز', desc: 'ساخت ۴ پله بالارونده' },
  { id: 'doorway', name: 'دربازکن / نصب در', desc: 'باز کردن دهانه ۱×۲ در دیوار یا نصب در چوبی' },
];

const MAX_INSTANCES_PER_TYPE = 9500;
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
    this.worldRadius = 46;

    this.textures = createVoxelTextures();
    this.unitGeo = new THREE.BoxGeometry(1, 1, 1);

    this.initMaterialsAndBatches();
    this.generateKoreanForestWorld();
    this.flushBatches();
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
        opacity: 0.78,
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
    };

    Object.entries(materials).forEach(([type, mat]) => {
      const inst = new THREE.InstancedMesh(this.unitGeo, mat, MAX_INSTANCES_PER_TYPE);
      inst.count = 0;
      inst.castShadow = type !== 'water' && type !== 'glass';
      inst.receiveShadow = true;
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
    return b !== null && b !== 'water' && b !== 'wooden_door';
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
      if (this.undoStack.length > 30) {
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
      } else {
        this.blocks.set(k, prevType);
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

  setBlock(x, y, z, type, immediate = false) {
    if (y < 0 || y > 32) return false;
    if (Math.abs(x) > this.worldRadius || Math.abs(z) > this.worldRadius) return false;
    const k = this.key(x, y, z);
    const prev = this.blocks.get(k);
    if (prev === type) return false;
    this.recordPrev(k);
    if (prev) this.dirtyTypes.add(prev);
    this.blocks.set(k, type);
    this.dirtyTypes.add(type);
    if (immediate) this.flushBatches();
    return true;
  }

  removeBlock(x, y, z, immediate = false) {
    if (y <= 0) return null; // Keep bedrock ground layer safe
    const k = this.key(x, y, z);
    const prev = this.blocks.get(k);
    if (!prev) return null;
    this.recordPrev(k);
    this.blocks.delete(k);
    this.dirtyTypes.add(prev);
    if (immediate) this.flushBatches();
    return prev;
  }

  flushBatches() {
    if (this.dirtyTypes.size === 0) return;

    const grouped = {};
    this.dirtyTypes.forEach((t) => {
      grouped[t] = [];
    });

    this.blocks.forEach((type, k) => {
      if (!grouped[type]) return;
      const parts = k.split(',');
      grouped[type].push([Number(parts[0]), Number(parts[1]), Number(parts[2])]);
    });

    this.dirtyTypes.forEach((type) => {
      const inst = this.batches[type];
      const list = grouped[type] || [];
      const count = Math.min(list.length, MAX_INSTANCES_PER_TYPE);
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

  generateKoreanForestWorld() {
    const R = this.worldRadius;

    // 1. Forest Terrain (Flat central Korean village clearing + rolling wooded hills)
    for (let x = -R; x <= R; x += 1) {
      for (let z = -R; z <= R; z += 1) {
        const dist = Math.hypot(x, z);
        let h = 0;
        if (dist > 26) {
          const wave = Math.sin(x * 0.16) * Math.cos(z * 0.14) + Math.sin((x + z) * 0.09);
          h = Math.max(0, Math.min(3, Math.floor((dist - 26) * 0.14 + (wave + 1) * 0.75)));
        }

        // Keep road corridors & building plots flat
        const onMainPath = Math.abs(x) <= 3 || Math.abs(z - 4) <= 2;
        const onBuildingPad =
          (Math.abs(x) <= 9 && z >= -24 && z <= -10) ||
          (x >= -29 && x <= -15 && z >= 8 && z <= 22) ||
          (x >= 14 && x <= 26 && z >= 8 && z <= 20) ||
          (x >= 22 && x <= 34 && z >= -28 && z <= -16);
        if (onMainPath || onBuildingPad) {
          h = 0;
        }

        for (let y = 0; y <= h; y += 1) {
          const isTop = y === h;
          let blockType = isTop ? 'grass' : 'dirt';
          if (onMainPath && y === 0) blockType = 'stone';
          this.setBlock(x, y, z, blockType);
        }
      }
    }

    // 2. Forest Creek + Wooden Bridge (West side)
    for (let z = -10; z <= 10; z += 1) {
      const cx = Math.round(-12 + Math.sin(z * 0.35) * 1.5);
      for (let dx = -1; dx <= 1; dx += 1) {
        this.setBlock(cx + dx, 0, z, 'water');
      }
    }
    // Bridge over creek at z = 3..5
    for (let bx = -14; bx <= -10; bx += 1) {
      for (let bz = 3; bz <= 5; bz += 1) {
        this.setBlock(bx, 1, bz, 'hanok_wood');
      }
    }

    // 3. Korean Hanok Schoolhouse (North-center: x = -7..7, z = -23..-13)
    this.buildVoxelHanok(0, 1, -18, 13, 9, 4, true);
    this.addVoxelSign('دبیرستان هانوک ساکورا', 'جنگل کره جنوبی', '#7c3f23', 0, 5.2, -13.2);

    // 4. Starter Cozy Forest Cabin (Southwest: x = -23, z = 15)
    this.buildVoxelHanok(-23, 1, 15, 7, 7, 3, false);
    this.addVoxelSign('کلبه جنگلی مین‌جی و جون‌هو', 'قابل تخریب و بازسازی', '#be185d', -23, 4.4, 18.8);

    // 5. Seoul Forest Brick Cafe (Southeast: x = 20, z = 14)
    this.buildVoxelCafe(20, 1, 14);
    this.addVoxelSign('کافه آجری سئول', 'خرید بوبا و هدیه (E)', '#b91c1c', 20, 4.8, 18.2);

    // 6. Korean Mountain Temple Iljumun Gate (Northwest: x = -24, z = -22)
    this.buildKoreanGate(-24, 1, -22);

    // 7. Yakuza Forest Fortress (Northeast: x = 28, z = -22)
    this.buildYakuzaFortress(28, 1, -22);
    this.addVoxelSign('پایگاه یاکوزا موموگومی', 'دیوارها را بشکنید!', '#18181b', 28, 4.5, -17.3);

    // 8. Dense Korean Pine & Cherry Blossom Forest Trees
    const treePositions = [];
    for (let i = 0; i < 68; i += 1) {
      const ang = i * 2.39996;
      const rad = 14 + ((i * 19) % 30);
      const tx = Math.round(Math.cos(ang) * rad);
      const tz = Math.round(Math.sin(ang) * rad);
      if (Math.abs(tx) < 11 && tz > -25 && tz < 12) continue;
      if (Math.hypot(tx + 23, tz - 15) < 7) continue;
      if (Math.hypot(tx - 20, tz - 14) < 7) continue;
      if (Math.hypot(tx - 28, tz + 22) < 8) continue;
      if (Math.hypot(tx + 24, tz + 22) < 6) continue;
      if (Math.abs(tx) <= 4 || Math.abs(tz - 4) <= 4) continue;
      treePositions.push([tx, tz, i % 3 === 0 ? 'sakura_leaves' : 'pine_leaves']);
    }

    treePositions.forEach(([tx, tz, leafType], idx) => {
      const groundY = this.getTopSolidY(tx, tz) + 1;
      this.buildVoxelTree(tx, groundY, tz, leafType, 4 + (idx % 2));
    });

    // Clear central starter courtyard lamps
    [[-4, 10], [4, 10], [-4, -6], [4, -6]].forEach(([lx, lz]) => {
      this.setBlock(lx, 1, lz, 'stone');
      this.setBlock(lx, 2, lz, 'hanok_wood');
      this.setBlock(lx, 3, lz, 'lantern');
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

  buildVoxelHanok(cx, baseY, cz, width, depth, wallH, isSchool, registerAnchor = true) {
    const hw = Math.floor(width / 2);
    const hd = Math.floor(depth / 2);

    // Stone foundation
    for (let x = cx - hw - 1; x <= cx + hw + 1; x += 1) {
      for (let z = cz - hd - 1; z <= cz + hd + 1; z += 1) {
        this.setBlock(x, baseY - 1, z, 'stone');
      }
    }

    // Walls with door opening on front (+z) and glass windows
    for (let y = baseY; y < baseY + wallH; y += 1) {
      for (let x = cx - hw; x <= cx + hw; x += 1) {
        for (let z = cz - hd; z <= cz + hd; z += 1) {
          const onX = x === cx - hw || x === cx + hw;
          const onZ = z === cz - hd || z === cz + hd;
          if (!onX && !onZ) continue;

          // Front Doorway (2-wide double door for school, 1-wide for cabin/hanok)
          const isDoorCol = isSchool ? x === cx || x === cx + 1 : x === cx;
          if (z === cz + hd && isDoorCol && y < baseY + 2) {
            continue;
          }
          // Windows
          const isMidY = y === baseY + 1;
          const isWinPos = (Math.abs(x - cx) === 3 || Math.abs(z - cz) === 2) && isMidY;
          this.setBlock(x, y, z, isWinPos ? 'glass' : 'hanok_wood');
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

    // Corner pillars + lanterns
    this.setBlock(cx - 2, baseY + 2, cz + hd + 1, 'lantern');
    this.setBlock(cx + 2, baseY + 2, cz + hd + 1, 'lantern');

    // Tiered Korean Giwa Roof
    const roofBaseY = baseY + wallH;
    for (let tier = 0; tier < (isSchool ? 3 : 2); tier += 1) {
      const ew = hw + 1 - tier * 2;
      const ed = hd + 1 - tier;
      if (ew < 1 || ed < 1) break;
      for (let x = cx - ew; x <= cx + ew; x += 1) {
        for (let z = cz - ed; z <= cz + ed; z += 1) {
          this.setBlock(x, roofBaseY + tier, z, 'hanok_roof');
        }
      }
    }
  }

  buildVoxelCafe(cx, baseY, cz) {
    const hw = 4;
    const hd = 3;
    for (let x = cx - hw; x <= cx + hw; x += 1) {
      for (let z = cz - hd; z <= cz + hd; z += 1) {
        this.setBlock(x, baseY - 1, z, 'stone');
      }
    }
    for (let y = baseY; y < baseY + 3; y += 1) {
      for (let x = cx - hw; x <= cx + hw; x += 1) {
        for (let z = cz - hd; z <= cz + hd; z += 1) {
          const onEdge = x === cx - hw || x === cx + hw || z === cz - hd || z === cz + hd;
          if (!onEdge) continue;
          if (z === cz + hd && x === cx && y < baseY + 2) continue;
          const isGlass = z === cz + hd && y === baseY + 1 && Math.abs(x - cx) >= 2;
          this.setBlock(x, y, z, isGlass ? 'glass' : 'brick');
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
        this.setBlock(x, baseY + 3, z, 'hanok_roof');
      }
    }
    this.setBlock(cx - 2, baseY + 2, cz + hd + 1, 'lantern');
    this.setBlock(cx + 2, baseY + 2, cz + hd + 1, 'lantern');
  }

  buildKoreanGate(cx, baseY, cz) {
    for (let y = baseY; y < baseY + 4; y += 1) {
      this.setBlock(cx - 2, y, cz, 'brick');
      this.setBlock(cx + 2, y, cz, 'brick');
    }
    for (let x = cx - 4; x <= cx + 4; x += 1) {
      this.setBlock(x, baseY + 4, cz, 'hanok_roof');
      if (Math.abs(x - cx) <= 3) {
        this.setBlock(x, baseY + 5, cz, 'hanok_roof');
      }
    }
    this.setBlock(cx - 2, baseY + 3, cz + 1, 'lantern');
    this.setBlock(cx + 2, baseY + 3, cz + 1, 'lantern');
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
          this.setBlock(x, y, z, y === baseY ? 'stone' : 'hanok_roof');
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
    this.setBlock(cx - 2, baseY + 2, cz + hd + 1, 'lantern');
    this.setBlock(cx + 2, baseY + 2, cz + hd + 1, 'lantern');
  }

  buildVoxelTree(tx, baseY, tz, leafType, trunkHeight) {
    for (let y = 0; y < trunkHeight; y += 1) {
      this.setBlock(tx, baseY + y, tz, 'wood_log');
    }
    const topY = baseY + trunkHeight;
    for (let dy = -1; dy <= 2; dy += 1) {
      const r = dy === 2 ? 1 : 2;
      for (let dx = -r; dx <= r; dx += 1) {
        for (let dz = -r; dz <= r; dz += 1) {
          if (Math.abs(dx) === r && Math.abs(dz) === r && dy >= 1) continue;
          if (dx === 0 && dz === 0 && dy < 1) continue;
          this.setBlock(tx + dx, topY + dy, tz + dz, leafType);
        }
      }
    }
  }

  spawnHanokHouseBlueprint(cx, baseY, cz) {
    this.beginEdit();
    this.buildVoxelHanok(cx, baseY, cz, 7, 7, 3, false, false);
    // Add cozy books & lantern inside
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
    // Stone base
    for (let x = cx - hw - 1; x <= cx + hw + 1; x += 1) {
      for (let z = cz - hd - 1; z <= cz + hd + 1; z += 1) {
        this.setBlock(x, baseY - 1, z, 'cobble_moss');
      }
    }
    // 1st Floor (white_plaster + brick + glass)
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
    // 2nd Floor Slab & Balcony
    for (let x = cx - hw; x <= cx + hw; x += 1) {
      for (let z = cz - hd; z <= cz + hd + 2; z += 1) {
        this.setBlock(x, baseY + 3, z, 'hanok_wood');
      }
    }
    // Balcony fence
    for (let x = cx - hw; x <= cx + hw; x += 1) {
      this.setBlock(x, baseY + 4, cz + hd + 2, 'fence_post');
    }
    // 2nd Floor Walls
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
    // Exterior Side Stairs up to balcony
    for (let s = 0; s < 4; s += 1) {
      this.setBlock(cx + hw + 1, baseY + s, cz + s, 'hanok_wood');
    }
    // Giwa Roof
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

    // Determine cardinal facing axes relative to player
    const sinY = Math.sin(playerYaw);
    const cosY = Math.cos(playerYaw);
    const fwdX = Math.abs(sinY) >= Math.abs(cosY) ? Math.sign(sinY) || 1 : 0;
    const fwdZ = fwdX === 0 ? Math.sign(cosY) || 1 : 0;
    const rightX = -fwdZ;
    const rightZ = fwdX;

    const isInsidePlayer = (bx, by, bz) => {
      if (!playerPos) return false;
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

    if (toolId === 'wall3') {
      const startY = mode === 'break' ? Math.max(1, iy - 1) : iy;
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
        tryOp(ix, Math.max(1, iy), iz);
        tryOp(ix, Math.max(1, iy) + 1, iz);
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
    for (let y = 24; y >= 0; y -= 1) {
      if (this.isSolid(ix, y, iz)) {
        return y;
      }
    }
    return 0;
  }

  // Exact Voxel DDA Raycast (works for breaking & placing blocks and doors)
  raycast(origin, dir, maxDist = 7.5) {
    const stepSize = 0.12;
    let prevX = Math.round(origin.x);
    let prevY = Math.floor(origin.y);
    let prevZ = Math.round(origin.z);

    for (let d = 0.6; d <= maxDist; d += stepSize) {
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
      if (type && type !== 'water') {
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
      const minBy = Math.floor(cy + 0.15);
      const maxBy = Math.floor(cy + height - 0.1);

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
      // Try auto-step up 1 block if headroom is clear
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

    // Find ground surface directly beneath player's feet footprint
    const minBx = Math.round(nextX - radius * 0.8);
    const maxBx = Math.round(nextX + radius * 0.8);
    const minBz = Math.round(nextZ - radius * 0.8);
    const maxBz = Math.round(nextZ + radius * 0.8);
    const footBlockY = Math.floor(y + 0.05);

    let floorY = 1.0;
    for (let bx = minBx; bx <= maxBx; bx += 1) {
      for (let bz = minBz; bz <= maxBz; bz += 1) {
        for (let by = footBlockY; by >= 0; by -= 1) {
          if (this.isSolid(bx, by, bz)) {
            floorY = Math.max(floorY, by + 1);
            break;
          }
        }
      }
    }

    return { x: nextX, y, z: nextZ, floorY };
  }
}
