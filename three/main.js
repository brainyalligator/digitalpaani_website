// Wastewater facility scene: scroll-driven animation using GSAP ScrollTrigger
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://esm.sh/three@0.154.0/examples/jsm/controls/OrbitControls.js';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Scroll progress (0.0 to 1.0) - the ONLY driver of animation state
let scrollProgress = 0;

// Dashboard state management - scroll-driven
let dashboardState = {
  visible: false,
  status: 'red', // 'red', 'amber', 'green'
  titleText: 'Leak detected – Reactor Tank',
  subtext: 'Anomaly identified from sensor data',
  titleTransitionProgress: 0, // 0 = old text, 1 = new text
  subtextTransitionProgress: 0 // 0 = old text, 1 = new text
};

// Update dashboard based on scroll progress
function updateDashboard(scrollProgress) {
  const dashboard = document.getElementById('dp-dashboard');
  if (!dashboard) return;

  const titleContainer = dashboard.querySelector('.dp-card-title');
  const statusIndicator = dashboard.querySelector('.dp-status-indicator');
  const subtextElement = dashboard.querySelector('.dp-card-subtext');

  // Dashboard visibility: appears after sensors finish flashing (0.62)
  const dashboardStart = 0.63; // Start after sensor flash completes (0.62)
  const shouldBeVisible = scrollProgress >= dashboardStart;
  
  if (shouldBeVisible && !dashboardState.visible) {
    dashboard.classList.remove('dp-dashboard-hidden');
    dashboard.offsetHeight; // force reflow
    dashboard.classList.add('dp-dashboard-visible');
    dashboardState.visible = true;
  } else if (!shouldBeVisible && dashboardState.visible) {
    dashboard.classList.remove('dp-dashboard-visible');
    dashboard.classList.add('dp-dashboard-hidden');
    dashboardState.visible = false;
  }

  if (!dashboardState.visible) return;

  // Status indicator: red (0.63-0.78), amber (0.78-0.9), green (0.9-1.0) - fully reversible
  // Red state matches "Leak detected" duration (0.63-0.78), starts after sensor flash
  const amberStart = 0.78; // Adjusted to match analyzing start
  const greenStart = 0.9;
  
  // Fully reversible status indicator
  if (scrollProgress >= greenStart) {
    if (dashboardState.status !== 'green') {
      statusIndicator?.classList.remove('analyzing');
      statusIndicator?.classList.add('resolved');
      dashboardState.status = 'green';
    }
  } else if (scrollProgress >= amberStart) {
    if (dashboardState.status !== 'amber') {
      statusIndicator?.classList.add('analyzing');
      statusIndicator?.classList.remove('resolved');
      dashboardState.status = 'amber';
    }
  } else {
    if (dashboardState.status !== 'red') {
      statusIndicator?.classList.remove('analyzing', 'resolved');
      dashboardState.status = 'red';
    }
  }

  // Title text transitions: fully scroll-driven with slower pacing and extended analyzing state
  // Ranges: "leak" (0.63-0.78), "analyzing" (0.78-0.90), "stable" (0.90-1.0)
  // "Leak detected" and "Analyzing reactor" both stay visible for 0.15 scroll range
  // Dashboard appears after sensors finish flashing (0.62)
  const titleDetectedStart = 0.63; // Start after sensor flash completes
  const titleDetectedEnd = 0.78; // Adjusted to maintain 0.15 range
  const titleAnalyzingStart = 0.78; // Adjusted to maintain 0.15 range
  const titleAnalyzingEnd = 0.90; // Ends when stable starts
  const titleStableStart = 0.90;
  const transitionDuration = 0.10; // Same transition duration between all states
  
  if (titleContainer) {
    const leakText = titleContainer.querySelector('.dp-card-title-text[data-text="leak"]');
    const analyzingText = titleContainer.querySelector('.dp-card-title-text[data-text="analyzing"]');
    const stableText = titleContainer.querySelector('.dp-card-title-text[data-text="stable"]');
    
    if (scrollProgress < titleDetectedEnd) {
      // Show "Leak detected" - fade out as we approach analyzing
      const fadeStart = titleAnalyzingStart - transitionDuration;
      const fadeProgress = scrollProgress >= fadeStart
        ? Math.min(1, (scrollProgress - fadeStart) / transitionDuration)
        : 0;
      if (leakText) leakText.style.opacity = String(1 - fadeProgress);
      if (analyzingText) analyzingText.style.opacity = String(fadeProgress);
      if (stableText) stableText.style.opacity = '0';
    } else if (scrollProgress < titleAnalyzingEnd) {
      // Show "Analyzing reactor" - fully visible, then fade to stable near end
      const fadeToStableStart = titleStableStart - transitionDuration;
      const fadeToStable = scrollProgress >= fadeToStableStart
        ? Math.min(1, (scrollProgress - fadeToStableStart) / transitionDuration)
        : 0;
      
      if (leakText) leakText.style.opacity = '0';
      if (analyzingText) analyzingText.style.opacity = String(1 - fadeToStable);
      if (stableText) stableText.style.opacity = String(fadeToStable);
    } else if (scrollProgress < titleStableStart) {
      // Transition period between analyzing and stable (same duration as detected->analyzing)
      const transitionProgress = (scrollProgress - titleAnalyzingEnd) / (titleStableStart - titleAnalyzingEnd);
      if (leakText) leakText.style.opacity = '0';
      if (analyzingText) analyzingText.style.opacity = String(1 - transitionProgress);
      if (stableText) stableText.style.opacity = String(transitionProgress);
    } else {
      // Show "System stable"
      if (leakText) leakText.style.opacity = '0';
      if (analyzingText) analyzingText.style.opacity = '0';
      if (stableText) stableText.style.opacity = '1';
    }
  }

  // Subtext transitions: fully scroll-driven with slower pacing and extended analyzing state
  // Ranges: "anomaly" (0.63-0.78), "analysis" (0.78-0.90), "stable" (0.90-1.0)
  // "Anomaly identified" and "AI-driven analysis" both stay visible for 0.15 scroll range
  // Dashboard appears after sensors finish flashing (0.62)
  const subtextDetectedStart = 0.63; // Start after sensor flash completes
  const subtextDetectedEnd = 0.78; // Adjusted to maintain 0.15 range
  const subtextAnalyzingStart = 0.78; // Adjusted to maintain 0.15 range
  const subtextAnalyzingEnd = 0.90; // Ends when stable starts
  const subtextStableStart = 0.90;
  
  const anomalyText = dashboard.querySelector('.dp-card-subtext[data-text="anomaly"]');
  const analysisText = dashboard.querySelector('.dp-card-subtext[data-text="analysis"]');
  const stableSubtext = dashboard.querySelector('.dp-card-subtext[data-text="stable"]');
  
  if (scrollProgress < subtextDetectedEnd) {
    // Show "Anomaly identified" - fade out as we approach analyzing
    const fadeStart = subtextAnalyzingStart - transitionDuration;
    const fadeProgress = scrollProgress >= fadeStart
      ? Math.min(1, (scrollProgress - fadeStart) / transitionDuration)
      : 0;
    if (anomalyText) anomalyText.style.opacity = String(1 - fadeProgress);
    if (analysisText) analysisText.style.opacity = String(fadeProgress);
    if (stableSubtext) stableSubtext.style.opacity = '0';
  } else if (scrollProgress < subtextAnalyzingEnd) {
    // Show "AI-driven root cause analysis" - fully visible, then fade to stable near end
    const fadeToStableStart = subtextStableStart - transitionDuration;
    const fadeToStable = scrollProgress >= fadeToStableStart
      ? Math.min(1, (scrollProgress - fadeToStableStart) / transitionDuration)
      : 0;
    
    if (anomalyText) anomalyText.style.opacity = '0';
    if (analysisText) analysisText.style.opacity = String(1 - fadeToStable);
    if (stableSubtext) stableSubtext.style.opacity = String(fadeToStable);
  } else if (scrollProgress < subtextStableStart) {
    // Transition period between analyzing and stable (same duration as detected->analyzing)
    const transitionProgress = (scrollProgress - subtextAnalyzingEnd) / (subtextStableStart - subtextAnalyzingEnd);
    if (anomalyText) anomalyText.style.opacity = '0';
    if (analysisText) analysisText.style.opacity = String(1 - transitionProgress);
    if (stableSubtext) stableSubtext.style.opacity = String(transitionProgress);
  } else {
    // Show "System stable"
    if (anomalyText) anomalyText.style.opacity = '0';
    if (analysisText) analysisText.style.opacity = '0';
    if (stableSubtext) stableSubtext.style.opacity = '1';
  }
}

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd3e7ec);

