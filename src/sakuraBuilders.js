import * as THREE from 'three';
import { createPetalTexture } from './sakuraTextures.js';

function makeMat(color, roughness = 0.65, metalness = 0.06, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    ...extra,
  });
}

function setShadow(obj, cast = true, receive = true) {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}

// Minecraft-Voxel Korean Anime Character (multi-part articulated THREE.Group)
export function buildAnimeCharacter(cfg) {
  const root = new THREE.Group();

  const skinMat = makeMat(cfg.skinColor || '#fde2d2', 0.72, 0.02);
  const hairMat = makeMat(cfg.hairColor || '#1b1d26', 0.55, 0.05);
  const topMat = makeMat(cfg.topColor || '#24344d', 0.68, 0.04);
  const accentMat = makeMat(cfg.accentColor || '#ff5e99', 0.5, 0.1);
  const bottomMat = makeMat(cfg.bottomColor || '#314463', 0.72, 0.04);
  const shoeMat = makeMat('#1f2937', 0.45, 0.15);
  const eyeMat = makeMat(cfg.eyeColor || '#2a1d33', 0.2, 0.1);
  const whiteMat = makeMat('#ffffff', 0.25, 0.05);
  const blushMat = makeMat('#ff8fab', 0.8, 0.0);

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const torso = new THREE.Group();
  torso.position.y = 0.92;
  bodyPivot.add(torso);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.58, 0.28), topMat);
  chest.position.y = 0.24;
  torso.add(chest);

  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.29), whiteMat);
  collar.position.set(0, 0.48, 0.01);
  torso.add(collar);

  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.05), accentMat);
  tie.position.set(0, 0.32, 0.155);
  torso.add(tie);

  const pelvis = new THREE.Mesh(
    new THREE.BoxGeometry(cfg.skirt ? 0.56 : 0.48, 0.22, cfg.skirt ? 0.34 : 0.27),
    bottomMat,
  );
  pelvis.position.y = -0.08;
  torso.add(pelvis);

  // Voxel Anime Head
  const head = new THREE.Group();
  head.position.set(0, 0.78, 0);
  torso.add(head);

  const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.5), skinMat);
  head.add(cranium);

  const eyeGeo = new THREE.BoxGeometry(0.085, 0.1, 0.03);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.11, -0.02, 0.255);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.11;
  head.add(eyeL, eyeR);

  const glintGeo = new THREE.BoxGeometry(0.035, 0.035, 0.02);
  const glintL = new THREE.Mesh(glintGeo, whiteMat);
  glintL.position.set(-0.095, 0.005, 0.268);
  const glintR = glintL.clone();
  glintR.position.x = 0.125;
  head.add(glintL, glintR);

  const blushGeo = new THREE.BoxGeometry(0.08, 0.035, 0.02);
  const blushL = new THREE.Mesh(blushGeo, blushMat);
  blushL.position.set(-0.15, -0.1, 0.252);
  const blushR = blushL.clone();
  blushR.position.x = 0.15;
  head.add(blushL, blushR);

  // Blocky Hair Layer
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.54), hairMat);
  hairTop.position.set(0, 0.23, 0);
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.16), hairMat);
  hairBack.position.set(0, -0.02, -0.22);
  const hairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.34, 0.44), hairMat);
  hairSideL.position.set(-0.24, 0.05, 0);
  const hairSideR = hairSideL.clone();
  hairSideR.position.x = 0.24;
  const bang = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.13, 0.08), hairMat);
  bang.position.set(0, 0.14, 0.24);
  head.add(hairTop, hairBack, hairSideL, hairSideR, bang);

  const hairStyle = cfg.hairStyle || 'short';
  if (hairStyle === 'ponytail') {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), hairMat);
    tail.position.set(0, -0.04, -0.34);
    head.add(tail);
  } else if (hairStyle === 'twintails') {
    const tL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.46, 0.14), hairMat);
    tL.position.set(-0.32, -0.06, -0.08);
    const tR = tL.clone();
    tR.position.x = 0.32;
    head.add(tL, tR);
  } else if (hairStyle === 'spiky') {
    for (let i = -1; i <= 1; i += 1) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.18), hairMat);
      sp.position.set(i * 0.15, 0.34, 0.04);
      head.add(sp);
    }
  }

  function buildArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.34, 0.48, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.2), topMat);
    sleeve.position.y = -0.16;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.18), skinMat);
    hand.position.y = -0.42;
    pivot.add(sleeve, hand);
    torso.add(pivot);
    return pivot;
  }

  function buildLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.13, 0.8, 0);
    const legMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.56, 0.22),
      cfg.skirt ? skinMat : bottomMat,
    );
    legMesh.position.y = -0.28;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.22, 0.26), shoeMat);
    shoe.position.set(0, -0.68, 0.02);
    pivot.add(legMesh, shoe);
    bodyPivot.add(pivot);
    return pivot;
  }

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);
  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  // Voxel Back Flight Gear
  const backGearHost = new THREE.Group();
  backGearHost.position.set(0, 0.24, -0.2);
  torso.add(backGearHost);

  const jetpackGroup = new THREE.Group();
  const jpCore = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.14), makeMat('#334155', 0.4, 0.65));
  const podL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), makeMat('#38bdf8', 0.3, 0.6));
  podL.position.set(-0.12, -0.02, -0.04);
  const podR = podL.clone();
  podR.position.x = 0.12;
  const flameMat = new THREE.MeshStandardMaterial({
    color: '#7dd3fc',
    emissive: '#38bdf8',
    emissiveIntensity: 2.2,
    roughness: 0.2,
  });
  const flameL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), flameMat);
  flameL.position.set(-0.12, -0.34, -0.04);
  const flameR = flameL.clone();
  flameR.position.x = 0.12;
  flameL.visible = false;
  flameR.visible = false;
  jetpackGroup.add(jpCore, podL, podR, flameL, flameR);

  const angelGroup = new THREE.Group();
  const wingFeatherMat = makeMat('#fff5f9', 0.45, 0.1, { emissive: '#ff9ec4', emissiveIntensity: 0.25 });
  const wingAngelL = new THREE.Group();
  wingAngelL.position.set(-0.08, 0.08, 0);
  const wL1 = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.2, 0.06), wingFeatherMat);
  wL1.position.set(-0.28, 0.08, -0.04);
  wingAngelL.add(wL1);
  const wingAngelR = wingAngelL.clone();
  wingAngelR.scale.x = -1;
  wingAngelR.position.x = 0.08;
  angelGroup.add(wingAngelL, wingAngelR);

  const batGroup = new THREE.Group();
  const batMat = makeMat('#6b21a8', 0.4, 0.25, { emissive: '#9333ea', emissiveIntensity: 0.35 });
  const wingBatL = new THREE.Group();
  wingBatL.position.set(-0.08, 0.08, 0);
  const bL = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.06), batMat);
  bL.position.set(-0.3, 0.08, -0.04);
  wingBatL.add(bL);
  const wingBatR = wingBatL.clone();
  wingBatR.scale.x = -1;
  wingBatR.position.x = 0.08;
  batGroup.add(wingBatL, wingBatR);

  const bagGroup = new THREE.Group();
  const bagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.16), makeMat('#fb7185', 0.7, 0.04));
  bagGroup.add(bagMesh);

  backGearHost.add(jetpackGroup, angelGroup, batGroup, bagGroup);

  function setFlightGear(gearId) {
    jetpackGroup.visible = gearId === 'jetpack';
    angelGroup.visible = gearId === 'angel';
    batGroup.visible = gearId === 'bat';
    bagGroup.visible = gearId === 'bag';
  }
  setFlightGear(cfg.wing || 'jetpack');

  setShadow(root, true, false);

  root.userData.rig = {
    bodyPivot,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    flameL,
    flameR,
    wingAngelL,
    wingAngelR,
    wingBatL,
    wingBatR,
    setFlightGear,
    setThrusterActive(active) {
      flameL.visible = active;
      flameR.visible = active;
    },
  };

  return root;
}

