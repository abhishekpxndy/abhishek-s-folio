import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#experience-canvas");
console.log("Canvas found:", canvas);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Loaders
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const textureMap = {
  "f3": { day: "/textures/texture.webp" },
  "lamp": { day: "/textures/Rectangle 1.webp" },
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
  "top_secret_drawer": { day: "/textures/texture (5).webp" },
  "coffe_mug": { day: "/textures/texture (5).webp" },
  "room134": { day: "/textures/texture (6).webp" },
  "Curve008": { day: "/textures/texture (6).webp" },
  "Curve": { day: "/textures/texture (6).webp" },
  "cpu": { day: "/textures/texture (7).webp" },
  "Curve001": { day: "/textures/texture (8).webp" },
};

const loadedTextures = {
  day: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;
});

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

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(
-28.480294946123912,
4.706752649690262,
-17.184909365686448)

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.update();
controls.target.set(
1.384714808886444,
0.7997205417949996,
-2.625856821787898)

loader.load("/models/dhoklapuri-v1.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      console.log(child.name);
      Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key],
          });

          child.material = material;
          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
          }
        }else if (child.name.includes("screen_monitor")) {
          child.material = new THREE.MeshBasicMaterial({
             map: videoTexture,
          });
        }
      });
    }
  });


  scene.add(glb.scene);

});

// Resize listener
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const render = () => {
  controls.update();
  
  //console.log(camera.position);
  //console.log("0000000");
  //console.log(controls.target);


  renderer.render(scene, camera);
  
  window.requestAnimationFrame(render);
};

render();
