# Steady Ground: hosting and install guide

Steady Ground is a progressive web app (PWA). Patients open one web address on their phone, add it to the home screen, and from then on it opens like an app, works offline, and keeps its data on the phone. Nothing is sent anywhere unless the patient taps **Share with my clinic**.

## What is in this folder

| File | Purpose |
|---|---|
| `index.html` | The app page |
| `styles.css` | Styling |
| `app.js` | The app itself: tracking, tools, course, export |
| `course.js` | The 10 course sessions, condensed from the patient workbook |
| `jspdf.umd.min.js` | PDF library (kept locally so export works offline) |
| `manifest.webmanifest` | Tells phones the name, icon and colours of the app |
| `sw.js` | Service worker: caches the app so it opens offline |
| `icons/` | App icons |

Edit `course.js` to change course wording. Edit the content lists near the top of `app.js` (symptoms, triggers, exercises, quick reads) to change those.

## Put it on GitHub Pages (free, about 10 minutes)

1. Create a free account at github.com if you do not have one.
2. Click **New repository**. Name it `steady-ground`. Leave it **Public** (required for free Pages). Click **Create repository**.
3. On the empty repository page click **uploading an existing file**. Drag in every file and the `icons` folder from this folder. Click **Commit changes**.
4. Open **Settings** (top of the repository), then **Pages** in the left menu.
5. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to **main** and folder to **/ (root)**. Click **Save**.
6. Wait a minute or two, then refresh the Pages settings page. It shows the address, which looks like `https://YOURNAME.github.io/steady-ground/`.

That address is what you give patients. Nobody can see patient data through it; the site only serves the app files.

### Updating the app later

Upload the changed files again (same names) and commit. Then open `sw.js` and change `steady-ground-v5` to `steady-ground-v6` (and so on each time). That makes phones that already installed the app fetch the new version the next time it is opened with a connection.

## Engagement features (version 3)

- **Task celebration.** Every completed task (a practice, a logged episode, a thought record, a movement exercise, homework marked done, a session read, a plan item ticked, a pacing target reached) shows a brief green checkmark with a gentle confetti burst, then clears itself. Respects reduced-motion (a quiet static tick, no motion) for patients with visual sensitivity.
- **Milestones.** 26 milestones across calming practice, tracking, course, movement, planning and sharing. Reached milestones pop up as a short celebration card; all of them are listed under Today, then Milestones. Wording is deliberately non-punitive: a missed day is never called a broken streak.
- **Practice ring.** The Today screen shows how many of the last 7 days had a calming practice, the total count, and the current run.
- **After-practice feedback.** Every calming tool ends with the practice count, the before/after stress change, and a short encouraging line.
- **Today's one thing.** A single suggested next action (a practice, the next course step, or planning the day) so patients never face a blank screen.
- **Welcome back.** After three or more days away, a gentle restart card rather than a guilt message.
- **Daily reminder.** Settings can add a repeating "Steady Ground practice" event to the phone's calendar via the share sheet (web apps cannot send notifications on iPhone).
- **Large text** option in Settings.

Edit the milestone list (`BADGES`) and encouragement lines (`ENCOURAGE`) near the top of `app.js` to change these.

## Version 5: tabs, feelings, profile

- **Six tabs:** Today, Track, Tools, Course, Progress, Me. Plan (pacing, today's plan, flare plan) is reached from Today and from Me.
- **Track** is for logging only: episodes, grounding records, thought records, feelings.
- **Progress** holds the two-week trends, an eight-week symptom progression (episodes per week, average severity, practices per week, weekly functioning), milestones, and a day-by-day timeline of everything completed.
- **Tools, Feel:** "Name the feeling" (core feeling, specific word, intensity, body sensations, urge, helpful action), a seven-stop body scan, and an urges-and-opposite-action reference. Vocabulary is original; the Braman emotion wheels are copyrighted and are not reproduced in the app.
- **Me:** name, accent colour, recent milestones and practice ring, "the version of me I am working toward", about me (included in the clinic report), care team, links to plans and settings.
- **Paced breathing** circle now grows for the whole in-breath and shrinks for the whole out-breath in one smooth motion.

## Installing on an iPhone

1. Open the address in **Safari** (not Chrome; Safari is required on iPhone).
2. Tap the **Share** button (the square with an arrow), then **Add to Home Screen**, then **Add**.
3. Open Steady Ground from the home screen from now on.

Important: the home-screen copy keeps its own data, separate from Safari. Patients should enter everything in the home-screen app, not in the Safari tab.

## Installing on Android

Open the address in Chrome. Chrome offers **Install app** or **Add to Home screen** from its menu. The same code works on Android with no changes.

## Sending data to the clinic

In the app: **Today**, then **Share with my clinic**. The patient picks a time period and what to include (PDF report, CSV files, backup file), then taps **Share**. The phone's share sheet opens, and they choose Mail, Messages, AirDrop, or Files. The report carries no name; ask patients to put their name in the message.

The PDF is the easy-read version. The CSV files open in Excel. The backup file (`.json`) restores everything on a new phone via **Backup and settings**, then **Restore**.

## Data and privacy notes

- All entries live in the browser storage of the patient's own phone. There is no server and no account.
- If the patient deletes the app from the home screen or clears Safari website data, the entries are gone. Encourage a backup or a share to the clinic every few weeks.
- Anything the patient shares travels by whatever channel they choose (email, AirDrop, and so on). Use your clinic's normal rules for receiving patient-identifiable email.
- The app shows an urgent-help notice and a crisis line (9-8-8 in Canada). Edit the text in `app.js` if your region differs.

## Before giving it to patients

Have a clinician read through the course sessions in the app against the workbook, and the exercises under **Tools, Move** against your physiotherapy advice. The condensed wording was written for a phone screen and should be checked by your team.
