import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CSS3DRenderer, CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { gsap } from "gsap";
import pianoSynth from "./audioSynth.js";

// Steam shaders as strings
const steamVertexShader = `
uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

vec2 rotate2D(vec2 value, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, s, -s, c);
    return m * value;
}

void main()
{
    vec3 newPosition = position;

    // Twist
    float twistPerlin = texture2D(
        uPerlinTexture,
        vec2(0.5, uv.y * 0.2 - uTime * 0.01)
    ).r;
    float angle = twistPerlin * 3.0;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind
    vec2 windOffset = vec2(
        texture2D(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5,
        texture2D(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5
    );
    windOffset *= pow(uv.y, 2.0) * 1.5;
    newPosition.xz += windOffset;

    // Final position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    // Varyings
    vUv = uv;
}
`;

const steamFragmentShader = `
uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main()
{
    // Scale and animate
    vec2 steamUv = vUv;
    steamUv.x *= 0.5;
    steamUv.y *= 0.3;
    steamUv.y -= uTime * 0.04;

    // Steam
    float steam = texture2D(uPerlinTexture, steamUv).r;

    // Remap
    steam = smoothstep(0.4, 1.0, steam);

    // Edges
    steam *= smoothstep(0.0, 0.1, vUv.x);
    steam *= smoothstep(1.0, 0.9, vUv.x);
    steam *= smoothstep(0.0, 0.1, vUv.y);
    steam *= smoothstep(1.0, 0.4, vUv.y);

    // Final color
    gl_FragColor = vec4(1.0, 1.0, 1.0, steam * 0.6);
}
`;

window.addEventListener('error', (e) => {
    console.error('Global error caught:', e.error);
    e.preventDefault();
    return true;
});

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
let audioUnlocked = false;

const terminalOutput = document.getElementById("terminal-output");
let terminalLineDelay = 0;

const terminalCommands = [
    "C:\\Users\\Guest> cd portfolio",
    "C:\\Users\\Guest\\portfolio> init.exe",
    "Initializing WebGL context",
    "Loading shader programs",
    "Compiling vertex shaders",
    "Compiling fragment shaders",
    "Allocating GPU memory",
    "Loading 3D models",
    "Parsing geometry data",
    "Loading texture assets",
    "Initializing audio context",
    "Setting up scene graph",
    "Configuring camera systems",
    "Preparing render pipeline",
];

function addTerminalLine(text, delay = 0) {
    setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.textContent = text;
        line.style.animationDelay = '0s';
        if (terminalOutput) {
            terminalOutput.appendChild(line);
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.scrollTop = terminal.scrollHeight;
            }
        }
    }, delay);
}

setTimeout(() => {
    terminalCommands.forEach((cmd, index) => {
        addTerminalLine(cmd, index * 120);
    });
}, 100);

function updateLoadingStatus(message) {
    addTerminalLine(message, 0);
}

loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
};

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    targetProgress = (itemsLoaded / itemsTotal) * 100;
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
    targetProgress = 100; 
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

const audioPool = {}; 

const bgAudio = document.createElement("audio");
bgAudio.src = "/textures/sounds/limbo_12021.mp3"; 
bgAudio.loop = true;
bgAudio.volume = 0.5;
bgAudio.playsInline = true;
bgAudio.preload = "auto";
bgAudio.load();
document.body.appendChild(bgAudio);

// Store original volume for tab visibility handling
let originalBgVolume = 0.2;
let tabVisibilityFadeTimeout = null;

// Track if audio was playing before tab switch
let wasPlayingBeforeHidden = false;

// Handle tab visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab is hidden - pause the audio completely
        if (!bgAudio.paused) {
            wasPlayingBeforeHidden = true;
            originalBgVolume = bgAudio.volume; // Store current volume
            bgAudio.pause();
        }
    } else {
        // Tab is visible - resume if it was playing before
        if (wasPlayingBeforeHidden) {
            bgAudio.volume = originalBgVolume;
            bgAudio.play().catch(err => console.warn('Could not resume audio:', err));
            wasPlayingBeforeHidden = false;
        }
    }
});

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
    
    setTimeout(() => {
        rippleOverlay.style.clipPath = "circle(150% at 50% 50%)";
    }, 200);
    
    setTimeout(() => {
        tapText.style.opacity = 1;
        tapText.style.transform = "translate(-50%, -50%)";
        loadingScreen.classList.add("loaded");
    }, 800);
}

