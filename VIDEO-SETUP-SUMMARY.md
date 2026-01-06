# Video Setup Summary

This portfolio site uses videos in two places:

## 1. Navigation Video Thumbnails (Home Page)
**Location**: Three navigation cards on the home page (Film, Art, Design)

**Status**: ✅ ACTIVE - Videos play on hover

**How it works**:
- Videos are paused by default
- On hover: video plays and loops
- On mouse leave: video pauses and resets to first frame
- Maintains cinematic zoom and depth effects

**Your video files**:
- `/public/film-thumbnail.mp4`
- `/public/art-thumbnail.mp4`
- `/public/design-thumbnail.mp4`

**Documentation**: See `/VIDEO-THUMBNAILS-SETUP.md`

---

## 2. Background Media
**Location**: Fixed background behind all site content

**Status**: 🖼️ PHOTO (not video)

**Current setup**:
- Static background photo
- Grayscale filter applied
- White overlay for text legibility
- Remains fixed while content scrolls

**To change background photo**:
Edit `/src/app/App.tsx` and update the `backgroundImage` URL

**Documentation**: See `/BACKGROUND-VIDEO-SETUP.md` (if you want to switch to video)

---

## Quick Start

1. **Add your three navigation videos** to the `/public` folder:
   - `film-thumbnail.mp4`
   - `art-thumbnail.mp4`
   - `design-thumbnail.mp4`

2. **(Optional) Change background photo** in `/src/app/App.tsx`

3. **Test** by hovering over the navigation cards on the home page

---

## File Recommendations

**Navigation Videos** (hover-to-play):
- Format: MP4 (H.264)
- Resolution: 1080x1350 (4:5 aspect ratio)
- Duration: 5-10 seconds
- File size: 3-5MB each
- Style: Representative of each section

**Background Photo**:
- Format: JPG or PNG
- Resolution: 1920x1080 or higher
- Style: Minimal, atmospheric
- Works best: Low contrast, simple composition

---

## Need More Details?

- Navigation videos → `/VIDEO-THUMBNAILS-SETUP.md`
- Background setup → `/BACKGROUND-VIDEO-SETUP.md`
