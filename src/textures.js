import * as THREE from 'three';

/**
 * Procedural, deterministic texture factory for the Kimi K3 Control Surface.
 *
 * All graphic textures are drawn at high resolution and use only the browser's
 * built-in 2D canvas API and system sans-serif fonts. Surface maps are generated
 * from seeded integer noise so renders are stable across reloads and captures.
 */

export const KEY_ICON = Object.freeze({
  KDA: 'kda',
  ATTN_RES: 'attn-res',
  EXPERT_ROUTER: 'expert-router',
  CONTEXT_1M: 'context-1m',
  NATIVE_VISION: 'native-vision',
  KIMI_CODE: 'kimi-code',
  KIMI_MARK: 'kimi-mark',
});

const TAU = Math.PI * 2;
const DEFAULT_GRAPHIC_SIZE = 2048;
const DEFAULT_ICON_SIZE = 512;
const DEFAULT_SURFACE_SIZE = 1024;
const DEFAULT_INK = '#171717';
const DEFAULT_ICON_INK = '#202326';
const SYSTEM_FONT = '"MiSans VF", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createCanvas(size) {
  const safeSize = Math.max(64, Math.round(size));

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = safeSize;
    canvas.height = safeSize;
    return canvas;
  }

  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(safeSize, safeSize);
  }

  throw new Error('Kimi K3 procedural textures require Canvas or OffscreenCanvas.');
}

