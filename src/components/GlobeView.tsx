import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { NexusEvent, CountryData, ActiveLayers, GlobeViewMode } from '../types/nexus';
import { tacticalAudio } from '../services/audio';
import { WORLD_GEOJSON } from '../data/worldGeoJson';

interface GlobeViewProps {
  events: NexusEvent[];
  countries: CountryData[];
  activeLayers: ActiveLayers;
  viewMode: GlobeViewMode;
  selectedEvent: NexusEvent | null;
  selectedCountry: CountryData | null;
  focusCoords?: [number, number] | null;
  focusLabel?: string | null;
  onSelectEvent: (event: NexusEvent | null) => void;
  onSelectCountry: (country: CountryData | null) => void;
  onClearFocus?: () => void;
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
}

// Convert geographic Lat/Lng to 3D Cartesian coordinates on sphere
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Convert 3D Cartesian coordinates on sphere back to Lat/Lng
export function vector3ToLatLng(v: THREE.Vector3): [number, number] {
  const r = v.length();
  if (r === 0) return [0, 0];
  const phi = Math.acos(Math.max(-1, Math.min(1, v.y / r)));
  const lat = 90 - (phi * 180) / Math.PI;
  const theta = Math.atan2(v.z, -v.x);
  let lng = (theta * 180) / Math.PI - 180;
  while (lng < -180) lng += 360;
  while (lng > 180) lng -= 360;
  return [lat, lng];
}

// Convert geographic [lat, lng] to equirectangular canvas (x, y)
export function geoToCanvas(lat: number, lng: number, width: number, height: number): [number, number] {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

// Calculate polygon area for weighting
function polygonArea(ring: number[][]): number {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area) / 2;
}

// Calculate ring centroid [lat, lng]
function polygonCentroid(ring: number[][]): [number, number] {
  let sumX = 0;
  let sumY = 0;
  const count = ring.length;
  for (const pt of ring) {
    sumX += pt[0];
    sumY += pt[1];
  }
  return [+(sumY / count).toFixed(4), +(sumX / count).toFixed(4)];
}

// Canonical visual centers for complex nations with large distant islands/territories
const CANONICAL_CENTROIDS: Record<string, [number, number]> = {
  USA: [39.0, -96.5],     // Central Continental United States (Kansas/Nebraska)
  CAN: [56.1, -100.0],    // Central Canada
  RUS: [60.5, 96.0],      // Central Russian landmass
  FRA: [46.6, 2.4],       // Central France mainland
  GBR: [54.5, -2.5],      // Great Britain mainland
  NOR: [61.5, 8.5],       // Mainland Norway
  JPN: [36.2, 138.2],     // Central Honshu, Japan
  CHL: [-35.6, -71.5],    // Central Chile
  MYS: [4.2, 102.0],      // Peninsular Malaysia
  IDN: [-0.8, 114.0],     // Central Indonesia
  NZL: [-41.2, 174.0],    // New Zealand
  ITA: [42.5, 12.5],      // Central Italy
  GRC: [39.0, 22.0],      // Mainland Greece
  PHL: [12.8, 122.0],     // Central Philippines
  FJI: [-17.8, 178.0],    // Fiji (exact Fiji longitude)
  ESP: [40.4, -3.7],      // Central Spain
  PRT: [39.4, -8.2],      // Central Portugal
  DNK: [56.0, 10.0],      // Denmark
  TUR: [39.0, 35.0],      // Central Turkey
  SWE: [62.0, 15.0],      // Sweden
  FIN: [64.0, 26.0],      // Finland
};

// Micro-offsets for dense country clusters so neighboring labels never collide
const CLUSTER_OFFSETS: Record<string, [number, number]> = {
  NLD: [0.55, 0.0],
  BEL: [-0.40, 0.0],
  LUX: [-0.65, 0.35],
  CHE: [-0.35, 0.0],
  AUT: [0.15, 0.70],
  SVN: [-0.40, 0.20],
  HRV: [-0.60, 0.70],
  BIH: [-0.30, 0.40],
  MNE: [-0.55, 0.30],
  ALB: [-0.55, 0.0],
  MKD: [-0.35, 0.40],
  SVK: [0.35, 0.60],
  CZE: [0.30, -0.25],
  DNK: [0.60, 0.0],
  LBN: [0.25, -0.30],
  ISR: [-0.35, -0.20],
  JOR: [-0.20, 0.50],
  KWT: [0.35, 0.45],
  QAT: [0.35, 0.30],
  ARE: [-0.35, 0.50],
  CUB: [0.40, 0.0],
  HTI: [0.0, -0.40],
  DOM: [0.0, 0.40],
  PRI: [0.0, 0.50],
  JAM: [-0.30, 0.0],
  BLZ: [0.30, -0.25],
  GTM: [-0.30, -0.25],
  HND: [0.20, 0.30],
  SLV: [-0.40, -0.20],
  NIC: [0.0, 0.30],
  CRI: [-0.35, 0.20],
  PAN: [-0.30, 0.60],
};

// Compute visual center and area rank for any GeoJSON feature
export function getFeatureCentroidAndRank(feature: any): { center: [number, number]; rank: 'large' | 'medium' | 'small' } {
  const iso = feature.id;
  if (CANONICAL_CENTROIDS[iso]) {
    return { center: CANONICAL_CENTROIDS[iso], rank: 'large' };
  }

  let totalArea = 0;
  let center: [number, number] = [0, 0];

  if (feature.geometry.type === 'Polygon') {
    const ring = feature.geometry.coordinates[0];
    totalArea = polygonArea(ring);
    center = polygonCentroid(ring);
  } else if (feature.geometry.type === 'MultiPolygon') {
    let maxArea = -1;
    let bestRing: number[][] = [];
    for (const poly of feature.geometry.coordinates) {
      const ring = poly[0];
      const a = polygonArea(ring);
      totalArea += a;
      if (a > maxArea) {
        maxArea = a;
        bestRing = ring;
      }
    }
    center = polygonCentroid(bestRing);
  }

  // Apply dense cluster offset if defined
  if (CLUSTER_OFFSETS[iso]) {
    const [dLat, dLng] = CLUSTER_OFFSETS[iso];
    center = [center[0] + dLat, center[1] + dLng];
  }

  const rank = totalArea > 60 ? 'large' : totalArea > 8 ? 'medium' : 'small';
  return { center, rank };
}

