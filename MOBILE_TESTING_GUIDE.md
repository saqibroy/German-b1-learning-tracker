# Mobile Testing Guide

## 🚀 Quick Start

Your German B1 Learning Tracker is now running at:
**http://localhost:5173**

---

## 📱 Testing Mobile Design

### Method 1: Chrome DevTools (Recommended)

1. Open the app in Chrome: http://localhost:5173
2. Press `F12` to open DevTools
3. Press `Ctrl+Shift+M` (or click Device Toolbar icon)
4. Select a mobile device preset:

   **Recommended Test Devices:**
   - ✅ **iPhone SE** (375px) - Smallest common phone
   - ✅ **iPhone 12/13** (390px) - Standard modern phone
   - ✅ **iPhone 14 Pro Max** (430px) - Large phone
   - ✅ **iPad** (768px) - Tablet breakpoint
   - ✅ **Desktop** (1024px+) - Desktop view

5. Test interactions:
   - Tap buttons (should feel responsive)
   - Check text readability
   - Verify no horizontal scroll
   - Toggle dark mode
   - Click checkboxes and filters

### Method 2: Firefox Responsive Mode

1. Open the app in Firefox
2. Press `Ctrl+Shift+M`
3. Set width to: 375px, 390px, 430px, 768px, 1024px
4. Test in both portrait and landscape

### Method 3: Real Mobile Device

1. Find your computer's local IP:
   ```bash
   # On Linux:
   hostname -I
   # Or:
   ip addr show
   ```

2. Start dev server with host option:
   ```bash
   npm run dev -- --host
   ```

3. On your phone, navigate to:
   ```
   http://YOUR_IP:5173
   ```
   (Replace YOUR_IP with your actual local IP)

4. Test real touch interactions!

---

## ✅ What to Check

### Touch Targets (All should be ≥44px)
- [ ] Buttons are easy to tap
- [ ] Checkboxes have large tap areas
- [ ] Links are easily clickable
- [ ] Filter buttons are touch-friendly
- [ ] Navigation items are tappable

### Typography
- [ ] Text is readable at all sizes
- [ ] No text cut off or overflowing
- [ ] Headings have proper hierarchy
- [ ] Font sizes feel comfortable

### Layout
- [ ] No horizontal scroll (except intentional)
- [ ] Cards stack properly on mobile
- [ ] Grids adjust correctly
- [ ] Spacing feels comfortable
- [ ] Images/icons scale properly

### Interactions
- [ ] Tap feedback visible (slight scale)
- [ ] Hover effects on desktop only
- [ ] Focus states visible (keyboard nav)
- [ ] Transitions smooth
- [ ] Dark mode toggle works

### Content
- [ ] Italic text renders properly (*text*)
- [ ] Bold text works (**text**)
- [ ] Code blocks display nicely
- [ ] Special markers show colored boxes (✓ ✅ ❌ ⚠️ ⭐)
- [ ] Lists have proper spacing
- [ ] Headers stand out

---

## 🎯 Specific Features to Test

### DayDetailView (Click any day task)
1. Check header adapts to screen size
2. Verify content sections are readable
3. Test subtask checkboxes (large enough?)
4. Add notes (textarea should be comfortable)
5. Click resource links (44px height?)

### TasksView (Main task list)
1. Week selector dropdown is easy to use
2. Goal input has proper height
3. Filter checkboxes are tappable
4. Day cards display properly
5. Progress bars visible

### Dashboard
1. Welcome section looks good
2. Exam overview cards stack on mobile
3. Stats grid shows 2 columns on mobile
4. Next task card is clickable
5. Daily motivation quote readable

---

## 📐 Screen Size Testing Matrix

| Screen | Width | What to Check |
|--------|-------|---------------|
| iPhone SE | 375px | Minimum supported size |
| iPhone 12/13 | 390px | Standard phone |
| iPhone 14 Pro Max | 430px | Large phone |
| iPad | 768px | Tablet breakpoint (md:) |
| Desktop | 1024px+ | Full desktop view (lg:) |

---

## 🐛 Common Issues to Look For

### ❌ Problems to Avoid
- Text too small to read
- Buttons too small to tap (<44px)
- Content cut off or hidden
- Horizontal scroll appearing
- Text overflowing containers
- Icons too small
- Cramped spacing

### ✅ Good Signs
- Comfortable tap targets
- Readable text at arm's length
- Proper spacing between elements
- Smooth transitions
- Clear visual hierarchy
- No content overflow

---

## 🎨 Dark Mode Testing

1. Toggle dark mode (moon/sun icon)
2. Check all views:
   - Dashboard
   - Tasks list
   - Day detail view
   - Filters and controls
3. Verify text contrast is sufficient
4. Check that gradients work in dark mode
5. Ensure borders are visible

---

## 📊 Performance Testing

