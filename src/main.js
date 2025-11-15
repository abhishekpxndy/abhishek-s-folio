import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { gsap } from "gsap";

const clock = new THREE.Clock();
const mouse3D = new THREE.Vector3();

// --- DOM loading UI ---
const loadingScreen = document.getElementById("loading-screen");
const loadingBar = document.getElementById("loading-bar");
let progress = 0;
const rippleOverlay = document.getElementById("ripple-overlay");
const tapText = document.getElementById("tap-to-enter");

// THREE Loading Manager — MUST come BEFORE loader creation
const loadingManager = new THREE.LoadingManager();

// Smooth progress
let targetProgress = 0;
let displayedProgress = 0;
let loadingComplete = false;

// Update targetProgress on each file load
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  targetProgress = (itemsLoaded / itemsTotal) * 100;
};

// Smoothly animate displayed progress
function updateProgressBar() {
  displayedProgress += (targetProgress - displayedProgress) * 0.06;
  loadingBar.style.width = `${displayedProgress.toFixed(1)}%`;

  if (displayedProgress > 99.8 && loadingComplete) {
    displayedProgress = 100;
    loadingBar.style.width = "100%";

    if (!window._finished) {
      window._finished = true;
      setTimeout(() => finishLoading(), 300);
    }
  }

  requestAnimationFrame(updateProgressBar);
}

// Start updating the bar
updateProgressBar();

// When loading fully completes
loadingManager.onLoad = () => {
  loadingComplete = true;
  targetProgress = 100; // ensure bar goes to 100%
};

// Create loaders (AFTER loadingManager)
const textureLoader = new THREE.TextureLoader(loadingManager);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);

// Pointer can stay here or below
const pointer = new THREE.Vector2();
// moved raycaster up so event handlers can use it
const raycaster = new THREE.Raycaster();

// update 3D mouse position for moth fleeing
window.addEventListener("mousemove", (e) => {
  if (!camera) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const p = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(3));
  mouse3D.copy(p);
});
window.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  if (!t || !camera) return;
  pointer.x = (t.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(t.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const p = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(3));
  mouse3D.copy(p);
}, { passive: true });

const canvas = document.querySelector("#experience-canvas");
console.log("Canvas found:", canvas);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const xAxisFans = [];
const zAxisFans = [];
const raycasterObjects = [];
let currentIntersects = [];

const stringSounds = {
  strings: "/textures/sounds/strums.mp3",
};

// 🎵 Piano sounds
const pianoSounds = {
  F3: "/textures/sounds/AUD-20251112-WA0037.mp3",
  f3: "/textures/sounds/AUD-20251112-WA0038.mp3",
  G3: "/textures/sounds/AUD-20251112-WA0039.mp3",
  g3: "/textures/sounds/AUD-20251112-WA0040.mp3",
  A3: "/textures/sounds/AUD-20251112-WA0041.mp3",
  a3: "/textures/sounds/AUD-20251112-WA0042.mp3",
  B3: "/textures/sounds/AUD-20251112-WA0043.mp3",
  C4: "/textures/sounds/AUD-20251112-WA0044.mp3",
  c4: "/textures/sounds/AUD-20251112-WA0045.mp3",
  D4: "/textures/sounds/AUD-20251112-WA0046.mp3",
  d4: "/textures/sounds/AUD-20251112-WA0047.mp3",
  E4: "/textures/sounds/AUD-20251112-WA0048.mp3",
  F4: "/textures/sounds/AUD-20251112-WA0049.mp3",
  f4: "/textures/sounds/AUD-20251112-WA0050.mp3",
  G4: "/textures/sounds/AUD-20251112-WA0051.mp3",
  g4: "/textures/sounds/AUD-20251112-WA0052.mp3",
  A4: "/textures/sounds/AUD-20251112-WA0053.mp3",
  a4: "/textures/sounds/AUD-20251112-WA0054.mp3",
  B4: "/textures/sounds/AUD-20251112-WA0055.mp3",
  C5: "/textures/sounds/AUD-20251112-WA0056.mp3",
  c5: "/textures/sounds/AUD-20251112-WA0057.mp3",
  D5: "/textures/sounds/AUD-20251112-WA0058.mp3",
  d5: "/textures/sounds/AUD-20251112-WA0059.mp3",
  E5: "/textures/sounds/AUD-20251112-WA0060.mp3",
  F5: "/textures/sounds/AUD-20251112-WA0061.mp3",
  f5: "/textures/sounds/AUD-20251112-WA0062.mp3",
  G5: "/textures/sounds/AUD-20251112-WA0063.mp3",
  g5: "/textures/sounds/AUD-20251112-WA0064.mp3",
  A5: "/textures/sounds/AUD-20251112-WA0065.mp3",
  a5: "/textures/sounds/AUD-20251112-WA0066.mp3",
  B5: "/textures/sounds/AUD-20251112-WA0067.mp3",
  C6: "/textures/sounds/AUD-20251112-WA0068.mp3",
  c6: "/textures/sounds/AUD-20251112-WA0069.mp3",
  D6: "/textures/sounds/AUD-20251112-WA0070.mp3",
  d6: "/textures/sounds/AUD-20251112-WA0071.mp3",
  E6: "/textures/sounds/AUD-20251112-WA0072.mp3",
};

// 🎵 Piano audio pool for instant playback (no lag)
const audioPool = {};
Object.keys(pianoSounds).forEach((key) => {
  audioPool[key] = [];
  // Pre-create 2 audio instances per key for polyphony
  for (let i = 0; i < 2; i++) {
    const audio = new Audio(pianoSounds[key]);
    audio.preload = "auto";
    audio.volume = 0.2;
    audioPool[key].push(audio);
  }
});

