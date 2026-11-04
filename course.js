/* Steady Ground course content, condensed from the CBT-DBT Psychotherapy Manual for FND patient workbook. Loaded before app.js. */
var SESSIONS_PART = [];
// Sessions 1-4 of the CBT-DBT workbook for FND, condensed for the self-paced app.

SESSIONS_PART.push({
  n: 1,
  title: "Course Overview and Symptom Tracking",
  tagline: "What this program is and how to track your symptoms",
  minutes: 10,
  teach: [
    { h: "Welcome", p: [
      "You are starting a structured psychotherapy program designed specifically for Functional Neurological Disorder (FND).",
      "This program treats FND as a nervous system regulation and behavioural retraining condition. Your symptoms are real. They are not imagined, and they are not deliberate.",
      "But symptoms are influenced by patterns in how your brain and body respond to stress, thoughts, emotions and behaviour. The purpose of this program is to help you understand those patterns and learn how to change them."
    ]},
    { h: "What this program aims to do", p: ["This program is designed to help you:"], bullets: [
      "Understand how your symptoms work",
      "Identify triggers and early warning signs",
      "Recognize patterns that may be maintaining symptoms",
      "Reduce avoidance behaviours",
      "Improve emotional regulation",
      "Gradually rebuild function",
      "Develop a practical \"tool kit\" of skills"
    ]},
    { h: "By the end, you should have", bullets: [
      "A clearer understanding of your FND",
      "Concrete skills to regulate your nervous system",
      "Strategies to reduce symptom frequency or intensity",
      "A plan for long-term recovery"
    ]},
    { h: "A skills-based program", p: [
      "This is a skills-based program: structured, agenda-driven, practice-focused and recovery-oriented.",
      "It is not an open-ended support space, a place for comparing symptoms, a place for detailed medical debate, or primary trauma therapy. Trauma may be relevant to your FND, and trauma-informed approaches are built into the skills training.",
      "The focus is on change, not just description. Talking about symptoms is useful, but only if it helps you understand patterns and apply skills."
    ]},
    { h: "The importance of practice", p: [
      "What you do between sessions is where real change happens. Your nervous system learns through practice, not just from reading about it. The more consistently you practice, the more your nervous system learns.",
      "Change can feel uncomfortable. You may notice some or all of the following:"
    ], bullets: [
      "Increased awareness of symptoms",
      "Temporary increases in anxiety",
      "Emotional reactions",
      "Frustration"
    ]},
    { p: [
      "This does not mean the treatment is failing. It often means your system is learning something new.",
      "Be kind to yourself. No one can follow all of the suggestions of this program all of the time. If you only do half the homework, that is still progress."
    ]},
    { quote: "We are striving for progress, not perfection." },
    { h: "Paced breathing", p: [
      "Your first skill is paced breathing. Practise it at least once a day, at the first sign that symptoms are starting, and before stressful events or triggers. Record each practice in the grounding activity record."
    ]},
    { h: "Your will for recovery", p: [
      "Before the skills, take a moment to establish your own will for recovery and taking control. Imagine symptoms were significantly reduced. How would your life be different?",
      "Then be honest with yourself about what feels hard about recovering. Sometimes symptoms serve a function. Naming the obstacles is part of taking control."
    ]},
    { h: "The symptom log", p: [
      "Every day you will complete a short symptom log. The example in this program uses PNES (psychogenic non-epileptic seizures) episodes, but you can log whatever your main symptom is.",
      "For each day you record how many episodes you had, when, how long they lasted, where in the body, severity, triggers, early warning signs, what improved them, and the impact on your day and on others.",
      "At the end of the week you summarize the total, the most common trigger, whether you recognized early warning signs, whether you could shorten or stop any episodes, and your overall functioning from 0 to 10."
    ]}
  ],
  practice: "Complete the symptom log every day. Practise paced breathing at least once per day, at the first opportunity when you start to feel symptoms, and before stressful events or triggers. Track your skills use in the grounding activity record. Complete the reflection homework on Day 1 and Day 3.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: Your will for recovery",
      intro: "Establishing your will for recovery and taking control.",
      fields: [
        { id: "s1d0_1", type: "long", label: "Imagine symptoms were significantly reduced. How would your life be different?" },
        { id: "s1d0_2", type: "long", label: "Obstacles in taking control: what feels hard about recovering?", hint: "Be honest with yourself, sometimes symptoms serve a function." }
      ]
    },
    {
      day: 0,
      title: "Daily symptom log",
      intro: "Complete this every day. The example uses PNES episodes; log your own main symptom.",
      fields: [
        { id: "s1log_1", type: "number", label: "Number of episodes" },
        { id: "s1log_2", type: "text", label: "Time(s) of day" },
        { id: "s1log_3", type: "text", label: "Duration (sec/min/hr)" },
        { id: "s1log_4", type: "long", label: "Description" },
        { id: "s1log_5", type: "text", label: "Location(s) in body (if applicable)" },
        { id: "s1log_6", type: "scale", label: "Severity", min: 1, max: 3, anchors: ["mild", "severe"], hint: "1 = mild, 2 = moderate, 3 = severe" },
        { id: "s1log_7", type: "long", label: "Trigger(s)" },
        { id: "s1log_8", type: "long", label: "Early warning signs" },
        { id: "s1log_9", type: "long", label: "Improved with" },
        { id: "s1log_10", type: "long", label: "Impact on your day" },
        { id: "s1log_11", type: "long", label: "Impact on others" }
      ]
    },
    {
      day: 0,
      title: "Grounding activity record",
      intro: "Record each time you use paced breathing: at least once a day, when symptoms start, and before stressful events.",
      fields: [
        { id: "s1gr_1a", type: "text", label: "Entry 1: Date and time" },
        { id: "s1gr_1b", type: "text", label: "Entry 1: What grounding skill did you use?", hint: "Paced breathing" },
        { id: "s1gr_1c", type: "scale", label: "Entry 1: Stress level before", min: 0, max: 10 },
        { id: "s1gr_1d", type: "scale", label: "Entry 1: Stress level after", min: 0, max: 10 },
        { id: "s1gr_2a", type: "text", label: "Entry 2: Date and time" },
        { id: "s1gr_2b", type: "text", label: "Entry 2: What grounding skill did you use?" },
        { id: "s1gr_2c", type: "scale", label: "Entry 2: Stress level before", min: 0, max: 10 },
        { id: "s1gr_2d", type: "scale", label: "Entry 2: Stress level after", min: 0, max: 10 },
        { id: "s1gr_3a", type: "text", label: "Entry 3: Date and time" },
        { id: "s1gr_3b", type: "text", label: "Entry 3: What grounding skill did you use?" },
        { id: "s1gr_3c", type: "scale", label: "Entry 3: Stress level before", min: 0, max: 10 },
        { id: "s1gr_3d", type: "scale", label: "Entry 3: Stress level after", min: 0, max: 10 },
        { id: "s1gr_4a", type: "text", label: "Entry 4: Date and time" },
        { id: "s1gr_4b", type: "text", label: "Entry 4: What grounding skill did you use?" },
        { id: "s1gr_4c", type: "scale", label: "Entry 4: Stress level before", min: 0, max: 10 },
        { id: "s1gr_4d", type: "scale", label: "Entry 4: Stress level after", min: 0, max: 10 },
        { id: "s1gr_5a", type: "text", label: "Entry 5: Date and time" },
        { id: "s1gr_5b", type: "text", label: "Entry 5: What grounding skill did you use?" },
        { id: "s1gr_5c", type: "scale", label: "Entry 5: Stress level before", min: 0, max: 10 },
        { id: "s1gr_5d", type: "scale", label: "Entry 5: Stress level after", min: 0, max: 10 },
        { id: "s1gr_6a", type: "text", label: "Entry 6: Date and time" },
        { id: "s1gr_6b", type: "text", label: "Entry 6: What grounding skill did you use?" },
        { id: "s1gr_6c", type: "scale", label: "Entry 6: Stress level before", min: 0, max: 10 },
        { id: "s1gr_6d", type: "scale", label: "Entry 6: Stress level after", min: 0, max: 10 },
        { id: "s1gr_7a", type: "text", label: "Entry 7: Date and time" },
        { id: "s1gr_7b", type: "text", label: "Entry 7: What grounding skill did you use?" },
        { id: "s1gr_7c", type: "scale", label: "Entry 7: Stress level before", min: 0, max: 10 },
        { id: "s1gr_7d", type: "scale", label: "Entry 7: Stress level after", min: 0, max: 10 }
      ]
    },
    {
      day: 1,
      title: "What recovery would open up",
      intro: "When symptoms are significantly reduced or managed, your life can open up. This exercise helps clarify what you're working toward. Reinforcing recovery: if symptoms were significantly reduced, what would be different?",
      fields: [
        { id: "s1d1_1", type: "long", label: "What would you be doing differently?", hint: "Examples: returning to work, exercising, socializing, sleeping better, driving, attending events" },
        { id: "s1d1_2", type: "long", label: "What would you start doing again?", hint: "Examples: hobbies, activities you've given up, roles (parent, friend, partner, worker)" },
        { id: "s1d1_3", type: "long", label: "What would feel possible that currently feels limited?", hint: "Examples: independence, hope, confidence, planning ahead" }
      ]
    },
    {
      day: 2,
      title: "The version of me I'm working toward",
      fields: [
        { id: "s1d2_1", type: "long", label: "I want to be someone who...", hint: "Example: I want to be someone who manages stress without my body shutting down" },
        { id: "s1d2_2", type: "long", label: "I want to be able to...", hint: "Example: I want to be able to go back to work part-time" },
        { id: "s1d2_3", type: "long", label: "I want others to see me as...", hint: "Example: I want others to see me as capable and not fragile" },
        { id: "s1d2_4", type: "long", label: "The version of me I'm working toward is...", hint: "Example: The version of me I'm working toward is someone who has FND but it doesn't control my life" },
        { id: "s1d2_5", type: "long", label: "One action I will take this week that moves me toward the person I want to be:", hint: "Example: Go on a walk with my friends/family." }
      ]
    },
    {
      day: 3,
      title: "Completing your FND timeline",
      intro: "Understanding when and how your symptoms started can help identify patterns. Create a simple timeline (it can be a list) that includes the following.",
      fields: [
        { id: "s1d3_1", type: "long", label: "When did you first notice symptoms?" },
        { id: "s1d3_2", type: "long", label: "Any major life events around that time (stress, illness, loss, change)?" },
        { id: "s1d3_3", type: "long", label: "How have symptoms changed over time?" },
        { id: "s1d3_4", type: "long", label: "Periods when symptoms were better/worse?" },
        { id: "s1d3_5", type: "long", label: "What do you think contributed to those changes?" }
      ]
    },
    {
      day: 7,
      title: "Weekly symptom summary",
      fields: [
        { id: "s1d7_1", type: "number", label: "Total number of episodes this week" },
        { id: "s1d7_2", type: "text", label: "Most common trigger" },
        { id: "s1d7_3", type: "choice", label: "Did you recognize early warning signs?", options: ["Yes", "No"] },
        { id: "s1d7_4", type: "choice", label: "Were you able to shorten or stop any episodes?", options: ["Yes", "No"] },
        { id: "s1d7_5", type: "scale", label: "Overall functioning this week", min: 0, max: 10 },
        { id: "s1d7_6", type: "long", label: "Additional significant information" }
      ]
    }
  ]
});

