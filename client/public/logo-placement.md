# DECK CORE Logo Placement

## Required File
Place the DECK CORE logo image as: `deck-core-logo.png`

## Image Requirements
- Format: PNG (preferred) or JPG
- Recommended size: 200x60px or similar aspect ratio
- Transparent background (for PNG)
- High resolution for crisp display

## Current Implementation
The navigation components are configured to:
1. Load logo from `/deck-core-logo.png`
2. Fallback to "DC" badge if image fails to load
3. Responsive design with proper hover effects

## Usage
The logo appears in:
- Main navigation (Home.tsx)
- Admin navigation (AdminDashboardLayout.tsx)
- Height: 32px (h-8 class)
- Auto width to maintain aspect ratio