// Camera -- initial wide view, positioned so tanks appear left-aligned
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// Position camera to frame tanks left-aligned in viewport
camera.position.set(15, 11, 20); // Moved further right to make tanks appear left-aligned
camera.lookAt(0, 2, 0); // Look at center of tank system (first tank at x=0)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-root').appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 9;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI / 1.8;
controls.target.set(0, 2, 0); // Set to center of tank system for left-aligned view
controls.update();
let controlsWereDisabled = false;

// Camera calibration mode
let calibrationMode = false;
let calibrationControls = null;

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd9e3ee, 0.95);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xf9fafb, 0.55);
dirLight.position.set(17, 20, 13);
scene.add(dirLight);

// Materials and color utilities (as before)
const tankOuterColor = 0x858e98;
const tankTopColor = 0x9fb4c4;
const tankMatBase = new THREE.MeshStandardMaterial({ color: tankOuterColor, metalness: 0.45, roughness: 0.29, clearcoat: 0.21, flatShading: true, transparent: true, opacity: 0.38 });
const tankTopMatBase = new THREE.MeshStandardMaterial({ color: tankTopColor, metalness: 0.32, roughness: 0.36, clearcoat: 0.24, flatShading: false });
const waterColor = 0x5b9bab;
const waterDegradedColor = 0x61524B; // Brownish degraded color
const waterMatBase = new THREE.MeshPhysicalMaterial({ color: waterColor, metalness: 0.09, roughness: 0.14, transmission: 0.93, thickness: 0.23, ior: 1.33, opacity: 0.49, transparent: true, clearcoat: 0.08, side: THREE.DoubleSide });
// Clouded water material for degraded tanks (tanks 2 and 3 only, after degradation starts)
const waterCloudedMat = new THREE.MeshPhysicalMaterial({ color: waterColor, metalness: 0.09, roughness: 0.14, transmission: 0.75, thickness: 0.23, ior: 1.33, opacity: 0.65, transparent: true, clearcoat: 0.08, side: THREE.DoubleSide });
const steelPipeMat = new THREE.MeshPhysicalMaterial({ color: 0xb5bac3, metalness: 0.76, roughness: 0.18, clearcoat: 0.18, transparent: true, opacity: 0.26, transmission: 0.57, thickness: 0.15, side: THREE.DoubleSide });
const steelMat = new THREE.MeshStandardMaterial({ color: 0xb5bac3, metalness: 0.8, roughness: 0.19 });
const platformMat = new THREE.MeshStandardMaterial({ color: 0xdccfa5, metalness: 0.33, roughness: 0.32 });
const probeMat = new THREE.MeshStandardMaterial({ color: 0xaeaeae, metalness: 0.65, roughness: 0.17 });
const aerMat = new THREE.MeshStandardMaterial({ color: 0x81898d, metalness: 0.54, roughness: 0.42 });
const pipeWaterMat = new THREE.MeshPhysicalMaterial({ color: 0x92dbf7, metalness: 0.09, roughness: 0.14, transmission: 0.93, thickness: 0.2, ior: 1.33, opacity: 0.53, transparent: true, clearcoat: 0.11, side: THREE.DoubleSide });
const leakColor = 0x48a7e1;
const leakMaterial = new THREE.MeshPhysicalMaterial({ color: leakColor, roughness: 0.17, metalness: 0.1, transmission: 0.89, clearcoat: 0.13, transparent: true, opacity: 0.77, side: THREE.DoubleSide });
const crackMaterial = new THREE.LineBasicMaterial({ color: 0x151b21, transparent: true, opacity: 0 });
function fadedMat(mat, saturation = 0.75, darken = 0.89) {
  const c = new THREE.Color().copy(mat.color);
  c.lerp(new THREE.Color(0x88898f), 1 - saturation);
  c.multiplyScalar(darken);
  const m = mat.clone();
  m.color.copy(c);
  m.opacity = mat.opacity;
  return m;
}
const highlightColor = 0xde3c3c;
function highlightedMat(mat, redStrength = 0.7, highlightBoost = 1.07) {
  const c = new THREE.Color().copy(mat.color);
  c.lerp(new THREE.Color(highlightColor), redStrength);
  c.multiplyScalar(highlightBoost);
  const m = mat.clone();
  m.color.copy(c);
  m.opacity = mat.opacity;
  return m;
}
// Calm focus without red tint - just subtle brightness boost
const calmFocusMat = (() => {
  const m = tankMatBase.clone();
  const c = new THREE.Color().copy(tankMatBase.color);
  c.multiplyScalar(1.13); // Just brightness, no red
  m.color.copy(c);
  return m;
})();
const calmFocusWaterMat = (() => {
  const m = waterMatBase.clone();
  const c = new THREE.Color().copy(waterMatBase.color);
  c.multiplyScalar(1.06); // Just brightness, no red
  m.color.copy(c);
  return m;
})();

