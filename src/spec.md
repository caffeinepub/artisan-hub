# Artisan Hub

## Current State

The Artisan Hub marketplace allows artists to:
- Sign up with a name and Stripe account ID
- Create artist profiles via the Settings page
- Upload and list items for sale with multiple files
- Configure Stripe payment settings in their profile

Currently, users can attempt to create items whether or not they have set up their artist profile with Stripe payment details.

## Requested Changes (Diff)

### Add
- Validation in the Create Item page to check if the user has an artist profile before allowing item creation
- Alert/redirect flow to guide users without artist profiles to complete their settings first

### Modify
- `CreateItemPage.tsx`: Add artist profile check and redirect/block logic for users without configured Stripe accounts
- User flow: Users attempting to create items without artist profiles should be informed they must complete their profile first

### Remove
- None

## Implementation Plan

1. **Frontend Update (CreateItemPage.tsx)**
   - Add `useGetArtist` query to check if the logged-in user has an artist profile
   - Display a message if no artist profile exists, with a CTA button directing to Settings
   - Only show the item creation form if the artist profile exists

2. **Backend** (no changes required)
   - The existing `createItem` function already checks if the artist exists before allowing item creation
   - No additional backend logic needed

## UX Notes

- Users without artist profiles will see a friendly message explaining they need to set up their artist account first
- A clear call-to-action button will direct them to the Settings page
- This prevents confusion when users try to create items without payment capabilities configured
