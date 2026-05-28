# Answers

## 1. How to Run
No install or build step needed.
1. Clone the repo: `git clone <your-repo-url>`
2. Open `index.html` in any browser.

## 2. Stack & Design Choices
I chose vanilla HTML, CSS, and JavaScript because this task needs no framework —
no state management library, no build tool, just a file you open in a browser.
It also makes the submission easiest to run and verify.

**Decision 1 — Grid over list:**
I used a CSS grid with habits as rows and days as columns because a habit tracker
is fundamentally a table of data. A list would hide the weekly pattern; the grid
lets the user scan an entire week at a glance and immediately spot missed days.

**Decision 2 — Today's column highlighted in purple:**
Today's column gets a purple background and border so the user's eye lands there
instantly. Everything else is quiet (gray borders, white cells) so the highlight
has contrast and meaning — it answers "where am I right now" without the user
having to read the date labels.

## 3. Responsive & Accessibility
On a 360px phone the grid compresses column widths and reduces font size so all
7 days still fit without horizontal scrolling. On a 1440px laptop the grid
expands naturally with a max-width container keeping it readable.

**Accessibility handled:** The Add Habit input supports keyboard — pressing Enter
adds a habit without needing the mouse. All buttons have visible focus states.

**Accessibility skipped:** I did not add ARIA live regions to announce when a
checkmark is toggled to screen readers. With more time I would add
`aria-pressed` to each cell and an `aria-live` region to announce streak changes.

## 4. AI Usage
I used Claude to generate the initial JavaScript logic (state management,
localStorage, streak calculation, week navigation, confetti animation,
progress bars, and daily quotes) and all CSS styling.

**One thing I changed:** The AI generated the progress bar showing only
`X/7 days` for every day of the week. I changed the total count to only
include days up to today (`weekDates.filter(d => dateKey(d) <= todayStr)`)
so future days don't count against the percentage — showing 2/3 on Wednesday
is more accurate and motivating than showing 2/7.t.

**One thing I changed:** The AI gave me fixed pixel widths for the grid columns
(`grid-template-columns: 200px 60px 60px...`). I changed the day columns to
`repeat(7, 1fr)` so they share available space equally and reflow correctly on
narrow screens instead of overflowing.

## 5. Honest Gap
The rename habit UX uses a browser `prompt()` dialog which looks out of place
and breaks the visual experience. With another day I would replace it with an
inline editable input that appears directly in the habit name cell on double-click,
styled consistently with the rest of the UI.