function prepareCanvas(size) {
  const canvas = createCanvas(size);
  const context = canvas.getContext('2d', { alpha: true });

  if (!context) {
    throw new Error('Unable to create a 2D canvas context for Kimi K3 textures.');
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return { canvas, context, size: canvas.width };
}

function configureGraphicTexture(canvas, {
  name,
  anisotropy = 8,
  flipY = true,
  premultiplyAlpha = false,
} = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.name = name || 'Kimi K3 Graphic';
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = anisotropy;
  texture.flipY = flipY;
  texture.premultiplyAlpha = premultiplyAlpha;
  texture.needsUpdate = true;
  return texture;
}

function setStroke(context, color, width, size) {
  context.strokeStyle = color;
  context.lineWidth = width * size;
  context.lineCap = 'round';
  context.lineJoin = 'round';
}

function roundedRectPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function drawVerticalLabel(context, text, x, y, rotation, fontSize, color) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.fillStyle = color;
  context.font = `500 ${fontSize}px ${SYSTEM_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 0, 0);
  context.restore();
}

function drawOrientationArrow(context, size, color) {
  const x = size * 0.5;
  const tipY = size * 0.032;
  const shoulderY = size * 0.061;
  const baseY = size * 0.087;

  setStroke(context, color, 0.00215, size);
  context.beginPath();
  context.moveTo(x, baseY);
  context.lineTo(x, tipY);
  context.moveTo(x, tipY);
  context.lineTo(x - size * 0.019, shoulderY);
  context.moveTo(x, tipY);
  context.lineTo(x + size * 0.019, shoulderY);
  context.stroke();
}

function drawVia(context, size, x, y, radius, alpha = 0.55) {
  const px = x * size;
  const py = y * size;
  const r = radius * size;

  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = '#171a1b';
  context.fillStyle = '#899093';
  context.lineWidth = Math.max(1, r * 0.52);
  context.beginPath();
  context.arc(px, py, r, 0, TAU);
  context.stroke();
  context.beginPath();
  context.arc(px, py, r * 0.28, 0, TAU);
  context.fill();
  context.restore();
}

function drawMountRing(context, size, x, y) {
  context.save();
  context.strokeStyle = 'rgba(17, 21, 22, 0.21)';
  context.lineWidth = size * 0.0013;
  context.beginPath();
  context.arc(x * size, y * size, size * 0.031, 0, TAU);
  context.stroke();
  context.beginPath();
  context.arc(x * size, y * size, size * 0.024, 0, TAU);
  context.stroke();
  context.restore();
}

function drawKimiFieldLines(context, size) {
  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';

  // Twin field loops reach into the deck margins, so their graphite edge is
  // still visible around the dense 4×4 control topology.
  [0.305, 0.695].forEach((centerX, loopIndex) => {
    [-0.020, -0.007, 0.007, 0.020].forEach((band, bandIndex) => {
      context.beginPath();
      for (let index = 0; index <= 180; index += 1) {
        const t = (index / 180) * TAU;
        const wobble = Math.sin(index * 1.73 + bandIndex * 2.4 + loopIndex) * 0.0020;
        const x = (centerX + Math.cos(t) * (0.270 + band) + wobble) * size;
        const y = (0.485 + Math.sin(t) * (0.350 + band * 0.55) - wobble * 0.6) * size;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = `rgba(23, 23, 23, ${0.145 + bandIndex * 0.024})`;
      context.lineWidth = size * (0.00105 + bandIndex * 0.00012);
      context.stroke();
    });

    for (let index = 0; index < 112; index += 1) {
      const t = (index / 112) * TAU;
      const spread = Math.sin(index * 12.9898 + loopIndex * 9.1) * 0.0095;
      const x = (centerX + Math.cos(t) * (0.274 + spread)) * size;
      const y = (0.485 + Math.sin(t) * (0.354 + spread * 0.4)) * size;
      context.fillStyle = `rgba(23, 23, 23, ${0.13 + (index % 7) * 0.018})`;
      context.beginPath();
      context.arc(x, y, size * (0.00072 + (index % 5) * 0.00010), 0, TAU);
      context.fill();
    }
  });
  context.restore();
}

function drawExpertMatrix(context, size) {
  const columns = 32;
  const rows = 28;
  const activeExperts = new Set([
    17, 61, 112, 159, 207, 254, 312, 359,
    407, 454, 512, 559, 607, 654, 712, 759,
  ]);
  const x0 = size * 0.175;
  const x1 = size * 0.825;
  const y0 = size * 0.176;
  const y1 = size * 0.805;

  context.save();
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const expert = row * columns + column;
      const active = activeExperts.has(expert);
      const x = x0 + (column / (columns - 1)) * (x1 - x0);
      const y = y0 + (row / (rows - 1)) * (y1 - y0);
      context.fillStyle = active ? 'rgba(26, 136, 255, 0.82)' : 'rgba(23, 23, 23, 0.055)';
      context.beginPath();
      context.arc(x, y, size * (active ? 0.00145 : 0.00066), 0, TAU);
      context.fill();
    }
  }

  context.fillStyle = 'rgba(23, 23, 23, 0.46)';
  context.font = `520 ${size * 0.0092}px ${SYSTEM_FONT}`;
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText('STABLE LATENTMOE · 16 ACTIVE / 896 EXPERTS', size * 0.178, size * 0.832);
  context.restore();
}

function drawTopDeckFootprints(context, size) {
  context.save();
  context.strokeStyle = 'rgba(18, 22, 23, 0.12)';
  context.fillStyle = 'rgba(18, 22, 23, 0.24)';
  context.lineWidth = size * 0.001;

  // The circular action button and three tiny status-LED footprints.
  context.beginPath();
  context.arc(size * 0.205, size * 0.785, size * 0.047, 0, TAU);
  context.stroke();
  context.beginPath();
  context.arc(size * 0.205, size * 0.785, size * 0.039, 0, TAU);
  context.stroke();

  const ledY = [0.727, 0.766, 0.805];
  for (let i = 0; i < ledY.length; i += 1) {
    const y = ledY[i] * size;
    roundedRectPath(context, size * 0.099, y - size * 0.0105, size * 0.036, size * 0.021, size * 0.003);
    context.stroke();
    context.beginPath();
    context.moveTo(size * 0.112, y - size * 0.012);
    context.lineTo(size * 0.112, y + size * 0.012);
    context.stroke();
  }

  context.font = `500 ${size * 0.0085}px ${SYSTEM_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('LED', size * 0.117, size * 0.836);
  context.restore();
}

/**
 * Transparent board-print texture for the translucent top deck.
 *
 * K3 field lines, exact 28×32 expert routing matrix, and launch typography.
 */
export function createTopDeckSilkscreenTexture({
  size = DEFAULT_GRAPHIC_SIZE,
  ink = DEFAULT_INK,
  background = null,
  anisotropy = 8,
  flipY = true,
} = {}) {
  const { canvas, context, size: canvasSize } = prepareCanvas(size);

  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, canvasSize, canvasSize);
  }

  drawKimiFieldLines(context, canvasSize);
  drawExpertMatrix(context, canvasSize);
  drawTopDeckFootprints(context, canvasSize);

  const labelSize = canvasSize * 0.0203;
  drawVerticalLabel(
    context,
    'MOONSHOT AI | KIMI K3',
    canvasSize * 0.052,
    canvasSize * 0.500,
    -Math.PI * 0.5,
    labelSize,
    ink,
  );
  drawVerticalLabel(
    context,
    'OPEN FRONTIER INTELLIGENCE',
    canvasSize * 0.948,
    canvasSize * 0.505,
    Math.PI * 0.5,
    labelSize,
    ink,
  );

  context.save();
  context.fillStyle = ink;
  context.font = `500 ${labelSize}px ${SYSTEM_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('KDA · ATTNRES · NATIVE VISION · 1M CONTEXT', canvasSize * 0.5, canvasSize * 0.930);
  context.restore();

  context.save();
  context.fillStyle = 'rgba(23, 23, 23, 0.58)';
  context.font = `560 ${canvasSize * 0.0104}px ${SYSTEM_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('2.8T  /  MAX THINKING', canvasSize * 0.5, canvasSize * 0.115);
  context.restore();

  drawOrientationArrow(context, canvasSize, ink);

  const mountPoints = [
    [0.070, 0.071], [0.930, 0.071], [0.070, 0.902], [0.930, 0.902],
  ];
  mountPoints.forEach(([x, y]) => drawMountRing(context, canvasSize, x, y));

  // Explicit placement follows the sparse black/grey reference marks.
  const vias = [
    [0.170, 0.681, 0.0018, 0.44], [0.180, 0.691, 0.00115, 0.40],
    [0.271, 0.851, 0.00155, 0.52], [0.318, 0.875, 0.00105, 0.42],
    [0.420, 0.912, 0.00120, 0.52], [0.463, 0.905, 0.00095, 0.44],
    [0.516, 0.918, 0.00105, 0.46], [0.552, 0.897, 0.00135, 0.52],
    [0.610, 0.908, 0.00095, 0.45], [0.642, 0.892, 0.00150, 0.58],
    [0.697, 0.910, 0.00125, 0.54], [0.720, 0.895, 0.00090, 0.42],
    [0.787, 0.850, 0.00115, 0.42], [0.826, 0.830, 0.00135, 0.50],
    [0.856, 0.697, 0.00105, 0.42], [0.879, 0.675, 0.00115, 0.42],
  ];
  vias.forEach(([x, y, radius, alpha]) => drawVia(context, canvasSize, x, y, radius, alpha));

  const texture = configureGraphicTexture(canvas, {
    name: 'Kimi K3 Field Deck Silkscreen',
    anisotropy,
    flipY,
  });
  texture.userData.kimiK3 = {
    kind: 'top-deck-silkscreen',
    transparentBackground: !background,
    referenceAspect: 1,
  };
  return texture;
}

