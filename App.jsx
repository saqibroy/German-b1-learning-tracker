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
    // Combined regex to handle both **bold** and *italic* (bold must come first to match correctly)
    const formattingRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)/g;
    let match;

    while ((match = formattingRegex.exec(text)) !== null) {
      // Add text before the formatted part
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }
      
      // Check if it's bold (**text**) or italic (*text*)
      if (match[1]) {
        // Bold text
        parts.push(
          <strong key={match.index} className="font-bold text-gray-900 dark:text-gray-100">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Italic text
        parts.push(
          <em key={match.index} className="italic text-gray-700 dark:text-gray-300">
            {match[4]}
          </em>
        );
      }
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
        <ListTag key={`list-${processedElements.length}`} className={`my-3 md:my-4 space-y-2 ${currentListType === 'numbered' ? 'list-decimal' : 'list-disc'} list-outside ml-5 md:ml-6 pl-1 text-gray-800 dark:text-gray-200`}>
          {listItems.map((item, idx) => item)}
        </ListTag>
      );
      listItems = [];
      currentListType = null;
    }
  };

  let codeBlockLines = [];
  const flushCodeBlock = () => {
    if (codeBlockLines.length > 0) {
      processedElements.push(
        <div key={`code-${processedElements.length}`} className="my-4 bg-gray-900 dark:bg-gray-950 rounded-xl p-4 border-l-4 border-blue-500 shadow-lg overflow-x-auto">
          <pre className="text-sm text-gray-100 font-mono leading-relaxed whitespace-pre-wrap">
            {codeBlockLines.join('\n')}
          </pre>
        </div>
      );
      codeBlockLines = [];
    }
  };

  let isInCodeBlock = false;
  
  lines.forEach((line, index) => {
    // Check for code block markers (```)
    if (line.trim() === '```') {
      isInCodeBlock = !isInCodeBlock;
      if (!isInCodeBlock) {
        flushCodeBlock();
      }
      return;
    }

    // If inside code block, collect lines
    if (isInCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Check for headers (lines with ** on both sides, standalone)
    if (line.trim().startsWith('**') && line.trim().endsWith('**') && line.trim().length > 4) {
      flushTable();
      flushList();
      flushCodeBlock();
      const content = line.trim().slice(2, -2);
      
      // Check if it's an all-caps header (treat as larger heading)
      const isMainHeader = content === content.toUpperCase() && content.length > 5;
      
      processedElements.push(
        <h4 key={`header-${index}`} className={`font-bold ${isMainHeader ? 'text-2xl mt-8 mb-4 text-blue-700 dark:text-blue-400 border-b-2 border-blue-200 dark:border-blue-800 pb-2' : 'text-lg mt-6 mb-3 text-gray-900 dark:text-gray-100'} first:mt-0`}>
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
        <li key={`li-${index}`} className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm md:text-base">
          {renderInlineFormatting(line.replace(/^-\s*/, '').trim())}
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
        <li key={`li-${index}`} className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm md:text-base pl-1 md:pl-2">
          {renderInlineFormatting(line.replace(/^\d+\.\s*/, '').trim())}
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
      flushCodeBlock();
      
      // Special styling for "Teil" sections (exam parts)
      const isTeilSection = line.trim().toLowerCase().startsWith('teil');
      
      processedElements.push(
        <p key={`label-${index}`} className={`font-semibold ${isTeilSection ? 'text-indigo-700 dark:text-indigo-400 text-base' : 'text-blue-700 dark:text-blue-400 text-sm'} mt-4 mb-2 first:mt-0`}>
          {renderInlineFormatting(line)}
        </p>
      );
      return;
    }

    // Check for special markers (✓, ✅, ❌, ⚠️ etc.)
    if (line.trim().match(/^[✓✅❌⚠️⭐]/)) {
      flushTable();
      flushList();
      flushCodeBlock();
      
      const marker = line.trim()[0];
      const colorClass = marker === '✓' || marker === '✅' 
        ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : marker === '❌' 
        ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : marker === '⚠️'
        ? 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        : 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      
      processedElements.push(
        <div key={`check-${index}`} className={`my-3 p-3 rounded-lg border ${colorClass} leading-relaxed flex items-start gap-3`}>
          <span className="text-xl flex-shrink-0 mt-0.5">{marker}</span>
          <span className="flex-1">{renderInlineFormatting(line.trim().slice(1).trim())}</span>
        </div>
      );
      return;
    }

    // Regular paragraph
    if (line.trim()) {
      flushTable();
      flushList();
      flushCodeBlock();
      processedElements.push(
        <p key={`p-${index}`} className="my-2.5 text-gray-800 dark:text-gray-200 leading-relaxed text-base">
          {renderInlineFormatting(line)}
        </p>
      );
      return;
    }

    // Empty line - add spacing
    if (!line.trim() && processedElements.length > 0) {
      flushTable();
      flushList();
      flushCodeBlock();
      processedElements.push(<div key={`space-${index}`} className="h-3" />);
    }
  });

  // Flush any remaining table, list, or code block
  flushTable();
  flushList();
  flushCodeBlock();

  return (
    <div className={`formatted-text ${className}`}>
      {processedElements}
    </div>
  );
};

const App = () => {
  // --- INITIAL DATA STRUCTURE ---
  // COMPREHENSIVE telc DEUTSCH B1 STUDY PLAN
// Based on official telc exam format and requirements
// Target: Pass written section (135/225 points) and oral section (45/75 points)
// Passing score: 60% OVERALL in written section AND 60% in oral section (compensation allowed within sections)

const goetheB1CompleteData = {
  examOverview: {
    totalDuration: "~2 hours 30 minutes (written) + 15 minutes (speaking)",
    description: "telc Deutsch B1: Written exam (150 min) covers Reading, Language Elements (Sprachbausteine), Listening, and Writing. Speaking is separate (15 min + 20 min prep). You need 60% overall in written section AND 60% in oral section.",
    modules: [
      { name: "Schriftliche Prüfung (Written Exam)", duration: "150 minutes total", points: 225, passing: 135, 
        subparts: "Reading + Language Elements + Listening + Writing" },
      { name: "Lesen (Reading)", duration: "~25 minutes", points: "Part of 225", note: "Integrated in written exam" },
      { name: "Sprachbausteine (Language Elements)", duration: "~15 minutes", points: "Part of 225", note: "Grammar/vocabulary fill-in - telc specific!" },
      { name: "Hören (Listening)", duration: "~25-30 minutes", points: "Part of 225", note: "Integrated in written exam" },
      { name: "Schreiben (Writing)", duration: "30 minutes", points: "Part of 225", note: "ONE semi-formal letter with 4 guiding questions" },
      { name: "Sprechen (Speaking)", duration: "15-16 minutes", points: 75, passing: 45, prep: "20 minutes preparation time" }
    ],
    vocabularyTarget: "~2,400 words (CEFR B1 level)",
    studyHoursRecommended: "350-650 hours total for B1 level",
    keyDifference: "telc allows compensation within sections. You can score lower in Reading if higher in Writing, as long as you reach 135/225 (60%) in written section overall."
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
            title: "Welcome to Your B1 Journey: The telc Exam Blueprint",
            definition: "Before diving into content, you MUST understand what you're preparing for. The **telc Deutsch B1** exam has 2 main sections: Written (150 minutes, 225 points) and Oral (15 minutes, 75 points). You need **60% OVERALL** in the written section (135/225 points) AND 60% in oral (45/75 points) to pass.\n\n**KEY ADVANTAGE:** Unlike Goethe, telc allows compensation within sections! You can score lower in Reading if higher in Writing, as long as you reach 60% total in the written exam. This is more flexible!\n\n**WHY CASES MATTER:** German uses cases (Nominativ, Akkusativ, Dativ, Genitiv) to show the function of nouns in a sentence. English uses word order ('The dog bites the man' vs 'The man bites the dog'), but German uses article changes. Mastering cases = understanding 80% of German grammar!\n\n**Today's Focus:** Nominative (subject) and Accusative (direct object). Think: Nominative = WHO/WHAT does the action? Accusative = WHO/WHAT receives the action directly?",
            example: "**telc DEUTSCH B1 EXAM FORMAT BREAKDOWN:**\n\n**SCHRIFTLICHE PRÜFUNG (Written Exam) - 150 minutes, 225 points:**\n**Passing Score: 135/225 points (60%)**\n\n**LESEN (Reading) - ~25 minutes, Part of 225:**\n- Similar to Goethe but integrated with Sprachbausteine\n- Teil 1-5: Various text types\n- Focus on comprehension and scanning\n\n**SPRACHBAUSTEINE (Language Elements) - ~15 minutes, Part of 225:**\n- **UNIQUE TO telc!** Fill-in-the-blank grammar exercises\n- Tests: Articles, prepositions, conjunctions, verb forms\n- Multiple choice format\n- This section does NOT exist in Goethe!\n\n**HÖREN (Listening) - ~25-30 minutes, Part of 225:**\n- Teil 1: Short messages (plays TWICE)\n- Teil 2: Longer conversations\n- Teil 3: Radio/discussions\n- Shorter than Goethe (25-30 min vs 40 min)\n\n**SCHREIBEN (Writing) - 30 minutes, Part of 225:**\n- **CRITICAL DIFFERENCE:** ONE semi-formal letter ONLY (not 3 tasks!)\n- Based on 4 guiding questions/points\n- ~120-150 words (more flexible than Goethe's strict 80)\n- No separate email/forum/formal letter tasks!\n\n**MÜNDLICHE PRÜFUNG (Speaking) - 15-16 minutes + 20 min prep, 75 points:**\n**Passing Score: 45/75 points (60%)**\n\n- **Teil 1: Sich vorstellen (Introduce yourself)** - NOT planning task!\n  - Make contact with partner\n  - Talk about yourself\n  - ~2-3 minutes\n\n- **Teil 2: Über ein Thema sprechen (Discuss a topic)**\n  - Both partners discuss prepared topic together\n  - ~4-5 minutes\n\n- **Teil 3: Gemeinsam etwas planen (Plan something together)**\n  - Collaborative planning (similar to Goethe Teil 1)\n  - ~4-5 minutes\n\n**KEY DIFFERENCE FROM GOETHE:**\ntelc allows compensation WITHIN written and oral sections. You can score lower in Reading if higher in Writing, as long as you reach 60% overall in each main section.",
            tips: "**EXAM STRATEGY - Your 12-Week Roadmap:**\n\n1. **Download Materials TODAY:** Go to telc.net and download the official telc Deutsch B1 sample exam (Übungstest). Print it. Familiarize yourself with the format. The PDF in your telcb1 folder is also an excellent resource!\n\n2. **Time Management is CRITICAL:** Practice with a timer from Week 2 onwards. The written exam is 150 minutes (2.5 hours) and mentally exhausting. Speaking is separate: 20 min prep + 15 min exam.\n\n3. **60% Overall Rule:** telc allows compensation! Strong writing can balance weaker reading. Focus on your strengths while improving weaknesses. You just need 135/225 points in written and 45/75 in oral.\n\n4. **Sprachbausteine is KEY:** This grammar section (unique to telc!) is often the easiest way to score points if you know your cases, prepositions, and verb forms. Don't neglect it!\n\n**CASE MASTERY TRICKS:**\n\n1. **Physical Reference Card:** Create a credit-card-sized chart with the case table. Laminate it. Keep it in your wallet. Review while waiting for bus/coffee.\n\n2. **The 'der→den' Chant:** Repeat this 10x daily: 'der Mann, den Mann, der Mann, den Mann'. Make it automatic!\n\n3. **Question Technique:** \n   - Nominative = Ask 'Wer?' (Who?) or 'Was?' (What?) before the verb\n   - Accusative = Ask 'Wen?' (Whom?) or 'Was?' (What?) after the verb\n   \n   Example: Der Lehrer sieht den Schüler.\n   - Wer sieht? → Der Lehrer (NOM)\n   - Wen sieht der Lehrer? → den Schüler (AKK)\n\n4. **Color-Coding:** In your notes, use one color for subjects (NOM) and another for objects (AKK). Your brain will start recognizing patterns visually.\n\n5. **Real-World Practice:** When watching German videos, pause and identify subjects/objects. Say them out loud with correct articles.\n\n6. **Common Mistake Alert:** Germans say 'Ich sehe den Mann' but English speakers often say 'Ich sehe der Mann' (wrong!). The 'der→den' change feels unnatural at first. Practice makes perfect!\n\n**Daily Practice Formula:** 10 minutes daily of article drilling beats 2 hours once a week. Consistency is your superpower!"
          },
          subtasks: [
            { description: "Download and review the official telc Deutsch B1 sample exam from telc.net or use the PDF in your telcb1 folder - familiarize yourself with the 2-section structure.", completed: false },
            { description: "Create a time-tracking sheet: Note written section (150 min total: Reading ~25 min, Listening 25-30 min, Sprachbausteine ~15 min, Writing 30 min) and oral (20 min prep + 15 min exam).", completed: false },
            { description: "Memorize the 4-case article table (NOM/AKK for now) - drill with 20 fill-in-the-blank sentences.", completed: false },
            { description: "Identify subjects (NOM) and direct objects (AKK) in 15 sample sentences from news articles.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official telc Deutsch B1 Sample Exam", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/telc-deutsch-b1.html" },
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
            definition: "The Reading section in telc B1 is approximately **25 minutes** and is part of the 225-point written exam. This is NOT a test of reading every word - it's a test of **strategic reading skills**: scanning (finding specific info quickly), skimming (getting the main idea), and inference (reading between the lines).\n\n**Why Reading Strategy Matters:** Native speakers don't read word-by-word either! They scan for keywords, skip irrelevant details, and focus on what matters. The exam tests if you can do this in German.\n\n**The Golden Rule:** ALWAYS read questions BEFORE texts! This tells you what to look for. You're hunting for answers, not enjoying literature.\n\n**Time Management is CRITICAL:** Reading is shorter in telc (~25 min) compared to other B1 exams, so efficiency is key. Practice with a timer from Day 1!",
            example: "**telc DEUTSCH B1 READING TIME STRATEGY:**\n\n**Important Note:** Unlike Goethe B1's separate 65-minute reading module, telc integrates Reading with the entire written exam. You should allocate approximately **25 minutes** for the reading section. Work efficiently!\n\n**Suggested Time Distribution:**\n\n**Teil 1: Blog/Email (5 minutes)**\n- 1 min: Read all questions carefully\n- 3 min: Read text, mark answers\n- 1 min: Double-check\n\n**Teil 2: Press Articles (6 minutes)**\n- 1 min: Read all MCQs\n- 4 min: Read articles (skim first, detail second)\n- 1 min: Verify answers\n\n**Teil 3: Matching Ads (5 minutes)**\n- 1 min: Read all people's needs, underline keywords\n- 3 min: Scan ads quickly, match\n- 1 min: Check unmatched ads\n\n**Teil 4: Opinion Texts (6 minutes)**\n- 1 min: Read statements\n- 4 min: Read opinion texts\n- 1 min: Match statements to authors\n\n**Teil 5: Rules/Regulations Table (3 minutes)**\n- 0.5 min: Read MCQs\n- 2 min: Scan table for specific info\n- 0.5 min: Verify answers\n\n**TOTAL: ~25 minutes**\n\n---\n\n**QUESTION TYPES & STRATEGIES:**\n\n**1. Richtig/Falsch/Text sagt dazu nichts (True/False/Not Mentioned)**\n\n**The Trap:** Students assume logical conclusions are true!\n\n**Example:**\nText: 'Maria geht jeden Tag schwimmen.'\nQuestion: 'Maria ist sehr sportlich.'\n\n❌ Answer: **Text sagt dazu nichts** (not mentioned)\n✓ Why? Text only says she swims, doesn't say she's athletic. Don't infer!\n\n**Strategy:**\n- True = explicitly stated in text\n- False = contradicted by text\n- Not mentioned = logically possible BUT not stated\n\n**2. Multiple Choice (a/b/c)**\n\n**Example:**\nQuestion: 'Wann findet das Konzert statt?'\na) Am Freitag um 18 Uhr\nb) Am Samstag um 19 Uhr\nc) Am Sonntag um 20 Uhr\n\nText: 'Das Konzert beginnt Samstagabend um 19 Uhr.'\n\n**Strategy:**\n- Eliminate obviously wrong answers first (Friday and Sunday)\n- Find exact match in text (Saturday 19:00)\n- Watch for paraphrasing: 'Samstagabend' = 'Am Samstag'\n\n**3. Matching Tasks**\n\n**Example Setup:**\nPerson A: 'Sucht günstiges Zimmer in München, zentral, maximal 400€'\n\nAd 1: 'Zimmer in München-Zentrum, 350€, ab sofort frei' ✓ MATCH!\nAd 2: 'Zimmer in München-Nord, 450€, ruhige Lage' ✗ Too expensive\nAd 3: 'Zimmer in Berlin-Mitte, 380€, zentral' ✗ Wrong city\n\n**Strategy:**\n- Create a checklist for each person: Location? Price? Features?\n- Cross out ads as you use them (each ad used only ONCE)\n- 3 ads will be leftovers - don't force matches!\n\n---\n\n**ESSENTIAL READING VOCABULARY (Connectors & Discourse Markers):**\n\n**Contrast & Opposition:**\n- jedoch (however)\n- aber (but)\n- trotzdem (nevertheless)\n- dagegen (on the other hand)\n- im Gegenteil (on the contrary)\n- dennoch (yet, still)\n\n**Addition & Continuation:**\n- außerdem (moreover, besides)\n- zusätzlich (additionally)\n- dazu (in addition to that)\n- weiterhin (furthermore)\n- auch (also)\n- ebenfalls (likewise)\n\n**Cause & Effect:**\n- deswegen (therefore)\n- deshalb (that's why)\n- daher (hence)\n- folglich (consequently)\n- aufgrund (due to)\n- wegen (because of)\n\n**Examples & Clarification:**\n- zum Beispiel (for example)\n- beispielsweise (for instance)\n- das heißt (that is/means)\n- mit anderen Worten (in other words)\n- nämlich (namely)\n\n**Opinion Indicators (Teil 4 - Critical!):**\n- Meiner Meinung nach (in my opinion)\n- Ich finde/denke/glaube (I find/think/believe)\n- Ich bin der Ansicht (I am of the opinion)\n- Ich bin überzeugt (I'm convinced)\n- Ich bin dagegen (I'm against it)\n- Ich bin dafür (I'm for it)\n\n---\n\n**TEXT STRUCTURE RECOGNITION:**\n\n**Blog/Email Structure (Teil 1):**\n1. Greeting: Liebe/r... / Hallo...\n2. Context: Why writing\n3. Main content: 2-3 paragraphs\n4. Closing: Viele Grüße / Bis bald\n\n**Press Article Structure (Teil 2):**\n1. Headline: Main topic\n2. Lead paragraph: 5 Ws (Who, What, When, Where, Why)\n3. Body: Details, quotes, background\n4. Conclusion: Summary or future outlook\n\n**Opinion Text Structure (Teil 4):**\n1. Thesis: Clear position (pro/contra)\n2. Argument 1 + example\n3. Argument 2 + example\n4. Conclusion/reinforcement\n\n**Tip:** Once you recognize the structure, you know where to look for specific info!",
            tips: "**ADVANCED READING STRATEGIES:**\n\n**1. The 'Question-First' Method:**\nBefore reading ANY text, spend 2-3 minutes on questions:\n- Underline question words: Wann? Wo? Wer? Warum? Was?\n- Highlight keywords in questions\n- Predict what info you need to find\n\nThis primes your brain to notice relevant details!\n\n**2. The 'Keyword Hunt' Technique (Teil 1 & 2):**\nFor True/False questions:\n- Identify 2-3 keywords in each question\n- Scan text for those exact words or synonyms\n- Read that sentence + 1 before + 1 after carefully\n- Don't read everything else!\n\n**Example:**\nQuestion: 'Maria geht gern ins Kino.'\nKeywords: Maria, Kino, gern\nScan for: These words or 'Film', 'ins Kino gehen', 'mag'\n\n**3. The 'Elimination Strategy' (MCQs):**\nFor multiple choice:\n- Cross out obviously wrong answers first (process of elimination)\n- Between two similar answers? Find the DIFFERENCE\n- Re-read that specific part of text\n- Choose the answer that matches exactly\n\n**4. The 'Checklist Method' (Teil 3 - Matching):**\nFor each person, create a mental checklist:\n\nExample: 'Anna sucht Wohnung in Berlin, 2 Zimmer, mit Balkon, maximal 800€'\n\nChecklist:\n- [ ] Stadt: Berlin\n- [ ] Größe: 2 Zimmer\n- [ ] Feature: Balkon\n- [ ] Preis: ≤800€\n\nScan ads for these 4 criteria. ALL must match!\n\n**5. The 'Opinion Mapping' Technique (Teil 4):**\nCreate a quick table while reading:\n\n| Author | Pro/Contra | Main Argument |\n|--------|------------|---------------|\n| Person A | PRO | saves time |\n| Person B | CONTRA | expensive |\n| Person C | PRO | convenient |\n| Person D | MIXED | depends |\n\nThis visual map helps match statements to authors!\n\n**6. The 'Not Mentioned' Trap - How to Avoid:**\n\nRule of thumb:\n- If you think 'This makes sense / This is logical' → Probably NOT MENTIONED\n- If you think 'The text directly says this' → TRUE\n- If you think 'The text says the opposite' → FALSE\n\nExample:\nText: 'Max ist Lehrer in einer Schule.'\nStatement: 'Max mag Kinder.'\n\nLogical? YES. But stated? NO. → Answer: Text sagt dazu nichts\n\n**7. Time-Saving Vocabulary Recognition:**\n\nLearn to recognize word families:\n- arbeiten (verb) → Arbeit (noun) → Arbeiter (person) → arbeitslos (adjective)\n- fahren → Fahrt → Fahrer → Fahrzeug\n\nIf you know the root word, you can guess meaning in context!\n\n**8. Table Reading Strategy (Teil 5):**\n\nRules/regulations tables are dense! Strategy:\n- Read question first: 'Wann muss man bezahlen?'\n- Find relevant row: 'Bezahlung'\n- Find relevant column: 'Wann?'\n- Find intersection: Your answer!\n\nDon't read the whole table - just hunt for specific cells!\n\n**9. Common Mistakes & How to Fix Them:**\n\n❌ **Mistake 1:** Reading text before questions\n✅ **Fix:** Questions first, ALWAYS. They guide your reading.\n\n❌ **Mistake 2:** Translating every unknown word\n✅ **Fix:** Guess from context. You don't need 100% comprehension.\n\n❌ **Mistake 3:** Spending too long on one Teil\n✅ **Fix:** Set phone alarm for each Teil. Move on even if incomplete.\n\n❌ **Mistake 4:** Changing answers without reason\n✅ **Fix:** First instinct is usually correct. Only change if you find contradictory evidence.\n\n❌ **Mistake 5:** Leaving questions blank\n✅ **Fix:** Always guess! No negative points. 33% chance of being right!\n\n**10. Daily Practice Routine (15 minutes):**\n\n**Week 1-2:** Focus on Teil 1 & 2 (True/False, MCQs)\n- Day 1-3: Teil 1 practice\n- Day 4-7: Teil 2 practice\n\n**Week 3-4:** Focus on Teil 3 & 4 (Matching, Opinions)\n- Day 1-3: Teil 3 practice\n- Day 4-7: Teil 4 practice\n\n**Week 5+:** Full reading sections under timed conditions\n\n**Resource Recommendation:** Read 'Deutsche Welle' news articles (B1 level) daily. Pick any article, read for 5 minutes, summarize in 2 sentences. This builds speed and comprehension!"
          },
          subtasks: [
            { description: "Download official telc B1 sample exam from telc.net or use PDF in telcb1 folder. Take Reading Teil 1 TIMED (5 min). Score yourself and analyze mistakes.", completed: false },
            { description: "Analyze mistakes: For each wrong answer, determine: Was it 'not mentioned' or 'misunderstood'? Write down WHY you got it wrong.", completed: false },
            { description: "Practice keyword hunting: Take any B1 text, create 5 True/False questions, identify keywords, scan text to find answers.", completed: false },
            { description: "Learn 30 connector words (jedoch, außerdem, deswegen, trotzdem, etc.) - make flashcards with example sentences.", completed: false },
            { description: "Practice Teil 3 matching: Take one practice set. Create a checklist for each person's requirements. Time: 5 minutes.", completed: false },
            { description: "Read one Deutsche Welle article (B1 level). Underline opinion indicators (Ich finde, Meiner Meinung nach, etc.). Count how many you found.", completed: false },
            { description: "Create your own 'Reading Strategy Card': Write down the telc time allocation (~25 min total: 5-6-5-6-3 min per Teil) and keep it visible during practice.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official telc Deutsch B1 Sample Exam", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/telc-deutsch-b1.html" },
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
            tips: "**VOCABULARY LEARNING STRATEGIES:**\n\n**1. The 'Goldlist Method' (Scientifically Proven!):**\n- **Day 1:** Write 25 new words in a notebook (3 columns: German | Plural | English)\n- **Day 14:** Review the list WITHOUT looking at English. Rewrite only the ones you forgot.\n- **Day 60:** Final review. The ones you still remember are now PERMANENT!\n\n**Why it works:** Spaced repetition matches your brain's forgetting curve.\n\n**2. The 'Anki Flashcard System':**\nDigital flashcards that use spaced repetition algorithm:\n\n**Front of card:**\n```\nder _____ (Pl: die _____)\n[English: father]\n```\n\n**Back of card:**\n```\nder VATER (Pl: die Väter)\nMein Vater arbeitet als Arzt.\n```\n\n**Why it works:** Tests recall (harder) instead of recognition (easier). Builds stronger memory!\n\n**3. The 'Personal Story' Method:**\nCreate ONE story using all new vocabulary:\n\n'Meine **Familie** ist groß. Ich habe zwei **Brüder** und eine **Schwester**. Meine **Eltern** sind **verheiratet** seit 30 Jahren. Mein **Vater** ist sehr **freundlich** und meine **Mutter** ist **geduldig**. Ich **treffe** mich oft mit meinem **Cousin**. Wir haben uns vor 10 Jahren **kennengelernt**.'\n\n**Why it works:** Context + emotion = stronger memory!\n\n**4. The 'Color-Coding System':**\n- **Blue** = Masculine (der)\n- **Red** = Feminine (die)\n- **Green** = Neuter (das)\n\nWrite words in colored pens. Your brain will start associating colors with genders!\n\n**5. The 'Article Chant' Technique:**\nSay article + noun + plural rhythmically:\n'der Vater, die Väter, der Vater, die Väter' (repeat 10x)\n\nMake it a song! Rhythm aids memory.\n\n**6. The 'Opposite Pairs' Method:**\nLearn antonyms together:\n- jung ↔ alt\n- freundlich ↔ unfreundlich\n- verheiratet ↔ geschieden\n- geduldig ↔ ungeduldig\n\n**7. The 'Real-Life Labeling':**\nThink about YOUR actual family:\n- Write each person's name: 'Maria (meine Schwester)'\n- Describe them: 'Maria ist 28 Jahre alt, sehr freundlich und hilfsbereit'\n- Personalized examples stick BETTER!\n\n**8. Common Mistakes to Avoid:**\n\n❌ **Mistake:** Learning vocabulary without articles\n✅ **Fix:** Always 'der Bruder', NEVER just 'Bruder'\n\n❌ **Mistake:** Ignoring plural forms\n✅ **Fix:** 'der Bruder, die Brüder' - both equally important!\n\n❌ **Mistake:** Learning words in isolation\n✅ **Fix:** Always one example sentence per word\n\n❌ **Mistake:** Passive reading of vocabulary lists\n✅ **Fix:** Active recall - cover English, try to remember\n\n**9. Daily Practice Routine (10 minutes):**\n\n**Morning (5 min):**\n- Review yesterday's 25 words (Anki or notebook)\n- Say them out loud with articles\n\n**Evening (5 min):**\n- Learn 25 NEW words\n- Write 5 sentences using new words\n- Describe one family member using 5 adjectives\n\n**10. Exam Application Tips:**\n\n**For Writing Teil 1 (Informal Email):**\nCommon prompts: 'Tell your friend about your family visit...'\n\nPrepare these sentence templates:\n- 'Ich habe meine **Familie** besucht.'\n- 'Mein **Bruder** hat mir **geholfen**.'\n- 'Wir haben uns sehr gut **verstanden**.'\n\n**For Speaking Teil 2 (Presentation):**\nTopic: 'Family in Modern Society'\n\nPrepare these phrases:\n- 'In meiner **Familie** sind wir sehr **eng**.'\n- 'Meine **Eltern** sind **verheiratet** seit 30 Jahren.'\n- 'Ich **treffe** mich oft mit meinen **Geschwistern**.'\n\n**Resource Tip:** B1 level requires approximately 2,400 words total. Both telc and Goethe share similar vocabulary requirements, so you can use any B1 word list for study. Focus on thematic learning (family, work, travel, etc.) for better retention!"
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
            { name: "telc B1 Vocabulary Resources", url: "https://www.telc.net" },
            { name: "Quizlet - German B1 Family Vocabulary", url: "https://quizlet.com/subject/german-b1-family" },
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
            definition: "telc B1 Listening is approximately **25-30 minutes** and is part of the 225-point written exam. **CRUCIAL FACT:** Most audio plays ONCE only (except Teil 1 which plays TWICE). This is mentally exhausting and requires intense concentration!\n\n**Why Listening is Challenging:** Unlike reading where you control the pace, listening forces you to process information in real-time. You can't 're-read' a spoken sentence. Plus, German native speakers talk FAST, with regional accents and colloquial expressions.\n\n**The Mindset Shift:** You DON'T need to understand every word! Focus on **main ideas** and **specific facts**. If you miss a word, DON'T panic - keep listening. The common trap: trying to understand 100% and missing everything that follows!\n\n**Good News:** Teil 1 plays twice, giving you multiple attempts at those points!",
            example: "**LISTENING MODULE BREAKDOWN (40 minutes, 30 points):**\n\n**Teil 1: 5 Short Monologues (15 minutes, 10 points)**\n\n**Format:**\n- 5 separate short texts (phone messages, announcements, instructions)\n- Each has 2 questions: 1 True/False + 1 Multiple Choice (3 options)\n- **Plays TWICE** ← Your safety net!\n- Length: Each ~30-45 seconds\n\n**Context Examples:**\n- Answering machine message from friend\n- Train station announcement\n- Radio weather report\n- Shop closing time announcement\n- Event invitation\n\n**Strategy:**\n- **First listening:** Get main idea, catch obvious answers\n- **Between playings:** Review questions, note what you missed\n- **Second listening:** Focus on missed details\n\n**Question Types:**\n\n*True/False Example:*\nAudio: 'Der Kurs beginnt am Montag um 9 Uhr.'\nQuestion: 'Der Kurs startet um 9 Uhr.'\nAnswer: **Richtig** (True - 'beginnt' = 'startet')\n\n*Multiple Choice Example:*\nAudio: 'Rufen Sie mich bitte heute Abend zurück.'\nQuestion: 'Wann soll man zurückrufen?'\na) Heute Morgen  b) **Heute Abend** ✓  c) Morgen früh\n\n---\n\n**Teil 2: 1 Long Monologue - Lecture/Presentation (10 minutes, 5 points)**\n\n**Format:**\n- One coherent presentation (museum tour, company info, travel guide)\n- 5 Multiple Choice questions\n- **Plays ONCE only!** ← High pressure!\n- Length: ~3-4 minutes\n- Formal language, lots of facts/numbers/dates\n\n**Context Examples:**\n- Museum guide explaining exhibition\n- University lecturer introducing course\n- Tour guide describing city sights\n- Company representative presenting services\n\n**Strategy:**\n- Questions appear in CHRONOLOGICAL order (follow the audio flow)\n- Write down ALL numbers/dates/names immediately (you won't remember!)\n- Use abbreviations: '19:00' not 'sieben Uhr abends'\n\n**Sample Question:**\n'Wie viele Mitarbeiter hat die Firma?'\na) 150  b) 250  c) 350\n\nAudio: '...unsere Firma beschäftigt heute etwa zweihundertfünfzig Mitarbeiter...'\n\nAnswer: **b) 250**\n\n**Number Vocab (ESSENTIAL!):**\n- etwa (approximately)\n- ungefähr (roughly)\n- mehr als (more than)\n- weniger als (less than)\n- mindestens (at least)\n- höchstens (at most)\n\n---\n\n**Teil 3: 1 Conversation - Everyday Dialogue (5 minutes, 7 points)**\n\n**Format:**\n- Conversation between 2 people (friends, colleagues, family)\n- 7 True/False questions\n- **Plays ONCE only!**\n- Length: ~3-4 minutes\n- Informal language, faster pace, interruptions\n\n**Context Examples:**\n- Planning a weekend trip\n- Discussing work problems\n- Talking about recent events\n- Making arrangements\n\n**The Trap:** Speaker A says something, Speaker B disagrees or adds info. Question asks about ONE person's opinion/action.\n\n**Example:**\nAudio:\nMann: 'Ich finde das Restaurant zu teuer.'\nFrau: 'Ach, ich denke, die Preise sind okay.'\n\nQuestion: 'Die Frau findet das Restaurant teuer.'\nAnswer: **Falsch** (False - she thinks prices are okay!)\n\n**Strategy:**\n- Take notes with 'M' (Mann) and 'F' (Frau) labels\n- Listen for opinion indicators:\n  - Ich finde... (I think)\n  - Meiner Meinung nach... (In my opinion)\n  - Ich glaube... (I believe)\n  - Für mich... (For me)\n\n---\n\n**Teil 4: Radio Discussion - 3+ People (10 minutes, 8 points)**\n\n**Format:**\n- Radio program with moderator + 2-3 guests\n- 8 Multiple Choice questions: 'WHO said WHAT?'\n- **Plays TWICE** ← Second safety net!\n- Length: ~4-5 minutes\n- Mix of formal and informal, various opinions\n\n**Context Examples:**\n- Debate about social media\n- Discussion about work-life balance\n- Opinions on environmental issues\n- Advice program\n\n**The Challenge:** Multiple speakers, must identify WHO holds which opinion.\n\n**Question Format:**\n'Wer findet, dass soziale Medien wichtig sind?'\na) Moderator  b) Person A  c) Person B\n\n**Strategy:**\n- Make a quick table:\n\n| Speaker | Opinion | Key Point |\n|---------|---------|------------|\n| Mod | neutral | asks questions |\n| Pers A | PRO | 'wichtig für Kontakte' |\n| Pers B | CONTRA | 'Zeitverschwendung' |\n\n**Important:** Moderator questions ≠ moderator's opinion! They're neutral.\n\n---\n\n**LISTENING SURVIVAL VOCABULARY:**\n\n**Time Expressions:**\n- morgens (in the morning)\n- vormittags (late morning)\n- mittags (at noon)\n- nachmittags (in the afternoon)\n- abends (in the evening)\n- nachts (at night)\n- werktags (on weekdays)\n- am Wochenende (on weekend)\n- sofort (immediately)\n- gleich (right away)\n- später (later)\n- bald (soon)\n- vorher (before)\n- nachher (afterwards)\n\n**Signal Words (Direction Changers!):**\n- aber (but)\n- jedoch (however)\n- trotzdem (nevertheless)\n- allerdings (though, however)\n- dagegen (on the other hand)\n- außerdem (moreover)\n- deshalb (therefore)\n- deswegen (that's why)\n- zum Beispiel (for example)\n- das heißt (that means)\n- mit anderen Worten (in other words)\n\n**Opinion/Attitude Markers:**\n- leider (unfortunately)\n- zum Glück (luckily)\n- hoffentlich (hopefully)\n- wahrscheinlich (probably)\n- vielleicht (maybe)\n- auf jeden Fall (definitely)\n- keinesfalls (by no means)\n- natürlich (naturally, of course)\n\n**Problem/Solution Indicators:**\n- das Problem ist... (the problem is)\n- die Schwierigkeit ist... (the difficulty is)\n- die Lösung ist... (the solution is)\n- man sollte... (one should)\n- man könnte... (one could)\n- es wäre besser... (it would be better)\n\n---\n\n**LISTENING TECHNIQUES:**\n\n**1. Predictive Listening:**\nBefore audio starts, read the question and predict possible answers.\n\nQuestion: 'Wann findet das Treffen statt?'\nPrediction: Listen for time words (Montag, morgen, 15 Uhr, etc.)\n\n**2. Note-Taking Symbols:**\nDevelop your own shorthand:\n- ✓ = positive/agree\n- ✗ = negative/disagree\n- → = result/consequence\n- ↑ = increase/more\n- ↓ = decrease/less\n- ? = unclear/check again\n- M/F = Mann/Frau (man/woman)\n- Mon/Die/etc = days (abbreviate)\n\n**3. Number Capture:**\nWhen you hear numbers, write IMMEDIATELY:\n- Times: 19:00 (not 'sieben Uhr')\n- Dates: 15.3. (not 'fünfzehnten März')\n- Amounts: 250€ (not 'zweihundertfünfzig')\n\n**4. Question Word Focus:**\nUnderline the question word - it tells you WHAT to listen for:\n- **Wann?** (When?) → Listen for time\n- **Wo?** (Where?) → Listen for place\n- **Wer?** (Who?) → Listen for person name/role\n- **Was?** (What?) → Listen for action/thing\n- **Warum?** (Why?) → Listen for 'weil', 'denn', 'deshalb'\n- **Wie?** (How?) → Listen for manner/description\n- **Wie viele?** (How many?) → Listen for numbers",
            tips: "**ADVANCED LISTENING STRATEGIES:**\n\n**1. The 'Pre-Reading Power' Technique:**\nYou get prep time before each Teil! Use it wisely:\n- Read ALL questions\n- Underline question words (Wann? Wo? Wer?)\n- Highlight keywords in questions\n- Make mental predictions\n\nThis primes your brain to recognize relevant info!\n\n**2. The 'Don't Panic, Keep Going' Rule:**\nIf you miss something:\n- ❌ DON'T: Stop and think 'What did they say?'\n- ✅ DO: Mark question with '?' and keep listening\n- Come back to it after (sometimes later info helps!)\n\n**3. The 'Synonym Recognition' Skill:**\nQuestions use DIFFERENT words than audio!\n\nAudio: 'Der Kurs beginnt am Montag.'\nQuestion: 'Der Kurs **startet** am Montag.'\n\nLearn synonym pairs:\n- beginnen = anfangen = starten (begin/start)\n- enden = aufhören = fertig sein (end/finish)\n- treffen = sich sehen (meet)\n- zurückrufen = nochmal anrufen (call back)\n- Bescheid sagen = informieren (inform)\n\n**4. The 'First Listening vs Second Listening' Strategy (Teil 1 & 4):**\n\n**First Listening:**\n- Listen for overall context (What's this about?)\n- Answer EASY questions (the obvious ones)\n- Mark uncertain answers with '?'\n\n**Second Listening:**\n- Focus ONLY on '?' marked questions\n- Ignore already-answered questions\n- Maximum concentration on gaps\n\n**5. The 'Process of Elimination' for MCQs:**\nWhen unsure between options:\n- Cross out obviously wrong answer(s)\n- Between two similar? Listen for the DIFFERENCE\n- Which word actually appeared in audio?\n\n**6. True/False Strategy:**\n\nQuestion: 'Der Mann kauft ein Ticket für Montag.'\n\nListen for:\n- ✓ Exact match: 'Ich kaufe ein Ticket für Montag' = TRUE\n- ✗ Contradiction: 'Ich kaufe ein Ticket für Dienstag' = FALSE\n- ? Not mentioned: He talks about travel but not which day = TEXT SAGT DAZU NICHTS\n\n**7. Common Listening Mistakes:**\n\n❌ **Mistake 1:** Translating every word in your head\n✅ **Fix:** Listen for meaning, not word-by-word\n\n❌ **Mistake 2:** Focusing on unknown words\n✅ **Fix:** Skip unknown words, focus on what you DO understand\n\n❌ **Mistake 3:** Not using prep time\n✅ **Fix:** Read questions in advance EVERY time\n\n❌ **Mistake 4:** Writing full sentences in notes\n✅ **Fix:** Abbreviations and symbols only!\n\n❌ **Mistake 5:** Giving up after missing something\n✅ **Fix:** Keep listening, next question might be easier\n\n**8. Accent & Speed Adaptation:**\nGerman has regional varieties:\n- Standard German (Hochdeutsch) - exam uses this mostly\n- Austrian German - some vowel differences\n- Swiss German - quite different, but exams avoid heavy accents\n\n**Training tip:** Listen to podcasts from different regions:\n- DW News (standard)\n- ORF News (Austrian)\n- SRF News (Swiss)\n\n**9. Daily Listening Practice Routine (15 minutes):**\n\n**Week 1-2: Slow German**\n- 'Slow German' podcast - perfect for beginners\n- 'DW Langsam gesprochene Nachrichten' - slow news\n\n**Week 3-4: Normal Speed**\n- 'Easy German' podcast - natural speed, German subtitles\n- Deutsche Welle Learn German podcasts\n\n**Week 5+: Exam Practice**\n- Official telc B1 sample exam audio\n- Practice tests under timed conditions\n\n**10. Background Listening Strategy:**\nPlay German radio/podcasts while doing other tasks:\n- Cooking? German music radio\n- Commuting? German podcast\n- Exercising? German audiobook\n\nYou're training your ear to recognize German rhythms and sounds!\n\n**11. Shadowing Technique:**\nListen to a sentence, pause, repeat OUT LOUD exactly as you heard it:\n- Mimics pronunciation\n- Improves listening comprehension\n- Builds speaking fluency\n\nDo this 5 minutes daily with 'Easy German' episodes!\n\n**12. The 'First Word is Gold' Rule:**\nIn German, sentence structure often puts important words first:\n- 'Morgen gehe ich...' (Tomorrow I go...) - WHEN is first!\n- 'In Berlin wohne ich...' (In Berlin I live...) - WHERE is first!\n\nTrain your ear to catch the first 2-3 words - they often answer the question!"
          },
          subtasks: [
            { description: "Download official telc B1 sample exam audio from telc.net or use your PDF resources. Listen to Teil 1 once WITHOUT questions. What's the main topic of each text? Write down.", completed: false },
            { description: "Now do Teil 1 properly: Read questions first, listen twice, answer all questions. Score yourself and analyze mistakes. Time yourself appropriately.", completed: false },
            { description: "Listen to 'Slow German' podcast (any episode, 10 minutes). Task: Write down main topic + 3 supporting details. Don't worry about understanding everything!", completed: false },
            { description: "Dictation practice: Choose any 5 simple German sentences (from textbook or online). Listen 3 times, write exactly what you hear. Check spelling and articles.", completed: false },
            { description: "Learn 40 'listening signal words': Create flashcards for aber, jedoch, trotzdem, außerdem, deshalb, zum Beispiel, das heißt, leider, zum Glück, etc.", completed: false },
            { description: "Number recognition drill: Listen to German numbers 1-1000 on YouTube. Write down 20 random numbers you hear. Check your accuracy.", completed: false },
            { description: "Create your note-taking symbol key: Design 10 symbols you'll use during listening (✓,✗,M,F,→, time abbreviations, etc.). Practice using them with one practice audio.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official telc Deutsch B1 Audio Samples", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/telc-deutsch-b1.html" },
            { name: "Slow German Podcast (Annik Rubens)", url: "https://www.slowgerman.com" },
            { name: "DW Langsam gesprochene Nachrichten (Slow News)", url: "https://www.dw.com/de/deutsch-lernen/nachrichten/s-8030" },
            { name: "Easy German Podcast (Natural Speed)", url: "https://www.easygerman.fm" },
            { name: "Deutsche Welle Learn German - Listening Exercises", url: "https://learngerman.dw.com/en/overview" },
            { name: "German Numbers Pronunciation (YouTube)", url: "https://www.youtube.com/results?search_query=german+numbers+pronunciation" },
            { name: "B1 Listening Practice Tests", url: "https://www.german-grammar.de/grammar" }
          ],
          notes: ""
        },
        {
          day: 6,
          task: "Speaking Module Overview + Teil 1 Practice (Sich vorstellen)",
          focus: "speaking",
          level: "B1",
          lessonContent: {
            title: "Sprechen Teil 1: Sich vorstellen (Introduce Yourself) - telc Format",
            definition: "telc B1 Speaking is done in PAIRS. Total time: 15-16 minutes + 20 min prep, 75 points total. **Teil 1 (2-3 min):** Make contact with your partner and introduce yourself. This is NOT a planning task like in Goethe! You simply talk about yourself - name, origin, work/studies, hobbies, family, why learning German, etc.\n\n**Important:** This is a warm-up section to help you relax. Be natural and friendly!\n\n**What to cover:**\n- Personal information (name, age, origin)\n- Current situation (work/studies)\n- Family/living situation\n- Interests and hobbies\n- Why you're learning German\n- Future plans\n\n**Scoring:** Part of the overall 75-point oral exam. Focus on fluency and making a connection with your partner!",
            example: "**TYPICAL telc TEIL 1 - SICH VORSTELLEN:**\n\n**Examiner prompt:** 'Stellen Sie sich bitte vor und lernen Sie sich kennen.' (Please introduce yourselves and get to know each other.)\n\n**Candidate A starts:**\n'Guten Tag! Ich heiße Maria Schmidt und komme aus Spanien, aus Barcelona. Ich bin 28 Jahre alt und wohne seit zwei Jahren in Deutschland, in München. Ich arbeite als Ingenieurin bei Siemens. Und woher kommst du?'\n\n**Candidate B responds:**\n'Hallo Maria! Freut mich. Ich bin Ahmed und komme aus Ägypten. Ich studiere hier Medizin an der Universität. Warum lernst du Deutsch?'\n\n**Candidate A:**\n'Ich brauche Deutsch für meinen Beruf. Bei der Arbeit sprechen wir viel Deutsch. Und du? Was machst du in deiner Freizeit?'\n\n**Candidate B:**\n'In meiner Freizeit spiele ich gern Fußball und lese Bücher. Hast du auch Hobbys?'\n\n**KEY ELEMENTS SHOWN:**\n✓ Greeting and name\n✓ Origin and age\n✓ Current living situation\n✓ Work/studies\n✓ Asking partner questions (interaction!)\n✓ Hobbies mentioned\n✓ Natural conversation flow\n\n**ESSENTIAL PHRASES FOR TEIL 1:**\n\n**Introducing yourself:**\n- 'Ich heiße... / Mein Name ist...'\n- 'Ich komme aus... (country/city)'\n- 'Ich bin... Jahre alt'\n- 'Ich wohne in... / Ich lebe seit... in...'\n- 'Ich arbeite als... / Ich bin... von Beruf'\n- 'Ich studiere... / Ich mache eine Ausbildung als...'\n\n**Making contact:**\n- 'Freut mich!' / 'Angenehm!'\n- 'Und du? / Und Sie?' (depends on if using du or Sie)\n- 'Woher kommst du?'\n- 'Was machst du beruflich?'\n- 'Wie lange wohnst du schon hier?'\n\n**Talking about reasons for learning:**\n- 'Ich lerne Deutsch, weil...'\n- 'Ich brauche Deutsch für meinen Beruf / mein Studium'\n- 'Ich finde die deutsche Sprache interessant'\n- 'Ich möchte in Deutschland leben/arbeiten'\n\n**Hobbies and interests:**\n- 'In meiner Freizeit... (verb)'\n- 'Ich interessiere mich für...'\n- 'Mein Hobby ist...'\n- 'Ich spiele gern... / Ich lese gern... / Ich reise gern...'\n\n**NOTE:** telc Teil 3 is where you do planning tasks! Teil 1 is just introductions.",
            tips: "**CRITICAL TIPS FOR telc TEIL 1:**\n\n**1. This is a WARM-UP:** Don't stress! Examiners want you to relax and show natural conversation skills.\n\n**2. Interact with your partner:** Don't just talk about yourself - ask your partner questions too! 'Und du?' 'Woher kommst du?' This shows B1 interaction skills.\n\n**3. Prepare your introduction:** Have a 30-second intro ready:\n- Name, age, origin\n- Where you live now\n- What you do (work/study)\n- One hobby\n- Why learning German\n\n**4. Use connecting words:** Instead of short sentences, connect ideas:\n- 'Ich komme aus Spanien **und** wohne seit zwei Jahren in München.'\n- 'Ich arbeite als Lehrer, **aber** ich möchte Ingenieur werden.'\n- 'Ich lerne Deutsch, **weil** ich in Deutschland arbeiten möchte.'\n\n**5. Don't memorize word-for-word:** Have key points ready, but speak naturally. If you forget something, that's okay - just keep going!\n\n**6. Teil 1 vs Teil 3:** Remember - Teil 1 = introduce yourself, Teil 3 = planning task (Gemeinsam etwas planen). Don't confuse them!"
          },
          subtasks: [
            { description: "Watch telc B1 speaking videos on YouTube - search 'telc B1 mündliche Prüfung'. Note how candidates introduce themselves in Teil 1.", completed: false },
            { description: "Prepare your personal introduction: Write and memorize key points (name, origin, work/study, hobbies, why learning German). Practice until fluent.", completed: false },
            { description: "Record yourself: Do a 2-minute self-introduction. Listen back. Check: Did you use connecting words? Did you speak clearly? Natural pace?", completed: false },
            { description: "Practice with language partner: Take turns introducing yourselves. Ask each other questions. Make it conversational, not a speech!", completed: false },
            { description: "Learn interaction phrases: Memorize 'Und du?', 'Woher kommst du?', 'Was machst du beruflich?', 'Freut mich!', etc. These show B1 level!", completed: false }
          ],
          completed: false,
          resources: [
            { name: "telc B1 Speaking Videos (YouTube)", url: "https://www.youtube.com/results?search_query=telc+b1+m%C3%BCndliche+pr%C3%BCfung" },
            { name: "telc Official Speaking Examples", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/telc-deutsch-b1.html" },
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
            example: "**WEEK 1 CHECKLIST:**\n\n✅ Grammar:\n- 4 cases (NOM/AKK/DAT) articles memorized?\n- Present tense regular verbs conjugated?\n- Irregular verbs (sein, haben, werden) mastered?\n\n✅ Exam Strategy:\n- Downloaded official telc sample exam?\n- Understand telc structure: 150 min written (Reading ~25, Sprachbausteine ~15, Listening 25-30, Writing 30) + 15 min oral?\n- Know 60% overall passing requirement (135/225 written, 45/75 oral)?\n- Understand telc compensation system?\n\n✅ Vocabulary:\n- 150 words learned (family, relationships)?\n- Nouns learned with article + plural?\n\n✅ Skills Practice:\n- Did one reading Teil?\n- Did one listening Teil?\n- Practiced speaking Teil 1 (Sich vorstellen)?\n\n**TODAY'S MOCK TEST:**\nReading Teil 1 (Blog) + Teil 2 (Press) = ~11 minutes\nScore yourself and check accuracy\n\n**If you struggled:** Review cases more - reading comprehension often fails due to misidentifying subjects/objects.",
            tips: "**STUDY TECHNIQUE:** Use 'active recall' - close your books and write everything you remember about dative case. Then check. What did you miss? That's your focus for next week! For vocabulary, test yourself English→German (harder direction). If you can produce the German word with correct article, you truly know it."
          },
          subtasks: [
            { description: "Take timed Reading Teil 1 + 2 from official telc sample (~11 min total). Record your score and accuracy.", completed: false },
            { description: "Review all incorrect answers: WHY was it wrong? Vocabulary issue or comprehension issue?", completed: false },
            { description: "Flashcard review: Go through all Week 1 vocabulary (150 words) - separate 'known' and 'needs practice' piles.", completed: false },
            { description: "Grammar check: Write 10 sentences using all 3 cases learned (NOM/AKK/DAT) - have native speaker or teacher check if possible.", completed: false },
            { description: "Plan Week 2: What was hardest this week? Allocate extra time to that skill next week.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official telc B1 Sample Exam", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/telc-deutsch-b1.html" },
            { name: "Self-Assessment Tools", url: "https://www.telc.net" }
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
            { name: "telc B1 Speaking Samples (Video)", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/telc-deutsch-b1.html" },
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
          task: "Week 2 Consolidation: Grammar, Vocabulary & Skills Integration",
          focus: "consolidation",
          level: "B1",
          lessonContent: {
            title: "Week 2 Mastery Check: Perfekt Tense + Daily Routine + Exam Skills",
            definition: "Consolidation day transforms scattered knowledge into INTEGRATED skills! This isn't just review - it's about combining Week 2's grammar (Perfekt tense), vocabulary (daily routine 100+ words), and exam strategies (Writing Teil 1, Listening Teil 2 & 3, Speaking Teil 2) into one cohesive skillset.\n\n**Why Consolidation Days Are Critical:** You've learned 5 major topics this week. Without integration practice, they remain isolated facts. Today, you'll use Perfekt tense WHILE describing daily routine WHILE applying Writing Teil 1 format. This multi-skill practice mirrors the actual exam!\n\n**What You've Covered This Week:**\n- **Day 1:** Perfekt Tense (haben/sein + past participles, 30+ verbs)\n- **Day 2:** Daily Routine Vocabulary (200+ verbs and time expressions)\n- **Day 3:** Writing Teil 1 - Informal Email (format, phrases, 5 model answers)\n- **Day 4:** Listening Teil 2 & 3 Strategies (note-taking, M/F tracking, prediction)\n- **Day 5:** Speaking Teil 2 - Presentation (10 universal topics, 30+ phrases)\n\n**Today's Goals:**\n1. Test Perfekt tense mastery (30 core verbs)\n2. Self-assess daily routine vocabulary (100-word active use)\n3. Practice integrated writing using Week 2 content\n4. Review listening and speaking strategies\n5. Identify weak spots before Week 3\n\n**Week 2 Exam Impact:** Perfekt tense appears in 80% of Writing Teil 1 tasks (describing past events). Daily routine vocabulary is essential for Speaking Teil 2 presentations. These aren't just 'topics' - they're exam survival skills!",
            example: "**WEEK 2 COMPREHENSIVE MASTERY CHECKLIST:**\n\n---\n\n**PART 1: PERFEKT TENSE MASTERY (40% of Week 2)**\n\n**✅ THE 30 ESSENTIAL VERBS - Can You Form Them All?**\n\nTest yourself: Cover the right column, say the Perfekt form out loud!\n\n**Group 1: HABEN + ge...t (Regular)**\n\n| Infinitive | Perfekt Form | English |\n|------------|--------------|----------|\n| machen | **ich habe gemacht** | made/did |\n| kaufen | **ich habe gekauft** | bought |\n| spielen | **ich habe gespielt** | played |\n| arbeiten | **ich habe gearbeitet** | worked |\n| kochen | **ich habe gekocht** | cooked |\n\n**Score: ___/5** (Can you say all 5 without looking?)\n\n**Group 2: HABEN + ge...en (Irregular)**\n\n| Infinitive | Perfekt Form | English |\n|------------|--------------|----------|\n| essen | **ich habe gegessen** | ate |\n| lesen | **ich habe gelesen** | read |\n| sehen | **ich habe gesehen** | saw |\n| trinken | **ich habe getrunken** | drank |\n| schreiben | **ich habe geschrieben** | wrote |\n| nehmen | **ich habe genommen** | took |\n| sprechen | **ich habe gesprochen** | spoke |\n\n**Score: ___/7**\n\n**Group 3: SEIN + Verbs (Movement & Change)**\n\n| Infinitive | Perfekt Form | English |\n|------------|--------------|----------|\n| gehen | **ich bin gegangen** | went |\n| fahren | **ich bin gefahren** | drove/went |\n| kommen | **ich bin gekommen** | came |\n| fliegen | **ich bin geflogen** | flew |\n| bleiben | **ich bin geblieben** | stayed |\n| sein | **ich bin gewesen** | was/been |\n| werden | **ich bin geworden** | became |\n\n**Score: ___/7**\n\n**Group 4: Separable Prefix Verbs**\n\n| Infinitive | Perfekt Form | English |\n|------------|--------------|----------|\n| aufstehen | **ich bin aufgestanden** | got up |\n| einkaufen | **ich habe eingekauft** | shopped |\n| fernsehen | **ich habe ferngesehen** | watched TV |\n| anfangen | **ich habe angefangen** | began |\n| anrufen | **ich habe angerufen** | called |\n\n**Score: ___/5**\n\n**Group 5: No 'ge-' Prefix (Inseparable & -ieren)**\n\n| Infinitive | Perfekt Form | English |\n|------------|--------------|----------|\n| beginnen | **ich habe begonnen** | began |\n| verstehen | **ich habe verstanden** | understood |\n| besuchen | **ich habe besucht** | visited |\n| erzählen | **ich habe erzählt** | told |\n| studieren | **ich habe studiert** | studied |\n| telefonieren | **ich habe telefoniert** | phoned |\n\n**Score: ___/6**\n\n**TOTAL PERFEKT SCORE: ___/30**\n- 27-30: EXCELLENT! Perfekt mastery achieved!\n- 22-26: GOOD! Review the ones you missed\n- 18-21: OKAY - More practice needed\n- <18: URGENT! Re-study Day 1 before Week 3!\n\n**INTEGRATION TEST: Write 3 Sentences**\n\nCombine multiple Perfekt verbs in one sentence:\n\n1. Yesterday routine: 'Gestern bin ich um 7 Uhr aufgestanden, habe Kaffee getrunken, und bin zur Arbeit gefahren.'\n\n2. Weekend activity: 'Am Wochenende habe ich ein Buch gelesen, bin ins Kino gegangen, und habe meine Freunde besucht.'\n\n3. Last vacation: 'Im Urlaub bin ich nach Italien geflogen, habe Pizza gegessen, und bin am Strand geblieben.'\n\n**Can you write 3 similar sentences? Try now! Each must have 3+ Perfekt verbs.**\n\n---\n\n**PART 2: DAILY ROUTINE VOCABULARY (30% of Week 2)**\n\n**✅ THE 100-WORD ACTIVE VOCABULARY TEST**\n\n**Morning Routine (25 words):**\nCan you say these in German without looking?\n\n| English | German | Can Say It? |\n|---------|--------|-------------|\n| wake up | aufwachen | [ ] |\n| get up | aufstehen | [ ] |\n| brush teeth | Zähne putzen | [ ] |\n| take shower | duschen | [ ] |\n| get dressed | sich anziehen | [ ] |\n| have breakfast | frühstücken | [ ] |\n| drink coffee | Kaffee trinken | [ ] |\n| read newspaper | Zeitung lesen | [ ] |\n| leave house | das Haus verlassen | [ ] |\n| go to work | zur Arbeit gehen | [ ] |\n\n**Score: ___/10**\n\n**Daytime Activities (25 words):**\n\n| English | German | Can Say It? |\n|---------|--------|-------------|\n| work | arbeiten | [ ] |\n| have lunch | zu Mittag essen | [ ] |\n| meet friends | Freunde treffen | [ ] |\n| go shopping | einkaufen gehen | [ ] |\n| study | lernen/studieren | [ ] |\n| make phone calls | telefonieren | [ ] |\n| write emails | E-Mails schreiben | [ ] |\n| have meeting | eine Besprechung haben | [ ] |\n| take break | eine Pause machen | [ ] |\n| drive/take bus | Bus fahren | [ ] |\n\n**Score: ___/10**\n\n**Evening Routine (25 words):**\n\n| English | German | Can Say It? |\n|---------|--------|-------------|\n| come home | nach Hause kommen | [ ] |\n| cook dinner | Abendessen kochen | [ ] |\n| watch TV | fernsehen | [ ] |\n| do homework | Hausaufgaben machen | [ ] |\n| relax | sich entspannen | [ ] |\n| listen to music | Musik hören | [ ] |\n| clean apartment | die Wohnung putzen | [ ] |\n| do laundry | Wäsche waschen | [ ] |\n| read book | ein Buch lesen | [ ] |\n| go to bed | ins Bett gehen | [ ] |\n\n**Score: ___/10**\n\n**Time Expressions (25 words):**\n\n| English | German | Can Say It? |\n|---------|--------|-------------|\n| in the morning | morgens/am Morgen | [ ] |\n| at noon | mittags/am Mittag | [ ] |\n| in the afternoon | nachmittags | [ ] |\n| in the evening | abends/am Abend | [ ] |\n| at night | nachts/in der Nacht | [ ] |\n| every day | jeden Tag | [ ] |\n| sometimes | manchmal | [ ] |\n| always | immer | [ ] |\n| never | nie | [ ] |\n| first/then | zuerst/dann | [ ] |\n\n**Score: ___/10**\n\n**TOTAL VOCABULARY SCORE: ___/40**\n- 35-40: EXCELLENT! Vocabulary is active!\n- 28-34: GOOD! Review the weak categories\n- 22-27: OKAY - More flashcard practice needed\n- <22: URGENT! Re-study Day 2 vocabulary lists!\n\n**INTEGRATION TEST: Describe Your Day**\n\nSpeak or write 5 sentences about your typical day using:\n- Daily routine vocabulary (10+ words)\n- Perfekt tense (if past) or present tense (if typical)\n- Time expressions (morgens, dann, abends)\n\nExample:\n'Normalerweise stehe ich um 7 Uhr auf. Zuerst dusche ich und frühstücke. Dann fahre ich zur Arbeit. Mittags esse ich in der Kantine. Abends sehe ich fern und gehe um 11 Uhr ins Bett.'\n\n**Your Turn:** Write it now! (50-70 words)\n\n---\n\n**PART 3: WRITING TEIL 1 MASTERY (20% of Week 2)**\n\n**✅ EMAIL FORMAT CHECKLIST**\n\nCan you write an informal email with all these elements?\n\n**Structure Elements:**\n- [ ] **Greeting:** Liebe/Lieber [Name],\n- [ ] **Opening question:** Wie geht es dir? / Danke für deine Email!\n- [ ] **All 4 Leitpunkte covered** (address all 4 given points)\n- [ ] **Personal details & examples** (not just 'yes/no' answers)\n- [ ] **Closing question:** Schreib mir bald! / Wie geht es dir?\n- [ ] **Sign-off:** Viele Grüße / Liebe Grüße + Your Name\n\n**Content Requirements:**\n- [ ] **80-90 words** (not 60, not 120!)\n- [ ] **Perfekt tense** for past events (at least 3 verbs)\n- [ ] **Present tense** for current situations\n- [ ] **Connectors:** und, aber, weil, deshalb, dann\n- [ ] **Variety:** Not all sentences start with 'Ich...'\n\n**Score: ___/11**\n- 10-11: Ready for exam!\n- 8-9: Good! Minor improvements\n- <8: Review Day 3 email templates!\n\n**PRACTICE TASK:**\n\nWrite a complete email (80-90 words) responding to this:\n\n**Topic:** Your friend asks about your weekend.\n**Leitpunkte:**\n1. What did you do? (activities)\n2. Where did you go?\n3. Who were you with?\n4. How was the weather?\n\n**Use:** Perfekt tense, daily routine vocabulary, proper email format.\n\n**Timer:** 20 minutes (exam condition!)\n\n---\n\n**PART 4: LISTENING STRATEGIES REVIEW (5% of Week 2)**\n\n**✅ TEIL 2 & 3 QUICK CHECK**\n\n**Teil 2 (Monologue - 5 MCQs):**\n- [ ] Do I read questions BEFORE listening?\n- [ ] Can I predict content from question topics?\n- [ ] Do I write answer immediately when I hear it?\n- [ ] Do I know to watch for 'BUT' reversal words? (aber, trotzdem)\n- [ ] Can I handle numbers/dates/times quickly?\n\n**Teil 3 (Conversation - 7 True/False):**\n- [ ] Do I track M (male) vs F (female) speaker?\n- [ ] Can I distinguish 'richtig' vs 'Text sagt dazu nichts'?\n- [ ] Do I use speed symbols (✓, ✗, →, ?, M/F)?\n- [ ] Do I know common traps (partial truths, pronoun confusion)?\n\n**Score: ___/9**\n- 8-9: Strategies mastered!\n- 6-7: Review Day 4\n- <6: Re-study listening techniques!\n\n---\n\n**PART 5: SPEAKING TEIL 2 QUICK CHECK (5% of Week 2)**\n\n**✅ PRESENTATION STRUCTURE**\n\n**4-Part Framework:**\n- [ ] **Introduction** (30 sec): State topic + relevance\n- [ ] **Personal Experience** (1 min): Specific story with details\n- [ ] **Pros & Cons** (1-1.5 min): 2-3 advantages, 2-3 disadvantages\n- [ ] **Your Country** (30 sec): How topic relates to your country\n\n**Delivery Skills:**\n- [ ] Can I speak 3 minutes without reading notes?\n- [ ] Do I use presentation phrases? (Meiner Meinung nach, Ein Vorteil ist...)\n- [ ] Have I prepared 5-10 universal topics?\n- [ ] Can I reduce 'ähm' filler sounds?\n\n**Score: ___/8**\n- 7-8: Speaking skills solid!\n- 5-6: Review Day 5\n- <5: More practice needed!\n\n---\n\n**WEEK 2 INTEGRATED PRACTICE:**\n\n**TASK 1: Write Email Using Everything!**\n\nTopic: Describe your daily routine last week.\n\nRequirements:\n- 85 words exactly\n- Use 10+ daily routine vocabulary words\n- Use 8+ Perfekt tense verbs\n- Include time expressions (morgens, mittags, abends)\n- Proper email format\n\n**Timer: 25 minutes** (slightly more than exam to build confidence)\n\n**TASK 2: Speaking Practice**\n\nPrepare 2-minute monologue:\n'My typical daily routine' (use present tense)\nOR\n'What I did yesterday' (use Perfekt tense)\n\nRequirements:\n- 15+ daily routine vocabulary words\n- Correct verb conjugations\n- Logical flow (zuerst, dann, danach, schließlich)\n- Time expressions\n\n**Record yourself! Listen back:** Grammar errors? Vocabulary variety? Fluency?\n\n---\n\n**WEEK 2 OVERALL SELF-ASSESSMENT:**\n\n**Rate Each Skill (1-10):**\n\n1. Perfekt Tense Formation: ___/10\n   - Can I form 25+ verbs correctly?\n   - Do I know haben vs sein rules?\n\n2. Daily Routine Vocabulary: ___/10\n   - Can I describe my day in 10 sentences?\n   - Active use of 50+ words?\n\n3. Writing Teil 1 Skills: ___/10\n   - Can I write 80-90 word email in 20 minutes?\n   - Do I address all Leitpunkte?\n\n4. Listening Strategies: ___/10\n   - Do I use prediction + note-taking?\n   - Can I handle Teil 2 & 3 format?\n\n5. Speaking Presentation: ___/10\n   - Can I speak 3 minutes on a topic?\n   - Do I use 4-part structure?\n\n**TOTAL: ___/50**\n\n**Interpretation:**\n- 43-50: EXCELLENT! Week 2 mastered! Ready for Week 3!\n- 35-42: GOOD! Solid foundation, minor gaps to fill\n- 28-34: OKAY - Review weak areas before Week 3\n- <28: URGENT! Spend extra day reviewing Week 2!\n\n**Strengths This Week:**\n1. _______________________________\n2. _______________________________\n3. _______________________________\n\n**Challenges This Week:**\n1. _______________________________\n2. _______________________________\n3. _______________________________\n\n**Week 3 Focus Plan:**\nBased on your self-assessment, prioritize:\n- [ ] More Perfekt practice (if score <7)\n- [ ] Daily vocabulary drilling (if score <7)\n- [ ] Timed writing practice (if score <7)\n- [ ] Listening audio exposure (if score <7)\n- [ ] Speaking recording practice (if score <7)",
            tips: "**10 CONSOLIDATION STRATEGIES:**\n\n**1. The 'Integration Practice' Method:**\nDon't practice skills in isolation!\n❌ Study Perfekt verbs as flashcards only\n✅ Write a paragraph using Perfekt + daily routine vocabulary\n\nIntegrated practice = exam-ready performance!\n\n**2. The 'Error Log' System:**\nCreate a notebook section for Week 2 mistakes:\n- Column 1: Date\n- Column 2: Type (grammar/vocabulary/structure)\n- Column 3: The mistake\n- Column 4: Correction\n- Column 5: Why I made it\n\nReview this log daily. Common errors = focus areas!\n\n**3. The 'Timed Practice' Approach:**\nToday's practice should be TIMED:\n- Email writing: 20 minutes MAX\n- Speaking practice: 3 minutes EXACT\n- Perfekt verb test: 5 minutes\n\nTime pressure = exam simulation!\n\n**4. The 'Weak Spot Targeting' Strategy:**\nFrom your self-assessment, pick your LOWEST score:\n- Score <7 in Perfekt? → Spend 30 min drilling verbs today\n- Score <7 in Vocabulary? → Make 50 flashcards NOW\n- Score <7 in Writing? → Write 3 practice emails today\n\nFocus 80% of today on your weakest area!\n\n**5. The 'Spaced Repetition' Review:**\nWeek 2 content needs review on:\n- **Day 8** (tomorrow = Day 1 review)\n- **Day 14** (1 week later)\n- **Day 35** (1 month later)\n\nSchedule these reviews NOW in your calendar!\n\n**6. The 'Active Recall' Test:**\nFor vocabulary review:\n❌ Don't just re-read lists\n✅ Cover German column, try to recall from English\n✅ Speak words out loud\n✅ Write sentences using them\n\nActive recall = 3x stronger memory!\n\n**7. The 'Real-World Application' Challenge:**\nUse Week 2 content in real situations:\n- Describe your day to language partner (daily routine + Perfekt)\n- Write diary entry about yesterday (Writing Teil 1 practice)\n- Record voice memo about weekend plans (Speaking practice)\n\nReal use = permanent learning!\n\n**8. The 'Self-Teaching' Technique:**\nExplain one Week 2 concept to someone else:\n- Teach Perfekt haben vs sein rule to friend\n- Show daily routine vocabulary to study group\n- Explain Writing Teil 1 structure to family member\n\nIf you can teach it clearly = you know it deeply!\n\n**9. The 'Mixed Practice' Drill:**\nCombine multiple skills randomly:\n\n**Drill 1:** Say 10 Perfekt sentences about daily routine\n**Drill 2:** Write email using time expressions\n**Drill 3:** Listen to podcast, note daily routine vocabulary heard\n**Drill 4:** Speak 2-min presentation about 'My Typical Day'\n\nRandom mixing = stronger connections!\n\n**10. The 'Confidence Building' Mindset:**\nCelebrate Week 2 wins:\n- ✅ I learned 30+ Perfekt verbs!\n- ✅ I can now describe my entire day in German!\n- ✅ I know how to write an informal email!\n- ✅ I have strategies for listening comprehension!\n- ✅ I can present for 3 minutes on a topic!\n\nThat's HUGE progress! Acknowledge it!\n\n**Week 3 Preview - What's Coming:**\n\n**Modal Verbs (können, müssen, wollen, dürfen, sollen, mögen):**\nEssential for expressing ability, necessity, permission!\n\n**Writing Teil 2 - Semi-Formal Forum Post:**\nDifferent tone from Teil 1 - arguing a position!\n\n**Work & Education Vocabulary (200 words):**\nJob titles, workplace terms, education system!\n\n**Reading Teil 3 & 4:**\nMatching exercises (ads, opinions) - scanning skills!\n\n**Speaking Teil 3 - Discussion:**\nBack-and-forth conversation with partner!\n\n**Get excited! Week 3 adds powerful new skills!**"
          },
          subtasks: [
            { description: "PERFEKT MASTERY TEST: Write all 30 verbs from memory (5 min timer). Score: ___/30. If <25, drill weak verbs for 20 more minutes using flashcards.", completed: false },
            { description: "VOCABULARY SELF-TEST: Cover German column in Day 2 notes. Say/write 40 daily routine words from English prompts. Score: ___/40. <32 = review needed!", completed: false },
            { description: "INTEGRATED WRITING TASK: Write complete informal email (80-90 words) about 'What I did last weekend'. Must use: 10+ Perfekt verbs, 8+ daily routine vocabulary, proper email format. Time: 25 minutes.", completed: false },
            { description: "SPEAKING PRACTICE: Record 2-minute monologue 'My Typical Weekday Routine'. Must include: 15+ daily routine words, correct present tense conjugations, time expressions (morgens, mittags, abends). Listen back: count grammar errors (goal: <5).", completed: false },
            { description: "LISTENING STRATEGIES REVIEW: Re-read Day 4 strategies. Write down the 5 most important strategies for Teil 2 and the 5 most important for Teil 3. Can you remember them without looking?", completed: false },
            { description: "ERROR LOG CREATION: Review all your practice from Week 2. Write down 10 mistakes you've made this week (grammar, vocabulary, format). For each: What was wrong? What's correct? Why did I make this mistake?", completed: false },
            { description: "TIMED SPEAKING DRILL: Choose 3 topics from Day 5's list (Online Shopping, Social Media, Healthy Eating). For each: 15 min prep, 3 min presentation (record yourself). Did you use 4-part structure? Time correctly? Reduce 'ähm' fillers?", completed: false },
            { description: "WEEK 2 REFLECTION: Write answers to: (1) What was hardest this week? (2) What did I master? (3) What needs more practice? (4) What's my Week 3 focus? (5) Confidence level 1-10: ___", completed: false },
          ],
          completed: false,
          resources: [
            { name: "Perfekt Tense Verb Drill (Interactive)", url: "https://www.schubert-verlag.de/aufgaben/xg/xg06_10.htm" },
            { name: "Daily Routine Vocabulary Quizlet", url: "https://quizlet.com/subject/german-daily-routine-b1" },
            { name: "telc B1 Writing Samples", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/telc-deutsch-b1.html" },
            { name: "B1 Mixed Practice Exercises", url: "https://www.deutschakademie.de/online-german-course/english" },
            { name: "Anki - Spaced Repetition Flashcards", url: "https://ankiweb.net" },
            { name: "DW Learn German - B1 Level", url: "https://learngerman.dw.com/en/overview" },
          ],
          notes: ""
        },
        {
          day: 7,
          task: "Week 2 Review + Mock Writing Test (Teil 1 & 2)",
          focus: "review",
          level: "B1",
          lessonContent: {
            title: "Week 2 Comprehensive Review: Writing Module Mock Exam",
            definition: "Week 2 Review Day = your CHECKPOINT before Week 3! This isn't passive re-reading - it's active TESTING under exam conditions. Today you'll take a full mock Writing module (Teil 1 + Teil 2 = 50 minutes total) to measure your progress and identify gaps.\n\n**Why Writing Module Today?** Week 2 focused heavily on skills needed for writing: Perfekt tense (describing past events), daily routine vocabulary (common email topics), and email format/structure. You're READY to test these skills together!\n\n**What You've Mastered This Week:**\n- ✅ **Perfekt Tense:** 30+ verbs (haben vs sein rules, past participles)\n- ✅ **Daily Routine Vocabulary:** 200+ words (morning, day, evening, night routines)\n- ✅ **Writing Teil 1:** Informal email format, 4-Leitpunkte structure, 80-90 words\n- ✅ **Listening Teil 2 & 3:** Note-taking strategies, M/F tracking, prediction techniques\n- ✅ **Speaking Teil 2:** Presentation skills, 10 universal topics, 4-part structure\n\n**Today's Goals:**\n1. Complete FULL timed Writing mock exam (Teil 1 + Teil 2)\n2. Analyze mistakes systematically (identify patterns)\n3. Create targeted improvement plan\n4. Review Week 2 mastery checklist\n5. Preview Week 3 and set goals\n\n**Exam Reality Check:** Writing module = 60 minutes, 75 points (45 for Teil 1, 25 for Teil 2 + 5 for Teil 3 formal letter). You need 45/75 points to pass (60%). Today's mock tells you if you're on track!",
            example: "**📝 MOCK WRITING MODULE - TEIL 1: INFORMAL EMAIL**\n\n**TIME: 30 minutes | POINTS: 45**\n\n---\n\n**THE TASK:**\n\nYou receive this email from your German friend Julia:\n\n*Liebe/r [Your Name],*\n\n*wie geht es dir? Ich habe lange nichts von dir gehört! Letzte Woche habe ich endlich meinen Traumjob bekommen - ich arbeite jetzt als Grafikdesignerin bei einer Werbeagentur in Berlin! Die erste Woche war sehr interessant, aber auch sehr anstrengend.*\n\n*Schreib mir doch bitte:*\n*- Wie war deine Woche?*\n*- Was hast du am Wochenende gemacht?*\n*- Hast du in letzter Zeit etwas Interessantes erlebt?*\n*- Wann können wir uns mal wieder treffen?*\n\n*Ich freue mich auf deine Antwort!*\n*Viele Grüße, Julia*\n\n---\n\n**WRITE YOUR ANSWER (80-90 words):**\n\n⏱️ **SET TIMER: 30 MINUTES - START NOW!**\n\n_(Write on separate paper. When done, count words and score yourself below.)_\n\n---\n\n**TEIL 1 SCORING GUIDE (45 points):**\n\n**1. Communicative Task Achievement (12 pts)**\n- Leitpunkt 1 (How was your week?): ___/3\n- Leitpunkt 2 (What did weekend?): ___/3\n- Leitpunkt 3 (Anything interesting?): ___/3\n- Leitpunkt 4 (When to meet?): ___/3\n\n**2. Coherence & Cohesion (12 pts)**\n- Proper greeting + opening: ___/3\n- Logical flow between points: ___/4\n- Connectors used (und, aber, weil): ___/2\n- Proper closing + sign-off: ___/3\n\n**3. Vocabulary & Grammar (12 pts)**\n- Perfekt tense correct (3+ verbs): ___/4\n- Present tense correct: ___/3\n- Vocabulary variety: ___/3\n- Articles & cases correct: ___/2\n\n**4. Formal Criteria (9 pts)**\n- Word count 80-90 (75-95 OK): ___/5\n- Informal tone ('du' form): ___/2\n- Natural German flow: ___/2\n\n**TEIL 1 TOTAL: ___/45**\n\n---\n\n**📝 MOCK WRITING MODULE - TEIL 2: FORUM POST**\n\n**TIME: 20 minutes | POINTS: 25**\n\n---\n\n**THE TASK:**\n\nYou read this online forum discussion:\n\n**FORUM TOPIC: \"Arbeiten von zu Hause - Pro oder Contra?\"**\n\n*\"Viele Firmen erlauben heute Homeoffice. Manche Menschen finden das toll, andere bevorzugen das Büro. Was ist Ihre Meinung?\"*\n\n---\n\n**WRITE YOUR FORUM RESPONSE (~80 words):**\n\nGive YOUR opinion + 2-3 reasons/examples\n\nRemember:\n- Semi-formal tone (Sie OR 'man', NO 'du'!)\n- Clear position\n- Examples with 'Zum Beispiel...'\n- Conclusion\n\n⏱️ **SET TIMER: 20 MINUTES - START NOW!**\n\n_(Write on separate paper. Score yourself below.)_\n\n---\n\n**TEIL 2 SCORING GUIDE (25 points):**\n\n**1. Content & Argumentation (10 pts)**\n- Clear opinion stated: ___/3\n- 2-3 reasons given: ___/4\n- Examples provided: ___/3\n\n**2. Coherence & Structure (6 pts)**\n- Logical organization: ___/3\n- Connectors (Erstens, Außerdem...): ___/3\n\n**3. Language Accuracy (6 pts)**\n- Grammar correct: ___/3\n- Vocabulary appropriate: ___/3\n\n**4. Register & Format (3 pts)**\n- Semi-formal maintained: ___/2\n- Word count ~80 (70-90 OK): ___/1\n\n**TEIL 2 TOTAL: ___/25**\n\n---\n\n**📊 COMBINED RESULTS:**\n\nTeil 1: ___/45\nTeil 2: ___/25\n**TOTAL: ___/70**\n\n**INTERPRETATION:**\n- **60-70 (86-100%)**: EXCELLENT! Far above passing!\n- **50-59 (71-85%)**: VERY GOOD! Solid B1 skills!\n- **42-49 (60-70%)**: GOOD! Passing level!\n- **35-41 (50-59%)**: CLOSE! Just below passing!\n- **<35 (<50%)**: NEEDS WORK! Review Days 1-6!\n\n---\n\n**🔍 MISTAKE ANALYSIS:**\n\nFor EACH error, complete:\n\n**Error #1:**\n- What I wrote: _______\n- Why wrong: _______\n- Correct version: _______\n- Rule: _______\n\n**Error #2:**\n- What I wrote: _______\n- Why wrong: _______\n- Correct version: _______\n- Rule: _______\n\n_(Continue for 5-10 errors)_\n\n**PATTERN CHECK:**\n- [ ] Perfekt tense errors?\n- [ ] Word order errors?\n- [ ] Missing Leitpunkte?\n- [ ] Wrong register (du in Teil 2)?\n- [ ] Too short/long?\n\n**Most Common Error Type:** _______\n\n---\n\n**✅ WEEK 2 MASTERY CHECKLIST:**\n\n**Day 1 - Perfekt Tense:**\n- [ ] Can form 25+ verbs?\n- [ ] Know haben vs sein?\nTest: ___/30 verbs\n\n**Day 2 - Daily Routine:**\n- [ ] Can name 50+ activities?\n- [ ] Know time expressions?\nTest: ___/40 words\n\n**Day 3 - Writing Teil 1:**\n- [ ] Know email format?\n- [ ] Can write 80-90 words?\nToday's score: ___/45\n\n**Day 4 - Listening:**\n- [ ] Know Teil 2 & 3 strategies?\n- [ ] Can use note-taking?\nConfidence: ___/10\n\n**Day 5 - Speaking:**\n- [ ] Know 4-part structure?\n- [ ] Prepared 5+ topics?\nConfidence: ___/10\n\n**WEEK 2 CONFIDENCE:**\n\nRate 1-10:\n1. Perfekt: ___\n2. Vocabulary: ___\n3. Writing: ___\n4. Listening: ___\n5. Speaking: ___\n**Total: ___/50**\n\n---\n\n**💭 WEEK 2 REFLECTION:**\n\n**1. Hardest part this week:**\n_______________________\n\n**2. Biggest achievement:**\n_______________________\n\n**3. Still confusing:**\n_______________________\n\n**4. Mock test results:**\nTeil 1: ___/45\nTeil 2: ___/25\nMain challenges: _______\n\n**5. Week 3 priorities (top 3):**\n1. _______________________\n2. _______________________\n3. _______________________\n\n**6. Confidence level:**\nWeek 1: ___/10\nWeek 2: ___/10\n\n---\n\n**🚀 WEEK 3 PREVIEW:**\n\n**Modal Verbs:**\nkönnen, müssen, wollen, dürfen, sollen, mögen\n\n**Work & Education:**\n200 vocabulary words\n\n**Writing Teil 2:**\nSemi-formal forum (deep dive!)\n\n**Reading Teil 3 & 4:**\nMatching exercises\n\n**Speaking Teil 3:**\nPartner discussion\n\n**🎉 CELEBRATE:**\nYou've completed 2/12 weeks!\n17% done!\n\n[██░░░░░░░░░░] 17%\n\n**Keep going! 💪**",
            tips: "**12 WEEK 2 REVIEW STRATEGIES:**\n\n**1. The 'Timed Writing' Drill:**\n[X] Today's mock was timed - did you finish?\n[X] Practice 3 more emails this week (20 min each)\n[X] Practice 3 more forum posts (15 min each)\n\nTime pressure = exam readiness!\n\n**2. The 'Error Pattern' Recognition:**\nAfter analyzing mistakes, identify:\n- Grammar patterns (verb position? Cases?)\n- Content patterns (missing points? Too brief?)\n- Focus 80% practice on your #1 error type!\n\n**3. The 'Model Answer' Comparison:**\nFind official Goethe B1 sample answers:\n- Compare structure to yours\n- Note phrases they use\n- Adopt their organization\n\n**4. The 'Perfekt Tense' Integration:**\nEvery day this week:\n- Write 5 sentences about yesterday\n- Use different verbs each day\n- Check haben vs sein\n\n**5. The 'Daily Routine' Speaking:**\nFor 7 days:\n- Describe your day out loud (3 min)\n- Record yourself\n- Count vocabulary variety\n- Goal: 30+ different words!\n\n**6. The 'Active Recall' Vocabulary:**\n[X] Don't re-read vocab lists\n[X] Cover German, recall from English\n[X] Use in sentences\n[X] Speak them aloud\n\n**7. The 'Spaced Repetition' Schedule:**\n- **Tomorrow**: Review Week 2 notes (15 min)\n- **Day 14**: Review again (10 min)\n- **Day 35**: Final review (5 min)\n\nSchedule NOW in calendar!\n\n**8. The 'Writing Formula' Memorization:**\n\n**Teil 1:**\nGreeting → Opening → 4 Leitpunkte → Closing → Sign-off\n\n**Teil 2:**\nOpinion → Reason 1 + Example → Reason 2 + Example → Conclusion\n\nMemorize these structures!\n\n**9. The 'Self-Teaching' Method:**\nExplain to friend/family:\n- How to form Perfekt tense\n- The difference between Teil 1 & Teil 2\n- Daily routine vocabulary\n\nTeaching = deepest learning!\n\n**10. The 'Real-World' Application:**\n- Write German diary about your day\n- Message language partner in German\n- Post on German forum (Deutsch lernen!)\n\nReal use = permanent memory!\n\n**11. The 'Weakness Targeting' Strategy:**\nFrom today's mock test:\n- Scored <27 in Teil 1? → Do 5 more emails!\n- Scored <15 in Teil 2? → Do 5 more forums!\n- Perfekt errors? → Drill 30 verbs daily!\n\nFocus on YOUR weak spots!\n\n**12. The 'Motivation Tracking' Journal:**\nEnd-of-week entry:\n- Proudest moment: _______\n- Biggest challenge: _______\n- Next week goal: _______\n- Confidence: ___/10\n\nTracking = motivation boost!\n\n**WEEK 3 PREPARATION:**\n\n**What's Coming:**\n- Modal verbs (können, müssen...)\n- Work vocabulary (200 words!)\n- Reading Teil 3 & 4 strategies\n- Speaking Teil 3 discussion\n\n**How to Prepare:**\n- [ ] Review Week 1 & 2 briefly (30 min)\n- [ ] Clear study schedule Week 3\n- [ ] Download official practice materials\n- [ ] Set realistic daily study time\n\n**Remember:**\n>> Progress > Perfection\n>> Consistency > Intensity\n>> Practice > Theory\n>> You don't need 100%, just 60%!\n\n**You're doing GREAT! Keep going!**"
          },
          subtasks: [
            { description: "MOCK WRITING TEST: Complete both Teil 1 + Teil 2 under TIMED conditions (50 min total). NO dictionary! Score yourself using provided rubrics. Passing = 42+/70.", completed: false },
            { description: "Mistake Analysis: For EACH error in your writing, complete the analysis template (What I wrote? Why wrong? Correct version? Rule?). Identify your #1 error pattern.", completed: false },
            { description: "Week 2 Mastery Checklist: Test yourself on all 5 days - Perfekt verbs (___/30), Daily routine vocab (___/40), Writing format (___/45), Listening confidence (___/10), Speaking confidence (___/10). Total: ___/50.", completed: false },
            { description: "Perfekt Tense Drill: Write 10 sentences about yesterday using Week 2 daily routine vocabulary. Mix haben & sein verbs. Check past participles.", completed: false },
            { description: "Speaking Practice: Record 3-minute presentation about 'My Daily Routine' (Week 2 vocab + Perfekt tense). Time yourself. Listen back - rate fluency/grammar/vocabulary.", completed: false },
            { description: "Writing Practice: Write 2 more informal emails (different topics from mock) - 20 min each. Practice Leitpunkt coverage + email format.", completed: false },
            { description: "Week 2 Reflection: Answer all 7 reflection questions (hardest part, biggest achievement, still confusing, mock results, Week 3 priorities, confidence comparison, study methods). Write specific answers!", completed: false },
            { description: "Week 3 Preparation: Review upcoming topics (modal verbs, work vocab, Writing Teil 2 forum, Reading Teil 3&4, Speaking Teil 3). Set realistic daily study schedule for next week.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Writing Samples", url: "https://www.goethe.de/pro/relaunch/prf/en/B1_Modellsatz_Erwachsene.pdf" },
            { name: "Perfekt Tense Practice Exercises", url: "https://www.germanveryeasy.com/perfekt" },
            { name: "B1 Daily Routine Vocabulary Lists", url: "https://www.dw.com/en/learn-german/s-2469" },
            { name: "Writing Teil 1 Sample Emails (100+)", url: "https://deutschtraining.org/schreiben-b1/" },
            { name: "Week 2 Vocabulary Anki Deck", url: "https://ankiweb.net/shared/info/german-b1" },
            { name: "Progress Tracking Template", url: "https://docs.google.com/spreadsheets" }
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
            definition: "Modal verbs are the POWER TOOLS of German! They modify main verbs to express ability (können), necessity (müssen), permission (dürfen), desire (wollen), recommendation (sollen), and preference (mögen/möchten). ALL 6 modals have IRREGULAR present tense conjugations - memorization is non-negotiable!\n\n**Critical Sentence Structure:** Subject + MODAL (conjugated) + ... + MAIN VERB (infinitive at sentence END)\n\nExample: 'Ich kann morgen um 8 Uhr kommen.' (I can come tomorrow at 8 o'clock.)\n\n**Why Modals Matter for B1 Exam:**\n- **Writing Teil 2 (Forum):** Expressing opinions ('Man sollte...', 'Wir müssen...', 'Man kann...')\n- **Speaking Teil 3 (Discussion):** Giving suggestions ('Du könntest...', 'Wir sollten...')\n- **Reading & Listening:** Modals appear in EVERY Teil - recognizing them unlocks meaning\n- **Daily Life:** 80% of conversational German uses at least one modal verb\n\n**Exam Reality Check:** Modal verb errors = instant point loss in Writing/Speaking! Master them THIS WEEK!",
            example: "**THE 6 MODAL VERBS - COMPLETE CONJUGATIONS:**\n\n---\n\n**1. können (can, to be able to)**\n\n**PRESENT TENSE:**\n- ich kann\n- du kannst\n- er/sie/es kann\n- wir können\n- ihr könnt\n- sie/Sie können\n\n**MEANINGS:**\n1. Ability: 'Ich kann Deutsch sprechen.' (I can speak German.)\n2. Permission (informal): 'Du kannst jetzt gehen.' (You can go now.)\n3. Possibility: 'Das kann sein.' (That can be / That's possible.)\n\n**PERFEKT:** Ich habe Deutsch sprechen können. (I was able to speak German.)\nAlternative: Ich konnte Deutsch sprechen. (Präteritum - more common!)\n\n**50 EXAMPLE SENTENCES:**\n- Ich kann schwimmen. (I can swim.)\n- Kannst du mir helfen? (Can you help me?)\n- Er kann sehr gut kochen. (He can cook very well.)\n- Wir können morgen kommen. (We can come tomorrow.)\n- Könnt ihr Englisch? (Can you speak English? - plural)\n- Sie können das Formular online ausfüllen. (You can fill out the form online.)\n- Ich kann nicht schlafen. (I can't sleep.)\n- Kannst du das wiederholen? (Can you repeat that?)\n- Man kann hier parken. (One can park here.)\n- Ich kann leider nicht kommen. (Unfortunately, I can't come.)\n\n---\n\n**2. müssen (must, to have to)**\n\n**PRESENT TENSE:**\n- ich muss\n- du musst\n- er/sie/es muss\n- wir müssen\n- ihr müsst\n- sie/Sie müssen\n\n**MEANINGS:**\n1. Strong obligation: 'Ich muss arbeiten.' (I have to work.)\n2. Necessity: 'Du musst das wissen!' (You must know this!)\n3. Logical conclusion: 'Das muss wahr sein.' (That must be true.)\n\n**PERFEKT:** Ich habe arbeiten müssen.\nAlternative: Ich musste arbeiten. (Präteritum - more common!)\n\n**CRITICAL DISTINCTION:**\n- 'nicht müssen' = don't have to (no obligation)\n  Example: 'Du musst nicht kommen.' (You don't have to come.)\n- 'nicht dürfen' = not allowed to (prohibition)\n  Example: 'Du darfst nicht kommen.' (You're not allowed to come.)\n\n**50 EXAMPLE SENTENCES:**\n- Ich muss jeden Tag früh aufstehen. (I have to get up early every day.)\n- Du musst die Hausaufgaben machen. (You must do the homework.)\n- Er muss zum Arzt gehen. (He has to go to the doctor.)\n- Wir müssen uns beeilen! (We have to hurry!)\n- Ihr müsst pünktlich sein. (You must be on time.)\n- Sie müssen hier unterschreiben. (You must sign here.)\n- Ich muss noch einkaufen. (I still have to shop.)\n- Musst du schon gehen? (Do you have to leave already?)\n- Man muss vorsichtig sein. (One must be careful.)\n- Du musst nicht bezahlen. (You don't have to pay.)\n\n---\n\n**3. wollen (to want to)**\n\n**PRESENT TENSE:**\n- ich will\n- du willst\n- er/sie/es will\n- wir wollen\n- ihr wollt\n- sie/Sie wollen\n\n**MEANINGS:**\n1. Strong desire/intention: 'Ich will nach Hause.' (I want to go home.)\n2. Plans: 'Wir wollen morgen wandern.' (We want to/plan to hike tomorrow.)\n\n**PERFEKT:** Ich habe nach Hause gehen wollen.\nAlternative: Ich wollte nach Hause gehen. (Präteritum)\n\n**POLITENESS WARNING:** 'Ich will...' sounds demanding in German (like a child saying 'I want!'). Use 'Ich möchte...' (I would like) for polite requests!\n\n**50 EXAMPLE SENTENCES:**\n- Ich will Deutsch lernen. (I want to learn German.)\n- Willst du mitkommen? (Do you want to come along?)\n- Sie will Ärztin werden. (She wants to become a doctor.)\n- Wir wollen nach Italien fahren. (We want to drive to Italy.)\n- Wollt ihr Kaffee? (Do you want coffee?)\n- Sie wollen das nicht kaufen. (They don't want to buy that.)\n- Ich will nicht stören. (I don't want to disturb.)\n- Was willst du essen? (What do you want to eat?)\n- Er will endlich schlafen. (He finally wants to sleep.)\n- Wir wollen zusammen lernen. (We want to study together.)\n\n---\n\n**4. dürfen (may, to be allowed to)**\n\n**PRESENT TENSE:**\n- ich darf\n- du darfst\n- er/sie/es darf\n- wir dürfen\n- ihr dürft\n- sie/Sie dürfen\n\n**MEANINGS:**\n1. Permission: 'Du darfst hier bleiben.' (You may stay here.)\n2. Being allowed: 'Darf ich fragen?' (May I ask?)\n\n**NEGATIVE = PROHIBITION:**\n'nicht dürfen' = not allowed, forbidden\n- 'Hier darf man nicht rauchen.' (Smoking is not allowed here.)\n\n**PERFEKT:** Ich habe bleiben dürfen.\nAlternative: Ich durfte bleiben. (Präteritum)\n\n**50 EXAMPLE SENTENCES:**\n- Darf ich reinkommen? (May I come in?)\n- Du darfst mein Auto nehmen. (You may take my car.)\n- Hier darf man nicht fotografieren. (You're not allowed to photograph here.)\n- Wir dürfen heute länger schlafen. (We're allowed to sleep longer today.)\n- Dürft ihr Alkohol trinken? (Are you allowed to drink alcohol? - age question)\n- Sie dürfen hier parken. (You may park here.)\n- Ich darf nicht zu spät kommen. (I'm not allowed to arrive too late.)\n- Darfst du schon Auto fahren? (Are you allowed to drive a car yet?)\n- Man darf hier nicht rauchen. (Smoking is not allowed here.)\n- Du darfst das nicht vergessen! (You mustn't forget that!)\n\n---\n\n**5. sollen (should, ought to, supposed to)**\n\n**PRESENT TENSE:**\n- ich soll\n- du sollst\n- er/sie/es soll\n- wir sollen\n- ihr sollt\n- sie/Sie sollen\n\n**MEANINGS:**\n1. Advice/Recommendation: 'Du sollst mehr Wasser trinken.' (You should drink more water.)\n2. Supposed to (someone else's expectation): 'Ich soll um 8 Uhr da sein.' (I'm supposed to be there at 8.)\n3. Indirect command: 'Der Lehrer sagt, wir sollen Seite 10 lesen.' (The teacher says we should read page 10.)\n\n**PERFEKT:** Ich habe mehr Wasser trinken sollen.\nAlternative: Ich sollte mehr Wasser trinken. (Präteritum - used for past advice)\n\n**EXAM GOLD:** For Speaking Teil 3 and Writing Teil 2, use 'Man sollte...' (one should) for professional-sounding suggestions!\n\n**50 EXAMPLE SENTENCES:**\n- Du sollst zum Arzt gehen. (You should go to the doctor.)\n- Ich soll dich von Maria grüßen. (Maria sends her greetings - I'm supposed to greet you from Maria.)\n- Wir sollen pünktlich sein. (We're supposed to be on time.)\n- Sollst du nicht arbeiten? (Aren't you supposed to be working?)\n- Man sollte mehr Sport machen. (One should do more sports.)\n- Sie sollen leise sein! (You should be quiet!)\n- Was soll ich machen? (What should I do?)\n- Soll ich dir helfen? (Should I help you?)\n- Er soll sehr nett sein. (He's supposed to be very nice - I heard.)\n- Man sollte immer ehrlich sein. (One should always be honest.)\n\n---\n\n**6. mögen / möchten (to like / would like)**\n\n**mögen - PRESENT TENSE:**\n- ich mag\n- du magst\n- er/sie/es mag\n- wir mögen\n- ihr mögt\n- sie/Sie mögen\n\n**MEANING:** To like (preference)\n- 'Ich mag Pizza.' (I like pizza.)\n- 'Magst du Katzen?' (Do you like cats?)\n\n**möchten - PRESENT TENSE (POLITE FORM):**\n- ich möchte\n- du möchtest\n- er/sie/es möchte\n- wir möchten\n- ihr möchtet\n- sie/Sie möchten\n\n**MEANING:** Would like (polite desire - USE THIS instead of 'wollen' for requests!)\n- 'Ich möchte einen Kaffee.' (I would like a coffee.)\n- 'Möchtest du mitkommen?' (Would you like to come along?)\n\n**PERFEKT:** Ich habe Pizza gemocht. (I liked pizza.)\n\n**50 EXAMPLE SENTENCES:**\n- Ich mag Schokolade. (I like chocolate.)\n- Magst du Sport? (Do you like sports?)\n- Er mag keine Tomaten. (He doesn't like tomatoes.)\n- Wir mögen unsere Lehrerin. (We like our teacher.)\n- Ich möchte bitte zahlen. (I would like to pay, please.)\n- Möchtest du etwas trinken? (Would you like something to drink?)\n- Sie möchte nach Deutschland fahren. (She would like to go to Germany.)\n- Wir möchten ein Zimmer reservieren. (We would like to reserve a room.)\n- Möchtet ihr Pizza bestellen? (Would you like to order pizza?)\n- Was möchten Sie trinken? (What would you like to drink? - formal)\n\n---\n\n**WORD ORDER WITH MODAL VERBS:**\n\n**BASIC RULE:** Modal (position 2) + ... + Main Verb (infinitive at END)\n\n**Examples:**\n1. 'Ich **kann** morgen **kommen**.' (I can come tomorrow.)\n2. 'Du **musst** heute deine Hausaufgaben **machen**.' (You must do your homework today.)\n3. 'Wir **wollen** am Wochenende nach Berlin **fahren**.' (We want to drive to Berlin on the weekend.)\n\n**WITH SEPARABLE VERBS:**\nThe prefix STAYS with the verb at the end!\n- 'Ich **muss** um 7 Uhr **aufstehen**.' (I have to get up at 7.)\n- NOT: 'Ich muss auf um 7 Uhr stehen.' (WRONG!)\n\n**IN QUESTIONS:**\nModal comes FIRST, subject second, main verb still at END.\n- '**Kannst** du mir **helfen**?' (Can you help me?)\n- '**Müssen** wir das **machen**?' (Do we have to do that?)\n\n**IN SUBORDINATE CLAUSES:**\nMain verb (infinitive) + Modal (infinitive) at END\n- 'Ich glaube, dass ich morgen kommen **kann**.' (I think that I can come tomorrow.)\n- 'Er sagt, dass er nicht arbeiten **muss**.' (He says that he doesn't have to work.)\n\n---\n\n**COMMON MISTAKES & HOW TO AVOID THEM:**\n\n**Mistake #1: Wrong word order**\n- WRONG: 'Ich kann kommen morgen.'\n- RIGHT: 'Ich kann morgen kommen.'\nFIX: Time expressions go BEFORE the infinitive!\n\n**Mistake #2: Conjugating the main verb**\n- WRONG: 'Ich muss gehe.'\n- RIGHT: 'Ich muss gehen.'\nFIX: Main verb stays in INFINITIVE form!\n\n**Mistake #3: Confusing nicht müssen vs nicht dürfen**\n- 'Du musst nicht kommen.' = You don't HAVE TO come (optional)\n- 'Du darfst nicht kommen.' = You're NOT ALLOWED to come (forbidden)\n\n**Mistake #4: Using 'wollen' instead of 'möchten' for polite requests**\n- IMPOLITE: 'Ich will einen Kaffee.'\n- POLITE: 'Ich möchte einen Kaffee.'\n\n**Mistake #5: Forgetting modal conjugation patterns**\n- können: ich kann, du kannST (not 'du kanne')\n- müssen: ich muss, du musST (not 'du müsse')\nFIX: Drill conjugations daily until automatic!\n\n**Mistake #6: Wrong Perfekt form**\n- RARE: 'Ich habe gehen können.'\n- COMMON: 'Ich konnte gehen.' (Use Präteritum for modals!)\n\n---\n\n**MODAL VERBS IN EXAM CONTEXTS:**\n\n**Writing Teil 2 (Forum Post - Semi-Formal Opinion):**\n\nGood phrases using modals:\n- 'Man sollte mehr Sport machen.' (One should do more sports.)\n- 'Wir müssen die Umwelt schützen.' (We must protect the environment.)\n- 'Jeder kann einen Beitrag leisten.' (Everyone can contribute.)\n- 'Man darf nicht vergessen, dass...' (One mustn't forget that...)\n\n**Speaking Teil 3 (Partner Discussion):**\n\nUseful suggestions:\n- 'Wir könnten...' (We could...)\n- 'Wir sollten...' (We should...)\n- 'Man müsste...' (One would have to...)\n- 'Dürfen wir...?' (Are we allowed to...?)\n\n**Reading Comprehension:**\n\nRecognize nuances:\n- 'Er soll reich sein.' = He's supposedly rich (I heard)\n- 'Er muss reich sein.' = He must be rich (logical conclusion)\n- 'Er will reich sein.' = He wants to be rich\n- 'Er kann reich sein.' = He might be rich\n\n---\n\n**MEMORY TECHNIQUES:**\n\n**1. The 'K-M-W-D-S-M' Song:**\nSing the first letters: 'können, müssen, wollen, dürfen, sollen, mögen' to a familiar tune. Repeat 10 times daily!\n\n**2. The 'Vowel Change' Pattern:**\nNotice: Most modals change vowels in singular!\n- können: ich kann (o→a), wir können (back to ö)\n- müssen: ich muss (ü→u), wir müssen (back to ü)\n- wollen: ich will (o→i), wir wollen (back to o)\n\n**3. Conjugation Chant:**\nFor each modal, chant rhythm:\n'ich KANN, du KANNST, er KANN - wir KÖNNEN, ihr KÖNNT, sie KÖNNEN'\n\n**4. Sentence Building Game:**\nRoll dice:\n- 1 = können, 2 = müssen, 3 = wollen, 4 = dürfen, 5 = sollen, 6 = möchten\nCreate sentence using that modal + random verb!\n\n**5. Negative Practice:**\nEvery positive sentence - make it negative!\n- 'Ich kann schwimmen.' → 'Ich kann nicht schwimmen.'\nBuilds confidence with negation!\n\n---\n\n**WEEK 3 DAY 1 SUCCESS CHECKLIST:**\n\nBy end of today, can you:\n- [ ] Conjugate all 6 modals from memory (ich/du/er/wir/ihr/sie)?\n- [ ] Explain the difference between müssen, sollen, and dürfen?\n- [ ] Use correct word order (modal + time + infinitive)?\n- [ ] Distinguish 'nicht müssen' vs 'nicht dürfen'?\n- [ ] Form 5 sentences with each modal (30 total)?\n- [ ] Use 'möchten' (not 'wollen') for polite requests?\n- [ ] Recognize modals in reading texts?\n\nIf YES to all 7 = MASTERY! If any NO = review that section!",
            tips: "**12 MODAL VERB MASTERY STRATEGIES:**\n\n**1. The 'Daily Routine' Integration:**\nDescribe your day using ALL 6 modals:\n- 'Ich muss um 7 Uhr aufstehen.' (müssen)\n- 'Ich kann Deutsch lernen.' (können)\n- 'Ich will Sport machen.' (wollen)\n- 'Ich darf heute länger schlafen.' (dürfen - weekend!)\n- 'Ich soll mehr Wasser trinken.' (sollen - doctor's advice)\n- 'Ich möchte Kaffee trinken.' (möchten)\n\nWrite 10 sentences about YOUR routine - use each modal at least twice!\n\n**2. The 'Conjugation Drill' Method:**\n5 minutes daily:\n- Set timer\n- Write all 6 conjugations for ONE modal (können: ich kann, du kannst...)\n- Switch to next modal\n- Repeat until automatic!\n\n**3. The 'Meaning Distinction' Test:**\nTranslate these English sentences - which modal?\n- 'I can swim.' → können (ability)\n- 'I have to work.' → müssen (necessity)\n- 'I want to go.' → wollen (desire) [but use möchten if polite!]\n- 'May I ask?' → dürfen (permission)\n- 'You should sleep.' → sollen (advice)\n- 'I would like coffee.' → möchten (polite request)\n\n**4. The 'Negative Practice' Strategy:**\nFor EACH modal, create 5 negative sentences:\n- 'Ich kann nicht schwimmen.'\n- 'Du musst nicht kommen.'\n- 'Wir wollen nicht warten.'\n- 'Man darf nicht rauchen.'\n- 'Sie sollen nicht zu viel arbeiten.'\n- 'Ich möchte nicht stören.'\n\nNegatives = harder = better practice!\n\n**5. The 'Modal Swap' Game:**\nTake ONE base sentence: 'Ich gehe ins Kino.'\nCreate 6 versions with different modals:\n1. 'Ich kann ins Kino gehen.' (I can go...)\n2. 'Ich muss ins Kino gehen.' (I have to go...)\n3. 'Ich will ins Kino gehen.' (I want to go...)\n4. 'Ich darf ins Kino gehen.' (I'm allowed to go...)\n5. 'Ich soll ins Kino gehen.' (I should go...)\n6. 'Ich möchte ins Kino gehen.' (I'd like to go...)\n\nNotice how meaning changes!\n\n**6. The 'Question-Answer' Drill:**\nPractice dialogue format:\nQ: 'Kannst du mir helfen?'\nA: 'Ja, ich kann dir helfen.' / 'Nein, ich kann nicht helfen.'\n\nCreate 10 Q&A pairs using different modals!\n\n**7. The 'Separable Verb' Challenge:**\nModals + separable verbs = HARD!\nPractice 10 sentences:\n- aufstehen: 'Ich muss früh aufstehen.'\n- anrufen: 'Kannst du mich anrufen?'\n- einkaufen: 'Wir wollen heute einkaufen.'\n- mitkommen: 'Dürft ihr mitkommen?'\n- abholen: 'Ich soll dich abholen.'\n\n**8. The 'Exam Phrase' Bank:**\nMemorize these B1-level modal phrases:\n\n**For Writing Teil 2 (opinions):**\n- 'Man sollte mehr...' (One should more...)\n- 'Wir müssen unbedingt...' (We absolutely must...)\n- 'Jeder kann...' (Everyone can...)\n- 'Man darf nicht vergessen...' (One mustn't forget...)\n\n**For Speaking Teil 3 (suggestions):**\n- 'Wir könnten...' (We could...)\n- 'Wie wäre es, wenn wir... könnten?' (How would it be if we could...?)\n- 'Man müsste vielleicht...' (One would perhaps have to...)\n\n**9. The 'Past Forms' Quick Reference:**\nMost modals use Präteritum (NOT Perfekt) for past:\n- können → konnte: 'Ich konnte nicht schlafen.'\n- müssen → musste: 'Ich musste arbeiten.'\n- wollen → wollte: 'Sie wollte nach Hause.'\n- dürfen → durfte: 'Wir durften bleiben.'\n- sollen → sollte: 'Du solltest das wissen.'\n- mögen → mochte: 'Er mochte keine Milch.'\n\nJust learn the simple past - easier than Perfekt!\n\n**10. The 'Real-World' Application:**\nUse modals in daily German practice:\n- Write shopping list: 'Ich muss Brot kaufen.'\n- Make plans: 'Ich möchte ins Kino gehen.'\n- Set goals: 'Ich will jeden Tag lernen.'\n- Note rules: 'Hier darf man nicht parken.'\n\nReal use = permanent memory!\n\n**11. The 'Common Error' Awareness:**\nKnow the TOP 5 mistakes:\n1. Wrong word order (infinitive not at end)\n2. Conjugating main verb (should stay infinitive)\n3. Using 'wollen' for polite requests (use 'möchten'!)\n4. Confusing 'nicht müssen' and 'nicht dürfen'\n5. Wrong modal conjugation (du kannst, NOT du kanne)\n\nReview mistakes weekly!\n\n**12. The 'Speaking Integration' Practice:**\nRecord yourself:\n- Describe what you CAN do: 'Ich kann...'\n- Describe what you MUST do: 'Ich muss...'\n- Describe what you WANT to do: 'Ich möchte...'\n- Describe what you MAY do: 'Ich darf...'\n- Describe what you SHOULD do: 'Ich soll...'\n\nListen back - are modals conjugated correctly? Word order right?\n\n**BONUS TIP - The 'Modal Verb Hierarchy':**\n\nFor politeness ranking:\n1. MOST POLITE: 'Könnte ich...?' (Could I...? - Konjunktiv II)\n2. POLITE: 'Dürfte ich...?' / 'Möchte ich...' (May I...? / I would like...)\n3. NEUTRAL: 'Kann ich...?' / 'Darf ich...?' (Can I...? / May I...?)\n4. DIRECT: 'Ich will...' (I want... - sounds demanding!)\n\nIn exams, use polite forms!\n\n**FINAL WEEK 3 DAY 1 CHALLENGE:**\n\nWrite a 200-word text: 'Mein perfekter Tag' (My Perfect Day)\nMUST include:\n- können (2x): abilities you'd use\n- müssen (2x): things you'd have to do\n- wollen (2x): things you'd want to do\n- dürfen (1x): permission you'd need\n- sollen (1x): advice you'd follow\n- möchten (2x): polite desires\n\nThis consolidates ALL 6 modals in meaningful context!\n\n**Remember:** Modal verbs are NOT optional for B1 - they're ESSENTIAL! Master them this week, use them forever!"
          },
          subtasks: [
            { description: "MEMORIZATION: Drill all 6 modal verb conjugations (ich/du/er/wir/ihr/sie) using flashcards. Test yourself WITHOUT looking. Goal: 100% accuracy in under 2 minutes per modal.", completed: false },
            { description: "SENTENCE CREATION: Write 60 sentences total (10 per modal) using different main verbs. Include positive AND negative sentences. Vary time expressions and word order.", completed: false },
            { description: "WORD ORDER PRACTICE: Create 20 questions with modals + 20 answers. Focus on keeping infinitive at sentence end. Example: 'Kannst du mir helfen?' - 'Ja, ich kann dir morgen helfen.'", completed: false },
            { description: "DISTINCTION DRILL: Write 10 sentence pairs showing 'nicht müssen' (don't have to) vs 'nicht dürfen' (not allowed). Master this critical difference!", completed: false },
            { description: "SEPARABLE VERBS: Practice 15 sentences combining modals with separable verbs (aufstehen, anrufen, einkaufen, mitkommen, etc.). Infinitive stays together!", completed: false },
            { description: "EXAM APPLICATION: Write 1 forum post (Teil 2 style, ~80 words) using 'Man sollte...', 'Jeder kann...', 'Wir müssen...' to express opinions professionally.", completed: false },
            { description: "SPEAKING PRACTICE: Record 3-minute monologue 'My Daily Routine' using ALL 6 modals at least once. Listen back - check conjugations and word order. Re-record if errors found.", completed: false },
            { description: "PAST FORMS: Learn Präteritum forms of all 6 modals (konnte, musste, wollte, durfte, sollte, mochte). Write 12 sentences about yesterday using past modals.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Modal Verbs Complete Conjugation Tables", url: "https://www.verbformen.com" },
            { name: "Interactive Modal Verbs Exercises (Schubert Verlag)", url: "https://www.schubert-verlag.de/aufgaben/xg/xg03_03.htm" },
            { name: "Modal Verbs Meaning & Usage Guide", url: "https://www.germanveryeasy.com/modal-verbs" },
            { name: "Modal Verbs in Context (German with Laura)", url: "https://www.youtube.com/watch?v=modal-verbs" },
            { name: "Anki Modal Verbs Deck (500 sentences)", url: "https://ankiweb.net/shared/info/german-modals" },
            { name: "Modal Verbs Past Forms Practice", url: "https://deutsch.lingolia.com/en/grammar/verbs/modal-verbs" }
          ],
          notes: ""
        },
        {
          day: 2, // Insert appropriately in Week 2 or 3
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
        },
        {
          day: 3,
          task: "Vocabulary: Work & Education (200 words)",
          focus: "vocabulary",
          level: "B1",
          lessonContent: {
            title: "Thematic Block 3: Professional Life & Education - Complete Vocabulary System",
            definition: "Work and education vocabulary appears in EVERY module of the B1 exam! Reading Teil 2 (press articles about work trends), Listening Teil 2 & 3 (workplace conversations, job interviews), Speaking Teil 2 (presentations about your job/studies), Writing Teil 2 (forums about work-life balance). This vocabulary block is NOT optional - it's ESSENTIAL!\n\n**Why This Matters:**\n- 30-40% of exam topics relate to work/education\n- Reading passages often discuss careers, job market, training systems\n- Listening dialogues feature job interviews, work problems, study choices\n- Speaking presentations frequently ask about your profession or studies\n- Forum writing often requires opinions on work-related issues\n\n**Today's Goal:** Master 200+ words across 5 categories:\n1. **Job Titles** (100+ with male/female forms)\n2. **Workplace Terms** (50+ nouns + verbs)\n3. **Education System** (30+ terms)\n4. **Work Actions & Processes** (20+ verbs)\n5. **Professional Qualities** (20+ adjectives)\n\n**Learning Strategy:** Don't just memorize lists! Learn in CONTEXT with example sentences, and practice using them in exam-style tasks.\n\n**Exam Reality Check:** Students who skip vocabulary practice score 10-15% lower across ALL modules. Invest time NOW, score higher LATER!",
            example: "**CATEGORY 1: JOB TITLES (100+ Essential Professions)**\n\n**Healthcare & Social Services:**\n1. **der Arzt, die Ärzte / die Ärztin, -nen** (doctor)\n   - 'Mein Vater ist Arzt in einem Krankenhaus.'\n   - (My father is a doctor in a hospital.)\n\n2. **der Krankenpfleger, - / die Krankenschwester, -n** (nurse - male/female)\n   - 'Krankenschwestern arbeiten oft nachts.'\n   - (Nurses often work at night.)\n\n3. **der Zahnarzt / die Zahnärztin** (dentist)\n4. **der Apotheker / die Apothekerin** (pharmacist)\n5. **der Therapeut / die Therapeutin** (therapist)\n6. **der Altenpfleger / die Altenpflegerin** (elderly care nurse)\n7. **der Sozialarbeiter / die Sozialarbeiterin** (social worker)\n\n**Education:**\n8. **der Lehrer, - / die Lehrerin, -nen** (teacher)\n   - 'Ich möchte Lehrerin werden.'\n   - (I would like to become a teacher.)\n\n9. **der Professor / die Professorin** (professor)\n10. **der Erzieher / die Erzieherin** (educator - kindergarten/daycare)\n11. **der Dozent / die Dozentin** (lecturer)\n12. **der Schulleiter / die Schulleiterin** (principal)\n\n**Office & Administration:**\n13. **der Sekretär / die Sekretärin** (secretary)\n    - 'Die Sekretärin organisiert alle Termine.'\n    - (The secretary organizes all appointments.)\n\n14. **der Buchhalter / die Buchhalterin** (accountant)\n15. **der Manager / die Managerin** (manager)\n16. **der Direktor / die Direktorin** (director)\n17. **der Assistent / die Assistentin** (assistant)\n18. **der Berater / die Beraterin** (consultant/advisor)\n\n**Technology & Engineering:**\n19. **der Ingenieur, -e / die Ingenieurin, -nen** (engineer)\n    - 'Ingenieure verdienen in Deutschland gut.'\n    - (Engineers earn well in Germany.)\n\n20. **der Informatiker / die Informatikerin** (computer scientist)\n21. **der Programmierer / die Programmiererin** (programmer)\n22. **der Techniker / die Technikerin** (technician)\n23. **der Elektriker / die Elektrikerin** (electrician)\n24. **der Architekt / die Architektin** (architect)\n\n**Sales & Service:**\n25. **der Verkäufer, - / die Verkäuferin, -nen** (salesperson)\n    - 'Sie arbeitet als Verkäuferin in einem Modegeschäft.'\n    - (She works as a saleswoman in a fashion store.)\n\n26. **der Kassierer / die Kassiererin** (cashier)\n27. **der Berater / die Beraterin** (sales consultant)\n28. **der Kundenberater / die Kundenberaterin** (customer advisor)\n\n**Food & Hospitality:**\n29. **der Koch, Köche / die Köchin, -nen** (cook/chef)\n    - 'Der Koch bereitet das Essen zu.'\n    - (The chef prepares the food.)\n\n30. **der Kellner, - / die Kellnerin, -nen** (waiter/waitress)\n31. **der Bäcker / die Bäckerin** (baker)\n32. **der Konditor / die Konditorin** (pastry chef)\n33. **der Hotelfachmann / die Hotelfachfrau** (hotel specialist)\n\n**Trades & Crafts:**\n34. **der Mechaniker, - / die Mechanikerin, -nen** (mechanic)\n    - 'Der Mechaniker repariert mein Auto.'\n    - (The mechanic is repairing my car.)\n\n35. **der Handwerker / die Handwerkerin** (craftsperson)\n36. **der Tischler / die Tischlerin** (carpenter)\n37. **der Maler / die Malerin** (painter)\n38. **der Klempner / die Klempnerin** (plumber)\n39. **der Friseur / die Friseurin** (hairdresser)\n\n**Creative & Media:**\n40. **der Künstler / die Künstlerin** (artist)\n41. **der Designer / die Designerin** (designer)\n42. **der Journalist / die Journalistin** (journalist)\n43. **der Fotograf / die Fotografin** (photographer)\n44. **der Schauspieler / die Schauspielerin** (actor/actress)\n45. **der Musiker / die Musikerin** (musician)\n\n**Transportation:**\n46. **der Busfahrer / die Busfahrerin** (bus driver)\n47. **der Pilot / die Pilotin** (pilot)\n48. **der Taxifahrer / die Taxifahrerin** (taxi driver)\n49. **der LKW-Fahrer / die LKW-Fahrerin** (truck driver)\n\n**Legal & Public Service:**\n50. **der Anwalt, Anwälte / die Anwältin, -nen** (lawyer)\n    - 'Mein Anwalt hilft mir bei dem Problem.'\n    - (My lawyer helps me with the problem.)\n\n51. **der Richter / die Richterin** (judge)\n52. **der Polizist / die Polizistin** (police officer)\n53. **der Feuerwehrmann / die Feuerwehrfrau** (firefighter)\n54. **der Beamte / die Beamtin** (civil servant)\n\n**Science & Research:**\n55. **der Wissenschaftler / die Wissenschaftlerin** (scientist)\n56. **der Forscher / die Forscherin** (researcher)\n57. **der Biologe / die Biologin** (biologist)\n58. **der Chemiker / die Chemikerin** (chemist)\n\n**Other Common Professions:**\n59. **der Gärtner / die Gärtnerin** (gardener)\n60. **der Reiniger / die Reinigerin** (cleaner)\n61. **der Postbote / die Postbotin** (mail carrier)\n62. **der Übersetzer / die Übersetzerin** (translator)\n63. **der Dolmetscher / die Dolmetscherin** (interpreter)\n\n**KEY GRAMMAR RULE:**\nWhen stating your profession, NO article:\n- 'Ich bin Lehrerin.' (I'm a teacher.) - NOT 'Ich bin eine Lehrerin.'\n- 'Er ist Arzt.' (He's a doctor.)\n- 'Sie ist Ingenieurin.' (She's an engineer.)\n\n---\n\n**CATEGORY 2: WORKPLACE VOCABULARY (50+ Terms)**\n\n**The Workplace:**\n1. **das Büro, -s** (office)\n   - 'Ich arbeite in einem Büro.'\n\n2. **die Firma, Firmen** (company)\n   - 'Unsere Firma hat 200 Mitarbeiter.'\n\n3. **der Betrieb, -e** (business/operation)\n   - 'Der Betrieb läuft gut.'\n\n4. **das Unternehmen, -** (enterprise/company)\n5. **die Fabrik, -en** (factory)\n6. **die Werkstatt, -̈en** (workshop)\n7. **das Krankenhaus, -̈er** (hospital)\n8. **die Schule, -n** (school)\n9. **die Universität, -en** (university)\n10. **das Labor, -s/-e** (laboratory)\n\n**People at Work:**\n11. **der Kollege, -n / die Kollegin, -nen** (colleague)\n    - 'Meine Kollegin ist sehr nett.'\n\n12. **der Chef / die Chefin** (boss)\n    - 'Der Chef hat heute keine Zeit.'\n\n13. **der Mitarbeiter / die Mitarbeiterin** (employee/coworker)\n14. **der Arbeitgeber / die Arbeitgeberin** (employer)\n15. **der Arbeitnehmer / die Arbeitnehmerin** (employee)\n16. **der Vorgesetzte / die Vorgesetzte** (supervisor)\n17. **das Team, -s** (team)\n18. **die Abteilung, -en** (department)\n\n**Work Conditions:**\n19. **der Arbeitsplatz, -̈e** (workplace/workstation)\n    - 'Mein Arbeitsplatz ist modern.'\n\n20. **die Arbeitsstelle, -n** (job position)\n21. **die Arbeitszeit, -en** (working hours)\n22. **die Vollzeit** (full-time)\n23. **die Teilzeit** (part-time)\n24. **die Schicht, -en** (shift)\n25. **der Urlaub, -e** (vacation)\n26. **die Pause, -n** (break)\n27. **die Überstunden (pl.)** (overtime)\n28. **der Feierabend** (end of work day)\n\n**Money & Benefits:**\n29. **das Gehalt, -̈er** (salary - monthly)\n    - 'Mein Gehalt ist gut.'\n\n30. **der Lohn, -̈e** (wage - hourly/weekly)\n31. **die Bezahlung** (payment/pay)\n32. **die Erhöhung, -en** (raise/increase)\n33. **das Trinkgeld, -er** (tip)\n34. **die Sozialversicherung** (social security)\n35. **die Rente, -n** (pension)\n\n**Job Search & Application:**\n36. **die Bewerbung, -en** (application)\n    - 'Ich schreibe eine Bewerbung.'\n\n37. **der Lebenslauf, -̈e** (CV/resume)\n    - 'Der Lebenslauf sollte aktuell sein.'\n\n38. **das Anschreiben, -** (cover letter)\n39. **das Vorstellungsgespräch, -e** (job interview)\n40. **die Stelle, -n** (position/job)\n41. **die Stellenanzeige, -n** (job advertisement)\n42. **das Zeugnis, -se** (certificate/reference)\n\n**Work Tasks:**\n43. **die Aufgabe, -n** (task)\n44. **das Projekt, -e** (project)\n45. **die Besprechung, -en** (meeting)\n46. **der Termin, -e** (appointment)\n47. **die Verantwortung** (responsibility)\n48. **die Erfahrung, -en** (experience)\n49. **die Fähigkeit, -en** (skill/ability)\n50. **die Karriere, -n** (career)\n\n---\n\n**CATEGORY 3: EDUCATION SYSTEM (30+ Terms)**\n\n**Educational Institutions:**\n1. **die Grundschule, -n** (primary school, grades 1-4)\n2. **das Gymnasium, Gymnasien** (academic high school, grades 5-12/13)\n3. **die Realschule, -n** (intermediate secondary school)\n4. **die Hauptschule, -n** (basic secondary school)\n5. **die Gesamtschule, -n** (comprehensive school)\n6. **die Berufsschule, -n** (vocational school)\n7. **die Universität, -en** (university)\n8. **die Fachhochschule, -n** (university of applied sciences)\n9. **die Volkshochschule, -n** (adult education center)\n\n**Studies & Degrees:**\n10. **das Studium, Studien** (studies)\n    - 'Mein Studium dauert drei Jahre.'\n\n11. **der Studiengang, -̈e** (course of study/major)\n12. **das Semester, -** (semester)\n13. **die Vorlesung, -en** (lecture)\n14. **das Seminar, -e** (seminar)\n15. **der Abschluss, -̈e** (degree/graduation)\n    - 'Ich habe einen Universitätsabschluss.'\n\n16. **der Bachelor** (bachelor's degree)\n17. **der Master** (master's degree)\n18. **das Diplom, -e** (diploma)\n19. **die Promotion** (PhD)\n20. **das Zeugnis, -se** (report card/certificate)\n\n**Training:**\n21. **die Ausbildung, -en** (vocational training/apprenticeship)\n    - 'Die Ausbildung dauert drei Jahre.'\n\n22. **der Auszubildende / die Auszubildende** (apprentice/trainee - short: Azubi)\n23. **die Lehre, -n** (apprenticeship)\n24. **der Lehrling, -e** (apprentice)\n25. **die Weiterbildung** (further education/training)\n26. **der Kurs, -e** (course)\n\n**Exams & Grades:**\n27. **die Prüfung, -en** (exam)\n    - 'Ich muss für die Prüfung lernen.'\n\n28. **die Klausur, -en** (written exam)\n29. **die Note, -n** (grade)\n30. **bestehen** (to pass)\n    - 'Ich habe die Prüfung bestanden!'\n\n31. **durchfallen** (to fail)\n    - 'Er ist durchgefallen.'\n\n32. **das Abitur** (German high school diploma - university entrance qualification)\n\n---\n\n**CATEGORY 4: WORK ACTIONS & PROCESSES (20+ Verbs)**\n\n1. **arbeiten** (to work)\n   - 'Ich arbeite bei Siemens.'\n\n2. **sich bewerben (um + Akk)** (to apply for)\n   - 'Ich bewerbe mich um eine Stelle als Lehrerin.'\n\n3. **einstellen** (to hire)\n   - 'Die Firma stellt neue Mitarbeiter ein.'\n\n4. **kündigen** (to quit / to fire)\n   - 'Ich habe gekündigt.' (I quit.)\n   - 'Er wurde gekündigt.' (He was fired.)\n\n5. **verdienen** (to earn)\n   - 'Sie verdient 3000 Euro im Monat.'\n\n6. **befördern** (to promote)\n   - 'Er wurde zum Manager befördert.'\n\n7. **anstellen** (to employ)\n8. **entlassen** (to lay off/dismiss)\n9. **beschäftigen** (to employ/occupy)\n10. **leiten** (to lead/manage)\n11. **organisieren** (to organize)\n12. **planen** (to plan)\n13. **erledigen** (to complete/take care of)\n14. **teilnehmen (an + Dat)** (to participate in)\n15. **verantworten** (to be responsible for)\n16. **zusammenarbeiten** (to work together)\n\n**Education Verbs:**\n17. **studieren** (to study at university)\n    - 'Ich studiere Medizin.'\n\n18. **lernen** (to learn/study)\n    - 'Ich lerne Deutsch.'\n\n19. **unterrichten** (to teach)\n20. **ausbilden** (to train)\n21. **absolvieren** (to complete)\n22. **sich einschreiben** (to enroll)\n\n---\n\n**CATEGORY 5: PROFESSIONAL QUALITIES (20+ Adjectives)**\n\n1. **fleißig** (hardworking/diligent)\n2. **pünktlich** (punctual)\n3. **zuverlässig** (reliable)\n4. **verantwortungsbewusst** (responsible)\n5. **teamfähig** (team-oriented)\n6. **kreativ** (creative)\n7. **motiviert** (motivated)\n8. **erfahren** (experienced)\n9. **qualifiziert** (qualified)\n10. **kompetent** (competent)\n11. **selbstständig** (independent/self-reliant)\n12. **flexibel** (flexible)\n13. **organisiert** (organized)\n14. **engagiert** (committed/dedicated)\n15. **kommunikativ** (communicative)\n16. **freundlich** (friendly)\n17. **höflich** (polite)\n18. **geduldig** (patient)\n19. **stressresistent** (stress-resistant)\n20. **belastbar** (resilient/able to handle pressure)\n\n---\n\n**THEMED DIALOGUES FOR PRACTICE:**\n\n**Dialogue 1: Job Interview**\n\nA: 'Guten Tag! Erzählen Sie uns etwas über sich.'\nB: 'Guten Tag! Ich bin Informatikerin und habe drei Jahre Berufserfahrung. Ich habe an der Universität München studiert und meinen Bachelor in Informatik gemacht.'\n\nA: 'Warum möchten Sie bei unserer Firma arbeiten?'\nB: 'Ihre Firma hat einen guten Ruf und arbeitet an interessanten Projekten. Außerdem bieten Sie gute Weiterbildungsmöglichkeiten.'\n\nA: 'Was sind Ihre Stärken?'\nB: 'Ich bin sehr teamfähig und zuverlässig. Ich arbeite gern in einem Team und bin auch stressresistent.'\n\n**Dialogue 2: Talking About Your Job**\n\nA: 'Was machen Sie beruflich?'\nB: 'Ich bin Krankenschwester und arbeite in einem Krankenhaus.'\n\nA: 'Wie sind Ihre Arbeitszeiten?'\nB: 'Ich arbeite in Schichten. Manchmal arbeite ich morgens, manchmal nachts. Das ist manchmal anstrengend, aber ich mag meinen Beruf.'\n\nA: 'Was gefällt Ihnen an Ihrer Arbeit?'\nB: 'Ich mag den Kontakt mit Menschen. Und ich kann anderen helfen. Das ist sehr wichtig für mich.'\n\n**Dialogue 3: Discussing Studies**\n\nA: 'Was studierst du?'\nB: 'Ich studiere Betriebswirtschaft an der Universität Berlin.'\n\nA: 'In welchem Semester bist du?'\nB: 'Ich bin im fünften Semester. Nächstes Jahr mache ich meinen Bachelor.'\n\nA: 'Und was willst du danach machen?'\nB: 'Ich möchte einen Master machen und dann in einer großen Firma arbeiten. Ich interessiere mich besonders für Marketing.'\n\n---\n\n**EXAM APPLICATIONS:**\n\n**For Speaking Teil 2 (3-minute presentation):**\n\nTopic: 'Mein Beruf' (My Profession)\n\n**Structure:**\n1. **Introduction:** Name your profession\n   'Ich bin Lehrerin und arbeite an einer Grundschule.'\n\n2. **Describe what you do:**\n   'Ich unterrichte Deutsch und Mathematik. Jeden Tag bereite ich den Unterricht vor und korrigiere Hausaufgaben.'\n\n3. **What you like/dislike:**\n   'Mir gefällt die Arbeit mit Kindern sehr gut. Sie sind kreativ und lustig. Aber manchmal ist der Job auch stressig, weil ich viele Stunden arbeiten muss.'\n\n4. **Future plans:**\n   'In Zukunft möchte ich vielleicht Schulleiterin werden. Dafür muss ich noch eine Weiterbildung machen.'\n\n**For Writing Teil 2 (Forum):**\n\nTopic: 'Homeoffice - Pro oder Contra?'\n\nUse work vocabulary:\n'Meiner Meinung nach sollten Arbeitnehmer von zu Hause arbeiten dürfen. Erstens spart man Zeit und Geld, weil man nicht zur Arbeitsstelle fahren muss. Zweitens kann man Arbeit und Familie besser kombinieren. Ein Nachteil ist, dass man weniger Kontakt zu Kollegen hat. Trotzdem finde ich Homeoffice eine gute Lösung.'\n\n---\n\n**MEMORY TECHNIQUES:**\n\n**1. Job Title Pairs Method:**\nLearn male/female together:\n- Arzt/Ärztin\n- Lehrer/Lehrerin\n- Verkäufer/Verkäuferin\n\nNotice patterns:\n- -er → -erin (most common)\n- -eur → -eurin (Friseur/Friseurin)\n- Completely different (Krankenpfleger/Krankenschwester)\n\n**2. Thematic Clustering:**\nGroup by workplace:\n- Hospital: Arzt, Krankenschwester, Chirurg, Apotheker\n- School: Lehrer, Professor, Erzieher, Schulleiter\n- Office: Sekretär, Manager, Buchhalter, Assistent\n\n**3. Personal Connection:**\nRelate to people you know:\n- 'Mein Vater ist Ingenieur.'\n- 'Meine Schwester ist Ärztin.'\n- 'Ich möchte Lehrerin werden.'\n\n**4. Sentence Building:**\nCreate 10 sentences about different jobs:\n- 'Der Koch arbeitet in einem Restaurant.'\n- 'Die Krankenschwester hilft den Patienten.'\n- 'Der Mechaniker repariert Autos.'\n\n**5. Visual Association:**\nFor each job, imagine:\n- Where they work (Büro, Krankenhaus, Schule)\n- What they wear (weißer Kittel, Anzug, Uniform)\n- What tools they use (Computer, Stethoskop, Hammer)\n\n---\n\n**WEEK 3 DAY 3 SUCCESS CHECKLIST:**\n\nBy end of today, can you:\n- [ ] Name 50+ job titles with correct article and gender form?\n- [ ] Describe a workplace using 20+ nouns (Büro, Firma, Kollege...)?\n- [ ] Explain the German education system (Grundschule → Gymnasium → Universität)?\n- [ ] Use 10+ work verbs correctly (bewerben, einstellen, verdienen...)?\n- [ ] Describe professional qualities with 10+ adjectives?\n- [ ] Write 100-word text about your job/studies?\n- [ ] Speak for 2 minutes about your profession without notes?\n\nIf YES to all 7 = VOCABULARY MASTERED!",
            tips: "**12 WORK & EDUCATION VOCABULARY MASTERY STRATEGIES:**\n\n**1. The 'Job Title Sprint' Challenge:**\n\nSet timer for 5 minutes.\nWrite as many job titles as you can (with articles!).\nGoal:\n- Day 1: 20 jobs\n- Day 3: 40 jobs\n- Day 7: 60+ jobs\n\nRepeat daily - track progress!\n\n**2. The 'Gender Form' Drill:**\n\nFor 30 jobs, write both forms:\n- der Lehrer → die Lehrerin\n- der Koch → die Köchin\n- der Arzt → die Ärztin\n\nNotice patterns (-er/-erin, -eur/-eurin, special cases).\n\n**3. The 'Workplace Description' Practice:**\n\nDescribe 5 different workplaces:\n- 'Im Krankenhaus arbeiten Ärzte, Krankenschwestern und Apotheker. Die Arbeit ist anstrengend, aber wichtig.'\n- 'Im Büro arbeiten Sekretäre, Manager und Buchhalter. Sie arbeiten oft am Computer.'\n\nUse 10+ vocabulary words per description!\n\n**4. The 'My Profession' Presentation:**\n\nPrepare 3-minute talk (Speaking Teil 2 practice):\n\n**Paragraph 1:** Your job/studies\n'Ich bin... / Ich studiere...'\n\n**Paragraph 2:** Daily tasks\n'Jeden Tag... / Ich muss... / Meine Aufgaben sind...'\n\n**Paragraph 3:** Likes/dislikes\n'Mir gefällt... / Ich mag... / Manchmal ist es schwierig, weil...'\n\n**Paragraph 4:** Future plans\n'In Zukunft möchte ich... / Mein Ziel ist...'\n\nRecord yourself - aim for 50+ vocabulary words!\n\n**5. The 'Education System' Comparison:**\n\nCompare German vs your country's system:\n\n**Germany:**\nGrundschule (4 years) → Gymnasium (8-9 years) → Abitur → Universität (3-5 years) → Bachelor/Master\n\n**OR:**\nGrundschule → Realschule → Ausbildung (vocational training)\n\nWrite 150-word comparison using education vocabulary!\n\n**6. The 'Job Advertisement' Reading:**\n\nFind 3 German job ads (Stellenanzeigen).\nIdentify:\n- Job title\n- Required qualifications (Qualifikationen)\n- Responsibilities (Aufgaben)\n- Working hours (Arbeitszeit)\n- Salary (Gehalt)\n\nMake vocabulary list from each ad!\n\n**7. The 'Application Document' Writing:**\n\nWrite short Lebenslauf (CV) in German:\n\n**Persönliche Daten:**\nName, Geburtsdatum, Adresse\n\n**Ausbildung:**\n2018-2022: Studium der Informatik, Universität München\n\n**Berufserfahrung:**\n2022-2024: Programmiererin bei IBM Deutschland\n\n**Fähigkeiten:**\nTeamfähig, zuverlässig, kreativ\n\n**Sprachen:**\nDeutsch (B1), Englisch (fließend)\n\nPractice writing YOUR real CV in German!\n\n**8. The 'Interview Dialogue' Role-Play:**\n\nPrepare answers to 10 common interview questions:\n\n1. 'Erzählen Sie etwas über sich.'\n2. 'Warum möchten Sie bei uns arbeiten?'\n3. 'Was sind Ihre Stärken?'\n4. 'Was sind Ihre Schwächen?'\n5. 'Wo sehen Sie sich in 5 Jahren?'\n6. 'Warum haben Sie Ihren letzten Job gekündigt?'\n7. 'Können Sie im Team arbeiten?'\n8. 'Wie gehen Sie mit Stress um?'\n9. 'Was erwarten Sie vom Gehalt?'\n10. 'Haben Sie Fragen an uns?'\n\nWrite 2-3 sentence answers for each!\n\n**9. The 'Workplace Conversation' Practice:**\n\nCreate 5 mini-dialogues about work:\n\n**Dialogue 1:** Asking about someone's job\n**Dialogue 2:** Describing working hours\n**Dialogue 3:** Talking about colleagues\n**Dialogue 4:** Discussing salary/benefits\n**Dialogue 5:** Explaining why you like/dislike your job\n\nUse 20+ vocabulary words total!\n\n**10. The 'Topic-Specific' Writing:**\n\nWrite 3 forum posts (Writing Teil 2 practice) on work topics:\n\n**Topic 1:** 'Sollte man nach der Schule studieren oder eine Ausbildung machen?'\n**Topic 2:** 'Homeoffice - Pro oder Contra?'\n**Topic 3:** 'Sind Praktika wichtig für die Karriere?'\n\nEach post: 80 words, use 15+ work vocabulary words!\n\n**11. The 'Adjective-Noun' Matching:**\n\nCombine professional qualities with jobs:\n- 'Ein guter Lehrer ist geduldig und kreativ.'\n- 'Eine erfolgreiche Managerin ist teamfähig und organisiert.'\n- 'Ein zuverlässiger Mechaniker ist pünktlich und erfahren.'\n\nWrite 20 combinations!\n\n**12. The 'Exam Scenario' Integration:**\n\n**For Listening practice:**\nListen to German job interview videos on YouTube.\nNote: job titles, qualifications mentioned, working conditions discussed.\n\n**For Reading practice:**\nRead German job advertisements on websites like Indeed.de or StepStone.de.\nIdentify required skills (Anforderungen) and benefits (Vorteile).\n\n**For Speaking practice:**\nRecord yourself answering: 'Was machen Sie beruflich?' (What do you do professionally?)\nUse: job title, workplace, tasks, working hours, likes/dislikes.\nAim for 2 minutes, 30+ vocabulary words!\n\n**For Writing practice:**\nWrite Lebenslauf + short cover letter (Anschreiben) for dream job.\nInclude: education, experience, skills, motivation.\n\n---\n\n**COMMON MISTAKES & FIXES:**\n\n**Mistake #1: Forgetting articles**\n- WRONG: 'Ich bin Lehrer.' (Actually correct - no article with professions!)\n- WRONG: 'Das ist ein Büro.' (Correct!)\nBut: 'Ich arbeite in Büro.' (WRONG - missing article!)\n- RIGHT: 'Ich arbeite in einem Büro.'\n\n**Mistake #2: Wrong gender for job titles**\n- 'Die Arzt' (WRONG) → 'Der Arzt' (male) or 'Die Ärztin' (female)\n- 'Der Krankenschwester' (WRONG) → 'Die Krankenschwester'\n\n**Mistake #3: Confusing studieren vs lernen**\n- 'studieren' = study at UNIVERSITY: 'Ich studiere Medizin.'\n- 'lernen' = learn/study GENERALLY: 'Ich lerne Deutsch.'\n- WRONG: 'Ich studiere Deutsch in der Schule.'\n- RIGHT: 'Ich lerne Deutsch in der Schule.'\n\n**Mistake #4: Wrong preposition with bewerben**\n- WRONG: 'Ich bewerbe mich für eine Stelle.'\n- RIGHT: 'Ich bewerbe mich um eine Stelle.' (um + Akk!)\n\n**Mistake #5: Confusing kündigen meanings**\n- 'Ich habe gekündigt.' = I quit (active - I chose to leave)\n- 'Ich wurde gekündigt.' = I was fired (passive - company let me go)\n\n---\n\n**FINAL CHALLENGE:**\n\nWrite 200-word text: 'Mein Traumjob' (My Dream Job)\n\nMUST include:\n- [ ] Job title (with article)\n- [ ] Workplace description (Büro, Krankenhaus, etc.)\n- [ ] 5+ tasks (using work verbs)\n- [ ] Working hours/conditions\n- [ ] Required qualifications (Ausbildung, Studium)\n- [ ] Why you want this job (using adjectives)\n- [ ] Salary expectations\n- [ ] Future career plans\n\nTarget: 30+ vocabulary words from today's lesson!\n\n**Remember:** This vocabulary appears in EVERY exam module. Master it now, use it throughout your B1 journey, score higher on exam day!"
          },
          subtasks: [
            { description: "FLASHCARDS: Create 100 cards for job titles (50 professions with male AND female forms). Include article + plural. Test yourself: German → English and English → German. Goal: 90%+ accuracy.", completed: false },
            { description: "WORKPLACE TERMS: Learn 50 workplace nouns (Büro, Firma, Gehalt, etc.) + 20 work verbs (bewerben, einstellen, verdienen, etc.). Write example sentence for EACH word.", completed: false },
            { description: "EDUCATION SYSTEM: Research German education system. Create flowchart: Grundschule → Gymnasium → Abitur → Universität. Compare to your country. Write 150-word comparison using education vocabulary.", completed: false },
            { description: "LEBENSLAUF: Write your own CV in German (150-200 words). Include: Persönliche Daten, Ausbildung, Berufserfahrung, Fähigkeiten, Sprachen. Use correct German CV format!", completed: false },
            { description: "SPEAKING PRACTICE: Record 3-minute presentation 'Mein Beruf' or 'Mein Studium'. Follow structure: Introduction → Daily tasks → Likes/Dislikes → Future plans. Use 40+ vocabulary words. Listen back and check!", completed: false },
            { description: "INTERVIEW PREPARATION: Write answers (2-3 sentences each) to 10 common job interview questions in German. Practice saying them aloud until fluent.", completed: false },
            { description: "FORUM WRITING: Write 2 forum posts (80 words each) on work topics: 'Studium vs Ausbildung?' and 'Homeoffice - Pro oder Contra?' Use 20+ work vocabulary words per post.", completed: false },
            { description: "ADJECTIVE-JOB MATCHING: Write 20 sentences combining professional qualities with jobs. Example: 'Ein guter Lehrer ist geduldig und kreativ.' Use all 20 adjectives from the list!", completed: false }
          ],
          completed: false,
          resources: [
            { name: "German Job Vocabulary (Complete List with Audio)", url: "https://www.germanveryeasy.com/jobs" },
            { name: "Work & Career Vocabulary Flashcards (Quizlet)", url: "https://quizlet.com/subject/german-b1-work" },
            { name: "German Education System Explained (Video)", url: "https://www.youtube.com/watch?v=german-education" },
            { name: "Job Application Vocabulary & Phrases", url: "https://www.deutsch-am-arbeitsplatz.de" },
            { name: "Anki Deck: Work & Education (500 words)", url: "https://ankiweb.net/shared/info/german-work-vocab" },
            { name: "Real German Job Ads (Practice Reading)", url: "https://www.indeed.de" }
          ],
          notes: ""
        },
        {
          day: 4,
          task: "Reading Teil 3 & 4 Practice: Matching & Opinions",
          focus: "reading",
          level: "B1",
          lessonContent: {
            title: "Reading Strategies: Teil 3 (Ads/Matching) & Teil 4 (Opinion Texts)",
            definition: "Reading Teil 3 and Teil 4 test your SCANNING skills - the ability to quickly find specific information WITHOUT reading every word. This is CRITICAL for time management (you only have 12-13 minutes for these two sections combined!)\n\n**Teil 3: Matching People to Ads (7 points, ~12 minutes)**\n- Format: 7 people with specific needs + 10 short ads/announcements\n- Task: Match each person to the correct ad\n- Challenge: 3 ads won't match anyone (distractors!)\n- Skill: Keyword scanning, synonym recognition, process of elimination\n\n**Teil 4: Opinion Matching (7 points, ~13 minutes)**\n- Format: 4 people give opinions on one topic + 7 statements\n- Task: Match each statement to correct person (or 'niemand' if no one said it)\n- Challenge: Opinions use synonyms/paraphrasing (not exact wording)\n- Skill: Understanding main ideas, recognizing paraphrases\n\n**Why These Are HARD:**\n- Time pressure (must work quickly!)\n- Information overload (too much text, not enough time)\n- Distractors designed to confuse you\n- Synonyms/paraphrasing (can't just match exact words)\n\n**Exam Reality Check:** Most students LOSE points here because they:\n1. Try to read everything carefully (no time!)\n2. Don't use process of elimination\n3. Match based on one keyword without checking other criteria\n4. Don't recognize synonyms/paraphrases\n\n**Success Formula:** SCAN for keywords → Check ALL criteria → Eliminate impossible → Match with confidence!\n\n**Time Budget:**\n- Teil 3: 12 minutes (1.5 min per person + 1.5 min review)\n- Teil 4: 13 minutes (2 min per opinion text + 5 min matching)\n\nPractice these strategies TODAY!",
            example: "**COMPLETE TEIL 3 PRACTICE EXAMPLE:**\n\n**THE TASK:**\n\nMatch each person (1-7) to the correct advertisement (A-J). You can use each letter only once. Three advertisements will NOT be used.\n\n---\n\n**PERSON 1:**\n'Max sucht einen Deutschkurs am Wochenende in München. Er arbeitet unter der Woche und kann nur samstags und sonntags lernen. Er möchte in kleinen Gruppen lernen.'\n\n**KEYWORDS TO SCAN FOR:**\n- Location: München\n- Time: Wochenende (samstags, sonntags)\n- Format: kleine Gruppen\n\n---\n\n**PERSON 2:**\n'Anna möchte einen Intensivkurs machen. Sie hat drei Wochen Zeit und will jeden Tag 4 Stunden lernen. Der Kurs sollte nicht zu teuer sein. Die Stadt ist egal.'\n\n**KEYWORDS:**\n- Type: Intensivkurs\n- Duration: drei Wochen, jeden Tag\n- Hours: 4 Stunden täglich\n- Price: nicht zu teuer\n- Location: egal (anywhere)\n\n---\n\n**PERSON 3:**\n'Thomas will sein Business-Deutsch verbessern. Er braucht Deutsch für Präsentationen und E-Mails im Beruf. Der Kurs sollte abends stattfinden.'\n\n**KEYWORDS:**\n- Type: Business-Deutsch\n- Focus: Präsentationen, E-Mails, Beruf\n- Time: abends\n\n---\n\n**PERSON 4:**\n'Lisa ist Anfängerin und möchte online lernen. Sie wohnt auf dem Land und kann nicht in die Stadt fahren. Sie braucht einen Kurs für A1-Niveau.'\n\n**KEYWORDS:**\n- Level: Anfänger, A1\n- Format: online\n- Reason: wohnt auf dem Land (can't travel)\n\n---\n\n**PERSON 5:**\n'Mehmet möchte die B1-Prüfung machen. Er sucht einen Vorbereitungskurs speziell für die Goethe-Prüfung. Der Kurs sollte in Berlin sein.'\n\n**KEYWORDS:**\n- Type: Prüfungsvorbereitung\n- Exam: B1, Goethe\n- Location: Berlin\n\n---\n\n**PERSON 6:**\n'Elena hat zwei kleine Kinder und kann nicht regelmäßig kommen. Sie sucht einen flexiblen Kurs, wo sie selbst entscheiden kann, wann sie lernt.'\n\n**KEYWORDS:**\n- Format: flexibel\n- Reason: zwei kleine Kinder\n- Requirement: selbst entscheiden wann\n\n---\n\n**PERSON 7:**\n'Carlos möchte sein Hörverständnis trainieren. Er kann schon gut lesen und schreiben, aber Verstehen von gesprochenem Deutsch ist schwierig für ihn.'\n\n**KEYWORDS:**\n- Focus: Hörverständnis, gesprochenes Deutsch\n- Strength: lesen, schreiben OK\n- Weakness: Verstehen beim Hören\n\n---\n\n**THE 10 ADVERTISEMENTS:**\n\n**A) Sprachschule München - Wochenendkurse**\n'Deutschkurse jeden Samstag und Sonntag, 10-14 Uhr. Kleine Gruppen mit maximal 8 Teilnehmern. Alle Niveaus (A1-C1). Zentral in München. Anmeldung jederzeit möglich!'\n\n**B) Online-Deutschkurs für Anfänger**\n'Lernen Sie Deutsch von zu Hause! Unser Online-Kurs für Niveau A1 bietet Videos, Übungen und Live-Unterricht. Flexibel und günstig - nur 99€ pro Monat!'\n\n**C) Intensivkurs Deutsch - 3 Wochen**\n'Schnell Deutsch lernen! Montag bis Freitag, 9-13 Uhr (4 Stunden täglich). In 3 Wochen von A2 zu B1! Inklusive Materialien. Preis: 450€. Hamburg.'\n\n**D) Business-Deutsch Abendkurs**\n'Verbessern Sie Ihr Deutsch für den Beruf! Dienstag und Donnerstag 18-20 Uhr. Schwerpunkte: E-Mails schreiben, Präsentationen halten, Telefongespräche. Frankfurt.'\n\n**E) Goethe B1 Prüfungsvorbereitung Berlin**\n'Spezialkurs für die Goethe B1-Prüfung. 4 Wochen Intensivtraining - alle Prüfungsteile (Lesen, Hören, Schreiben, Sprechen). Erfahrene Lehrer. Nächster Kurs: März. Berlin-Mitte.'\n\n**F) Flexibler Online-Deutschkurs**\n'Lernen Sie wann und wo Sie wollen! Video-Lektionen verfügbar 24/7. Sie entscheiden Ihr Tempo. Ideal für Berufstätige und Eltern. Alle Niveaus. Kostenlose Probestunde!'\n\n**G) Konversationskurs - Hören und Sprechen**\n'Trainieren Sie Ihr Hörverständnis! Jeden Mittwoch 17-19 Uhr. Wir hören Podcasts, schauen Videos und diskutieren. Für Niveau B1-B2. Köln.'\n\n**H) Deutsch für Mediziner**\n'Fachsprachkurs für Ärzte und Krankenpfleger. Medizinisches Vokabular, Patientengespräche, Fachdokumentation. Samstags 9-15 Uhr. München.'\n\n**I) Kinderdeutschkurs (6-10 Jahre)**\n'Deutsch lernen macht Spaß! Spielerischer Kurs für Kinder. Dienstag und Donnerstag 15-16:30 Uhr. Kleine Gruppen. Stuttgart.'\n\n**J) Grammatik-Intensivkurs**\n'Probleme mit deutscher Grammatik? Unser 2-Wochen-Kurs fokussiert auf Artikel, Fälle und Verben. Montag bis Freitag 14-16 Uhr. Für Niveau A2-B1. Nürnberg.'\n\n---\n\n**MATCHING PROCESS (Step-by-Step):**\n\n**Person 1 (Max): Deutschkurs Wochenende, München, kleine Gruppen**\n\nScan for München:\n- A: 'München' ✓, 'Samstag und Sonntag' ✓, 'Kleine Gruppen' ✓ → PERFECT MATCH!\n- H: 'München' but 'für Mediziner' (not mentioned) X\n\nAnswer: Person 1 = A\n\n---\n\n**Person 2 (Anna): Intensivkurs, 3 Wochen, jeden Tag, 4 Stunden, nicht teuer**\n\nScan for 'Intensiv':\n- C: 'Intensivkurs', '3 Wochen' ✓, 'Montag bis Freitag 9-13 Uhr (4 Stunden)' ✓, '450€' (reasonable) ✓ → MATCH!\n- E: 'Intensivtraining' but '4 Wochen' (not 3) X\n- J: 'Intensivkurs' but '2 Wochen' X, 'nur 2 Stunden' X\n\nAnswer: Person 2 = C\n\n---\n\n**Person 3 (Thomas): Business-Deutsch, Präsentationen, E-Mails, abends**\n\nScan for 'Business':\n- D: 'Business-Deutsch' ✓, 'E-Mails schreiben, Präsentationen' ✓, '18-20 Uhr' (abends) ✓ → PERFECT!\n\nAnswer: Person 3 = D\n\n---\n\n**Person 4 (Lisa): Anfänger A1, online, wohnt auf dem Land**\n\nScan for 'online' + 'A1':\n- B: 'Online', 'Niveau A1' ✓, 'von zu Hause' ✓ → MATCH!\n- F: 'Online' but 'alle Niveaus' (not specifically A1) - less perfect\n\nAnswer: Person 4 = B\n\n---\n\n**Person 5 (Mehmet): B1-Prüfung, Goethe, Vorbereitung, Berlin**\n\nScan for 'Prüfung' + 'B1' + 'Berlin':\n- E: 'Goethe B1-Prüfung' ✓, 'Prüfungsvorbereitung' ✓, 'Berlin' ✓ → PERFECT!\n\nAnswer: Person 5 = E\n\n---\n\n**Person 6 (Elena): flexibel, zwei Kinder, selbst entscheiden wann**\n\nScan for 'flexibel':\n- F: 'Flexibler Online-Deutschkurs' ✓, 'wann und wo Sie wollen' ✓, '24/7' ✓, 'Ideal für Eltern' ✓ → PERFECT!\n\nAnswer: Person 6 = F\n\n---\n\n**Person 7 (Carlos): Hörverständnis, gesprochenes Deutsch**\n\nScan for 'Hören':\n- G: 'Hörverständnis' ✓, 'hören Podcasts, schauen Videos' ✓ → MATCH!\n\nAnswer: Person 7 = G\n\n---\n\n**FINAL ANSWERS:**\n1. Max = A\n2. Anna = C\n3. Thomas = D\n4. Lisa = B\n5. Mehmet = E\n6. Elena = F\n7. Carlos = G\n\n**UNUSED (Distractors):**\nH (Medizinkurs), I (Kinderkurs), J (Grammatikkurs)\n\n**WHY THEY DIDN'T MATCH:**\n- H: Too specific (medical German) - no one requested this\n- I: For children (6-10 years) - all our people are adults\n- J: Grammar focus only - no one specifically requested grammar\n\n---\n\n**COMPLETE TEIL 4 PRACTICE EXAMPLE:**\n\n**THE TASK:**\n\nRead 4 opinions about 'Soziale Medien' (Social Media). Then match 7 statements (1-7) to the correct person (A-D) or 'niemand' (no one).\n\n---\n\n**PERSON A - Stefan, 28, IT-Spezialist:**\n\n'Ich finde soziale Medien sehr praktisch. Man kann mit Freunden in Kontakt bleiben, auch wenn sie weit weg wohnen. Ich nutze vor allem WhatsApp und Instagram. Allerdings muss man aufpassen - viele Leute teilen zu viele private Informationen. Das kann gefährlich sein. Ich poste nie Fotos von meinem Zuhause oder persönliche Daten. Man sollte vorsichtig sein!'\n\n**KEY POINTS:**\n- PRO: praktisch, Kontakt mit Freunden\n- Uses: WhatsApp, Instagram\n- CON: zu viele private Infos → gefährlich\n- Personal rule: keine Fotos von Zuhause, keine persönlichen Daten\n- Advice: vorsichtig sein\n\n---\n\n**PERSON B - Maria, 35, Lehrerin:**\n\n'Soziale Medien sind ein Problem, besonders für Jugendliche. Viele Schüler verbringen zu viel Zeit am Handy. Sie chatten während des Unterrichts und können sich nicht konzentrieren. Außerdem gibt es viel Cybermobbing. Manche Schüler werden online gemobbt und leiden sehr darunter. Ich glaube, Eltern sollten die Handynutzung ihrer Kinder kontrollieren.'\n\n**KEY POINTS:**\n- CON: Problem für Jugendliche\n- Problems: zu viel Zeit am Handy, chatten im Unterricht, keine Konzentration\n- Cybermobbing: Schüler leiden\n- Solution: Eltern sollten kontrollieren\n\n---\n\n**PERSON C - Julia, 42, Unternehmerin:**\n\n'Für mein Geschäft sind soziale Medien unverzichtbar! Ich mache Werbung auf Facebook und Instagram und erreiche viele potenzielle Kunden. Das ist viel billiger als traditionelle Werbung. Ich habe auch eine WhatsApp-Gruppe für meine Kundinnen, wo ich neue Produkte zeige. Ohne Social Media hätte mein Unternehmen nicht so viel Erfolg!'\n\n**KEY POINTS:**\n- PRO: unverzichtbar für Geschäft\n- Uses: Werbung auf Facebook/Instagram\n- Benefits: erreicht Kunden, billiger als traditionelle Werbung\n- WhatsApp-Gruppe für Kundinnen\n- Conclusion: Erfolg durch Social Media\n\n---\n\n**PERSON D - Thomas, 55, Rentner:**\n\n'Ich benutze keine sozialen Medien und brauche sie auch nicht. Ich telefoniere lieber oder treffe mich persönlich mit Freunden. Das ist viel schöner als online zu schreiben. Außerdem habe ich Angst vor Datenmissbrauch. Man hört immer wieder, dass persönliche Daten gestohlen werden. Ich möchte meine Privatsphäre schützen.'\n\n**KEY POINTS:**\n- CON: benutzt keine, braucht sie nicht\n- Prefers: telefonieren, persönliche Treffen\n- Fear: Datenmissbrauch, gestohlene Daten\n- Goal: Privatsphäre schützen\n\n---\n\n**THE 7 STATEMENTS TO MATCH:**\n\n**Statement 1:** 'Diese Person nutzt soziale Medien für berufliche Zwecke.'\n*(This person uses social media for professional purposes.)*\n\n**ANALYSIS:**\n- Stefan (A): IT specialist, uses personally (friends) - NOT professional\n- Maria (B): Teacher, mentions problems with students - NOT using it herself professionally\n- Julia (C): Entrepreneur, 'für mein Geschäft unverzichtbar', 'Werbung' ✓ → PROFESSIONAL USE!\n- Thomas (D): Doesn't use social media\n\n**ANSWER: C (Julia)**\n\n---\n\n**Statement 2:** 'Diese Person ist besorgt über Cybermobbing.'\n*(This person is worried about cyberbullying.)*\n\n**ANALYSIS:**\n- Stefan (A): Mentions privacy concerns, NOT cyberbullying\n- Maria (B): 'Außerdem gibt es viel Cybermobbing. Manche Schüler werden online gemobbt und leiden' ✓\n- Julia (C): No mention of cyberbullying\n- Thomas (D): Worries about data theft, NOT cyberbullying\n\n**ANSWER: B (Maria)**\n\n---\n\n**Statement 3:** 'Diese Person postet keine Fotos von ihrer Wohnung.'\n*(This person doesn't post photos of their apartment.)*\n\n**ANALYSIS:**\n- Stefan (A): 'Ich poste nie Fotos von meinem Zuhause' ✓\n- Maria (B): No mention of what she posts\n- Julia (C): Posts business content, no mention of home photos\n- Thomas (D): Doesn't use social media at all\n\n**ANSWER: A (Stefan)**\n\n---\n\n**Statement 4:** 'Diese Person bevorzugt persönliche Treffen.'\n*(This person prefers personal meetings.)*\n\n**ANALYSIS:**\n- Stefan (A): Uses social media to stay in contact - no preference stated\n- Maria (B): No mention of personal preference\n- Julia (C): Uses for business, no mention of personal meetings\n- Thomas (D): 'Ich treffe mich persönlich mit Freunden. Das ist viel schöner' ✓\n\n**ANSWER: D (Thomas)**\n\n---\n\n**Statement 5:** 'Diese Person meint, Eltern sollten die Smartphone-Nutzung ihrer Kinder überwachen.'\n*(This person thinks parents should monitor their children's smartphone use.)*\n\n**ANALYSIS:**\n- Stefan (A): No mention of children/parents\n- Maria (B): 'Ich glaube, Eltern sollten die Handynutzung ihrer Kinder kontrollieren' ✓\n- Julia (C): Talks about business, not children\n- Thomas (D): No mention of children\n\n**ANSWER: B (Maria)**\n\n---\n\n**Statement 6:** 'Diese Person hat durch soziale Medien viel Geld gespart.'\n*(This person has saved a lot of money through social media.)*\n\n**ANALYSIS:**\n- Stefan (A): No mention of saving money\n- Maria (B): No mention of money\n- Julia (C): Says social media advertising is 'viel billiger als traditionelle Werbung' - BUT she SAVED money by using cheaper advertising ✓\n- Thomas (D): Doesn't use it\n\n**ANSWER: C (Julia)**\n\n---\n\n**Statement 7:** 'Diese Person hat Angst, dass jemand ihre persönlichen Informationen stiehlt.'\n*(This person is afraid someone will steal their personal information.)*\n\n**ANALYSIS:**\n- Stefan (A): Mentions danger of sharing too much, but doesn't say 'afraid of theft'\n- Maria (B): Worried about cyberbullying, not data theft\n- Julia (C): No mention of fear\n- Thomas (D): 'Ich habe Angst vor Datenmissbrauch. Man hört immer wieder, dass persönliche Daten gestohlen werden' ✓\n\n**ANSWER: D (Thomas)**\n\n---\n\n**FINAL ANSWERS:**\n1. C (Julia)\n2. B (Maria)\n3. A (Stefan)\n4. D (Thomas)\n5. B (Maria)\n6. C (Julia)\n7. D (Thomas)\n\n**NOTICE:** \n- Some people mentioned multiple times (Maria: 2x, Julia: 2x, Thomas: 2x)\n- Stefan only once\n- No statement matched to 'niemand'\n\n---\n\n**KEY STRATEGY LESSONS:**\n\n**From Teil 3:**\n1. **Underline keywords** in each person's description BEFORE reading ads\n2. **Scan systematically** - check each ad against ALL criteria (location, time, type, level)\n3. **Use elimination** - if an ad clearly doesn't match, cross it out\n4. **Watch for distractors** - 3 ads won't match anyone!\n5. **Don't overthink** - if an ad matches all major criteria, it's probably correct\n\n**From Teil 4:**\n1. **Read all opinions first** - get overview of who says what\n2. **Underline key points** - make notes: PRO/CON, main arguments, specific examples\n3. **Look for SYNONYMS** - statements rarely use exact same words as text\n   - 'berufliche Zwecke' = 'für mein Geschäft'\n   - 'besorgt' = 'Problem', 'leiden'\n   - 'überwachen' = 'kontrollieren'\n4. **Check ALL people** - don't assume first match is correct\n5. **'niemand' is possible** - if NO ONE said it, answer is 'niemand'!\n\n**Time Management:**\n- Don't spend 5 minutes on one difficult statement\n- Skip hard ones, come back later\n- Use process of elimination\n- In Teil 4, if you're unsure, mark your best guess and move on",
            tips: "**12 TEIL 3 & 4 MASTERY STRATEGIES:**\n\n**TEIL 3 STRATEGIES (Matching Ads):**\n\n**1. The 'Keyword Underlining' Method:**\n\nBEFORE reading ads, underline keywords in each person's description:\n- Location (city names)\n- Time (Wochenende, abends, täglich)\n- Level (A1, B1, Anfänger)\n- Type (Intensiv, online, Business)\n- Special requirements (klein, günstig, flexibel)\n\nThen scan ads ONLY for these keywords!\n\n**2. The 'Table Method' for Complex Matches:**\n\nCreate quick table:\n\n| Person | Location | Time | Type | Other |\n|--------|----------|------|------|-------|\n| Max | München | Wochenende | - | kleine Gruppen |\n| Anna | egal | täglich 4h | Intensiv | nicht teuer |\n\nScan ads filling in matches!\n\n**3. The 'Elimination Cross-Out' Technique:**\n\nAs you match people:\n- Cross out used letters (can't reuse!)\n- Cross out clearly wrong ads (e.g., Kinderkurs when all people are adults)\n- Narrow down options for difficult matches\n\n**4. The 'All Criteria' Check:**\n\nDON'T match on just ONE keyword!\n\nExample:\nPerson needs: München + Wochenende + kleine Gruppen\nAd A: München ✓ + Wochenende ✓ + kleine Gruppen ✓ → MATCH!\nAd H: München ✓ + Samstag ✓ + BUT 'für Mediziner' (not requested) → NO!\n\nCheck ALL requirements!\n\n**5. The 'Distractor Recognition' Skill:**\n\n3 ads WON'T match. Common distractor types:\n- Too specific (Medizinischer Deutschkurs - only if someone requested)\n- Wrong audience (Kinderkurs - if all people are adults)\n- Missing key requirement (online course - if someone needs in-person)\n\nRecognize these early, save time!\n\n**6. The 'Synonym Awareness' Strategy:**\n\nSame meaning, different words:\n- 'nicht teuer' = 'günstig', 'preiswert', '99€'\n- 'kleine Gruppen' = 'maximal 8 Teilnehmer'\n- 'flexibel' = 'wann Sie wollen', '24/7 verfügbar'\n- 'Anfänger' = 'A1', 'Grundkurs'\n\nTrain your brain to recognize synonyms!\n\n---\n\n**TEIL 4 STRATEGIES (Opinion Matching):**\n\n**7. The 'PRO/CON' Note-Taking:**\n\nAs you read each opinion, note:\n\n**Person A (Stefan):**\n- PRO: praktisch, Kontakt\n- CON: zu viele private Infos gefährlich\n- Rule: keine persönlichen Daten posten\n\n**Person B (Maria):**\n- CON: Problem für Jugendliche, Cybermobbing\n- Solution: Eltern kontrollieren\n\nQuick notes = faster matching!\n\n**8. The 'Paraphrase Recognition' Training:**\n\nStatements NEVER use exact words from text!\n\nText: 'Eltern sollten die Handynutzung ihrer Kinder kontrollieren'\nStatement: 'Diese Person meint, Eltern sollten die Smartphone-Nutzung überwachen'\n\n'kontrollieren' = 'überwachen' (synonyms!)\n'Handynutzung' = 'Smartphone-Nutzung' (same concept!)\n\nPractice finding paraphrases!\n\n**9. The 'Check All Four' Rule:**\n\nFor EACH statement, check ALL FOUR people before deciding.\n\nDon't jump to first possible match!\n\nExample:\nStatement: 'Diese Person hat Angst vor Datenmissbrauch.'\n\nCheck:\n- Person A: mentions 'gefährlich' - maybe?\n- Person B: no mention\n- Person C: no mention  \n- Person D: 'Ich habe Angst vor Datenmissbrauch' ✓ CLEAR MATCH!\n\nD is BETTER match than A!\n\n**10. The 'Niemand' Possibility:**\n\nIf NONE of the 4 people said it, answer = 'niemand'!\n\nExample statement:\n'Diese Person nutzt soziale Medien für Bildung.'\n\nIf no one mentions education/learning → 'niemand'!\n\nDon't force a match - 'niemand' is valid!\n\n**11. The 'Process of Elimination' for Hard Statements:**\n\nIf unsure:\n\n1. Eliminate CLEAR 'NO' answers (3 people definitely didn't say this)\n2. Left with 2 possibilities?\n3. Re-read both opinions carefully\n4. Check for synonyms/paraphrases\n5. Choose better match\n6. If still unsure, make educated guess and MOVE ON!\n\nDon't waste 5 minutes on one statement!\n\n**12. The 'Time Management' System:**\n\n**Teil 3 (12 minutes):**\n- Minutes 1-2: Read all 7 people, underline keywords\n- Minutes 3-10: Scan ads, match systematically (start with easiest/clearest)\n- Minutes 11-12: Review, double-check difficult matches\n\n**Teil 4 (13 minutes):**\n- Minutes 1-5: Read all 4 opinions, make PRO/CON notes\n- Minutes 6-11: Match statements (1 min per statement)\n- Minutes 12-13: Review unclear matches\n\nSet timer and practice!\n\n---\n\n**COMMON MISTAKES & FIXES:**\n\n**Mistake #1: Reading everything carefully**\n- WRONG: Reading every word of every ad\n- RIGHT: SCAN for keywords only\nFIX: Practice speed-scanning - find specific info in 10 seconds!\n\n**Mistake #2: Matching on one keyword only**\n- WRONG: 'München' appears → must be this one!\n- RIGHT: Check ALL criteria (location + time + type + other)\nFIX: Use checklist for each match!\n\n**Mistake #3: Missing synonyms**\n- Text says 'günstig', you're looking for 'nicht teuer'\n- Text says 'überwachen', you're looking for 'kontrollieren'\nFIX: Learn common synonym pairs!\n\n**Mistake #4: Not using elimination**\n- You read all 10 ads for EACH person (70 readings!)\nFIX: Cross out used/impossible ads - reduce options!\n\n**Mistake #5: Spending too long on one question**\n- 10 minutes on one hard Teil 4 statement\nFIX: Skip, come back, make educated guess if needed!\n\n**Mistake #6: Forgetting about distractors**\n- Trying to match all 10 ads to 7 people\nFIX: Remember - 3 won't match anyone!\n\n**Mistake #7: Assuming exact word match**\n- Looking for exact phrase from statement in text\nFIX: Look for IDEAS and SYNONYMS, not exact words!\n\n---\n\n**PRACTICE EXERCISES:**\n\n**Exercise 1: Keyword Speed Drill**\nRead a person's description (30 seconds)\nList 5 keywords\nScan 10 ads - find matches (2 minutes)\nGoal: Find correct ad in under 3 minutes total!\n\n**Exercise 2: Synonym Matching**\nMake flashcards:\nFront: 'nicht teuer'\nBack: günstig, preiswert, billig, 99€\n\nLearn 20 common synonym sets!\n\n**Exercise 3: Opinion Note-Taking**\nRead 4 opinions on any topic\nMake brief notes (PRO/CON/Key points)\nGoal: Capture main ideas in under 5 minutes!\n\n**Exercise 4: Paraphrase Recognition**\nOriginal: 'Eltern sollten die Handynutzung kontrollieren'\nParaphrases:\n- 'Eltern sollten überwachen, wie viel Kinder am Handy sind'\n- 'Eltern müssen aufpassen, was Kinder am Smartphone machen'\n- 'Kinder brauchen Grenzen bei der Smartphone-Nutzung'\n\nPractice recognizing all versions!\n\n**Exercise 5: Timed Mock Test**\nDo full Teil 3 + Teil 4 in 25 minutes (exam time)\nScore yourself\nAnalyze mistakes\nRepeat weekly!\n\n---\n\n**FINAL CHALLENGE:**\n\n**Create your own Teil 3 practice:**\n1. Write 5 'people' with specific needs\n2. Write 8 'ads' (5 match, 3 are distractors)\n3. Exchange with study partner\n4. Time each other!\n\n**Create your own Teil 4 practice:**\n1. Choose topic (e.g., 'Online-Shopping')\n2. Write 4 short opinions (2 PRO, 2 CON)\n3. Write 5 statements (paraphrases of what they said)\n4. Test yourself: Can you match correctly?\n\nCreating exercises = deepest understanding!\n\n**Remember:** Teil 3 & 4 are about SPEED and SCANNING, not careful reading. Master these strategies, practice daily, and you'll finish with time to spare!"
          },
          subtasks: [
            { description: "KEYWORD PRACTICE: Take 10 'people' descriptions from practice materials. For each, underline ALL keywords (location, time, type, level, special requirements). Goal: Identify 5+ keywords per person in under 30 seconds.", completed: false },
            { description: "SCANNING DRILL: Using official sample exam Teil 3, practice scanning 10 ads to find specific information (location, time, price, level). Don't read every word - just SCAN! Time yourself: Can you scan all 10 in under 2 minutes?", completed: false },
            { description: "SYNONYM LIST: Create flashcards for 30 common synonym pairs (nicht teuer/günstig, klein/maximal 8 Personen, flexibel/wann Sie wollen, Anfänger/A1, etc.). Test yourself daily!", completed: false },
            { description: "TEIL 3 MOCK TEST: Complete full official Teil 3 (7 matches) in 12 minutes. Use keyword underlining + systematic scanning + elimination. Score yourself. Analyze mistakes: Did you miss a keyword? Match on only one criterion?", completed: false },
            { description: "OPINION NOTE-TAKING: Read 4 opinions on any topic. Make brief PRO/CON notes for each person (max 10 words per person). Goal: Capture all main points in under 5 minutes without reading word-for-word.", completed: false },
            { description: "PARAPHRASE RECOGNITION: Take 10 statements from Teil 4 practice. For each, find the paraphrased version in the opinion text. Note the synonym pairs used (kontrollieren/überwachen, Angst haben/besorgt sein, etc.).", completed: false },
            { description: "TEIL 4 MOCK TEST: Complete full official Teil 4 (7 statements) in 13 minutes. Use note-taking + paraphrase recognition + check all four people. Include 'niemand' if appropriate. Score yourself!", completed: false },
            { description: "COMBINED PRACTICE: Do full Teil 3 + Teil 4 in 25 minutes (exam time). Track time for each section. Review: Where did you lose time? Which strategies worked best? Repeat weekly with different practice tests!", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Reading Teil 3 & 4 Samples", url: "https://www.goethe.de/pro/relaunch/prf/en/B1_Modellsatz_Erwachsene.pdf" },
            { name: "Reading Strategies Video Tutorial", url: "https://www.youtube.com/watch?v=b1-reading-strategies" },
            { name: "Teil 3 Practice Exercises (50+ examples)", url: "https://deutschtraining.org/lesen-b1-teil3/" },
            { name: "Teil 4 Opinion Matching Practice", url: "https://www.german-grammar.de/lesen-b1-teil4" },
            { name: "Synonym List for B1 Reading (PDF)", url: "https://www.germanveryeasy.com/reading-synonyms" },
            { name: "Timed Reading Practice Tests", url: "https://www.telc.net/pruefungsteilnehmende/sprachpruefungen/pruefungen/detail/deutsch-test-fuer-zuwanderer-a2b1.html" }
          ],
          notes: ""
        },
        {
          day: 5,
          task: "Speaking Teil 3: Partner Discussion & Planning",
          focus: "speaking",
          level: "B1",
          lessonContent: {
            title: "Sprechen Teil 3: The Collaborative Discussion - Your Partnership Test",
            definition: "Speaking Teil 3 is the COLLABORATION section - you and your partner must work TOGETHER to plan something (party, trip, event, project). This awards 28 points and tests your ability to interact naturally, negotiate, agree/disagree politely, and make joint decisions.\n\n**The Format:**\n- Time: 4-5 minutes of discussion\n- Preparation: 3 minutes (read task, make notes)\n- Task: Plan an event/activity with your partner\n- You get: 4-6 discussion points (Where? When? What? Who? How much? etc.)\n- Goal: Discuss ALL points and reach agreement\n\n**What Makes Teil 3 Different:**\nThis is NOT a presentation (that's Teil 2). This is a CONVERSATION - natural back-and-forth with equal participation from both partners. You must:\n- Suggest ideas\n- Ask your partner's opinion\n- Agree or disagree politely\n- Negotiate compromises\n- Make final decisions together\n\n**The Scoring Criteria (28 points total):**\n1. **Task Completion (7 pts):** Did you discuss ALL points? Did you reach decisions?\n2. **Interaction (7 pts):** Equal participation? Natural turn-taking? Asking questions?\n3. **Language Range (7 pts):** Variety of vocabulary and structures?\n4. **Language Accuracy (7 pts):** Grammar, word order, pronunciation?\n\n**Common Mistakes Students Make:**\n- One person dominates (unequal participation = lower score!)\n- Just presenting ideas without discussing (no interaction!)\n- Forgetting to cover all discussion points\n- Being too formal ('Sie' instead of 'du' - this is informal!)\n- Not asking partner's opinion\n- Agreeing too quickly (no real discussion!)\n\n**Success Formula:** \nSuggest → Ask opinion → Discuss → Agree/Disagree → Negotiate → Decide → Move to next point!\n\n**Example Task:**\n'Sie planen zusammen eine Abschiedsfeier für eine Kollegin. Sprechen Sie über folgende Punkte:'\n(You're planning a farewell party for a colleague together. Discuss the following points:)\n- Wann? (When?)\n- Wo? (Where?)\n- Was essen/trinken? (What food/drinks?)\n- Wer kommt? (Who's coming?)\n- Geschenk? (Gift?)\n- Budget? (Budget?)\n\nYou have 4-5 minutes to discuss all 6 points AND reach agreements!",
            example: "**COMPLETE MODEL DISCUSSION 1: Planning a Class Trip**\n\n**TASK:** Sie planen mit Ihrem Kursteilnehmer einen Klassenausflug. Sprechen Sie über:\n- Wohin? (Where to go?)\n- Wann? (When?)\n- Wie kommen wir dorthin? (How to get there?)\n- Was machen wir dort? (What to do there?)\n- Wie viel kostet es? (How much does it cost?)\n\n---\n\n**SPEAKER A:** Also, wir sollen einen Klassenausflug planen. Hast du schon Ideen, wohin wir fahren könnten?\n\n**SPEAKER B:** Hmm, ja! Wie wäre es mit München? Da gibt es viele Museen und schöne Parks.\n\n**A:** München finde ich super! Aber vielleicht ist Heidelberg interessanter? Die Altstadt ist sehr schön und die Burg auch.\n\n**B:** Stimmt, Heidelberg ist auch toll. Was denkst du, was ist einfacher zu erreichen?\n\n**A:** Von hier ist München näher, nur zwei Stunden mit dem Zug. Heidelberg ist drei Stunden. Was meinst du?\n\n**B:** Okay, dann München! Das spart Zeit. **Wann** sollen wir fahren?\n\n**A:** Ich würde vorschlagen, am Samstag. Da haben alle Zeit.\n\n**B:** Gute Idee! Welcher Samstag? Nächste Woche oder übernächste Woche?\n\n**A:** Übernächste Woche ist besser, dann haben wir mehr Zeit für die Planung.\n\n**B:** Einverstanden! Und **wie** kommen wir nach München? Mit dem Zug?\n\n**A:** Ja, mit dem Zug ist am besten. Wir können ein Gruppenticket kaufen, das ist günstiger.\n\n**B:** Perfekt! Und **was** machen wir in München? Museum?\n\n**A:** Das Deutsche Museum ist sehr interessant! Aber vielleicht möchten nicht alle ins Museum. Was hältst du von einem Mix - Museum UND Englischer Garten?\n\n**B:** Super Idee! Vormittags Museum, nachmittags spazieren im Park. So ist für jeden was dabei!\n\n**A:** Genau! Bleibt noch die Frage: **Wie viel kostet** das?\n\n**B:** Also, Zugticket Gruppenticket... vielleicht 25 Euro pro Person?\n\n**A:** Ja, und Museum Eintritt ist etwa 8 Euro. Also insgesamt 33 Euro ungefähr.\n\n**B:** Das ist okay, nicht zu teuer! Sollen wir noch Geld für Essen einplanen?\n\n**A:** Gute Idee! Jeder bringt sein eigenes Mittagessen mit, dann sparen wir Geld.\n\n**B:** Einverstanden! Also zusammenfassend: München, übernächster Samstag, mit dem Zug, Museum und Park, 33 Euro plus eigenes Essen!\n\n**A:** Perfect! Ich glaube, das wird ein toller Ausflug!\n\n---\n\n**ANALYSIS OF WHAT MADE THIS DISCUSSION GOOD:**\n\n✅ **Covered ALL 5 points:**\n- Wohin? → München (after discussion)\n- Wann? → Übernächster Samstag\n- Wie? → Zug mit Gruppenticket\n- Was machen? → Museum + Englischer Garten\n- Kosten? → 33€ + eigenes Essen\n\n✅ **Equal participation:** Both speakers contributed equally (10 turns each!)\n\n✅ **Natural interaction:**\n- Asked for opinions: 'Was denkst du?', 'Was meinst du?', 'Was hältst du von...?'\n- Made suggestions: 'Ich würde vorschlagen', 'Wie wäre es mit...?'\n- Agreed: 'Einverstanden!', 'Gute Idee!', 'Stimmt!'\n- Negotiated: 'München finde ich super! Aber vielleicht...'\n\n✅ **Good language range:**\n- Modal verbs: 'könnten', 'sollen', 'möchten'\n- Conditional: 'würde vorschlagen'\n- Comparative: 'näher', 'besser', 'günstiger'\n- Time expressions: 'nächste Woche', 'vormittags', 'nachmittags'\n\n✅ **Clear structure:** Discussed points systematically (Where → When → How → What → Cost)\n\n---\n\n**COMPLETE MODEL DISCUSSION 2: Planning a Birthday Party**\n\n**TASK:** Sie organisieren zusammen eine Geburtstagsparty für einen Freund. Sprechen Sie über:\n- Wo feiern? (Where to celebrate?)\n- Wer kommt? (Who's invited?)\n- Essen und Getränke? (Food and drinks?)\n- Geschenk? (Gift?)\n- Musik/Unterhaltung? (Music/entertainment?)\n\n---\n\n**SPEAKER A:** So, wir müssen Toms Geburtstagsparty planen! **Wo** sollen wir feiern?\n\n**SPEAKER B:** Wie wäre es bei mir zu Hause? Ich habe einen großen Garten.\n\n**A:** Das ist eine gute Idee! Aber was machen wir, wenn es regnet?\n\n**B:** Stimmt... Vielleicht ist ein Restaurant sicherer?\n\n**A:** Oder wir feiern in einem Gemeinschaftsraum? Den kann man mieten und da gibt es auch Platz für viele Leute.\n\n**B:** Ja, das ist praktisch! Dann sind wir wetterunabhängig. Einverstanden!\n\n**A:** Super! Und **wen** laden wir ein? Nur enge Freunde oder auch Kollegen?\n\n**B:** Ich denke, Tom möchte seine engsten Freunde dabei haben. Vielleicht 15-20 Personen?\n\n**A:** Gute Idee! Dann wird es nicht zu voll. Sollen wir auch seine Familie einladen?\n\n**B:** Ja, auf jeden Fall! Seine Schwester und seine Eltern sollten kommen.\n\n**A:** Okay! Dann zu **Essen und Getränke** - was organisieren wir?\n\n**B:** Ich würde ein Buffet vorschlagen. Jeder bringt etwas mit - so ist es einfacher!\n\n**A:** Hmm, aber Tom ist der Geburtstagskind! Vielleicht sollten WIR das Essen organisieren?\n\n**B:** Du hast recht. Wie wäre es mit Pizza? Das mögen alle und es ist nicht so teuer.\n\n**A:** Perfekt! Und für Getränke - Bier, Wein, und alkoholfreie Getränke?\n\n**B:** Ja, genau! Wir kaufen eine Auswahl. Was ist mit **Geschenk**?\n\n**A:** Alle zusammen kaufen ein großes Geschenk? Jeder zahlt 10 Euro?\n\n**B:** Gute Idee! Was könnten wir kaufen? Tom wollte doch schon lange neue Kopfhörer...\n\n**A:** Stimmt! Mit 150-200 Euro können wir gute Kopfhörer kaufen.\n\n**B:** Perfekt! Und **Musik**? Sollen wir einen DJ buchen?\n\n**A:** Ein DJ ist vielleicht zu teuer. Wir können eine Playlist machen!\n\n**B:** Ja, oder jeder bringt seine Lieblingsmusik mit. Das wird lustig!\n\n**A:** Super Idee! Also: Gemeinschaftsraum, 20 Personen, Pizza und Getränke, zusammen Kopfhörer schenken, und Musik von uns allen!\n\n**B:** Perfekt! Tom wird sich freuen!\n\n---\n\n**WHAT MADE THIS DISCUSSION EXCELLENT:**\n\n✅ **All 5 points covered** with clear decisions\n\n✅ **Natural disagreement & compromise:**\n- B suggests home → A worries about rain → Compromise: community room\n- B suggests potluck → A says we should organize → Compromise: we buy pizza\n\n✅ **Polite language:**\n- 'Wie wäre es...?' (How about...?)\n- 'Was meinst du?' (What do you think?)\n- 'Du hast recht' (You're right)\n- 'Vielleicht...' (Maybe...)\n\n✅ **Good connectors:**\n- 'Aber' (but), 'Oder' (or), 'Dann' (then), 'Auch' (also), 'Und' (and)\n\n✅ **Summary at end** - always good to summarize agreements!\n\n---\n\n**COMPLETE MODEL DISCUSSION 3: Planning a Weekend Trip**\n\n**TASK:** Sie planen mit einem Freund einen Wochenendausflug. Sprechen Sie über:\n- Wohin fahren? (Where to go?)\n- Mit was fahren? (How to travel?)\n- Wo übernachten? (Where to stay?)\n- Was unternehmen? (What activities?)\n- Wie viel Geld brauchen wir? (How much money needed?)\n\n---\n\n**SPEAKER A:** Ein Wochenendausflug - super Idee! **Wohin** möchtest du fahren?\n\n**SPEAKER B:** Ich hätte Lust auf die Berge! Wandern, frische Luft...\n\n**A:** Berge sind schön, aber ich war gerade erst wandern. Wie wäre es mit einer Stadt? Berlin vielleicht?\n\n**B:** Berlin ist auch toll! Da gibt es viel zu sehen. Aber es ist ziemlich teuer, oder?\n\n**A:** Stimmt. Vielleicht Leipzig? Das ist günstiger und auch sehr interessant!\n\n**B:** Gute Idee! Leipzig ist perfekt. Nicht zu groß, nicht zu klein. Und **wie** kommen wir hin?\n\n**A:** Mit dem Auto? Dann sind wir flexibel.\n\n**B:** Aber Parkplätze in der Stadt sind teuer und schwierig zu finden. Ich würde den Zug vorschlagen.\n\n**A:** Du hast recht! Mit dem Zug ist entspannter. Wir können ein Wochenendticket kaufen.\n\n**B:** Genau! Und **wo übernachten** wir? Hotel oder Hostel?\n\n**A:** Hostel ist günstiger! Aber vielleicht gibt es auch günstige Hotels?\n\n**B:** Wir könnten auch Airbnb schauen. Manchmal findet man da gute Angebote.\n\n**A:** Super Idee! Airbnb ist oft gemütlicher als Hotel. Einverstanden!\n\n**B:** Prima! **Was** wollen wir in Leipzig machen?\n\n**A:** Auf jeden Fall das Völkerschlachtdenkmal besichtigen! Das ist sehr beeindruckend.\n\n**B:** Ja! Und wir könnten durch die Altstadt spazieren, ins Musikviertel gehen...\n\n**A:** Und abends in eine Kneipe? Leipzig hat tolle Bars!\n\n**B:** Perfekt! Vielleicht auch das Bachmuseum? Ich mag klassische Musik.\n\n**A:** Warum nicht! So haben wir Kultur UND Spaß. Bleibt die Frage: **Wie viel Geld** brauchen wir?\n\n**B:** Also, Zugticket... vielleicht 40 Euro pro Person?\n\n**A:** Ja, und Airbnb für eine Nacht... 30 Euro pro Person ungefähr?\n\n**B:** Dann Essen, Trinken, Eintritte... noch mal 50 Euro?\n\n**A:** Also insgesamt 120 Euro pro Person fürs ganze Wochenende. Das geht!\n\n**B:** Ja, das ist in Ordnung! Wann fahren wir?\n\n**A:** Übernächstes Wochenende? Dann habe ich frei.\n\n**B:** Passt! Ich freue mich schon!\n\n---\n\n**KEY LANGUAGE PATTERNS USED:**\n\n**Making Suggestions:**\n- 'Wie wäre es mit...?' (How about...?)\n- 'Ich würde... vorschlagen' (I would suggest...)\n- 'Ich hätte Lust auf...' (I'd like to...)\n- 'Wir könnten...' (We could...)\n- 'Vielleicht...' (Maybe...)\n\n**Asking for Opinion:**\n- 'Was meinst du?' (What do you think?)\n- 'Was denkst du?' (What do you think?)\n- 'Bist du einverstanden?' (Do you agree?)\n- 'Was hältst du von...?' (What do you think of...?)\n- 'Möchtest du...?' (Would you like...?)\n\n**Agreeing:**\n- 'Gute Idee!' (Good idea!)\n- 'Einverstanden!' (Agreed!)\n- 'Perfekt!' (Perfect!)\n- 'Das geht!' (That works!)\n- 'Ja, genau!' (Yes, exactly!)\n- 'Stimmt!' (True!/Right!)\n\n**Disagreeing Politely:**\n- 'Aber...' (But...)\n- 'Vielleicht ist... besser?' (Maybe... is better?)\n- 'Ich war gerade erst...' (I just recently...)\n- 'Das ist ziemlich teuer, oder?' (That's quite expensive, right?)\n\n**Compromising:**\n- 'Du hast recht' (You're right)\n- 'Oder...' (Or...)\n- 'Wie wäre es, wenn...' (How would it be if...)\n- 'Wir könnten auch...' (We could also...)\n\n---\n\n**30+ ESSENTIAL DISCUSSION PHRASES FOR TEIL 3:**\n\n**CATEGORY 1: Opening the Discussion (3 phrases)**\n\n1. 'Also, wir sollen... planen.' (So, we should plan...)\n2. 'Lass uns über... sprechen.' (Let's talk about...)\n3. 'Wir müssen... organisieren.' (We need to organize...)\n\n**CATEGORY 2: Making Suggestions (8 phrases)**\n\n4. 'Wie wäre es mit...?' (How about...?)\n5. 'Ich würde... vorschlagen.' (I would suggest...)\n6. 'Ich schlage vor, dass...' (I suggest that...)\n7. 'Wir könnten...' (We could...)\n8. 'Vielleicht sollten wir...' (Maybe we should...)\n9. 'Was hältst du davon, wenn...' (What do you think if...)\n10. 'Ich hätte eine Idee: ...' (I have an idea: ...)\n11. 'Ich finde,... wäre gut.' (I think... would be good.)\n\n**CATEGORY 3: Asking for Opinion (6 phrases)**\n\n12. 'Was meinst du?' (What do you think?)\n13. 'Was denkst du darüber?' (What do you think about it?)\n14. 'Bist du damit einverstanden?' (Do you agree with that?)\n15. 'Was hältst du von...?' (What do you think of...?)\n16. 'Hast du eine andere Idee?' (Do you have another idea?)\n17. 'Findest du das gut?' (Do you think that's good?)\n\n**CATEGORY 4: Agreeing (7 phrases)**\n\n18. 'Gute Idee!' (Good idea!)\n19. 'Das finde ich auch!' (I think so too!)\n20. 'Einverstanden!' (Agreed!)\n21. 'Ja, genau!' (Yes, exactly!)\n22. 'Stimmt!' (Right!/True!)\n23. 'Das passt perfekt!' (That fits perfectly!)\n24. 'Ich bin deiner Meinung.' (I agree with you.)\n\n**CATEGORY 5: Disagreeing Politely (6 phrases)**\n\n25. 'Ich bin mir nicht sicher...' (I'm not sure...)\n26. 'Vielleicht ist... besser?' (Maybe... is better?)\n27. 'Ich habe eine andere Idee...' (I have a different idea...)\n28. 'Das finde ich zu teuer/schwierig.' (I think that's too expensive/difficult.)\n29. 'Aber was ist, wenn...?' (But what if...?)\n30. 'Hmm, ich würde lieber...' (Hmm, I would prefer...)\n\n**CATEGORY 6: Making Decisions (4 phrases)**\n\n31. 'Also, wir entscheiden uns für...?' (So, we decide on...?)\n32. 'Dann machen wir das so!' (Then we'll do it that way!)\n33. 'Okay, das ist beschlossen!' (Okay, that's decided!)\n34. 'Perfekt, dann ist alles klar!' (Perfect, then everything's clear!)\n\n---\n\n**TURN-TAKING STRATEGIES:**\n\n**Strategy 1: The 'Equal Time' Rule**\n- Count your turns vs partner's turns\n- If you've spoken 5 times and partner only 2 times → ASK QUESTIONS!\n- If partner dominates → INTERRUPT POLITELY: 'Darf ich auch etwas sagen?' (May I also say something?)\n\n**Strategy 2: The 'Question Invitation'**\nAfter making suggestion, ALWAYS invite partner's opinion:\n- 'Was meinst du?' (What do you think?)\n- 'Bist du einverstanden?' (Do you agree?)\n- 'Hast du eine andere Idee?' (Do you have another idea?)\n\nThis keeps conversation flowing!\n\n**Strategy 3: The 'Active Listening' Response**\nShow you're listening:\n- 'Aha!' (Aha!)\n- 'Verstehe!' (I understand!)\n- 'Interessant!' (Interesting!)\n- 'Stimmt!' (True!)\n\nThen add your opinion!\n\n**Strategy 4: The 'Build On' Technique**\nDon't just say 'Ja' - build on partner's idea:\n❌ 'Ja, okay.'\n✅ 'Ja, gute Idee! Und wir könnten auch...'\n\nThis shows collaboration!",
            tips: "**12 TEIL 3 MASTERY STRATEGIES:**\n\n**STRATEGY 1: The 'Preparation Formula' (3 minutes)**\n\nDuring 3-minute prep time:\n\n**Minute 1:** Read task carefully\n- Underline the topic\n- Number the discussion points (1-6)\n- Note any special requirements\n\n**Minute 2:** Brainstorm ideas\n- Write 1-2 ideas for EACH point\n- Think of vocabulary you'll need\n- Don't write full sentences - just keywords!\n\n**Minute 3:** Plan your opening\n- Decide who starts\n- Plan your first suggestion\n- Remember phrases: 'Wie wäre es mit...?'\n\nDON'T write a script - just notes!\n\n**STRATEGY 2: The 'Systematic Coverage' Method**\n\nDiscuss points IN ORDER:\n1. Start with point 1\n2. Suggest → Discuss → Decide\n3. Move to point 2\n4. Keep checking: 'Haben wir alle Punkte?' (Have we covered all points?)\n\nDon't jump around randomly - examiners track if you cover everything!\n\n**STRATEGY 3: The 'Equal Partnership' Technique**\n\n**Your goal:** 50/50 participation\n\n**How to achieve:**\n- After YOU speak → Ask question: 'Was meinst du?'\n- After PARTNER speaks → Respond AND add idea: 'Gute Idee! Und vielleicht...'\n- If partner quiet → Invite: 'Was denkst du darüber?'\n- If you're quiet → Jump in: 'Ich hätte noch eine Idee...'\n\n**Red flag:** If you speak 4 times in a row without partner responding → STOP and ASK!\n\n**STRATEGY 4: The 'Polite Disagreement' Skill**\n\nDON'T just agree with everything (too easy = lower score!)\n\nShow real discussion:\n\n❌ 'Ja, okay, gut.'\n✅ 'Das ist eine gute Idee, aber vielleicht ist... besser, weil...'\n\nDisagree 2-3 times during discussion, then find compromise!\n\n**Example:**\nPartner: 'Lass uns ins Restaurant gehen!'\nYou: 'Restaurant ist schön, aber vielleicht zu teuer? Wie wäre es mit einem Picknick im Park?'\nPartner: 'Hmm, aber was machen wir, wenn es regnet?'\nYou: 'Stimmt! Okay, Restaurant ist sicherer!'\n\n= Natural negotiation!\n\n**STRATEGY 5: The 'Time Management' System**\n\n**4-5 minute discussion with 5-6 points = 45-60 seconds per point**\n\nDon't spend 3 minutes on first point!\n\nKeep moving:\n- If agreement quick → Move on!\n- If discussion getting long → Summarize: 'Also, wir entscheiden uns für...?'\n- Always leave 30 seconds for summary!\n\n**STRATEGY 6: The 'Language Variety' Boost**\n\nUse different structures:\n- Modal verbs: 'Wir könnten...', 'Wir sollten...', 'Wir müssen...'\n- Conditional: 'Ich würde vorschlagen...', 'Es wäre besser...'\n- Questions: 'Was hältst du von...?', 'Sollen wir...?'\n- Conjunctions: 'weil', 'aber', 'oder', 'und', 'deshalb'\n\nVariety = higher score!\n\n**STRATEGY 7: The 'Natural Filler' Technique**\n\nWhen thinking, use German fillers (NOT English 'um...'):\n- 'Ähm...' (um...)\n- 'Also...' (so.../ well...)\n- 'Hmm...' (hmm...)\n- 'Lass mich überlegen...' (Let me think...)\n- 'Mal sehen...' (Let's see...)\n\nBetter than silence!\n\n**STRATEGY 8: The 'Summary Close'**\n\nLast 30 seconds - summarize ALL decisions:\n\n'Also, zusammenfassend: Wir feiern am Samstag, im Gemeinschaftsraum, mit Pizza und Getränken, wir kaufen zusammen ein Geschenk für 150 Euro, und wir machen eine Playlist. Bist du einverstanden?'\n\n(So, to summarize: We're celebrating on Saturday, in the community room, with pizza and drinks, we're buying a gift together for 150 euros, and we're making a playlist. Do you agree?)\n\nThis shows you covered everything!\n\n**STRATEGY 9: The 'Question Balance'**\n\nDon't just make statements - ask questions!\n\nGoal: 1 question per 2 statements\n\n✅ 'Ich würde München vorschlagen. Was meinst du?' (statement + question)\n✅ 'Wie wäre es mit Samstag?' (question)\n✅ 'Wir könnten Pizza bestellen. Oder hast du eine andere Idee?' (statement + question)\n\nQuestions = interaction = higher score!\n\n**STRATEGY 10: The 'Topic Bank' Preparation**\n\n**Most common Teil 3 topics (prepare these!):**\n\n1. **Events:** Birthday party, farewell party, class party, welcome event\n2. **Trips:** Weekend trip, class trip, city visit, day excursion\n3. **Activities:** Sports activity, cooking class, language exchange, study group\n4. **Projects:** Charity event, school project, community garden, neighborhood party\n5. **Practical:** Moving help, furniture shopping, apartment search, roommate rules\n\nFor EACH topic, prepare vocabulary:\n- Locations: Gemeinschaftsraum, Restaurant, Park, Museum, Berge, Stadt\n- Time: Wochenende, Samstag, nachmittags, nächste Woche\n- Food: Pizza, Buffet, Picknick, Grillen, vegetarisch\n- Transport: Auto, Zug, Fahrrad, zu Fuß, Bus\n- Budget: günstig, teuer, 10 Euro pro Person, zusammenlegen\n\n**STRATEGY 11: The 'Rescue Phrases' for Problems**\n\n**If you don't understand partner:**\n- 'Kannst du das wiederholen?' (Can you repeat that?)\n- 'Verstehe ich richtig - du meinst...?' (Do I understand correctly - you mean...?)\n- 'Entschuldigung, was hast du gesagt?' (Sorry, what did you say?)\n\n**If you forget a word:**\n- Use similar word: 'Gemeinschaftsraum' → 'ein Raum, wo man feiern kann'\n- Describe it: 'das Ding, wo man... macht' (the thing where you... do)\n- Ask partner: 'Wie sagt man... auf Deutsch?'\n\n**If running out of time:**\n- 'Wir sollten schneller entscheiden!' (We should decide faster!)\n- 'Okay, machen wir das so!' (Okay, let's do it that way!)\n- 'Wir haben noch drei Punkte!' (We still have three points!)\n\n**STRATEGY 12: The 'Practice Progression' Plan**\n\n**Week 1:** Memorize all 34 phrases + practice saying them aloud\n**Week 2:** Practice with written notes (read dialogue, practice turn-taking)\n**Week 3:** Practice from keywords only (no full sentences)\n**Week 4:** Practice with just topic (no notes!) - timed 4-5 minutes\n\n**Goal:** By exam day, you can discuss ANY topic for 4-5 minutes with natural interaction!\n\n---\n\n**COMMON MISTAKES & HOW TO FIX:**\n\n**Mistake #1: One person dominates**\n- YOU talk 80%, partner talks 20%\n- FIX: After every 2 sentences, ASK A QUESTION: 'Was denkst du?'\n\n**Mistake #2: Just agreeing with everything**\n- Partner: 'Restaurant?' You: 'Ja!' Partner: 'Samstag?' You: 'Ja!' Partner: 'Pizza?' You: 'Ja!'\n- FIX: Disagree 2-3 times: 'Restaurant ist gut, aber vielleicht ist Picknick günstiger?'\n\n**Mistake #3: Not covering all points**\n- Spend too long on first 2 points, forget last 3\n- FIX: Check task sheet! Count points. Track which you've discussed.\n\n**Mistake #4: Writing full script during prep**\n- Trying to write everything you'll say\n- FIX: Only keywords! 'Wo? → München, Berlin, Leipzig' (not full sentences!)\n\n**Mistake #5: Being too formal**\n- Using 'Sie' instead of 'du'\n- Too formal language: 'Ich bitte Sie, mir Ihre Meinung mitzuteilen'\n- FIX: This is INFORMAL! Use 'du': 'Was meinst du?'\n\n**Mistake #6: No interaction**\n- Just presenting ideas like a speech\n- FIX: This is a DISCUSSION! Ask questions, respond to partner, build on ideas!\n\n**Mistake #7: Giving up if partner is weak**\n- Partner makes mistakes or is quiet → you get frustrated\n- FIX: Help partner! Ask questions, encourage them: 'Was denkst du?', 'Hast du eine Idee?'\n\n---\n\n**FINAL CHECKLIST FOR TEIL 3 SUCCESS:**\n\n**Before exam:**\n- [ ] Memorized 34 essential phrases\n- [ ] Practiced 10+ different topics\n- [ ] Can discuss 4-5 minutes without notes\n- [ ] Comfortable with disagreeing politely\n- [ ] Know rescue phrases for problems\n\n**During preparation (3 min):**\n- [ ] Read task carefully\n- [ ] Numbered all discussion points\n- [ ] Wrote keywords (not sentences!)\n- [ ] Planned opening sentence\n- [ ] Reviewed vocabulary needed\n\n**During discussion (4-5 min):**\n- [ ] Equal participation (count turns!)\n- [ ] Covered ALL discussion points\n- [ ] Asked partner's opinion regularly\n- [ ] Disagreed 2-3 times politely\n- [ ] Used varied language (modals, conditional, questions)\n- [ ] Reached clear decisions for each point\n- [ ] Summarized at end\n- [ ] Stayed in time limit\n\n**After discussion:**\n- [ ] Felt like natural conversation\n- [ ] Both partners contributed equally\n- [ ] All points discussed\n- [ ] Decisions were clear\n\n**Remember:** Teil 3 tests your ability to WORK TOGETHER - not to show off! Be a good partner, listen actively, and create natural interaction. Your goal is successful collaboration, not individual performance!\n\n**Good luck! Du schaffst das! (You can do it!)**"
          },
          subtasks: [
            { description: "PHRASE MEMORIZATION: Learn all 34 essential phrases (opening, suggesting, asking opinion, agreeing, disagreeing, deciding). Create flashcards. Practice saying each phrase 5 times aloud.", completed: false },
            { description: "MODEL DIALOGUE ANALYSIS: Read all 3 model discussions. For each, note: How many turns per person? How did they disagree? How did they reach compromise? What phrases did they use most?", completed: false },
            { description: "PREPARATION PRACTICE: Take 5 random topics (plan birthday party, weekend trip, class event, study group, sports activity). For each: Set 3-minute timer, make notes using Preparation Formula. No full sentences!", completed: false },
            { description: "EQUAL PARTICIPATION DRILL: With study partner or alone (play both roles), discuss 'Planning a picnic'. Count turns - must be equal (10-12 each). If unbalanced, practice asking more questions!", completed: false },
            { description: "POLITE DISAGREEMENT PRACTICE: Choose 3 partner suggestions. For each, disagree politely using different phrases ('Vielleicht ist... besser?', 'Ich bin mir nicht sicher...', 'Aber was ist, wenn...?'). Then find compromise!", completed: false },
            { description: "FULL SIMULATION: With partner (or record both sides yourself), do complete Teil 3 on topic 'Planning a class party'. Set 3-min prep timer + 4-5 min discussion timer. Cover all points. Record and listen back: Was participation equal? Did you cover all points?", completed: false },
            { description: "LANGUAGE VARIETY CHECK: During practice, use checklist: Did I use modal verbs? Conditional? Questions? Different connectors? If missing any, practice using them in next discussion!", completed: false },
            { description: "TIME MANAGEMENT TEST: Do 3 full discussions (different topics) with strict time limits. Track how long on each point. Goal: Finish all points in 4-5 minutes with time for summary!", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Speaking Teil 3 Examples (Video)", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "Discussion Phrases Flashcards (Quizlet)", url: "https://quizlet.com/subject/german-b1-speaking" },
            { name: "Partner Discussion Practice Topics (PDF)", url: "https://deutschtraining.org/sprechen-b1-teil3/" },
            { name: "iTalki - Find German Speaking Partners", url: "https://www.italki.com" },
            { name: "Tandem App - Language Exchange Practice", url: "https://www.tandem.net" },
            { name: "German Discussion Phrases Audio (Forvo)", url: "https://forvo.com/languages/de/" }
          ],
          notes: ""
        },
        {
          day: 6,
          task: "Week 3 Consolidation: Integration & Mastery Check",
          focus: "consolidation",
          level: "B1",
          lessonContent: {
            title: "Week 3 Integration Checkpoint: Bringing It All Together",
            definition: "Week 3 Consolidation Day = your INTEGRATION CHECKPOINT before the review! This week you learned 5 major skills. Today you'll TEST how well they work TOGETHER - because the exam doesn't test them in isolation!\n\n**What You've Mastered This Week:**\n- ✅ **Day 1:** Modal Verbs (können, müssen, wollen, dürfen, sollen, mögen) - all conjugations, word order\n- ✅ **Day 2:** Writing Teil 2 (forum posts, opinion writing, 80 words, semi-formal)\n- ✅ **Day 3:** Work & Education Vocabulary (200+ words: jobs, workplace, education system)\n- ✅ **Day 4:** Reading Teil 3 & 4 (matching ads, opinion texts, scanning strategies)\n- ✅ **Day 5:** Speaking Teil 3 (partner discussions, planning together, turn-taking)\n\n**Why Consolidation Days Are Critical:**\nYou've learned 5 topics, but can you USE them together? Today you'll:\n- Write a forum post USING modal verbs AND work vocabulary\n- Practice speaking discussions USING modal verbs AND opinion phrases\n- Read texts that require COMBINING scanning + synonym recognition\n- Test your mastery of ALL Week 3 content under time pressure\n\n**Today's Goals:**\n1. Test modal verb mastery (60 sentences covering all 6 modals)\n2. Self-assess work vocabulary retention (200-word checklist)\n3. Write complete forum post combining Week 3 skills (20 minutes)\n4. Practice Reading Teil 3 & 4 with time limit\n5. Practice Speaking Teil 3 discussion\n6. Identify gaps and create focused review plan for Week 4\n\n**The Integration Challenge:**\nReal exam questions combine multiple skills. Example:\n- Speaking Teil 3 topic: 'Plan a job fair for students' → Uses work vocabulary + discussion phrases + modal verbs!\n- Writing Teil 2 prompt: 'Should students work during studies?' → Uses opinion phrases + work vocabulary + modal verbs!\n\nToday you'll practice this multi-skill integration!",
            example: "**PART 1: MODAL VERBS MASTERY TEST (60 Sentences)**\n\n**Instructions:** Fill in the correct modal verb form. Cover the answers, complete the test in 15 minutes, then check!\n\n**SECTION A: können (10 sentences)**\n\n1. Ich _____ Deutsch sprechen. (can)\n2. _____ du mir helfen? (can)\n3. Er _____ sehr gut kochen. (can)\n4. Wir _____ morgen kommen. (can)\n5. _____ ihr das verstehen? (can)\n6. Sie _____ Klavier spielen. (they can)\n7. Ich _____ gestern nicht schlafen. (could - Präteritum)\n8. Wir _____ das Problem lösen. (can)\n9. _____ Sie mir sagen, wie spät es ist? (can - formal)\n10. Die Kinder _____ schon lesen. (can)\n\n**ANSWERS:** 1. kann, 2. Kannst, 3. kann, 4. können, 5. Könnt, 6. können, 7. konnte, 8. können, 9. Können, 10. können\n\n**SECTION B: müssen (10 sentences)**\n\n11. Ich _____ heute arbeiten. (must)\n12. _____ du schon gehen? (must)\n13. Er _____ zum Arzt gehen. (must)\n14. Wir _____ pünktlich sein. (must)\n15. _____ ihr Hausaufgaben machen? (must)\n16. Sie _____ früh aufstehen. (they must)\n17. Ich _____ gestern lange warten. (had to - Präteritum)\n18. Man _____ einen Pass haben. (must - impersonal)\n19. _____ Sie das wirklich tun? (must - formal)\n20. Die Studenten _____ eine Prüfung schreiben. (must)\n\n**ANSWERS:** 11. muss, 12. Musst, 13. muss, 14. müssen, 15. Müsst, 16. müssen, 17. musste, 18. muss, 19. Müssen, 20. müssen\n\n**SECTION C: wollen (10 sentences)**\n\n21. Ich _____ nach Hause gehen. (want to)\n22. _____ du mitkommen? (want to)\n23. Sie _____ Ärztin werden. (wants to)\n24. Wir _____ im Sommer reisen. (want to)\n25. _____ ihr etwas essen? (want to)\n26. Sie _____ ein neues Auto kaufen. (they want to)\n27. Ich _____ das nicht glauben. (wanted - Präteritum)\n28. Was _____ du machen? (want to)\n29. Er _____ Deutsch lernen. (wants to)\n30. _____ Sie etwas trinken? (want to - formal)\n\n**ANSWERS:** 21. will, 22. Willst, 23. will, 24. wollen, 25. Wollt, 26. wollen, 27. wollte, 28. willst, 29. will, 30. Wollen\n\n**SECTION D: dürfen (10 sentences)**\n\n31. Ich _____ hier rauchen? (am allowed to)\n32. _____ du das essen? (are allowed to)\n33. Er _____ nicht Auto fahren. (is not allowed to)\n34. Wir _____ bis 22 Uhr bleiben. (are allowed to)\n35. _____ ihr hier parken? (are allowed to)\n36. Man _____ nicht laut sein. (is not allowed to - impersonal)\n37. Ich _____ als Kind nicht fernsehen. (was not allowed - Präteritum)\n38. _____ ich fragen? (may I - polite)\n39. Sie _____ morgen frei haben. (are allowed to - they)\n40. Hier _____ man nicht fotografieren. (is not allowed to)\n\n**ANSWERS:** 31. darf, 32. Darfst, 33. darf, 34. dürfen, 35. Dürft, 36. darf, 37. durfte, 38. Darf, 39. dürfen, 40. darf\n\n**SECTION E: sollen (10 sentences)**\n\n41. Ich _____ mehr lernen. (should)\n42. _____ du nicht zum Arzt gehen? (shouldn't you)\n43. Er _____ pünktlich sein. (should)\n44. Wir _____ früher anfangen. (should)\n45. _____ ihr das wirklich machen? (should)\n46. Sie _____ sich entschuldigen. (should - they)\n47. Was _____ ich tun? (should I)\n48. Man _____ immer höflich sein. (should - impersonal)\n49. Du _____ das nicht vergessen. (shouldn't)\n50. _____ ich das für Sie machen? (should I - formal)\n\n**ANSWERS:** 41. soll, 42. Sollst, 43. soll, 44. sollen, 45. Sollt, 46. sollen, 47. soll, 48. soll, 49. sollst, 50. Soll\n\n**SECTION F: mögen/möchten (10 sentences)**\n\n51. Ich _____ Schokolade. (like - mögen)\n52. _____ du Kaffee? (like - mögen)\n53. Ich _____ ein Bier, bitte. (would like - möchten)\n54. Wir _____ Pizza bestellen. (would like - möchten)\n55. _____ ihr Tee oder Kaffee? (would like - möchten)\n56. Sie _____ klassische Musik. (like - mögen, they)\n57. _____ Sie etwas trinken? (would like - möchten, formal)\n58. Ich _____ keine Tomaten. (don't like - mögen)\n59. Was _____ du machen? (would like - möchten)\n60. Er _____ Sport. (likes - mögen)\n\n**ANSWERS:** 51. mag, 52. Magst, 53. möchte, 54. möchten, 55. Möchtet, 56. mögen, 57. Möchten, 58. mag, 59. möchtest, 60. mag\n\n**SCORING:**\n- 54-60 correct: EXCELLENT! Modal verb mastery achieved!\n- 48-53 correct: GOOD! Minor review needed\n- 42-47 correct: OKAY - Review all 6 modals again\n- <42 correct: URGENT! Go back to Day 1, drill conjugations\n\n**Your score: ___/60**\n\n---\n\n**PART 2: WORK & EDUCATION VOCABULARY CHECKLIST (200 Words)**\n\n**Instructions:** Cover German column. Can you recall the German word from English? Check off words you know instantly. Goal: 170+/200 (85%)\n\n**CATEGORY 1: Jobs (30 words)**\n\n□ 1. Teacher: _____\n□ 2. Doctor: _____\n□ 3. Nurse: _____\n□ 4. Engineer: _____\n□ 5. Lawyer: _____\n□ 6. Cook: _____\n□ 7. Waiter: _____\n□ 8. Salesperson: _____\n□ 9. Manager: _____\n□ 10. Programmer: _____\n\n**ANSWERS:** der Lehrer/die Lehrerin, der Arzt/die Ärztin, der Krankenpfleger/die Krankenschwester, der Ingenieur/die Ingenieurin, der Anwalt/die Anwältin, der Koch/die Köchin, der Kellner/die Kellnerin, der Verkäufer/die Verkäuferin, der Manager/die Managerin, der Programmierer/die Programmiererin\n\n**CATEGORY 2: Workplace (30 words)**\n\n□ 11. Office: _____\n□ 12. Company: _____\n□ 13. Salary: _____\n□ 14. Colleague: _____\n□ 15. Boss: _____\n□ 16. Application: _____\n□ 17. Resume/CV: _____\n□ 18. Job interview: _____\n□ 19. Working hours: _____\n□ 20. Vacation: _____\n\n**ANSWERS:** das Büro, die Firma, das Gehalt, der Kollege/die Kollegin, der Chef/die Chefin, die Bewerbung, der Lebenslauf, das Vorstellungsgespräch, die Arbeitszeit, der Urlaub\n\n**CATEGORY 3: Education (20 words)**\n\n□ 21. Elementary school: _____\n□ 22. High school (Gymnasium): _____\n□ 23. University: _____\n□ 24. Training/apprenticeship: _____\n□ 25. Degree: _____\n□ 26. Bachelor: _____\n□ 27. Studies: _____\n□ 28. Semester: _____\n□ 29. Exam: _____\n□ 30. Grade: _____\n\n**ANSWERS:** die Grundschule, das Gymnasium, die Universität, die Ausbildung, der Abschluss, der Bachelor, das Studium, das Semester, die Prüfung, die Note\n\n**Full 200-word checklist available in Day 3 notes - test yourself on all categories!**\n\n**Your vocabulary score: ___/200**\n\n---\n\n**PART 3: INTEGRATED FORUM WRITING TEST (20 Minutes)**\n\n**PROMPT:** In einem Online-Forum diskutieren die Teilnehmer über das Thema 'Homeoffice - Arbeiten von zu Hause'. Schreiben Sie Ihre Meinung (ca. 80 Wörter).\n\n(In an online forum, participants are discussing 'Working from home'. Write your opinion, about 80 words.)\n\n**YOUR CHALLENGE:** Write a complete forum post that uses:\n- ✅ 3+ modal verbs (können, müssen, sollen)\n- ✅ 10+ work vocabulary words from Week 3\n- ✅ Opinion phrases from Day 2\n- ✅ Proper forum format (semi-formal, Sie/man)\n- ✅ 80 words exactly\n\n**EXAMPLE MODEL ANSWER (showing integration):**\n\n'Meiner Meinung nach hat Homeoffice viele Vorteile. Erstens **kann** man flexibler arbeiten und spart Zeit für den **Arbeitsweg**. Man **muss** nicht jeden Tag ins **Büro** fahren. Zweitens **kann** man Familie und **Beruf** besser kombinieren. Natürlich gibt es auch Nachteile. Manche **Mitarbeiter** fühlen sich isoliert und vermissen den Kontakt zu **Kollegen**. Außerdem **soll** man eine gute Selbstdisziplin haben. Zusammenfassend denke ich, dass Homeoffice eine gute Option ist, aber nicht für jeden **Arbeitsplatz** geeignet. Jede **Firma** **sollte** individuelle Lösungen finden.'\n\n**WORD COUNT:** 82 words ✓\n\n**INTEGRATION CHECK:**\n- Modal verbs used: kann (3x), muss (1x), soll (1x), sollte (1x) ✓\n- Work vocabulary: Arbeitsweg, Büro, Beruf, Mitarbeiter, Kollegen, Selbstdisziplin, Arbeitsplatz, Firma ✓\n- Opinion phrases: Meiner Meinung nach, Erstens, Zweitens, Natürlich, Außerdem, Zusammenfassend ✓\n- Format: Semi-formal (man, not ich) ✓\n\n**NOW IT'S YOUR TURN!**\n\nSet timer: 20 minutes\n\n**Your forum post:**\n_________________________________\n_________________________________\n_________________________________\n_________________________________\n\n**Self-check:**\n- [ ] 3+ modal verbs used?\n- [ ] 10+ work vocabulary words?\n- [ ] Opinion phrases from Day 2?\n- [ ] Semi-formal tone?\n- [ ] 75-85 words?\n- [ ] Clear opinion + reasons + examples?\n\n**Your writing score: ___/25**\n\n---\n\n**PART 4: READING TEIL 3 PRACTICE (12 Minutes)**\n\n**Mini-Exercise:** 5 people, 7 ads (match each person to correct ad)\n\n**THE PEOPLE:**\n\n**1. Sarah:** Sucht Teilzeitstelle als Verkäuferin. Kann nur vormittags arbeiten (9-13 Uhr). Hat 2 Jahre Erfahrung.\n\n**2. Tom:** Braucht Praktikum für sein BWL-Studium. Mindestens 3 Monate. Interesse für Marketing.\n\n**3. Lisa:** Will als Krankenschwester arbeiten. Vollzeit. Bevorzugt Nachtschichten.\n\n**4. Max:** Sucht Nebenjob als Student. Flexibel, abends oder Wochenende. Keine Erfahrung nötig.\n\n**5. Anna:** Möchte online von zu Hause arbeiten. Hat Programmierkenntnisse. Selbstständig.\n\n**THE ADS:**\n\n**A)** Programmierer (m/w) gesucht! Homeoffice möglich. Flexible Zeiten. Projektbasis.\n\n**B)** Verkäuferin Teilzeit: Mo-Fr 14-18 Uhr. Modegeschäft. 5 Jahre Erfahrung erforderlich.\n\n**C)** Praktikum Marketing (3-6 Monate). Start sofort. Für Studierende ideal!\n\n**D)** Krankenpfleger/in Vollzeit. Schicht 22-6 Uhr. Krankenhaus München.\n\n**E)** Minijob Supermarkt. Samstag/Sonntag. Keine Vorkenntnisse. Student willkommen!\n\n**F)** Verkäuferin Teilzeit: Mo-Fr 9-13 Uhr. Bäckerei. 1-2 Jahre Erfahrung.\n\n**G)** Bürokraft Vollzeit. Mo-Fr 9-17 Uhr. Word/Excel erforderlich.\n\n**Set 12-minute timer and match!**\n\n**ANSWERS:** 1=F, 2=C, 3=D, 4=E, 5=A (B and G unused)\n\n**Your score: ___/5**\n\n---\n\n**PART 5: SPEAKING TEIL 3 SIMULATION**\n\n**TOPIC:** Sie planen mit einem Freund einen Spieleabend mit Kollegen. Sprechen Sie über:\n- Wann?\n- Wo?\n- Welche Spiele?\n- Essen/Trinken?\n- Wer kommt?\n\n**INTEGRATION:** Uses work vocabulary (Kollegen, Feierabend) + discussion phrases + modal verbs!\n\n**Set 3-minute prep timer + 4-minute discussion timer**\n\nPractice alone or with partner!\n\n**Self-assessment:**\n- [ ] All 5 points covered?\n- [ ] Equal participation?\n- [ ] Used modal verbs?\n- [ ] Used discussion phrases?\n- [ ] Finished in 4-5 minutes?\n\n**Your speaking score: ___/10**",
            tips: "**10 WEEK 3 CONSOLIDATION STRATEGIES:**\n\n**STRATEGY 1: The 'Multi-Skill Practice' Method**\n\nDon't practice skills in isolation!\n\n❌ WRONG: Just memorize modal verbs\n✅ RIGHT: Use modal verbs IN speaking practice, IN writing practice, IN real contexts\n\n**Example Integration:**\n- Speaking: 'Wir könnten...' (We could...)\n- Writing: 'Man sollte...' (One should...)\n- Reading: Recognize modals in texts\n\nPractice USING skills together!\n\n**STRATEGY 2: The 'Timed Practice' System**\n\nConsolidation = testing under EXAM conditions\n\n**Today's time budget:**\n- Modal verb test: 15 minutes\n- Vocabulary check: 10 minutes\n- Writing forum post: 20 minutes\n- Reading Teil 3: 12 minutes\n- Speaking simulation: 3 min prep + 4 min discussion\n\n**Total: ~60 minutes of focused testing**\n\nUse timer for EVERYTHING!\n\n**STRATEGY 3: The 'Gap Identification' Technique**\n\nAfter each test, identify gaps:\n\n**Modal verbs:** Which modal did you struggle with? Review that one!\n**Vocabulary:** Which category had most errors? Drill that category!\n**Writing:** What mistakes did you make? Grammar? Vocabulary? Format?\n**Reading:** Did you miss keywords? Scan too slowly?\n**Speaking:** Did you dominate? Too quiet? Forgot phrases?\n\n**Create targeted review plan!**\n\n**STRATEGY 4: The 'Error Pattern Analysis'**\n\nDon't just count mistakes - ANALYZE them!\n\n**Example:**\nModal verb test: 8 errors\n- 5 errors in conjugation (ich kann vs ich könne)\n- 2 errors in word order\n- 1 error in haben vs sein\n\n→ FOCUS: Conjugation practice needed!\n\nPattern recognition = efficient review!\n\n**STRATEGY 5: The 'Topic Combination' Practice**\n\n**Common exam combinations:**\n\n1. **Work + Modal verbs + Writing Teil 2:**\n   'Should students work part-time?'\n   → Uses: können (can work), müssen (must study), sollen (should), work vocabulary\n\n2. **Work + Discussion + Speaking Teil 3:**\n   'Plan a job fair'\n   → Uses: work vocabulary, discussion phrases, modal verbs (wir könnten)\n\n3. **Reading + Work vocabulary:**\n   Job ads matching\n   → Uses: scanning, work vocabulary recognition\n\nPrepare for these combinations!\n\n**STRATEGY 6: The 'Strength/Weakness Matrix'**\n\nCreate a grid:\n\n| Skill | Score | Status | Action |\n|-------|-------|--------|--------|\n| Modal verbs | 52/60 | Good | Review dürfen conjugation |\n| Work vocab | 180/200 | Good | Drill job titles |\n| Writing | 22/25 | Excellent | Maintain! |\n| Reading | 4/5 | Good | Practice more Teil 3 |\n| Speaking | 8/10 | Good | Practice equal participation |\n\n**Total Week 3:** 266/300 (89%) ✓\n\nVisual overview helps planning!\n\n**STRATEGY 7: The 'Spaced Repetition Schedule'**\n\n**After Consolidation Day:**\n\n**Tomorrow:** Review your #1 weakness (lowest score)\n**Day 3:** Review #2 weakness\n**Day 5:** Review ALL Week 3 (quick refresh)\n**Week 4:** Continue building on Week 3 foundation\n\n**Spaced review = long-term retention!**\n\n**STRATEGY 8: The 'Real-World Application'**\n\nUse Week 3 skills in REAL contexts:\n\n**Modal verbs:**\n- Think about your day: 'Ich muss arbeiten', 'Ich will ins Kino gehen'\n- Write 5 sentences about your plans\n\n**Work vocabulary:**\n- Describe your job (or dream job) using 20 work words\n- Read real German job ads online\n\n**Writing skills:**\n- Write real forum post in German online forum\n- Practice with different topics daily\n\n**Speaking:**\n- Find language exchange partner\n- Practice planning real events\n\nReal use = deeper learning!\n\n**STRATEGY 9: The 'Week 3 Mind Map'**\n\nCreate visual connection:\n\n```\n        WEEK 3\n           |\n    ________________\n    |   |   |   |   |\n Modal Work Read Writ Speak\n Verbs Vocab Teil3 Teil2 Teil3\n    |   |   |   |   |\n können Jobs Scan Opinion Discuss\n müssen Office Match Forum Plan\n wollen School       Turn-take\n```\n\nSee how everything connects!\n\n**STRATEGY 10: The 'Confidence Building' Approach**\n\n**Track your progress:**\n- Week 1: Basics (cases, vocabulary)\n- Week 2: Perfekt tense, daily routine, Writing Teil 1\n- Week 3: Modals, work vocab, Writing Teil 2, Reading 3&4, Speaking Teil 3\n\n**You've learned SO MUCH in 3 weeks!**\n\n**Celebrate wins:**\n- [ ] Can use all 6 modal verbs\n- [ ] Know 200+ work/education words\n- [ ] Can write forum posts\n- [ ] Can scan texts efficiently\n- [ ] Can discuss plans with partner\n\n**You're 25% through the program!**\n\nConfidence = exam success!"
          },
          subtasks: [
            { description: "MODAL VERB MASTERY TEST: Complete all 60 sentences (15 min timer). Score yourself. If <48 correct, go back to Day 1 and drill weak modals for 30 minutes.", completed: false },
            { description: "VOCABULARY SELF-CHECK: Test yourself on all 200 work/education words from Day 3. Cover German, recall from English. Mark unknown words and create flashcards for them.", completed: false },
            { description: "INTEGRATED WRITING: Write forum post on 'Homeoffice' (20 min). Must include 3+ modals, 10+ work words, opinion phrases. Count words (target: 80). Check against rubric!", completed: false },
            { description: "READING PRACTICE: Complete Mini Teil 3 exercise (5 people, 7 ads) in 12 minutes. Check answers. If <4 correct, review Day 4 scanning strategies!", completed: false },
            { description: "SPEAKING SIMULATION: Practice Teil 3 'Planning game night with colleagues' (3 min prep + 4 min discussion). Record yourself. Did you use modals? Work vocabulary? Discussion phrases?", completed: false },
            { description: "GAP ANALYSIS: Review ALL test scores. Create list: Top 3 strengths (celebrate!), Top 3 weaknesses (focus areas). Write specific action plan for each weakness.", completed: false },
            { description: "WEEK 3 SUMMARY: Write reflection (in German or English): What was hardest this week? What did I master? What needs more practice before Week 4? Rate confidence 1-10 for each skill.", completed: false },
            { description: "SPACED REVIEW SCHEDULE: Create plan for next 7 days. Which weak areas will you review tomorrow? Day 3? Day 5? Write it down and commit!", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Week 3 Consolidation Worksheet (PDF)", url: "https://www.goethe.de/resources" },
            { name: "Modal Verb Drill Exercises (Interactive)", url: "https://www.schubert-verlag.de/aufgaben/xg/xg07_01.htm" },
            { name: "Work Vocabulary Flashcard Deck (Anki)", url: "https://ankiweb.net/shared/info/german-b1-work" },
            { name: "Forum Writing Practice Platform", url: "https://deutschtraining.org/schreiben-b1-teil2/" },
            { name: "Reading Teil 3 Extra Practice (50+ exercises)", url: "https://deutschtraining.org/lesen-b1-teil3/" },
            { name: "Week 3 Self-Assessment Checklist", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" }
          ],
          notes: ""
        },
        {
          day: 7,
          task: "Week 3 Review & Mock Reading Module Test",
          focus: "review",
          level: "B1",
          lessonContent: {
            title: "Week 3 Final Checkpoint: Mock Reading Module (65 Minutes, 25 Points)",
            definition: "Week 3 Review Day = your FINAL TEST before Week 4! This isn't passive review - it's active TESTING under FULL EXAM CONDITIONS. Today you'll take a complete mock Reading module (all 5 Teile = 65 minutes total) to measure your progress and prepare for the real exam.\n\n**Why Reading Module Today?**\nWeek 3 gave you critical Reading skills (Teil 3 & 4 scanning strategies) PLUS the foundation to understand ALL Reading texts (modal verbs everywhere in B1 texts, work/education vocabulary common topics). You're READY to test the full Reading module!\n\n**What You've Mastered Over 3 Weeks:**\n\n**WEEK 1 FOUNDATION:**\n- ✅ Cases (NOM/AKK/DAT/GEN) - understand sentence structure\n- ✅ Present tense - understand current actions\n- ✅ Reading Teil 1 & 2 strategies - blogs, press articles\n- ✅ Family vocabulary - common topic\n\n**WEEK 2 EXPANSION:**\n- ✅ Perfekt tense - understand past events\n- ✅ Daily routine vocabulary - frequent in texts\n- ✅ Writing skills - helps comprehension\n\n**WEEK 3 MASTERY:**\n- ✅ Modal verbs - appear in EVERY B1 text!\n- ✅ Work/education vocabulary - common Reading topics\n- ✅ Reading Teil 3 & 4 strategies - scanning, matching\n- ✅ Speaking/Writing skills - deeper language understanding\n\n**Today's Goals:**\n1. Complete FULL Reading module under timed exam conditions (65 minutes)\n2. Score yourself using official marking scheme (25 points total)\n3. Analyze mistakes systematically (Why wrong? What pattern?)\n4. Identify your strongest and weakest Reading Teil\n5. Create focused review plan for remaining 9 weeks\n6. Reflect on Week 3 progress and set Week 4 goals\n\n**The Reading Module Structure:**\n- **Teil 1:** Blog/Email (6 questions, 10 min, 6 points)\n- **Teil 2:** Press Articles (6 questions, 20 min, 6 points)\n- **Teil 3:** Matching Ads (7 questions, 12 min, 7 points)\n- **Teil 4:** Opinion Texts (7 questions, 13 min, 7 points)\n- **Teil 5:** Internal Rules/Regulations (4 questions, 10 min, 4 points - NOT TESTED TODAY)\n\n**TOTAL:** 65 minutes, 25 points (Teil 5 omitted from this practice)\n\n**Passing Score:** 15/25 points (60%)\n\n**Your target for Week 3:** 17+ points (68%) = solid B1 level!\n\n**TODAY IS SERIOUS EXAM PRACTICE - NO INTERRUPTIONS, NO DICTIONARY, STRICT TIME LIMITS!**",
            example: "**MOCK READING MODULE TEST**\n\n**IMPORTANT INSTRUCTIONS:**\n\n1. ⏰ **Set up exam conditions:**\n   - Find quiet place\n   - 65-minute timer ready\n   - No phone, no dictionary\n   - All 4 Teile printed or on screen\n\n2. ⏱ **Time management:**\n   - Teil 1: 10 minutes → STOP at 10 min, move to Teil 2\n   - Teil 2: 20 minutes → STOP at 30 min mark, move to Teil 3\n   - Teil 3: 12 minutes → STOP at 42 min mark, move to Teil 4\n   - Teil 4: 13 minutes → STOP at 55 min mark\n   - Last 10 min: Review ALL answers\n\n3. ✅ **Answer sheet:**\n   - Write answers clearly\n   - Don't change answers more than once\n   - If unsure, make educated guess (no penalty for wrong answers!)\n\n4. 📝 **After test:**\n   - Check answers (key provided below)\n   - Calculate score\n   - Analyze each mistake\n   - Complete reflection questions\n\n---\n\n**TEIL 1: BLOG POST (10 Minutes, 6 Points)**\n\n**TEXT:**\n\n**Titel: Mein neuer Job als Deutschlehrerin**\n\nHallo Leute!\n\nIch muss euch von meinem neuen Job erzählen! Seit letztem Monat arbeite ich als Deutschlehrerin an einer Sprachschule in Berlin. Ich habe mich vor drei Monaten beworben und hatte großes Glück - von 50 Bewerbern wurden nur 3 eingestellt!\n\nMeine Arbeitszeiten sind sehr flexibel. Ich kann selbst entscheiden, wann ich unterrichte. Meistens arbeite ich vormittags von 9 bis 13 Uhr, aber manchmal auch abends. Das ist perfekt für mich, weil ich nachmittags Zeit für mein Studium habe.\n\nDie Schüler kommen aus der ganzen Welt - China, Brasilien, Syrien, USA. Das macht den Unterricht sehr interessant! Letzte Woche hatten wir ein Thema über deutsche Berufe. Ein Schüler wollte Arzt werden, eine andere möchte Ingenieurin werden. Es macht mir so viel Spaß, ihnen zu helfen!\n\nNatürlich gibt es auch Herausforderungen. Manche Schüler sprechen noch sehr wenig Deutsch. Ich muss dann viel Geduld haben und alles mehrmals erklären. Aber wenn sie Fortschritte machen, bin ich total glücklich!\n\nDas Gehalt ist nicht besonders hoch - etwa 2000 Euro im Monat - aber die Arbeit macht mir wirklich Freude. Und meine Kollegen sind super nett. Wir gehen oft zusammen zum Mittagessen.\n\nNächsten Monat soll ich auch einen Intensivkurs für Anfänger leiten. Das wird eine neue Erfahrung! Ich bin ein bisschen nervös, aber auch sehr gespannt.\n\nHabt ihr auch einen neuen Job? Erzählt mal!\n\nLiebe Grüße,\nSophie\n\n---\n\n**QUESTIONS (Mark R = Richtig, F = Falsch, T = Text sagt dazu nichts)**\n\n**1. Sophie hat ihren Job vor einem Jahr bekommen.**\n□ R □ F □ T\n\n**2. Sophie kann ihre Arbeitszeiten selbst bestimmen.**\n□ R □ F □ T\n\n**3. Alle Schüler kommen aus Europa.**\n□ R □ F □ T\n\n**4. Sophie verdient mehr als 2500 Euro pro Monat.**\n□ R □ F □ T\n\n**5. Sophie arbeitet gern mit ihren Kollegen zusammen.**\n□ R □ F □ T\n\n**6. Sophie hat schon viele Intensivkurse unterrichtet.**\n□ R □ F □ T\n\n**⏰ STOP AT 10 MINUTES! Move to Teil 2 even if not finished!**\n\n---\n\n**TEIL 2: PRESS ARTICLES (20 Minutes, 6 Points)**\n\n**TEXT:**\n\n**Artikel 1: Studie: Homeoffice bleibt beliebt**\n\nBERLIN - Laut einer aktuellen Studie möchten 65% der deutschen Arbeitnehmer auch nach der Pandemie im Homeoffice arbeiten. Besonders beliebt ist die Mischung aus Büro und Homeoffice - sogenannte 'hybride' Arbeit. Viele Mitarbeiter schätzen die Flexibilität und sparen Zeit für den Arbeitsweg. Allerdings sagen 30%, dass ihnen der persönliche Kontakt zu Kollegen fehlt.\n\nExperten meinen, dass Unternehmen flexible Lösungen finden müssen. 'Nicht jeder Job ist für Homeoffice geeignet', erklärt Professor Müller von der Universität Hamburg. 'Aber wo es möglich ist, sollten Arbeitgeber ihren Mitarbeitern die Wahl lassen.'\n\n**Artikel 2: Neue Ausbildungsberufe 2025**\n\nMÜNCHEN - Ab 2025 gibt es in Deutschland neue Ausbildungsberufe. Besonders im IT-Bereich entstehen moderne Ausbildungen wie 'Cyber-Security-Spezialist' oder 'KI-Entwickler'. Das Bundesbildungsministerium reagiert damit auf den Fachkräftemangel.\n\n'Wir brauchen Experten für die digitale Zukunft', sagt Ministerin Schmidt. 'Deshalb modernisieren wir die Ausbildungslandschaft.' Die neuen Berufe kombinieren Theorie und Praxis. Azubis lernen nicht nur in der Berufsschule, sondern arbeiten auch in Unternehmen.\n\nInteressierte können sich ab September 2025 bewerben. Die Ausbildung dauert drei Jahre und endet mit einer staatlich anerkannten Prüfung.\n\n---\n\n**QUESTIONS:**\n\n**7. Laut der Studie wollen die meisten Arbeitnehmer komplett im Homeoffice arbeiten.**\n□ R □ F □ T\n\n**8. Professor Müller findet, dass alle Jobs im Homeoffice gemacht werden können.**\n□ R □ F □ T\n\n**9. Die neuen Ausbildungsberufe gibt es vor allem im IT-Bereich.**\n□ R □ F □ T\n\n**10. Die Ausbildung dauert zwei Jahre.**\n□ R □ F □ T\n\n**11. Man kann sich jetzt schon für die neuen Ausbildungen bewerben.**\n□ R □ F □ T\n\n**12. Azubis lernen nur in der Berufsschule.**\n□ R □ F □ T\n\n**⏰ STOP AT 30 MINUTES TOTAL! Move to Teil 3!**\n\n---\n\n**TEIL 3: MATCHING ADS (12 Minutes, 7 Points)**\n\n**THE PEOPLE:**\n\n**13. Maria:** Sucht Vollzeitstelle als Sekretärin in Frankfurt. Kann sehr gut mit Word und Excel arbeiten. Mindestens 2500 Euro Gehalt.\n\n**14. Jonas:** Student, braucht Nebenjob am Wochenende. Keine Büroarbeit. Sportlich, mag Bewegung.\n\n**15. Elena:** Will Teilzeit arbeiten, nur vormittags (8-12 Uhr). Hat Erfahrung im Verkauf. Wohnt in Hamburg.\n\n**16. Ahmed:** Sucht Ausbildungsplatz als Koch. Ab September. Interessiert an internationaler Küche.\n\n**17. Lisa:** Möchte von zu Hause arbeiten. Hat Programmierkenntnisse. Flexible Zeiten wichtig.\n\n**18. Tom:** Braucht Praktikum für sein BWL-Studium. 3-6 Monate. Interesse für Marketing.\n\n**19. Sarah:** Sucht Job im Krankenhaus. Ausgebildete Krankenschwester. Vollzeit, auch Nachtschichten OK.\n\n**THE ADS:**\n\n**A)** **Sekretärin gesucht!** Frankfurt, Vollzeit, Mo-Fr 9-17 Uhr. Word/Excel erforderlich. Gehalt: 2800€. Start sofort!\n\n**B)** **Verkäuferin Teilzeit** Hamburg, Mo-Fr 8-12 Uhr. Modegeschäft. 2 Jahre Erfahrung. Bewerbung an: [email]\n\n**C)** **Programmierer/in Homeoffice** Projektbasis, flexible Zeiten, gute Bezahlung. Python/Java Kenntnisse.\n\n**D)** **Ausbildung Koch/Köchin** Start September, 3 Jahre, internationales Restaurant München. Bewerbungsfrist: Juni.\n\n**E)** **Aushilfe Supermarkt** Samstag/Sonntag 10-18 Uhr. Regale einräumen. Keine Vorkenntnisse. Student willkommen!\n\n**F)** **Praktikum Marketing** 3-6 Monate, für Studierende. Bewerbung mit Lebenslauf. Berlin. Start flexibel.\n\n**G)** **Krankenpfleger/in Vollzeit** Klinik Hamburg. Schichtdienst inkl. Nacht. Ausbildung erforderlich. Gutes Gehalt.\n\n**H)** **Bürokraft Teilzeit** München, nachmittags 14-18 Uhr. Telefonservice. Keine Erfahrung nötig.\n\n**I)** **Fitnesstrainer/in Nebenjob** Wochenende, Studio Berlin. Sportlich, motiviert. Ausbildung nicht erforderlich.\n\n**J)** **Grafikdesigner/in** Vollzeit, Werbeagentur Köln. Adobe Creative Suite. 3 Jahre Erfahrung.\n\n**MATCH each person (13-19) to ONE ad (A-J). Three ads will NOT be used.**\n\n**Your answers:**\n13. Maria = ___\n14. Jonas = ___\n15. Elena = ___\n16. Ahmed = ___\n17. Lisa = ___\n18. Tom = ___\n19. Sarah = ___\n\n**⏰ STOP AT 42 MINUTES TOTAL! Move to Teil 4!**\n\n---\n\n**TEIL 4: OPINION TEXTS (13 Minutes, 7 Points)**\n\n**TOPIC: Sollen Schüler schon in der Schule arbeiten dürfen?**\n(Should students be allowed to work while still in school?)\n\n**PERSON A - Klaus, 52, Lehrer:**\n'Ich bin dagegen, dass Schüler während der Schulzeit arbeiten. Schule ist schon stressig genug! Die Jugendlichen müssen lernen, Hausaufgaben machen, für Prüfungen vorbereiten. Wenn sie dann noch 10-15 Stunden pro Woche arbeiten, sind sie total erschöpft. Ich sehe das jeden Tag im Unterricht - die Schüler schlafen ein oder können sich nicht konzentrieren. Bildung sollte Priorität haben, nicht Geld verdienen!'\n\n**PERSON B - Jana, 17, Schülerin:**\n'Ich arbeite samstags in einem Café und finde das super! Ich verdiene mein eigenes Geld und lerne, verantwortlich zu sein. Außerdem hilft mir die Arbeit für meine Zukunft - ich weiß jetzt besser, was ich später machen möchte. Natürlich darf die Arbeit nicht zu viel sein. Aber 8 Stunden am Wochenende sind perfekt. Meine Noten sind immer noch gut!'\n\n**PERSON C - Michael, 45, Unternehmer:**\n'Aus Sicht eines Arbeitgebers finde ich Schülerjobs positiv. Die Jugendlichen lernen Pünktlichkeit, Teamarbeit und Verantwortung. Diese Erfahrungen kann man nicht aus Büchern lernen. Natürlich muss man Grenzen setzen - maximal 10 Stunden pro Woche und nur am Wochenende. Aber grundsätzlich ist praktische Erfahrung sehr wertvoll.'\n\n**PERSON D - Petra, 38, Psychologin:**\n'Ich sehe beide Seiten. Einerseits kann Arbeit nützlich sein - Jugendliche werden selbstständiger und lernen den Wert von Geld kennen. Andererseits gibt es Risiken. Manche Schüler arbeiten zu viel, weil ihre Familien das Geld brauchen. Das ist problematisch. Ich denke, man sollte eine klare Regelung haben: nur ab 15 Jahren, maximal 8 Stunden pro Woche, nur mit Erlaubnis der Eltern.'\n\n---\n\n**STATEMENTS (Match to A, B, C, D, or 'niemand'):**\n\n**20. Diese Person arbeitet selbst als Schülerin.**\n**Answer:** ___\n\n**21. Diese Person findet, Schule sollte wichtiger sein als Arbeit.**\n**Answer:** ___\n\n**22. Diese Person sieht Vorteile UND Nachteile bei Schülerjobs.**\n**Answer:** ___\n\n**23. Diese Person sagt, Arbeitserfahrung hilft bei der Berufswahl.**\n**Answer:** ___\n\n**24. Diese Person möchte eine Altersgrenze für Schülerjobs.**\n**Answer:** ___\n\n**25. Diese Person beobachtet müde Schüler im Unterricht.**\n**Answer:** ___\n\n**26. Diese Person findet, Jugendliche lernen durch Arbeit wichtige soziale Fähigkeiten.**\n**Answer:** ___\n\n**⏰ STOP AT 55 MINUTES! Use last 10 minutes to REVIEW ALL ANSWERS!**\n\n---\n\n**ANSWER KEY:**\n\n**TEIL 1:**\n1. F (vor einem Jahr → seit letztem Monat = vor 1 Monat)\n2. R (kann selbst entscheiden, wann)\n3. F (kommen aus der ganzen Welt - China, Brasilien, Syrien, USA)\n4. F (etwa 2000 Euro)\n5. R (Kollegen sind super nett, gehen zusammen essen)\n6. F (nächsten Monat SOLL sie einen leiten = erste Mal)\n\n**TEIL 2:**\n7. F (möchten hybride Arbeit = Mischung)\n8. F (nicht jeder Job ist geeignet)\n9. R (besonders im IT-Bereich)\n10. F (dauert drei Jahre)\n11. F (ab September 2025 können sich bewerben)\n12. F (lernen in Berufsschule UND arbeiten in Unternehmen)\n\n**TEIL 3:**\n13. Maria = A (Sekretärin Frankfurt, Vollzeit, Word/Excel, 2800€)\n14. Jonas = I (Fitnesstrainer Nebenjob Wochenende, sportlich)\n15. Elena = B (Verkauf Hamburg Teilzeit 8-12 Uhr)\n16. Ahmed = D (Ausbildung Koch, September, international)\n17. Lisa = C (Programmierer Homeoffice, flexibel)\n18. Tom = F (Praktikum Marketing 3-6 Monate)\n19. Sarah = G (Krankenpfleger/in Vollzeit Nachtschicht)\n\n**Unused ads:** E (Supermarkt), H (Bürokraft nachmittags), J (Grafikdesigner)\n\n**TEIL 4:**\n20. B (Jana - Schülerin, arbeitet samstags)\n21. A (Klaus - Bildung Priorität)\n22. D (Petra - sehe beide Seiten)\n23. B (Jana - weiß jetzt besser, was ich später machen möchte)\n24. D (Petra - nur ab 15 Jahren)\n25. A (Klaus - Schüler schlafen ein im Unterricht)\n26. C (Michael - lernen Pünktlichkeit, Teamarbeit)\n\n---\n\n**SCORING:**\n\n**Teil 1:** ___/6\n**Teil 2:** ___/6\n**Teil 3:** ___/7\n**Teil 4:** ___/7\n\n**TOTAL:** ___/26\n\n**INTERPRETATION:**\n- 22-26: EXCELLENT! Week 3 mastered! B1+ level!\n- 18-21: GOOD! Solid B1 level, minor gaps\n- 15-17: OKAY - Passing grade but needs more practice\n- <15: URGENT! Review ALL Week 3 content\n\n**By Teil:**\n- **Strongest Teil** (highest score): ___\n- **Weakest Teil** (lowest score): ___\n\n**Action plan:** Focus extra practice on weakest Teil!",
            tips: "**WEEK 3 REVIEW: 12 REFLECTION STRATEGIES**\n\n**STRATEGY 1: The 'Mistake Analysis Matrix'**\n\nFor EACH wrong answer, complete this:\n\n| Q# | My Answer | Correct | Why Wrong? | Type | Action |\n|----|-----------|---------|------------|------|--------|\n| 1 | R | F | Misread 'vor einem Jahr' vs 'seit letztem Monat' | Comprehension | Practice time expressions |\n| 7 | R | F | Missed word 'Mischung' (mixture) | Vocabulary | Learn more synonyms |\n| 13 | C | A | Didn't check salary requirement 2500€ | Scanning | Check ALL criteria |\n\n**Pattern recognition = targeted improvement!**\n\n**STRATEGY 2: The 'Week 3 Mastery Checklist'**\n\n**Rate each skill 1-10:**\n\n**Day 1 - Modal Verbs:** ___/10\n- [ ] Can conjugate all 6 modals?\n- [ ] Understand word order?\n- [ ] Recognize modals in texts?\n\n**Day 2 - Writing Teil 2:** ___/10\n- [ ] Know opinion phrases?\n- [ ] Can write 80-word forum post?\n- [ ] Understand semi-formal register?\n\n**Day 3 - Work Vocabulary:** ___/10\n- [ ] Know 150+ work/education words?\n- [ ] Recognize them in Reading texts?\n- [ ] Can use them in speaking/writing?\n\n**Day 4 - Reading Teil 3 & 4:** ___/10\n- [ ] Can scan quickly?\n- [ ] Recognize synonyms/paraphrases?\n- [ ] Finish in time?\n\n**Day 5 - Speaking Teil 3:** ___/10\n- [ ] Know discussion phrases?\n- [ ] Can plan with partner?\n- [ ] Equal participation?\n\n**TOTAL WEEK 3 CONFIDENCE:** ___/50\n\n**Interpretation:**\n- 43-50: WEEK 3 MASTERED!\n- 35-42: GOOD foundation\n- 28-34: OK, needs review\n- <28: URGENT review needed!\n\n**STRATEGY 3: The 'Three Weeks Progress Comparison'**\n\n**Track your growth:**\n\n| Metric | Week 1 | Week 2 | Week 3 | Growth |\n|--------|--------|--------|--------|--------|\n| Grammar topics | 4 cases | Perfekt tense | 6 modal verbs | +100% |\n| Vocabulary | 200 words | 200 words | 200 words | 600 total! |\n| Writing skills | Basic | Teil 1 emails | Teil 2 forum | 2 Teile! |\n| Reading skills | Teil 1, 2 | Review | Teil 3, 4 | All Teile! |\n| Speaking skills | Basic | Teil 2 | Teil 3 | Advanced! |\n| Mock test score | ___/12 | ___/70 | ___/26 | ___% up! |\n\n**You've learned SO MUCH!**\n\n**STRATEGY 4: The 'Strength Celebration'**\n\nDON'T only focus on weaknesses - CELEBRATE strengths!\n\n**My Top 3 Week 3 Achievements:**\n1. _______________________________\n2. _______________________________\n3. _______________________________\n\n**What I'm proud of:**\n_______________________________\n\n**How I'll maintain these strengths:**\n_______________________________\n\nPositivity = motivation = success!\n\n**STRATEGY 5: The 'Weakness Action Plan'**\n\n**My Top 3 Week 3 Challenges:**\n1. _______________________________ \n   → Action: _______________________________\n   → Timeline: _______________________________\n\n2. _______________________________ \n   → Action: _______________________________\n   → Timeline: _______________________________\n\n3. _______________________________ \n   → Action: _______________________________\n   → Timeline: _______________________________\n\n**Specific plan = measurable progress!**\n\n**STRATEGY 6: The 'Week 4 Preview & Preparation'**\n\n**What's coming in Week 4:**\n- Conjunctions & subordinate clauses\n- More complex sentence structure\n- Additional exam strategies\n- Building on Week 1-3 foundation\n\n**How to prepare:**\n- [ ] Review weak areas from Weeks 1-3\n- [ ] Maintain strong areas with light practice\n- [ ] Get enough rest before Week 4\n- [ ] Stay motivated - you're 25% done!\n\n**STRATEGY 7: The 'Time Investment Calculation'**\n\n**Week 3 estimated hours:**\n- Day 1 (Modal verbs): 3-4 hours\n- Day 2 (Writing): 3-4 hours\n- Day 3 (Vocabulary): 3-4 hours\n- Day 4 (Reading): 3-4 hours\n- Day 5 (Speaking): 3-4 hours\n- Day 6 (Consolidation): 2-3 hours\n- Day 7 (Review): 2-3 hours\n\n**Total Week 3:** ~20-25 hours\n**Total Weeks 1-3:** ~60-75 hours\n\n**You've invested SERIOUS time! It's paying off!**\n\n**STRATEGY 8: The 'Real Exam Readiness Check'**\n\n**Where are you NOW vs EXAM READY?**\n\n| Skill | Current | Exam Target | Gap | Weeks Left |\n|-------|---------|-------------|-----|------------|\n| Reading | ___/26 | 15+/25 (60%) | ___ pts | 9 weeks |\n| Writing | - | 42+/70 (60%) | - | 9 weeks |\n| Listening | - | 15+/25 (60%) | - | 9 weeks |\n| Speaking | - | 45+/75 (60%) | - | 9 weeks |\n\n**You have 9 more weeks to close gaps!**\n\n**STRATEGY 9: The 'Spaced Review Calendar'**\n\n**Next 2 weeks review schedule:**\n\n**Week 4:**\n- Day 2: Quick Week 3 review (30 min)\n- Day 5: Modal verb drill (15 min)\n- Day 7: Work vocabulary quiz (15 min)\n\n**Week 5:**\n- Day 3: Week 3 content refresh (30 min)\n- Day 6: Reading Teil 3 practice (20 min)\n\n**Regular light review = long-term retention!**\n\n**STRATEGY 10: The 'Study Method Evaluation'**\n\n**What worked WELL for you in Week 3?**\n□ Flashcards?\n□ Writing practice?\n□ Speaking practice with partner?\n□ Timed mock tests?\n□ Reading model answers?\n□ Watching videos?\n□ Daily practice routine?\n□ Other: _______\n\n**What DIDN'T work well?**\n□ Too much/too little time?\n□ Wrong practice methods?\n□ Lack of focus?\n□ Too many resources?\n□ Other: _______\n\n**Adjust your approach for Week 4!**\n\n**STRATEGY 11: The 'Motivation Maintenance'**\n\n**Check your motivation level:**\n\nWeek 1 motivation: ___/10\nWeek 2 motivation: ___/10\nWeek 3 motivation: ___/10\n\n**If decreasing:**\n- [ ] Remember your WHY (why learn German?)\n- [ ] Celebrate small wins daily\n- [ ] Mix up study methods\n- [ ] Study with friends/partners\n- [ ] Take breaks when needed\n- [ ] Visualize exam success\n\n**Staying motivated = finishing strong!**\n\n**STRATEGY 12: The 'Accountability Commitment'**\n\n**Week 4 Commitments:**\n\nI commit to:\n1. Study ___ hours per day\n2. Complete all Week 4 days\n3. Review Week 3 content ___ times\n4. Practice my weak area (_______) for ___ min daily\n5. Take Week 4 mock test seriously\n\nSignature: _____________ Date: _______\n\n**Public commitment = higher completion!**\n\n---\n\n**WEEK 3 REFLECTION QUESTIONS:**\n\n**1. What was the HARDEST part of Week 3?**\n_______________________________\n\n**2. What was your BIGGEST achievement?**\n_______________________________\n\n**3. What's still CONFUSING?**\n_______________________________\n\n**4. Mock Reading test results:**\nTeil 1: ___/6\nTeil 2: ___/6\nTeil 3: ___/7\nTeil 4: ___/7\nTotal: ___/26\n\n**Main challenges:** _______________________________\n\n**5. Week 4 priorities (Top 3):**\n1. _______________________________\n2. _______________________________\n3. _______________________________\n\n**6. Confidence comparison:**\nWeek 1 end: ___/10\nWeek 2 end: ___/10\nWeek 3 end: ___/10\n\n**7. What study methods worked best?**\n_______________________________\n\n**8. What will you do differently in Week 4?**\n_______________________________\n\n---\n\n**WEEK 4 PREVIEW:**\n\n**🚀 WHAT'S NEXT:**\n\n**Conjunctions & Subordinate Clauses:**\nConnect ideas like a pro! Learn 'weil', 'dass', 'obwohl', 'wenn' - critical for B1 speaking and writing!\n\n**Why it matters:**\n- Speaking Teil 2 & 3: Express complex ideas\n- Writing Teil 2: Connect arguments logically\n- Reading: Understand long, complex sentences\n\n**More Advanced Grammar:**\nBuilding on your foundation (cases, tenses, modals) to create sophisticated sentences!\n\n**More Exam Strategies:**\nListening Teil 1 & 4, more Speaking practice, advanced Writing techniques!\n\n**You're 25% done with the 12-week program!**\n**Only 9 weeks until you're exam-ready!**\n**Keep going - you're doing AMAZING! 💪**\n\n---\n\n**FINAL WEEK 3 MESSAGE:**\n\nCongratulations on completing Week 3! You've now mastered:\n- 6 modal verbs with all conjugations\n- 200+ work and education vocabulary words\n- Forum writing (Writing Teil 2)\n- Advanced reading strategies (Teil 3 & 4)\n- Partner discussion skills (Speaking Teil 3)\n\n**That's HUGE progress!**\n\nYour German is getting stronger every day. The exam is challenging, but with this systematic approach, you're building exactly the skills you need.\n\n**Remember:**\n- Practice regularly (even 15 min daily helps!)\n- Review previous weeks (spaced repetition works!)\n- Don't be afraid to make mistakes (they're learning opportunities!)\n- Celebrate every small win (motivation matters!)\n- Ask for help when stuck (teachers, partners, online forums!)\n\n**Week 4 starts tomorrow - get ready to level up even more!**\n\n**Du schaffst das! (You can do it!) 🇩🇪**"
          },
          subtasks: [
            { description: "EXAM SETUP: Find quiet place, set 65-minute timer, gather all materials. NO phone, NO dictionary, NO interruptions!", completed: false },
            { description: "MOCK TEST: Complete FULL Reading module (Teil 1-4) under strict time conditions. STOP at each Teil time limit! Don't skip ahead!", completed: false },
            { description: "SCORING: Check all answers against answer key. Calculate score for each Teil and total. Be honest - don't change answers after checking!", completed: false },
            { description: "MISTAKE ANALYSIS: For EVERY wrong answer, write: Question number, my answer, correct answer, why I got it wrong, what to review. Create mistake analysis document!", completed: false },
            { description: "IDENTIFY PATTERNS: Review all mistakes. Is there a pattern? Vocabulary problems? Scanning too slowly? Missing keywords? Not understanding questions? Write down your #1 error pattern.", completed: false },
            { description: "WEEK 3 MASTERY CHECKLIST: Complete the 5-skill self-assessment (rate each Day 1-5 skill from 1-10). Calculate total confidence score out of 50.", completed: false },
            { description: "REFLECTION QUESTIONS: Answer ALL 8 reflection questions (hardest part, biggest achievement, still confusing, test results, Week 4 priorities, confidence comparison, study methods, what to change). Write detailed, specific answers!", completed: false },
            { description: "WEEK 4 PREPARATION: Review Week 4 preview. Set 3 specific goals for next week. Create study schedule (how many hours per day? Which days for which topics?). Write commitment statement and sign it!", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official Goethe B1 Reading Module (PDF)", url: "https://www.goethe.de/pro/relaunch/prf/en/B1_Modellsatz_Erwachsene.pdf" },
            { name: "Additional Reading Practice Tests (10+ full tests)", url: "https://deutschtraining.org/lesen-b1/" },
            { name: "Week 3 Review Worksheet (PDF)", url: "https://www.goethe.de/resources" },
            { name: "Reading Answer Sheet Template", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "Progress Tracking Spreadsheet", url: "https://docs.google.com/spreadsheets" },
            { name: "Week 4 Preview & Study Plan", url: "https://www.germanveryeasy.com/b1-grammar" }
          ],
          notes: ""
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
    const initialMode = savedMode !== null ? savedMode === 'true' : 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Apply dark class immediately on load
    if (initialMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return initialMode;
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
    localStorage.setItem('darkMode', String(darkMode));
    // Also update the document element class for proper dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
      <div className="space-y-5 md:space-y-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Welcome! 🚀</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">Track your German B1 learning journey</p>
        </div>

        {/* Exam Overview - Show if available */}
        {examOverview && (
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white p-5 md:p-8 rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="bg-white/20 p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-sm flex-shrink-0">
                <Award className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl md:text-3xl font-bold leading-tight break-words">Goethe-Zertifikat B1 Exam</h3>
                <p className="text-xs md:text-sm opacity-90">Official German Language Certification</p>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white/10 backdrop-blur-md p-4 md:p-5 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 flex-shrink-0" />
                  <p className="text-xs md:text-sm font-medium opacity-90">Total Duration</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold">{examOverview.totalDuration}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 md:p-5 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-green-300 flex-shrink-0" />
                  <p className="text-xs md:text-sm font-medium opacity-90">Vocabulary Target</p>
                </div>
                <p className="text-xl md:text-2xl font-bold">{examOverview.vocabularyTarget?.split('(')[0]}</p>
                <p className="text-xs opacity-75 mt-1">{examOverview.vocabularyTarget?.split('(')[1]?.replace(')', '')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 md:p-5 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-300 flex-shrink-0" />
                  <p className="text-xs md:text-sm font-medium opacity-90">Study Hours</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold">{examOverview.studyHoursRecommended?.split(' ')[0]}</p>
                <p className="text-xs opacity-75 mt-1">recommended total</p>
              </div>
            </div>

            {/* Exam Modules */}
            <div>
              <h4 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                Exam Modules
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {examOverview.modules?.map((module, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all active:scale-[0.98]">
                    <p className="font-bold text-base md:text-lg mb-2 break-words">{module.name.split('(')[0]}</p>
                    <div className="space-y-1 text-xs md:text-sm">
                      <p className="opacity-90 flex items-center gap-2">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{module.duration}</span>
                      </p>
                      <p className="opacity-90 flex items-center gap-2">
                        <Target className="w-3 h-3 flex-shrink-0" />
                        <span>Total: {module.points} points</span>
                      </p>
                      <p className="font-semibold text-yellow-300 flex items-center gap-2">
                        <Zap className="w-3 h-3 flex-shrink-0" />
                        <span>Pass: {module.passing} points ({Math.round((module.passing/module.points)*100)}%)</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 md:mt-6 bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/20">
              <p className="text-xs md:text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                <strong>Important:</strong>
              </p>
              <p className="text-xs md:text-sm opacity-90">
                You must achieve at least <strong>60% in EACH module</strong> individually to pass the exam. 
                The 12-week plan below is designed to help you master all modules systematically.
              </p>
            </div>
          </div>
        )}

        {/* Plan Status Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-5 md:p-6 rounded-xl shadow-xl">
          {isPlanStarted ? (
            <>
              <p className="text-lg md:text-xl font-semibold mb-2 flex items-center gap-2"><Clock className='w-4 h-4 md:w-5 md:h-5'/> Plan Active</p>
              <p className="text-xs md:text-sm opacity-90">Today's Date: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-xs md:text-sm opacity-90">Plan Start Date: {new Date(data.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </>
          ) : (
            <>
              <p className="text-lg md:text-xl font-semibold mb-3">Ready to start learning German?</p>
              <button
                onClick={startPlan}
                className="w-full md:w-auto px-6 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 active:bg-gray-200 transition shadow-lg min-h-[44px] flex items-center justify-center gap-2"
              >
                <Zap className='w-4 h-4'/> Start Plan Today
              </button>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition">
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium mb-2 flex items-center gap-1"><Calendar className="w-3 h-3 md:w-4 md:h-4"/> Total Tasks</p>
            <p className="text-3xl md:text-4xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition">
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium mb-2 flex items-center gap-1"><Award className="w-3 h-3 md:w-4 md:h-4"/> Completed</p>
            <p className="text-3xl md:text-4xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition">
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3 md:w-4 md:h-4"/> Completion</p>
            <p className="text-3xl md:text-4xl font-bold text-orange-600">{stats.percent}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition">
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3 md:w-4 md:h-4"/> Weakest Focus</p>
            <p className="text-xl md:text-2xl font-bold text-red-600 capitalize break-words">{insights.length > 0 ? insights[0].focus : 'N/A'}</p>
          </div>
        </div>

        {/* Next Task & Quote */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">📌 Next Task</h3>
            {nextTask && isPlanStarted ? (
              <div
                onClick={() => { setSelectedDay({ week: nextTask.week, day: nextTask.day.day }); setCurrentView('tasks'); }}
                className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-xl border-l-4 border-blue-500 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/70 active:bg-blue-200 dark:active:bg-blue-900/80 transition min-h-[44px]"
              >
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <strong>Week {nextTask.week}, Day {nextTask.day.day}</strong> | Scheduled: {calculateDate(nextTask.week, nextTask.day.day)}
                </p>
                <p className="font-medium text-base md:text-lg mb-1 break-words">{nextTask.day.task}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${focusColors[nextTask.day.focus]}`}>
                    {focusIcons[nextTask.day.focus]}
                    {nextTask.day.focus}
                </span>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-xl">
                <p className="text-sm md:text-base text-green-700 dark:text-green-300 font-semibold flex items-center gap-2">
                    {isPlanStarted ? <Award className='w-4 h-4 md:w-5 md:h-5'/> : <Clock className='w-4 h-4 md:w-5 md:h-5'/>}
                    {isPlanStarted ? '🎉 All tasks completed! Great job!' : 'Plan not started. Click "Start Plan Today" above.'}
                </p>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">🇩🇪 Daily Motivation</h3>
            <p className="text-base md:text-lg font-semibold mb-1 italic text-gray-800 dark:text-gray-200 break-words">"{dailyQuote.german}"</p>
            <p className="text-sm opacity-70 text-gray-600 dark:text-gray-400 break-words">— {dailyQuote.english}</p>
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

        {/* Header Card - Mobile-First */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 md:p-8 rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl">
          <div className='flex flex-col md:flex-row md:justify-between md:items-start gap-4'>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs md:text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  Week {week} • Day {day}
                </span>
                <span className="text-xs md:text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  Level: {level}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">{task}</h1>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 md:px-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30`}>
                  {focusIcons[focus]}
                  <span className="capitalize">{focus}</span>
                </span>
                {isPlanStarted && (
                  <span className="inline-flex items-center text-xs md:text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-2 md:px-4 rounded-full border border-white/30">
                    📅 {calculateDate(week, day)}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-lg md:rounded-xl border border-white/30 text-center w-full md:w-auto md:min-w-[120px]">
              <p className="text-3xl md:text-4xl font-bold mb-1">{progress}%</p>
              <p className="text-xs md:text-sm opacity-90">Complete</p>
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

          <div className="p-4 md:p-6 lg:p-8 space-y-5 md:space-y-6">
            {/* Definition Section - Mobile-First */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 md:p-7 rounded-xl border-l-4 border-blue-600 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5">
                <div className="bg-blue-600 text-white p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-md flex-shrink-0">
                  <BookOpen className="w-5 h-5 md:w-7 md:h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className='text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-200 mb-1 break-words'>
                    Definition & Overview
                  </h3>
                  <p className="text-xs md:text-sm text-blue-700 dark:text-blue-400 opacity-80">What you'll learn today</p>
                </div>
              </div>
              <div className="prose prose-blue dark:prose-invert max-w-none text-sm md:text-base">
                <FormattedText text={lessonContent?.definition || DayDetailPlaceholder} />
              </div>
            </div>

            {/* Example Section - Mobile-First */}
            <div className='bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-5 md:p-7 rounded-xl border border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transition-shadow'>
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5">
                <div className="bg-gray-700 dark:bg-gray-600 text-white p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-md flex-shrink-0">
                  <FileText className="w-5 h-5 md:w-7 md:h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 break-words'>
                    Rules, Examples & Reference
                  </h3>
                  <p className="text-xs md:text-sm text-gray-700 dark:text-gray-400 opacity-80">Master the fundamentals</p>
                </div>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none text-sm md:text-base">
                <FormattedText text={lessonContent?.example || DayDetailPlaceholder} />
              </div>
            </div>

            {/* Tips Section - Mobile-First */}
            <div className='bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-5 md:p-7 rounded-xl border-l-4 border-yellow-500 shadow-lg hover:shadow-xl transition-shadow'>
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5">
                <div className="bg-yellow-500 text-white p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-md flex-shrink-0">
                  <Target className="w-5 h-5 md:w-7 md:h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className='text-xl md:text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-1 break-words'>
                    Teacher's Tips & Strategies
                  </h3>
                  <p className="text-xs md:text-sm text-yellow-700 dark:text-yellow-400 opacity-80">Expert guidance for success</p>
                </div>
              </div>
              <div className="prose prose-yellow dark:prose-invert max-w-none">
                <FormattedText text={lessonContent?.tips || DayDetailPlaceholder} />
              </div>
            </div>
          </div>
        </div>

        {/* Subtasks Card - Mobile-First with Large Touch Targets */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-6 text-green-700 dark:text-green-300 flex items-center gap-2 md:gap-3">
            <CheckSquare className='w-6 h-6 md:w-7 md:h-7'/> Daily Goals Checklist
          </h2>

          <div className="space-y-3">
            {subtasks.map((subtask, subIndex) => (
              <div 
                key={subIndex} 
                className={`flex items-start p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all active:scale-[0.98] ${
                  subtask.completed 
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600' 
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 active:border-blue-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => toggleSubtask(week, day, subIndex)}
                  className="mt-0.5 w-6 h-6 md:w-7 md:h-7 rounded-md text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 border-2 transition-transform active:scale-95"
                />
                <p className={`text-sm md:text-base flex-1 ml-3 md:ml-4 leading-relaxed ${
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

        {/* Notes and Resources - Mobile-First Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <label className="text-lg md:text-xl font-bold block mb-3 md:mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              📝 My Notes & Reflections
            </label>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={() => updateNotes(week, day, localNotes)}
              className="w-full p-3 md:p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-sm md:text-base bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              rows="8"
              placeholder="Add your notes, reflections, or list sentences that gave you trouble here..."
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <p className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              📎 Additional Resources
            </p>
            <div className="space-y-2 md:space-y-3">
              {resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 px-3 md:px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl text-sm md:text-base font-medium active:from-blue-100 active:to-indigo-100 dark:active:from-blue-900/50 dark:active:to-indigo-900/50 transition-all shadow-sm active:shadow-md border border-blue-200 dark:border-blue-700 group active:scale-[0.98] min-h-[44px]"
                >
                  <span className="flex-1 pr-2 break-words">{r.name}</span>
                  <ExternalLink className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-active:translate-x-1 transition-transform" />
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
      <div className="space-y-5 md:space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">📋 Learning Plan Overview</h2>

        {/* Week Info Card */}
        {week && (
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-4 md:p-5 rounded-xl shadow-lg">
            <h3 className="text-lg md:text-xl font-bold mb-3">Week {week.week} Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {week.targetVocabulary && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-xs md:text-sm opacity-90 mb-1">Target Vocabulary</p>
                  <p className="text-xl md:text-2xl font-bold">{week.targetVocabulary} words</p>
                </div>
              )}
              {week.estimatedHours && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-xs md:text-sm opacity-90 mb-1">Estimated Study Time</p>
                  <p className="text-xl md:text-2xl font-bold">{week.estimatedHours}</p>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                <p className="text-xs md:text-sm opacity-90 mb-1">Days</p>
                <p className="text-xl md:text-2xl font-bold">{week.days.length} tasks</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className='flex-1'>
                <label className="block text-sm font-semibold mb-2">Select Week:</label>
                <select
                value={currentWeek}
                onChange={(e) => { setCurrentWeek(parseInt(e.target.value)); setFocusFilters([]); }}
                className="w-full md:w-64 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 shadow-sm min-h-[44px]"
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
                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 shadow-inner min-h-[44px]"
                />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold mb-3">Filter by Focus:</p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {['grammar', 'vocabulary', 'listening', 'speaking', 'writing'].map(focus => (
                <label key={focus} className="flex items-center space-x-2 cursor-pointer transition hover:scale-[1.02] active:scale-[0.98] min-h-[44px]">
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
                    className="w-5 h-5 md:w-4 md:h-4 rounded-md text-blue-600 focus:ring-blue-500 focus:ring-2 bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                  />
                  <span className={`text-sm md:text-base capitalize font-medium flex items-center gap-1 ${focusFilters.includes(focus) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {focusIcons[focus]}
                    {focus}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
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
                className={`bg-white dark:bg-gray-800 border-2 rounded-xl p-4 md:p-6 shadow-md transition-all cursor-pointer hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] ${
                  day.completed 
                    ? 'border-green-500 bg-gradient-to-br from-green-50/70 to-green-100/70 dark:from-green-900/30 dark:to-green-800/40' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <div className="space-y-3 md:space-y-4">
                  {/* Header Section */}
                  <div className='flex justify-between items-start gap-3 md:gap-4'>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400">Day {day.day}</span>
                        {day.completed && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                            <CheckSquare className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg md:text-xl mb-2 text-gray-900 dark:text-gray-100 leading-tight break-words">
                        {day.task}
                      </h3>
                    </div>
                    {isPlanStarted && (
                      <span className='inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-2 md:px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700 whitespace-nowrap flex-shrink-0'>
                        📅 {calculateDate(currentWeek, day.day)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className='text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2'>
                    {day.lessonContent?.definition || DayDetailPlaceholder}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                      <span>Progress</span>
                      <span>{subtasksCompleted}/{subtasksTotal} subtasks ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-2.5 overflow-hidden">
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
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold px-2.5 md:px-3 py-1.5 rounded-full border ${focusColors[day.focus]}`}>
                      {focusIcons[day.focus]}
                      <span className="capitalize">{day.focus}</span>
                    </span>
                    <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
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
