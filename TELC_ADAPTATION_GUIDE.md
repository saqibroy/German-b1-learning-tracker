# telc B1 Adaptation Guide for German B1 Learning Tracker

## CRITICAL CHANGES NEEDED (Priority Order)

Based on the analysis provided and review of your App.jsx data structure, here are the essential changes to adapt from Goethe B1 to telc B1:

---

## 1. EXAM STRUCTURE OVERVIEW (Week 1, Day 1) - **HIGHEST PRIORITY** ✓ UPDATED

**Changes Made:**
- ✅ Updated `examOverview` object (lines 295-310) to reflect telc format
- ✅ Changed total duration from "~180 minutes" to "2h 30min written + 15min speaking"
- ✅ Added description of telc's compensation system
- ✅ Updated modules structure with telc-specific sections
- ✅ Added "Sprachbausteine" section unique to telc

**Still Needs Update in Day 1 lesson content (lines 320-360):**

Replace the exam format section with:

```javascript
example: "**telc DEUTSCH B1 EXAM FORMAT BREAKDOWN:**\n\n**SCHRIFTLICHE PRÜFUNG (Written Exam) - 150 minutes, 225 points:**\n**Passing Score: 135/225 points (60%)**\n\n**LESEN (Reading) - ~25 minutes, Part of 225:**\n- Similar to Goethe but integrated with Sprachbausteine\n- Teil 1-5: Various text types\n- Focus on comprehension and scanning\n\n**SPRACHBAUSTEINE (Language Elements) - ~15 minutes, Part of 225:**\n- **UNIQUE TO telc!** Fill-in-the-blank grammar exercises\n- Tests: Articles, prepositions, conjunctions, verb forms\n- Multiple choice format\n- This section does NOT exist in Goethe!\n\n**HÖREN (Listening) - ~25-30 minutes, Part of 225:**\n- Teil 1: Short messages (plays TWICE)\n- Teil 2: Longer conversations\n- Teil 3: Radio/discussions\n- Shorter than Goethe (25-30 min vs 40 min)\n\n**SCHREIBEN (Writing) - 30 minutes, Part of 225:**\n- **CRITICAL DIFFERENCE:** ONE semi-formal letter ONLY (not 3 tasks!)\n- Based on 4 guiding questions/points\n- ~120-150 words (more flexible than Goethe's strict 80)\n- No separate email/forum/formal letter tasks!\n\n**MÜNDLICHE PRÜFUNG (Speaking) - 15-16 minutes + 20 min prep, 75 points:**\n**Passing Score: 45/75 points (60%)**\n\n- **Teil 1: Sich vorstellen (Introduce yourself)** - NOT planning task!\n  - Make contact with partner\n  - Talk about yourself\n  - ~2-3 minutes\n\n- **Teil 2: Über ein Thema sprechen (Discuss a topic)**\n  - Both partners discuss prepared topic together\n  - ~4-5 minutes\n\n- **Teil 3: Gemeinsam etwas planen (Plan something together)**\n  - Collaborative planning (similar to Goethe Teil 1)\n  - ~4-5 minutes\n\n**KEY DIFFERENCE FROM GOETHE:**\ntelc allows compensation WITHIN written and oral sections. You can score lower in Reading if higher in Writing, as long as you reach 60% overall in each main section."
```

---

## 2. WRITING MODULE REWRITE - **HIGHEST PRIORITY**

### Week 2, Day 3 (Currently lines 700+)

**Current:** Describes 3 writing tasks (email, forum, formal letter) - 60 minutes total
**telc Reality:** 1 semi-formal letter - 30 minutes

**Complete Replacement Needed:**