const isMobile = () => window.innerWidth < 768 || /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);

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

    pianoSynth.init();
    pianoSynth.resume();

    bgAudio.volume = 0;
    
    bgAudio.play().then(() => {
        musicBtn.classList.remove("paused");
        let v = 0;
        const fade = setInterval(() => {
            v += 0.02;
            bgAudio.volume = Math.min(0.2, v);
            if (v >= 0.2) clearInterval(fade);
        }, 30);
    }).catch((err) => {
        console.warn(" Audio play failed:", err);
        musicBtn.classList.add("paused");
    });

    unlockAudio();
};

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

const textureMap = {
    "f3": { day: "/textures/texture.webp" },
    "lamp": { day: "/textures/Rectangle 1.webp" },
    "resume": { day: "/textures/Resume.webp" },
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
    "linkedin": { day: "/textures/cpufans.webp" },
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

// Monitor screen configuration
const SCREEN_SIZE = { w: 1920, h: 1080 };

// Create container for iframe
const iframeContainer = document.createElement('div');
iframeContainer.style.width = SCREEN_SIZE.w + 'px';
iframeContainer.style.height = SCREEN_SIZE.h + 'px';
iframeContainer.style.opacity = '1';
iframeContainer.style.background = '#000';
iframeContainer.style.pointerEvents = 'none'; // Disable pointer events initially

// Create iframe element for the monitor
const iframeElement = document.createElement('iframe');
iframeElement.src = 'https://inner-site-for-3d-room-portfolio.vercel.app/';
iframeElement.style.width = SCREEN_SIZE.w + 'px';
iframeElement.style.height = SCREEN_SIZE.h + 'px';
iframeElement.style.border = 'none';
iframeElement.style.boxSizing = 'border-box';
iframeElement.style.opacity = '1';
iframeElement.style.pointerEvents = 'none'; // Disable pointer events initially
iframeElement.id = 'computer-screen';
iframeElement.frameBorder = '0';

// Add iframe to container
iframeContainer.appendChild(iframeElement);

// Store references globally
window.monitorIframe = iframeElement;
window.monitorIframeContainer = iframeContainer;

// Audio detection for iframe
let iframeAudioContext = null;
let iframeAudioAnalyser = null;
let iframeAudioDetectionInterval = null;
let bgMusicFadedOut = false;
const BGM_NORMAL_VOLUME = 0.2;
const BGM_DUCKED_VOLUME = 0.05;

// Function to fade background music
function fadeBgMusic(targetVolume, duration = 500) {
    const steps = 20;
    const interval = duration / steps;
    const startVolume = bgAudio.volume;
    const volumeStep = (targetVolume - startVolume) / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
        if (currentStep < steps) {
            const newVolume = startVolume + (volumeStep * currentStep);
            bgAudio.volume = Math.max(0, Math.min(0.2, newVolume));
            currentStep++;
        } else {
            clearInterval(fadeInterval);
            bgAudio.volume = targetVolume;
        }
    }, interval);
}

// Try to detect iframe audio (this may be limited by CORS)
iframeElement.addEventListener('load', () => {
    try {
        // Attempt to capture audio from iframe (may not work due to CORS)
        if (iframeElement.contentWindow && iframeElement.contentWindow.document) {
            const iframeDoc = iframeElement.contentWindow.document;
            
            // Listen for audio/video elements in iframe
            const checkForMedia = () => {
                try {
                    const audioElements = iframeDoc.querySelectorAll('audio, video');
                    audioElements.forEach(media => {
                        media.addEventListener('play', () => {
                            if (!bgMusicFadedOut && !bgAudio.paused) {
                                fadeBgMusic(BGM_DUCKED_VOLUME);
                                bgMusicFadedOut = true;
                            }
                        });
                        
                        media.addEventListener('pause', () => {
                            if (bgMusicFadedOut && !bgAudio.paused) {
                                fadeBgMusic(BGM_NORMAL_VOLUME);
                                bgMusicFadedOut = false;
                            }
                        });
                        
                        media.addEventListener('ended', () => {
                            if (bgMusicFadedOut && !bgAudio.paused) {
                                fadeBgMusic(BGM_NORMAL_VOLUME);
                                bgMusicFadedOut = false;
                            }
                        });
                    });
                } catch (e) {
                    // Cannot access iframe media elements due to CORS
                }
            };
            
            checkForMedia();
            // Check periodically for new media elements
            setInterval(checkForMedia, 2000);
        }
    } catch (e) {
        // Cannot access iframe content due to CORS policy
    }
});

