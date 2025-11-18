import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import pianoSynth from "./audioSynth.js";

// Global error handler for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Global error caught:', e.error);
    // Prevent the default error handling that might show iOS error page
    e.preventDefault();
    return true;
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
    return true;
});

const clock = new THREE.Clock();
const mouse3D = new THREE.Vector3();

const loadingScreen = document.getElementById("loading-screen");
const loadingBar = document.getElementById("loading-bar");
let progress = 0;
const rippleOverlay = document.getElementById("ripple-overlay");
const tapText = document.getElementById("tap-to-enter");

const loadingManager = new THREE.LoadingManager();

let targetProgress = 0;
let displayedProgress = 0;
let loadingComplete = false;
let audioUnlocked = false; // Moved here to fix scope issue

const terminalOutput = document.getElementById("terminal-output");
let terminalLineDelay = 0;

const terminalCommands = [
    "C:\\Users\\Guest> cd portfolio",
    "C:\\Users\\Guest\\portfolio> init.exe",
    "",
    "Initializing WebGL context... OK",
    "Loading shader programs... OK",
    "Compiling vertex shaders... OK",
    "Compiling fragment shaders... OK",
    "Allocating GPU memory... OK",
    "Loading 3D models...",
    "Parsing geometry data...",
    "Loading texture assets...",
    "Initializing audio context... OK",
    "Setting up scene graph...",
    "Configuring camera systems... OK",
    "Preparing render pipeline...",
];

function addTerminalLine(text, delay = 0) {
    setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.textContent = text;
        line.style.animationDelay = '0s';
        if (terminalOutput) {
            terminalOutput.appendChild(line);
            // Scroll the terminal container, not the output
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.scrollTop = terminal.scrollHeight;
            }
        }
    }, delay);
}

// Add initial commands after a short delay to ensure DOM is ready
setTimeout(() => {
    terminalCommands.forEach((cmd, index) => {
        addTerminalLine(cmd, index * 120);
    });
}, 100);

function updateLoadingStatus(message) {
    addTerminalLine(message, 0);
}

loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
    // Already showing terminal commands
};

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    targetProgress = (itemsLoaded / itemsTotal) * 100;
    // Don't show individual filenames
};

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

updateProgressBar();

loadingManager.onLoad = () => {
    loadingComplete = true;
    targetProgress = 100; // ensure bar goes to 100%
};

const textureLoader = new THREE.TextureLoader(loadingManager);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);

const pointer = new THREE.Vector2();

const raycaster = new THREE.Raycaster();

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
    guitar: "/textures/sounds/strums.mp3",
};

//  Piano sounds
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

// Piano synthesizer replaces audio pool - no MP3 files needed!
// Initialize the synthesizer (will be activated on user interaction)
const audioPool = {}; // Keep for compatibility, but won't be used

const bgAudio = document.createElement("audio");
bgAudio.src = "/textures/sounds/limbo_12021.mp3"; // Fixed filename
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
        bgAudio.play().then(() => {
            musicBtn.classList.remove("paused");
            let currentStep = 0;
            const fadeIn = setInterval(() => {
                if (currentStep < steps) {
                    bgAudio.volume = Math.min(0.2, bgAudio.volume + volumeStep);
                    currentStep++;
                } else clearInterval(fadeIn);
            }, interval);
        }).catch(err => console.warn("Autoplay blocked:", err));
    } else {
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
    updateLoadingStatus("Ready");
    
    // Ripple effect from center
    setTimeout(() => {
        rippleOverlay.style.clipPath = "circle(150% at 50% 50%)";
    }, 200);
    
    // Show tap to enter
    setTimeout(() => {
        tapText.style.opacity = 1;
        tapText.style.transform = "translate(-50%, -50%)";
        loadingScreen.classList.add("loaded");
    }, 800);
}

const isMobile = () => window.innerWidth < 768 || /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);

// Moth count: Reduced for performance - 20 moths with jittery movement
const MOTH_COUNT = 20;