// Voxel-styled Drivable Vehicles
export function buildVehicle(type, customColor) {
  const root = new THREE.Group();
  const wheels = [];

  if (type === 'sports' || type === 'police') {
    const isPolice = type === 'police';
    const chassisMat = makeMat(isPolice ? '#f8fafc' : customColor || '#fff5f8', 0.3, 0.55);
    const trimMat = makeMat(isPolice ? '#111827' : '#ff5e99', 0.4, 0.4);
    const glassMat = makeMat('#0f172a', 0.15, 0.3, { transparent: true, opacity: 0.75 });
    const tireMat = makeMat('#18181b', 0.85, 0.1);
    const rimMat = makeMat('#e2e8f0', 0.25, 0.85);

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.58, 4.0), chassisMat);
    base.position.y = 0.62;
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.28, 0.45), trimMat);
    bumper.position.set(0, 0.46, 1.9);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.62, 1.95), chassisMat);
    cabin.position.set(0, 1.2, -0.15);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.48, 2.04), glassMat);
    windshield.position.set(0, 1.18, -0.14);
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.14, 0.35), trimMat);
    spoiler.position.set(0, 1.1, -1.85);

    const headMat = makeMat('#fef08a', 0.2, 0.1, { emissive: '#fef08a', emissiveIntensity: 1.5 });
    const headL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.1), headMat);
    headL.position.set(-0.66, 0.66, 2.02);
    const headR = headL.clone();
    headR.position.x = 0.66;
    root.add(base, bumper, cabin, windshield, spoiler, headL, headR);

    if (isPolice) {
      const sirenRed = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.2, 0.25),
        makeMat('#ef4444', 0.2, 0.2, { emissive: '#ef4444', emissiveIntensity: 2.0 }),
      );
      sirenRed.position.set(-0.26, 1.6, -0.1);
      const sirenBlue = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.2, 0.25),
        makeMat('#3b82f6', 0.2, 0.2, { emissive: '#3b82f6', emissiveIntensity: 2.0 }),
      );
      sirenBlue.position.set(0.26, 1.6, -0.1);
      root.add(sirenRed, sirenBlue);
      root.userData.sirenRed = sirenRed;
      root.userData.sirenBlue = sirenBlue;
    }

    [
      [-1.02, 0.36, 1.25],
      [1.02, 0.36, 1.25],
      [-1.02, 0.36, -1.25],
      [1.02, 0.36, -1.25],
    ].forEach(([wx, wy, wz]) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, wy, wz);
      const tire = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.7), tireMat);
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.36), rimMat);
      wGroup.add(tire, rim);
      root.add(wGroup);
      wheels.push(wGroup);
    });
  } else if (type === 'bike') {
    const frameMat = makeMat(customColor || '#fb7185', 0.35, 0.5);
    const tireMat = makeMat('#1f2937', 0.85, 0.1);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.24), frameMat);
    bar.position.y = 0.62;
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.08), makeMat('#cbd5e1', 0.3, 0.8));
    handle.position.set(0, 1.02, 0.48);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.3), makeMat('#334155', 0.6, 0.1));
    seat.position.set(0, 0.86, -0.28);
    root.add(bar, handle, seat);

    [0.62, -0.62].forEach((wz) => {
      const wg = new THREE.Group();
      wg.position.set(0, 0.34, wz);
      const tire = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.64, 0.64), tireMat);
      wg.add(tire);
      root.add(wg);
      wheels.push(wg);
    });
  } else if (type === 'heli') {
    const bodyMat = makeMat(customColor || '#f43f5e', 0.35, 0.45);
    const glassMat = makeMat('#0f172a', 0.15, 0.3, { transparent: true, opacity: 0.75 });
    const metalMat = makeMat('#e2e8f0', 0.3, 0.8);

    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.8), bodyMat);
    hull.position.y = 1.25;
    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.1), glassMat);
    cockpit.position.set(0, 1.32, 1.1);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 2.4), bodyMat);
    tail.position.set(0, 1.38, -2.2);

    [-0.78, 0.78].forEach((sx) => {
      const skid = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 2.8), metalMat);
      skid.position.set(sx, 0.1, 0.1);
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.1), metalMat);
      st.position.set(sx, 0.4, 0.6);
      const st2 = st.clone();
      st2.position.z = -0.6;
      root.add(skid, st, st2);
    });

    const rotorHub = new THREE.Group();
    rotorHub.position.set(0, 2.15, 0);
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.06, 0.24), metalMat);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 5.0), metalMat);
    rotorHub.add(b1, b2);

    const tailRotor = new THREE.Group();
    tailRotor.position.set(0.24, 1.4, -3.3);
    const tb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.88, 0.14), metalMat);
    tailRotor.add(tb);

    root.add(hull, cockpit, tail, rotorHub, tailRotor);
    root.userData.rotorHub = rotorHub;
    root.userData.tailRotor = tailRotor;
  } else if (type === 'ufo') {
    const hullMat = makeMat(customColor || '#94a3b8', 0.22, 0.85);
    const domeMat = makeMat('#a855f7', 0.15, 0.2, {
      transparent: true,
      opacity: 0.72,
      emissive: '#7e22ce',
      emissiveIntensity: 0.4,
    });
    const neonMat = makeMat('#22d3ee', 0.2, 0.1, {
      emissive: '#22d3ee',
      emissiveIntensity: 1.8,
    });

    const saucerRing = new THREE.Group();
    const outerDisc = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.42, 4.4), hullMat);
    outerDisc.position.y = 1.15;
    const midDisc = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 3.2), hullMat);
    midDisc.position.y = 1.35;
    const glowRim = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.16, 4.6), neonMat);
    glowRim.position.y = 1.08;

    const dome = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 2.0), domeMat);
    dome.position.y = 1.95;

    const beamPad = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 1.4), neonMat);
    beamPad.position.y = 0.82;

    [
      [-1.3, 0.45, 1.3],
      [1.3, 0.45, 1.3],
      [0, 0.45, -1.5],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.18), hullMat);
      leg.position.set(lx, ly, lz);
      root.add(leg);
    });

    saucerRing.add(outerDisc, glowRim);
    root.add(saucerRing, midDisc, dome, beamPad);
    root.userData.ufoRing = saucerRing;
  }

  setShadow(root, true, true);
  root.userData.wheels = wheels;
  root.userData.vehicleType = type;
  return root;
}

