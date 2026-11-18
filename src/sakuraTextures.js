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

    hanok_wood: makePixelTex((ctx) => {
      noisePixel(ctx, ['#a3683b', '#945b31', '#b37544'], 5);
      ctx.fillStyle = '#73421f';
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

    water: makePixelTex((ctx) => {
      noisePixel(ctx, ['#0ea5e9', '#38bdf8', '#0284c7'], 10);
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