function mobileIntroAnimation() {
    const originalPos = camera.position.clone();
    gsap.to(camera.position, {
        x: originalPos.x + (Math.random() - 0.5) * 0.3,
        y: originalPos.y + (Math.random() - 0.5) * 0.3,
        duration: 0.15,
        ease: "sine.inOut",
        onUpdate: () => camera.updateProjectionMatrix()
    });

    gsap.from(scene.scale, {
        x: 0.98,
        y: 0.98,
        z: 0.98,
        duration: 0.4,
        ease: "back.out"
    });

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

function playWhooshEffect(poolIndex = 0) {
    if (!whooshPool || whooshPool.length === 0) return;
    const audio = whooshPool[poolIndex % whooshPool.length];
    if (audio.paused) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

const handleTapToEnter = () => {
    if (!loadingComplete) {
        return;
    }

    mobileIntroAnimation();

    // Initialize piano synthesizer immediately on tap
    pianoSynth.init();
    pianoSynth.resume();

    // Audio handling
    bgAudio.volume = 0;
    
    bgAudio.play().then(() => {
        musicBtn.classList.remove("paused");
        // Fade in volume asynchronously
        let v = 0;
        const fade = setInterval(() => {
            v += 0.02;
            bgAudio.volume = Math.min(0.2, v);
            if (v >= 0.2) clearInterval(fade);
        }, 30);
    }).catch((err) => {
        console.warn(" Audio play failed:", err);
        // On iOS, audio might still fail - don't block the experience
        musicBtn.classList.add("paused");
    });

    // Now run the rest of unlock async
    unlockAudio();
};

// Use a flag to prevent double-triggering
let tapHandled = false;

loadingScreen.addEventListener("click", () => {
    if (!tapHandled) {
        tapHandled = true;
        handleTapToEnter();
    }
});

loadingScreen.addEventListener("touchend", (e) => {
    if (!tapHandled) {
        tapHandled = true;
        e.preventDefault();
        handleTapToEnter();
    }
}, { passive: false });

let lastTouchTime = 0;

//  Texture map (keep as is)
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

//  Video texture for monitor - DISABLED (video file doesn't exist)
let videoElement = null;
let videoTexture = null;

// Use static texture for monitor screen
videoTexture = textureLoader.load('/textures/texture.webp');
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false; 

//  Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);

// Different camera positions for mobile and desktop
if (isMobile()) {
    camera.position.set(-59.6888952595263, 18.194309680042778, -51.344101750070436);
} else {
    camera.position.set(-28.4803, 4.7067, -17.1849);
}

// Try to create WebGL renderer with error handling
let renderer;
try {
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: false,
        precision: "highp",
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false
    });
} catch (error) {
    // WebGL context blocked - show terminal-style error and FREEZE
    const terminalOutput = document.getElementById("terminal-output");
    const loadingBar = document.getElementById("loading-bar-container");
    const tapToEnter = document.getElementById("tap-to-enter");
    const rippleOverlay = document.getElementById("ripple-overlay");
    
    // Stop all loading animations
    window._finished = true;
    loadingComplete = false; // Prevent tap to enter
    
    // Hide loading bar and tap to enter
    if (loadingBar) loadingBar.style.display = "none";
    if (tapToEnter) tapToEnter.style.display = "none";
    if (rippleOverlay) rippleOverlay.style.display = "none";
    
    if (terminalOutput) {
        // Stop terminal animation
        clearInterval(window.terminalInterval);
        
        // Add error message - FREEZE HERE
        terminalOutput.innerHTML += `
            <div style="color: #ff4444; margin-top: 20px;">
                <div>ERROR: WebGL context creation failed</div>
                <div>Reason: Browser blocked WebGL due to previous crash</div>
                <div style="margin-top: 10px;">Press any key to refresh...</div>
            </div>
        `;
    }
    
    // Refresh on any key press
    document.addEventListener('keydown', () => window.location.reload(), { once: true });
    document.addEventListener('click', () => window.location.reload(), { once: true });
    document.addEventListener('touchend', () => window.location.reload(), { once: true });
    
    throw error; // Stop execution
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
// Best resolution for all devices
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Handle WebGL context loss (critical for mobile)
// Proper WebGL context loss handling (based on Luciad guide)
let contextLost = false;

canvas.addEventListener('webglcontextlost', (event) => {
    // Prevent default behavior (context won't be restored automatically)
    event.preventDefault();
    
    contextLost = true;
    console.error('⚠️ WebGL context lost! Stopping render loop...');
    
    // Stop render loop immediately
    cancelAnimationFrame(window.animationFrameId);
    
    // FREEZE everything and show terminal error
    const loadingScreen = document.getElementById("loading-screen");
    const terminalOutput = document.getElementById("terminal-output");
    const loadingBar = document.getElementById("loading-bar-container");
    const tapToEnter = document.getElementById("tap-to-enter");
    const rippleOverlay = document.getElementById("ripple-overlay");
    
    // Stop all animations
    window._finished = true;
    loadingComplete = false;
    
    // Hide UI elements
    if (loadingBar) loadingBar.style.display = "none";
    if (tapToEnter) tapToEnter.style.display = "none";
    if (rippleOverlay) rippleOverlay.style.display = "none";
    
    if (loadingScreen && terminalOutput) {
        // Show loading screen again
        loadingScreen.style.display = "flex";
        loadingScreen.style.opacity = "1";
        loadingScreen.style.pointerEvents = "auto";
        
        // Stop terminal animation
        clearInterval(window.terminalInterval);
        
        // Add error message - FREEZE HERE
        terminalOutput.innerHTML += `
            <div style="color: #ff4444; margin-top: 20px;">
                <div>FATAL ERROR: WebGL context lost</div>
                <div>GPU memory exhausted or driver crash detected</div>
                <div style="margin-top: 10px;">Press any key to refresh...</div>
            </div>
        `;
    }
    
    // Refresh on any interaction
    const refresh = () => window.location.reload();
    document.addEventListener('keydown', refresh, { once: true });
    document.addEventListener('click', refresh, { once: true });
    document.addEventListener('touchend', refresh, { once: true });
}, false);

canvas.addEventListener('webglcontextrestored', () => {
    console.log('✅ WebGL context restored! Reloading page...');
    contextLost = false;
    
    // Full page reload is safest - ensures clean state
    // Attempting to recreate resources manually is complex and error-prone
    location.reload();
}, false);

// Additional mobile optimizations
if (isMobile()) {
    renderer.shadowMap.enabled = false; // Disable shadows on mobile
    renderer.physicallyCorrectLights = false;
}

const whooshSound = new Audio("/textures/sounds/videoplayback_IJdyFWt1.mp3");
whooshSound.volume = 0.3;

// Create whoosh audio pool for layered intro effects
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

    const zoomOutDistance = 1.8;
    camera.position.set(
        originalPos.x * zoomOutDistance,
        originalPos.y * zoomOutDistance,
        originalPos.z * zoomOutDistance
    );

    const duration = 3.5;
    gsap.to(camera.position, {
        x: originalPos.x,
        y: originalPos.y,
        z: originalPos.z,
        duration: duration,
        ease: "power2.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
        onStart: () => {
            //  Single whoosh during camera zoom
            playWhooshEffect(0);
        }
    });

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

    const fadeDuration = 2;
    const delayBefore = 200;

    fade.style.opacity = 1;
    fade.style.transition = `opacity ${fadeDuration}s ease`;

    setTimeout(() => {
        fade.style.opacity = 0; // fade out
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
    playIntroAnimations();

    cameraIntro();

    fadeScreenFromBlack();

    if (window.bloomPass) {
        bloomFadeIn(window.bloomPass);
    }
}

function bloomFadeIn(pass) {
    pass.strength = 0;
    gsap.to(pass, {
        strength: 1.2,
        duration: 2,
        ease: "power2.out"
    });
}

function precomputeIntroAnimation(root) {
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

            child.userData.introInitialized = true;

            // Full animation for all devices
            child.scale.set(0.0001, 0.0001, 0.0001);

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

    const tweens = [];
    
    // Full animation for all devices
    const animDuration = 3.2;
    const rotateDuration = 2.8;
    const positionDuration = 3.0;

    objects.forEach(({ obj, originalScale, originalRot, originalPos }, idx) => {
        const baseDelay = idx * 0.015;

        const scaleTween = gsap.to(obj.scale, {
            x: originalScale.x,
            y: originalScale.y,
            z: originalScale.z,
            duration: animDuration,
            ease: "elastic.out(1, 0.5)",
            delay: baseDelay,
            paused: true
        });

        const rotateTween = gsap.to(obj.rotation, {
            x: originalRot.x,
            y: originalRot.y,
            z: originalRot.z,
            duration: rotateDuration,
            ease: "expo.out",
            delay: baseDelay,
            paused: true
        });

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
}

function playIntroAnimations() {
    if (!window.introAnimationTweens || !window.introAnimationsReady) {
        return;
    }

    window.introAnimationTweens.forEach(({ scaleTween, rotateTween, posTween }) => {
        scaleTween.play();
        rotateTween.play();
        posTween.play();
    });
}

// Lazy load moths and fireflies after user interaction
function lazyLoadParticles() {
    if (!window.lampPosition) return;
    
    // Load fireflies first (smaller, faster)
    setTimeout(() => {
        try {
            const fireflyCount = 25;
            const fireflyGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const fireflyMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffaa,
                transparent: true,
                opacity: 0.8
            });

            const fireflyMesh = new THREE.InstancedMesh(fireflyGeometry, fireflyMaterial, fireflyCount);
            window.firefliesData = [];
            
            const matrix = new THREE.Matrix4();
            
            for (let i = 0; i < fireflyCount; i++) {
                const fireflyData = new FireflyData(window.lampPosition, i);
                window.firefliesData.push(fireflyData);
                
                const pos = fireflyData.getPosition(0);
                matrix.setPosition(pos);
                fireflyMesh.setMatrixAt(i, matrix);
            }
            
            fireflyMesh.instanceMatrix.needsUpdate = true;
            scene.add(fireflyMesh);
            window.fireflyMesh = fireflyMesh;
        } catch (error) {
            console.error("❌ Failed to create fireflies:", error);
        }
    }, 1500); // Load after 1.5 seconds
    
    // Load moths after fireflies
    setTimeout(() => {
        try {
            const mothGeometry = new THREE.SphereGeometry(0.015, 6, 6);
            const mothMaterial = new THREE.MeshBasicMaterial({ color: 0x4a3d35 });
            const mothMesh = new THREE.InstancedMesh(mothGeometry, mothMaterial, MOTH_COUNT);
            
            window.mothsData = [];
            const matrix = new THREE.Matrix4();
            
            for (let i = 0; i < MOTH_COUNT; i++) {
                const mothData = new MothData(window.lampPosition, i);
                window.mothsData.push(mothData);
                
                const pos = mothData.getPosition(0);
                matrix.setPosition(pos);
                mothMesh.setMatrixAt(i, matrix);
            }
            
            mothMesh.instanceMatrix.needsUpdate = true;
            scene.add(mothMesh);
            window.mothMesh = mothMesh;
        } catch (error) {
            console.error("❌ Failed to create moths:", error);
        }
    }, 2500); // Load after 2.5 seconds
}

function unlockAudio() {
    if (audioUnlocked) {
        return;
    }
    audioUnlocked = true;

    // Initialize piano synthesizer on user interaction
    pianoSynth.init();
    pianoSynth.resume();

    if (rippleOverlay) {
        rippleOverlay.style.opacity = 0;
        rippleOverlay.style.pointerEvents = "none";
    }

    loadingScreen.style.opacity = 0;
    loadingScreen.style.pointerEvents = "none";
    setTimeout(() => {
        if (loadingScreen.parentNode) loadingScreen.remove();
    }, 250);

    const tap = document.getElementById("tap-to-enter");
    if (tap) {
        tap.style.opacity = 0;
        setTimeout(() => {
            if (tap.parentNode) tap.remove();
        }, 800);
    }

    playIntroAnimations();

    if (window.loadedRootScene) {
        runFullIntro(window.loadedRootScene);
    }
    
    // Start lazy loading moths and fireflies
    lazyLoadParticles();
}

// Simplified moth data structure (no interactivity, just looping animation)
class MothData {
    constructor(center, index) {
        this.center = center.clone();
        this.swarmPhase = Math.random() * Math.PI * 2;
        this.speed = 1.2 + Math.random() * 0.8; // Faster, more erratic
        this.radius = 0.8 + Math.random() * 0.7;
        this.heightOffset = (Math.random() - 0.5) * 0.8;
        this.jitterSpeed = 3 + Math.random() * 4; // Jitter frequency
        this.jitterAmount = 0.15 + Math.random() * 0.15; // Jitter intensity
        this.index = index;
    }

    getPosition(time) {
        const t = time * this.speed + this.swarmPhase;
        
        // Base circular motion
        const baseX = this.center.x + Math.sin(t * 0.9) * this.radius;
        const baseY = this.center.y + Math.sin(t * 0.6) * 0.5 + this.heightOffset;
        const baseZ = this.center.z + Math.cos(t * 0.9) * this.radius;
        
        // Add jittery movement
        const jitterT = time * this.jitterSpeed + this.index;
        const jitterX = Math.sin(jitterT * 2.3) * this.jitterAmount;
        const jitterY = Math.sin(jitterT * 3.1) * this.jitterAmount;
        const jitterZ = Math.cos(jitterT * 2.7) * this.jitterAmount;
        
        return new THREE.Vector3(
            baseX + jitterX,
            baseY + jitterY,
            baseZ + jitterZ
        );
    }
}

// Simplified firefly data structure (baked, looping animation)
class FireflyData {
    constructor(center, index) {
        this.baseX = (Math.random() - 0.5) * 15;
        this.baseY = Math.random() * 1.5 - 0.3;
        this.baseZ = (Math.random() - 0.5) * 15;
        this.speed = 0.5 + Math.random() * 1.5;
        this.phase = Math.random() * Math.PI * 2;
        this.index = index;
    }

    getPosition(time) {
        const x = this.baseX + Math.sin(time * 0.5 + this.index * 0.5) * 0.3;
        const y = this.baseY + Math.sin(time * 0.8 + this.index * 0.3) * 0.4;
        const z = this.baseZ + Math.cos(time * 0.6 + this.index * 0.4) * 0.3;
        return new THREE.Vector3(x, y, z);
    }

    getOpacity(time) {
        const flicker = Math.sin(time * this.speed + this.phase) * 0.5 + 0.5;
        return 0.3 + flicker * 0.6;
    }
}

// Load 3D model
const modelPath = "/models/beg-v1.glb";
updateLoadingStatus(`Loading experience...`);

loader.load(modelPath, (glb) => {
    updateLoadingStatus(`Processing scene...`);
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
                raycasterObjects.push(child); // Add monitor to raycaster for hover detection
                window.screenMonitor = child; // Store reference for camera positioning
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
    
    // Store lamp position for lazy loading
    if (lamp) {
        lamp.getWorldPosition(lampWorldPos);
        window.lampPosition = lampWorldPos;
    }

    // Don't create moths/fireflies yet - wait for user interaction
    precomputeIntroAnimation(glb.scene);
});

//  Resize window
window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("click", (event) => {
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

        // Camera zoom to monitor on click
        if (obj.name.includes("screen_monitor")) {
            if (!cameraAtMonitor) {
                moveCameraToMonitor();
            }
            return; // Don't process other clicks when clicking monitor
        }

        // Any click that's NOT on monitor - reset camera if at monitor
        if (cameraAtMonitor) {
            resetCameraPosition();
        }

        // Process other interactions
        if (obj.name.length === 2) {
            playPianoKey(obj);
        }

        if (stringSounds[obj.name]) playString(obj);

        if (obj.name === "gmail") window.open("https://mail.google.com/mail/u/0/?fs=1&to=abhishekpxndy@gmail.com&su=Project+Inquiry&body=Hi,+I%27m+interested+in+your+work&tf=cm", "_blank");
        if (obj.name === "linkedin") window.open("https://www.linkedin.com/in/your-profile", "_blank");
        if (obj.name === "top_secret_drawer") toggleDrawer();
    } else {
        // Clicked on empty space - return camera to original position
        if (cameraAtMonitor) {
            resetCameraPosition();
        }
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

    // Play synthesized piano sound instead of MP3
    pianoSynth.playNote(keyName, 1.2);

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

//  UNIFIED touch input handler
window.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    if (!touch || !camera) return;

    pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

}, { passive: true });

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

        // Camera zoom to monitor on touch
        if (obj.name.includes("screen_monitor")) {
            if (!cameraAtMonitor) {
                moveCameraToMonitor();
            }
            return; // Don't process other touches when touching monitor
        }

        // Any touch that's NOT on monitor - reset camera if at monitor
        if (cameraAtMonitor) {
            resetCameraPosition();
        }

        // Process other interactions
        if (obj.name.length === 2) {
            playPianoKey(obj);
        }

        if (stringSounds[obj.name]) playString(obj);

        if (obj.name === "gmail") window.open("https://mail.google.com/mail/u/0/?fs=1&to=abhishekpxndy@gmail.com&su=Project+Inquiry&body=Hi,+I%27m+interested+in+your+work&tf=cm", "_blank");
        if (obj.name === "linkedin") window.open("https://www.linkedin.com/in/your-profile", "_blank");
        if (obj.name === "top_secret_drawer") toggleDrawer();
    } else {
        // Touched empty space - return camera to original position
        if (cameraAtMonitor) {
            resetCameraPosition();
        }
    }
}, { passive: true });

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