// Geometry setup (as before, with beige bases)
const tanks = [];
const tankSpacing = 6.7;
const tankDefs = [
  { x: 0, r: 2.3, h: 2, waterR: 2.03, waterH: 1.7, type: "influent" },
  { x: tankSpacing, r: 2.6, h: 2.7, waterR: 2.37, waterH: 2.45, type: "sbr" },
  { x: tankSpacing * 2, r: 2.2, h: 2.1, waterR: 1.95, waterH: 1.7, type: "effluent" }
];
for (let i = 0; i < tankDefs.length; i++) {
  const { x, r, h, waterR, waterH, type } = tankDefs[i];
  const platformBase = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.4, r + 0.4, 0.3, 50), platformMat);
  platformBase.position.set(x, 0.15, 0);
  scene.add(platformBase);
  let tankMat = tankMatBase, waterMat = waterMatBase, topMat = tankTopMatBase;
  const tankMesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64, 1, false), tankMat.clone());
  tankMesh.position.set(x, h / 2 + 0.15, 0);
  scene.add(tankMesh);
  let waterMesh = new THREE.Mesh(new THREE.CylinderGeometry(waterR * 0.985, waterR, waterH, 64, 1, true), waterMat.clone());
  waterMesh.position.set(x, waterH / 2 + 0.175, 0);
  scene.add(waterMesh);
  let tankLid = null;
  if (type === "effluent") {
    tankLid = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.98, r * 0.98, 0.1, 64), topMat.clone());
    tankLid.position.set(x, h + 0.13, 0);
    scene.add(tankLid);
  } else if (type === "sbr") {
    tankLid = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.98, r * 0.98, 0.08, 64), topMat.clone());
    tankLid.position.set(x, h + 0.14, 0);
    scene.add(tankLid);
  }
  if (type === "sbr") {
    // (restore the original three process pipes through the SBR tank)
    for (let p = 0; p < 3; p++) {
      const pipeYTop = h + 1.21, pipeYBase = 0.21;
      const pipeLength = pipeYTop - pipeYBase;
      const phi = p * Math.PI * 2 / 3;
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, pipeLength, 20), steelPipeMat.clone());
      pipe.position.set(x + Math.cos(phi) * 0.58, pipeYBase + pipeLength / 2, Math.sin(phi) * 0.58);
      scene.add(pipe);
    }
    // Sensors: animate-in, varied appearance
    // Integrated wastewater instrumentation: process probe + level sensor
    const reactorSensors = [], reactorSensorDefs = [];
    // Grid of 4 side-mounted sensors - hockey puck shape with pulsing yellow light
    const waterSurfaceY = waterH + 0.175;
    const puckRadius = 0.038; // Small
    const puckHeight = 0.012; // Flat like a hockey puck
    const probeMat = new THREE.MeshStandardMaterial({
      color: 0x4a5560,
      metalness: 0.5,
      roughness: 0.35
    });
    probeMat.isSensorMaterial = true; // Mark as sensor material to prevent interference
    const puckGeo = new THREE.CylinderGeometry(puckRadius, puckRadius, puckHeight, 16);
    // Grid configuration: 2x2 pattern - CLOSER TOGETHER
    const gridPhis = [Math.PI * 0.21, Math.PI * 0.23, Math.PI * 0.21, Math.PI * 0.23]; // Even tighter horizontal spacing
    const gridYs = [
      waterSurfaceY - (waterH * 0.26), // Top left
      waterSurfaceY - (waterH * 0.26), // Top right
      waterSurfaceY - (waterH * 0.30), // Bottom left (closer to top)
      waterSurfaceY - (waterH * 0.30)  // Bottom right (closer to top)
    ];
    const probeStartDist = r + 0.5;
    const probeEndDist = r - puckHeight / 2 - 0.005; // Flush with inner wall
    for (let i = 0; i < 4; i++) {
      const probePhi = gridPhis[i];
      const probeY = gridYs[i];
      const puckMat = probeMat.clone();
      puckMat.isSensorMaterial = true; // Mark cloned material as sensor material
      const puck = new THREE.Mesh(puckGeo, puckMat);
      puck.rotation.z = Math.PI / 2; // Orient flat against wall
      puck.rotation.y = probePhi;
      puck.position.set(x + Math.cos(probePhi) * probeStartDist, probeY, Math.sin(probePhi) * probeStartDist);
      puck.visible = false;
      scene.add(puck);
      // Store original color for flash restoration
      const originalColor = new THREE.Color().copy(puckMat.color);
      reactorSensors.push(puck);
      reactorSensorDefs.push({
        phi: probePhi,
        y: probeY,
        startDist: probeStartDist,
        endDist: probeEndDist,
        kind: "probe",
        mat: puck.material,
        originalColor: originalColor
      });
    }
    // 2) Top-mounted level sensor (compact, on lid)
    const lidY = h + 0.13;
    const levelHousingGeo = new THREE.CylinderGeometry(0.085, 0.092, 0.14, 16); // Larger
    const levelConeGeo = new THREE.ConeGeometry(0.068, 0.11, 12); // Larger cone
    const levelMat = new THREE.MeshStandardMaterial({
      color: 0x4a5560,
      metalness: 0.5,
      roughness: 0.35
    });
    levelMat.isSensorMaterial = true; // Mark as sensor material to prevent interference
    const levelSensor = new THREE.Mesh(levelHousingGeo, levelMat);
    const levelConeMat = levelMat.clone();
    levelConeMat.isSensorMaterial = true; // Mark cloned material as sensor material
    const levelCone = new THREE.Mesh(levelConeGeo, levelConeMat);
    levelCone.position.y = -0.07 - 0.055;
    levelCone.rotation.x = Math.PI;
    levelSensor.add(levelCone);
    const levelStartY = lidY + 0.55; // Start higher
    const levelEndY = lidY + 0.07 + 0.012; // On lid
    levelSensor.position.set(x, levelStartY, 0);
    levelSensor.rotation.x = 0;
    levelSensor.visible = false;
    scene.add(levelSensor);
    // Store original colors for flash restoration
    const levelOriginalColor = new THREE.Color().copy(levelMat.color);
    const levelConeOriginalColor = new THREE.Color().copy(levelConeMat.color);
    reactorSensors.push(levelSensor);
    reactorSensorDefs.push({
      phi: 0,
      y: levelEndY,
      startY: levelStartY,
      endY: levelEndY,
      kind: "level",
      mat: levelMat,
      coneMat: levelCone.material,
      originalColor: levelOriginalColor,
      originalConeColor: levelConeOriginalColor
    });
    const aerRing = new THREE.Mesh(new THREE.TorusGeometry(r * 0.80, 0.09, 8, 36), aerMat);
    aerRing.position.set(x, 0.47, 0);
    aerRing.rotation.x = Math.PI / 2;
    scene.add(aerRing);
    tanks.push({
      x, r, h, waterR, waterH, type, tankMesh, waterMesh, tankLid,
      reactorSensors, reactorSensorDefs, sensorSlide: 0, sensorAnim: false, sensorAnimStart: 0,
      sensorStartCycleElapsed: null, frozenWaterLevelFrac: null,
      pulseStartTime: null, pulseComplete: false
    });
    continue;
  }
  tanks.push({ x, r, h, waterR, waterH, type, tankMesh, waterMesh, tankLid });
}
function addHollowPipe({ x, y, z, length, outerR, innerR, rotAxis, rotAngle }) {
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(outerR, outerR, length, 18), steelPipeMat);
  pipe.position.set(x, y, z);
  if (rotAxis) pipe.rotateOnAxis(rotAxis, rotAngle);
  scene.add(pipe);
  const pipeWater = new THREE.Mesh(new THREE.CylinderGeometry(innerR, innerR, length * 0.98, 18), pipeWaterMat);
  pipeWater.position.copy(pipe.position);
  if (rotAxis) pipeWater.rotateOnAxis(rotAxis, rotAngle);
  scene.add(pipeWater);
}
for (let i = 0; i < tanks.length - 1; i++) {
  const thisR = tanks[i].r, nextR = tanks[i + 1].r;
  const y = Math.min(tanks[i].h, tanks[i + 1].h) * 0.38 + 0.15;
  const fromX = tanks[i].x + thisR + 0.001, toX = tanks[i + 1].x - nextR - 0.001;
  const pipeLen = toX - fromX, pipeX = (fromX + toX) / 2;
  addHollowPipe({ x: pipeX, y, z: 0, length: pipeLen, outerR: 0.21, innerR: 0.13, rotAxis: new THREE.Vector3(0, 0, 1), rotAngle: Math.PI / 2 });
}
const inletR = tanks[0].r, inletY = tanks[0].h * 0.4 + 0.15;
addHollowPipe({ x: -inletR - 2.3 / 2 + 0.001, y: inletY, z: 0, length: 2.3, outerR: 0.17, innerR: 0.1, rotAxis: new THREE.Vector3(0, 0, 1), rotAngle: Math.PI / 2 });
const outletIdx = tanks.length - 1, outletR = tanks[outletIdx].r, outletY = tanks[outletIdx].h * 0.34 + 0.15;
addHollowPipe({ x: tanks[outletIdx].x + outletR + 2 / 2 - 0.001, y: outletY, z: 0, length: 2, outerR: 0.14, innerR: 0.083, rotAxis: new THREE.Vector3(0, 0, 1), rotAngle: Math.PI / 2 });
for (let i = 0; i < tanks.length; i++) {
  const { x, r } = tanks[i];
  for (let j = 0; j < 3; j++) {
    const beamGeo = new THREE.CylinderGeometry(0.15, 0.18, 1, 12), beam = new THREE.Mesh(beamGeo, steelMat);
    const angle = (j / 3) * 2 * Math.PI;
    beam.position.set(x + Math.cos(angle) * (r - 0.7), -0.4, Math.sin(angle) * (r - 0.7));
    scene.add(beam);
  }
}
// Scroll-driven animation state (no time-based variables)
let maxDegradationFrac = 0; // Track maximum degradation (for smooth transitions)
const reactorIdx = 1;
const effluentIdx = 2;
// Use getter functions to avoid accessing tanks before they're populated
function getReactor() { return tanks[reactorIdx]; }
function getEffluent() { return tanks[effluentIdx]; }
let leakMeshes = [], crackMesh = null, leakGrowth = 0, crackAlpha = 0;
// Initialize crack geometry after tanks are created - use getter function
const tankCurveAngle = Math.PI / 8;
const crackLen = 0.25, crackSegs = 13;
let crackPath = [];
let leakOrigin = null;
let leakLenTotal = 0;

