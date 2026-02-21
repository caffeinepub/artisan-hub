# Artisan Hub

## Current State

The marketplace currently has:
- Artist signup flow via separate dedicated page (`/artist-signup`)
- Artist profile page showing items they've created (`/profile`)
- Users must navigate to `/artist-signup` to become an artist
- Artist data includes: name and Stripe account ID
- Backend has `createArtist` and `updateArtist` functions
- No centralized profile settings page

## Requested Changes (Diff)

### Add
- New Profile Settings page (`/settings`) accessible to logged-in users
- Artist profile creation form within settings (replaces standalone signup page)
- Stripe payment configuration UI within settings
- Artist profile editing capability within settings
- Visual indication of artist status (whether user is an artist or not)
- Navigation link to settings page in header

### Modify
- Artist creation workflow: move from standalone `/artist-signup` page to `/settings` page
- Header navigation: add Settings link for logged-in users
- Profile page: add link to settings for profile configuration

### Remove
- Standalone `/artist-signup` page route (functionality moved to settings)

## Implementation Plan

1. **Backend**: No backend changes required. Existing `createArtist`, `updateArtist`, and `getArtist` functions will be reused.

2. **Frontend**:
   - Create new `SettingsPage.tsx` component with tabs/sections for:
     - Artist profile creation (if not an artist yet)
     - Artist profile editing (name, Stripe account ID)
   - Add route for `/settings` in App.tsx
   - Update Header.tsx to include Settings navigation link for logged-in users
   - Update ArtistProfilePage.tsx to add a link to settings
   - Remove ArtistSignupPage route from App.tsx (keep file for reference but remove from routing)

3. **Key Features**:
   - Check if user is already an artist (query `getArtist` with caller principal)
   - If not an artist: show "Become an Artist" form with name and Stripe fields
   - If already an artist: show "Edit Artist Profile" form pre-filled with current data
   - Terms and conditions checkbox still required for new artist creation
   - Success toast and navigation to profile after artist creation/update

## UX Notes

- Settings page should be clean and organized with clear sections
- If user is not yet an artist, prominently display "Become an Artist" section
- If user is already an artist, show current profile info with edit capability
- Include helpful text about Stripe Connect account setup
- Maintain existing terms and conditions dialog functionality
- Add clear navigation between settings, profile, and marketplace
