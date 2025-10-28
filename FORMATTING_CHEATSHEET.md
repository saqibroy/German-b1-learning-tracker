# Content Formatting Cheatsheet

## Quick Reference for Writing Enhanced Content

### ✍️ Text Formatting

#### Bold Text
```markdown
**This text will be bold**
```
**Result:** Bold, darker color, emphasis

#### Italic Text
```markdown
*This text will be italic*
```
**Result:** Italic, slightly lighter color, subtle emphasis

#### Combined
```markdown
**Bold and *italic* together**
```
**Result:** Mixed formatting works perfectly

---

### 📋 Headers

#### Large Section Header (All Caps)
```markdown
**MODAL VERBS - COMPLETE GUIDE**
```
**Result:**
- Extra large (text-2xl)
- Blue color with underline border
- More spacing (mt-8 mb-4)
- Best for main topics

#### Regular Section Header
```markdown
**Understanding können vs. dürfen**
```
**Result:**
- Large (text-lg)
- Gray color
- Normal spacing (mt-6 mb-3)
- Best for subtopics

#### Teil/Part Labels
```markdown
Teil 1: Writing Task
```
**Result:**
- Medium size (text-base)
- Indigo color (special styling)
- Best for exam sections

#### Small Labels
```markdown
Example:
Exercise:
Note:
```
**Result:**
- Small size (text-sm)
- Blue color
- Best for inline sections

---

### 📝 Lists

#### Bullet List
```markdown
- First item with **bold** word
- Second item with *italic* word
- Third item with regular text
```
**Result:**
- Disc bullets
- Indented
- Good spacing between items
- Supports inline formatting

#### Numbered List
```markdown
1. Step one
2. Step two
3. Step three
```
**Result:**
- Decimal numbers
- Indented
- Sequential numbering
- Good for procedures

---

### 📊 Tables

```markdown
| Case | Masculine | Feminine | Neuter |
|------|-----------|----------|--------|
| NOM | **der** | **die** | **das** |
| AKK | **den** | **die** | **das** |
```

**Result:**
- Header row with gray background
- Clean borders
- Responsive (scrollable on mobile)
- Supports **bold** in cells

**Tips:**
- First row is always the header
- Separator row (---|---|---) is automatically hidden
- Use **bold** for important cells
- Keep column widths balanced

---

### 💻 Code Blocks (German Examples)

```markdown
```
Der Mann kann gut Deutsch sprechen.
Die Frau muss heute arbeiten.
Das Kind will Eis essen.
```
```

**Result:**
- Dark background (looks professional)
- Monospace font (easy to read)
- Blue left border
- Perfect for German sentences
- Auto-wraps long lines

**Best for:**
- German example sentences
- Dialogues
- Verb conjugation tables
- Multi-line examples

---

### ✅ Special Markers

#### Success/Correct
```markdown
✓ This is the correct way
✅ Remember this rule
```
**Result:**
- Green background box
- Green text
- Large check icon
- Great for tips

#### Error/Wrong
```markdown
❌ Common mistake to avoid
```
**Result:**
- Red background box
- Red text
- Large X icon
- Great for warnings

#### Warning/Attention
```markdown
⚠️ Pay special attention here
```
**Result:**
- Yellow background box
- Yellow text
- Warning triangle icon
- Great for important notes

#### Info/Star
```markdown
⭐ Pro tip: Try this
```
**Result:**
- Blue background box
- Blue text
- Star icon
- Great for advanced tips

---

### 🎯 Complete Examples

#### Example 1: Modal Verb Section

```markdown
**MODAL VERBS OVERVIEW**

Modal verbs change the meaning of the main verb. In German, they are **essential** for B1 level.

**The Six Modal Verbs:**

| Modal | Meaning | Example |
|-------|---------|---------|
| **können** | can/able to | Ich **kann** schwimmen. |
| **müssen** | must/have to | Du **musst** lernen. |
| **wollen** | want to | Er **will** schlafen. |

**Common Patterns:**

```
Subject + Modal + Object + Infinitive
Ich kann Deutsch sprechen.
```

✓ Always put the infinitive at the end
✓ Modal verb is conjugated, main verb stays in infinitive
❌ Don't forget the infinitive (common mistake!)

**Quick Practice:**

1. Ich *kann* gut singen. (I can sing well)
2. Du *musst* heute arbeiten. (You must work today)
3. Wir *wollen* ins Kino gehen. (We want to go to cinema)
```

**What this produces:**
- Large blue header "MODAL VERBS OVERVIEW"
- Regular paragraphs with bold emphasis
- Medium gray header "The Six Modal Verbs:"
- Clean table with bold German words
- Another medium header "Common Patterns:"
- Dark code block for the pattern
- Green success boxes
- Red error box
- Regular header "Quick Practice:"
- Numbered list with italic modal verbs

---

#### Example 2: Exam Section

```markdown
**WRITING TEIL 2: FORUM POST**

**What is it?**

Teil 2 is a *semi-formal* forum post where you share your **opinion** on a topic.

Teil 1: Understanding the Task

You have **30 minutes** to write approximately **80 words**.

⚠️ Writing less than 70 words = automatic fail!

**Scoring Breakdown:**

| Criteria | Points | What it means |
|----------|--------|---------------|
| Task completion | 6 | Did you cover all Leitpunkte? |
| Text structure | 6 | Is it organized logically? |
| Language accuracy | 8 | Grammar and spelling correct? |

**Example Topic:**

```
Thema: Homeoffice - Arbeiten von zu Hause