// Listen for messages from iframe about audio state
window.addEventListener('message', (event) => {
    // Check if message is about audio
    if (event.data && event.data.type) {
        if (event.data.type === 'audioPlaying') {
            if (!bgMusicFadedOut && !bgAudio.paused) {
                fadeBgMusic(BGM_DUCKED_VOLUME);
                bgMusicFadedOut = true;
            }
        } else if (event.data.type === 'audioPaused' || event.data.type === 'audioEnded') {
            if (bgMusicFadedOut && !bgAudio.paused) {
                fadeBgMusic(BGM_NORMAL_VOLUME);
                bgMusicFadedOut = false;
            }
        }
    }
});

// Camera state variables
let cameraAnimating = false;
let cameraAtMonitor = false;

// UI Integration - Connect new sound toggle with existing music system
document.addEventListener('DOMContentLoaded', () => {
    const soundToggle = document.getElementById('sound-toggle');
    const oldMusicBtn = document.getElementById('music-btn');
    
    if (soundToggle && oldMusicBtn) {
        // Sync the new UI with existing music state
        const updateSoundToggle = () => {
            if (bgAudio.paused) {
                soundToggle.classList.remove('active');
            } else {
                soundToggle.classList.add('active');
            }
        };
        
        // Connect new sound toggle to existing music functionality
        soundToggle.addEventListener('click', () => {
            // Toggle music instantly without transitions
            if (bgAudio.paused) {
                bgAudio.volume = cameraAtMonitor ? 0.01 : 0.2; // Set appropriate volume
                bgAudio.play().catch(err => console.warn('Could not play audio:', err));
                musicBtn.classList.remove("paused");
            } else {
                bgAudio.pause();
                musicBtn.classList.add("paused");
            }
            updateSoundToggle();
        });
        
        // Update UI when music state changes
        bgAudio.addEventListener('play', updateSoundToggle);
        bgAudio.addEventListener('pause', updateSoundToggle);
        
        // Initial state
        updateSoundToggle();
        
        // Hide old music button since we have the new UI
        oldMusicBtn.style.display = 'none';
    }
});

