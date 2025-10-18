export const initialDataStructure = {
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
            { description: "Practice reading the articles out loud: 'Der, den, die, die, das, das, die, die'.", completed: false }
          ],
          completed: false,
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

export const vocabularyData = [
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

export const quotes = [
  { german: "Jede kleine Anstrengung ist ein Sieg!", english: "Every small effort is a victory!" },
  { german: "Du schaffst das!", english: "You can do it!" },
  { german: "Heute besser als gestern!", english: "Better today than yesterday!" },
  { german: "Fehler sind deine Freunde!", english: "Mistakes are your friends!" },
  { german: "Konstanz ist der Schlüssel!", english: "Consistency is the key!" }
];