Leitpunkte:
1. Deine Meinung
2. Ein Vorteil
3. Ein Nachteil
```

✅ Always address ALL Leitpunkte
✅ Use transition words (erstens, zweitens, aber, jedoch)
✓ Check spelling before submitting

**Model Answer:**

Ich finde Homeoffice sehr praktisch. **Erstens** spare ich viel Zeit, weil ich nicht zur Arbeit fahren muss. **Aber** manchmal fehlt mir der Kontakt zu Kollegen. *Trotzdem* möchte ich 2-3 Tage pro Woche von zu Hause arbeiten.
```

**What this produces:**
- Large blue header with underline
- Medium header "What is it?"
- Paragraph with italic and bold emphasis
- Teil section in indigo color
- Time information in bold
- Yellow warning box
- Medium header "Scoring Breakdown:"
- Table with headers
- Medium header "Example Topic:"
- Code block with the exam prompt
- Three green success boxes
- Medium header "Model Answer:"
- Paragraph showing example response

---

### 🎨 Styling Tips

#### DO Use:
✅ **Bold** for German keywords
✅ *Italic* for explanations in English
✅ Code blocks for multi-line German examples
✅ Tables for grammar rules
✅ Green boxes (✓ ✅) for correct examples
✅ Red boxes (❌) for common mistakes
✅ Yellow boxes (⚠️) for important warnings
✅ Headers for organizing sections

#### DON'T Use:
❌ Too many formatting styles in one sentence
❌ Code blocks for single words (use **bold** instead)
❌ Tables for non-tabular content
❌ ALL CAPS except for main section headers
❌ Multiple marker types in succession
❌ Headers that are too long (keep under 50 chars)

---

### 📏 Content Structure Template

```markdown
**[MAIN TOPIC IN CAPS]**

[Brief introduction paragraph with **bold** keywords and *italic* explanations]

**[Subtopic]**

[Detailed explanation]

Teil 1: [If exam-related]

[Specific instructions]

**[Visual Reference Title]**

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Data     | Data     | Data     |

**[Examples Title]**

```
German example 1
German example 2
German example 3
```

✓ Success tip
✓ Another success tip
❌ Common mistake
⚠️ Important warning
⭐ Pro tip

**[Practice Title]**

1. Exercise one
2. Exercise two
3. Exercise three

**[Summary or Next Steps]**

[Concluding paragraph]
```

---

### 🔍 Testing Your Formatting

Before finalizing content, check:

1. **Preview in app** - See how it actually renders
2. **Dark mode** - Test both light and dark themes
3. **Mobile view** - Check responsive behavior
4. **Table width** - Ensure tables don't overflow
5. **List spacing** - Verify readability
6. **Code blocks** - Check line wrapping
7. **Header hierarchy** - Ensure logical flow
8. **Color balance** - Not too many warnings/errors

---

### 💡 Advanced Techniques

#### Nested Lists
```markdown
1. Main point
   - Sub-point A
   - Sub-point B
2. Second main point
```
**Note:** Indentation creates sub-lists (use 3 spaces)

#### Mixing Tables and Lists
```markdown
**Grammar Rules:**

| Rule | Example |
|------|---------|
| Case changes | **der** → **den** |

**Practice:**

1. Find the accusative article
2. Check the answer
```

#### Long Code Blocks
```markdown
**Dialogue:**

```
A: Guten Tag! Kann ich Ihnen helfen?
B: Ja, ich suche einen Pullover.
A: Welche Größe brauchen Sie?
B: Größe M, bitte.
A: Und welche Farbe möchten Sie?
B: Blau oder grau.
```

Vocabulary check:
- *suche* = am looking for
- *Größe* = size
- *Farbe* = color
```

---

### 🚀 Quick Reference Card

| Format | Syntax | Use Case |
|--------|--------|----------|
| Bold | `**text**` | Keywords, emphasis |
| Italic | `*text*` | Explanations, translations |
| Big Header | `**ALL CAPS**` | Main topics |
| Header | `**Normal Text**` | Subtopics |
| Teil | `Teil 1:` | Exam parts |
| Label | `Example:` | Small sections |
| Success | `✓ text` | Correct examples |
| Error | `❌ text` | Mistakes to avoid |
| Warning | `⚠️ text` | Important notes |
| Info | `⭐ text` | Pro tips |
| Code | ` ``` text ``` ` | German examples |
| Table | `\| col \| col \|` | Structured data |
| List | `- item` | Bullet points |
| Numbered | `1. item` | Sequential steps |

---

### 📝 Final Checklist

Before submitting content:

- [ ] All German words properly formatted (bold or in code blocks)
- [ ] Headers follow hierarchy (ALL CAPS → Normal → Teil → Label)
- [ ] Tables have headers and are properly aligned
- [ ] Code blocks used for multi-line German examples
- [ ] Success/error markers used appropriately
- [ ] Lists are properly formatted and indented
- [ ] No raw asterisks visible (check preview)
- [ ] Content tested in both light and dark mode
- [ ] Mobile responsiveness verified
- [ ] Spelling and grammar checked

---

*Happy Content Creating! 🎉*

*Version: 2.2 | Last Updated: October 28, 2025*
