# Step-by-Step Guide to Update initialData.js for telc B1

## 🎯 Overview
This guide shows you EXACTLY how to update your `src/data/initialData.js` file for telc B1. Follow these steps carefully to avoid syntax errors.

---

## ✅ Step 1: Update Week 1, Day 1 (Exam Overview)

### Location: Find this section around line 7-35

**FIND:**
```javascript
{
  day: 1,
  task: "Mastering Nominative & Accusative Cases",
  focus: "grammar",
  level: "B1",
  lessonContent: {
    title: "The Case Detectives: Who is the hero?",
    definition: "Hallo! Today we start with the two most essential German cases...
```

**CHANGE THE TASK NAME TO:**
```javascript
task: "Understanding telc B1 Exam + Nominative & Accusative Cases",
```

**CHANGE THE TITLE TO:**
```javascript
title: "Welcome to telc B1 Preparation!",
```

**ADD TO THE BEGINNING OF `definition` (before "Hallo!"):**
```javascript
definition: "**telc B1 Exam Overview:**\n\n**Written Exam (150 min total):**\n1. Leseverstehen (Reading): 3 parts\n2. Sprachbausteine (Language Elements): Grammar & vocab fill-in - UNIQUE to telc!\n3. Hörverstehen (Listening): ~30 min, True/False\n4. Schriftlicher Ausdruck (Writing): ONE email, 30 min, 4 Leitpunkte\n\n**Oral Exam (15-16 min + 20 min prep):**\n- Teil 1: Sich vorstellen\n- Teil 2: Über ein Thema sprechen\n- Teil 3: Gemeinsam etwas planen\n\n**Passing:** 60% written (135/225 pts) AND 60% oral (45/75 pts)\n\n---\n\nHallo! Today we start with the two most essential German cases...
```

**ADD ONE MORE SUBTASK** (after the existing 4):
```javascript
{ description: "Read the telc B1 exam structure above. Note the 4 written sections and time allocations.", completed: false },
```

**UPDATE RESOURCES** - Change first resource from:
```javascript
{ name: "Goethe Grammar: Cases", url: "https://www.goethe.de" },
```

TO:
```javascript
{ name: "telc Official Website", url: "https://www.telc.net" },
```

---

## ✅ Step 2: Update Week 1, Day 5 (Add telc Writing Note)

### Location: Find this section around line 100-125

**FIND:**
```javascript
{
  day: 5,
  task: "Writing: Consistent Tense Usage",
  focus: "writing",
```

**CHANGE TASK NAME TO:**
```javascript
task: "Writing with Perfekt Tense + telc Writing Format Intro",
```

**AT THE END OF THE `tips` STRING, ADD:**
```javascript
tips: "...Always put the past participle at the **very end** of the sentence.\n\n**telc B1 Note:** In the actual exam, you'll write ONE email (not a journal entry). We're practicing Perfekt tense here because you'll need it! We'll practice the exact telc format in Week 2, Day 5."
```

---

## ✅ Step 3: COMPLETELY REPLACE Week 2, Day 5

### Location: Find Week 2, Day 5 around line 230-260

**FIND THIS ENTIRE SECTION:**
```javascript
{
  day: 5,
  task: "Writing a Balanced Restaurant Review",
  focus: "writing",
  level: "B1",
  lessonContent: {
    title: "Schreiben Sie eine Bewertung: Clear and Balanced Critique",
    definition: "Your final task this week is to write a short, balanced restaurant review (100-120 words)...
```

**REPLACE THE ENTIRE DAY 5 WITH:**

