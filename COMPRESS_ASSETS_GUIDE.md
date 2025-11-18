# Asset Compression Guide

## Current Asset Sizes

### Textures (Total: ~7.7 MB)
- texture (8).webp: 2,390 KB ⚠️ LARGEST
- texture (2).webp: 1,234 KB
- texture (7).webp: 1,077 KB
- texture (6).webp: 773 KB
- texture (5).webp: 448 KB
- texture (1).webp: 422 KB
- cpufans.webp: 405 KB
- texture.webp: 355 KB
- texture (3).webp: 313 KB
- texture (4).webp: 262 KB
- Rectangle 1.webp: 0.74 KB

### Audio (Total: ~1.6 MB)
- limbo_2021.mp3: 1,156 KB ⚠️ LARGEST
- videoplayback_IJdyFWt1.mp3: 431 KB
- strums.mp3: 46 KB

## Compression Methods

### Option 1: Automated Script (Recommended)

Run the compression script:

```bash
cd illuminati
node compress-assets.js
```

This will:
- Resize textures to max 1024x1024
- Compress WebP to 80% quality
- Compress audio to 96kbps
- Backup originals to `originals/` folders

### Option 2: Online Tools (Easy)

#### For Textures:
1. Go to https://squoosh.app/
2. Upload each texture
3. Settings:
   - Format: WebP
   - Quality: 75-80
   - Resize: Max 1024px
4. Download and replace

#### For Audio:
1. Go to https://www.freeconvert.com/mp3-compressor
2. Upload MP3 files
3. Set bitrate to 96 kbps
4. Download and replace

### Option 3: Manual Tools

#### Textures (Using ImageMagick):
```bash
# Install ImageMagick first
# Then run for each texture:
magick texture.webp -resize 1024x1024 -quality 80 texture-compressed.webp
```

#### Audio (Using FFmpeg):
```bash
# Install FFmpeg first
# Then run for each audio file:
ffmpeg -i limbo_2021.mp3 -b:a 96k limbo_2021-compressed.mp3
```

## Expected Results

### Textures:
- **Before**: ~7.7 MB
- **After**: ~2-3 MB
- **Savings**: 60-70%

### Audio:
- **Before**: ~1.6 MB
- **After**: ~0.5 MB
- **Savings**: 70%

### Total:
- **Before**: ~9.3 MB
- **After**: ~2.5-3.5 MB
- **Savings**: 60-70%

## Priority Files to Compress

### High Priority (Biggest Impact):
1. ✅ texture (8).webp - 2.4 MB → ~600 KB
2. ✅ texture (2).webp - 1.2 MB → ~300 KB
3. ✅ limbo_2021.mp3 - 1.2 MB → ~300 KB
4. ✅ texture (7).webp - 1.1 MB → ~270 KB

### Medium Priority:
5. texture (6).webp - 773 KB → ~200 KB
6. videoplayback_IJdyFWt1.mp3 - 431 KB → ~100 KB
7. texture (5).webp - 448 KB → ~110 KB

### Low Priority (Already Small):
- texture (1-4).webp
- cpufans.webp
- strums.mp3

## Quick Win: Compress Top 4 Files

Just compressing the 4 largest files will save ~4.5 MB!

### Steps:
1. Open https://squoosh.app/
2. Upload texture (8).webp
3. Set: WebP, Quality 75, Resize to 1024px
4. Download and replace
5. Repeat for texture (2).webp, texture (7).webp
6. For limbo_2021.mp3, use https://www.freeconvert.com/mp3-compressor
7. Set bitrate to 96 kbps
8. Download and replace

## After Compression

### Test:
1. Run `npm run build`
2. Check bundle size
3. Test on phone
4. Verify quality is acceptable

### Backup:
- Original files will be in `public/textures/originals/`
- Keep them in case you need to revert

## Notes

- WebP at 75-80% quality is visually identical to 100%
- Audio at 96 kbps is good enough for background music
- Smaller assets = faster loading = less GPU memory = fewer crashes
- This is the easiest way to reduce WebGL context loss!