// Add keyboard event forwarding when camera is at monitor
document.addEventListener('keydown', (event) => {
    if (cameraAtMonitor && window.monitorIframe && window.monitorIframe.contentWindow) {
        // Forward keyboard events to iframe
        try {
            const iframeEvent = new KeyboardEvent('keydown', {
                key: event.key,
                code: event.code,
                keyCode: event.keyCode,
                which: event.which,
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                metaKey: event.metaKey,
                bubbles: true,
                cancelable: true
            });
            window.monitorIframe.contentWindow.document.dispatchEvent(iframeEvent);
        } catch (e) {
            // Cross-origin restriction, can't forward events directly
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (cameraAtMonitor && window.monitorIframe && window.monitorIframe.contentWindow) {
        try {
            const iframeEvent = new KeyboardEvent('keyup', {
                key: event.key,
                code: event.code,
                keyCode: event.keyCode,
                which: event.which,
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                metaKey: event.metaKey,
                bubbles: true,
                cancelable: true
            });
            window.monitorIframe.contentWindow.document.dispatchEvent(iframeEvent);
        } catch (e) {
            // Keyboard event forwarding blocked by CORS
        }
    }
}); 

const scene = new THREE.Scene();
const cssScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);

if (isMobile()) {
    camera.position.set(-59.6888952595263, 18.194309680042778, -51.344101750070436);
} else {
    camera.position.set(-28.4803, 4.7067, -17.1849);
}

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
    const terminalOutput = document.getElementById("terminal-output");
    const loadingBar = document.getElementById("loading-bar-container");
    const tapToEnter = document.getElementById("tap-to-enter");
    const rippleOverlay = document.getElementById("ripple-overlay");
    
    window._finished = true;
    loadingComplete = false; 
    
    if (loadingBar) loadingBar.style.display = "none";
    if (tapToEnter) tapToEnter.style.display = "none";
    if (rippleOverlay) rippleOverlay.style.display = "none";
    
    if (terminalOutput) {
        clearInterval(window.terminalInterval);
        
        terminalOutput.innerHTML += `
            <div style="color: #ff4444; margin-top: 20px;">
                <div>ERROR: WebGL context creation failed</div>
                <div>Reason: Browser blocked WebGL due to previous crash</div>
                <div style="margin-top: 10px;">Press any key to refresh...</div>
            </div>
        `;
    }
    
    document.addEventListener('keydown', () => window.location.reload(), { once: true });
    document.addEventListener('click', () => window.location.reload(), { once: true });
    document.addEventListener('touchend', () => window.location.reload(), { once: true });
    
    throw error; 
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create CSS3D renderer for iframe overlay
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(sizes.width, sizes.height);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.left = '0';
cssRenderer.domElement.style.pointerEvents = 'none';
cssRenderer.domElement.style.zIndex = '1';
document.body.appendChild(cssRenderer.domElement);

// Store globally
window.cssRenderer = cssRenderer;

let contextLost = false;

canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    
    contextLost = true;
    console.error('⚠️ WebGL context lost! Stopping render loop...');
    
    cancelAnimationFrame(window.animationFrameId);
    
    const loadingScreen = document.getElementById("loading-screen");
    const terminalOutput = document.getElementById("terminal-output");
    const loadingBar = document.getElementById("loading-bar-container");
    const tapToEnter = document.getElementById("tap-to-enter");
    const rippleOverlay = document.getElementById("ripple-overlay");
    
    window._finished = true;
    loadingComplete = false;
    
    if (loadingBar) loadingBar.style.display = "none";
    if (tapToEnter) tapToEnter.style.display = "none";
    if (rippleOverlay) rippleOverlay.style.display = "none";
    
    if (loadingScreen && terminalOutput) {
        loadingScreen.style.display = "flex";
        loadingScreen.style.opacity = "1";
        loadingScreen.style.pointerEvents = "auto";
        
        clearInterval(window.terminalInterval);
        
        terminalOutput.innerHTML += `
            <div style="color: #ff4444; margin-top: 20px;">
                <div>FATAL ERROR: WebGL context lost</div>
                <div>GPU memory exhausted or driver crash detected</div>
                <div style="margin-top: 10px;">Press any key to refresh...</div>
            </div>
        `;
    }
    
    const refresh = () => window.location.reload();
    document.addEventListener('keydown', refresh, { once: true });
    document.addEventListener('click', refresh, { once: true });
    document.addEventListener('touchend', refresh, { once: true });
}, false);

canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    location.reload();
}, false);

if (isMobile()) {
    renderer.shadowMap.enabled = false; 
    renderer.physicallyCorrectLights = false;
}

const whooshSound = new Audio("/textures/sounds/videoplayback_IJdyFWt1.mp3");
whooshSound.volume = 0.3;

const whooshPool = [];
for (let i = 0; i < 3; i++) {
    const audio = new Audio("/textures/sounds/videoplayback_IJdyFWt1.mp3");
    audio.volume = 0.25 + i * 0.05; 
    audio.preload = "auto";
    whooshPool.push(audio);
}

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.target.set(1.3847, 0.7997, -2.6258);

// Add orbit control constraints for better navigation