// Store original camera position for reset (different for mobile and desktop)
const originalCameraPosition = isMobile() 
    ? new THREE.Vector3(-59.6888952595263, 18.194309680042778, -51.344101750070436)
    : new THREE.Vector3(-28.4803, 4.7067, -17.1849);
const originalCameraTarget = new THREE.Vector3(1.3847, 0.7997, -2.6258);

// Camera animation for monitor - Using your custom position
const monitorCameraPosition = new THREE.Vector3(0.7960820857463676, -0.3651695519407711, 0.8049629895023824);
const monitorCameraTarget = new THREE.Vector3(1.5872473366652464, -0.3651683721700264, 0.8042363169307383);

// Camera animation state management
let cameraAnimating = false;
let cameraAtMonitor = false;

function moveCameraToMonitor() {
    // Prevent multiple animations from triggering
    if (cameraAnimating || cameraAtMonitor) return;
    
    cameraAnimating = true;
    
    // Kill any existing tweens to prevent conflicts
    gsap.killTweensOf([camera.position, controls.target]);
    
    // Smooth camera movement to your custom position
    gsap.to(camera.position, {
        x: monitorCameraPosition.x,
        y: monitorCameraPosition.y,
        z: monitorCameraPosition.z,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
        onComplete: () => {
            cameraAnimating = false;
            cameraAtMonitor = true;
        }
    });
    
    gsap.to(controls.target, {
        x: monitorCameraTarget.x,
        y: monitorCameraTarget.y,
        z: monitorCameraTarget.z,
        duration: 1.2,
        ease: "power2.inOut"
    });
}

