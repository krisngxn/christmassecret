# Christmas Interactive Slide Website

A quiet, intimate, romantic slide experience built with vanilla HTML, CSS, and JavaScript.

## Setup

1. **Audio File**: Place your audio file at:
   ```
   assets/hen-gap-em-duoi-anh-trang.mp3
   ```
   
   If the file is missing, the website will still work but show a subtle error message.

2. **Run**: Simply open `index.html` in your web browser. No build step required.

## Features

- 7 carefully crafted slides with romantic, sincere content
- Smooth GSAP animations with emotional pacing
- Fully responsive (mobile-first design)
- Background music control
- Safe area support for modern mobile devices
- Accessibility features (keyboard navigation, reduced motion support)
- No frameworks or dependencies (except GSAP CDN)

## Browser Support

Works in all modern browsers that support:
- CSS custom properties
- Flexbox
- ES6+ JavaScript
- GSAP (loaded via CDN)

## Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd christmas-slide
   vercel
   ```

3. Follow the prompts. Your site will be live instantly!

### Option 2: Vercel Web Interface

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your repository or drag and drop the `christmas-slide` folder
4. Deploy!

### Option 3: Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   cd christmas-slide
   netlify deploy --prod
   ```

### Option 4: GitHub Pages

1. Push to a GitHub repository
2. Go to Settings → Pages
3. Select source branch and deploy

**Note**: Make sure to upload your audio file (`hen-gap-em-duoi-anh-trang.mp3`) to the `assets/` folder before deploying.

## Customization

All text content is in `index.html` - easy to edit directly.

Animation timing and styles can be adjusted in `script.js` and `style.css`.

# christmas-slide