```javascript
{
  day: 5,
  task: "telc B1 Writing: ONE Email with 4 Leitpunkte",
  focus: "writing",
  level: "B1",
  lessonContent: {
    title: "Schriftlicher Ausdruck: The telc B1 Writing Task",
    definition: "**CRITICAL telc B1 Format:** You write only ONE email/letter responding to 4 specific Leitpunkte (guiding points) in exactly 30 minutes. Target: 120-150 words.\n\n**Typical Scenarios:**\n- Semi-formal: Apartment manager, company inquiry, course registration\n- Informal: Friend's invitation, giving advice, sharing plans\n\n**The 4 Leitpunkte:** The exam gives you 4 points you MUST address:\n1. Often a question\n2. Request for information\n3. Give your opinion\n4. Suggest something\n\n**YOU MUST ADDRESS ALL 4 POINTS!**",
    example: "**Example Task (Informal):**\nYour friend Maria invites you to her birthday party. Write an email:\n1. Thank her for the invitation\n2. Say whether you can come (give reasons)\n3. Ask what you should bring\n4. Suggest an activity\n\n**Sample Response:**\n\nLiebe Maria,\n\nvielen Dank für die Einladung! [1] Ich freue mich sehr. [2] Leider kann ich erst um 19 Uhr kommen, weil ich vorher arbeiten muss.\n\nWas soll ich mitbringen? [3] Möchtest du einen Kuchen? Ich kann auch Getränke besorgen.\n\nIch habe eine Idee: [4] Wir könnten Karaoke singen! Was meinst du?\n\nBis bald!\n[Your name]",
    tips: "**telc Strategy:**\n1. READ - Identify all 4 Leitpunkte\n2. PLAN (3 min) - Notes for each point\n3. WRITE (20 min) - Address all points\n4. CHECK (7 min) - All 4 points? Articles? Verb position?\n\n**Time:** Exactly 30 minutes (not 60!)\n\n**Mistakes to Avoid:**\n- Missing one point (big deduction!)\n- Too short or too long\n- Wrong formality (du vs Sie)\n- No greeting/closing"
  },
  subtasks: [
    { description: "Study the 4-Leitpunkte structure. Understand ALL 4 points must be addressed in ONE email.", completed: false },
    { description: "Find writing task in your telc PDF (page 17). Identify the 4 Leitpunkte.", completed: false },
    { description: "Write first practice email (informal) in 30 minutes. Check: All 4 points? 120-150 words?", completed: false },
    { description: "Write second email (semi-formal, use Sie) in 30 minutes.", completed: false },
    { description: "Review both emails: Verb position? Articles? All 4 points clearly addressed?", completed: false }
  ],
  completed: false,
  resources: [
    { name: "telc B1 Writing Examples", url: "https://www.telc.net" },
    { name: "Journaly Writing Community", url: "https://www.journaly.com" },
    { name: "Your telc B1 PDF", url: "file:///telcb1/telc_deutsch_b1_zd_uebungstest_1.pdf" }
  ],
  notes: ""
}
```

---

## ✅ Step 4: Add Vocabulary for telc-Specific Terms

### Location: At the END of `vocabularyData` array (around line 270)

**FIND:**
```javascript
{ word: "Lecker", translation: "tasty/delicious", focus: "vocabulary", week: 2 }
];
```

**CHANGE TO (add these entries BEFORE the closing bracket):**
```javascript
{ word: "Lecker", translation: "tasty/delicious", focus: "vocabulary", week: 2 },
{ word: "Sprachbausteine", translation: "language elements (grammar section)", focus: "grammar", week: 3 },
{ word: "Leitpunkte", translation: "guiding points", focus: "vocabulary", week: 3 },
{ word: "sich freuen auf", translation: "to look forward to", focus: "vocabulary", week: 3 },
{ word: "warten auf", translation: "to wait for", focus: "vocabulary", week: 3 },
{ word: "denken an", translation: "to think of", focus: "vocabulary", week: 3 }
];
```

---

## ✅ Step 5: Add New Quotes (Optional)

### Location: At the END of `quotes` array (around line 278)

**FIND:**
```javascript
{ german: "Konstanz ist der Schlüssel!", english: "Consistency is the key!" }
];
```

**CHANGE TO (add these BEFORE the closing bracket):**
```javascript
{ german: "Konstanz ist der Schlüssel!", english: "Consistency is the key!" },
{ german: "Übung macht den Meister!", english: "Practice makes perfect!" },
{ german: "Bleib dran!", english: "Keep at it!" }
];
```

---

## 🎯 Step 6: Create Week 3 (Sprachbausteine Week)

### THIS IS THE BIG ONE - ADD A NEW WEEK

This is complex, so I'll create a separate file with the complete Week 3 structure that you can copy-paste.

