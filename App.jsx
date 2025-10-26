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
            definition: "Before diving into content, you MUST understand what you're preparing for. The Goethe B1 exam has 4 independent modules. You need **60% in EACH** to pass (not an average!). Today, we master the two most common cases: **Nominative (subject)** and **Accusative (direct object)**. Think: Nominative = WHO does it? Accusative = WHAT receives the action?",
            example: "**EXAM FORMAT BREAKDOWN:**\n\n**LESEN (Reading) - 65 minutes:**\n- Teil 1: Blog/Email (6 True/False questions)\n- Teil 2: 2 Press reports (6 MCQs total)\n- Teil 3: Match 7 statements to 10 ads\n- Teil 4: 7 opinions on a topic\n- Teil 5: Rules/regulations table (4 MCQs)\n\n**CASE SYSTEM - Your Article Decoder:**\n\n| Case | Masc | Fem | Neut | Plural |\n|------|------|-----|------|--------|\n| NOM | **der** | die | das | die |\n| AKK | **den** | die | das | die |\n\n**Key Insight:** Only masculine changes (der→den)!\n\n**Example:** **Der** Lehrer (NOM) sieht **den** Schüler (AKK).\n*The teacher sees the student.*",
            tips: "**EXAM STRATEGY:** Download the official sample exam from Goethe-Institut website TODAY. Print it. This is your roadmap. For cases, create a physical reference card with the article table. Keep it visible during study sessions. The 'der→den' change is tested constantly in writing!"
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
            definition: "The **Dative case** answers 'TO/FOR WHOM?' It's the indirect object - the person receiving something indirectly. Common verbs triggering dative: **geben** (give), **helfen** (help), **gehören** (belong to), **gefallen** (please). Master present tense conjugations for regular AND irregular verbs - exam speaking relies heavily on accurate present tense!",
            example: "**DATIVE ARTICLES:**\n\n| Case | Masc | Fem | Neut | Plural |\n|------|------|-----|------|--------|\n| DAT | **dem** | **der** | **dem** | **den** + n |\n\n**Example:** Ich gebe **dem** Freund (DAT) **das** Buch (AKK).\n*I give the book to the friend.*\n\n**PRESENT TENSE - Regular (kaufen):**\nich kaufe, du kaufst, er/sie/es kauft, wir kaufen, ihr kauft, sie/Sie kaufen\n\n**Irregular VIPs (memorize!):**\n- **sein:** bin, bist, ist, sind, seid, sind\n- **haben:** habe, hast, hat, haben, habt, haben\n- **werden:** werde, wirst, wird, werden, werdet, werden",
            tips: "**Mnemonic:** Dative sounds like 'to-GIVE' - think of giving TO someone. For irregular verbs, focus first on 'du' and 'er/sie/es' forms - these show stem changes (fahren→du fährst, er fährt). Make flashcards for the 20 most common irregular verbs."
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
            definition: "The Reading module is 65 minutes for 30 points. You need 18+ points to pass. **KEY STRATEGY:** Don't read everything word-by-word! Use **scanning** (finding specific info) and **skimming** (getting main idea). Manage your time: ~10-13 minutes per Teil. Always read questions BEFORE texts!",
            example: "**TIME ALLOCATION STRATEGY:**\n- Teil 1 (Blog): 10 min - Read questions → Scan for keywords\n- Teil 2 (Press): 15 min - Skim first, then detail\n- Teil 3 (Ads): 12 min - Match quickly, process of elimination\n- Teil 4 (Opinions): 13 min - Identify FOR/AGAINST positions\n- Teil 5 (Rules): 10 min - Table scanning\n- Transfer answers: 5 min\n\n**QUESTION TYPES:**\n✓ Richtig/Falsch (True/False) - watch for 'nicht erwähnt' traps\n✓ MCQ (a/b/c) - eliminate obvious wrong answers first\n✓ Matching - use process of elimination",
            tips: "**CRITICAL:** In Teil 1 (True/False), if info isn't in text, it's FALSE - even if logically possible! For Teil 3 (matching ads), make quick notes: which ad has 'price', 'location', 'contact'? Cross out used options. In Teil 4, underline opinion indicators: 'Ich finde...', 'Meiner Meinung nach...', 'dagegen' (against)."
          },
          subtasks: [
            { description: "Take Teil 1 from official sample exam - practice reading questions first, then scanning text. Time: 10 minutes.", completed: false },
            { description: "Analyze your mistakes: Which wrong answers were 'not mentioned' vs 'contradicted by text'?", completed: false },
            { description: "Practice Teil 3 (matching): Take one practice set, highlight keywords in each person's needs and in ads.", completed: false },
            { description: "Learn these reading keywords: jedoch (however), außerdem (moreover), deswegen (therefore), trotzdem (nevertheless).", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Goethe B1 Reading Practice", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "DW Reading Exercises B1", url: "https://learngerman.dw.com/en/level-b1" }
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
            definition: "B1 requires ~2,400 words total. We'll learn thematically - it's how your brain naturally stores language. Today's theme: **Personal Information, Family, Relationships**. ALWAYS learn nouns with article + plural! This saves you from guessing during the exam.",
            example: "**FAMILY & RELATIONSHIPS (Must-Know 50):**\n\n**Core Family:**\n- der Bruder, die Brüder (brother/s)\n- die Schwester, die Schwestern (sister/s)\n- der Vater, die Väter (father/s)\n- die Mutter, die Mütter (mother/s)\n- die Eltern (pl.) (parents)\n- das Kind, die Kinder (child/ren)\n- die Tante, -n (aunt)\n- der Onkel, - (uncle)\n- der Cousin/Vetter, -s/-n (male cousin)\n- die Cousine, -n (female cousin)\n\n**Relationships:**\n- der Freund/die Freundin (boyfriend/girlfriend)\n- der Partner/die Partnerin (partner)\n- verheiratet (married)\n- geschieden (divorced)\n- ledig (single)\n- verlobt (engaged)\n\n**Key Verbs:**\n- kennenlernen (to meet/get to know)\n- sich verlieben (to fall in love)\n- heiraten (to marry)\n- sich trennen (to separate)",
            tips: "**VOCABULARY HACK:** Use the 'Goldlist Method' - write words in notebook, wait 2 weeks, rewrite only the ones you forgot. OR use Anki app with spaced repetition. For B1 exam, focus on: 1) Word + article 2) Plural form 3) One example sentence. Don't waste time learning rarely-used meanings!"
          },
          subtasks: [
            { description: "Create Anki flashcards or notebook page for 50 family/relationship words (article + plural).", completed: false },
            { description: "Write 10 sentences describing your family using new vocabulary + dative case (e.g., 'Ich helfe meiner Mutter').", completed: false },
            { description: "Learn 20 adjectives to describe people: nett, freundlich, hilfsbereit, streng, geduldig, sympathisch, etc.", completed: false },
            { description: "Practice speaking: 2-minute monologue about your family (record yourself!).", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Anki Web", url: "https://ankiweb.net" },
            { name: "Goethe B1 Official Wordlist (2,400 words)", url: "https://www.goethe.de" },
            { name: "Quizlet B1 Vocabulary", url: "https://quizlet.com/subject/goethe-b1" }
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
            definition: "Listening is 40 minutes, 30 points total. Need 18+ to pass. **CRUCIAL:** Audio plays ONCE (except Teil 1 & 4 which play twice). You get time to read questions before each Teil. Focus on **main ideas and specific facts**, not every single word. Common trap: trying to understand 100% and missing the answer!",
            example: "**LISTENING MODULE BREAKDOWN:**\n\n**Teil 1 (15 min): 5 short monologues**\n- Each with 2 questions: 1 R/F, 1 MCQ\n- Plays TWICE\n- Contexts: Phone messages, announcements, short talks\n- Points: 10\n\n**Teil 2 (10 min): 1 monologue (lecture/tour guide)**\n- 5 MCQs\n- Plays ONCE\n- Points: 5\n\n**Teil 3 (5 min): 1 conversation**\n- 7 R/F questions\n- Plays ONCE\n- Points: 7\n\n**Teil 4 (10 min): Radio discussion (3 people)**\n- 8 MCQs - identify WHO said WHAT\n- Plays TWICE\n- Points: 8\n\n**SURVIVAL STRATEGY:**\n1. Read questions during prep time\n2. Predict what you might hear\n3. Listen for keywords\n4. Don't panic if you miss something - keep going!",
            tips: "**GOLDEN RULE:** When reading questions, underline question words (Wer? Was? Wann? Wo? Warum?). In Teil 4 (discussion), note who's the moderator vs guests - moderator's questions don't count as their opinion! Learn these listening signals: 'erstens' (firstly), 'außerdem' (besides), 'im Gegenteil' (on the contrary)."
          },
          subtasks: [
            { description: "Download official Goethe B1 listening audio. Do Teil 1 only - focus on understanding main idea, not every word.", completed: false },
            { description: "Listen to 'Slow German' podcast (15 min) - write down main topic + 3 details.", completed: false },
            { description: "Practice: Dictation of 5 simple sentences (play 3x, write exactly what you hear).", completed: false },
            { description: "Learn listening vocabulary: die Durchsage (announcement), die Nachricht (message), der Anruf (call), die Beschwerde (complaint).", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Goethe B1 Listening Audio", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "Slow German Podcast", url: "https://www.slowgerman.com" },
            { name: "DW Learn German Audio", url: "https://learngerman.dw.com" }
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
            definition: "**Perfekt (Present Perfect)** is THE most common past tense in spoken German! Structure: **Subject + haben/sein (conjugated) + ... + Past Participle (END)**. 90% of verbs use 'haben'. Use 'sein' ONLY for: movement verbs (gehen, fahren, fliegen) and state-change verbs (werden, sein, bleiben, sterben). This tense is CRITICAL for Writing Teil 1 and Speaking!",
            example: "**PERFEKT FORMULA:**\n\n**With HABEN (most verbs):**\nIch **habe** gestern Pizza **gegessen**.\n*I ate pizza yesterday.*\n\nSie **hat** den Film **gesehen**.\n*She saw the film.*\n\n**With SEIN (movement/change):**\nWir **sind** nach Berlin **gefahren**.\n*We went to Berlin.*\n\nEr **ist** zu Hause **geblieben**.\n*He stayed at home.*\n\n**PAST PARTICIPLE FORMATION:**\n\n1. **Regular verbs:** ge + stem + t\n   - machen → gemacht\n   - lernen → gelernt\n   - kaufen → gekauft\n\n2. **Irregular verbs:** ge + stem + en (MEMORIZE!)\n   - sehen → gesehen\n   - essen → gegessen\n   - gehen → gegangen\n   - fahren → gefahren\n\n3. **Separable verbs:** prefix + ge + stem + t/en\n   - einkaufen → eingekauft\n   - aufstehen → aufgestanden\n\n4. **Inseparable verbs:** NO 'ge-'\n   - besuchen → besucht\n   - verstehen → verstanden\n   - erzählen → erzählt",
            tips: "**MEMORIZATION TRICK:** Learn 'sein' verbs with the mnemonic **'BEGAD-SWIM'**: **B**leiben, **E**rscheinen, **G**ehen, **A**nkommen, **D**isappear + **S**terben, **W**erden, **I**st, **M**ove verbs. All others = haben! Make a dedicated flashcard deck for irregular past participles - these are tested HEAVILY in writing."
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
            title: "Thematic Block 2: Talking About Your Day",
            definition: "Essential for Speaking Teil 2 (presentation) and Writing Teil 1 (informal email about past events). Learn verbs describing daily actions + time expressions. **Critical:** Learn separable verbs (aufstehen, einschlafen, fernsehen) - these are exam favorites!",
            example: "**DAILY ROUTINE VERBS (50 must-know):**\n\n**Morning:**\n- aufwachen (to wake up)\n- aufstehen* (to get up)\n- sich duschen (to shower)\n- sich anziehen* (to get dressed)\n- frühstücken (to have breakfast)\n\n**Day:**\n- zur Arbeit/Schule gehen (to go to work/school)\n- arbeiten (to work)\n- eine Pause machen (to take a break)\n- zu Mittag essen (to have lunch)\n\n**Evening:**\n- nach Hause kommen* (to come home)\n- kochen (to cook)\n- fernsehen* (to watch TV)\n- sich ausruhen (to rest)\n- zu Abend essen (to have dinner)\n\n**Night:**\n- ins Bett gehen (to go to bed)\n- einschlafen* (to fall asleep)\n\n* = Separable verb!\n\n**TIME EXPRESSIONS (CRITICAL!):**\n- gestern (yesterday)\n- vorgestern (day before yesterday)\n- letzte Woche (last week)\n- letztes Wochenende (last weekend)\n- vor zwei Tagen (two days ago)\n- am Montag (on Monday)\n- um 8 Uhr (at 8 o'clock)\n- am Morgen/Mittag/Abend (in the morning/noon/evening)\n- in der Nacht (at night)\n- zuerst (first), dann (then), danach (after that), schließlich (finally)",
            tips: "**EXAM CONNECTION:** Writing Teil 1 often asks about weekend/vacation activities. Having these verbs + time expressions ready = faster writing! Practice saying your typical day in past tense: 'Gestern bin ich um 7 Uhr aufgestanden. Dann habe ich gefrühstückt...' Record it!"
          },
          subtasks: [
            { description: "Learn 40 daily routine verbs (with Perfekt forms) - create flashcards with example sentences.", completed: false },
            { description: "Write your ideal weekend day in Perfekt tense (150 words) - use 10+ time expressions.", completed: false },
            { description: "Learn frequency adverbs: immer, oft, manchmal, selten, nie + practice placement in sentences.", completed: false },
            { description: "Speaking practice: Record 2-min description of 'yesterday' in past tense.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Daily Routine Vocabulary List", url: "https://www.germanveryeasy.com/daily-routine" },
            { name: "Separable Verbs Guide", url: "https://www.germanveryeasy.com/separable-verbs" }
          ],
          notes: ""
        },
        {
          day: 3,
          task: "Writing Module: Teil 1 - Informal Email Strategy",
          focus: "writing",
          level: "B1",
          lessonContent: {
            title: "Schreiben Teil 1: The Friendly Email Formula",
            definition: "Writing Teil 1 (30 min, 45 points) = informal email to a friend. You get 4 'Leitpunkte' (bullet points) to address. Must write ~80 words. **CRUCIAL:** Address ALL 4 points clearly, use correct informal format, and maintain consistent past/present tense. Missing even 1 point = automatic point deduction!",
            example: "**TYPICAL TASK:**\n'Your friend Maria asked about your vacation. Write her an email:'\n1. Wo warst du? (Where were you?)\n2. Was hast du gemacht? (What did you do?)\n3. Wie war das Wetter? (How was the weather?)\n4. Lade sie zu dir ein. (Invite her to your place)\n\n**WINNING EMAIL STRUCTURE:**\n\n**Opening:**\nLiebe/Lieber [Name],\nvielen Dank für deine Nachricht! / Schön, wieder von dir zu hören!\n\n**Body (Address ALL 4 points - 1-2 sentences each):**\n[Point 1] Ich war letzten Monat in Italien.\n[Point 2] Ich habe viele Museen besucht und italienisch gegessen.\n[Point 3] Das Wetter war super - jeden Tag Sonnenschein!\n[Point 4] Hast du Lust, mich nächste Woche zu besuchen?\n\n**Closing:**\nLiebe Grüße / Bis bald\n[Your name]\n\n**SCORING CRITERIA:**\n- Content completion: 12 pts (3 pts per point)\n- Communication effectiveness: 12 pts\n- Formal accuracy (grammar/spelling): 12 pts\n- Vocabulary range: 9 pts",
            tips: "**GOLDEN RULES:** 1) Number your points (1-4) in your draft to ensure you answered everything. 2) Use Perfekt tense for past events, Präsens for invitations/suggestions. 3) Keep it simple! Don't try complex sentences - clarity > complexity. 4) Learn standard phrases: 'Vielen Dank für...' 'Es tut mir leid, dass...' 'Ich freue mich auf...' 5) ALWAYS write 'du/dein/dir' lowercase (informal!)."
          },
          subtasks: [
            { description: "Memorize informal email opening/closing phrases (10 variants for variety).", completed: false },
            { description: "Practice: Write 3 emails responding to different prompts (vacation, party invitation, apology). Time: 20 min each.", completed: false },
            { description: "Learn 20 'connector words' for better flow: zuerst, dann, außerdem, leider, zum Glück, trotzdem.", completed: false },
            { description: "Self-check template: Create a checklist (4 points covered? Correct salutation? Perfekt tense correct?).", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Goethe B1 Writing Samples", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "German Email Phrases", url: "https://www.germanveryeasy.com/email-writing" }
          ],
          notes: ""
        },
        {
          day: 4,
          task: "Listening Teil 2 + 3 Practice (Monologue & Conversation)",
          focus: "listening",
          level: "B1",
          lessonContent: {
            title: "Advanced Listening: Following Longer Passages",
            definition: "Teil 2 (monologue) and Teil 3 (conversation) play ONCE only! This demands intense concentration. Teil 2 = lecture/tour guide (formal, lots of facts). Teil 3 = everyday conversation (informal, faster pace). Strategy: Predict content from questions, focus on question words (Wann? Wo? Wie viele?).",
            example: "**TEIL 2 (MONOLOGUE) - 5 MCQs:**\nContext: Museum tour, company presentation, travel guide\nLength: ~3-4 minutes\nTrap: Too much detail - you'll hear numbers, dates, names - write them down immediately!\n\n**Example Question:**\nWann wurde das Museum eröffnet?\na) 1985  b) 1995  c) 2005\n\n**What to listen for:** 'Das Museum wurde 1995 eröffnet...' (passive voice!)\n\n**TEIL 3 (CONVERSATION) - 7 R/F:**\nContext: 2 people discussing plans, problems, opinions\nLength: ~3-4 minutes\nTrap: Speaker A says something, Speaker B disagrees - whose opinion does the question ask about?\n\n**Example Statement:**\nDie Frau findet das Restaurant zu teuer. R/F?\n\nListen for: 'Also, ICH finde das Restaurant ein bisschen teuer...' (Frau's opinion)",
            tips: "**SURVIVAL TACTICS:** 1) In Teil 2, questions usually follow chronological order of the audio. 2) For numbers/dates, write them down AS YOU HEAR THEM (you won't remember!). 3) In Teil 3, note WHO says WHAT - use 'M' (Mann) and 'F' (Frau) symbols. 4) Learn these signal phrases: 'Das bedeutet...' (that means), 'Mit anderen Worten...' (in other words), 'Das Problem ist...' (the problem is)."
          },
          subtasks: [
            { description: "Complete official sample Teil 2 (monologue) - focus on noting dates, numbers, names while listening.", completed: false },
            { description: "Complete official sample Teil 3 (conversation) - mark M/F next to each R/F statement to track who said what.", completed: false },
            { description: "Listen to 'DW Langsam gesprochene Nachrichten' (slow news) - summarize in 3 sentences.", completed: false },
            { description: "Practice: Listen to any German podcast for 5 minutes - write down all numbers, dates, names you hear.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official B1 Listening", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" },
            { name: "DW Slow News", url: "https://www.dw.com/de/deutsch-lernen/nachrichten/s-8030" }
          ],
          notes: ""
        },
        {
          day: 5,
          task: "Speaking Teil 2: Presentation on Everyday Topic",
          focus: "speaking",
          level: "B1",
          lessonContent: {
            title: "Sprechen Teil 2: Your 3-Minute Presentation",
            definition: "Teil 2 (3-4 min, 28 points): Short presentation on an everyday topic (your choice from 2 topics). Structure: Introduction → Personal Experience → Pros/Cons → Situation in Your Country. You get 15 minutes prep time. Use notes, but don't READ them! This tests your ability to speak coherently for 3 minutes.",
            example: "**TYPICAL TOPIC:**\n'Online Shopping - Pro and Contra'\n\n**WINNING STRUCTURE (4 parts):**\n\n**1. Introduction (30 sec):**\n'Mein Thema ist Online Shopping. Das ist heute sehr populär.'\n\n**2. Personal Experience (1 min):**\n'Ich kaufe oft online ein. Letzte Woche habe ich ein Buch gekauft. Es war sehr praktisch, weil ich nicht in die Stadt fahren musste.'\n\n**3. Pro and Contra (1 min):**\n'Ein Vorteil ist die Zeit - man spart viel Zeit. Ein Nachteil ist, dass man die Produkte nicht sehen kann vor dem Kauf.'\n\n**4. Situation in Your Country (30 sec):**\n'In meinem Land kaufen besonders junge Leute online. Es gibt viele Webshops wie Amazon.'\n\n**USEFUL PHRASES:**\n- Mein Thema ist...\n- Ein Vorteil/Nachteil ist...\n- Aus meiner Erfahrung...\n- In meinem Land / Bei uns...\n- Ich bin der Meinung, dass...\n- Zusammenfassend kann man sagen...",
            tips: "**PREPARATION HACK:** Prepare 5 'universal topics' in advance: 1) Online Shopping 2) Social Media 3) Healthy Eating 4) Sports 5) Learning Languages. For each, write a 'skeleton' with personal story + 2 pros + 2 cons. Memorize this framework! During prep time, just adapt your skeleton to the specific exam topic. Practice speaking your 5 topics until you can do each without notes."
          },
          subtasks: [
            { description: "Choose 3 common B1 topics (Social Media, Sports, Travel). Create 4-part outlines for each.", completed: false },
            { description: "Record yourself presenting 'Online Shopping' topic - time it (must be 2.5-3.5 minutes).", completed: false },
            { description: "Learn 15 opinion/argumentation phrases: 'Meiner Meinung nach...', 'Ich bin der Ansicht...', 'Einerseits... andererseits...'", completed: false },
            { description: "Practice in front of mirror - work on eye contact and reducing 'ähm' filler sounds.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "B1 Speaking Topics List", url: "https://www.goethe.de" },
            { name: "German Presentation Phrases", url: "https://www.germanveryeasy.com/presentation" }
          ],
          notes: ""
        },
        {
          day: 6,
          task: "Genitive Case + Prepositions (Wechselpräpositionen)",
          focus: "grammar",
          level: "B1",
          lessonContent: {
            title: "Completing the Case System: Genitive + Two-Way Prepositions",
            definition: "**Genitive case** shows possession (like English 's). Less common in spoken German, but appears in reading texts! **Two-way prepositions (Wechselpräpositionen)** can take EITHER Accusative OR Dative - depends on whether there's movement (Akk) or location (Dat). This is frequently tested!",
            example: "**GENITIVE ARTICLES:**\n\n| Case | Masc | Fem | Neut | Plural |\n|------|------|-----|------|--------|\n| GEN | des | der | des | der |\n\nAdd '-s' or '-es' to masculine/neuter nouns!\n\n**Example:**\nDas Auto **des Mannes** (the man's car)\nDie Tasche **der Frau** (the woman's bag)\n\n**Common Genitive Prepositions:**\n- während (during)\n- wegen (because of)\n- trotz (despite)\n- statt/anstatt (instead of)\n\n**TWO-WAY PREPOSITIONS (The Magic 9):**\nan, auf, hinter, in, neben, über, unter, vor, zwischen\n\n**RULE:**\n- **Movement (Wohin?)** → AKKUSATIV\n  'Ich gehe **in den** Park.' (I'm going INTO the park)\n  \n- **Location (Wo?)** → DATIV\n  'Ich bin **im** (in dem) Park.' (I am IN the park)\n\n**MEMORY TRICK:**\nMovement = Accusative (both have 'a'!)\nLocation = Dative (Dative stays put!)",
            tips: "**EXAM TIP:** Genitive mostly appears in Reading texts with formal language. For writing/speaking, you can often avoid it by using 'von + Dative': 'die Tasche von der Frau' instead of 'die Tasche der Frau'. TWO-WAY PREPOSITIONS: Ask yourself 'Is someone/something moving TO a place?' = Akk. 'Is someone/something already AT a place?' = Dat. Practice with opposites: 'Ich lege das Buch auf den Tisch' (Akk - I'm placing it) vs 'Das Buch liegt auf dem Tisch' (Dat - it's lying there)."
          },
          subtasks: [
            { description: "Learn genitive articles + 4 genitive prepositions (während, wegen, trotz, statt) with example sentences.", completed: false },
            { description: "Memorize the 9 two-way prepositions - create flashcards with Akk and Dat examples for each.", completed: false },
            { description: "Practice drill: 20 sentences choosing correct case after two-way prepositions (focus on in, auf, an).", completed: false },
            { description: "Reading comprehension: Find 10 genitive constructions in a B1 text, identify the possessor.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "German Cases Complete Guide", url: "https://www.germanveryeasy.com/cases" },
            { name: "Two-Way Prepositions Exercises", url: "https://www.schubert-verlag.de" }
          ],
          notes: ""
        },
        {
          day: 7,
          task: "Week 2 Review + Mock Writing Teil 1",
          focus: "review",
          level: "B1",
          lessonContent: {
            title: "Week 2 Consolidation: Testing Your Writing Skills",
            definition: "Time to test your Perfekt tense and informal email writing under exam conditions! Take a full Writing Teil 1 (30 minutes). Self-assess using official criteria. This week covered critical grammar (Perfekt) and your first full writing practice - these are building blocks for everything else.",
            example: "**WEEK 2 MASTERY CHECK:**\n\n✅ **Grammar:**\n- Can you form Perfekt with haben? (10 verbs)\n- Can you form Perfekt with sein? (5 movement verbs)\n- Do you know 20 irregular past participles?\n- Genitive case articles memorized?\n- Two-way prepositions: Can you distinguish Akk vs Dat?\n\n✅ **Writing:**\n- Can you write informal email in under 30 minutes?\n- Do you address all 4 Leitpunkte?\n- Correct opening/closing?\n- Consistent past/present tense?\n\n✅ **Vocabulary:**\n- 200+ new words learned this week?\n- Daily routine verbs + time expressions memorized?\n\n✅ **Speaking:**\n- Can you present a topic for 3 minutes?\n- Structured: Intro → Experience → Pro/Con → Your country?\n\n**TODAY'S MOCK TASK:**\nWriting Teil 1 (30 min):\n'Your friend asks about your last weekend. Write an email about:'\n1. Where you were\n2. What you did\n3. Who was with you  \n4. Invite them to do something together next weekend",
            tips: "**SELF-ASSESSMENT RUBRIC:** Content (12 pts): Did I address all 4 points with sufficient detail? Communication (12 pts): Is it clear and natural? Grammar (12 pts): Count major errors (wrong case, wrong verb form, missing verb). More than 5 major errors = below 60%. Vocabulary (9 pts): Did I use varied vocabulary or repeat same words? Be honest with yourself - this shows what needs work in Week 3!"
          },
          subtasks: [
            { description: "TIMED WRITING TEST: Complete one Writing Teil 1 task in exactly 30 minutes. No dictionary!", completed: false },
            { description: "Self-assess using official criteria - score each category /12, /12, /12, /9. Total /45. Need 27+ to pass.", completed: false },
            { description: "Identify your 3 biggest grammar mistakes from the writing - make flashcards for these specific rules.", completed: false },
            { description: "Vocabulary review: Test yourself on all Week 1 + 2 words (400 total). Make a 'needs review' list.", completed: false },
            { description: "Grammar drill: 20 mixed sentences practicing all 4 cases + two-way prepositions + Perfekt tense.", completed: false }
          ],
          completed: false,
          resources: [
            { name: "Official B1 Writing Assessment", url: "https://www.goethe.de" },
            { name: "Self-Assessment Criteria Sheet", url: "https://www.goethe.de/en/spr/prf/ueb/pb1.html" }
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