// Generate high-resolution, ultra-detailed 4096x2048 Earth textures
function createEarthTextures(): { dayTexture: THREE.CanvasTexture; nightTexture: THREE.CanvasTexture } {
  const width = 4096;
  const height = 2048;

  // 1. DAY TEXTURE
  const dayCanvas = document.createElement('canvas');
  dayCanvas.width = width;
  dayCanvas.height = height;
  const dayCtx = dayCanvas.getContext('2d')!;

  // Deep oceanic gradient
  const oceanGrad = dayCtx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#030814');
  oceanGrad.addColorStop(0.2, '#040d1c');
  oceanGrad.addColorStop(0.5, '#051226');
  oceanGrad.addColorStop(0.8, '#040d1c');
  oceanGrad.addColorStop(1, '#030814');
  dayCtx.fillStyle = oceanGrad;
  dayCtx.fillRect(0, 0, width, height);

  // Tactical graticule grid (15° increments)
  dayCtx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
  dayCtx.lineWidth = 1;
  for (let lat = -75; lat <= 75; lat += 15) {
    const [, y] = geoToCanvas(lat, 0, width, height);
    dayCtx.beginPath();
    dayCtx.moveTo(0, y);
    dayCtx.lineTo(width, y);
    dayCtx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 15) {
    const [x] = geoToCanvas(0, lng, width, height);
    dayCtx.beginPath();
    dayCtx.moveTo(x, 0);
    dayCtx.lineTo(x, height);
    dayCtx.stroke();
  }

  // Highlight Equator & Prime Meridian
  dayCtx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
  dayCtx.lineWidth = 2.0;
  const [, eqY] = geoToCanvas(0, 0, width, height);
  dayCtx.beginPath();
  dayCtx.moveTo(0, eqY);
  dayCtx.lineTo(width, eqY);
  dayCtx.stroke();

  const [pmX] = geoToCanvas(0, 0, width, height);
  dayCtx.beginPath();
  dayCtx.moveTo(pmX, 0);
  dayCtx.lineTo(pmX, height);
  dayCtx.stroke();

  // Draw country polygon with antimeridian seam splitting
  function drawCountryRings(ctx: CanvasRenderingContext2D, rings: number[][][]) {
    for (const ring of rings) {
      if (ring.length < 2) continue;
      let inPath = false;
      for (let i = 0; i < ring.length; i++) {
        const pt = ring[i];
        const prev = i > 0 ? ring[i - 1] : null;

        // Skip seam jump across 180 / -180 antimeridian
        if (prev && Math.abs(pt[0] - prev[0]) > 180) {
          ctx.stroke();
          ctx.beginPath();
          inPath = false;
        }

        const [x, y] = geoToCanvas(pt[1], pt[0], width, height);
        if (!inPath) {
          ctx.moveTo(x, y);
          inPath = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    }
  }

  // Draw each sovereign country feature with distinctive crisp borders
  WORLD_GEOJSON.features.forEach((feature, idx) => {
    dayCtx.beginPath();
    if (feature.geometry.type === 'Polygon') {
      drawCountryRings(dayCtx, feature.geometry.coordinates as unknown as number[][][]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      (feature.geometry.coordinates as unknown as number[][][][]).forEach((poly) => {
        drawCountryRings(dayCtx, poly);
      });
    }

    // High-tech command center palette: slight alternate shade between adjacent nations
    dayCtx.fillStyle = idx % 2 === 0 ? '#08172c' : '#0a1d36';
    dayCtx.fill();

    // Sharp glowing tactical border
    dayCtx.strokeStyle = 'rgba(0, 240, 255, 0.70)';
    dayCtx.lineWidth = 1.8;
    dayCtx.stroke();
  });

  // Second pass: Highlight ocean-facing coastlines with radiant cyan glow
  WORLD_GEOJSON.features.forEach((feature) => {
    dayCtx.beginPath();
    if (feature.geometry.type === 'Polygon') {
      drawCountryRings(dayCtx, [feature.geometry.coordinates[0] as unknown as number[][]]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      (feature.geometry.coordinates as unknown as number[][][][]).forEach((poly) => {
        drawCountryRings(dayCtx, [poly[0]]);
      });
    }
    dayCtx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
    dayCtx.lineWidth = 2.4;
    dayCtx.stroke();
  });

  // 2. NIGHT TEXTURE
  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = width;
  nightCanvas.height = height;
  const nightCtx = nightCanvas.getContext('2d')!;

  nightCtx.fillStyle = '#02050e';
  nightCtx.fillRect(0, 0, width, height);

  WORLD_GEOJSON.features.forEach((feature) => {
    nightCtx.beginPath();
    if (feature.geometry.type === 'Polygon') {
      drawCountryRings(nightCtx, feature.geometry.coordinates as unknown as number[][][]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      (feature.geometry.coordinates as unknown as number[][][][]).forEach((poly) => {
        drawCountryRings(nightCtx, poly);
      });
    }
    nightCtx.fillStyle = '#040b18';
    nightCtx.fill();

    nightCtx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    nightCtx.lineWidth = 1.4;
    nightCtx.stroke();
  });

  const dayTexture = new THREE.CanvasTexture(dayCanvas);
  const nightTexture = new THREE.CanvasTexture(nightCanvas);
  dayTexture.minFilter = THREE.LinearFilter;
  dayTexture.magFilter = THREE.LinearFilter;
  nightTexture.minFilter = THREE.LinearFilter;
  nightTexture.magFilter = THREE.LinearFilter;
  dayTexture.needsUpdate = true;
  nightTexture.needsUpdate = true;

  return { dayTexture, nightTexture };
}

// Build 3D Vector Country Borders on Sphere
function build3DCountryBorders(radius: number): THREE.BufferGeometry {
  const positions: number[] = [];

  function addRing(ring: number[][]) {
    for (let i = 0; i < ring.length - 1; i++) {
      const p1 = ring[i];
      const p2 = ring[i + 1];
      // Skip edge that crosses the antimeridian seam
      if (Math.abs(p1[0] - p2[0]) > 180) continue;

      const v1 = latLngToVector3(p1[1], p1[0], radius);
      const v2 = latLngToVector3(p2[1], p2[0], radius);
      positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
    }
  }

  WORLD_GEOJSON.features.forEach((feature) => {
    if (feature.geometry.type === 'Polygon') {
      (feature.geometry.coordinates as unknown as number[][][]).forEach((ring) => addRing(ring));
    } else if (feature.geometry.type === 'MultiPolygon') {
      (feature.geometry.coordinates as unknown as number[][][][]).forEach((poly) => poly.forEach((ring) => addRing(ring)));
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

// Generate crisp, high-contrast, perfectly legible country badge
function createCountryLabelSprite(name: string, areaRank: 'large' | 'medium' | 'small'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // High-DPI font rendering for razor-sharp readability on all screens
  const fontSize = areaRank === 'large' ? 24 : areaRank === 'medium' ? 20 : 16;
  const fontStr = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.font = fontStr;

  let displayName = name.toUpperCase();
  if (displayName.length > 20) {
    displayName = displayName.substring(0, 18) + '..';
  }

  const textMetrics = ctx.measureText(displayName);
  const textWidth = Math.ceil(textMetrics.width);

  const padX = areaRank === 'large' ? 18 : 14;
  const padY = areaRank === 'large' ? 9 : 7;
  const pillWidth = textWidth + padX * 2 + 14;
  const pillHeight = fontSize + padY * 2;

  canvas.width = Math.max(80, pillWidth + 8);
  canvas.height = pillHeight + 8;

  // Re-apply font after canvas resizing
  ctx.font = fontStr;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const rx = 4;
  const ry = 4;
  const rw = pillWidth;
  const rh = pillHeight;
  const radius = 6;

  // Solid, high-contrast dark slate badge
  ctx.fillStyle = 'rgba(4, 11, 26, 0.94)';
  ctx.strokeStyle = areaRank === 'large' ? 'rgba(56, 189, 248, 0.95)' : 'rgba(56, 189, 248, 0.80)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, radius);
  ctx.fill();
  ctx.stroke();

  // Vibrant indicator dot
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(rx + 10, ry + rh / 2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Crisp white text with dark drop shadow for maximum contrast
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(displayName, rx + 20, ry + rh / 2 + 0.5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false, // Ensures country nametags are NEVER blocked by colored lights or markers!
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 35000; // Render above all event markers

  // World scale proportional to rank - generous scale for instant readability
  const scaleMult = areaRank === 'large' ? 0.0034 : areaRank === 'medium' ? 0.0028 : 0.0023;
  sprite.scale.set(canvas.width * scaleMult, canvas.height * scaleMult, 1);

  return sprite;
}

// Generate animated focus beacon badge for "Show on Globe"
function createFocusBeaconSprite(title: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const fontSize = 22;
  const fontStr = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.font = fontStr;

  let displayTitle = title;
  if (displayTitle.length > 36) {
    displayTitle = displayTitle.substring(0, 34) + '...';
  }

  const textMetrics = ctx.measureText(displayTitle);
  const textWidth = Math.ceil(textMetrics.width);

  const pillWidth = textWidth + 40;
  const pillHeight = fontSize + 20;

  canvas.width = Math.max(120, pillWidth + 12);
  canvas.height = pillHeight + 12;

  ctx.font = fontStr;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const rx = 6;
  const ry = 6;
  const rw = pillWidth;
  const rh = pillHeight;
  const radius = 8;

  // Vibrant neon target beacon
  ctx.fillStyle = 'rgba(2, 6, 23, 0.96)';
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, radius);
  ctx.fill();
  ctx.stroke();

  // Red/Cyan bullseye pin
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(rx + 16, ry + rh / 2, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(rx + 16, ry + rh / 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // White text with drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(displayTitle, rx + 28, ry + rh / 2 + 0.5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 40000;
  sprite.scale.set(canvas.width * 0.0036, canvas.height * 0.0036, 1);
  return sprite;
}

// Great circle spherical linear interpolation
function slerpGreatCircle(
  vStart: THREE.Vector3,
  vEnd: THREE.Vector3,
  t: number,
  radius: number
): THREE.Vector3 {
  const u1 = vStart.clone().normalize();
  const u2 = vEnd.clone().normalize();
  const dot = Math.max(-1, Math.min(1, u1.dot(u2)));
  const omega = Math.acos(dot);
  if (omega < 0.001) {
    return u1.multiplyScalar(radius);
  }
  const sinOmega = Math.sin(omega);
  const factor1 = Math.sin((1 - t) * omega) / sinOmega;
  const factor2 = Math.sin(t * omega) / sinOmega;
  const p = u1.multiplyScalar(factor1).add(u2.multiplyScalar(factor2)).normalize();

  // Natural parabolic cruising arc: ascends after takeoff, cruises at altitude, descends
  const cruiseArc = radius + 0.04 * Math.sin(Math.PI * t);
  return p.multiplyScalar(cruiseArc);
}

// Generate realistic commercial airliner model with swept wings, twin turbofan jet engines, livery and strobe lights
function createRealAirplaneModel(airlineColor = 0x1d4ed8): THREE.Group {
  const plane = new THREE.Group();

  // 1. Streamlined Fuselage (Cabin Tube)
  const bodyGeo = new THREE.CylinderGeometry(0.032, 0.034, 0.22, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.35,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.rotation.x = Math.PI / 2;
  plane.add(bodyMesh);

  // 2. Cockpit Nose Cone (Front +Z)
  const noseGeo = new THREE.ConeGeometry(0.032, 0.08, 16);
  const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
  noseMesh.rotation.x = Math.PI / 2;
  noseMesh.position.z = 0.11 + 0.04;
  plane.add(noseMesh);

  // Cockpit windshield visor (Dark tinted glass reflection)
  const windshieldGeo = new THREE.BoxGeometry(0.044, 0.016, 0.03);
  const windshieldMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.95,
    roughness: 0.05,
  });
  const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
  windshield.position.set(0, 0.022, 0.11);
  windshield.rotation.x = -0.35;
  plane.add(windshield);

  // Airline Cheatline / Livery Accent Stripe on Fuselage
  const stripeGeo = new THREE.CylinderGeometry(0.0345, 0.0345, 0.18, 16, 1, true);
  const stripeMat = new THREE.MeshBasicMaterial({
    color: airlineColor,
    side: THREE.DoubleSide,
  });
  const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
  stripeMesh.rotation.x = Math.PI / 2;
  stripeMesh.scale.set(1.01, 1.0, 0.3);
  plane.add(stripeMesh);

  // 3. Tail Cone (Rear -Z)
  const tailConeGeo = new THREE.ConeGeometry(0.034, 0.10, 16);
  const tailConeMesh = new THREE.Mesh(tailConeGeo, bodyMat);
  tailConeMesh.rotation.x = -Math.PI / 2;
  tailConeMesh.position.z = -0.11 - 0.05;
  plane.add(tailConeMesh);

  // 4. Swept Main Wings (Airbus/Boeing high-aspect swept geometry)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.045); // Center leading edge
  wingShape.lineTo(-0.25, -0.06); // Left wingtip forward
  wingShape.lineTo(-0.25, -0.10); // Left wingtip rear
  wingShape.lineTo(0, -0.035); // Center trailing edge
  wingShape.lineTo(0.25, -0.10); // Right wingtip rear
  wingShape.lineTo(0.25, -0.06); // Right wingtip forward
  wingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.007,
    bevelEnabled: false,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.3,
    metalness: 0.3,
  });
  const wingMesh = new THREE.Mesh(wingGeo, wingMat);
  wingMesh.rotation.x = -Math.PI / 2;
  wingMesh.position.y = -0.005;
  plane.add(wingMesh);

  // Winglets (upturned tips)
  const wingletGeo = new THREE.BoxGeometry(0.006, 0.035, 0.035);
  const leftWinglet = new THREE.Mesh(wingletGeo, wingMat);
  leftWinglet.position.set(-0.25, 0.016, -0.08);
  plane.add(leftWinglet);

  const rightWinglet = new THREE.Mesh(wingletGeo, wingMat);
  rightWinglet.position.set(0.25, 0.016, -0.08);
  plane.add(rightWinglet);

  // Navigation lights (Red port, Green starboard)
  const navRedGeo = new THREE.SphereGeometry(0.012, 8, 8);
  const navRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const navRed = new THREE.Mesh(navRedGeo, navRedMat);
  navRed.position.set(-0.252, 0.01, -0.07);
  plane.add(navRed);

  const navGreenGeo = new THREE.SphereGeometry(0.012, 8, 8);
  const navGreenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const navGreen = new THREE.Mesh(navGreenGeo, navGreenMat);
  navGreen.position.set(0.252, 0.01, -0.07);
  plane.add(navGreen);

  // 5. Twin Turbofan Jet Engines
  const engineGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.065, 12);
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.7,
    roughness: 0.25,
  });

  const exhaustGeo = new THREE.RingGeometry(0.005, 0.014, 12);
  const exhaustMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  [-0.09, 0.09].forEach((engX) => {
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(engX, -0.026, -0.005);
    plane.add(engine);

    // Front titanium intake spinner
    const intakeGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const intakeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const intake = new THREE.Mesh(intakeGeo, intakeMat);
    intake.position.set(engX, -0.026, 0.028);
    plane.add(intake);

    // Afterburner jet glow at exhaust
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.set(engX, -0.026, -0.038);
    plane.add(exhaust);
  });

  // 6. Vertical Stabilizer (Tail Fin with Airline Livery)
  const tailShape = new THREE.Shape();
  tailShape.moveTo(-0.04, 0); // Front bottom
  tailShape.lineTo(-0.16, 0); // Rear bottom
  tailShape.lineTo(-0.19, 0.11); // Rear top
  tailShape.lineTo(-0.13, 0.11); // Front top
  tailShape.closePath();

  const tailGeo = new THREE.ExtrudeGeometry(tailShape, {
    depth: 0.006,
    bevelEnabled: false,
  });
  const tailMat = new THREE.MeshStandardMaterial({
    color: airlineColor,
    roughness: 0.3,
    metalness: 0.4,
  });
  const tailMesh = new THREE.Mesh(tailGeo, tailMat);
  tailMesh.rotation.y = -Math.PI / 2;
  tailMesh.position.set(-0.003, 0.02, 0);
  plane.add(tailMesh);

  // Red Strobe Beacon Light on top of tail
  const strobeGeo = new THREE.SphereGeometry(0.01, 8, 8);
  const strobeMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  const strobeMesh = new THREE.Mesh(strobeGeo, strobeMat);
  strobeMesh.position.set(0, 0.13, -0.16);
  strobeMesh.userData = { isStrobe: true };
  plane.add(strobeMesh);

  // 7. Horizontal Tailplanes (Stabilizers)
  const horizShape = new THREE.Shape();
  horizShape.moveTo(0, -0.10);
  horizShape.lineTo(-0.11, -0.16);
  horizShape.lineTo(-0.11, -0.19);
  horizShape.lineTo(0, -0.15);
  horizShape.lineTo(0.11, -0.19);
  horizShape.lineTo(0.11, -0.16);
  horizShape.closePath();

  const horizGeo = new THREE.ExtrudeGeometry(horizShape, {
    depth: 0.005,
    bevelEnabled: false,
  });
  const horizMesh = new THREE.Mesh(horizGeo, wingMat);
  horizMesh.rotation.x = -Math.PI / 2;
  horizMesh.position.y = 0.02;
  plane.add(horizMesh);

  // 8. Large Hitbox for instant click responsiveness
  const hitboxGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  plane.add(hitbox);

  return plane;
}

// Generate crisp flight callsign badge
function createFlightBadgeSprite(callsign: string, route: string, speedKm: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const fontSize = 20;
  const fontStr = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.font = fontStr;

  const titleText = `✈️ ${callsign} · ${route}`;
  const subText = `${speedKm} km/h · Cruising`;

  const m1 = ctx.measureText(titleText);
  const m2 = ctx.measureText(subText);
  const maxW = Math.max(m1.width, m2.width);

  const pillWidth = maxW + 28;
  const pillHeight = 52;

  canvas.width = pillWidth + 8;
  canvas.height = pillHeight + 8;

  ctx.font = fontStr;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  const rx = 4;
  const ry = 4;
  const rw = pillWidth;
  const rh = pillHeight;
  const radius = 8;

  // Dark slate background box
  ctx.fillStyle = 'rgba(5, 12, 28, 0.94)';
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)'; // Emerald border
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, radius);
  ctx.fill();
  ctx.stroke();

  // Primary flight callsign
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(titleText, rx + 14, ry + 8);

  // Speed telemetry
  ctx.font = `14px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = '#6ee7b7';
  ctx.fillText(subText, rx + 14, ry + 30);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 36000;
  sprite.scale.set(canvas.width * 0.0030, canvas.height * 0.0030, 1);
  return sprite;
}

// Generate airport departure/arrival beacon badge
function createAirportPinSprite(code: string, isOrigin: boolean): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const fontSize = 18;
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  const text = `${isOrigin ? '🛫' : '🛬'} ${code}`;
  const width = Math.ceil(ctx.measureText(text).width) + 20;
  const height = 34;

  canvas.width = width + 6;
  canvas.height = height + 6;

  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  ctx.fillStyle = 'rgba(3, 7, 18, 0.92)';
  ctx.strokeStyle = isOrigin ? '#38bdf8' : '#34d399';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(3, 3, width, height, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, (width + 6) / 2, (height + 6) / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 34000;
  sprite.scale.set(canvas.width * 0.0028, canvas.height * 0.0028, 1);
  return sprite;
}

interface ActiveFlightItem {
  event: NexusEvent;
  originV: THREE.Vector3;
  destV: THREE.Vector3;
  originCoords: [number, number];
  destCoords: [number, number];
  progress: number;
  speedFactor: number;
  altitude: number;
  flightGroup: THREE.Group;
  planeMesh: THREE.Group;
  contrailLine: THREE.Line;
  contrailGeo: THREE.BufferGeometry;
  labelSprite?: THREE.Sprite;
  strobeMesh: THREE.Mesh | null;
  routeLine?: THREE.Line;
  origPin?: THREE.Sprite;
  destPin?: THREE.Sprite;
  selectionRing?: THREE.Mesh;
}

export const GlobeView: React.FC<GlobeViewProps> = ({
  events,
  countries,
  activeLayers,
  viewMode,
  selectedEvent,
  selectedCountry,
  focusCoords,
  focusLabel,
  onSelectEvent,
  onSelectCountry,
  onClearFocus,
  isAutoRotating,
  onToggleAutoRotate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const spaceGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const flightsGroupRef = useRef<THREE.Group | null>(null);
  const bordersGroupRef = useRef<THREE.Group | null>(null);
  const countriesGroupRef = useRef<THREE.Group | null>(null);
  const activeFlightsRef = useRef<ActiveFlightItem[]>([]);

  // Sync selected event into ref for continuous animation checks
  const selectedEventRef = useRef(selectedEvent);
  useEffect(() => {
    selectedEventRef.current = selectedEvent;
  }, [selectedEvent]);

  // Sync state into refs so main scene useEffect NEVER tears down or flashes
  const isAutoRotatingRef = useRef(isAutoRotating);
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  const onSelectEventRef = useRef(onSelectEvent);
  useEffect(() => {
    onSelectEventRef.current = onSelectEvent;
  }, [onSelectEvent]);

  const onSelectCountryRef = useRef(onSelectCountry);
  useEffect(() => {
    onSelectCountryRef.current = onSelectCountry;
  }, [onSelectCountry]);

  // Hover Tooltip HUD
  const [hoveredInfo, setHoveredInfo] = useState<{
    title: string;
    category: string;
    severity?: string;
    x: number;
    y: number;
    meta?: string;
  } | null>(null);

  // Camera & Orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraDistanceRef = useRef(14.0);
  const targetRotationRef = useRef({ x: 0.35, y: -Math.PI / 2 });
  const currentRotationRef = useRef({ x: 0.35, y: -Math.PI / 2 });

  const GLOBE_RADIUS = 5.0;

  // Mathematically accurate fly to location helper
  const triggerFlyTo = useCallback((lat: number, lng: number) => {
    tacticalAudio.playFlyTo();
    const latRad = (lat * Math.PI) / 180;
    // Exactly faces the camera along +Z
    const targetY = -lng * (Math.PI / 180) - Math.PI / 2;

    // Pick shortest rotational delta from current angle to avoid wild spinning
    const diff = (targetY - currentRotationRef.current.y) % (2 * Math.PI);
    const shortestDiff = ((diff + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    targetRotationRef.current = {
      x: Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, latRad)),
      y: currentRotationRef.current.y + shortestDiff,
    };
    cameraDistanceRef.current = 10.0;
  }, []);

  // Sync selection fly-to without rebuilding scene
  useEffect(() => {
    if (selectedEvent) {
      if (selectedEvent.subType === 'aircraft' || selectedEvent.category === 'transport') {
        const activeFlight = activeFlightsRef.current.find((f) => f.event.id === selectedEvent.id);
        if (activeFlight) {
          const pNow = slerpGreatCircle(
            activeFlight.originV,
            activeFlight.destV,
            activeFlight.progress,
            activeFlight.altitude
          );
          const pLen = pNow.length();
          const lat = 90 - (Math.acos(pNow.y / pLen) * 180) / Math.PI;
          const lng = (Math.atan2(pNow.z, -pNow.x) * 180) / Math.PI - 180;
          triggerFlyTo(lat, lng);
          cameraDistanceRef.current = 8.5; // Zoom in closer for dynamic airplane view
          return;
        }
      }
      triggerFlyTo(selectedEvent.coordinates[0], selectedEvent.coordinates[1]);
    }
  }, [selectedEvent, triggerFlyTo]);

  useEffect(() => {
    if (selectedCountry) {
      triggerFlyTo(selectedCountry.coordinates[0], selectedCountry.coordinates[1]);
    }
  }, [selectedCountry, triggerFlyTo]);

  useEffect(() => {
    if (focusCoords && focusCoords.length === 2) {
      triggerFlyTo(focusCoords[0], focusCoords[1]);
    }
  }, [focusCoords, triggerFlyTo]);

  // Scene setup - runs ONCE on mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x04060a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, cameraDistanceRef.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Illumination
    const ambientLight = new THREE.AmbientLight(0xdcf8ff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.9);
    sunLight.position.set(22, 14, 20);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.4);
    rimLight.position.set(-20, -12, -18);
    scene.add(rimLight);

    // Deep Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 380;
      starPositions[i + 1] = (Math.random() - 0.5) * 380;
      starPositions[i + 2] = (Math.random() - 0.5) * 380;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x99ddff,
      size: 0.95,
      transparent: true,
      opacity: 0.75,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Master Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Ultra-detailed Earth Sphere
    const { dayTexture } = createEarthTextures();
    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: dayTexture,
      roughness: 0.60,
      metalness: 0.20,
      emissive: new THREE.Color(0x021122),
      emissiveIntensity: 0.40,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeMeshRef.current = globeMesh;
    globeGroup.add(globeMesh);

    // 3D Vector Country Borders on Sphere
    const bordersGroup = new THREE.Group();
    bordersGroupRef.current = bordersGroup;
    globeGroup.add(bordersGroup);

    const borderGeometry = build3DCountryBorders(GLOBE_RADIUS + 0.008);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.80,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const borderLines = new THREE.LineSegments(borderGeometry, borderMaterial);
    bordersGroup.add(borderLines);

    // Glowing Atmosphere Shell
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.025, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.0, 0.94, 1.0, 1.0) * intensity * 0.90;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // Equatorial tactical ring
    const ringGeometry = new THREE.BufferGeometry();
    const ringPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(angle) * (GLOBE_RADIUS + 0.03), 0, Math.sin(angle) * (GLOBE_RADIUS + 0.03)));
    }
    ringGeometry.setFromPoints(ringPoints);
    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.30,
    });
    const equatorRing = new THREE.Line(ringGeometry, ringMaterial);
    globeGroup.add(equatorRing);

    // Sub-groups
    const markersGroup = new THREE.Group();
    markersGroupRef.current = markersGroup;
    globeGroup.add(markersGroup);

    const spaceGroup = new THREE.Group();
    spaceGroupRef.current = spaceGroup;
    globeGroup.add(spaceGroup);

    const arcsGroup = new THREE.Group();
    arcsGroupRef.current = arcsGroup;
    globeGroup.add(arcsGroup);

    const flightsGroup = new THREE.Group();
    flightsGroupRef.current = flightsGroup;
    globeGroup.add(flightsGroup);

    const countriesGroup = new THREE.Group();
    countriesGroupRef.current = countriesGroup;
    globeGroup.add(countriesGroup);

    // Mouse / Touch handlers
    let hasMoved = false;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      hasMoved = false;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
          hasMoved = true;
        }

        targetRotationRef.current.y += deltaX * 0.005;
        targetRotationRef.current.x = Math.max(
          -Math.PI / 2.2,
          Math.min(Math.PI / 2.2, targetRotationRef.current.x + deltaY * 0.005)
        );

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }

      // Raycast hover check
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const interactiveTargets = [
        ...(markersGroupRef.current?.children || []),
        ...(flightsGroupRef.current?.children || []),
        ...(countriesGroupRef.current?.children || []),
      ];

      const intersects = raycaster.intersectObjects(interactiveTargets, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        let data = hit.userData;
        let currObj: THREE.Object3D | null = hit;
        while (currObj && !data?.event && !data?.country) {
          if (currObj.userData?.event || currObj.userData?.country) {
            data = currObj.userData;
            break;
          }
          currObj = currObj.parent;
        }

        if (data && (data.event || data.country)) {
          container.style.cursor = 'pointer';
          if (data.event) {
            const isFlight = data.event.subType === 'aircraft' || data.event.category === 'transport';
            setHoveredInfo({
              title: data.event.title,
              category: isFlight ? '✈️ ACTIVE COMMERCIAL FLIGHT' : data.event.category.toUpperCase(),
              severity: data.event.severity,
              x: e.clientX,
              y: e.clientY,
              meta: isFlight
                ? `Route: ${(data.event as any).origin || 'Departure'} → ${(data.event as any).destination || 'Arrival'} · Click plane to view full telemetry`
                : data.event.locationName,
            });
          } else if (data.country) {
            setHoveredInfo({
              title: data.country.name,
              category: `SOVEREIGN NATION [${data.country.iso}]`,
              severity: data.country.threatLevel,
              x: e.clientX,
              y: e.clientY,
              meta: `Cap: ${data.country.capital} · Pop: ${(data.country.population / 1e6).toFixed(1)}M · Threat: ${data.country.threatScore}/100`,
            });
          }
          return;
        }
      }

      container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      setHoveredInfo(null);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      if (container) container.style.cursor = 'grab';
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistanceRef.current = Math.max(6.5, Math.min(24.0, cameraDistanceRef.current + e.deltaY * 0.015));
    };

    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        hasMoved = false;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
          hasMoved = true;
        }

        targetRotationRef.current.y += deltaX * 0.005;
        targetRotationRef.current.x = Math.max(
          -Math.PI / 2.2,
          Math.min(Math.PI / 2.2, targetRotationRef.current.x + deltaY * 0.005)
        );

        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.sqrt(dx * dx + dy * dy);
        const distDiff = touchStartDist - currentDist;
        cameraDistanceRef.current = Math.max(6.5, Math.min(24.0, cameraDistanceRef.current + distDiff * 0.02));
        touchStartDist = currentDist;
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const onClick = (e: MouseEvent) => {
      if (hasMoved) return; // Disregard drag release as click

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // 1. Raycast direct targets (country labels & event pips)
      const interactiveTargets = [
        ...(markersGroupRef.current?.children || []),
        ...(flightsGroupRef.current?.children || []),
        ...(countriesGroupRef.current?.children || []),
      ];

      const intersects = raycaster.intersectObjects(interactiveTargets, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        let data = hit.userData;
        let currObj: THREE.Object3D | null = hit;
        while (currObj && !data?.event && !data?.country) {
          if (currObj.userData?.event || currObj.userData?.country) {
            data = currObj.userData;
            break;
          }
          currObj = currObj.parent;
        }

        if (data?.event) {
          tacticalAudio.playClick();
          onSelectEventRef.current(data.event);
          onSelectCountryRef.current(null);
          return;
        } else if (data?.country) {
          tacticalAudio.playClick();
          onSelectCountryRef.current(data.country);
          onSelectEventRef.current(null);
          return;
        }
      }

      // 2. Raycast surface click directly onto globe mesh
      if (globeMeshRef.current) {
        const globeIntersects = raycaster.intersectObject(globeMeshRef.current, false);
        if (globeIntersects.length > 0) {
          const hitPt = globeIntersects[0].point;
          // Transform world hit point back into local globe coordinates
          const localPt = globeGroupRef.current?.worldToLocal(hitPt.clone()) || hitPt;
          const [clickLat, clickLng] = vector3ToLatLng(localPt);

          // Find nearest country centroid within proximity
          let nearestCountry: CountryData | null = null;
          let minDistance = 14.0; // degrees search radius

          countries.forEach((c) => {
            const dLat = c.coordinates[0] - clickLat;
            let dLng = Math.abs(c.coordinates[1] - clickLng);
            if (dLng > 180) dLng = 360 - dLng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist < minDistance) {
              minDistance = dist;
              nearestCountry = c;
            }
          });

          if (nearestCountry) {
            tacticalAudio.playClick();
            onSelectCountryRef.current(nearestCountry);
            onSelectEventRef.current(null);
          }
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);

    const onResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // AUTO-ROTATE: STRICTLY controlled by isAutoRotatingRef. Does NOT spin unless requested!
      if (isAutoRotatingRef.current && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.0018;
      }

      // Smooth inertia
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotationRef.current.x;
        globeGroupRef.current.rotation.y = currentRotationRef.current.y;
        // CRITICAL: Update matrix world so sprite positions match globe rotation perfectly
        globeGroupRef.current.updateMatrixWorld(true);
      }

      camera.position.z += (cameraDistanceRef.current - camera.position.z) * 0.1;
      camera.position.y += (0 - camera.position.y) * 0.1;
      camera.position.x += (0 - camera.position.x) * 0.1;
      camera.lookAt(0, 0, 0);

      // Pulse event radar markers
      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach((child) => {
          if (child.userData?.isPulse) {
            const scale = 1 + 0.35 * Math.sin(elapsedTime * 4.5 + (child.userData.phase || 0));
            child.scale.set(scale, scale, scale);
          }
        });
      }

      // Space orbital assets
      if (spaceGroupRef.current) {
        spaceGroupRef.current.children.forEach((child) => {
          if (child.userData?.orbitSpeed) {
            child.rotation.y += child.userData.orbitSpeed;
          }
        });
      }

      // Smooth continuous flight movement & airplane banking along Great Circle trajectory
      if (activeFlightsRef.current && activeFlightsRef.current.length > 0) {
        const delta = Math.min(0.04, clock.getDelta() || 0.016);
        activeFlightsRef.current.forEach((flight) => {
          flight.progress = (flight.progress + flight.speedFactor * delta) % 1.0;

          const pNow = slerpGreatCircle(flight.originV, flight.destV, flight.progress, flight.altitude);
          const pNext = slerpGreatCircle(
            flight.originV,
            flight.destV,
            Math.min(1.0, flight.progress + 0.003),
            flight.altitude
          );

          const forward = pNext.clone().sub(pNow).normalize();
          const up = pNow.clone().normalize();
          const right = forward.clone().cross(up).normalize();
          const adjForward = up.clone().cross(right).normalize();

          const rotMat = new THREE.Matrix4();
          rotMat.makeBasis(right, up, adjForward);

          flight.planeMesh.quaternion.setFromRotationMatrix(rotMat);
          flight.planeMesh.position.copy(pNow);

          // Update Contrail Jet Stream (last 14% of flown path)
          const trailPoints: THREE.Vector3[] = [];
          const trailLength = 0.14;
          const startT = Math.max(0, flight.progress - trailLength);
          const trailSteps = 16;
          for (let i = 0; i <= trailSteps; i++) {
            const stepT = startT + (i / trailSteps) * (flight.progress - startT);
            trailPoints.push(slerpGreatCircle(flight.originV, flight.destV, stepT, flight.altitude - 0.012));
          }
          flight.contrailGeo.setFromPoints(trailPoints);

          // Anti-collision tail strobe flash
          if (flight.strobeMesh) {
            const isFlash = Math.sin(elapsedTime * 6.5) > 0.65;
            (flight.strobeMesh.material as THREE.MeshBasicMaterial).opacity = isFlash ? 1.0 : 0.15;
          }

          // Check if this plane is the currently selected flight
          const isSelected = selectedEventRef.current?.id === flight.event.id;

          // Floating flight callsign badge above the airplane (ONLY visible when clicked!)
          if (flight.labelSprite) {
            flight.labelSprite.visible = isSelected;
            if (isSelected) {
              const labelPos = pNow.clone().add(up.clone().multiplyScalar(0.26));
              flight.labelSprite.position.copy(labelPos);
            }
          }

          // Route arc and airport pins are ONLY visible when clicked
          if (flight.routeLine) flight.routeLine.visible = isSelected;
          if (flight.origPin) flight.origPin.visible = isSelected;
          if (flight.destPin) flight.destPin.visible = isSelected;

          // Target lock selection ring on clicked aircraft
          if (flight.selectionRing) {
            flight.selectionRing.visible = isSelected;
            if (isSelected) {
              flight.selectionRing.position.copy(pNow);
              flight.selectionRing.lookAt(new THREE.Vector3(0, 0, 0));
              const pulse = 1.0 + Math.sin(elapsedTime * 5.0) * 0.12;
              flight.selectionRing.scale.set(pulse, pulse, pulse);
            }
          }
        });
      }

      // STABLE, HIGH-CONTRAST COUNTRY NAMETAG VISIBILITY
      if (countriesGroupRef.current && cameraRef.current) {
        const camPos = cameraRef.current.position;
        const tempWorldPos = new THREE.Vector3();

        countriesGroupRef.current.children.forEach((child) => {
          child.getWorldPosition(tempWorldPos);
          const normal = tempWorldPos.clone().normalize();
          const camDir = camPos.clone().sub(tempWorldPos).normalize();
          const dot = normal.dot(camDir);

          child.traverse((node) => {
            if ((node as THREE.Sprite).isSprite) {
              const sprite = node as THREE.Sprite;
              // 100% full opacity on the entire facing hemisphere for crystal-clear readability
              if (dot > 0.06) {
                sprite.visible = true;
                (sprite.material as THREE.SpriteMaterial).opacity = 1.0;
              } else if (dot > 0.0) {
                sprite.visible = true;
                (sprite.material as THREE.SpriteMaterial).opacity = dot / 0.06;
              } else {
                sprite.visible = false;
                (sprite.material as THREE.SpriteMaterial).opacity = 0;
              }
            }
          });
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      borderGeometry.dispose();
      borderMaterial.dispose();
    };
  }, []); // Run ONCE on mount!

  // Update dynamic layers, event markers, and country nametags when data changes
  useEffect(() => {
    if (!markersGroupRef.current || !spaceGroupRef.current || !arcsGroupRef.current || !countriesGroupRef.current || !bordersGroupRef.current) return;

    // Toggle 3D vector country borders
    bordersGroupRef.current.visible = activeLayers.countryBorders;

    // Clear dynamic children
    while (markersGroupRef.current.children.length > 0) {
      markersGroupRef.current.remove(markersGroupRef.current.children[0]);
    }
    while (spaceGroupRef.current.children.length > 0) {
      spaceGroupRef.current.remove(spaceGroupRef.current.children[0]);
    }
    while (arcsGroupRef.current.children.length > 0) {
      arcsGroupRef.current.remove(arcsGroupRef.current.children[0]);
    }
    if (flightsGroupRef.current) {
      while (flightsGroupRef.current.children.length > 0) {
        flightsGroupRef.current.remove(flightsGroupRef.current.children[0]);
      }
      activeFlightsRef.current = [];
    }
    while (countriesGroupRef.current.children.length > 0) {
      countriesGroupRef.current.remove(countriesGroupRef.current.children[0]);
    }

    const markersGroup = markersGroupRef.current;
    const spaceGroup = spaceGroupRef.current;
    const arcsGroup = arcsGroupRef.current;
    const countriesGroup = countriesGroupRef.current;

    const getSeverityColor = (sev: string): number => {
      switch (sev) {
        case 'CRITICAL': return 0xef4444;
        case 'HIGH': return 0xf97316;
        case 'ELEVATED': return 0xfbbf24;
        case 'GUARDED': return 0x38bdf8;
        default: return 0x10b981;
      }
    };

    const getCategoryColor = (evt: NexusEvent): number => {
      if (evt.subType === 'earthquake') return 0xf59e0b; // Amber
      if (evt.subType === 'volcano') return 0xef4444;    // Red
      if (evt.subType === 'wildfire') return 0xf97316;   // Orange
      if (evt.subType === 'hurricane') return 0x06b6d4;  // Cyan
      if (evt.subType === 'flood') return 0x3b82f6;      // Blue
      if (evt.subType === 'aircraft' || evt.category === 'transport') return 0x10b981; // Green
      if (evt.subType === 'storm' || evt.category === 'weather') return 0xa855f7; // Purple
      return getSeverityColor(evt.severity);
    };

    // 1. Natural Disasters & Flights & Weather Events (Sleek category radar pips)
    events.forEach((evt, idx) => {
      let isVisible = true;
      if (evt.subType === 'earthquake') {
        isVisible = activeLayers.earthquakes !== false && activeLayers.disasters !== false;
      } else if (evt.subType === 'volcano') {
        isVisible = activeLayers.volcanoes !== false && activeLayers.disasters !== false;
      } else if (evt.subType === 'wildfire') {
        isVisible = activeLayers.wildfires !== false && activeLayers.disasters !== false;
      } else if (evt.subType === 'hurricane') {
        isVisible = activeLayers.hurricanes !== false && activeLayers.disasters !== false;
      } else if (evt.subType === 'flood') {
        isVisible = activeLayers.floods !== false && activeLayers.disasters !== false;
      } else if (evt.subType === 'aircraft' || evt.category === 'transport') {
        // Handled dynamically with real life 3D aircraft models and continuous movement
        return;
      } else if (evt.subType === 'storm' || evt.category === 'weather') {
        isVisible = activeLayers.storms !== false && activeLayers.weather !== false;
      } else {
        isVisible = evt.category === 'disaster' && activeLayers.disasters !== false;
      }

      if (!isVisible) return;

      const pos = latLngToVector3(evt.coordinates[0], evt.coordinates[1], GLOBE_RADIUS + 0.04);
      const colorHex = getCategoryColor(evt);

      const markerRoot = new THREE.Group();
      markerRoot.position.copy(pos);
      markerRoot.lookAt(new THREE.Vector3(0, 0, 0));

      const sphereGeo = new THREE.SphereGeometry(
        evt.category === 'disaster' ? 0.06 : 0.05,
        16,
        16
      );
      const sphereMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        toneMapped: false,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.userData = { event: evt };
      markerRoot.add(sphereMesh);

      const ringGeo = new THREE.RingGeometry(0.08, 0.14, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        toneMapped: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.userData = { isPulse: true, phase: idx * 0.4, event: evt };
      markerRoot.add(ringMesh);

      if (evt.severity === 'CRITICAL') {
        const beamGeo = new THREE.CylinderGeometry(0.01, 0.03, 0.35, 8);
        const beamMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.z = -0.18;
        beamMesh.rotation.x = Math.PI / 2;
        beamMesh.userData = { event: evt };
        markerRoot.add(beamMesh);
      }

      markersGroup.add(markerRoot);
    });

    // 2. Space Layer (ISS, Aurora, Satellites)
    if (activeLayers.space) {
      const issEvent = events.find((e) => e.subType === 'iss');
      if (issEvent) {
        const issOrbitRadius = GLOBE_RADIUS * 1.18;
        const issPos = latLngToVector3(issEvent.coordinates[0], issEvent.coordinates[1], issOrbitRadius);

        const issGroup = new THREE.Group();
        issGroup.position.copy(issPos);

        const coreGeo = new THREE.BoxGeometry(0.14, 0.08, 0.1);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.2 });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.userData = { event: issEvent };
        issGroup.add(coreMesh);

        const panelGeo = new THREE.BoxGeometry(0.45, 0.02, 0.14);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x0066aa, emissiveIntensity: 0.8 });
        const panelMesh = new THREE.Mesh(panelGeo, panelMat);
        panelMesh.userData = { event: issEvent };
        issGroup.add(panelMesh);

        markersGroup.add(issGroup);

        const issOrbitPoints: THREE.Vector3[] = [];
        for (let i = 0; i <= 128; i++) {
          const theta = (i / 128) * Math.PI * 2;
          const x = Math.cos(theta) * issOrbitRadius;
          const y = Math.sin(theta) * issOrbitRadius * Math.sin((51.6 * Math.PI) / 180);
          const z = Math.sin(theta) * issOrbitRadius * Math.cos((51.6 * Math.PI) / 180);
          issOrbitPoints.push(new THREE.Vector3(x, y, z));
        }
        const issOrbitGeo = new THREE.BufferGeometry().setFromPoints(issOrbitPoints);
        const issOrbitMat = new THREE.LineDashedMaterial({
          color: 0x00f0ff,
          dashSize: 0.4,
          gapSize: 0.2,
          transparent: true,
          opacity: 0.65,
        });
        const issOrbitLine = new THREE.Line(issOrbitGeo, issOrbitMat);
        issOrbitLine.computeLineDistances();
        spaceGroup.add(issOrbitLine);
      }
    }

    // 3. Dynamic Moving Real-Life Flights & Aircraft (Accurate GPS Real-Time Positioning)
    if (activeLayers.flights !== false && activeLayers.aircraft !== false && activeLayers.transport !== false && flightsGroupRef.current) {
      const flightsGroup = flightsGroupRef.current;
      const flightEvents = events.filter((e) => e.subType === 'aircraft' || e.category === 'transport');

      flightEvents.forEach((fEvt, fIdx) => {
        const flight = fEvt as any;
        // Origin & destination coordinates
        const originCoords: [number, number] = flight.originCoords || [flight.coordinates[0] - 8, flight.coordinates[1] - 25];
        const destCoords: [number, number] = flight.destinationCoords || [flight.coordinates[0] + 8, flight.coordinates[1] + 25];

        const originV = latLngToVector3(originCoords[0], originCoords[1], GLOBE_RADIUS + 0.02);
        const destV = latLngToVector3(destCoords[0], destCoords[1], GLOBE_RADIUS + 0.02);

        // 3a. Origin and Destination Airport Pins (Hidden by default; shown only when plane is selected)
        const origCode = flight.origin?.match(/\(([A-Z]{3})\)/)?.[1] || flight.origin?.slice(0, 3)?.toUpperCase() || 'DEP';
        const destCode = flight.destination?.match(/\(([A-Z]{3})\)/)?.[1] || flight.destination?.slice(0, 3)?.toUpperCase() || 'ARR';

        const origPin = createAirportPinSprite(origCode, true);
        origPin.position.copy(latLngToVector3(originCoords[0], originCoords[1], GLOBE_RADIUS + 0.12));
        origPin.userData = { event: fEvt };
        origPin.visible = false;
        flightsGroup.add(origPin);

        const destPin = createAirportPinSprite(destCode, false);
        destPin.position.copy(latLngToVector3(destCoords[0], destCoords[1], GLOBE_RADIUS + 0.12));
        destPin.userData = { event: fEvt };
        destPin.visible = false;
        flightsGroup.add(destPin);

        // 3b. Full Flight Route Guide Arc (Subtle dashed path, highlighted when plane is selected)
        const routePoints: THREE.Vector3[] = [];
        const routeSteps = 48;
        for (let i = 0; i <= routeSteps; i++) {
          routePoints.push(slerpGreatCircle(originV, destV, i / routeSteps, GLOBE_RADIUS + 0.05));
        }
        const routeGeo = new THREE.BufferGeometry().setFromPoints(routePoints);
        const routeMat = new THREE.LineDashedMaterial({
          color: 0x38bdf8,
          dashSize: 0.25,
          gapSize: 0.15,
          transparent: true,
          opacity: 0.75,
        });
        const routeLine = new THREE.Line(routeGeo, routeMat);
        routeLine.computeLineDistances();
        routeLine.visible = false;
        flightsGroup.add(routeLine);

        // 3c. Realistic 3D Commercial Airliner Model
        const airlineColor = flight.airlineColor || 0x1d4ed8;
        const planeMesh = createRealAirplaneModel(airlineColor);
        planeMesh.userData = { event: fEvt };
        planeMesh.traverse((child) => {
          child.userData = { event: fEvt };
        });
        flightsGroup.add(planeMesh);

        // 3d. Dynamic Contrail Jet Stream Line
        const contrailGeo = new THREE.BufferGeometry();
        const contrailMat = new THREE.LineBasicMaterial({
          color: 0x67e8f9,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });
        const contrailLine = new THREE.Line(contrailGeo, contrailMat);
        flightsGroup.add(contrailLine);

        // 3e. Floating Callsign HUD Badge Sprite (Hidden by default; shown ONLY when plane is clicked!)
        const callsign = flight.callsign || 'FLIGHT';
        const routeLabel = `${origCode} → ${destCode}`;
        const speedKm = Math.round((flight.speedKnots || 490) * 1.852);
        const labelSprite = createFlightBadgeSprite(callsign, routeLabel, speedKm);
        labelSprite.userData = { event: fEvt };
        labelSprite.visible = false; // Never shown by default!
        flightsGroup.add(labelSprite);

        // 3f. Target Lock Selection Halo Ring (Active when plane is clicked)
        const targetRingGeo = new THREE.RingGeometry(0.24, 0.30, 32);
        const targetRingMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const selectionRing = new THREE.Mesh(targetRingGeo, targetRingMat);
        selectionRing.visible = false;
        flightsGroup.add(selectionRing);

        // Strobe light reference
        let strobeMesh: THREE.Mesh | null = null;
        planeMesh.traverse((c) => {
          if ((c as any).userData?.isStrobe) strobeMesh = c as THREE.Mesh;
        });

        // Compute exact real-world progress matching actual aircraft GPS coordinates
        let initialProgress = 0.5;
        if (flight.coordinates && originV && destV) {
          const currV = latLngToVector3(flight.coordinates[0], flight.coordinates[1], 1).normalize();
          const vOrigNorm = originV.clone().normalize();
          const vDestNorm = destV.clone().normalize();
          const dTotal = Math.acos(Math.max(-1, Math.min(1, vOrigNorm.dot(vDestNorm))));
          const dCurr = Math.acos(Math.max(-1, Math.min(1, vOrigNorm.dot(currV))));
          if (dTotal > 0.04) {
            initialProgress = Math.max(0.01, Math.min(0.99, dCurr / dTotal));
          } else if (typeof flight.flightProgress === 'number') {
            initialProgress = flight.flightProgress;
          }
        } else if (typeof flight.flightProgress === 'number') {
          initialProgress = flight.flightProgress;
        }

        activeFlightsRef.current.push({
          event: fEvt,
          originV,
          destV,
          originCoords,
          destCoords,
          progress: initialProgress,
          speedFactor: 0.007 + (fIdx % 3) * 0.002, // smooth realistic cruising pace
          altitude: GLOBE_RADIUS + 0.14, // elevated cruising altitude above terrain & borders
          flightGroup: flightsGroup,
          planeMesh,
          contrailLine,
          contrailGeo,
          labelSprite,
          strobeMesh,
          routeLine,
          origPin,
          destPin,
          selectionRing,
        });
      });
    }

    // 4. Render Centered Country Nametags for ALL 177+ Sovereign Nations
    if (activeLayers.countryBorders) {
      WORLD_GEOJSON.features.forEach((feature) => {
        const country = countries.find(
          (c) => c.iso === feature.id || c.name.toLowerCase() === feature.properties.name.toLowerCase()
        );
        const countryName = country?.name || feature.properties.name;
        const countryIso = country?.iso || feature.id;

        const { center, rank } = getFeatureCentroidAndRank(feature);

        // Position nametag elevated at GLOBE_RADIUS + 0.16 (safely above all markers and landmass)
        const pos = latLngToVector3(center[0], center[1], GLOBE_RADIUS + 0.16);

        const countryNodeRoot = new THREE.Group();
        countryNodeRoot.position.copy(pos);
        countryNodeRoot.userData = { country: country || { iso: countryIso, name: countryName, coordinates: center, threatLevel: 'LOW', threatScore: 20 } };

        const labelSprite = createCountryLabelSprite(countryName, rank);
        labelSprite.userData = { country: country || { iso: countryIso, name: countryName, coordinates: center, threatLevel: 'LOW', threatScore: 20 } };
        countryNodeRoot.add(labelSprite);

        countriesGroup.add(countryNodeRoot);
      });
    }

    // 5. Heatmap Mode
    if (viewMode === 'heatmap' || activeLayers.heatmaps) {
      events.forEach((evt) => {
        const hPos = latLngToVector3(evt.coordinates[0], evt.coordinates[1], GLOBE_RADIUS + 0.02);
        const heatGeo = new THREE.CircleGeometry(0.5, 24);
        const heatMat = new THREE.MeshBasicMaterial({
          color: evt.severity === 'CRITICAL' ? 0xff0044 : 0xff7700,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        const heatMesh = new THREE.Mesh(heatGeo, heatMat);
        heatMesh.position.copy(hPos);
        heatMesh.lookAt(new THREE.Vector3(0, 0, 0));
        markersGroup.add(heatMesh);
      });
    }

    // 6. Highlighted Focus Target Beacon (from News "Show on Globe" or Search)
    if (focusCoords && focusCoords.length === 2) {
      const fPos = latLngToVector3(focusCoords[0], focusCoords[1], GLOBE_RADIUS + 0.06);

      // Glowing animated reticle ring
      const reticleGeo = new THREE.RingGeometry(0.14, 0.28, 32);
      const reticleMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });
      const reticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
      reticleMesh.position.copy(fPos);
      reticleMesh.lookAt(new THREE.Vector3(0, 0, 0));
      reticleMesh.userData = { isPulse: true, phase: 0 };
      markersGroup.add(reticleMesh);

      // Center bullseye ping
      const pinGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(fPos);
      markersGroup.add(pinMesh);

      // Elevated headline/city banner
      if (focusLabel) {
        const labelSprite = createFocusBeaconSprite(focusLabel);
        const lPos = latLngToVector3(focusCoords[0], focusCoords[1], GLOBE_RADIUS + 0.32);
        labelSprite.position.copy(lPos);
        markersGroup.add(labelSprite);
      }
    }
  }, [events, countries, activeLayers, viewMode, focusCoords, focusLabel, GLOBE_RADIUS]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#04060a]">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Active Focus Story Banner (Shows when user clicks "Show on Globe" on news or events) */}
      {focusLabel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.3)] backdrop-blur-md max-w-md animate-in fade-in slide-in-from-top duration-300">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 relative" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <span>FOCUSED LOCATION ON GLOBE</span>
            </div>
            <div className="text-xs text-white font-medium truncate">{focusLabel}</div>
          </div>
          {onClearFocus && (
            <button
              onClick={() => onClearFocus()}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold"
              title="Clear focus marker"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Selected Flight Live Telemetry Card (Only visible when a plane is clicked) */}
      {selectedEvent && (selectedEvent.subType === 'aircraft' || selectedEvent.category === 'transport') && (
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/95 border border-cyan-400/70 shadow-[0_0_35px_rgba(0,240,255,0.35)] backdrop-blur-md max-w-sm animate-in fade-in slide-in-from-left duration-250">
          <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                REAL-TIME FLIGHT RADAR TRACK
              </span>
            </div>
            <button
              onClick={() => onSelectEvent(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold"
              title="Close flight track"
            >
              ✕
            </button>
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>✈️ {(selectedEvent as any).callsign || selectedEvent.title}</span>
              {(selectedEvent as any).airline && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-normal">
                  {(selectedEvent as any).airline}
                </span>
              )}
            </div>
            <div className="text-xs text-cyan-300 font-mono mt-0.5">
              {(selectedEvent as any).origin || 'Airborne'} → {(selectedEvent as any).destination || 'En Route'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400">Altitude: </span>
              <span className="text-white font-semibold">{(selectedEvent as any).altitudeFt?.toLocaleString() || 'Cruising'} ft</span>
            </div>
            <div>
              <span className="text-slate-400">Speed: </span>
              <span className="text-white font-semibold">
                {Math.round(((selectedEvent as any).speedKnots || 480) * 1.852)} km/h
              </span>
            </div>
            <div>
              <span className="text-slate-400">Aircraft: </span>
              <span className="text-white font-semibold truncate block" title={(selectedEvent as any).aircraftModel}>
                {(selectedEvent as any).aircraftModel || 'Commercial Jet'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Heading: </span>
              <span className="text-white font-semibold">{(selectedEvent as any).metrics?.Heading || 'En Route'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
            <span className="text-emerald-400/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>ADS-B Transponder Verified</span>
            </span>
            <span className="text-cyan-400 text-[9px]">Click anywhere to deselect</span>
          </div>
        </div>
      )}

      {/* Tactical Compass Rose & Telemetry Watermark */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none flex flex-col items-end text-[10px] text-cyan-500/70 font-mono tracking-widest">
        <div className="flex items-center gap-2">
          <span>LAT/LNG SYNC ACTIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <span className="text-slate-400">PROJECTION: EQUIRECTANGULAR / SPHERICAL 3D</span>
        <span className="text-slate-400">177 SOVEREIGN NATIONS MAPPED</span>
      </div>

      {/* Bottom Floating Tactical Controls: Zoom & Spin */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-cyan-500/30 text-xs font-code shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <button
          onClick={() => {
            tacticalAudio.playClick();
            cameraDistanceRef.current = Math.max(6.5, cameraDistanceRef.current - 1.8);
          }}
          className="px-2.5 py-1 rounded-full bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors border border-cyan-500/30 cursor-pointer"
          title="Zoom in"
        >
          + ZOOM
        </button>
        <button
          onClick={() => {
            tacticalAudio.playClick();
            cameraDistanceRef.current = Math.min(22.0, cameraDistanceRef.current + 1.8);
          }}
          className="px-2.5 py-1 rounded-full bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors border border-cyan-500/30 cursor-pointer"
          title="Zoom out"
        >
          - ZOOM
        </button>
        <div className="h-4 w-px bg-cyan-500/30 mx-1" />
        <button
          onClick={() => {
            tacticalAudio.playClick();
            targetRotationRef.current = { x: 0.35, y: -Math.PI / 2 };
            cameraDistanceRef.current = 14.0;
            if (onClearFocus) onClearFocus();
          }}
          className="px-2.5 py-1 rounded-full bg-slate-900/60 text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
          title="Reset globe view"
        >
          RESET
        </button>
        <button
          onClick={() => {
            tacticalAudio.playClick();
            onToggleAutoRotate();
          }}
          className={`px-3 py-1 rounded-full transition-colors border cursor-pointer flex items-center gap-1.5 ${
            isAutoRotating
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
              : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
          }`}
          title="Toggle planetary auto-rotation"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAutoRotating ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
          <span>{isAutoRotating ? 'ROTATION: ON' : 'ROTATION: OFF'}</span>
        </button>
      </div>

      {/* Tactical Hover HUD Tooltip */}
      {hoveredInfo && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-2 rounded-sm bg-[#050b14]/95 border border-cyan-500/50 text-xs shadow-[0_0_15px_rgba(0,240,255,0.25)] font-code backdrop-blur-md max-w-xs transition-opacity duration-150"
          style={{
            left: `${hoveredInfo.x + 16}px`,
            top: `${hoveredInfo.y - 30}px`,
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-1 mb-1">
            <span className="text-[10px] text-cyan-400 font-bold tracking-wider">
              {hoveredInfo.category}
            </span>
            {hoveredInfo.severity && (
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                  hoveredInfo.severity === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : hoveredInfo.severity === 'HIGH'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {hoveredInfo.severity}
              </span>
            )}
          </div>
          <div className="font-semibold text-slate-100 text-sm">{hoveredInfo.title}</div>
          {hoveredInfo.meta && (
            <div className="text-[11px] text-slate-300 mt-1">{hoveredInfo.meta}</div>
          )}
          <div className="text-[10px] text-cyan-300 font-medium mt-1.5 flex items-center gap-1">
            <span>Click for full details</span>
            <span>▸</span>
          </div>
        </div>
      )}
    </div>
  );
};