// 🎶 Background Music
const bgAudio = document.createElement("audio");
bgAudio.src = "/textures/sounds/limbo_012021.mp3";
bgAudio.loop = true;
bgAudio.volume = 0.2;
bgAudio.playsInline = true;
bgAudio.preload = "auto";
// start loading immediately
bgAudio.load();
document.body.appendChild(bgAudio);

const musicBtn = document.getElementById("music-btn");
musicBtn.addEventListener("click", () => {
  unlockAudio();
  const fadeDuration = 1000;
  const steps = 20;
  const interval = fadeDuration / steps;
  const volumeStep = 0.2 / steps;

  if (bgAudio.paused) {
    bgAudio.volume = 0;
    bgAudio.play()
      .then(() => {
        musicBtn.classList.remove("paused");
        console.log("✅ Background music fading in...");
        let currentStep = 0;
        const fadeIn = setInterval(() => {
          if (currentStep < steps) {
            bgAudio.volume = Math.min(0.2, bgAudio.volume + volumeStep);
            currentStep++;
          } else clearInterval(fadeIn);
        }, interval);
      })
      .catch(err => console.warn("Autoplay blocked:", err));
  } else {
    console.log("⏸️ Background music fading out...");
    let currentStep = 0;
    const fadeOut = setInterval(() => {
      if (currentStep < steps) {
        bgAudio.volume = Math.max(0, bgAudio.volume - volumeStep);
        currentStep++;
      } else {
        clearInterval(fadeOut);
        bgAudio.pause();
        bgAudio.currentTime = 0;
        musicBtn.classList.add("paused");
      }
    }, interval);
  }
});

function finishLoading() {
  loadingComplete = true;
  document.body.classList.add("loaded");

  // Expand ripple from progress bar end (right-bottom)
  setTimeout(() => {
    rippleOverlay.style.clipPath = "circle(150% at 100% 100%)";
  }, 200);

  // After ripple fully covers screen → reveal tap text
  setTimeout(() => {
    tapText.style.opacity = 1;
    tapText.style.transform = "translateY(0px)";
    loadingScreen.classList.add("loaded");
  }, 1800);
}

/**
 * ✨ INTRO ANIMATION SYSTEM ✨
 * 
 * This system provides a spectacular, preloaded entrance animation that triggers
 * immediately after the user taps to enter. Key features:
 * 
 * 1. PRELOADED ANIMATIONS: All tweens are created during the asset loading phase
 *    and stored as paused GSAP animations. When the user taps, they play instantly
 *    with no delay or computation overhead.
 * 
 * 2. NATURAL MOVEMENT: Objects start at tiny scale (0.0001) with random rotations,
 *    then elegantly scale up, rotate back, and return to original positions with:
 *    - elastic.out() easing for bouncy, alive feel
 *    - back.out() for position restore with slight overshoot
 *    - expo.out() for smooth rotation return
 *    - Staggered delays for cascading effect
 * 
 * 3. CAMERA ZOOM: Cinematic 1.8x zoom-out at start, smoothly zooming in during
 *    the animation with power2.inOut easing for dramatic entrance.
 * 
 * 4. MOBILE OPTIMIZATION:
 *    - Reduced animation duration (1.5-2.2s vs 3.2-3.5s on desktop)
 *    - No stagger delays on mobile to fit shorter timelines
 *    - All tweens precomputed to avoid frame drops on tap
 *    - Particle burst scaled for mobile performance
 * 
 * 5. PERFECT STATE RESTORATION: Every object returns to its exact original:
 *    - Position (via position tween)
 *    - Rotation (via rotation tween)
 *    - Scale (via scale tween)
 *    Original state is saved during precompute phase before any modifications.
 * 
 * Animation Flow:
 * 1. During loading: precomputeIntroAnimation() creates all tweens (paused)
 * 2. User taps: mobileIntroAnimation() + handleTapToEnter() triggered
 * 3. playIntroAnimations() plays all stored tweens simultaneously
 * 4. runFullIntro() runs camera, effects, and sound in parallel
 * 5. ~2-3.5 seconds later: All animations complete, scene fully visible
 */

// 📱 ENHANCED MOBILE INTRO ANIMATION - Visual feedback on tap
function mobileIntroAnimation() {
  const isOnMobile = isMobile();
  if (!isOnMobile) return;

  // 1. (removed) intro-fade pulse to avoid brief grey overlay on mobile
  // Previously we pulsed the `#intro-fade` overlay which caused a
  // short grey/washed-out flash. That visual is removed to keep the
  // entrance seamless on mobile devices.

  // 2. Camera quick shake for impact
  const originalPos = camera.position.clone();
  gsap.to(camera.position, {
    x: originalPos.x + (Math.random() - 0.5) * 0.3,
    y: originalPos.y + (Math.random() - 0.5) * 0.3,
    duration: 0.15,
    ease: "sine.inOut",
    onUpdate: () => camera.updateProjectionMatrix()
  });

  // 3. Scene scale pulse
  gsap.from(scene.scale, {
    x: 0.98,
    y: 0.98,
    z: 0.98,
    duration: 0.4,
    ease: "back.out"
  });

  // 4. Particle burst effect
  createEnhancedParticleBurst();
}