function iconContext(size) {
  const prepared = prepareCanvas(size);
  prepared.context.translate(prepared.size * 0.5, prepared.size * 0.5);
  return prepared;
}

function drawLightning(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);
  context.beginPath();
  context.moveTo(-size * 0.010, -size * 0.255);
  context.lineTo(-size * 0.202, size * 0.016);
  context.quadraticCurveTo(-size * 0.214, size * 0.034, -size * 0.190, size * 0.035);
  context.lineTo(-size * 0.045, size * 0.035);
  context.lineTo(-size * 0.100, size * 0.249);
  context.quadraticCurveTo(-size * 0.106, size * 0.275, -size * 0.084, size * 0.257);
  context.lineTo(size * 0.207, -size * 0.069);
  context.quadraticCurveTo(size * 0.225, -size * 0.091, size * 0.194, -size * 0.091);
  context.lineTo(size * 0.042, -size * 0.091);
  context.lineTo(size * 0.023, -size * 0.248);
  context.quadraticCurveTo(size * 0.019, -size * 0.276, -size * 0.010, -size * 0.255);
  context.closePath();
  context.stroke();
}

function drawCircle(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);
  context.beginPath();
  context.arc(0, 0, size * 0.226, 0, TAU);
  context.stroke();
}

function drawCircledCheck(context, size, color, strokeWidth) {
  drawCircle(context, size, color, strokeWidth);
  setStroke(context, color, strokeWidth, size);
  context.beginPath();
  context.moveTo(-size * 0.109, size * 0.005);
  context.lineTo(-size * 0.025, size * 0.093);
  context.lineTo(size * 0.132, -size * 0.112);
  context.stroke();
}