### Location: AFTER Week 2 closes (after the `]` that closes Week 2's days array)

**FIND:**
```javascript
          notes: ""
        }
      ]
    }
  ]
};
```

**CHANGE TO:**
```javascript
          notes: ""
        }
      ]
    },
    {
      week: 3,
      goal: "telc Sprachbausteine & Speaking",
      days: [
        {
          day: 1,
          task: "Sprachbausteine Grammar Practice",
          focus: "grammar",
          level: "B1",
          lessonContent: {
            title: "Sprachbausteine: telc's Grammar Section",
            definition: "**UNIQUE TO telc!** Sprachbausteine tests grammar through fill-in-the-blank. Teil 1: 10 multiple-choice grammar questions. Tests: articles, cases, prepositions, conjunctions, verb forms. Strategy: Read full sentence, identify what's missing, eliminate wrong answers.",
            example: "**Example:** Ich gehe heute ____ Park.\na) in den (correct - Accusative movement)\nb) im\nc) in die\nd) ins\n\n**Key Patterns:**\n- Accusative (movement): in, an, auf\n- Dative (location): in, an, auf, bei, mit, nach\n- Always Accusative: durch, für, gegen, ohne, um\n- Always Dative: aus, bei, mit, nach, seit, von, zu",
            tips: "**Tips:** Read FIRST, identify grammar point, use elimination, ~15-20 min for Sprachbausteine. Common traps: weil vs dass, movement (Akk) vs location (Dat)."
          },
          subtasks: [
            { description: "Review preposition + case rules. Make flashcards for 'Always Accusative' and 'Always Dative'.", completed: false },
            { description: "Practice 20 Sprachbausteine questions from your telc PDF or online resources.", completed: false },
            { description: "Identify weak spots: Cases? Prepositions? Conjunctions? Focus extra practice there.", completed: false },
            { description: "Do 10 more questions, timed (10 questions in 10-12 minutes).", completed: false }
          ],
          completed: false,
          resources: [
            { name: "telc Practice Materials", url: "https://www.telc.net" },
            { name: "DeutschLern Exercises", url: "https://deutschlern.net" },
            { name: "Schubert Verlag", url: "https://www.schubert-verlag.de" },
            { name: "Your telc PDF", url: "file:///telcb1/telc_deutsch_b1_zd_uebungstest_1.pdf" }
          ],
          notes: ""
        },
        {
          day: 2,
          task: "Sprachbausteine Vocabulary Practice",
          focus: "vocabulary",
          level: "B1",
          lessonContent: {
            title: "Vocabulary in Context: Collocations",
            definition: "**Teil 2:** 10 gaps, 15 options (5 distractors!). Tests: collocations, fixed phrases, context-appropriate vocabulary. Strategy: Read full text, fill EASY gaps first, cross out used words, check verb+preposition combos.",
            example: "**Common Collocations:**\n- eine Entscheidung treffen (make a decision)\n- Angst haben vor (be afraid of)\n- sich freuen auf (look forward to)\n- sich freuen über (be happy about)\n- denken an (think of)\n- warten auf (wait for)\n- sich interessieren für (be interested in)",
            tips: "**Strategy:** Read entire text first, fill 100% sure answers, cross out used words, check collocations, use context clues (formal/informal? present/past?). Mistakes: not reading full text, forgetting to cross out, ignoring preposition requirements."
          },
          subtasks: [
            { description: "Learn the 7 collocations above. Create sentences using each.", completed: false },
            { description: "Practice 2 Sprachbausteine Teil 2 exercises (10 gaps each). Time: 8-10 min per exercise.", completed: false },
            { description: "Review mistakes. List collocations and verb+preposition combos you got wrong.", completed: false },
            { description: "Create flashcards for 20 common B1 collocations.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "telc Practice Materials", url: "https://www.telc.net" },
            { name: "DWDS Collocations", url: "https://www.dwds.de" },
            { name: "Anki Flashcards", url: "https://www.ankiweb.net" }
          ],
          notes: ""
        },
        {
          day: 3,
          task: "Semi-formal Email Writing",
          focus: "writing",
          level: "B1",
          lessonContent: {
            title: "Semi-formal Emails with Sie",
            definition: "Semi-formal emails use **Sie** (formal you) but keep friendly tone. Common: apartment manager, company inquiry, course registration, polite complaint. Key: Use Sie, formal greeting (Sehr geehrte Damen und Herren), formal closing (Mit freundlichen Grüßen), polite language (Ich würde gern... / Könnten Sie bitte...).",
            example: "**Opening:** Sehr geehrte Damen und Herren / Sehr geehrter Herr [Name]\n**Polite requests:** Könnten Sie mir bitte... / Ich würde gern wissen...\n**Closing:** Mit freundlichen Grüßen / Vielen Dank im Voraus / Ich freue mich auf Ihre Antwort",
            tips: "**Remember:** Sie verb = sie (they) verb: Sie haben (not Sie habt). Time: 3 min plan, 20 min write, 7 min check. Check: All 4 points? Sie consistently? 120-150 words? Verb V2 position?"
          },
          subtasks: [
            { description: "Study semi-formal structure. Note: Sie form, formal greeting/closing, polite phrases.", completed: false },
            { description: "Write email to language school asking about course details. 30 minutes! Use 4 sample Leitpunkte.", completed: false },
            { description: "Write email to apartment manager about repair issue. 30 minutes!", completed: false },
            { description: "Self-check: All 4 points? Sie consistently? 120-150 words? Verb position V2?", completed: false }
          ],
          completed: false,
          resources: [
            { name: "telc Writing Examples", url: "https://www.telc.net" },
            { name: "Journaly", url: "https://www.journaly.com" },
            { name: "Email Phrases Guide", url: "https://www.germanveryeasy.com" }
          ],
          notes: ""
        },
        {
          day: 4,
          task: "telc Listening: True/False Strategy",
          focus: "listening",
          level: "B1",
          lessonContent: {
            title: "Hörverstehen: Richtig/Falsch Mastery",
            definition: "telc B1 listening: 3 parts, Richtig/Falsch (True/False), ~30 min, 20 questions total. Teil 1: Global (5 Q), Teil 2: Detail (10 Q), Teil 3: Selective (5 Q). Strategy: Read questions BEFORE listening, note keywords, mark R/F immediately, second listening to confirm, guess if unsure (no penalty!).",
            example: "**Traps:** Synonyms (audio: Auto, question: Wagen), Negation (nicht/kein changes meaning!), Partial truth (partly true but main point false). **Prepare:** Listen to German daily, practice with telc samples, focus on: Wann? Warum? Wo? Wie lange?, train ear for numbers/times/days.",
            tips: "**During exam:** Stay calm if you miss one, move to next. Use second listening to CONFIRM (not completely redo). Write answers clearly on answer sheet."
          },
          subtasks: [
            { description: "Complete listening section from telc PDF. Read ALL questions before starting audio.", completed: false },
            { description: "Check answers. For wrong ones, listen again - WHY wrong? (missed keyword? negation?)", completed: false },
            { description: "Practice selective listening: German podcast, write down 5 key facts (names, numbers, places).", completed: false },
            { description: "Create 'listening vocabulary' list: 20 words hard to hear (dreizehn vs dreißig).", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Your telc PDF + Audio", url: "file:///telcb1/telc_deutsch_b1_zd_uebungstest_1.pdf" },
            { name: "DW Langsam gesprochene Nachrichten", url: "https://www.dw.com" },
            { name: "Easy German Podcast", url: "https://www.easygerman.org" }
          ],
          notes: ""
        },
        {
          day: 5,
          task: "telc Speaking: Teil 1, 2, 3 Format",
          focus: "speaking",
          level: "B1",
          lessonContent: {
            title: "Mündliche Prüfung: The 3-Part Speaking Test",
            definition: "telc oral: 15-16 min (after 20 min prep) with partner. **Teil 1:** Sich vorstellen (1-2 min) - brief intro, get to know partner, natural/friendly. **Teil 2:** Über ein Thema sprechen (5-6 min) - each present different topic, partner asks questions. **Teil 3:** Gemeinsam etwas planen (6-7 min) - collaborate to plan something, address 5-6 Leitpunkte together, negotiate/agree.",
            example: "**Teil 1:** Hallo, ich bin Sarah. Woher kommst du? Was machst du?\n\n**Teil 2:** Ich reise gern, weil... [2-3 min] Partner: Wie lange warst du dort?\n\n**Teil 3:** Plan Abschiedsparty - A: Wann machen wir die Party? B: Freitag wäre gut. A: Einverstanden! Und wo? B: Im Büro? A: Gute Idee!",
            tips: "**Teil 1:** Be natural, ask partner questions, show interest. **Teil 2:** 2-3 min presentation, structure it, answer naturally. **Teil 3:** COLLABORATIVE not debate! Make suggestions (Ich schlage vor...), agree politely (Gute Idee!), address ALL Leitpunkte, reach decisions together. **General:** Speak clearly not fast, eye contact, fluency > perfection, use connectors (also, aber, deshalb)."
          },
          subtasks: [
            { description: "Study telc speaking format. Understand the 3 parts and expectations.", completed: false },
            { description: "Teil 1: Record 1-min self-intro. Include: name, origin, job, hobbies.", completed: false },
            { description: "Teil 2: Choose topic (travel, work, hobbies). Prepare notes, speak 2-3 min. Record yourself.", completed: false },
            { description: "Teil 3: Find collaborative task in telc PDF. Role-play both roles. Address all Leitpunkte!", completed: false },
            { description: "Listen to recordings. Check: Clear speech? Connectors? All points? Note improvements needed.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Your telc PDF (Mündliche Prüfung)", url: "file:///telcb1/telc_deutsch_b1_zd_uebungstest_1.pdf" },
            { name: "iTalki Speaking Partners", url: "https://www.italki.com" },
            { name: "Tandem Language Exchange", url: "https://www.tandem.net" },
            { name: "YouTube telc B1 Speaking Examples", url: "https://www.youtube.com" }
          ],
          notes: ""
        }
      ]
    }
  ]
};
```

