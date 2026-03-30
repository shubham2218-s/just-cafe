# Just Cafe Ordering System

A premium, modern cafe ordering system for campus and beyond.

## Features
- 🚀 **Modern UI**: Sleek dark/amber theme with responsive design.
- 📱 **Order Online**: Browse the menu and place orders in seconds.
- ⚙️ **Admin Panel**: Manage menu items, track orders, and view stats.
- 🔥 **Firebase Powered**: Uses Firestore for real-time data storage.

## Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root:
   ```env
   PORT=3000
   FIREBASE_PROJECT_ID=just-cafe-2a77e
   SESSION_SECRET=your-secret-key
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}' # Your JSON key as a string
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Create Admin**:
   Run `node createAdmin.js` to create the initial admin account (`admin@cafe.com` / `admin123`).

## Deployment on Render

1. **Connect to GitHub**: Push this repository to your GitHub account.
2. **Create Web Service**: In Render Dashboard, click `New` -> `Web Service`.
3. **Connect Repository**: Select your `just-cafe` repo.
4. **Environment Variables**:
   Add the following in the `Environment` tab:
   - `FIREBASE_PROJECT_ID`: `just-cafe-2a77e`
   - `SESSION_SECRET`: (Click 'Generate')
   - `FIREBASE_SERVICE_ACCOUNT`: Copy the entire content of your Firebase Service Account JSON file here.

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Project: `just-cafe-2a77e`.
3. Go to `Project Settings` -> `Service Accounts`.
4. Click `Generate new private key` to download the JSON.
5. Provide this JSON to the `FIREBASE_SERVICE_ACCOUNT` environment variable.