function createEnhancedParticleBurst() {
  const particleCount = 16;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.style.position = "fixed";
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.width = "10px";
    particle.style.height = "10px";
    
    // Gradient colors for visual appeal
    const hue = 200 + i * (160 / particleCount);
    particle.style.background = `hsl(${hue}, 100%, 50%)`;
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "9997";
    particle.style.boxShadow = `0 0 15px hsl(${hue}, 100%, 50%)`;
    particle.style.filter = "blur(0.5px)";
    
    document.body.appendChild(particle);

    const angle = (i / particleCount) * Math.PI * 2;
    const distance = 4 + Math.random() * 3;
    const vx = Math.cos(angle) * distance * 0.05;
    const vy = Math.sin(angle) * distance * 0.05;

    const startTime = Date.now();
    const duration = 1000;

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      let x = centerX + vx * elapsed * 0.3;
      let y = centerY + vy * elapsed * 0.3 + progress * elapsed * 0.1;
      
      particle.style.transform = `translate(${x}px, ${y}px) scale(${1 - progress * 0.8})`;
      particle.style.opacity = 1 - progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    }

    animate();
  }
}

// 🎵 WHOOSH AUDIO EFFECT HELPER
function playWhooshEffect(poolIndex = 0) {
  if (!whooshPool || whooshPool.length === 0) return;
  
  const audio = whooshPool[poolIndex % whooshPool.length];
  if (audio.paused) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

// 📱 TAP TO ENTER (single event listener)
const handleTapToEnter = () => {
  if (!loadingComplete) return;
  
  // 🎪 TRIGGER MOBILE INTRO ANIMATION
  mobileIntroAnimation();
  
  // 🎵 PLAY AUDIO SYNCHRONOUSLY IN EVENT HANDLER (browser requirement)
  bgAudio.volume = 0;
  bgAudio.play().then(() => {
    console.log("✅ Background music started in event handler");
    musicBtn.classList.remove("paused");
    
    // Fade in volume asynchronously
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      bgAudio.volume = Math.min(0.2, v);
      if (v >= 0.2) clearInterval(fade);
    }, 30);
  }).catch((err) => {
    console.warn("⚠️ Audio play failed:", err);
  });

  // Now run the rest of unlock async
  unlockAudio();
};

loadingScreen.addEventListener("click", handleTapToEnter);
// use touchend to ensure gesture completes before heavy work
loadingScreen.addEventListener("touchend", (e) => {
  e.preventDefault();
  handleTapToEnter();
}, { passive: false });

// Track if a touch event just fired to prevent duplicate clicks
let lastTouchTime = 0;

// 🌈 Texture map (keep as is)
const textureMap = {
  "f3": { day: "/textures/texture.webp" },
  "lamp": { day: "/textures/Rectangle 1.webp" },
  "resume": { day: "/textures/Rectangle 1.webp" },
  "F3": { day: "/textures/texture.webp" },
  "strings": { day: "/textures/texture.webp" },
  "g3": { day: "/textures/texture.webp" },
  "a3": { day: "/textures/texture.webp" },
  "c4": { day: "/textures/texture.webp" },
  "d4": { day: "/textures/texture.webp" },
  "f4": { day: "/textures/texture.webp" },
  "g4": { day: "/textures/texture.webp" },
  "a4": { day: "/textures/texture.webp" },
  "c5": { day: "/textures/texture.webp" },
  "d5": { day: "/textures/texture.webp" },
  "f5": { day: "/textures/texture.webp" },
  "g5": { day: "/textures/texture.webp" },
  "a5": { day: "/textures/texture.webp" },
  "c6": { day: "/textures/texture.webp" },
  "d6": { day: "/textures/texture.webp" },
  "G3": { day: "/textures/texture.webp" },
  "A3": { day: "/textures/texture.webp" },
  "B3": { day: "/textures/texture.webp" },
  "C4": { day: "/textures/texture.webp" },
  "D4": { day: "/textures/texture.webp" },
  "E4": { day: "/textures/texture.webp" },
  "F4": { day: "/textures/texture.webp" },
  "G4": { day: "/textures/texture.webp" },
  "A4": { day: "/textures/texture.webp" },
  "B4": { day: "/textures/texture.webp" },
  "C5": { day: "/textures/texture.webp" },
  "D5": { day: "/textures/texture.webp" },
  "E5": { day: "/textures/texture.webp" },
  "F5": { day: "/textures/texture.webp" },
  "G5": { day: "/textures/texture.webp" },
  "A5": { day: "/textures/texture.webp" },
  "B5": { day: "/textures/texture.webp" },
  "C6": { day: "/textures/texture.webp" },
  "D6": { day: "/textures/texture.webp" },
  "E6": { day: "/textures/texture.webp" },

  "mic001": { day: "/textures/texture (1).webp" },
  "mic007": { day: "/textures/texture (1).webp" },
  "room019": { day: "/textures/texture (2).webp" },
  "chair": { day: "/textures/texture (3).webp" },
  "guitar": { day: "/textures/texture (4).webp" },
  "top_secret_drawer": { day: "/textures/cpufans.webp" },
  "gmail": { day: "/textures/cpufans.webp" },
  "Fan1": { day: "/textures/cpufans.webp" },
  "Fan2": { day: "/textures/cpufans.webp" },
  "Fan3": { day: "/textures/cpufans.webp" },
  "Fan4": { day: "/textures/cpufans.webp" },
  "Fan5": { day: "/textures/cpufans.webp" },
  "Fan6": { day: "/textures/cpufans.webp" },
  "coffe_mug": { day: "/textures/texture (5).webp" },
  "room134": { day: "/textures/texture (6).webp" },
  "Curve": { day: "/textures/texture (6).webp" },
  "cpu": { day: "/textures/texture (7).webp" },
  "Curve001": { day: "/textures/texture (8).webp" },
};
const loadedTextures = { day: {} };
Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.generateMipmaps = true;
  dayTexture.minFilter = THREE.LinearMipMapLinearFilter;
  dayTexture.magFilter = THREE.LinearFilter;
  loadedTextures.day[key] = dayTexture;
});