export function buildPropsItem(propId) {
  const g = new THREE.Group();
  const woodMat = makeMat('#a3683b', 0.75, 0.04);
  const pinkMat = makeMat('#ff8fab', 0.65, 0.04);
  const stoneMat = makeMat('#7c8594', 0.78, 0.05);

  if (propId === 'sakura_arch') {
    const pL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.5, 0.5), woodMat);
    pL.position.set(-1.6, 1.75, 0);
    const pR = pL.clone();
    pR.position.x = 1.6;
    const top = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 0.8), pinkMat);
    top.position.set(0, 3.6, 0);
    g.add(pL, pR, top);
  } else if (propId === 'trampoline') {
    const rim = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 2.6), makeMat('#3b82f6', 0.5, 0.2));
    rim.position.y = 0.2;
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.45, 2.1),
      makeMat('#ff5e99', 0.5, 0.1, { emissive: '#ff5e99', emissiveIntensity: 0.25 }),
    );
    pad.position.y = 0.24;
    g.add(rim, pad);
    g.userData.isTrampoline = true;
  } else if (propId === 'bench') {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.7), woodMat);
    seat.position.y = 0.45;
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.15), woodMat);
    back.position.set(0, 0.75, -0.28);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.65), stoneMat);
    legL.position.set(-0.9, 0.22, 0);
    const legR = legL.clone();
    legR.position.x = 0.9;
    g.add(seat, back, legL, legR);
  } else {
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 2.2), stoneMat);
    base.position.y = 0.25;
    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      makeMat('#fde047', 0.3, 0.1, { emissive: '#fbbf24', emissiveIntensity: 1.2 }),
    );
    lantern.position.y = 1.4;
    g.add(base, lantern);
  }

  setShadow(g, true, true);
  return g;
}

