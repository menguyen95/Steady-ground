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

Upload the changed files again (same names) and commit. Then open `sw.js` and change `steady-ground-v8` to `steady-ground-v9` (and so on each time). That makes phones that already installed the app fetch the new version the next time it is opened with a connection.

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

## Version 6: designed around the engagement review

- **Set-up asks three things:** how the patient's FND shows up, what gets in the way most, and one real-world goal. These drive the toolkit, goal ideas and the clinic report.
- **Today is need-first:** "What would help you today?" with four doors (I'm having symptoms, Take a small step, Understand a pattern, Reflect on my day), the current goal with its next step, and a week-in-review written in functional terms ("you tried a real-world step 3 times despite 2 episodes").
- **I'm having symptoms** opens a toolkit ordered for the patient's presentation (seizure-like, movement, sensory, speech, cognitive, fatigue, dizziness), plus what has helped them before. Logging comes after, and is optional.
- **Real-world goals** (Plan, Goals): a goal broken into graded steps, "I tried it" with did / part / not, and feedback that names the achievement ("You approached something you were avoiding").
- **Understand a pattern:** a one-minute check (avoided, pushed and crashed, checked symptoms, sought reassurance, cancelled, over-rested) with one line of teaching and one action each.
- **Progress leads with function** (tries, planned activities completed, practices, functioning, mood/energy). Symptom charts sit in their own tab with a note to look weekly, not daily.
- **Milestones reframed** around skills and real-world steps; the streak counter and streak badges are gone; practice days accumulate and never reset; there is a milestone for coming back after a break.
- **Course shows its three phases** and, once finished, Today switches to a light maintenance mode that says using the app less is a good sign.
- The reminder names the patient's current goal.

## Version 7: visual identity and UX principles

- **Identity:** ivory background, charcoal text, forest green for primary actions, sage for supporting surfaces, terracotta only in the mark and milestone medals. DM Sans throughout (28 px titles, 21 px headings, 17 px body, 15 px supporting text; no thin weights, no all-caps). All text colours meet 4.5:1 in both light and dark themes. New hills-sun-path mark and app icons.
- **Four tabs:** Home, My Path (course, goals, pacing, today's plan, flare plan), Tools (Now, Calm, Feel, Move, Log), Progress. Profile and settings sit behind the person icon in the header.
- **Context-sensitive entry on Home:** I need help right now, I have two minutes, I want to take a step (reworded in version 8). Pinned tools sit beneath; any tool can be pinned from the Tools tab.
- **Gentle completion feedback:** a brief checkmark and a short acknowledgment; no confetti, no vibration. Milestone cards slide in quietly.
- **Appearance settings:** theme (match phone, light, dark), three text sizes up to 22 px, and a "reduce visual stimulation" switch that removes animations and completion marks.
- **Progressive disclosure:** each course session opens with its first part and a "Read the full session" button. Sessions and quick reads have a Read aloud button (the phone's own speech, works offline).
- **Guided treatment vs independent use:** chosen at set-up, switchable under Me. Independent use hides course prompts from Home and leads My Path with goals; the course stays as a reference.
- **Transparent privacy:** a "Your data and privacy" card (what is saved, what is shared, no monitoring) and wording on the help screens that the app cannot call anyone.
- Set-up now lands on Home so a first-time user can complete something useful within about two minutes.

## Version 8: closing the gaps against the design review

Version 7 already covered the identity, four-tab navigation, context-sensitive entry, gentle feedback, appearance settings, pinning, privacy wording and the guided/independent split. This version closes what was left:

- **Resume where you left off.** The open tab, the session or homework being read, and any half-filled form (symptom log, thought record, feeling, goal, set-up) are saved on the phone as the patient types. Closing the app mid-task loses nothing; it reopens on the same screen. Timed exercises (paced breathing, the movement timer) are not resumed, and short-lived screens (the toolkit, a pattern check, sharing, settings) reopen on Home. Clearing data also clears this.
- **Read aloud on every exercise step**, not only course sessions: 5-4-3-2-1 grounding, muscle relaxation, body scan, attention shift and each movement exercise. Everything still works without sound.
- **Home entry points** now match the review wording: I need help right now, I have 2 minutes, I want to practise. The current goal keeps its own card; when there is no goal yet a short prompt offers to set one.
- **Typography floor of 14 px.** Tab labels, scale anchors, day-dot labels, ring captions and the example-data badge were 11 to 13 px; the badge was all caps. All are now 14 px or larger, in sentence case.
- **The Me button has a visible label** beside the person icon, so profile and settings are not hidden behind an icon alone.
- **Reduce visual stimulation** no longer freezes the breathing circle (a bug: the setting's blanket transition override also stopped the one animation the exercise needs). The circle still moves slowly; everything else stays still.

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
