import * as THREE from 'three';

function createCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

function makePixelTex(drawFn, repeat = false) {
  const canvas = createCanvas(16, 16);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  return tex;
}

function noisePixel(ctx, baseColors, seedOffset = 0) {
  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      const h = Math.abs(Math.sin((x + 1 + seedOffset) * 12.9898 + (y + 1) * 78.233) * 43758.5453);
      const idx = Math.floor((h % 1) * baseColors.length);
      ctx.fillStyle = baseColors[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

export function createVoxelTextures() {
  return {
    grass_top: makePixelTex((ctx) => {
      noisePixel(ctx, ['#5ea83c', '#69b844', '#529932', '#74c44f'], 1);
      ctx.fillStyle = '#ffd1e3';
      ctx.fillRect(3, 4, 1, 1);
      ctx.fillRect(11, 10, 1, 1);
    }),

    grass_side: makePixelTex((ctx) => {
      noisePixel(ctx, ['#825636', '#734a2d', '#8e5f3d', '#684228'], 2);
      for (let x = 0; x < 16; x += 1) {
        const drop = 3 + ((x * 5) % 3);
        ctx.fillStyle = x % 2 === 0 ? '#5ea83c' : '#69b844';
        ctx.fillRect(x, 0, 1, drop);
      }
    }),

    dirt: makePixelTex((ctx) => {
      noisePixel(ctx, ['#825636', '#734a2d', '#8e5f3d', '#684228'], 3);
    }),

    stone: makePixelTex((ctx) => {
      noisePixel(ctx, ['#7c8594', '#6d7685', '#8b95a5', '#616a78'], 4);
      ctx.fillStyle = '#4f5763';
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(7, 0, 1, 7);
      ctx.fillRect(14, 8, 1, 7);
    }),

    bedrock: makePixelTex((ctx) => {
      noisePixel(ctx, ['#18181b', '#27272a', '#09090b', '#3f3f46'], 22);
    }),

    marble: makePixelTex((ctx) => {
      noisePixel(ctx, ['#f8fafc', '#f1f5f9', '#e2e8f0', '#ffffff'], 25);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(2, 0, 1, 16);
      ctx.fillRect(11, 0, 1, 16);
      ctx.fillRect(0, 7, 16, 1);
    }),

    dark_oak: makePixelTex((ctx) => {
      noisePixel(ctx, ['#4a2e1b', '#3d2414', '#583721', '#331d0f'], 41);
      ctx.fillStyle = '#24140a';
      for (let y = 0; y < 16; y += 4) {
        ctx.fillRect(0, y, 16, 1);
      }
    }),

    amethyst_crystal: makePixelTex((ctx) => {
      noisePixel(ctx, ['#7e22ce', '#9333ea', '#a855f7', '#6b21a8'], 42);
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(3, 2, 3, 4);
      ctx.fillRect(10, 7, 3, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 3, 1, 2);
      ctx.fillRect(11, 8, 1, 2);
    }),

    emerald_block: makePixelTex((ctx) => {
      noisePixel(ctx, ['#10b981', '#059669', '#34d399', '#047857'], 24);
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 1;
      ctx.strokeRect(1.5, 1.5, 13, 13);
      ctx.fillStyle = '#d1fae5';
      ctx.fillRect(6, 6, 4, 4);
    }),

    obsidian_stone: makePixelTex((ctx) => {
      noisePixel(ctx, ['#1e1b2e', '#2e2942', '#13101f', '#3b3355'], 43);
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(3, 4, 2, 2);
      ctx.fillRect(11, 10, 2, 2);
      ctx.fillRect(7, 12, 1, 2);
    }),

    neon_pink: makePixelTex((ctx) => {
      noisePixel(ctx, ['#ff4fa3', '#f43f8e', '#ff77b7', '#db2777'], 44);
      ctx.strokeStyle = '#ffe4f2';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 14, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 6, 4, 4);
    }),

    neon_cyan: makePixelTex((ctx) => {
      noisePixel(ctx, ['#06b6d4', '#22d3ee', '#0891b2', '#67e8f9'], 45);
      ctx.strokeStyle = '#ecfeff';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 14, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 6, 4, 4);
    }),

    sea_lantern: makePixelTex((ctx) => {
      noisePixel(ctx, ['#67e8f9', '#a5f3fc', '#22d3ee', '#ecfeff'], 32);
      ctx.strokeStyle = '#0e7490';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 14, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 5, 6, 6);
    }),

    sand: makePixelTex((ctx) => {
      noisePixel(ctx, ['#f5deb3', '#eed29d', '#faebd7', '#e5c488'], 26);
    }),

    hanok_wood: makePixelTex((ctx) => {
      noisePixel(ctx, ['#a3683b', '#945b31', '#b37544'], 5);
      ctx.fillStyle = '#73421f';
      for (let y = 0; y < 16; y += 4) {
        ctx.fillRect(0, y, 16, 1);
      }
    }),

    cherry_planks: makePixelTex((ctx) => {
      noisePixel(ctx, ['#f5b5c8', '#eb9fb6', '#f9cad8'], 27);
      ctx.fillStyle = '#c97892';
      for (let y = 0; y < 16; y += 4) {
        ctx.fillRect(0, y, 16, 1);
      }
    }),

    wood_log: makePixelTex((ctx) => {
      noisePixel(ctx, ['#5c3c24', '#4d311c', '#6b472b'], 6);
      ctx.fillStyle = '#3c2413';
      for (let x = 2; x < 16; x += 4) {
        ctx.fillRect(x, 0, 1, 16);
      }
    }),

    brick: makePixelTex((ctx) => {
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(0, 0, 16, 16);
      for (let row = 0; row < 4; row += 1) {
        const y = row * 4;
        const offset = (row % 2) * 4;
        for (let bx = -4; bx < 16; bx += 8) {
          ctx.fillStyle = (bx + row) % 3 === 0 ? '#b94a3e' : '#c95649';
          ctx.fillRect(bx + offset + 1, y + 1, 6, 3);
        }
      }
    }),

    hanok_roof: makePixelTex((ctx) => {
      noisePixel(ctx, ['#2f3847', '#262e3b', '#3a4557'], 7);
      ctx.fillStyle = '#1d242e';
      for (let x = 0; x < 16; x += 4) {
        ctx.fillRect(x, 0, 1, 16);
      }
      ctx.fillStyle = '#4c5a70';
      for (let y = 3; y < 16; y += 4) {
        ctx.fillRect(0, y, 16, 1);
      }
    }),

    pine_leaves: makePixelTex((ctx) => {
      noisePixel(ctx, ['#2d6a3e', '#245832', '#377d4a', '#1d4a29'], 8);
    }),

    sakura_leaves: makePixelTex((ctx) => {
      noisePixel(ctx, ['#ff9ec4', '#ffb3d1', '#ff7fb2', '#ffd1e3'], 9);
    }),

    autumn_leaves: makePixelTex((ctx) => {
      noisePixel(ctx, ['#f97316', '#ea580c', '#fb923c', '#dc2626', '#facc15'], 28);
    }),

    glass: makePixelTex((ctx) => {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.42)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 14, 14);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(3, 3, 3, 1);
      ctx.fillRect(3, 4, 1, 3);
    }),

    snow_block: makePixelTex((ctx) => {
      noisePixel(ctx, ['#ffffff', '#f1f5f9', '#e0f2fe', '#f8fafc'], 31);
    }),

    lantern: makePixelTex((ctx) => {
      ctx.fillStyle = '#3a2214';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(3, 3, 10, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(3, 9, 10, 4);
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(6, 5, 4, 6);
    }),

    coral_pink: makePixelTex((ctx) => {
      noisePixel(ctx, ['#fb7185', '#f43f5e', '#fda4af', '#e11d48'], 33);
    }),

    water: makePixelTex((ctx) => {
      noisePixel(ctx, ['#0ea5e9', '#38bdf8', '#0284c7'], 10);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
      ctx.fillRect(2, 4, 5, 1);
      ctx.fillRect(9, 11, 5, 1);
    }),

    waterfall: makePixelTex((ctx) => {
      noisePixel(ctx, ['#38bdf8', '#7dd3fc', '#0ea5e9', '#bae6fd'], 34);
      ctx.fillStyle = '#ffffff';
      for (let x = 2; x < 16; x += 4) {
        ctx.fillRect(x, 0, 1, 16);
      }
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 3, 16, 2);
      ctx.fillRect(0, 11, 16, 2);
    }, true),

    underground_water: makePixelTex((ctx) => {
      noisePixel(ctx, ['#0891b2', '#06b6d4', '#22d3ee', '#0e7490'], 37);
      ctx.fillStyle = 'rgba(165, 243, 252, 0.72)';
      ctx.fillRect(2, 3, 5, 2);
      ctx.fillRect(9, 10, 5, 2);
      ctx.fillRect(5, 13, 3, 1);
    }, true),

    lava: makePixelTex((ctx) => {
      noisePixel(ctx, ['#dc2626', '#ea580c', '#f97316', '#991b1b'], 38);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(2, 2, 4, 2);
      ctx.fillRect(10, 6, 4, 3);
      ctx.fillRect(4, 11, 5, 2);
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(7, 3, 3, 3);
      ctx.fillRect(1, 8, 3, 3);
    }, true),

    magma_rock: makePixelTex((ctx) => {
      noisePixel(ctx, ['#1c1917', '#292524', '#18181b', '#3f3f46'], 39);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(3, 4, 4, 1);
      ctx.fillRect(6, 5, 1, 4);
      ctx.fillRect(10, 10, 4, 1);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(6, 6, 1, 1);
      ctx.fillRect(11, 10, 1, 1);
    }),

    alien_metal: makePixelTex((ctx) => {
      noisePixel(ctx, ['#475569', '#334155', '#64748b'], 35);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(1.5, 1.5, 13, 13);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(6, 6, 4, 4);
    }),

    alien_glow: makePixelTex((ctx) => {
      noisePixel(ctx, ['#84cc16', '#4ade80', '#a3e635', '#22c55e'], 36);
      ctx.strokeStyle = '#ecfccb';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 14, 14);
    }),

    bamboo: makePixelTex((ctx) => {
      noisePixel(ctx, ['#52b748', '#469e3d', '#65cc5a'], 11);
      ctx.fillStyle = '#2d6a27';
      ctx.fillRect(0, 4, 16, 1);
      ctx.fillRect(0, 11, 16, 1);
      ctx.fillRect(5, 0, 1, 16);
      ctx.fillRect(11, 0, 1, 16);
    }),

    white_plaster: makePixelTex((ctx) => {
      noisePixel(ctx, ['#f8f4ee', '#efe9e0', '#ffffff'], 12);
      ctx.fillStyle = '#7c4e2d';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(15, 0, 1, 16);
    }),

    gold_block: makePixelTex((ctx) => {
      noisePixel(ctx, ['#facc15', '#eab308', '#fde047', '#ca8a04'], 13);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.strokeRect(1.5, 1.5, 13, 13);
    }),

    pink_wool: makePixelTex((ctx) => {
      noisePixel(ctx, ['#f472b6', '#f9a8d4', '#ec4899', '#fbcfe8'], 14);
    }),

    bookshelf: makePixelTex((ctx) => {
      ctx.fillStyle = '#945b31';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#472a15';
      ctx.fillRect(1, 2, 14, 5);
      ctx.fillRect(1, 9, 14, 5);
      const colors = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#ec4899', '#a855f7'];
      for (let i = 0; i < 6; i += 1) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(2 + i * 2, 2, 2, 5);
        ctx.fillStyle = colors[(i + 2) % colors.length];
        ctx.fillRect(2 + i * 2, 9, 2, 5);
      }
    }),

    cobble_moss: makePixelTex((ctx) => {
      noisePixel(ctx, ['#7c8594', '#6d7685', '#4c8f3e', '#5ea83c'], 15);
      ctx.fillStyle = '#4f5763';
      ctx.fillRect(0, 8, 16, 1);
      ctx.fillRect(8, 0, 1, 16);
    }),

    wooden_door: makePixelTex((ctx) => {
      noisePixel(ctx, ['#8c522b', '#7a4522', '#9c5e34'], 16);
      ctx.fillStyle = '#522c14';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#a3683b';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(4, 3, 8, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(11, 10, 2, 2);
    }),

    fence_post: makePixelTex((ctx) => {
      noisePixel(ctx, ['#b37544', '#a3683b', '#8d5529'], 17);
      ctx.fillStyle = '#5c3619';
      ctx.fillRect(0, 4, 16, 2);
      ctx.fillRect(0, 10, 16, 2);
    }),

    // Transparent Cross-Billboard Plant, Grass & Flower Textures
    tall_grass: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      const blades = [
        [2, 7, 2, 9, '#4d9c31'],
        [5, 4, 2, 12, '#65bd42'],
        [8, 6, 2, 10, '#3e8526'],
        [11, 3, 2, 13, '#74cc4e'],
        [13, 8, 2, 8, '#53a635'],
      ];
      blades.forEach(([x, y, w, h, c]) => {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, w, h);
      });
    }),

    fern_bush: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#246b35';
      ctx.fillRect(7, 3, 2, 13);
      for (let r = 0; r < 5; r += 1) {
        const y = 4 + r * 2;
        const w = 2 + r;
        ctx.fillStyle = r % 2 === 0 ? '#348c46' : '#45a858';
        ctx.fillRect(7 - w, y, w, 1);
        ctx.fillRect(9, y, w, 1);
      }
    }),

    pink_flower: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#3f8f2d';
      ctx.fillRect(7, 7, 2, 9);
      ctx.fillRect(5, 11, 2, 2);
      ctx.fillRect(9, 10, 2, 2);
      ctx.fillStyle = '#ff7eb6';
      ctx.fillRect(5, 3, 6, 5);
      ctx.fillStyle = '#ffd1e3';
      ctx.fillRect(6, 2, 4, 6);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(7, 4, 2, 2);
    }),

    yellow_flower: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#3d8729';
      ctx.fillRect(7, 7, 2, 9);
      ctx.fillRect(4, 10, 3, 2);
      ctx.fillRect(9, 12, 3, 2);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(4, 2, 8, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(5, 1, 6, 8);
      ctx.fillStyle = '#713f12';
      ctx.fillRect(6, 3, 4, 4);
    }),

    flower_blue: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#367d2e';
      ctx.fillRect(7, 8, 2, 8);
      ctx.fillRect(5, 11, 2, 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, 4, 8, 5);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(6, 2, 4, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 5, 2, 2);
    }),

    flower_tulip: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#3a822b';
      ctx.fillRect(7, 8, 2, 8);
      ctx.fillRect(5, 11, 2, 4);
      ctx.fillRect(9, 10, 2, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(5, 3, 6, 5);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(5, 2, 2, 3);
      ctx.fillRect(9, 2, 2, 3);
    }),

    mushroom_red: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#f5ebd6';
      ctx.fillRect(6, 10, 4, 6);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(3, 6, 10, 4);
      ctx.fillRect(5, 4, 6, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 6, 2, 2);
      ctx.fillRect(10, 7, 2, 2);
      ctx.fillRect(7, 4, 2, 1);
    }),

    glow_mushroom: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#cffafe';
      ctx.fillRect(6, 9, 4, 7);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(3, 5, 10, 4);
      ctx.fillRect(5, 3, 6, 2);
      ctx.fillStyle = '#ecfeff';
      ctx.fillRect(5, 5, 2, 2);
      ctx.fillRect(10, 6, 2, 2);
      ctx.fillRect(7, 3, 2, 1);
    }),

    bush_berry: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#1e5c2b';
      ctx.fillRect(2, 6, 12, 10);
      ctx.fillStyle = '#2d7a3c';
      ctx.fillRect(4, 4, 8, 10);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(4, 8, 2, 2);
      ctx.fillRect(10, 6, 2, 2);
      ctx.fillRect(8, 11, 2, 2);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(5, 12, 1, 1);
    }),

    lotus_pad: makePixelTex((ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#2d8a3e';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#3da650';
      ctx.fillRect(3, 3, 10, 10);
      ctx.clearRect(8, 8, 6, 2);
      ctx.fillStyle = '#ff8fab';
      ctx.fillRect(5, 5, 4, 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(6, 6, 2, 2);
    }),
  };
}

export function createSignTexture(title, subtitle, bgColor = '#7c3f23', fgColor = '#fffbeb') {
  const canvas = createCanvas(512, 160);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 140);

  ctx.fillStyle = fgColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 44px Vazirmatn, sans-serif';
  ctx.fillText(title, 256, 62);
  if (subtitle) {
    ctx.font = '600 24px Vazirmatn, sans-serif';
    ctx.fillStyle = '#fde68a';
    ctx.fillText(subtitle, 256, 118);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPetalTexture() {
  const canvas = createCanvas(16, 16);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 16, 16);
  ctx.fillStyle = '#ffb3d1';
  ctx.fillRect(4, 5, 8, 6);
  ctx.fillStyle = '#fff0f6';
  ctx.fillRect(6, 6, 4, 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createMistTexture() {
  const canvas = createCanvas(16, 16);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 16, 16);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.78)';
  ctx.fillRect(3, 3, 10, 10);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(5, 5, 6, 6);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
