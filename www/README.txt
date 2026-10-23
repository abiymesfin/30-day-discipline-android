30 DAY Challenge — v8

This package includes the web/PWA source, Capacitor Android project and icon assets.

Important v8 fixes:
- The app mark is a plain black square with only the white number 30, matching the supplied image. No calendar or added decoration.
- Logo and Settings gear images used by the web page are embedded directly into HTML so they still display in Chrome/hosted previews if relative asset paths are missed.
- The Settings button uses the provided gear artwork. The Sign In and account surfaces use the 30-only logo with square corners.
- Service worker cache is v8 and requests an update on page load.

To see these changes on your deployed URL, import/upload this entire ZIP into your builder and redeploy all files. The old site open in Chrome will not change just because the ZIP was downloaded.

Do not clear site storage unless you have exported a backup first: the app currently saves challenge data locally in the browser.

To run locally as a web app, serve the project folder over HTTP (for example via a static host); opening file:// disables service worker/offline behavior. To build Android, use npm install, npm run cap:sync, then npm run cap:build in an environment with Android build requirements.

VERSION 9 UPDATE
- Replaced the Settings gear photo with an inline scalable SVG Settings icon.
- Added a polished launch/loading overlay with a five-second minimum display on each full page/app load.
- Added an animated progress line and accessibility status text.
- Updated the service-worker cache to v9 and synchronized web/Capacitor assets.

VERSION 10 UPDATE
- Replaced the minimal launch loader with an obsidian-black/champagne-gold luxury loading experience.
- Added restrained animated orbit rings, elevated typography, and a fine gold progress line.
- Preserved the plain black-square logo with white “30” only and the five-second launch duration.
- Incremented the service-worker cache to v10 and synchronized all web/Capacitor copies.


VERSION 11 UPDATE
- The loader follows the saved app theme before first paint. New users/no saved preference use the app's default Light theme (white background); saved Dark mode uses an obsidian-black loader.
- Keeps the premium gold animation and five-second launch display.
- Cache version discipline30-static-v11; package version 11.0.0.
- Includes MANUS_AI_PROMPT_v11.txt and CHROME_THEME_FIX_v11.txt.
- Supabase authentication is not yet live: configure your own Supabase project, public client key and secure RLS before enabling real sign-in/cloud sync.

VERSION 12 UPDATE (fixes)
- Saved/imported data is normalized; unreadable data is kept as a copy instead of being overwritten.
- Future days can no longer be checked off.
- Android: backup and report are shared through the share sheet (@capacitor/filesystem + @capacitor/share).
- Android: daily reminder uses a true daily schedule (hour/minute).
- Service worker is removed inside the Android app; web version loads the page network-first. Cache v12.
