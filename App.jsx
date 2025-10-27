import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, BookOpen, Headphones, MessageCircle, FileText, Award, TrendingUp, Lightbulb, Moon, Sun, RotateCcw, Menu, X, ExternalLink, Activity, Target, Zap, Clock, ChevronLeft, ChevronRight, Shuffle, CheckSquare, Square, List, ArrowLeft, Loader2, MinusSquare } from 'lucide-react';

// Styles for the flashcard component
const flashcardStyles = {
  backfaceHidden: {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  }
};

const DayDetailPlaceholder = 'Not available, please contact the administrator.';

// Component to render formatted text with markdown-like syntax
const FormattedText = ({ text, className = '' }) => {
  if (!text) return null;

  // Helper function for inline formatting (defined first to avoid hoisting issues)
  const renderInlineFormatting = (text) => {
    const parts = [];
    let currentIndex = 0;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }
      // Add the bold part
      parts.push(
        <strong key={match.index} className="font-bold text-gray-900 dark:text-gray-100">
          {match[1]}
        </strong>
      );
      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split text by lines to preserve formatting
  const lines = text.split('\n');
  const processedElements = [];
  let tableRows = [];
  let listItems = [];
  let currentListType = null;
  
  const flushTable = () => {
    if (tableRows.length > 0) {
      processedElements.push(
        <div key={`table-${processedElements.length}`} className="my-4 overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {tableRows.map((row, idx) => row)}
            </div>
          </div>
        </div>
      );
      tableRows = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = currentListType === 'numbered' ? 'ol' : 'ul';
      processedElements.push(
        <ListTag key={`list-${processedElements.length}`} className={`my-3 space-y-1 ${currentListType === 'numbered' ? 'list-decimal' : 'list-disc'} list-inside ml-4`}>
          {listItems.map((item, idx) => item)}
        </ListTag>
      );
      listItems = [];
      currentListType = null;
    }
  };
  
  lines.forEach((line, index) => {
    // Check for headers (lines with ** on both sides, standalone)
    if (line.trim().startsWith('**') && line.trim().endsWith('**') && line.trim().length > 4) {
      flushTable();
      flushList();
      const content = line.trim().slice(2, -2);
      processedElements.push(
        <h4 key={`header-${index}`} className="font-bold text-lg mt-6 mb-3 text-gray-900 dark:text-gray-100 first:mt-0">
          {content}
        </h4>
      );
      return;
    }

    // Check for table rows (lines with |)
    if (line.includes('|') && line.trim()) {
      flushList();
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      const isHeaderRow = line.includes('---|') || cells.every(cell => cell === '---' || cell.includes('---'));
      
      if (isHeaderRow) {
        return; // Skip separator rows
      }

      // Check if this is the first row (likely header)
      const isFirstRow = tableRows.length === 0;
      
      tableRows.push(
        <div key={`row-${index}`} className={`flex border-b border-gray-300 dark:border-gray-600 last:border-b-0 ${isFirstRow ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
          {cells.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={`flex-1 px-4 py-3 text-sm ${
                isFirstRow
                  ? 'font-bold text-gray-900 dark:text-gray-100'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {renderInlineFormatting(cell)}
            </div>
          ))}
        </div>
      );
      return;
    }

    // If we had table rows but now we don't, flush the table
    if (tableRows.length > 0 && !line.includes('|')) {
      flushTable();
    }

    // Check for bullet points
    if (line.trim().startsWith('- ')) {
      if (currentListType !== 'bullet') {
        flushList();
        currentListType = 'bullet';
      }
      listItems.push(
        <li key={`li-${index}`} className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {renderInlineFormatting(line.replace(/^-\s*/, ''))}
        </li>
      );
      return;
    }

    // Check for numbered lists
    if (line.trim().match(/^\d+\./)) {
      if (currentListType !== 'numbered') {
        flushList();
        currentListType = 'numbered';
      }
      listItems.push(
        <li key={`li-${index}`} className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {renderInlineFormatting(line.replace(/^\d+\.\s*/, ''))}
        </li>
      );
      return;
    }

    // If we had list items but now we don't, flush the list
    if (listItems.length > 0 && !line.trim().startsWith('- ') && !line.trim().match(/^\d+\./)) {
      flushList();
    }

    // Check for section labels (e.g., "Teil 1:", "Example:")
    if (line.trim().endsWith(':') && line.trim().split(' ').length <= 5 && !line.trim().startsWith('http')) {
      flushTable();
      flushList();
      processedElements.push(
        <p key={`label-${index}`} className="font-semibold text-blue-700 dark:text-blue-400 mt-4 mb-2 first:mt-0">
          {renderInlineFormatting(line)}
        </p>
      );
      return;
    }

    // Check for special markers (✓, ✅, etc.)
    if (line.trim().startsWith('✓') || line.trim().startsWith('✅')) {
      flushTable();
      flushList();
      processedElements.push(
        <p key={`check-${index}`} className="my-2 text-green-700 dark:text-green-400 leading-relaxed flex items-start gap-2">
          <span className="text-lg flex-shrink-0">{line.trim()[0]}</span>
          <span>{renderInlineFormatting(line.trim().slice(1).trim())}</span>
        </p>
      );
      return;
    }

    // Regular paragraph
    if (line.trim()) {
      flushTable();
      flushList();
      processedElements.push(
        <p key={`p-${index}`} className="my-2 text-gray-800 dark:text-gray-200 leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      );
      return;
    }

    // Empty line - add spacing
    if (!line.trim() && processedElements.length > 0) {
      flushTable();
      flushList();
      processedElements.push(<div key={`space-${index}`} className="h-2" />);
    }
  });

  // Flush any remaining table or list
  flushTable();
  flushList();

  return (
    <div className={`formatted-text ${className}`}>
      {processedElements}
    </div>
  );
};