```javascript
{
  day: 3,
  task: "Writing Module: The Semi-Formal Letter (telc Specific)",
  focus: "writing",
  level: "B1",
  lessonContent: {
    title: "Schreiben: Your ONE Letter Task - Master the 4-Point Structure",
    definition: "telc B1 Writing = ONE semi-formal letter in 30 minutes based on 4 guiding questions. This is COMPLETELY DIFFERENT from Goethe's 3 separate tasks! You write to institutions, companies, or organizations about practical situations.\n\n**The Format:**\n- Time: 30 minutes (vs Goethe's 60 min)\n- Length: ~120-150 words (more flexible than Goethe)\n- Type: Semi-formal letter\n- Structure: 4 guiding points/questions you MUST address\n- Register: Semi-formal (Sie form, polite but not overly formal)\n\n**Common Situations:**\n- Inquiring about apartment/room\n- Complaining about service\n- Requesting information (course, job, service)\n- Responding to advertisement\n- Explaining problem and requesting solution\n\n**Scoring:** Points are part of the overall 225-point written exam",
    
    example: "**COMPLETE telc WRITING EXAMPLE:**\n\n**THE TASK:**\n'Sie suchen ein Zimmer in Berlin. Sie haben eine Anzeige im Internet gelesen. Schreiben Sie an den Vermieter, Herrn Koch. Schreiben Sie etwas zu allen vier Punkten:'\n\n(You're looking for a room in Berlin. You read an ad online. Write to the landlord, Mr. Koch. Write something about all four points:)\n\n1. Grund für Ihr Schreiben (Reason for writing)\n2. Informationen über sich (Information about yourself)\n3. Fragen zur Wohnung (Questions about the apartment)\n4. Besichtigungstermin vorschlagen (Suggest viewing appointment)\n\n**MODEL LETTER (142 words):**\n\n'Sehr geehrter Herr Koch,\n\nich habe Ihre Anzeige für ein Zimmer in Berlin-Mitte gelesen und interessiere mich sehr dafür.\n\nIch bin 25 Jahre alt und arbeite als Ingenieurin bei Siemens. Ich suche ein möbliertes Zimmer ab 1. Mai. Ich bin Nichtraucherin und sehr ordentlich.\n\nKönnen Sie mir bitte einige Fragen beantworten? Wie hoch sind die Nebenkosten? Ist eine Küche vorhanden? Darf ich das Zimmer besichtigen?\n\nIch würde das Zimmer gerne besichtigen. Passt Ihnen Samstag, der 15. April, um 14 Uhr? Wenn nicht, können wir auch einen anderen Termin vereinbaren.\n\nIch freue mich auf Ihre Antwort.\n\nMit freundlichen Grüßen\nMaria Schmidt'\n\n**ANALYSIS - The 4-Point Structure:**\n\n**Point 1: Grund (Reason)** ✓\n'ich habe Ihre Anzeige...gelesen und interessiere mich sehr dafür'\n\n**Point 2: Informationen über sich (About yourself)** ✓\n'Ich bin 25 Jahre alt und arbeite als Ingenieurin...Ich bin Nichtraucherin und sehr ordentlich'\n\n**Point 3: Fragen (Questions)** ✓\n'Wie hoch sind die Nebenkosten? Ist eine Küche vorhanden? Darf ich das Zimmer besichtigen?'\n\n**Point 4: Besichtigungstermin (Viewing appointment)** ✓\n'Ich würde das Zimmer gerne besichtigen. Passt Ihnen Samstag, der 15. April, um 14 Uhr?'\n\n**Word count:** 142 ✓ (120-150 range)\n**Tone:** Semi-formal (Sie form) ✓\n**Structure:** Clear paragraphs ✓\n**All points covered:** Yes ✓\n\n**ESSENTIAL LETTER COMPONENTS:**\n\n1. **Opening (Anrede):**\n   - Sehr geehrte Frau/Herr [Name],\n   - Sehr geehrte Damen und Herren, (if no name)\n\n2. **Introduction (Einleitung):**\n   - State why you're writing\n   - Reference the ad/situation\n   - Express interest\n\n3. **Main Body (Hauptteil):**\n   - Cover ALL 4 points systematically\n   - Use separate paragraph for each point (or combine logically)\n   - Provide specific details\n\n4. **Closing (Schluss):**\n   - Thank them/express hope for response\n   - 'Ich freue mich auf Ihre Antwort'\n   - 'Ich würde mich über eine Antwort freuen'\n\n5. **Sign-off (Grußformel):**\n   - Mit freundlichen Grüßen\n   - [Your full name]\n\n**15 COMMON LETTER TOPICS (Practice These!):**\n\n1. Zimmer/Wohnung suchen (Room/apartment search)\n2. Sprachkurs anfragen (Language course inquiry)\n3. Job bewerben (Job application)\n4. Produkt reklamieren (Product complaint)\n5. Service beschweren (Service complaint)\n6. Termin vereinbaren (Appointment request)\n7. Kündigung schreiben (Cancellation)\n8. Information anfragen (Information request)\n9. Kursanmeldung (Course registration)\n10. Praktikum bewerben (Internship application)\n11. Mitgliedschaft kündigen (Membership cancellation)\n12. Fehler melden (Report error)\n13. Einladung annehmen/ablehnen (Accept/decline invitation)\n14. Nachbarn wegen Problem schreiben (Write to neighbors about problem)\n15. Hausmeister kontaktieren (Contact building manager)",
    
    tips: "**10 telc WRITING STRATEGIES:**\n\n**1. The 4-Point Checklist Method:**\nBEFORE writing, number the 4 points on your paper (1, 2, 3, 4).\nAS you write, check off each point.\nREVIEW: Did I address ALL 4? If not, add missing content!\n\n**2. Time Management (30 minutes):**\n- Minutes 1-3: Read task, plan structure, note key vocab\n- Minutes 4-22: WRITE (don't overthink!)\n- Minutes 23-27: Count words (add if <120, cut if >160)\n- Minutes 28-30: Proofread (articles, verb endings, spelling)\n\n**3. The 'Paragraph = Point' Rule:**\nNew point = New paragraph\nMakes structure crystal clear for examiner\n\nParagraph 1: Opening + Point 1\nParagraph 2: Point 2\nParagraph 3: Point 3\nParagraph 4: Point 4\nParagraph 5: Closing\n\n**4. Essential Phrases Bank:**\n\n**Opening phrases:**\n- 'Ich habe Ihre Anzeige gelesen und...' (I read your ad and...)\n- 'Ich schreibe Ihnen, weil...' (I'm writing to you because...)\n- 'Ich möchte mich für...bewerben' (I would like to apply for...)\n- 'Ich habe mit Interesse von...gehört' (I heard with interest about...)\n\n**Information about yourself:**\n- 'Ich bin...Jahre alt und arbeite als...' \n- 'Zurzeit studiere ich... / arbeite ich bei...'\n- 'Ich komme aus... und wohne seit...in...'\n\n**Asking questions:**\n- 'Könnten Sie mir bitte sagen, ...?'\n- 'Ich hätte einige Fragen: ...'\n- 'Könnten Sie mir bitte mitteilen, ...?'\n- 'Ich würde gerne wissen, ...'\n\n**Making requests:**\n- 'Könnten Sie mir bitte...schicken?'\n- 'Ich würde gerne...'\n- 'Wäre es möglich, dass...?'\n\n**Suggesting times/dates:**\n- 'Passt Ihnen [day], der [date], um [time] Uhr?'\n- 'Ich schlage vor: [day], [time]'\n- 'Ich hätte am [day] Zeit'\n- 'Wenn Ihnen das nicht passt, können wir auch einen anderen Termin vereinbaren'\n\n**Closing:**\n- 'Ich freue mich auf Ihre Antwort'\n- 'Ich würde mich über eine baldige Antwort freuen'\n- 'Vielen Dank im Voraus für Ihre Hilfe'\n- 'Bei Fragen können Sie mich gerne kontaktieren'\n\n**5. Word Count Control:**\nPractice writing EXACTLY:\n- 120 words (minimum safe)\n- 135 words (middle target)\n- 150 words (maximum safe)\n\nDevelop intuition: 'This feels like 130 words'\n\n**6. The 'Sie vs du' Rule:**\ntelc semi-formal letter = ALWAYS 'Sie'\n❌ NEVER use 'du' in this task!\n\nCorrect forms:\n- Sie haben (not du hast)\n- Ihnen (not dir)\n- Ihr/Ihre (not dein/deine)\n\n**7. Common Mistakes to Avoid:**\n\n❌ Forgetting one of the 4 points → Instant point loss!\n✅ Check ALL 4 are covered\n\n❌ Too informal (using du, slang) → Wrong register!\n✅ Use Sie throughout\n\n❌ Too short (<120 words) → Point deduction!\n✅ Count words carefully\n\n❌ Wrong opening/closing (Liebe/r, Viele Grüße) → Too informal!\n✅ 'Sehr geehrte...' and 'Mit freundlichen Grüßen'\n\n❌ Not asking questions when point 3 says 'Fragen' → Missing point!\n✅ Use question marks!\n\n**8. Practice Routine:**\n\nWeek 1: Write 5 letters (one per day), unlimited time\nWeek 2: Write 5 letters, 40 minutes each\nWeek 3: Write 5 letters, 35 minutes each\nWeek 4+: Write 5+ letters, 30 minutes STRICT\n\nDo 20+ practice letters before exam!\n\n**9. Self-Correction Checklist:**\n\nAfter writing, check:\n□ All 4 points covered?\n□ 120-150 words?\n□ Correct opening (Sehr geehrte...)?\n□ Correct closing (Mit freundlichen Grüßen)?\n□ Sie form throughout (no du)?\n□ New paragraph for each point?\n□ Questions have question marks?\n□ Name at end?\n□ Articles correct (der/die/das)?\n□ Verb endings correct?\n\n**10. Topic Preparation:**\n\nFor EACH of the 15 common topics, prepare:\n- Opening sentence\n- 5-10 topic-specific vocabulary words\n- 2-3 typical questions\n- Closing sentence\n\nExample for 'Zimmersuche':\n- Opening: 'Ich suche ein Zimmer in...'\n- Vocab: Miete (rent), Nebenkosten (utilities), möbliert (furnished), Kaution (deposit), Besichtigung (viewing)\n- Questions: 'Wie hoch ist die Miete? Ist die Küche möbliert? Wann kann ich einziehen?'\n- Closing: 'Ich würde das Zimmer gerne besichtigen'\n\nThis preparation = fast writing under pressure!"
  },
  subtasks: [
    { description: "MEMORIZE: Learn letter structure (opening, 4 points, closing) and all essential phrases. Create flashcards with 20 key phrases.", completed: false },
    { description: "EXAMPLE ANALYSIS: Study the model letter. Identify where each of the 4 points is addressed. Note how paragraphs are structured.", completed: false },
    { description: "TOPIC PREPARATION: Choose 10 topics from the list. For each, write: opening sentence, 5 key vocabulary words, 3 typical questions, closing sentence.", completed: false },
    { description: "TIMED PRACTICE 1: Write letter on 'Sprachkurs anfragen' (language course inquiry). Time: 40 minutes (10 extra for learning). Count words. Check all 4 points.", completed: false },
    { description: "TIMED PRACTICE 2: Write letter on 'Produkt reklamieren' (product complaint). Time: 35 minutes. All 4 points. 120-150 words.", completed: false },
    { description: "FULL EXAM SIMULATION: Write letter on random topic. STRICT 30 minutes. No dictionary. Check against checklist. Score yourself!", completed: false },
    { description: "PEER REVIEW: Exchange letters with study partner. Check: Are all 4 points clear? Is register appropriate? Word count OK? Grammar errors?", completed: false }
  ],
  completed: false,
  resources: [
    { name: "Official telc B1 Writing Samples", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/telc-deutsch-b1.html" },
    { name: "telc B1 Mock Exam (Free Download)", url: "https://www.telc.net/en/language-examinations/language-examinations/preparation/model-test.html" },
    { name: "Semi-Formal Letter Phrases", url: "https://deutschtraining.org/schreiben-b1-brief/" },
    { name: "telc Writing Practice Platform", url: "https://www.deutsch-to-go.de/telc-b1-schreiben/" },
    { name: "Letter Writing Video Tutorial (YouTube)", url: "https://www.youtube.com/results?search_query=telc+b1+brief+schreiben" }
  ],
  notes: ""
}
```

