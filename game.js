import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ASSET_PORTRAITS,
  FLIGHT_GEARS,
  KCHAT_INITIAL_MESSAGES,
  MISSIONS_LIST,
  NPC_DEFINITIONS,
  OUTFITS,
  PLAYABLE_CHARACTERS,
  PROPS_CATALOG,
  SHOP_ITEMS,
  TELEPORT_LOCATIONS,
  getRelationTierLabel,
  toFaNum,
} from './src/sakuraData.js';
import {
  buildAlienCharacter,
  buildAnimeCharacter,
  buildInteractiveDoor,
  buildPetalSystem,
  buildPropsItem,
  buildVehicle,
} from './src/sakuraBuilders.js';
import { ALL_BLOCK_NAMES, BUILD_TOOLS, EXTRA_BLOCKS, HOTBAR_BLOCKS, VoxelWorld } from './src/voxelWorld.js';
import { sakuraAudio } from './src/sakuraAudio.js';

const SAVE_KEY = 'minecraft_korea_sakura_v2';
const LEGACY_SAVE_KEY = 'minecraft_korea_sakura_v1';

// Pre-allocated scratch math objects
const _camForward = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _camGoal = new THREE.Vector3();
const _lookGoal = new THREE.Vector3();
const _upVec = new THREE.Vector3(0, 1, 0);
const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();

function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