controls.maxDistance = 50; // Maximum zoom distance
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = Math.PI;  
controls.maxAzimuthAngle = Math.PI * 1.5;
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
        fade.style.opacity = 0; 
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
    
    // Animate CSS3D iframe object
    if (window.monitorCssObject && window.monitorCssObject.userData.originalScale) {
        const cssObj = window.monitorCssObject;
        const originalScale = cssObj.userData.originalScale;
        
        gsap.to(cssObj.scale, {
            x: originalScale.x,
            y: originalScale.y,
            z: originalScale.z,
            duration: 3.2,
            ease: "elastic.out(1, 0.5)",
            delay: 0.5
        });
    }
}

function lazyLoadParticles() {
    if (!window.lampPosition) return;
    
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
    }, 1500); 
    
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
    }, 2500); 
    
    // Create shader-based steam
    setTimeout(() => {
        if (!window.steamPosition) return;
        
        try {
            // Steam geometry - vertical plane
            const steamGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
            steamGeometry.translate(0, 0.5, 0); // Move pivot to bottom
            steamGeometry.scale(0.15, 0.8, 0.15); // Scale to appropriate size
            
            // Load Perlin noise texture
            const perlinTexture = textureLoader.load("/textures/perlin.png");
            perlinTexture.wrapS = THREE.RepeatWrapping;
            perlinTexture.wrapT = THREE.RepeatWrapping;
            
            // Steam material with shaders
            const steamMaterial = new THREE.ShaderMaterial({
                vertexShader: steamVertexShader,
                fragmentShader: steamFragmentShader,
                uniforms: {
                    uTime: new THREE.Uniform(0),
                    uPerlinTexture: new THREE.Uniform(perlinTexture)
                },
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            
            const steamMesh = new THREE.Mesh(steamGeometry, steamMaterial);
            steamMesh.position.copy(window.steamPosition);
            steamMesh.position.y += 0.1; // Slightly above the steam object
            
            scene.add(steamMesh);
            window.steamMesh = steamMesh;
            window.steamMaterial = steamMaterial;
            

        } catch (error) {
            console.error("❌ Failed to create steam:", error);
        }
    }, 3000);
}

function unlockAudio() {
    if (audioUnlocked) {
        return;
    }
    audioUnlocked = true;

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
    
    lazyLoadParticles();
    
    // Start piano hint timer after 5 seconds
    setTimeout(() => {
        showPianoHint();
    }, 10000);
}

// Piano interaction tracking
let pianoInteracted = false;
let pianoHintTimeout = null;

function showPianoHint() {
    if (pianoInteracted) return;
    
    const hintElement = document.getElementById('piano-hint');
    if (!hintElement) return;
    
    const text = "Try clicking on piano keys & monitor";
    let currentIndex = 0;
    
    // Show the element
    hintElement.style.opacity = '1';
    
    // Type out the text letter by letter
    const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
            hintElement.textContent = text.substring(0, currentIndex + 1);
            currentIndex++;
        } else {
            clearInterval(typeInterval);
        }
    }, 100); // 80ms per character for typing effect
}

function hidePianoHint() {
    if (pianoInteracted) return;
    
    pianoInteracted = true;
    const hintElement = document.getElementById('piano-hint');
    if (hintElement) {
        hintElement.style.opacity = '0';
        setTimeout(() => {
            hintElement.style.display = 'none';
        }, 1000);
    }
}

class MothData {
    constructor(center, index) {
        this.center = center.clone();
        this.swarmPhase = Math.random() * Math.PI * 2;
        this.speed = 1.2 + Math.random() * 0.8; 
        this.radius = 0.8 + Math.random() * 0.7;
        this.heightOffset = (Math.random() - 0.5) * 0.8;
        this.jitterSpeed = 3 + Math.random() * 4; 
        this.jitterAmount = 0.15 + Math.random() * 0.15; 
        this.index = index;
    }