export function buildInteractiveDoor(style = 'korean_wood', mirror = false) {
  const root = new THREE.Group();
  const isSliding = style === 'hanok_sliding';
  const isGlass = style === 'glass_modern';

  const frameColor = isGlass ? '#1e293b' : isSliding ? '#5c3820' : '#4a2b16';
  const panelColor = isGlass ? '#334155' : isSliding ? '#8c552d' : '#945b31';
  const frameMat = makeMat(frameColor, isGlass ? 0.42 : 0.78, isGlass ? 0.45 : 0.06);
  const panelMat = makeMat(panelColor, isGlass ? 0.4 : 0.68, isGlass ? 0.35 : 0.05);
  const handleMat = makeMat(
    isGlass ? '#e2e8f0' : '#fbbf24',
    0.22,
    0.85,
  );

  // Outer door frame (1.0m wide x 2.0m tall, bottom flush at y = 0)
  const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 0.2), frameMat);
  jambL.position.set(-0.45, 1.0, 0);
  const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 0.2), frameMat);
  jambR.position.set(0.45, 1.0, 0);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.12, 0.22), frameMat);
  lintel.position.set(0, 1.94, 0);
  const threshold = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.22), frameMat);
  threshold.position.set(0, 0.025, 0);
  root.add(jambL, jambR, lintel, threshold);

  // Moving leaf group
  const movingPivot = new THREE.Group();
  if (isSliding) {
    movingPivot.position.set(0, 0.05, 0);
    const leafFrame = new THREE.Group();
    const borderL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.84, 0.08), panelMat);
    borderL.position.set(-0.37, 0.92, 0);
    const borderR = borderL.clone();
    borderR.position.x = 0.37;
    const borderTop = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.08), panelMat);
    borderTop.position.set(0, 1.79, 0);
    const borderBot = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.24, 0.08), panelMat);
    borderBot.position.set(0, 0.12, 0);
    const paperMat = makeMat('#fff8eb', 0.9, 0.0, {
      transparent: true,
      opacity: 0.9,
      emissive: '#fef3c7',
      emissiveIntensity: 0.12,
    });
    const hanjiSheet = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.5, 0.03), paperMat);
    hanjiSheet.position.set(0, 0.98, 0);
    leafFrame.add(borderL, borderR, borderTop, borderBot, hanjiSheet);

    // Traditional Korean Hanok lattice grid bars
    for (let i = 1; i <= 3; i += 1) {
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.035, 0.05), panelMat);
      hBar.position.set(0, 0.32 + i * 0.36, 0);
      leafFrame.add(hBar);
    }
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.5, 0.05), panelMat);
    vBar.position.set(0, 0.98, 0);
    const ringPull = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.1), handleMat);
    ringPull.position.set(0.26, 0.88, 0);
    leafFrame.add(vBar, ringPull);
    movingPivot.add(leafFrame);
  } else {
    const hingeSide = mirror ? 1 : -1;
    movingPivot.position.set(hingeSide * 0.4, 0.05, 0);
    const leafOffsetX = -hingeSide * 0.4;

    if (isGlass) {
      const stL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.84, 0.08), frameMat);
      stL.position.set(leafOffsetX - 0.36, 0.92, 0);
      const stR = stL.clone();
      stR.position.x = leafOffsetX + 0.36;
      const stTop = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.08), frameMat);
      stTop.position.set(leafOffsetX, 1.79, 0);
      const stBot = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.08), frameMat);
      stBot.position.set(leafOffsetX, 0.09, 0);
      const glassMat = new THREE.MeshStandardMaterial({
        color: '#bae6fd',
        roughness: 0.12,
        metalness: 0.1,
        transparent: true,
        opacity: 0.55,
      });
      const glassPane = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.56, 0.03), glassMat);
      glassPane.position.set(leafOffsetX, 0.96, 0);
      const pushBar = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.14), handleMat);
      pushBar.position.set(leafOffsetX, 0.94, 0);
      movingPivot.add(stL, stR, stTop, stBot, glassPane, pushBar);
    } else {
      const leafBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.84, 0.07), panelMat);
      leafBody.position.set(leafOffsetX, 0.92, 0);
      const insetTrim = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.095), frameMat);
      insetTrim.position.set(leafOffsetX, 1.34, 0);
      const lowTrim = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.52, 0.095), frameMat);
      lowTrim.position.set(leafOffsetX, 0.44, 0);
      const peepGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.28, 0.105),
        makeMat('#fef08a', 0.2, 0.1, { emissive: '#fde047', emissiveIntensity: 0.35 }),
      );
      peepGlass.position.set(leafOffsetX, 1.36, 0);
      const handleX = leafOffsetX - hingeSide * 0.28;
      const knobPlate = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.11), handleMat);
      knobPlate.position.set(handleX, 0.9, 0);
      const knob = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.18), handleMat);
      knob.position.set(handleX, 0.9, 0);
      movingPivot.add(leafBody, insetTrim, lowTrim, peepGlass, knobPlate, knob);
    }
  }

  root.add(movingPivot);
  setShadow(root, true, true);
  root.userData.movingPivot = movingPivot;
  root.userData.isSliding = isSliding;
  root.userData.mirror = mirror;
  return root;
}

