# SportPlus App - Detailed Screen Component Designs

Based on the [Axicube portfolio images](https://axicube.io/portfolio/sportplus-fitness-app/), the aesthetic of the SportPlus application heavily utilizes a "bento box" style card layout, extensive use of high-quality equipment photography, and a distinct dual-tone theme. 

## Global Design System Elements
* **Typography:** Clean, geometric sans-serif (e.g., Inter, Montserrat, or Roboto). Headers are generally set in Semi-Bold or Bold, while body copy is Regular or Medium. Small caps are used frequently for section headers (e.g., `PREVIOUS WORKOUTS`, `SETTING`).
* **Colors:**
  * **Primary Accent (Brand):** Vibrant Gold/Yellow (approx. `#E5B84B` or `#F5C518`)
  * **Light Theme Background:** Pure White (`#FFFFFF`) or very pale gray (`#F8F9FA`)
  * **Dark Theme Background:** Deep Charcoal or off-black (`#121212` to `#1E1E1E`)
  * **Text Colors:** Primary text on light is Dark Charcoal (`#212529`); Secondary text on light is Mid-Gray (`#6C757D`). On dark, primary text is White (`#FFFFFF`) and secondary is Light Gray.
* **UI Paradigms:**
  * **Cards:** Generous border radii (approx. `16px` to `24px`), subtle drop shadows on light mode, distinct structural separation.
  * **Buttons:** Solid Gold with Black text for primary actions. Outlined or Text-only buttons for secondary choices. Fully rounded ("pill") or moderate border radii.
  * **Icons:** Simple, outlined or filled vector icons. Small icons are often colored Gold next to workout metrics.
  * **Navigation:** Bottom tab bar containing 3 to 4 distinct sections. The active icon is highlighted in the brand Gold color.

---

## 1. Welcome / Onboarding Screen
**Variations:** Full-bleed background vs. Standard Light Theme.
* **Layout (Full-Bleed):**
  * **Background:** High-contrast, moody lifestyle image of an athlete on a background taking up the entire screen.
  * **Logo:** Centered large `SportPlus` logo (with the stylized plus sign).
  * **Actions:** Positioned at the bottom edge. "Create account" (Primary Gold button, black text) and "Log in" (Secondary transparent button, white border/text).
* **Layout (Standard Light):**
  * **Header:** "Hello, John" in large black text. User avatar top-right.
  * **Hero Component:** Large square card spanning screen width with an image. Inner text overlay: "Welcome to SportPlus! Start your first workout here" with a right-chevron action button.
  * **Promotion Banner:** A distinct card below saying "Check out new devices and great promotions on our website", followed by a Gold "Visit the SportPlus shop" button.

## 2. Dashboard / Home Screen
**Theme:** Light
* **Header:** Hero greeting "Hello, John" (Bold, `32pt`), circular Avatar (`40x40`) aligned right.
* **Weekly Overview Section:**
  * Section title `WEEKLY OVERVIEW` (Small caps, gray text). Floating right-aligned "Details" pill button.
  * 3-column metric row: 
    * Col 1: Gold Dumbbell icon, "5", "qty"
    * Col 2: Gold Clock icon, "135", "min"
    * Col 3: Gold Flame icon, "4210", "kcal"
  * Primary Action Button: "Start previous workout" (Solid black background, white text, full width, `8px` rounded corners).
* **Previous Workouts Section:**
  * Section title `PREVIOUS WORKOUTS` (Small caps, gray text). Floating right-aligned "History" pill button.
  * Vertically scrolling list. Each item comprises: Left-aligned square thumbnail (`60x60`, rounded), Title (`16pt` semi-bold black), and a horizontal bullet list beneath (`12pt` gray, e.g., "25 April • 00:29:01 min • 4,3 km").
* **Bottom Navigation:** Tabs for "Dashboard", "Workout", "Quick Workout". Active tab uses the Gold accent.

## 3. Profile & Account Switcher Screen
**Theme:** Mixed (Dark background behind user, Light bottom modal)
* **Top Header (Dark):** "Profile" Title centered. "< Back" left, "Edit" pencil icon right.
* **User Overview:** Large circular Avatar with a gold border. Name "John Doe" below with a chevron facing down (indicating a dropdown or modal).
* **Metrics Row:** Four small floating translucent squares displaying "Sex", "Weight", "Height", "Age". The values (e.g., "80", "180", "31") are highlighted in Gold.
* **Bottom Sheet Modal (Light):** Overlays the screen from the bottom.
  * Contains a list of accounts ("John Doe", "Add new account" with a '+' icon, "Kate Doe", "David Doe"). Each has a small avatar.
  * A full-width "Change account" Gold button is pinned to the bottom.

## 4. My Devices / Bluetooth Search
**Theme:** Light
* **Header:** "My devices" centered, "X" close icon top-left.
* **Status Text:** Centered heading "Search of devices nearby", followed by a smaller instruction "Turn on bluetooth on the device so that the app can connect it".
* **Radar Visual:** The screen center features concentric expanding rings (opacity dropping outward) in the brand's Gold tint, implying a scanning animation. In the absolute center, a solid Gold circle houses a white Bluetooth icon.
* **Footer:** Pinned "Next" Gold button.

## 5. Select Workout Screen (Browse / Catalog)
**Theme:** Light
* **Header:** "Select workout" Title centered, Heart icon (favorites) right-aligned.
* **Search & Filter:** 
  * Full-width "Search" bar with a light-gray background and a left-aligned magnifying glass icon.
  * Horizontally scrolling row of Filter Chips (`All`, `X-Bike`, `Crosstrainer`, `Rudergerät`). The active chip (`All`) is Gold, inactive chips are light gray. Tiny equipment icons accompany the chip text.
* **Workout Cards:** Vertical scrolling list. 
  * Large, distinct rectangular photos of someone working out.
  * A Heart overlay on the top right corner of the image.
  * Device pill overlay on the top-left of the image (e.g., `[Icon] X-Bike`).
  * Text underneath image: Title ("X-Bike daily workout") in bold black, Subtitle ("Level 3 • 30 min") in small gray text.

## 6. Workout Details Screen
**Theme:** Light
* **Hero Image:** Fills the top 40% of the screen. Top-left has a floating `<` back button inside a white circle. Top-right has a floating `?` help button.
* **Title Block:** Title ("X-Bike daily workout"), Subtitle ("Level 3 • 25 min").
* **Necessary Device Section:** `NECESSARY DEVICE` small cap header. Features a row displaying the device name ("X-Bike") alongside its connection status ("CONNECTED" or "NOT CONNECTED") on the far right.
* **Description Section:** `DESCRIPTION` small cap header. A short text paragraph detailing the exercise goals. Truncated with a gold "more" link.
* **Performance Section:** `PREVIOUS WORKOUT STATS` small cap header. Features a simplified gold bar chart showing past performance runs over time.
* **Footer Action:** A deep, fixed bottom bar with a solid black "Start workout" button.

## 7. Active Workout Dashboard
**Theme:** Dark (Maximum contrast for visibility during exercise)
* **Header:** "Active workout" Title, "X" close icon top-left.
* **Centerpiece Metric:** 
  * A large central circular dial/timer (e.g., "11:50") showing elapsed time or remaining time with a sweeping Gold progress ring.
  * Alternatively, a block displaying the current "RESISTANCE LEVEL" (e.g., "1") with prominent up/down chevron controls.
* **Real-time Data Grid:** A 2x3 grid of key metrics. Each metric has a small colored icon (often gold), a large bold white number, and a small gray unit. 
  * Example metrics: `1` (hh:mm), `25` (min), `0` (watt), `64` (bpm), `9` (km/h), `1030` (kcal).
* **Controls:** Prominent play/pause and stop styling (e.g., a circle with the play/pause icon).

## 8. Workout Summary ("Congratulations")
**Theme:** Dark
* **Header:** "SportPlus" Logo (with plus-mark icon) centered at the top.
* **Messaging:** Large bold "Congratulations!", subtext "You finished current workout. Progress and statistics will be saved."
* **Final Stats Grid:** Displays final tallies exactly as presented in the Active Workout Dashboard grid (Time, Watt, Distance, Heart Rate, Speed, Calories).
* **Footer Items:** Large "Share stats" primary button (Gold). Following it, a simple "Got it" text link / secondary button.

## 9. Workout History & Detailed Stats
**Theme:** Light
* **Header:** Week selection control `«  18 April - 25 April  »`.
* **Week Summary:** Just below the date picker, a top row summarizing the selected timeframe. Same metrics visually identically as the Dashboard (Qty, Min, Kcal).
* **Accordion List Items:** A vertical list of individual daily sessions (`25 April | 19:30` - `Quick Crosstrainer Workout`).
* **Expanded Details (Card Open State):** When tapped, a workout item reveals:
  * A comprehensive grid of the session's overall stats (Duration, Distance, Calories, Watt, Heart rate, Speed). 
  * A detailed Gold bar chart (e.g. 5 intervals) visually plotting intensity / resistance over the duration of the 25-minute workout.
  * A full-width `Share` outlined button affixed to the bottom of the card content.