// Initialize crack geometry after tanks are populated
function initializeCrackGeometry() {
  const reactor = getReactor();
  if (!reactor) return; // Safety check

  const crackRadius = reactor.r + 0.012;
  const baseY = reactor.h / 3 + 0.30;
  crackPath = [];
  for (let i = 0; i < crackSegs; i++) {
    const frac = i / (crackSegs - 1), y = baseY + frac * crackLen;
    const off = (0.10 + 0.09 * frac) * Math.sin(frac * Math.PI * 3.1 + 0.4) * (1 - frac * 0.8);
    const a = tankCurveAngle + 0.03 * frac + off * 0.13;
    crackPath.push(new THREE.Vector3(
      reactor.x + Math.cos(a) * crackRadius,
      y,
      Math.sin(a) * crackRadius
    ));
  }
  if (!crackMesh) {
    crackMesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(crackPath), crackMaterial.clone());
    scene.add(crackMesh);
  } else {
    crackMesh.geometry.setFromPoints(crackPath);
  }
  leakOrigin = crackPath[crackSegs - 1];
  leakLenTotal = reactor ? reactor.h * 0.85 : 0;
}

// Store leak segment base positions for animation
let leakSegmentData = [];

// Track if leak meshes are fully formed to avoid unnecessary recreation
let leakMeshesFullyFormed = false;