function drawCircledX(context, size, color, strokeWidth) {
  drawCircle(context, size, color, strokeWidth);
  setStroke(context, color, strokeWidth, size);
  context.beginPath();
  context.moveTo(-size * 0.087, -size * 0.087);
  context.lineTo(size * 0.087, size * 0.087);
  context.moveTo(size * 0.087, -size * 0.087);
  context.lineTo(-size * 0.087, size * 0.087);
  context.stroke();
}

function drawExpand(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);

  // Reference-specific bifurcated expand glyph: two arrows diverging right.
  context.beginPath();
  context.moveTo(-size * 0.235, 0);
  context.lineTo(-size * 0.070, 0);
  context.quadraticCurveTo(-size * 0.030, 0, -size * 0.003, -size * 0.034);
  context.lineTo(size * 0.173, -size * 0.216);
  context.stroke();

  context.beginPath();
  context.moveTo(size * 0.055, -size * 0.216);
  context.lineTo(size * 0.173, -size * 0.216);
  context.lineTo(size * 0.173, -size * 0.096);
  context.stroke();

  context.beginPath();
  context.moveTo(size * 0.030, size * 0.071);
  context.lineTo(size * 0.176, size * 0.218);
  context.stroke();

  context.beginPath();
  context.moveTo(size * 0.062, size * 0.218);
  context.lineTo(size * 0.176, size * 0.218);
  context.lineTo(size * 0.176, size * 0.104);
  context.stroke();
}

function drawMicrophone(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);

  roundedRectPath(
    context,
    -size * 0.090,
    -size * 0.245,
    size * 0.180,
    size * 0.340,
    size * 0.090,
  );
  context.stroke();

  context.beginPath();
  context.moveTo(-size * 0.166, -size * 0.010);
  context.lineTo(-size * 0.166, size * 0.037);
  context.bezierCurveTo(
    -size * 0.166, size * 0.165,
    -size * 0.094, size * 0.227,
    0, size * 0.227,
  );
  context.bezierCurveTo(
    size * 0.094, size * 0.227,
    size * 0.166, size * 0.165,
    size * 0.166, size * 0.037,
  );
  context.lineTo(size * 0.166, -size * 0.010);
  context.stroke();

  context.beginPath();
  context.moveTo(0, size * 0.227);
  context.lineTo(0, size * 0.315);
  context.moveTo(-size * 0.100, size * 0.315);
  context.lineTo(size * 0.100, size * 0.315);
  context.stroke();
}

function drawPlus(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);
  context.beginPath();
  context.moveTo(-size * 0.160, 0);
  context.lineTo(size * 0.160, 0);
  context.moveTo(0, -size * 0.160);
  context.lineTo(0, size * 0.160);
  context.stroke();
}

function drawKda(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);
  context.beginPath();
  context.moveTo(-size * 0.31, size * 0.08);
  context.bezierCurveTo(-size * 0.20, -size * 0.20, -size * 0.06, -size * 0.20, 0, size * 0.02);
  context.bezierCurveTo(size * 0.07, size * 0.26, size * 0.21, size * 0.24, size * 0.31, -size * 0.08);
  context.stroke();
  context.beginPath();
  context.moveTo(-size * 0.07, size * 0.25);
  context.lineTo(0, size * 0.10);
  context.lineTo(size * 0.07, size * 0.25);
  context.closePath();
  context.stroke();
}

