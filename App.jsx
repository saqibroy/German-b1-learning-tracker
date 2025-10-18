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

const App = () => {
  // --- INITIAL DATA STRUCTURE ---
  const initialDataStructure = {
    startDate: null, // Tracks the start date of the plan (YYYY-MM-DD string)
    weeks: [
      {
        week: 1,
        goal: "Cases & Basic Sentence Structure",
        days: [
          {
            day: 1,
            task: "Mastering Nominative & Accusative Cases",
            focus: "grammar",
            level: "B1",
            lessonContent: {
              title: "The Case Detectives: Who is the hero?",
              definition: "Hallo! Today we start with the two most essential German cases: **Nominative (Nominativ)** and **Accusative (Akkusativ)**. Think of it like this: the **Nominative** is the *hero* of the sentence—the one doing the action (the **Subject**). The **Accusative** is the *receiver* of the action (the **Direct Object**). The great news? In B1, the main change you worry about is only for the masculine article!",
              example: "**Your Article Cheat Sheet (Der, Die, Das):**\n\n| Article | Nominative (Hero) | Accusative (Receiver) |\n|---|---|---|\n| Masculine | **der** | **den** |\n| Feminine | **die** | **die** |\n| Neuter | **das** | **das** |\n| Plural | **die** | **die** |\n\n**Example Sentence:**\n**Der** Hund (Nom.) sieht **den** Mann (Akk.).\n*(The dog sees the man.)*\n*The dog* is the hero (Nom.) doing the seeing. *The man* is the receiver (Akk.).",
              tips: "To solidify your understanding, always ask: 'Who/What is doing the action?' (Nom.) and 'Who/What is receiving the action?' (Akk.). This helps you choose the correct article automatically. Don't worry too much about the other cases yet!"
            },
            subtasks: [
                { description: "Review and memorize the definite articles for Nominative and Accusative (especially the **der/den** change).", completed: false },
                { description: "Identify the subject (Nominative) in 10 example sentences (focus on 'der' vs 'den').", completed: false },
                { description: "Write 5 simple sentences using an Accusative object, like 'Ich sehe den Baum'.", completed: false },
                { description: "Practice reading the articles out loud: 'Der, den, die, die, das, das, die, die'." , completed: false}
            ],
            completed: false, // Calculated status
            resources: [
              { name: "Goethe Grammar: Cases", url: "https://www.goethe.de" },
              { name: "Online Case Trainer", url: "https://deutschlern.net" }
            ],
            notes: ""
          },
          {
            day: 2,
            task: "Core Daily Life Vocabulary (50 words)",
            focus: "vocabulary",
            level: "B1",
            lessonContent: {
              title: "The Daily 50: Nouns, Verbs, and Articles",
              definition: "Your goal today is to build up the words you need for talking about your daily life: family, house, work, and hobbies. We call this **active recall**—it's not enough to just recognize the words; you must be able to use them in a sentence!",
              example: "**Target Vocabulary: Always learn with the Article!**\n\n| German (Singular) | Plural | English |\n|---|---|---|\n| **der** Tisch | die Tische | the table |\n| **das** Buch | die Bücher | the book |\n| **die** Küche | die Küchen | the kitchen |\n| **der** Computer | die Computer | the computer |\n| **die** Lampe | die Lampen | the lamp |\n\n**Important Verbs:**\n1. arbeiten (to work)\n2. kochen (to cook)\n3. lesen (to read)\n4. schlafen (to sleep)\n5. gehen (to go)\n\n**Example:** Ich **lese** (verb) **das** Buch (Akk.).",
              tips: "Listen closely to native speakers say these words! Also, remember the **Golden Rule of German Nouns**: *Never* learn a noun without its definite article (der, die, das) and its plural form. This simple habit saves you massive headaches later!"
            },
            subtasks: [
                { description: "Learn the 10 target nouns (with articles and plural forms).", completed: false },
                { description: "Learn the 5 target verbs and their meanings.", completed: false },
                { description: "Create 10 short sentences using the new vocabulary (try to include both Nominative and Accusative!).", completed: false },
                { description: "Practice spelling five of the new words in German out loud.", completed: false }
            ],
            completed: false,
            resources: [
              { name: "Anki Web Flashcards", url: "https://www.ankiweb.net" },
              { name: "Quizlet: B1 Daily Vocab", url: "https://quizlet.com" }
            ],
            notes: ""
          },
          {
            day: 3,
            task: "Active Listening: Identifying Key Information",
            focus: "listening",
            level: "B1",
            lessonContent: {
              title: "Listening Like a Native: Focusing on the Core Message",
              definition: "We are moving from passive hearing to **active listening**. This means you stop focusing on *every* word, and instead focus on grabbing the specific key facts: **Who**, **What**, **When**, and **Where**. This builds huge confidence because you realize you don't need 100% comprehension to understand the message.",
              example: "**What to Listen For:**\n1. **Nominative/Subject:** Listen for who is starting the conversation or doing the main action.\n2. **Verbs:** The main action word (e.g., 'kaufen', 'fahren', 'sagen').\n3. **New Vocab:** Actively search for the vocabulary you learned on Day 2.\n\nE.g., if you hear 'Der Mann kauft den Kaffee,' you must understand *who* is buying (*Der Mann*) and *what* is being bought (*den Kaffee*).",
              tips: "Listen twice: first time with your eyes closed for the general atmosphere and main idea. Second time, follow the transcript and specifically underline the nouns and verbs you learned. Try to mentally identify the case (Nom. or Akk.) of each underlined noun."
            },
            subtasks: [
                { description: "Listen to a 10-minute B1 podcast. Summarize the main idea in 3 English sentences.", completed: false },
                { description: "Transcribe 5 sentences verbatim from the podcast.", completed: false },
                { description: "Identify 5 nouns from the listening task and determine their article and case (Nom./Akk.).", completed: false }
            ],
            completed: false,
            resources: [
              { name: "DW Learn German Podcasts", url: "https://www.dw.com" },
              { name: "Slow German for Beginners", url: "https://www.slowgerman.com" }
            ],
            notes: ""
          },
          {
            day: 4,
            task: "Speaking Practice: Self-Introduction Fluency",
            focus: "speaking",
            level: "B1",
            lessonContent: {
              title: "My German Story: Speaking with Flow",
              definition: "Today's task is all about flow! Your goal is to deliver a smooth, **2-minute self-introduction** covering name, origin, job, family, and hobbies. Forget about absolute grammatical perfection for 2 minutes—focus on keeping the conversation moving without long, awkward pauses. This is how you build fluency and confidence.",
              example: "**Introduction Structure (Try to use Accusative for family/pets!):**\n1. **Name/Age:** Ich bin Max und ich bin 25 Jahre alt.\n2. **Origin/Living:** Ich komme aus Spanien, aber ich lebe in Berlin.\n3. **Job/Study:** Ich arbeite als Lehrer/Ich studiere Informatik.\n4. **Family/Pets:** Ich habe einen Bruder (Akk.) und eine Katze (Akk.).\n5. **Hobbies:** Ich lese gern Bücher (Akk.) und koche oft.\n\n**Connecting Words:** Use *und* (and), *aber* (but), and *weil* (because) to link your ideas.",
              tips: "Recording yourself is your best friend here! Listen back and count your pauses. Also, prepare natural filler phrases like 'Ähm...' or 'Also,...' to sound more natural when you are thinking. This is what natives do!"
            },
            subtasks: [
                { description: "Write and memorize a 2-minute script covering the 5 topics above.", completed: false },
                { description: "Practice delivery 3 times, focusing on speed and flow (don't stop if you make a mistake!).", completed: false },
                { description: "Record your final 2-minute introduction and listen back only for your most common mistakes (like article/case errors).", completed: false }
            ],
            completed: false,
            resources: [
              { name: "Tandem Language Exchange", url: "https://www.tandem.net" },
              { name: "Preply German Tutors", url: "https://preply.com" }
            ],
            notes: ""
          },
          {
            day: 5,
            task: "Writing: Consistent Tense Usage",
            focus: "writing",
            level: "B1",
            lessonContent: {
              title: "My Week in German: The Perfect Tense",
              definition: "Today, you'll write a short, 150-word journal entry about your **past week**. The key goal is **tense consistency**—ensure all past actions are correctly placed in the **Perfekt** tense (e.g., 'Ich habe gearbeitet'). *Perfekt* is the most common past tense used in spoken German, so it's vital to master it early!",
              example: "**Perfekt Tense Structure (The two main 'helpers'):**\n\n1. **Using HABEN (Most Verbs):** Subject + **haben** (conjugated) + Object + **Past Participle** (at the end)\n*Example:* Ich **habe** gestern einen Film **gesehen**.\n\n2. **Using SEIN (Movement/Change of State):** Subject + **sein** (conjugated) + Object + **Past Participle** (at the end)\n*Example:* Ich **bin** nach Hause **gegangen**.\n\n**Key Perfekt Forms:**\n* Gesehen (to see), Gegessen (to eat), Gekauft (to buy), Gekocht (to cook)",
              tips: "Start by writing a few simple sentences, identifying which ones need *haben* (most verbs) and which need *sein* (verbs of movement like *gehen* or *fahren*). Always put the past participle (`gesehen`, `gegangen`) at the **very end** of the sentence. "
            },
            subtasks: [
                { description: "Brainstorm 4 events from the past week and list the German vocabulary needed.", completed: false },
                { description: "Draft the 150-word entry, double-checking present tense endings and Perfekt forms (haben/sein).", completed: false },
                { description: "Review the draft and correct any Nominative/Accusative errors on articles and pronouns.", completed: false }
            ],
            completed: false,
            resources: [
              { name: "Journaly German Writing", url: "https://www.journaly.com" },
              { name: "Lang-8 Language Exchange", url: "https://lang-8.com" }
            ],
            notes: ""
          }
        ]
      },
      {
        week: 2,
        goal: "Present Tense & Restaurant Vocabulary",
        days: [
          {
            day: 1,
            task: "Present Tense Conjugation (Regular & Irregular)",
            focus: "grammar",
            level: "B1",
            lessonContent: {
              title: "The Present is Now! Regular vs. Irregular Verbs",
              definition: "Welcome back! Today we conquer the **Present Tense (Präsens)**. This is how you tell people what you do, what you are doing, or what is generally true. Most verbs are **regular** (e.g., *kaufen*, *machen*) and follow a perfect, reliable pattern. The main trick is memorizing the 'VIP verbs'—**irregular verbs** like *sein*, *haben*, and *werden*—because their stems change!",
              example: "**Regular Verb Endings (KAUFEN - to buy):**\n\n| Person | Ending | Example |\n|---|---|---|\n| Ich | **-e** | ich kauf**e** |\n| Du | **-st** | du kauf**st** |\n| Er/Sie/Es | **-t** | er kauf**t** |\n| Wir | **-en** | wir kauf**en** |\n| Ihr | **-t** | ihr kauf**t** |\n| Sie/sie | **-en** | sie kauf**en** |\n\n**Irregular VIPs (must memorize!):**\n*Sein* (to be): ich **bin**, du **bist**, er **ist**...\n*Haben* (to have): ich **habe**, du **hast**, er **hat**...",
              tips: "Create flashcards *specifically* for the **du** and **er/sie/es** forms of irregular verbs. Why? Because that's where the stem usually changes! (e.g., *fahren* -> *du fährst*). Once you master those two forms, the rest is easy."
            },
            subtasks: [
                { description: "Drill 5 regular verbs (e.g., machen, spielen) through all 6 persons.", completed: false },
                { description: "Memorize the full conjugation of the VIP verbs: *sein* and *haben*.", completed: false },
                { description: "Write 10 sentences using different subjects and verbs in the present tense, making sure your conjugation matches the subject.", completed: false }
            ],
            completed: false,
            resources: [
              { name: "Verb Conjugator", url: "https://www.verbformen.com" },
              { name: "DeutschLern Verbs", url: "https://deutschlern.net" }
            ],
            notes: ""
          },
          {
            day: 2,
            task: "Restaurant Vocabulary & Phrases",
            focus: "vocabulary",
            level: "B1",
            lessonContent: {
              title: "Im Restaurant: Ordering and Paying Like a Local",
              definition: "German dining is formal, so we need polite, full phrases! Today, we are focusing on the words you need to successfully order food, ask for things, and pay the bill. The key difference from English is using the polite conditional forms (*hätte*, *könnte*) to sound respectful.",
              example: "**Target Phrases & Words for Politeness:**\n\n| English | German (Polite) |\n|---|---|\n| I would like... | **Ich hätte gern...** (Literally: I would have gladly...) |\n| Could you...? | **Könnten Sie...?** (Literally: Could you?) |\n| The bill, please. | **Die Rechnung, bitte.** |\n| We pay separately. | **Wir zahlen getrennt.** |\n| We pay together. | **Wir zahlen zusammen.** |\n\n**Key Nouns & Verbs:**\n1. Die Speisekarte (the menu) - *Feminine*\n2. Das Gericht (the dish) - *Neuter*\n3. Der Kellner (the waiter) - *Masculine*\n4. Bestellen (to order)\n5. Lecker (tasty/delicious)",
              tips: "Practice full phrases, not just single words. Role-play ordering aloud in front of a mirror, using 'Ich hätte gern' for everything you ask for. Remember to use the Accusative case for the food you order: 'Ich hätte gern **den** Salat (Akk.)' or 'Ich hätte gern **das** Wasser (Akk.).'"
            },
            subtasks: [
                { description: "Learn the 10 target phrases/words listed, focusing on 'Ich hätte gern' and 'Könnten Sie'.", completed: false },
                { description: "Practice ordering a drink, an appetizer, and a main course using correct Accusative articles.", completed: false },
                { description: "Practice the 3 different ways to ask for/handle the bill (Rechnung, zahlen, getrennt/zusammen).", completed: false }
            ],
            completed: false,
            resources: [
              { name: "Quizlet: Restaurant Dialogue", url: "https://quizlet.com" },
              { name: "Anki Flashcards", url: "https://www.ankiweb.net" }
            ],
            notes: ""
          },
          {
            day: 3,
            task: "Listening: Ordering and Interaction",
            focus: "listening",
            level: "B1",
            lessonContent: {
              title: "Eavesdropping: Following a Restaurant Conversation",
              definition: "Today's task is to listen to a conversation between a waiter and a customer. Your goal is to be able to follow the flow: what food is ordered, any requests made, and the final payment. This tests your ability to process the rapid-fire exchange of polite phrases and specific vocabulary.",
              example: "Listen for the modal verbs *möchten* (would like) and *können* (can). These are the signal words for requests and desires. E.g., 'Was **möchten** Sie trinken?' or 'Ich **kann** das leider nicht essen.' Pay extra attention to numbers when they mention prices or portion sizes.",
              tips: "Try a **prediction exercise**: Before listening, list 5 things a customer might say and 5 things a waiter might say. Then, listen and see how many of your predictions match the actual dialogue. This forces your brain to anticipate the German structure."
            },
            subtasks: [
                { description: "Listen to a 5-minute restaurant dialogue and list all food items and prices mentioned.", completed: false },
                { description: "Identify and list 3 polite request phrases used by the customer.", completed: false },
                { description: "Practice shadowing (repeating the audio immediately after it plays) the waiter's lines for 3 minutes.", completed: false }
            ],
            completed: false,
            resources: [
              { name: "YouTube German Dialogues", url: "https://www.youtube.com" },
              { name: "Deutsche Welle B1", url: "https://www.dw.com" }
            ],
            notes: ""
          },
          {
            day: 4,
            task: "Role-Play: Handling a Restaurant Situation",
            focus: "speaking",
            level: "B1",
            lessonContent: {
              title: "The Customer is Always Right (or at least polite!)",
              definition: "It's time to put your vocabulary and grammar to work! We're simulating a full restaurant interaction: ordering, confirming the order, asking for something missing (a napkin or salt), and paying. Focus on maintaining a polite, friendly tone and correctly using the *haben* and *können* conditional forms (*hätten* and *könnten*).",
              example: "**Key Scenarios to Practice:**\n1. **Ordering:** 'Ich hätte gerne das Rindersteak (Akk.) und ein Bier (Akk.).'\n2. **Minor Complaint:** 'Entschuldigung, mir fehlt das Besteck. Könnten Sie es bitte bringen?'\n3. **Asking for Bill:** 'Könnten Sie uns bitte die Rechnung bringen?'\n4. **Payment:** 'Wir möchten bitte zusammen/getrennt zahlen.'",
              tips: "Find a language partner or use a voice recorder. Focus specifically on your pronunciation of the 'ch' sound in words like *Ich* and *Küche*—it's a common stumbling block! Try to maintain eye contact (with the mirror or the camera) to build confidence."
            },
            subtasks: [
                { description: "Practice ordering a three-course meal using 'Ich hätte gern...'.", completed: false },
                { description: "Practice handling a minor issue (e.g., asking for the salt) using 'Könnten Sie...'.", completed: false },
                { description: "Simulate asking for and paying the bill, practicing 'zusammen' and 'getrennt'.", completed: false }
            ],
            completed: false,
            resources: [
              { name: "ConversationExchange", url: "https://www.conversationexchange.com" },
              { name: "Speaky", url: "https://www.speaky.com" }
            ],
            notes: ""
          },
          {
            day: 5,
            task: "Writing a Balanced Restaurant Review",
            focus: "writing",
            level: "B1",
            lessonContent: {
              title: "Schreiben Sie eine Bewertung: Clear and Balanced Critique",
              definition: "Your final task this week is to write a short, balanced restaurant review (100-120 words). You need to clearly state both positive and negative points using descriptive adjectives. The goal is clarity, conciseness, and, most importantly, correct **verb placement** (the verb is almost always the second element in a main clause!).",
              example: "**Review Structure & Key Adjectives:**\n1. **Introduction (Name/Location):** Das Restaurant 'Zum Glück' ist in der Stadtmitte.\n2. **Positive Point (Food/Atmosphere):** Das Essen schmeckt wirklich **lecker**. Die Atmosphäre **ist** gemütlich.\n3. **Negative Point (Service/Speed):** **Aber** der Service **war** leider etwas **langsam**.\n4. **Conclusion:** Ich **empfehle** das Gericht trotzdem.\n\n**Connecting Words:** Use *aber* (but), *obwohl* (although), and *trotzdem* (nevertheless) to link your ideas smoothly.",
              tips: "Count your words and your verbs! Ensure your verb is in the second position in simple sentences. Use a mix of present tense (for facts and opinions) and *Perfekt* (for a specific past event, like waiting for the food)."
            },
            subtasks: [
                { description: "Draft three positive sentences using descriptive adjectives and correct verb placement.", completed: false },
                { description: "Draft three negative sentences using 'nicht' or 'kein'.", completed: false },
                { description: "Combine and edit into a final 100-120 word review, focusing on flow and consistent verb placement.", completed: false }
            ],
            completed: false,
            resources: [
              { name: "Journaly", url: "https://www.journaly.com" },
              { name: "Google Docs", url: "https://docs.google.com" }
            ],
            notes: ""
          }
        ]
      }
    ]
  };

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
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('germanLearningData');
      return saved ? JSON.parse(saved) : initialDataStructure;
    } catch (e) {
      console.error("Could not load data from localStorage, resetting.", e);
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

  useEffect(() => {
    localStorage.setItem('germanLearningData', JSON.stringify(data));
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
                        const newSubtasks = d.subtasks.map((sub, index) =>
                            index === subtaskIndex ? { ...sub, completed: !sub.completed } : sub
                        );
                        // Recalculate overall task completion
                        const allSubtasksCompleted = newSubtasks.every(sub => sub.completed);
                        return { ...d, subtasks: newSubtasks, completed: allSubtasksCompleted };
                    })()
                ) : d
              )
            }
          : w
      )
    }));
  };

  const updateNotes = (weekNum, dayNum, notes) => {
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
  };

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

  const DayDetailView = ({ selectedDay, dayData, onBack }) => {
    const { week, day } = selectedDay;
    const { task, focus, level, lessonContent, subtasks, resources, notes } = dayData;

    const subtasksCompleted = subtasks.filter(s => s.completed).length;
    const subtasksTotal = subtasks.length;
    const progress = subtasksTotal > 0 ? Math.round((subtasksCompleted / subtasksTotal) * 100) : 0;

    const currentWeekGoal = data.weeks.find(w => w.week === week)?.goal || 'Weekly Goal';

    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition mb-4 font-medium"
        >
          <ArrowLeft className='w-5 h-5'/> Back to Week {week} Tasks ({currentWeekGoal})
        </button>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className='flex justify-between items-start mb-4'>
                <div>
                    <h1 className="text-3xl font-bold mb-1">{task}</h1>
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full border ${focusColors[focus]}`}>
                            {focusIcons[focus]}
                            {focus}
                        </span>
                        <span className="inline-block text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                            Level: {level}
                        </span>
                        <span className="inline-block text-sm font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-600">
                            Day {day} ({calculateDate(week, day)})
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{progress}%</p>
                    <p className="text-xs text-gray-500">Subtasks Done</p>
                </div>
            </div>

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

            {/* Lesson Content */}
            <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-2"><Lightbulb className='w-6 h-6'/> Lesson: {lessonContent?.title || DayDetailPlaceholder}</h2>
            <div className="space-y-4 text-gray-800 dark:text-gray-200">
                <p className='whitespace-pre-line leading-relaxed'>{lessonContent?.definition || DayDetailPlaceholder}</p>

                <div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600'>
                    <h3 className='font-bold mb-2 text-lg'>Rules and Examples:</h3>
                    <p className='font-mono text-sm whitespace-pre-line leading-relaxed'>{lessonContent?.example || DayDetailPlaceholder}</p>
                </div>

                <div className='p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl border-l-4 border-yellow-500'>
                    <h3 className='font-bold mb-2 text-yellow-800 dark:text-yellow-300'>Teacher's Tip:</h3>
                    <p className='whitespace-pre-line text-sm leading-relaxed'>{lessonContent?.tips || DayDetailPlaceholder}</p>
                </div>
            </div>

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

            {/* Subtasks */}
            <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-300 flex items-center gap-2"><Target className='w-6 h-6'/> Daily Goals Checklist</h2>

            <div className="space-y-4">
                {subtasks.map((subtask, subIndex) => (
                    <div key={subIndex} className={`flex items-start p-3 rounded-lg border transition-all ${subtask.completed ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                        <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => toggleSubtask(week, day, subIndex)}
                            className="mt-1 w-5 h-5 rounded-md text-green-600 focus:ring-green-500 cursor-pointer flex-shrink-0"
                        />
                        <p className={`text-base flex-1 ml-3 ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {subtask.description}
                        </p>
                    </div>
                ))}
            </div>

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

            {/* Notes and Resources */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                    <label className="text-sm font-semibold block mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-1">📝 My Notes & Reflections:</label>
                    <textarea
                        value={notes}
                        onChange={(e) => updateNotes(week, day, e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition"
                        rows="5"
                        placeholder="Add your notes, reflections, or list sentences that gave you trouble here..."
                    />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-1">📎 Additional Resources:</p>
                    <div className="space-y-2">
                        {resources.map((r, i) => (
                          <a
                            key={i}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center w-full justify-between bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 px-3 py-2 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900 transition shadow-sm border border-blue-200 dark:border-blue-700"
                          >
                            {r.name}
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                          </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const TasksView = () => {
    const week = data.weeks.find(w => w.week === currentWeek);
    const filtered = week ? filterTasks(week.days) : [];

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">📋 Learning Plan Overview</h2>

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
                const subtasksCompleted = day.subtasks.filter(s => s.completed).length;
                const subtasksTotal = day.subtasks.length;
                return (
              <div
                key={day.day}
                onClick={() => setSelectedDay({ week: currentWeek, day: day.day })}
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md transition-all cursor-pointer hover:shadow-xl hover:ring-2 ${
                  day.completed ? 'opacity-90 ring-green-500/50 bg-gradient-to-r from-green-50/50 to-green-100/50 dark:from-green-900/30 dark:to-green-900/70' : 'ring-blue-500/50'
                }`}
              >
                <div className="flex items-start justify-between space-x-4">
                  
                  <div className="flex-1">
                    <div className='flex justify-between items-start mb-2'>
                        <h3 className={`font-bold text-xl ${day.completed ? 'opacity-70' : 'text-gray-900 dark:text-gray-100'}`}>
                            Day {day.day}: {day.task}
                        </h3>
                        {isPlanStarted && (
                            <span className='inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700'>
                                {calculateDate(currentWeek, day.day)}
                            </span>
                        )}
                    </div>

                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2'>
                        {day.lessonContent?.definition || DayDetailPlaceholder}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${focusColors[day.focus]}`}>
                            {focusIcons[day.focus]}
                            {day.focus}
                        </span>
                        <div className='text-sm font-medium flex items-center gap-2'>
                            {day.completed ? <CheckSquare className='w-4 h-4 text-green-600' /> : <MinusSquare className='w-4 h-4 text-gray-500' />}
                            {subtasksCompleted}/{subtasksTotal} Subtasks Complete
                        </div>
                    </div>
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

        {/* Modal */}o it is in the Nominative case.
        {showResetModal && <ResetModal />}

        {/* Backdrop for Mobile */}
        {mobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
      </div>
    </div>
  );
};

export default App;