    getPosition(time) {
        const t = time * this.speed + this.swarmPhase;
        
        const baseX = this.center.x + Math.sin(t * 0.9) * this.radius;
        const baseY = this.center.y + Math.sin(t * 0.6) * 0.5 + this.heightOffset;
        const baseZ = this.center.z + Math.cos(t * 0.9) * this.radius;
        
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



const modelPath = "/models/abhishek-v1.glb";
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

            if (child.name.includes("steam")) {
                // Store steam object position for particle system
                const steamPos = new THREE.Vector3();
                child.getWorldPosition(steamPos);
                window.steamPosition = steamPos;

            }

            if (child.name.includes("screen_monitor")) {
                raycasterObjects.push(child); 
                window.screenMonitor = child;
                
                // Get monitor world transform
                const worldPos = new THREE.Vector3();
                const worldQuat = new THREE.Quaternion();
                child.getWorldPosition(worldPos);
                child.getWorldQuaternion(worldQuat);
                
                // Get the bounding box to calculate monitor dimensions
                const bbox = new THREE.Box3().setFromObject(child);
                const dimX = bbox.max.x - bbox.min.x;
                const dimY = bbox.max.y - bbox.min.y;
                const dimZ = bbox.max.z - bbox.min.z;
                
                // Try to determine which dimensions are width/height based on size
                // Usually the smallest dimension is the depth/thickness
                const dimensions = [
                    { axis: 'x', size: dimX },
                    { axis: 'y', size: dimY },
                    { axis: 'z', size: dimZ }
                ].sort((a, b) => b.size - a.size);
                
                // The two largest dimensions should be width and height
                const monitorWidth = dimensions[0].size;
                const monitorHeight = dimensions[1].size;
                
                // Create CSS3D object from container
                const cssObject = new CSS3DObject(iframeContainer);
                cssObject.position.copy(worldPos);
                
                const scaleX = monitorWidth / SCREEN_SIZE.w;
                const scaleY = monitorHeight / SCREEN_SIZE.h;
                cssObject.scale.set(scaleX, scaleY, 1);
                cssObject.rotateY(Math.PI / 2 + Math.PI);
                window.monitorCssObject = cssObject;
                cssObject.userData.originalScale = cssObject.scale.clone();
                cssObject.userData.originalRotation = cssObject.rotation.clone();
                cssObject.userData.originalPosition = cssObject.position.clone();
                cssObject.scale.set(0.0001, 0.0001, 0.0001);
                cssScene.add(cssObject);
                const occlusionMaterial = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    opacity: 0,
                    transparent: true,
                    blending: THREE.NoBlending
                });
                
                const occlusionGeometry = new THREE.PlaneGeometry(monitorWidth, monitorHeight);
                const occlusionMesh = new THREE.Mesh(occlusionGeometry, occlusionMaterial);
                occlusionMesh.position.copy(cssObject.position);
                occlusionMesh.rotation.copy(cssObject.rotation);
                occlusionMesh.scale.copy(cssObject.scale);
                
                // Give it the screen_monitor name so it can be clicked
                occlusionMesh.name = 'screen_monitor';
                
                // Add to raycaster objects for click detection
                raycasterObjects.push(occlusionMesh);
                
                // Add to main scene
                scene.add(occlusionMesh);
                
                // Hide original monitor mesh
                child.visible = false;
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
    
    // Get the Curve object (LinkedIn icon)
    const curve = glb.scene.getObjectByName("Curve");
    
    window.drawer = drawer;
    window.resume = resume;
    window.curve = curve;
    if (drawer) raycasterObjects.push(drawer);
    if (resume) raycasterObjects.push(resume);
    if (curve) {
        raycasterObjects.push(curve);
        console.log("Curve object (LinkedIn) added to raycaster");
    } else {
        console.log("Curve object not found");
    }

    const lamp = glb.scene.getObjectByName("lamp");
    
    if (lamp) {
        lamp.getWorldPosition(lampWorldPos);
        window.lampPosition = lampWorldPos;
    }

    precomputeIntroAnimation(glb.scene);
}, 
// Progress callback
(progress) => {
    // Loading progress tracking
},
// Error callback
(error) => {
    console.error('Error loading model:', error);
    updateLoadingStatus(`Error loading model: ${error.message}`);
});