function drawAttnRes(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);
  context.beginPath();
  for (let index = 0; index <= 96; index += 1) {
    const t = (index / 96) * TAU;
    const x = Math.sin(t) * size * 0.31;
    const y = Math.sin(t * 2) * size * 0.16;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  context.beginPath();
  context.arc(0, 0, size * 0.037, 0, TAU);
  context.fillStyle = color;
  context.fill();
}

function drawExpertRouter(context, size, color) {
  const active = new Set([1, 6, 9, 14]);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const index = row * 4 + column;
      context.fillStyle = active.has(index) ? '#1a88ff' : color;
      context.globalAlpha = active.has(index) ? 1 : 0.46;
      context.beginPath();
      context.arc(
        (column - 1.5) * size * 0.145,
        (row - 1.5) * size * 0.145,
        size * (active.has(index) ? 0.050 : 0.036),
        0,
        TAU,
      );
      context.fill();
    }
  }
  context.globalAlpha = 1;
}

function drawContext1M(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);
  context.beginPath();
  context.arc(0, 0, size * 0.285, 0, TAU);
  context.stroke();
  context.fillStyle = color;
  context.font = `620 ${size * 0.185}px ${SYSTEM_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('1M', 0, size * 0.008);
}

function drawNativeVision(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);
  context.beginPath();
  context.moveTo(-size * 0.33, 0);
  context.bezierCurveTo(-size * 0.19, -size * 0.22, size * 0.19, -size * 0.22, size * 0.33, 0);
  context.bezierCurveTo(size * 0.19, size * 0.22, -size * 0.19, size * 0.22, -size * 0.33, 0);
  context.closePath();
  context.stroke();
  context.beginPath();
  context.arc(0, 0, size * 0.088, 0, TAU);
  context.fillStyle = '#1a88ff';
  context.fill();
}

function drawKimiCode(context, size, color, strokeWidth) {
  setStroke(context, color, strokeWidth, size);
  roundedRectPath(context, -size * 0.29, -size * 0.29, size * 0.58, size * 0.58, size * 0.13);
  context.stroke();
  context.fillStyle = color;
  context.font = `650 ${size * 0.32}px ${SYSTEM_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('K', -size * 0.015, size * 0.015);
  context.fillStyle = '#1a88ff';
  context.beginPath();
  context.arc(size * 0.285, -size * 0.285, size * 0.052, 0, TAU);
  context.fill();
}

function drawKimiMark(context, size, color, strokeWidth) {
  drawAttnRes(context, size, color, strokeWidth);
  context.fillStyle = '#1a88ff';
  context.beginPath();
  context.arc(size * 0.285, -size * 0.22, size * 0.045, 0, TAU);
  context.fill();
}

const ICON_DRAWERS = Object.freeze({
  [KEY_ICON.KDA]: drawKda,
  [KEY_ICON.ATTN_RES]: drawAttnRes,
  [KEY_ICON.EXPERT_ROUTER]: drawExpertRouter,
  [KEY_ICON.CONTEXT_1M]: drawContext1M,
  [KEY_ICON.NATIVE_VISION]: drawNativeVision,
  [KEY_ICON.KIMI_CODE]: drawKimiCode,
  [KEY_ICON.KIMI_MARK]: drawKimiMark,
});

/**
 * Creates a transparent, centered, antialiased key-glyph texture.
 */
export function createKeyIconTexture(icon, {
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_INK,
  strokeWidth = 0.0165,
  anisotropy = 8,
  flipY = true,
} = {}) {
  const drawer = ICON_DRAWERS[icon];
  if (!drawer) {
    throw new Error(`Unknown Kimi K3 key icon: ${icon}`);
  }

  const { canvas, context, size: canvasSize } = iconContext(size);
  drawer(context, canvasSize, color, strokeWidth);

  const texture = configureGraphicTexture(canvas, {
    name: `Kimi K3 Key Icon — ${icon}`,
    anisotropy,
    flipY,
  });
  texture.userData.kimiK3 = { kind: 'key-icon', icon };
  return texture;
}