### Desktop (Chrome DevTools)
1. Open DevTools → Performance tab
2. Record page load
3. Check for:
   - Fast initial render
   - No layout shifts
   - Smooth animations

### Mobile (Lighthouse)
1. Open DevTools → Lighthouse tab
2. Select "Mobile" device
3. Run audit
4. Check scores:
   - Performance: 90+
   - Accessibility: 90+
   - Best Practices: 90+

---

## 🔍 Accessibility Testing

### Keyboard Navigation
1. Press `Tab` to navigate
2. Verify focus states visible
3. Check all interactive elements reachable
4. Test `Enter` and `Space` on buttons

### Screen Reader (Optional)
1. Use NVDA (Windows) or VoiceOver (Mac)
2. Navigate through content
3. Verify labels are descriptive
4. Check form inputs have labels

---

## 📸 Visual Comparison

### Before (Desktop-First)
- Large padding on mobile (wasted space)
- Tiny icons on mobile
- Small touch targets
- Text overflow issues
- Cramped layouts

### After (Mobile-First) ✅
- Comfortable padding (p-4 → md:p-8)
- Properly sized icons (w-5 h-5 → md:w-7 md:h-7)
- Large touch targets (≥44px)
- Text wraps properly
- Spacious, comfortable layouts

---

## 🚦 Testing Checklist

Copy this for your testing session:

```
Mobile Testing - iPhone SE (375px)
[ ] Dashboard loads properly
[ ] Can tap "Start Plan Today" button
[ ] Can navigate to Tasks view
[ ] Can select week from dropdown
[ ] Can filter by focus areas
[ ] Can click on a day card
[ ] Day detail view displays correctly
[ ] Can check/uncheck subtasks
[ ] Can add notes
[ ] Can click resource links
[ ] Dark mode works
[ ] No horizontal scroll
[ ] All text readable

Mobile Testing - iPhone 12 (390px)
[ ] All above tests pass
[ ] Layout looks comfortable

Tablet Testing - iPad (768px)
[ ] Grid layouts show 2-3 columns
[ ] Padding increases (md: styles)
[ ] Text size increases
[ ] Icons are larger

Desktop Testing (1024px+)
[ ] Full desktop layout
[ ] All columns visible
[ ] Hover effects work
[ ] Large padding/text (lg: styles)
```

---

## 🎯 Success Criteria

Your mobile optimization is successful if:

1. ✅ App loads on 375px width without horizontal scroll
2. ✅ All buttons are easily tappable with thumb
3. ✅ Text is readable without zooming
4. ✅ Dark mode works on all screen sizes
5. ✅ Interactions feel smooth and responsive
6. ✅ Content doesn't overflow or get cut off
7. ✅ Touch feedback is visible
8. ✅ Navigation is intuitive on mobile

---

## 🔧 Troubleshooting

### App won't load
```bash
# Check if server is running
# Should show: http://localhost:5173

# Restart if needed:
npm run dev
```

### Can't access on mobile device
```bash
# Start with host option:
npm run dev -- --host

# Then use your local IP on phone
```

### Dark mode not working
- Check localStorage isn't blocking
- Try clearing cache
- Verify system dark mode preference

### Text too small
- This is intentional for data density
- Zoom in browser if needed (Ctrl + +)
- Font sizes are optimized for 375px+ screens

---

## 📱 Recommended Testing Order

1. **Start Small** → iPhone SE (375px)
   - This is the hardest test
   - If it works here, it works everywhere

2. **Standard Phone** → iPhone 12 (390px)
   - Most common size
   - Should feel comfortable

3. **Tablet** → iPad (768px)
   - Check md: breakpoint kicks in
   - Verify 2-column layouts

4. **Desktop** → 1024px+
   - Full experience
   - All features visible
   - Hover effects work

---

## ✨ Expected Behavior

### iPhone SE (375px) - Mobile
- Single column layouts
- Stacked cards
- Compact padding (p-4, p-5)
- Smaller text (text-sm, text-base)
- Small icons (w-5 h-5)
- 2-column stats grid
- Large touch targets

### iPad (768px) - Tablet
- 2-3 column grids
- More padding (p-6, p-7)
- Larger text (text-base, text-lg)
- Medium icons (w-6 h-6)
- 4-column stats grid
- Enhanced spacing

### Desktop (1024px+) - Full
- Multi-column layouts
- Maximum padding (p-8)
- Large text (text-lg, text-xl)
- Large icons (w-7 h-7)
- All columns visible
- Hover effects

---

## 🎉 You're All Set!

The app is fully optimized for mobile devices. Enjoy testing! 

**Pro Tip**: Use Chrome DevTools' Device Mode and toggle between devices to see the responsive design in action. It's quite satisfying! 😊

---

**Questions?** Check:
- MOBILE_OPTIMIZATION_SUMMARY.md - Complete feature list
- DESIGN_SYSTEM.md - Design reference
- FORMATTING_CHEATSHEET.md - Content formatting guide
