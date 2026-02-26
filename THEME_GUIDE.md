# Theme System Guide

## Overview

The Therapy Connect platform now includes a comprehensive theme system that allows therapists to customize colors for different session modalities and UI elements. Theme settings are persisted to localStorage and applied globally across the application.

## Theme Colors

### Session Modality Colors
- **Video Sessions** (`videoColor`) - Default: `#8b5cf6` (violet)
- **In-Person Sessions** (`inPersonColor`) - Default: `#10b981` (green)
- **Text Sessions** (`textColor`) - Default: `#06b6d4` (cyan)
- **Phone Sessions** (`phoneCallColor`) - Default: `#f59e0b` (amber)
- **Supervision Sessions** (`supervisionColor`) - Default: `#ec4899` (pink)

### General Colors
- **Primary Color** (`primaryColor`) - Default: `#3b82f6` (blue)
- **Accent Color** (`accentColor`) - Default: `#06b6d4` (cyan)
- **Success Color** (`successColor`) - Default: `#10b981` (green)
- **Warning Color** (`warningColor`) - Default: `#f59e0b` (amber)
- **Error Color** (`errorColor`) - Default: `#ef4444` (red)

## Usage

### Accessing Theme Colors

Import `mockThemeSettings` from the data layer:

\`\`\`tsx
import { mockThemeSettings } from "../data/mockData";

// Use directly in inline styles
<div style={{ backgroundColor: mockThemeSettings.videoColor }}>
  Video Session
</div>
\`\`\`

### Using Theme Utilities

Use the helper functions from `/src/app/utils/themeColors.ts`:

\`\`\`tsx
import { getModalityColor, getSessionModalityStyles } from "../utils/themeColors";

// Get a specific modality color
const videoColor = getModalityColor("video");

// Get complete styles for a session card
const styles = getSessionModalityStyles("video", isToday);
<Card style={styles.card}>
  {/* Card content */}
</Card>
\`\`\`

### Applying Theme to Components

#### Example: Session Card with Theme Colors

\`\`\`tsx
import { mockThemeSettings } from "../data/mockData";

function SessionCard({ session, isToday }) {
  const supervisionColor = mockThemeSettings.supervisionColor;
  
  return (
    <Card 
      className={\`cursor-pointer hover:shadow-md transition-shadow \${isToday ? "border-2" : ""}\`}
      style={{
        borderColor: isToday ? supervisionColor : \`\${supervisionColor}33\`,
        backgroundColor: \`\${supervisionColor}08\`,
      }}
    >
      {/* Card content */}
    </Card>
  );
}
\`\`\`

#### Example: Badge with Theme Color

\`\`\`tsx
<span 
  className="text-xs text-white px-2 py-0.5 rounded-full"
  style={{ backgroundColor: mockThemeSettings.supervisionColor }}
>
  Supervision
</span>
\`\`\`

### Opacity Values for Backgrounds

Use hex opacity values for subtle backgrounds:
- `08` = 3% opacity (very subtle)
- `0D` = 5% opacity
- `1A` = 10% opacity
- `33` = 20% opacity
- `4D` = 30% opacity

Example:
\`\`\`tsx
<div style={{
  borderColor: \`\${color}33\`, // 20% opacity border
  backgroundColor: \`\${color}08\`, // 3% opacity background
}}>
\`\`\`

## Persistence

### How It Works

1. **Initial Load**: Theme settings are hydrated from localStorage in `/src/app/data/mockData.ts`
2. **App Initialization**: Theme is applied on app load via the `useTheme` hook in `RootLayout`
3. **Saving Changes**: When a therapist saves theme changes in Settings, the new colors are:
   - Persisted to localStorage
   - Applied to global `mockThemeSettings` object
   - Applied to CSS custom properties

### Settings Page

Therapists can customize their theme at `/t/settings`:
- Navigate to Settings → Theme tab
- Adjust colors using color pickers or hex inputs
- Preview changes in real-time
- Click "Save Theme" to persist changes

### CSS Custom Properties

Theme colors are also available as CSS variables:
- `--primary` - Primary color (HSL format)
- `--theme-supervision` - Supervision color
- `--theme-video` - Video session color
- `--theme-in-person` - In-person session color
- `--theme-text` - Text session color
- `--theme-phone-call` - Phone session color

## Components Using Theme

### Currently Themed
- ✅ Supervision session cards in TherapistHome
- ✅ Supervision connection requests
- ✅ Settings page preview

### To Be Themed
- ⏳ Calendar events
- ⏳ Client profile session types
- ⏳ Session booking modals
- ⏳ Therapist profile rates display

## Development Notes

### Adding Theme Support to a Component

1. Import the theme settings:
   \`\`\`tsx
   import { mockThemeSettings } from "../data/mockData";
   \`\`\`

2. Use inline styles for theme colors (Tailwind can't process dynamic colors):
   \`\`\`tsx
   style={{ backgroundColor: mockThemeSettings.videoColor }}
   \`\`\`

3. For borders with opacity, append hex opacity values:
   \`\`\`tsx
   style={{ borderColor: \`\${mockThemeSettings.videoColor}33\` }}
   \`\`\`

### Testing

To test theme persistence:
1. Go to Settings → Theme
2. Change some colors
3. Click "Save Theme"
4. Navigate to different pages
5. Refresh the browser
6. Colors should persist across sessions

### Resetting Theme

Users can reset to default colors in Settings, or developers can clear localStorage:
\`\`\`js
localStorage.removeItem('besthelp_theme_settings');
\`\`\`