### Week 3, Day 2 (Forum Post) - **NEEDS REMOVAL OR MAJOR REVISION**

Since telc doesn't have a forum post task, you have two options:

**Option 1:** Remove this day entirely and restructure Week 3
**Option 2:** Keep it as "Additional Writing Practice" but clearly label it as "NOT in telc exam, but good practice for expressing opinions"

If keeping, update the title and definition to:
```
title: "Opinion Writing Practice (Not in telc exam, but useful skill)"
definition: "Note: telc B1 does NOT have a forum writing task! However, practicing opinion writing helps with speaking and overall German skills. This lesson is optional extra practice."
```

---

## 3. ADD SPRACHBAUSTEINE LESSON - **CRITICAL NEW CONTENT**

**Insert as new day in Week 2 or Week 3:**

```javascript
{
  day: X, // Insert appropriately in Week 2 or 3
  task: "Sprachbausteine: Grammar & Vocabulary in Context",
  focus: "grammar",
  level: "B1",
  lessonContent: {
    title: "Sprachbausteine - The telc-Specific Grammar Section",
    definition: "**CRITICAL:** Sprachbausteine exists ONLY in telc exams (not Goethe)! This section tests your grammar and vocabulary through fill-in-the-blank exercises. You read texts with gaps and choose the correct word from multiple options.\n\n**What it tests:**\n- Articles (der/die/das/den/dem/ein/eine/einen)\n- Prepositions (in/an/auf/mit/von/zu + correct case)\n- Conjunctions (weil/dass/wenn/obwohl)\n- Verb forms (conjugations, tenses)\n- Pronouns (er/sie/es/ihn/ihm/ihr)\n- Relative pronouns (der/die/das in dependent clauses)\n\n**Format:**\n- ~15 minutes\n- 2 texts with 10 gaps total\n- Multiple choice (3-4 options per gap)\n- Part of the 225-point written exam\n\n**Why it matters:** This is 'easy points' if you know grammar! No reading comprehension needed - just pure grammar knowledge.",
    
    example: "**COMPLETE SPRACHBAUSTEINE EXAMPLE:**\n\n**TEXT 1: Email about vacation**\n\n'Liebe Sandra,\n\nich schreibe ____(1)____ aus Spanien! Das Wetter ist fantastisch und wir gehen jeden Tag ____(2)____ Strand. Gestern haben wir eine Stadt besichtigt, ____(3)____ sehr alt ist. Die Leute hier sind sehr freundlich und ____(4)____ uns immer. Leider fahren wir schon morgen ____(5)____ Hause.\n\nViele Grüße,\nMaria'\n\n**GAPS WITH MULTIPLE CHOICE:**\n\n**1. □ a) dir  □ b) dich  □ c) du  □ d) dein**\nAnswer: **a) dir** (Dativ pronoun after 'schreiben')\n\n**2. □ a) an die  □ b) an den  □ c) an dem  □ d) an das**\nAnswer: **b) an den** ('an + Akkusativ' for direction 'to the beach')\n\n**3. □ a) der  □ b) die  □ c) das  □ d) den**\nAnswer: **b) die** (relative pronoun agreeing with 'Stadt' - feminine)\n\n**4. □ a) helfen  □ b) helft  □ c) hilft  □ d) helfen**\nAnswer: **a) helfen** (subject 'die Leute' = plural → helfen)\n\n**5. □ a) zu  □ b) nach  □ c) in  □ d) auf**\nAnswer: **b) nach** ('nach Hause' = fixed expression 'go home')\n\n**GRAMMAR PATTERNS YOU MUST KNOW:**\n\n**1. ARTICLES + CASES:**\n\n| Case | Masculine | Feminine | Neuter | Plural |\n|------|-----------|----------|--------|\n| NOM | der/ein | die/eine | das/ein | die |\n| AKK | den/einen | die/eine | das/ein | die |\n| DAT | dem/einem | der/einer | dem/einem | den + n |\n\nExample gap: 'Ich gebe ____ Mann (der) das Buch.'\nOptions: a) der  b) den  c) dem  d) des\nAnswer: c) dem (dative after 'geben')\n\n**2. PREPOSITIONS + CASES:**\n\n**Always Akkusativ:** durch, für, gegen, ohne, um\n- 'Ich gehe ____ den Park' → durch\n\n**Always Dativ:** aus, bei, mit, nach, seit, von, zu\n- 'Ich komme ____ der Schule' → von\n\n**Two-way (Akk or Dat):** an, auf, hinter, in, neben, über, unter, vor, zwischen\n- WOHIN? (where to?) → Akkusativ\n  'Ich gehe in ____ Kino' → das (in das Kino)\n- WO? (where?) → Dativ\n  'Ich bin in ____ Kino' → dem (in dem Kino)\n\n**3. CONJUNCTIONS:**\n\n**Coordinating (No word order change):**\n- und, aber, oder, denn\n- 'Ich lerne Deutsch ____ es ist wichtig' → denn\n\n**Subordinating (Verb goes to end):**\n- weil, dass, wenn, obwohl, als\n- 'Ich lerne Deutsch, ____ es wichtig ist' → weil\n- Sentence becomes: 'Ich lerne Deutsch, weil es wichtig ist' (verb 'ist' at end!)\n\n**4. VERB FORMS:**\n\nExample gap: 'Gestern ____ ich ins Kino.'\nOptions: a) gehe  b) ging  c) gegangen  d) gehen\nAnswer: b) ging (Präteritum - 'gestern' = past)\n\nExample gap: 'Morgen ____ ich nach Berlin.'\nOptions: a) fahre  b) fuhr  c) gefahren  d) fahren\nAnswer: a) fahre (Present tense can express future with time word)\n\n**5. PRONOUNS:**\n\n**Personal pronouns (Akkusativ):**\n- ich → mich, du → dich, er → ihn, sie → sie, es → es\n- 'Ich sehe ____' (you) → dich\n\n**Personal pronouns (Dativ):**\n- ich → mir, du → dir, er → ihm, sie → ihr, es → ihm\n- 'Ich helfe ____' (him) → ihm\n\n**Relative pronouns:**\n- Agree with noun gender/number, but case depends on function in relative clause\n- 'Der Mann, ____ ich kenne' → den (masculine Akk - 'ich kenne den Mann')\n- 'Die Frau, ____ ich helfe' → der (feminine Dat - 'ich helfe der Frau')\n\n**PRACTICE EXERCISE SET:**\n\n**Exercise 1:** Fill in articles\n\n'Ich gehe in ____(1)____ Stadt. Dort treffe ich ____(2)____ Freund. Wir gehen in ____(3)____ Café und trinken ____(4)____ Kaffee.'\n\nAnswers:\n1. die (Akk - direction)\n2. einen (Akk after 'treffen')\n3. ein (Akk - direction into café)\n4. einen (Akk after 'trinken')\n\n**Exercise 2:** Choose preposition\n\n'Ich komme ____(1)____ Deutschland und wohne ____(2)____ Berlin. Ich arbeite ____(3)____ Siemens und fahre jeden Tag ____(4)____ dem Bus zur Arbeit.'\n\nAnswers:\n1. aus (origin)\n2. in (location)\n3. bei (employer)\n4. mit (means of transportation)\n\n**Exercise 3:** Choose conjunction\n\n'Ich lerne Deutsch, ____(1)____ ich in Deutschland arbeiten möchte. Es ist schwierig, ____(2)____ ich übe jeden Tag.'\n\nAnswers:\n1. weil (reason)\n2. aber (contrast)\n\n**10 SPRACHBAUSTEINE STRATEGIES:**\n\n**1. Read the WHOLE sentence first**\nDon't just look at the gap in isolation\nContext helps identify what's needed\n\n**2. Identify the grammar category**\nIs it asking for:\n- Article? → Check gender and case\n- Preposition? → Check verb/phrase requirement\n- Conjunction? → Check if subordinating or coordinating\n- Verb form? → Check time marker and subject\n- Pronoun? → Check what it refers to and case\n\n**3. Eliminate obviously wrong options**\nOften 1-2 options are clearly wrong\nNarrow down to 2, then choose carefully\n\n**4. Check case requirements**\nAfter certain verbs → Akkusativ (haben, sehen, kaufen)\nAfter certain verbs → Dativ (helfen, danken, gefallen)\nAfter certain prepositions → Fixed case\n\n**5. Look for time markers**\n- gestern, letzte Woche → Past tense\n- morgen, nächste Woche → Future (present or werden)\n- heute, jetzt, immer → Present\n\n**6. Check subject-verb agreement**\nSubject = ich → verb ends in -e\nSubject = du → verb ends in -st\nSubject = er/sie/es → verb ends in -t\nSubject = plural → verb ends in -en\n\n**7. Know fixed expressions**\n- nach Hause (go home)\n- zu Hause (at home)\n- im Gegenteil (on the contrary)\n- zum Beispiel (for example)\n- in der Nähe (nearby)\n\nThese don't follow normal grammar rules!\n\n**8. Relative pronouns = noun gender**\n'Der Mann, der...' (masculine)\n'Die Frau, die...' (feminine)\n'Das Kind, das...' (neuter)\n\nBUT case depends on function:\n'Der Mann, den ich kenne' (Akk - object of 'kennen')\n'Der Mann, dem ich helfe' (Dat - dative verb)\n\n**9. Practice pattern recognition**\nAfter 50+ exercises, you'll recognize:\n- 'Ich gehe ____ Strand' → always 'an den'\n- 'Ich komme ____ Schule' → always 'von der' or 'aus der'\n- 'Ich wohne ____ Berlin' → always 'in'\n\n**10. Don't overthink!**\nFirst instinct is often correct\nIf you've studied grammar, trust your knowledge\nDon't change answers unless you find clear error",
    
    tips: "**SPRACHBAUSTEINE PREPARATION CHECKLIST:**\n\n**Week 1-2: Grammar Foundation**\n□ Memorize article table (all 4 cases)\n□ Learn dative-only prepositions (aus, bei, mit, nach, seit, von, zu)\n□ Learn akkusativ-only prepositions (durch, für, gegen, ohne, um)\n□ Practice two-way prepositions (Wohin vs Wo)\n\n**Week 3-4: Advanced Grammar**\n□ Master subordinating conjunctions (weil, dass, wenn, obwohl)\n□ Practice relative pronouns\n□ Review all verb tenses (present, Perfekt, Präteritum)\n□ Learn fixed expressions\n\n**Week 5+: Intensive Practice**\n□ Do 20+ Sprachbausteine exercises\n□ Time yourself (15 minutes per exercise)\n□ Analyze all mistakes (Why wrong? What rule?)\n□ Create error log (Most common mistakes?)\n\n**Daily 10-Minute Drill:**\n- Day 1: Articles + Cases (20 gap-fill sentences)\n- Day 2: Prepositions (20 sentences)\n- Day 3: Conjunctions (20 sentences)\n- Day 4: Verb forms (20 sentences)\n- Day 5: Pronouns (20 sentences)\n- Day 6: Mixed practice (30 sentences)\n- Day 7: Timed mock exercise (15 minutes)\n\nRepeat cycle until automatic!\n\n**Remember:** Sprachbausteine = fastest way to score points if you know grammar! This section is more predictable than Reading comprehension!"
  },
  subtasks: [
    { description: "GRAMMAR REVIEW: Create reference sheets for: 1) Article table (all 4 cases), 2) Preposition lists (Akk/Dat/Two-way), 3) Conjunction types, 4) Verb endings. Keep these visible while practicing!", completed: false },
    { description: "PATTERN DRILLS: Do 50 gap-fill sentences for EACH grammar category (articles, prepositions, conjunctions, verbs, pronouns). Focus on accuracy, not speed.", completed: false },
    { description: "MOCK EXERCISES: Download 5 telc Sprachbausteine practice tests. Do one per day, timed (15 min each). Score yourself. Target: 8+/10 correct.", completed: false },
    { description: "ERROR ANALYSIS: Review ALL mistakes from mock exercises. For each error, write: 1) Why I chose wrong answer, 2) Correct answer, 3) Grammar rule, 4) How to remember. Create personal error log!", completed: false },
    { description: "SPEED PRACTICE: Once accuracy is high (80%+), focus on speed. Do 3 mock exercises in 12 minutes each (faster than exam time). This builds confidence!", completed: false }
  ],
  completed: false,
  resources: [
    { name: "telc B1 Sprachbausteine Official Examples", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/telc-deutsch-b1.html" },
    { name: "Sprachbausteine Practice Exercises (100+)", url: "https://deutschtraining.org/telc-b1-sprachbausteine/" },
    { name: "Grammar Reference (All Cases)", url: "https://www.germanveryeasy.com/german-cases" },
    { name: "Prepositions + Cases (Interactive)", url: "https://www.schubert-verlag.de/aufgaben/xg/xg03_11.htm" },
    { name: "Sprachbausteine Video Tutorial", url: "https://www.youtube.com/results?search_query=telc+sprachbausteine+b1" }
  ],
  notes: ""
}
```