// 🎥 Video texture for monitor
const videoElement = document.createElement("video");
videoElement.src = "/textures/0.0-60.0.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play().catch(()=>{});
const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.generateMipmaps = false; // video mipmaps not necessary

// 🎬 Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(-28.4803, 4.7067, -17.1849);

// 📱 Mobile detection
const isMobile = () => window.innerWidth < 768 || /Android|iPhone|iPad|iPod/.test(navigator.userAgent);

// Reduce moth count on mobile for performance
const MOTH_COUNT = isMobile() ? 40 : 120;

// Optimize renderer for mobile
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true, // try true for crisper edges; change if perf drops
  powerPreference: isMobile() ? "default" : "high-performance"
});

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);



const whooshSound = new Audio("/textures/sounds/videoplayback_IJdyFWt1.mp3");
whooshSound.volume = 0.3;

// 🎵 Create whoosh audio pool for layered intro effects
const whooshPool = [];
for (let i = 0; i < 3; i++) {
  const audio = new Audio("/textures/sounds/videoplayback_IJdyFWt1.mp3");
  audio.volume = 0.25 + i * 0.05; // Varying volumes for layered effect
  audio.preload = "auto";
  whooshPool.push(audio);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.target.set(1.3847, 0.7997, -2.6258);
controls.update();

function cameraIntro() {
  const originalPos = camera.position.clone();
  const originalTarget = controls.target.clone();

  // Start further away for dramatic zoom in
  const zoomOutDistance = 1.8;
  camera.position.set(
    originalPos.x * zoomOutDistance,
    originalPos.y * zoomOutDistance,
    originalPos.z * zoomOutDistance
  );

  // Cinematic zoom into scene
  const duration = isMobile() ? 2.2 : 3.5;
  
  gsap.to(camera.position, {
    x: originalPos.x,
    y: originalPos.y,
    z: originalPos.z,
    duration: duration,
    ease: "power2.inOut",
    onUpdate: () => camera.updateProjectionMatrix(),
    onStart: () => {
      // 🎵 Single whoosh during camera zoom
      playWhooshEffect(0);
    }
  });

  // Smooth focus on center
  gsap.to(controls.target, {
    x: originalTarget.x,
    y: originalTarget.y,
    z: originalTarget.z,
    duration: duration,
    ease: "power2.inOut"
  });
}

function fadeScreenFromBlack() {
  const fade = document.getElementById("intro-fade");
  if (!fade) return;
  
  const fadeDuration = isMobile() ? 0.5 : 2;
  const delayBefore = isMobile() ? 100 : 200;
  
  fade.style.opacity = 1;
  fade.style.transition = `opacity ${fadeDuration}s ease`;

  setTimeout(() => {
    fade.style.opacity = 0; // fade out
    
    // Remove the element completely after fade completes (plus buffer)
    setTimeout(() => {
      fade.style.pointerEvents = "none";
      fade.style.display = "none";
      if (fade.parentNode) {
        fade.remove();
      }
    }, fadeDuration * 1000 + 100);
  }, delayBefore);
}

function runFullIntro(root) {
  // Play all pre-computed intro animations immediately
  playIntroAnimations();

  // Run cinematic camera zoom with integrated whoosh effects
  cameraIntro();

  // Fade from black
  fadeScreenFromBlack();
  
  // Bloom effect fade in (synced with animation)
  if (window.bloomPass) {
    bloomFadeIn(window.bloomPass);
  }
  
  console.log("🎬 Full intro sequence started - all animations playing with synchronized whoosh effects");
}

function bloomFadeIn(pass) {
  pass.strength = 0;
  gsap.to(pass, {
    strength: 1.2,
    duration: 2,
    ease: "power2.out"
  });
}

let audioUnlocked = false;

function precomputeIntroAnimation(root) {
  const isOnMobile = isMobile();
  
  // Collect all visible meshes to animate
  const objects = [];
  root.traverse((child) => {
    if ((child.isMesh || child.isGroup) && child.visible) {
      objects.push({
        obj: child,
        originalScale: child.scale.clone(),
        originalRot: child.rotation.clone(),
        originalPos: child.position.clone(),
        originalQuaternion: child.quaternion.clone()
      });

      // Store initial state for proper reset
      child.userData.introInitialized = true;
      
      // Start tiny & rotated for dramatic entrance
      child.scale.set(0.0001, 0.0001, 0.0001);
      
      // Random rotation for natural chaotic effect
      const randomRotX = (Math.random() - 0.5) * Math.PI * 2.5;
      const randomRotY = (Math.random() - 0.5) * Math.PI * 2.5;
      const randomRotZ = (Math.random() - 0.5) * Math.PI * 2.5;
      
      child.rotation.order = 'XYZ';
      child.rotation.set(
        child.rotation.x + randomRotX,
        child.rotation.y + randomRotY,
        child.rotation.z + randomRotZ
      );
    }
  });

  const animDuration = isOnMobile ? 1.5 : 3.2;
  const rotateDuration = isOnMobile ? 1.2 : 2.8;
  const positionDuration = isOnMobile ? 1.8 : 3.0;

  // Create animation tweens for all objects
  const tweens = [];
  
  objects.forEach(({ obj, originalScale, originalRot, originalPos }, idx) => {
    // Stagger delays for natural cascading effect
    const baseDelay = isOnMobile ? 0 : idx * 0.015;

    // 1. Scale animation - bring objects back to normal size
    const scaleTween = gsap.to(obj.scale, {
      x: originalScale.x,
      y: originalScale.y,
      z: originalScale.z,
      duration: animDuration,
      ease: "elastic.out(1, 0.5)",
      delay: baseDelay,
      paused: true // Keep paused until tap
    });

    // 2. Rotation animation - spin and return to original
    const rotateTween = gsap.to(obj.rotation, {
      x: originalRot.x,
      y: originalRot.y,
      z: originalRot.z,
      duration: rotateDuration,
      ease: "expo.out",
      delay: baseDelay,
      paused: true
    });

    // 3. Position animation - subtle bounce back to original
    const posTween = gsap.from(obj.position, {
      x: originalPos.x + (Math.random() - 0.5) * 4.5,
      y: originalPos.y + (Math.random() - 0.5) * 4.5,
      z: originalPos.z + (Math.random() - 0.5) * 4.5,
      duration: positionDuration,
      ease: "back.out(1.3)",
      delay: baseDelay,
      paused: true
    });

    tweens.push({ scaleTween, rotateTween, posTween });
  });

  // Store tweens globally for playback on tap
  window.introAnimationTweens = tweens;
  window.introAnimationsReady = true;
  console.log(`✅ Intro animations precomputed for ${tweens.length} objects`);
}

function playIntroAnimations() {
  // Play all precomputed tweens instantly
  if (!window.introAnimationTweens || !window.introAnimationsReady) {
    console.warn("⚠️ Intro animations not ready yet");
    return;
  }

  // Play all tweens at once (delays are baked in)
  let playCount = 0;
  window.introAnimationTweens.forEach(({ scaleTween, rotateTween, posTween }) => {
    scaleTween.play();
    rotateTween.play();
    posTween.play();
    playCount++;
  });
  
  console.log(`▶️ Playing ${playCount * 3} intro tweens for ${playCount} objects`);
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  console.log("🎧 Audio unlocked!");
  // Hide ripple overlay immediately (prevents grey flash)
  if (rippleOverlay) {
    rippleOverlay.style.opacity = 0;
    rippleOverlay.style.pointerEvents = "none";
  }


  // Hide loading screen asynchronously
  loadingScreen.style.opacity = 0;
  loadingScreen.style.pointerEvents = "none";
  setTimeout(() => {
    if (loadingScreen.parentNode) loadingScreen.remove();
  }, 250);

  // Fade out tap text asynchronously
  const tap = document.getElementById("tap-to-enter");
  if (tap) {
    tap.style.opacity = 0;
    setTimeout(() => {
      if (tap.parentNode) tap.remove();
    }, 800);
  }

  // Play pre-computed intro animations immediately (no blocking)
  playIntroAnimations();

  // Run remaining intro (camera, whoosh, etc.)
  if (window.loadedRootScene) {
    runFullIntro(window.loadedRootScene);
  }

  // Warm up piano audio pool
  if (typeof audioPool === 'object') {
    const keys = Object.keys(audioPool);
    let idx = 0;
    const batch = 8;
    function warmNextBatch() {
      for (let i = 0; i < batch && idx < keys.length; i++, idx++) {
        const k = keys[idx];
        const arr = audioPool[k];
        if (!arr || !arr.length) continue;
        try {
          const a = arr[0];
          a.muted = true;
          const p = a.play();
          if (p && typeof p.then === 'function') {
            p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; })
             .catch(() => { a.muted = false; a.pause(); a.currentTime = 0; });
          } else {
            a.pause(); a.currentTime = 0; a.muted = false;
          }
        } catch (e) {
          // ignore
        }
      }
      if (idx < keys.length) setTimeout(warmNextBatch, 80);
    }
    setTimeout(warmNextBatch, 200);
  }
}

