# 🚀 Quick Start Guide

## ✅ Setup Complete!

Your German B1 Learning Tracker is now fully set up with:
- ✅ React 19
- ✅ Vite 7 
- ✅ Tailwind CSS 4
- ✅ Lucide React Icons
- ✅ npm 11.6.2 (latest)
- ✅ Modern best practices

## 🎯 What's Next?

### 1. Start the Development Server

```bash
npm run dev
```

Then open your browser to the URL shown (usually `http://localhost:5173`)

**Note**: If you encounter file watcher errors, try:
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

### 2. Explore the App

- Click **"Start Plan Today"** on the dashboard
- Navigate to **Learning Plan** to see your structured lessons
- Try the **Flashcard Quiz** to practice vocabulary
- Check **Progress Report** to visualize your journey
- Review **Insights** for personalized recommendations

### 3. Customize Your Learning

#### Add More Weeks
Edit `src/data/initialData.js` and add new week objects:
```javascript
{
  week: 3,
  goal: "Your Goal Here",
  days: [ /* your days */ ]
}
```

#### Add Vocabulary
Add entries to `vocabularyData` array in `src/data/initialData.js`:
```javascript
{ 
  word: "Der Apfel", 
  translation: "the apple", 
  focus: "vocabulary", 
  week: 1 
}
```

### 4. Build for Production

When ready to deploy:
```bash
npm run build
```

Files will be in the `dist/` directory - ready to host anywhere!

## 📁 Project Structure Overview

```
src/
├── data/
│   └── initialData.js          # All learning content and vocabulary
├── hooks/
│   ├── useDarkMode.js          # Dark mode logic
│   └── useLearningData.js      # Data management & localStorage
├── utils/
│   ├── constants.js            # App constants and styles
│   └── helpers.js              # Utility functions
├── App.jsx                     # Main application component
├── index.css                   # Global styles + Tailwind
└── main.jsx                    # Entry point
```

## 🎨 Customization Tips

### Change Colors
Edit `tailwind.config.js` to customize your color scheme:
```javascript
theme: {
  extend: {
    colors: {
      'custom-blue': '#yourcolor'
    }
  }
}
```

### Modify Focus Areas
Update the `focusColors` object in `src/utils/constants.js`

### Add New Views
1. Create a new component/function in `App.jsx`
2. Add a navigation item in the sidebar
3. Add the case in the `renderContent()` function

## 🎯 Study Plan Recommendations

### First Week Priority:
1. Complete Week 1, Day 1 (Cases)
2. Learn 20 new words daily
3. Start listening to German podcasts (15 min/day)
4. Record yourself speaking (5 min/day)

### Daily Routine Suggestion:
- **Morning (30 min)**: Vocabulary practice with flashcards
- **Afternoon (45 min)**: Complete one lesson from Learning Plan
- **Evening (30 min)**: Listening practice or speaking with tutor

## 📚 Must-Have Resources

### Free:
- **DW Learn German**: https://www.dw.com/en/learn-german
- **Easy German (YouTube)**: Real German conversations
- **Anki/Quizlet**: Spaced repetition flashcards

### Paid (Worth It!):
- **iTalki/Preply**: 1-2 tutoring sessions per week
- **"Menschen B1" textbook**: Structured grammar and exercises
- **Goethe B1 practice tests**: Exam simulation

## 🐛 Troubleshooting

### App won't start?
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Dark mode not working?
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`
- Refresh the page

### Progress not saving?
- Check browser localStorage is enabled
- Try a different browser
- Check console for errors

## 💡 Pro Tips

1. **Use Dark Mode at Night**: Easier on your eyes during evening study sessions
2. **Set Daily Reminders**: Use phone alarms to stay consistent
3. **Track Streaks**: Try to mark tasks complete every single day
4. **Review Weekly**: Check Insights page every Sunday
5. **Backup Your Progress**: Occasionally export localStorage data

## 📞 Getting Help

- **JavaScript/React Issues**: Check browser console (F12)
- **German Learning Questions**: Join r/German on Reddit
- **App Features**: Review the main README.md

## 🎉 You're All Set!

Your learning tracker is ready to help you achieve your B1 goal!

**Next Steps:**
1. Run `npm run dev`
2. Click "Start Plan Today"
3. Begin with Week 1, Day 1
4. Commit to daily practice
5. Review the STUDY_GUIDE.md for detailed learning strategies

---

**Viel Erfolg! Du schaffst das! 🇩🇪** 

(Good luck! You've got this!)