export const createKdaIconTexture = (options) => createKeyIconTexture(KEY_ICON.KDA, options);
export const createAttnResIconTexture = (options) => createKeyIconTexture(KEY_ICON.ATTN_RES, options);
export const createExpertRouterIconTexture = (options) => createKeyIconTexture(KEY_ICON.EXPERT_ROUTER, options);
export const createContext1MIconTexture = (options) => createKeyIconTexture(KEY_ICON.CONTEXT_1M, options);
export const createNativeVisionIconTexture = (options) => createKeyIconTexture(KEY_ICON.NATIVE_VISION, options);
export const createKimiCodeIconTexture = (options) => createKeyIconTexture(KEY_ICON.KIMI_CODE, options);
export const createKimiMarkIconTexture = (options = {}) => createKeyIconTexture(KEY_ICON.KIMI_MARK, {
  color: '#202326',
  strokeWidth: 0.018,
  ...options,
});

/**
 * Convenience bundle for K3 capability keys plus the translucent Kimi mark.
 */
export function createKeyIconTextures(options = {}) {
  return {
    kda: createKdaIconTexture(options),
    attnRes: createAttnResIconTexture(options),
    expertRouter: createExpertRouterIconTexture(options),
    context1m: createContext1MIconTexture(options),
    nativeVision: createNativeVisionIconTexture(options),
    kimiCode: createKimiCodeIconTexture(options),
    kimiMark: createKimiMarkIconTexture(options),
  };
}

function drawTextAlongArc(context, text, {
  cx,
  cy,
  radius,
  startAngle,
  endAngle,
  font,
  fillStyle,
  tracking = 1,
}) {
  const characters = [...text];
  if (!characters.length) return;

  const span = endAngle - startAngle;
  const direction = Math.sign(span) || 1;
  const measured = characters.map((character) => {
    context.font = font;
    return context.measureText(character).width * tracking;
  });
  const totalWidth = measured.reduce((sum, width) => sum + width, 0);
  const angularScale = Math.abs(span) / totalWidth;
  let cursor = startAngle;

  context.save();
  context.font = font;
  context.fillStyle = fillStyle;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  characters.forEach((character, index) => {
    const angleWidth = measured[index] * angularScale;
    const angle = cursor + direction * angleWidth * 0.5;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    context.save();
    context.translate(x, y);
    context.rotate(angle + (direction > 0 ? Math.PI * 0.5 : -Math.PI * 0.5));
    context.fillText(character, 0, 0);
    context.restore();

    cursor += direction * angleWidth;
  });
  context.restore();
}

