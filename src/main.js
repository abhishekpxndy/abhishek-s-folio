import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { gsap } from "gsap";

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

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

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

// 🎶 Background Music (manual button start)
const bgAudio = document.createElement("audio");
bgAudio.src = "/textures/sounds/limbo_012021.mp3";
bgAudio.loop = true;
bgAudio.volume = 0.2;
bgAudio.playsInline = true;
document.body.appendChild(bgAudio);

const musicBtn = document.getElementById("music-btn");
musicBtn.addEventListener("click", () => {
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

// 🖼️ Loaders
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

// 🌈 Texture map
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
  loadedTextures.day[key] = dayTexture;
});

// 🎥 Video texture for monitor
const videoElement = document.createElement("video");
videoElement.src = "/textures/0.0-60.0.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play();
const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

// 🧭 Pointer movement
window.addEventListener("mousemove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// 🎬 Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(-28.4803, 4.7067, -17.1849);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.target.set(1.3847, 0.7997, -2.6258);
controls.update();
loader.load("/models/beg-v1.glb", (glb) => {
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
    }
  });

  scene.add(glb.scene);

  const drawer = glb.scene.getObjectByName("top_secret_drawer");
  const resume = glb.scene.getObjectByName("resume");

  window.drawer = drawer;
  window.resume = resume;

  if (drawer) raycasterObjects.push(drawer);

  const lamp = glb.scene.getObjectByName("lamp");
  if (lamp) {
    const fireflyCanvas = document.createElement("canvas");
    fireflyCanvas.width = 64;
    fireflyCanvas.height = 64;
    const ctx = fireflyCanvas.getContext("2d");
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,200,1)");
    gradient.addColorStop(0.2, "rgba(255,255,150,0.8)");
    gradient.addColorStop(0.4, "rgba(255,255,100,0.5)");
    gradient.addColorStop(1, "rgba(255,255,50,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const fireflyTexture = new THREE.CanvasTexture(fireflyCanvas);

    const firefliesMaterial = new THREE.PointsMaterial({
      size: 0.4,
      map: fireflyTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.8,
      color: 0xffffaa,
    });

    const fireflyCount = 20;
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
});

// 📏 Resize window
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Play piano key
function playPianoKey(keyMesh) {
  const keyName = keyMesh.name;
  const soundPath = pianoSounds[keyName];

  if (soundPath) {
    const audio = new Audio(soundPath);
    audio.volume = 0.2;
    audio.play();
  }

  const originalY = keyMesh.position.y;
  keyMesh.position.y -= 0.05;
  setTimeout(() => {
    keyMesh.position.y = originalY;
  }, 150);

  const originalColor = keyMesh.material.color.clone();
  keyMesh.material.color.set(0xffd700);
  setTimeout(() => keyMesh.material.color.copy(originalColor), 150);
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

// Render Loop
const render = () => {
  controls.update();

  xAxisFans.forEach((fan) => (fan.rotation.x += 0.06));
  zAxisFans.forEach((fan) => (fan.rotation.z += 0.06));

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

  if (window.fireflies && window.firefliesGeometry) {
    const positions = window.firefliesGeometry.attributes.position.array;
    const time = Date.now() * 0.001;

    for (let i = 0; i < 20; i++) {
      const index = i * 3;
      positions[index + 0] += Math.sin(time * 0.5 + i) * 0.001;
      positions[index + 1] += Math.sin(time * 0.7 + i * 0.5) * 0.002;
      positions[index + 2] += Math.cos(time * 0.5 + i * 0.3) * 0.001;
    }

    window.firefliesGeometry.attributes.position.needsUpdate = true;

    const firefliesMaterial = window.fireflies.material;
    for (let i = 0; i < 20; i++) {
      const flicker =
        Math.sin(time * window.fireflyFlicker[i].speed + window.fireflyFlicker[i].phase) * 0.5 +
        0.5;
      firefliesMaterial.opacity = 0.3 + flicker * 0.7;
    }
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
};

window.addEventListener("click", (event) => {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const intersectsClick = raycaster.intersectObjects(scene.children, true);

  if (intersectsClick.length > 0) {
    const clickedObj = intersectsClick[0].object;

    if (clickedObj.name.length === 2) playPianoKey(clickedObj);

    if (clickedObj.name === "gmail") {
      window.open(
        "https://mail.google.com/mail/u/0/?fs=1&to=abhishekpxndy@gmail.com&su=Project+Inquiry&body=Hi,+I%27m+interested+in+your+work&tf=cm",
        "_blank"
      );
    }

    if (clickedObj.name === "linkedin") {
      window.open("https://www.linkedin.com/in/your-profile", "_blank");
    }

    if (clickedObj.name === "top_secret_drawer") toggleDrawer();
  }
});

render();
