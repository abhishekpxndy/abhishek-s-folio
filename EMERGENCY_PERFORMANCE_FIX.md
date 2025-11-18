# Emergency Performance Fix for iPhone

## Your Current Stats:
- ✅ Draw calls: 14 (GOOD)
- ✅ Textures: 60 (OK)
- 🔴 Triangles: 312,533 (TOO HIGH - Target: <100,000)
- 🟡 Geometries: 423 (HIGH - Target: <200)

## The Problem:
**312K triangles is the main issue!** iPhones struggle with this much geometry.

## Quick Fixes (Apply in Order):

### 1. Reduce Moths to 15 (Saves ~150 geometries)
**File**: `illuminati/src/main.js` (line ~30)

Change:
```javascript
const MOTH_COUNT = isMobile() ? 30 : 120;
```

To:
```javascript
const MOTH_COUNT = isMobile() ? 15 : 120;
```

### 2. Reduce Fireflies to 8 (Saves ~7 geometries)
**File**: `illuminati/src/main.js` (line ~960)

Change:
```javascript
const fireflyCount = isMobile() ? 15 : 35;
```

To:
```javascript
const fireflyCount = isMobile() ? 8 : 35;
```

### 3. Disable Video on Mobile (Saves memory)
**File**: `illuminati/src/main.js` (line ~450)

Find:
```javascript
//  Video texture for monitor - with iOS fallback
const videoElement = document.createElement("video");
```

Replace entire video section with:
```javascript
//  Video texture for monitor - disabled on mobile to save memory
let videoElement = null;
let videoTexture = null;

if (!isMobile()) {
    // Only create video on desktop
    videoElement = document.createElement("video");
    videoElement.src = "/textures/0.0-60.0.mp4";
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', '');
    videoElement.autoplay = true;

    videoElement.addEventListener('error', (e) => {
        console.warn('Video failed to load:', e);
    });

    if (!isIOS()) {
        videoElement.play().catch((err) => {
            console.warn('Video autoplay failed:', err);
        });
    }

    videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.flipY = false;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;
} else {
    // Use static texture on mobile
    videoTexture = textureLoader.load('/textures/texture.webp');
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.flipY = false;
}
```

Then find (around line ~920):
```javascript
if (child.name.includes("screen_monitor")) {
    child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
```

Make sure it uses the videoTexture variable (should already work).

## 4. THE BIG FIX: Simplify 3D Model (MOST IMPORTANT!)

**This is the real solution** - your model has too many triangles.

### Option A: Use Blender (Recommended)
1. Download Blender (free): https://www.blender.org/
2. Open `public/models/beg-v1.glb`
3. Select all objects: Press `A`
4. Add Modifier → Decimate
5. Set Ratio to `0.3` (reduces 312K → ~94K triangles)
6. Apply modifier
7. File → Export → glTF 2.0 (.glb)
8. Replace old file

### Option B: Use Online Tool
1. Go to: https://products.aspose.app/3d/decimation
2. Upload `beg-v1.glb`
3. Set reduction to 70%
4. Download simplified model
5. Replace old file

### Option C: Disable Moths Entirely on iOS
**File**: `illuminati/src/main.js` (line ~30)

Change:
```javascript
const MOTH_COUNT = isMobile() ? 15 : 120;
```

To:
```javascript
const MOTH_COUNT = isIOS() ? 0 : (isMobile() ? 15 : 120);
```

This removes all moths on iPhone (saves ~300 geometries).

## Expected Results After All Fixes:

### After Quick Fixes (1-3):
- Geometries: 423 → ~250
- Memory usage: -30%
- Still might crash on older iPhones

### After Model Simplification (Fix 4):
- Triangles: 312K → ~94K
- Geometries: 423 → ~250
- Memory usage: -60%
- **Should work on most iPhones!** ✅

## Test After Each Fix:
1. `npm run build`
2. Deploy to Vercel
3. Test on iPhone
4. Check console for new performance stats

## Priority Order:
1. **Fix 4 (Simplify Model)** - Biggest impact
2. **Fix 1 (Reduce Moths)** - Quick win
3. **Fix 3 (Disable Video)** - Memory saver
4. **Fix 2 (Reduce Fireflies)** - Minor help

## If Still Crashing After All Fixes:
- Disable moths entirely on iOS (Option C)
- Reduce texture sizes
- Remove non-essential objects from 3D model
