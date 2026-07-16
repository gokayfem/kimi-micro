# Kimi K3 Control Surface

An independent, fully procedural Three.js hardware concept shaped around Moonshot AI's Kimi visual language. The interface turns Kimi K3 capabilities into a tactile control surface while preserving the original project's inspectable assembly, physical controls, and demand-driven renderer.

## Capability controls

- KDA — Kimi Delta Attention memory gate
- AttnRes — Attention Residual depth routing
- Expert Router — sparse expert selection
- 1M Context — long-context horizon
- Vision — native visual understanding
- Kimi Code — coding-agent workflow

The command bank exposes Run, Commit, Retry, Expand Context, Voice Prompt, and Open Kimi actions. Rotary, joystick, touch, camera, and exploded-assembly interactions remain available from pointer and keyboard input.

## Rendering and performance

- Five camera presets: Hero, Top, Low, Underside, and Exploded
- Smooth assembly and disassembly controls
- Transparent polymer, anodized metal, PBT, PCB, and restrained context-light materials
- Eco, Balanced, and Studio rendering profiles
- Eco selected by default on mobile, small-screen, low-memory, and low-core devices
- Render targets capped to a 2560 × 1600 / 4.096 MP envelope, including Studio captures
- Demand-driven rendering that sleeps at idle
- Safe production teardown on non-BFCache page exits

## Input API

Control activity is published as a browser event:

```js
window.addEventListener('kimi:input', ({ detail }) => {
  console.log(detail.id, detail.kind, detail.phase, detail.value);
});
```

The live scene API is available at `window.__KIMI_K3_SURFACE__`. Legacy input IDs are accepted by `triggerInput()` for compatibility with earlier captures and demos.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The optimized static site is written to `dist/`.

## Structure

```text
index.html
src/
  main.js                  Scene, lighting, post-processing, UI, and interactions
  kimi-control-surface.js  Product assembly
  geometry.js              Reusable procedural geometry helpers
  materials.js             Physical material definitions
  textures.js              Canvas-generated labels, icons, and surface detail
  style.css                Responsive Kimi interface styling
```

Kimi and Moonshot AI names and marks belong to their respective owners. This is an independent visualization study and is not an official Moonshot AI release.