function drawRegulatoryMarks(context, size, color) {
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = size * 0.00165;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  context.font = `600 ${size * 0.019}px ${SYSTEM_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('FCC', size * 0.735, size * 0.728);
  context.fillText('CE', size * 0.802, size * 0.728);

  // Crossed-out wheeled-bin mark.
  const x = size * 0.865;
  const y = size * 0.728;
  const w = size * 0.025;
  const h = size * 0.034;
  context.strokeRect(x - w * 0.5, y - h * 0.43, w, h * 0.76);
  context.beginPath();
  context.moveTo(x - w * 0.63, y - h * 0.60);
  context.lineTo(x + w * 0.63, y - h * 0.60);
  context.moveTo(x - w * 0.25, y - h * 0.68);
  context.lineTo(x + w * 0.25, y - h * 0.68);
  context.moveTo(x - w * 0.72, y - h * 0.78);
  context.lineTo(x + w * 0.72, y + h * 0.72);
  context.moveTo(x - w * 0.28, y + h * 0.43);
  context.lineTo(x - w * 0.32, y + h * 0.58);
  context.moveTo(x + w * 0.28, y + h * 0.43);
  context.lineTo(x + w * 0.32, y + h * 0.58);
  context.stroke();
  context.restore();
}

/**
 * Transparent markings for the large underside circular plate.
 */
export function createUndersideMarkingsTexture({
  size = DEFAULT_GRAPHIC_SIZE,
  ink = 'rgba(255, 255, 255, 0.84)',
  guideInk = 'rgba(255, 255, 255, 0.19)',
  anisotropy = 8,
  flipY = true,
} = {}) {
  const { canvas, context, size: canvasSize } = prepareCanvas(size);
  const center = canvasSize * 0.5;

  context.save();
  context.strokeStyle = guideInk;
  context.lineWidth = canvasSize * 0.0015;
  [0.452, 0.468, 0.485].forEach((radius) => {
    context.beginPath();
    context.arc(center, center, canvasSize * radius, 0, TAU);
    context.stroke();
  });

  // Four subtle alignment ticks echo the machined circular rear plate.
  for (let index = 0; index < 4; index += 1) {
    const angle = -Math.PI * 0.5 + index * Math.PI * 0.5;
    context.beginPath();
    context.moveTo(
      center + Math.cos(angle) * canvasSize * 0.438,
      center + Math.sin(angle) * canvasSize * 0.438,
    );
    context.lineTo(
      center + Math.cos(angle) * canvasSize * 0.468,
      center + Math.sin(angle) * canvasSize * 0.468,
    );
    context.stroke();
  }
  context.restore();

  drawTextAlongArc(context, 'MOONSHOT AI  |  KIMI K3  |  OPEN FRONTIER INTELLIGENCE', {
    cx: center,
    cy: center,
    radius: canvasSize * 0.425,
    startAngle: -Math.PI * 0.76,
    endAngle: -Math.PI * 0.24,
    font: `500 ${canvasSize * 0.0148}px ${SYSTEM_FONT}`,
    fillStyle: ink,
    tracking: 1.06,
  });

  drawTextAlongArc(context, 'KIMI DELTA ATTENTION  +  ATTENTION RESIDUALS', {
    cx: center,
    cy: center,
    radius: canvasSize * 0.405,
    startAngle: Math.PI * 0.78,
    endAngle: Math.PI * 0.52,
    font: `500 ${canvasSize * 0.0108}px ${SYSTEM_FONT}`,
    fillStyle: ink,
    tracking: 1.03,
  });

  drawTextAlongArc(context, '2.8T PARAMETERS  |  1M CONTEXT  |  NATIVE MULTIMODAL', {
    cx: center,
    cy: center,
    radius: canvasSize * 0.405,
    startAngle: Math.PI * 0.51,
    endAngle: Math.PI * 0.20,
    font: `500 ${canvasSize * 0.0098}px ${SYSTEM_FONT}`,
    fillStyle: ink,
    tracking: 1.03,
  });

  drawRegulatoryMarks(context, canvasSize, ink);

  const texture = configureGraphicTexture(canvas, {
    name: 'Kimi K3 Underside Markings',
    anisotropy,
    flipY,
  });
  texture.userData.kimiK3 = {
    kind: 'underside-markings',
    circularContentRadius: 0.49,
  };
  return texture;
}

function seedToUint(seed) {
  if (Number.isFinite(seed)) return Number(seed) >>> 0;
  const text = String(seed ?? 'kimi-k3-control-surface');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function integerNoise(x, y, seed) {
  let value = Math.imul(x | 0, 0x1f123bb5) ^ Math.imul(y | 0, 0x5f356495) ^ seed;
  value = Math.imul(value ^ (value >>> 15), 0x2c1b3c6d);
  value = Math.imul(value ^ (value >>> 12), 0x297a2d39);
  value ^= value >>> 15;
  return (value >>> 0) / 4294967295;
}

function smoothStep(value) {
  return value * value * (3 - 2 * value);
}

function tileableValueNoise(x, y, scale, size, seed) {
  const gridSize = Math.max(2, Math.ceil(size / scale));
  const gx = x / scale;
  const gy = y / scale;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const x1 = (x0 + 1) % gridSize;
  const y1 = (y0 + 1) % gridSize;
  const wrappedX0 = ((x0 % gridSize) + gridSize) % gridSize;
  const wrappedY0 = ((y0 % gridSize) + gridSize) % gridSize;
  const tx = smoothStep(gx - x0);
  const ty = smoothStep(gy - y0);
  const a = integerNoise(wrappedX0, wrappedY0, seed);
  const b = integerNoise(x1, wrappedY0, seed);
  const c = integerNoise(wrappedX0, y1, seed);
  const d = integerNoise(x1, y1, seed);
  const top = a + (b - a) * tx;
  const bottom = c + (d - c) * tx;
  return top + (bottom - top) * ty;
}

function generateFrostedMapData(size, seed) {
  const pixelCount = size * size;
  const bump = new Uint8Array(pixelCount);
  const roughness = new Uint8Array(pixelCount);
  const numericSeed = seedToUint(seed);
  const seedA = numericSeed ^ 0x9e3779b9;
  const seedB = numericSeed ^ 0x85ebca6b;
  const seedC = numericSeed ^ 0xc2b2ae35;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const grain = integerNoise(x, y, seedA) - 0.5;
      const micro = integerNoise((x * 3 + y) | 0, (y * 3 - x) | 0, seedB) - 0.5;
      const medium = tileableValueNoise(x, y, 23, size, seedB) - 0.5;
      const broad = tileableValueNoise(x, y, 91, size, seedC) - 0.5;
      const directional = Math.sin((x * 0.071 + y * 0.029) + broad * 5.2) * 0.5;

      // Centered around mid-grey for a subtle bump with tiny injection grain.
      const bumpValue = 128 + grain * 34 + micro * 13 + medium * 15 + directional * 4.5;
      bump[index] = Math.round(clamp(bumpValue, 78, 178));

      // Pale frosted resin stays mostly rough, with restrained translucent breakup.
      const roughValue = 216 + Math.abs(grain) * 25 + medium * 16 + broad * 11 + directional * 3;
      roughness[index] = Math.round(clamp(roughValue, 176, 246));
    }
  }

  return { bump, roughness };
}

function createMonochromeDataTexture(data, size, name, {
  anisotropy = 4,
  repeat = [1, 1],
  greenChannel = false,
} = {}) {
  // MeshPhysicalMaterial reads roughnessMap from green. RGBA keeps that map
  // physically effective, while bump can stay in a compact red-only texture.
  let textureData = data;
  let format = THREE.RedFormat;
  if (greenChannel) {
    textureData = new Uint8Array(data.length * 4);
    for (let index = 0; index < data.length; index += 1) {
      const value = data[index];
      const offset = index * 4;
      textureData[offset] = value;
      textureData[offset + 1] = value;
      textureData[offset + 2] = value;
      textureData[offset + 3] = 255;
    }
    format = THREE.RGBAFormat;
  }

  const texture = new THREE.DataTexture(
    textureData,
    size,
    size,
    format,
    THREE.UnsignedByteType,
  );
  texture.name = name;
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = anisotropy;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Matching deterministic bump and roughness maps for frosted transparent resin.
 * Keep both maps together so their grain reads as one physical surface.
 */
export function createFrostedSurfaceMaps({
  size = DEFAULT_SURFACE_SIZE,
  seed = 'kimi-k3-frosted-sea-glass-v1',
  anisotropy = 4,
  repeat = [2.6, 2.6],
} = {}) {
  const safeSize = clamp(Math.round(size), 64, 4096);
  const { bump, roughness } = generateFrostedMapData(safeSize, seed);

  const bumpMap = createMonochromeDataTexture(
    bump,
    safeSize,
    'Kimi K3 Frosted Sea Glass Bump',
    { anisotropy, repeat },
  );
  const roughnessMap = createMonochromeDataTexture(
    roughness,
    safeSize,
    'Kimi K3 Frosted Sea Glass Roughness',
    { anisotropy, repeat, greenChannel: true },
  );

  bumpMap.userData.kimiK3 = { kind: 'frosted-bump', seed };
  roughnessMap.userData.kimiK3 = { kind: 'frosted-roughness', seed };
  return { bumpMap, roughnessMap };
}

export function createFrostedBumpTexture(options = {}) {
  const maps = createFrostedSurfaceMaps(options);
  maps.roughnessMap.dispose();
  return maps.bumpMap;
}

export function createFrostedRoughnessTexture(options = {}) {
  const maps = createFrostedSurfaceMaps(options);
  maps.bumpMap.dispose();
  return maps.roughnessMap;
}
