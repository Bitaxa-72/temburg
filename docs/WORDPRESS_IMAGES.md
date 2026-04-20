# WordPress Images Integration

## Overview

This document describes the integration between React frontend and WordPress Media Library for image management.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
├─────────────────────────────────────────────────────────────────┤
│  useImage hook  →  imageService.ts  →  WordPress API            │
│       ↓                  ↓                   ↓                   │
│  Component      →  Cache (10 min)   →  /termburg/v1/images      │
│       ↓                  ↓                   ↓                   │
│  <img src={url}>    Fallback      →  Local /images/ files       │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Frontend

| File | Purpose |
|------|---------|
| `src/services/imageService.ts` | Core service for image URL resolution |
| `src/hooks/useImage.ts` | React hooks for components |
| `src/components/ui/WPImage.tsx` | Image component with WordPress support |
| `src/data/imagePaths.ts` | Centralized image path constants |

### WordPress

| File | Purpose |
|------|---------|
| `wp-content/plugins/termburg-images/termburg-images.php` | REST API endpoint & admin interface |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/upload-images-to-wordpress.sh` | Bulk upload via WP-CLI |
| `scripts/generate-image-mapping.js` | Generate mapping file |

## Usage

### In Components

```tsx
// Using WPImage component (recommended)
import WPImage from '@/components/ui/WPImage';

<WPImage src="saunas/russian.jpg" alt="Russian Sauna" />

// Using useImage hook directly
import { useImage } from '@/hooks/useImage';

function MyComponent() {
  const imageUrl = useImage('saunas/russian.jpg');
  return <img src={imageUrl} alt="..." />;
}

// Multiple images
import { useImages } from '@/hooks/useImage';

function Gallery({ images }) {
  const urls = useImages(images.map(i => i.path));
  return images.map(i => <img key={i.id} src={urls[i.path]} />);
}
```

### In Data Files

```typescript
// Import from centralized paths
import { SAUNA_IMAGES } from './imagePaths';

export const zones = [
  {
    name: 'Russian Sauna',
    image: SAUNA_IMAGES.russian, // 'saunas/generated/russian.jpg'
  }
];
```

## WordPress API

### Endpoint

```
GET /wp-json/termburg/v1/images
```

### Response

```json
{
  "saunas/russian.jpg": {
    "url": "https://termburg.ru/wp-content/uploads/2024/01/russian.jpg",
    "thumbnail": "https://termburg.ru/wp-content/uploads/2024/01/russian-150x150.jpg",
    "medium": "https://termburg.ru/wp-content/uploads/2024/01/russian-300x200.jpg",
    "large": "https://termburg.ru/wp-content/uploads/2024/01/russian-1024x768.jpg",
    "full": "https://termburg.ru/wp-content/uploads/2024/01/russian.jpg",
    "webp": "https://termburg.ru/wp-content/uploads/2024/01/russian.webp"
  }
}
```

## Migration Guide

### Step 1: Install WordPress Plugin

1. Copy `wordpress/wp-content/plugins/termburg-images/` to WordPress
2. Activate plugin in WordPress admin
3. Verify endpoint: `curl https://termburg.ru/wp-json/termburg/v1/images`

### Step 2: Upload Images

```bash
# On WordPress server
cd /path/to/termburg
./scripts/upload-images-to-wordpress.sh --dry-run  # Preview
./scripts/upload-images-to-wordpress.sh            # Execute
```

### Step 3: Verify

1. Check WordPress admin → Media → Termburg Images
2. Test API endpoint returns mapping
3. Test frontend loads images from WordPress

## Fallback Behavior

The system automatically falls back to local images when:

1. WordPress API is unavailable
2. Image not found in WordPress Media Library
3. Network error occurs

This ensures the site remains functional even without WordPress.

## Cache

- Frontend cache: 10 minutes (configurable in `imageService.ts`)
- Cache is per-session and resets on page refresh
- Call `clearImageCache()` to manually clear

## Admin Features

WordPress admin panel provides:

- **Statistics**: Total images, mapped/unmapped counts
- **Bulk Import**: Import paths from CSV/text
- **Media Library Column**: Shows Termburg path for each image
- **Meta Box**: Edit Termburg path per image
- **Bulk Action**: Auto-set path from filename

## Adding New Images

1. Add image constant to `src/data/imagePaths.ts`
2. Use constant in data files or components
3. Upload image to WordPress with matching `termburg_path` meta
4. Image will automatically resolve to WordPress URL

## Troubleshooting

### Images not loading from WordPress

1. Check if plugin is activated
2. Verify API endpoint returns data
3. Check browser console for CORS errors
4. Verify `termburg_path` meta is set correctly

### Wrong image displayed

1. Check path normalization (no leading `/images/`)
2. Verify exact path match in WordPress meta
3. Clear browser cache and refresh

### Performance issues

1. Reduce cache TTL if needed
2. Use `size` parameter for thumbnails
3. Enable WebP generation in WordPress