const App = () => {
  // --- INITIAL DATA STRUCTURE ---
  // COMPREHENSIVE GOETHE-ZERTIFIKAT B1 STUDY PLAN
// Based on official Goethe-Institut exam format and requirements
// Target: Pass all 4 modules (Reading, Listening, Writing, Speaking)
// Passing score: 60% in EACH module (18/30 for Reading/Listening, 60/100 for Writing/Speaking)

const goetheB1CompleteData = {
  examOverview: {
    totalDuration: "~180 minutes",
    modules: [
      { name: "Lesen (Reading)", duration: "65 minutes", points: 30, passing: 18 },
      { name: "Hören (Listening)", duration: "40 minutes", points: 30, passing: 18 },
      { name: "Schreiben (Writing)", duration: "60 minutes", points: 100, passing: 60 },
      { name: "Sprechen (Speaking)", duration: "15 minutes", points: 100, passing: 60 }
    ],
    vocabularyTarget: "~2,400 words (Goethe-Institut official list)",
    studyHoursRecommended: "350-650 hours total for B1 level"
  },

  startDate: null, // User sets this when starting

  // 12-WEEK INTENSIVE PLAN (January mid exam target)
  weeks: [
    // ============== WEEK 1: FOUNDATION & EXAM FORMAT ==============
    {
      week: 1,
      goal: "Understanding Exam Format & Core Grammar (Cases System)",
      targetVocabulary: 200,
      estimatedHours: "15-20 hours",
      days: [
        {
          day: 1,
          task: "Exam Format Deep Dive + Nominative & Accusative Cases",
          focus: "grammar",
          level: "B1",
          lessonContent: {
            title: "Welcome to Your B1 Journey: The Exam Blueprint",
            definition: "Before diving into content, you MUST understand what you're preparing for. The Goethe B1 exam has 4 independent modules. You need **60% in EACH** to pass (not an average!). This is CRUCIAL - scoring 90% in Reading but 55% in Writing = FAIL overall! Each module is graded independently.\n\n**WHY CASES MATTER:** German uses cases (Nominativ, Akkusativ, Dativ, Genitiv) to show the function of nouns in a sentence. English uses word order ('The dog bites the man' vs 'The man bites the dog'), but German uses article changes. Mastering cases = understanding 80% of German grammar!\n\n**Today's Focus:** Nominative (subject) and Accusative (direct object). Think: Nominative = WHO/WHAT does the action? Accusative = WHO/WHAT receives the action directly?",
            example: "**EXAM FORMAT BREAKDOWN (Total ~180 minutes):**\n\n**LESEN (Reading) - 65 minutes, 30 points:**\n- Teil 1: Blog/Email (6 True/False questions) - Personal, informal text\n- Teil 2: 2 Press reports (6 MCQs total) - News articles\n- Teil 3: Match 7 people to 10 ads - Scanning practice\n- Teil 4: 7 opinions on a topic - Opinion identification\n- Teil 5: Rules/regulations table (4 MCQs) - Formal language\n**Passing Score: 18/30 points**\n\n**HÖREN (Listening) - 40 minutes, 30 points:**\n- Teil 1: 5 short messages (10 questions) - Plays TWICE\n- Teil 2: 1 lecture/presentation (5 MCQs) - Plays ONCE\n- Teil 3: 1 conversation (7 R/F) - Plays ONCE\n- Teil 4: Radio discussion (8 MCQs) - Plays TWICE\n**Passing Score: 18/30 points**\n\n**SCHREIBEN (Writing) - 60 minutes, 100 points:**\n- Teil 1: Informal email to friend (45 points, ~80 words)\n- Teil 2: Semi-formal forum post/opinion (25 points, ~80 words)\n- Teil 3: Formal letter (30 points, ~80 words)\n**Passing Score: 60/100 points**\n\n**SPRECHEN (Speaking) - 15 minutes, 100 points:**\n- Teil 1: Planning task with partner (28 points, 3-4 min)\n- Teil 2: Short presentation on topic (28 points, 3 min)\n- Teil 3: Problem-solving conversation (28 points, 3 min)\n- Plus: Pronunciation & fluency (16 points)\n**Passing Score: 60/100 points**\n\n**CASE SYSTEM - Your Article Decoder:**\n\n| Case | Masculine | Feminine | Neuter | Plural |\n|------|-----------|----------|--------|--------|\n| NOM | **der** Mann | **die** Frau | **das** Kind | **die** Leute |\n| AKK | **den** Mann | **die** Frau | **das** Kind | **die** Leute |\n\n**🔑 Key Insight:** Only masculine articles change (der→den)! Feminine, neuter, and plural stay the same!\n\n**Detailed Examples:**\n\n1. **Nominative (Subject - WHO does it?):**\n   - **Der** Lehrer (NOM) kommt. = *The teacher comes.*\n   - **Die** Studentin (NOM) lernt. = *The student (f) learns.*\n   - **Das** Buch (NOM) liegt hier. = *The book lies here.*\n\n2. **Accusative (Direct Object - WHAT is being acted upon?):**\n   - Ich sehe **den** Lehrer (AKK). = *I see the teacher.*\n   - Er kennt **die** Studentin (AKK). = *He knows the student.*\n   - Sie liest **das** Buch (AKK). = *She reads the book.*\n\n3. **Both in One Sentence:**\n   - **Der** Hund (NOM) beißt **den** Mann (AKK). = *The dog bites the man.*\n   - **Der** Mann (NOM) beißt **den** Hund (AKK). = *The man bites the dog.*\n   \n   ⚠️ See the difference? The articles tell you WHO bites and WHO gets bitten!\n\n**Common Accusative Verbs (These ALWAYS trigger accusative):**\n- haben (to have) → Ich habe **einen** Bruder.\n- sehen (to see) → Er sieht **den** Film.\n- kaufen (to buy) → Sie kauft **das** Auto.\n- essen (to eat) → Wir essen **den** Apfel.\n- trinken (to drink) → Du trinkst **den** Kaffee.\n- lesen (to read) → Ich lese **die** Zeitung.\n- nehmen (to take) → Er nimmt **den** Bus.",
            tips: "**EXAM STRATEGY - Your 12-Week Roadmap:**\n\n1. **Download Materials TODAY:** Go to goethe.de/pb1 and download the official sample exam (Modellsatz). Print it. Familiarize yourself with the format.\n\n2. **Time Management is CRITICAL:** Practice with a timer from Week 2 onwards. The exam is LONG (180 min total) and mentally exhausting.\n\n3. **60% Per Module Rule:** You can't compensate! If you're naturally good at reading but struggle with speaking, you MUST allocate more time to speaking practice.\n\n**CASE MASTERY TRICKS:**\n\n1. **Physical Reference Card:** Create a credit-card-sized chart with the case table. Laminate it. Keep it in your wallet. Review while waiting for bus/coffee.\n\n2. **The 'der→den' Chant:** Repeat this 10x daily: 'der Mann, den Mann, der Mann, den Mann'. Make it automatic!\n\n3. **Question Technique:** \n   - Nominative = Ask 'Wer?' (Who?) or 'Was?' (What?) before the verb\n   - Accusative = Ask 'Wen?' (Whom?) or 'Was?' (What?) after the verb\n   \n   Example: Der Lehrer sieht den Schüler.\n   - Wer sieht? → Der Lehrer (NOM)\n   - Wen sieht der Lehrer? → den Schüler (AKK)\n\n4. **Color-Coding:** In your notes, use one color for subjects (NOM) and another for objects (AKK). Your brain will start recognizing patterns visually.\n\n5. **Real-World Practice:** When watching German videos, pause and identify subjects/objects. Say them out loud with correct articles.\n\n6. **Common Mistake Alert:** Germans say 'Ich sehe den Mann' but English speakers often say 'Ich sehe der Mann' (wrong!). The 'der→den' change feels unnatural at first. Practice makes perfect!\n\n**Daily Practice Formula:** 10 minutes daily of article drilling beats 2 hours once a week. Consistency is your superpower!"
          },
          subtasks: [
            { description: "Download and review the official Goethe B1 sample exam (all 4 modules) from goethe.de.", completed: false },
            { description: "Create a time-tracking sheet: Note reading (65 min), listening (40 min), writing (60 min), speaking (15 min) limits.", completed: false },
            { description: "Memorize the 4-case article table (NOM/AKK for now) - drill with 20 fill-in-the-blank sentences.", completed: false },
            { description: "Identify subjects (NOM) and direct objects (AKK) in 15 sample sentences from news articles.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Sample Exam", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "German Cases Explained", url: "https://www.germanveryeasy.com/cases" }
          ],
          notes: ""
        },
        {
          day: 2,
          task: "Dative Case + Present Tense Verb Conjugation",
          focus: "grammar",
          level: "B1",
          lessonContent: {
            title: "Dative Case: The Indirect Object Mystery",
            definition: "The **Dative case** answers 'TO/FOR WHOM?' or 'WHERE?' (with certain prepositions). It's the indirect object - the person/thing receiving something indirectly. Unlike accusative (direct receiver), dative shows the BENEFICIARY or LOCATION.\n\n**Real-World Example:** 'I give the book to my friend' - 'book' is direct object (AKK), 'friend' is indirect (DAT - receives the book indirectly).\n\n**Why Dative Matters:** Many everyday verbs require dative! Helping, giving, showing, explaining - all need dative. Without it, you can't express basic social interactions. Plus, exam writing (Teil 1 & 3) heavily tests dative with verbs like 'helfen', 'danken', 'antworten'.\n\n**Present Tense = Your Foundation:** While you'll learn past tenses, present tense is THE MOST USED in German conversation. Speaking Teil 1 & 3 rely on accurate present tense conjugation. Irregular verbs have vowel changes that you MUST memorize - there's no shortcut!",
            example: "**DATIVE ARTICLES (Complete Table):**\n\n| Case | Masculine | Feminine | Neuter | Plural |\n|------|-----------|----------|--------|--------|\n| DAT | **dem** Mann | **der** Frau | **dem** Kind | **den** Leuten + **-n** |\n\n🔑 **Key Rule:** Plural dative ALWAYS adds '-n' to the noun (unless it already ends in -n or -s)!\n- die Kinder → den Kinder**n**\n- die Autos → den Autos (already ends in -s, no change)\n\n**Dative Examples with Common Verbs:**\n\n1. **geben (to give):**\n   - Ich gebe **dem** Kind (DAT) **einen** Apfel (AKK).\n   - *I give an apple to the child.*\n\n2. **helfen (to help):**\n   - Er hilft **der** Frau (DAT).\n   - *He helps the woman.*\n   - ⚠️ NO accusative object! 'helfen' takes ONLY dative!\n\n3. **gehören (to belong to):**\n   - Das Buch gehört **dem** Lehrer (DAT).\n   - *The book belongs to the teacher.*\n\n4. **gefallen (to please/like):**\n   - Der Film gefällt **mir** (DAT).\n   - *The film pleases me. / I like the film.*\n   - ⚠️ Backwards from English! The THING is the subject, the PERSON is dative!\n\n5. **danken (to thank):**\n   - Wir danken **den** Lehrern (DAT, plural + -n).\n   - *We thank the teachers.*\n\n**DATIVE-ONLY VERBS (Memorize These 12!):**\n- helfen (help) → Ich helfe **dir**.\n- danken (thank) → Danke **Ihnen**!\n- antworten (answer) → Er antwortet **dem** Chef.\n- gefallen (please) → Es gefällt **mir**.\n- gehören (belong) → Das gehört **mir**.\n- gratulieren (congratulate) → Ich gratuliere **dir**!\n- vertrauen (trust) → Sie vertraut **ihm**.\n- folgen (follow) → Folgen Sie **mir**!\n- begegnen (meet/encounter) → Ich bin **ihm** begegnet.\n- glauben (believe someone) → Ich glaube **dir**.\n- passen (fit/suit) → Die Schuhe passen **mir**.\n- schaden (harm) → Rauchen schadet **der** Gesundheit.\n\n**PRESENT TENSE - Regular Verbs:**\n\n**kaufen (to buy) - Pattern for 90% of verbs:**\n```\nich kauf**e**      wir kauf**en**\ndu kauf**st**      ihr kauf**t**\ner/sie/es kauf**t** sie/Sie kauf**en**\n```\n\n**Endings to Memorize:** -e, -st, -t, -en, -t, -en\n\n**Special Rules:**\n1. If stem ends in -t, -d, -n, -m: Add '-e-' before -st/-t\n   - arbeiten → du arbeit**e**st, er arbeit**e**t\n   - öffnen → du öffn**e**st, er öffn**e**t\n\n2. If stem ends in -s, -ß, -x, -z: 'du' form = just -t (not -st)\n   - reisen → du reis**t** (not reisst)\n   - heißen → du heiß**t**\n\n**IRREGULAR VERBS - The Essential 15:**\n\n1. **sein (to be) - MOST IMPORTANT!**\n   ```\n   ich **bin**        wir **sind**\n   du **bist**       ihr **seid**\n   er/sie/es **ist**  sie/Sie **sind**\n   ```\n\n2. **haben (to have) - 2nd MOST IMPORTANT!**\n   ```\n   ich **habe**       wir **haben**\n   du **hast**       ihr **habt**\n   er/sie/es **hat**  sie/Sie **haben**\n   ```\n\n3. **werden (to become/will) - Future tense helper!**\n   ```\n   ich **werde**      wir **werden**\n   du **wirst**      ihr **werdet**\n   er/sie/es **wird** sie/Sie **werden**\n   ```\n\n**STEM-CHANGING VERBS (Vowel Changes in du/er):**\n\n4. **fahren (to drive/go) - a→ä**\n   ich fahre, du **fährst**, er **fährt**, wir fahren\n\n5. **essen (to eat) - e→isst**\n   ich esse, du **isst**, er **isst**, wir essen\n\n6. **geben (to give) - e→i**\n   ich gebe, du **gibst**, er **gibt**, wir geben\n\n7. **lesen (to read) - e→ie**\n   ich lese, du **liest**, er **liest**, wir lesen\n\n8. **sehen (to see) - e→ie**\n   ich sehe, du **siehst**, er **sieht**, wir sehen\n\n9. **nehmen (to take) - e→nimmt**\n   ich nehme, du **nimmst**, er **nimmt**, wir nehmen\n\n10. **sprechen (to speak) - e→i**\n    ich spreche, du **sprichst**, er **spricht**, wir sprechen",
            tips: "**DATIVE MASTERY TRICKS:**\n\n1. **The 'to-GIVE' Mnemonic:** Dative sounds like 'to-GIVE'. Whenever you see 'dem/der/den', think 'TO someone' or 'FOR someone'.\n\n2. **Dative Pronoun Chart (CRITICAL for speaking!):**\n   ```\n   ich → **mir** (to me)\n   du → **dir** (to you)\n   er → **ihm** (to him)\n   sie → **ihr** (to her)\n   es → **ihm** (to it)\n   wir → **uns** (to us)\n   ihr → **euch** (to you all)\n   sie/Sie → **ihnen/Ihnen** (to them/you formal)\n   ```\n   \n   Practice: 'Ich helfe dir' (I help you), 'Er gibt mir das Buch' (He gives me the book).\n\n3. **Dative Prepositions Song:** Learn these 9 prepositions that ALWAYS take dative:\n   **aus, bei, mit, nach, seit, von, zu** + (außer, gegenüber)\n   \n   Example: 'Ich komme **aus** **der** Stadt' (I come from the city).\n\n4. **'gefallen' Trick:** Germans say 'Der Film gefällt mir' (The film pleases me), NOT 'Ich gefalle den Film'. Flip your thinking! The THING you like is the subject.\n\n5. **Irregular Verb Flashcards:** Focus on 'du' and 'er/sie/es' forms first - these show the vowel changes:\n   - fahren: du **fährst**, er **fährt** (a→ä)\n   - essen: du **isst**, er **isst** (e→i)\n   - lesen: du **liest**, er **liest** (e→ie)\n\n6. **Conjugation Pyramid Method:** \n   - Day 1: Memorize 'ich' and 'er' forms\n   - Day 2: Add 'du' form\n   - Day 3: Add 'wir/sie/Sie' (they're identical!)\n   - Day 4: Add 'ihr' form\n   \n   This spreads the load and builds confidence!\n\n7. **Speaking Practice:** Record yourself saying: 'Ich bin, du bist, er ist...' for all 3 essential verbs (sein, haben, werden). Listen back. Correct pronunciation NOW before it becomes a habit!\n\n8. **Common Mistake Alert:** \n   - ❌ Ich helfe **der Frau** ← Correct!\n   - ❌ Ich helfe **die Frau** ← WRONG! 'helfen' needs dative, not accusative!\n   \n   Many students use accusative by default. Train your brain: 'helfen = dative ALWAYS'.\n\n9. **Real-World Immersion:** Watch German news (Tagesschau on YouTube). Listen for 'dem/der/den'. Pause and identify the dative nouns. This trains your ear!\n\n10. **Daily Drill (5 minutes):** Every morning, conjugate ONE irregular verb (all 6 persons). Rotate through the top 15. By Week 12, they'll be automatic!"
          },
          subtasks: [
            { description: "Learn dative articles for all genders - drill with 'Ich gebe...' sentences (give to 10 different people/things).", completed: false },
            { description: "Memorize the 'DAT verbs': geben, helfen, gefallen, gehören, antworten, danken, gratulieren (with examples).", completed: false },
            { description: "Conjugate 5 regular verbs (machen, lernen, spielen, arbeiten, wohnen) in present tense - all 6 persons.", completed: false },
            { description: "Memorize irregular present tense for: sein, haben, werden, können, müssen, fahren, essen, gehen.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Dative Case Practice", url: "https://www.germanveryeasy.com/dative-case" },
            { name: "Verbformen.com - Verb Conjugator", url: "https://www.verbformen.com" }
          ],
          notes: ""
        },
        {
          day: 3,
          task: "Reading Module Strategy + Text Analysis Practice",
          focus: "reading",
          level: "B1",
          lessonContent: {
            title: "Lesen Teil 1-5: Your Strategic Reading Roadmap",
            definition: "The Reading module is 65 minutes for 30 points. You need 18+ points (60%) to pass. This is NOT a test of reading every word - it's a test of **strategic reading skills**: scanning (finding specific info quickly), skimming (getting the main idea), and inference (reading between the lines).\n\n**Why Reading Strategy Matters:** Native speakers don't read word-by-word either! They scan for keywords, skip irrelevant details, and focus on what matters. The exam tests if you can do this in German.\n\n**The Golden Rule:** ALWAYS read questions BEFORE texts! This tells you what to look for. You're hunting for answers, not enjoying literature.\n\n**Time Management is CRITICAL:** You have ~13 minutes per Teil. If you spend 20 minutes on Teil 1, you'll panic in Teil 5. Practice with a timer from Day 1!",
            example: "**DETAILED TIME ALLOCATION STRATEGY:**\n\n**Teil 1: Blog/Email (10 minutes, 6 points)**\n- 2 min: Read all 6 questions carefully\n- 6 min: Read text, mark answers\n- 2 min: Double-check, transfer to answer sheet\n\n**Teil 2: Press Articles (15 minutes, 6 points)**\n- 3 min: Read all 6 MCQs\n- 10 min: Read both articles (skim first, detail second)\n- 2 min: Verify answers\n\n**Teil 3: Matching Ads (12 minutes, 7 points)**\n- 2 min: Read all 7 people's needs, underline keywords\n- 8 min: Scan 10 ads quickly, match\n- 2 min: Check unmatched ads (3 are distractors!)\n\n**Teil 4: Opinion Texts (13 minutes, 7 points)**\n- 2 min: Read 7 statements\n- 9 min: Read 4 opinion texts\n- 2 min: Match statements to authors\n\n**Teil 5: Rules/Regulations Table (10 minutes, 4 points)**\n- 1 min: Read 4 MCQs\n- 7 min: Scan table for specific info\n- 2 min: Verify answers\n\n**Transfer Time: 5 minutes**\n- Fill answer sheet carefully\n- Double-check question numbers\n\n**TOTAL: 65 minutes**\n\n---\n\n**QUESTION TYPES & STRATEGIES:**\n\n**1. Richtig/Falsch/Text sagt dazu nichts (True/False/Not Mentioned)**\n\n**The Trap:** Students assume logical conclusions are true!\n\n**Example:**\nText: 'Maria geht jeden Tag schwimmen.'\nQuestion: 'Maria ist sehr sportlich.'\n\n❌ Answer: **Text sagt dazu nichts** (not mentioned)\n✓ Why? Text only says she swims, doesn't say she's athletic. Don't infer!\n\n**Strategy:**\n- True = explicitly stated in text\n- False = contradicted by text\n- Not mentioned = logically possible BUT not stated\n\n**2. Multiple Choice (a/b/c)**\n\n**Example:**\nQuestion: 'Wann findet das Konzert statt?'\na) Am Freitag um 18 Uhr\nb) Am Samstag um 19 Uhr\nc) Am Sonntag um 20 Uhr\n\nText: 'Das Konzert beginnt Samstagabend um 19 Uhr.'\n\n**Strategy:**\n- Eliminate obviously wrong answers first (Friday and Sunday)\n- Find exact match in text (Saturday 19:00)\n- Watch for paraphrasing: 'Samstagabend' = 'Am Samstag'\n\n**3. Matching Tasks**\n\n**Example Setup:**\nPerson A: 'Sucht günstiges Zimmer in München, zentral, maximal 400€'\n\nAd 1: 'Zimmer in München-Zentrum, 350€, ab sofort frei' ✓ MATCH!\nAd 2: 'Zimmer in München-Nord, 450€, ruhige Lage' ✗ Too expensive\nAd 3: 'Zimmer in Berlin-Mitte, 380€, zentral' ✗ Wrong city\n\n**Strategy:**\n- Create a checklist for each person: Location? Price? Features?\n- Cross out ads as you use them (each ad used only ONCE)\n- 3 ads will be leftovers - don't force matches!\n\n---\n\n**ESSENTIAL READING VOCABULARY (Connectors & Discourse Markers):**\n\n**Contrast & Opposition:**\n- jedoch (however)\n- aber (but)\n- trotzdem (nevertheless)\n- dagegen (on the other hand)\n- im Gegenteil (on the contrary)\n- dennoch (yet, still)\n\n**Addition & Continuation:**\n- außerdem (moreover, besides)\n- zusätzlich (additionally)\n- dazu (in addition to that)\n- weiterhin (furthermore)\n- auch (also)\n- ebenfalls (likewise)\n\n**Cause & Effect:**\n- deswegen (therefore)\n- deshalb (that's why)\n- daher (hence)\n- folglich (consequently)\n- aufgrund (due to)\n- wegen (because of)\n\n**Examples & Clarification:**\n- zum Beispiel (for example)\n- beispielsweise (for instance)\n- das heißt (that is/means)\n- mit anderen Worten (in other words)\n- nämlich (namely)\n\n**Opinion Indicators (Teil 4 - Critical!):**\n- Meiner Meinung nach (in my opinion)\n- Ich finde/denke/glaube (I find/think/believe)\n- Ich bin der Ansicht (I am of the opinion)\n- Ich bin überzeugt (I'm convinced)\n- Ich bin dagegen (I'm against it)\n- Ich bin dafür (I'm for it)\n\n---\n\n**TEXT STRUCTURE RECOGNITION:**\n\n**Blog/Email Structure (Teil 1):**\n1. Greeting: Liebe/r... / Hallo...\n2. Context: Why writing\n3. Main content: 2-3 paragraphs\n4. Closing: Viele Grüße / Bis bald\n\n**Press Article Structure (Teil 2):**\n1. Headline: Main topic\n2. Lead paragraph: 5 Ws (Who, What, When, Where, Why)\n3. Body: Details, quotes, background\n4. Conclusion: Summary or future outlook\n\n**Opinion Text Structure (Teil 4):**\n1. Thesis: Clear position (pro/contra)\n2. Argument 1 + example\n3. Argument 2 + example\n4. Conclusion/reinforcement\n\n**Tip:** Once you recognize the structure, you know where to look for specific info!",
            tips: "**ADVANCED READING STRATEGIES:**\n\n**1. The 'Question-First' Method:**\nBefore reading ANY text, spend 2-3 minutes on questions:\n- Underline question words: Wann? Wo? Wer? Warum? Was?\n- Highlight keywords in questions\n- Predict what info you need to find\n\nThis primes your brain to notice relevant details!\n\n**2. The 'Keyword Hunt' Technique (Teil 1 & 2):**\nFor True/False questions:\n- Identify 2-3 keywords in each question\n- Scan text for those exact words or synonyms\n- Read that sentence + 1 before + 1 after carefully\n- Don't read everything else!\n\n**Example:**\nQuestion: 'Maria geht gern ins Kino.'\nKeywords: Maria, Kino, gern\nScan for: These words or 'Film', 'ins Kino gehen', 'mag'\n\n**3. The 'Elimination Strategy' (MCQs):**\nFor multiple choice:\n- Cross out obviously wrong answers first (process of elimination)\n- Between two similar answers? Find the DIFFERENCE\n- Re-read that specific part of text\n- Choose the answer that matches exactly\n\n**4. The 'Checklist Method' (Teil 3 - Matching):**\nFor each person, create a mental checklist:\n\nExample: 'Anna sucht Wohnung in Berlin, 2 Zimmer, mit Balkon, maximal 800€'\n\nChecklist:\n- [ ] Stadt: Berlin\n- [ ] Größe: 2 Zimmer\n- [ ] Feature: Balkon\n- [ ] Preis: ≤800€\n\nScan ads for these 4 criteria. ALL must match!\n\n**5. The 'Opinion Mapping' Technique (Teil 4):**\nCreate a quick table while reading:\n\n| Author | Pro/Contra | Main Argument |\n|--------|------------|---------------|\n| Person A | PRO | saves time |\n| Person B | CONTRA | expensive |\n| Person C | PRO | convenient |\n| Person D | MIXED | depends |\n\nThis visual map helps match statements to authors!\n\n**6. The 'Not Mentioned' Trap - How to Avoid:**\n\nRule of thumb:\n- If you think 'This makes sense / This is logical' → Probably NOT MENTIONED\n- If you think 'The text directly says this' → TRUE\n- If you think 'The text says the opposite' → FALSE\n\nExample:\nText: 'Max ist Lehrer in einer Schule.'\nStatement: 'Max mag Kinder.'\n\nLogical? YES. But stated? NO. → Answer: Text sagt dazu nichts\n\n**7. Time-Saving Vocabulary Recognition:**\n\nLearn to recognize word families:\n- arbeiten (verb) → Arbeit (noun) → Arbeiter (person) → arbeitslos (adjective)\n- fahren → Fahrt → Fahrer → Fahrzeug\n\nIf you know the root word, you can guess meaning in context!\n\n**8. Table Reading Strategy (Teil 5):**\n\nRules/regulations tables are dense! Strategy:\n- Read question first: 'Wann muss man bezahlen?'\n- Find relevant row: 'Bezahlung'\n- Find relevant column: 'Wann?'\n- Find intersection: Your answer!\n\nDon't read the whole table - just hunt for specific cells!\n\n**9. Common Mistakes & How to Fix Them:**\n\n❌ **Mistake 1:** Reading text before questions\n✅ **Fix:** Questions first, ALWAYS. They guide your reading.\n\n❌ **Mistake 2:** Translating every unknown word\n✅ **Fix:** Guess from context. You don't need 100% comprehension.\n\n❌ **Mistake 3:** Spending too long on one Teil\n✅ **Fix:** Set phone alarm for each Teil. Move on even if incomplete.\n\n❌ **Mistake 4:** Changing answers without reason\n✅ **Fix:** First instinct is usually correct. Only change if you find contradictory evidence.\n\n❌ **Mistake 5:** Leaving questions blank\n✅ **Fix:** Always guess! No negative points. 33% chance of being right!\n\n**10. Daily Practice Routine (15 minutes):**\n\n**Week 1-2:** Focus on Teil 1 & 2 (True/False, MCQs)\n- Day 1-3: Teil 1 practice\n- Day 4-7: Teil 2 practice\n\n**Week 3-4:** Focus on Teil 3 & 4 (Matching, Opinions)\n- Day 1-3: Teil 3 practice\n- Day 4-7: Teil 4 practice\n\n**Week 5+:** Full reading sections under timed conditions\n\n**Resource Recommendation:** Read 'Deutsche Welle' news articles (B1 level) daily. Pick any article, read for 5 minutes, summarize in 2 sentences. This builds speed and comprehension!"
          },
          subtasks: [
            { description: "Download official Goethe B1 sample exam (Modellsatz). Take Teil 1 TIMED (10 min). Score: __/6. Passing = 4+.", completed: false },
            { description: "Analyze mistakes: For each wrong answer, determine: Was it 'not mentioned' or 'misunderstood'? Write down WHY you got it wrong.", completed: false },
            { description: "Practice keyword hunting: Take any B1 text, create 5 True/False questions, identify keywords, scan text to find answers.", completed: false },
            { description: "Learn 30 connector words (jedoch, außerdem, deswegen, trotzdem, etc.) - make flashcards with example sentences.", completed: false },
            { description: "Practice Teil 3 matching: Take one practice set. Create a checklist for each person's requirements. Time: 12 minutes.", completed: false },
            { description: "Read one Deutsche Welle article (B1 level). Underline opinion indicators (Ich finde, Meiner Meinung nach, etc.). Count how many you found.", completed: false },
            { description: "Create your own 'Reading Strategy Card': Write down the 5-Teil time allocation (10-15-12-13-10) and keep it visible during practice.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Reading Sample (Modellsatz)", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "DW Reading Exercises B1", url: "https://learngerman.dw.com/en/level-b1" },
            { name: "Deutsche Welle - Langsam gesprochene Nachrichten (Transcripts)", url: "https://www.dw.com/de/deutsch-lernen/nachrichten/s-8030" },
            { name: "Schubert-Verlag Reading Exercises", url: "https://www.schubert-verlag.de/aufgaben/xg/xg03_02.htm" },
            { name: "B1 Reading Practice Tests", url: "https://www.german-grammar.de/grammar/section.php?keyword=leseverstehen" }
          ],
          notes: ""
        },
        {
          day: 4,
          task: "Core Vocabulary: Personal Life + Family (150 words)",
          focus: "vocabulary",
          level: "B1",
          lessonContent: {
            title: "Thematic Vocabulary Block 1: Your Personal World",
            definition: "B1 requires ~2,400 words total across all themes. We'll learn thematically because your brain naturally stores related words together. This is MORE efficient than random vocabulary lists!\n\n**Why Learn This Way?** When the exam asks about 'family', your brain activates ALL family-related words at once. This speeds up comprehension and production.\n\n**The Golden Rule:** ALWAYS learn nouns with:\n1. **Article** (der/die/das) - determines case endings\n2. **Plural form** - needed for understanding texts\n3. **One example sentence** - shows usage in context\n\n**Today's Theme:** Personal Information, Family, Relationships. These appear in:\n- Writing Teil 1 (emails about family events)\n- Speaking Teil 1 & 2 (talking about your life)\n- Reading Teil 1 (personal blogs)\n- Listening Teil 1 (messages between friends/family)",
            example: "**FAMILY CORE VOCABULARY (60 Essential Words):**\n\n**Immediate Family:**\n\n| German | Plural | English | Example |\n|--------|--------|---------|----------|\n| der Vater | die Väter | father | Mein Vater arbeitet als Arzt. |\n| die Mutter | die Mütter | mother | Meine Mutter kocht sehr gut. |\n| die Eltern | (plural only) | parents | Meine Eltern wohnen in Berlin. |\n| der Bruder | die Brüder | brother | Ich habe zwei Brüder. |\n| die Schwester | die Schwestern | sister | Meine Schwester studiert Medizin. |\n| die Geschwister | (plural only) | siblings | Ich habe drei Geschwister. |\n| das Kind | die Kinder | child | Das Kind spielt im Garten. |\n| der Sohn | die Söhne | son | Ihr Sohn ist 10 Jahre alt. |\n| die Tochter | die Töchter | daughter | Ihre Tochter geht zur Schule. |\n| das Baby | die Babys | baby | Das Baby schläft viel. |\n\n**Extended Family:**\n\n| German | Plural | English | Example |\n|--------|--------|---------|----------|\n| der Großvater/Opa | die Großväter | grandfather | Mein Opa erzählt gern Geschichten. |\n| die Großmutter/Oma | die Großmütter | grandmother | Meine Oma bäckt leckere Kuchen. |\n| die Großeltern | (plural only) | grandparents | Meine Großeltern leben auf dem Land. |\n| der Enkel | die Enkel | grandson | Der Enkel besucht oft die Großeltern. |\n| die Enkelin | die Enkelinnen | granddaughter | Die Enkelin hilft im Garten. |\n| der Onkel | die Onkel | uncle | Mein Onkel wohnt in Amerika. |\n| die Tante | die Tanten | aunt | Meine Tante ist Lehrerin. |\n| der Cousin/Vetter | die Cousins | male cousin | Mein Cousin spielt Fußball. |\n| die Cousine | die Cousinen | female cousin | Meine Cousine studiert in München. |\n| der Neffe | die Neffen | nephew | Mein Neffe ist sehr sportlich. |\n| die Nichte | die Nichten | niece | Meine Nichte lernt Klavier. |\n\n**In-Laws & Step-Family:**\n\n| German | English | Example |\n|--------|---------|----------|\n| der Schwiegervater | father-in-law | Mein Schwiegervater ist Ingenieur. |\n| die Schwiegermutter | mother-in-law | Ihre Schwiegermutter kocht gern. |\n| die Schwiegereltern | in-laws (plural) | Wir besuchen oft die Schwiegereltern. |\n| der Schwager | brother-in-law | Mein Schwager arbeitet bei BMW. |\n| die Schwägerin | sister-in-law | Meine Schwägerin ist sehr nett. |\n| der Stiefvater | stepfather | Mein Stiefvater ist sehr freundlich. |\n| die Stiefmutter | stepmother | Ihre Stiefmutter kommt aus Italien. |\n| der Halbbruder | half-brother | Ich habe einen Halbbruder. |\n| die Halbschwester | half-sister | Meine Halbschwester ist jünger. |\n\n**RELATIONSHIPS & MARITAL STATUS:**\n\n**Partners:**\n\n| German | English | Example |\n|--------|---------|----------|\n| der Freund | boyfriend | Mein Freund heißt Thomas. |\n| die Freundin | girlfriend | Seine Freundin ist sehr sympathisch. |\n| der Partner / die Partnerin | partner | Mein Partner und ich reisen gern. |\n| der Ehemann / Mann | husband | Ihr Ehemann arbeitet im Krankenhaus. |\n| die Ehefrau / Frau | wife | Seine Ehefrau ist Lehrerin. |\n| der/die Verlobte | fiancé/fiancée | Meine Verlobte kommt aus Spanien. |\n| der/die Ex | ex-partner | Mein Ex wohnt jetzt in Hamburg. |\n\n**Marital Status:**\n\n| German | English | Example |\n|--------|---------|----------|\n| ledig | single | Ich bin noch ledig. |\n| verheiratet (mit) | married (to) | Sie ist seit 5 Jahren verheiratet. |\n| verlobt (mit) | engaged (to) | Wir sind seit letztem Monat verlobt. |\n| geschieden | divorced | Er ist seit 2020 geschieden. |\n| getrennt | separated | Sie leben getrennt. |\n| verwitwet | widowed | Mein Großvater ist verwitwet. |\n\n**RELATIONSHIP VERBS & EXPRESSIONS:**\n\n**Meeting & Getting to Know:**\n- kennenlernen (separable) = to meet, get to know\n  → Ich habe meinen Mann 2015 kennengelernt.\n  \n- sich treffen mit (+ Dat) = to meet with\n  → Ich treffe mich heute mit meiner Schwester.\n  \n- sich vorstellen = to introduce oneself\n  → Darf ich mich vorstellen? Ich heiße Anna.\n\n**Love & Relationships:**\n- sich verlieben in (+ Akk) = to fall in love with\n  → Er hat sich in sie verliebt.\n  \n- lieben (+ Akk) = to love\n  → Ich liebe meine Familie.\n  \n- mögen (+ Akk) = to like\n  → Ich mag meinen Schwager sehr.\n\n**Marriage & Separation:**\n- heiraten (+ Akk) = to marry\n  → Sie heiraten im Juni.\n  \n- sich verloben (mit) = to get engaged\n  → Wir haben uns letztes Jahr verlobt.\n  \n- sich trennen (von) = to separate from\n  → Sie haben sich getrennt.\n  \n- sich scheiden lassen = to get divorced\n  → Sie lassen sich scheiden.\n\n**ADJECTIVES TO DESCRIBE PEOPLE (30 Essential):**\n\n**Positive Traits:**\n\n| German | English | Example |\n|--------|---------|----------|\n| nett | nice | Meine Tante ist sehr nett. |\n| freundlich | friendly | Er ist ein freundlicher Mensch. |\n| sympathisch | likeable | Dein Bruder ist sehr sympathisch. |\n| hilfsbereit | helpful | Meine Nachbarin ist sehr hilfsbereit. |\n| geduldig | patient | Lehrer müssen geduldig sein. |\n| großzügig | generous | Mein Onkel ist großzügig. |\n| ehrlich | honest | Sie ist eine ehrliche Person. |\n| zuverlässig | reliable | Mein Bruder ist sehr zuverlässig. |\n| fleißig | hardworking | Meine Schwester ist sehr fleißig. |\n| intelligent | intelligent | Ihr Sohn ist sehr intelligent. |\n| lustig | funny | Mein Cousin ist sehr lustig. |\n| optimistisch | optimistic | Sie ist eine optimistische Person. |\n\n**Negative Traits:**\n\n| German | English | Example |\n|--------|---------|----------|\n| unfreundlich | unfriendly | Der Nachbar ist leider unfreundlich. |\n| streng | strict | Mein Vater war sehr streng. |\n| faul | lazy | Er ist manchmal ein bisschen faul. |\n| ungeduldig | impatient | Ich bin oft zu ungeduldig. |\n| egoistisch | selfish | Sie kann manchmal egoistisch sein. |\n| pessimistisch | pessimistic | Er ist leider sehr pessimistisch. |\n\n**AGE EXPRESSIONS:**\n- jung (young) ↔ alt (old)\n- das Alter (age)\n- Wie alt bist du? (How old are you?)\n- Ich bin 25 Jahre alt. (I am 25 years old.)\n- Er ist Anfang/Mitte/Ende 30. (He's early/mid/late 30s.)\n- Sie ist älter/jünger als ich. (She's older/younger than me.)",
            tips: "**VOCABULARY LEARNING STRATEGIES:**\n\n**1. The 'Goldlist Method' (Scientifically Proven!):**\n- **Day 1:** Write 25 new words in a notebook (3 columns: German | Plural | English)\n- **Day 14:** Review the list WITHOUT looking at English. Rewrite only the ones you forgot.\n- **Day 60:** Final review. The ones you still remember are now PERMANENT!\n\n**Why it works:** Spaced repetition matches your brain's forgetting curve.\n\n**2. The 'Anki Flashcard System':**\nDigital flashcards that use spaced repetition algorithm:\n\n**Front of card:**\n```\nder _____ (Pl: die _____)\n[English: father]\n```\n\n**Back of card:**\n```\nder VATER (Pl: die Väter)\nMein Vater arbeitet als Arzt.\n```\n\n**Why it works:** Tests recall (harder) instead of recognition (easier). Builds stronger memory!\n\n**3. The 'Personal Story' Method:**\nCreate ONE story using all new vocabulary:\n\n'Meine **Familie** ist groß. Ich habe zwei **Brüder** und eine **Schwester**. Meine **Eltern** sind **verheiratet** seit 30 Jahren. Mein **Vater** ist sehr **freundlich** und meine **Mutter** ist **geduldig**. Ich **treffe** mich oft mit meinem **Cousin**. Wir haben uns vor 10 Jahren **kennengelernt**.'\n\n**Why it works:** Context + emotion = stronger memory!\n\n**4. The 'Color-Coding System':**\n- **Blue** = Masculine (der)\n- **Red** = Feminine (die)\n- **Green** = Neuter (das)\n\nWrite words in colored pens. Your brain will start associating colors with genders!\n\n**5. The 'Article Chant' Technique:**\nSay article + noun + plural rhythmically:\n'der Vater, die Väter, der Vater, die Väter' (repeat 10x)\n\nMake it a song! Rhythm aids memory.\n\n**6. The 'Opposite Pairs' Method:**\nLearn antonyms together:\n- jung ↔ alt\n- freundlich ↔ unfreundlich\n- verheiratet ↔ geschieden\n- geduldig ↔ ungeduldig\n\n**7. The 'Real-Life Labeling':**\nThink about YOUR actual family:\n- Write each person's name: 'Maria (meine Schwester)'\n- Describe them: 'Maria ist 28 Jahre alt, sehr freundlich und hilfsbereit'\n- Personalized examples stick BETTER!\n\n**8. Common Mistakes to Avoid:**\n\n❌ **Mistake:** Learning vocabulary without articles\n✅ **Fix:** Always 'der Bruder', NEVER just 'Bruder'\n\n❌ **Mistake:** Ignoring plural forms\n✅ **Fix:** 'der Bruder, die Brüder' - both equally important!\n\n❌ **Mistake:** Learning words in isolation\n✅ **Fix:** Always one example sentence per word\n\n❌ **Mistake:** Passive reading of vocabulary lists\n✅ **Fix:** Active recall - cover English, try to remember\n\n**9. Daily Practice Routine (10 minutes):**\n\n**Morning (5 min):**\n- Review yesterday's 25 words (Anki or notebook)\n- Say them out loud with articles\n\n**Evening (5 min):**\n- Learn 25 NEW words\n- Write 5 sentences using new words\n- Describe one family member using 5 adjectives\n\n**10. Exam Application Tips:**\n\n**For Writing Teil 1 (Informal Email):**\nCommon prompts: 'Tell your friend about your family visit...'\n\nPrepare these sentence templates:\n- 'Ich habe meine **Familie** besucht.'\n- 'Mein **Bruder** hat mir **geholfen**.'\n- 'Wir haben uns sehr gut **verstanden**.'\n\n**For Speaking Teil 2 (Presentation):**\nTopic: 'Family in Modern Society'\n\nPrepare these phrases:\n- 'In meiner **Familie** sind wir sehr **eng**.'\n- 'Meine **Eltern** sind **verheiratet** seit 30 Jahren.'\n- 'Ich **treffe** mich oft mit meinen **Geschwistern**.'\n\n**Resource Tip:** Download the official Goethe-Zertifikat B1 Wortliste (word list) from goethe.de. It has all 2,400 words categorized by theme!"
          },
          subtasks: [
            { description: "Create Anki deck or notebook: Write 60 family/relationship words with article + plural. Review format: German | Plural | English | Example sentence.", completed: false },
            { description: "Write your family tree in German: Label each person with relationship term (der Vater: Hans, die Schwester: Anna, etc.). Include ages.", completed: false },
            { description: "Describe 3 family members in detail (5 sentences each): Name, age, job, personality (2-3 adjectives), what they like to do. Use vocabulary from today.", completed: false },
            { description: "Learn 30 adjectives to describe people: Create flashcards with opposites (freundlich↔unfreundlich, geduldig↔ungeduldig, etc.).", completed: false },
            { description: "Practice dative case with family: Write 10 sentences using 'Ich helfe meiner/meinem...' (I help my...). Example: 'Ich helfe meiner Mutter im Haushalt.'", completed: false },
            { description: "Speaking practice: Record 2-minute monologue 'Meine Familie' (My family). Include: who's in your family, relationships, describe 2 people in detail. Listen back and note 3 improvements needed.", completed: false },
            { description: "Exam simulation: Imagine Writing Teil 1 prompt: 'Your friend asks about your family. Write about: 1) Who's in your family? 2) What did you do together recently? 3) Describe one family member 4) Invite your friend to meet them.' Write in 15 minutes (~80 words).", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Anki Web (Spaced Repetition Flashcards)", url: "https://ankiweb.net" },
            { name: "Goethe B1 Official Word List (2,400 words)", url: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Wortliste.pdf" },
            { name: "Quizlet - Goethe B1 Family Vocabulary", url: "https://quizlet.com/subject/goethe-b1-family" },
            { name: "Deutsche Welle - Family Vocabulary with Audio", url: "https://learngerman.dw.com/en/familie/l-37904670" },
            { name: "Memrise - German Family Words", url: "https://www.memrise.com/course/531/german-family" },
            { name: "Easy German YouTube - Family Episode", url: "https://www.youtube.com/easygerman" }
          ],
          notes: ""
        },
        {
          day: 5,
          task: "Listening Module Strategy + Teil 1 Practice",
          focus: "listening",
          level: "B1",
          lessonContent: {
            title: "Hören: Training Your Ears for B1 Speed",
            definition: "Listening is 40 minutes total, 30 points. You need 18+ (60%) to pass. **CRUCIAL FACT:** Most audio plays ONCE only (except Teil 1 & 4 which play TWICE). This is mentally exhausting and requires intense concentration!\n\n**Why Listening is Challenging:** Unlike reading where you control the pace, listening forces you to process information in real-time. You can't 're-read' a spoken sentence. Plus, German native speakers talk FAST, with regional accents and colloquial expressions.\n\n**The Mindset Shift:** You DON'T need to understand every word! Focus on **main ideas** and **specific facts**. If you miss a word, DON'T panic - keep listening. The common trap: trying to understand 100% and missing everything that follows!\n\n**Good News:** Teil 1 & 4 play twice, giving you 50% of the points with a second chance!",
            example: "**LISTENING MODULE BREAKDOWN (40 minutes, 30 points):**\n\n**Teil 1: 5 Short Monologues (15 minutes, 10 points)**\n\n**Format:**\n- 5 separate short texts (phone messages, announcements, instructions)\n- Each has 2 questions: 1 True/False + 1 Multiple Choice (3 options)\n- **Plays TWICE** ← Your safety net!\n- Length: Each ~30-45 seconds\n\n**Context Examples:**\n- Answering machine message from friend\n- Train station announcement\n- Radio weather report\n- Shop closing time announcement\n- Event invitation\n\n**Strategy:**\n- **First listening:** Get main idea, catch obvious answers\n- **Between playings:** Review questions, note what you missed\n- **Second listening:** Focus on missed details\n\n**Question Types:**\n\n*True/False Example:*\nAudio: 'Der Kurs beginnt am Montag um 9 Uhr.'\nQuestion: 'Der Kurs startet um 9 Uhr.'\nAnswer: **Richtig** (True - 'beginnt' = 'startet')\n\n*Multiple Choice Example:*\nAudio: 'Rufen Sie mich bitte heute Abend zurück.'\nQuestion: 'Wann soll man zurückrufen?'\na) Heute Morgen  b) **Heute Abend** ✓  c) Morgen früh\n\n---\n\n**Teil 2: 1 Long Monologue - Lecture/Presentation (10 minutes, 5 points)**\n\n**Format:**\n- One coherent presentation (museum tour, company info, travel guide)\n- 5 Multiple Choice questions\n- **Plays ONCE only!** ← High pressure!\n- Length: ~3-4 minutes\n- Formal language, lots of facts/numbers/dates\n\n**Context Examples:**\n- Museum guide explaining exhibition\n- University lecturer introducing course\n- Tour guide describing city sights\n- Company representative presenting services\n\n**Strategy:**\n- Questions appear in CHRONOLOGICAL order (follow the audio flow)\n- Write down ALL numbers/dates/names immediately (you won't remember!)\n- Use abbreviations: '19:00' not 'sieben Uhr abends'\n\n**Sample Question:**\n'Wie viele Mitarbeiter hat die Firma?'\na) 150  b) 250  c) 350\n\nAudio: '...unsere Firma beschäftigt heute etwa zweihundertfünfzig Mitarbeiter...'\n\nAnswer: **b) 250**\n\n**Number Vocab (ESSENTIAL!):**\n- etwa (approximately)\n- ungefähr (roughly)\n- mehr als (more than)\n- weniger als (less than)\n- mindestens (at least)\n- höchstens (at most)\n\n---\n\n**Teil 3: 1 Conversation - Everyday Dialogue (5 minutes, 7 points)**\n\n**Format:**\n- Conversation between 2 people (friends, colleagues, family)\n- 7 True/False questions\n- **Plays ONCE only!**\n- Length: ~3-4 minutes\n- Informal language, faster pace, interruptions\n\n**Context Examples:**\n- Planning a weekend trip\n- Discussing work problems\n- Talking about recent events\n- Making arrangements\n\n**The Trap:** Speaker A says something, Speaker B disagrees or adds info. Question asks about ONE person's opinion/action.\n\n**Example:**\nAudio:\nMann: 'Ich finde das Restaurant zu teuer.'\nFrau: 'Ach, ich denke, die Preise sind okay.'\n\nQuestion: 'Die Frau findet das Restaurant teuer.'\nAnswer: **Falsch** (False - she thinks prices are okay!)\n\n**Strategy:**\n- Take notes with 'M' (Mann) and 'F' (Frau) labels\n- Listen for opinion indicators:\n  - Ich finde... (I think)\n  - Meiner Meinung nach... (In my opinion)\n  - Ich glaube... (I believe)\n  - Für mich... (For me)\n\n---\n\n**Teil 4: Radio Discussion - 3+ People (10 minutes, 8 points)**\n\n**Format:**\n- Radio program with moderator + 2-3 guests\n- 8 Multiple Choice questions: 'WHO said WHAT?'\n- **Plays TWICE** ← Second safety net!\n- Length: ~4-5 minutes\n- Mix of formal and informal, various opinions\n\n**Context Examples:**\n- Debate about social media\n- Discussion about work-life balance\n- Opinions on environmental issues\n- Advice program\n\n**The Challenge:** Multiple speakers, must identify WHO holds which opinion.\n\n**Question Format:**\n'Wer findet, dass soziale Medien wichtig sind?'\na) Moderator  b) Person A  c) Person B\n\n**Strategy:**\n- Make a quick table:\n\n| Speaker | Opinion | Key Point |\n|---------|---------|------------|\n| Mod | neutral | asks questions |\n| Pers A | PRO | 'wichtig für Kontakte' |\n| Pers B | CONTRA | 'Zeitverschwendung' |\n\n**Important:** Moderator questions ≠ moderator's opinion! They're neutral.\n\n---\n\n**LISTENING SURVIVAL VOCABULARY:**\n\n**Time Expressions:**\n- morgens (in the morning)\n- vormittags (late morning)\n- mittags (at noon)\n- nachmittags (in the afternoon)\n- abends (in the evening)\n- nachts (at night)\n- werktags (on weekdays)\n- am Wochenende (on weekend)\n- sofort (immediately)\n- gleich (right away)\n- später (later)\n- bald (soon)\n- vorher (before)\n- nachher (afterwards)\n\n**Signal Words (Direction Changers!):**\n- aber (but)\n- jedoch (however)\n- trotzdem (nevertheless)\n- allerdings (though, however)\n- dagegen (on the other hand)\n- außerdem (moreover)\n- deshalb (therefore)\n- deswegen (that's why)\n- zum Beispiel (for example)\n- das heißt (that means)\n- mit anderen Worten (in other words)\n\n**Opinion/Attitude Markers:**\n- leider (unfortunately)\n- zum Glück (luckily)\n- hoffentlich (hopefully)\n- wahrscheinlich (probably)\n- vielleicht (maybe)\n- auf jeden Fall (definitely)\n- keinesfalls (by no means)\n- natürlich (naturally, of course)\n\n**Problem/Solution Indicators:**\n- das Problem ist... (the problem is)\n- die Schwierigkeit ist... (the difficulty is)\n- die Lösung ist... (the solution is)\n- man sollte... (one should)\n- man könnte... (one could)\n- es wäre besser... (it would be better)\n\n---\n\n**LISTENING TECHNIQUES:**\n\n**1. Predictive Listening:**\nBefore audio starts, read the question and predict possible answers.\n\nQuestion: 'Wann findet das Treffen statt?'\nPrediction: Listen for time words (Montag, morgen, 15 Uhr, etc.)\n\n**2. Note-Taking Symbols:**\nDevelop your own shorthand:\n- ✓ = positive/agree\n- ✗ = negative/disagree\n- → = result/consequence\n- ↑ = increase/more\n- ↓ = decrease/less\n- ? = unclear/check again\n- M/F = Mann/Frau (man/woman)\n- Mon/Die/etc = days (abbreviate)\n\n**3. Number Capture:**\nWhen you hear numbers, write IMMEDIATELY:\n- Times: 19:00 (not 'sieben Uhr')\n- Dates: 15.3. (not 'fünfzehnten März')\n- Amounts: 250€ (not 'zweihundertfünfzig')\n\n**4. Question Word Focus:**\nUnderline the question word - it tells you WHAT to listen for:\n- **Wann?** (When?) → Listen for time\n- **Wo?** (Where?) → Listen for place\n- **Wer?** (Who?) → Listen for person name/role\n- **Was?** (What?) → Listen for action/thing\n- **Warum?** (Why?) → Listen for 'weil', 'denn', 'deshalb'\n- **Wie?** (How?) → Listen for manner/description\n- **Wie viele?** (How many?) → Listen for numbers",
            tips: "**ADVANCED LISTENING STRATEGIES:**\n\n**1. The 'Pre-Reading Power' Technique:**\nYou get prep time before each Teil! Use it wisely:\n- Read ALL questions\n- Underline question words (Wann? Wo? Wer?)\n- Highlight keywords in questions\n- Make mental predictions\n\nThis primes your brain to recognize relevant info!\n\n**2. The 'Don't Panic, Keep Going' Rule:**\nIf you miss something:\n- ❌ DON'T: Stop and think 'What did they say?'\n- ✅ DO: Mark question with '?' and keep listening\n- Come back to it after (sometimes later info helps!)\n\n**3. The 'Synonym Recognition' Skill:**\nQuestions use DIFFERENT words than audio!\n\nAudio: 'Der Kurs beginnt am Montag.'\nQuestion: 'Der Kurs **startet** am Montag.'\n\nLearn synonym pairs:\n- beginnen = anfangen = starten (begin/start)\n- enden = aufhören = fertig sein (end/finish)\n- treffen = sich sehen (meet)\n- zurückrufen = nochmal anrufen (call back)\n- Bescheid sagen = informieren (inform)\n\n**4. The 'First Listening vs Second Listening' Strategy (Teil 1 & 4):**\n\n**First Listening:**\n- Listen for overall context (What's this about?)\n- Answer EASY questions (the obvious ones)\n- Mark uncertain answers with '?'\n\n**Second Listening:**\n- Focus ONLY on '?' marked questions\n- Ignore already-answered questions\n- Maximum concentration on gaps\n\n**5. The 'Process of Elimination' for MCQs:**\nWhen unsure between options:\n- Cross out obviously wrong answer(s)\n- Between two similar? Listen for the DIFFERENCE\n- Which word actually appeared in audio?\n\n**6. True/False Strategy:**\n\nQuestion: 'Der Mann kauft ein Ticket für Montag.'\n\nListen for:\n- ✓ Exact match: 'Ich kaufe ein Ticket für Montag' = TRUE\n- ✗ Contradiction: 'Ich kaufe ein Ticket für Dienstag' = FALSE\n- ? Not mentioned: He talks about travel but not which day = TEXT SAGT DAZU NICHTS\n\n**7. Common Listening Mistakes:**\n\n❌ **Mistake 1:** Translating every word in your head\n✅ **Fix:** Listen for meaning, not word-by-word\n\n❌ **Mistake 2:** Focusing on unknown words\n✅ **Fix:** Skip unknown words, focus on what you DO understand\n\n❌ **Mistake 3:** Not using prep time\n✅ **Fix:** Read questions in advance EVERY time\n\n❌ **Mistake 4:** Writing full sentences in notes\n✅ **Fix:** Abbreviations and symbols only!\n\n❌ **Mistake 5:** Giving up after missing something\n✅ **Fix:** Keep listening, next question might be easier\n\n**8. Accent & Speed Adaptation:**\nGerman has regional varieties:\n- Standard German (Hochdeutsch) - exam uses this mostly\n- Austrian German - some vowel differences\n- Swiss German - quite different, but exams avoid heavy accents\n\n**Training tip:** Listen to podcasts from different regions:\n- DW News (standard)\n- ORF News (Austrian)\n- SRF News (Swiss)\n\n**9. Daily Listening Practice Routine (15 minutes):**\n\n**Week 1-2: Slow German**\n- 'Slow German' podcast - perfect for beginners\n- 'DW Langsam gesprochene Nachrichten' - slow news\n\n**Week 3-4: Normal Speed**\n- 'Easy German' podcast - natural speed, German subtitles\n- Deutsche Welle Learn German podcasts\n\n**Week 5+: Exam Practice**\n- Official Goethe sample exam Hörtexte\n- Practice tests under timed conditions\n\n**10. Background Listening Strategy:**\nPlay German radio/podcasts while doing other tasks:\n- Cooking? German music radio\n- Commuting? German podcast\n- Exercising? German audiobook\n\nYou're training your ear to recognize German rhythms and sounds!\n\n**11. Shadowing Technique:**\nListen to a sentence, pause, repeat OUT LOUD exactly as you heard it:\n- Mimics pronunciation\n- Improves listening comprehension\n- Builds speaking fluency\n\nDo this 5 minutes daily with 'Easy German' episodes!\n\n**12. The 'First Word is Gold' Rule:**\nIn German, sentence structure often puts important words first:\n- 'Morgen gehe ich...' (Tomorrow I go...) - WHEN is first!\n- 'In Berlin wohne ich...' (In Berlin I live...) - WHERE is first!\n\nTrain your ear to catch the first 2-3 words - they often answer the question!"
          },
          subtasks: [
            { description: "Download official Goethe B1 sample exam audio (Hörtexte). Listen to Teil 1 once WITHOUT questions. What's the main topic of each of the 5 texts? Write down.", completed: false },
            { description: "Now do Teil 1 properly: Read questions first, listen twice, answer all 10 questions. Score: __/10. Passing = 6+. Time yourself: 15 minutes total.", completed: false },
            { description: "Listen to 'Slow German' podcast (any episode, 10 minutes). Task: Write down main topic + 3 supporting details. Don't worry about understanding everything!", completed: false },
            { description: "Dictation practice: Choose any 5 simple German sentences (from textbook or online). Listen 3 times, write exactly what you hear. Check spelling and articles.", completed: false },
            { description: "Learn 40 'listening signal words': Create flashcards for aber, jedoch, trotzdem, außerdem, deshalb, zum Beispiel, das heißt, leider, zum Glück, etc.", completed: false },
            { description: "Number recognition drill: Listen to German numbers 1-1000 on YouTube. Write down 20 random numbers you hear. Check your accuracy.", completed: false },
            { description: "Create your note-taking symbol key: Design 10 symbols you'll use during listening (✓,✗,M,F,→, time abbreviations, etc.). Practice using them with one practice audio.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Listening Audio (Modellsatz)", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "Slow German Podcast (Annik Rubens)", url: "https://www.slowgerman.com" },
            { name: "DW Langsam gesprochene Nachrichten (Slow News)", url: "https://www.dw.com/de/deutsch-lernen/nachrichten/s-8030" },
            { name: "Easy German Podcast (Natural Speed)", url: "https://www.easygerman.fm" },
            { name: "Deutsche Welle Learn German - Listening Exercises", url: "https://learngerman.dw.com/en/overview" },
            { name: "German Numbers Pronunciation (YouTube)", url: "https://www.youtube.com/results?search_query=german+numbers+pronunciation" },
            { name: "Goethe B1 Listening Practice Tests", url: "https://www.german-grammar.de/grammar" }
          ],
          notes: ""
        },
        {
          day: 6,
          task: "Speaking Module Overview + Teil 1 Practice (Planning Task)",
          focus: "speaking",
          level: "B1",
          lessonContent: {
            title: "Sprechen Teil 1: The Planning Task (Partnership Dialogue)",
            definition: "Speaking is done in PAIRS (or solo if no partner). Total time: 15 minutes, 100 points. **Teil 1 (3-4 min, 28 points):** You and partner plan an event together (party, trip, meeting, etc.). You get 5 topics/questions to discuss. Goal: Natural back-and-forth conversation, NOT a presentation!",
            example: "**TYPICAL TEIL 1 SCENARIO:**\n'Plan a birthday party for a colleague. Discuss:'\n1. Wann? (When?)\n2. Wo? (Where?)\n3. Wie viele Gäste? (How many guests?)\n4. Was essen/trinken? (What food/drinks?)\n5. Welches Geschenk? (What gift?)\n\n**CONVERSATION STRUCTURE:**\n- **Start:** 'Was meinst du, wann sollen wir...?' (What do you think, when should we...?)\n- **Agree:** 'Gute Idee!' / 'Das finde ich auch.'\n- **Disagree politely:** 'Ich bin nicht sicher...' / 'Vielleicht wäre es besser...'\n- **Suggest:** 'Wie wäre es mit...?' / 'Wir könnten...'\n- **Confirm:** 'Also, wir machen es am... (date)'\n\n**SCORING:** Grammar 28%, Vocabulary 28%, Interaction 22%, Pronunciation 22%",
            tips: "**CRITICAL TIP:** Don't dominate! Equal participation = higher score. If your partner is quiet, ask: 'Was denkst du?' (What do you think?). Use phrases like 'Ich würde vorschlagen...' (I would suggest) instead of 'Wir müssen...' (We must). Sounds more B1-level!"
          },
          subtasks: [
            { description: "Watch official Goethe B1 speaking video (Teil 1 example) - note how candidates interact.", completed: false },
            { description: "Learn 15 planning phrases: 'Wie wäre es mit...?', 'Ich schlage vor...', 'Was hältst du von...?', etc.", completed: false },
            { description: "Practice with language partner (or record both sides yourself): Plan a class trip. Cover all 5 W-questions.", completed: false },
            { description: "Self-assess recording: Did you interrupt? Did you use past/present tense correctly? Note 3 improvements.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Goethe B1 Speaking Video", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "Tandem Language Exchange", url: "https://www.tandem.net" },
            { name: "ConversationExchange", url: "https://www.conversationexchange.com" }
          ],
          notes: ""
        },
        {
          day: 7,
          task: "Week 1 Review + Mock Test (Reading Teil 1-2)",
          focus: "review",
          level: "B1",
          lessonContent: {
            title: "Consolidation Day: What Did We Actually Learn?",
            definition: "Review is NOT optional - it's where learning becomes memory! Today, we test Week 1 knowledge: cases, present tense, exam format understanding. Take 2 reading sections under timed conditions. This reveals your current baseline and shows what needs more work.",
            example: "**WEEK 1 CHECKLIST:**\n\n✅ Grammar:\n- 4 cases (NOM/AKK/DAT) articles memorized?\n- Present tense regular verbs conjugated?\n- Irregular verbs (sein, haben, werden) mastered?\n\n✅ Exam Strategy:\n- Downloaded official sample exam?\n- Understand 65/40/60/15 minute structure?\n- Know 60% passing requirement PER module?\n\n✅ Vocabulary:\n- 150 words learned (family, relationships)?\n- Nouns learned with article + plural?\n\n✅ Skills Practice:\n- Did one reading Teil?\n- Did one listening Teil?\n- Practiced speaking Teil 1 scenario?\n\n**TODAY'S MOCK TEST:**\nReading Teil 1 (Blog) + Teil 2 (Press) = 25 minutes\nScore yourself: /12 points (60% = 7 points)\n\n**If you scored <7:** Review cases more - reading comprehension often fails due to misidentifying subjects/objects.",
            tips: "**STUDY TECHNIQUE:** Use 'active recall' - close your books and write everything you remember about dative case. Then check. What did you miss? That's your focus for next week! For vocabulary, test yourself English→German (harder direction). If you can produce the German word with correct article, you truly know it."
          },
          subtasks: [
            { description: "Take timed Reading Teil 1 + 2 from official sample (25 min total). Record score: __/12.", completed: false },
            { description: "Review all incorrect answers: WHY was it wrong? Vocabulary issue or comprehension issue?", completed: false },
            { description: "Flashcard review: Go through all Week 1 vocabulary (150 words) - separate 'known' and 'needs practice' piles.", completed: false },
            { description: "Grammar check: Write 10 sentences using all 3 cases learned (NOM/AKK/DAT) - have native speaker or teacher check if possible.", completed: false },
            { description: "Plan Week 2: What was hardest this week? Allocate extra time to that skill next week.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Sample Exam", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "Self-Assessment Checklist PDF", url: "https://www.goethe.de" }
          ],
          notes: ""
        }
      ]
    },

    // ============== WEEK 2: PERFECT TENSE & WRITING SKILLS ==============
    {
      week: 2,
      goal: "Perfect Tense Mastery + Writing Module (Informal Email)",
      targetVocabulary: 200,
      estimatedHours: "16-20 hours",
      days: [
        {
          day: 1,
          task: "Perfekt Tense (Present Perfect): haben vs sein",
          focus: "grammar",
          level: "B1",
          lessonContent: {
            title: "The Perfect Tense: Your Past-Story Superpower",
            definition: "**Perfekt (Present Perfect)** is THE most common past tense in spoken German and informal writing! While English uses simple past ('I ate'), Germans prefer Perfekt ('I have eaten' = Ich habe gegessen) in everyday speech.\n\n**Why Perfekt is Essential:** Writing Teil 1 (informal email) asks about past events - vacation, weekend, last week. Speaking Teil 1 & 2 require describing past experiences. Without Perfekt, you can't tell stories or share experiences!\n\n**The Formula:** Subject + **haben/sein** (conjugated) + ... + **Past Participle** (at the END)\n\n**haben vs sein Rule:**\n- 90% of verbs use **haben**\n- Use **sein** ONLY for:\n  1. **Movement verbs** (change location): gehen, fahren, fliegen, kommen, reisen, laufen\n  2. **State-change verbs** (become different): werden, sterben, aufwachen, einschlafen, wachsen\n  3. **Special cases:** sein, bleiben, passieren, gelingen\n\n**Memory Trick:** If the verb involves 'going somewhere' or 'becoming something new', use sein. Everything else = haben!",
            example: "**PERFEKT WITH HABEN (Most Verbs):**\n\n1. **Basic Structure:**\n   - Ich **habe** gestern Pizza **gegessen**. (I ate pizza yesterday.)\n   - Sie **hat** den Film **gesehen**. (She saw the film.)\n   - Wir **haben** viel **gelernt**. (We learned a lot.)\n\n2. **Word Order in Questions:**\n   - **Hast** du das Buch **gelesen**? (Did you read the book?)\n   - Was **hast** du **gemacht**? (What did you do?)\n\n3. **With Modal Verbs:**\n   - Ich **habe** nicht kommen **können**. (I couldn't come.)\n   - Er **hat** das Auto verkaufen **müssen**. (He had to sell the car.)\n\n**PERFEKT WITH SEIN (Movement & Change):**\n\n1. **Movement Verbs:**\n   - Wir **sind** nach Berlin **gefahren**. (We went to Berlin.)\n   - Sie **ist** ins Kino **gegangen**. (She went to the cinema.)\n   - Ich **bin** nach Hause **gekommen**. (I came home.)\n   - Er **ist** zum Supermarkt **gelaufen**. (He ran to the supermarket.)\n\n2. **State-Change Verbs:**\n   - Das Kind **ist** schnell **gewachsen**. (The child grew quickly.)\n   - Meine Oma **ist** 2020 **gestorben**. (My grandma died in 2020.)\n   - Ich **bin** um 7 Uhr **aufgewacht**. (I woke up at 7.)\n   - Er **ist** Lehrer **geworden**. (He became a teacher.)\n\n3. **Special Cases:**\n   - Wir **sind** zu Hause **geblieben**. (We stayed at home.) ← No movement, but still sein!\n   - Was **ist** **passiert**? (What happened?) ← Always sein!\n   - Ich **bin** gestern krank **gewesen**. (I was sick yesterday.)\n\n**PAST PARTICIPLE FORMATION - The 4 Rules:**\n\n**1. Regular Verbs: ge- + stem + -t**\n```\nmachen → ge**macht**\nlernen → ge**lernt**\nkaufen → ge**kauft**\narbeiten → ge**arbeit**et (add -e- before -t if stem ends in -t/-d)\nöffnen → ge**öffn**et\n```\n\n**2. Irregular Verbs: ge- + changed stem + -en (MUST MEMORIZE!)**\n```\nsehen → ge**seh**en (stem stays same)\nessen → ge**gess**en (vowel changes e→e but doubles s)\ngehen → ge**gang**en (vowel changes e→a)\nfahren → ge**fahr**en (stem changes)\ntrinken → ge**trunk**en (vowel changes i→u)\nfinden → ge**fund**en (vowel changes i→u)\nschreiben → ge**schrieb**en (vowel changes ei→ie)\nlesen → ge**les**en\nhelfen → ge**holf**en\nnehmen → ge**nomm**en (completely different!)\n```\n\n**Top 30 Irregular Past Participles to Memorize:**\n1. gehen → gegangen (to go)\n2. kommen → gekommen (to come)\n3. sehen → gesehen (to see)\n4. essen → gegessen (to eat)\n5. trinken → getrunken (to drink)\n6. fahren → gefahren (to drive/go)\n7. fliegen → geflogen (to fly)\n8. laufen → gelaufen (to run/walk)\n9. schlafen → geschlafen (to sleep)\n10. lesen → gelesen (to read)\n11. schreiben → geschrieben (to write)\n12. sprechen → gesprochen (to speak)\n13. nehmen → genommen (to take)\n14. geben → gegeben (to give)\n15. finden → gefunden (to find)\n16. helfen → geholfen (to help)\n17. singen → gesungen (to sing)\n18. beginnen → begonnen (to begin)\n19. schwimmen → geschwommen (to swim)\n20. treffen → getroffen (to meet)\n21. werden → geworden (to become)\n22. bleiben → geblieben (to stay)\n23. sein → gewesen (to be)\n24. haben → gehabt (to have)\n25. wissen → gewusst (to know)\n26. denken → gedacht (to think)\n27. bringen → gebracht (to bring)\n28. kennen → gekannt (to know someone)\n29. nennen → genannt (to name/call)\n30. rennen → gerannt (to run fast)\n\n**3. Separable Verbs: prefix + ge- + stem + -t/-en**\n```\neinkaufen → **ein**ge**kauft** (shopped)\naufstehen → **auf**ge**stand**en (got up)\nanrufen → **an**ge**ruf**en (called)\nmitbringen → **mit**ge**bracht** (brought along)\nfernsehen → **fern**ge**seh**en (watched TV)\nabfahren → **ab**ge**fahr**en (departed)\n```\n\n**4. Inseparable Verbs: NO 'ge-'! Just stem + -t/-en**\n\nInseparable prefixes: be-, emp-, ent-, er-, ge-, miss-, ver-, zer-\n\n```\nbesuchen → besucht (visited) ← NO ge-!\nverstehen → verstanden (understood)\nerzählen → erzählt (told/narrated)\nbekommen → bekommen (received/got)\nentscheiden → entschieden (decided)\nerleben → erlebt (experienced)\nvergessen → vergessen (forgot)\ngehören → gehört (belonged)\n```\n\n**Mixed Example (All Types in One Story):**\n\n'Gestern **habe** ich um 7 Uhr **aufgestanden** (separable). Ich **habe** gefrühstückt (regular) und **bin** zur Uni **gefahren** (irregular + sein). Dort **habe** ich meinen Freund **getroffen** (irregular). Wir **haben** zusammen Kaffee **getrunken** (irregular). Dann **haben** wir die Vorlesung **besucht** (inseparable). Nach der Uni **bin** ich nach Hause **gegangen** (irregular + sein) und **habe** für die Prüfung **gelernt** (regular).'",
            tips: "**MEMORIZATION STRATEGIES:**\n\n**1. The SEIN Verbs Mnemonic - 'Dr. Mrs. Vandertrampp':**\nThis English mnemonic helps remember sein verbs:\n- **D**evenir (werden - become)\n- **R**evenir (zurückkommen - come back)\n- **M**ourir (sterben - die)\n- **R**etourner (zurückkehren - return)\n- **S**ortir (ausgehen - go out)\n- **V**enir (kommen - come)\n- **A**ller (gehen - go)\n- **N**aître (geboren werden - be born)\n- **D**escendre (hinuntergehen - descend)\n- **E**ntrer (eintreten - enter)\n- **R**ester (bleiben - stay)\n- **T**omber (fallen - fall)\n- **R**etourner (zurückkehren - return)\n- **A**rriver (ankommen - arrive)\n- **M**onter (hinaufgehen - ascend)\n- **P**artir (abfahren - depart)\n- **P**asser (passieren - happen)\n\n**2. Irregular Verbs - The Vowel Change Patterns:**\nMany irregular verbs follow patterns:\n- **ei → ie → ie:** schreiben → schrieb → geschrieben (bleiben, scheinen)\n- **e → a → o:** sprechen → sprach → gesprochen (treffen, helfen)\n- **i → a → u:** finden → fand → gefunden (trinken, singen, schwimmen)\n- **e → a → e:** essen → aß → gegessen (geben, lesen, sehen)\n\nLearn these patterns, and you can often guess the past participle!\n\n**3. Daily Drill - The '10-10-10' Method:**\n- **10 haben sentences:** 'Ich habe (verb) + gekauft/gemacht/gegessen/etc.'\n- **10 sein sentences:** 'Ich bin (verb) + gegangen/gefahren/geworden/etc.'\n- **10 questions:** 'Hast du...?' / 'Bist du...?'\n\nDo this every morning for 5 minutes. By Week 4, it's automatic!\n\n**4. Separable vs Inseparable - The Stress Test:**\n- **Separable:** Stress on PREFIX → 'AUFstehen' → AUFgestanden\n- **Inseparable:** Stress on STEM → 'besuCHEN' → besucht (no ge-)\n\nSay it out loud - your ear will tell you!\n\n**5. Common Mistakes to Avoid:**\n\n❌ Ich **habe** nach Berlin **gegangen**. → ✅ Ich **bin** nach Berlin **gegangen**.\n❌ Er **ist** Pizza **gegessen**. → ✅ Er **hat** Pizza **gegessen**.\n❌ Wir haben **gebesucht**. → ✅ Wir haben **besucht**. (no ge- for inseparable!)\n❌ Sie hat **aufstanden**. → ✅ Sie ist **aufgestanden**. (aufstehen uses sein!)\n\n**6. Writing Tip for Teil 1 (Informal Email):**\nWhen describing your weekend/vacation:\n- Use time markers: gestern, vorgestern, letztes Wochenende, letzte Woche\n- Mix haben and sein verbs: 'Ich habe gegessen und bin gegangen' sounds more natural\n- Start sentences with time: 'Am Samstag bin ich...', 'Dann habe ich...'\n\n**7. Flashcard Strategy:**\nCreate 3 piles:\n- **Pile 1:** Regular verbs (quick review)\n- **Pile 2:** Irregular with patterns (medium review)\n- **Pile 3:** Crazy irregulars (nehmen→genommen, sein→gewesen) - daily review!\n\n**8. Real-World Practice:**\nEvery evening, write 3 sentences about your day in Perfekt:\n- 'Heute habe ich... (what you did)'\n- 'Ich bin... (where you went)'\n- 'Es hat... (how it was)'\n\nThis builds automaticity!"
          },
          subtasks: [
            { description: "Memorize 30 irregular past participles: gehen→gegangen, sehen→gesehen, essen→gegessen, trinken→getrunken, etc.", completed: false },
            { description: "Drill haben vs sein: Write 20 sentences in Perfekt - 15 with haben, 5 with sein (movement verbs).", completed: false },
            { description: "Practice separable verbs: aufstehen, einkaufen, fernsehen - write 5 Perfekt sentences.", completed: false },
            { description: "Translation practice: Translate 10 English past-tense sentences to German Perfekt.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Perfekt Tense Conjugator", url: "https://www.verbformen.com" },
            { name: "German Past Participles List", url: "https://www.germanveryeasy.com/past-participles" }
          ],
          notes: ""
        },
        {
          day: 2,
          task: "Vocabulary: Daily Routine + Time Expressions",
          focus: "vocabulary",
          level: "B1",
          lessonContent: {
            title: "Daily Routine Vocabulary: The Foundation of Natural Conversation",
            definition: "**Daily routine vocabulary** is the backbone of authentic German conversation! This isn't just memorizing words - it's about building the language toolbox you need for THREE critical exam sections: Writing Teil 1 (describing past weekend/vacation), Speaking Teil 2 (presentation about daily life), and Speaking Teil 3 (discussion about routines and time management).\n\n**Why This Matters:** When the examiner asks 'Beschreiben Sie Ihren typischen Tag' (Describe your typical day) or Writing Teil 1 prompts ask 'Was hast du am Wochenende gemacht?' (What did you do last weekend?), you need 50+ verbs at your fingertips to paint a vivid, detailed picture. Generic answers like 'I got up, ate, went to work' score LOW. Rich answers with separable verbs, reflexive verbs, and time markers score HIGH!\n\n**The Power of Separable Verbs:** German LOVES separable verbs for daily activities! Unlike English, where we say 'wake up' as two words, German says 'aufwachen' but then SPLITS it: 'Ich wache um 7 Uhr AUF.' The prefix flies to the end! In Perfekt tense, 'ge-' gets sandwiched in the middle: 'Ich bin AUFgewacht.' Mastering these isn't optional - they appear in 80% of daily routine descriptions!\n\n**Reflexive Verbs Reality:** Many personal care activities use 'sich' (myself/yourself): 'sich duschen' (to shower oneself), 'sich anziehen' (to dress oneself), 'sich ausruhen' (to rest oneself). The 'sich' changes: ich **mich**, du **dich**, er/sie/es **sich**, wir **uns**, ihr **euch**, sie/Sie **sich**. Example: 'Ich dusche **mich** jeden Morgen' (I shower every morning).\n\n**Time Expressions = Your Safety Net:** Even if you forget a verb, solid time expressions keep your story flowing! 'Zuerst... dann... danach... schließlich...' (First... then... after that... finally...) creates structure. 'Um 8 Uhr... gegen Mittag... am Nachmittag... am Abend...' (At 8 o'clock... around noon... in the afternoon... in the evening...) adds precision. These phrases are your scaffolding!",
            example: "**COMPREHENSIVE DAILY ROUTINE VOCABULARY - 200+ WORDS**\n\n═══════════════════════════════════════════════════════════\n**PART 1: MORNING ROUTINE (Der Morgen) - 50 Verbs/Phrases**\n═══════════════════════════════════════════════════════════\n\n| **German Verb** | **English** | **Perfekt Form** | **Example Sentence** |\n|-----------------|-------------|------------------|----------------------|\n| aufwachen (sep) | to wake up | bin aufgewacht | Ich bin um 6:30 Uhr aufgewacht. |\n| der Wecker klingelt | alarm rings | hat geklingelt | Der Wecker hat um 7 Uhr geklingelt. |\n| aufstehen (sep) | to get up | bin aufgestanden | Ich bin sofort aufgestanden. |\n| verschlafen (sep)* | to oversleep | habe verschlafen | Oh nein! Ich habe verschlafen! |\n| sich strecken | to stretch | habe mich gestreckt | Ich habe mich kurz gestreckt. |\n| das Bett machen | to make bed | habe gemacht | Ich habe mein Bett gemacht. |\n| ins Bad gehen | go to bathroom | bin gegangen | Ich bin ins Bad gegangen. |\n| sich waschen | to wash oneself | habe mich gewaschen | Ich habe mir das Gesicht gewaschen. |\n| sich duschen | to shower | habe mich geduscht | Ich habe mich 10 Minuten geduscht. |\n| baden | to bathe | habe gebadet | Ich habe ein warmes Bad genommen. |\n| sich die Zähne putzen | to brush teeth | habe geputzt | Ich habe mir die Zähne geputzt. |\n| sich rasieren | to shave | habe mich rasiert | Er hat sich rasiert. |\n| sich schminken | to put on makeup | habe mich geschminkt | Sie hat sich geschminkt. |\n| sich kämmen | to comb hair | habe mich gekämmt | Ich habe mir die Haare gekämmt. |\n| sich die Haare föhnen | to blow-dry hair | habe geföhnt | Sie hat sich die Haare geföhnt. |\n| sich anziehen (sep) | to get dressed | habe mich angezogen | Ich habe mich schnell angezogen. |\n| sich umziehen (sep) | to change clothes | habe mich umgezogen | Ich habe mich umgezogen. |\n| etwas anziehen (sep) | to put sth on | habe angezogen | Ich habe eine Jeans angezogen. |\n| anprobieren (sep) | to try on | habe anprobiert | Ich habe drei Hemden anprobiert. |\n| in den Spiegel schauen | to look in mirror | habe geschaut | Ich habe in den Spiegel geschaut. |\n\n**Breakfast Vocabulary (Das Frühstück):**\n\n| **German** | **English** | **Perfekt** | **Example** |\n|------------|-------------|-------------|--------------|\n| frühstücken | to have breakfast | habe gefrühstückt | Ich habe um 7:30 gefrühstückt. |\n| Kaffee kochen | to make coffee | habe gekocht | Ich habe Kaffee gekocht. |\n| Tee zubereiten (sep) | to prepare tea | habe zubereitet | Ich habe grünen Tee zubereitet. |\n| Toast machen | to make toast | habe gemacht | Ich habe Toast mit Marmelade gemacht. |\n| Müsli essen | to eat cereal | habe gegessen | Ich habe Müsli mit Joghurt gegessen. |\n| ein Ei kochen | to boil an egg | habe gekocht | Ich habe ein Ei gekocht. |\n| Brötchen holen (sep) | to get rolls | habe geholt | Ich habe frische Brötchen geholt. |\n| den Tisch decken | to set table | habe gedeckt | Ich habe den Tisch gedeckt. |\n| Zeitung lesen | to read newspaper | habe gelesen | Mein Vater hat die Zeitung gelesen. |\n| Radio hören | to listen to radio | habe gehört | Ich habe Radio gehört. |\n| Nachrichten sehen (sep) | to watch news | habe gesehen | Ich habe die Nachrichten gesehen. |\n| sich beeilen | to hurry | habe mich beeilt | Ich habe mich beeilt. |\n| losfahren (sep) | to leave/depart | bin losgefahren | Ich bin um 8 Uhr losgefahren. |\n| zur Arbeit fahren | to go to work | bin gefahren | Ich bin mit dem Auto zur Arbeit gefahren. |\n| zur Uni gehen | to go to university | bin gegangen | Ich bin zur Uni gegangen. |\n| den Bus nehmen | to take the bus | habe genommen | Ich habe den Bus genommen. |\n| die U-Bahn nehmen | to take the subway | habe genommen | Ich habe die U-Bahn genommen. |\n| zu Fuß gehen | to walk/go on foot | bin gegangen | Ich bin zu Fuß gegangen. |\n| mit dem Fahrrad fahren | to bike | bin gefahren | Ich bin mit dem Fahrrad gefahren. |\n| im Stau stehen | to be stuck in traffic | habe gestanden | Ich habe 30 Minuten im Stau gestanden. |\n\n*Note: 'verschlafen' is inseparable despite the prefix! No 'ge-' in Perfekt.\n\n═══════════════════════════════════════════════════════════\n**PART 2: DAYTIME ACTIVITIES (Der Tag) - 60 Verbs/Phrases**\n═══════════════════════════════════════════════════════════\n\n**Work/School Activities:**\n\n| **German** | **English** | **Perfekt** | **Example** |\n|------------|-------------|-------------|--------------|\n| arbeiten | to work | habe gearbeitet | Ich habe 8 Stunden gearbeitet. |\n| im Büro sein | to be at office | bin gewesen | Ich bin den ganzen Tag im Büro gewesen. |\n| einen Termin haben | to have appointment | habe gehabt | Ich habe einen wichtigen Termin gehabt. |\n| eine Besprechung haben | to have meeting | habe gehabt | Wir haben eine Besprechung gehabt. |\n| telefonieren | to make calls | habe telefoniert | Ich habe viel telefoniert. |\n| E-Mails schreiben | to write emails | habe geschrieben | Ich habe 20 E-Mails geschrieben. |\n| am Computer arbeiten | to work at computer | habe gearbeitet | Ich habe am Computer gearbeitet. |\n| ein Projekt fertigstellen (sep) | to complete project | habe fertiggestellt | Ich habe das Projekt fertiggestellt. |\n| Unterricht haben | to have class | habe gehabt | Ich habe 3 Stunden Unterricht gehabt. |\n| eine Vorlesung besuchen | to attend lecture | habe besucht | Ich habe eine Vorlesung besucht. |\n| Notizen machen | to take notes | habe gemacht | Ich habe viele Notizen gemacht. |\n| lernen | to study | habe gelernt | Ich habe für die Prüfung gelernt. |\n| eine Pause machen | to take a break | habe gemacht | Ich habe um 10 Uhr eine Pause gemacht. |\n| Kaffee trinken | to drink coffee | habe getrunken | Ich habe einen Kaffee getrunken. |\n| mit Kollegen plaudern | to chat with colleagues | habe geplaudert | Ich habe mit Kollegen geplaudert. |\n\n**Lunch & Afternoon:**\n\n| **German** | **English** | **Perfekt** | **Example** |\n|------------|-------------|-------------|--------------|\n| zu Mittag essen | to have lunch | habe gegessen | Ich habe um 12:30 zu Mittag gegessen. |\n| in der Mensa essen | to eat in cafeteria | habe gegessen | Ich habe in der Mensa gegessen. |\n| in die Kantine gehen | to go to canteen | bin gegangen | Ich bin in die Kantine gegangen. |\n| auswärts essen | to eat out | habe gegessen | Ich habe auswärts gegessen. |\n| etwas bestellen | to order something | habe bestellt | Ich habe eine Pizza bestellt. |\n| Essen abholen (sep) | to pick up food | habe abgeholt | Ich habe Essen zum Mitnehmen abgeholt. |\n| einen Spaziergang machen | to take a walk | habe gemacht | Ich habe einen Spaziergang gemacht. |\n| Besorgungen machen | to run errands | habe gemacht | Ich habe Besorgungen gemacht. |\n| einkaufen (sep) | to shop | habe eingekauft | Ich habe im Supermarkt eingekauft. |\n| zur Post gehen | to go to post office | bin gegangen | Ich bin zur Post gegangen. |\n| zur Bank gehen | to go to bank | bin gegangen | Ich bin zur Bank gegangen. |\n| Termine erledigen | to handle appointments | habe erledigt | Ich habe wichtige Termine erledigt. |\n| jemanden treffen | to meet someone | habe getroffen | Ich habe einen Freund getroffen. |\n| sich verabreden | to make plans/date | habe mich verabredet | Ich habe mich mit Anna verabredet. |\n| Freunde besuchen | to visit friends | habe besucht | Ich habe meine Freunde besucht. |\n\n**Afternoon Activities:**\n\n| **German** | **English** | **Perfekt** | **Example** |\n|------------|-------------|-------------|--------------|\n| nach Hause kommen (sep) | to come home | bin gekommen | Ich bin um 17 Uhr nach Hause gekommen. |\n| sich umziehen (sep) | to change clothes | habe mich umgezogen | Ich habe mich umgezogen. |\n| sich ausruhen (sep) | to rest | habe mich ausgeruht | Ich habe mich ausgeruht. |\n| sich hinlegen (sep) | to lie down | habe mich hingelegt | Ich habe mich kurz hingelegt. |\n| ein Nickerchen machen | to take a nap | habe gemacht | Ich habe ein Nickerchen gemacht. |\n| Sport treiben | to do sports | habe getrieben | Ich habe Sport getrieben. |\n| joggen gehen | to go jogging | bin gegangen | Ich bin joggen gegangen. |\n| ins Fitnessstudio gehen | to go to gym | bin gegangen | Ich bin ins Fitnessstudio gegangen. |\n| schwimmen gehen | to go swimming | bin gegangen | Ich bin schwimmen gegangen. |\n| Yoga machen | to do yoga | habe gemacht | Ich habe Yoga gemacht. |\n| spazieren gehen | to go for walk | bin gegangen | Ich bin mit dem Hund spazieren gegangen. |\n| Hausaufgaben machen | to do homework | habe gemacht | Ich habe meine Hausaufgaben gemacht. |\n| lernen | to study | habe gelernt | Ich habe 2 Stunden gelernt. |\n| ein Buch lesen | to read a book | habe gelesen | Ich habe ein Buch gelesen. |\n| Musik hören | to listen to music | habe gehört | Ich habe Musik gehört. |\n| Klavier spielen | to play piano | habe gespielt | Ich habe Klavier gespielt. |\n| im Internet surfen | to surf internet | habe gesurft | Ich habe im Internet gesurft. |\n| Social Media checken | to check social media | habe gecheckt | Ich habe Instagram gecheckt. |\n| mit Freunden chatten | to chat with friends | habe gechattet | Ich habe mit Freunden gechattet. |\n| ein Hobby ausüben (sep) | to do a hobby | habe ausgeübt | Ich habe mein Hobby ausgeübt. |\n\n═══════════════════════════════════════════════════════════\n**PART 3: EVENING ROUTINE (Der Abend) - 40 Verbs/Phrases**\n═══════════════════════════════════════════════════════════\n\n**Cooking & Dinner:**\n\n| **German** | **English** | **Perfekt** | **Example** |\n|------------|-------------|-------------|--------------|\n| das Abendessen vorbereiten (sep) | to prepare dinner | habe vorbereitet | Ich habe das Abendessen vorbereitet. |\n| kochen | to cook | habe gekocht | Ich habe Spaghetti gekocht. |\n| braten | to fry/roast | habe gebraten | Ich habe Fleisch gebraten. |\n| backen | to bake | habe gebacken | Ich habe einen Kuchen gebacken. |\n| den Tisch decken | to set table | habe gedeckt | Ich habe den Tisch gedeckt. |\n| zu Abend essen | to have dinner | habe gegessen | Wir haben um 19 Uhr zu Abend gegessen. |\n| zusammen essen | to eat together | haben gegessen | Die Familie hat zusammen gegessen. |\n| abspülen (sep) | to wash dishes | habe abgespült | Ich habe das Geschirr abgespült. |\n| abwaschen (sep) | to wash up | habe abgewaschen | Ich habe abgewaschen. |\n| die Spülmaschine einräumen (sep) | to load dishwasher | habe eingeräumt | Ich habe die Spülmaschine eingeräumt. |\n| den Tisch abräumen (sep) | to clear table | habe abgeräumt | Ich habe den Tisch abgeräumt. |\n| die Küche aufräumen (sep) | to tidy kitchen | habe aufgeräumt | Ich habe die Küche aufgeräumt. |\n\n**Evening Activities:**\n\n| **German** | **English** | **Perfekt** | **Example** |\n|------------|-------------|-------------|--------------|\n| fernsehen (sep) | to watch TV | habe ferngesehen | Ich habe ferngesehen. |\n| einen Film schauen | to watch a movie | habe geschaut | Ich habe einen Film geschaut. |\n| eine Serie gucken | to watch a series | habe geguckt | Ich habe eine Serie geguckt. |\n| Netflix schauen | to watch Netflix | habe geschaut | Ich habe Netflix geschaut. |\n| Nachrichten sehen (sep) | to watch news | habe gesehen | Ich habe die Nachrichten gesehen. |\n| sich unterhalten | to converse | habe mich unterhalten | Ich habe mich mit meiner Familie unterhalten. |\n| telefonieren | to call | habe telefoniert | Ich habe mit meiner Mutter telefoniert. |\n| Videoanrufe machen | to video call | habe gemacht | Ich habe einen Videoanruf gemacht. |\n| Freunde treffen | to meet friends | habe getroffen | Ich habe Freunde getroffen. |\n| ausgehen (sep) | to go out | bin ausgegangen | Ich bin ausgegangen. |\n| ins Kino gehen | to go to cinema | bin gegangen | Ich bin ins Kino gegangen. |\n| ins Restaurant gehen | to go to restaurant | bin gegangen | Wir sind ins Restaurant gegangen. |\n| in eine Bar gehen | to go to a bar | bin gegangen | Wir sind in eine Bar gegangen. |\n| tanzen gehen | to go dancing | bin gegangen | Wir sind tanzen gegangen. |\n| zu Hause bleiben | to stay home | bin geblieben | Ich bin zu Hause geblieben. |\n| entspannen | to relax | habe entspannt | Ich habe entspannt. |\n| ein Bad nehmen | to take a bath | habe genommen | Ich habe ein warmes Bad genommen. |\n| meditieren | to meditate | habe meditiert | Ich habe 15 Minuten meditiert. |\n\n═══════════════════════════════════════════════════════════\n**PART 4: NIGHT ROUTINE (Die Nacht) - 25 Verbs/Phrases**\n═══════════════════════════════════════════════════════════\n\n| **German** | **English** | **Perfekt** | **Example** |\n|------------|-------------|-------------|--------------|\n| sich fertigmachen (sep) | to get ready (for bed) | habe mich fertiggemacht | Ich habe mich fürs Bett fertiggemacht. |\n| sich umziehen (sep) | to change | habe mich umgezogen | Ich habe mich umgezogen. |\n| den Schlafanzug anziehen (sep) | to put on pyjamas | habe angezogen | Ich habe meinen Schlafanzug angezogen. |\n| sich abschminken (sep) | to remove makeup | habe mich abgeschminkt | Sie hat sich abgeschminkt. |\n| sich die Zähne putzen | to brush teeth | habe geputzt | Ich habe mir die Zähne geputzt. |\n| sich waschen | to wash | habe mich gewaschen | Ich habe mir das Gesicht gewaschen. |\n| das Licht ausmachen (sep) | to turn off light | habe ausgemacht | Ich habe das Licht ausgemacht. |\n| den Wecker stellen | to set alarm | habe gestellt | Ich habe den Wecker auf 7 Uhr gestellt. |\n| das Handy aufladen (sep) | to charge phone | habe aufgeladen | Ich habe mein Handy aufgeladen. |\n| die Tür abschließen (sep) | to lock door | habe abgeschlossen | Ich habe die Tür abgeschlossen. |\n| ins Bett gehen | to go to bed | bin gegangen | Ich bin um 23 Uhr ins Bett gegangen. |\n| sich hinlegen (sep) | to lie down | habe mich hingelegt | Ich habe mich hingelegt. |\n| lesen | to read | habe gelesen | Ich habe noch 20 Minuten gelesen. |\n| ein Buch lesen | to read a book | habe gelesen | Ich habe ein Buch gelesen. |\n| ein Hörbuch hören | to listen to audiobook | habe gehört | Ich habe ein Hörbuch gehört. |\n| einen Podcast hören | to listen to podcast | habe gehört | Ich habe einen Podcast gehört. |\n| schlafen | to sleep | habe geschlafen | Ich habe gut geschlafen. |\n| einschlafen (sep) | to fall asleep | bin eingeschlafen | Ich bin schnell eingeschlafen. |\n| träumen | to dream | habe geträumt | Ich habe von Urlaub geträumt. |\n| schnarchen | to snore | habe geschnarcht | Mein Mann hat geschnarcht. |\n| aufwachen (sep) | to wake up (middle of night) | bin aufgewacht | Ich bin nachts aufgewacht. |\n| nicht schlafen können | can't sleep | habe nicht schlafen können | Ich habe nicht schlafen können. |\n| schlaflos sein | to be sleepless | bin gewesen | Ich bin die ganze Nacht schlaflos gewesen. |\n\n═══════════════════════════════════════════════════════════\n**PART 5: TIME EXPRESSIONS - THE COMPLETE TOOLKIT (80+ Phrases)**\n═══════════════════════════════════════════════════════════\n\n**A) SPECIFIC TIME MARKERS:**\n\n**Past Time (Vergangenheit):**\n- **gestern** (yesterday)\n- **vorgestern** (day before yesterday)\n- **gestern Morgen/Mittag/Abend** (yesterday morning/noon/evening)\n- **letzte Woche** (last week)\n- **letztes Wochenende** (last weekend)\n- **letzten Monat** (last month)\n- **letztes Jahr** (last year)\n- **letzte Nacht** (last night)\n- **vor zwei Tagen** (two days ago)\n- **vor einer Woche** (a week ago)\n- **vor einem Monat** (a month ago)\n- **neulich** (recently, the other day)\n- **kürzlich** (recently)\n- **früher** (earlier, in the past)\n- **damals** (back then, at that time)\n- **als Kind** (as a child)\n- **vor Kurzem** (recently)\n\n**Present Time (Gegenwart):**\n- **heute** (today)\n- **heute Morgen** (this morning)\n- **heute Mittag** (this noon)\n- **heute Abend** (this evening)\n- **heute Nacht** (tonight)\n- **gerade** (just now, right now)\n- **jetzt** (now)\n- **im Moment** (at the moment)\n- **zurzeit** (currently)\n- **momentan** (at present)\n- **heutzutage** (nowadays)\n\n**Future Time (Zukunft):**\n- **morgen** (tomorrow)\n- **übermorgen** (day after tomorrow)\n- **morgen früh** (tomorrow morning)\n- **nächste Woche** (next week)\n- **nächstes Wochenende** (next weekend)\n- **nächsten Monat** (next month)\n- **nächstes Jahr** (next year)\n- **bald** (soon)\n- **später** (later)\n- **demnächst** (shortly, soon)\n- **in Zukunft** (in the future)\n- **in zwei Tagen** (in two days)\n- **in einer Woche** (in a week)\n\n**B) CLOCK TIME (Uhrzeit):**\n\n**Exact Times:**\n- **um 7 Uhr** (at 7 o'clock)\n- **um halb acht** (at 7:30) ← TRICKY! 'halb acht' = half to 8 = 7:30!\n- **um Viertel nach sieben** (at 7:15)\n- **um Viertel vor acht** (at 7:45)\n- **um 7:20 Uhr** (at 7:20) - can say numbers directly\n- **um Punkt 9 Uhr** (at exactly 9 o'clock)\n- **gegen 8 Uhr** (around 8 o'clock)\n- **zwischen 7 und 8 Uhr** (between 7 and 8 o'clock)\n- **ab 9 Uhr** (from 9 o'clock onwards)\n- **bis 17 Uhr** (until 5 PM)\n- **von 9 bis 17 Uhr** (from 9 to 5)\n\n**C) PARTS OF THE DAY (Tageszeiten):**\n\n**With Articles (NO preposition needed!):**\n- **am Morgen** (in the morning)\n- **am Vormittag** (in the late morning)\n- **am Mittag** (at noon)\n- **am Nachmittag** (in the afternoon)\n- **am Abend** (in the evening)\n- **in der Nacht** (at night) ← exception: 'in der'!\n\n**Without Articles (for describing when something happened):**\n- **morgens** (in the mornings - habitual)\n- **vormittags** (in the late mornings)\n- **mittags** (at noon - habitual)\n- **nachmittags** (in the afternoons)\n- **abends** (in the evenings)\n- **nachts** (at nights)\n\n**Example Comparison:**\n- 'Am Morgen habe ich gefrühstückt.' (This morning I had breakfast.) ← specific\n- 'Morgens frühstücke ich immer.' (In the mornings I always have breakfast.) ← habitual\n\n**D) FREQUENCY ADVERBS (Häufigkeitsadverbien):**\n\n**Always → Never Scale:**\n1. **immer** (always) - 100%\n2. **fast immer** (almost always) - 95%\n3. **meistens** (mostly) - 80%\n4. **häufig** (frequently) - 75%\n5. **oft** (often) - 70%\n6. **manchmal** (sometimes) - 50%\n7. **ab und zu** (now and then) - 40%\n8. **gelegentlich** (occasionally) - 30%\n9. **selten** (seldom/rarely) - 20%\n10. **fast nie** (almost never) - 5%\n11. **nie/niemals** (never) - 0%\n\n**PLACEMENT RULES (CRUCIAL!):**\n- **Position 1:** After conjugated verb in yes/no questions:\n  - 'Gehst du **oft** ins Kino?' (Do you often go to the cinema?)\n\n- **Position 2:** After subject in statements (before main verb):\n  - 'Ich gehe **manchmal** joggen.' (I sometimes go jogging.)\n\n- **Position 3:** In subordinate clauses, before the verb at the end:\n  - '...weil ich **selten** Zeit habe.' (...because I rarely have time.)\n\n**E) SEQUENCE WORDS (Reihenfolge) - Story Structure:**\n\n**First/Then/Finally:**\n1. **zuerst** (first)\n2. **zunächst** (first of all)\n3. **am Anfang** (at the beginning)\n4. **dann** (then)\n5. **danach** (after that)\n6. **anschließend** (subsequently)\n7. **später** (later)\n8. **nachher** (afterwards)\n9. **daraufhin** (thereupon)\n10. **schließlich** (finally)\n11. **zum Schluss** (at the end)\n12. **am Ende** (in the end)\n13. **zuletzt** (lastly)\n\n**Adding More Information:**\n- **außerdem** (besides, moreover)\n- **zusätzlich** (additionally)\n- **auch** (also)\n- **ebenfalls** (likewise)\n- **darüber hinaus** (furthermore)\n\n**F) DURATION (Dauer) - How Long:**\n\n**Accusative for Time Duration (no preposition!):**\n- **einen Tag** (for one day) - 'Ich habe **einen Tag** geschlafen.'\n- **zwei Stunden** (for two hours) - 'Ich habe **zwei Stunden** gelernt.'\n- **eine Woche** (for a week) - 'Ich war **eine Woche** krank.'\n- **den ganzen Tag** (all day long) - 'Ich habe **den ganzen Tag** gearbeitet.'\n- **die ganze Nacht** (all night) - 'Ich habe **die ganze Nacht** nicht geschlafen.'\n\n**With 'seit' (for/since) - Present Perfect in English, but PRESENT in German!:**\n- **seit drei Wochen** (for three weeks) - 'Ich lerne **seit drei Wochen** Deutsch.'\n- **seit 2020** (since 2020) - 'Ich wohne **seit 2020** in Berlin.'\n- **seit gestern** (since yesterday) - 'Er ist **seit gestern** krank.'\n\n**G) DAYS OF THE WEEK (Wochentage) + USAGE:**\n\n**Basic Days:**\n- Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag/Sonnabend, Sonntag\n\n**'Am' for Specific Day:**\n- **am Montag** (on Monday - this Monday)\n- **am Dienstag** (on Tuesday)\n- **am Wochenende** (on the weekend)\n\n**No Preposition for Habitual:**\n- **montags** (on Mondays - every Monday)\n- **dienstags** (on Tuesdays)\n- **wochentags** (on weekdays)\n- **am Wochenende** (on weekends - habitual)\n\nExample: 'Am Montag bin ich zum Arzt gegangen.' (On Monday I went to the doctor.) ← specific\nExample: 'Montags gehe ich immer joggen.' (On Mondays I always go jogging.) ← habitual\n\n═══════════════════════════════════════════════════════════\n**PART 6: COMPLETE DAILY ROUTINE EXAMPLES (Sample Stories)**\n═══════════════════════════════════════════════════════════\n\n**EXAMPLE 1: Typical Workday (Normaler Arbeitstag)**\n\n'Gestern war ein ganz normaler Arbeitstag. **Zuerst** bin ich um 6:30 Uhr aufgewacht, weil mein Wecker geklingelt hat. Ich bin sofort aufgestanden und ins Bad gegangen. Dort habe ich mich geduscht, die Zähne geputzt und angezogen.\n\n**Dann** bin ich in die Küche gegangen und habe gefrühstückt. Ich habe Kaffee gekocht und Toast mit Marmelade gegessen. **Dabei** habe ich die Nachrichten im Radio gehört.\n\n**Um 7:30 Uhr** bin ich zur Arbeit gefahren. Ich habe den Bus genommen und war nach 30 Minuten im Büro. **Dort** habe ich zuerst meine E-Mails gecheckt und dann an einem Projekt gearbeitet.\n\n**Gegen 12 Uhr** habe ich Mittagspause gemacht. Ich bin mit Kollegen in die Kantine gegangen und wir haben zusammen gegessen. **Nach der Pause** habe ich noch 4 Stunden gearbeitet.\n\n**Um 17 Uhr** habe ich Feierabend gemacht und bin nach Hause gefahren. **Zu Hause** habe ich mich umgezogen und eine halbe Stunde ausgeruht. **Danach** habe ich das Abendessen vorbereitet. Ich habe Spaghetti gekocht.\n\n**Am Abend** habe ich ein bisschen ferngesehen und dann noch für eine Prüfung gelernt. **Um 23 Uhr** bin ich ins Bett gegangen und habe noch 20 Minuten gelesen. **Schließlich** bin ich eingeschlafen.'\n\n**Word Count:** 180 words\n**Separable Verbs Used:** aufwachen, aufstehen, anziehen\n**Time Expressions Used:** 15+\n**Structure:** Clear beginning → middle → end\n\n**EXAMPLE 2: Weekend Day (Wochenendtag)**\n\n'Letztes Wochenende hatte ich einen entspannten Samstag. **Anders als sonst** bin ich erst um 9 Uhr aufgewacht. **Zuerst** bin ich im Bett geblieben und habe noch eine Stunde gelesen.\n\n**Gegen 10 Uhr** bin ich aufgestanden und habe ausgiebig gefrühstückt. Ich habe Brötchen geholt, Eier gekocht und frischen Orangensaft gemacht. **Während des Frühstücks** habe ich Musik gehört.\n\n**Am Vormittag** bin ich joggen gegangen. Ich bin eine Stunde im Park gelaufen. **Danach** bin ich nach Hause gekommen und habe mich geduscht.\n\n**Um 13 Uhr** habe ich eine Freundin getroffen. Wir sind zusammen ins Café gegangen und haben geplaudert. **Später** haben wir einen Stadtbummel gemacht und ich habe ein neues Buch gekauft.\n\n**Am Nachmittag** bin ich nach Hause zurückgekommen und habe die Wohnung aufgeräumt. Ich habe Wäsche gewaschen, Staub gesaugt und das Badezimmer geputzt.\n\n**Abends** habe ich für Freunde gekocht. Wir haben zusammen gegessen, Wein getrunken und viel gelacht. **Um Mitternacht** sind alle nach Hause gegangen.\n\n**Zum Schluss** bin ich todmüde ins Bett gefallen und sofort eingeschlafen. Es war ein schöner Tag!'\n\n**Word Count:** 160 words\n**SEIN verbs:** aufwachen, aufstehen, joggen gegangen, gelaufen, nach Hause gekommen, ins Café gegangen, zurückgekommen, nach Hause gegangen, ins Bett gefallen, eingeschlafen\n**Structure:** Time markers every 2-3 sentences for clarity\n\n**EXAMPLE 3: Busy Student Day (Stressiger Unitag)**\n\n'Vorgestern hatte ich einen stressigen Tag an der Uni. **Leider** habe ich verschlafen! Der Wecker hat nicht geklingelt. Ich bin erst um 8 Uhr aufgewacht, aber meine Vorlesung hat um 8:30 begonnen!\n\n**Deshalb** habe ich mich total beeilt. Ich habe mir schnell das Gesicht gewaschen, die Zähne geputzt und mich angezogen. Frühstück? Keine Zeit! Ich habe nur einen Kaffee to go mitgenommen.\n\n**Um 8:20** bin ich zur Uni gerannt. Ich bin mit dem Fahrrad gefahren und war nach 15 Minuten da. **Zum Glück** habe ich die Vorlesung nicht verpasst! Ich bin pünktlich angekommen.\n\n**Von 8:30 bis 12 Uhr** habe ich Unterricht gehabt. Zuerst Mathematik, dann Physik. Ich habe viele Notizen gemacht. **In der Mittagspause** habe ich in der Mensa gegessen.\n\n**Am Nachmittag** bin ich in die Bibliothek gegangen und habe für eine Klausur gelernt. Ich habe 4 Stunden durchgelernt!\n\n**Um 18 Uhr** bin ich total erschöpft nach Hause gekommen. Ich habe mir eine Pizza bestellt, weil ich zu müde zum Kochen war. **Den restlichen Abend** habe ich auf dem Sofa verbracht und Netflix geschaut.\n\n**Um 22 Uhr** bin ich ins Bett gegangen. Morgen stelle ich zwei Wecker!'\n\n**Word Count:** 175 words\n**Emotions Expressed:** Stress, relief, exhaustion\n**Separable Verbs:** verschlafen, aufgewacht, mitgenommen, angekommen, durchgelernt, nach Hause gekommen, verbracht\n\n═══════════════════════════════════════════════════════════\n**PART 7: BONUS - HOUSEHOLD CHORES (Hausarbeit) - 30 Verbs**\n═══════════════════════════════════════════════════════════\n\nThese often appear in Speaking Teil 2 presentations about daily life!\n\n| **German** | **English** | **Perfekt** | **Example** |\n|------------|-------------|-------------|--------------|\n| aufräumen (sep) | to tidy up | habe aufgeräumt | Ich habe mein Zimmer aufgeräumt. |\n| putzen | to clean | habe geputzt | Ich habe das Bad geputzt. |\n| staubsaugen | to vacuum | habe gestaubsaugt | Ich habe die Wohnung gestaubsaugt. |\n| wischen | to mop | habe gewischt | Ich habe den Boden gewischt. |\n| Staub wischen | to dust | habe gewischt | Ich habe Staub gewischt. |\n| Wäsche waschen | to do laundry | habe gewaschen | Ich habe Wäsche gewaschen. |\n| bügeln | to iron | habe gebügelt | Ich habe Hemden gebügelt. |\n| Wäsche aufhängen (sep) | to hang laundry | habe aufgehängt | Ich habe die Wäsche aufgehängt. |\n| Wäsche abhängen (sep) | to take down laundry | habe abgehängt | Ich habe die Wäsche abgehängt. |\n| zusammenlegen (sep) | to fold | habe zusammengelegt | Ich habe die Wäsche zusammengelegt. |\n| Fenster putzen | to clean windows | habe geputzt | Ich habe die Fenster geputzt. |\n| den Müll rausbringen (sep) | to take out trash | habe rausgebracht | Ich habe den Müll rausgebracht. |\n| Blumen gießen | to water plants | habe gegossen | Ich habe die Blumen gegossen. |\n| das Bett machen | to make the bed | habe gemacht | Ich habe das Bett gemacht. |\n| einkaufen (sep) | to grocery shop | habe eingekauft | Ich habe eingekauft. |\n\n═══════════════════════════════════════════════════════════\n**EXAM APPLICATION: How to Use This Vocabulary**\n═══════════════════════════════════════════════════════════\n\n**WRITING TEIL 1 - Typical Prompts:**\n\n**Prompt Type 1:** 'Was hast du letztes Wochenende gemacht?'\n→ Use SEIN verbs (gegangen, gefahren) + haben verbs (gegessen, gemacht)\n→ Structure: Samstag morgen... Samstag nachmittag... Sonntag...\n→ Min. 80 words = 10-12 sentences with time markers\n\n**Prompt Type 2:** 'Beschreibe deinen gestrigen Tag.'\n→ Chronological order: morgens → mittags → abends → nachts\n→ Mix separable verbs (aufgestanden, ferngesehen, eingeschlafen)\n→ Add frequency: 'wie immer', 'wie jeden Tag'\n\n**Prompt Type 3:** 'Was machst du normalerweise nach der Arbeit?'\n→ Use PRESENT tense with frequency adverbs!\n→ 'Normalerweise komme ich um 18 Uhr nach Hause. **Meistens** koche ich dann...'\n\n**SPEAKING TEIL 2 - Presentation Topics:**\n\nCommon topics requiring daily routine vocab:\n1. **'Mein typischer Tag'** (My typical day) - use everything!\n2. **'Wie ich mich entspanne'** (How I relax) - evening activities\n3. **'Sport und Fitness in meinem Leben'** (Sports in my life) - afternoon activities\n4. **'Mein Wochenende'** (My weekend) - leisure verbs\n5. **'Hausarbeit'** (Housework) - chores vocabulary\n\n**Structure for Speaking:**\n- **Einleitung:** 'Ich möchte über... sprechen.'\n- **Hauptteil:** Use sequence words (zuerst, dann, danach, schließlich)\n- **Schluss:** 'Zusammenfassend kann ich sagen...'\n\n**SPEAKING TEIL 3 - Discussion Topics:**\n\nExaminer might ask:\n- 'Wann stehen die Deutschen normalerweise auf?'\n- 'Unterscheidet sich Ihr Alltag vom Wochenende?'\n- 'Haben Sie genug Freizeit?'\n- 'Was machen junge Leute heute anders als früher?'\n\n→ Answer with: 'Meiner Meinung nach...' + frequency adverbs + examples from daily routine vocabulary",
            tips: "**TOP 12 MEMORIZATION & APPLICATION STRATEGIES:**\n\n**1. The 'Build Your Day' Method (Construction Approach):**\nDon't memorize random verbs! Build your ACTUAL daily routine in German:\n- Write down YOUR real schedule: 7:00 aufstehen, 7:30 duschen, 8:00 frühstücken, etc.\n- Translate each action into German\n- Record yourself saying it out loud\n- By Week 3, you'll describe your day WITHOUT thinking!\n\n**Why it works:** Personal = memorable. Your brain connects words to actual experiences!\n\n**2. The 'Separable Verb Color-Code' Trick:**\nSeparable verbs are exam darlings! Highlight them:\n- Write prefix in RED: **AUF**stehen, **EIN**kaufen, **FERN**sehen\n- Write stem in BLUE: auf**STEHEN**, ein**KAUFEN**, fern**SEHEN**\n- In sentences, draw arrow: 'Ich stehe → AUF' to show prefix flying to end\n\nVisual learners: this makes word order CRYSTAL CLEAR!\n\n**3. The '5-5-5 Morning Drill' (5 Minutes to Fluency):**\nEvery morning while getting ready:\n- **Minutes 1-2:** Narrate what you're doing RIGHT NOW in German:\n  'Ich stehe auf. Ich gehe ins Bad. Ich dusche mich.'\n- **Minutes 3-4:** Describe what you DID yesterday in Perfekt:\n  'Gestern bin ich um 7 aufgestanden. Ich habe mich geduscht.'\n- **Minute 5:** Say what you WILL do today:\n  'Heute werde ich um 8 Uhr frühstücken.'\n\n**Result:** After 21 days, daily routine vocabulary becomes AUTOMATIC!\n\n**4. Frequency Adverbs - The Placement Song:**\nSing this to any tune to remember placement:\n- 'After the verb in QUESTIONS (Gehst du oft?),\n  After the subject in STATEMENTS (Ich gehe oft),\n  Before the verb when SUBORDINATE (weil ich oft gehe),\n  This is the rule, don't forget!'\n\nMake it silly - silly sticks!\n\n**5. Time Expressions - The 'Sticky Note Takeover':**\nPhysical memory hack:\n- Put 'morgens' sticky note on your mirror (you see it every morning)\n- Put 'abends' note on your TV remote (you watch TV in evening)\n- Put 'nachts' note on your bedside table\n- Put 'mittags' note on your lunch box\n\nYour brain will associate the WORD with the TIME automatically!\n\n**6. The 'Weekend Story' Writing Challenge:**\nEvery Monday morning (5-10 minutes):\n- Write what you did Saturday & Sunday in past tense\n- Use minimum 10 time expressions\n- Use minimum 5 separable verbs\n- Use minimum 3 SEIN verbs (movement/state change)\n- Keep a journal - by Week 4, compare your first entry to your latest!\n\n**Progress tracker:** You'll SEE your vocabulary exploding!\n\n**7. Reflexive Verbs - The Mirror Method:**\nReflexive verbs (sich duschen, sich anziehen) can confuse.\nStand in front of mirror and:\n- Point at yourself and say: 'Ich dusche **MICH**' (I shower myself)\n- Point at mirror reflection: 'Du duschst **DICH**' (You shower yourself)\n- Physical action + speaking = brain connection!\n\nDo this for 10 verbs daily!\n\n**8. The 'halb' Time Trap - Memory Trick:**\nGermans say 'halb acht' (half eight) but mean 7:30 (half TO eight, not half PAST)!\n\n**Memory trick:** Think 'half-way TO 8' = 7:30\n- halb sieben = 6:30 (halfway to 7)\n- halb neun = 8:30 (halfway to 9)\n- halb zwölf = 11:30 (halfway to 12)\n\n**Practice:** Set phone alarms with German labels: 'halb acht Alarm'\n\n**9. Sequence Words - The Story Skeleton:**\nBefore writing ANY email or giving ANY presentation:\n1. Write these words on paper: **zuerst, dann, danach, schließlich**\n2. Fill in one sentence after each word\n3. You now have a perfectly structured story!\n\nExample skeleton:\n- Zuerst: [What you did first]\n- Dann: [What you did next]\n- Danach: [What you did after]\n- Schließlich: [What you did finally]\n\n**No more writer's block!**\n\n**10. Speaking Practice - The 'Radio DJ' Method:**\nPretend you're a radio DJ narrating your day:\n- Speak with enthusiasm: 'Und jetzt, um 8 Uhr, trinke ich meinen Kaffee!'\n- Use transitions: 'Aber was passiert dann? Dann gehe ich zur Arbeit!'\n- Record yourself on phone\n- Listen back - you'll catch your own mistakes!\n\n**Confidence booster:** You'll sound fluent by Week 3!\n\n**11. Exam Strategy - The 'Point-by-Point Email Formula':**\nFor Writing Teil 1, NEVER wing it! Use this formula:\n\n**BEFORE writing:**\n1. Read all 4 Leitpunkte (bullet points)\n2. Number them 1-4 in margin\n3. Write ONE key verb for each point\n4. Check: Do I need past tense (gestern, letztes Wochenende)?\n\n**WHILE writing:**\n- Write (1), (2), (3), (4) next to each paragraph\n- Use 2-3 sentences per point\n- Start each point with a time expression: 'Am Samstag...', 'Dann...', 'Außerdem...'\n\n**AFTER writing:**\n- Check: Did I answer ALL 4 points? (Circle the (1), (2), (3), (4))\n- Check: Did I use past tense correctly? (Circle all past participles)\n- Check: Did I write 'du/dein' lowercase? (Informal!)\n\n**This system = never lose points for missing content!**\n\n**12. Common Mistakes to AVOID (Fehler vermeiden):**\n\n❌ **WRONG:** 'Ich habe aufgestanden um 7 Uhr.'\n✅ **RIGHT:** 'Ich bin um 7 Uhr aufgestanden.' (aufstehen uses SEIN!)\n\n❌ **WRONG:** 'Ich habe nach Hause gekommen.'\n✅ **RIGHT:** 'Ich bin nach Hause gekommen.' (kommen uses SEIN!)\n\n❌ **WRONG:** 'Gestern ich bin gegangen.'\n✅ **RIGHT:** 'Gestern bin ich gegangen.' (verb SECOND position!)\n\n❌ **WRONG:** 'Ich dusche mich um 7 Uhr.'\n✅ **RIGHT:** 'Ich dusche mich um 7 Uhr.' (Actually correct! But learners often forget 'mich')\n\n❌ **WRONG:** 'Am Samstag habe ich ferngesehen.'\n✅ **RIGHT:** 'Am Samstag habe ich ferngesehen.' (Actually correct - fernsehen uses haben!)\n\n❌ **WRONG:** 'Ich bin zu Arbeit gegangen.'\n✅ **RIGHT:** 'Ich bin zur Arbeit gegangen.' (zu + der = zur!)\n\n❌ **WRONG:** 'Um halb neun Uhr' (extra 'Uhr')\n✅ **RIGHT:** 'Um halb neun' (no 'Uhr' after 'halb'!)\n\n❌ **WRONG:** 'Montag ich gehe zur Uni.'\n✅ **RIGHT:** 'Montags gehe ich zur Uni.' OR 'Am Montag gehe ich zur Uni.'\n\n**BONUS TIP - The 'Perfekt Sandwich' Visualization:**\nFor separable verbs in Perfekt:\n- Think: PREFIX + ge + STEM + t/en\n- 'aufstehen' → AUF + ge + stand + en = AUFgestanden\n- 'einkaufen' → EIN + ge + kauf + t = EINgekauft\n\nThe 'ge-' is the MEAT in the sandwich, squeezed between prefix (top bread) and stem (bottom bread)!\n\n**FINAL SPEAKING TIP:**\nWhen describing your day in Speaking Teil 2, use this **3-part structure**:\n\n1. **Hook (5 seconds):** 'Ich möchte über meinen typischen Tag sprechen.'\n2. **Body (2 minutes):** Chronological with time markers (morgens → mittags → abends → nachts)\n3. **Conclusion (10 seconds):** 'Das ist ein ganz normaler Tag für mich. Danke!'\n\n**Practice this structure 10 times** - by exam day, it flows naturally!"
          },
          subtasks: [
            { description: "Master 50 morning routine verbs with Perfekt forms - create personal morning story (150 words) in past tense.", completed: false },
            { description: "Learn 40 daytime activity verbs - write your typical workday/uni day with 10+ time expressions.", completed: false },
            { description: "Master all frequency adverbs (immer→nie) - write 10 sentences about habits using correct placement.", completed: false },
            { description: "Learn 30 evening/night verbs - describe your perfect evening in 100 words (past tense).", completed: false },
            { description: "Time expressions deep dive: Memorize 20+ specific time markers (gestern, vorgestern, letzte Woche, etc.) - create flashcards.", completed: false },
            { description: "Separable verb drill: Identify 15 separable verbs from vocabulary, write Präsens AND Perfekt forms, practice word order.", completed: false },
            { description: "Writing practice: Complete 2 mock Writing Teil 1 prompts (describe weekend, describe yesterday) - 80+ words each, check all 4 Leitpunkte answered.", completed: false },
            { description: "Speaking practice: Record 3-minute presentation 'Mein typischer Tag' - use zuerst/dann/danach structure, minimum 15 different verbs.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Daily Routine Vocabulary List with Audio", url: "https://www.germanveryeasy.com/daily-routine" },
            { name: "Separable Verbs Complete Guide", url: "https://www.germanveryeasy.com/separable-verbs" },
            { name: "German Time Expressions (Interactive)", url: "https://www.deutsch-perfekt.com/deutsch-lernen/time-expressions" },
            { name: "DW Learn German - Daily Routine Module", url: "https://learngerman.dw.com/en/my-daily-routine/l-38340181" },
            { name: "Quizlet: B1 Daily Routine Flashcards", url: "https://quizlet.com/topic/daily-routine-german" },
            { name: "YouTube: Easy German - My Daily Routine", url: "https://www.youtube.com/c/EasyGerman" },
            { name: "Goethe Institut - Time Expressions Practice", url: "https://www.goethe.de/en/spr/ueb.html" }
          ],
          notes: ""
        },
        {
          day: 3,
          task: "Writing Module: Teil 1 - Informal Email Strategy",
          focus: "writing",
          level: "B1",
          lessonContent: {
            title: "Schreiben Teil 1: The Friendly Email Formula - Your 45-Point Goldmine",
            definition: "Writing Teil 1 is THE HIGHEST-SCORING writing task (45 of 100 writing points!)! In 30 minutes, you write an informal email to a friend responding to 4 'Leitpunkte' (bullet points). **The Stakes:** This task alone determines 45% of your writing grade. Miss one Leitpunkt = lose 3+ points immediately!\n\n**What Makes Teil 1 'Easy'?** The format is predictable: friend writes to you → you respond. Topics are personal: vacation, weekend, party, birthday, moving house, new job, illness. You don't need specialized vocabulary - just daily life German!\n\n**The Challenge:** Time pressure (30 min), word count (80-90 words ideal), and COMPLETENESS (must answer all 4 points clearly). Students who fail Teil 1 usually fail because they: 1) missed a Leitpunkt, 2) wrote too little (<60 words), or 3) used formal language (Sie instead of du).\n\n**Why This Matters:** Mastering Teil 1 = guaranteed base score for Writing module. Even if Teil 2 & 3 are challenging, a solid Teil 1 (35-40 points) keeps you above passing threshold (60/100). This is your safety net!\n\n**Exam Reality Check:**\n- **Time:** 30 minutes (20 min writing + 10 min checking)\n- **Length:** ~80 words (60 minimum, 100 maximum)\n- **Points:** 45 out of 100 total writing points\n- **Format:** Informal email ('du', lowercase)\n- **Leitpunkte:** Always 4, each worth ~3 points\n- **Tense:** Usually past (Perfekt) + present/future for invitations",
            example: "**COMPLETE GUIDE TO WRITING TEIL 1:**\n\n═══════════════════════════════════════════════════════════\n**PART 1: UNDERSTANDING THE SCORING SYSTEM (45 POINTS)**\n═══════════════════════════════════════════════════════════\n\n**The 4 Scoring Categories:**\n\n**1. Content Completion (Inhalte) - 12 Points**\n- 3 points PER Leitpunkt (4 x 3 = 12)\n- Leitpunkt 1: 3 pts | Leitpunkt 2: 3 pts | Leitpunkt 3: 3 pts | Leitpunkt 4: 3 pts\n- **How to score full points:** Answer EACH point with at least 1-2 sentences. Be specific!\n- **How to lose points:** Vague answers, skipping a point, addressing only half\n\n**2. Communication Effectiveness (Kommunikative Gestaltung) - 12 Points**\n- Does the email sound natural and friendly?\n- Is the greeting/closing appropriate?\n- Is the tone consistent throughout?\n- Does it flow logically?\n- **How to score full points:** Use connecting words, vary sentence structure, stay friendly\n- **How to lose points:** Choppy sentences, no transitions, overly formal tone\n\n**3. Formal Correctness (Formale Richtigkeit) - 12 Points**\n- Grammar accuracy (cases, verb conjugations, word order)\n- Spelling and punctuation\n- Consistent use of informal 'du' (lowercase!)\n- **How to score full points:** Max 5-6 small errors allowed for full points\n- **How to lose points:** Case errors, verb tense mistakes, du/Sie confusion\n\n**4. Vocabulary Range (Wortschatz) - 9 Points**\n- Variety of words (not repeating 'gut' 5 times!)\n- Appropriate level (B1 vocabulary)\n- Accurate word choice\n- **How to score full points:** Use synonyms, varied adjectives, natural expressions\n- **How to lose points:** Very basic A1 vocab only, frequent word repetition\n\n═══════════════════════════════════════════════════════════\n**PART 2: THE PERFECT EMAIL STRUCTURE (The Template)**\n═══════════════════════════════════════════════════════════\n\n**LINE-BY-LINE EMAIL BREAKDOWN:**\n\n**1. SALUTATION (1 line):**\nLiebe/Lieber [Name],\n\n**2. OPENING LINE (1 line):**\nOne of these 10 options:\n- Vielen Dank für deine Nachricht! (Thanks for your message!)\n- Schön, wieder von dir zu hören! (Nice to hear from you again!)\n- Danke für deine E-Mail! (Thanks for your email!)\n- Es freut mich, von dir zu hören! (I'm happy to hear from you!)\n- Wie geht es dir? Mir geht es gut! (How are you? I'm doing well!)\n- Entschuldigung, dass ich erst jetzt antworte! (Sorry I'm only replying now!)\n- Danke für deine Einladung! (Thanks for your invitation!)\n- Schön, dass du dich meldest! (Nice that you're getting in touch!)\n- Ich freue mich über deine Nachricht! (I'm happy about your message!)\n- Toll, von dir zu lesen! (Great to read from you!)\n\n**3. BODY - LEITPUNKT 1 (1-2 sentences):**\nAnswer first bullet point specifically\n\n**4. BODY - LEITPUNKT 2 (1-2 sentences):**\nAnswer second bullet point specifically\n\n**5. BODY - LEITPUNKT 3 (1-2 sentences):**\nAnswer third bullet point specifically\n\n**6. BODY - LEITPUNKT 4 (1-2 sentences):**\nAnswer fourth bullet point specifically\n\n**7. CLOSING LINE (1 line - optional but nice!):**\n- Ich freue mich auf deine Antwort! (I'm looking forward to your reply!)\n- Schreib bald wieder! (Write again soon!)\n- Bis bald! (See you soon!)\n- Melde dich bald! (Get in touch soon!)\n- Ich hoffe, wir sehen uns bald! (I hope we see each other soon!)\n\n**8. SIGN-OFF (1 line):**\n- Liebe Grüße (Kind regards - most common)\n- Viele Grüße (Many regards)\n- Herzliche Grüße (Warm regards)\n- Bis bald (See you soon)\n- Dein/Deine [Your name] (Yours [Your name])\n- Alles Liebe (All the best)\n- Tschüss (Bye)\n\n**Total Lines: 8-12 | Total Words: 80-90**\n\n═══════════════════════════════════════════════════════════\n**PART 3: TYPICAL EXAM PROMPTS & MODEL ANSWERS**\n═══════════════════════════════════════════════════════════\n\n**PROMPT 1: VACATION REPORT**\n\n**Task:**\n'Your friend Maria wants to know about your vacation. Write her an email:'\n1. Wo warst du? (Where were you?)\n2. Was hast du gemacht? (What did you do?)\n3. Wie war das Wetter? (How was the weather?)\n4. Lade sie zu dir ein. (Invite her to your place.)\n\n**MODEL ANSWER (85 words):**\n\nLiebe Maria,\n\nvielen Dank für deine Nachricht! Ich war im August in Spanien, genauer in Barcelona. Die Stadt ist wirklich schön!\n\nIch habe viele Museen besucht, bin am Strand spazieren gegangen und habe leckeres spanisches Essen probiert. Besonders die Paella war fantastisch!\n\nDas Wetter war perfekt - jeden Tag Sonnenschein und 30 Grad. Ideal für den Strand!\n\nHast du Lust, mich nächstes Wochenende zu besuchen? Wir können zusammen Fotos anschauen und ich erzähle dir mehr!\n\nLiebe Grüße\n[Your name]\n\n**ANALYSIS:**\n✅ Leitpunkt 1: 'Ich war im August in Spanien, genauer in Barcelona'\n✅ Leitpunkt 2: 'Ich habe viele Museen besucht, bin am Strand spazieren gegangen...'\n✅ Leitpunkt 3: 'Das Wetter war perfekt - jeden Tag Sonnenschein'\n✅ Leitpunkt 4: 'Hast du Lust, mich nächstes Wochenende zu besuchen?'\n✅ Connector words: 'genauer', 'besonders', 'ideal'\n✅ Varied vocabulary: schön, fantastisch, perfekt, ideal\n✅ Mixed tenses: Perfekt for past (war, habe besucht) + Präsens for invitation (Hast du Lust)\n\n---\n\n**PROMPT 2: PARTY INVITATION REPLY**\n\n**Task:**\n'Your friend Thomas invites you to his birthday party. Write him an email:'\n1. Kannst du kommen? (Can you come?)\n2. Was bringst du mit? (What will you bring?)\n3. Wie kommst du zu ihm? (How will you get there?)\n4. Schlag eine Geschenkidee vor. (Suggest a gift idea.)\n\n**MODEL ANSWER (88 words):**\n\nLieber Thomas,\n\ndanke für deine Einladung! Ich komme sehr gerne zu deiner Party am Samstag. Ich freue mich schon!\n\nIch bringe einen leckeren Kuchen und eine Flasche Wein mit. Ich hoffe, das ist okay!\n\nIch nehme die U-Bahn und bin gegen 19 Uhr bei dir. Die Fahrt dauert nur 30 Minuten.\n\nÜbrigens, hast du schon an ein Geschenk für unsere Freundin Anna gedacht? Vielleicht ein Buch oder ein Gutschein? Sie liest gerne!\n\nBis Samstag!\nViele Grüße\n[Your name]\n\n**ANALYSIS:**\n✅ Leitpunkt 1: 'Ich komme sehr gerne zu deiner Party'\n✅ Leitpunkt 2: 'Ich bringe einen leckeren Kuchen und eine Flasche Wein mit'\n✅ Leitpunkt 3: 'Ich nehme die U-Bahn und bin gegen 19 Uhr bei dir'\n✅ Leitpunkt 4: 'hast du schon an ein Geschenk gedacht? Vielleicht ein Buch oder ein Gutschein?'\n✅ Friendly tone maintained: 'Ich freue mich schon!', 'Ich hoffe, das ist okay!'\n✅ Natural flow: 'Übrigens' connects to new topic smoothly\n\n---\n\n**PROMPT 3: APOLOGY FOR MISSING EVENT**\n\n**Task:**\n'You couldn't attend your friend Julia's dinner. Write her an email:'\n1. Warum konntest du nicht kommen? (Why couldn't you come?)\n2. Entschuldige dich. (Apologize.)\n3. Wie war das Essen? (How was the dinner?)\n4. Schlag ein neues Treffen vor. (Suggest a new meeting.)\n\n**MODEL ANSWER (82 words):**\n\nLiebe Julia,\n\nes tut mir wirklich leid, dass ich gestern Abend nicht zu deinem Essen kommen konnte. Ich hatte plötzlich starke Kopfschmerzen und musste zu Hause bleiben.\n\nBitte entschuldige! Ich war wirklich traurig, dass ich nicht dabei sein konnte.\n\nWie war das Essen? Hoffentlich hat es allen geschmeckt! Hast du dein neues Rezept ausprobiert?\n\nLass uns bald wieder treffen! Vielleicht nächstes Wochenende? Ich lade dich zum Kaffee ein!\n\nLiebe Grüße\n[Your name]\n\n**ANALYSIS:**\n✅ Leitpunkt 1: 'Ich hatte plötzlich starke Kopfschmerzen'\n✅ Leitpunkt 2: 'Es tut mir wirklich leid... Bitte entschuldige!'\n✅ Leitpunkt 3: 'Wie war das Essen? Hoffentlich hat es allen geschmeckt!'\n✅ Leitpunkt 4: 'Lass uns bald wieder treffen! Vielleicht nächstes Wochenende?'\n✅ Emotional appropriateness: 'wirklich leid', 'wirklich traurig'\n✅ Questions engage reader: 'Wie war...?', 'Hast du...?'\n\n---\n\n**PROMPT 4: NEW JOB ANNOUNCEMENT**\n\n**Task:**\n'You started a new job. Write your friend Max an email:'\n1. Was ist dein neuer Job? (What's your new job?)\n2. Was machst du dort? (What do you do there?)\n3. Wie sind die Kollegen? (How are the colleagues?)\n4. Lade ihn zum Feiern ein. (Invite him to celebrate.)\n\n**MODEL ANSWER (90 words):**\n\nLieber Max,\n\nrate mal - ich habe einen neuen Job! Seit letzter Woche arbeite ich als Marketing Manager bei einer großen Firma in der Stadt.\n\nIch plane Werbekampagnen, schreibe Texte und arbeite viel am Computer. Es ist interessant und kreativ!\n\nMeine neuen Kollegen sind sehr nett und hilfsbereit. In der Mittagspause essen wir immer zusammen. Die Atmosphäre ist super!\n\nLass uns das feiern! Kommst du am Freitag zum Essen? Ich reserviere einen Tisch im italienischen Restaurant.\n\nMelde dich!\nDein\n[Your name]\n\n**ANALYSIS:**\n✅ Leitpunkt 1: 'Ich habe einen neuen Job... arbeite ich als Marketing Manager'\n✅ Leitpunkt 2: 'Ich plane Werbekampagnen, schreibe Texte...'\n✅ Leitpunkt 3: 'Meine neuen Kollegen sind sehr nett und hilfsbereit'\n✅ Leitpunkt 4: 'Lass uns das feiern! Kommst du am Freitag?'\n✅ Engaging opening: 'rate mal' (guess what)\n✅ Vivid details: specific job tasks, lunch routine\n\n---\n\n**PROMPT 5: MOVING HOUSE UPDATE**\n\n**Task:**\n'You moved to a new apartment. Write your friend Lisa an email:'\n1. Wo ist deine neue Wohnung? (Where's your new apartment?)\n2. Wie ist die Wohnung? (How is the apartment?)\n3. Was gibt es in der Nähe? (What's nearby?)\n4. Lade sie ein, dich zu besuchen. (Invite her to visit.)\n\n**MODEL ANSWER (87 words):**\n\nLiebe Lisa,\n\ntolle Neuigkeiten! Ich bin letzte Woche umgezogen. Meine neue Wohnung ist in Mitte, direkt in der Stadtmitte.\n\nDie Wohnung ist nicht sehr groß, aber hell und modern. Ich habe ein schönes Wohnzimmer, eine kleine Küche und ein gemütliches Schlafzimmer.\n\nIn der Nähe gibt es viele Geschäfte, Cafés und ein großes Einkaufszentrum. Der Supermarkt ist nur 5 Minuten zu Fuß!\n\nKomm mich doch bald besuchen! Nächstes Wochenende habe ich Zeit. Was meinst du?\n\nBis bald!\n[Your name]\n\n**ANALYSIS:**\n✅ Leitpunkt 1: 'Meine neue Wohnung ist in Mitte'\n✅ Leitpunkt 2: 'nicht sehr groß, aber hell und modern... schönes Wohnzimmer...'\n✅ Leitpunkt 3: 'viele Geschäfte, Cafés und ein großes Einkaufszentrum'\n✅ Leitpunkt 4: 'Komm mich doch bald besuchen! Nächstes Wochenende...'\n✅ Positive tone: 'tolle Neuigkeiten!', 'schönes', 'gemütliches'\n✅ Practical details: '5 Minuten zu Fuß'\n\n═══════════════════════════════════════════════════════════\n**PART 4: ESSENTIAL PHRASES - YOUR PHRASE BANK (30+ Phrases)**\n═══════════════════════════════════════════════════════════\n\n**OPENINGS (Choose 1):**\n1. Vielen Dank für deine Nachricht!\n2. Danke für deine E-Mail!\n3. Schön, wieder von dir zu hören!\n4. Es freut mich, von dir zu hören!\n5. Toll, von dir zu lesen!\n6. Entschuldigung, dass ich erst jetzt antworte!\n7. Danke für deine Einladung!\n8. Wie geht es dir? Mir geht es gut!\n9. Ich freue mich über deine Nachricht!\n10. Schön, dass du dich meldest!\n\n**GIVING INFORMATION:**\n- Ich war... (I was...)\n- Ich habe... gemacht/besucht/gegessen (I did/visited/ate...)\n- Es war... (It was...)\n- Das Wetter war... (The weather was...)\n- Ich bin... gegangen/gefahren (I went/drove...)\n- Leider... (Unfortunately...)\n- Zum Glück... (Luckily...)\n- Übrigens... (By the way...)\n\n**EXPRESSING FEELINGS:**\n- Ich freue mich... (I'm happy...)\n- Es tut mir leid, dass... (I'm sorry that...)\n- Ich bin traurig/glücklich, dass... (I'm sad/happy that...)\n- Das ist schade! (That's a pity!)\n- Wie toll! (How great!)\n- Das freut mich! (I'm glad!)\n- Ich hoffe, dass... (I hope that...)\n\n**MAKING INVITATIONS:**\n- Hast du Lust, ... zu...? (Do you feel like...?)\n- Kommst du...? (Are you coming...?)\n- Lass uns... (Let's...)\n- Wir können... (We can...)\n- Was hältst du von...? (What do you think of...?)\n- Möchtest du...? (Would you like...?)\n\n**MAKING SUGGESTIONS:**\n- Vielleicht können wir... (Maybe we can...)\n- Wie wäre es mit...? (How about...?)\n- Ich schlage vor, dass... (I suggest that...)\n- Wir könnten... (We could...)\n\n**ASKING QUESTIONS:**\n- Wie war...? (How was...?)\n- Was hast du gemacht? (What did you do?)\n- Kannst du kommen? (Can you come?)\n- Hast du Zeit? (Do you have time?)\n- Was meinst du? (What do you think?)\n\n**CONNECTOR WORDS (CRITICAL!):**\n- **zuerst** (first)\n- **dann** (then)\n- **danach** (after that)\n- **außerdem** (besides)\n- **auch** (also)\n- **aber** (but)\n- **leider** (unfortunately)\n- **zum Glück** (luckily)\n- **trotzdem** (nevertheless)\n- **deshalb** (therefore)\n- **übrigens** (by the way)\n- **besonders** (especially)\n- **hoffentlich** (hopefully)\n\n**CLOSINGS (Choose 1):**\n1. Ich freue mich auf deine Antwort!\n2. Schreib bald wieder!\n3. Bis bald!\n4. Melde dich bald!\n5. Ich hoffe, wir sehen uns bald!\n6. Viel Spaß! (Have fun!)\n7. Alles Gute! (All the best!)\n\n**SIGN-OFFS (Choose 1):**\n1. Liebe Grüße (most common)\n2. Viele Grüße\n3. Herzliche Grüße\n4. Bis bald\n5. Dein/Deine [name]\n6. Alles Liebe\n7. Tschüss\n\n═══════════════════════════════════════════════════════════\n**PART 5: WORD COUNT MANAGEMENT**\n═══════════════════════════════════════════════════════════\n\n**The Word Count Sweet Spot: 80-90 words**\n\n**Too Short (<60 words):**\n❌ Looks incomplete\n❌ Probably missing details\n❌ Loses communication points\n\n**Perfect Range (80-90 words):**\n✅ Complete but concise\n✅ Answers all 4 points\n✅ Natural and flowing\n\n**Too Long (>100 words):**\n⚠️ Wastes precious time\n⚠️ More room for grammar errors\n⚠️ Risk of going off-topic\n\n**HOW TO COUNT QUICKLY:**\n- Salutation: 2 words (Liebe Maria,)\n- Opening line: 5-8 words\n- Body (4 Leitpunkte): 10-15 words each = 40-60 words\n- Closing line: 5-8 words\n- Sign-off: 2-3 words\n- **Total: 80-90 words**\n\n**If TOO SHORT (add these):**\n- More details: 'Ich war in Spanien' → 'Ich war im August in Spanien, genauer in Barcelona'\n- Feelings: 'Es war gut' → 'Es war wirklich toll! Ich hatte viel Spaß!'\n- Questions: Add one question to engage reader\n\n**If TOO LONG (cut these):**\n- Remove redundant adjectives: 'sehr schön und toll' → 'sehr schön'\n- Combine sentences: 'Das Essen war gut. Es hat geschmeckt.' → 'Das Essen war lecker!'\n- Remove unnecessary details that don't answer Leitpunkte",
            tips: "**TEIL 1 MASTERY: 12 ADVANCED STRATEGIES**\n\n**1. The '4-Number System' - NEVER Miss a Leitpunkt**\n\nDuring the exam:\n- Step 1: Read task, number the Leitpunkte 1-4 in margin\n- Step 2: While writing, write (1), (2), (3), (4) next to relevant sentences\n- Step 3: Before submitting, check you have all 4 numbers\n\nThis takes 30 seconds but saves you from disaster!\n\n**Example in your draft:**\n'(1) Ich war in Spanien. (2) Ich habe Museen besucht. (3) Das Wetter war super. (4) Kommst du nächste Woche?'\n\nIf you see only (1), (2), (3) → STOP! Add Leitpunkt 4!\n\n**2. The 'Template Memorization' Strategy**\n\nMemorize this EXACT structure (adapt content only):\n\n```\nLiebe/r [Name],\n\n[Opening phrase] (1 line)\n\n[Leitpunkt 1 answer] (1-2 sentences)\n\n[Leitpunkt 2 answer] (1-2 sentences)\n\n[Leitpunkt 3 answer] (1-2 sentences)\n\n[Leitpunkt 4 answer] (1-2 sentences)\n\n[Closing phrase] (1 line)\n\n[Sign-off]\n[Your name]\n```\n\n**Practice until you can write this structure in 2 minutes!**\n\n**3. The 'Past vs Present' Tense Rule**\n\nMost emails mix tenses:\n\n**Use PERFEKT (past) for:**\n- Describing what happened: 'Ich war in Italien' / 'Ich habe gegessen'\n- Reporting past actions: 'Ich habe einen Film gesehen'\n- Explaining why something happened: 'Ich konnte nicht kommen, weil ich krank war'\n\n**Use PRÄSENS (present) for:**\n- Invitations: 'Kommst du am Samstag?'\n- Suggestions: 'Wir können ins Kino gehen'\n- Current situations: 'Ich wohne jetzt in Berlin'\n- Opinions: 'Ich denke, dass...'\n\n**Don't mix within same sentence!**\n❌ 'Ich war in Italien und gehe zum Strand'\n✅ 'Ich war in Italien und bin zum Strand gegangen'\n\n**4. The 'du/Du' Capitalization Rule - CRITICAL!**\n\n**In emails (informal), 'du' is LOWERCASE:**\n✅ Wie geht es **dir**?\n✅ Vielen Dank für **deine** Nachricht!\n✅ Kommst **du** am Samstag?\n✅ Ich freue mich auf **dich**!\n\n**NEVER write:** Du, Dir, Dein, Dich in informal emails!\n\n**Exception:** 'Sie' (formal you) is ALWAYS capitalized, but you won't use it in Teil 1!\n\n**5. The '20-10 Time Split' Method**\n\n**20 minutes: WRITE**\n- 2 min: Read task, number Leitpunkte, think of ideas\n- 15 min: Write draft (don't stop to fix errors!)\n- 3 min: Count words (add/remove as needed)\n\n**10 minutes: CHECK**\n- 3 min: Check Leitpunkte (all 4 answered?)\n- 3 min: Check grammar (cases, verb endings)\n- 2 min: Check spelling and du/du lowercase\n- 2 min: Read aloud quietly (does it flow?)\n\n**6. The 'Connector Word' Rule**\n\n**Use minimum 5 connector words per email!**\n\nThis boosts your 'Communication Effectiveness' score!\n\n**Example with NO connectors (sounds choppy):**\n'Ich war in Spanien. Ich habe Museen besucht. Das Wetter war gut. Komm nächste Woche.'\n\n**Example WITH connectors (sounds natural):**\n'Ich war in Spanien. **Dort** habe ich viele Museen besucht. **Außerdem** war das Wetter super! **Übrigens**, kommst du **vielleicht** nächste Woche?'\n\n**Top 10 connectors to master:**\n1. **und** (and)\n2. **aber** (but)\n3. **auch** (also)\n4. **dann** (then)\n5. **außerdem** (besides)\n6. **leider** (unfortunately)\n7. **zum Glück** (luckily)\n8. **übrigens** (by the way)\n9. **deshalb** (therefore)\n10. **trotzdem** (nevertheless)\n\n**7. The 'Variety = Points' Principle**\n\n**DON'T repeat the same words!**\n\n❌ 'Das war gut. Das Essen war gut. Das Wetter war gut.'\n✅ 'Das war **toll**. Das Essen war **lecker**. Das Wetter war **super**.'\n\n**Create synonym lists:**\n\n**Good:** gut, toll, super, prima, fantastisch, wunderbar, schön, großartig\n**Bad:** schlecht, nicht gut, schrecklich, furchtbar, leider nicht schön\n**Big:** groß, riesig, enorm\n**Small:** klein, winzig\n**Beautiful:** schön, wunderschön, herrlich, hübsch\n**Interesting:** interessant, spannend, faszinierend\n\n**8. The 'Question Technique' - Engage Your Reader**\n\n**Adding 1-2 questions makes emails more natural!**\n\nInstead of: 'Komm nächste Woche zu mir.'\nWrite: 'Hast du Lust, nächste Woche zu mir zu kommen?'\n\nInstead of: 'Das Essen war gut.'\nWrite: 'Wie war das Essen bei dir?'\n\n**Common question structures:**\n- Hast du...? (Do you have...?)\n- Kannst du...? (Can you...?)\n- Wie war...? (How was...?)\n- Was hast du...? (What did you...?)\n- Möchtest du...? (Would you like...?)\n- Kommst du...? (Are you coming...?)\n\n**9. The 'Paragraph = Leitpunkt' Visual Structure**\n\n**Each Leitpunkt gets its own mini-paragraph (2-3 sentences).**\n\nThis creates visual clarity for the examiner!\n\n**Example layout:**\n\nLiebe Maria,\n\nvielen Dank für deine Nachricht!\n\n*[Blank line]*\n(Leitpunkt 1) Ich war im August in Spanien. Die Stadt Barcelona ist wirklich schön!\n\n*[Blank line]*\n(Leitpunkt 2) Ich habe viele Museen besucht und bin am Strand spazieren gegangen. Das Essen war fantastisch!\n\n*[Blank line]*\n(Leitpunkt 3) Das Wetter war perfekt - jeden Tag Sonnenschein!\n\n*[Blank line]*\n(Leitpunkt 4) Hast du Lust, mich nächstes Wochenende zu besuchen?\n\n*[Blank line]*\nLiebe Grüße\n[Name]\n\n**The examiner can SEE you answered 4 distinct points!**\n\n**10. Common Mistakes - Error Prevention Checklist**\n\n**Before submitting, check these 10 common errors:**\n\n**❌ MISTAKE 1:** Missing a Leitpunkt\n**✅ FIX:** Number them in your draft (1-4)\n\n**❌ MISTAKE 2:** Writing 'Du' capitalized\n**✅ FIX:** Change all to lowercase: du, dein, dir, dich\n\n**❌ MISTAKE 3:** Wrong case after preposition\n**✅ FIX:** Review common prepositions:\n  - zu + DAT: zu **dir** (not: zu **dich**)\n  - für + AKK: für **dich** (not: für **dir**)\n  - mit + DAT: mit **dir** (not: mit **dich**)\n\n**❌ MISTAKE 4:** Perfekt with wrong auxiliary\n**✅ FIX:** Movement verbs use SEIN:\n  - Ich **bin** gegangen (not: Ich habe gegangen)\n  - Ich **bin** gefahren (not: Ich habe gefahren)\n\n**❌ MISTAKE 5:** Word order in subordinate clause\n**✅ FIX:** Verb goes to END:\n  - 'weil ich krank **war**' (not: 'weil ich war krank')\n\n**❌ MISTAKE 6:** Too formal language\n**✅ FIX:** Replace:\n  - Mit freundlichen Grüßen → Liebe Grüße\n  - Sehr geehrte → Liebe/Lieber\n  - Ich möchte Sie einladen → Ich möchte dich einladen\n\n**❌ MISTAKE 7:** Too short (<60 words)\n**✅ FIX:** Add details, feelings, or questions\n\n**❌ MISTAKE 8:** Generic answers (not specific)\n**✅ FIX:** Instead of 'Ich war im Urlaub' → 'Ich war zwei Wochen in Spanien'\n\n**❌ MISTAKE 9:** No greeting or sign-off\n**✅ FIX:** ALWAYS include:\n  - Opening: Liebe/Lieber [Name],\n  - Closing: Liebe Grüße + [Your name]\n\n**❌ MISTAKE 10:** Repeating same words\n**✅ FIX:** Use synonyms (gut → toll → super → schön)\n\n**11. The 'Universal Email' Pre-Preparation**\n\n**YOU CAN PREPARE BEFORE THE EXAM!**\n\nMemorize 5 email 'skeletons' for common topics:\n\n**Skeleton 1: Vacation Report**\n- Opening: Danke für deine Nachricht!\n- L1: Ich war in [place]\n- L2: Ich habe [activities] gemacht\n- L3: Das Wetter/Essen war [adjective]\n- L4: Hast du Lust, [invitation]?\n\n**Skeleton 2: Invitation Reply**\n- Opening: Danke für deine Einladung!\n- L1: Ja, ich komme gerne!\n- L2: Ich bringe [food/drink] mit\n- L3: Ich komme mit [transport]\n- L4: [Question or suggestion]\n\n**Skeleton 3: Apology**\n- Opening: Es tut mir wirklich leid\n- L1: Ich konnte nicht kommen, weil [reason]\n- L2: Bitte entschuldige!\n- L3: [Question about event]\n- L4: Lass uns bald treffen!\n\n**Skeleton 4: News Announcement**\n- Opening: Ich habe tolle Neuigkeiten!\n- L1: Ich habe [new situation]\n- L2: Ich [description of situation]\n- L3: Es ist [feeling/opinion]\n- L4: Lass uns das feiern!\n\n**Skeleton 5: Update After Event**\n- Opening: Schön, von dir zu hören!\n- L1: [Event] war [adjective]\n- L2: [What you did]\n- L3: [Who was there / What happened]\n- L4: [Future plan or question]\n\n**During exam:** Identify which skeleton fits → Fill in specific details!\n\n**12. Exam Day Checklist - The Final 60 Seconds**\n\n**Before you hand in your email, verify:**\n\n☐ **Greeting present?** (Liebe/Lieber [Name],)\n☐ **All 4 Leitpunkte answered?** (Check your numbers!)\n☐ **Word count 80-90?** (Quick estimate)\n☐ **All 'du' lowercase?** (Scan for capital D)\n☐ **Sign-off present?** (Liebe Grüße + name)\n☐ **Perfekt verbs correct?** (ge- participle at end)\n☐ **No spelling errors in common words?** (ich, nicht, weil, haben)\n☐ **Natural flow?** (Read last sentence - does it sound friendly?)\n☐ **At least 3 connector words?** (und, aber, auch, dann...)\n☐ **Varied vocabulary?** (Not repeating 'gut' 5 times)\n\n**If YES to all 10 → SUBMIT WITH CONFIDENCE!**\n\n---\n\n**BONUS STRATEGY: The 'Template Bank' Method**\n\n**Write these 10 phrases on scrap paper at exam start:**\n\n1. Vielen Dank für deine Nachricht!\n2. Ich war in... / Ich habe... gemacht\n3. Das war... (toll/super/schön)\n4. Leider... / Zum Glück...\n5. Außerdem...\n6. Ich freue mich, dass...\n7. Es tut mir leid, dass...\n8. Hast du Lust, ...?\n9. Lass uns...\n10. Liebe Grüße\n\n**Then mix and match based on Leitpunkte!**\n\nThis gives you a 'phrase menu' to choose from - no more blank mind!"
          },
          subtasks: [
            { description: "Memorize 10 opening phrases + 7 sign-off phrases - practice writing them from memory. Test yourself: can you recall all 17 in 2 minutes?", completed: false },
            { description: "Learn 30 essential phrases from the Phrase Bank - create Anki flashcards (German on front, context on back). Review daily for 5 minutes.", completed: false },
            { description: "TEMPLATE DRILL: Write the blank email template (greeting → opening → 4 body sections → closing → sign-off) from memory. Time: 3 minutes. Practice daily until automatic!", completed: false },
            { description: "PRACTICE EMAIL 1: Vacation topic. Prompt: 'Where were you? What did you do? How was weather? Invite friend.' Write in 25 min. Check all 4 Leitpunkte covered. Count words (target: 80-90).", completed: false },
            { description: "PRACTICE EMAIL 2: Party invitation reply. Prompt: 'Can you come? What will you bring? How will you get there? Suggest gift idea.' Write in 25 min. Focus on using 5+ connector words.", completed: false },
            { description: "PRACTICE EMAIL 3: Apology email. Prompt: 'Why couldn't you attend? Apologize. Ask how event was. Suggest new meeting.' Write in 25 min. Practice emotional tone (genuinely sorry).", completed: false },
            { description: "Learn connector words: Create a list of 20 (und, aber, auch, dann, außerdem, leider, zum Glück, trotzdem, deshalb, übrigens, besonders, zuerst, danach, hoffentlich, vielleicht, oft, manchmal, sofort, plötzlich, wirklich). Use 10 in one practice email.", completed: false },
            { description: "Common Mistakes DRILL: Review the 10 common mistakes list. Find examples of each in your practice emails. Create a personal 'Error Log' - track which mistakes YOU make most often.", completed: false },
            { description: "Timed MOCK TEST: Take an official Teil 1 prompt. Set timer for EXACTLY 30 minutes. Write email. Check: 4 points answered? 80-90 words? All du lowercase? Score yourself using scoring rubric (45 pts total). Target: 35+/45.", completed: false },
            { description: "Vocabulary Synonyms: Create synonym lists for 10 common adjectives (gut, schlecht, groß, klein, schön, interessant, wichtig, schwierig, einfach, neu). Learn 3 synonyms per word to avoid repetition.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Writing Samples (Modellsatz Teil 1)", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "German Email Writing Guide with Phrases", url: "https://www.germanveryeasy.com/email-writing" },
            { name: "B1 Writing Exercises (Schubert Verlag)", url: "https://www.schubert-verlag.de/aufgaben/uebungen_b1/b1_uebungen_index.htm" },
            { name: "Deutsche Welle - Writing a Personal Letter", url: "https://learngerman.dw.com/en/writing-personal-letters/l-39565470" },
            { name: "Anki - Spaced Repetition Flashcard App", url: "https://ankiweb.net" },
            { name: "B1 Email Templates (PDF Download)", url: "https://www.goethe.de/resources" },
            { name: "German Connector Words Complete List", url: "https://www.germanveryeasy.com/connectors" }
          ],
          notes: ""
        },
        {
          day: 4,
          task: "Listening Teil 2 + 3 Practice (Monologue & Conversation)",
          focus: "listening",
          level: "B1",
          lessonContent: {
            title: "Advanced Listening: Following Longer Passages Without Repetition",
            definition: "**CRITICAL DIFFERENCE:** Teil 2 and Teil 3 play ONCE ONLY! Unlike Teil 1 & 4 (which play twice), you get NO second chance here. This is where many students panic - but with the right strategies, you can master these!\n\n**Teil 2 (Monologue)** = 5 multiple-choice questions, ~3-4 minutes of formal speech (museum tour, company presentation, lecture, travel guide). Challenge: LOTS of details (numbers, dates, names) - you must write them down IMMEDIATELY or they're gone forever!\n\n**Teil 3 (Conversation)** = 7 True/False statements, ~3-4 minutes of informal dialogue between 2 people discussing plans, problems, or opinions. Challenge: Speaker A says one thing, Speaker B disagrees - you must track WHO said WHAT!\n\n**Why These Are Tricky:** Your brain wants to translate everything to English, but there's no time! You must train your ears to understand German DIRECTLY. Plus, speakers use colloquial language, fillers ('also', 'na ja', 'ähm'), and overlapping ideas.\n\n**The Stakes:** Together, Teil 2 + 3 = 12 points out of 30 total listening points (40% of Listening module!). Master these = guarantee your 18/30 passing score!\n\n**Exam Reality Check:**\n- Teil 2: 5 MCQs (A/B/C options), ~10 minutes listening + answering\n- Teil 3: 7 R/F statements, ~5 minutes listening + answering\n- Both: NO repetition, NO pause button\n- Time pressure: Must read questions, listen, and answer simultaneously",
            example: "**COMPLETE GUIDE TO TEIL 2 & TEIL 3:**\n\n═══════════════════════════════════════════════════════════\n**PART 1: LISTENING TEIL 2 - THE MONOLOGUE (5 MCQs)**\n═══════════════════════════════════════════════════════════\n\n**What You'll Hear:**\n- Museum/gallery tour guide\n- Company presentation about products/services\n- Travel guide describing destination\n- Lecture/talk on cultural topic\n- Information session (city, event, exhibition)\n\n**FORMAT:**\n- Length: 3-4 minutes of continuous speech\n- Questions: 5 multiple choice (A/B/C options)\n- Plays: ONCE only!\n- Voice: Usually one speaker (formal, clear German)\n- Context: Lots of factual information\n\n**TYPICAL QUESTION TYPES:**\n\n**Type 1: NUMBERS & DATES (Very Common!)**\n\n**Example Question:**\nWann wurde das Museum eröffnet?\na) 1985\nb) 1995  \nc) 2005\n\n**What you'll hear:**\n'Das Museum wurde neunzehnhundertfünfundneunzig eröffnet.' (1995)\n\n**TRAP:** Audio mentions multiple dates! 'Das Gebäude ist von 1885, aber das Museum selbst öffnete 1995.'\n→ Building = 1885, Museum opening = 1995\n→ Question asks about MUSEUM opening = 1995 (B)\n\n**Type 2: SPECIFIC INFORMATION**\n\n**Example Question:**\nWas ist das Hauptthema der Ausstellung?\na) Moderne Kunst\nb) Historische Kunst\nc) Fotografie\n\n**What you'll hear:**\n'Unsere aktuelle Ausstellung zeigt hauptsächlich Fotografien aus dem 20. Jahrhundert.'\n\n**TRAP:** May mention 'moderne' and 'historische' in passing, but key word is 'hauptsächlich' (mainly) = Fotografie (C)\n\n**Type 3: REASON/PURPOSE (Look for 'weil', 'deshalb', 'um... zu')**\n\n**Example Question:**\nWarum ist das Produkt besonders?\na) Es ist billig\nb) Es ist umweltfreundlich\nc) Es ist modern\n\n**What you'll hear:**\n'Unser Produkt unterscheidet sich von anderen, weil wir nur recycelte Materialien verwenden. Das macht es besonders umweltfreundlich.'\n\n**KEY WORDS:** 'weil' (because) + 'recycelte Materialien' (recycled materials) + 'umweltfreundlich' (environmentally friendly) = B\n\n**Type 4: LOCATION/DIRECTION**\n\n**Example Question:**\nWo findet die Veranstaltung statt?\na) Im Hauptgebäude\nb) Im Garten\nc) Im Nebengebäude\n\n**What you'll hear:**\n'Die Veranstaltung beginnt hier im Hauptgebäude, aber der Hauptteil findet dann im Garten statt.'\n\n**TRAP:** Mentions TWO locations! Beginning = main building, but MAIN event = garden (B)\n\n**Type 5: OPINION/RECOMMENDATION**\n\n**Example Question:**\nWas empfiehlt der Sprecher?\na) Früh kommen\nb) Tickets online kaufen\nc) Mit dem Auto fahren\n\n**What you'll hear:**\n'Ich rate Ihnen, die Tickets vorher online zu kaufen, denn an der Kasse gibt es oft lange Wartezeiten.'\n\n**KEY PHRASE:** 'Ich rate Ihnen' (I advise you) = recommendation → online kaufen (B)\n\n---\n\n**TEIL 2 STRATEGIES:**\n\n**STRATEGY 1: Pre-Read Questions (30 seconds)**\n\nBEFORE audio starts:\n- Read all 5 questions quickly\n- Underline key question words: Wann? Wo? Wie viele? Warum? Was?\n- Predict general content from questions\n\n**Example:** If you see 'Museum', 'Öffnungszeiten' (opening hours), 'Preis' (price) → You know it's about visiting a museum!\n\n**STRATEGY 2: Number/Date Emergency System**\n\n**CRITICAL:** Write down ALL numbers/dates AS YOU HEAR THEM!\n\nCreate a shorthand system:\n- 1995 → write '95' immediately\n- 10 Uhr → write '10h'\n- 500 Euro → write '500€'\n- 3 Stunden → write '3h'\n\nDon't try to remember - your brain will forget!\n\n**STRATEGY 3: Question Order = Audio Order (Usually!)**\n\nQuestions typically follow chronological order of audio:\n- Question 1 → answered in first minute\n- Question 2 → answered in second minute\n- Question 3 → middle\n- Question 4 → later\n- Question 5 → end\n\nIf you're waiting for Question 2 answer but hear Question 3 info → you missed Q2!\n\n**STRATEGY 4: Signal Phrases (Your Lifeline!)**\n\nListen for these phrases - they signal important info:\n\n**Emphasis:**\n- **besonders** (especially)\n- **vor allem** (above all)\n- **hauptsächlich** (mainly)\n- **am wichtigsten** (most important)\n\n**Contrast:**\n- **aber** (but)\n- **jedoch** (however)\n- **trotzdem** (nevertheless)\n- **im Gegensatz zu** (in contrast to)\n\n**Reason:**\n- **weil** (because)\n- **deshalb** (therefore)\n- **aus diesem Grund** (for this reason)\n- **denn** (because)\n\n**Summary:**\n- **zusammenfassend** (in summary)\n- **kurz gesagt** (in short)\n- **das heißt** (that means)\n- **mit anderen Worten** (in other words)\n\n**STRATEGY 5: Passive Voice Recognition**\n\nFormal German LOVES passive voice! Learn to recognize it:\n\n- 'Das Museum **wurde** 1995 **eröffnet**.' (passive)\n- = Someone opened the museum in 1995. (active)\n\nPassive = 'wurde/wird' + past participle\n\n**STRATEGY 6: Elimination Technique**\n\nIf you missed the answer:\n1. Eliminate obviously wrong options\n2. Choose between remaining 2\n3. NEVER leave blank - guess!\n\n**Example:**\nQuestion: Wie viele Räume hat das Museum?\na) 10  b) 20  c) 30\n\nYou heard 'über zwanzig Räume' (over twenty rooms)\n→ Eliminate A (10) - too few\n→ B or C? 'Über 20' = more than 20 = probably C (30)\n\n═══════════════════════════════════════════════════════════\n**PART 2: LISTENING TEIL 3 - THE CONVERSATION (7 R/F)**\n═══════════════════════════════════════════════════════════\n\n**What You'll Hear:**\n- 2 people discussing weekend plans\n- Friends talking about a problem\n- Colleagues planning an event\n- Family members discussing travel\n- Discussion about work/study issue\n\n**FORMAT:**\n- Length: 3-4 minutes of dialogue\n- Questions: 7 True/False statements\n- Plays: ONCE only!\n- Voices: Man (M) and Woman (F) - informal, conversational\n- Context: Opinions, suggestions, agreements/disagreements\n\n**STATEMENT TYPES:**\n\n**Type 1: FACTUAL INFORMATION**\n\n**Statement:** 'Die Frau war letztes Wochenende in Berlin.'\n\n**What you'll hear:**\n- Woman: 'Ich war letztes Wochenende in Berlin.' → **RICHTIG**\n- Woman: 'Ich war letztes Wochenende zu Hause.' → **FALSCH**\n- Woman: 'Meine Schwester war in Berlin.' → **FALSCH** (not her!)\n\n**Type 2: OPINION/FEELING**\n\n**Statement:** 'Der Mann findet das Restaurant zu teuer.'\n\n**What you'll hear:**\n- Man: 'Also, ICH finde das Restaurant ein bisschen zu teuer.' → **RICHTIG**\n- Woman: 'Ich finde es zu teuer.' → **FALSCH** (wrong person!)\n- Man: 'Das Restaurant ist nicht teuer.' → **FALSCH** (opposite opinion)\n\n**TRAP:** Both speakers discuss same topic but have DIFFERENT opinions!\n\n**Type 3: PLANS/INTENTIONS**\n\n**Statement:** 'Die Frau will am Samstag ins Kino gehen.'\n\n**What you'll hear:**\n- Woman: 'Ich möchte am Samstag ins Kino gehen.' → **RICHTIG**\n- Woman: 'Ich WOLLTE ins Kino, aber jetzt nicht mehr.' → **FALSCH** (changed mind!)\n- Woman: 'Vielleicht gehe ich ins Kino.' → **FALSCH** (not definite!)\n\n**Type 4: REASON/CAUSE**\n\n**Statement:** 'Der Mann kann nicht kommen, weil er krank ist.'\n\n**What you'll hear:**\n- Man: 'Ich kann leider nicht kommen, weil ich krank bin.' → **RICHTIG**\n- Man: 'Ich kann nicht kommen, weil ich arbeiten muss.' → **FALSCH** (different reason!)\n\n**Type 5: AGREEMENT/DISAGREEMENT**\n\n**Statement:** 'Die beiden sind sich einig.' (Both agree.)\n\n**What you'll hear:**\n**AGREE:**\n- Man: 'Ich denke, wir sollten früher gehen.'\n- Woman: 'Ja, gute Idee! Ich bin einverstanden.' → **RICHTIG**\n\n**DISAGREE:**\n- Man: 'Lass uns früher gehen.'\n- Woman: 'Nein, ich finde, wir sollten später gehen.' → **FALSCH**\n\n---\n\n**TEIL 3 STRATEGIES:**\n\n**STRATEGY 1: The M/F Symbol System**\n\n**CRITICAL:** Track WHO says WHAT!\n\nWhile listening, write next to each statement:\n- **M** (Mann said it) or **F** (Frau said it)\n- Use **M→F** for Man suggests, Woman agrees\n- Use **M✗F** for Man says, Woman disagrees\n\n**Example:**\n1. Der Mann findet das Wetter schlecht. **M** → R/F?\n2. Die Frau möchte zu Hause bleiben. **F** → R/F?\n3. Beide wollen ins Kino. **M+F** → R/F?\n\n**STRATEGY 2: Opinion Markers - Listen Carefully!**\n\n**Watch for these phrases:**\n\n**Man's Opinion:**\n- 'ICH denke...' (I think...)\n- 'ICH finde...' (I find...)\n- 'Meiner Meinung nach...' (In my opinion...)\n- 'Für MICH...' (For me...)\n\n**Woman's Opinion:**\n- Same phrases! Listen for WHO speaks!\n\n**Agreement:**\n- 'Ja, genau!' (Yes, exactly!)\n- 'Da hast du recht!' (You're right!)\n- 'Ich bin einverstanden.' (I agree.)\n- 'Gute Idee!' (Good idea!)\n\n**Disagreement:**\n- 'Nein, ich denke anders.' (No, I think differently.)\n- 'Ich bin nicht sicher.' (I'm not sure.)\n- 'Aber...' (But...)\n- 'Ich finde nicht.' (I don't think so.)\n\n**STRATEGY 3: The 'Change of Mind' Trap**\n\n**BEWARE:** Speakers often change their mind mid-conversation!\n\n**Example:**\nStatement: 'Die Frau will ins Restaurant gehen.'\n\nWhat you hear:\n- Woman: 'Lass uns ins Restaurant gehen!' (At first, wants to go)\n- Man: 'Aber es ist so teuer...'\n- Woman: 'Hm, du hast recht. Lass uns lieber zu Hause essen.' (CHANGED MIND!)\n\n**FINAL OPINION = at END of conversation!**\n\nAnswer: **FALSCH** (she changed her mind!)\n\n**STRATEGY 4: Pre-Read ALL 7 Statements (45 seconds)**\n\nBefore audio:\n- Read all 7 statements\n- Underline subject: 'Der Mann' / 'Die Frau' / 'Beide'\n- Mark key verbs: will, kann, möchte, findet, denkt\n- Predict conversation topic\n\n**STRATEGY 5: The 'Not Mentioned' Doesn't Exist!**\n\nUNLIKE Reading, Listening has NO 'Text sagt dazu nichts' option!\n\nOnly 2 choices: **RICHTIG** or **FALSCH**\n\nIf you didn't hear it mentioned → It's probably **FALSCH**!\n\n**STRATEGY 6: Negation Tricks**\n\n**Listen for 'nicht' and 'kein':**\n\nStatement: 'Der Mann hat Zeit.'\nAudio: 'Ich habe KEINE Zeit.' → **FALSCH**!\n\nStatement: 'Die Frau mag das Essen nicht.'\nAudio: 'Ich mag das Essen NICHT.' → **RICHTIG**!\n\nDouble negatives = positive:\n'Ich bin NICHT unzufrieden.' (I'm not unhappy) = I'm satisfied!\n\n**STRATEGY 7: Modal Verbs Change Everything!**\n\n**Pay attention to modals:**\n\nStatement: 'Der Mann geht ins Kino.'\n\nAudio options:\n- 'Ich gehe ins Kino.' → **RICHTIG** (definite)\n- 'Ich MÖCHTE ins Kino gehen.' → **FALSCH** (wants to, but not definite!)\n- 'Ich KANN ins Kino gehen.' → **FALSCH** (able to, but not saying he will!)\n- 'Ich SOLL ins Kino gehen.' → **FALSCH** (supposed to, but not saying he agrees!)\n\n**STRATEGY 8: Time Markers Matter!**n\nStatement: 'Die Frau war gestern im Kino.'\n\nAudio:\n- 'Ich war GESTERN im Kino.' → **RICHTIG**\n- 'Ich war VORGESTERN im Kino.' → **FALSCH** (day before yesterday!)\n- 'Ich gehe MORGEN ins Kino.' → **FALSCH** (future, not past!)\n\n═══════════════════════════════════════════════════════════\n**PART 3: NOTE-TAKING SYSTEM FOR TEIL 2 & 3**\n═══════════════════════════════════════════════════════════\n\n**YOUR NOTE-TAKING TEMPLATE:**\n\n**TEIL 2 (Monologue):**\n```\nQ1: [key word] _______________\nQ2: [key word] _______________\nQ3: [key word] _______________  \nQ4: [key word] _______________\nQ5: [key word] _______________\n\nNUMBERS: ___ ___ ___ ___\nDATES: ___ ___ ___\nNAMES: ___ ___ ___\n```\n\n**TEIL 3 (Conversation):**\n```\n1. M/F: ___ → R/F?\n2. M/F: ___ → R/F?\n3. M/F: ___ → R/F?\n4. M/F: ___ → R/F?\n5. M/F: ___ → R/F?\n6. M/F: ___ → R/F?\n7. M/F: ___ → R/F?\n```\n\n**SPEED SYMBOLS (Write FAST!):**\n\n**General:**\n- ✓ = yes, correct, agrees\n- ✗ = no, incorrect, disagrees\n- → = goes to, leads to\n- ≠ = not equal, different\n- ↑ = increase, more\n- ↓ = decrease, less\n- ? = unclear, not sure\n\n**People:**\n- M = Mann (man)\n- F = Frau (woman)\n- M+F = both agree\n- M≠F = they disagree\n\n**Time:**\n- h = heute (today)\n- g = gestern (yesterday)\n- m = morgen (tomorrow)\n- W = Woche (week)\n- M = Monat (month)\n\n**Places:**\n- @ = at (location)\n- → = to (direction)\n- ← = from (origin)\n\n**Example Notes:**\n'F: g @Kino, h müde, m →Park M'\n= Woman: yesterday at cinema, today tired, tomorrow to park with man\n\n═══════════════════════════════════════════════════════════\n**PART 4: COMMON TRAPS & HOW TO AVOID THEM**\n═══════════════════════════════════════════════════════════\n\n**TRAP 1: Number Overload**\n\n**Problem:** Audio mentions 5 different numbers, but question asks for only 1!\n\n**Example:**\n'Das Museum hat 500 Mitarbeiter, 10.000 Besucher pro Tag, wurde 1995 gegründet, kostet 15 Euro Eintritt und hat 25 Räume.'\n\nQuestion: Wie viel kostet der Eintritt?\n\n**Solution:** Write down ALL numbers with context:\n- 500 = Mitarbeiter\n- 10.000 = Besucher/Tag\n- 1995 = gegründet\n- 15€ = **Eintritt** ← ANSWER!\n- 25 = Räume\n\n**TRAP 2: Similar-Sounding Words**\n\n**Problem:** German has word pairs that sound similar!\n\n- **frei** (free) vs **drei** (three)\n- **neun** (nine) vs **nein** (no)\n- **vierzig** (40) vs **vierzehn** (14)\n- **sechzig** (60) vs **sechzehn** (16)\n\n**Solution:** Context! If talking about price, 'frei' = free. If counting, 'drei' = three!\n\n**TRAP 3: The 'But' Reversal**\n\n**Problem:** First statement is negated by 'aber'!\n\n**Example:**\nStatement: 'Die Frau findet das Restaurant gut.'\n\nAudio: 'Das Restaurant ist schön, ABER das Essen schmeckt nicht gut.'\n\n**'Aber' changes everything!** Final opinion = Essen not good → **FALSCH**!\n\n**TRAP 4: Partial Truth**\n\n**Problem:** Statement is HALF right, HALF wrong!\n\n**Example:**\nStatement: 'Der Mann war in Berlin und München.'\n\nAudio: 'Ich war in Berlin, aber nicht in München.'\n\nPartially true ≠ TRUE → **FALSCH**!\n\n**Rule:** If ANY part of statement is wrong = **FALSCH**!\n\n**TRAP 5: Pronouns Hide Identity**\n\n**Problem:** Audio uses pronouns, not names!\n\n**Example:**\nStatement: 'Die Frau kauft die Tickets.'\n\nAudio:\n- Man: 'Wer kauft die Tickets?'\n- Woman: 'ICH mache das.' (I'll do it.)\n\n'ICH' = Frau (woman speaking) → **RICHTIG**!\n\n**Solution:** Track who's speaking at all times!",
            tips: "**15 ADVANCED LISTENING MASTERY STRATEGIES:**\n\n**1. The 'Prediction Power' Technique**\n\n**BEFORE audio starts (30-45 seconds):**\n- Read questions\n- Predict vocabulary you'll hear\n- Activate related German words in your brain\n\n**Example:**\nQuestions mention 'Museum', 'Öffnungszeiten', 'Preis'\n\n**Predict you'll hear:**\n- geöffnet (open)\n- geschlossen (closed)\n- Montag bis Freitag (Monday to Friday)\n- Eintritt (entrance fee)\n- kostenlos (free)\n- Erwachsene/Kinder (adults/children)\n\n**Your brain is now READY to recognize these words!**\n\n**2. The 'Keyword Hunt' Method**\n\n**Don't try to understand EVERYTHING!**\n\nFocus ONLY on keywords that answer questions:\n\nQuestion: 'Wann öffnet das Museum?'\nKeywords to hunt: Uhr, öffnet, geöffnet, ab, von... bis\n\n**Ignore:** Long descriptions, adjectives, opinions\n**Capture:** Times, numbers, days\n\n**3. The 'Write While Listening' Rule**\n\n**NEVER wait until audio finishes!**\n\nWrite answers DURING listening:\n- Hear answer to Q1 → mark it IMMEDIATELY\n- Don't think 'I'll remember' → you won't!\n- Move to Q2 while listening continues\n\n**Practice:** Listen to 2-minute German news → write down 5 facts WHILE listening\n\n**4. The 'Question Word Focus' Strategy**\n\n**Each question word has trigger words in audio:**\n\n**WANN? (When?) → Listen for:**\n- Time: um 9 Uhr, am Montag, im Sommer\n- Year: 1995, 2020\n- Duration: seit drei Jahren, vor einem Monat\n\n**WO? (Where?) → Listen for:**\n- Places: im Zentrum, in der Stadt, auf dem Platz\n- Buildings: Museum, Rathaus, Park\n- Prepositions: in, auf, an, neben, hinter\n\n**WIE VIELE? (How many?) → Listen for:**\n- Numbers: zehn, zwanzig, hundert\n- Quantities: viele, wenige, einige, mehrere\n\n**WIE LANGE? (How long?) → Listen for:**\n- Duration: drei Stunden, den ganzen Tag, bis 18 Uhr\n\n**WARUM? (Why?) → Listen for:**\n- weil, denn, deshalb, aus diesem Grund, um... zu\n\n**WAS? (What?) → Listen for:**\n- Nouns, activities, descriptions\n\n**5. The 'First Mention = Often Wrong' Principle**\n\n**Exam trick:** Audio often mentions wrong answers FIRST!\n\n**Example:**\nQuestion: 'Wie viel kostet der Eintritt?'\na) 10 Euro  b) 15 Euro  c) 20 Euro\n\nAudio: 'Früher kostete der Eintritt 10 Euro, aber jetzt kostet er 15 Euro.'\n\n**TRAP:** First number (10) is WRONG - it's the OLD price!\n**ANSWER:** 15 Euro (current price)\n\n**Listen for:** jetzt, heute, aktuell, momentan (= current info)\n\n**6. The 'Context Clues' Lifesaver**\n\n**Don't know a word? Use context!**\n\n**Example:**\nYou hear: 'Das Museum hat eine neue Sonderausstellung über alte Flugzeuge.'\n\nDon't know 'Flugzeuge'?\n- 'Museum' = museum\n- 'Sonderausstellung' = special exhibition\n- 'alte' = old\n- 'Flugzeuge' = ??? (probably old objects in a museum = planes!)\n\n**7. The 'Synonym Trap' Awareness**\n\n**Problem:** Question uses one word, audio uses synonym!\n\n**Question:** 'Die Frau ist müde.' (Woman is tired.)\n**Audio:** 'Ich bin erschöpft.' (I'm exhausted.)\n\n**müde = erschöpft!** Same meaning! → **RICHTIG**\n\n**Common Synonym Pairs:**\n- beginnen = anfangen (begin)\n- gern = gerne (gladly)\n- jetzt = nun (now)\n- aber = jedoch (but)\n- sehr = wirklich (very/really)\n- gut = toll/super (good/great)\n- schlecht = nicht gut (bad/not good)\n\n**8. The 'Speed Training' Practice Routine**\n\n**Your brain needs speed training!**\n\n**WEEK 1-2:** Listen to slow German news (DW Langsam)\n**WEEK 3-4:** Listen to normal German news (Tagesschau)\n**WEEK 5+:** Listen to fast German (podcasts, YouTube)\n\n**Daily Drill (10 minutes):**\n1. Listen to 3-minute German audio\n2. Note 5 main facts\n3. Listen again - catch details you missed\n4. Compare with transcript\n\n**9. The 'Vocabulary Building for Listening' Method**\n\n**Learn vocabulary by THEME (same as reading!):**\n\n**Museum/Exhibition:**\n- die Ausstellung (exhibition)\n- das Gemälde (painting)\n- die Führung (guided tour)\n- der Eintritt (entrance/admission)\n- die Öffnungszeiten (opening hours)\n- das Stockwerk (floor/level)\n- die Sammlung (collection)\n\n**Company/Work:**\n- das Unternehmen (company)\n- der Mitarbeiter (employee)\n- das Produkt (product)\n- die Dienstleistung (service)\n- der Kunde (customer)\n- die Abteilung (department)\n\n**Travel:**\n- die Reise (trip)\n- die Unterkunft (accommodation)\n- die Sehenswürdigkeit (sight/attraction)\n- die Buchung (booking)\n- der Flug (flight)\n- das Gepäck (luggage)\n\n**When you hear 'Museum', your brain activates ALL museum words!**\n\n**10. The 'Distraction Filter' Training**\n\n**German speakers use LOTS of filler words!**\n\n**Learn to IGNORE these:**\n- **also** (well, so)\n- **ja** (yes - often just emphasis!)\n- **na ja** (well, oh well)\n- **ähm** (um, uh)\n- **eigentlich** (actually)\n- **halt** (just, simply)\n- **oder?** (right? - seeking agreement)\n- **nicht wahr?** (isn't it?)\n\n**These carry NO information - filter them out!**\n\n**Practice:** Listen to Easy German street interviews - notice how often 'also' and 'ja' appear!\n\n**11. The 'Shadowing' Technique (Advanced!)**\n\n**What:** Repeat what you hear 1-2 seconds after hearing it\n\n**How:**\n1. Play German audio\n2. As you listen, repeat out loud (slightly behind)\n3. Don't pause - keep going even if you miss words\n\n**Why it works:** Trains your brain to process German in real-time!\n\n**Start:** 1 minute of slow audio\n**Build up:** 3-5 minutes of normal-speed audio\n\n**12. The 'Background Listening' Habit**\n\n**Build German 'ear' through daily exposure:**\n\n**Morning:** German radio while breakfast (15 min)\n**Commute:** German podcast (20 min)\n**Cooking:** German YouTube video (10 min)\n**Before sleep:** German audiobook (10 min)\n\n**Goal:** 1 hour daily German audio (doesn't need full focus!)\n\n**Your brain starts recognizing patterns automatically!**\n\n**13. The 'Confidence Guess' Strategy**\n\n**What if you COMPLETELY missed an answer?**\n\n**NEVER leave blank!**\n\n**Teil 2 (MCQ):**\n- Eliminate 1 obviously wrong option\n- Choose between remaining 2\n- Go with your gut feeling\n\n**Teil 3 (R/F):**\n- If you heard NOTHING about statement → probably **FALSCH**\n- If you heard something similar → probably **RICHTIG**\n- 50/50 chance - better than 0%!\n\n**14. The 'Post-Listening Analysis' Routine**\n\n**After EVERY practice test:**\n\n**Step 1:** Score yourself\n**Step 2:** Listen AGAIN with transcript\n**Step 3:** Identify mistakes:\n- Didn't hear the word? → Vocabulary gap\n- Heard but didn't understand? → Grammar gap\n- Understood but marked wrong? → Strategy issue\n\n**Step 4:** Add unknown words to Anki\n**Step 5:** Repeat practice until 80%+ correct\n\n**15. The 'Calm Mind' Technique for Exam Day**\n\n**During actual exam:**\n\n**If you panic (normal!):**\n1. Take 3 deep breaths\n2. Read next question\n3. Focus on THAT question only\n4. Let go of missed questions\n\n**Remember:** You need 18/30 (60%) to pass!\n- Miss 2 in Teil 2? Still okay!\n- Miss 2 in Teil 3? Still okay!\n- Don't need perfection!\n\n**Pressure Relief:** Even native Germans sometimes miss 1-2 questions due to accent/speed!\n\n---\n\n**BONUS: The 'Listening Roadmap' (12-Week Plan)**\n\n**Weeks 1-2:** Build vocabulary (themed lists)\n**Weeks 3-4:** Slow audio + transcripts (DW Langsam)\n**Weeks 5-6:** Normal audio without transcripts (Easy German)\n**Weeks 7-8:** Official Teil 2 & 3 practice (Modellsätze)\n**Weeks 9-10:** Fast audio (German podcasts)\n**Weeks 11-12:** Timed mock tests (full 40-min listening module)\n\n**Daily: 20-30 minutes listening practice**\n**Weekly: 1 full mock test**\n**Result: Listening score 22-27/30 (above passing!)** 🎯"
          },
          subtasks: [
            { description: "TEIL 2 Practice: Complete official Modellsatz Teil 2 (monologue). While listening, write down ALL numbers, dates, and names immediately. After: check how many you captured correctly. Target: 4+/5 questions correct.", completed: false },
            { description: "TEIL 3 Practice: Complete official Modellsatz Teil 3 (conversation). Use M/F symbol system - mark next to each statement WHO said WHAT. Focus on tracking opinions and agreements/disagreements. Target: 5+/7 correct.", completed: false },
            { description: "Note-taking drill: Listen to 'DW Langsam gesprochene Nachrichten' (slow news) for 3 minutes. Use speed symbols (✓, ✗, →, M, F). Summarize in 5 bullet points. Practice writing FAST!", completed: false },
            { description: "Prediction training: Take 5 official Teil 2/3 question sets (questions only, no audio). For each, predict 10 German words you expect to hear. Then listen - how many of your predicted words appeared?", completed: false },
            { description: "Vocabulary building: Create themed word lists for 5 common listening topics (museum, company, travel, restaurant, health). Learn 20 words per theme with audio pronunciation. Use Forvo.com for native pronunciation.", completed: false },
            { description: "Speed training: Listen to one Easy German street interview (5-7 min). First time: note main points. Second time: try shadowing (repeat 2 seconds behind speaker). Builds real-time processing!", completed: false },
            { description: "Signal phrases practice: Listen to any 5-min German audio. Each time you hear signal phrase (besonders, aber, weil, deshalb, vor allem), pause and predict what comes next. Resume and check if you were right.", completed: false },
            { description: "Mock test: Do FULL official Listening Teil 2 + Teil 3 in one session (15 minutes total). No pause! Grade yourself: ___/12. Passing = 7+/12. Analyze mistakes using the common traps checklist.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Listening (Modellsatz)", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "DW Langsam gesprochene Nachrichten (Slow News)", url: "https://www.dw.com/de/deutsch-lernen/nachrichten/s-8030" },
            { name: "Easy German - Street Interviews (Real Conversations)", url: "https://www.youtube.com/c/EasyGerman" },
            { name: "Deutsche Welle - B1 Listening Exercises", url: "https://learngerman.dw.com/en/overview" },
            { name: "Forvo - German Pronunciation Dictionary", url: "https://forvo.com/languages/de" },
            { name: "Tagesschau (Normal Speed News for Advanced Practice)", url: "https://www.tagesschau.de" },
            { name: "German Podcasts for B1 Level (Spotify/Apple Podcasts)", url: "https://open.spotify.com" }
          ],
          notes: ""
        },
        {
          day: 5,
          task: "Speaking Teil 2: Presentation on Everyday Topic",
          focus: "speaking",
          level: "B1",
          lessonContent: {
            title: "Sprechen Teil 2: Your 3-Minute Presentation Masterclass",
            definition: "Speaking Teil 2 is where you SHINE! You get 15 minutes preparation time to create a 3-4 minute presentation on an everyday topic (your choice from 2 given topics). This task awards 28 points - nearly 1/3 of the entire speaking module score!\n\n**The Format:** Choose 1 topic from 2 options → Prepare notes for 15 minutes → Present for 3-4 minutes → Answer 1-2 follow-up questions.\n\n**What Makes This Different:** Unlike Teil 1 (dialogue), here you control the conversation. You're NOT responding to questions - you're delivering a structured monologue. Think of it as a 'mini TED talk' in German!\n\n**The 4-Part Structure (Non-Negotiable):**\n1. **Introduction** (30 seconds): State your topic, explain why it's relevant\n2. **Personal Experience** (1 minute): Share YOUR story/opinion with specific details\n3. **Pros and Cons** (1-1.5 minutes): Present both sides (Vorteile und Nachteile)\n4. **Situation in Your Country** (30 seconds): Describe how this topic relates to your home country\n\n**Scoring Criteria (What Examiners Look For):**\n- **Content & Structure** (8 points): All 4 parts covered, logical flow, stays on topic\n- **Vocabulary Range** (7 points): Variety of words, topic-specific terms, B1-level expressions\n- **Grammar Accuracy** (7 points): Correct cases, verb conjugations, sentence structures (minor errors OK!)\n- **Pronunciation & Fluency** (6 points): Clear speech, natural pace, minimal hesitation\n\n**Why This Section Matters:** Unlike writing (where you can edit) or listening (where you can't control speed), speaking tests your ability to think and communicate in real-time. Good news: With preparation, you can PRE-BUILD 90% of your presentation using universal frameworks!",
            example: "**COMPLETE PRESENTATION EXAMPLES (3 Full Models):**\n\n---\n\n**MODEL 1: Online Shopping (280 words, 3 min 15 sec)**\n\n**[INTRODUCTION - 30 sec]**\n'Guten Tag! Mein Thema heute ist Online-Shopping. Ich habe dieses Thema gewählt, weil es sehr aktuell ist. In den letzten Jahren kaufen immer mehr Menschen online ein, besonders seit der Corona-Pandemie. Das ist ein wichtiges Thema für alle.'\n\n*Translation: Good day! My topic today is online shopping. I chose this topic because it's very current. In recent years, more and more people shop online, especially since the Corona pandemic. This is an important topic for everyone.*\n\n**[PERSONAL EXPERIENCE - 1 min]**\n'Aus meiner eigenen Erfahrung kann ich sagen: Ich kaufe sehr oft online ein. Zum Beispiel habe ich letzte Woche ein Buch auf Amazon gekauft. Es war super praktisch! Ich saß zu Hause mit einer Tasse Kaffee, habe das Buch gesucht, und nach nur zwei Minuten war es bestellt. Das Paket kam drei Tage später direkt an meine Haustür. Ich musste nicht in die Stadt fahren, keinen Parkplatz suchen, und keine langen Schlangen im Geschäft. Das hat mir viel Zeit gespart!'\n\n*Translation: From my own experience I can say: I shop online very often. For example, last week I bought a book on Amazon. It was super practical! I sat at home with a cup of coffee, searched for the book, and after only two minutes it was ordered. The package came three days later directly to my door. I didn't have to drive to the city, search for parking, and no long lines in the store. That saved me a lot of time!*\n\n**[PROS AND CONS - 1 min 15 sec]**\n'Jetzt möchte ich über die Vorteile und Nachteile sprechen.\n\nEin großer Vorteil ist natürlich die Zeit. Man kann 24 Stunden am Tag einkaufen, auch nachts oder am Wochenende. Ein zweiter Vorteil ist die Auswahl: Im Internet gibt es tausende Produkte, viel mehr als in einem normalen Geschäft. Außerdem kann man Preise leicht vergleichen.\n\nAber es gibt auch Nachteile. Der größte Nachteil ist, dass man die Produkte nicht sehen oder anfassen kann vor dem Kauf. Besonders bei Kleidung ist das ein Problem - die Größe passt manchmal nicht! Ein anderer Nachteil ist die Lieferzeit: Man muss zwei oder drei Tage warten. Und es gibt auch ökologische Probleme mit der Verpackung und dem Transport.'\n\n*Translation: Now I'd like to talk about advantages and disadvantages. A big advantage is naturally time. You can shop 24 hours a day, even at night or on the weekend. A second advantage is selection: On the internet there are thousands of products, much more than in a normal store. Additionally, you can easily compare prices. But there are also disadvantages. The biggest disadvantage is that you can't see or touch products before buying. Especially with clothing that's a problem - the size sometimes doesn't fit! Another disadvantage is delivery time: you have to wait two or three days. And there are also ecological problems with packaging and transport.*\n\n**[SITUATION IN YOUR COUNTRY - 30 sec]**\n'In meinem Land, Pakistan [adjust to YOUR country!], ist Online-Shopping sehr populär, besonders bei jungen Leuten zwischen 20 und 40 Jahren. Es gibt viele lokale Websites wie Daraz, und auch internationale wie Amazon. Die meisten Menschen kaufen Elektronik, Bücher und Kleidung online. Aber ältere Menschen, wie meine Großeltern, kaufen lieber noch im Geschäft ein, weil sie den persönlichen Kontakt mögen.'\n\n*Translation: In my country, Pakistan, online shopping is very popular, especially among young people between 20 and 40. There are many local websites like Daraz, and also international ones like Amazon. Most people buy electronics, books, and clothing online. But older people, like my grandparents, prefer to shop in stores because they like personal contact.*\n\n**[CONCLUSION - 15 sec]**\n'Zusammenfassend kann ich sagen: Online-Shopping hat Vorteile und Nachteile, aber ich finde es insgesamt positiv. Vielen Dank für Ihre Aufmerksamkeit!'\n\n*Translation: In summary I can say: Online shopping has advantages and disadvantages, but I find it overall positive. Thank you for your attention!*\n\n---\n\n**MODEL 2: Social Media (265 words, 3 min)**\n\n**[INTRODUCTION]**\n'Guten Tag! Ich möchte heute über soziale Medien sprechen. Das ist ein sehr wichtiges und aktuelles Thema, weil fast alle Menschen heute Facebook, Instagram oder WhatsApp benutzen.'\n\n**[PERSONAL EXPERIENCE]**\n'Ich persönlich nutze soziale Medien jeden Tag. Meine Lieblings-App ist Instagram. Dort folge ich meinen Freunden, meiner Familie, und auch interessanten Menschen wie Reise-Bloggern. Jeden Morgen, wenn ich aufwache, schaue ich zuerst auf Instagram - das ist meine tägliche Routine! Ich poste auch manchmal Fotos von meinen Reisen oder von schönen Momenten. Letzten Monat habe ich ein Foto von meinem Geburtstag gepostet, und 50 Freunde haben \"Gefällt mir\" geklickt. Das hat mich sehr gefreut!'\n\n**[PROS AND CONS]**\n'Soziale Medien haben viele Vorteile. Erstens: Man kann einfach mit Freunden und Familie in Kontakt bleiben, auch wenn sie weit weg wohnen. Meine beste Freundin lebt in Kanada, aber wir chatten jeden Tag! Zweitens: Man kann viele interessante Informationen und Nachrichten finden.\n\nAber natürlich gibt es auch Nachteile. Das größte Problem ist die Zeit: Viele Menschen verbringen drei oder vier Stunden pro Tag auf sozialen Medien - das ist zu viel! Außerdem gibt es das Problem mit Privatsphäre und Datenschutz. Und manchmal sieht man nur perfekte Fotos von anderen Menschen, und das kann deprimierend sein.'\n\n**[SITUATION IN YOUR COUNTRY]**\n'In meinem Land sind soziale Medien extrem populär. Fast 70% der Bevölkerung nutzt mindestens eine Plattform. Facebook ist am beliebtesten, besonders bei älteren Menschen. Junge Leute zwischen 15 und 25 bevorzugen Instagram und TikTok.'\n\n**[CONCLUSION]**\n'Zusammenfassend: Soziale Medien sind ein wichtiger Teil unseres Lebens, aber wir müssen sie bewusst und nicht zu viel nutzen. Danke!'\n\n---\n\n**MODEL 3: Healthy Eating (250 words, 2 min 50 sec)**\n\n**[INTRODUCTION]**\n'Guten Tag! Heute spreche ich über gesunde Ernährung. Das ist ein sehr wichtiges Thema, weil viele Menschen heute Probleme mit Übergewicht und Gesundheit haben.'\n\n**[PERSONAL EXPERIENCE]**\n'Ich versuche, mich gesund zu ernähren. Zum Beispiel esse ich viel Obst und Gemüse - jeden Tag mindestens fünf Portionen. Zum Frühstück esse ich normalerweise Haferflocken mit Banane und Joghurt. Zum Mittagessen bevorzuge ich Salat mit Hühnchen oder Fisch. Ich versuche auch, Zucker und Fast Food zu vermeiden. Früher habe ich oft bei McDonald's gegessen, aber jetzt nur noch einmal pro Monat! Das war am Anfang schwer, aber jetzt fühle ich mich viel besser und habe mehr Energie.'\n\n**[PROS AND CONS]**\n'Die Vorteile von gesunder Ernährung sind klar: Man hat mehr Energie, man schläft besser, und das Risiko für Krankheiten wie Diabetes oder Herzprobleme ist niedriger. Außerdem fühlt man sich einfach gut!\n\nAber es gibt auch Nachteile. Erstens: Gesunde Lebensmittel sind oft teurer als Fast Food. Bio-Gemüse kostet manchmal doppelt so viel! Zweitens: Die Zubereitung braucht mehr Zeit. Man muss kochen, und das dauert 30 bis 40 Minuten. Viele Menschen haben nicht so viel Zeit nach der Arbeit.'\n\n**[SITUATION IN YOUR COUNTRY]**\n'In meinem Land wird das Thema gesunde Ernährung immer wichtiger. Es gibt jetzt viele Bio-Läden und vegetarische Restaurants. Besonders in großen Städten achten junge Menschen mehr auf ihre Ernährung. Aber auf dem Land essen die Menschen noch sehr traditionell.'\n\n**[CONCLUSION]**\n'Zusammenfassend: Gesunde Ernährung ist wichtig, aber nicht immer einfach. Man muss eine Balance finden. Danke schön!'\n\n---\n\n**10 UNIVERSAL TOPICS + READY-TO-USE FRAMEWORKS:**\n\n**Topic 1: Online Shopping**\nPros: Zeit sparen, große Auswahl, Preisvergleich, bequem von zu Hause\nCons: Kann Produkte nicht anfassen, Lieferzeit, Rücksendung kompliziert, ökologische Probleme\nPersonal Story: 'Letzte Woche habe ich ein Buch/Schuhe/Handy online gekauft...'\n\n**Topic 2: Social Media**\nPros: Kontakt mit Freunden, Informationen teilen, neue Leute kennenlernen, kostenlos\nCons: Zeitverschwendung, Privatsphäre-Probleme, Cybermobbing, abhängig werden\nPersonal Story: 'Ich nutze Instagram/Facebook täglich, um mit meinen Freunden zu kommunizieren...'\n\n**Topic 3: Healthy Eating**\nPros: Mehr Energie, bessere Gesundheit, niedrigeres Krankheitsrisiko, man fühlt sich gut\nCons: Teurer, braucht mehr Zeit zum Kochen, schwer zu finden im Restaurant\nPersonal Story: 'Ich versuche, viel Obst und Gemüse zu essen...'\n\n**Topic 4: Sports & Fitness**\nPros: Gesund für Körper, gut für Stress-Abbau, man trifft neue Leute, macht Spaß\nCons: Kostet Zeit, Fitness-Studio kann teuer sein, Verletzungsgefahr\nPersonal Story: 'Ich gehe dreimal pro Woche joggen/ins Fitnessstudio...'\n\n**Topic 5: Learning Foreign Languages**\nPros: Neue Jobchancen, Reisen einfacher, Gehirn-Training, neue Kultur verstehen\nCons: Schwierig, braucht viel Zeit und Geduld, Grammatik kann frustrierend sein\nPersonal Story: 'Ich lerne seit einem Jahr Deutsch, weil ich nach Deutschland ziehen möchte...'\n\n**Topic 6: Public Transportation**\nPros: Umweltfreundlich, günstiger als Auto, kann lesen während der Fahrt, kein Parkplatz-Problem\nCons: Manchmal Verspätungen, überfüllt in Rush Hour, nicht flexibel\nPersonal Story: 'Ich fahre jeden Tag mit dem Bus/der U-Bahn zur Arbeit...'\n\n**Topic 7: Working from Home (Homeoffice)**\nPros: Keine Pendelzeit, flexibler, kann in Pyjama arbeiten, ruhiger\nCons: Keine Trennung Arbeit/Privat, einsam, Ablenkungen zu Hause, schlechte Internet-Verbindung\nPersonal Story: 'Seit Corona arbeite ich von zu Hause. Am Anfang war es super, aber...'\n\n**Topic 8: Travel & Tourism**\nPros: Neue Kulturen erleben, Entspannung, schöne Erinnerungen, Horizont erweitern\nCons: Teuer, anstrengend, Jetlag, Umweltverschmutzung durch Flugzeuge\nPersonal Story: 'Letztes Jahr bin ich nach Italien/Thailand gereist...'\n\n**Topic 9: Smartphones & Technology**\nPros: Kommunikation überall, Zugang zu Informationen, Navigation mit GPS, Fotos machen\nCons: Ablenkung, Suchtgefahr, teuer, Privatsphäre-Risiko\nPersonal Story: 'Ich benutze mein Smartphone für alles - E-Mails, Nachrichten, Musik...'\n\n**Topic 10: Living in the City vs. Countryside**\nPros (City): Viele Jobs, gute Infrastruktur, Kultur (Kino, Theater), viele Restaurants\nCons (City): Laut, teuer, Stress, wenig Natur\nPros (Countryside): Ruhig, frische Luft, billiger, mehr Platz\nCons (Countryside): Wenig Jobs, schlechte Verkehrsanbindung, langweilig\nPersonal Story: 'Ich wohne in einer großen Stadt/auf dem Land, und...'\n\n---\n\n**ESSENTIAL PRESENTATION PHRASES (30+ You MUST Know):**\n\n**OPENING (Choose 1-2):**\n- Guten Tag! (Good day!)\n- Mein Thema heute ist... (My topic today is...)\n- Ich möchte heute über... sprechen. (I'd like to speak about... today)\n- Ich habe dieses Thema gewählt, weil... (I chose this topic because...)\n- Das ist ein sehr aktuelles/wichtiges Thema. (This is a very current/important topic)\n\n**INTRODUCING PERSONAL EXPERIENCE:**\n- Aus meiner eigenen Erfahrung kann ich sagen... (From my own experience I can say...)\n- Ich persönlich... (Personally, I...)\n- Zum Beispiel... (For example...)\n- In meiner Situation... (In my situation...)\n- Ich erinnere mich an... (I remember...)\n\n**LISTING POINTS:**\n- Erstens... zweitens... drittens... (Firstly... secondly... thirdly...)\n- Ein Vorteil/Nachteil ist... (An advantage/disadvantage is...)\n- Ein weiterer Punkt ist... (Another point is...)\n- Außerdem... (Moreover/Additionally...)\n- Darüber hinaus... (Beyond that...)\n\n**GIVING OPINIONS:**\n- Meiner Meinung nach... (In my opinion...)\n- Ich bin der Ansicht/Meinung, dass... (I am of the opinion that...)\n- Ich finde/denke/glaube, dass... (I find/think/believe that...)\n- Ich bin überzeugt, dass... (I'm convinced that...)\n\n**CONTRASTING:**\n- Aber... (But...)\n- Jedoch... (However...)\n- Auf der anderen Seite... (On the other hand...)\n- Einerseits... andererseits... (On one hand... on the other hand...)\n- Trotzdem... (Nevertheless...)\n- Im Gegensatz dazu... (In contrast to that...)\n\n**GIVING EXAMPLES:**\n- Zum Beispiel... (For example...)\n- Ein gutes Beispiel ist... (A good example is...)\n- Wie zum Beispiel... (Such as...)\n- Nehmen wir das Beispiel... (Let's take the example...)\n\n**DESCRIBING YOUR COUNTRY:**\n- In meinem Land... (In my country...)\n- Bei uns... (With us/Where I'm from...)\n- In [Pakistan/Turkey/China etc.]... (In [country]...)\n- Die Situation in meinem Land ist... (The situation in my country is...)\n\n**CONCLUDING:**\n- Zusammenfassend kann ich sagen... (In summary I can say...)\n- Abschließend möchte ich sagen... (In conclusion I'd like to say...)\n- Insgesamt denke ich... (Overall I think...)\n- Vielen Dank für Ihre Aufmerksamkeit! (Thank you for your attention!)\n- Danke schön! (Thank you!)\n\n---\n\n**DELIVERY TIPS (Body Language & Speaking Style):**\n\n**1. Eye Contact:**\n✅ Look at examiner 70% of the time\n✅ Glance at notes for facts/numbers\n❌ Don't stare at paper the whole time!\n\n**2. Voice & Pace:**\n✅ Speak slowly and clearly (B1 = not native speed!)\n✅ Pause between sections (1-2 seconds)\n✅ Vary your tone (don't be monotone!)\n❌ Don't rush! Quality > Speed\n\n**3. Hand Gestures:**\n✅ Use natural hand movements when emphasizing points\n✅ 'Firstly' = hold up one finger, 'Secondly' = two fingers\n❌ Don't overdo it - you're not conducting an orchestra!\n\n**4. Posture:**\n✅ Sit/stand upright\n✅ Relaxed shoulders\n❌ Don't slouch or fidget\n\n**5. Filler Words (Use Sparingly!):**\n✅ Also... (So...)\n✅ Ja... (Yes/Well...)\n❌ Ähm... (Um...)\n❌ Ehh... (Uhh...)\n\nIf you need a pause, STAY SILENT for 2 seconds rather than 'ähm'!",
            tips: "**15 ADVANCED SPEAKING STRATEGIES:**\n\n**1. The 'Universal Framework' Method:**\nPrepare ONE skeleton that works for ANY topic:\n- Opening template (30 sec)\n- Personal story template (1 min)\n- 2 Pros + 2 Cons (1 min)\n- Your country description (30 sec)\n- Closing template (15 sec)\n\nDuring exam prep, just plug in topic-specific vocabulary!\n\n**2. The '10 Topics Preparation' Strategy:**\nYou CAN predict topics! 90% of B1 presentations are about:\n1. Online Shopping\n2. Social Media\n3. Healthy Eating\n4. Sports/Fitness\n5. Learning Languages\n6. Public Transport\n7. Homeoffice/Remote Work\n8. Travel\n9. Technology/Smartphones\n10. City vs. Countryside\n\nPrepare ALL 10 in advance = exam confidence!\n\n**3. The 'Personal Story Bank' Technique:**\nCreate 5 ready-to-use stories (100 words each):\n- Shopping story (online/in store)\n- Social media experience\n- Health/food choice\n- Sports/exercise moment\n- Learning experience\n\nMemorise these! Adapt to fit any topic!\n\n**4. The 'Time Management' Rule:**\n**15 min prep time breakdown:**\n- 2 min: Choose topic (pick the easier one!)\n- 3 min: Brainstorm Pros/Cons (write 3 of each)\n- 5 min: Write detailed notes for personal experience\n- 3 min: Organize structure on paper\n- 2 min: Practice opening sentences mentally\n\nDON'T write full sentences - only keywords!\n\n**5. The 'Keyword Notes' Strategy:**\n✅ Write keywords only:\n'Online-Shopping → Zeit sparen → Buch Amazon → 3 Tage → bequem'\n\n❌ Don't write full sentences:\n'Ich habe letzten Dienstag ein Buch auf Amazon gekauft...'\n\nWhy? Full sentences = you'll READ them = points deducted!\n\n**6. The 'Pros/Cons Formula':**\nEvery topic has 4 universal arguments:\n\n**Universal PROS:**\n- Zeit sparen (save time)\n- Geld sparen (save money)\n- Bequem/Praktisch (convenient/practical)\n- Gesund (healthy)\n- Umweltfreundlich (eco-friendly)\n- Kontakt mit Menschen (social contact)\n- Neue Erfahrungen (new experiences)\n- Flexibel (flexible)\n\n**Universal CONS:**\n- Zeitverschwendung (waste of time)\n- Teuer (expensive)\n- Gesundheitsprobleme (health problems)\n- Umweltprobleme (environmental problems)\n- Einsam/isoliert (lonely/isolated)\n- Stress (stress)\n- Kompliziert (complicated)\n- Nicht sicher (not safe)\n\nPick 2-3 that fit your topic!\n\n**7. The 'Transition Word' Rule:**\nUse connectors between EVERY section:\n- 'Erstens... Zweitens... Drittens...' (Firstly... Secondly... Thirdly...)\n- 'Aber auf der anderen Seite...' (But on the other hand...)\n- 'Jetzt möchte ich über... sprechen' (Now I'd like to talk about...)\n\nThis creates professional flow!\n\n**8. The 'Filler Word Elimination' Technique:**\nInstead of 'ähm', use:\n- **Pause** (2 seconds of silence = thinking, not hesitating!)\n- **Repeat last phrase** ('Das ist interessant... ja, das ist wirklich interessant...')\n- **Use 'Also,'** (So,)\n- **Use 'Ja,'** (Yes/Well,)\n\nPractice: Record yourself → count 'ähms' → reduce by 50%!\n\n**9. The 'Confidence Booster' Preparation:**\nIn 15-min prep time:\n- Stand up and stretch (1 min)\n- Deep breaths (30 sec)\n- Smile while planning (tricks brain into relaxation!)\n- Visualize success ('I will speak clearly and confidently!')\n\nCalm mind = better performance!\n\n**10. The 'Error Recovery' Strategy:**\nMade a grammar mistake? DON'T panic or apologize!\n- ❌ 'Oh sorry, I mean...'\n- ✅ Just continue naturally!\n\nExaminers expect B1 errors. Confidence matters MORE than perfection!\n\n**11. The 'Topic Choice' Decision:\nGiven 2 topics, choose based on:\n1. Which topic do I know more vocabulary for?\n2. Which topic have I prepared?\n3. Which topic can I speak about personally?\n\n**Example:** Topics are 'Pets' vs 'Online Shopping'\n- If you don't have pets → choose Online Shopping!\n- If you hate shopping → choose Pets!\n\nPersonal connection = easier speaking!\n\n**12. The 'Country Section' Hack:**\nDon't know statistics? Make reasonable estimates:\n- ✅ 'Ich denke, etwa 60-70% der Menschen...'\n(I think about 60-70% of people...)\n- ✅ 'Besonders junge Leute zwischen 20 und 40...'\n(Especially young people between 20 and 40...)\n- ✅ 'In großen Städten wie [capital city]...'\n(In big cities like [capital]...)\n\nExaminers won't fact-check statistics!\n\n**13. The 'Mirror Practice' Method:**\nPractice 10 topics in front of mirror:\n- Day 1: Online Shopping + Social Media\n- Day 2: Healthy Eating + Sports\n- Day 3: Learning Languages + Public Transport\n- Day 4: Homeoffice + Travel\n- Day 5: Technology + City vs Countryside\n\nWatch yourself: Eye contact? Posture? Gestures?\n\n**14. The 'Recording & Analysis' Technique:**\nRecord yourself (phone video) presenting 1 topic:\n\nAnalyze:\n- [ ] Time: 2.5-3.5 minutes? (if under 2.5 = add more details!)\n- [ ] Structure: All 4 parts present?\n- [ ] Grammar: Count major errors (5+ = review!)\n- [ ] Filler words: Count 'ähms' (10+ = practice elimination!)\n- [ ] Pace: Too fast? Too slow?\n- [ ] Pronunciation: Clear? Understandable?\n\nRecord weekly → track improvement!\n\n**15. The 'Exam Day' Calm-Down Routine:**\n\n**Before Entering:**\n- Deep breaths (5 times)\n- Shake out hands and arms (release tension)\n- Smile (triggers endorphins!)\n\n**During 15-min Prep:**\n- If mind goes blank: Close eyes, breathe, start again\n- Use ALL 15 minutes (even if ready early, review notes!)\n\n**During Presentation:**\n- First sentence SLOWLY (sets confident tone)\n- Smile occasionally (shows confidence)\n- If you forget a word: Describe it! ('Das ist eine Person, die... that's a person who...')\n- Breathe between sections\n\n**Remember:** Examiners are NOT trying to fail you. They WANT you to succeed! Confidence = 50% of success!",
          },
          subtasks: [
            { description: "MASTER THE 10: Create detailed outlines (4 parts each) for all 10 universal topics. Write Pros/Cons lists, personal story ideas, country situations. Time: 2 hours. This is your exam insurance!", completed: false },
            { description: "MEMORIZE PHRASES: Learn 30 essential presentation phrases by heart (openings, transitions, opinions, contrasts, conclusions). Test yourself: Can you say them without looking? Create flashcards.", completed: false },
            { description: "RECORD & TIME: Choose 3 topics (Online Shopping, Social Media, Healthy Eating). Record yourself presenting each one. Time yourself - must be 2 minutes 30 seconds to 3 minutes 30 seconds. Listen back: Count 'ähms' and grammar errors.", completed: false },
            { description: "DAILY SPEAKING DRILL: For next 7 days, present 1 new topic daily in front of mirror. Practice eye contact, gestures, pace. Day 1: Sports, Day 2: Languages, Day 3: Public Transport, Day 4: Homeoffice, Day 5: Travel, Day 6: Technology, Day 7: City/Countryside.", completed: false },
            { description: "FILLER WORD ELIMINATION: Record 5-minute monologue on ANY topic. Count 'ähm'/'ehh' sounds. Goal: Reduce to <5 per minute. Replace with pauses or 'Also'. Practice until automatic.", completed: false },
            { description: "SIMULATION TEST: Have friend/tutor give you 2 random topics from the 10. Set timer: 15 minutes prep, 3-4 minutes presentation. They ask 1 follow-up question. Get feedback on structure, clarity, grammar.", completed: false },
            { description: "VOCABULARY BUILDING: For each of 10 topics, learn 10 specific words (total 100 words). E.g., Online Shopping: die Lieferung (delivery), das Paket (package), zurückschicken (return), der Rabatt (discount), etc.", completed: false },
            { description: "BODY LANGUAGE PRACTICE: Watch yourself on video. Check: Eye contact 70%+? Natural gestures? Good posture? Clear pronunciation? Smiling at start/end? Identify 3 improvements and practice.", completed: false },
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Speaking Samples (Video)", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "B1 Presentation Topics List (100+ topics)", url: "https://deutschb1.icu/goethe-zertifikat-b1-sprechen-themen-beispiele" },
            { name: "German Presentation Phrases PDF", url: "https://www.germanveryeasy.com/presentation-phrases" },
            { name: "Easy German - Speaking Practice Videos", url: "https://www.youtube.com/c/EasyGerman" },
            { name: "Forvo - Pronunciation Guide (hear words)", url: "https://forvo.com/languages/de" },
            { name: "LingQ - Speaking Confidence Course", url: "https://www.lingq.com" },
            { name: "iTalki - Find Speaking Practice Partners", url: "https://www.italki.com" },
          ],
          notes: ""
        },
        {
          day: 6,
          task: "Genitive Case + Two-Way Prepositions (Wechselpräpositionen)",
          focus: "grammar",
          level: "B1",
          lessonContent: {
            title: "Completing the Case System: Genitive + Two-Way Prepositions",
            definition: "Today you complete your mastery of German's 4-case system! **Genitive case** shows possession/belonging (like English 's or 'of'). While less common in everyday speech, it appears FREQUENTLY in Reading Teil 2 & 5 (formal texts, newspaper articles, rules/regulations).\n\n**Two-way prepositions (Wechselpräpositionen)** are the trickiest part of German cases! They take EITHER Accusative OR Dative depending on context. This is one of the MOST TESTED grammar points in Writing Teil 1 & 3.\n\n**Why This Matters:** Without understanding two-way prepositions, you'll make errors in 30-40% of your writing. Native speakers instantly recognize 'in den Park' (movement) vs 'im Park' (location) - you need this automaticity too!\n\n**Exam Reality:** Genitive shows up in 2-3 Reading questions. Two-way prepositions appear in EVERY writing task. Master these = instant boost to your grammar score!",
            example: "**GENITIVE CASE - THE COMPLETE PICTURE:**\n\n**Article Table:**\n\n| Case | Masculine | Feminine | Neuter | Plural |\n|------|-----------|----------|--------|--------|\n| NOM | der Mann | die Frau | das Kind | die Leute |\n| AKK | den Mann | die Frau | das Kind | die Leute |\n| DAT | dem Mann | der Frau | dem Kind | den Leuten |\n| **GEN** | **des Mannes** | **der Frau** | **des Kindes** | **der Leute** |\n\n🔑 **Key Rules:**\n1. Masculine & Neuter: Add **-s** or **-es** to the noun\n   - Short nouns (1 syllable): usually -es → des Mannes, des Kindes\n   - Longer nouns: usually -s → des Lehrers, des Autos\n2. Feminine & Plural: NO change to noun\n3. Genitive ALWAYS comes AFTER the noun it describes\n\n**Genitive Examples:**\n\n1. **Possession:**\n   - Das Auto **des Mannes** ist neu. (The man's car is new.)\n   - Die Tasche **der Frau** ist rot. (The woman's bag is red.)\n   - Das Spielzeug **des Kindes** liegt hier. (The child's toy lies here.)\n   - Die Meinung **der Leute** ist wichtig. (The people's opinion is important.)\n\n2. **With -n Masculine Nouns (Special Group!):**\n   Some masculine nouns add **-n** in ALL cases except nominative:\n   - der Student → des Student**en** (the student's)\n   - der Herr → des Herr**n** (the gentleman's)\n   - der Kollege → des Kollege**n** (the colleague's)\n   - der Mensch → des Mensch**en** (the human's)\n\n**GENITIVE PREPOSITIONS (The 'Formal Four' + extras):**\n\n**1. während (during) - Time**\n- Während **des Sommers** reise ich viel. (During the summer, I travel a lot.)\n- Während **der Prüfung** ist das Handy verboten. (During the exam, phones are forbidden.)\n\n**2. wegen (because of) - Reason**\n- Wegen **des Regens** bleiben wir zu Hause. (Because of the rain, we stay home.)\n- Wegen **der Krankheit** kann er nicht kommen. (Because of the illness, he can't come.)\n\n**3. trotz (despite, in spite of) - Contrast**\n- Trotz **des schlechten Wetters** gehen wir spazieren. (Despite the bad weather, we go walking.)\n- Trotz **der Probleme** ist sie optimistisch. (Despite the problems, she's optimistic.)\n\n**4. (an)statt (instead of) - Alternative**\n- Statt **des Autos** nehme ich den Bus. (Instead of the car, I take the bus.)\n- Anstatt **der Email** rufe ich an. (Instead of the email, I'll call.)\n\n**Additional Genitive Prepositions (Reading texts):**\n- außerhalb (outside of) → außerhalb **der Stadt** (outside the city)\n- innerhalb (inside of, within) → innerhalb **des Jahres** (within the year)\n- oberhalb (above) → oberhalb **des Sees** (above the lake)\n- unterhalb (below) → unterhalb **der Brücke** (below the bridge)\n\n**💡 Spoken German Alternative:**\nIn everyday speech, Germans often use **von + Dative** instead:\n- Das Auto von dem Mann (= das Auto des Mannes)\n- Die Tasche von der Frau (= die Tasche der Frau)\n\nFor Writing Teil 1 (informal), 'von' is acceptable!\nFor Writing Teil 3 (formal), use genitive to sound professional!\n\n---\n\n**TWO-WAY PREPOSITIONS - THE GAME-CHANGER:**\n\n**The Magic 9 Prepositions:**\n\n| Preposition | Basic Meaning | Example |\n|-------------|---------------|----------|\n| **an** | at, on (vertical surface) | an der Wand (on the wall) |\n| **auf** | on (horizontal surface) | auf dem Tisch (on the table) |\n| **hinter** | behind | hinter dem Haus (behind the house) |\n| **in** | in, into | in der Stadt (in the city) |\n| **neben** | next to, beside | neben der Tür (next to the door) |\n| **über** | over, above, about | über dem Sofa (above the sofa) |\n| **unter** | under, below, among | unter dem Bett (under the bed) |\n| **vor** | in front of, before | vor der Schule (in front of school) |\n| **zwischen** | between | zwischen den Häusern (between houses) |\n\n**THE GOLDEN RULE:**\n\n**Question: Wohin? (Where to?) = MOVEMENT → ACCUSATIVE**\n- Action with direction/destination\n- Moving FROM one place TO another\n- Verbs: gehen, fahren, legen, stellen, setzen, hängen\n\n**Question: Wo? (Where?) = LOCATION → DATIVE**\n- Static position\n- Already AT a place\n- Verbs: sein, bleiben, liegen, stehen, sitzen, hängen\n\n**DETAILED EXAMPLES:**\n\n**1. in (in/into) - Most Common!**\n\n**ACCUSATIVE (Wohin? - Movement):**\n- Ich gehe **in den** Park. (I'm going into the park.) [masc.]\n- Sie fährt **in die** Stadt. (She's driving into the city.) [fem.]\n- Wir gehen **ins** (in das) Kino. (We're going to the cinema.) [neut.]\n\n**DATIVE (Wo? - Location):**\n- Ich bin **im** (in dem) Park. (I am in the park.) [masc.]\n- Sie wohnt **in der** Stadt. (She lives in the city.) [fem.]\n- Das Buch liegt **im** Regal. (The book lies in the shelf.) [neut.]\n\n**2. auf (on/onto)**\n\n**ACCUSATIVE (Wohin?):**\n- Ich lege das Buch **auf den** Tisch. (I'm placing the book on the table.) [active placing]\n- Er stellt die Vase **auf den** Schrank. (He's putting the vase on the cupboard.)\n\n**DATIVE (Wo?):**\n- Das Buch liegt **auf dem** Tisch. (The book lies on the table.) [already there]\n- Die Vase steht **auf dem** Schrank. (The vase stands on the cupboard.)\n\n**3. an (at/onto - vertical surfaces)**\n\n**ACCUSATIVE (Wohin?):**\n- Ich hänge das Bild **an die** Wand. (I'm hanging the picture on the wall.)\n- Er geht **an den** See. (He's going to the lake.)\n\n**DATIVE (Wo?):**\n- Das Bild hängt **an der** Wand. (The picture hangs on the wall.)\n- Wir sind **am** (an dem) See. (We are at the lake.)\n\n**4. vor (in front of/before)**\n\n**ACCUSATIVE (Wohin?):**\n- Ich stelle das Auto **vor das** Haus. (I'm parking the car in front of the house.)\n\n**DATIVE (Wo?):**\n- Das Auto steht **vor dem** Haus. (The car stands in front of the house.)\n\n**5. hinter (behind)**\n\n**ACCUSATIVE (Wohin?):**\n- Die Katze läuft **hinter den** Baum. (The cat runs behind the tree.)\n\n**DATIVE (Wo?):**\n- Die Katze sitzt **hinter dem** Baum. (The cat sits behind the tree.)\n\n**6. zwischen (between)**\n\n**ACCUSATIVE (Wohin?):**\n- Ich setze mich **zwischen die** Freunde. (I'm sitting down between the friends.)\n\n**DATIVE (Wo?):**\n- Ich sitze **zwischen den** Freunden. (I sit between the friends.)\n\n**7. über (over/above)**\n\n**ACCUSATIVE (Wohin?):**\n- Der Vogel fliegt **über den** See. (The bird flies over the lake.)\n\n**DATIVE (Wo?):**\n- Die Lampe hängt **über dem** Tisch. (The lamp hangs above the table.)\n\n**8. unter (under)**\n\n**ACCUSATIVE (Wohin?):**\n- Der Hund kriecht **unter den** Tisch. (The dog crawls under the table.)\n\n**DATIVE (Wo?):**\n- Der Hund liegt **unter dem** Tisch. (The dog lies under the table.)\n\n**9. neben (next to)**\n\n**ACCUSATIVE (Wohin?):**\n- Ich stelle die Lampe **neben den** Fernseher. (I'm placing the lamp next to the TV.)\n\n**DATIVE (Wo?):**\n- Die Lampe steht **neben dem** Fernseher. (The lamp stands next to the TV.)\n\n**VERB PAIRS - CRITICAL!**\n\nThese verb pairs determine the case:\n\n| Movement (AKK) | Location (DAT) | English |\n|----------------|----------------|----------|\n| **legen** | **liegen** | to lay / to lie (things) |\n| **stellen** | **stehen** | to place / to stand (upright) |\n| **setzen** | **sitzen** | to set/sit down / to sit |\n| **hängen** | **hängen** | to hang (active) / to hang (state) |\n\n**Examples:**\n- Ich **lege** das Buch **auf den** Tisch. (I lay the book ON the table.) [AKK]\n- Das Buch **liegt** **auf dem** Tisch. (The book lies on the table.) [DAT]\n\n- Ich **stelle** die Flasche **in den** Kühlschrank. (I place the bottle IN the fridge.) [AKK]\n- Die Flasche **steht** **im** Kühlschrank. (The bottle stands in the fridge.) [DAT]",
            tips: "**GENITIVE MASTERY STRATEGIES:**\n\n**1. Recognition Over Production:**\nFor B1, you need to RECOGNIZE genitive in reading (90% of genitive's exam appearance).\nFor writing, you can usually avoid it with 'von + Dative'!\n\n**2. The '-s Rule' Memory Trick:**\nMasculine & neuter genitive = add 's like English possessive!\n- des Mann**s** = the man's\n- des Kind**s** = the child's\n\n**3. Genitive Preposition Mnemonic: 'W-T-S'**\n- **W**ährend (during)\n- Wegen / **T**rotz (because of / despite)\n- **S**tatt (instead of)\n\nAll take genitive! All appear in formal texts!\n\n**4. Reading Strategy:**\nWhen you see 'während/wegen/trotz/statt', the next noun is ALWAYS genitive.\nScan for 'des/der' after these words!\n\n---\n\n**TWO-WAY PREPOSITIONS MASTERY:**\n\n**1. The Movement Test:**\nAsk yourself: 'Is there a change of location?'\n- YES → Accusative\n- NO → Dative\n\nExample: 'I go to the park' (change: home → park) = **in den** Park (AKK)\nExample: 'I am in the park' (no change, already there) = **im** Park (DAT)\n\n**2. The Verb Clue:**\nMovement verbs = Accusative:\n- gehen (go), fahren (drive), legen (lay), stellen (place), setzen (set)\n\nPosition verbs = Dative:\n- sein (be), bleiben (stay), liegen (lie), stehen (stand), sitzen (sit)\n\n**3. Mnemonic for the 9 Prepositions:**\n'**An Auf Hinter In Neben Über Unter Vor Zwischen**'\n\nOr: 'All Angry Hippos In Norway Usually Understand Very Zany behavior'\n\n**4. Physical Practice:**\nActually DO the actions while saying them:\n- Walk to a chair: 'Ich gehe **zum** (zu dem) Stuhl' (movement = zu + DAT)\n- Sit down: 'Ich setze mich **auf den** Stuhl' (movement = AKK)\n- Stay sitting: 'Ich sitze **auf dem** Stuhl' (location = DAT)\n\nPhysical memory = stronger retention!\n\n**5. The 'Lay/Lie' English Parallel:**\nEnglish speakers struggle with lay/lie too!\n- **Lay** (active) = legen + AKK → 'I lay the book on the table'\n- **Lie** (state) = liegen + DAT → 'The book lies on the table'\n\nSame pattern in German!\n\n**6. Common Mistakes & Fixes:**\n\n❌ Ich bin in **den** Park. → ✅ Ich bin **im** Park.\n(You ARE there = location = dative)\n\n❌ Ich gehe in **dem** Park. → ✅ Ich gehe **in den** Park.\n(You're GOING there = movement = accusative)\n\n❌ Das Buch liegt auf **den** Tisch. → ✅ Das Buch liegt **auf dem** Tisch.\n(Lying = position verb = dative)\n\n❌ Ich lege das Buch auf **dem** Tisch. → ✅ Ich lege das Buch **auf den** Tisch.\n(Laying = placing verb = accusative)\n\n**7. Practice Sentence Pairs:**\nAlways practice in pairs to see the contrast:\n\nPair 1:\n- Ich gehe **ins** Bett. (I'm going to bed.) [AKK - movement]\n- Ich bin **im** Bett. (I am in bed.) [DAT - location]\n\nPair 2:\n- Er fährt **in die** Stadt. (He's driving to the city.) [AKK]\n- Er wohnt **in der** Stadt. (He lives in the city.) [DAT]\n\nPair 3:\n- Sie hängt das Bild **an die** Wand. (She hangs the picture on the wall.) [AKK]\n- Das Bild hängt **an der** Wand. (The picture hangs on the wall.) [DAT]\n\n**8. Writing Application:**\nWhen writing Teil 1 (informal email about weekend/vacation):\n- 'Ich bin **in die** Stadt gefahren.' (I drove to the city.) [AKK]\n- 'Ich war **in der** Stadt.' (I was in the city.) [DAT]\n- 'Wir sind **ins** Restaurant gegangen.' (We went to the restaurant.) [AKK]\n- 'Wir waren **im** Restaurant.' (We were in the restaurant.) [DAT]\n\nPractice these 4 sentences until automatic!\n\n**9. The 'Frozen Expressions' Shortcut:**\nSome combinations are ALWAYS the same:\n- **ins Kino** gehen (go to cinema) [AKK]\n- **im Kino** sein (be at cinema) [DAT]\n- **in die Schule** gehen (go to school) [AKK]\n- **in der Schule** sein (be at school) [DAT]\n- **ins Bett** gehen (go to bed) [AKK]\n- **im Bett** liegen (lie in bed) [DAT]\n\nMemorize these as chunks!\n\n**10. Daily Drill (5 minutes):**\nChoose one two-way preposition per day:\n\n**Monday = in**\n- Write 5 AKK sentences (Ich gehe in den...)\n- Write 5 DAT sentences (Ich bin in dem/im...)\n\n**Tuesday = auf**\n- Write 5 AKK sentences (Ich lege... auf den...)\n- Write 5 DAT sentences (... liegt auf dem...)\n\nContinue for all 9 prepositions. By Week 2, they're automatic!"
          },
          subtasks: [
            { description: "Memorize genitive articles table: des/der/des/der + masculine/neuter nouns add -s/-es. Write 10 genitive examples.", completed: false },
            { description: "Learn 4 core genitive prepositions (während, wegen, trotz, statt) + 4 extras (außerhalb, innerhalb, oberhalb, unterhalb). Create flashcards with 2 examples each.", completed: false },
            { description: "Reading practice: Find a B1 newspaper article (DW). Highlight ALL genitive constructions (während/wegen/trotz + des/der). Count how many you found.", completed: false },
            { description: "Memorize the 9 two-way prepositions: an, auf, hinter, in, neben, über, unter, vor, zwischen. Use mnemonic or create your own memory aid.", completed: false },
            { description: "Two-way prep DRILL: For each of 9 prepositions, write 2 sentences: 1 with AKK (movement), 1 with DAT (location). Total: 18 sentences.", completed: false },
            { description: "Verb pair practice: Learn legen/liegen, stellen/stehen, setzen/sitzen, hängen/hängen. Write 4 sentence pairs showing AKK vs DAT usage.", completed: false },
            { description: "Common phrases memorization: Learn 10 'frozen expressions' (ins Kino gehen, im Kino sein, in die Stadt fahren, in der Stadt wohnen, etc.).", completed: false },
            { description: "Self-test: 20 mixed sentences choosing correct case. Mark yourself: 18+ correct = mastery, 15-17 = review needed, <15 = repeat drill tomorrow.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "German Cases Complete Guide (All 4 Cases)", url: "https://www.germanveryeasy.com/cases" },
            { name: "Genitive Case Exercises", url: "https://www.schubert-verlag.de/aufgaben/xg/xg04_02.htm" },
            { name: "Two-Way Prepositions Interactive Exercise", url: "https://www.schubert-verlag.de/aufgaben/xo/xo03_07.htm" },
            { name: "Wechselpräpositionen Practice (with pictures)", url: "https://www.german-grammar.de/grammar/section.php?keyword=wechselpraepositionen" },
            { name: "Deutsche Welle - Prepositions Lesson", url: "https://learngerman.dw.com/en/prepositions/l-37897550" },
            { name: "Easy German Video - Prepositions Explained", url: "https://www.youtube.com/easygerman" }
          ],
          notes: ""
        },
        {
          day: 7,
          task: "Week 1 Review + Self-Assessment + Mock Reading Test",
          focus: "review",
          level: "B1",
          lessonContent: {
            title: "Week 1 Consolidation: Measuring Your Foundation",
            definition: "Review is WHERE learning becomes MASTERY! This isn't just 're-reading' notes - it's active testing, mistake analysis, and strategic planning for Week 2.\n\n**Why Review Days Matter:** Research shows that without review, you forget 70% of new information within 24 hours. Strategic review moves knowledge from short-term to long-term memory. This is your insurance policy!\n\n**Today's Goals:**\n1. Test Week 1 knowledge under exam-like conditions\n2. Identify weak areas that need extra practice\n3. Consolidate grammar (cases, present tense)\n4. Build confidence with first mock test\n5. Create personalized Week 2 focus plan\n\n**What You've Covered This Week:**\n- 4-case system (NOM, AKK, DAT, GEN)\n- Present tense (regular + 15 irregular verbs)\n- 150+ family/relationship vocabulary\n- Reading strategies (all 5 Teile)\n- Listening strategies (all 4 Teile)\n- Speaking Teil 1 & 2 basics\n- Two-way prepositions (the tricky 9!)\n\nThat's A LOT! Time to consolidate and test!",
            example: "**WEEK 1 COMPREHENSIVE MASTERY CHECKLIST:**\n\n---\n\n**✅ GRAMMAR KNOWLEDGE (40% of exam success):**\n\n**Case System:**\n- [ ] Can you recite all 4 case articles (der/die/das in NOM/AKK/DAT/GEN)?\n- [ ] Do you know when to use Nominative? (Subject = WHO/WHAT does action)\n- [ ] Do you know when to use Accusative? (Direct object + nach/durch/für/ohne/um/gegen)\n- [ ] Do you know when to use Dative? (Indirect object + 'to/for whom' + aus/bei/mit/nach/seit/von/zu)\n- [ ] Do you know when to use Genitive? (Possession + während/wegen/trotz/statt)\n\n**Test Yourself:**\nFill in correct articles:\n1. Ich helfe ___ Freund (DAT). → dem\n2. Er sieht ___ Film (AKK). → den\n3. Das Auto ___ Lehrers (GEN) ist neu. → des\n4. ___ Kind (NOM) spielt. → Das\n\n**Two-Way Prepositions:**\n- [ ] Can you name all 9? (an, auf, hinter, in, neben, über, unter, vor, zwischen)\n- [ ] Do you know the rule? (Movement = AKK, Location = DAT)\n- [ ] Can you distinguish legen (AKK) vs liegen (DAT)?\n\n**Test Yourself:**\n1. Ich gehe ___ ___ Park. (in + der/den?) → **in den** (movement = AKK)\n2. Ich bin ___ ___ Park. (in + der/dem?) → **im** (location = DAT)\n3. Das Buch liegt ___ ___ Tisch. (auf + der/dem?) → **auf dem** (position = DAT)\n\n**Present Tense:**\n- [ ] Can you conjugate regular verbs? (kaufen: kaufe, kaufst, kauft...)\n- [ ] Do you know sein/haben/werden? (THE essential 3)\n- [ ] Can you name 10 irregular verbs? (fahren, essen, sehen, lesen, sprechen...)\n- [ ] Do you know stem-changing patterns? (a→ä, e→i, e→ie)\n\n**Test Yourself:**\nConjugate 'sein' (all 6 persons): bin, bist, ist, sind, seid, sind\nConjugate 'fahren' (ich/du/er): fahre, fährst, fährt\n\n**Score: ___/15 Grammar Points**\n- 13-15: Excellent! Ready for Week 2\n- 10-12: Good! Review weak areas\n- <10: STOP! Re-do Days 1-6 before continuing\n\n---\n\n**✅ VOCABULARY (30% of exam success):**\n\n**Family & Relationships (150+ words):**\n- [ ] Can you name immediate family (Vater, Mutter, Bruder, Schwester, Kind)?\n- [ ] Do you know extended family (Onkel, Tante, Cousin/Cousine, Großeltern)?\n- [ ] Can you describe relationships (verheiratet, geschieden, ledig, verlobt)?\n- [ ] Do you know 20 adjectives to describe people (nett, freundlich, hilfsbereit...)?\n- [ ] Have you learned articles + plurals? (der Bruder, die Brüder)\n\n**Test Yourself (English → German with article):**\n1. Father → der Vater\n2. Sisters (plural) → die Schwestern\n3. Married → verheiratet\n4. Friendly → freundlich\n5. To meet (someone) → kennenlernen\n\n**Score: ___/5 Vocabulary Points**\n- 5/5: Perfect recall!\n- 3-4/5: Good! Review daily\n- <3/5: Make flashcards TODAY\n\n---\n\n**✅ READING STRATEGIES (25% of exam success):**\n\n**Strategic Reading:**\n- [ ] Do you read questions BEFORE texts?\n- [ ] Can you scan for keywords quickly?\n- [ ] Do you know the 65-minute time allocation? (10-15-12-13-10 + 5 transfer)\n- [ ] Do you understand True/False/Not Mentioned distinction?\n- [ ] Can you use process of elimination in MCQs?\n\n**Connector Words:**\n- [ ] Do you know 20 connectors? (jedoch, außerdem, deswegen, trotzdem, zum Beispiel...)\n\n**Test Yourself - Reading Teil 1 (10 minutes):**\nTake official sample exam Teil 1 (Blog/Email with 6 T/F questions)\n\n**Score: ___/6 Reading Points**\n- 5-6: Excellent strategy!\n- 3-4: Good! Practice daily\n- <3: Review Day 3 strategies\n\n---\n\n**✅ LISTENING STRATEGIES (25% of exam success):**\n\n**Active Listening:**\n- [ ] Do you know which Teile play twice? (Teil 1 & 4)\n- [ ] Can you take notes with symbols? (✓, ✗, M, F, →)\n- [ ] Do you write numbers immediately when heard?\n- [ ] Do you know the 40-minute breakdown? (15-10-5-10)\n- [ ] Can you predict content from questions?\n\n**Test Yourself - Listening Teil 1 (15 minutes):**\nTake official sample exam Teil 1 (5 short texts with 10 questions)\n\n**Score: ___/10 Listening Points**\n- 8-10: Excellent! Ears are trained!\n- 6-7: Good! Keep daily practice\n- <6: More audio exposure needed\n\n---\n\n**✅ SPEAKING PREPARATION (20% of exam success):**\n\n**Speaking Teil 1 (Planning Task):**\n- [ ] Do you know the 4-part structure? (Intro → Experience → Pro/Con → Your Country)\n- [ ] Can you speak for 3 minutes without reading?\n- [ ] Have you practiced 5 universal topics?\n- [ ] Do you use planning phrases? (Wie wäre es mit...? Was meinst du?)\n\n**Test Yourself:**\nRecord 2-minute monologue on 'My Family' topic. Listen back. Rate:\n- Grammar errors? Count: ___\n- Vocabulary variety? Good/Average/Poor\n- Fluency? Smooth/Some pauses/Many pauses\n- Pronunciation? Clear/Understandable/Unclear\n\n---\n\n**TODAY'S MOCK TEST - READING TEIL 1 + 2 (25 minutes):**\n\n**Instructions:**\n1. Download official Goethe B1 sample exam (Modellsatz)\n2. Set timer for 25 minutes (exact!)\n3. Do Teil 1 (Blog) + Teil 2 (Press articles)\n4. NO dictionary, NO pausing\n5. Mark your answers\n6. Score yourself using answer key\n\n**Scoring:**\n- Teil 1: 6 points\n- Teil 2: 6 points\n- **Total: ___/12 points**\n\n**Interpretation:**\n- 10-12 points (83-100%): EXCELLENT! You're above passing level!\n- 7-9 points (58-75%): GOOD! Just above passing, keep practicing!\n- 5-6 points (42-50%): BORDERLINE! Extra reading practice needed!\n- <5 points: URGENT! Review reading strategies (Day 3) before Week 2!\n\n---\n\n**MISTAKE ANALYSIS TEMPLATE:**\n\nFor EACH wrong answer, analyze:\n\n**Question #___**\n\n**1. What was the question asking?**\n(Time? Place? Person? Reason?)\n\n**2. What did I answer?**\n(Write your answer)\n\n**3. What was the correct answer?**\n(From answer key)\n\n**4. WHY was I wrong?**\n- [ ] Didn't understand vocabulary\n- [ ] Misread the question\n- [ ] Didn't find the info in text\n- [ ] Confused 'not mentioned' with 'false'\n- [ ] Ran out of time\n- [ ] Other: _______\n\n**5. What will I do differently next time?**\n(Specific strategy change)\n\n**Example Analysis:**\n\nQuestion #3: 'Maria findet das Restaurant teuer.'\n- What asked: Maria's opinion about restaurant price\n- I answered: Richtig (True)\n- Correct answer: Text sagt dazu nichts (Not mentioned)\n- Why wrong: Text says 'Restaurant war gut' but NO mention of price. I assumed expensive = good quality.\n- Next time: Don't infer! Only mark 'true' if explicitly stated.\n\n---\n\n**WEEK 1 OVERALL ASSESSMENT:**\n\n**Strengths (What went well):**\n1. _______________________________\n2. _______________________________\n3. _______________________________\n\n**Weaknesses (What needs more work):**\n1. _______________________________\n2. _______________________________\n3. _______________________________\n\n**Week 2 Focus Areas:**\nBased on your weaknesses, choose 2-3 priorities:\n- [ ] Case system practice (still confusing)\n- [ ] Vocabulary building (need more words)\n- [ ] Reading speed (too slow)\n- [ ] Listening comprehension (missing too much)\n- [ ] Grammar accuracy (too many errors)\n- [ ] Speaking fluency (too many pauses)\n\n**Week 2 Daily Study Plan:**\n\n**Morning (30 min):**\n- 10 min: Anki flashcard review (Week 1 vocab)\n- 10 min: Grammar drill (focus on weak areas)\n- 10 min: Reading one B1 article (DW)\n\n**Evening (30 min):**\n- 15 min: Listening practice (podcast or official audio)\n- 10 min: Speaking practice (record yourself)\n- 5 min: Update learning journal\n\n**Weekend (2 hours):**\n- 1 hour: Mock test (different Teil each week)\n- 1 hour: Mistake analysis + targeted review\n\n---\n\n**MOTIVATION CHECKPOINT:**\n\n**How do you feel after Week 1?**\n- [ ] Confident! I understand the exam format and have good strategies.\n- [ ] Okay. Some parts are hard, but I'm making progress.\n- [ ] Overwhelmed. There's so much to learn!\n- [ ] Frustrated. I'm not improving as fast as I hoped.\n\n**If overwhelmed or frustrated:** That's NORMAL! Week 1 is information-dense. Remember:\n1. You don't need to be perfect - just 60% in each module!\n2. Repetition is key - Week 2 will reinforce Week 1\n3. Small daily practice beats long weekend crams\n4. You have 11 more weeks - pace yourself!\n\n**Positive Reinforcement:**\nWrite 3 things you learned this week that you didn't know before:\n1. _______________________________\n2. _______________________________\n3. _______________________________\n\n**Celebrate small wins!** Did you:\n- [ ] Complete all 6 days?\n- [ ] Learn 100+ new words?\n- [ ] Understand the case system?\n- [ ] Take your first mock test?\n\nYES to any of these = SUCCESS! Keep going! 🎉",
            tips: "**ADVANCED REVIEW STRATEGIES:**\n\n**1. The 'Spaced Repetition' Schedule:**\n\nResearch-proven timing for reviews:\n- **Day 1:** Learn new material\n- **Day 2:** Review (24 hours later) - 10 min\n- **Day 7:** Review (1 week later) - 5 min ← TODAY!\n- **Day 30:** Review (1 month later) - 5 min\n\nThis pattern embeds knowledge permanently!\n\n**2. The 'Active Recall' Technique:**\n\n❌ **Passive Review:** Re-reading notes\n✅ **Active Review:** Close book, write everything you remember\n\nActive recall is 200% more effective! Try:\n- Cover German words, try to recall from English\n- Write case tables from memory\n- Explain grammar rules out loud (teach yourself!)\n\n**3. The 'Feynman Technique':**\n\nCan you explain it simply?\n- Choose one topic (e.g., Accusative case)\n- Explain it to a child (or imaginary friend!)\n- If you struggle, you don't truly understand it\n- Re-learn and simplify until explanation is clear\n\n**4. The 'Pomodoro Method' for Review:**\n\n- 25 min: Focused review (one topic)\n- 5 min: Break (walk, stretch)\n- Repeat 4 times\n- 30 min: Long break\n\nPrevents mental fatigue! Maintains concentration!\n\n**5. The 'Mistake Log' System:**\n\nCreate a dedicated notebook:\n- **Date | Topic | Mistake | Why | Correction**\n- Review this log weekly\n- Common mistakes become learning priorities\n\n**6. The 'Self-Quiz' Method:**\n\nCreate your own quiz:\n- 10 case questions (fill in articles)\n- 10 verb conjugations\n- 20 vocabulary (English → German)\n- 5 reading comprehension questions\n\nTake it weekly. Track improvement!\n\n**7. The 'Teach Someone' Strategy:**\n\nFind a study partner or language exchange:\n- Explain Week 1 grammar to them\n- Teaching = deepest learning\n- If no partner, record yourself teaching\n\n**8. The 'Visual Summary' Technique:**\n\nCreate one-page visual summaries:\n- Mind map of case system\n- Flowchart: 'Which case to use?'\n- Vocabulary diagram by theme\n\nVisual = easier to remember!\n\n**9. The 'Real-World Application' Test:**\n\nUse what you learned:\n- Write a paragraph about your family (use vocabulary + cases)\n- Describe your room using two-way prepositions\n- Tell yesterday's story in present tense\n\nIf you can USE it, you've MASTERED it!\n\n**10. The 'Progress Journal' Habit:**\n\nEnd each week writing:\n- What I learned: [3 things]\n- What I found hard: [2 challenges]\n- What I'll focus on next week: [2 goals]\n- My confidence level: [1-10]\n\nTracking progress = motivation boost!\n\n**11. Common Review Mistakes:**\n\n❌ **Mistake:** Cramming everything in one day\n✅ **Fix:** Spread review over 3-4 days\n\n❌ **Mistake:** Only reviewing 'easy' material\n✅ **Fix:** Focus 80% on weak areas\n\n❌ **Mistake:** Not testing yourself\n✅ **Fix:** Mock tests reveal true understanding\n\n❌ **Mistake:** Reviewing passively (just reading)\n✅ **Fix:** Active recall (write/speak from memory)\n\n❌ **Mistake:** Skipping review day\n✅ **Fix:** Review is MORE important than new learning!\n\n**12. Week 2 Preview - What's Coming:**\n\n**Grammar:**\n- Perfekt tense (past tense for conversations!)\n- Präteritum basics (simple past)\n- Separable vs inseparable verbs\n\n**Vocabulary:**\n- Daily routine (200 words)\n- Food & restaurants (150 words)\n- Travel & transport (150 words)\n\n**Writing:**\n- Teil 1: Informal email (full practice)\n- Email structure and phrases\n\n**Listening:**\n- Teil 2 & 3 practice\n- Note-taking techniques\n\n**Speaking:**\n- Teil 2: Presentation practice\n- Opinion phrases\n\n**Get excited! Week 2 builds on this foundation!**"
          },
          subtasks: [
            { description: "MOCK TEST: Take Reading Teil 1 + Teil 2 from official sample exam. Time: 25 minutes exactly. NO dictionary. Score: ___/12. Passing = 7+.", completed: false },
            { description: "Mistake Analysis: For EACH wrong answer, complete the 5-question analysis template (What asked? My answer? Correct answer? Why wrong? Strategy change?).", completed: false },
            { description: "Grammar Review: Write case table from memory (all 4 cases, all 4 genders). Then check. If any errors, rewrite correctly 5 times.", completed: false },
            { description: "Vocabulary Self-Test: Create flashcard quiz - 50 words from Week 1. Test yourself: English → German with article. Score: ___/50. <40 = review needed.", completed: false },
            { description: "Two-Way Prepositions Drill: Write 10 sentence pairs (1 AKK, 1 DAT for same preposition). E.g., 'Ich gehe in den Park' / 'Ich bin im Park'.", completed: false },
            { description: "Speaking Practice: Record 3-minute monologue 'My Week 1 Learning Journey' in German. Include: what you learned, what was hard, what you'll focus on. Listen back and note 3 improvements needed.", completed: false },
            { description: "Create your Week 2 Study Plan: Based on today's assessment, write specific daily goals (vocabulary targets, grammar drills, practice times).", completed: false },
            { description: "Progress Journal: Complete Week 1 reflection - 3 strengths, 3 weaknesses, 3 Week 2 focus areas. Be honest - this guides your improvement!", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Sample Exam (Modellsatz) - ALL modules", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "B1 Self-Assessment Checklist (PDF)", url: "https://www.goethe.de" },
            { name: "Anki - Spaced Repetition Software", url: "https://ankiweb.net" },
            { name: "Study Planning Template", url: "https://www.goethe.de" },
            { name: "German Grammar Summary (A1-B1)", url: "https://www.germanveryeasy.com" },
            { name: "Progress Tracking Spreadsheet Template", url: "https://docs.google.com/spreadsheets" }
          ],
          notes: ""
        }
      ]
    },

    // ============== WEEK 3: MODAL VERBS & FORMAL WRITING ==============
    {
      week: 3,
      goal: "Modal Verbs + Writing Teil 2 (Forum Post) + Reading Strategies",
      targetVocabulary: 200,
      estimatedHours: "16-20 hours",
      days: [
        {
          day: 1,
          task: "Modal Verbs: können, müssen, wollen, dürfen, sollen, mögen",
          focus: "grammar",
          level: "B1",
          lessonContent: {
            title: "Modal Verbs: The Permission, Obligation, and Desire Squad",
            definition: "**Modal verbs** express ability, necessity, permission, desire. Structure: **Subject + modal (conjugated) + ... + main verb (infinitive at END)**. Essential for expressing opinions (Speaking Teil 3) and writing suggestions. All 6 modals have irregular present tense - MUST memorize!",
            example: "**THE 6 MODALS:**\n\n**können** (can, able to):\nich kann, du kannst, er kann, wir können, ihr könnt, sie können\n*Ich kann Deutsch sprechen.*\n\n**müssen** (must, have to):\nich muss, du musst, er muss, wir müssen, ihr müsst, sie müssen\n*Du musst die Hausaufgaben machen.*\n\n**wollen** (want to):\nich will, du willst, er will, wir wollen, ihr wollt, sie wollen\n*Sie will nach Italien fahren.*\n\n**dürfen** (may, allowed to):\nich darf, du darfst, er darf, wir dürfen, ihr dürft, sie dürfen\n*Hier darf man nicht rauchen.*\n\n**sollen** (should, supposed to):\nich soll, du sollst, er soll, wir sollen, ihr sollt, sie sollen\n*Du sollst mehr Wasser trinken.* (advice/recommendation)\n\n**mögen** (like) / möchten (would like - polite):\nich mag/möchte, du magst/möchtest, er mag/möchte\n*Ich möchte einen Kaffee.* (polite request)\n\n**WORD ORDER RULE:**\nSubject + modal + OTHER STUFF + infinitive\n*Ich **muss** morgen früh **aufstehen**.*",
            tips: "**MEANING NUANCES:** 'müssen' = strong obligation (I have to), 'sollen' = recommendation/expectation (I should). 'wollen' = strong desire (I want), 'möchten' = polite want (I would like). For Speaking Teil 3, use 'man sollte...' (one should) to give suggestions - sounds more B1 than 'du musst!' Learn these perfect forms: können→gekonnt, müssen→gemusst, wollen→gewollt (though rarely used - usually: Ich habe gehen wollen)."
          },
          subtasks: [
            { description: "Memorize all 6 modal verbs present tense conjugations (use flashcards for ich/du/er forms first).", completed: false },
            { description: "Write 12 sentences using each modal twice - vary the main verbs (gehen, machen, kaufen, etc.).", completed: false },
            { description: "Practice word order: 10 questions and answers with modals ('Kannst du...?' 'Ja, ich kann...').", completed: false },
            { description: "Learn negative forms: 'nicht müssen' (don't have to) vs 'nicht dürfen' (not allowed) - 5 examples each.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Modal Verbs Conjugation", url: "https://www.verbformen.com" },
            { name: "Modal Verbs Exercises", url: "https://www.schubert-verlag.de" }
          ],
          notes: ""
        },
        {
          day: 2,
          task: "Writing Teil 2: Semi-Formal Forum Post",
          focus: "writing",
          level: "B1",
          lessonContent: {
            title: "Schreiben Teil 2: The Online Forum Opinion Piece",
            definition: "Writing Teil 2 (20 min, 25 points) = respond to online forum discussion. Semi-formal tone (use 'Sie' or no direct address). State YOUR OPINION clearly + give reasons/examples. ~80 words. Topic is always a current social issue (smartphones in school, work-life balance, etc.). Must show you can argue a position!",
            example: "**TYPICAL FORUM TOPIC:**\n'Should employees be allowed to work from home?'\n\n**WINNING STRUCTURE:**\n\n**Opening (State position):**\n'Meiner Meinung nach sollten Mitarbeiter von zu Hause arbeiten dürfen.'\n*(In my opinion, employees should be allowed to work from home.)*\n\n**Reason 1 + Example:**\n'Ein wichtiger Vorteil ist die Flexibilität. Zum Beispiel kann man die Arbeitszeit besser mit der Familie kombinieren.'\n\n**Reason 2 + Example:**\n'Außerdem spart man viel Zeit, weil man nicht zur Arbeit fahren muss. Das ist besonders in Großstädten wichtig.'\n\n**Acknowledge opposite view (optional but impressive!):**\n'Natürlich gibt es auch Nachteile, wie weniger Kontakt zu Kollegen.'\n\n**Conclusion:**\n'Trotzdem bin ich überzeugt, dass Homeoffice eine gute Lösung ist.'\n\n**KEY PHRASES FOR OPINIONS:**\n- Meiner Meinung nach... (In my opinion)\n- Ich bin der Ansicht, dass... (I believe that)\n- Ich bin überzeugt, dass... (I'm convinced that)\n- Ein Vorteil/Nachteil ist... (An advantage/disadvantage is)\n- Zum Beispiel... (For example)\n- Außerdem... (Moreover)\n- Trotzdem... (Nevertheless)",
            tips: "**STRATEGY:** Use a 3-part formula: 1) Your opinion (1 sentence), 2) Two reasons with examples (3-4 sentences total), 3) Conclusion (1 sentence). This ensures you hit 80 words and stay focused. DON'T use 'du' - either 'man' (one/people) or no direct address. Practice 10 common topics: online shopping, social media, public transport, healthy eating, sports, learning languages, etc. Have your 'universal reasons' ready (Zeit sparen, Geld sparen, flexibel sein, Gesundheit)!"
          },
          subtasks: [
            { description: "Memorize 15 opinion/argumentation phrases (Meiner Meinung nach, Ich bin überzeugt, Ein Vorteil ist...).", completed: false },
            { description: "PRACTICE: Write 3 forum posts on different topics - 20 minutes each, exactly 80 words.", completed: false },
            { description: "Learn 20 'topic-neutral' nouns useful for any argument: der Vorteil, der Nachteil, die Flexibilität, die Zeit, das Geld, die Gesundheit, die Erfahrung, das Problem, die Lösung, die Möglichkeit.", completed: false },
            { description: "Compare informal (Teil 1) vs semi-formal (Teil 2): Make a list of 5 key differences (greetings, pronouns, tone).", completed: false }
          ],
          completed: false,
          resources: [
            { name: "B1 Forum Writing Samples", url: "https://www.goethe.de" },
            { name: "Opinion Phrases List", url: "https://www.germanveryeasy.com/opinion-expressions" }
          ],
          notes: ""
        },
        {
          day: 3,
          task: "Vocabulary: Work & Education (200 words)",
          focus: "vocabulary",
          level: "B1",
          lessonContent: {
            title: "Thematic Block 3: Professional Life",
            definition: "Work and education are MAJOR themes in B1 exam - appear in reading, listening, speaking, and writing. Learn job titles, workplace vocabulary, and education system terms. Critical for Speaking Teil 2 presentations and Reading Teil 2 (press articles often about work trends).",
            example: "**WORK VOCABULARY (Must-Know 100):**\n\n**Job Titles (with articles!):**\n- der Arzt / die Ärztin (doctor)\n- der Lehrer / die Lehrerin (teacher)\n- der Ingenieur / die Ingenieurin (engineer)\n- der Verkäufer / die Verkäuferin (salesperson)\n- der Koch / die Köchin (cook/chef)\n- der Kellner / die Kellnerin (waiter/waitress)\n- der Mechaniker / die Mechanikerin (mechanic)\n- der Programmierer / die Programmiererin (programmer)\n\n**Workplace:**\n- das Büro, -s (office)\n- die Firma, Firmen (company)\n- der Betrieb, -e (business/operation)\n- der Kollege, -n / die Kollegin, -nen (colleague)\n- der Chef / die Chefin (boss)\n- das Gehalt, -̈er (salary)\n- die Arbeitsstelle, -n (job position)\n- der Arbeitsplatz, -̈e (workplace)\n- die Bewerbung, -en (application)\n- der Lebenslauf, -̈e (CV/resume)\n- das Vorstellungsgespräch, -e (job interview)\n\n**Work Actions:**\n- sich bewerben (um + Akk) (to apply for)\n- einstellen (to hire)\n- kündigen (to quit/fire)\n- verdienen (to earn)\n- befördern (to promote)\n\n**EDUCATION:**\n- die Schule, -n (school)\n- die Universität, -en (university)\n- der Abschluss, -̈e (degree)\n- die Ausbildung, -en (vocational training)\n- das Studium, Studien (studies)\n- die Prüfung, -en (exam)\n- bestehen (to pass)\n- durchfallen (to fail)",
            tips: "**EXAM CONNECTION:** For Speaking Teil 2, prepare a 3-minute talk on 'My Job' or 'My Studies'. Structure: What you do → What you like/dislike → Future plans. Use modal verbs: 'Ich muss jeden Tag früh aufstehen' (I have to get up early every day). Learn male AND female forms of jobs - shows B1 level awareness!"
          },
          subtasks: [
            { description: "Create flashcards for 50 job titles (with articles + male/female forms where applicable).", completed: false },
            { description: "Learn 30 workplace nouns + 10 work-related verbs (with example sentences).", completed: false },
            { description: "Write a short text (100 words): 'My ideal job' - use modal verbs (Ich möchte..., Ich muss nicht...).", completed: false },
            { description: "Learn education system terms + practice explaining your own education background in German (2 min speaking).", completed: false }
          ],
          completed: false,
          resources: [
            { name: "German Job Vocabulary", url: "https://www.germanveryeasy.com/jobs" },
            { name: "Work & Career Vocabulary", url: "https://quizlet.com/subject/german-b1-work" }
          ],
          notes: ""
        },
        {
          day: 4,
          task: "Reading Teil 3 & 4 Practice: Matching & Opinions",
          focus: "reading",
          level: "B1",
          lessonContent: {
            title: "Reading Strategies: Teil 3 (Ads) & Teil 4 (Opinion Texts)",
            definition: "**Teil 3** (7 points): Match 7 people with needs to 10 ads/announcements. **Teil 4** (7 points): Read 4 opinion texts on a topic, match 7 statements to correct person. Both require SCANNING skills - you don't read everything, you hunt for keywords! Process of elimination is your friend.",
            example: "**TEIL 3 STRATEGY:**\nYou have 7 people with specific needs + 10 ads (3 are 'distractors' - won't match anyone!).\n\n**Example Person:**\n'Max sucht einen Deutschkurs am Wochenende in München. Er will in kleinen Gruppen lernen.'\n\n**Your Task:** Scan 10 ads for keywords:\n- München ✓\n-"
            }
        }
      ]
    }
  ]};

  const vocabularyData = [
    { word: "Nominativ", translation: "nominative case", focus: "grammar", week: 1 },
    { word: "Akkusativ", translation: "accusative case", focus: "grammar", week: 1 },
    { word: "Der Tisch", translation: "the table", focus: "vocabulary", week: 1 },
    { word: "Die Familie", translation: "the family", focus: "vocabulary", week: 1 },
    { word: "Arbeiten", translation: "to work", focus: "vocabulary", week: 1 },
    { word: "Das Restaurant", translation: "the restaurant", focus: "vocabulary", week: 2 },
    { word: "Die Speisekarte", translation: "the menu", focus: "vocabulary", week: 2 },
    { word: "Das Gericht", translation: "the dish", focus: "vocabulary", week: 2 },
    { word: "Bestellen", translation: "to order", focus: "vocabulary", week: 2 },
    { word: "Zahlen", translation: "to pay", focus: "vocabulary", week: 2 },
    { word: "Der Kellner", translation: "the waiter", focus: "vocabulary", week: 2 },
    { word: "Lecker", translation: "tasty/delicious", focus: "vocabulary", week: 2 }
  ];

  const quotes = [
    { german: "Jede kleine Anstrengung ist ein Sieg!", english: "Every small effort is a victory!" },
    { german: "Du schaffst das!", english: "You can do it!" },
    { german: "Heute besser als gestern!", english: "Better today than yesterday!" },
    { german: "Fehler sind deine Freunde!", english: "Mistakes are your friends!" },
    { german: "Konstanz ist der Schlüssel!", english: "Consistency is the key!" }
  ];

  // --- STATE MANAGEMENT & EFFECTS ---
  const initialDataStructure = goetheB1CompleteData;
  const DATA_VERSION = "2.1"; // Increment this when data structure changes
  
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('germanLearningData');
      const savedVersion = localStorage.getItem('dataVersion');
      
      console.log('🔍 Checking localStorage...', { savedVersion, currentVersion: DATA_VERSION, hasSavedData: !!saved });
      
      // If no saved data OR version mismatch, use new data structure
      if (!saved || savedVersion !== DATA_VERSION) {
        console.log('✅ Using new data structure (version', DATA_VERSION, ')');
        console.log('📦 New data structure:', { hasExamOverview: !!initialDataStructure.examOverview, weekCount: initialDataStructure.weeks?.length });
        localStorage.removeItem('germanLearningData'); // Clear old data first
        localStorage.setItem('dataVersion', DATA_VERSION);
        return initialDataStructure;
      }
      
      const parsedData = JSON.parse(saved);
      
      // Validate that examOverview exists (new structure)
      if (!parsedData.examOverview) {
        console.log('⚠️ Old data structure detected, upgrading to new structure');
        console.log('📦 New data structure:', { hasExamOverview: !!initialDataStructure.examOverview, weekCount: initialDataStructure.weeks?.length });
        localStorage.removeItem('germanLearningData'); // Clear old data first
        localStorage.setItem('dataVersion', DATA_VERSION);
        return initialDataStructure;
      }
      
      console.log('📂 Loaded existing data from localStorage', { hasExamOverview: !!parsedData.examOverview, weekCount: parsedData.weeks?.length });
      return parsedData;
    } catch (e) {
      console.error("❌ Could not load data from localStorage, resetting.", e);
      localStorage.removeItem('germanLearningData'); // Clear corrupted data
      localStorage.setItem('dataVersion', DATA_VERSION);
      return initialDataStructure;
    }
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null); // {week: 1, day: 1} or null
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) return savedMode === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [focusFilters, setFocusFilters] = useState([]);
  const [vocabSearch, setVocabSearch] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dailyQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  const isPlanStarted = !!data.startDate;

  // Force cache clearing on mount if version mismatch
  useEffect(() => {
    const savedVersion = localStorage.getItem('dataVersion');
    if (savedVersion !== DATA_VERSION) {
      console.log('🔄 Version mismatch detected! Clearing all cached data...');
      console.log('   Old version:', savedVersion, '→ New version:', DATA_VERSION);
      localStorage.removeItem('germanLearningData');
      localStorage.removeItem('dataVersion');
      localStorage.setItem('dataVersion', DATA_VERSION);
      // Force reload to use new data
      console.log('🔄 Reloading page...');
      window.location.reload();
    } else {
      console.log('✅ Version check passed:', DATA_VERSION);
    }
  }, []); // Only run once on mount

  useEffect(() => {
    localStorage.setItem('germanLearningData', JSON.stringify(data));
    localStorage.setItem('dataVersion', DATA_VERSION);
  }, [data]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // --- UTILITY DATA & FUNCTIONS ---

  const focusIcons = {
    grammar: <BookOpen className="w-4 h-4" />,
    vocabulary: <FileText className="w-4 h-4" />,
    listening: <Headphones className="w-4 h-4" />,
    speaking: <MessageCircle className="w-4 h-4" />,
    writing: <FileText className="w-4 h-4" />
  };

  const focusColors = {
    grammar: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-600',
    vocabulary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-600',
    listening: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-600',
    speaking: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600',
    writing: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-600'
  };

  const calculateDate = (weekNum, dayNum) => {
    if (!data.startDate) return 'Not Scheduled';

    const start = new Date(data.startDate);
    // Calculate days offset: (week - 1) * 5 + (day - 1) - assuming 5 days a week
    const offsetDays = (weekNum - 1) * 7 + (dayNum - 1);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + offsetDays);

    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const startPlan = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    setData(prev => ({
      ...prev,
      startDate: today
    }));
  };

  const toggleSubtask = (weekNum, dayNum, subtaskIndex) => {
    setData(prev => ({
      ...prev,
      weeks: prev.weeks.map(w =>
        w.week === weekNum
          ? {
              ...w,
              days: w.days.map(d =>
                d.day === dayNum ? (
                    // Update subtask
                    (() => {
                        const subtasks = d.subtasks || [];
                        const newSubtasks = subtasks.map((sub, index) =>
                            index === subtaskIndex ? { ...sub, completed: !sub.completed } : sub
                        );
                        // Recalculate overall task completion
                        const allSubtasksCompleted = newSubtasks.length > 0 && newSubtasks.every(sub => sub.completed);
                        return { ...d, subtasks: newSubtasks, completed: allSubtasksCompleted };
                    })()
                ) : d
              )
            }
          : w
      )
    }));
  };

  const updateNotes = useCallback((weekNum, dayNum, notes) => {
    setData(prev => ({
      ...prev,
      weeks: prev.weeks.map(w =>
        w.week === weekNum
          ? {
              ...w,
              days: w.days.map(d =>
                d.day === dayNum ? { ...d, notes } : d
              )
            }
          : w
      )
    }));
  }, []);

  const updateGoal = (weekNum, goal) => {
    setData(prev => ({
      ...prev,
      weeks: prev.weeks.map(w =>
        w.week === weekNum
          ? { ...w, goal }
          : w
      )
    }));
  };

  const resetProgress = () => {
    localStorage.removeItem('germanLearningData');
    setData(initialDataStructure);
    setShowResetModal(false);
  };

  const getStats = useMemo(() => {
    const total = data.weeks.reduce((sum, w) => sum + w.days.length, 0);
    const completed = data.weeks.reduce((sum, w) => sum + w.days.filter(d => d.completed).length, 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [data]);

  const getFocusStats = useMemo(() => {
    const stats = {};
    data.weeks.forEach(week => {
      week.days.forEach(day => {
        if (!stats[day.focus]) stats[day.focus] = { total: 0, completed: 0 };
        stats[day.focus].total++;
        if (day.completed) stats[day.focus].completed++;
      });
    });
    return stats;
  }, [data]);

  const getNextTask = useMemo(() => {
    for (let week of data.weeks) {
      for (let day of week.days) {
        if (!day.completed) {
          return { week: week.week, day };
        }
      }
    }
    return null;
  }, [data]);

  const filterTasks = useCallback((tasks) => {
    if (focusFilters.length === 0) return tasks;
    return tasks.filter(t => focusFilters.includes(t.focus));
  }, [focusFilters]);

  const filterVocabulary = useCallback(() => {
    return vocabularyData.filter(item =>
      item.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      item.translation.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      item.focus.toLowerCase().includes(vocabSearch.toLowerCase())
    );
  }, [vocabSearch]);

  // --- VIEW COMPONENTS ---

  const Dashboard = () => {
    const stats = getStats;
    const focusStats = getFocusStats;
    const nextTask = getNextTask;
    const examOverview = data.examOverview;

    const insights = Object.entries(focusStats).map(([focus, stat]) => {
      const percent = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
      return { focus, percent };
    }).sort((a, b) => a.percent - b.percent);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">Welcome! 🚀</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Track your German B1 learning journey</p>
        </div>

        {/* Exam Overview - Show if available */}
        {examOverview && (
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">Goethe-Zertifikat B1 Exam</h3>
                <p className="text-sm opacity-90">Official German Language Certification</p>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-300" />
                  <p className="text-sm font-medium opacity-90">Total Duration</p>
                </div>
                <p className="text-3xl font-bold">{examOverview.totalDuration}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-green-300" />
                  <p className="text-sm font-medium opacity-90">Vocabulary Target</p>
                </div>
                <p className="text-2xl font-bold">{examOverview.vocabularyTarget?.split('(')[0]}</p>
                <p className="text-xs opacity-75 mt-1">{examOverview.vocabularyTarget?.split('(')[1]?.replace(')', '')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-300" />
                  <p className="text-sm font-medium opacity-90">Study Hours</p>
                </div>
                <p className="text-3xl font-bold">{examOverview.studyHoursRecommended?.split(' ')[0]}</p>
                <p className="text-xs opacity-75 mt-1">recommended total</p>
              </div>
            </div>

            {/* Exam Modules */}
            <div>
              <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Exam Modules
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {examOverview.modules?.map((module, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                    <p className="font-bold text-lg mb-2">{module.name.split('(')[0]}</p>
                    <div className="space-y-1 text-sm">
                      <p className="opacity-90 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {module.duration}
                      </p>
                      <p className="opacity-90 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Total: {module.points} points
                      </p>
                      <p className="font-semibold text-yellow-300 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Pass: {module.passing} points ({Math.round((module.passing/module.points)*100)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-300" />
                <strong>Important:</strong>
              </p>
              <p className="text-sm opacity-90">
                You must achieve at least <strong>60% in EACH module</strong> individually to pass the exam. 
                The 12-week plan below is designed to help you master all modules systematically.
              </p>
            </div>
          </div>
        )}

        {/* Plan Status Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-xl">
          {isPlanStarted ? (
            <>
              <p className="text-xl font-semibold mb-2 flex items-center gap-2"><Clock className='w-5 h-5'/> Plan Active</p>
              <p className="text-sm opacity-90">Today's Date: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-sm opacity-90">Plan Start Date: {new Date(data.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold mb-3">Ready to start learning German?</p>
              <button
                onClick={startPlan}
                className="px-6 py-2 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg"
              >
                <Zap className='w-4 h-4 mr-2 inline'/> Start Plan Today
              </button>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><Calendar className="w-4 h-4"/> Total Tasks</p>
            <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><Award className="w-4 h-4"/> Completed</p>
            <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> Completion</p>
            <p className="text-4xl font-bold text-orange-600">{stats.percent}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><Lightbulb className="w-4 h-4"/> Weakest Focus</p>
            <p className="text-2xl font-bold text-red-600 capitalize">{insights.length > 0 ? insights[0].focus : 'N/A'}</p>
          </div>
        </div>

        {/* Next Task & Quote */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📌 Next Task</h3>
            {nextTask && isPlanStarted ? (
              <div
                onClick={() => { setSelectedDay({ week: nextTask.week, day: nextTask.day.day }); setCurrentView('tasks'); }}
                className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-xl border-l-4 border-blue-500 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/70 transition"
              >
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <strong>Week {nextTask.week}, Day {nextTask.day.day}</strong> | Scheduled: {calculateDate(nextTask.week, nextTask.day.day)}
                </p>
                <p className="font-medium text-lg mb-1">{nextTask.day.task}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${focusColors[nextTask.day.focus]}`}>
                    {focusIcons[nextTask.day.focus]}
                    {nextTask.day.focus}
                </span>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-xl">
                <p className="text-green-700 dark:text-green-300 font-semibold flex items-center gap-2">
                    {isPlanStarted ? <Award className='w-5 h-5'/> : <Clock className='w-5 h-5'/>}
                    {isPlanStarted ? '🎉 All tasks completed! Great job!' : 'Plan not started. Click "Start Plan Today" above.'}
                </p>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🇩🇪 Daily Motivation</h3>
            <p className="text-lg font-semibold mb-1 italic text-gray-800 dark:text-gray-200">"{dailyQuote.german}"</p>
            <p className="text-sm opacity-70 text-gray-600 dark:text-gray-400">— {dailyQuote.english}</p>
          </div>
        </div>
      </div>
    );
  };

  const DayDetailView = React.memo(({ selectedDay, dayData, onBack }) => {
    const { week, day } = selectedDay;
    const { task, focus, level, lessonContent, subtasks = [], resources, notes } = dayData;

    // Local state for notes to prevent re-render on every keystroke
    const [localNotes, setLocalNotes] = useState(notes);

    // Sync local notes with prop notes when day changes
    useEffect(() => {
      setLocalNotes(notes);
    }, [selectedDay.week, selectedDay.day, notes]);

    // Debounced update to parent state
    useEffect(() => {
      if (localNotes !== notes) {
        const timer = setTimeout(() => {
          updateNotes(week, day, localNotes);
        }, 300); // 300ms debounce
        
        return () => clearTimeout(timer);
      }
    }, [localNotes, notes, week, day]);

    const subtasksCompleted = subtasks.filter(s => s.completed).length;
    const subtasksTotal = subtasks.length;
    const progress = subtasksTotal > 0 ? Math.round((subtasksCompleted / subtasksTotal) * 100) : 0;

    const currentWeekData = data.weeks.find(w => w.week === week);
    const currentWeekGoal = currentWeekData?.goal || 'Weekly Goal';

    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition mb-4 font-medium"
        >
          <ArrowLeft className='w-5 h-5'/> Back to Week {week} Tasks ({currentWeekGoal})
        </button>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-2xl shadow-2xl">
          <div className='flex justify-between items-start mb-4 flex-wrap gap-4'>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  Week {week} • Day {day}
                </span>
                <span className="text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  Level: {level}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">{task}</h1>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30`}>
                  {focusIcons[focus]}
                  <span className="capitalize">{focus}</span>
                </span>
                {isPlanStarted && (
                  <span className="inline-flex items-center text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    📅 {calculateDate(week, day)}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/30 text-center min-w-[120px]">
              <p className="text-4xl font-bold mb-1">{progress}%</p>
              <p className="text-sm opacity-90">Complete</p>
              <div className="mt-2 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Lesson Title */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border-b-4 border-blue-500">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-3">
              <Lightbulb className='w-8 h-8 text-yellow-500'/> 
              {lessonContent?.title || 'Lesson Details'}
            </h2>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Definition Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border-l-4 border-blue-600 shadow-md">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className='text-xl font-bold text-blue-900 dark:text-blue-200'>
                  Definition & Overview
                </h3>
              </div>
              <div className="prose prose-blue dark:prose-invert max-w-none">
                <FormattedText text={lessonContent?.definition || DayDetailPlaceholder} />
              </div>
            </div>

            {/* Example Section */}
            <div className='bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-6 rounded-xl border border-gray-300 dark:border-gray-600 shadow-md'>
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-gray-700 dark:bg-gray-600 text-white p-2 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                  Rules, Examples & Reference
                </h3>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <FormattedText text={lessonContent?.example || DayDetailPlaceholder} />
              </div>
            </div>

            {/* Tips Section */}
            <div className='bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border-l-4 border-yellow-500 shadow-md'>
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-yellow-500 text-white p-2 rounded-lg">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className='text-xl font-bold text-yellow-900 dark:text-yellow-200'>
                  Teacher's Tips & Strategies
                </h3>
              </div>
              <div className="prose prose-yellow dark:prose-invert max-w-none">
                <FormattedText text={lessonContent?.tips || DayDetailPlaceholder} />
              </div>
            </div>
          </div>
        </div>

        {/* Subtasks Card */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-green-700 dark:text-green-300 flex items-center gap-3">
            <CheckSquare className='w-7 h-7'/> Daily Goals Checklist
          </h2>

          <div className="space-y-3">
            {subtasks.map((subtask, subIndex) => (
              <div 
                key={subIndex} 
                className={`flex items-start p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  subtask.completed 
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600' 
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => toggleSubtask(week, day, subIndex)}
                  className="mt-1 w-6 h-6 rounded-md text-green-600 focus:ring-green-500 cursor-pointer flex-shrink-0 border-2"
                />
                <p className={`text-base flex-1 ml-4 ${
                  subtask.completed 
                    ? 'line-through text-gray-500 dark:text-gray-400' 
                    : 'text-gray-800 dark:text-gray-200 font-medium'
                }`}>
                  {subtask.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes and Resources */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <label className="text-lg font-bold block mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              📝 My Notes & Reflections
            </label>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              rows="8"
              placeholder="Add your notes, reflections, or list sentences that gave you trouble here..."
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <p className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              📎 Additional Resources
            </p>
            <div className="space-y-3">
              {resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl text-sm font-medium hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all shadow-sm hover:shadow-md border border-blue-200 dark:border-blue-700 group"
                >
                  <span>{r.name}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  });

  const TasksView = () => {
    const week = data.weeks.find(w => w.week === currentWeek);
    const filtered = week ? filterTasks(week.days) : [];

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">📋 Learning Plan Overview</h2>

        {/* Week Info Card */}
        {week && (
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-3">Week {week.week} Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {week.targetVocabulary && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-sm opacity-90 mb-1">Target Vocabulary</p>
                  <p className="text-2xl font-bold">{week.targetVocabulary} words</p>
                </div>
              )}
              {week.estimatedHours && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-sm opacity-90 mb-1">Estimated Study Time</p>
                  <p className="text-2xl font-bold">{week.estimatedHours}</p>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                <p className="text-sm opacity-90 mb-1">Days</p>
                <p className="text-2xl font-bold">{week.days.length} tasks</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className='flex-1'>
                <label className="block text-sm font-semibold mb-2">Select Week:</label>
                <select
                value={currentWeek}
                onChange={(e) => { setCurrentWeek(parseInt(e.target.value)); setFocusFilters([]); }}
                className="w-full md:w-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                {data.weeks.map(w => (
                    <option key={w.week} value={w.week}>Week {w.week}: {w.goal}</option>
                ))}
                </select>
            </div>
            <div className='flex-1'>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-1"><Target className='w-4 h-4'/> Weekly Goal:</label>
                <input
                type="text"
                value={week?.goal || ''}
                onChange={(e) => updateGoal(currentWeek, e.target.value)}
                placeholder="Set your goal for the week..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 shadow-inner"
                />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold mb-3">Filter by Focus:</p>
            <div className="flex flex-wrap gap-3">
              {['grammar', 'vocabulary', 'listening', 'speaking', 'writing'].map(focus => (
                <label key={focus} className="flex items-center space-x-2 cursor-pointer transition hover:scale-[1.02]">
                  <input
                    type="checkbox"
                    checked={focusFilters.includes(focus)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFocusFilters([...focusFilters, focus]);
                      } else {
                        setFocusFilters(focusFilters.filter(f => f !== focus));
                      }
                    }}
                    className="rounded-md text-blue-600 focus:ring-blue-500 bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                  />
                  <span className={`text-sm capitalize font-medium flex items-center gap-1 ${focusFilters.includes(focus) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {focusIcons[focus]}
                    {focus}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <p className="text-gray-500">No tasks match your filters in this week.</p>
            </div>
          ) : (
            filtered.map(day => {
                const subtasksCompleted = (day.subtasks || []).filter(s => s.completed).length;
                const subtasksTotal = (day.subtasks || []).length;
                const progressPercent = subtasksTotal > 0 ? Math.round((subtasksCompleted / subtasksTotal) * 100) : 0;
                
                return (
              <div
                key={day.day}
                onClick={() => setSelectedDay({ week: currentWeek, day: day.day })}
                className={`bg-white dark:bg-gray-800 border-2 rounded-xl p-6 shadow-md transition-all cursor-pointer hover:shadow-2xl hover:scale-[1.01] ${
                  day.completed 
                    ? 'border-green-500 bg-gradient-to-br from-green-50/70 to-green-100/70 dark:from-green-900/30 dark:to-green-800/40' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <div className="space-y-4">
                  {/* Header Section */}
                  <div className='flex justify-between items-start gap-4'>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Day {day.day}</span>
                        {day.completed && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                            <CheckSquare className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100 leading-tight">
                        {day.task}
                      </h3>
                    </div>
                    {isPlanStarted && (
                      <span className='inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700 whitespace-nowrap'>
                        📅 {calculateDate(currentWeek, day.day)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2'>
                    {day.lessonContent?.definition || DayDetailPlaceholder}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                      <span>Progress</span>
                      <span>{subtasksCompleted}/{subtasksTotal} subtasks ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPercent === 100 
                            ? 'bg-green-500' 
                            : progressPercent > 0 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer with Focus Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${focusColors[day.focus]}`}>
                      {focusIcons[day.focus]}
                      <span className="capitalize">{day.focus}</span>
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      Level: <span className="font-bold text-gray-700 dark:text-gray-300">{day.level}</span>
                    </span>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </div>
    );
  };

  // --- Main Render Logic ---

  const renderContent = () => {
    if (currentView === 'tasks' && selectedDay) {
      const weekData = data.weeks.find(w => w.week === selectedDay.week);
      const dayData = weekData?.days.find(d => d.day === selectedDay.day);

      if (!dayData) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <p className="text-xl font-semibold text-red-500">Error: Task details not found.</p>
            </div>
        );
      }

      return (
        <DayDetailView
          selectedDay={selectedDay}
          dayData={dayData}
          onBack={() => setSelectedDay(null)}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TasksView />;
      case 'vocabulary':
        return <VocabularyView />;
      case 'flashcards':
        return <FlashcardView />;
      case 'progress':
        return <ProgressView />;
      case 'insights':
        return <InsightsView />;
      default:
        return <Dashboard />;
    }
  };

  // --- Rendered View Components (Vocabulary, Flashcard, Progress, Insights) ---
  // (These components remain largely the same, using the common getters)

  const VocabularyView = () => {
    const filtered = filterVocabulary();

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">📚 Vocabulary & Terms</h2>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <input
            type="text"
            value={vocabSearch}
            onChange={(e) => setVocabSearch(e.target.value)}
            placeholder="Search for German word, translation, or focus area..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 shadow-inner transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <p className="text-gray-500">No vocabulary matches your search.</p>
            </div>
          ) : (
            filtered.map((vocab, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">WEEK {vocab.week}</p>
                <p className="text-2xl font-bold mb-1">{vocab.word}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 italic">"{vocab.translation}"</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${focusColors[vocab.focus]}`}>
                  {focusIcons[vocab.focus]}
                  {vocab.focus}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const FlashcardView = () => {
    const [cards, setCards] = useState(vocabularyData);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Function to shuffle the cards
    const shuffleCards = () => {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
    };

    const nextCard = () => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
      setIsFlipped(false);
    };

    const prevCard = () => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
      setIsFlipped(false);
    };

    if (cards.length === 0) {
      return (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <p className="text-xl font-semibold text-gray-500">No vocabulary available for the quiz.</p>
        </div>
      );
    }

    const currentCard = cards[currentIndex];

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">🧠 Flashcard Quiz</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className='flex justify-between items-center mb-4'>
            <span className='font-semibold text-gray-600 dark:text-gray-400'>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <button
                onClick={shuffleCards}
                className='flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium hover:bg-yellow-600 transition shadow-md'
            >
                <Shuffle className='w-4 h-4'/> Shuffle
            </button>
          </div>

          {/* Flashcard Component */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full h-64 flex items-center justify-center rounded-xl p-8 cursor-pointer shadow-xl transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
            style={{ perspective: '1000px' }}
          >
            <div className={`absolute w-full h-full flex items-center justify-center p-8 bg-blue-100 dark:bg-blue-900 rounded-xl border-4 border-blue-500`} style={flashcardStyles.backfaceHidden}>
                <p className='text-4xl font-extrabold text-blue-800 dark:text-blue-100'>{currentCard.word}</p>
            </div>
            <div className={`absolute w-full h-full [transform:rotateY(180deg)] flex flex-col items-center justify-center p-8 bg-green-100 dark:bg-green-900 rounded-xl border-4 border-green-500`} style={flashcardStyles.backfaceHidden}>
                <p className='text-xl font-semibold text-green-800 dark:text-green-100 italic'>"{currentCard.translation}"</p>
                <div className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${focusColors[currentCard.focus]}`}>
                    {focusIcons[currentCard.focus]}
                    {currentCard.focus}
                </div>
            </div>
          </div>

          {/* Controls */}
          <div className='flex justify-center gap-4 mt-6'>
            <button onClick={prevCard} className='p-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-md' aria-label="Previous Card">
              <ChevronLeft className='w-6 h-6'/>
            </button>
            <button onClick={() => setIsFlipped(!isFlipped)} className='px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition shadow-lg'>
              {isFlipped ? 'Hide German' : 'Show Translation'}
            </button>
            <button onClick={nextCard} className='p-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-md' aria-label="Next Card">
              <ChevronRight className='w-6 h-6'/>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ProgressView = () => {
    const stats = getStats;

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">📈 Progress Report</h2>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Progress</p>
                <p className="text-4xl font-bold text-orange-600">{stats.percent}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Tasks Done</p>
                <p className="text-4xl font-bold text-green-600">{stats.completed}/{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Plan Status</p>
                <p className="text-xl font-bold text-blue-600">{isPlanStarted ? 'Active' : 'Not Started'}</p>
            </div>
        </div>

        {data.weeks.map(week => {
          const completed = week.days.filter(d => d.completed).length;
          const total = week.days.length;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

          const tasksByFocus = {};
          week.days.forEach(day => {
            if (!tasksByFocus[day.focus]) tasksByFocus[day.focus] = { total: 0, completed: 0 };
            tasksByFocus[day.focus].total++;
            if (day.completed) tasksByFocus[day.focus].completed++;
          });

          return (
            <div key={week.week} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Week {week.week} Summary</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{week.goal}</p>
                </div>
                <span className={`text-4xl font-extrabold mt-3 sm:mt-0 ${percent === 100 ? 'text-green-600' : 'text-blue-600 dark:text-blue-400'}`}>{percent}%</span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">Overall Progress</span>
                  <span className="text-sm font-bold">{completed}/{total} tasks</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['grammar', 'vocabulary', 'listening', 'speaking', 'writing'].map(focus => {
                  const stats = tasksByFocus[focus] || { total: 0, completed: 0 };
                  const focusPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                  return (
                    <div key={focus} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-center border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex justify-center mb-1 text-blue-600 dark:text-blue-400">
                        {focusIcons[focus]}
                      </div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mt-1">{focus}</p>
                      <p className="text-xl font-bold mt-1">{stats.completed}/{stats.total}</p>
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1 mt-2">
                        <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${focusPercent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const InsightsView = () => {
    const stats = getStats;
    const focusStats = getFocusStats;
    const focusInsights = useMemo(() => {
        let strongest = { focus: '', percent: -1 };
        let weakest = { focus: '', percent: 101 };

        if (Object.keys(focusStats).length === 0) return { strongest: { focus: 'None', percent: 0 }, weakest: { focus: 'None', percent: 0 } };

        Object.entries(focusStats).forEach(([focus, stat]) => {
            const percent = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
            if (percent >= strongest.percent) strongest = { focus, percent };
            if (percent <= weakest.percent) weakest = { focus, percent };
        });
        return { strongest, weakest };
    }, [focusStats]);

    const notesCount = data.weeks.reduce((sum, w) => sum + w.days.filter(d => d.notes.length > 0).length, 0);

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">💡 Learning Insights</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-900 p-6 rounded-xl border border-blue-200 dark:border-blue-700 shadow-lg">
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <TrendingUp className="w-5 h-5" />
              Overall Engagement
            </h4>
            <p className="text-sm mb-2">You have completed **{stats.completed} tasks** out of {stats.total} total tasks.</p>
            <p className="text-sm mb-2">Current overall progress: **{stats.percent}%**</p>
            <p className="text-sm">You have taken notes on **{notesCount} tasks**. Active note-taking boosts retention!</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-900 p-6 rounded-xl border border-green-200 dark:border-green-700 shadow-lg">
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-800 dark:text-green-300">
              <Award className="w-5 h-5" />
              Your Strengths
            </h4>
            <p className="text-sm mb-2">
                Your strongest area is <strong className="capitalize">{focusInsights.strongest.focus}</strong>
                , with a <strong className='text-green-600'>{focusInsights.strongest.percent}%</strong> completion rate.
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                Recommendation: Use this strength to support your weaker areas, perhaps by speaking about grammar topics or writing about vocabulary.
            </p>
          </div>
        </div>

        {focusInsights.weakest.focus && focusInsights.weakest.percent <= 99 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <h4 className="font-semibold text-xl mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Lightbulb className="w-5 h-5" />
                    Actionable Learning Focus
                </h4>
                <p className="text-base mb-4">
                    Your lowest completion rate is in <strong className="capitalize text-red-600">{focusInsights.weakest.focus}</strong>, currently at <strong className='text-red-600'>{focusInsights.weakest.percent}%</strong>.
                </p>
                <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        Try spending 5 extra minutes daily on tasks in this focus area. Review the resources listed in the **Learning Plan** view.
                    </p>
                </div>
                <button
                    onClick={() => setCurrentView('tasks')}
                    className="mt-6 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition shadow-md"
                >
                    Go to Tasks
                </button>
            </div>
        )}
      </div>
    );
  };

  const NavItem = ({ view, icon, label }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setSelectedDay(null); // Reset detail view on navigation
        setMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 rounded-xl transition duration-200 ${
        currentView === view
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-3 font-medium">{label}</span>
    </button>
  );

  const ResetModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-3">⚠️ Reset Progress?</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to **delete all progress and notes**? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowResetModal(false)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={resetProgress}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-1 inline" />
            Reset All
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans flex flex-col md:flex-row">

        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 bg-white dark:bg-gray-800 z-40 p-4 shadow-lg flex justify-between items-center w-full">
          <h1 className="text-xl font-bold text-blue-600 flex items-center"><span className='mr-2'>🇩🇪</span> Deutsch Tracker</h1>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar for Desktop / Mobile Overlay */}
        <div
          className={`fixed inset-y-0 left-0 z-30 transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out md:w-64 w-64 flex-shrink-0
            bg-white dark:bg-gray-800 p-6 shadow-2xl md:shadow-none md:border-r border-gray-100 dark:border-gray-700`}
        >
          <div className="flex justify-between items-center mb-10 mt-2">
            <h1 className="text-2xl font-extrabold text-blue-600 flex items-center">
              <span className='mr-2'>🇩🇪</span>
              Deutsch Tracker
            </h1>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <NavItem view="dashboard" icon={<Award className="w-5 h-5" />} label="Dashboard" />
            <NavItem view="tasks" icon={<Calendar className="w-5 h-5" />} label="Learning Plan" />
            <NavItem view="vocabulary" icon={<BookOpen className="w-5 h-5" />} label="Vocabulary" />
            <NavItem view="flashcards" icon={<Zap className="w-5 h-5" />} label="Flashcard Quiz" />
            <NavItem view="progress" icon={<TrendingUp className="w-5 h-5" />} label="Progress Report" />
            <NavItem view="insights" icon={<Lightbulb className="w-5 h-5" />} label="Insights" />
          </nav>

          <div className="absolute bottom-6 w-full pr-12 space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner">
              <span className="font-medium text-sm">Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-md transition hover:scale-105"
                title="Toggle Dark Mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center w-full px-4 py-3 text-red-600 bg-red-100 dark:bg-red-900/50 rounded-xl transition duration-200 hover:bg-red-200 dark:hover:bg-red-900 shadow-md"
              title="Reset All Progress"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="ml-3 font-medium">Reset Progress</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-full lg:max-w-4xl xl:max-w-6xl mx-auto md:ml-0">
          {renderContent()}
        </main>

        {/* Reset Modal */}
        {showResetModal && <ResetModal />}

        {/* Backdrop for Mobile */}
        {mobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
      </div>
    </div>
  );
};

export default App;
