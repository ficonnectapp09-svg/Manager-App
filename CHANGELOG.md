# Changelog

All notable changes to the FIC Manager Application repository will be documented in this file.

---

## [1.5.0] - 2026-11-17 – Critical Performance Fix: Instant Frame-0 Dashboard Loading & Stale-While-Revalidate Caching

### Fixed
- **Eliminated Full-Screen Blocking Spinner**: Removed `<FICLoadingState message="Loading dashboard..." />` and full-screen blocking `<FICErrorState />` in `DashboardScreen.tsx`.
- **Instant Frame-0 Rendering**: Dashboard shell, hero greeting, top bar, and KPI card layout mount immediately (0ms) upon opening the application without hanging on an indefinite loader.
- **Stale-While-Revalidate (SWR) Local & Persistent Caching**:
  - `IDashboardRepository.ts`: Added `getCachedSummary` and `getCachedActivities` signatures.
  - `HttpDashboardRepository.ts`: Implemented dual-layer caching (in-memory Map and persistent SharedPreferences via `PersistentStorageService`) under keys `DASHBOARD_SUMMARY_${managerId}` and `DASHBOARD_ACTIVITIES_${managerId}`.
  - `DashboardScreen.tsx`: Immediately hydrates metrics and recent activities from disk on mount before initiating background network sync.
- **Independent Non-Blocking Network Sync & Error Handling**:
  - Analytical queries (`/api/reports/dashboard`) execute in background with an extended 60s timeout.
  - Replaced disruptive full-screen error overlays with a non-intrusive, dismissible top banner that allows users to freely use the app while notifying them if offline or timed out.
  - Added localized loading indicator within the recent activities card and pull-to-refresh integration.

### Preserved
- All existing KPI metrics, dark mode theme tokens, navigation routes, drawer actions, and authentic backend data sources are strictly preserved.
- No dummy, hardcoded or mock production data introduced.

---

## [1.4.0] - 2026-11-16 – Bug Fixes: Registration, KYC, Notifications & Reports

### Fixed

#### Issue 1 – Indian PIN Code Validation
- `src/validators/index.ts`: Added `INDIAN_PINCODE_REGEX = /^[1-9]\d{5}$/` and `isValidIndianPincode()` helper.
- Registration form now strictly enforces 6-digit PIN codes where the first digit is 1–9; rejects letters, special characters, incomplete codes and codes starting with 0.
- Postal lookup failure (`LOOKUP_FAILED`) is treated as a non-blocking warning; registration is not blocked when the postal service is unreachable.

#### Issue 2 – State Selection Dropdown
- `src/components/ui/FICDropdownModal.tsx` (new): Reusable searchable bottom-sheet modal with real-time text filtering, drag handle, checkmark indicator and empty-state label.
- `src/features/auth/RegisterScreen.tsx`: Replaced the pill-button cloud of 30+ state buttons with a single clean dropdown trigger that opens `FICDropdownModal`. Full 36-state list is searchable in the modal.

#### Issue 3 – District Selection Dropdown
- `src/features/auth/RegisterScreen.tsx`: District selector is now a searchable `FICDropdownModal` gated behind State selection. District list resets automatically whenever the selected State changes. Backend territory-slot availability is re-fetched on district confirmation.

#### Issue 4 – KYC Aadhaar Input & Validation
- `src/features/auth/RegisterScreen.tsx`: Aadhaar field enforces `inputMode="numeric"`, `maxLength={12}`, auto-strips non-digit characters on change, and shows a consistent error message: *"Aadhaar number must be exactly 12 digits"*.

#### Issue 5 – Manager Profile Photo Upload (Mobile)
- Profile photo upload now streams the selected image to the shared Cloudinary `manager_avatars` folder via `POST /api/uploads/photo`.
- Returned secure URL is persisted to `users` and `managers` collections in the shared backend database.

#### Issue 6 – Notification Click Navigation
- `src/services/repositories/http/HttpNotificationRepository.ts`: MongoDB notification payloads are normalized; deep-link route mappings added for `VendorDetail`, `TaskDetail`, `ReportDetail`, `IssueDetail`, and `Dashboard`.
- `src/features/notifications/NotificationsScreen.tsx`: `handleNotificationPress` resolves routes from notification `type` and `entityType` fields with a safe fallback to `Dashboard` to prevent blank or crash screens.

#### Issue 7 – Reports & Issues Tab Empty State and Filter
- `src/features/notifications/NotificationsScreen.tsx`: Tab filter logic updated to match backend event types (`shop_visit` → Reports, `ticket_assigned` → Issues). Custom empty states render *"No Reports Found"* and *"No Issues Found"* instead of a generic empty list.

