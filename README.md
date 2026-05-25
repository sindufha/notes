# Bloom — Local Productivity Suite

A cheerful, fully local productivity app with **colorful sticky notes** and an **encrypted password vault**. Built with **Vite + React + TypeScript + Tailwind CSS** in a cartoon, neobrutalism-inspired style.

**All data stays on your machine.** No accounts. No cloud. No tracking. Install it as a PWA and use it offline.

---

## Features

| Feature | Description |
| --- | --- |
| **Sticky Notes** | Create, edit, and delete colorful notes. Pick from 6 colors. Stored in localStorage. |
| **Password Vault** | Store credentials encrypted with AES-256-GCM. Protected by a master password you choose. |
| **Install as App** | PWA support — click "Install app" in the navbar to add it to your desktop/home screen. |
| **Fully Offline** | Works without internet once loaded. Service worker caches everything. |
| **No Server** | Zero backend. All data lives in your browser's localStorage. |

---

## Tech Stack

- [Vite 6](https://vitejs.dev/) — dev server & bundler
- [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS 3](https://tailwindcss.com/) — styling
- [React Router 7](https://reactrouter.com/) — client-side routing
- [Lucide React](https://lucide.dev/) — icons
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — AES-256-GCM encryption
- Custom cartoon theme (Fredoka + Nunito fonts, pastel palette)

---

## Getting Started

### 1. Prerequisites

You need [Node.js](https://nodejs.org/) **v20.19+** or **v22.13+** (or v24+) and `npm`.

```bash
node --version   # should print v20.19+ / v22.13+ / v24+
npm --version
```

If you don't have Node.js yet:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22
nvm use 22
```

### 2. Clone the repo

```bash
git clone https://github.com/sindufha/notes.git
cd notes
```

### 3. Create your `.env` file

Copy the example and fill in your own values:

```bash
cp .env.example .env
```

Open `.env` in your editor and set:

```env
# A random hex string used as extra salt for password vault encryption.
# Generate one with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
VITE_VAULT_SALT=paste_your_generated_hex_here

# App display name (shown in navbar)
VITE_APP_NAME=Bloom
```

> **Important:** Every user should generate their own unique `VITE_VAULT_SALT`. This salt is mixed into the encryption key derivation, so using a unique value makes your vault more secure. The app works without it (a default is used), but a custom salt is recommended.

### 4. Install dependencies

```bash
npm install
```

### 5. Start the dev server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser. The page hot-reloads when you save changes.

### 6. Build for production

```bash
npm run build
```

The optimized static site lands in `dist/`. Preview it locally:

```bash
npm run preview
```

### 7. Lint

```bash
npm run lint
```

---

## How to Use

### Sticky Notes

1. Click **"Notes"** in the navigation bar.
2. Click **"New note"** to create a note.
3. Type a title and content, pick a color, then click **"Add note"**.
4. Click the pencil icon on any note to edit it, or the trash icon to delete it.
5. Notes are saved automatically to your browser's localStorage.

### Password Vault

1. Click **"Vault"** in the navigation bar.
2. **First time:** Create a master password (minimum 6 characters). This password encrypts all your vault data.
3. **Returning:** Enter your master password to unlock.
4. Click **"Add"** to store a new credential (site, username, password, notes).
5. Click **"Generate"** to auto-generate a strong password.
6. Use the eye icon to reveal a password, or the copy icon to copy it to your clipboard.
7. Click **"Lock"** when you're done to re-encrypt and lock the vault.

> **Warning:** If you forget your master password, there is no recovery. Your data is encrypted locally and cannot be decrypted without the correct password.

### Install as App (PWA)

1. When visiting the site in Chrome/Edge, click the **"Install app"** button in the navbar.
2. The app will be added to your desktop/home screen and work offline.
3. If the button doesn't appear, you can also install via the browser's address bar install icon.

---

## Project Structure

```
notes/
├── index.html                 # HTML entry — PWA manifest + Google Fonts
├── package.json               # Dependencies & scripts
├── .env.example               # Environment template (copy to .env)
├── .gitignore                 # Ignores .env, node_modules, dist
├── tailwind.config.js         # Cartoon theme (fonts, colors, shadows)
├── postcss.config.js
├── vite.config.ts
├── tsconfig*.json
├── eslint.config.js
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker for offline support
│   ├── bloom-icon.svg         # App icon (SVG source)
│   ├── bloom-192.png          # App icon 192x192
│   └── bloom-512.png          # App icon 512x512
└── src/
    ├── main.tsx               # React entry + SW registration
    ├── App.tsx                # Router + navigation menu
    ├── App.css                # Root container reset
    ├── index.css              # Tailwind directives + base styles
    ├── pages/
    │   ├── Home.tsx           # Landing / dashboard page
    │   ├── StickyNotes.tsx    # Sticky notes feature
    │   └── PasswordVault.tsx  # Password vault feature
    ├── hooks/
    │   ├── useLocalStorage.ts # Generic localStorage hook
    │   └── usePwaInstall.ts   # PWA install prompt hook
    └── lib/
        ├── crypto.ts          # AES-256-GCM encrypt/decrypt
        └── utils.ts           # Tailwind merge utility
```

## Security Notes

- The password vault uses **PBKDF2** (600,000 iterations, SHA-256) to derive a key from your master password + salt, then encrypts with **AES-256-GCM**.
- All encryption/decryption happens in the browser via the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
- No data is ever sent to any server.
- The `VITE_VAULT_SALT` in your `.env` adds an extra layer of uniqueness to key derivation.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Vite dev server at http://localhost:5173 |
| `npm run build` | Type-check + build production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on the project |

---

Made with care. All data stays on your device.