function resetCameraPosition() {
    // Prevent multiple animations from triggering
    if (cameraAnimating || !cameraAtMonitor) return;
    
    cameraAnimating = true;
    
    // Kill any existing tweens to prevent conflicts
    gsap.killTweensOf([camera.position, controls.target]);
    
    // Return to original position
    gsap.to(camera.position, {
        x: originalCameraPosition.x,
        y: originalCameraPosition.y,
        z: originalCameraPosition.z,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
        onComplete: () => {
            cameraAnimating = false;
            cameraAtMonitor = false;
        }
    });
    
    gsap.to(controls.target, {
        x: originalCameraTarget.x,
        y: originalCameraTarget.y,
        z: originalCameraTarget.z,
        duration: 1.2,
        ease: "power2.inOut"
    });
}

// Render Loop
let frameCount = 0;

const render = () => {
    // Stop rendering if context is lost
    if (contextLost) {
        return;
    }
    
    controls.update();
    
    xAxisFans.forEach((fan) => (fan.rotation.x += 0.06));
    zAxisFans.forEach((fan) => (fan.rotation.z += 0.06));

    const deltaTime = clock.getDelta();

    // Update instanced moths (simple looping animation)
    if (window.mothMesh && window.mothsData) {
        const time = performance.now() * 0.001;
        const matrix = new THREE.Matrix4();
        
        for (let i = 0; i < window.mothsData.length; i++) {
            const mothData = window.mothsData[i];
            const pos = mothData.getPosition(time);
            matrix.setPosition(pos);
            window.mothMesh.setMatrixAt(i, matrix);
        }
        
        window.mothMesh.instanceMatrix.needsUpdate = true;
    }

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let hoveringClickable = false;
    
    if (intersects.length > 0) {
        const hoveredObj = intersects[0].object;
        
        // Check if hovering over clickable objects (for cursor change)
        if (hoveredObj.name.includes("screen_monitor") ||
            hoveredObj.name.length === 2 ||
            hoveredObj.name === "gmail" ||
            hoveredObj.name === "linkedin") {
            hoveringClickable = true;
        }
    }

    document.body.style.cursor = hoveringClickable ? "pointer" : "default";

    // Update instanced fireflies (baked animation)
    if (window.fireflyMesh && window.firefliesData) {
        const time = performance.now() * 0.001;
        const matrix = new THREE.Matrix4();
        
        for (let i = 0; i < window.firefliesData.length; i++) {
            const fireflyData = window.firefliesData[i];
            const pos = fireflyData.getPosition(time);
            matrix.setPosition(pos);
            window.fireflyMesh.setMatrixAt(i, matrix);
        }
        
        window.fireflyMesh.instanceMatrix.needsUpdate = true;
        
        // Update overall opacity (average flicker)
        let totalOpacity = 0;
        for (let i = 0; i < window.firefliesData.length; i++) {
            totalOpacity += window.firefliesData[i].getOpacity(time);
        }
        const avgOpacity = totalOpacity / window.firefliesData.length;
        window.fireflyMesh.material.opacity = avgOpacity;
    }

    renderer.render(scene, camera);
    frameCount++;
    
    window.animationFrameId = window.requestAnimationFrame(render);
};

render();
