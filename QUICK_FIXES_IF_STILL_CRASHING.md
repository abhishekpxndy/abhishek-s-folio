# Quick Fixes If iPhone Still Crashes

## Test First
1. Deploy current build to Vercel
2. Test on iPhone
3. Check Safari console (Settings > Safari > Advanced > Web Inspector)
4. Look for performance stats in console every 5 seconds

## If Still Crashing, Apply These Fixes in Order:

### Fix 1: Reduce Moths to 15 (Easy)
**File**: `illuminati/src/main.js` (line ~30)

Change:
```javascript
const MOTH_COUNT = isMobile() ? 30 : 120;
```

To:
```javascript
const MOTH_COUNT = isMobile() ? 15 : 120;
```

### Fix 2: Reduce Fireflies to 10 (Easy)
**File**: `illuminati/src/main.js` (line ~960)

Change:
```javascript
const fireflyCount = isMobile() ? 15 : 35;
```

To:
```javascript
const fireflyCount = isMobile() ? 10 : 35;
```

### Fix 3: Disable Video on Mobile (Medium)
**File**: `illuminati/src/main.js` (line ~450)

Change:
```javascript
//  Video texture for monitor - with iOS fallback
const videoElement = document.createElement("video");
videoElement.src = "/textures/0.0-60.0.mp4";
// ... rest of video code
```

To:
```javascript
//  Video texture for monitor - disabled on mobile
let videoElement = null;
let videoTexture = null;

if (!isMobile()) {
    videoElement = document.createElement("video");
    videoElement.src = "/textures/0.0-60.0.mp4";
    // ... rest of video code
    
    videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.flipY = false;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;
} else {
    // Use static texture on mobile instead
    videoTexture = textureLoader.load('/textures/texture.webp');
}
```

### Fix 4: Disable Moths Entirely on iOS (Nuclear Option)
**File**: `illuminati/src/main.js` (line ~30)

Change:
```javascript
const MOTH_COUNT = isMobile() ? 15 : 120;
```

To:
```javascript
const MOTH_COUNT = isIOS() ? 0 : (isMobile() ? 15 : 120);
```

### Fix 5: Simplify 3D Model (Requires Blender)

1. Open `public/models/beg-v1.glb` in Blender
2. Select all piano keys (Shift+Click)
3. Add Modifier > Decimate
4. Set Ratio to 0.5 (reduces polygons by 50%)
5. Apply modifier
6. File > Export > glTF 2.0
7. Replace old file

## Performance Targets

### Good Performance:
- Draw calls: < 50
- Triangles: < 100,000
- FPS: 30+ on mobile

### Check in Console:
Every 5 seconds you'll see:
```
📊 Performance Stats:
Draw calls: 45
Triangles: 85000
Geometries: 120
Textures: 25
```

## Piano Keys - To Merge or Not?

### DON'T Merge If:
- You want individual key press animations ✅
- You want color changes on hover ✅
- You want individual click detection ✅

### DO Merge If:
- Performance is critical
- You're okay with losing individual animations
- Draw calls are > 100

### How to Merge (Advanced):
This requires modifying your 3D model in Blender:
1. Select all white keys
2. Ctrl+J (Join)
3. Select all black keys
4. Ctrl+J (Join)
5. Export

**Note**: You'll lose individual key interactions!

## My Recommendation

**Try fixes in this order:**
1. ✅ Current optimizations (already done)
2. Test on iPhone
3. If crashes: Reduce moths to 15 (Fix 1)
4. If still crashes: Disable video on mobile (Fix 3)
5. If still crashes: Disable moths on iOS (Fix 4)
6. Last resort: Simplify 3D model (Fix 5)

**Don't merge piano keys** - you'll lose the interactive experience!

## Alternative: Progressive Loading

Load heavy objects only after initial scene loads:
1. Load basic scene first
2. Add moths after 2 seconds
3. Add fireflies after 3 seconds
4. Start video after 4 seconds

This prevents initial memory spike.