export function buildPetalSystem(scene) {
  const petalCount = 240;
  const petalGeo = new THREE.BufferGeometry();
  const petalPos = new Float32Array(petalCount * 3);
  const petalVel = new Float32Array(petalCount);
  for (let i = 0; i < petalCount; i += 1) {
    petalPos[i * 3] = (Math.random() - 0.5) * 90;
    petalPos[i * 3 + 1] = 2 + Math.random() * 20;
    petalPos[i * 3 + 2] = (Math.random() - 0.5) * 90;
    petalVel[i] = 0.75 + Math.random() * 1.1;
  }
  petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
  const petalPoints = new THREE.Points(
    petalGeo,
    new THREE.PointsMaterial({
      map: createPetalTexture(),
      size: 0.55,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    }),
  );
  scene.add(petalPoints);
  return { petalPoints, petalVel };
}

// Composite 3D Alien Character (grounded at y = 0, compatible with animateCharacterRig)
export function buildAlienCharacter(cfg = {}) {
  const root = new THREE.Group();

  const skinMat = makeMat(cfg.skinColor || '#74f046', 0.42, 0.08, {
    emissive: cfg.skinGlow || '#22c55e',
    emissiveIntensity: 0.16,
  });
  const suitMat = makeMat(cfg.topColor || '#334155', 0.28, 0.72);
  const trimMat = makeMat(cfg.accentColor || '#38bdf8', 0.2, 0.4, {
    emissive: cfg.accentColor || '#38bdf8',
    emissiveIntensity: 0.85,
  });
  const bottomMat = makeMat(cfg.bottomColor || '#1e293b', 0.45, 0.45);
  const eyeMat = makeMat('#090d16', 0.08, 0.9);
  const glintMat = makeMat('#e0f2fe', 0.1, 0.1, { emissive: '#7dd3fc', emissiveIntensity: 1.4 });
  const bootMat = makeMat('#0f172a', 0.35, 0.65);

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const torso = new THREE.Group();
  torso.position.y = 0.94;
  bodyPivot.add(torso);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.26), suitMat);
  chest.position.y = 0.24;
  torso.add(chest);

  const coreBadge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.06), trimMat);
  coreBadge.position.set(0, 0.28, 0.14);
  torso.add(coreBadge);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.28), trimMat);
  belt.position.set(0, -0.02, 0);
  torso.add(belt);

  // Oversized Alien Head with Almond Eyes & Glowing Antennae
  const head = new THREE.Group();
  head.position.set(0, 0.82, 0);
  torso.add(head);

  const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.54, 0.54), skinMat);
  head.add(cranium);

  const browRidge = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.5), skinMat);
  browRidge.position.set(0, 0.26, -0.02);
  head.add(browRidge);

  // Big glossy alien eyes
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.22, 0.05), eyeMat);
  eyeL.position.set(-0.14, 0.0, 0.27);
  eyeL.rotation.z = 0.16;
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.22, 0.05), eyeMat);
  eyeR.position.set(0.14, 0.0, 0.27);
  eyeR.rotation.z = -0.16;
  head.add(eyeL, eyeR);

  const glintL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.02), glintMat);
  glintL.position.set(-0.11, 0.05, 0.295);
  const glintR = glintL.clone();
  glintR.position.x = 0.17;
  head.add(glintL, glintR);

  // Dual glowing antennae
  const stalkGeo = new THREE.CylinderGeometry(0.025, 0.032, 0.34, 8);
  const orbGeo = new THREE.SphereGeometry(0.075, 12, 10);
  const antL = new THREE.Group();
  antL.position.set(-0.18, 0.32, 0);
  antL.rotation.z = 0.24;
  const stalkL = new THREE.Mesh(stalkGeo, skinMat);
  stalkL.position.y = 0.17;
  const orbL = new THREE.Mesh(orbGeo, trimMat);
  orbL.position.y = 0.36;
  antL.add(stalkL, orbL);

  const antR = new THREE.Group();
  antR.position.set(0.18, 0.32, 0);
  antR.rotation.z = -0.24;
  const stalkR = new THREE.Mesh(stalkGeo, skinMat);
  stalkR.position.y = 0.17;
  const orbR = new THREE.Mesh(orbGeo, trimMat);
  orbR.position.y = 0.36;
  antR.add(stalkR, orbR);
  head.add(antL, antR);

  function buildArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.32, 0.48, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.34, 0.16), suitMat);
    sleeve.position.y = -0.15;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.15), skinMat);
    hand.position.y = -0.42;
    pivot.add(sleeve, hand);
    torso.add(pivot);
    return pivot;
  }

  function buildLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.13, 0.84, 0);
    const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.58, 0.2), bottomMat);
    legMesh.position.y = -0.29;
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.26), bootMat);
    boot.position.set(0, -0.7, 0.02);
    pivot.add(legMesh, boot);
    bodyPivot.add(pivot);
    return pivot;
  }

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);
  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  // Back Alien Thruster Pack
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.16), suitMat);
  pack.position.set(0, 0.25, -0.2);
  torso.add(pack);
  const flameL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.09), trimMat);
  flameL.position.set(-0.1, -0.06, -0.22);
  const flameR = flameL.clone();
  flameR.position.x = 0.1;
  flameL.visible = false;
  flameR.visible = false;
  torso.add(flameL, flameR);

  const dummyWing = new THREE.Group();
  setShadow(root, true, false);

  root.userData.rig = {
    bodyPivot,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    flameL,
    flameR,
    wingAngelL: dummyWing,
    wingAngelR: dummyWing,
    wingBatL: dummyWing,
    wingBatR: dummyWing,
    antL,
    antR,
    setFlightGear() {},
    setThrusterActive(active) {
      flameL.visible = active;
      flameR.visible = active;
    },
  };

  return root;
}