SESSIONS_PART.push({
  n: 2,
  title: "Early Warning Signs and Triggers",
  tagline: "Stress load, triggers and the body's early signals",
  minutes: 9,
  teach: [
    { h: "Regulating your nervous system", p: [
      "This session is about understanding how your symptoms started and what is maintaining them. You will also learn a second grounding skill: 5-4-3-2-1 sensory grounding.",
      "Start by looking at the timeline you made. Do your symptoms seem sudden and constant, gradual and progressive, episodic, triggered by stress, or fluctuating? What patterns stand out to you?"
    ]},
    { h: "Stress is a dial, not a switch", p: [
      "Your nervous system responds to overall stress load. Stress is like a volume dial, not an on and off switch.",
      "Stress builds like water filling a container. When the container reaches the top, symptoms spill over. Sometimes the final trigger is small, but the system was already full."
    ]},
    { h: "Three key terms", bullets: [
      "Stress = your nervous system's baseline degree of activation",
      "Trigger = situations, thoughts, sensations or stressors that increase nervous system activation",
      "Early warning sign = bodily sensations telling you that nervous system activation has begun"
    ], p: [
      "Not all stress is emotional. Physical injury, medical illness and poor sleep all count. And not all stress is negative: excitement about a new job, or before getting on a roller coaster, is stress too."
    ]},
    { h: "When stress load is high", bullets: [
      "Smaller sensations feel larger",
      "Minor dizziness feels dangerous",
      "Muscle tension triggers weakness",
      "Heart racing triggers panic",
      "Cognitive fog escalates faster"
    ], p: [
      "When stress load is lower, the same sensation may not escalate at all."
    ]},
    { quote: "Sometimes the final trigger is small, but the system was already full." },
    { h: "Mapping stress on the body", p: [
      "Your nervous system responds automatically to perceived threat, and your body has a pattern. The same areas activate repeatedly. Symptoms cluster in predictable areas of the body, and escalation follows a similar sequence.",
      "Early body sensations are a form of warning sign. Identifying them as soon as possible lets you step in and calm your nervous system before symptoms build."
    ]},
    { h: "Connecting triggers to symptoms", p: [
      "To see your own pattern, look at three recent episodes or symptom flares. For each, write what was happening in the 30 to 60 minutes before symptoms increased.",
      "Then ask: was there an early warning sign, such as a subtle physical shift, a change in breathing, muscle tension, a change in mood, racing thoughts, or just feeling \"off\"?",
      "Finally, look across the three episodes for repeated triggers. Are they mostly external situations, internal thoughts, emotional spikes, body sensations, fatigue-related, or mixed?"
    ]},
    { h: "Lowering baseline stress load", p: [
      "You cannot eliminate all stressors. But you can lower baseline activation by improving sleep, pacing activity, reducing rumination, regulating breathing, addressing conflict, and building exposure tolerance.",
      "This week's homework tracks your daily load, what contributes to it, the earliest signs you notice, and one small adjustment you can make tomorrow.",
      "Load is also about capacity. Some days you realistically have less capacity than others. Noticing when you exceed it, and what pushed you over the edge, helps you spot the load rating that usually leads to your symptoms increasing.",
      "Small adjustments add up: 5 minutes of breathing mid-day, reducing one unnecessary commitment, a short walk, going to bed 30 minutes earlier, exercising, or taking a bath."
    ]}
  ],
  practice: "Practise paced breathing OR 5-4-3-2-1 sensory grounding at least once per day, at the first opportunity when you start to feel symptoms, and before stressful events or triggers. Record your skills use in the grounding activity record. Complete written homework on Day 1, Day 3 and Day 6.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: Looking at your timeline",
      fields: [
        { id: "s2d0_1", type: "check", label: "Looking at your timeline, do symptoms seem:", options: ["Sudden and constant", "Gradual and progressive", "Episodic", "Triggered by stress", "Fluctuating"] },
        { id: "s2d0_2", type: "long", label: "What patterns stand out to you?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Stressors on your nervous system",
      intro: "Rate each area 0-10 (0 = none, 10 = extreme).",
      fields: [
        { id: "s2d0_3", type: "scale", label: "Work stress", min: 0, max: 10, anchors: ["none", "extreme"] },
        { id: "s2d0_4", type: "scale", label: "Financial strain", min: 0, max: 10, anchors: ["none", "extreme"] },
        { id: "s2d0_5", type: "scale", label: "Relationship tension", min: 0, max: 10, anchors: ["none", "extreme"] },
        { id: "s2d0_6", type: "scale", label: "Caregiver demands", min: 0, max: 10, anchors: ["none", "extreme"] },
        { id: "s2d0_7", type: "scale", label: "Conflict", min: 0, max: 10, anchors: ["none", "extreme"] },
        { id: "s2d0_8", type: "scale", label: "Isolation", min: 0, max: 10, anchors: ["none", "extreme"] },
        { id: "s2d0_9", type: "scale", label: "Sleep problems", min: 0, max: 10, anchors: ["none", "extreme"] },
        { id: "s2d0_10", type: "scale", label: "Health anxiety", min: 0, max: 10, anchors: ["none", "extreme"] },
        { id: "s2d0_11", type: "long", label: "Which type of stress feels most activated right now?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Mapping stress on the body",
      intro: "Your body has a pattern: the same areas activate repeatedly and escalation follows a similar sequence. Label what you notice in your body when you have symptoms.",
      fields: [
        { id: "s2d0_12", type: "long", label: "Where in your body do you notice stress, and in what order does it build?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Triggers and symptoms",
      intro: "Step 1: Choose three recent episodes or symptom flares.",
      fields: [
        { id: "s2d0_13", type: "text", label: "Episode 1" },
        { id: "s2d0_14", type: "text", label: "Episode 2" },
        { id: "s2d0_15", type: "text", label: "Episode 3" },
        { id: "s2d0_16", type: "note", label: "Step 2: For each episode, write what was happening in the 30-60 minutes before symptoms increased." },
        { id: "s2d0_17", type: "long", label: "Episode 1: what was happening before?" },
        { id: "s2d0_18", type: "long", label: "Episode 2: what was happening before?" },
        { id: "s2d0_19", type: "long", label: "Episode 3: what was happening before?" },
        { id: "s2d0_20", type: "check", label: "Step 3: Was there an early warning sign? Before the episode escalated, did you notice:", options: ["Subtle physical shift", "Change in breathing", "Muscle tension", "Change in mood", "Racing thoughts", "Feeling \"off\"", "Nothing noticeable"] },
        { id: "s2d0_21", type: "long", label: "Step 4: Looking across the three episodes, do you see any repeated triggers?" },
        { id: "s2d0_22", type: "check", label: "Are your triggers mostly:", options: ["External situations", "Internal thoughts", "Emotional spikes", "Body sensations", "Fatigue-related", "Mixed"] }
      ]
    },
    {
      day: 0,
      title: "Grounding activity record",
      intro: "Record your grounding practice at least daily: paced breathing or 5-4-3-2-1 sensory grounding.",
      fields: [
        { id: "s2gr_1a", type: "text", label: "Entry 1: Date and time" },
        { id: "s2gr_1b", type: "text", label: "Entry 1: What grounding skill did you use?" },
        { id: "s2gr_1c", type: "scale", label: "Entry 1: Stress level before", min: 0, max: 10 },
        { id: "s2gr_1d", type: "scale", label: "Entry 1: Stress level after", min: 0, max: 10 },
        { id: "s2gr_2a", type: "text", label: "Entry 2: Date and time" },
        { id: "s2gr_2b", type: "text", label: "Entry 2: What grounding skill did you use?" },
        { id: "s2gr_2c", type: "scale", label: "Entry 2: Stress level before", min: 0, max: 10 },
        { id: "s2gr_2d", type: "scale", label: "Entry 2: Stress level after", min: 0, max: 10 },
        { id: "s2gr_3a", type: "text", label: "Entry 3: Date and time" },
        { id: "s2gr_3b", type: "text", label: "Entry 3: What grounding skill did you use?" },
        { id: "s2gr_3c", type: "scale", label: "Entry 3: Stress level before", min: 0, max: 10 },
        { id: "s2gr_3d", type: "scale", label: "Entry 3: Stress level after", min: 0, max: 10 },
        { id: "s2gr_4a", type: "text", label: "Entry 4: Date and time" },
        { id: "s2gr_4b", type: "text", label: "Entry 4: What grounding skill did you use?" },
        { id: "s2gr_4c", type: "scale", label: "Entry 4: Stress level before", min: 0, max: 10 },
        { id: "s2gr_4d", type: "scale", label: "Entry 4: Stress level after", min: 0, max: 10 },
        { id: "s2gr_5a", type: "text", label: "Entry 5: Date and time" },
        { id: "s2gr_5b", type: "text", label: "Entry 5: What grounding skill did you use?" },
        { id: "s2gr_5c", type: "scale", label: "Entry 5: Stress level before", min: 0, max: 10 },
        { id: "s2gr_5d", type: "scale", label: "Entry 5: Stress level after", min: 0, max: 10 },
        { id: "s2gr_6a", type: "text", label: "Entry 6: Date and time" },
        { id: "s2gr_6b", type: "text", label: "Entry 6: What grounding skill did you use?" },
        { id: "s2gr_6c", type: "scale", label: "Entry 6: Stress level before", min: 0, max: 10 },
        { id: "s2gr_6d", type: "scale", label: "Entry 6: Stress level after", min: 0, max: 10 },
        { id: "s2gr_7a", type: "text", label: "Entry 7: Date and time" },
        { id: "s2gr_7b", type: "text", label: "Entry 7: What grounding skill did you use?" },
        { id: "s2gr_7c", type: "scale", label: "Entry 7: Stress level before", min: 0, max: 10 },
        { id: "s2gr_7d", type: "scale", label: "Entry 7: Stress level after", min: 0, max: 10 }
      ]
    },
    {
      day: 1,
      title: "What stood out from session 2",
      fields: [
        { id: "s2d1_1", type: "long", label: "What stood out to you most from session 2?" },
        { id: "s2d1_2", type: "long", label: "What pattern (involving stress, triggers, and bodily sensations) did you recognize for the first time?" }
      ]
    },
    {
      day: 3,
      title: "Lowering baseline stress load",
      intro: "You cannot eliminate all stressors. But you can lower baseline activation: improve sleep, pace activity, reduce rumination, regulate breathing, address conflict, build exposure tolerance.",
      fields: [
        { id: "s2d3_1", type: "scale", label: "Step 1: Today's stress load", min: 0, max: 10, anchors: ["completely calm", "overwhelmed / overloaded"], hint: "0 = completely calm, 5 = moderate stress, 10 = overwhelmed / overloaded" },
        { id: "s2d3_2", type: "note", label: "Step 2: What contributed to today's load? Rate each area 0-10." },
        { id: "s2d3_3", type: "scale", label: "Sleep quality", min: 0, max: 10 },
        { id: "s2d3_4", type: "scale", label: "Physical fatigue", min: 0, max: 10 },
        { id: "s2d3_5", type: "scale", label: "Work stress", min: 0, max: 10 },
        { id: "s2d3_6", type: "scale", label: "Conflict / relationship tension", min: 0, max: 10 },
        { id: "s2d3_7", type: "scale", label: "Financial worry", min: 0, max: 10 },
        { id: "s2d3_8", type: "scale", label: "Caregiver demands", min: 0, max: 10 },
        { id: "s2d3_9", type: "scale", label: "Health anxiety", min: 0, max: 10 },
        { id: "s2d3_10", type: "scale", label: "Rumination / worry", min: 0, max: 10 },
        { id: "s2d3_11", type: "scale", label: "Overcommitment", min: 0, max: 10 },
        { id: "s2d3_12", type: "scale", label: "Sensory overload (noise, crowds, screens)", min: 0, max: 10 },
        { id: "s2d3_13", type: "scale", label: "Medical thinking / symptom monitoring", min: 0, max: 10 },
        { id: "s2d3_14", type: "text", label: "Other (describe)" },
        { id: "s2d3_15", type: "scale", label: "Other (rating)", min: 0, max: 10 },
        { id: "s2d3_16", type: "check", label: "Step 3: Internal activation signs. Today I noticed:", options: ["Shoulder tension", "Jaw clenching", "Shallow breathing", "Racing thoughts", "Irritability", "Heaviness", "Dizziness", "Brain fog", "Restlessness", "Emotional surge", "Fatigue", "Dissociation"] },
        { id: "s2d3_17", type: "text", label: "Earliest sign I noticed" },
        { id: "s2d3_18", type: "choice", label: "Step 4: How much capacity did I realistically have today?", options: ["Low", "Moderate", "High"] },
        { id: "s2d3_19", type: "choice", label: "Did I exceed my capacity?", options: ["Yes", "No"] },
        { id: "s2d3_20", type: "long", label: "What pushed me over the edge (if applicable)?" },
        { id: "s2d3_21", type: "check", label: "Step 5: What helped lower load? Today I used:", options: ["Paced breathing", "Grounding", "Took a break", "Set a boundary", "Reduced rumination", "Pacing strategy", "Exposure task", "Asked for help", "Physical movement", "Nothing"] },
        { id: "s2d3_22", type: "choice", label: "Did symptoms improve after using any grounding skills?", options: ["Yes", "No"] },
        { id: "s2d3_23", type: "long", label: "What helped most?" },
        { id: "s2d3_24", type: "long", label: "Step 6: What can you commit to doing tomorrow in order to lower your stress load? One small adjustment.", hint: "Examples: 5 minutes breathing mid-day, reduce one unnecessary commitment, short walk, go to bed 30 minutes earlier, exercising, taking a bath" }
      ]
    },
    {
      day: 6,
      title: "Load pattern reflection (end of week)",
      fields: [
        { id: "s2d6_1", type: "long", label: "On Day 3 you committed to an activity/behaviour to lower your stress level. Did you try it? What happened?" },
        { id: "s2d6_2", type: "long", label: "Looking at several days, identify the load rating that usually leads to your symptoms increasing. What is the number?" },
        { id: "s2d6_3", type: "long", label: "What small changes in your day to day life were helpful in reducing your stress load?" },
        { id: "s2d6_4", type: "long", label: "Are there days when your stress load was high but symptoms stayed manageable? Why?" }
      ]
    }
  ]
});

SESSIONS_PART.push({
  n: 3,
  title: "Identifying and Expressing Emotions",
  tagline: "Emotions as full-body states, and how to name and release them",
  minutes: 11,
  teach: [
    { h: "Emotion identification and regulation", p: [
      "This session has two parts: understanding emotions as full-body states, using the feelings-sensation wheel, and expressing emotions through unsent letters. You will also learn progressive muscle relaxation."
    ]},
    { h: "Progressive muscle relaxation", p: [
      "Set aside 10 to 15 minutes, in a place where you will not be disturbed.",
      "For the first week or two, practise this exercise twice a day until you get the hang of it. The better you become at it, the quicker the relaxation response will \"kick in\" when you really need it.",
      "You do not need to be feeling anxious when you practise. It is better to first practise when you are calm. That way, it will be easier to do when feeling anxious."
    ]},
    { h: "Emotions as full-body states", p: [
      "We need emotions to survive. Emotions evolved to help us survive and navigate relationships. There are no good or bad emotions, and every emotion has a function."
    ], bullets: [
      "Fear detects threat and prepares protection.",
      "Anger signals boundary violation and mobilizes action.",
      "Sadness signals loss and promotes withdrawal and reflection.",
      "Joy reinforces connection and safety.",
      "Shame signals when we have violated group values and promotes accountability.",
      "Guilt signals when we have violated our own values and promotes accountability.",
      "Disgust protects from contamination (physical or moral)."
    ]},
    { p: [
      "Every emotion activates the nervous system. Most of the time, the body will signal an emotion before your mind can become aware of it and label it.",
      "Many people believe that emotions are thoughts. But they are whole-body responses that involve the autonomic nervous system, hormonal shifts and muscle activation."
    ]},
    { h: "What each emotion activates", bullets: [
      "Fear: heart rate, rapid and shallow breathing, muscle tension, attention narrowing",
      "Anger: muscle activation, increased energy, heat, jaw tension",
      "Sadness: low energy, slowed movement, reduced motivation",
      "Joy: increased motivation, relaxed muscle tone, increased energy",
      "Shame: collapse, withdrawal, reduced eye contact, heaviness in chest and abdomen",
      "Guilt: heaviness in chest, tight stomach, urge to fix or reach out, increased rumination (mental replay)",
      "Disgust: nausea, facial contraction, urge to push away"
    ]},
    { quote: "The body signals an emotion before your mind can label it." },
    { h: "Using the feelings-sensation wheel", p: [
      "Step 1: Before naming an emotion, notice what your body is doing right now. Scan slowly from head to toes for muscle tension, temperature, movement (restlessness, feeling frozen or shaky) and your breathing pattern.",
      "Step 2: Find your physical sensations on the outermost ring of the wheel. Move inward to the emotion cluster they connect to, then further inward to the core emotion (anger, fear, sadness, surprise, disgust).",
      "Step 3: Name it to tame it. Rate the intensity from 0 to 10, and ask towards whom you feel it and why. Complete the sentence: I feel [emotion] towards [person] because [situation].",
      "Step 4: Regulation practice. Focus on the body area most affected. Do paced breathing and consciously relax that area while repeating the sentence, for 3 to 4 minutes. Then re-rate the intensity."
    ]},
    { h: "Unsent letters", p: [
      "Many of us carry unfinished emotional conversations: things that were never said, feelings we pushed down. Even if the situation is long over, the emotional residue can remain active. It can show up as tension, rumination, irritability, guilt and physical symptoms.",
      "Sometimes we carry anger, resentment, guilt, jealousy or hurt for years. Holding onto these emotions often continues to harm us more than the other person.",
      "You will write to someone, but the letter will not be sent. This is about emotional expression and giving yourself permission to acknowledge and say what was never said.",
      "Choose someone where there is still emotional energy, but not something so intense that it feels destabilizing. Allow yourself to be as honest as possible. You do not have to be polite, fair or balanced. This is about your emotional experience."
    ]}
  ],
  practice: "Practise progressive muscle relaxation at least 4 days this week for at least 10 minutes at a time. Complete the written homework. Complete the symptom tracking form. Continue to monitor stress levels and use the stress lowering strategies reviewed last session.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: The feelings-sensation wheel",
      fields: [
        { id: "s3d0_1", type: "note", label: "Step 1: Scan slowly from head to toes. Write down 3 physical sensations, including what it feels like and where it is happening. E.g. \"I feel tightness in my jaw\" or \"I feel heat and sweatiness in my palms\"." },
        { id: "s3d0_2", type: "text", label: "Sensation 1" },
        { id: "s3d0_3", type: "text", label: "Sensation 2" },
        { id: "s3d0_4", type: "text", label: "Sensation 3" },
        { id: "s3d0_5", type: "text", label: "Sensation 4 (optional)" },
        { id: "s3d0_6", type: "note", label: "Step 2: Using the wheel, find your sensations on the outermost ring. Move inward to the emotion cluster, then to the core emotion (anger, fear, sadness, surprise, disgust)." },
        { id: "s3d0_7", type: "text", label: "Core emotion" },
        { id: "s3d0_8", type: "scale", label: "Step 3: Where on the volume dial from 0 to 10 is the intensity of the emotion I'm feeling?", min: 0, max: 10, anchors: ["no intensity, barely any feeling", "the most intense it has ever been"] },
        { id: "s3d0_9", type: "long", label: "Towards whom am I feeling this emotion and what are the reasons why I might be feeling this way?" },
        { id: "s3d0_10", type: "long", label: "Complete this sentence: I feel [emotion] towards [person] because [situation]." },
        { id: "s3d0_11", type: "note", label: "Step 4: Focus on the body area most affected. Do paced breathing and consciously relax that part of your body while repeating the sentence above, for 3-4 minutes. Then re-rate." },
        { id: "s3d0_12", type: "scale", label: "Intensity before", min: 0, max: 10 },
        { id: "s3d0_13", type: "scale", label: "Intensity after", min: 0, max: 10 }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: The unsent letter",
      intro: "Part 1: Think of 2-3 people that you still feel anger/hurt/resentment/guilt towards, or have unfinished business with: a parent, sibling, partner/ex, friend, boss/coworker. Write their initials and rate the intensity of the emotion you feel towards them.",
      fields: [
        { id: "s3d0_14", type: "text", label: "Person 1 (initials)" },
        { id: "s3d0_15", type: "scale", label: "Person 1: Intensity rating", min: 0, max: 10 },
        { id: "s3d0_16", type: "text", label: "Person 2 (initials)" },
        { id: "s3d0_17", type: "scale", label: "Person 2: Intensity rating", min: 0, max: 10 },
        { id: "s3d0_18", type: "text", label: "Person 3 (initials)" },
        { id: "s3d0_19", type: "scale", label: "Person 3: Intensity rating", min: 0, max: 10 },
        { id: "s3d0_20", type: "note", label: "Choose one of the above to write your letter about (ideally with an intensity rating anywhere from 4-7)." },
        { id: "s3d0_21", type: "choice", label: "Who is this exercise about?", options: ["Someone from your past", "Someone in your present"] },
        { id: "s3d0_22", type: "text", label: "Write their name (or initials)" },
        { id: "s3d0_23", type: "long", label: "What emotions do you still feel toward them?" },
        { id: "s3d0_24", type: "long", label: "Part 2: The unsent letter. Write a letter to this person. Do not censor yourself, because this letter will not be sent. Write continuously for 15 minutes and let all your thoughts flow.", hint: "Prompts: \"What you did that hurt me was...\" \"At the time, I felt...\" \"What I needed but did not receive was...\" \"What this cost me was...\" \"What I have been carrying since then is...\"" },
        { id: "s3d0_25", type: "text", label: "Part 3: What emotion felt strongest while writing?" },
        { id: "s3d0_26", type: "long", label: "Did anything surprise you?" },
        { id: "s3d0_27", type: "choice", label: "Did the intensity of your emotion increase, decrease, or stay the same?", options: ["Increase", "Decrease", "Stay the same"] }
      ]
    },
    {
      day: 2,
      title: "Pause and label a shift",
      intro: "When you notice a shift in mood or symptoms, pause and complete this.",
      fields: [
        { id: "s3d2_1", type: "long", label: "Trigger (What happened?)" },
        { id: "s3d2_2", type: "check", label: "Body sensations (What did you notice first?)", options: ["Jaw tension", "Shoulder tension", "Tight chest", "Stomach discomfort", "Racing heart", "Heaviness", "Restlessness", "Brain fog", "Dissociation", "Other"] },
        { id: "s3d2_3", type: "text", label: "Other body sensation (if any)" },
        { id: "s3d2_4", type: "text", label: "Earliest physical sign" },
        { id: "s3d2_5", type: "text", label: "Primary emotion (use the Emotion Wheel)" },
        { id: "s3d2_6", type: "text", label: "More specific word from the wheel" },
        { id: "s3d2_7", type: "long", label: "What did this emotion urge you to do?" },
        { id: "s3d2_8", type: "long", label: "Complete this sentence: I feel [emotion] towards [person] because [situation]." }
      ]
    },
    {
      day: 3,
      title: "Letters between your younger and adult self",
      intro: "Choose an age or time in your life when you struggled emotionally.",
      fields: [
        { id: "s3d3_1", type: "long", label: "Part 1: Younger self speaks. Write from the perspective of your younger self for 10-15 minutes.", hint: "What were you feeling then? What did you need? What did you not receive? What felt unfair, confusing, or overwhelming?" },
        { id: "s3d3_2", type: "long", label: "Part 2: Adult self responds. Now respond as your present-day self, in a letter to your younger self.", hint: "What do you understand now? What would you say to comfort them? What responsibility was never theirs? What strength did they show?" },
        { id: "s3d3_3", type: "long", label: "Part 3: How did having your adult self respond feel in your body?" },
        { id: "s3d3_4", type: "long", label: "What emotion was strongest?" },
        { id: "s3d3_5", type: "long", label: "Did anything soften?" }
      ]
    },
    {
      day: 5,
      title: "Pause and label a shift",
      intro: "When you notice a shift in mood or symptoms, pause and complete this.",
      fields: [
        { id: "s3d5_1", type: "long", label: "Trigger (What happened?)" },
        { id: "s3d5_2", type: "check", label: "Body sensations (What did you notice first?)", options: ["Jaw tension", "Shoulder tension", "Tight chest", "Stomach discomfort", "Racing heart", "Heaviness", "Restlessness", "Brain fog", "Dissociation", "Other"] },
        { id: "s3d5_3", type: "text", label: "Other body sensation (if any)" },
        { id: "s3d5_4", type: "text", label: "Earliest physical sign" },
        { id: "s3d5_5", type: "text", label: "Primary emotion (use the Emotion Wheel)" },
        { id: "s3d5_6", type: "text", label: "More specific word from the wheel" },
        { id: "s3d5_7", type: "long", label: "What did this emotion urge you to do?" },
        { id: "s3d5_8", type: "long", label: "Complete this sentence: I feel [emotion] towards [person] because [situation]." }
      ]
    }
  ]
});

SESSIONS_PART.push({
  n: 4,
  title: "Behavioural Change and Avoidance",
  tagline: "How avoidance keeps symptoms going, and how to reverse it",
  minutes: 12,
  teach: [
    { h: "Change your behaviour, change your symptoms", p: [
      "When symptoms feel unpredictable or overwhelming, it makes sense to avoid situations that might trigger them.",
      "But avoidance reduces anxiety in the short term and strengthens symptoms in the long term. Avoidance teaches the brain: \"This situation is dangerous.\" The threshold for symptoms lowers.",
      "Ask yourself: what activities have you reduced or stopped because of your FND? What does avoidance do for you in the short term, and what has it cost you in the long term?"
    ]},
    { h: "Events, worries and avoidance", p: [
      "An event such as a physical sensation (dizziness, weakness, tremor), a stressful situation, relationship conflict, fatigue, or a reminder of past illness or injury sets things off.",
      "Common FND worries follow: \"This means something is wrong.\" \"I am losing control.\" \"I won't be able to cope.\" \"People are going to notice something is wrong with me.\" \"This will only get worse.\"",
      "Worries often worsen physical anxiety: muscle tension, rapid shallow breathing, symptom intensity, and magnified, more intense FND symptoms.",
      "Avoidance can be physical, social, occupational, emotional or cognitive (such as not thinking about goals). Examples: avoiding movement, driving, social settings or exercise, staying in bed, monitoring symptoms, reassurance seeking, and carrying \"just in case\" supports."
    ]},
    { h: "What happens with avoidance", bullets: [
      "The brain registers: \"Good thing we escaped. That was unsafe.\"",
      "The threat model strengthens.",
      "Your sensitivity to stress increases.",
      "Your threshold for FND symptoms lowers."
    ]},
    { h: "Behavioural activation", p: [
      "Behavioural activation reverses this process by re-training the nervous system through corrective learning: \"This situation is survivable.\" \"Movement is safe.\" \"Distress rises and falls.\"",
      "It is most impactful when your actions are rooted in your values, for example being a present parent, intellectual engagement, or physical independence.",
      "Short-term, behavioural activation temporarily increases anxiety or symptoms. Long-term, it increases resilience and function.",
      "Choose one avoided activity, rate your distress 0 to 10, and break it into 5 small steps. As you progress, symptoms might increase temporarily. If so, use your grounding skills to regulate before continuing. Move through the steps based on repetition and consistency."
    ]},
    { quote: "Distress rises and falls. This situation is survivable." },
    { h: "Checking the facts", p: [
      "In FND, the nervous system can react quickly and strongly. Much of the time it is not reacting proportionally to any real danger, but to predicted danger. How can you tell the difference?",
      "Checking the facts helps you answer: is my emotion matching the actual situation, or is it driven by a prediction my brain is making?",
      "Examples of predictions: \"If I walk, I will collapse.\" \"If my tremor starts, I'll lose control.\" \"If I go to the store, I'll have an episode and embarrass myself.\" \"If I feel dizzy, it means something is medically wrong.\" \"If symptoms spike, it means I'm damaging my body.\""
    ]},
    { h: "Interpretation versus fact", bullets: [
      "Interpretation: \"I'm going to collapse.\" Fact: \"My legs feel weak. I'm standing. I have not collapsed yet.\"",
      "Interpretation: \"I'm not safe.\" Fact: \"I'm in a grocery store. It is daytime. There are people around. I can sit or leave if needed.\"",
      "Interpretation: \"This will never stop.\" Fact: \"Symptoms have risen and fallen before. I have had spikes.\""
    ], p: [
      "Evidence for is things that have actually happened, direct experiences: \"I collapsed once last year.\" \"I feel dizzy right now.\"",
      "Evidence against: \"My shaking has always eventually stopped.\" \"I have left stores safely before.\" \"I can sit down if needed.\" \"I have skills now I didn't have before.\""
    ]},
    { h: "Opposite action", p: [
      "Once you have checked the facts and found the danger is predicted rather than real, the next move is to act opposite to the urge to avoid: stay a little longer, take the next small step, and let distress rise and fall."
    ]}
  ],
  practice: "Choose 1-2 steps from your behavioural activation ladder to practise this week. Be as specific as possible about when, how long and how many times. Use slow breathing, grounding, or staying 2 more minutes if symptoms flare.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: Mapping avoidance loops",
      intro: "Review the following avoidance behaviours and mark which apply to you. Then consider what these behaviours are protecting you from and what they end up costing you in the long run.",
      fields: [
        { id: "s4d0_1", type: "check", label: "Which of these apply to you?", options: ["I cancel plans at the last minute", "I avoid leaving home alone", "I stay near \"safe people\"", "I stop activities if symptoms begin", "I rest excessively", "I google symptoms frequently", "I ask for reassurance often", "I avoid exercise", "I avoid conflict", "I distract constantly"] },
        { id: "s4d0_2", type: "long", label: "What are these behaviours protecting you from?" },
        { id: "s4d0_3", type: "long", label: "What do they end up costing you in the long run?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Behavioural activation in small steps",
      intro: "Choose one avoided activity and create 5 small steps toward it.",
      fields: [
        { id: "s4d0_4", type: "text", label: "Activity" },
        { id: "s4d0_5", type: "scale", label: "Rate distress", min: 0, max: 10 },
        { id: "s4d0_6", type: "text", label: "Step 1: Description" },
        { id: "s4d0_7", type: "scale", label: "Step 1: Distress", min: 0, max: 10 },
        { id: "s4d0_8", type: "text", label: "Step 2: Description" },
        { id: "s4d0_9", type: "scale", label: "Step 2: Distress", min: 0, max: 10 },
        { id: "s4d0_10", type: "text", label: "Step 3: Description" },
        { id: "s4d0_11", type: "scale", label: "Step 3: Distress", min: 0, max: 10 },
        { id: "s4d0_12", type: "text", label: "Step 4: Description" },
        { id: "s4d0_13", type: "scale", label: "Step 4: Distress", min: 0, max: 10 },
        { id: "s4d0_14", type: "text", label: "Step 5: Description" },
        { id: "s4d0_15", type: "scale", label: "Step 5: Distress", min: 0, max: 10 },
        { id: "s4d0_16", type: "note", label: "As you progress through the steps, symptoms might increase temporarily. If this happens, use the grounding skills you have learned to regulate before continuing. Move through the steps based on repetition and consistency." }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Checking the facts",
      intro: "Take one prediction your brain makes about your symptoms and weigh the evidence.",
      fields: [
        { id: "s4d0_17", type: "long", label: "Evidence for", hint: "Things that have actually happened, direct experiences" },
        { id: "s4d0_18", type: "long", label: "Evidence against", hint: "How many times have I predicted catastrophe and it didn't happen? When symptoms spiked before, did I recover? Have I handled similar situations? Have symptoms ever improved even slightly with action/therapy/skills?" }
      ]
    },
    {
      day: 1,
      title: "Behavioural activation plan",
      intro: "Choose 1-2 steps from the behavioural activation steps to practice this week. Be as specific as possible! Vague plans do not work as well as specific plans.",
      fields: [
        { id: "s4d1_1", type: "long", label: "Step(s) I will practice" },
        { id: "s4d1_2", type: "text", label: "When" },
        { id: "s4d1_3", type: "text", label: "How long" },
        { id: "s4d1_4", type: "text", label: "How many times this week" },
        { id: "s4d1_5", type: "check", label: "Identify the skills you will use if you experience symptom flares or your anxiety worsening:", options: ["Slow breathing", "Grounding", "Stay 2 more minutes", "Other"] },
        { id: "s4d1_6", type: "text", label: "Other skill (if any)" },
        { id: "s4d1_7", type: "check", label: "Identify the life values that this behaviour supports you in:", options: ["Independence", "Connection", "Health", "Courage", "Contribution", "Growth", "Family", "Integrity", "Other"] },
        { id: "s4d1_8", type: "text", label: "Other value (if any)" },
        { id: "s4d1_9", type: "choice", label: "After completing the step: Did I complete it?", options: ["Yes", "Partially", "No"] },
        { id: "s4d1_10", type: "scale", label: "Distress after", min: 0, max: 10 },
        { id: "s4d1_11", type: "long", label: "What did I learn?" },
        { id: "s4d1_12", type: "long", label: "Did symptoms equal danger?" }
      ]
    },
    {
      day: 2,
      title: "Behavioural activation plan",
      intro: "Choose 1-2 steps from the behavioural activation steps to practice this week. Be as specific as possible! Vague plans do not work as well as specific plans.",
      fields: [
        { id: "s4d2_1", type: "long", label: "Step(s) I will practice" },
        { id: "s4d2_2", type: "text", label: "When" },
        { id: "s4d2_3", type: "text", label: "How long" },
        { id: "s4d2_4", type: "text", label: "How many times this week" },
        { id: "s4d2_5", type: "check", label: "Identify the skills you will use if you experience symptom flares or your anxiety worsening:", options: ["Slow breathing", "Grounding", "Stay 2 more minutes", "Other"] },
        { id: "s4d2_6", type: "text", label: "Other skill (if any)" },
        { id: "s4d2_7", type: "check", label: "Identify the life values that this behaviour supports you in:", options: ["Independence", "Connection", "Health", "Courage", "Contribution", "Growth", "Family", "Integrity", "Other"] },
        { id: "s4d2_8", type: "text", label: "Other value (if any)" },
        { id: "s4d2_9", type: "choice", label: "After completing the step: Did I complete it?", options: ["Yes", "Partially", "No"] },
        { id: "s4d2_10", type: "scale", label: "Distress after", min: 0, max: 10 },
        { id: "s4d2_11", type: "long", label: "What did I learn?" },
        { id: "s4d2_12", type: "long", label: "Did symptoms equal danger?" }
      ]
    },
    {
      day: 3,
      title: "Noticing how your brain predicts threat",
      intro: "The goal of this exercise is to increase awareness of how your brain predicts threat. Step 1: Choose one moment when anxiety increased, you wanted to avoid something, or symptoms began or worsened.",
      fields: [
        { id: "s4d3_1", type: "long", label: "Situation" },
        { id: "s4d3_2", type: "text", label: "Emotion" },
        { id: "s4d3_3", type: "scale", label: "Rate the emotion", min: 0, max: 10 },
        { id: "s4d3_4", type: "long", label: "What was the prediction that my brain made (be as specific as possible)?" },
        { id: "s4d3_5", type: "choice", label: "Step 2: Was this danger or discomfort?", options: ["Danger", "Discomfort", "Embarrassment", "Uncertainty"] },
        { id: "s4d3_6", type: "long", label: "Reflection: Did simply noticing the prediction change anything?" }
      ]
    },
    {
      day: 4,
      title: "Reality testing your predictions",
      intro: "This exercise builds on yesterday's work to help you reality test your predictions. A camera does not interpret, does not see into the future, does not exaggerate, and cannot read minds. It records only what is visible and measurable.",
      fields: [
        { id: "s4d4_1", type: "note", label: "If your sentence includes words like \"going to\", \"always\", \"never\", \"ruined\", \"unsafe\", \"can't cope\", \"everyone\", \"disaster\" or \"means that\", it is likely a prediction, not a fact." },
        { id: "s4d4_2", type: "long", label: "Step 1: Write your original thought" },
        { id: "s4d4_3", type: "long", label: "Rewrite it in pure camera language" },
        { id: "s4d4_4", type: "long", label: "Step 2: Evidence for", hint: "Things that have actually happened, direct experiences" },
        { id: "s4d4_5", type: "long", label: "Evidence against", hint: "How many times have I predicted catastrophe and it didn't happen? When symptoms spiked before, did I recover? Have I handled similar situations? Have symptoms ever improved even slightly with action/therapy/skills?" },
        { id: "s4d4_6", type: "note", label: "Step 3: Balanced statement. Acknowledge the sensation, acknowledge the prediction, state the facts, reframe danger vs discomfort, identify the next step. Example: \"I'm noticing my legs feel shaky. My brain is predicting collapse. The facts are that I am standing and have not collapsed. This is uncomfortable, not dangerous. I can walk for 2 minutes and reassess.\"" },
        { id: "s4d4_7", type: "text", label: "I'm noticing..." },
        { id: "s4d4_8", type: "text", label: "My brain is predicting..." },
        { id: "s4d4_9", type: "text", label: "The facts are..." },
        { id: "s4d4_10", type: "note", label: "This is uncomfortable, not dangerous." },
        { id: "s4d4_11", type: "text", label: "I can..." }
      ]
    },
    {
      day: 6,
      title: "Weekly summary",
      fields: [
        { id: "s4d6_1", type: "long", label: "What avoidance did I reduce?" },
        { id: "s4d6_2", type: "long", label: "What surprised me?" },
        { id: "s4d6_3", type: "long", label: "Did fear accurately predict outcomes?" },
        { id: "s4d6_4", type: "long", label: "Did symptoms always escalate?" },
        { id: "s4d6_5", type: "long", label: "What did I prove to myself?" },
        { id: "s4d6_6", type: "long", label: "What is my next step up the ladder?" }
      ]
    }
  ]
});
// Sessions 5-7 of the CBT-DBT workbook for FND, condensed for the app.

SESSIONS_PART.push({
  n: 5,
  title: "Cognitive Distortions",
  tagline: "Spotting alarm-driven thinking and finding balance",
  minutes: 11,
  teach: [
    {
      h: "Cognitive distortions in FND",
      p: [
        "In FND, the alarm system can become hyper-vigilant, threat-focused, catastrophic and intolerant of uncertainty. This can create thought patterns that do not reflect reality.",
        "Over time, repeated alarm activation can create patterns of thinking that become automatic. These are called cognitive distortions. They can be related to symptoms, or show up in everyday life and relationships, and cause stress.",
        "An automatic thought is the actual sentence that pops into your mind in response to a situation. For example: \"This dizziness means something is seriously wrong.\"",
        "You cannot eliminate automatic thoughts. They will always appear. However, you can identify distortions and challenge the pattern behind them.",
        "A cognitive distortion is a pattern of faulty thinking that creates automatic thoughts."
      ]
    },
    {
      h: "What distortions do",
      p: ["Cognitive distortions lead you to:"],
      bullets: [
        "Overestimate danger",
        "Underestimate your coping ability",
        "Focus on worst-case outcomes",
        "Ignore neutral or positive evidence"
      ]
    },
    {
      h: "Where they show up",
      p: ["Cognitive distortions may be related to:"],
      bullets: [
        "Symptoms (\"This means something is wrong.\")",
        "Social situations (\"People think I'm weak.\")",
        "Work or performance (\"I'll fail if I try.\")",
        "Health and safety (\"Something was missed.\")"
      ]
    },
    {
      h: "What this session is for",
      p: ["This session will help you to:"],
      bullets: [
        "Slow down alarm-driven thoughts",
        "Examine whether they are accurate",
        "Increase tolerance of uncertainty",
        "Reduce catastrophic predictions",
        "Strengthen balanced thinking"
      ]
    },
    {
      h: "The nine distortions",
      p: ["Each one below has a definition, an FND-related example, and a balanced alternative thought."],
      bullets: [
        "Catastrophizing: jumping to the worst possible outcome and assuming it is likely. \"My legs feel weak today, I'm going to lose the ability to walk.\" Balanced: \"My weakness fluctuates. It has improved before. A difficult day does not mean permanent loss.\"",
        "Fortune telling: predicting a negative future without solid evidence. \"If I attend the meeting, I'll embarrass myself.\" Balanced: \"I can't predict the future. I may feel anxious, but that doesn't mean I'll embarrass myself.\"",
        "Mind reading: assuming you know what others think, usually something critical. \"My partner thinks I'm exaggerating my symptoms.\" Balanced: \"I don't actually know what they're thinking. I could ask, or consider other possibilities.\"",
        "Emotional reasoning: believing something must be true because it feels true. \"I feel dizzy and scared, so something dangerous must be happening.\" Balanced: \"Feeling scared doesn't automatically mean I'm in danger. Anxiety can create strong physical sensations.\"",
        "All-or-nothing thinking: viewing situations in extreme categories instead of on a spectrum. \"If I needed to rest today, then I failed.\" Balanced: \"Resting when needed is part of pacing. Progress is not all-or-nothing.\"",
        "Should statements: holding rigid, unrealistic rules about yourself or others. \"I should be able to handle stress like everyone else.\" Balanced: \"Everyone has limits. My nervous system is sensitive right now, and I'm working on strengthening it.\"",
        "Overgeneralization: taking one event and applying it broadly to all situations. \"I had symptoms at dinner once, I can't handle social situations.\" Balanced: \"One difficult dinner doesn't define all social events. I can build tolerance gradually.\"",
        "Intolerance of uncertainty: feeling unable to tolerate not knowing, and needing full certainty before acting. \"Unless I'm completely sure I won't have symptoms, I shouldn't drive.\" Balanced: \"I can't guarantee zero symptoms. I can plan, use skills, and tolerate some uncertainty.\"",
        "Safety bias (\"better not risk it\"): choosing avoidance because it feels safer in the short term. \"It's better not to start exercising, I might trigger symptoms.\" Balanced: \"Avoiding exercise keeps my system deconditioned. Starting small and pacing is safer long-term.\""
      ]
    },
    {
      h: "Building a balanced thought",
      p: [
        "Balanced thoughts are not necessarily \"positive thinking\". A true balanced thought moves towards what is reflected in reality: more realistic, less extreme, more flexible, and based on evidence.",
        "As you write a balanced thought, consider the evidence for the thought: what objectively supports it? Be specific.",
        "Then consider the evidence against it. Include past experiences, fluctuations, alternative explanations, and skills you have used before."
      ]
    },
    {
      h: "Tolerating uncertainty",
      p: ["Intolerance of uncertainty is the tendency to believe that:"],
      bullets: [
        "Not knowing is unsafe.",
        "Uncertainty must be eliminated before acting.",
        "If something is uncertain, it is dangerous.",
        "I cannot cope unless I have full clarity."
      ]
    },
    {
      p: [
        "Certainty-seeking reduces anxiety temporarily, but strengthens the belief that uncertainty is dangerous. Over time, the nervous system becomes biased toward \"better safe than sorry\", and this leads to your life shrinking."
      ]
    },
    { quote: "You cannot eliminate automatic thoughts, but you can identify the distortion and challenge the pattern behind it." }
  ],
  practice: "Practise a grounding exercise every day for at least 10 minutes at a time and fill out the grounding record. Complete the written homework on Day 1, Day 3 and Day 6. Complete the symptom tracking form. Continue to monitor stress levels and use the stress-lowering strategies from previous sessions.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: Identifying distortions in your life",
      intro: "Look back at the table of nine distortions. Choose the ones you think most apply to your own life.",
      fields: [
        { id: "s5d0_1", type: "check", label: "Which of these distortions most apply to your own life?", options: ["Catastrophizing", "Fortune telling", "Mind reading", "Emotional reasoning", "All-or-nothing thinking", "Should statements", "Overgeneralization", "Intolerance of uncertainty", "Safety bias (better not risk it)"] },
        { id: "s5d0_2", type: "check", label: "When does this distortion usually show up?", options: ["During symptom flares", "Before social situations", "When stressed", "When fatigued", "When alone", "Other"] },
        { id: "s5d0_3", type: "text", label: "Other (if selected)" },
        { id: "s5d0_4", type: "long", label: "What does this distortion usually sound like in my own words? Write an exact example." }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Deconstructing distortions",
      intro: "Pick two of the thoughts below. For each, identify the distortion and explain why it is a distortion. Then generate a balanced alternative thought.",
      fields: [
        { id: "s5d0_5", type: "note", label: "Thoughts to choose from: \"If I go to the grocery store, I'll collapse.\" / \"This dizziness means something is seriously wrong.\" / \"I should be able to control this.\" / \"Everyone will think I'm weak.\" / \"If symptoms increased today, treatment isn't working.\" / \"If I rest more, I'll recover faster.\" / \"If doctors didn't find anything, they must have missed it.\"" },
        { id: "s5d0_6", type: "text", label: "Thought 1" },
        { id: "s5d0_7", type: "long", label: "Thought 1: which distortion is this, and why is it a distortion?" },
        { id: "s5d0_8", type: "long", label: "Thought 1: balanced alternative thought", hint: "Consider evidence for the thought (what objectively supports it?) and evidence against it (past experiences, fluctuations, alternative explanations, skills you have used before)." },
        { id: "s5d0_9", type: "text", label: "Thought 2" },
        { id: "s5d0_10", type: "long", label: "Thought 2: which distortion is this, and why is it a distortion?" },
        { id: "s5d0_11", type: "long", label: "Thought 2: balanced alternative thought" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Tolerating uncertainty",
      fields: [
        { id: "s5d0_12", type: "check", label: "What kinds of uncertainty bother me most?", options: ["Health uncertainty", "Symptom unpredictability", "Social uncertainty", "Performance uncertainty", "Future uncertainty", "Relationship uncertainty", "Other"] },
        { id: "s5d0_13", type: "text", label: "Other (if selected)" },
        { id: "s5d0_14", type: "check", label: "When uncertainty shows up, what do I usually do?", options: ["Seek reassurance", "Avoid", "Research", "Monitor symptoms", "Over-prepare", "Ask others repeatedly", "Do nothing but ruminate", "Other"] },
        { id: "s5d0_15", type: "text", label: "Other (if selected)" },
        { id: "s5d0_16", type: "long", label: "What are the short and long term effects of these behaviours?" }
      ]
    },
    {
      day: 0,
      title: "Grounding activity record",
      intro: "Practise a grounding exercise every day for at least 10 minutes. Record each practice here.",
      fields: [
        { id: "s5d0_17", type: "text", label: "Date and time" },
        { id: "s5d0_18", type: "text", label: "What grounding skill did you use?" },
        { id: "s5d0_19", type: "scale", label: "Stress level before", min: 0, max: 10 },
        { id: "s5d0_20", type: "scale", label: "Stress level after", min: 0, max: 10 }
      ]
    },
    {
      day: 1,
      title: "Neutralizing automatic thoughts",
      intro: "Choose one recent situation that felt stressful to you.",
      fields: [
        { id: "s5d1_1", type: "long", label: "Step 1: What happened?" },
        { id: "s5d1_2", type: "long", label: "Step 2: What automatic thought showed up?" },
        { id: "s5d1_3", type: "text", label: "Step 3: Which distortion does this reflect?", hint: "Refer to the table of distortions from this session." },
        { id: "s5d1_4", type: "text", label: "Step 4: What emotion followed?", hint: "Use the emotions wheel." },
        { id: "s5d1_5", type: "check", label: "Step 5: What did I do next?", options: ["Avoided", "Sought reassurance", "Cancelled plans", "Rested excessively", "Pushed too hard", "Other"] },
        { id: "s5d1_6", type: "text", label: "Other (if selected)" },
        { id: "s5d1_7", type: "long", label: "Pause and reflect: Short-term benefit of this thought", hint: "What does it protect me from in the moment?" },
        { id: "s5d1_8", type: "long", label: "Pause and reflect: Long-term cost", hint: "How does it shrink my life or reinforce fear?" },
        { id: "s5d1_9", type: "long", label: "Step 6: What is a more balanced alternative thought? Write your balanced thought.", hint: "Use this structure if helpful: \"While it is true that ______, it is also true that ______.\"" },
        { id: "s5d1_10", type: "check", label: "Step 7: If I believed this balanced thought, what would I do differently?", options: ["Continue with the planned activity", "Stay 2 more minutes", "Delay reassurance", "Follow pacing plan", "Reduce checking/monitoring"] },
        { id: "s5d1_11", type: "long", label: "Write your balanced thought" },
        { id: "s5d1_12", type: "choice", label: "Did I follow through?", options: ["Yes", "Partially", "No"] },
        { id: "s5d1_13", type: "long", label: "What was the outcome?" }
      ]
    },
    {
      day: 3,
      title: "Acting without certainty",
      intro: "The objective of this exercise is to practise behaving according to a balanced thought even when anxiety is present.",
      fields: [
        { id: "s5d3_1", type: "long", label: "Step 1: Identify one situation you would normally avoid or over-control" },
        { id: "s5d3_2", type: "long", label: "Step 2: What automatic thought showed up?" },
        { id: "s5d3_3", type: "long", label: "Step 3: What is the balanced alternative thought?" },
        { id: "s5d3_4", type: "long", label: "Step 4: What action will you take despite uncertainty?" },
        { id: "s5d3_5", type: "check", label: "For example:", options: ["Attend the event", "Drive", "Stay 2 more minutes", "Reduce checking", "Delay reassurance by 30 minutes", "Follow pacing plan", "Other"] },
        { id: "s5d3_6", type: "text", label: "Other (if selected)" },
        { id: "s5d3_7", type: "note", label: "Write the specific plan:" },
        { id: "s5d3_8", type: "text", label: "When" },
        { id: "s5d3_9", type: "text", label: "Where" },
        { id: "s5d3_10", type: "text", label: "How long" },
        { id: "s5d3_11", type: "note", label: "Step 5: Before acting" },
        { id: "s5d3_12", type: "scale", label: "Anxiety level", min: 0, max: 10 },
        { id: "s5d3_13", type: "scale", label: "Urge to avoid", min: 0, max: 10 },
        { id: "s5d3_14", type: "note", label: "Step 6: After acting" },
        { id: "s5d3_15", type: "choice", label: "Did you follow through?", options: ["Yes", "Partially", "No"] },
        { id: "s5d3_16", type: "scale", label: "Anxiety level after", min: 0, max: 10 },
        { id: "s5d3_17", type: "choice", label: "Did catastrophe occur?", options: ["Yes", "No"] },
        { id: "s5d3_18", type: "long", label: "Step 7: What did you learn about uncertainty and your symptoms?" }
      ]
    },
    {
      day: 6,
      title: "End-of-week reflection",
      fields: [
        { id: "s5d6_1", type: "long", label: "Which distortion showed up most often this week?" },
        { id: "s5d6_2", type: "long", label: "What pattern do you notice in your automatic thoughts?" },
        { id: "s5d6_3", type: "long", label: "Did acting differently change your anxiety over time? How much?" }
      ]
    }
  ]
});

SESSIONS_PART.push({
  n: 6,
  title: "Graded Exposure and Opposite Action in Action",
  tagline: "Midpoint check-in, your exposure ladder and opposite action",
  minutes: 9,
  teach: [
    {
      h: "Halfway through",
      p: [
        "You are halfway through treatment. Before moving on, take stock of what has changed since Session 1. The first exercise below helps you do that.",
        "In FND treatment, behaviour often improves before symptoms do. You may still experience anxiety even as your day-to-day functioning improves. Remember that fluctuation does not equal failure.",
        "At this point, many people understand the model but still hesitate behaviourally. Insight alone does not retrain the nervous system without behavioural change."
      ]
    },
    {
      h: "Avoidance gets subtle",
      p: ["Avoidance becomes more subtle at this stage. It may sound like:"],
      bullets: [
        "\"I'll wait until I feel better.\"",
        "\"I'm not ready.\"",
        "\"I'll try next week.\""
      ]
    },
    {
      p: [
        "Take a moment to imagine two possible paths: one where you wait until you feel ready (continued avoidance), and one where you lean into your FND treatment and tolerate discomfort."
      ]
    },
    {
      h: "The avoidance cycle",
      p: [
        "Trigger, then anxiety, then avoid, then relief, then stronger fear next time.",
        "The nervous system learns through experience. Each time you avoid, it learns that the situation was dangerous and that escape was what kept you safe."
      ]
    },
    {
      h: "What happens when you stay",
      p: [
        "When you approach a feared situation and remain in it long enough, several important things happen. Anxiety rises, often quickly, and thoughts can become more catastrophic.",
        "However, if you stay in the situation without escaping or over-controlling, anxiety will eventually plateau and decrease. This teaches the brain that distress is tolerable and temporary.",
        "Even more importantly, it teaches that the predicted catastrophe does not occur."
      ]
    },
    {
      h: "Building an exposure ladder",
      p: [
        "Gradual exposure is essential. If a task is too easy, the brain does not update its prediction. If it is overwhelming, the nervous system may shut down or reinforce fear. The most effective exposures generate mild to moderate anxiety.",
        "To build your exposure ladder, begin by identifying one behaviour you are still avoiding. Then imagine breaking that behaviour into three steps."
      ],
      bullets: [
        "The first step should feel uncomfortable but doable.",
        "The second should increase discomfort.",
        "The third should represent the situation you would normally avoid entirely."
      ]
    },
    {
      p: ["Each step becomes a training opportunity for your nervous system."]
    },
    {
      h: "Opposite action",
      p: [
        "Fear produces action urges: to cancel, leave, rest, check, seek reassurance, or avoid.",
        "Opposite action means doing the opposite of that urge. Take the situation you are still avoiding and apply opposite action to it. Plan the automatic thought that will likely show up, and the balanced response you will use."
      ]
    },
    {
      h: "Logging your exposures this week",
      p: [
        "For each exposure, write down your predicted outcome and how likely you think it is (0 to 100%). Rate your anxiety before, at its peak, and after. Then record what actually happened and whether the catastrophe occurred.",
        "Watch for safety behaviours during exposures: reassurance, monitoring, over-preparing, staying near exits, bracing muscles, checking. These can quietly keep the fear alive. The Day 2 homework asks what happens when you reduce them slightly.",
        "On Day 6 you will chart your anxiety over time during one exposure, so you can see for yourself what anxiety does when you stay."
      ]
    },
    { quote: "Insight alone does not retrain the nervous system without behavioural change." }
  ],
  practice: "Complete at least 2 exposure tasks and fill out the exposure logs. Practise opposite action at least 3 times and track anxiety before, during and after exposure (no log required). Complete the written homework on Day 2, Day 4 and Day 6.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: Midpoint check-in",
      intro: "Since Session 1, what has changed?",
      fields: [
        { id: "s6d0_1", type: "check", label: "Since Session 1, what has changed?", options: ["Symptoms feel less threatening", "Symptoms fluctuate but feel more manageable", "I am avoiding less", "I understand my triggers better", "I notice distortions more quickly", "I tolerate anxiety better", "I have taken risks I would not have taken before", "Nothing has changed", "Other"] },
        { id: "s6d0_2", type: "text", label: "Other (if selected)" },
        { id: "s6d0_3", type: "long", label: "Describe one concrete example of change" },
        { id: "s6d0_4", type: "check", label: "What has improved the most?", options: ["Behaviour", "Thinking", "Emotional awareness", "Nervous system regulation", "Nothing yet", "Unsure"] },
        { id: "s6d0_5", type: "long", label: "Explain" },
        { id: "s6d0_6", type: "long", label: "What still feels stuck?", hint: "What avoidance is still present? What cognitive distortion still dominates?" },
        { id: "s6d0_7", type: "scale", label: "How committed am I to leaning into discomfort for the next half of treatment?", min: 0, max: 10 },
        { id: "s6d0_8", type: "long", label: "The behaviour I am still avoiding" },
        { id: "s6d0_9", type: "long", label: "What is the feared outcome?" },
        { id: "s6d0_10", type: "check", label: "Which distortion fuels this fear?", options: ["Catastrophizing", "Fortune telling", "Emotional reasoning", "Mind reading", "Intolerance of uncertainty", "Safety bias", "Other"] },
        { id: "s6d0_11", type: "text", label: "Other (if selected)" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Building an exposure ladder",
      intro: "Refer to the behaviour you identified you are still avoiding in the midpoint check-in.",
      fields: [
        { id: "s6d0_12", type: "long", label: "If I did this behaviour today, what do I predict would happen?" },
        { id: "s6d0_13", type: "scale", label: "How anxious would I feel?", min: 0, max: 10 },
        { id: "s6d0_14", type: "note", label: "Now imagine breaking this behaviour into three smaller steps. Exposure is most effective when you move gradually from mild discomfort to moderate discomfort." },
        { id: "s6d0_15", type: "long", label: "Step 1 (mild but uncomfortable)" },
        { id: "s6d0_16", type: "scale", label: "Step 1 fear rating", min: 0, max: 10 },
        { id: "s6d0_17", type: "long", label: "Step 2 (moderate)" },
        { id: "s6d0_18", type: "long", label: "Step 3 (harder)" },
        { id: "s6d0_19", type: "choice", label: "Which step feels realistic to attempt this week?", options: ["Step 1", "Step 2", "Step 3"] },
        { id: "s6d0_20", type: "long", label: "When exactly will I do it?", hint: "Day, time, place, and for how long." },
        { id: "s6d0_21", type: "long", label: "What makes this step meaningful for my life?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Opposite action planning",
      fields: [
        { id: "s6d0_22", type: "check", label: "Fear produces action urges. What does fear tell you to do?", options: ["Cancel", "Leave", "Rest", "Check", "Seek reassurance", "Avoid", "Other"] },
        { id: "s6d0_23", type: "text", label: "Other (if selected)" },
        { id: "s6d0_24", type: "note", label: "Opposite action means doing the opposite of that urge. Refer to the situation you identified as one you are still avoiding and apply opposite action to it." },
        { id: "s6d0_25", type: "long", label: "My opposite action will be" },
        { id: "s6d0_26", type: "long", label: "What automatic thought will likely show up?" },
        { id: "s6d0_27", type: "long", label: "Balanced response I will use" }
      ]
    },
    {
      day: 0,
      title: "Exposure log 1",
      fields: [
        { id: "s6d0_28", type: "text", label: "Date" },
        { id: "s6d0_29", type: "long", label: "Exposure" },
        { id: "s6d0_30", type: "long", label: "Predicted outcome" },
        { id: "s6d0_31", type: "number", label: "Predicted likelihood (0-100%)" },
        { id: "s6d0_32", type: "scale", label: "Anxiety before", min: 0, max: 10 },
        { id: "s6d0_33", type: "scale", label: "Peak anxiety", min: 0, max: 10 },
        { id: "s6d0_34", type: "scale", label: "Anxiety after", min: 0, max: 10 },
        { id: "s6d0_35", type: "choice", label: "Did catastrophe occur?", options: ["Yes", "No"] },
        { id: "s6d0_36", type: "long", label: "What actually happened?" },
        { id: "s6d0_37", type: "long", label: "What did I learn?" }
      ]
    },
    {
      day: 0,
      title: "Exposure log 2",
      fields: [
        { id: "s6d0_38", type: "text", label: "Date" },
        { id: "s6d0_39", type: "long", label: "Exposure" },
        { id: "s6d0_40", type: "long", label: "Predicted outcome" },
        { id: "s6d0_41", type: "number", label: "Predicted likelihood (0-100%)" },
        { id: "s6d0_42", type: "scale", label: "Anxiety before", min: 0, max: 10 },
        { id: "s6d0_43", type: "scale", label: "Peak anxiety", min: 0, max: 10 },
        { id: "s6d0_44", type: "scale", label: "Anxiety after", min: 0, max: 10 },
        { id: "s6d0_45", type: "choice", label: "Did catastrophe occur?", options: ["Yes", "No"] },
        { id: "s6d0_46", type: "long", label: "What actually happened?" },
        { id: "s6d0_47", type: "long", label: "What did I learn?" }
      ]
    },
    {
      day: 2,
      title: "Safety behaviours",
      intro: "Choose one exposure and identify if you used any safety behaviours.",
      fields: [
        { id: "s6d2_1", type: "check", label: "Safety behaviours I used", options: ["Reassurance", "Monitoring", "Over-preparing", "Staying near exits", "Bracing muscles", "Checking", "Other"] },
        { id: "s6d2_2", type: "text", label: "Other (if selected)" },
        { id: "s6d2_3", type: "long", label: "If you reduced these behaviours slightly, what happened?" }
      ]
    },
    {
      day: 4,
      title: "Pattern consolidation",
      intro: "Across the week so far:",
      fields: [
        { id: "s6d4_1", type: "choice", label: "Do you tend to overestimate threat?", options: ["Yes", "No"] },
        { id: "s6d4_2", type: "choice", label: "Does anxiety always remain high?", options: ["Yes", "No"] },
        { id: "s6d4_3", type: "choice", label: "Does anxiety decrease without avoidance?", options: ["Yes", "No"] },
        { id: "s6d4_4", type: "long", label: "What has changed about your relationship to uncertainty?" },
        { id: "s6d4_5", type: "long", label: "What evidence now contradicts your earlier fears?" }
      ]
    },
    {
      day: 6,
      title: "Graphing your anxiety curve",
      intro: "Choose one exposure you completed this week. Using the 0-10 scale, mark your anxiety level at each time point.",
      fields: [
        { id: "s6d6_1", type: "text", label: "Exposure" },
        { id: "s6d6_2", type: "text", label: "Predicted catastrophe" },
        { id: "s6d6_3", type: "scale", label: "Time 0 (before starting)", min: 0, max: 10 },
        { id: "s6d6_4", type: "scale", label: "1 minute", min: 0, max: 10 },
        { id: "s6d6_5", type: "scale", label: "2 minutes", min: 0, max: 10 },
        { id: "s6d6_6", type: "scale", label: "3 minutes", min: 0, max: 10 },
        { id: "s6d6_7", type: "scale", label: "5 minutes", min: 0, max: 10 },
        { id: "s6d6_8", type: "scale", label: "10 minutes (if applicable)", min: 0, max: 10 },
        { id: "s6d6_9", type: "scale", label: "End of exposure", min: 0, max: 10 },
        { id: "s6d6_10", type: "check", label: "Looking at your curve, what did your level of anxiety do over time?", options: ["Keep rising", "Peak and plateau", "Rise and then fall", "Fall quickly", "Stay high the entire time"] },
        { id: "s6d6_11", type: "text", label: "At what point did it begin to decrease?" },
        { id: "s6d6_12", type: "long", label: "What did this graph teach you about anxiety?" }
      ]
    }
  ]
});

SESSIONS_PART.push({
  n: 7,
  title: "The Push-Crash Cycle and Building Capacity",
  tagline: "Finding your middle zone and building real capacity",
  minutes: 12,
  teach: [
    {
      h: "The push-crash cycle",
      p: [
        "After people begin exposure work, a new pattern often emerges. On difficult days, activity drops sharply. On good days, there is a surge of effort. Tasks are stacked and energy is spent quickly.",
        "There may be a sense of urgency: \"I need to take advantage of this.\" For a short time, this feels productive and hopeful.",
        "But within 24 to 48 hours, fatigue, irritability, brain fog or symptom spikes appear. The nervous system becomes overloaded. Activity then drops again, sometimes abruptly. This creates a repeating loop.",
        "The nervous system does not respond well to extremes. It prefers gradual increases and predictable rhythms. When effort exceeds current capacity, the system interprets this as stress. If that stress is repeated, sensitization increases.",
        "This pattern is called the push-crash cycle."
      ],
      bullets: [
        "Sustainable progress comes from moderate, repeatable activity.",
        "Consistency, rather than intensity, is the most effective way to retrain your nervous system.",
        "Think of your nervous system like a dimmer switch rather than an on/off button. It tolerates gradual increases well but reacts poorly to sudden spikes."
      ]
    },
    {
      h: "What swings do to your system",
      p: ["When activity swings dramatically from very low one day to very high the next, the system receives inconsistent signals. It cannot accurately predict demand, and this has negative effects on the nervous system and body:"],
      bullets: [
        "Recovery time lengthens.",
        "Sleep becomes less restorative.",
        "Cognitive fog increases.",
        "Emotional reactivity rises.",
        "Symptoms become more sensitive."
      ]
    },
    {
      p: ["Crashes often appear the following day, or even two days later, making it tricky to connect cause and effect."]
    },
    {
      h: "Lower activation vs higher capacity",
      p: [
        "Lower nervous system activation is about how you feel right now: how \"on\" your nervous system is. Capacity is about how your system performs over time.",
        "Capacity means how much activity you can sustain, how quickly you recover, how stable you remain 24 to 48 hours later, and whether symptoms spike after effort.",
        "Capacity has likely increased if:"
      ],
      bullets: [
        "You can repeat the same activity multiple times without rebound.",
        "You recover faster after exertion.",
        "You no longer experience a delayed crash 24 to 48 hours later.",
        "Your baseline remains stable even after moderate demand.",
        "Your anxiety decreases more quickly during exposures."
      ]
    },
    {
      h: "Finding the middle zone",
      p: [
        "The push-crash cycle operates at extremes. One extreme says: \"I can't.\" The other says: \"I must.\" The middle zone says: \"I will do enough.\"",
        "The middle zone requires intention. It may feel unfamiliar at first. If you are used to over-pushing, slowing down can feel like failure. If you are used to withdrawing, staying moderately active can feel unsafe.",
        "The middle zone requires a pause between urge and action. When you notice the extreme urge, STOP and breathe slowly for 30 seconds. Ask yourself: \"What would 80% effort look like right now?\"",
        "Your middle zone sits between a baseline minimum (even on harder days) and a maximum ceiling (even on good days). If you stay inside this range, you are practising stability. It means tolerating two things: not doing everything, and not doing nothing."
      ]
    },
    {
      h: "The hidden drivers",
      p: ["Over-pushing is often driven by urgency (trying to outrun fear):"],
      bullets: [
        "\"I need to catch up.\"",
        "\"This improvement won't last.\"",
        "\"I have to prove I'm better.\"",
        "\"If I slow down, I'll fall behind.\""
      ]
    },
    {
      p: ["Withdrawal is often driven by threat (trying to avoid fear):"],
      bullets: [
        "\"This means I'm getting worse.\"",
        "\"If I push, I'll damage myself.\"",
        "\"I can't handle this.\"",
        "\"Something is wrong.\""
      ]
    },
    {
      p: [
        "Neither over-pushing nor withdrawal builds your capacity. The path to building capacity requires tolerating uncertainty without reacting to it.",
        "Gradual strengthening means allowing improvement to be slow, tolerating days that feel neutral, accepting that growth is not dramatic, and repeating moderate effort without urgency."
      ]
    },
    {
      h: "Momentum and identity",
      p: [
        "The push-crash cycle is often rooted in identity. For some people, over-pushing is tied to how they see themselves. Productivity, endurance, reliability and achievement may feel central to self-worth. On a lower-activation day, effort becomes a way to reclaim that identity, and slowing down can feel like weakness or failure.",
        "For others, withdrawal becomes protective. FND symptoms can reinforce a sense of fragility, and pulling back can feel responsible and careful. Staying active may bring up fear of worsening symptoms or losing control.",
        "Both responses are attempts to protect something important. Over time, defining yourself primarily as either \"the productive one\" or \"the fragile one\" can narrow your behavioural range."
      ]
    },
    {
      h: "Two identity stories",
      p: ["The productive / enduring self may sound like:"],
      bullets: [
        "Strong, capable, reliable",
        "Not a burden",
        "Defined by what I can do",
        "Can't let the illness win",
        "Need to earn my place",
        "Slowing down feels like failing"
      ]
    },
    {
      p: ["The careful / fragile self may sound like:"],
      bullets: [
        "Vulnerable, easily harmed",
        "Must protect myself from crashes",
        "Activity is risky",
        "My body can't be trusted",
        "Staying safe means staying still",
        "Doing more = losing control"
      ]
    },
    {
      h: "Notice the thought, don't believe it",
      p: [
        "Over the next week, when you notice these thoughts come up, try to notice the thought instead of believing it or fighting it.",
        "Instead of: \"I am fragile\", try: \"I'm noticing the thought that I am fragile.\"",
        "Instead of: \"I have to push\", try: \"I'm having the urge to prove my strength.\"",
        "Language is important. This change allows you to create distance from the identity story and opens up a moment of choice."
      ]
    },
    { quote: "One extreme says \"I can't.\" The other says \"I must.\" The middle zone says \"I will do enough.\"" }
  ],
  practice: "Repeat the same moderate middle-zone behaviour for 5 to 7 days before increasing intensity. Over the week, when identity thoughts come up, notice the thought instead of believing it or fighting it. Complete the written homework on Day 1, Day 2 and Day 3.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: Identifying your oscillation pattern",
      intro: "Do you recognize the push-crash pattern in yourself?",
      fields: [
        { id: "s7d0_1", type: "long", label: "What does \"crash\" look like for you (physically, emotionally, behaviourally)?" },
        { id: "s7d0_2", type: "long", label: "What usually happens next? Avoidance, rest, frustration, self-criticism?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Finding the middle zone",
      fields: [
        { id: "s7d0_3", type: "long", label: "Identify a situation where you felt the push-crash cycle applied to you" },
        { id: "s7d0_4", type: "check", label: "What cognitive distortions do you think might have been at play here?", options: ["Catastrophizing", "Fortune telling", "Mind reading", "Emotional reasoning", "All-or-nothing thinking", "Should statements", "Overgeneralization", "Intolerance of uncertainty", "Safety bias (better not risk it)"] },
        { id: "s7d0_5", type: "note", label: "Using a push-crash situation (you can use the one above), come up with a middle-zone behaviour you will try this week. The middle zone requires that you tolerate: 1. Not doing everything and 2. Not doing nothing." },
        { id: "s7d0_6", type: "text", label: "Step 1: Choose one area", hint: "Work, exercise, chores, social activity." },
        { id: "s7d0_7", type: "long", label: "Baseline minimum (even on harder days)" },
        { id: "s7d0_8", type: "long", label: "Maximum ceiling (even on good days)" },
        { id: "s7d0_9", type: "long", label: "Step 2: Middle-zone behaviour I will try this week", hint: "Commit to repeating the same moderate behaviour for 5-7 days before increasing intensity." }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: The hidden drivers",
      fields: [
        { id: "s7d0_10", type: "long", label: "When I over-push, what am I afraid of?", hint: "What feels urgent or threatening in that moment?" },
        { id: "s7d0_11", type: "check", label: "What belief is underneath this?", options: ["I'm falling behind", "I'll lose progress", "I'm wasting time", "I need to prove something"] },
        { id: "s7d0_12", type: "long", label: "When I withdraw or avoid, what am I afraid of?" },
        { id: "s7d0_13", type: "check", label: "What belief is underneath this?", options: ["I'll make things worse", "I'll crash", "My symptoms mean danger", "I can't cope", "Other"] },
        { id: "s7d0_14", type: "text", label: "Other (if selected)" },
        { id: "s7d0_15", type: "long", label: "What do these beliefs have in common, and are they necessarily true and based on reality?" },
        { id: "s7d0_16", type: "text", label: "When I imagine going slowly, what emotion comes up?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Momentum and identity",
      fields: [
        { id: "s7d0_17", type: "long", label: "Reflect on the two identity stories (the productive / enduring self and the careful / fragile self). Are there any other thoughts or characterizations that might fall into either category?" }
      ]
    },
    {
      day: 1,
      title: "Mapping your pattern",
      intro: "Crash archaeology: think back over the past two weeks. Try to identify one or two examples of the push-crash cycle in your own life. These might be physical, emotional, or both.",
      fields: [
        { id: "s7d1_1", type: "note", label: "Daily check-in" },
        { id: "s7d1_2", type: "text", label: "Current activation level", hint: "How \"on\" is your nervous system right now?" },
        { id: "s7d1_3", type: "text", label: "Energy available today" },
        { id: "s7d1_4", type: "note", label: "Example 1" },
        { id: "s7d1_5", type: "long", label: "What did the push look like?", hint: "What were you doing, thinking, or feeling that drove the surge of activity? Was there a sense of urgency, opportunity, or something to prove?" },
        { id: "s7d1_6", type: "long", label: "What did the crash look like, and when did it arrive?", hint: "It may have appeared 24-48 hours later, which can make the connection easy to miss." },
        { id: "s7d1_7", type: "long", label: "What came after the crash?", hint: "Avoidance, frustration, self-criticism, rest, withdrawal?" },
        { id: "s7d1_8", type: "long", label: "Looking back, what was the hidden driver?", hint: "Was it urgency (\"I need to catch up / make the most of this / prove I'm better\") or threat (\"If I do too much I'll make things worse / I can't cope\")?" },
        { id: "s7d1_9", type: "note", label: "Example 2 (optional)" },
        { id: "s7d1_10", type: "long", label: "What did the push look like?" },
        { id: "s7d1_11", type: "long", label: "What did the crash look like, and when did it arrive?" },
        { id: "s7d1_12", type: "long", label: "What came after the crash?" },
        { id: "s7d1_13", type: "long", label: "Looking back, what was the hidden driver?" },
        { id: "s7d1_14", type: "note", label: "Reflection: sit with this question for a few minutes. You don't have to write an answer. What would it mean to go slowly and have that be enough?" }
      ]
    },
    {
      day: 2,
      title: "Building your middle zone",
      intro: "Setting your range: choose one area of life where the push-crash pattern shows up most (work, exercise, household tasks, social activity, etc.).",
      fields: [
        { id: "s7d2_1", type: "note", label: "Daily check-in (2 minutes)" },
        { id: "s7d2_2", type: "text", label: "Current activation level" },
        { id: "s7d2_3", type: "text", label: "Energy available today" },
        { id: "s7d2_4", type: "text", label: "Area chosen" },
        { id: "s7d2_5", type: "note", label: "Now set your honest limits for this area. Think about what is true on an average day, not your best day or worst day." },
        { id: "s7d2_6", type: "long", label: "Baseline minimum: what you can do even on harder days without making things worse" },
        { id: "s7d2_7", type: "long", label: "Maximum ceiling: the point at which, even on a good day, you agree to stop" },
        { id: "s7d2_8", type: "long", label: "Middle-zone behaviour", hint: "Your middle zone sits between these two. Write one specific, concrete behaviour you will try over the next few days. Make it small enough that it feels almost too easy. That's the right size." },
        { id: "s7d2_9", type: "long", label: "The 80% check: before acting on any urge to do more today, pause, breathe slowly for 30 seconds, and ask: What would 80% effort look like right now? Note down once today whether this question changed anything, even slightly." },
        { id: "s7d2_10", type: "note", label: "Reflection: notice which felt harder today: holding the ceiling, or holding the floor? Staying inside the range when you felt capable, or staying active when you didn't feel like it? There's no right answer, just try to notice what thoughts and feelings you had." }
      ]
    },
    {
      day: 3,
      title: "Watching the identity story",
      intro: "Noticing without believing: today's task is observational. You are not trying to change anything, only to notice. Throughout the day, watch for moments when one of the two identity pulls shows up.",
      fields: [
        { id: "s7d3_1", type: "note", label: "Daily check-in (2 minutes)" },
        { id: "s7d3_2", type: "text", label: "Current activation level" },
        { id: "s7d3_3", type: "text", label: "Energy available today" },
        { id: "s7d3_4", type: "note", label: "The productive / enduring self: urgency to catch up, prove yourself, not fall behind, not waste the day, not be a burden. The careful / fragile self: the pull to withdraw, the sense that activity is risky, the feeling that your body can't be trusted, that doing more means losing control." },
        { id: "s7d3_5", type: "note", label: "Each time you notice one, try the language shift from the session. Instead of believing the thought, name it: \"I'm noticing the thought that I am fragile.\" \"I'm having the urge to prove my strength.\" Record up to three observations. You don't need to analyse them, just note what came up." },
        { id: "s7d3_6", type: "text", label: "Observation 1: time of day" },
        { id: "s7d3_7", type: "choice", label: "Observation 1: which pull?", options: ["Productive / enduring self", "Careful / fragile self"] },
        { id: "s7d3_8", type: "text", label: "Observation 1: the thought or urge" },
        { id: "s7d3_9", type: "text", label: "Observation 1: reframed as..." },
        { id: "s7d3_10", type: "text", label: "Observation 2: time of day" },
        { id: "s7d3_11", type: "choice", label: "Observation 2: which pull?", options: ["Productive / enduring self", "Careful / fragile self"] },
        { id: "s7d3_12", type: "text", label: "Observation 2: the thought or urge" },
        { id: "s7d3_13", type: "text", label: "Observation 2: reframed as..." },
        { id: "s7d3_14", type: "text", label: "Observation 3: time of day" },
        { id: "s7d3_15", type: "choice", label: "Observation 3: which pull?", options: ["Productive / enduring self", "Careful / fragile self"] },
        { id: "s7d3_16", type: "text", label: "Observation 3: the thought or urge" },
        { id: "s7d3_17", type: "text", label: "Observation 3: reframed as..." },
        { id: "s7d3_18", type: "note", label: "Reflection: at the end of the day, sit with this. Both of these identity pulls are trying to protect something. What is each one trying to protect in you specifically? You don't have to answer fully today. This question is preparation for next session's work on illness identity." }
      ]
    }
  ]
});
// Sessions 8, 9 and 10 of the CBT-DBT Psychotherapy Manual for FND, condensed for the app.

SESSIONS_PART.push({
  n: 8,
  title: "Illness Identity: Who am I beyond my diagnosis?",
  tagline: "Holding FND as one part of a wider self",
  minutes: 11,
  teach: [
    {
      h: "What is illness identity?",
      p: [
        "When you live with a condition like FND over time, the illness does not just affect your body. It begins to shape how you understand yourself. This is called illness identity: the degree to which a health condition becomes part of how you define who you are.",
        "Illness identity sits on a spectrum. Including illness in your identity is not good or bad in itself. The question is how much of the self it occupies, and whether it expands or narrows the life you can live."
      ]
    },
    {
      h: "The illness identity spectrum",
      p: [
        "At one end is the illness-defined self: 'I am my FND.' Identity is organised around illness and limitation.",
        "At the other end is the illness-denying self: 'FND is not real / not me.' Illness is minimised and identity is defended through denial.",
        "In the middle is the expanded self: 'I have FND and I am also...' Here illness is held as one part of a broader self, anchored in your values. The goal is to move toward the middle."
      ]
    },
    {
      h: "Why does this happen?",
      p: ["Several forces pull identity toward the illness-defined end."],
      bullets: [
        "The medical world reinforces it: appointments, forms and conversations centre on symptoms. Others ask 'how are you feeling?' before anything else. Progress is measured in physical terms only.",
        "Social responses reinforce it: well-meaning others can reinforce 'the sick role'. Care and connection may feel most available when symptoms are visible. Disclosing illness to explain limitations becomes automatic.",
        "The nervous system reinforces it: hypervigilance to symptoms makes them more noticeable. Avoidance organises daily life around the condition. Safety behaviours confirm an identity of fragility.",
        "Loss reinforces it: roles, work, relationships and activities may have been lost. What was lost was often part of identity too. Illness fills the vacuum those losses created."
      ]
    },
    {
      h: "Two key insights",
      p: [
        "A key CBT insight: the beliefs that keep identity fused with illness are often outside awareness. They feel like facts rather than interpretations. Part of today's work is bringing them into view, not to eliminate them, but to examine them.",
        "A key DBT insight: there is a dialectical tension here. 'I have a real condition that affects my life AND I am more than my condition.' Both statements are true. Holding both is Wise Mind. Collapsing into either extreme is Emotion Mind."
      ]
    },
    {
      h: "Your identity audit",
      p: [
        "The first exercise below asks you to describe who you were before FND, and how you tend to describe yourself now. Then you sort parts of your identity into what feels lost or threatened, and what remains or has grown.",
        "Notice whether the 'remains' column is harder to fill. Illness identity tends to make what remains less visible. That column is where today's work is focused."
      ]
    },
    {
      h: "The identity threat cycle",
      p: [
        "Last session you met two identity pulls: pushing and withdrawing. The second exercise maps your own version of the cycle, from a trigger, through the threat it seemed to pose to who you are, the emotion, your response, the short-term relief and the longer-term cost.",
        "As you fill it in, ask: is there a point in the cycle where a different choice might have been possible?"
      ]
    },
    {
      h: "The layers of self",
      p: [
        "One way to think about identity is as layers. Each layer is real and important: roles and responsibilities; relationships and belonging; values and beliefs; strengths and character; and health or illness experience.",
        "Health and illness experience sits near the centre because it is deeply felt. But it is surrounded by, and held within, the other layers. It is part of you, not all of you. Today's work is to consciously inhabit all the layers again.",
        "When you fill in the layers, notice which were easiest and which felt nearly empty. The distribution tells you where identity has contracted and where it might expand."
      ]
    },
    {
      h: "Expanding identity through values",
      p: [
        "A values-anchored identity says: 'Regardless of how I feel today, I am still someone who cares about connection, creativity, honesty, growth...' This stays true on a high-symptom day or a low-symptom day. It is not contingent on capacity.",
        "Values do not always require action. 'I am someone who values connection' can be expressed by listening fully to one person today, even from the sofa. The expression adapts to capacity. The value does not disappear."
      ]
    },
    { quote: "I have a real condition that affects my life AND I am more than my condition." }
  ],
  practice: "Complete the homework on Day 1, Day 2 and Day 4. Complete a weekly symptom log, and keep practising the grounding skills from earlier sessions.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: My identity audit",
      intro: "Work at your own pace. Put down not just what you thought was good about yourself, but simply who you were.",
      fields: [
        { id: "s8d0_1", type: "long", label: "Before FND became significant in your life, how did you describe yourself? List as many words, phrases, roles and qualities as come to mind.", hint: "e.g. 'I was someone who... / I was known for... / People would have described me as...'" },
        { id: "s8d0_2", type: "long", label: "Now think about how you tend to describe yourself today. What words and phrases come to mind (including any you don't like)?", hint: "e.g. 'Now I'm someone who can't... / People see me as... / I think of myself as...'" },
        { id: "s8d0_3", type: "long", label: "Parts of my identity that feel lost or threatened", hint: "e.g. 'the active one', career identity, being reliable..." },
        { id: "s8d0_4", type: "long", label: "Parts of my identity that remain or have grown", hint: "e.g. humour, empathy, creativity, determination..." },
        { id: "s8d0_5", type: "note", label: "Notice whether the 'remains' list was harder to fill. Illness identity tends to make what remains less visible. That is where today's work is focused." }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: My identity threat cycle",
      intro: "Map your own version of the cycle. Use any situation where you noticed one of the two identity pulls (push or withdraw).",
      fields: [
        { id: "s8d0_6", type: "long", label: "1. The trigger: a symptom, limitation or moment that activated the cycle" },
        { id: "s8d0_7", type: "long", label: "2. The identity threat: what did this moment seem to say about who you are? \"This means I am...\"" },
        { id: "s8d0_8", type: "long", label: "3. The emotion: what came up? (fear, shame, grief, anger, urgency?)" },
        { id: "s8d0_9", type: "long", label: "4. The response: did you push, withdraw, or both at different times?" },
        { id: "s8d0_10", type: "long", label: "5. Short-term outcome: did the response bring temporary relief? Did the identity feel temporarily repaired?" },
        { id: "s8d0_11", type: "long", label: "6. Longer-term cost: what did the cycle cost? (capacity, connection, self-perception, behavioural range?)" },
        { id: "s8d0_12", type: "long", label: "Is there a point in the cycle where a different choice might have been possible?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: The layers of self",
      intro: "Fill in each layer. Each is real and important. Health and illness experience is one layer, not the whole.",
      fields: [
        { id: "s8d0_13", type: "long", label: "Roles & responsibilities: what roles do you hold? (even if they have changed or feel fragile)", hint: "parent, worker, partner, carer" },
        { id: "s8d0_14", type: "long", label: "Relationships & belonging: who do you love? Where do you belong? Who knows you?" },
        { id: "s8d0_15", type: "long", label: "Values & beliefs: what matters most to you? What do you believe in?" },
        { id: "s8d0_16", type: "long", label: "Strengths & character: what qualities exist in you regardless of your health?", hint: "courage, humour, creativity, care, resilience" },
        { id: "s8d0_17", type: "long", label: "Health / illness experience: how would you describe your experience of FND honestly, as one layer, not the whole?" },
        { id: "s8d0_18", type: "long", label: "Which layers were easiest to fill? Which felt nearly empty? What does that tell you about where identity has contracted and where it might expand?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Expanding my identity through my values",
      intro: "Identify 3 values that feel truly central to who you are when you are most yourself. For each value, write one small, concrete way you could express or honour it this week. The action should be small enough to be possible even on a harder day.",
      fields: [
        { id: "s8d0_19", type: "text", label: "Value 1" },
        { id: "s8d0_20", type: "long", label: "One way I can express value 1 this week" },
        { id: "s8d0_21", type: "text", label: "Value 2" },
        { id: "s8d0_22", type: "long", label: "One way I can express value 2 this week" },
        { id: "s8d0_23", type: "text", label: "Value 3" },
        { id: "s8d0_24", type: "long", label: "One way I can express value 3 this week" }
      ]
    },
    {
      day: 1,
      title: "Writing my expanded story",
      intro: "Write a self-statement that includes your values, strengths, relationships and ongoing presence.",
      fields: [
        { id: "s8d1_1", type: "long", label: "My expanded story", hint: "Prompts: 'I am someone who has FND and also... / Despite my symptoms, I continue to... / People who know me well would say I am... / Something that has not changed in me is... / I am still capable of...'" },
        { id: "s8d1_2", type: "long", label: "Distil your expanded story into one sentence that you could carry with you. This does not need to be perfect or permanent." }
      ]
    },
    {
      day: 2,
      title: "The identity audit in motion",
      intro: "Today, watch for any moment when you introduce yourself, literally or in your own mind. Notice how you describe yourself in those moments.",
      fields: [
        { id: "s8d2_1", type: "scale", label: "Nervous system activation", min: 1, max: 10 },
        { id: "s8d2_2", type: "text", label: "One word for how I see myself right now" },
        { id: "s8d2_3", type: "scale", label: "Symptom level today", min: 1, max: 10 },
        { id: "s8d2_4", type: "text", label: "What layer of self is most present today" },
        { id: "s8d2_5", type: "long", label: "When someone asked how I was, or when I thought about myself today, the identity that showed up was:" },
        { id: "s8d2_6", type: "long", label: "Was it illness-defined, expanded, or somewhere in between? What pushed it toward one end?" },
        { id: "s8d2_7", type: "long", label: "Reflection: read back your working self-statement from Day 1. Does it feel true today? You don't need to change it, just notice." }
      ]
    },
    {
      day: 4,
      title: "Values in action",
      intro: "Return to the values table you completed in the in-session exercise. Today, attempt one of the small expressions you wrote down.",
      fields: [
        { id: "s8d4_1", type: "text", label: "The value I chose to express today" },
        { id: "s8d4_2", type: "long", label: "What I actually did (even if it was smaller or different from what I planned)" },
        { id: "s8d4_3", type: "long", label: "After doing it, notice: did it feel like 'you'? Did it feel connected to something important?" },
        { id: "s8d4_4", type: "note", label: "Recognising 'that felt like me', even for a moment, is the work. The feeling does not have to be extreme or dramatic to be important and noticeable." }
      ]
    }
  ]
});

SESSIONS_PART.push({
  n: 9,
  title: "Interpersonal Patterns and Emotional Expression",
  tagline: "How FND reshapes relationships, and how to be seen",
  minutes: 13,
  teach: [
    {
      h: "How illness reshapes relationships",
      p: [
        "Living with FND over time often changes how you relate to others, and how others relate to you. These shifts usually happen gradually, and many happen outside conscious awareness."
      ]
    },
    {
      h: "Five common shifts",
      bullets: [
        "Roles shift. You may have moved from giving care to receiving it, or be trying to do both, which is exhausting. Roles that were part of your identity (provider, helper, the strong one) may now feel out of reach or complicated.",
        "Communication changes. Managing symptoms, explaining yourself, or protecting yourself from being misunderstood disrupts the natural flow of relating. Many people talk less about how they actually feel and more about how they are managing.",
        "Emotional expression narrows. Expressing difficult emotions can feel risky: it might burden others, invite unhelpful responses, or feel like evidence you are 'not coping'. Over time many people develop a very controlled emotional presentation, or emotion comes out in unexpected ways.",
        "Needs become harder to name and express. When you are unsure how to describe what you need, or needs have been misunderstood before, it is easier to stop asking. Or frustration builds and needs come out through irritability, withdrawal or conflict.",
        "Connection can feel conditional. Some people feel they are only acceptable when doing 'well enough', or when having symptoms. When the illness-self shows up in relationships, connection feels fragile."
      ]
    },
    {
      h: "Mapping your patterns",
      p: [
        "The first exercise maps your key relationships, before and now, then rates you on six pairs of behaviours, from the protective end (containing, managing, controlling) to the open end (being seen as you are). For the pattern most often on the protective side, ask what it protects you from, and what belief sits underneath it."
      ]
    },
    {
      h: "The emotional expression dial",
      p: [
        "Imagine a dial from 0 to 10.",
        "At 0: complete suppression. Nothing gets out. The inner experience may be intense, but the outside looks flat, controlled or 'fine'. Others rarely know how you actually feel. You may not always know yourself.",
        "At 10: full, unfiltered expression. Every feeling comes out as it arises, at full intensity, with no gap between inner experience and outward expression. This can overwhelm others, and sometimes the self.",
        "The functional range for most meaningful relationships sits roughly between 3 and 7. In that zone emotion is present enough to be real, calibrated enough to be received, and honest enough to connect."
      ]
    },
    {
      h: "Communicating needs effectively",
      p: [
        "Part of the unhelpful communication that can come with FND is feeling you cannot tell others what you need. Needs can be practical, emotional, relational or physical: space, presence, understanding, help with tasks, connection. The exercise below asks you to name up to three needs you are not expressing clearly."
      ]
    },
    {
      h: "From need to request: the GIVE skill",
      p: [
        "Once a need is identified, the next challenge is expressing it so that it is honest, connected and likely to be heard. GIVE helps here."
      ],
      bullets: [
        "Gentle: no attack, no blame, no judgement.",
        "Interested: stay open-minded about the other person's perspective, even while expressing your own.",
        "Validate: acknowledge what the other person is dealing with, even if you find this disappointing.",
        "Easy manner: keep a light tone where possible, rather than going for intensity and confrontation."
      ]
    },
    {
      h: "Why GIVE helps",
      p: [
        "GIVE lets you protect the relationship, communicate disappointment without escalating, and increase the chance your needs are respected next time.",
        "Without GIVE: partner forgot to call: 'You clearly don't care.' Friend shows up late: 'It's fine' (short answers, distant tone, looking at phone). Colleague misses a deadline: 'Wow. Right on time, as usual.'",
        "With GIVE, when a friend misses a planned dinner: Gentle: 'Hey, I was really looking forward to tonight.' Interested: 'What ended up happening?' Validate: 'That sounds exhausting. I get why you felt overwhelmed.' Easy manner: 'Rain check? I still want that pasta you promised me.'"
      ]
    },
    {
      h: "The middle path in relationships",
      p: [
        "Remember the push-crash cycle? It applies to relationships too. When symptoms flare, some people push relationally: talking at length, seeking reassurance repeatedly, texting multiple people, replaying details. It can feel regulating: 'If I explain this fully, I'll feel steadier.'",
        "But it often overshoots capacity, the nervous system stays activated, and the other person can feel flooded. Afterwards comes shame or regret, then the relational crash: withdrawal, avoidance, silence.",
        "Others under-disclose chronically. They minimise symptoms, say 'I'm fine', and protect others from their distress. Outside they look stable. Inside they feel alone, unseen, sometimes resentful. Relationships thin out because there is no shared emotional reality.",
        "Where do you move more towards? Write down what the middle could look like for you."
      ]
    },
    {
      h: "Preparing for an honest conversation",
      p: [
        "The last exercise is about a real conversation that has been waiting, avoided, or felt too complicated to begin. It does not have to be dramatic: a swallowed need, a feeling you have performed around, an unacknowledged change, or something you want the other person to understand.",
        "You do not have to have this conversation this week, or ever. The goal is clarity on what you would say if you felt you could."
      ]
    },
    { quote: "Emotion present enough to be real, calibrated enough to be received, honest enough to connect." }
  ],
  practice: "Try using the GIVE skill in your daily interactions at least once every day. Complete the written homework on Day 1, Day 3 and Day 5.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: Mapping out your relationships",
      intro: "For each relationship, note how it was before and how it is now (what has changed with FND).",
      fields: [
        { id: "s9d0_1", type: "long", label: "Partner / closest person to you: how it was before" },
        { id: "s9d0_2", type: "long", label: "Partner / closest person to you: how it is now" },
        { id: "s9d0_3", type: "long", label: "Family (parents, siblings, children): how it was before" },
        { id: "s9d0_4", type: "long", label: "Family (parents, siblings, children): how it is now" },
        { id: "s9d0_5", type: "long", label: "Friends: how it was before" },
        { id: "s9d0_6", type: "long", label: "Friends: how it is now" },
        { id: "s9d0_7", type: "long", label: "Healthcare team members: how it was before" },
        { id: "s9d0_8", type: "long", label: "Healthcare team members: how it is now" },
        { id: "s9d0_9", type: "long", label: "Work / community colleagues: how it was before" },
        { id: "s9d0_10", type: "long", label: "Work / community colleagues: how it is now" },
        { id: "s9d0_11", type: "note", label: "For each pair of behaviours below, rate where you actually find yourself most of the time, from 1 (the behaviour on the left) to 10 (the behaviour on the right)." },
        { id: "s9d0_12", type: "scale", label: "Protecting others from how I'm feeling / Letting others see the full picture", min: 1, max: 10, anchors: ["Protecting others from how I'm feeling", "Letting others see the full picture"] },
        { id: "s9d0_13", type: "scale", label: "Withdrawing when things feel hard / Moving toward others when hard", min: 1, max: 10, anchors: ["Withdrawing when things feel hard", "Moving toward others when hard"] },
        { id: "s9d0_14", type: "scale", label: "Minimising what I need / Clearly naming what I need", min: 1, max: 10, anchors: ["Minimising what I need", "Clearly naming what I need"] },
        { id: "s9d0_15", type: "scale", label: "Managing how I appear to others / Being seen as I actually am", min: 1, max: 10, anchors: ["Managing how I appear to others", "Being seen as I actually am"] },
        { id: "s9d0_16", type: "scale", label: "Deflecting or dismissing care / Accepting care without resistance", min: 1, max: 10, anchors: ["Deflecting or dismissing care", "Accepting care without resistance"] },
        { id: "s9d0_17", type: "scale", label: "Containing all difficult emotion / Expressing frustration or distress directly", min: 1, max: 10, anchors: ["Containing all difficult emotion", "Expressing frustration or distress directly"] },
        { id: "s9d0_18", type: "long", label: "Look at the pattern you marked most consistently on the left side. This is the protective end that keeps things contained, managed or controlled. What does this pattern protect you from?" },
        { id: "s9d0_19", type: "long", label: "What belief sits underneath it?", hint: "e.g. \"If I show how I really feel, people will leave / be overwhelmed / see me differently\"" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: The emotional expression dial",
      intro: "Think about the relationships you mapped above. For each one, where does your dial (0-10) tend to sit, and what do you hold back?",
      fields: [
        { id: "s9d0_20", type: "scale", label: "Partner / closest person: where my dial tends to sit", min: 0, max: 10, anchors: ["complete suppression", "full, unfiltered expression"] },
        { id: "s9d0_21", type: "long", label: "Partner / closest person: what I hold back" },
        { id: "s9d0_22", type: "scale", label: "Family: where my dial tends to sit", min: 0, max: 10, anchors: ["complete suppression", "full, unfiltered expression"] },
        { id: "s9d0_23", type: "long", label: "Family: what I hold back" },
        { id: "s9d0_24", type: "scale", label: "Friends: where my dial tends to sit", min: 0, max: 10, anchors: ["complete suppression", "full, unfiltered expression"] },
        { id: "s9d0_25", type: "long", label: "Friends: what I hold back" },
        { id: "s9d0_26", type: "scale", label: "Healthcare team members: where my dial tends to sit", min: 0, max: 10, anchors: ["complete suppression", "full, unfiltered expression"] },
        { id: "s9d0_27", type: "long", label: "Healthcare team members: what I hold back" },
        { id: "s9d0_28", type: "scale", label: "Work / community colleagues: where my dial tends to sit", min: 0, max: 10, anchors: ["complete suppression", "full, unfiltered expression"] },
        { id: "s9d0_29", type: "long", label: "Work / community colleagues: what I hold back" },
        { id: "s9d0_30", type: "long", label: "What does it feel like when the dial is too low?", hint: "e.g. isolated, performing, exhausted from managing presentation, unexpectedly tearful or irritable, feeling unknown" },
        { id: "s9d0_31", type: "long", label: "What does it feel like when the dial moves towards a more open setting, even if just for a little while?" },
        { id: "s9d0_32", type: "check", label: "Which of these beliefs do you feel prevent you from expressing your emotions?", options: [
          "If I express how I really feel, I'll overwhelm the people I love",
          "Showing emotion makes me seem like I'm not coping",
          "If I start, I won't be able to stop",
          "People are already doing enough - I can't ask for more",
          "My feelings are too complicated to explain",
          "They won't understand anyway",
          "I should be further along than this",
          "Expressing it will make it more real",
          "Other"
        ] },
        { id: "s9d0_33", type: "text", label: "Other belief (if any)" },
        { id: "s9d0_34", type: "long", label: "Choose one belief from your list. What would you need to believe instead for the dial to move slightly (not all the way)?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Communicating needs and the GIVE skill",
      intro: "Write down up to three needs that feel true but that you are not currently expressing, or not expressing clearly. Then draft one as a request using GIVE.",
      fields: [
        { id: "s9d0_35", type: "long", label: "Need 1" },
        { id: "s9d0_36", type: "text", label: "Need 1: who would this need be directed toward?" },
        { id: "s9d0_37", type: "long", label: "Need 1: what stops you from expressing it?" },
        { id: "s9d0_38", type: "long", label: "Need 2" },
        { id: "s9d0_39", type: "text", label: "Need 2: who would this need be directed toward?" },
        { id: "s9d0_40", type: "long", label: "Need 2: what stops you from expressing it?" },
        { id: "s9d0_41", type: "long", label: "Need 3" },
        { id: "s9d0_42", type: "text", label: "Need 3: who would this need be directed toward?" },
        { id: "s9d0_43", type: "long", label: "Need 3: what stops you from expressing it?" },
        { id: "s9d0_44", type: "note", label: "GIVE = Gentle (no attack, blame or judgement), Interested (open to their perspective), Validate (acknowledge what they are dealing with), Easy manner (a light tone where possible)." },
        { id: "s9d0_45", type: "long", label: "The need I want to express" },
        { id: "s9d0_46", type: "long", label: "A gentle, connected way I could say it (using GIVE)" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: The middle path in relationships",
      fields: [
        { id: "s9d0_47", type: "choice", label: "Where do you move more towards?", options: ["Over-disclosure", "Under-disclosure"] },
        { id: "s9d0_48", type: "long", label: "What could the middle look like for you?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: Preparing for an honest conversation",
      intro: "Think of one relationship where something true has not been said. It doesn't have to be dramatic. It might be a need that has been swallowed, a feeling that has been performed around, a change in the relationship that hasn't been acknowledged, or something you want the other person to understand about your experience.",
      fields: [
        { id: "s9d0_49", type: "text", label: "The conversation I am thinking of is with" },
        { id: "s9d0_50", type: "long", label: "What has not been said (as honestly as you can write it here)" },
        { id: "s9d0_51", type: "check", label: "What has stopped you from saying it?", options: [
          "Fear of their reaction",
          "Not wanting to burden them",
          "Uncertainty about how to start",
          "Not feeling entitled to say it",
          "Protecting the relationship as it is",
          "Not being sure it's worth it",
          "Other"
        ] },
        { id: "s9d0_52", type: "text", label: "Other reason (if any)" },
        { id: "s9d0_53", type: "long", label: "What is the cost of continuing to not say it?" },
        { id: "s9d0_54", type: "note", label: "In the Day 1 homework you will work through a preparation structure as if you are going to have this conversation. You do not have to have it this week, or ever. The goal is clarity on what you would say if you felt you could." }
      ]
    },
    {
      day: 1,
      title: "Preparing for an honest conversation",
      intro: "Reflect on the conversation you identified in the session that you have been putting off or avoiding. Imagine you are going to have it, and use this structure to plan how it would go. Begin with: 'I want to say something because I care about this relationship / this matters to me.'",
      fields: [
        { id: "s9d1_1", type: "long", label: "The thing I most want you to understand is:" },
        { id: "s9d1_2", type: "long", label: "What I'm not asking for is:" },
        { id: "s9d1_3", type: "long", label: "What would help me most is:" },
        { id: "s9d1_4", type: "long", label: "Try applying the GIVE skill to this conversation. How would you say it gently, with interest, validation and an easy manner?" }
      ]
    },
    {
      day: 3,
      title: "The emotional dial in real life",
      intro: "Choose two interactions today, one that is easier and one that takes more effort to manage. For each one, notice where your dial sits, what you held back, and what it cost.",
      fields: [
        { id: "s9d3_1", type: "scale", label: "Nervous system activation", min: 1, max: 10 },
        { id: "s9d3_2", type: "scale", label: "Symptom level today", min: 1, max: 10 },
        { id: "s9d3_3", type: "text", label: "One word for where I feel I am in my relationships right now" },
        { id: "s9d3_4", type: "text", label: "Interaction 1: who it was with" },
        { id: "s9d3_5", type: "scale", label: "Interaction 1: where did the dial sit?", min: 0, max: 10 },
        { id: "s9d3_6", type: "long", label: "Interaction 1: what did I show?" },
        { id: "s9d3_7", type: "long", label: "Interaction 1: what did I hold back?" },
        { id: "s9d3_8", type: "long", label: "Interaction 1: what was the cost of holding back?" },
        { id: "s9d3_9", type: "long", label: "Interaction 1: was there a moment where I could have moved the dial up slightly?" },
        { id: "s9d3_10", type: "text", label: "Interaction 2: who it was with" },
        { id: "s9d3_11", type: "scale", label: "Interaction 2: where did the dial sit?", min: 0, max: 10 },
        { id: "s9d3_12", type: "long", label: "Interaction 2: what did I show?" },
        { id: "s9d3_13", type: "long", label: "Interaction 2: what did I hold back?" },
        { id: "s9d3_14", type: "long", label: "Interaction 2: what was the cost of holding back?" },
        { id: "s9d3_15", type: "long", label: "Interaction 2: was there a moment where I could have moved the dial up slightly?" },
        { id: "s9d3_16", type: "long", label: "Identify a moment where your dial was lower than 3. If you had been able to turn it up slightly, what might you have said or shown?" }
      ]
    },
    {
      day: 5,
      title: "Expressing needs",
      intro: "Today, express one need or true feeling as precisely and as gently as you can. It doesn't have to be from the 'conversation waiting to be had'. It can be small. For example: 'I need some quiet time this afternoon.' 'I found that hard.' 'I'm not okay today and I wanted you to know.'",
      fields: [
        { id: "s9d5_1", type: "long", label: "What I expressed" },
        { id: "s9d5_2", type: "long", label: "How I expressed it" },
        { id: "s9d5_3", type: "long", label: "Their response (actual, not feared)" },
        { id: "s9d5_4", type: "text", label: "What I noticed in my body before" },
        { id: "s9d5_5", type: "text", label: "What I noticed in my body during" },
        { id: "s9d5_6", type: "text", label: "What I noticed in my body after" },
        { id: "s9d5_7", type: "long", label: "Reflection: was the actual response different from what you feared? What does that tell you about the belief that was keeping the dial low?" }
      ]
    }
  ]
});

SESSIONS_PART.push({
  n: 10,
  title: "Relapse Prevention and Future Planning",
  tagline: "Your warning signs, maintenance plan and crisis ladder",
  minutes: 10,
  teach: [
    {
      h: "What does relapse really mean?",
      p: [
        "The word relapse carries a particular weight. In many clinical frameworks it implies failure and a return to zero. That is not how we use it here, because that is not how the nervous system works.",
        "A setback is a temporary increase in symptoms, a return of avoidance, or a difficult period that disrupts the patterns you have been building. In most cases setbacks are guaranteed to happen, because the stresses of life are unavoidable: illness, loss, transitions, seasons.",
        "A nervous system that has worked hard to become less reactive can respond to a significant stressor by temporarily behaving as it did before.",
        "A relapse is a sustained return to old patterns, over weeks or months, with no recovery trajectory. Even this is not failure. It is information. It means something in the environment or the self needs attention."
      ]
    },
    {
      h: "What sustained recovery is linked to",
      p: ["Research in FND recovery indicates that sustained recovery is associated with:"],
      bullets: [
        "Consistency over intensity",
        "Early recognition of warning signs",
        "Relationship quality",
        "A flexible, non-illness-defined identity",
        "Tolerance of uncertainty"
      ]
    },
    {
      p: [
        "Throughout this course you have worked hard on every one of these factors. Today you turn what you have learned into a plan you can carry forward. The exercises below build that plan, and you can come back to it at any time."
      ]
    },
    {
      h: "Revisiting early warning signs",
      p: [
        "Before you can respond early to a setback, you need to know what 'early' looks like for you. This is deeply personal. Two people with FND may have completely different warning signs: bodily sensations, thoughts, feelings, or behavioural shifts.",
        "The first exercise asks about four kinds of signal: physical, cognitive, behavioural and relational. For each, you describe what shows up early, before things have fully escalated.",
        "You then summarise your signs as a traffic light system. Green is stable: you are holding your middle zone, sleep is adequate, you are connecting with others, doing at least one valued activity, and thoughts are not dominated by symptoms. Amber is early drift. Red is a significant setback."
      ]
    },
    {
      h: "Your maintenance plan",
      p: [
        "A maintenance plan is an everyday structure that keeps your nervous system stable and your identity as expanded as possible.",
        "It starts with your non-negotiables: the small, regular, repeatable things that make the most difference to your stability. Not aspirational habits. The actual things that, when present, keep you in the green zone. These cover movement, sleep, social connection, values-anchored activity and nervous system regulation.",
        "It then draws on earlier sessions: your pacing commitments from Session 7 (the middle zone and the 80% check), your identity maintenance from Session 8 (your self-statement and values), and your relational maintenance from Session 9."
      ]
    },
    {
      h: "Your crisis ladder",
      p: [
        "The crisis ladder is a tiered response plan: a sequence of steps, from smallest to most supported, that you can move through without having to think from scratch in the middle of a setback. It is for moments when the maintenance plan is not enough and you are in the amber or red zone.",
        "The key principle is to respond at the level the situation requires, as early as possible."
      ],
      bullets: [
        "Rung 1 - Self-directed, immediate (Green to Amber): the first things you do when you notice early drift. No one else required.",
        "Rung 2 - Relational support (Amber, persisting): if Rung 1 has not shifted things within a few days, you reach out to someone in your life.",
        "Rung 3 - Professional support (Amber to Red): if the drift has continued for more than a set number of weeks, you contact a named professional or service.",
        "Rung 4 - Emergency / crisis (Red, sustained): if things have escalated significantly and you are struggling to function or keep yourself safe."
      ]
    },
    {
      h: "Carrying forward",
      p: [
        "Finally, look back across all ten sessions. Identify the three things that have been most useful: the ideas, skills or moments that shifted something in you. And name one thing you want to make sure you do not forget.",
        "Your Day 1 homework is the first day of your maintenance plan. Today is Day 1 of the rest of it."
      ]
    },
    { quote: "A setback is not a return to zero. It is information." }
  ],
  practice: "Begin living your maintenance plan from Day 1 onwards, with a daily check-in. Complete the final reflection on Day 6. Keep your maintenance plan and crisis ladder somewhere you can find them.",
  homework: [
    {
      day: 0,
      title: "In-session exercise: My early warning signs",
      intro: "Before you can respond early to a setback, you need to know what early looks like for you. Describe your own signals as specifically as you can.",
      fields: [
        { id: "s10d0_1", type: "long", label: "Physical signals, early signs: what happens in your body in the early stages of a setback, before symptoms have fully intensified?", hint: "e.g. sleep quality worsening, increased fatigue after minimal effort, specific sensations returning, appetite changes, tension in particular areas" },
        { id: "s10d0_2", type: "long", label: "Physical signals: what tends to come later, once it has already escalated" },
        { id: "s10d0_3", type: "long", label: "Cognitive signals, early signs: what shifts in your thinking when you are beginning to drift?", hint: "e.g. catastrophic thoughts returning, increased health preoccupation, all-or-nothing thinking reappearing, difficulty concentrating, rumination increasing" },
        { id: "s10d0_4", type: "long", label: "A thought that, if I notice it regularly, is a signal" },
        { id: "s10d0_5", type: "long", label: "Behavioural signals: what do you start doing before a drift begins? I start:", hint: "e.g. withdrawing from social contact, dropping the middle-zone behaviour, avoidance of previously tolerated activities, sleep schedule disrupting, stopping valued activities" },
        { id: "s10d0_6", type: "long", label: "Behavioural signals: what do you stop doing before a drift begins? I stop:" },
        { id: "s10d0_7", type: "long", label: "Relationship signals, early signs: how do your relationships shift in the early stages?", hint: "e.g. dial drops very low, irritability increases, cancelling plans, over-explaining symptoms, withdrawing from connection, conflict with close others" },
        { id: "s10d0_8", type: "note", label: "Putting it together: your traffic light system. Using what you've identified above, summarise your warning signs across three levels. Be as specific as possible." },
        { id: "s10d0_9", type: "long", label: "Green - stable: what it looks like for me", hint: "e.g. I'm holding my middle zone. Sleep is adequate. I'm connecting with others. I'm doing at least one valued activity. Thoughts are not dominated by symptoms." },
        { id: "s10d0_10", type: "long", label: "Amber - early drift: what it looks like for me" },
        { id: "s10d0_11", type: "long", label: "Red - significant setback: what it looks like for me" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: My maintenance plan",
      intro: "A maintenance plan is an everyday structure that keeps your nervous system stable and your identity as expanded as possible.",
      fields: [
        { id: "s10d0_12", type: "note", label: "Part A: The non-negotiables. These are the things, small, regular and repeatable, that make the most difference to your stability. Not aspirational habits. The actual things that, when present, keep you in the green zone." },
        { id: "s10d0_13", type: "long", label: "Movement / physical routine: what, how often, at what level" },
        { id: "s10d0_14", type: "long", label: "Sleep structure: what protects your sleep (times, wind-down, what to avoid)" },
        { id: "s10d0_15", type: "long", label: "Social connection: the minimum contact that keeps isolation from taking hold" },
        { id: "s10d0_16", type: "long", label: "Values-anchored activity: at least one activity per week that connects to something that matters to you, regardless of symptom level" },
        { id: "s10d0_17", type: "long", label: "Nervous system regulation: the practice that most reliably helps when activation rises (from your work across the programme)" },
        { id: "s10d0_18", type: "note", label: "Part B: Pacing commitments. From Session 7's work on the push-crash cycle, review your middle zone." },
        { id: "s10d0_19", type: "long", label: "The middle-zone behaviour I will continue" },
        { id: "s10d0_20", type: "long", label: "My 80% check: when I notice the urge to push, I will" },
        { id: "s10d0_21", type: "note", label: "Part C: Identity maintenance. From Session 8's work on illness identity, record what you want to carry forward." },
        { id: "s10d0_22", type: "long", label: "My working self-statement" },
        { id: "s10d0_23", type: "long", label: "The values I am anchoring my identity to" },
        { id: "s10d0_24", type: "long", label: "One way I will continue expressing those values weekly" },
        { id: "s10d0_25", type: "note", label: "Part D: Relational maintenance. From Session 9, one commitment to interpersonal health." },
        { id: "s10d0_26", type: "long", label: "I will continue to work on" },
        { id: "s10d0_27", type: "text", label: "The person in my life I want to communicate more honestly with" },
        { id: "s10d0_28", type: "long", label: "One thing I will do differently in that relationship" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: My crisis ladder",
      intro: "A sequence of steps, from smallest to most supported, for when the maintenance plan is not enough and you are in the amber or red zone. Respond at the level the situation requires, as early as possible.",
      fields: [
        { id: "s10d0_29", type: "note", label: "Rung 1 - Self-directed, immediate (Green to Amber). The first things I do when I notice early drift. No one else required." },
        { id: "s10d0_30", type: "long", label: "Rung 1: what I will do", hint: "e.g. return to the middle-zone behaviour, use the grounding practice, re-read my self-statement, do the threshold question honestly, reduce commitments for 48 hours" },
        { id: "s10d0_31", type: "number", label: "Rung 1 time window: I will do this within this many hours of noticing the warning signs" },
        { id: "s10d0_32", type: "note", label: "Rung 2 - Relational support (Amber, persisting). If Rung 1 hasn't shifted things within a few days, I will reach out to someone in my life." },
        { id: "s10d0_33", type: "text", label: "Rung 2: who" },
        { id: "s10d0_34", type: "long", label: "Rung 2: what I will say (specifically, not vaguely)" },
        { id: "s10d0_35", type: "long", label: "Rung 2: what I am asking for (not just checking in, an actual request)" },
        { id: "s10d0_36", type: "note", label: "Rung 3 - Professional support (Amber to Red)." },
        { id: "s10d0_37", type: "number", label: "Rung 3: if the drift has continued for more than this many weeks, I will contact a professional" },
        { id: "s10d0_38", type: "text", label: "Rung 3: name / service" },
        { id: "s10d0_39", type: "text", label: "Rung 3: how I will contact them" },
        { id: "s10d0_40", type: "long", label: "Rung 3: what I will tell them" },
        { id: "s10d0_41", type: "long", label: "The thing I most need a professional to understand about how I present", hint: "e.g. \"I tend to minimise when I'm not okay.\" \"I need someone to ask directly.\"" },
        { id: "s10d0_42", type: "note", label: "Rung 4 - Emergency / crisis (Red, sustained). If things have escalated significantly and I am struggling to function or keep myself safe:" },
        { id: "s10d0_43", type: "text", label: "Rung 4: who I will contact" },
        { id: "s10d0_44", type: "text", label: "The one person who knows me best and can advocate for me if I can't" },
        { id: "s10d0_45", type: "long", label: "What they need to know" },
        { id: "s10d0_46", type: "long", label: "The one thing I know I need to hear when I am in a setback, written now, from a steadier place", hint: "Write this as if writing to a future version of yourself who is struggling. What does that person need to know?" }
      ]
    },
    {
      day: 0,
      title: "In-session exercise: What you are carrying forward",
      intro: "From across the ten sessions of this programme, identify the three things that have been most useful: the ideas, skills or moments that have shifted something within you.",
      fields: [
        { id: "s10d0_47", type: "long", label: "1." },
        { id: "s10d0_48", type: "long", label: "2." },
        { id: "s10d0_49", type: "long", label: "3." },
        { id: "s10d0_50", type: "long", label: "What is one thing you want to make sure you don't forget?" }
      ]
    },
    {
      day: 1,
      title: "Living my maintenance plan (Day 1 and onwards)",
      intro: "Your first day of the maintenance plan. Today is Day 1 of the rest of it. Try your best to deliberately enact as many of your non-negotiables as today allows.",
      fields: [
        { id: "s10d1_1", type: "scale", label: "Nervous system activation", min: 1, max: 10 },
        { id: "s10d1_2", type: "scale", label: "Symptom level today", min: 1, max: 10 },
        { id: "s10d1_3", type: "choice", label: "Traffic light status today", options: ["Green", "Amber", "Red"] },
        { id: "s10d1_4", type: "long", label: "Which non-negotiables did I manage today?" },
        { id: "s10d1_5", type: "long", label: "Was there a moment today where I noticed the urge to push past my ceiling, or drop below my floor? What did I do?" },
        { id: "s10d1_6", type: "long", label: "Did I notice any warning signs today?" }
      ]
    },
    {
      day: 6,
      title: "One final reflection",
      fields: [
        { id: "s10d6_1", type: "long", label: "Across all 10 sessions, the most important thing I learned about myself" },
        { id: "s10d6_2", type: "long", label: "The thing I most want to remember on a hard day" },
        { id: "s10d6_3", type: "text", label: "My crisis ladder is stored:" },
        { id: "s10d6_4", type: "text", label: "My maintenance plan is stored:" },
        { id: "s10d6_5", type: "text", label: "If things get hard, the first person I will call is:" }
      ]
    }
  ]
});
