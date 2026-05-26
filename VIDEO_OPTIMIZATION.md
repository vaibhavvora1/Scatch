# 🎬 Video Optimization Guide for Scatch Shop Page

## Problem Identified
Your shop page hero video (`/media/scatch-hero.mp4`) is very large in file size, causing slow page loads and poor user experience.

---

## ✅ What I've Fixed

### 1. **CSS Styling & Sizing Constraints** 
- Added proper container sizing (360px height on desktop, responsive on mobile)
- Applied `object-fit: cover` for proper scaling
- Added responsive breakpoints for tablets (280px) and mobile (220px)
- This prevents the video from expanding beyond necessary dimensions

### 2. **HTML5 Video Optimization**
- Changed from `src` attribute to `<source>` tags (supports fallbacks)
- Added `preload="metadata"` - loads only metadata, not full video
- Improved browser compatibility with proper MIME type

### 3. **Responsive Design**
- Desktop: 360px height
- Tablet (768px): 280px height  
- Mobile (640px): 220px height
- Reduces bandwidth usage on smaller devices

---

## 🎯 CRITICAL: Video Compression (Must Do)

Your video file is likely **5-20MB**. After compression, it can be **1-3MB**.

### Option 1: High-Quality MP4 (Recommended for 1st time)
```bash
ffmpeg -i scatch-hero.mp4 -c:v libx265 -crf 28 -preset fast \
  -c:a aac -b:a 128k scatch-hero-compressed.mp4
```
**Result:** ~50% size reduction | Quality: Excellent

### Option 2: Super-Compressed for Mobile
```bash
ffmpeg -i scatch-hero.mp4 -c:v libx264 -crf 35 -preset veryfast \
  -c:a aac -b:a 96k scatch-hero-mobile.mp4
```
**Result:** ~75% size reduction | Quality: Good

### Option 3: WebM Format (Best Compression)
```bash
ffmpeg -i scatch-hero.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 \
  -c:a libopus -b:a 128k scatch-hero.webm
```
**Result:** ~70% size reduction | Quality: Great (modern browsers only)

---

## 📋 Implementation Steps

### Step 1: Install FFmpeg
**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# OR download from: https://ffmpeg.org/download.html
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### Step 2: Compress Your Video
Copy one command from above and run it in your terminal.

### Step 3: Replace Original
```bash
# Backup original
mv /media/scatch-hero.mp4 /media/scatch-hero.mp4.backup

# Use compressed version
mv scatch-hero-compressed.mp4 /media/scatch-hero.mp4
```

### Step 4: Test
Refresh your shop page and verify the video loads faster.

---

## 🚀 Advanced: Multi-Format Support

For maximum compatibility and performance, use both MP4 and WebM:

Update [ShopPage.jsx](src/pages/ShopPage.jsx):
```jsx
<video className="shop-top-video" autoPlay muted loop playsInline preload="metadata">
  <source src="/media/scatch-hero.webm" type="video/webm" />
  <source src="/media/scatch-hero.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
```

**Benefits:**
- Modern browsers use WebM (smaller)
- Older browsers fall back to MP4
- Users get optimal performance for their device

---

## 📊 Expected Results

| Before | After |
|--------|-------|
| ~15MB | ~2-3MB |
| 🐢 Slow load | ⚡ Fast load |
| 😞 Poor UX | 😊 Great UX |

---

## 💡 Tips

1. **Test compression settings** on a small portion first
2. **Keep the original backup** in case you need to re-compress
3. **Check quality** on different devices before deploying
4. **Monitor file size** - if > 5MB, compress more
5. **Consider CDN** - serve videos from a content delivery network for faster delivery

---

## ❓ If You Need More Help

- FFmpeg documentation: https://ffmpeg.org/documentation.html
- Video compression guide: https://handbrake.fr/docs/en/latest/
- Online compressor: https://www.convertio.co/ (use for testing)

**My changes are complete and ready!** Now just compress your video and replace the file. 🎉