class Moth {
  constructor(center, scene, texture) {
    this.center = center.clone();
    this.scene = scene;

    // spawn slightly away from lamp: spherical radius 2.5 - 4.0
    const r = 2.5 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    this.position = center.clone().add(
      new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * r,
        Math.cos(phi) * r * 0.6,
        Math.sin(phi) * Math.sin(theta) * r
      )
    );

    // faster initial velocity
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.015,
      (Math.random() - 0.5) * 0.02
    );

    this.state = "swarm";
    this.fleeTimer = 0;
    this.swarmPhase = Math.random() * Math.PI * 2;
    this.individualOffset = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 3
    );

    this.wingBeat = Math.random() * Math.PI * 2;
    this.wiggleTimer = Math.random() * 0.6 + 0.05;
    this.maxSpeed = 0.08 + Math.random() * 0.08;

    // Group + tiny body + wings
    this.group = new THREE.Group();

    const bodyGeometry = new THREE.SphereGeometry(0.01 + Math.random() * 0.006, 5, 5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x3e3e3e });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1, 1.1, 1);
    this.group.add(body);

    const wingGeometry = new THREE.PlaneGeometry(0.12, 0.08);
    const wingMaterial = new THREE.MeshLambertMaterial({
      color: 0x5f4a3d,
      side: THREE.DoubleSide,
      transparent: false,
    });

    this.leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    this.leftWing.position.set(-0.03, 0, 0.01);
    this.leftWing.rotation.z = Math.PI * 0.25;
    this.group.add(this.leftWing);

    this.rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    this.rightWing.position.set(0.03, 0, 0.01);
    this.rightWing.rotation.z = -Math.PI * 0.25;
    this.group.add(this.rightWing);

    // tiny antennae
    const antennaGeometry = new THREE.BufferGeometry();
    const antennaPositions = new Float32Array([
      -0.008, 0.02, 0,
      -0.02, 0.06, 0,
      0.008, 0.02, 0,
      0.02, 0.06, 0
    ]);
    antennaGeometry.setAttribute('position', new THREE.BufferAttribute(antennaPositions, 3));
    const antennaMaterial = new THREE.LineBasicMaterial({ color: 0x2f2f2f });
    const antennae = new THREE.LineSegments(antennaGeometry, antennaMaterial);
    this.group.add(antennae);

    this.group.scale.set(0.45, 0.45, 0.45);
    this.group.position.copy(this.position);
    scene.add(this.group);
  }

  update(dt, mousePos) {
    const toCenter = new THREE.Vector3().subVectors(this.center, this.position);
    const distMouse = this.position.distanceTo(mousePos);
    const distCenter = this.position.distanceTo(this.center);

    if (distMouse < 1.8 && this.state !== "flee") {
      this.state = "flee";
      this.fleeTimer = 0.8 + Math.random() * 0.6;
    }

    let acceleration = new THREE.Vector3();

    if (this.state === "swarm") {
      const time = performance.now() * 0.001;

      const orbitRadius = 2.0 + Math.random() * 1.2;
      const orbitX = Math.sin(time * (0.9 + Math.random() * 0.6) + this.swarmPhase) * orbitRadius;
      const orbitY = Math.sin(time * (0.6 + Math.random() * 0.6) + this.swarmPhase * 0.5) * (0.8 + Math.random() * 0.8);
      const orbitZ = Math.cos(time * (0.9 + Math.random() * 0.6) + this.swarmPhase * 1.2) * orbitRadius;

      const targetPos = this.center.clone().add(
        new THREE.Vector3(orbitX, orbitY, orbitZ).add(this.individualOffset.clone().multiplyScalar(0.3))
      );

      const toTarget = new THREE.Vector3().subVectors(targetPos, this.position);
      if (toTarget.length() > 0.05) {
        acceleration.add(toTarget.normalize().multiplyScalar(0.006 + Math.random() * 0.006));
      }

      const t = performance.now() * 0.002 + this.swarmPhase;
      acceleration.add(new THREE.Vector3(
        Math.sin(t * (1.6 + Math.random() * 1.2)) * (0.0015 + Math.random() * 0.002),
        Math.sin(t * (1.2 + Math.random())) * (0.002 + Math.random() * 0.002),
        Math.cos(t * (1.8 + Math.random() * 1.2)) * (0.0015 + Math.random() * 0.002)
      ));

      this.wiggleTimer -= dt;
      if (this.wiggleTimer <= 0) {
        this.wiggleTimer = 0.05 + Math.random() * 0.6;
        const impulse = new THREE.Vector3(
          (Math.random() - 0.5) * 0.06,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.06
        );
        acceleration.add(impulse);
      }
    }

    if (this.state === "flee") {
      const away = new THREE.Vector3().subVectors(this.position, mousePos);
      const dist = away.length();
      if (dist > 0.0001) {
        away.normalize();
        acceleration.add(away.multiplyScalar(0.12 * Math.max(0.15, (1.8 - dist))));
      }
      this.fleeTimer -= dt;
      if (this.fleeTimer <= 0) this.state = "swarm";
    }

    if (distCenter > 14) {
      acceleration.add(toCenter.normalize().multiplyScalar(0.004));
    }

    if (window.moths && window.moths.length > 1) {
      let separation = new THREE.Vector3();
      let neighbors = 0;
      for (let i = 0; i < 4; i++) {
        const others = window.moths;
        const idx = Math.floor(Math.random() * others.length);
        const other = others[idx];
        if (other && other !== this) {
          const diff = new THREE.Vector3().subVectors(this.position, other.position);
          const d = diff.length();
          if (d > 0 && d < 0.12) {
            separation.add(diff.normalize().divideScalar(d));
            neighbors++;
          }
        }
      }
      if (neighbors > 0) {
        separation.divideScalar(neighbors);
        separation.multiplyScalar(0.035);
        acceleration.add(separation);
      }
    }

    this.velocity.add(acceleration);
    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.setLength(this.maxSpeed);
    }
    this.velocity.multiplyScalar(0.88);
    this.position.add(this.velocity);

    this.wingBeat += 0.6 + Math.random() * 0.3;
    const wingFlap = Math.sin(this.wingBeat) * (0.5 + Math.random() * 0.25);

    this.leftWing.rotation.z = Math.PI * 0.25 + wingFlap;
    this.rightWing.rotation.z = -Math.PI * 0.25 - wingFlap;

    if (this.velocity.length() > 0.0001) {
      const moveDir = this.velocity.clone().normalize();
      this.group.rotation.y = Math.atan2(moveDir.x, moveDir.z);
      this.group.rotation.x = -Math.atan2(this.velocity.y, this.velocity.length()) * 0.4;
    }

    this.group.position.copy(this.position);
  }
}

