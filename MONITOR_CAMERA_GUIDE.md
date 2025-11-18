# Monitor Camera Animation Guide

## What It Does

When you hover your mouse over the **screen_monitor**, the camera smoothly moves to position itself right in front of the monitor. When you move away, it returns to the original position.

## How It Works

1. **Hover Detection**: Raycaster detects when mouse is over `screen_monitor`
2. **Camera Movement**: GSAP animates camera to monitor position
3. **Reset**: Camera returns to original position when mouse leaves

## Adjusting Camera Position

If the camera is too close, too far, or at the wrong angle, edit these values in `main.js`:

### Find this line (around line 1205):
```javascript
const offset = new THREE.Vector3(0, 0.3, 1.5); // Slightly above and in front
```

### Adjust the offset:
- **X axis**: Left (-) / Right (+)
- **Y axis**: Down (-) / Up (+)
- **Z axis**: Closer (-) / Further (+)

### Examples:

**Move camera further back:**
```javascript
const offset = new THREE.Vector3(0, 0.3, 2.5); // Further away
```

**Move camera lower:**
```javascript
const offset = new THREE.Vector3(0, 0, 1.5); // Eye level
```

**Move camera to the right:**
```javascript
const offset = new THREE.Vector3(0.5, 0.3, 1.5); // Slightly right
```

**Perfect front view:**
```javascript
const offset = new THREE.Vector3(0, 0.2, 1.2); // Close and centered
```

## Animation Speed

To make the camera move faster or slower:

### Find these lines (around line 1213 and 1223):
```javascript
duration: 1.2,  // 1.2 seconds
```

**Faster:**
```javascript
duration: 0.8,  // 0.8 seconds
```

**Slower:**
```javascript
duration: 2.0,  // 2 seconds
```

## Disable on Mobile

If you want to disable this feature on mobile devices (to avoid conflicts with touch controls):

### Add this check at the start of `moveCameraToMonitor()`:
```javascript
function moveCameraToMonitor() {
    if (isMobile()) return; // Skip on mobile
    if (!window.screenMonitor) return;
    // ... rest of code
}
```

## Testing

1. **Build**: `npm run build`
2. **Preview**: `npm run preview`
3. **Hover over monitor** - camera should move smoothly
4. **Move mouse away** - camera should return to original position
5. **Check console** - should see:
   - "📺 Moving camera to monitor"
   - "🔙 Resetting camera position"

## Troubleshooting

### Camera moves to wrong position
- Adjust the `offset` values (see above)
- Check monitor's actual position in your 3D model

### Camera doesn't move
- Check console for errors
- Verify `screen_monitor` object exists
- Make sure you've clicked "Tap to Enter" first

### Camera movement is jerky
- Increase `duration` value
- Change `ease` to `"power1.inOut"` for smoother motion

### Camera gets stuck
- Check if GSAP animations are conflicting
- Try adding `gsap.killTweensOf([camera.position, controls.target])` before new animation

## Advanced: Custom Camera Path

For a more cinematic approach, you can add waypoints:

```javascript
function moveCameraToMonitor() {
    if (!window.screenMonitor) return;
    
    const monitorPos = new THREE.Vector3();
    window.screenMonitor.getWorldPosition(monitorPos);
    
    // Create a timeline with multiple steps
    const tl = gsap.timeline();
    
    // Step 1: Move up
    tl.to(camera.position, {
        y: camera.position.y + 2,
        duration: 0.6,
        ease: "power2.in"
    });
    
    // Step 2: Move to monitor
    tl.to(camera.position, {
        x: monitorPos.x,
        y: monitorPos.y + 0.3,
        z: monitorPos.z + 1.5,
        duration: 0.8,
        ease: "power2.out"
    });
    
    // Look at monitor
    tl.to(controls.target, {
        x: monitorPos.x,
        y: monitorPos.y,
        z: monitorPos.z,
        duration: 0.6,
        ease: "power2.inOut"
    }, "-=0.6"); // Start 0.6s before previous animation ends
}
```

## Tips

- Keep `duration` between 0.8 - 2.0 seconds for best UX
- Use `"power2.inOut"` for smooth, natural motion
- Test on both desktop and mobile
- Consider adding a slight delay before triggering (debounce)
