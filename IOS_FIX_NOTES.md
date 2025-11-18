# iOS Compatibility Fixes Applied

## Changes Made

### 1. Performance Optimizations
- **Reduced moth count**: 120 → 30 on mobile devices
- **Reduced firefly count**: 35 → 15 on mobile devices
- **Limited pixel ratio**: Max 1.5 on iOS (was 2)
- **Disabled antialiasing** on mobile for better performance
- **Frame rate throttling**: Limited to 30 FPS on iOS
- **Disabled alpha and stencil buffers** for better performance

### 2. Video Texture Fixes
- Added `playsinline` and `webkit-playsinline` attributes (required for iOS)
- Added error handling for video loading failures
- Video now plays on user tap interaction (iOS requirement)
- Disabled autoplay on iOS initially

### 3. Audio Improvements
- Better error handling for audio playback failures
- Video playback triggered on tap (iOS requires user interaction)
- Graceful fallback when audio fails

### 4. Touch Event Handling
- Added flag to prevent double-triggering of tap events
- Improved touch event coordination
- Better passive event handling

### 5. Global Error Handling
- Added global error handler to catch uncaught errors
- Added unhandled promise rejection handler
- Prevents iOS from showing error pages

### 6. HTML Meta Tags
- Added `maximum-scale=1.0, user-scalable=no` to prevent zoom issues
- Added `viewport-fit=cover` for notch support
- Added `apple-mobile-web-app-capable` for better PWA support

### 7. CSS Improvements
- Fixed body overflow to prevent scrolling
- Added `-webkit-tap-highlight-color: transparent`
- Added `touch-action` properties for better touch handling
- Prevented text selection and callouts

## Testing Recommendations

1. **Clear Safari cache** on iPhone before testing
2. **Test in both Safari and Chrome** on iOS
3. **Check Console logs** in Safari Web Inspector (Settings > Safari > Advanced > Web Inspector)
4. **Monitor memory usage** - iOS has strict memory limits

## Additional Optimizations to Consider

If issues persist, consider:

1. **Lazy load assets**: Load textures/models progressively
2. **Reduce texture sizes**: Compress images more aggressively
3. **Simplify 3D models**: Reduce polygon count
4. **Remove video texture**: Replace with static image on mobile
5. **Disable shadows**: If you add them later
6. **Use lower quality audio**: Compress audio files more

## Deployment Checklist

Before deploying to Vercel:
- [ ] Build the project: `npm run build`
- [ ] Test the production build locally: `npm run preview`
- [ ] Check bundle size in `dist` folder
- [ ] Verify all assets are in `public` folder
- [ ] Test on actual iPhone device (not just simulator)

## Common iOS Issues

1. **"A problem repeatedly occurred"** - Usually memory or WebGL context loss
2. **Black screen** - Check console for WebGL errors
3. **No audio** - iOS requires user interaction before playing audio
4. **Slow performance** - Reduce particle counts and effects
5. **Touch not working** - Check z-index and pointer-events

## Vercel Configuration

Make sure your `vercel.json` (if exists) has proper headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Audio Synthesizer Update (NEW!)

**Replaced 36 MP3 files with Web Audio API synthesizer**

- **Before**: 1.09 MB of piano MP3 files
- **After**: 5 KB of JavaScript code
- **Savings**: 99% reduction in audio assets!

Benefits:
- Faster loading on iPhone
- Lower memory usage (fewer crashes)
- Instant playback (no buffering)
- Better iOS compatibility

See `AUDIO_SYNTH_GUIDE.md` for details.

To delete old MP3 files:
- Run `cleanup-old-audio.bat` (Windows)
- Or manually delete: `public/textures/sounds/AUD-*.mp3`

## Next Steps

1. Rebuild: `npm run build`
2. (Optional) Delete old MP3 files: Run `cleanup-old-audio.bat`
3. Deploy to Vercel
4. Test on iPhone
5. Monitor performance using Safari Web Inspector
6. If issues persist, reduce moth count further or disable video texture
