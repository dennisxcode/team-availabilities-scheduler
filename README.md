# Team Availabilities Scheduler

A weekly availability scheduler built for a 5-person robotics squad. Each teammate marks when they're free, and everyone can see the team overlap in real time.

**Built with Claude.**

## Live Demo

**[Try it live →](https://dennisxcode.github.io/team-availabilities-scheduler/)**

Passcode: `520`

## What it does

- Each teammate picks their name and paints their availability on a grid (8am–10pm, Mon–Sun, 30-min slots)
- **My Schedule** tab — drag to paint/erase your own slots
- **Team View** tab — heatmap showing how many people are free at once; glows green when 3+ overlap, aurora animation when all 5 are free at the same time
- Syncs to Google Sheets so everyone sees live updates
- Works on mobile with a day-by-day view
- "Copy from last week" button for repeating schedules
- Week navigation — browse past and future weeks

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — single file, no build step |
| Backend | Google Apps Script (serverless) |
| Database | Google Sheets |
| Hosting | GitHub Pages |

## Screenshots

### Team View — heatmap overlay
The grid lights up based on how many teammates are free. Yellow = 2 people, green = 3–4, aurora = all 5.

### My Schedule — drag to paint
Click or drag to toggle slots. Shift+drag to erase.

## Self-hosting

Want to run your own version for your team?

1. **Create a Google Sheet** with any name
2. **Set up Apps Script** — open the sheet → Extensions → Apps Script → paste the contents of `apps-script/Code.js` → deploy as Web App (anyone can access)
3. **Edit `index.html`** — update the team names and colors at the top of the `<script>` section
4. **Open `index.html`** in a browser → enter your Sheet ID and Apps Script URL in the config screen

## Team

| Name | Color |
|---|---|
| Dennis | Green |
| Felicia | Pink |
| Dominic | Blue |
| Jerry | Orange |
| Houman | Yellow |
