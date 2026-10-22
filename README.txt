30 DAY — 30 Day Discipline Challenge, source v5

This archive preserves the supplied pastel single-page source and adds:
- Dedicated Settings page and reliable gear navigation.
- Local phone time picker, saved reminder time, OFF-by-default toggle.
- Permission status, enable-permission flow and test notification button.
- Duplicate-safe daily reminder state (one local calendar date at most in PWA mode).
- Capacitor Android bridge for native local notifications, including explicit plugin registration, an Android notification channel, and a single fixed reminder ID that is cancelled/replaced on changes.
- Service-worker cache v5, local-only user data migration, and the 30 calendar launcher logo.

PWA installation
1. Serve this folder over HTTPS.
2. Open the URL in Chrome on Android and choose Install app / Add to Home screen.
3. Open Settings, choose a local time, enable Daily notification, allow notifications, then use Test notification.
4. In PWA mode, browser timers and service-worker notifications are best effort and cannot reliably fire after the browser process is fully closed. The Settings page says this explicitly.

Native Android build (Capacitor)
1. Install Node.js, the Android SDK (API 35), Android Studio and a JDK supported by the installed Android Gradle Plugin.
2. From this directory run: npm install
3. Generate the native project once: npx cap add android
4. Sync web assets/plugins: npx cap sync android
5. Open android/ in Android Studio, install/run on a physical Android 13+ phone, or run: npm run cap:build
6. On first run, grant POST_NOTIFICATIONS when prompted. Android local notifications are scheduled through @capacitor/local-notifications using a single notification ID and daily repeat schedule. Reboot/reschedule behavior must be verified on the target Android version before release; this sandbox did not have an Android SDK, Gradle, ADB or a test phone, so no APK or closed-app test is claimed.

Data and migration
User data remains in localStorage under the existing key personal_discipline_challenge_v2. Existing habits, profile, notes and check-ins are retained. Missing reminder settings are migrated to OFF with 09:00. A fresh install starts with no user data, no demo content and reminders OFF.

Suggested acceptance test on a physical Android build
- Gear opens Settings; Back to Home returns Home; bottom navigation keeps Home, Habits, Progress and Profile separate.
- Change time, reload, and verify it persists. Toggle OFF/ON and verify it persists.
- Verify permission status changes, send a test notification, then disable notifications in Android Settings and verify the blocked status.
- Enable a reminder, inspect that only one scheduled reminder exists after changing time repeatedly, force-stop/reopen, and reboot the phone; verify one notification on the next local day.
- Install fresh and verify empty habits/profile/check-ins and zero progress.