loader.load("/models/beg-v1.glb", (glb) => {
  window.loadedRootScene = glb.scene;

  const lampWorldPos = new THREE.Vector3();

  glb.scene.traverse((child) => {
    if (child.isMesh) {
      Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({ map: loadedTextures.day[key] });
          child.material = material;
          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
          }
        }
      });

      if (child.name.includes("Fan")) {
        if (["Fan1", "Fan2", "Fan3"].includes(child.name)) xAxisFans.push(child);
        else zAxisFans.push(child);
      }

      if (child.name.includes("screen_monitor")) {
        child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
      }

      if (child.name.length === 2) {
        raycasterObjects.push(child);
      }

      if (stringSounds[child.name]) {
        raycasterObjects.push(child);
      }
    }
  });

  scene.add(glb.scene);

  const drawer = glb.scene.getObjectByName("top_secret_drawer");
  const resume = glb.scene.getObjectByName("resume");

  window.drawer = drawer;
  window.resume = resume;

  if (drawer) raycasterObjects.push(drawer);

  const lamp = glb.scene.getObjectByName("lamp");

  let fireflyTexture;

  if (lamp) {
    lamp.getWorldPosition(lampWorldPos);
    const fireflyCanvas = document.createElement("canvas");
    fireflyCanvas.width = 100;
    fireflyCanvas.height = 100;
    const ctx = fireflyCanvas.getContext("2d");
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,200,1)");
    gradient.addColorStop(0.2, "rgba(255,255,150,0.8)");
    gradient.addColorStop(0.4, "rgba(255,255,100,0.5)");
    gradient.addColorStop(1, "rgba(255,255,50,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    fireflyTexture = new THREE.CanvasTexture(fireflyCanvas);

    const firefliesMaterial = new THREE.PointsMaterial({
      size: 0.7,
      map: fireflyTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.8,
      color: 0xffffaa,
    });

    const fireflyCount = isMobile() ? 15 : 35;

    const firefliesGeometry = new THREE.BufferGeometry();
    const firefliesPositions = [];
    const fireflyFlicker = [];

    for (let i = 0; i < fireflyCount; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * -0.5;
      const z = (Math.random() - 0.5) * 40;
      firefliesPositions.push(x, y, z);
      fireflyFlicker.push({ speed: 1 + Math.random() * 2, phase: Math.random() * Math.PI * 2 });
    }

    firefliesGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(firefliesPositions, 3)
    );

    const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
    scene.add(fireflies);

    window.fireflies = fireflies;
    window.fireflyFlicker = fireflyFlicker;
    window.firefliesGeometry = firefliesGeometry;
  }

  // 🦋 Create moths around lamp
  window.moths = [];

  if (lamp) lamp.getWorldPosition(lampWorldPos);

  for (let i = 0; i < MOTH_COUNT; i++) {
    window.moths.push(new Moth(lampWorldPos, scene, fireflyTexture));
  }

  // 🎬 PRE-COMPUTE INTRO ANIMATION DURING LOADING
  precomputeIntroAnimation(glb.scene);
});

