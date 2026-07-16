import * as THREE from 'three';

function physical(parameters) {
  const material = new THREE.MeshPhysicalMaterial(parameters);
  material.userData.category = parameters.userData?.category ?? 'kimi-k3-control-surface';
  return material;
}

/**
 * Material library for the Kimi K3 Control Surface.
 *
 * World units are millimetres, so the physical-material thickness and
 * attenuation distances below intentionally use millimetre-scale values.  The
 * translucent parts are not alpha-blended glass: transmission, IOR, absorption,
 * real wall thickness and an enclosed light pipe create the milky CNC-PC look.
 */
export function createKimiControlMaterials({ frostTexture, grainTexture } = {}) {
  if (frostTexture) {
    frostTexture.wrapS = frostTexture.wrapT = THREE.RepeatWrapping;
    frostTexture.repeat.set(4.5, 4.5);
  }

  if (grainTexture) {
    grainTexture.wrapS = grainTexture.wrapT = THREE.RepeatWrapping;
    grainTexture.repeat.set(12, 12);
  }

  const materials = {
    outerPolycarbonate: physical({
      name: 'kimi-paper-sage-cnc-polycarbonate',
      color: 0xd8e3e5,
      metalness: 0,
      roughness: 0.28,
      transmission: 0.68,
      thickness: 8.2,
      ior: 1.48,
      attenuationColor: new THREE.Color(0x9ebfca),
      attenuationDistance: 34,
      specularIntensity: 0.86,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 1.18,
      clearcoat: 0.08,
      clearcoatRoughness: 0.22,
      bumpMap: frostTexture ?? null,
      bumpScale: frostTexture ? 0.035 : 0,
      side: THREE.FrontSide,
      userData: { category: 'polycarbonate' },
    }),

    lowerPolycarbonate: physical({
      name: 'kimi-lower-frosted-polycarbonate',
      color: 0xe1e2dc,
      metalness: 0,
      roughness: 0.34,
      transmission: 0.44,
      thickness: 5.5,
      ior: 1.475,
      attenuationColor: new THREE.Color(0xcbd9dc),
      attenuationDistance: 38,
      specularIntensity: 0.82,
      envMapIntensity: 1.4,
      clearcoat: 0.2,
      clearcoatRoughness: 0.25,
      bumpMap: frostTexture ?? null,
      bumpScale: frostTexture ? 0.025 : 0,
      side: THREE.FrontSide,
      userData: { category: 'polycarbonate' },
    }),

    clearDeck: physical({
      name: 'kimi-smoked-paper-clear-deck',
      color: 0xc7d2d5,
      metalness: 0,
      roughness: 0.25,
      transmission: 0.41,
      thickness: 1.5,
      ior: 1.47,
      attenuationColor: new THREE.Color(0xe6f0f1),
      attenuationDistance: 24,
      specularIntensity: 0.78,
      envMapIntensity: 1.2,
      clearcoat: 0.24,
      clearcoatRoughness: 0.2,
      side: THREE.FrontSide,
      userData: { category: 'polycarbonate' },
    }),

    pcb: physical({
      name: 'kimi-sage-grey-pcb',
      color: 0x25282a,
      metalness: 0.03,
      roughness: 0.46,
      clearcoat: 0.22,
      clearcoatRoughness: 0.27,
      envMapIntensity: 0.8,
      userData: { category: 'pcb' },
    }),

    opalKeycap: physical({
      name: 'frosted-pc-expert-keycap',
      color: 0xe6e8e3,
      metalness: 0,
      roughness: 0.34,
      transmission: 0.64,
      thickness: 1.95,
      ior: 1.48,
      attenuationColor: new THREE.Color(0xf6f7f3),
      attenuationDistance: 12.5,
      specularIntensity: 0.82,
      envMapIntensity: 1.35,
      clearcoat: 0.18,
      clearcoatRoughness: 0.25,
      side: THREE.DoubleSide,
      userData: { category: 'polycarbonate-keycap' },
    }),

    whitePBT: physical({
      name: 'paper-white-pbt-keycap',
      color: 0xe9e8e3,
      metalness: 0,
      roughness: 0.41,
      sheen: 0.18,
      sheenColor: new THREE.Color(0xffffff),
      sheenRoughness: 0.7,
      clearcoat: 0.13,
      clearcoatRoughness: 0.33,
      envMapIntensity: 0.85,
      bumpMap: frostTexture ?? null,
      bumpScale: frostTexture ? 0.012 : 0,
      userData: { category: 'pbt' },
    }),

    dialPBT: physical({
      name: 'kimi-ivory-dial-pbt',
      color: 0xebe9e4,
      metalness: 0,
      roughness: 0.31,
      clearcoat: 0.24,
      clearcoatRoughness: 0.26,
      envMapIntensity: 1,
      bumpMap: frostTexture ?? null,
      bumpScale: frostTexture ? 0.01 : 0,
      userData: { category: 'pbt' },
    }),

    blackRubber: physical({
      name: 'joystick-rubber',
      color: 0x35393b,
      metalness: 0,
      roughness: 0.64,
      sheen: 0.08,
      sheenColor: new THREE.Color(0x5d625f),
      clearcoat: 0.015,
      envMapIntensity: 0.4,
      specularIntensity: 0.55,
      bumpMap: grainTexture ?? null,
      bumpScale: grainTexture ? 0.018 : 0,
      userData: { category: 'rubber' },
    }),

    blackPlastic: physical({
      name: 'kimi-ink-black-pom',
      color: 0x34393b,
      metalness: 0,
      roughness: 0.48,
      clearcoat: 0.08,
      clearcoatRoughness: 0.45,
      envMapIntensity: 0.65,
      userData: { category: 'pom' },
    }),

    lavenderSwitch: physical({
      name: 'switch-sage-smoke-upper',
      color: 0xa9b8bd,
      metalness: 0,
      roughness: 0.34,
      transmission: 0,
      thickness: 0,
      ior: 1.46,
      attenuationColor: new THREE.Color(0xdce7ea),
      attenuationDistance: 5,
      envMapIntensity: 0.9,
      userData: { category: 'switch-polycarbonate' },
    }),

    periwinkleStem: physical({
      name: 'graphite-mx-stem',
      color: 0x4e88d7,
      metalness: 0,
      roughness: 0.43,
      clearcoat: 0.08,
      userData: { category: 'pok' },
    }),

    blackOxide: physical({
      name: 'kimi-ink-black-fastener',
      color: 0x34393b,
      metalness: 0.58,
      roughness: 0.42,
      envMapIntensity: 0.75,
      userData: { category: 'metal' },
    }),

    socketInterior: physical({
      name: 'fastener-socket-interior',
      color: 0x050606,
      metalness: 0.4,
      roughness: 0.67,
      envMapIntensity: 0.25,
      userData: { category: 'metal' },
    }),

    satinSilver: physical({
      name: 'satin-silver-metal',
      color: 0xaeb5b2,
      metalness: 0.82,
      roughness: 0.27,
      clearcoat: 0.12,
      clearcoatRoughness: 0.28,
      envMapIntensity: 1.25,
      userData: { category: 'metal' },
    }),

    anodizedAluminum: physical({
      name: 'moon-grey-anodized-aluminum',
      color: 0x30363a,
      metalness: 0.76,
      roughness: 0.42,
      clearcoat: 0.09,
      clearcoatRoughness: 0.31,
      envMapIntensity: 1.48,
      bumpMap: grainTexture ?? null,
      bumpScale: grainTexture ? 0.02 : 0,
      userData: { category: 'metal' },
    }),

    footElastomer: physical({
      name: 'granular-anti-slip-elastomer',
      color: 0xb7bbb6,
      metalness: 0,
      roughness: 0.96,
      envMapIntensity: 0.24,
      bumpMap: grainTexture ?? null,
      bumpScale: grainTexture ? 0.28 : 0,
      userData: { category: 'elastomer' },
    }),

    brass: physical({
      name: 'brass-threaded-insert',
      color: 0xb59a5b,
      metalness: 0.88,
      roughness: 0.3,
      envMapIntensity: 1.1,
      userData: { category: 'metal' },
    }),

    statusCarrier: new THREE.MeshStandardMaterial({
      name: 'status-led-carrier-metal',
      color: 0x303534,
      metalness: 0.62,
      roughness: 0.4,
      envMapIntensity: 0.72,
      userData: { category: 'metal' },
    }),

    contextGlow: physical({
      name: 'kimi-context-light-guide',
      color: 0x9ec8dd,
      metalness: 0,
      roughness: 0.44,
      transmission: 0,
      thickness: 0,
      ior: 1.46,
      attenuationColor: new THREE.Color(0xc7e6f3),
      attenuationDistance: 28,
      emissive: new THREE.Color(0x197ed5),
      emissiveIntensity: 0.48,
      envMapIntensity: 0.85,
      side: THREE.FrontSide,
      userData: { category: 'light-pipe' },
    }),

    expertPulse: physical({
      name: 'active-expert-routing-led',
      color: 0x61b8ff,
      roughness: 0.4,
      transmission: 0,
      thickness: 0,
      ior: 1.46,
      emissive: new THREE.Color(0x1a88ff),
      emissiveIntensity: 2.2,
      envMapIntensity: 0.7,
      userData: { category: 'led' },
    }),

    statusWhite: physical({
      name: 'white-status-led',
      color: 0xffffff,
      roughness: 0.25,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 1.1,
      userData: { category: 'led' },
    }),

    statusWarm: physical({
      name: 'warm-grey-status-led',
      color: 0xc9c1a7,
      roughness: 0.3,
      emissive: new THREE.Color(0x9c8d67),
      emissiveIntensity: 0.56,
      userData: { category: 'led' },
    }),

    ink: new THREE.MeshBasicMaterial({
      name: 'kimi-printed-black-ink',
      color: 0x171717,
      transparent: true,
      alphaTest: 0.04,
      depthWrite: false,
      toneMapped: false,
    }),

    expertInk: new THREE.MeshStandardMaterial({
      name: 'kimi-inactive-expert-ink',
      color: 0x242729,
      metalness: 0.08,
      roughness: 0.7,
      envMapIntensity: 0.42,
      userData: { category: 'printed-routing-node' },
    }),
  };

  return materials;
}

export function disposeMaterialLibrary(materials) {
  for (const material of Object.values(materials)) material?.dispose?.();
}
