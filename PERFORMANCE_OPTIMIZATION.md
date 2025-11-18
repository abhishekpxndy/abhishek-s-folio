# Performance Optimization Guide

## Current Issues

Your scene has many individual objects:
- ~36 piano keys (separate meshes)
- ~120 moths (30 on mobile)
- ~35 fireflies (15 on mobile)
- Fans, furniture, etc.

Each object = 1 draw call = performance hit on mobile/iPhone

## Optimization Strategies

### 1. ✅ Already Done
- Reduced moths: 120 → 30 on mobile
- Reduced fireflies: 35 → 15 on mobile
- Removed 36 MP3 files (1.09 MB saved)
- Limited pixel ratio on iOS
- Frame rate throttling (30 FPS on iOS)

### 2. 🎹 Piano Keys Optimization (Recommended)

**Problem**: 36 separate piano key meshes = 36 draw calls

**Solution A: Keep Separate (Current)**
- Pros: Easy to implement, individual control
- Cons: 36 draw calls

**Solution B: Merge by Material**
- Merge all white keys into 1 mesh
- Merge all black keys into 1 mesh
- Pros: Only 2 draw calls
- Cons: Can't animate individual keys (no press effect)

**Solution C: InstancedMesh (Best)**
- Use THREE.InstancedMesh for keys
- Pros: 1-2 draw calls, can still control individual keys
- Cons: More complex implementation

**Solution D: Simplify in Blender**
- Reduce polygon count of each key
- Pros: Easy, keeps all functionality
- Cons: Requires 3D model editing

### 3. 🦋 Moth Optimization

**Current**: 30 individual Moth objects on mobile

**Options**:
- Reduce to 15-20 moths on mobile
- Use simpler geometry (fewer polygons)
- Disable moths entirely on low-end devices

### 4. 💡 Firefly Optimization

**Current**: Using Points geometry (already optimized)

**Options**:
- Reduce count further (15 → 10 on mobile)
- Disable on very low-end devices

### 5. 🎥 Video Texture

**Current**: Video playing on monitor

**Options**:
- Use static image on mobile instead of video
- Lower video resolution
- Disable video on iOS if causing issues

## Quick Wins (No Code Changes)

### In Your 3D Model (Blender):
1. **Decimate piano keys**: Reduce polygons by 50%
2. **Merge non-interactive objects**: Walls, floor, desk
3. **Optimize textures**: Use smaller images (1024x1024 max)
4. **Remove hidden geometry**: Delete faces inside objects

### In Your Textures:
1. **Compress images**: Use tools like TinyPNG
2. **Use WebP format**: Smaller than PNG/JPG
3. **Reduce resolution**: 2048x2048 → 1024x1024

## Recommended Action Plan

### Phase 1: Easy Wins (Do Now)
1. ✅ Already reduced moths/fireflies
2. ✅ Already removed MP3 files
3. Test on iPhone - if still crashing, proceed to Phase 2

### Phase 2: Model Optimization (If Needed)
1. Open `beg-v1.glb` in Blender
2. Select all piano keys
3. Apply Decimate modifier (ratio: 0.5)
4. Export as new GLB
5. Test performance

### Phase 3: Advanced (If Still Needed)
1. Implement InstancedMesh for piano keys
2. Disable video on mobile
3. Further reduce particle counts

## How to Test Performance

### In Browser Console:
```javascript
// Check draw calls
console.log(renderer.info.render.calls);

// Check triangles
console.log(renderer.info.render.triangles);

// Check memory
console.log(renderer.info.memory);
```

### Target Numbers:
- **Draw calls**: < 50 (lower is better)
- **Triangles**: < 100,000 on mobile
- **Memory**: < 100 MB on mobile

## Current Optimizations Applied

✅ Moth count: 30 on mobile (was 120)
✅ Firefly count: 15 on mobile (was 35)
✅ Audio files: Removed 1.09 MB
✅ Pixel ratio: Limited to 1.5 on iOS
✅ Frame rate: 30 FPS on iOS
✅ Antialiasing: Disabled on mobile
✅ Code splitting: Separate chunks for three.js and gsap

## Next Steps

1. **Test current build on iPhone**
2. **Check Safari console for errors**
3. **If still crashing**:
   - Reduce moths to 15
   - Disable video on mobile
   - Simplify 3D model in Blender

## Code to Reduce Moths Further

If needed, change this line in `main.js`:
```javascript
const MOTH_COUNT = isMobile() ? 15 : 120; // Reduce to 15
```

## Code to Disable Video on Mobile

If needed, add this in `main.js`:
```javascript
if (!isMobile()) {
    // Only load video on desktop
    const videoElement = document.createElement("video");
    // ... rest of video code
}
```