---

## 4. SPEAKING MODULE UPDATES

**Week 1, Day 6 + Week 3, Day 5**

Update speaking terminology throughout:

- **Teil 1:** Change from "Planning task" to "Sich vorstellen (Introduce yourself)"
- **Teil 2:** Change from "Presentation" to "Über ein Thema sprechen (Discuss topic together)"
- **Teil 3:** This is correct but clarify it's "Gemeinsam etwas planen"

---

## 5. TIME ALLOCATION UPDATES

**Find and replace throughout all lessons:**

- Writing: 60 minutes → 30 minutes
- Reading: 65 minutes → ~25 minutes (+ Sprachbausteine time)
- Listening: 40 minutes → 25-30 minutes
- Speaking: 15 minutes → 15-16 minutes (+ 20 min prep explicitly mentioned)

---

## 6. POINT SYSTEM UPDATES

**Find and replace throughout:**

- Written section: Various point breakdowns → 225 points total (60% = 135 to pass)
- Oral section: 100 points → 75 points (60% = 45 to pass)
- Remove references to "60% in EACH module" → Replace with "60% overall in written AND 60% in oral"

---

## 7. RESOURCE LINKS

**Find and replace:**

- goethe.de URLs → telc.net URLs
- Add telc-specific resources
- Add link to telc free mock exam download
- Add link to telc official preparation materials