function createLeakMeshes(timeFrac) {
  // Ensure crack geometry is initialized
  if (!leakOrigin || leakLenTotal === 0) {
    initializeCrackGeometry();
  }

  // Only recreate leak meshes if:
  // 1. Meshes don't exist yet, OR
  // 2. timeFrac has changed significantly (more than 0.05), OR
  // 3. We're still forming (timeFrac < 1.0) and need to show more segments
  const needsRecreation = leakMeshes.length === 0 ||
    Math.abs(timeFrac - (leakMeshes[0].userData.timeFrac || 0)) > 0.05 ||
    (!leakMeshesFullyFormed && timeFrac >= 1.0);

  if (needsRecreation) {
    leakMeshes.forEach(mesh => scene.remove(mesh));
    leakMeshes = [];
    leakSegmentData = [];

    // Use fixed values for constant, linear leak pattern (no randomness)
    // Increased segments for smoother, more continuous tap-like flow
    const fixedOutward = [0.15, 0.14]; // Fixed values for each stream
    const fixedSideways = [-0.10, 0.12]; // Fixed values for each stream
    const fixedSegs = [18, 20]; // Increased segment counts for smoother continuous flow

    for (let s = 0; s < 2; s++) {
      let prev = leakOrigin.clone();
      const outward = fixedOutward[s];
      const sideways = fixedSideways[s];
      const segs = fixedSegs[s];

      for (let i = 1; i < segs; i++) {
        const f = i / (segs - 1);
        if (f > timeFrac) break; // Only show segments up to timeFrac

        const arc = Math.pow(f, 1.09);
        let local = leakOrigin.clone();
        // Use fixed fall distance multiplier for consistent pattern
        const fallMultiplier = s === 0 ? 0.72 : 0.68; // Fixed values for each stream
        local.y -= arc * leakLenTotal * fallMultiplier;
        local.x += outward * (0.5 - arc) + sideways * arc * arc;
        local.z += (Math.sin(tankCurveAngle) * (outward * (1 - arc)));

        const mid = prev.clone().lerp(local, 0.5);
        const dir = new THREE.Vector3().subVectors(local, prev);
        const length = dir.length();

        if (length > 0.01) {
          // Smaller radius and longer segments for smoother, more continuous appearance
          const geo = new THREE.CapsuleGeometry(0.055, length + 0.02, 8, 12); // Increased overlap
          const mesh = new THREE.Mesh(geo, leakMaterial.clone());
          const basePosition = mid.clone(); // Store base position for animation
          mesh.position.copy(basePosition);
          mesh.lookAt(local);
          scene.add(mesh);
          // More consistent opacity for continuous stream appearance
          mesh.material.opacity = 0.68 + 0.22 * Math.max(0, f - 0.1);
          mesh.userData.timeFrac = timeFrac;
          mesh.userData.basePosition = basePosition;
          mesh.userData.lookTarget = local.clone();
          mesh.userData.streamIndex = s; // Store which stream this belongs to
          mesh.userData.segmentIndex = i; // Store segment index for flow animation
          mesh.userData.streamFraction = f; // Store position in stream (0 to 1)
          leakMeshes.push(mesh);
          leakSegmentData.push({ basePos: basePosition, lookTarget: local.clone() });
        }
        prev = local;
      }
    }

    // Mark as fully formed if timeFrac >= 1.0
    if (timeFrac >= 1.0) {
      leakMeshesFullyFormed = true;
    }
  }
}
const dropFrac = 0.20; // Water drop amount
let focusPhase = 0;

// System phase management - single source of truth for water behavior
const SYSTEM_PHASES = {
  HEALTHY: "healthy",
  LEAK: "leak",
  DEGRADED: "degraded",
  SENSORS_ATTACHED: "sensors_attached",
  ANALYZING: "analyzing",
  CORRECTIVE_ACTION: "corrective_action",
  RESOLVED: "resolved"
};
let systemPhase = SYSTEM_PHASES.HEALTHY;
// Camera positions - explicitly defined for scroll progress 0
let cameraStartPos = new THREE.Vector3(15, 11, 20); // Initial wide view, tanks left-aligned
let cameraFinalPos = new THREE.Vector3(); // Will be calculated
let cameraStartTarget = new THREE.Vector3(0, 2, 0); // Initial look-at at center of tank system
let cameraFinalTarget = new THREE.Vector3(); // Will be calculated

// Store target colors for smooth interpolation
const tankTargetColors = [];
const waterTargetColors = [];

function setTankMaterialStates(phase, elapsed) {
  for (let i = 0; i < tanks.length; i++) {
    const t = tanks[i];

    // Initialize target color storage if needed
    if (!tankTargetColors[i]) {
      tankTargetColors[i] = new THREE.Color().copy(tankMatBase.color);
      waterTargetColors[i] = new THREE.Color().copy(waterMatBase.color);
    }

    let targetTankColor, targetWaterColor;

    if (i !== reactorIdx) {
      // Non-reactor tanks: smoothly fade, never highlight
      if (phase >= 1) {
        // Smoothly interpolate fade amount based on phase and elapsed time
        const fadeAmount = phase === 1 ? Math.min(1, (elapsed || 0) / 0.25) : 1;
        const baseColor = new THREE.Color().copy(tankMatBase.color);
        const fadedColor = new THREE.Color().copy(fadedMat(tankMatBase).color);
        targetTankColor = new THREE.Color().lerpColors(baseColor, fadedColor, fadeAmount);

        const baseWaterColor = new THREE.Color().copy(waterMatBase.color);
        const fadedWaterColor = new THREE.Color().copy(fadedMat(waterMatBase, 0.73, 0.82).color);
        targetWaterColor = new THREE.Color().lerpColors(baseWaterColor, fadedWaterColor, fadeAmount);
      } else {
        // Phase 0: return to normal
        targetTankColor = tankMatBase.color;
        targetWaterColor = waterMatBase.color;
      }
    } else {
      // Reactor tank: use calm focus (no red) for phase 2 and 3, otherwise normal
      if (phase === 2 || phase === 3) {
        targetTankColor = calmFocusMat.color;
        targetWaterColor = calmFocusWaterMat.color;
      } else {
        targetTankColor = tankMatBase.color;
        targetWaterColor = waterMatBase.color;
      }
    }

    // Store target colors
    tankTargetColors[i].copy(targetTankColor);
    waterTargetColors[i].copy(targetWaterColor);

    // Smoothly interpolate toward target (only update if material exists and isn't a sensor)
    if (t.tankMesh && t.tankMesh.material) {
      // Check if this is a sensor material by checking the custom flag
      if (!t.tankMesh.material.isSensorMaterial) {
        // Use smooth lerp for animation
        t.tankMesh.material.color.lerp(tankTargetColors[i], 0.25);
        t.tankMesh.material.opacity = tankMatBase.opacity;
      }
    }
    if (t.waterMesh && t.waterMesh.material) {
      t.waterMesh.material.color.lerp(waterTargetColors[i], 0.25);
      t.waterMesh.material.opacity = waterMatBase.opacity;
    }
    if (t.tankLid && t.tankLid.material) {
      t.tankLid.material.opacity = t.tankMesh && t.tankMesh.material ? t.tankMesh.material.opacity : tankMatBase.opacity;
    }
  }
}
// Map scroll progress (0.0-1.0) to animation phases
// Timeline:
// 0.0 - 0.2: Healthy system
// 0.2 - 0.4: Leak appears
// 0.4 - 0.6: Water degrades
// 0.6 - 0.75: Sensors attach, dashboard appears
// 0.75 - 0.9: Leak seals, water recovers
// 0.9 - 1.0: Dashboard green, system stable
function determineSystemPhase(scrollProgress) {
  if (scrollProgress < 0.2) {
    return SYSTEM_PHASES.HEALTHY;
  } else if (scrollProgress < 0.4) {
    return SYSTEM_PHASES.LEAK;
  } else if (scrollProgress < 0.6) {
    return SYSTEM_PHASES.DEGRADED;
  } else if (scrollProgress < 0.75) {
    return SYSTEM_PHASES.SENSORS_ATTACHED;
  } else if (scrollProgress < 0.9) {
    return SYSTEM_PHASES.CORRECTIVE_ACTION;
  } else {
    return SYSTEM_PHASES.RESOLVED;
  }
}