---

## ✅ Step 7: Save and Test

1. **Save the file** (Ctrl+S or Cmd+S)
2. **Check for syntax errors** in VS Code (look for red squiggly lines)
3. **Test your app** - Refresh and see if Week 1, 2, 3 display correctly

---

## 🚨 COMMON MISTAKES TO AVOID

1. **Missing commas** between array items
2. **Unterminated strings** - Make sure all quotes are closed
3. **Extra commas** after last item in array
4. **Wrong quote types** - Use `"` not `'` or `'` or `"`
5. **Unescaped newlines** - Use `\n` for line breaks in strings

---

## 🆘 IF SOMETHING BREAKS

1. **Check the browser console** (F12) for JavaScript errors
2. **Look at line numbers** in VS Code - errors will be highlighted in red
3. **Restore from backup** if needed:
   ```bash
   cd ~/projects/german-b1-learning-tracker
   git checkout src/data/initialData.js
   ```
   Then try again more carefully!

---

## ✅ VERIFICATION CHECKLIST

After making changes, verify:
- [ ] Week 1, Day 1 mentions "telc B1 Exam Overview"
- [ ] Week 1, Day 5 mentions "telc Writing Format"
- [ ] Week 2, Day 5 is about "ONE Email with 4 Leitpunkte" (not restaurant review)
- [ ] Week 3 exists with 5 days
- [ ] Week 3, Days 1-2 are about "Sprachbausteine"
- [ ] Week 3, Day 5 mentions "Teil 1, 2, 3" for speaking
- [ ] VocabularyData includes "Sprachbausteine" and "Leitpunkte"
- [ ] App loads without errors in browser console

---

## 🎯 NEXT STEPS AFTER UPDATING

Once your app data is updated:

1. **Read your telc PDF** cover to cover (1 hour)
2. **Do the practice test** in the PDF (2.5 hours)
3. **Find Sprachbausteine practice** online (search: "telc B1 Sprachbausteine Übungen")
4. **Write first timed email** (30 minutes, 4 Leitpunkte)
5. **Find speaking partner** on italki or Tandem app

---

**Good luck! You've got 8 weeks - that's plenty of time! 💪**

*Remember: The goal isn't perfection, it's passing with 60%!*
