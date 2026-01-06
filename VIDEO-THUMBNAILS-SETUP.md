# Video Thumbnails Setup Instructions

## Overview
The portfolio home page uses three video thumbnails for navigation (Film, Art, Design) that play on hover. This creates an engaging, cinematic preview of each section while maintaining the editorial aesthetic.

## Adding Your Video Thumbnails

### 1. Video File Preparation

**Recommended Specifications:**
- **Format**: MP4 (H.264 codec for best browser compatibility)
- **Resolution**: 1080x1350 (4:5 aspect ratio to match the card layout)
- **Frame Rate**: 24fps or 30fps
- **Duration**: 5-10 seconds (it will loop continuously on hover)
- **File Size**: Keep each under 3-5MB for optimal loading
- **Style**: High contrast, visually engaging, representative of the section

**Content Suggestions:**
- **Film**: Cinematic footage, camera movements, film stills montage
- **Art**: Close-ups of artwork, charcoal strokes, drawing process
- **Design**: Typography animations, grid systems, design process

### 2. File Placement

Place your three video files in the `/public` directory:
```
/public/film-thumbnail.mp4
/public/art-thumbnail.mp4
/public/design-thumbnail.mp4
```

Or update the video source paths in `/src/app/components/HomePage.tsx`:
```tsx
const navigationVideos = [
  {
    id: 'film',
    videoSrc: '/your-film-video.mp4', // Update this path
    label: 'Film',
    description: 'Moving image & cinematic storytelling',
    path: '/films'
  },
  // ... etc
];
```

### 3. Video Behavior

**Default State:**
- Videos are paused and muted by default
- Shows the first frame of the video

**On Hover:**
- Video begins playing automatically
- Loops continuously while cursor is hovering
- Smooth zoom animation activates (1.15x scale)
- Card lifts slightly (4px translateY)

**On Mouse Leave:**
- Video pauses immediately
- Resets to first frame (currentTime = 0)
- Returns to default state

### 4. Current Video Settings

The videos are configured with these properties:
- **muted**: Always muted (no sound)
- **loop**: Continuously loops during hover
- **playsInline**: Plays inline on mobile devices
- **grayscale**: Converts to black and white (CSS filter)

### 5. Visual Effects Applied

**Video Filters:**
- Grayscale: 100% (matches site aesthetic)
- Object-fit: cover (fills container while maintaining aspect ratio)

**Container Effects:**
- Mounted appearance with soft shadows
- Smooth hover lift (translateY -4px)
- Cinematic zoom on video content (scale 1.15)
- All transitions use editorial easing: [0.16, 1, 0.3, 1]

### 6. Text Overlays

**Title (e.g., "FILM"):**
- Always visible on top of video
- Large editorial heading (text-5xl)
- White text with heavy drop shadow for readability
- Slight lift animation on hover (-5px)

**Description:**
- Fades in on hover
- Smaller text with tracking
- Strong drop shadow for legibility during playback

### 7. Testing Checklist

After adding your videos:
- [ ] Verify videos load on page refresh
- [ ] Test hover to play functionality
- [ ] Confirm videos reset to first frame on mouse leave
- [ ] Check text remains readable during playback
- [ ] Test on mobile devices (tap to navigate)
- [ ] Verify performance (smooth playback, no lag)
- [ ] Check all three videos work independently

### 8. Fallback Behavior

If a video fails to load:
- The video element will display a blank/black frame
- Navigation still functions (click to go to section)
- Text overlays remain visible and functional

## Advanced Customization

### Adjusting Hover Zoom Speed

In `/src/app/components/HomePage.tsx`, find the video motion component:

```tsx
<motion.video
  // ... other props
  initial={{ scale: 1 }}
  whileHover={{ scale: 1.15 }}
  transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
/>
```

- Change `scale: 1.15` for more/less zoom (1.0 = no zoom, 1.2 = more zoom)
- Change `duration: 2.0` for faster/slower zoom (lower = faster)

### Removing Grayscale Filter

To show videos in color:
1. Remove `grayscale` class from the video element
2. Adjust text shadows if needed for readability

### Custom Aspect Ratios

The cards use `aspect-[4/5]` (portrait orientation):
- Change to `aspect-square` for 1:1
- Change to `aspect-[16/9]` for landscape
- Ensure your videos match the chosen aspect ratio

### Video Preloading

To improve performance, add preload attribute:

```tsx
<motion.video
  ref={videoRef}
  src={item.videoSrc}
  preload="metadata" // Options: "none", "metadata", "auto"
  // ... other props
/>
```

- `"none"`: No preloading (best for slow connections)
- `"metadata"`: Preloads first frame and duration
- `"auto"`: Preloads entire video (best user experience, more bandwidth)

## Technical Notes

- Videos play using HTML5 `<video>` element
- Hover detection uses React `onMouseEnter` and `onMouseLeave` events
- Video control via `useRef` hook for direct DOM manipulation
- All animations use Motion library for smooth transitions
- Mobile users can tap to navigate (no hover state on mobile)

## File Size Optimization

To reduce video file sizes:
1. Use H.264 codec with medium compression
2. Reduce resolution if needed (720p often sufficient)
3. Use tools like HandBrake or FFmpeg for optimization
4. Consider WebM format as additional source for better compression

Example FFmpeg command for optimization:
```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -vf scale=1080:1350 output.mp4
```

## Performance Considerations

- Three videos loading simultaneously (3-15MB total)
- Videos only play on hover (reduces CPU/battery usage)
- Grayscale filter is GPU-accelerated
- Consider lazy loading for slower connections

## Need Help?

Common issues:
- **Video doesn't play on hover**: Check file path and format (must be MP4)
- **Video is choppy**: Reduce file size or resolution
- **First frame is black**: Export video with proper keyframes
- **Text not readable**: Increase drop-shadow or adjust video brightness
