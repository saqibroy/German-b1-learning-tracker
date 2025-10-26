# Text Formatting Guide for German B1 Learning Tracker

This guide explains how to format text in the lesson content fields to take advantage of the new FormattedText component.

## Supported Formatting

### 1. Bold Text
Wrap text in double asterisks to make it bold.

**Input:**
```
This is **bold text** in a sentence.
The **Nominative** case is important.
```

**Output:**
This is **bold text** in a sentence.
The **Nominative** case is important.

---

### 2. Headers
Text wrapped entirely in double asterisks on its own line becomes a header.

**Input:**
```
**Main Header**
Regular text here.

**Another Section Header**
More text.
```

**Output:**
Displays as large, bold headers with proper spacing.

---

### 3. Tables
Use pipe (`|`) characters to create table rows.

**Input:**
```
| Case | Masculine | Feminine | Neuter |
|------|-----------|----------|--------|
| NOM  | **der**   | die      | das    |
| AKK  | **den**   | die      | das    |
```

**Output:**
Renders as a formatted table with:
- First row styled as header (bold, gray background)
- Subsequent rows as data cells
- Proper borders and spacing

**Note:** The separator row (`|---|---|`) is automatically hidden.

---

### 4. Bullet Lists
Start lines with a dash (`-`) followed by a space.

**Input:**
```
- First item
- Second item  
- Third item
```

**Output:**
- First item
- Second item
- Third item

---

### 5. Numbered Lists
Start lines with a number followed by a period.

**Input:**
```
1. First step
2. Second step
3. Third step
```

**Output:**
1. First step
2. Second step
3. Third step

---

### 6. Section Labels
Lines ending with a colon are styled as section labels.

**Input:**
```
Example:
This is the example content.

Tips:
This is a tip.
```

**Output:**
Displays labels in blue with proper emphasis.

---

### 7. Paragraphs
Regular text is displayed as paragraphs with proper spacing.

**Input:**
```
This is a paragraph of text.

This is another paragraph with some space above it.
```

**Output:**
Text with proper vertical spacing between paragraphs.

---

## Complete Example

Here's a complete example showing all formatting options:

```
**Perfekt Tense: Your Past-Story Superpower**

The **Perfekt (Present Perfect)** is THE most common past tense in spoken German!

Structure:
Subject + haben/sein (conjugated) + ... + Past Participle (END)

**PERFEKT FORMULA:**

With HABEN (most verbs):
- Ich **habe** gestern Pizza **gegessen**.
- Sie **hat** den Film **gesehen**.

With SEIN (movement/change):
- Wir **sind** nach Berlin **gefahren**.
- Er **ist** zu Hause **geblieben**.

**PAST PARTICIPLE FORMATION:**

| Type | Pattern | Example |
|------|---------|---------|
| Regular | ge + stem + t | machen → **gemacht** |
| Irregular | ge + stem + en | sehen → **gesehen** |
| Separable | prefix + ge + stem | einkaufen → **eingekauft** |

Tips:
Remember the BEGAD-SWIM mnemonic for sein verbs!
```

---

## Best Practices

### 1. Use Bold for Key Terms
Highlight important vocabulary, grammar terms, and case names:
- `The **Nominative** case`
- `**Perfekt** tense`
- `**der** (masculine article)`

### 2. Use Tables for Comparisons
Perfect for:
- Case declensions
- Verb conjugations
- Vocabulary lists with translations

### 3. Structure Your Content
Use this hierarchy for lesson content:

```
**Main Topic Title**

Definition section explaining the concept.

**Key Rules:**
- Rule 1
- Rule 2
- Rule 3

**Examples:**

| German | English | Notes |
|--------|---------|-------|
| Example 1 | Translation 1 | Note 1 |

**Important Points:**
1. First point
2. Second point
3. Third point
```

### 4. Keep Lines Readable
- Don't make lines too long
- Use blank lines to separate sections
- Break tables into multiple smaller tables if needed

---

## Dark Mode Considerations

All formatting automatically adapts to dark mode:
- **Bold text**: Proper contrast in both modes
- **Tables**: Dark-friendly borders and backgrounds
- **Headers**: Readable in light and dark themes
- **Lists**: Consistent styling across themes

---

## Examples from Actual Lessons

### Example 1: Grammar Lesson
```
**The Case Detectives: Who is the hero?**

Today we master the **Nominative** and **Accusative** cases.

**Your Article Cheat Sheet:**

| Article | Nominative | Accusative |
|---------|------------|------------|
| Masculine | **der** | **den** |
| Feminine | **die** | **die** |
| Neuter | **das** | **das** |

**Example Sentence:**
**Der** Hund (Nom.) sieht **den** Mann (Akk.).
```

### Example 2: Vocabulary Lesson
```
**Daily Routine Verbs**

Essential verbs for talking about your day:

Morning:
- aufwachen (to wake up)
- aufstehen (to get up)
- sich duschen (to shower)

Evening:
- nach Hause kommen (to come home)
- kochen (to cook)
- fernsehen (to watch TV)

**Example:**
Ich **bin** um 7 Uhr **aufgestanden**.
```

### Example 3: Strategy Lesson
```
**Reading Module Strategy**

Time Allocation:
1. Teil 1 (Blog): 10 minutes
2. Teil 2 (Press): 15 minutes
3. Teil 3 (Ads): 12 minutes

**Question Types:**
| Type | Strategy |
|------|----------|
| Richtig/Falsch | Watch for 'nicht erwähnt' traps |
| MCQ | Eliminate wrong answers first |
| Matching | Use process of elimination |

Key Tip:
Always read questions **before** reading the text!
```

---

## Technical Notes

- The FormattedText component is in `/App.jsx`
- It processes text line-by-line
- Formatting is applied client-side (no server processing)
- Works with all existing lesson content
- Backward compatible with plain text

---

## Troubleshooting

### Table not rendering?
- Make sure each row has the same number of `|` characters
- Check for extra spaces around pipes
- Ensure there's a blank line before the table

### Bold not working?
- Check that asterisks are doubled: `**` not `*`
- Make sure there's no space between asterisks and text
- Verify closing asterisks exist

### List items not indenting?
- Ensure there's a space after the dash: `- ` not `-`
- Start each item on a new line
- Don't mix numbered and bulleted lists in the same block

---

## Future Enhancements (Planned)

- [ ] Italic text support (`*text*`)
- [ ] Code blocks (`` `code` ``)
- [ ] Links support
- [ ] Image embedding
- [ ] Collapsible sections
- [ ] Highlighted text blocks

---

Last Updated: October 26, 2025
