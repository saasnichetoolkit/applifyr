# APPLIFYR admin review and directory improvements

## Goal
Add a private admin workspace for reviewing submissions, preserve rejected entries for history, improve Explore discovery, and verify all three live app listings end to end.

## Admin access and data rules
- Enable managed Google sign-in and replace the placeholder sign-in page with a working Google flow.
- Do not create user profiles; use the Google identity directly.
- Add a separate role table and secure role-check function. Bootstrap admin access only for `saas.niche.tool.kit@gmail.com` after that account signs in.
- Add `rejected` to submission statuses. Rejected entries stay in the database but remain hidden from every public directory and detail page.
- Add narrowly scoped admin read/update policies so only authenticated users with the admin role can inspect pending or rejected records and edit submission data.
- Keep public submissions restricted to `pending`; public reads continue to expose only approved or featured apps.

## Admin dashboard
- Add a protected `/admin` dashboard with status tabs and clear counts for Pending, Approved, Featured, and Rejected.
- Show the submission queue with title, URL, category, rating, submission date, and status.
- Add an edit panel for title, slug, tagline, description, website URL, category, rating, and verification state.
- Provide explicit Approve, Feature, and Reject actions with confirmation for rejection.
- Refresh the queue immediately after a saved edit or status change.
- Update the header for signed-in state with an Admin link and Sign out action; non-admin accounts cannot open the dashboard or call its data actions.

## Explore discovery
- Add title/tagline/description search, category filtering, result counts, and a useful empty state to `/explore`.
- Keep filtering fast and client-side over the approved directory result already loaded by the page.
- Preserve the existing card design and category pages.

## Detail-page verification
- Query the live records for Book Launch Desk, TrueMargin AI, and Up All Good.
- Verify each detail page shows the requested description, rating, category, and outbound website URL.
- Exercise each website button and confirm its rendered link target and safe outbound attributes.

## Technical details
- Use an additive database migration containing schema changes, grants, RLS policies, role helpers, and the literal admin allowlist row.
- Use authenticated server functions for all admin reads and writes; each function checks the server-validated user and admin role.
- Keep duplicate legacy app columns synchronized during edits so existing constraints and older reads cannot drift.
- Place the dashboard under the managed authenticated route layout; keep public routes SSR-safe.
- Configure Google as an enabled sign-in provider in the same implementation.
- Add route-specific title, description, Open Graph, and Twitter metadata for the dashboard route.

## Validation
- Verify signed-out visitors are redirected away from `/admin` and cannot call admin functions.
- Sign in as the designated Google admin, then test editing and each status transition against a temporary pending submission, including rejection retention and public visibility rules.
- Confirm Explore search and category filtering on desktop and mobile.
- Confirm all three real app detail pages and outbound links.
- Check the latest build and runtime diagnostics before completion.
