# Background Video Setup Instructions

> **NOTE**: The site currently uses a **static background photo** instead of a video. This documentation is preserved for reference if you want to switch back to a video background in the future.

## Current Background Setup

The portfolio site uses a **fixed background photo** with:
- Grayscale filter (100%)
- Brightness enhancement (1.15)
- White overlay (88% opacity) for text legibility
- Paper texture overlay for editorial feel
- Background remains fixed while content scrolls over it

**To change the background photo**, update the `backgroundImage` URL in `/src/app/App.tsx`:
```tsx
<div 
  className="w-full h-full bg-cover bg-center"
  style={{
    backgroundImage: 'url("YOUR-IMAGE-URL-HERE")',
    filter: 'grayscale(100%) brightness(1.15)',
  }}
></div>
```

---

## Alternative: Background Video Setup

If you prefer to use a background video instead of a photo, follow these instructions:

### 1. Video File Preparation

**Recommended Specifications:**
- **Format**: MP4 (H.264 codec for best browser compatibility)
- **Resolution**: 1920x1080 (Full HD) minimum, 4K optional
- **Aspect Ratio**: 16:9
- **Frame Rate**: 24fps or 30fps
- **Duration**: 10-30 seconds (it will loop continuously)
- **File Size**: Keep under 10MB for optimal loading
- **Style**: Atmospheric, minimal, slow-moving imagery

**Content Suggestions:**
- Slow camera movements or pans
- Subtle light changes
- Minimal visual complexity
- Black and white or desaturated footage
- Abstract textures or patterns
- Natural movement (water, clouds, fabric)

### 2. File Placement

Place your video file in the `/public` directory with the name:
```
/public/background-video.mp4
```

Or update the video source path in `/src/app/App.tsx`:
```tsx
<source src="/your-video-filename.mp4" type="video/mp4" />
```

### 3. Current Video Settings

The video is configured with the following properties:
- **autoPlay**: Starts playing automatically when the page loads
- **loop**: Continuously loops
- **muted**: Plays without sound (required for autoplay)
- **playsInline**: Plays inline on mobile devices (no fullscreen)

**Visual Effects Applied:**
- Grayscale filter (100%)
- Brightness adjustment (1.1 for slight enhancement)
- White overlay at 85% opacity for text legibility
- Subtle blur effect for depth

### 4. Customizing the Overlay

To adjust text legibility over your video, modify the overlay in `/src/app/App.tsx`:

**Current overlay (white-toned):**
```tsx
<div 
  className="absolute inset-0 bg-white/85"
  style={{
    backdropFilter: 'blur(0.5px)',
  }}
></div>
```

**For darker videos, use:**
```tsx
<div 
  className="absolute inset-0 bg-white/90"
  style={{
    backdropFilter: 'blur(0.5px)',
  }}
></div>
```

**For lighter videos, use:**
```tsx
<div 
  className="absolute inset-0 bg-white/80"
  style={{
    backdropFilter: 'blur(0.5px)',
  }}
></div>
```

### 5. Testing

After adding your video:
1. Refresh the page
2. Verify the video loads and loops smoothly
3. Check text legibility across all pages
4. Test on mobile devices (video should remain fixed)
5. Verify scroll performance

### 6. Fallback Behavior

If the video fails to load:
- The white background with paper texture will display instead
- All text remains fully legible
- No functionality is lost

## Advanced Customization

### Adjusting Video Filters

In `/src/app/App.tsx`, modify the video style:

```tsx
style={{
  filter: 'grayscale(100%) brightness(1.1) contrast(1.05)',
}}
```

**Available filters:**
- `grayscale(0-100%)` - Amount of desaturation
- `brightness(0-2)` - Brightness level (1 = normal)
- `contrast(0-2)` - Contrast level (1 = normal)
- `blur(0-10px)` - Blur amount
- `opacity(0-1)` - Overall opacity

### Multiple Video Formats

For better browser compatibility, add multiple sources:

```tsx
<video autoPlay loop muted playsInline className="...">
  <source src="/background-video.webm" type="video/webm" />
  <source src="/background-video.mp4" type="video/mp4" />
</video>
```

## Technical Notes

- Video stays fixed using `position: fixed` on the container
- All content sits in a scrollable layer above (z-index: 10)
- The video container is at z-index: 0
- Performance is optimized with `object-cover` for proper scaling
- Mobile devices handle video backgrounds efficiently with `playsInline`

## Need Help?

If you encounter issues:
1. Check browser console for loading errors
2. Verify file path and format
3. Test with a smaller video file first
4. Ensure video codec is H.264 (MP4)
5. Check that autoplay policies are met (muted + user interaction)