class KoreanForestMinecraftApp {
  constructor() {
    this.mount = document.getElementById('webgl-mount');
    this.isRunning = false;
    this.timeOfDay = 'day';
    this.hotbarCollapsed = false;

    // Game State
    this.state = {
      activeCharId: 'minji',
      coins: 260,
      hp: 100,
      fuel: 100,
      loveScore: 35,
      selectedSlot: 0,
      activeTool: 'single',
      customBlockId: null,
      placedCount: 0,
      brokenCount: 0,
      ownedOutfits: ['sakura_uniform', 'disguise_suit', 'pink_sweater'],
      charOutfits: {
        minji: 'disguise_suit',
        joonho: 'pink_sweater',
        soojin: 'sakura_uniform',
        taehyun: 'casual_hoodie',
        zorp: 'action_ninja',
      },
      charWings: {
        minji: 'jetpack',
        joonho: 'angel',
        soojin: 'angel',
        taehyun: 'bat',
        zorp: 'jetpack',
      },
      inventory: { boba: 1, bouquet: 1 },
      completedMissions: [],
      npcRelations: {},
      album: [
        {
          title: 'خاطره جنگل ساکورا',
          img: ASSET_PORTRAITS.hug_cg,
          date: 'آلبوم داستان',
        },
      ],
      chats: [...KCHAT_INITIAL_MESSAGES],
    };

    NPC_DEFINITIONS.forEach((n) => {
      this.state.npcRelations[n.id] = n.relation;
    });

    // Interactive Controls (multi-touch ready)
    this.keys = new Set();
    this.joyVec = { x: 0, y: 0 };
    this.isFlyHeld = false;
    this.isDescendHeld = false;
    this.camYaw = Math.PI;
    this.camPitch = 0.36;
    this.camDist = 9.2;
    this.isDraggingCam = false;
    this.camDragPointerId = null;
    this.activeMountPointers = new Map();
    this.pinchStartDist = null;
    this.pinchStartCamDist = 9.2;
    this.pointerDownPos = { x: 0, y: 0 };
    this.lastPointer = { x: 0, y: 0 };
    this.pointerNdc = new THREE.Vector2(0, 0);
    this.hasPointer = false;
    this.clickMode = 'break'; // 'break' or 'build'

    // Player & World Entities
    this.playerState = {
      x: 0,
      y: 1,
      z: 7,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: Math.PI,
      grounded: true,
      flying: false,
      hoverMode: false,
      swimming: false,
      kickTimer: 0,
      hugTimer: 0,
      vehicle: null,
    };
    this.playerMesh = null;
    this.npcs = [];
    this.vehicles = [];
    this.doors = [];
    this.doorSeq = 1;
    this.actionTimeline = [];
    this.spawnedProps = [];
    this.debrisParticles = [];
    this.waterfallParticles = [];
    this.activeSocialNpc = null;
    this.nearestTarget = null;
    this.targetVoxel = null;
    this.toastTimer = null;
    this.autoSaveTimer = 0;

    this.interactiveZones = [
      {
        id: 'cafe_shop',
        name: 'کافه آجری سئول',
        actionLabel: 'ورود به کافه و خرید هدیه (E)',
        x: 20,
        z: 19,
        radius: 4.5,
      },
      {
        id: 'cabin_home',
        name: 'کلبه جنگلی مین‌جی و جون‌هو',
        actionLabel: 'استراحت و تغییر لباس در کلبه (E)',
        x: -23,
        z: 19,
        radius: 4.5,
      },
      {
        id: 'temple_gate',
        name: 'دروازه معبد جنگلی',
        actionLabel: 'دعای عشق زیر شکوفه‌های کره (E)',
        x: -24,
        z: -21,
        radius: 4.5,
      },
    ];

    this.initThree();
    this.renderHotbar();
    this.bindUI();
    this.checkSavedState();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      380,
    );
    this.raycaster = new THREE.Raycaster();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    const gl = this.renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '' : '';
    this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);

    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.mount.appendChild(this.renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Lighting
    this.hemiLight = new THREE.HemisphereLight('#d9f2ff', '#4b5e3b', 0.92);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight('#fff5e0', 2.2);
    this.sunLight.position.set(34, 58, 28);
    this.sunLight.castShadow = !this.isSoftwareGl;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 5;
    this.sunLight.shadow.camera.far = 165;
    this.sunLight.shadow.camera.left = -64;
    this.sunLight.shadow.camera.right = 64;
    this.sunLight.shadow.camera.top = 64;
    this.sunLight.shadow.camera.bottom = -64;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Minecraft South Korean Forest World
    this.voxelWorld = new VoxelWorld(this.scene);

    // 3D Target Block Highlight Wireframe
    const hlGeo = new THREE.BoxGeometry(1.03, 1.03, 1.03);
    const hlEdges = new THREE.EdgesGeometry(hlGeo);
    this.highlightBox = new THREE.LineSegments(
      hlEdges,
      new THREE.LineBasicMaterial({ color: '#fde047' }),
    );
    this.highlightBox.visible = false;
    this.scene.add(this.highlightBox);

    // Falling Sakura Petals & Waterfall Mist
    this.petalSys = buildPetalSystem(this.scene);
    this.initWaterfallParticles();

    this.applyTimeOfDay('day');

    // Player, Doors, NPCs & Vehicles
    this.initWorldDoors();
    this.rebuildPlayerMesh();
    this.initNPCs();
    this.initVehicles();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.isFlyHeld = false;
      this.isDescendHeld = false;
      this.joyVec.x = 0;
      this.joyVec.y = 0;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.isRunning) {
        this.saveState(false);
      }
    });

    window.addEventListener('pagehide', () => {
      if (this.isRunning) this.saveState(false);
    });
  }

  initWaterfallParticles() {
    const anchors = this.voxelWorld.waterfallAnchors || [];
    const geo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
    const mat = new THREE.MeshStandardMaterial({
      color: '#e0f2fe',
      emissive: '#7dd3fc',
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.8,
    });
    anchors.forEach((a) => {
      for (let i = 0; i < 28; i += 1) {
        const mesh = new THREE.Mesh(geo, mat);
        const startT = Math.random();
        mesh.position.set(
          a.x + (Math.random() - 0.5) * 1.4,
          THREE.MathUtils.lerp(a.yTop, a.yBot, startT),
          a.z + (Math.random() - 0.5) * 0.9,
        );
        this.scene.add(mesh);
        this.waterfallParticles.push({
          anchor: a,
          mesh,
          vy: -(4 + Math.random() * 5),
          vx: (Math.random() - 0.5) * 0.9,
          vz: 0.4 + Math.random() * 0.8,
        });
      }
    });
  }

  applyTimeOfDay(mode) {
    this.timeOfDay = mode;
    const fogFar = Math.max(135, (this.voxelWorld ? this.voxelWorld.worldRadius : 86) + 52);
    const fogNear = Math.max(46, Math.round(fogFar * 0.36));
    if (mode === 'sunset') {
      this.scene.background = new THREE.Color('#f9a8d4');
      this.scene.fog = new THREE.Fog('#f9a8d4', fogNear, fogFar);
      this.sunLight.color.set('#fb923c');
      this.sunLight.intensity = 1.85;
      this.hemiLight.color.set('#fed7aa');
      this.hemiLight.groundColor.set('#3b2847');
      this.hemiLight.intensity = 0.8;
    } else if (mode === 'night') {
      this.scene.background = new THREE.Color('#0f172a');
      this.scene.fog = new THREE.Fog('#0f172a', Math.round(fogNear * 0.72), Math.round(fogFar * 0.85));
      this.sunLight.color.set('#93c5fd');
      this.sunLight.intensity = 0.78;
      this.hemiLight.color.set('#6366f1');
      this.hemiLight.groundColor.set('#0f172a');
      this.hemiLight.intensity = 0.55;
    } else {
      this.scene.background = new THREE.Color('#a8dcff');
      this.scene.fog = new THREE.Fog('#a8dcff', fogNear, fogFar);
      this.sunLight.color.set('#fff5e0');
      this.sunLight.intensity = 2.2;
      this.hemiLight.color.set('#d9f2ff');
      this.hemiLight.groundColor.set('#4b5e3b');
      this.hemiLight.intensity = 0.92;
    }
  }

  getActiveCharMeta() {
    return PLAYABLE_CHARACTERS.find((c) => c.id === this.state.activeCharId) || PLAYABLE_CHARACTERS[0];
  }

  rebuildPlayerMesh() {
    if (this.playerMesh) {
      this.scene.remove(this.playerMesh);
    }
    const charMeta = this.getActiveCharMeta();
    const outfitId = this.state.charOutfits[charMeta.id] || charMeta.defaultOutfit;
    const outfit = OUTFITS.find((o) => o.id === outfitId) || OUTFITS[0];
    const wing = this.state.charWings[charMeta.id] || charMeta.defaultWing;

    const cfg = {
      hairColor: charMeta.hairColor,
      hairStyle: charMeta.hairStyle,
      skinColor: charMeta.skinColor,
      eyeColor: charMeta.eyeColor,
      topColor: outfit.topColor,
      accentColor: outfit.accentColor,
      bottomColor: outfit.bottomColor,
      skirt: outfit.skirt,
      wing,
    };

    this.playerMesh = charMeta.isAlien ? buildAlienCharacter(cfg) : buildAnimeCharacter(cfg);
    this.playerMesh.position.set(this.playerState.x, this.playerState.y, this.playerState.z);
    this.playerMesh.rotation.y = this.playerState.yaw;
    this.scene.add(this.playerMesh);
    this.updateTopHud();
  }

  initNPCs() {
    NPC_DEFINITIONS.forEach((def, idx) => {
      const mesh = def.isAlien ? buildAlienCharacter(def) : buildAnimeCharacter(def);
      const startY = this.voxelWorld.getTopSolidY(def.x, def.z) + 1;
      mesh.position.set(def.x, startY, def.z);
      this.scene.add(mesh);

      this.npcs.push({
        def,
        mesh,
        x: def.x,
        y: startY,
        z: def.z,
        homeX: def.x,
        homeZ: def.z,
        yaw: (idx * 1.2) % (Math.PI * 2),
        hp: 100,
        faintedTimer: 0,
        following: false,
        hostile: def.hostile,
        wanderTarget: { x: def.x, z: def.z },
        wanderCooldown: 1 + idx * 0.4,
        attackCooldown: 0,
        lineIdx: 0,
      });
    });
  }

  initVehicles() {
    const specs = [
      {
        id: 'veh_sports',
        name: 'خودروی اسپرت واکسلی',
        type: 'sports',
        color: '#fff5f8',
        x: -6,
        z: 10,
        yaw: Math.PI / 2,
        maxSpeed: 18,
      },
      {
        id: 'veh_police',
        name: 'ماشین گشت جنگل',
        type: 'police',
        color: '#f8fafc',
        x: 7,
        z: 9,
        yaw: 0,
        maxSpeed: 19,
      },
      {
        id: 'veh_bike',
        name: 'دوچرخه جنگلی',
        type: 'bike',
        color: '#ff5e99',
        x: -3,
        z: 1,
        yaw: 0.4,
        maxSpeed: 12,
      },
      {
        id: 'veh_heli',
        name: 'هلیکوپتر جنگل ساکورا',
        type: 'heli',
        color: '#f43f5e',
        x: 10,
        z: -6,
        yaw: -0.6,
        maxSpeed: 18,
      },
      {
        id: 'veh_ufo',
        name: 'سفینه فضایی UFO کهکشانی',
        type: 'ufo',
        color: '#94a3b8',
        x: -56,
        z: 42,
        yaw: 0,
        maxSpeed: 24,
      },
    ];

    specs.forEach((sp) => {
      const startY = this.voxelWorld.getTopSolidY(sp.x, sp.z) + 1;
      const mesh = buildVehicle(sp.type, sp.color);
      mesh.position.set(sp.x, startY, sp.z);
      mesh.rotation.y = sp.yaw;
      this.scene.add(mesh);

      this.vehicles.push({
        ...sp,
        y: startY,
        mesh,
        speed: 0,
        vy: 0,
      });
    });
  }

  setHotbarCollapsed(collapsed) {
    this.hotbarCollapsed = Boolean(collapsed);
    const bar = document.getElementById('minecraft-hotbar');
    const lbl = document.getElementById('hotbar-toggle-label');
    if (bar) bar.classList.toggle('collapsed', this.hotbarCollapsed);
    if (lbl) {
      lbl.textContent = this.hotbarCollapsed
        ? 'باز کردن منوی ابزارها و بلوک‌ها ▴'
        : 'بستن منوی ابزارها و بلوک‌ها ▾';
    }
  }

  updateHoverButtonUI() {
    const hoverBtn = document.getElementById('act-hover');
    if (hoverBtn) {
      hoverBtn.classList.toggle('active-hover', Boolean(this.playerState.hoverMode));
      hoverBtn.textContent = this.playerState.hoverMode ? 'قفل ارتفاع: فعال (V)' : 'معلق در آسمان (V)';
    }
  }

  toggleHoverLock() {
    const p = this.playerState;
    if (p.vehicle) {
      if (p.vehicle.type === 'heli' || p.vehicle.type === 'ufo') {
        p.hoverMode = !p.hoverMode;
        p.vehicle.vy = 0;
        this.updateHoverButtonUI();
        sakuraAudio.playClick();
        this.showToast(p.hoverMode ? 'سفینه/هلیکوپتر در آسمان ثابت شد' : 'حالت آزاد پرواز');
      }
      return;
    }

    if (p.grounded && !p.hoverMode) {
      if (this.state.fuel <= 5) {
        this.showToast('سوخت جت‌پک کافی نیست!');
        return;
      }
      p.y += 1.4;
      p.vy = 0;
      p.grounded = false;
      p.flying = true;
      p.hoverMode = true;
    } else {
      p.hoverMode = !p.hoverMode;
      if (p.hoverMode) {
        p.flying = true;
        p.vy = 0;
      }
    }
    this.updateHoverButtonUI();
    sakuraAudio.playClick();
    this.showToast(
      p.hoverMode ? 'پرواز ثابت در آسمان فعال شد (با V آزاد می‌شود)' : 'ثابت‌نگهدار آسمان خاموش شد',
    );
  }

  renderHotbar() {
    this.renderBuildTools();
    const host = document.getElementById('hotbar-slots');
    host.innerHTML = '';
    HOTBAR_BLOCKS.forEach((blk, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = !this.state.customBlockId && idx === this.state.selectedSlot;
      btn.className = `hotbar-slot ${isSelected ? 'selected' : ''}`;
      const labelNum = idx < 9 ? toFaNum(idx + 1) : idx === 9 ? '۰' : idx === 10 ? '-' : '=';
      btn.innerHTML = `
        <span class="slot-num">${labelNum}</span>
        <span class="slot-swatch" style="background:${blk.color}"></span>
        <span class="slot-name">${blk.name}</span>
      `;
      btn.onclick = () => {
        this.state.selectedSlot = idx;
        this.state.customBlockId = null;
        sakuraAudio.playClick();
        this.renderHotbar();
      };
      host.appendChild(btn);
    });
  }

  renderBuildTools() {
    const row = document.getElementById('build-tool-pills');
    if (!row) return;
    row.innerHTML = '';
    BUILD_TOOLS.forEach((tool) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `build-tool-pill ${this.state.activeTool === tool.id ? 'active' : ''}`;
      btn.title = tool.desc;
      btn.textContent = tool.name;
      btn.onclick = () => {
        this.state.activeTool = tool.id;
        sakuraAudio.playClick();
        this.renderBuildTools();
        this.showToast(`ابزار فعال: ${tool.name} (${tool.desc})`);
      };
      row.appendChild(btn);
    });
  }

  initWorldDoors() {
    (this.voxelWorld.initialDoorAnchors || []).forEach((anchor) => {
      this.spawnDoorAt(anchor.ix, anchor.iy, anchor.iz, anchor.yaw || 0, anchor.style || 'korean_wood', Boolean(anchor.mirror), false);
    });
  }

  snapYaw90(yaw) {
    return Math.round(yaw / (Math.PI / 2)) * (Math.PI / 2);
  }

  getDoorStyleLabel(style) {
    if (style === 'hanok_sliding') return 'در کشویی هانوک';
    if (style === 'glass_modern') return 'در شیشه‌ای کافه';
    return 'در چوبی کره‌ای';
  }

  spawnDoorAt(ix, iy, iz, yaw = 0, style = 'korean_wood', mirror = false, recordTimeline = true) {
    const existing = this.doors.find(
      (d) => d.ix === ix && d.iz === iz && (d.iy === iy || d.iy + 1 === iy || d.iy === iy + 1),
    );
    if (existing) return null;

    const id = `door_${this.doorSeq++}`;
    const snappedYaw = this.snapYaw90(yaw);
    const mesh = buildInteractiveDoor(style, mirror);
    mesh.position.set(ix, iy, iz);
    mesh.rotation.y = snappedYaw;
    this.scene.add(mesh);

    const door = {
      id,
      style,
      name: this.getDoorStyleLabel(style),
      ix,
      iy,
      iz,
      yaw: snappedYaw,
      mirror,
      isOpen: false,
      animProgress: 0,
      mesh,
    };
    this.doors.push(door);
    this.voxelWorld.setDoorRegistration(ix, iy, iz, id, true);

    if (recordTimeline) {
      this.actionTimeline.push({ kind: 'door_add', doorIds: [id] });
      if (this.actionTimeline.length > 40) this.actionTimeline.shift();
    }
    return door;
  }

  removeDoorById(doorId, recordTimeline = true) {
    const idx = this.doors.findIndex((d) => d.id === doorId);
    if (idx < 0) return null;
    const [door] = this.doors.splice(idx, 1);
    this.scene.remove(door.mesh);
    this.voxelWorld.unregisterDoorCells(door.ix, door.iy, door.iz);
    if (recordTimeline) {
      this.actionTimeline.push({
        kind: 'door_remove',
        snapshot: {
          ix: door.ix,
          iy: door.iy,
          iz: door.iz,
          yaw: door.yaw,
          style: door.style,
          mirror: door.mirror,
        },
      });
      if (this.actionTimeline.length > 40) this.actionTimeline.shift();
    }
    return door;
  }

  setDoorOpen(door, open) {
    if (!door || door.isOpen === open) return;
    door.isOpen = open;
    this.voxelWorld.setDoorRegistration(door.ix, door.iy, door.iz, door.id, !open);
    if (open) sakuraAudio.playDoorOpen();
    else sakuraAudio.playDoorClose();
  }

  toggleDoor(door) {
    if (!door) return;
    this.setDoorOpen(door, !door.isOpen);
    this.updateNearestContext();
    this.showToast(door.isOpen ? `${door.name} باز شد` : `${door.name} بسته شد`);
  }

  undoLastBuild() {
    const entry = this.actionTimeline.pop();
    if (entry) {
      if (entry.kind === 'door_add') {
        entry.doorIds.forEach((id) => this.removeDoorById(id, false));
        sakuraAudio.playClick();
        this.updateTargetVoxel();
        this.showToast('نصب در بازگردانی شد');
        return;
      }
      if (entry.kind === 'door_remove') {
        const s = entry.snapshot;
        this.spawnDoorAt(s.ix, s.iy, s.iz, s.yaw, s.style, s.mirror, false);
        sakuraAudio.playClick();
        this.updateTargetVoxel();
        this.showToast('در حذف‌شده برگردانده شد');
        return;
      }
      if (entry.kind === 'blueprint') {
        entry.doorIds.forEach((id) => this.removeDoorById(id, false));
        const restored = this.voxelWorld.undoLastAction();
        sakuraAudio.playClick();
        this.updateTargetVoxel();
        this.showToast(`سازه و درهای آن بازگردانی شد (${toFaNum(restored)} بلوک)`);
        return;
      }
    }

    const restored = this.voxelWorld.undoLastAction();
    if (restored > 0) {
      sakuraAudio.playClick();
      this.updateTargetVoxel();
      this.showToast(`بازگردانی انجام شد (${toFaNum(restored)} بلوک)`);
    } else {
      this.showToast('تغییری برای بازگردانی وجود ندارد');
    }
  }

  bindUI() {
    document.getElementById('btn-start-new').addEventListener('click', () => {
      sakuraAudio.playClick();
      this.startGame();
    });

    document.getElementById('btn-continue-save').addEventListener('click', () => {
      sakuraAudio.playClick();
      this.loadSavedState();
      this.startGame();
    });

    document.getElementById('btn-toggle-hotbar').addEventListener('click', () => {
      sakuraAudio.playClick();
      this.setHotbarCollapsed(!this.hotbarCollapsed);
    });

    document.getElementById('btn-click-mode').addEventListener('click', () => {
      this.clickMode = this.clickMode === 'break' ? 'build' : 'break';
      const btn = document.getElementById('btn-click-mode');
      const lbl = document.getElementById('click-mode-label');
      btn.classList.toggle('build-active', this.clickMode === 'build');
      lbl.textContent = this.clickMode === 'break' ? 'کندن زمین/دیوار' : 'ساخت بلوک';
      sakuraAudio.playClick();
    });

    document.getElementById('btn-undo-build').addEventListener('click', () => this.undoLastBuild());
    document.getElementById('btn-all-blocks').addEventListener('click', () => this.openMaterialsModal());

    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      const k = e.code;
      this.keys.add(k);

      if (k === 'Space' || k === 'KeyF') {
        e.preventDefault();
        if (!this.isFlyHeld) this.triggerJumpOrFlyStart();
        this.isFlyHeld = true;
      } else if (k === 'ShiftLeft' || k === 'ShiftRight' || k === 'KeyB') {
        this.isDescendHeld = true;
      } else if (k === 'KeyV') {
        this.toggleHoverLock();
      } else if (k === 'KeyQ') {
        this.breakTargetedBlock();
      } else if (k === 'KeyR') {
        this.placeSelectedBlock();
      } else if (k === 'KeyZ') {
        this.undoLastBuild();
      } else if (k === 'KeyE') {
        this.handleContextInteract();
      } else if (k === 'KeyC') {
        this.toggleVehicleBoard();
      } else if (k === 'KeyX') {
        this.triggerKick();
      } else if (k === 'KeyH') {
        this.triggerQuickHugOrFollow();
      } else if (k === 'KeyM') {
        this.openMenuModal();
      } else if (k >= 'Digit1' && k <= 'Digit9') {
        this.state.selectedSlot = Number(k.replace('Digit', '')) - 1;
        this.state.customBlockId = null;
        this.renderHotbar();
      } else if (k === 'Digit0') {
        this.state.selectedSlot = 9;
        this.state.customBlockId = null;
        this.renderHotbar();
      } else if (k === 'Minus') {
        this.state.selectedSlot = 10;
        this.state.customBlockId = null;
        this.renderHotbar();
      } else if (k === 'Equal') {
        this.state.selectedSlot = 11;
        this.state.customBlockId = null;
        this.renderHotbar();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (e.code === 'Space' || e.code === 'KeyF') {
        this.isFlyHeld = false;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyB') {
        this.isDescendHeld = false;
      }
    });

    // Multi-touch Camera Drag + Pinch-Zoom + Tap to Break/Place Voxels
    this.mount.addEventListener('contextmenu', (e) => e.preventDefault());

    this.mount.addEventListener('pointerdown', (e) => {
      this.activeMountPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.activeMountPointers.size === 2) {
        const pts = Array.from(this.activeMountPointers.values());
        this.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        this.pinchStartCamDist = this.camDist;
        this.isDraggingCam = false;
        return;
      }
      this.isDraggingCam = true;
      this.camDragPointerId = e.pointerId;
      this.pointerDownPos.x = e.clientX;
      this.pointerDownPos.y = e.clientY;
      this.lastPointer.x = e.clientX;
      this.lastPointer.y = e.clientY;
      this.updatePointerNdc(e.clientX, e.clientY);
    });

    window.addEventListener('pointermove', (e) => {
      if (this.activeMountPointers.has(e.pointerId)) {
        this.activeMountPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (this.activeMountPointers.size === 2 && this.pinchStartDist) {
        const pts = Array.from(this.activeMountPointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const scale = this.pinchStartDist / Math.max(20, dist);
        this.camDist = THREE.MathUtils.clamp(this.pinchStartCamDist * scale, 4.5, 26);
        return;
      }
      this.updatePointerNdc(e.clientX, e.clientY);
      if (!this.isDraggingCam || e.pointerId !== this.camDragPointerId) return;
      const dx = e.clientX - this.lastPointer.x;
      const dy = e.clientY - this.lastPointer.y;
      this.lastPointer.x = e.clientX;
      this.lastPointer.y = e.clientY;
      this.camYaw -= dx * 0.0065;
      this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * 0.0055, -0.35, 1.25);
    });

    const endMountPointer = (e) => {
      this.activeMountPointers.delete(e.pointerId);
      if (this.activeMountPointers.size < 2) {
        this.pinchStartDist = null;
      }
      if (this.isDraggingCam && e.pointerId === this.camDragPointerId && this.isRunning) {
        const moveDist = Math.hypot(
          e.clientX - this.pointerDownPos.x,
          e.clientY - this.pointerDownPos.y,
        );
        if (moveDist < 8 && e.target === this.renderer.domElement) {
          this.updatePointerNdc(e.clientX, e.clientY);
          this.updateTargetVoxel();
          if (e.button === 2) {
            if (this.targetVoxel && this.targetVoxel.isDoor) {
              const door = this.doors.find((d) => d.id === this.targetVoxel.doorId);
              if (door) {
                this.toggleDoor(door);
                this.isDraggingCam = false;
                this.camDragPointerId = null;
                return;
              }
            }
            this.placeSelectedBlock();
          } else if (this.clickMode === 'build') {
            this.placeSelectedBlock();
          } else {
            this.breakTargetedBlock();
          }
        }
      }
      if (e.pointerId === this.camDragPointerId) {
        this.isDraggingCam = false;
        this.camDragPointerId = null;
      }
    };

    window.addEventListener('pointerup', endMountPointer);
    window.addEventListener('pointercancel', endMountPointer);

    this.mount.addEventListener(
      'wheel',
      (e) => {
        this.camDist = THREE.MathUtils.clamp(this.camDist + e.deltaY * 0.008, 4.5, 26);
      },
      { passive: true },
    );

    // Virtual Joystick (isolated pointerId for simultaneous touch drag)
    const joyZone = document.getElementById('joystick-zone');
    const joyKnob = document.getElementById('joystick-knob');
    let joyPointerId = null;

    const updateJoy = (clientX, clientY) => {
      const rect = joyZone.querySelector('.joystick-base').getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxR = rect.width * 0.42;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.joyVec.x = dx / maxR;
      this.joyVec.y = dy / maxR;
    };

    joyZone.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      joyPointerId = e.pointerId;
      joyZone.setPointerCapture(e.pointerId);
      updateJoy(e.clientX, e.clientY);
    });
    joyZone.addEventListener('pointermove', (e) => {
      if (e.pointerId === joyPointerId) updateJoy(e.clientX, e.clientY);
    });
    const resetJoy = (e) => {
      if (e.pointerId !== joyPointerId) return;
      joyPointerId = null;
      joyKnob.style.transform = 'translate(0px, 0px)';
      this.joyVec.x = 0;
      this.joyVec.y = 0;
    };
    joyZone.addEventListener('pointerup', resetJoy);
    joyZone.addEventListener('pointercancel', resetJoy);

    // Action Buttons
    document.getElementById('act-break').addEventListener('click', () => this.breakTargetedBlock());
    document.getElementById('act-place').addEventListener('click', () => this.placeSelectedBlock());
    document.getElementById('act-hover').addEventListener('click', () => this.toggleHoverLock());

    const flyBtn = document.getElementById('act-fly');
    flyBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerJumpOrFlyStart();
      this.isFlyHeld = true;
    });
    const endFly = () => {
      this.isFlyHeld = false;
    };
    flyBtn.addEventListener('pointerup', endFly);
    flyBtn.addEventListener('pointercancel', endFly);
    flyBtn.addEventListener('pointerleave', endFly);

    const descBtn = document.getElementById('act-descend');
    descBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.isDescendHeld = true;
    });
    const endDesc = () => {
      this.isDescendHeld = false;
    };
    descBtn.addEventListener('pointerup', endDesc);
    descBtn.addEventListener('pointercancel', endDesc);
    descBtn.addEventListener('pointerleave', endDesc);

    document.getElementById('act-kick').addEventListener('click', () => this.triggerKick());
    document.getElementById('act-interact').addEventListener('click', () => this.handleContextInteract());
    document.getElementById('act-hug').addEventListener('click', () => this.triggerQuickHugOrFollow());
    document.getElementById('context-prompt-btn').addEventListener('click', () => this.handleContextInteract());
    document.getElementById('btn-exit-vehicle').addEventListener('click', () => this.toggleVehicleBoard());

    // Top HUD Buttons
    document.getElementById('btn-switch-char').addEventListener('click', () => this.openCharaMakeModal());
    document.getElementById('btn-menu').addEventListener('click', () => this.openMenuModal());
    document.getElementById('btn-charamake').addEventListener('click', () => this.openCharaMakeModal());
    document.getElementById('btn-props').addEventListener('click', () => this.openPropsModal());
    document.getElementById('btn-phone').addEventListener('click', () => this.openPhoneModal());
    document.getElementById('btn-album').addEventListener('click', () => this.openAlbumModal());
    document.getElementById('btn-snap').addEventListener('click', () => this.capturePhoto());
    document.getElementById('btn-quick-save').addEventListener('click', () => this.saveState(true));
    document.getElementById('btn-camera-reset').addEventListener('click', () => {
      sakuraAudio.playClick();
      this.camYaw = this.playerState.yaw + Math.PI;
      this.camPitch = 0.36;
      this.camDist = 9.2;
      this.showToast('دوربین پشت شخصیت تنظیم شد');
    });
    document.getElementById('btn-sound').addEventListener('click', () => {
      sakuraAudio.muted = !sakuraAudio.muted;
      document.getElementById('sound-label').textContent = sakuraAudio.muted ? 'صدا: خاموش' : 'صدا: روشن';
    });

    // Social Card
    document.getElementById('btn-close-social').addEventListener('click', () => this.closeSocialCard());
    document.getElementById('soc-talk').addEventListener('click', () => this.socialAction('talk'));
    document.getElementById('soc-praise').addEventListener('click', () => this.socialAction('praise'));
    document.getElementById('soc-hug').addEventListener('click', () => this.socialAction('hug'));
    document.getElementById('soc-gift').addEventListener('click', () => this.socialAction('gift'));
    document.getElementById('soc-follow').addEventListener('click', () => this.socialAction('follow'));
    document.getElementById('soc-attack').addEventListener('click', () => this.socialAction('attack'));

    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'modal-backdrop') this.closeModal();
    });
  }

  updatePointerNdc(clientX, clientY) {
    this.pointerNdc.x = (clientX / window.innerWidth) * 2 - 1;
    this.pointerNdc.y = -(clientY / window.innerHeight) * 2 + 1;
    this.hasPointer = true;
  }

  updateTargetVoxel() {
    const p = this.playerState;
    let hit = null;

    if (this.hasPointer) {
      this.raycaster.setFromCamera(this.pointerNdc, this.camera);
      hit = this.voxelWorld.raycast(this.raycaster.ray.origin, this.raycaster.ray.direction, 24);
      if (hit) {
        const dPlayer = Math.hypot(hit.ix - p.x, hit.iy - p.y, hit.iz - p.z);
        if (dPlayer > 8.8) hit = null;
      }
    }

    if (!hit) {
      _rayOrigin.set(p.x, p.y + 1.4, p.z);
      _rayDir.set(Math.sin(p.yaw), -0.28, Math.cos(p.yaw)).normalize();
      hit = this.voxelWorld.raycast(_rayOrigin, _rayDir, 6.2);
    }

    this.targetVoxel = hit;
    const lbl = document.getElementById('target-block-label');
    if (hit) {
      this.highlightBox.visible = true;
      this.highlightBox.position.set(hit.ix, hit.iy + 0.5, hit.iz);
      if (hit.isDoor) {
        const dObj = this.doors.find((d) => d.id === hit.doorId);
        const stateStr = dObj ? (dObj.isOpen ? 'باز' : 'بسته') : 'بسته';
        lbl.textContent = `نشانه: ${dObj ? dObj.name : 'در'} (${stateStr} · E)`;
      } else {
        lbl.textContent = `نشانه: ${ALL_BLOCK_NAMES[hit.type] || 'بلوک'}`;
      }
    } else {
      this.highlightBox.visible = false;
      lbl.textContent = 'نشانه: فضای آزاد';
    }
  }

  spawnDebris(x, y, z, color) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
    const geo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    for (let i = 0; i < 6; i += 1) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x + (Math.random() - 0.5) * 0.5, y + 0.5, z + (Math.random() - 0.5) * 0.5);
      this.scene.add(m);
      this.debrisParticles.push({
        mesh: m,
        vx: (Math.random() - 0.5) * 4.5,
        vy: 2.5 + Math.random() * 3.5,
        vz: (Math.random() - 0.5) * 4.5,
        life: 0.65,
      });
    }
  }

  breakTargetedBlock() {
    sakuraAudio.ensureCtx();
    const hit = this.targetVoxel;
    if (!hit) {
      this.showToast('بلوکی برای کندن در دسترس نیست (نزدیک‌تر شوید)');
      return;
    }
    if (hit.isDoor) {
      const removedDoor = this.removeDoorById(hit.doorId, true);
      if (removedDoor) {
        this.spawnDebris(removedDoor.ix, removedDoor.iy + 0.5, removedDoor.iz, '#8c522b');
        sakuraAudio.playBlockBreak();
        this.state.brokenCount += 1;
        this.updateTopHud();
        this.updateTargetVoxel();
        this.showToast(`${removedDoor.name} برداشته شد`);
      }
      return;
    }
    if (hit.iy <= this.voxelWorld.minY || hit.type === 'bedrock') {
      this.showToast('سنگ بستر اعماق زمین قابل کندن نیست');
      return;
    }

    const removedType = hit.type;
    const changes = this.voxelWorld.applyBuildTool(
      this.state.activeTool,
      'break',
      hit,
      null,
      this.playerState.yaw,
      this.playerState,
    );
    if (changes.length > 0) {
      this.actionTimeline.push({ kind: 'voxel' });
      if (this.actionTimeline.length > 40) this.actionTimeline.shift();
      const blkMeta = [...HOTBAR_BLOCKS, ...EXTRA_BLOCKS].find((b) => b.id === removedType);
      this.spawnDebris(hit.ix, hit.iy, hit.iz, blkMeta ? blkMeta.color : '#8b5a36');
      sakuraAudio.playBlockBreak();
      this.state.brokenCount += changes.length;
      this.state.coins += Math.min(14, changes.length * 2);
      if (hit.iy <= 0) this.completeMission('m_dig');
      this.completeMission('m_break');
      this.updateTopHud();
      this.updateTargetVoxel();
    }
  }

  placeSelectedBlock() {
    sakuraAudio.ensureCtx();
    const p = this.playerState;
    const chosenId =
      this.state.customBlockId ||
      (HOTBAR_BLOCKS[this.state.selectedSlot] || HOTBAR_BLOCKS[0]).id;
    const chosenMeta = [...HOTBAR_BLOCKS, ...EXTRA_BLOCKS].find((b) => b.id === chosenId);

    if ((chosenMeta && chosenMeta.isDoor) || this.state.activeTool === 'doorway') {
      const doorStyle = (chosenMeta && chosenMeta.doorStyle) || 'korean_wood';
      let dx;
      let dy;
      let dz;

      if (this.state.activeTool === 'doorway' && this.targetVoxel && !this.targetVoxel.isDoor && this.targetVoxel.iy > this.voxelWorld.minY) {
        dx = this.targetVoxel.ix;
        dy = this.targetVoxel.iy;
        dz = this.targetVoxel.iz;
        this.voxelWorld.applyBuildTool('doorway', 'break', { ix: dx, iy: dy, iz: dz }, null, p.yaw, p);
        this.actionTimeline.push({ kind: 'voxel' });
      } else if (this.targetVoxel) {
        dx = this.targetVoxel.placeX;
        dy = this.targetVoxel.placeY;
        dz = this.targetVoxel.placeZ;
      } else {
        dx = Math.round(p.x + Math.sin(p.yaw) * 2.2);
        dy = Math.floor(p.y);
        dz = Math.round(p.z + Math.cos(p.yaw) * 2.2);
      }

      const px = Math.round(p.x);
      const pz = Math.round(p.z);
      const py = Math.floor(p.y);
      if (dx === px && dz === pz && (dy === py || dy === py + 1)) {
        this.showToast('روی جای ایستادن خودتان نمی‌توانید در نصب کنید!');
        return;
      }

      const door = this.spawnDoorAt(dx, dy, dz, p.yaw, doorStyle, false, true);
      if (door) {
        sakuraAudio.playBlockPlace();
        this.state.placedCount += 1;
        this.completeMission('m_build');
        this.updateTargetVoxel();
        this.showToast(`${door.name} نصب شد! (باز و بسته با E یا راست‌کلیک)`);
      } else {
        this.showToast('در این نقطه قبلا یک در نصب شده است');
      }
      return;
    }

    let origin;
    if (this.targetVoxel) {
      origin = {
        ix: this.targetVoxel.placeX,
        iy: this.targetVoxel.placeY,
        iz: this.targetVoxel.placeZ,
      };
    } else {
      origin = {
        ix: Math.round(p.x + Math.sin(p.yaw) * 2.2),
        iy: Math.floor(p.y),
        iz: Math.round(p.z + Math.cos(p.yaw) * 2.2),
      };
    }

    const changes = this.voxelWorld.applyBuildTool(
      this.state.activeTool,
      'build',
      origin,
      chosenId,
      p.yaw,
      p,
    );

    if (changes.length > 0) {
      this.actionTimeline.push({ kind: 'voxel' });
      if (this.actionTimeline.length > 40) this.actionTimeline.shift();
      sakuraAudio.playBlockPlace();
      this.state.placedCount += changes.length;
      if (this.state.placedCount >= 5) {
        this.completeMission('m_build');
      }
      this.updateTargetVoxel();
    } else {
      this.showToast('روی جای ایستادن خودتان نمی‌توانید بلوک بگذارید!');
    }
  }

  startGame() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('top-hud').classList.remove('hidden');
    document.getElementById('joystick-zone').classList.remove('hidden');
    document.getElementById('minecraft-hotbar').classList.remove('hidden');
    document.getElementById('action-cluster').classList.remove('hidden');

    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.scheduleNextFrame();
    }
    this.updateTopHud();
    this.updateHoverButtonUI();
    this.showToast('به دنیای گسترده کره جنوبی خوش آمدید! زمین را بکنید، شنا کنید و به آسمان بروید');
  }

  scheduleNextFrame() {
    const loop = (now) => {
      if (!this.isRunning) return;
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      this.update(dt, now * 0.001);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(() => requestAnimationFrame(loop));
      } else {
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  }

  afterDraw(cb) {
    const gl = this.renderer.getContext();
    if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const res = gl.clientWaitSync(sync, 0, 0);
        if (res === gl.TIMEOUT_EXPIRED) {
          setTimeout(poll, 1);
        } else {
          gl.deleteSync(sync);
          cb();
        }
      };
      setTimeout(poll, 0);
    } else {
      requestAnimationFrame(cb);
    }
  }

  triggerJumpOrFlyStart() {
    sakuraAudio.ensureCtx();
    const p = this.playerState;
    if (p.vehicle) {
      if (p.vehicle.type === 'heli' || p.vehicle.type === 'ufo') {
        p.vehicle.vy = 9.0;
        sakuraAudio.playJetpack();
      }
      return;
    }
    if (p.swimming) {
      p.vy = 6.2;
      return;
    }
    if (p.grounded) {
      p.vy = 9.4;
      p.grounded = false;
      sakuraAudio.playJump();
    } else if (this.state.fuel > 4) {
      p.flying = true;
      sakuraAudio.playJetpack();
    }
  }

  triggerKick() {
    if (this.playerState.vehicle) return;
    sakuraAudio.playKick();
    this.playerState.kickTimer = 0.34;
    const p = this.playerState;
    let hitAny = false;

    this.npcs.forEach((npc) => {
      if (npc.faintedTimer > 0) return;
      const dx = npc.x - p.x;
      const dz = npc.z - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= 2.8 && Math.abs(npc.y - p.y) < 2.2) {
        hitAny = true;
        npc.hp = Math.max(0, npc.hp - 36);
        npc.hostile = true;
        this.state.npcRelations[npc.def.id] = Math.min(-15, (this.state.npcRelations[npc.def.id] || 0) - 20);
        const push = 1.4 / Math.max(dist, 0.3);
        npc.x += dx * push;
        npc.z += dz * push;

        if (npc.hp <= 0) {
          npc.faintedTimer = 16;
          npc.following = false;
          npc.mesh.rotation.x = -Math.PI / 2;
          npc.mesh.position.y = npc.y + 0.3;
          this.state.coins += 65;
          sakuraAudio.playCoin();
          this.showToast(`${npc.def.name} شکست خورد! +۶۵ سکه`);
          if (npc.def.hostile) this.completeMission('m_yakuza');
        } else {
          this.showToast(`ضربه به ${npc.def.name} (سلامتی: ${toFaNum(npc.hp)})`);
        }
      }
    });

    if (!hitAny) this.showToast('لگد آکروباتیک!');
    this.updateTopHud();
  }

  triggerQuickHugOrFollow() {
    const target = this.nearestTarget;
    if (target && target.kind === 'npc') {
      this.activeSocialNpc = target.npc;
      this.socialAction('hug');
    } else {
      const joonho = this.npcs.find((n) => n.def.id === 'npc_joonho');
      if (joonho && joonho.faintedTimer <= 0) {
        joonho.following = !joonho.following;
        sakuraAudio.playClick();
        this.showToast(
          joonho.following ? 'مدیرعامل جون‌هو همراه شما شد!' : 'همراهی جون‌هو متوقف شد',
        );
      }
    }
  }

  toggleVehicleBoard() {
    const p = this.playerState;
    if (p.vehicle) {
      const v = p.vehicle;
      p.vehicle = null;
      p.hoverMode = false;
      p.x = v.x + Math.cos(v.yaw) * 2.2;
      p.z = v.z - Math.sin(v.yaw) * 2.2;
      p.y = this.voxelWorld.getTopSolidY(p.x, p.z) + 1;
      p.vy = 0;
      v.speed = 0;
      this.playerMesh.visible = true;
      this.updateHoverButtonUI();
      document.getElementById('vehicle-hud-bar').classList.add('hidden');
      sakuraAudio.playClick();
      this.showToast(`از ${v.name} پیاده شدید`);
      return;
    }

    let bestV = null;
    let bestD = 5.0;
    this.vehicles.forEach((v) => {
      const d = Math.hypot(v.x - p.x, v.z - p.z);
      if (d < bestD && Math.abs(v.y - p.y) < 3.5) {
        bestD = d;
        bestV = v;
      }
    });

    if (bestV) {
      p.vehicle = bestV;
      p.flying = false;
      p.hoverMode = bestV.type === 'ufo';
      this.playerMesh.visible = false;
      this.closeSocialCard();
      this.updateHoverButtonUI();
      document.getElementById('vehicle-hud-bar').classList.remove('hidden');
      document.getElementById('vehicle-name-badge').textContent = bestV.name;
      sakuraAudio.playVehicle();
      this.completeMission('m_drive');
      if (bestV.type === 'ufo') this.completeMission('m_alien');
      this.showToast(`سوار ${bestV.name} شدید!`);
    }
  }

  handleContextInteract() {
    if (this.playerState.vehicle) {
      this.toggleVehicleBoard();
      return;
    }
    const target = this.nearestTarget;
    if (!target) return;
    if (target.kind === 'door') this.toggleDoor(target.door);
    else if (target.kind === 'vehicle') this.toggleVehicleBoard();
    else if (target.kind === 'npc') this.openSocialCard(target.npc);
    else if (target.kind === 'zone') this.enterZone(target.zone);
  }

  enterZone(zone) {
    sakuraAudio.playClick();
    if (zone.id === 'cafe_shop') {
      this.openShopModal();
    } else if (zone.id === 'cabin_home') {
      this.state.hp = 100;
      this.state.fuel = 100;
      sakuraAudio.playHeal();
      this.updateTopHud();
      this.openCharaMakeModal();
    } else if (zone.id === 'temple_gate') {
      this.state.loveScore = Math.min(100, this.state.loveScore + 10);
      sakuraAudio.playHug();
      this.updateTopHud();
      this.showToast('دعای عشق در دروازه معبد جنگل! +۱۰٪ عشق');
    }
  }

  openSocialCard(npc) {
    this.activeSocialNpc = npc;
    if (npc.def.isAlien) this.completeMission('m_alien');
    const card = document.getElementById('npc-social-card');
    const score = this.state.npcRelations[npc.def.id] ?? npc.def.relation;
    document.getElementById('social-npc-name').textContent = npc.def.name;
    document.getElementById('social-npc-tier').textContent = `${getRelationTierLabel(score, npc.hostile)} · ${toFaNum(score)}٪`;
    document.getElementById('social-npc-line').textContent = npc.def.lines[npc.lineIdx % npc.def.lines.length];
    document.getElementById('soc-follow').textContent = npc.following ? 'توقف همراهی' : 'بیا دنبالم';
    card.classList.remove('hidden');
  }

  closeSocialCard() {
    this.activeSocialNpc = null;
    document.getElementById('npc-social-card').classList.add('hidden');
  }

  socialAction(kind) {
    const npc = this.activeSocialNpc;
    if (!npc) return;
    const id = npc.def.id;
    let rel = this.state.npcRelations[id] ?? 15;

    if (kind === 'talk') {
      npc.lineIdx += 1;
      sakuraAudio.playClick();
    } else if (kind === 'praise') {
      rel = Math.min(100, rel + 8);
      npc.hostile = false;
      this.state.npcRelations[id] = rel;
      if (id === 'npc_joonho') this.state.loveScore = Math.min(100, this.state.loveScore + 6);
      sakuraAudio.playCoin();
      this.showToast(`تعریف از ${npc.def.name} (+۸ دوستی)`);
    } else if (kind === 'hug') {
      rel = Math.min(100, rel + 12);
      npc.hostile = false;
      this.state.npcRelations[id] = rel;
      this.state.loveScore = Math.min(100, this.state.loveScore + 10);
      this.playerState.hugTimer = 0.9;
      sakuraAudio.playHug();
      this.showToast(`بغل عاشقانه با ${npc.def.name}! ❤️`);
    } else if (kind === 'gift') {
      const owned = SHOP_ITEMS.find((it) => (this.state.inventory[it.id] || 0) > 0);
      if (!owned) {
        this.showToast('هدیه‌ای ندارید! از کافه آجری سئول خرید کنید');
        return;
      }
      this.state.inventory[owned.id] -= 1;
      rel = Math.min(100, rel + owned.loveBoost);
      npc.hostile = false;
      this.state.npcRelations[id] = rel;
      this.state.loveScore = Math.min(100, this.state.loveScore + Math.round(owned.loveBoost * 0.8));
      sakuraAudio.playHug();
      this.showToast(`${owned.name} هدیه داده شد!`);
    } else if (kind === 'follow') {
      npc.following = !npc.following;
      npc.hostile = false;
      sakuraAudio.playClick();
    } else if (kind === 'attack') {
      this.closeSocialCard();
      this.triggerKick();
      return;
    }
    this.updateTopHud();
    if (this.activeSocialNpc) this.openSocialCard(npc);
  }

  update(dt, elapsed) {
    const p = this.playerState;
    const worldLim = this.voxelWorld.worldRadius - 3;

    // Periodic Auto-Save in browser
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 15) {
      this.autoSaveTimer = 0;
      this.saveState(false);
    }

    // 1. Falling Sakura Petals & Waterfall Mist
    if (this.petalSys) {
      const posAttr = this.petalSys.petalPoints.geometry.getAttribute('position');
      const arr = posAttr.array;
      const vels = this.petalSys.petalVel;
      for (let i = 0; i < vels.length; i += 1) {
        arr[i * 3 + 1] -= vels[i] * dt;
        arr[i * 3] += Math.sin(elapsed + i) * 0.4 * dt;
        if (arr[i * 3 + 1] < 1) {
          arr[i * 3] = p.x + (Math.random() - 0.5) * 84;
          arr[i * 3 + 1] = 19 + Math.random() * 5;
          arr[i * 3 + 2] = p.z + (Math.random() - 0.5) * 84;
        }
      }
      posAttr.needsUpdate = true;
    }

    for (let i = 0; i < this.waterfallParticles.length; i += 1) {
      const wp = this.waterfallParticles[i];
      const a = wp.anchor;
      wp.mesh.position.x += wp.vx * dt;
      wp.mesh.position.y += wp.vy * dt;
      wp.mesh.position.z += wp.vz * dt;
      if (wp.mesh.position.y <= a.yBot) {
        wp.mesh.position.set(
          a.x + (Math.random() - 0.5) * 1.4,
          a.yTop - Math.random() * 0.6,
          a.z + (Math.random() - 0.5) * 0.7,
        );
      }
    }

    // 2. Voxel Debris Chips
    for (let i = this.debrisParticles.length - 1; i >= 0; i -= 1) {
      const dp = this.debrisParticles[i];
      dp.life -= dt;
      dp.vy -= 14 * dt;
      dp.mesh.position.x += dp.vx * dt;
      dp.mesh.position.y += dp.vy * dt;
      dp.mesh.position.z += dp.vz * dt;
      dp.mesh.rotation.x += 7 * dt;
      dp.mesh.rotation.y += 6 * dt;
      if (dp.life <= 0) {
        this.scene.remove(dp.mesh);
        this.debrisParticles.splice(i, 1);
      }
    }

    // 3. Movement Input
    let inX = this.joyVec.x;
    let inY = this.joyVec.y;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) inX -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) inX += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) inY -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) inY += 1;
    const mag = Math.hypot(inX, inY);
    if (mag > 1) {
      inX /= mag;
      inY /= mag;
    }

    // 4. Vehicle OR Smooth Directional Walk / Swim / Hover-Fly Physics
    if (p.vehicle) {
      const v = p.vehicle;
      const throttle = -inY;
      const steer = -inX;

      if (v.type === 'heli' || v.type === 'ufo') {
        v.yaw += steer * dt * 2.3;
        const fwd = throttle * v.maxSpeed;
        v.x += Math.sin(v.yaw) * fwd * dt;
        v.z += Math.cos(v.yaw) * fwd * dt;
        if (this.isFlyHeld) {
          v.vy = THREE.MathUtils.damp(v.vy, 9.0, 9, dt);
        } else if (this.isDescendHeld) {
          v.vy = THREE.MathUtils.damp(v.vy, -7.8, 9, dt);
        } else if (p.hoverMode || v.type === 'ufo') {
          v.vy = THREE.MathUtils.damp(v.vy, 0, 12, dt);
        } else {
          v.vy *= Math.exp(-4 * dt);
        }

        const groundY = this.voxelWorld.getTopSolidY(v.x, v.z) + 1;
        v.y = THREE.MathUtils.clamp(v.y + v.vy * dt, groundY, 44);
        if (v.mesh.userData.rotorHub) v.mesh.userData.rotorHub.rotation.y += dt * 18;
        if (v.mesh.userData.tailRotor) v.mesh.userData.tailRotor.rotation.x += dt * 20;
        if (v.mesh.userData.ufoRing) v.mesh.userData.ufoRing.rotation.y += dt * 3.8;
        v.speed = fwd;
      } else {
        v.speed += throttle * 22 * dt;
        if (Math.abs(throttle) < 0.05) v.speed *= Math.exp(-3.5 * dt);
        v.speed = THREE.MathUtils.clamp(v.speed, -v.maxSpeed * 0.45, v.maxSpeed);
        const sDir = Math.abs(v.speed) > 0.35 ? Math.sign(v.speed) : 0;
        v.yaw += steer * sDir * dt * 2.2;
        const nx = THREE.MathUtils.clamp(v.x + Math.sin(v.yaw) * v.speed * dt, -worldLim, worldLim);
        const nz = THREE.MathUtils.clamp(v.z + Math.cos(v.yaw) * v.speed * dt, -worldLim, worldLim);
        const targetGroundY = this.voxelWorld.getTopSolidY(nx, nz) + 1;
        if (targetGroundY - v.y <= 1.2) {
          v.x = nx;
          v.z = nz;
          v.y = THREE.MathUtils.lerp(v.y, targetGroundY, 1 - Math.exp(-12 * dt));
        } else {
          v.speed *= -0.3;
        }
        if (v.mesh.userData.wheels) {
          v.mesh.userData.wheels.forEach((w) => {
            w.rotation.x += v.speed * dt * 1.4;
          });
        }
      }
      v.x = THREE.MathUtils.clamp(v.x, -worldLim, worldLim);
      v.z = THREE.MathUtils.clamp(v.z, -worldLim, worldLim);
      v.mesh.position.set(v.x, v.y, v.z);
      v.mesh.rotation.y = v.yaw;
      p.x = v.x;
      p.y = v.y;
      p.z = v.z;
      p.yaw = v.yaw;
      document.getElementById('vehicle-speed-badge').textContent = `${toFaNum(Math.round(Math.abs(v.speed) * 4))} کیلومتر`;
    } else {
      _camForward.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw)).normalize();
      _camRight.crossVectors(_camForward, _upVec).normalize();
      _moveDir.set(0, 0, 0);
      _moveDir.addScaledVector(_camForward, -inY);
      _moveDir.addScaledVector(_camRight, inX);

      const moveLen = Math.min(1, _moveDir.length());
      const inWater =
        this.voxelWorld.isWaterAt(p.x, p.y + 0.35, p.z) ||
        this.voxelWorld.isWaterAt(p.x, p.y + 0.05, p.z);
      p.swimming = inWater && !p.hoverMode;
      if (inWater) this.completeMission('m_sea');

      const topSpeed = p.flying || p.hoverMode ? 13.0 : p.swimming ? 4.8 : 7.4;
      let targetVx = 0;
      let targetVz = 0;
      if (moveLen > 0.04) {
        _moveDir.normalize();
        targetVx = _moveDir.x * topSpeed * moveLen;
        targetVz = _moveDir.z * topSpeed * moveLen;
        const desiredYaw = Math.atan2(_moveDir.x, _moveDir.z);
        p.yaw = lerpAngle(p.yaw, desiredYaw, 1 - Math.exp(-13 * dt));
      }

      // Smooth damped acceleration & deceleration
      p.vx = THREE.MathUtils.damp(p.vx, targetVx, 11, dt);
      p.vz = THREE.MathUtils.damp(p.vz, targetVz, 11, dt);

      if (p.hoverMode && this.state.fuel > 0.5) {
        p.flying = true;
        if (this.isFlyHeld) {
          p.vy = THREE.MathUtils.damp(p.vy, 7.8, 9, dt);
        } else if (this.isDescendHeld) {
          p.vy = THREE.MathUtils.damp(p.vy, -7.2, 9, dt);
        } else {
          p.vy = THREE.MathUtils.damp(p.vy, 0, 14, dt);
        }
        this.state.fuel = Math.max(0, this.state.fuel - dt * 2.6);
        if (this.state.fuel <= 0.5) {
          p.hoverMode = false;
          this.updateHoverButtonUI();
        }
      } else if (this.isFlyHeld && !p.grounded && !p.swimming && this.state.fuel > 1) {
        p.flying = true;
        p.vy = THREE.MathUtils.lerp(p.vy, 8.6, 1 - Math.exp(-8 * dt));
        this.state.fuel = Math.max(0, this.state.fuel - dt * 15);
      } else if (p.swimming) {
        p.flying = false;
        if (this.isFlyHeld) {
          p.vy = THREE.MathUtils.damp(p.vy, 4.5, 8, dt);
        } else if (this.isDescendHeld) {
          p.vy = THREE.MathUtils.damp(p.vy, -4.2, 8, dt);
        } else {
          const surfaceY = 0.25;
          p.vy = THREE.MathUtils.damp(p.vy, (surfaceY - p.y) * 4.0, 8, dt);
        }
        this.state.fuel = Math.min(100, this.state.fuel + dt * 20);
      } else {
        p.flying = false;
        p.vy -= 24 * dt;
      }

      if (p.grounded) this.state.fuel = Math.min(100, this.state.fuel + dt * 28);

      const col = this.voxelWorld.resolveEntityMovement(p.x, p.y, p.z, p.vx, p.vz, dt);
      p.x = col.x;
      p.y = col.y + p.vy * dt;
      p.z = col.z;

      for (let i = 0; i < this.spawnedProps.length; i += 1) {
        const sp = this.spawnedProps[i];
        if (sp.userData.isTrampoline) {
          if (Math.hypot(p.x - sp.position.x, p.z - sp.position.z) < 1.6 && Math.abs(p.y - sp.position.y) < 1.0 && p.vy <= 0) {
            p.vy = 19;
            p.grounded = false;
            sakuraAudio.playJump();
          }
        }
      }

      if (p.y <= col.floorY) {
        p.y = col.floorY;
        p.vy = 0;
        p.grounded = true;
        p.flying = false;
        if (p.hoverMode) {
          p.hoverMode = false;
          this.updateHoverButtonUI();
        }
      } else {
        p.grounded = false;
      }

      if (p.y >= 10) this.completeMission('m_fly');
      if (p.y <= -1.5) this.completeMission('m_dig');

      this.animateCharacterRig(this.playerMesh, Math.hypot(p.vx, p.vz), elapsed, dt, {
        flying: p.flying,
        swimming: p.swimming,
        kickTimer: p.kickTimer,
        hugTimer: p.hugTimer,
      });

      if (p.kickTimer > 0) p.kickTimer = Math.max(0, p.kickTimer - dt);
      if (p.hugTimer > 0) p.hugTimer = Math.max(0, p.hugTimer - dt);

      this.playerMesh.position.set(p.x, p.y, p.z);
      this.playerMesh.rotation.y = p.yaw;
    }

    // Keep shadow frustum centered near player
    if (!this.isSoftwareGl) {
      const sx = Math.round(p.x / 4) * 4;
      const sz = Math.round(p.z / 4) * 4;
      this.sunLight.position.set(sx + 34, 58, sz + 28);
      this.sunLight.target.position.set(sx, 0, sz);
      this.sunLight.target.updateMatrixWorld();
    }

    // Police sirens & UFO rings
    this.vehicles.forEach((v) => {
      if (v.mesh.userData.sirenRed && v.mesh.userData.sirenBlue) {
        const blink = Math.sin(elapsed * 8) > 0;
        v.mesh.userData.sirenRed.material.emissiveIntensity = blink ? 2.4 : 0.2;
        v.mesh.userData.sirenBlue.material.emissiveIntensity = blink ? 0.2 : 2.4;
      }
      if (v.mesh.userData.ufoRing && v !== p.vehicle) {
        v.mesh.userData.ufoRing.rotation.y += dt * 1.2;
      }
    });

    // Doors Smooth Swing / Slide Animation
    for (let i = 0; i < this.doors.length; i += 1) {
      const d = this.doors[i];
      const goal = d.isOpen ? 1 : 0;
      d.animProgress = THREE.MathUtils.damp(d.animProgress, goal, 11, dt);
      const pivot = d.mesh.userData.movingPivot;
      if (pivot) {
        if (d.mesh.userData.isSliding) {
          pivot.position.x = d.animProgress * 0.78;
        } else {
          const dirSign = d.mesh.userData.mirror ? -1 : 1;
          pivot.rotation.y = dirSign * d.animProgress * 1.48;
        }
      }
    }

    this.updateNPCs(dt, elapsed);
    this.updateNearestContext();
    this.updateTargetVoxel();

    // Smooth Camera with Underground & Wall Pull-In Occlusion
    const focusY = p.y + (p.vehicle ? 1.5 : 1.45);
    _lookGoal.set(p.x, focusY, p.z);
    const distNow = p.vehicle ? this.camDist + 3.0 : this.camDist;
    _camGoal.set(
      p.x + Math.sin(this.camYaw) * Math.cos(this.camPitch) * distNow,
      focusY + Math.sin(this.camPitch) * distNow,
      p.z + Math.cos(this.camYaw) * Math.cos(this.camPitch) * distNow,
    );
    _camGoal.y = Math.max(this.voxelWorld.minY + 0.85, _camGoal.y);
    const clipDist = this.voxelWorld.getCameraClipDistance(_lookGoal, _camGoal);
    const fullDist = _camGoal.distanceTo(_lookGoal);
    if (clipDist < fullDist && fullDist > 0.2) {
      _camGoal.lerpVectors(_lookGoal, _camGoal, clipDist / fullDist);
    }

    this.camera.position.lerp(_camGoal, 1 - Math.exp(-12 * dt));
    this.camera.lookAt(_lookGoal);

    document.getElementById('hud-fuel-fill').style.width = `${Math.round(this.state.fuel)}%`;
    document.getElementById('hud-fuel-val').textContent = toFaNum(Math.round(this.state.fuel));
  }

  animateCharacterRig(mesh, speed, elapsed, dt, state = {}) {
    const rig = mesh.userData.rig;
    if (!rig) return;
    rig.setThrusterActive(Boolean(state.flying));

    if (rig.antL && rig.antR) {
      rig.antL.rotation.z = Math.sin(elapsed * 4.5) * 0.14;
      rig.antR.rotation.z = -Math.sin(elapsed * 4.5 + 0.6) * 0.14;
    }

    if (state.flying) {
      rig.bodyPivot.position.y = Math.sin(elapsed * 7) * 0.08;
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0.25, 10, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0.45, 10, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, -0.55, 10, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, -0.55, 10, dt);
      const flap = Math.sin(elapsed * 14) * 0.35;
      rig.wingAngelL.rotation.y = flap;
      rig.wingAngelR.rotation.y = -flap;
      rig.wingBatL.rotation.y = flap;
      rig.wingBatR.rotation.y = -flap;
      return;
    }

    if (state.swimming) {
      rig.bodyPivot.position.y = Math.sin(elapsed * 4) * 0.06;
      const stroke = Math.sin(elapsed * 7) * 0.65;
      rig.leftArm.rotation.x = -1.2 + stroke * 0.4;
      rig.rightArm.rotation.x = -1.2 - stroke * 0.4;
      rig.leftLeg.rotation.x = stroke * 0.45;
      rig.rightLeg.rotation.x = -stroke * 0.45;
      return;
    }

    if (state.kickTimer > 0) {
      rig.rightLeg.rotation.x = -1.45;
      rig.leftLeg.rotation.x = 0.15;
      return;
    }
    if (state.hugTimer > 0) {
      rig.leftArm.rotation.x = -1.15;
      rig.rightArm.rotation.x = -1.15;
      return;
    }

    if (speed > 0.25) {
      rig.walkPhase = (rig.walkPhase || 0) + dt * Math.min(13, 4.5 + speed * 1.15);
      const swing = Math.sin(rig.walkPhase) * 0.68;
      const bob = Math.abs(Math.sin(rig.walkPhase)) * 0.05;
      rig.bodyPivot.position.y = THREE.MathUtils.damp(rig.bodyPivot.position.y, bob, 14, dt);
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, swing, 16, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, -swing, 16, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, -swing * 0.72, 16, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, swing * 0.72, 16, dt);
    } else {
      const idle = Math.sin(elapsed * 2.4) * 0.04;
      rig.bodyPivot.position.y = THREE.MathUtils.damp(rig.bodyPivot.position.y, 0, 12, dt);
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 14, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 14, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, idle, 12, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, -idle, 12, dt);
    }
  }

  updateNPCs(dt, elapsed) {
    const p = this.playerState;
    for (let i = 0; i < this.npcs.length; i += 1) {
      const npc = this.npcs[i];
      if (npc.faintedTimer > 0) {
        npc.faintedTimer -= dt;
        if (npc.faintedTimer <= 0) {
          npc.hp = 100;
          npc.x = npc.homeX;
          npc.z = npc.homeZ;
          npc.y = this.voxelWorld.getTopSolidY(npc.x, npc.z) + 1;
          npc.mesh.rotation.x = 0;
        }
        continue;
      }

      let moveSpeed = 0;
      const distToPlayer = Math.hypot(p.x - npc.x, p.z - npc.z);
      if (npc.following) {
        if (distToPlayer > 3.0) {
          _targetPos.set(p.x, p.y, p.z);
          moveSpeed = distToPlayer > 7 ? 8.5 : 5.8;
          npc.y = THREE.MathUtils.lerp(npc.y, p.y, 1 - Math.exp(-5 * dt));
        }
      } else if (npc.hostile && distToPlayer < 13 && !p.vehicle) {
        _targetPos.set(p.x, npc.y, p.z);
        moveSpeed = distToPlayer > 1.8 ? 4.8 : 0;
        if (distToPlayer <= 2.1 && Math.abs(p.y - npc.y) < 1.8) {
          npc.attackCooldown -= dt;
          if (npc.attackCooldown <= 0) {
            npc.attackCooldown = 1.4;
            this.state.hp = Math.max(0, this.state.hp - 12);
            sakuraAudio.playKick();
            this.updateTopHud();
            if (this.state.hp <= 0) {
              this.state.hp = 100;
              p.x = -23;
              p.y = 1;
              p.z = 21;
              p.vy = 0;
              sakuraAudio.playHeal();
              this.updateTopHud();
              this.showToast('سلامتی شما در کلبه جنگلی بازیابی شد!');
            }
          }
        }
      } else {
        npc.wanderCooldown -= dt;
        if (npc.wanderCooldown <= 0) {
          npc.wanderCooldown = 3.5 + Math.random() * 4;
          const ang = Math.random() * Math.PI * 2;
          const rad = 2.5 + Math.random() * 4;
          npc.wanderTarget.x = npc.homeX + Math.cos(ang) * rad;
          npc.wanderTarget.z = npc.homeZ + Math.sin(ang) * rad;
        }
        const dw = Math.hypot(npc.wanderTarget.x - npc.x, npc.wanderTarget.z - npc.z);
        if (dw > 0.6) {
          _targetPos.set(npc.wanderTarget.x, npc.y, npc.wanderTarget.z);
          moveSpeed = 2.2;
        }
      }

      if (moveSpeed > 0.1) {
        if (npc.following) {
          for (let j = 0; j < this.doors.length; j += 1) {
            const d = this.doors[j];
            if (!d.isOpen && Math.hypot(d.ix - npc.x, d.iz - npc.z) < 2.0 && Math.abs(d.iy - npc.y) < 2.2) {
              this.setDoorOpen(d, true);
            }
          }
        }
        const dx = _targetPos.x - npc.x;
        const dz = _targetPos.z - npc.z;
        const d = Math.hypot(dx, dz);
        if (d > 0.2) {
          const vx = (dx / d) * moveSpeed;
          const vz = (dz / d) * moveSpeed;
          const res = this.voxelWorld.resolveEntityMovement(npc.x, npc.y, npc.z, vx, vz, dt);
          npc.x = res.x;
          npc.z = res.z;
          npc.y = THREE.MathUtils.lerp(npc.y, res.floorY, 1 - Math.exp(-8 * dt));
          npc.yaw = lerpAngle(npc.yaw, Math.atan2(dx, dz), 1 - Math.exp(-8 * dt));
        }
      }

      npc.mesh.position.set(npc.x, npc.y, npc.z);
      npc.mesh.rotation.y = npc.yaw;
      this.animateCharacterRig(npc.mesh, moveSpeed, elapsed + i, dt, { flying: false });
    }
  }

  updateNearestContext() {
    const p = this.playerState;
    const promptBtn = document.getElementById('context-prompt-btn');
    const actLabel = document.getElementById('act-interact-label');

    if (p.vehicle) {
      this.nearestTarget = null;
      promptBtn.classList.add('hidden');
      actLabel.textContent = 'پیاده شدن';
      return;
    }

    let best = null;
    let bestDist = 4.8;

    this.vehicles.forEach((v) => {
      const d = Math.hypot(v.x - p.x, v.z - p.z);
      if (d < bestDist && Math.abs(v.y - p.y) < 3.5) {
        bestDist = d;
        best = { kind: 'vehicle', vehicle: v, label: `سوار ${v.name} شو (C)` };
      }
    });

    this.npcs.forEach((npc) => {
      if (npc.faintedTimer > 0) return;
      const d = Math.hypot(npc.x - p.x, npc.z - p.z);
      if (d < bestDist && Math.abs(npc.y - p.y) < 2.2) {
        bestDist = d;
        best = { kind: 'npc', npc, label: `صحبت با ${npc.def.name} (E)` };
      }
    });

    this.interactiveZones.forEach((z) => {
      const d = Math.hypot(z.x - p.x, z.z - p.z);
      if (d < z.radius) {
        best = { kind: 'zone', zone: z, label: z.actionLabel };
      }
    });

    let bestDoorDist = 2.75;
    this.doors.forEach((door) => {
      const d = Math.hypot(door.ix - p.x, door.iz - p.z);
      if (d < bestDoorDist && Math.abs(door.iy - p.y) < 2.1) {
        bestDoorDist = d;
        best = {
          kind: 'door',
          door,
          label: door.isOpen ? `بستن ${door.name} (E)` : `باز کردن ${door.name} (E)`,
        };
      }
    });

    this.nearestTarget = best;
    if (best) {
      promptBtn.textContent = best.label;
      promptBtn.classList.remove('hidden');
      if (best.kind === 'vehicle') actLabel.textContent = 'سوار شدن';
      else if (best.kind === 'door') actLabel.textContent = best.door.isOpen ? 'بستن در' : 'باز کردن در';
      else actLabel.textContent = 'تعامل';
    } else {
      promptBtn.classList.add('hidden');
      actLabel.textContent = 'تعامل / سوار';
    }

    let zoneName = 'جنگل کره جنوبی';
    if (p.y <= -0.5) zoneName = 'اعماق زمین و غار معدن';
    else if (p.x >= 47) zoneName = 'دریا و ساحل شرق';
    else if (Math.hypot(p.x + 36, p.z + 32) < 13) zoneName = 'آبشار و دریاچه کوهستان';
    else if (Math.hypot(p.x + 56, p.z - 42) < 12) zoneName = 'منطقه فرود آدم فضایی‌ها';
    else if (Math.hypot(p.x, p.z + 18) < 10) zoneName = 'دبیرستان هانوک ساکورا';
    else if (Math.hypot(p.x + 23, p.z - 15) < 8) zoneName = 'کلبه جنگلی';
    else if (Math.hypot(p.x - 20, p.z - 14) < 8) zoneName = 'کافه آجری سئول';
    else if (Math.hypot(p.x - 28, p.z + 22) < 10) zoneName = 'قلعه یاکوزا';
    else if (Math.hypot(p.x + 24, p.z + 22) < 8) zoneName = 'دروازه معبد جنگل';

    document.getElementById('hud-zone-pill').textContent = zoneName;
  }

  updateTopHud() {
    const c = this.getActiveCharMeta();
    document.getElementById('hud-char-avatar').src = c.portrait;
    document.getElementById('hud-char-name').textContent = c.name;
    document.getElementById('hud-hp-fill').style.width = `${this.state.hp}%`;
    document.getElementById('hud-hp-val').textContent = toFaNum(this.state.hp);
    document.getElementById('hud-coins-val').textContent = toFaNum(this.state.coins);
    document.getElementById('hud-love-val').textContent = `${toFaNum(this.state.loveScore)}٪`;
    document.getElementById('phone-badge').textContent = toFaNum(this.state.chats.length);
  }

  completeMission(id) {
    if (this.state.completedMissions.includes(id)) return;
    const m = MISSIONS_LIST.find((x) => x.id === id);
    if (!m) return;
    this.state.completedMissions.push(id);
    this.state.coins += m.reward;
    sakuraAudio.playCoin();
    this.updateTopHud();
    this.showToast(`ماموریت انجام شد: ${m.title} (+${toFaNum(m.reward)} سکه)`);
  }

  capturePhoto() {
    sakuraAudio.playClick();
    try {
      this.renderer.render(this.scene, this.camera);
      const dataUrl = this.renderer.domElement.toDataURL('image/jpeg', 0.86);
      const zone = document.getElementById('hud-zone-pill').textContent;
      this.state.album.unshift({
        title: `خاطره در ${zone}`,
        img: dataUrl,
        date: `ثبت توسط ${this.getActiveCharMeta().name}`,
      });
      if (this.state.album.length > 16) this.state.album.pop();
      this.showToast('عکس در آلبوم خاطرات ذخیره شد!');
    } catch {
      this.showToast('ثبت عکس انجام نشد');
    }
  }

  openModal(title, htmlBuilder) {
    sakuraAudio.playClick();
    document.getElementById('modal-title').textContent = title;
    const body = document.getElementById('modal-body');
    body.innerHTML = '';
    htmlBuilder(body);
    document.getElementById('modal-backdrop').classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('modal-backdrop').classList.add('hidden');
  }

  openMenuModal() {
    this.openModal('منوی دنیای ماینکرفت کره جنوبی', (body) => {
      const expTitle = document.createElement('h3');
      expTitle.className = 'modal-section-title';
      expTitle.textContent = 'گسترش فضای جهان (نقشه نامحدود)';
      body.appendChild(expTitle);

      const sizeSide = this.voxelWorld.worldRadius * 2 + 1;
      const expCard = document.createElement('div');
      expCard.className = 'modal-card active-card';
      expCard.innerHTML = `
        <h4>وسعت فعلی جهان: ${toFaNum(sizeSide)} × ${toFaNum(sizeSide)} بلوک</h4>
        <p>می‌توانید فضای جنگل، دریا و کوهستان‌ها را بسیار بزرگ‌تر کنید (تا ${toFaNum(this.voxelWorld.maxRadius * 2 + 1)} بلوک).</p>
      `;
      const expBtn = document.createElement('button');
      expBtn.className = 'card-btn';
      const atMax = this.voxelWorld.worldRadius >= this.voxelWorld.maxRadius;
      expBtn.textContent = atMax ? 'حداکثر وسعت فعال شده است' : 'گسترش فضا (+۲۴ بلوک از هر طرف)';
      expBtn.disabled = atMax;
      expBtn.onclick = () => {
        const added = this.voxelWorld.expandWorldBy(24);
        if (added > 0) {
          this.applyTimeOfDay(this.timeOfDay);
          sakuraAudio.playSpawn();
          this.saveState(false);
          this.openMenuModal();
          this.showToast(`جهان به ${toFaNum(this.voxelWorld.worldRadius * 2 + 1)} بلوک گسترش یافت!`);
        }
      };
      expCard.appendChild(expBtn);
      body.appendChild(expCard);

      const todTitle = document.createElement('h3');
      todTitle.className = 'modal-section-title';
      todTitle.textContent = 'زمان و نورپردازی جنگل';
      body.appendChild(todTitle);

      const todGrid = document.createElement('div');
      todGrid.className = 'modal-grid';
      [
        { id: 'day', name: 'روز بهاری جنگل', desc: 'آفتاب شفاف میان درختان کاج و ساکورا' },
        { id: 'sunset', name: 'غروب صورتی کره', desc: 'نور نارنجی و صورتی رمانتیک' },
        { id: 'night', name: 'شب جنگلی با فانوس‌ها', desc: 'شب پرستاره با فانوس‌های روشن هانوک' },
      ].forEach((t) => {
        const card = document.createElement('div');
        card.className = `modal-card ${this.timeOfDay === t.id ? 'active-card' : ''}`;
        card.innerHTML = `<h4>${t.name}</h4><p>${t.desc}</p>`;
        const btn = document.createElement('button');
        btn.className = 'card-btn';
        btn.textContent = this.timeOfDay === t.id ? 'فعال است' : 'انتخاب';
        btn.onclick = () => {
          this.applyTimeOfDay(t.id);
          this.closeModal();
          this.showToast(`زمان بازی به ${t.name} تغییر کرد`);
        };
        card.appendChild(btn);
        todGrid.appendChild(card);
      });
      body.appendChild(todGrid);

      const mapTitle = document.createElement('h3');
      mapTitle.className = 'modal-section-title';
      mapTitle.textContent = 'جابه‌جایی سریع در جهان (Teleport)';
      body.appendChild(mapTitle);

      const mapGrid = document.createElement('div');
      mapGrid.className = 'modal-grid';
      TELEPORT_LOCATIONS.forEach((loc) => {
        const card = document.createElement('div');
        card.className = 'modal-card';
        card.innerHTML = `<h4>${loc.name}</h4><p>${loc.desc}</p>`;
        const btn = document.createElement('button');
        btn.className = 'card-btn';
        btn.textContent = 'انتقال به اینجا';
        btn.onclick = () => {
          if (this.playerState.vehicle) this.toggleVehicleBoard();
          this.playerState.x = loc.x;
          this.playerState.z = loc.z;
          this.playerState.y = Math.max(loc.y, this.voxelWorld.getTopSolidY(loc.x, loc.z) + 1);
          this.playerState.vy = 0;
          this.playerState.hoverMode = false;
          this.playerState.yaw = loc.rot;
          this.camYaw = loc.rot + Math.PI;
          this.updateHoverButtonUI();
          sakuraAudio.playSpawn();
          this.closeModal();
          this.showToast(`انتقال به ${loc.name}`);
        };
        card.appendChild(btn);
        mapGrid.appendChild(card);
      });
      body.appendChild(mapGrid);

      const sysTitle = document.createElement('h3');
      sysTitle.className = 'modal-section-title';
      sysTitle.textContent = 'ذخیره‌سازی در مرورگر و بازنشانی';
      body.appendChild(sysTitle);

      const sysGrid = document.createElement('div');
      sysGrid.className = 'modal-grid';

      const saveCard = document.createElement('div');
      saveCard.className = 'modal-card';
      saveCard.innerHTML = '<h4>ذخیره کامل وضعیت بازی</h4><p>تمام تغییرات زمین، بلوک‌ها، درها، موقعیت، وسعت جهان، سکه‌ها و ماموریت‌ها در مرورگر ذخیره می‌شود.</p>';
      const saveBtn = document.createElement('button');
      saveBtn.className = 'card-btn';
      saveBtn.textContent = 'ذخیره در مرورگر';
      saveBtn.onclick = () => {
        this.saveState(true);
      };
      saveCard.appendChild(saveBtn);

      const resetCard = document.createElement('div');
      resetCard.className = 'modal-card';
      resetCard.innerHTML = '<h4>بازنشانی جنگل و حذف ذخیره</h4><p>بازگرداندن جهان به حالت اولیه و شروع دوباره.</p>';
      const resetBtn = document.createElement('button');
      resetBtn.className = 'card-btn secondary';
      resetBtn.textContent = 'شروع مجدد';
      resetBtn.onclick = () => {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(LEGACY_SAVE_KEY);
        window.location.reload();
      };
      resetCard.appendChild(resetBtn);

      sysGrid.appendChild(saveCard);
      sysGrid.appendChild(resetCard);
      body.appendChild(sysGrid);
    });
  }

  openCharaMakeModal() {
    this.openModal('تغییر شخصیت، لباس و بال پرواز', (body) => {
      const cTitle = document.createElement('h3');
      cTitle.className = 'modal-section-title';
      cTitle.textContent = 'انتخاب شخصیت قابل کنترل';
      body.appendChild(cTitle);

      const cGrid = document.createElement('div');
      cGrid.className = 'modal-grid';
      PLAYABLE_CHARACTERS.forEach((ch) => {
        const active = ch.id === this.state.activeCharId;
        const card = document.createElement('div');
        card.className = `modal-card ${active ? 'active-card' : ''}`;
        card.innerHTML = `<h4>${ch.name}</h4><p>${ch.role}</p>`;
        const btn = document.createElement('button');
        btn.className = 'card-btn';
        btn.textContent = active ? 'فعال است' : 'انتخاب شخصیت';
        btn.onclick = () => {
          this.state.activeCharId = ch.id;
          this.rebuildPlayerMesh();
          this.openCharaMakeModal();
        };
        card.appendChild(btn);
        cGrid.appendChild(card);
      });
      body.appendChild(cGrid);

      const fTitle = document.createElement('h3');
      fTitle.className = 'modal-section-title';
      fTitle.textContent = 'تجهیزات پرواز';
      body.appendChild(fTitle);

      const fGrid = document.createElement('div');
      fGrid.className = 'modal-grid';
      const curWing = this.state.charWings[this.state.activeCharId] || 'jetpack';
      FLIGHT_GEARS.forEach((fg) => {
        const card = document.createElement('div');
        card.className = `modal-card ${curWing === fg.id ? 'active-card' : ''}`;
        card.innerHTML = `<h4>${fg.name}</h4>`;
        const btn = document.createElement('button');
        btn.className = 'card-btn';
        btn.textContent = curWing === fg.id ? 'مجهز است' : 'انتخاب';
        btn.onclick = () => {
          this.state.charWings[this.state.activeCharId] = fg.id;
          this.rebuildPlayerMesh();
          this.openCharaMakeModal();
        };
        card.appendChild(btn);
        fGrid.appendChild(card);
      });
      body.appendChild(fGrid);

      const oTitle = document.createElement('h3');
      oTitle.className = 'modal-section-title';
      oTitle.textContent = 'کمد لباس‌ها';
      body.appendChild(oTitle);

      const oGrid = document.createElement('div');
      oGrid.className = 'modal-grid';
      const curOutfit = this.state.charOutfits[this.state.activeCharId];
      OUTFITS.forEach((of) => {
        const owned = this.state.ownedOutfits.includes(of.id);
        const eq = curOutfit === of.id;
        const card = document.createElement('div');
        card.className = `modal-card ${eq ? 'active-card' : ''}`;
        card.innerHTML = `<h4>${of.name}</h4><p>${owned ? 'موجود در کمد' : `${toFaNum(of.price)} سکه`}</p>`;
        const btn = document.createElement('button');
        btn.className = 'card-btn';
        btn.textContent = eq ? 'پوشیده شده' : owned ? 'پوشیدن' : 'خرید و پوشیدن';
        btn.onclick = () => {
          if (!owned) {
            if (this.state.coins < of.price) {
              this.showToast('سکه کافی ندارید!');
              return;
            }
            this.state.coins -= of.price;
            this.state.ownedOutfits.push(of.id);
          }
          this.state.charOutfits[this.state.activeCharId] = of.id;
          this.rebuildPlayerMesh();
          this.openCharaMakeModal();
        };
        card.appendChild(btn);
        oGrid.appendChild(card);
      });
      body.appendChild(oGrid);
    });
  }

  openMaterialsModal(filterCat = 'all') {
    this.openModal('بلوک‌ها، گیاهان، گل‌ها و درهای ساخت‌وساز', (body) => {
      const filterBar = document.createElement('div');
      filterBar.style.display = 'flex';
      filterBar.style.flexWrap = 'wrap';
      filterBar.style.gap = '6px';
      [
        { id: 'all', name: 'همه موارد' },
        { id: 'block', name: 'بلوک‌های ساختمانی و فضایی' },
        { id: 'plant', name: 'گیاهان، چمن و گل‌ها' },
        { id: 'door', name: 'درهای بازشو' },
      ].forEach((tab) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `card-btn ${filterCat === tab.id ? '' : 'secondary'}`;
        b.style.marginTop = '0';
        b.textContent = tab.name;
        b.onclick = () => this.openMaterialsModal(tab.id);
        filterBar.appendChild(b);
      });
      body.appendChild(filterBar);

      const all = [...HOTBAR_BLOCKS, ...EXTRA_BLOCKS].filter(
        (b) => filterCat === 'all' || b.category === filterCat,
      );
      const grid = document.createElement('div');
      grid.className = 'modal-grid';
      all.forEach((blk) => {
        const curId = this.state.customBlockId || (HOTBAR_BLOCKS[this.state.selectedSlot] || HOTBAR_BLOCKS[0]).id;
        const active = curId === blk.id;
        const card = document.createElement('div');
        card.className = `modal-card ${active ? 'active-card' : ''}`;
        card.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px">
            <span style="width:26px;height:26px;border-radius:6px;background:${blk.color};border:2px solid #cbd5e1;display:inline-block"></span>
            <h4>${blk.name}</h4>
          </div>
        `;
        const btn = document.createElement('button');
        btn.className = 'card-btn';
        btn.textContent = active ? 'انتخاب شده' : 'انتخاب این مورد';
        btn.onclick = () => {
          const hotIdx = HOTBAR_BLOCKS.findIndex((h) => h.id === blk.id);
          if (hotIdx >= 0) {
            this.state.selectedSlot = hotIdx;
            this.state.customBlockId = null;
          } else {
            this.state.customBlockId = blk.id;
          }
          this.renderHotbar();
          this.closeModal();
          this.showToast(`انتخاب فعال: ${blk.name}`);
        };
        card.appendChild(btn);
        grid.appendChild(card);
      });
      body.appendChild(grid);
    });
  }

  openPropsModal() {
    this.openModal('ساخت خانه آماده و اشیا در جنگل', (body) => {
      const info = document.createElement('p');
      info.style.margin = '0';
      info.style.fontSize = '0.84rem';
      info.textContent = 'می‌توانید با ابزارهای ساخت (دیوار ۳×۳، کف ۳×۳، ستون ۱×۴، پله‌ساز، دربازکن) یا سازه‌های آماده زیر خانه و شهر کره‌ای خودتان را بسازید (و با Z بازگردانی کنید)!';
      body.appendChild(info);

      const grid = document.createElement('div');
      grid.className = 'modal-grid';
      PROPS_CATALOG.forEach((pr) => {
        const card = document.createElement('div');
        card.className = 'modal-card';
        card.innerHTML = `<h4>${pr.code} · ${pr.name}</h4><p>${pr.desc}</p>`;
        const btn = document.createElement('button');
        btn.className = 'card-btn';
        btn.textContent = 'ساخت روبه‌رو';
        btn.onclick = () => {
          const p = this.playerState;
          if (pr.isDoorProp) {
            const dx = Math.round(p.x + Math.sin(p.yaw) * 2.5);
            const dz = Math.round(p.z + Math.cos(p.yaw) * 2.5);
            const dy = this.voxelWorld.getTopSolidY(dx, dz) + 1;
            const door = this.spawnDoorAt(dx, dy, dz, p.yaw, pr.doorStyle || 'korean_wood', false, true);
            if (door) {
              sakuraAudio.playBlockPlace();
              this.closeModal();
              this.showToast(`${door.name} نصب شد! با کلید E باز و بسته کنید`);
            } else {
              this.showToast('در این نقطه قبلا یک در نصب شده است');
            }
            return;
          }
          if (pr.isBlueprint) {
            const dist = pr.id === 'seoul_villa' ? 9 : 7;
            const cx = Math.round(p.x + Math.sin(p.yaw) * dist);
            const cz = Math.round(p.z + Math.cos(p.yaw) * dist);
            const by = this.voxelWorld.getTopSolidY(cx, cz) + 1;
            const anchors = this.voxelWorld.spawnBlueprint(pr.id, cx, by, cz, p.yaw) || [];
            const doorIds = [];
            anchors.forEach((a) => {
              const d = this.spawnDoorAt(a.ix, a.iy, a.iz, a.yaw || 0, a.style || 'korean_wood', Boolean(a.mirror), false);
              if (d) doorIds.push(d.id);
            });
            this.actionTimeline.push({ kind: 'blueprint', doorIds });
            if (this.actionTimeline.length > 40) this.actionTimeline.shift();
            sakuraAudio.playBlockPlace();
            this.completeMission('m_house');
            this.closeModal();
            this.showToast(`${pr.name} همراه با در بازشو ساخته شد! (بازگردانی با Z)`);
            return;
          }

          const mesh = buildPropsItem(pr.id);
          const sx = p.x + Math.sin(p.yaw) * 3.8;
          const sz = p.z + Math.cos(p.yaw) * 3.8;
          const sy = this.voxelWorld.getTopSolidY(sx, sz) + 1;
          mesh.position.set(sx, sy, sz);
          mesh.rotation.y = p.yaw;
          this.scene.add(mesh);
          this.spawnedProps.push(mesh);
          sakuraAudio.playSpawn();
          this.closeModal();
          this.showToast(`${pr.name} ساخته شد!`);
        };
        card.appendChild(btn);
        grid.appendChild(card);
      });
      body.appendChild(grid);
    });
  }

  openShopModal() {
    this.openModal('کافه آجری سئول در جنگل', (body) => {
      const grid = document.createElement('div');
      grid.className = 'modal-grid';
      SHOP_ITEMS.forEach((item) => {
        const qty = this.state.inventory[item.id] || 0;
        const card = document.createElement('div');
        card.className = 'modal-card';
        card.innerHTML = `<h4>${item.icon} ${item.name}</h4><p>قیمت: ${toFaNum(item.price)} سکه · موجودی: ${toFaNum(qty)}</p>`;

        const buyBtn = document.createElement('button');
        buyBtn.className = 'card-btn';
        buyBtn.textContent = `خرید (${toFaNum(item.price)} سکه)`;
        buyBtn.onclick = () => {
          if (this.state.coins < item.price) {
            this.showToast('سکه کافی ندارید!');
            return;
          }
          this.state.coins -= item.price;
          this.state.inventory[item.id] = (this.state.inventory[item.id] || 0) + 1;
          sakuraAudio.playCoin();
          this.updateTopHud();
          this.openShopModal();
        };
        card.appendChild(buyBtn);

        if (qty > 0 && item.heal > 0) {
          const eatBtn = document.createElement('button');
          eatBtn.className = 'card-btn secondary';
          eatBtn.textContent = `مصرف (+${toFaNum(item.heal)} سلامتی)`;
          eatBtn.onclick = () => {
            this.state.inventory[item.id] -= 1;
            this.state.hp = Math.min(100, this.state.hp + item.heal);
            this.state.fuel = 100;
            sakuraAudio.playHeal();
            this.updateTopHud();
            this.openShopModal();
          };
          card.appendChild(eatBtn);
        }
        grid.appendChild(card);
      });
      body.appendChild(grid);
    });
  }

  openPhoneModal() {
    this.openModal('گوشی هوشمند کی‌چت و ماموریت‌ها', (body) => {
      const mTitle = document.createElement('h3');
      mTitle.className = 'modal-section-title';
      mTitle.textContent = 'ماموریت‌های جنگل کره جنوبی';
      body.appendChild(mTitle);

      const mGrid = document.createElement('div');
      mGrid.className = 'modal-grid';
      MISSIONS_LIST.forEach((m) => {
        const done = this.state.completedMissions.includes(m.id);
        const card = document.createElement('div');
        card.className = `modal-card ${done ? 'active-card' : ''}`;
        card.innerHTML = `<h4>${done ? '✅ ' : ''}${m.title}</h4><p>${m.desc}</p><p><strong>پاداش: ${toFaNum(m.reward)} سکه</strong></p>`;
        mGrid.appendChild(card);
      });
      body.appendChild(mGrid);

      const cTitle = document.createElement('h3');
      cTitle.className = 'modal-section-title';
      cTitle.textContent = 'پیام‌های کی‌چت';
      body.appendChild(cTitle);

      this.state.chats.forEach((ch) => {
        const card = document.createElement('div');
        card.className = 'modal-card';
        card.innerHTML = `<h4>${ch.sender} (${ch.time})</h4><p>${ch.text}</p>`;
        body.appendChild(card);
      });
    });
  }

  openAlbumModal() {
    this.openModal('آلبوم عکس جنگل ساکورا', (body) => {
      const grid = document.createElement('div');
      grid.className = 'modal-grid';
      this.state.album.forEach((pic) => {
        const card = document.createElement('div');
        card.className = 'modal-card';
        card.innerHTML = `<img class="album-img" src="${pic.img}" alt="${pic.title}" /><h4>${pic.title}</h4><p>${pic.date}</p>`;
        grid.appendChild(card);
      });
      body.appendChild(grid);
    });
  }

  showToast(msg) {
    const el = document.getElementById('toast-banner');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      el.classList.add('hidden');
    }, 3000);
  }

  saveState(notify = false) {
    try {
      const payload = {
        version: 2,
        state: this.state,
        timeOfDay: this.timeOfDay,
        hotbarCollapsed: this.hotbarCollapsed,
        player: {
          x: this.playerState.x,
          y: this.playerState.y,
          z: this.playerState.z,
          yaw: this.playerState.yaw,
          hoverMode: this.playerState.hoverMode,
        },
        doors: this.doors.map((d) => ({
          ix: d.ix,
          iy: d.iy,
          iz: d.iz,
          yaw: d.yaw,
          style: d.style,
          mirror: d.mirror,
          isOpen: d.isOpen,
        })),
        world: this.voxelWorld.exportWorldState(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      if (notify) this.showToast('تمام وضعیت بازی در مرورگر ذخیره شد!');
    } catch {
      if (notify) this.showToast('خطا در ذخیره وضعیت در مرورگر');
    }
  }

  loadSavedState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      if (parsed && parsed.version === 2) {
        this.state = { ...this.state, ...(parsed.state || {}) };
        if (parsed.world) {
          this.voxelWorld.importWorldState(parsed.world);
        }
        if (Array.isArray(parsed.doors)) {
          // Clear current doors and restore saved door layout
          [...this.doors].forEach((d) => this.removeDoorById(d.id, false));
          parsed.doors.forEach((ds) => {
            const spawned = this.spawnDoorAt(ds.ix, ds.iy, ds.iz, ds.yaw, ds.style, ds.mirror, false);
            if (spawned && ds.isOpen) {
              this.setDoorOpen(spawned, true);
              spawned.animProgress = 1;
            }
          });
        }
        if (parsed.player) {
          this.playerState.x = parsed.player.x ?? 0;
          this.playerState.y = parsed.player.y ?? 1;
          this.playerState.z = parsed.player.z ?? 7;
          this.playerState.yaw = parsed.player.yaw ?? Math.PI;
          this.playerState.hoverMode = Boolean(parsed.player.hoverMode);
          this.camYaw = this.playerState.yaw + Math.PI;
        }
        if (parsed.timeOfDay) {
          this.applyTimeOfDay(parsed.timeOfDay);
        }
        if (typeof parsed.hotbarCollapsed === 'boolean') {
          this.setHotbarCollapsed(parsed.hotbarCollapsed);
        }
      } else {
        this.state = { ...this.state, ...parsed };
      }

      this.rebuildPlayerMesh();
      this.updateTopHud();
      this.renderHotbar();
      this.updateHoverButtonUI();
    } catch {
      // Ignore corrupt save
    }
  }

  checkSavedState() {
    try {
      if (localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY)) {
        document.getElementById('btn-continue-save').classList.remove('hidden');
      }
    } catch {
      // Ignore storage read errors
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new KoreanForestMinecraftApp();
});