window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (window.cssRenderer) {
        window.cssRenderer.setSize(sizes.width, sizes.height);
    }
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

        if (obj.name.includes("screen_monitor")) {
            if (!cameraAtMonitor) {
                moveCameraToMonitor();
            }
            return; 
        }

        if (cameraAtMonitor) {
            resetCameraPosition();
        }

        if (obj.name.length === 2) {
            playPianoKey(obj);
        }

        if (stringSounds[obj.name]) playString(obj);

        if (obj.name === "gmail") window.open("https://mail.google.com/mail/u/0/?fs=1&to=abhishekpxndy@gmail.com&su=Project+Inquiry&body=Hi,+I%27m+interested+in+your+work&tf=cm", "_blank");
        if (obj.name === "linkedin" || obj.name === "Curve") window.open("https://www.linkedin.com/in/abhishekpxndy/", "_blank");
        if (obj.name === "resume") downloadResume();
        if (obj.name === "top_secret_drawer") toggleDrawer();
    } else {
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

    // Hide piano hint on first interaction
    hidePianoHint();

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
let drawerAnimating = false;

function toggleDrawer() {
    // Prevent multiple clicks during animation
    if (drawerAnimating) return;
    
    const drawer = scene.getObjectByName("top_secret_drawer");
    const resume = scene.getObjectByName("resume");
    if (!drawer || !resume) return;

    drawerAnimating = true;
    const deltaX = 1.4542;
    const direction = drawerOpen ? 1 : -1;

    gsap.to(drawer.position, {
        x: drawer.position.x + direction * deltaX,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
            drawerAnimating = false;
        }
    });

    gsap.to(resume.position, {
        x: resume.position.x + direction * deltaX,
        duration: 1.5,
        ease: "power2.inOut",
    });

    drawerOpen = !drawerOpen;
}

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

        if (obj.name.includes("screen_monitor")) {
            if (!cameraAtMonitor) {
                moveCameraToMonitor();
            }
            return; 
        }

        if (cameraAtMonitor) {
            resetCameraPosition();
        }

        if (obj.name.length === 2) {
            playPianoKey(obj);
        }

        if (stringSounds[obj.name]) playString(obj);

        if (obj.name === "gmail") window.open("https://mail.google.com/mail/u/0/?fs=1&to=abhishekpxndy@gmail.com&su=Project+Inquiry&body=Hi,+I%27m+interested+in+your+work&tf=cm", "_blank");
        if (obj.name === "linkedin" || obj.name === "Curve") window.open("https://www.linkedin.com/in/abhishekpxndy/", "_blank");
        if (obj.name === "resume") downloadResume();
        if (obj.name === "top_secret_drawer") toggleDrawer();
    } else {
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

        const scaleFactor = distance / touchStartDistance;
        const newDistance = touchStartScale / scaleFactor;
        const direction = controls.object.position.clone().normalize();
        controls.object.position.copy(direction.multiplyScalar(newDistance));
    }
}, { passive: true });

const originalCameraPosition = isMobile() 
    ? new THREE.Vector3(-59.6888952595263, 18.194309680042778, -51.344101750070436)
    : new THREE.Vector3(-28.4803, 4.7067, -17.1849);
const originalCameraTarget = new THREE.Vector3(1.3847, 0.7997, -2.6258);

const monitorCameraPosition = new THREE.Vector3(0.018417625386660585, -0.34199435592278055, 0.8430914183172661);
const monitorCameraTarget = new THREE.Vector3(2.341470462179497, -0.32488327751244656, 0.8386111369363263);