// 📏 Resize window
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(isMobile() ? 1 : Math.min(window.devicePixelRatio, 2));
});

// 🎹 DESKTOP CLICK HANDLER FOR PIANO
window.addEventListener("click", (event) => {
  // Prevent double firing after touch
  if (Date.now() - lastTouchTime < 300) return;
  if (!audioUnlocked) return;

  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    console.log("🖱️ Click detected on:", obj.name, "at position:", event.clientX, event.clientY);
    if (obj.name.length === 2) {
      console.log("🎹 Playing piano key:", obj.name);
      playPianoKey(obj);
    }
    if (stringSounds[obj.name]) playString(obj);
    if (obj.name === "gmail") window.open("https://mail.google.com/mail/u/0/?fs=1&to=abhishekpxndy@gmail.com&su=Project+Inquiry&body=Hi,+I%27m+interested+in+your+work&tf=cm", "_blank");
    if (obj.name === "linkedin") window.open("https://www.linkedin.com/in/your-profile", "_blank");
    if (obj.name === "top_secret_drawer") toggleDrawer();
  }
}, { passive: true });

function playString(obj) {
  const sound = new Audio(stringSounds[obj.name]);
  sound.currentTime = 0;
  sound.play();
}

function playPianoKey(keyMesh) {
  const keyName = keyMesh.name;
  
  if (!keyMesh || !keyMesh.position || !keyMesh.material) {
    console.warn("⚠️ Invalid key mesh:", keyName);
    return;
  }
  
  if (audioPool[keyName]) {
    let audio = null;
    for (let i = 0; i < audioPool[keyName].length; i++) {
      if (audioPool[keyName][i].paused) {
        audio = audioPool[keyName][i];
        break;
      }
    }
    
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.warn("🔊 Audio play error:", err));
    } else {
      console.warn("⚠️ No available audio instance for key:", keyName);
    }
  } else {
    console.warn("⚠️ No audio pool for key:", keyName);
  }

  const originalY = keyMesh.position.y;
  
  gsap.killTweensOf([keyMesh.position, keyMesh.material.color]);
  
  gsap.to(keyMesh.position, {
    y: originalY - 0.05,
    duration: 0.05,
    ease: "power2.out"
  });

  gsap.to(keyMesh.position, {
    y: originalY,
    duration: 0.1,
    delay: 0.05,
    ease: "power1.out"
  });

  if (keyMesh.material && keyMesh.material.color) {
    const originalColor = keyMesh.material.color.clone();
    
    gsap.to(keyMesh.material.color, {
      r: 1,
      g: 0.84,
      b: 0,
      duration: 0.05,
      ease: "power2.out"
    });

    gsap.to(keyMesh.material.color, {
      r: originalColor.r,
      g: originalColor.g,
      b: originalColor.b,
      duration: 0.1,
      delay: 0.05,
      ease: "power1.out"
    });
  }
}