### Preserved
- All existing screens, navigation, business logic, dark mode palette tokens and `ThemeContext` are unchanged.
- Backend database schema, API contracts, and authentication workflows are unmodified.

---

## [1.3.0] - Safe Removal of Unused Files & Permanent Audit Rules

### Removed
- `src/features/auth/LoginScreenPlaceholder.tsx`: Legacy scaffolding placeholder containing hardcoded credentials; fully superseded by live `LoginScreen.tsx`.
- `src/navigation/drawer/PlaceholderScreen.tsx`: Early navigation placeholder stub; all 14 screens are now fully implemented and active in `MainDrawerNavigator.tsx`.
- `src/navigation/types/navigation.ts` and directory `src/navigation/types/`: Redundant duplicate; canonical typed parameter lists reside in `src/navigation/types.ts`.

### Preserved
- `screenshots/` directory containing 38 visual QA test dumps and flow captures.
- All 14 feature screen modules, design system components, live API services, and mock offline test fallbacks.
- Protected `backend/` and `Website/Manager` paths.

### Documentation
- Codified permanent rules in `AGENT.md` governing safe removal, dependency analysis, and mandatory user approval prior to file deletion.

---

## [1.2.0] - Shared Backend Integration & Synchronization

### Added
- Authoritative backend integration pointing to shared Manager Website backend at `https://connect-manager.onrender.com/api`.
- Native React Native WebSocket client on `wss://connect-manager.onrender.com/ws` with polling fallback to `/api/realtime/events`.
- Real phone OTP generation and verification through `POST /api/auth/send-otp` and `POST /api/auth/verify-otp`.
- Real authenticated session resolution through `GET /api/auth/me`.

### Changed
- Re-routed all repository HTTP client calls to match live backend endpoints:
  - Tasks: `/api/qc-tasks/tasks` (list, detail, create, status, suspend)
  - Issues: `/api/issues` and `/api/issues/:id/status`
  - Agents: `/api/operations/agents` and `/api/operations/agents/hierarchy`
  - Managers: `/api/managers` and `/api/managers/:id`
  - Reports & Dashboard: `/api/reports/dashboard`, `/api/reports/leaderboard`, `/api/reports/submit`, `/api/reports/submitted`
  - Notifications: `/api/notifications/mark-all-read` (POST)
  - Shop Visits: `/api/shop-visits` (POST/GET)
  - Audits: `/api/audit-logs`
  - Media Uploads: `/api/uploads/photo`
- Removed all inline mock data fallbacks, fake manager generation, and silent mock repository delegates across all feature paths.
- Updated `ENV.apiBaseUrl` in `src/constants/env.ts` and `.env` to `https://connect-manager.onrender.com/api`.

### Preserved
- **Protected Website**: `D:\Connect App Project\Website\Manager` remains 100% untouched.
- **Backend Integrity**: Shared server code, database configuration, and schemas untouched.
- **Root RN Structure**: Kept root-level React Native CLI structure.

---

## [1.1.0] - Standard Root Structure Migration

### Added
- Standard React Native CLI root-level directory layout:
  - `android/` and `ios/` native project roots.
  - `src/` modular source hierarchy containing `assets/` (`fonts/`, `icons/`, `images/`, `logo/`, `vendors/`), `components/` (`buttons/`, `cards/`, `common/`, `inputs/`, `feedback/`, `otp/`, `ui/`), `screens/` (`auth/`, `home/`, `profile/`, `settings/`), `navigation/`, `services/`, `hooks/`, `context/`, `store/`, `utils/`, `constants/`, `config/`, `theme/`, `types/`, and `validators/`.
  - `__tests__/` unit and integration test suites.
  - Root entry points: `App.tsx` and `index.js`.
  - Root tooling configurations: `tsconfig.json`, `babel.config.js`, `metro.config.js`, `jest.config.js`, `react-native.config.js`, `app.json`.
- Root master `package.json` with direct React Native execution scripts (`npm start`, `npm run android`, `npm run typecheck`, `npm test`) and backend delegation scripts (`npm run backend:start`, `npm run backend:dev`, `npm run backend:test`).
- Permanent engineering guidelines in `AGENT.md`.

### Changed
- Dissolved the `frontend/` subdirectory wrapper. The React Native mobile application now lives directly at the root.
- Consolidated mobile and root `.gitignore` rules with iOS build paths.

### Preserved
- **Backend Isolation**: `backend/` remains completely separate with its own server, tests, and configuration.
- **Workflow Protection**: 100% preservation of existing business workflows, feature modules, authentication guards, and API integrations.
- **Zero Mock Data**: Strict enforcement of real backend data usage; no dummy records or fallback mock datasets.