function moveCameraToMonitor() {
    if (cameraAnimating || cameraAtMonitor) return;
    
    cameraAnimating = true;
    
    gsap.killTweensOf([camera.position, controls.target, bgAudio]);
    
    // Fade out UI when entering monitor view
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
        gsap.to(uiOverlay, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                // Add hidden class when fully faded out
                uiOverlay.classList.add('ui-hidden');
            }
        });
    }
    
    // Animate background music volume down in sync with camera
    if (!bgAudio.paused) {
        gsap.to(bgAudio, {
            volume: 0.01,
            duration: 1.2,
            ease: "power2.inOut"
        });
    }
    
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
            // Enable iframe interaction after camera reaches monitor
            setTimeout(() => {
                if (window.cssRenderer && cameraAtMonitor) {
                    window.cssRenderer.domElement.style.pointerEvents = 'auto';
                }
                // Enable pointer events on iframe and container
                if (window.monitorIframe) {
                    window.monitorIframe.style.pointerEvents = 'auto';
                    window.monitorIframe.focus();
                }
                if (window.monitorIframeContainer) {
                    window.monitorIframeContainer.style.pointerEvents = 'auto';
                }
            }, 100);
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
    if (cameraAnimating || !cameraAtMonitor) return;
    
    cameraAnimating = true;
    
    // Fade in UI when exiting monitor view
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
        // Remove hidden class before fading in
        uiOverlay.classList.remove('ui-hidden');
        gsap.to(uiOverlay, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.inOut"
        });
    }
    
    // Disable iframe interaction
    if (window.cssRenderer) {
        window.cssRenderer.domElement.style.pointerEvents = 'none';
    }
    // Disable pointer events on iframe and container
    if (window.monitorIframe) {
        window.monitorIframe.style.pointerEvents = 'none';
    }
    if (window.monitorIframeContainer) {
        window.monitorIframeContainer.style.pointerEvents = 'none';
    }
    
    gsap.killTweensOf([camera.position, controls.target, bgAudio]);
    
    // Animate background music volume back up in sync with camera
    if (!bgAudio.paused) {
        gsap.to(bgAudio, {
            volume: 0.2,
            duration: 1.2,
            ease: "power2.inOut"
        });
    }
    
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

let frameCount = 0;

const render = () => {
    if (contextLost) {
        return;
    }
    
    controls.update();
    
    xAxisFans.forEach((fan) => (fan.rotation.x += 0.06));
    zAxisFans.forEach((fan) => (fan.rotation.z += 0.06));

    const deltaTime = clock.getDelta();

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
        
        if (hoveredObj.name.includes("screen_monitor") ||
            hoveredObj.name.length === 2 ||
            hoveredObj.name === "gmail" ||
            hoveredObj.name === "resume" ||
            hoveredObj.name === "top_secret_drawer" ||
            hoveredObj.name === "linkedin" ||
            hoveredObj.name === "Curve") {
            hoveringClickable = true;
        }
    }

    document.body.style.cursor = hoveringClickable ? "pointer" : "default";

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
        
        let totalOpacity = 0;
        for (let i = 0; i < window.firefliesData.length; i++) {
            totalOpacity += window.firefliesData[i].getOpacity(time);
        }
        const avgOpacity = totalOpacity / window.firefliesData.length;
        window.fireflyMesh.material.opacity = avgOpacity;
    }

    // Animate steam shader
    if (window.steamMaterial) {
        const time = performance.now() * 0.001;
        window.steamMaterial.uniforms.uTime.value = time;
    }

    renderer.render(scene, camera);
    
    // Always render CSS3D scene
    if (window.cssRenderer) {
        window.cssRenderer.render(cssScene, camera);
    }
    
    frameCount++;
    
    window.animationFrameId = window.requestAnimationFrame(render);
};

render();

// Resume download function
function downloadResume() {
    try {
        // Create a fetch request to ensure the file exists and get the blob
        fetch('/textures/Resume.pdf')
            .then(response => {
                if (!response.ok) {
                    throw new Error('PDF file not found');
                }
                return response.blob();
            })
            .then(blob => {
                // Create object URL from blob
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'Abhishek_Pandey_Resume.pdf';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                // Clean up the object URL
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error downloading resume:', error);
                // Fallback to direct link
                window.open('/textures/Resume.pdf', '_blank');
            });
    } catch (error) {
        console.error('Error in downloadResume:', error);
        // Fallback to opening in new tab
        window.open('/textures/Resume.pdf', '_blank');
    }
}

// Add resume download to global scope for click handler
window.downloadResume = downloadResume;
// Debug: Add flexible LinkedIn click handler
document.addEventListener('click', (event) => {
    console.log('Click detected at:', event.clientX, event.clientY);
    
    // Check if we can access the raycaster results
    if (window.lastClickedObject) {
        console.log('Last clicked object name:', window.lastClickedObject.name);
    }
});