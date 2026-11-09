# Steady Ground: hosting and install guide

Steady Ground is a progressive web app (PWA). Patients open one web address on their phone, add it to the home screen, and from then on it opens like an app, works offline, and keeps its data on the phone. Nothing is sent anywhere unless the patient taps **Share with my clinic**.

## What is in this folder

| File | Purpose |
|---|---|
| `index.html` | The app page |
| `styles.css` | Styling |
| `app.js` | The app itself: tracking, tools, Learn, export |
| `learn.js` | The four Learn topics: reading, reflection questions and sources |
| `jspdf.umd.min.js` | PDF library (kept locally so export works offline) |
| `manifest.webmanifest` | Tells phones the name, icon and colours of the app |
| `sw.js` | Service worker: caches the app so it opens offline |
| `icons/` | App icons |

Edit `learn.js` to change the Learn topics. Edit the content lists near the top of `app.js` (symptoms, triggers, exercises, quick reads) to change those.

## Put it on GitHub Pages (free, about 10 minutes)

1. Create a free account at github.com if you do not have one.
2. Click **New repository**. Name it `steady-ground`. Leave it **Public** (required for free Pages). Click **Create repository**.
3. On the empty repository page click **uploading an existing file**. Drag in every file and the `icons` folder from this folder. Click **Commit changes**.
4. Open **Settings** (top of the repository), then **Pages** in the left menu.
5. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to **main** and folder to **/ (root)**. Click **Save**.
6. Wait a minute or two, then refresh the Pages settings page. It shows the address, which looks like `https://YOURNAME.github.io/steady-ground/`.

That address is what you give patients. Nobody can see patient data through it; the site only serves the app files.

### Updating the app later