// Update focus and attention based on scroll progress
function updateFocusAttention(scrollProgress) {
  // Determine system phase from scroll
  systemPhase = determineSystemPhase(scrollProgress);
  
  // Calculate focus phase for tank material states
  // Phase transitions: 0.6-0.65 (phase 1), 0.65-0.75 (phase 2), 0.75+ (phase 3)
  const phaseTransitionStart = 0.6;
  const phase1End = 0.65;
  const phase2End = 0.75;
  
  if (scrollProgress < phaseTransitionStart) {
    focusPhase = 0;
    setTankMaterialStates(focusPhase, 0);
  } else if (scrollProgress < phase1End) {
    focusPhase = 1;
    const phase1Progress = (scrollProgress - phaseTransitionStart) / (phase1End - phaseTransitionStart);
    setTankMaterialStates(focusPhase, phase1Progress);
  } else if (scrollProgress < phase2End) {
    focusPhase = 2;
    const phase2Progress = (scrollProgress - phase1End) / (phase2End - phase1End);
    setTankMaterialStates(focusPhase, phase2Progress);
  } else {
    focusPhase = 3;
    setTankMaterialStates(focusPhase, 0);
  }
}
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
// Initialize camera final positions once
let cameraInitialized = false;
function initializeCameraPositions() {
  if (cameraInitialized) return;
  const reactor = getReactor();
  if (!reactor) return;
  
  const baseY = reactor.h / 3 + 0.30;
  const crackMid = new THREE.Vector3(reactor.x + Math.cos(tankCurveAngle) * reactor.r, baseY + 0.06, Math.sin(tankCurveAngle) * reactor.r);
  const outward = 2.2;
  cameraFinalTarget.copy(new THREE.Vector3(crackMid.x, crackMid.y, crackMid.z));
  cameraFinalPos.copy(new THREE.Vector3(
    crackMid.x + outward * Math.sin(0.18),
    crackMid.y + 3.8,
    crackMid.z + outward * Math.cos(0.18) + 7.0
  ));
  cameraInitialized = true;
}