let drawerOpen = false;
function toggleDrawer() {
  const drawer = scene.getObjectByName("top_secret_drawer");
  const resume = scene.getObjectByName("resume");
  if (!drawer || !resume) return;

  const deltaX = 1.4542;
  const direction = drawerOpen ? 1 : -1;

  gsap.to(drawer.position, {
    x: drawer.position.x + direction * deltaX,
    duration: 1.5,
    ease: "power2.inOut",
  });

  gsap.to(resume.position, {
    x: resume.position.x + direction * deltaX,
    duration: 1.5,
    ease: "power2.inOut",
  });

  drawerOpen = !drawerOpen;
}

// 📱 UNIFIED touch input handler
window.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  if (!touch || !camera) return;

  pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  // touchstart is for mouse position tracking only
  // actual interactions happen on touchend to avoid double-firing
}, { passive: true });

// 🎹 TOUCH HANDLER FOR PIANO ON MOBILE
window.addEventListener("touchend", (event) => {
  touchStartDistance = 0;
  lastTouchTime = Date.now();
  if (!audioUnlocked) return;
  
  if (!event.changedTouches || !event.changedTouches[0]) return;
  
  const touch = event.changedTouches[0];
  const mouse = new THREE.Vector2(
    (touch.clientX / window.innerWidth) * 2 - 1,
    -(touch.clientY / window.innerHeight) * 2 + 1
  );
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    
    console.log("📱 Touch detected on:", obj.name, "at position:", touch.clientX, touch.clientY);
    
    if (obj.name.length === 2) {
      console.log("🎹 Playing piano key:", obj.name);
      playPianoKey(obj);
    }
    if (stringSounds[obj.name]) playString(obj);
    if (obj.name === "gmail") window.open("https://mail.google.com/mail/u/0/?fs=1&to=abhishekpxndy@gmail.com&su=Project+Inquiry&body=Hi,+I%27m+interested+in+your+work&tf=cm", "_blank");
    if (obj.name === "linkedin") window.open("https://www.linkedin.com/in/your-profile", "_blank");
    if (obj.name === "top_secret_drawer") toggleDrawer();
  } else {
    console.log("📱 Touch detected but no object intersected at:", touch.clientX, touch.clientY);
  }
}, { passive: true });

// 📱 Touch orbit controls (pinch + drag)
let touchStartDistance = 0;
let touchStartScale = 1;

window.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (touchStartDistance === 0) {
      touchStartDistance = distance;
      touchStartScale = controls.object.position.length();
    }

    // Pinch to zoom
    const scaleFactor = distance / touchStartDistance;
    const newDistance = touchStartScale / scaleFactor;
    const direction = controls.object.position.clone().normalize();
    controls.object.position.copy(direction.multiplyScalar(newDistance));
  }
}, { passive: true });

// Render Loop
let frameCount = 0;
const isOnMobile = isMobile();
const render = () => {
  controls.update();

  xAxisFans.forEach((fan) => (fan.rotation.x += 0.06));
  zAxisFans.forEach((fan) => (fan.rotation.z += 0.06));

  const deltaTime = clock.getDelta();

  // On mobile: update moths every 2 frames instead of every frame (50% savings)
  if (!isOnMobile || frameCount % 2 === 0) {
    if (window.moths) {
      for (let moth of window.moths) {
        moth.update(deltaTime, mouse3D);
      }
    }
  }

  // Raycaster checks only every 2 frames on mobile to save CPU (still responsive)
  if (!isOnMobile || frameCount % 2 === 0) {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    let hoveringClickable = false;

    if (intersects.length > 0) {
      const hoveredObj = intersects[0].object;
      if (
        hoveredObj.name.length === 2 ||
        hoveredObj.name === "gmail" ||
        hoveredObj.name === "linkedin"
      ) {
        hoveringClickable = true;
      }
    }

    document.body.style.cursor = hoveringClickable ? "pointer" : "default";
  }

  if (window.fireflies && window.firefliesGeometry) {
    const geo = window.firefliesGeometry;
    const positions = geo.attributes.position.array;
    const time = performance.now() * 0.001;

    let totalOpacity = 0;

    for (let i = 0; i < window.fireflyFlicker.length; i++) {
      const index = i * 3;

      // 🌀 Slight hovering motion (better randomness)
      positions[index + 0] += Math.sin(time * 0.6 + i) * 0.003;
      positions[index + 1] += Math.sin(time * 1.0 + i * 0.3) * 0.004;
      positions[index + 2] += Math.cos(time * 0.7 + i * 0.5) * 0.003;

      // ✨ Individual flickering
      const flickerData = window.fireflyFlicker[i];
      const flicker =
        Math.sin(time * flickerData.speed + flickerData.phase) * 0.5 + 0.5;

      totalOpacity += flicker;
    }

    geo.attributes.position.needsUpdate = true;

    // 🌟 Average opacity so whole group glows softly together
    const avgOpacity = totalOpacity / window.fireflyFlicker.length;
    window.fireflies.material.opacity = 0.3 + avgOpacity * 0.7;
  }

  renderer.render(scene, camera);
  frameCount++;
  window.requestAnimationFrame(render);
};

render();