Upload the changed files again (same names) and commit. Then open `sw.js` and change `steady-ground-v13` to `steady-ground-v14` (and so on each time). That makes phones that already installed the app fetch the new version the next time it is opened with a connection.

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
- **Typography floor of 14 px.** Tab labels, scale anchors, day-dot labels, ring captions and the example-data badge were 11 to 13 px; the badge was all caps. All are now 14 px, in sentence case. The one exception is the chart axis numbers, at 13 px: at 14 px they collide on a narrow phone.
- **The Me button has a visible label** beside the person icon, so profile and settings are not hidden behind an icon alone.
- **Reduce visual stimulation** no longer freezes the breathing circle (a bug: the setting's blanket transition override also stopped the one animation the exercise needs). The circle still moves slowly; everything else stays still.

## Version 9: a better read-aloud voice, and bilateral stimulation

- **Read aloud now chooses a natural-sounding woman's voice.** The app previously used whatever voice the phone defaulted to, which on most Android phones and on Windows is a flat, robotic one. It now scores every English voice the device offers, preferring a female voice, then the ones the platform marks as natural, neural, premium or enhanced, then the closest locale, and reads at a slightly slower pace. Long passages are read a sentence or two at a time, which also fixes reading cutting off part way through a course session.
- **A voice picker in settings** ("Read aloud"), with a sample button, because voice quality is set by the phone rather than by the app. The card explains where to download a better voice for free on iPhone and on Android. Clearing the choice returns to the suggested voice.
- **Speech stops** when the patient navigates away or closes the app, instead of carrying on in the background.
- **New calming tool: Side to side** (bilateral stimulation), in Tools, Calm. Two forms:
  - **Eye movements** - a dot sweeping left and right for the eyes to follow, at a slow or steady pace, for 30 seconds, 1 minute or 2 minutes.
  - **Sound** - two quiet tones ten cycles apart, one in each ear, through the Web Audio API, fading in and out gently. The set-up screen asks the patient to put headphones in first and to keep the volume low, since the effect does not exist through a speaker.
  - It is framed as a settling exercise rather than memory work, tells the patient to stop and speak to their clinician if something upsetting comes up, and asks anyone whose seizure-like episodes are triggered by what they see or hear to check first. Like the other calming tools it records stress before and after into the grounding record.
  - The dot is positioned from script on each frame rather than by a CSS animation, so it keeps moving when "Reduce visual stimulation" is on, for the same reason the breathing circle does: there the movement is the exercise. That setting's description now says so.

## Version 10: the chime, and read aloud that recovers itself

- **The sound option is a soft chime instead of a drone.** Version 9 held two continuous tones a few cycles apart, one per ear. It was unpleasant to sit with, and it was also the wrong idea: alternating tones are what bilateral stimulation normally uses, and the evidence behind continuous binaural beats is thin. Each chime is now a struck bell built from three quiet partials with their own decay rates, rolled off above 2.4 kHz, reaching full volume in about 18 ms and fading to nothing within two seconds. Chimes alternate ears in time with the sweep, so the pace control now applies to sound as well.
- Headphones are now recommended rather than required: the separation is clearer through them, but the chimes still alternate on a speaker.
- **Read aloud recovers when a voice will not speak.** A phone will list voices it cannot actually play, and an iPhone lists its Enhanced and Premium voices whether or not they have been downloaded. Asking for one of those produces silence with no error, which is what broke version 9 on a real phone. The first piece of text is now watched, and if nothing has begun within a second and a half the whole passage is tried again on the phone's own default voice, which always speaks. If that fails too the app says so rather than sitting silent.
- A voice that went quiet also used to leave read aloud stuck in the speaking state, so every later tap only switched it off again. The engine is now trusted over that flag.
- Voice scoring now weights a voice the phone keeps on itself well above the words premium or enhanced in its name.

## Version 11: updates that actually arrive

Bumping the cache version was not enough to get a new version onto a phone, which is why
versions 9 and 10 kept appearing as the old app.

- **The install step now fetches past the browser cache.** `cache.addAll(FILES)` fetches
  through the browser's own HTTP cache. GitHub Pages serves files with cache headers, so a
  freshly installed worker was handed back the previous copies and stored those under the
  new version name. The bump changed nothing. Each file is now requested with
  `cache: "reload"`, which goes to the network. Reproduced the failure against a server
  sending the same cache headers, and confirmed the fix on it.
- **Files are cached one by one** rather than through `addAll`, so a single missing file
  (a renamed icon, say) no longer makes the whole install fail silently and leave the old
  version in place.
- **The worker script itself is registered with `updateViaCache: "none"`**, so the browser
  cannot serve itself a stale `sw.js` and hide a new version indefinitely, and `update()`
  is called on every open.
- **Serving is now stale-while-revalidate**: the cached copy still appears instantly and
  offline, while a fresh copy is fetched in the background for next time. A cache that has
  gone stale for any reason repairs itself on the next open, with no version bump needed.
- **A worker taking over mid-session reloads the page once**, so the patient is not left
  looking at files the previous version put there. It will not reload during a running
  exercise.

## Version 13: shifting attention with a songbird, unpack a moment, slower walking beat

- **Walking beat** now goes from 20 to 130 steps a minute (was 50 to 130).
- **Shifting attention** replaces the old list of distraction ideas. It opens by describing mindfulness as attention with purpose, then runs a 2-minute practice: an animated songbird on a branch with a synthesised nature soundscape (a stream, wind in the leaves, distant birds, a far-off dove). Four 30-second turns: look at the bird, listen and name the sounds, look again for what was missed, listen again. A soft chime marks each switch, the scene dims during listening turns, and a standing note says that attention drifting is natural. The bird breathes, blinks, tilts its head, hops, turns, preens, flutters and sings, and its song plays when its beak opens. Stress before and after is recorded as "Shifting attention".
- **5-4-3-2-1 grounding:** the hand on "Name 4 things you can feel" is redrawn as a solid open hand.
- **Unpack a moment** (Tools → Feel): seven short steps. What happened and who it was with, what the body noticed, what showed on the surface, what might be underneath, what I needed to know, what I did, then a summary card. Up to 2 choices where asked; "Nothing I noticed" and "Not sure" stand alone and are always visible; every step can be skipped. The summary describes what happened together and never says one thing caused another. Entries appear under Log → Moments, with the most frequent need shown once there are a few. **Private by default:** they are only added to the PDF and CSV (`moments-log.csv`) when the patient ticks the box on the share screen, because they can mention partners and family.

## Version 12: Learn instead of the course, rhythm walk, artwork, new logo

**Upload:** `app.js`, `learn.js` (new), `styles.css`, `index.html`, `sw.js`, `README.md`, and the five files in `icons/`. **Delete from the repo:** `course.js` (no longer used) and `chime-demo.wav` (a sample I sent, not part of the app).

- **The ten-session course is gone; My Path has a Learn tab in its place.** Four topics, each with plain-language reading, read aloud, links to the tools that put it into practice, optional reflection questions, and a "Where this comes from" list of sources:
  1. Attention and prediction: the predictive account of FND, why attention amplifies symptoms, checking, and updating predictions.
  2. Agency and a life beyond FND: sense of agency, illness identity, the layers of self, values.
  3. Thinking traps in FND: the nine distortions from the old session 5, each as a card with an example and a balanced alternative, plus tolerating uncertainty.
  4. Feelings, fear of feelings and FND: emotions as body states, emotion (affect) phobia, secure and insecure attachment, and childhood neglect and abuse as risk factors, stated as risk factors, with the point that many people with FND have no such history. It opens with a care note and a button straight to grounding.
  The short quick reads stay underneath the four topics.
- **Reflections are private by default.** They save as the patient types and stay on the phone. The share screen shows an unticked checkbox to include them; only then do they appear in the PDF (and as `learn-reflections.csv`).
- **Nothing a patient already wrote is deleted.** Old course homework answers stay in the phone's storage and backups; they are just no longer shown or exported.
- **Guided vs independent** set-up stays. Goals lead in both. Guided mode adds a line in Learn about bringing reflections to appointments.
- **Course milestones replaced** by: read a topic, read all four, answer a reflection.
- **Rhythm walk works.** Movement exercises opened from Home or "I need help right now" were set up without switching to the Tools tab, so nothing appeared. Fixed for every movement exercise and for urges.
- **Walking beat** on the rhythm walk: optional, 50 to 130 steps a minute (default 90) with a slider and -/+ buttons. Two beats alternate, a higher tick and a lower tock, synthesised as a woodblock (short pitch-dropping knock, inharmonic overtone, filtered-noise strike). Beats are scheduled on the audio clock so the tempo stays even, and two footprints light up in time.
- **Side to side:** sound mode now shows the same sweeping dot as eye mode; each chime lands on the side the dot has reached.
- **Artwork** on 5-4-3-2-1 grounding (the sense for each step, with a dot per item), progressive muscle relaxation and body scan (a figure with the area being worked on coloured), each attention-shift prompt, and each Learn topic. All decorative, theme-aware, and hidden from screen readers.
- **Header:** tapping the logo or name goes Home; "Your recovery companion" removed.
- **New logo:** a sun rising behind one smooth hill, in a circle. The earlier drafts looked like a head and shoulders next to the Me button, so it was reshaped as a landscape. New home-screen icons to match.

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