---

## IMPLEMENTATION PRIORITY

**Week 1 (CRITICAL):**
1. ✅ Update `examOverview` object (Done!)
2. Update Week 1, Day 1 lesson content (Exam format section)
3. Update all time references in Week 1 lessons

**Week 2 (HIGH PRIORITY):**
4. Rewrite Week 2, Day 3 (Writing - semi-formal letter)
5. Add Sprachbausteine lesson
6. Update all resource links

**Week 3 (MEDIUM PRIORITY):**
7. Update Week 3, Day 2 (Forum post - remove or mark as optional)
8. Update Week 3, Day 5 (Speaking terminology)
9. Update all speaking lesson content

**Weeks 4-12 (ONGOING):**
10. Update time/point references throughout
11. Update resources section in all lessons
12. Adjust practice exercises to telc format

---

## NEXT STEPS FOR YOU

1. Review this guide carefully
2. Decide which changes to prioritize based on your exam date (Jan 8)
3. I can help you update specific sections - just let me know which day/week to focus on next
4. Consider creating a backup of your current App.jsx before major changes
5. Test changes incrementally to ensure app still works correctly

**Most Critical for January 8 Exam:**
- Writing module (Week 2, Day 3) - Complete rewrite
- Add Sprachbausteine lesson - New content
- Update exam overview - Clear understanding of test format
- Update Speaking terminology - Know what to expect

Would you like me to continue with specific section updates? Let me know which day/week you want me to focus on next!
