# KeyPrime Sales Management Application

A complete, production-oriented sales and client lifecycle management Android application designed for **KeyPrime Business Solutions**.

Built with **React Native (Expo SDK 52) + TypeScript + Node.js Express + MySQL**.

---

## Brand Identity & Original Logo Integration

- **Original Logo Asset**: Preserved in `assets/images/keyprime-logo.png` (Aspect ratio: 3.075:1, dimensions 738x240).
- **Proportions**: Strict aspect ratio preservation without distortion or cropping across all Android screen sizes and densities.
- **Color Palette**:
  - Primary Navy Blue: `#0B2545`, `#133E87`
  - Royal Blue: `#1D4ED8`
  - Accent Red (from graph arrow & swoosh): `#DC2626`
  - Surface & Backgrounds: `#FFFFFF`, `#F8FAFC`, `#F1F5F9`

---

## System Architecture

```
Sales App Management/
├── app/                        # Expo Router Navigation Screens
│   ├── (auth)/                 # Authentication Group
│   │   ├── _layout.tsx
│   │   ├── login.tsx           # Branded Login with KeyPrime logo
│   │   └── forgot-password.tsx # Password reset workflow & notices
│   ├── (tabs)/                 # Bottom Tabs Navigation
│   │   ├── _layout.tsx         # 5 Tab Navigation Bar (Lucide Icons)
│   │   ├── index.tsx           # Dashboard with real metrics & filters
│   │   ├── customers.tsx       # Customer records, search & filters
│   │   ├── demos.tsx           # Demo visits, calendar & status
│   │   ├── subscriptions.tsx   # Software plans & renewal reminders
│   │   └── profile.tsx         # User profile, role badge & sign out
│   ├── customers/
│   │   ├── add.tsx             # Register customer form with validation
│   │   ├── [id].tsx            # Detail screen (Call, WhatsApp, history)
│   │   └── edit/[id].tsx       # Update existing customer
│   ├── demos/
│   │   └── add.tsx             # Schedule demo visit with customer picker
│   ├── payments/
│   │   └── add.tsx             # Record payment & recalculate balance
│   ├── reports/
│   │   └── index.tsx           # Analytics, collections & sales leaderboard
│   ├── admin/
│   │   └── users.tsx           # Sales team account management
│   └── _layout.tsx             # Root layout with AuthProvider & Gate
├── assets/
│   └── images/
│       └── keyprime-logo.png   # Original KeyPrime logo
├── components/                 # Reusable UI components
│   ├── KeyPrimeLogo.tsx        # High-res responsive logo component
│   ├── DashboardHeader.tsx     # Header with greeting & notifications
│   ├── StatCard.tsx            # KPI metric cards
│   ├── QuickActionButton.tsx   # Dashboard action triggers
│   ├── Button.tsx              # Themed buttons (primary/outline/danger)
│   ├── Input.tsx               # Rounded inputs with show/hide password
│   ├── Card.tsx                # Elevated cards with subtle shadows
│   ├── Badge.tsx               # Status badges
│   ├── EmptyState.tsx          # Clean empty state handlers
│   └── LoadingScreen.tsx       # Branded splash/loading spinner
├── constants/
│   └── theme.ts                # Typography, colors, radii, shadows
├── services/
│   ├── api.ts                  # Axios client with base URL resolution
│   └── authContext.tsx         # Authentication provider & storage
├── backend/                    # Node.js + Express + MySQL Backend
│   ├── migrations/
│   │   └── 001_init.sql        # MySQL Schema tables & indexes
│   ├── scripts/
│   │   └── setup_db.js         # Automated DB init & initial seeder
│   ├── src/
│   │   ├── config/db.js        # MySQL2 connection pool
│   │   ├── middleware/auth.js  # JWT validation & role enforcement
│   │   ├── controllers/        # Business logic for all modules
│   │   ├── routes/             # REST API routes
│   │   └── index.js            # Express server entry point
│   ├── .env                    # Active database credentials
│   ├── .env.example            # Environment variable template
│   └── package.json            # Backend dependencies
├── eas.json                    # EAS build configuration for Android APK
├── START_BACKEND.bat           # One-click backend launcher
├── START_APP.bat               # One-click frontend launcher
└── package.json                # Frontend dependencies
```

---

## Database Schema (MySQL)

Database Name: `keyprime_sales_db`

1. **`users`**: User credentials, roles (`admin`, `salesperson`), phone, status.
2. **`customers`**: Shop name, owner name, contact numbers, address, assigned sales rep, sales stage status.
3. **`demos`**: Scheduled visits, time, location, status (`scheduled`, `completed`, `cancelled`), notes, rep ID.
4. **`subscriptions`**: Plan name, duration, start/expiry dates, total amounts, status, renewal reminder flags.
5. **`payments`**: Amount paid, payment date, method (`upi`, `cash`, `bank_transfer`, `cheque`), reference number, verification status.
6. **`activity_logs`**: Audit trail of sales representative and admin actions.
7. **`notifications`**: System notifications for renewals and upcoming visits.

---

## Seed Accounts (Pre-configured for Testing)

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@keyprime.com` | `Admin@123` |
| **Sales Representative** | `sales@keyprime.com` | `Sales@123` |

*(One-tap quick-fill buttons are also available on the Login screen for instant access)*

---

## How to Run the Application

### 1. Start the Backend API
Double-click `START_BACKEND.bat` or run:
```powershell
cd backend
node src/index.js
```
The server will start on `http://localhost:5000/api`.

### 2. Start the Expo Frontend
Double-click `START_APP.bat` or run:
```powershell
npx expo start
```
- Press `a` in the terminal to launch in an Android Emulator.
- Or scan the QR code with **Expo Go** on an Android phone connected to the same Wi-Fi network.

---

## Android APK Build Instructions (EAS Build)

To build a standalone installable APK (`.apk` file) for Android devices without using Google Play:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to your Expo account**:
   ```bash
   eas login
   ```

3. **Configure the Project**:
   ```bash
   eas project:init
   ```

4. **Trigger APK Build**:
   ```bash
   eas build -p android --profile preview
   ```
   *(The `preview` profile defined in `eas.json` is configured with `"buildType": "apk"`)*

5. **Download and Install**:
   - Once the cloud build completes, EAS outputs a direct download URL for the `.apk` file.
   - Download the APK to your Android device and install it directly.