// Composite 3D Hovering Alien UFO Saucer
export function buildAlienUFO() {
  const root = new THREE.Group();

  const hullMat = makeMat('#64748b', 0.24, 0.85);
  const darkHullMat = makeMat('#1e293b', 0.35, 0.72);
  const domeMat = new THREE.MeshStandardMaterial({
    color: '#a5f3fc',
    transparent: true,
    opacity: 0.58,
    roughness: 0.1,
    metalness: 0.2,
    depthWrite: false,
  });
  const neonGreen = makeMat('#a3e635', 0.2, 0.3, { emissive: '#84cc16', emissiveIntensity: 1.8 });
  const neonCyan = makeMat('#38bdf8', 0.2, 0.3, { emissive: '#0ea5e9', emissiveIntensity: 1.8 });

  const saucer = new THREE.Group();
  root.add(saucer);

  const mainDisc = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.4, 0.85, 24), hullMat);
  mainDisc.position.y = 4.6;
  const upperDeck = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 3.6, 0.55, 24), darkHullMat);
  upperDeck.position.y = 5.25;
  const lowerBelly = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 1.8, 0.7, 24), darkHullMat);
  lowerBelly.position.y = 3.85;
  const glassDome = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52),
    domeMat,
  );
  glassDome.position.y = 5.45;
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.14, 10, 24), neonCyan);
  coreRing.rotation.x = Math.PI / 2;
  coreRing.position.y = 3.5;

  saucer.add(mainDisc, upperDeck, lowerBelly, glassDome, coreRing);

  const lightRing = new THREE.Group();
  lightRing.position.y = 4.55;
  for (let i = 0; i < 12; i += 1) {
    const ang = (i / 12) * Math.PI * 2;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 10, 8),
      i % 2 === 0 ? neonGreen : neonCyan,
    );
    bulb.position.set(Math.cos(ang) * 4.15, 0, Math.sin(ang) * 4.15);
    lightRing.add(bulb);
  }
  saucer.add(lightRing);

  // Soft Glowing Tractor Beam Cone reaching the ground
  const beamMat = new THREE.MeshBasicMaterial({
    color: '#67e8f9',
    transparent: true,
    opacity: 0.17,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.7, 3.6, 20, 1, true), beamMat);
  beam.position.y = 1.8;
  root.add(beam);

  setShadow(saucer, true, false);
  root.userData.saucer = saucer;
  root.userData.lightRing = lightRing;
  root.userData.beam = beam;
  return root;
}

// Waterfall Mist & Spray Particles
export function buildWaterfallMist(scene, mistTexture, cx, baseY, cz, height = 11) {
  const count = 110;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 2); // vy, phase
  for (let i = 0; i < count; i += 1) {
    const isSplash = i < 55;
    pos[i * 3] = cx + (Math.random() - 0.5) * (isSplash ? 5.2 : 3.2);
    pos[i * 3 + 1] = isSplash ? baseY + Math.random() * 2.2 : baseY + Math.random() * height;
    pos[i * 3 + 2] = cz + (Math.random() - 0.5) * (isSplash ? 3.8 : 1.4);
    vel[i * 2] = isSplash ? 0.9 + Math.random() * 1.4 : -(4.2 + Math.random() * 2.8);
    vel[i * 2 + 1] = Math.random() * Math.PI * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      map: mistTexture,
      size: 0.9,
      transparent: true,
      depthWrite: false,
      opacity: 0.78,
    }),
  );
  scene.add(points);
  return { points, vel, cx, baseY, cz, height };
}
