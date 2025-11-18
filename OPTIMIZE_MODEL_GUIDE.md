# How to Optimize Your 3D Model

## Method 1: Using the Script (Recommended)

### Install Dependencies:
```bash
npm install @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions
```

### Run the Script:
```bash
node optimize-model.js
```

### What It Does:
- Welds duplicate vertices
- Removes duplicate data
- Reduces triangles by 70% (278K → ~83K)
- Saves as `beg-v1-optimized.glb`

### Test & Replace:
1. Test the optimized model in your app
2. If it looks good, replace the original:
   ```bash
   copy public\models\beg-v1-optimized.glb public\models\beg-v1.glb
   ```

## Method 2: Online Tools

### Try These Working Sites:

1. **glTF Report** (Best)
   - https://gltf.report/
   - Upload GLB → Script tab → Run simplification

2. **Meshoptimizer Demo**
   - https://meshoptimizer.org/demo/
   - Upload → Adjust slider → Download

3. **Three.js Editor**
   - https://threejs.org/editor/
   - Import → Export (sometimes optimizes)

## Method 3: Blender (Most Control)

If you have Blender installed:

1. Open Blender
2. File → Import → glTF 2.0 → Select `beg-v1.glb`
3. Press `A` to select all
4. Add Modifier → Decimate
5. Set Ratio to `0.3`
6. Apply modifier
7. File → Export → glTF 2.0
8. Replace old file

## Expected Results:

### Before:
- Triangles: 278,533
- File size: ~XX MB
- Mobile: Crashes

### After:
- Triangles: ~83,000
- File size: ~XX MB (smaller)
- Mobile: Should work!

## Troubleshooting:

### Script fails?
Make sure you're in the `illuminati` folder:
```bash
cd illuminati
npm install @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions
node optimize-model.js
```

### Model looks broken?
Try a higher ratio (0.4 or 0.5 instead of 0.3)

### Still too many triangles?
Try ratio 0.2 (keeps only 20%)

## Quick Test:

After optimization, check the stats in console:
```
📊 Performance Stats:
Triangles: 83000 (was 278533) ✅
```

Target: <100,000 triangles for mobile