function animate() {
  requestAnimationFrame(animate);
  
  // Safety check: ensure tanks are populated before proceeding
  if (typeof tanks === 'undefined' || !tanks || tanks.length === 0) {
    return;
  }

  // Initialize crack geometry on first frame if not already done
  if (!leakOrigin || leakLenTotal === 0) {
    initializeCrackGeometry();
  }
  
  // Initialize camera positions
  initializeCameraPositions();
  
  // Explicitly set initial camera state at scroll 0 (tanks left of center)
  if (scrollProgress === 0) {
    camera.position.copy(cameraStartPos);
    controls.target.copy(cameraStartTarget);
    controls.update();
  }

  // Update based on scroll progress (0.0 to 1.0)
  updateFocusAttention(scrollProgress);
  updateDashboard(scrollProgress);

  // Camera zoom: scroll progress 0.15 to 0.5 (compressed, starts earlier)
  const zoomStart = 0.15;
  const zoomEnd = 0.5;
  
  // Always set camera based on scroll progress (fully reversible)
  if (scrollProgress >= zoomStart) {
    controls.enabled = false;
    const zoomProgress = Math.min(1, (scrollProgress - zoomStart) / (zoomEnd - zoomStart));
    const zoomT = easeInOut(zoomProgress);
    camera.position.lerpVectors(cameraStartPos, cameraFinalPos, zoomT);
    
    // Subtly bias look-at target toward reactor tank midsection during zoom
    const reactor = getReactor();
    const reactorBias = reactor ? new THREE.Vector3(reactor.x, reactor.h / 2 + 0.15, 0) : cameraFinalTarget;
    const lerpedTarget = new THREE.Vector3().lerpVectors(cameraStartTarget, cameraFinalTarget, zoomT);
    lerpedTarget.lerp(reactorBias, 0.55 * zoomT);
    controls.target.copy(lerpedTarget);
  } else {
    // At scroll 0, explicitly set initial framing (tanks left of center)
    controls.enabled = true;
    camera.position.copy(cameraStartPos);
    controls.target.copy(cameraStartTarget);
  }
  controls.update();

  // Calculate scroll-driven animation values (compressed timeline, starts earlier)
  // Leak: 0.1-0.3 (appears), 0.65-0.8 (seals)
  // Water drop: 0.25-0.55 (drops)
  // Degradation: 0.35-0.75 (degrades gradually)
  // Sensors: 0.5-0.65 (attach)
  
  let leakFormFrac = 0;
  let leakShouldBeVisible = false;
  let animatedDropFrac = 0;
  let degradationFrac = 0;
  let crackAlpha = 0;
  
  // Leak appearance: 0.1-0.3 (compressed, starts earlier) - fully reversible
  const leakAppearStart = 0.1;
  const leakAppearEnd = 0.3;
  const leakSealStart = 0.65;
  const leakSealEnd = 0.8;
  
  if (scrollProgress >= leakAppearStart) {
    leakShouldBeVisible = true;
    if (scrollProgress < leakAppearEnd) {
      // Leak is forming
      leakFormFrac = (scrollProgress - leakAppearStart) / (leakAppearEnd - leakAppearStart);
    } else if (scrollProgress < leakSealStart) {
      // Leak is fully formed and flowing
      leakFormFrac = 1.0;
    } else if (scrollProgress < leakSealEnd) {
      // Corrective action: seal leak (0.65-0.8) - fully reversible
      const sealProgress = (scrollProgress - leakSealStart) / (leakSealEnd - leakSealStart);
      leakFormFrac = 1.0 * (1 - easeInOut(sealProgress));
    } else {
      // Leak is sealed
      leakFormFrac = 0;
    }
  } else {
    leakShouldBeVisible = false;
    leakFormFrac = 0;
  }
  
  // Crack visibility: appears with leak, fully reversible
  if (scrollProgress >= leakAppearStart) {
    if (scrollProgress >= 0.65 && scrollProgress < 0.8) {
      // Seal crack during corrective action
      const sealProgress = (scrollProgress - 0.65) / (0.8 - 0.65);
      crackAlpha = 1 - easeInOut(sealProgress) * 0.95;
    } else if (scrollProgress < 0.65) {
      crackAlpha = 1;
    } else {
      crackAlpha = 0.05; // Almost invisible when sealed
    }
  }
  if (crackMesh) crackMesh.material.opacity = 0.82 * crackAlpha;

  // Water drop: 0.25-0.55 (drops), recovery matches drop speed but starts after system stable
  const waterDropStart = 0.25;
  const waterDropEnd = 0.55;
  const waterDropRange = waterDropEnd - waterDropStart; // 0.30 scroll range
  const waterRecoveryStart = 0.92; // Start recovery a bit after system stable appears (0.90)
  const waterRecoveryEnd = Math.min(1.0, waterRecoveryStart + waterDropRange); // 1.0 (capped at scroll end)
  
  if (scrollProgress >= waterRecoveryStart) {
    // Recovery phase: gradually restore water level at same speed as drop
    const recoveryProgress = Math.min(1, (scrollProgress - waterRecoveryStart) / (waterRecoveryEnd - waterRecoveryStart));
    const maxDrop = dropFrac; // Maximum drop that was reached
    animatedDropFrac = maxDrop * (1 - easeInOut(recoveryProgress)); // Gradually restore from max drop to 0
  } else if (scrollProgress >= waterDropStart) {
    // Drop phase: water level decreases
    const dropProgress = Math.min(1, (scrollProgress - waterDropStart) / (waterDropEnd - waterDropStart));
    animatedDropFrac = dropFrac * dropProgress;
  } else {
    animatedDropFrac = 0; // Fully reversible - returns to 0 when scrolling back
  }
  
  // Degradation: 0.35-0.75 (degrades), recovery matches degradation speed but starts after system stable
  const degradationStart = 0.35;
  const degradationEnd = 0.75;
  const degradationRange = degradationEnd - degradationStart; // 0.40 scroll range
  const degradationRecoveryStart = 0.92; // Start recovery a bit after system stable appears (0.90)
  const degradationRecoveryEnd = Math.min(1.0, degradationRecoveryStart + degradationRange); // 1.0 (capped at scroll end)
  
  if (scrollProgress >= degradationRecoveryStart) {
    // Recovery phase: gradually remove blackening and restore original color
    const recoveryProgress = (scrollProgress - degradationRecoveryStart) / (degradationRecoveryEnd - degradationRecoveryStart);
    degradationFrac = 1.0 * (1 - easeInOut(recoveryProgress)); // Gradually restore from fully degraded (1.0) to clean (0)
  } else if (scrollProgress >= degradationStart) {
    // Degradation phase: water turns black
    if (scrollProgress < degradationEnd) {
      const degProgress = (scrollProgress - degradationStart) / (degradationEnd - degradationStart);
      degradationFrac = easeInOut(degProgress);
    } else {
      degradationFrac = 1.0; // Fully degraded
    }
  } else {
    degradationFrac = 0; // Fully reversible - returns to 0 when scrolling back
  }
  
  // Remove leak meshes if not visible (fully reversible)
  if (!leakShouldBeVisible || leakFormFrac <= 0.01) {
    if (leakMeshes.length > 0) {
      leakMeshes.forEach(mesh => scene.remove(mesh));
      leakMeshes = [];
    }
  }

  // Apply water level and color changes - fully reversible, purely scroll-driven
  // ONLY to middle (reactor) and end (effluent) tanks - first tank (influent) is excluded
  const reactor = getReactor();
  const effluent = getEffluent();
  [reactor, effluent].forEach(tank => {
    if (tank.waterMesh && tank.waterMesh.material) {
      // Directly set water level from scroll progress (no incremental lerp, fully reversible)
      const targetDropFrac = animatedDropFrac;
      
      // Update water level (scale and position) directly from scroll-driven value
      const origH = tank.waterH;
      const newH = origH * (1 - targetDropFrac);
      tank.waterMesh.scale.y = (1 - targetDropFrac);
      tank.waterMesh.position.y = (newH / 2) + 0.175;

      // Update water material properties (clouded/opaque/grainy) - fully reversible
      // Interpolate material properties based on degradation fraction
      const baseTransmission = waterMatBase.transmission;
      const baseOpacity = waterMatBase.opacity;
      const baseRoughness = waterMatBase.roughness;
      const targetTransmission = 0.5;
      const targetOpacity = 0.88;
      const targetRoughness = 0.45;
      
      // Direct interpolation from scroll-driven degradation fraction (fully reversible)
      tank.waterMesh.material.transmission = baseTransmission + (targetTransmission - baseTransmission) * degradationFrac;
      tank.waterMesh.material.opacity = baseOpacity + (targetOpacity - baseOpacity) * degradationFrac;
      tank.waterMesh.material.roughness = baseRoughness + (targetRoughness - baseRoughness) * degradationFrac;

      // Update water color based on degradation - direct interpolation (fully reversible)
      const cleanColor = new THREE.Color(waterColor);
      const degradedColor = new THREE.Color(waterDegradedColor);
      tank.waterMesh.material.color.lerpColors(cleanColor, degradedColor, degradationFrac);
    }
  });
  // Sensor animation: 0.5-0.65 (compressed, starts earlier)
  const sensorStart = 0.5;
  const sensorEnd = 0.65;
  const sbrTank = tanks[reactorIdx];
  if (sbrTank && sbrTank.reactorSensors) {
    if (scrollProgress >= sensorStart) {
      // Show sensors
      for (let s of sbrTank.reactorSensors) s.visible = true;
      
      // Calculate sensor slide progress
      let sensorProgress = 0;
      if (scrollProgress < sensorEnd) {
        sensorProgress = (scrollProgress - sensorStart) / (sensorEnd - sensorStart);
      } else {
        sensorProgress = 1;
      }
      
      // Smooth mechanical cubic ease out
      const t = 1 - Math.pow(1 - sensorProgress, 3);
      
      // Animate sensors
      for (let p = 0; p < sbrTank.reactorSensors.length; p++) {
        const def = sbrTank.reactorSensorDefs[p];
        if (def.kind === "probe") {
          const interpDist = def.startDist * (1 - t) + def.endDist * t;
          sbrTank.reactorSensors[p].position.set(
            sbrTank.x + Math.cos(def.phi) * interpDist,
            def.y,
            Math.sin(def.phi) * interpDist
          );
          sbrTank.reactorSensors[p].rotation.z = Math.PI / 2;
          sbrTank.reactorSensors[p].rotation.y = def.phi;
        } else if (def.kind === "level") {
          const interpY = def.startY * (1 - t) + def.endY * t;
          sbrTank.reactorSensors[p].position.set(sbrTank.x, interpY, 0);
          sbrTank.reactorSensors[p].rotation.x = Math.PI;
        }
      }
      
      // Sensor pulse: brief flash when they attach (around 0.58-0.62)
      const pulseStart = 0.58;
      const pulseEnd = 0.62;
      if (scrollProgress >= pulseStart && scrollProgress < pulseEnd) {
        const pulseProgress = (scrollProgress - pulseStart) / (pulseEnd - pulseStart);
        let pulseIntensity = 0;
        if (pulseProgress < 0.5) {
          pulseIntensity = 0.3 + 0.4 * (pulseProgress * 2);
        } else {
          pulseIntensity = 0.3 + 0.4 * (1 - (pulseProgress - 0.5) * 2);
        }
        
        // Apply yellow emissive flash
        for (let p = 0; p < sbrTank.reactorSensors.length; p++) {
          const def = sbrTank.reactorSensorDefs[p];
          if (sbrTank.reactorSensors[p].visible) {
            if (def.kind === "probe" && def.mat) {
              if (def.originalColor) def.mat.color.copy(def.originalColor);
              def.mat.emissive.setHex(0xffd700);
              def.mat.emissiveIntensity = pulseIntensity;
            } else if (def.kind === "level" && def.mat) {
              if (def.originalColor) def.mat.color.copy(def.originalColor);
              def.mat.emissive.setHex(0xffd700);
              def.mat.emissiveIntensity = pulseIntensity;
              if (def.coneMat) {
                if (def.originalConeColor) def.coneMat.color.copy(def.originalConeColor);
                def.coneMat.emissive.setHex(0xffd700);
                def.coneMat.emissiveIntensity = pulseIntensity;
              }
            }
          }
        }
      } else {
        // Reset sensors to normal state
        for (let p = 0; p < sbrTank.reactorSensors.length; p++) {
          const def = sbrTank.reactorSensorDefs[p];
          if (def.kind === "probe" && def.mat) {
            if (def.originalColor) def.mat.color.copy(def.originalColor);
            def.mat.emissive.setHex(0x000000);
            def.mat.emissiveIntensity = 0;
          } else if (def.kind === "level" && def.mat) {
            if (def.originalColor) def.mat.color.copy(def.originalColor);
            def.mat.emissive.setHex(0x000000);
            def.mat.emissiveIntensity = 0;
            if (def.coneMat) {
              if (def.originalConeColor) def.coneMat.color.copy(def.originalConeColor);
              def.coneMat.emissive.setHex(0x000000);
              def.coneMat.emissiveIntensity = 0;
            }
          }
        }
      }
    } else {
      // Hide sensors before they appear
      for (let s of sbrTank.reactorSensors) s.visible = false;
    }
  }

  // Create/update leak meshes (fully reversible based on scroll)
  if (leakShouldBeVisible && leakFormFrac > 0.01) {
    createLeakMeshes(leakFormFrac);
    
    // Animate leak water flow - continuous running tap effect
    // State (visibility, form fraction) is scroll-driven, but flow animation uses time for smooth motion
    if (leakMeshes.length > 0) {
      const flowSpeed = 0.8;
      // Use performance.now() for continuous flow animation (independent of scroll)
      // This creates smooth, continuous motion while state remains scroll-driven
      const flowTime = (performance.now() / 1000) * flowSpeed;
      const maxStreamLength = leakLenTotal * 1.5;
      
      for (let i = 0; i < leakMeshes.length; i++) {
        const mesh = leakMeshes[i];
        if (mesh.userData.basePosition) {
          const streamFraction = mesh.userData.streamFraction || (mesh.userData.segmentIndex / 20);
          const baseOffset = flowTime;
          const segmentPhase = streamFraction * maxStreamLength;
          const flowOffset = (baseOffset + segmentPhase) % maxStreamLength;
          
          mesh.position.copy(mesh.userData.basePosition);
          mesh.position.y -= flowOffset;
          
          if (mesh.userData.lookTarget) {
            const lookTarget = mesh.userData.lookTarget.clone();
            lookTarget.y -= flowOffset;
            mesh.lookAt(lookTarget);
          }
          
          const loopPosition = flowOffset / maxStreamLength;
          const opacityVariation = 0.05 * Math.sin(loopPosition * Math.PI * 2);
          mesh.material.opacity = Math.max(0.6, Math.min(0.9, (mesh.material.opacity || 0.7) + opacityVariation)) * leakFormFrac;
        }
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

// Set up ScrollTrigger
ScrollTrigger.create({
  trigger: "#scroll-container",
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: (self) => {
    scrollProgress = self.progress; // 0.0 to 1.0
  },
  onRefresh: () => {
    // Ensure camera is correctly positioned on refresh
    if (scrollProgress === 0) {
      camera.position.copy(cameraStartPos);
      controls.target.copy(cameraStartTarget);
      controls.update();
    }
  }
});

// Initialize camera to starting position (tanks left of center)
camera.position.copy(cameraStartPos);
controls.target.copy(cameraStartTarget);
controls.update();

// Start animation loop
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

