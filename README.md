# Team Availabilities Scheduler

A real-time weekly availability tool built for a small team. Everyone marks when they're free in 30-minute slots, and a live heatmap shows where the team overlaps — down to a full-team aurora animation when all five are free at the same time.

**Built with Claude.**

---

## Live Demo

**[Try it live →](https://dennisxcode.github.io/team-availabilities-scheduler/)**

Passcode: `520`

---

## Features

- **Drag-to-paint grid** — click or drag to mark availability across 8am–10pm, Mon–Sun, in 30-minute blocks. Shift+drag to erase.
- **Team heatmap** — the grid lights up based on overlap count:
  - Yellow glow → 2 people free
  - Green glow → 3–4 people free
  - Aurora animation + ✨ → all 5 free at the same time
- **Live sync** — data is stored in Google Sheets and polled every 20 seconds, so every teammate sees updates without refreshing
- **Best slot finder** — highlights the time window with the most team overlap
- **Copy from last week** — one click to carry over a repeating schedule
- **Week navigation** — browse any past or future week
- **Avatar cards** — see each teammate's fill percentage and slot count at a glance
- **Filter by person** — in Team View, click an avatar to isolate one teammate's availability
- **Mobile-friendly** — day-by-day vertical view for phones, tap-friendly slot targets
- **Admin panel** — password-protected weekly reset for clean slates

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — single file, zero build step |
| Backend | Google Apps Script (serverless Web App) |
| Database | Google Sheets |
| Hosting | GitHub Pages |
| Fonts | Geist, Geist Mono, Cabinet Grotesk |

---

## How It Works

```
Browser (index.html)
  │
  ├── My Schedule tab → drag to paint your 196 slots (7 days × 28 half-hours)
  │     └── auto-saves 1s after last edit → POST to Apps Script
  │
  └── Team View tab → heatmap of all 5 members' overlap
        └── polls every 20s → GET from Apps Script → renders heatmap

Apps Script (Code.js)
  ├── GET → return all rows as JSON
  └── POST → upsert or bulk-reset rows in the Sheet

Google Sheets
  └── One row per (name, week): 198 columns total
      [0] Name  [1] Week (YYYY-MM-DD)  [2–197] Slot data (0 or 1)
```

---

## Self-Hosting

To run your own version for a different team:

### 1. Create a Google Sheet

Any name. Note the Sheet ID from the URL:
`https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

### 2. Deploy the Apps Script Backend

1. Open your Sheet → **Extensions → Apps Script**
2. Paste the contents of [`apps-script/Code.js`](apps-script/Code.js)
3. Update `SS_ID` and `SHEET_NAME` at the top of `Code.js` to match your sheet
4. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the generated Web App URL

### 3. Configure `index.html`

Edit the constants at the top of the `<script>` section:

```javascript
const SITE_PASSCODE = '520';           // your team's passcode
const NAMES = ['Alice', 'Bob', ...];   // up to 5 names
const COLORS = {
  Alice: '#18cc48',
  Bob:   '#f472b6',
  // ...
};
```

### 4. Connect Your Data Source

Open `index.html` in a browser — on first load a config screen will ask for:
- **Sheet ID** — from step 1
- **Apps Script URL** — from step 2

These are saved to localStorage, so teammates only need to enter them once.

### 5. Host It

Push to GitHub and enable **Settings → Pages → Deploy from branch** (root, `main`).

---

## Project Structure

```
team-availabilities-scheduler/
├── index.html           # Entire frontend: HTML + CSS + JS (single file)
├── apps-script/
│   ├── Code.js          # Apps Script backend (deploy this)
│   ├── appsscript.json  # Runtime config (V8, timezone, access)
│   └── .clasp.json      # clasp CLI config for pushing updates
└── appsscript.gs        # Legacy reference copy of the backend
```

### Updating the Backend via clasp

```bash
npm install -g @google/clasp
cd apps-script
clasp login
clasp push   # syncs Code.js to your Apps Script project
```

---

## Team

| Name | Color |
|---|---|
| Dennis | Green `#18cc48` |
| Felicia | Pink `#f472b6` |
| Dominic | Blue `#60a5fa` |
| Jerry | Orange `#fb923c` |
| Houman | Yellow `#facc15` |
