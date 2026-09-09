# ABOUT SECTION SPECIFICATION

Version: 2.0 (Corrected to match reference design exactly)

Priority: Critical

Section: About

Dependencies: Header Section

Status: Design Locked

---

# OBJECTIVE

Create a premium About section that feels like a world-class software engineer profile.

The section must communicate:

- Expertise
- Trust
- Experience
- Professionalism
- Technical depth
- Product mindset

The About section should feel closer to:

- Linear
- Stripe
- Vercel
- Apple
- Framer

and NOT like:

- Typical portfolio templates
- Generic developer websites
- Bootstrap layouts
- Dashboard designs

The About section must visually continue the Header section.

No visual disconnect is allowed.

**This is a strict visual reproduction task. The final result must match the approved reference image pixel-for-pixel in structure, content, and layout. Do not introduce new elements. Do not omit any element described below.**

---

# REQUIRED ANALYSIS BEFORE CODING

Before modifying any file:

Read and analyze:

- Header implementation
- Shared components
- Typography system
- Design tokens
- Animation utilities
- Theme configuration
- Container component
- Section wrapper
- Grid system
- Responsive utilities
- Existing assets
- Existing icons
- Existing spacing tokens

Verify:

- Imports
- Exports
- Dependencies
- Shared references

Never create duplicate components.

Never create duplicate styles.

---

# DESIGN PHILOSOPHY

This section is not a biography.

This section is a professional positioning statement.

Users should understand within 5 seconds:

Who is Ahmed?

What does he build?

Why should someone hire him?

What makes him different?

---

# SECTION STRUCTURE

The About section contains exactly these elements, nothing more, nothing less:

1. Section Header (eyebrow + heading)
2. Description Paragraph (left-aligned, short)
3. Personal Info Card
4. Core Values Card
5. Tech Focus Card

**Do NOT include:** a profile photo/portrait card, a CTA button, a statistics row, mission/vision/philosophy cards, a professional timeline, or a closing statement. None of these exist in the approved design. Statistics already live in the Hero section and the Timeline already lives in its own Experience section — do not duplicate them here.

---

# SECTION DIMENSIONS

Container Width:

1360px

Max Width:

1360px

Horizontal Padding:

Desktop:

48px

Tablet:

32px

Mobile:

20px

Top Padding:

140px

Bottom Padding:

140px

Section Gap:

120px

---

# SECTION HEADER

Left-aligned (not centered).

Contains:

Eyebrow Label

Main Heading

---

# EYEBROW LABEL

Text:

`/ ABOUT_ME`

(include the leading slash exactly as shown — it matches the eyebrow style used across all other sections, e.g. `/ SKILLS`, `/ EXPERIENCE`)

Font:

IBM Plex Mono

Size:

14px

Weight:

500

Letter Spacing:

2px

Color:

#AFAFAF

---

# MAIN HEADING

Text (exact):

`About Me`

Followed by a small decorative dot/bullet immediately after the text (matches the style of other section headings such as "Let's Build Something Great Together ●").

Max Width:

Not constrained to 900px — heading sits inline-width with its column.

Alignment:

Left

Desktop:

36px – 40px (large, bold single-line heading — NOT the 72px multi-line size used in the Hero)

Weight:

700

Line Height:

1.1

Letter Spacing:

Normal (do not apply the -2px tight tracking used in the Hero heading)

---

# DESCRIPTION

Position:

Directly below the heading, in the same left column.

Content (exact, three short sentences forming one paragraph):

"I'm a software engineer who loves building scalable, reliable and maintainable systems. I focus on backend development, system design and cloud-native solutions. I enjoy turning complex ideas into simple, performant and beautiful products."

Max Width:

~480px (fits within the left column only, does not span full width)

Font Size:

15px – 16px

Line Height:

1.7

Color:

#AFAFAF

Alignment:

**Left** (not centered)

---

# MAIN ABOUT LAYOUT

Desktop:

2 Columns

Grid:

Approximately 6fr / 5fr (left column = heading + description; right column = Personal Info card)

Gap:

40px – 56px

Alignment:

Top-aligned (not vertically centered)

Below this row, a second row spans the same width split into 2 cards side by side: Core Values (left) and Tech Focus (right).

---

# LEFT COLUMN (Row 1)

Contains only:

- Eyebrow Label
- Main Heading
- Description Paragraph

No profile image. No CTA button. No stats. Nothing else.

---

# RIGHT COLUMN (Row 1) — PERSONAL INFO CARD

Background:

#0D0D0D

Border:

1px solid #1F1F1F

Radius:

24px

Padding:

24px – 32px

Internal Label:

`PERSONAL INFO`

Font: IBM Plex Mono, 12px, letter-spacing 1.5px, color #AFAFAF

Rows (label left / value right, exact order, exactly 6 rows — do not omit Timezone or Email):

| Label | Value |
|---|---|
| Name | Ahmed ElGabbas |
| Role | Software Engineer |
| Location | Egypt |
| Timezone | GMT+2 |
| Email | hello@ahmedelgabbas.com |
| Availability | Available (rendered in an accent/success color, e.g. green) |

Row styling:

- Label: 13px–14px, color #AFAFAF
- Value: 13px–14px, color #FFFFFF (except Availability, which uses accent green)
- Divider: subtle 1px border between rows, or consistent vertical gap of ~14px if no divider
- Font for values: IBM Plex Mono acceptable for consistency with metadata style

---

# CORE VALUES CARD (Row 2, Left)

Background:

#0D0D0D

Border:

1px solid #1F1F1F

Radius:

24px

Padding:

24px – 32px

Internal Label:

`CORE VALUES`

Font: IBM Plex Mono, 12px, letter-spacing 1.5px, color #AFAFAF

Content:

A vertical list of exactly 5 items, each with a small icon (outline style, ~18px, opacity ~0.7) followed by a text label. Do NOT use large cards, do NOT add descriptions under each item — this is a compact icon + label list, one row per item, not a 3-card Mission/Vision/Philosophy grid.

Items in exact order:

1. Performance
2. Simplicity
3. Scalability
4. Clean Code
5. Ownership

Row height: ~36px each, left-aligned icon + label, 12px gap between icon and text.

---

# TECH FOCUS CARD (Row 2, Right)

Background:

#0D0D0D

Border:

1px solid #1F1F1F

Radius:

24px

Padding:

24px – 32px

Internal Label:

`TECH FOCUS`

Font: IBM Plex Mono, 12px, letter-spacing 1.5px, color #AFAFAF

Content:

A vertical stack of exactly 4 labeled progress bars. Each row = label + percentage value on the right, with a horizontal progress bar underneath filled to the corresponding percentage.

Items in exact order with exact values (do not change these numbers):

| Label | Percentage |
|---|---|
| Backend Development | 95% |
| System Design | 90% |
| API Architecture | 92% |
| Cloud & DevOps | 85% |

Progress bar styling:

- Track: full width, height ~4px, radius 999px, background rgba(255,255,255,.08)
- Fill: white or near-white, same radius, width = percentage value
- Label row: label on the left (13px–14px, #FFFFFF), percentage on the right (13px–14px, #AFAFAF)
- Vertical gap between each stat row: ~20px

---

# BACKGROUND SYSTEM

Keep consistent with the rest of the page — no additional background layers (no grid/noise/wireframe/particles) are required specifically for the About cards themselves. The cards sit on the page's existing dark background (#050505) with their own solid surface color (#0D0D0D). Do not add glow effects, gradients, or extra decorative layers not present elsewhere on the page.

---

# MOTION SYSTEM

Section Header:

Fade Up

Description:

Fade Up (slight delay after heading)

Personal Info / Core Values / Tech Focus Cards:

Stagger Fade Up (each card animates in slightly after the previous)

Tech Focus Progress Bars:

Animate fill width from 0 to target percentage on scroll into view

Duration:

400ms – 700ms

Easing:

easeOutExpo

---

# RESPONSIVE

DESKTOP

2 columns for Row 1 (heading/description | Personal Info), 2 columns for Row 2 (Core Values | Tech Focus)

TABLET

Single column, stacked in this order: Heading + Description → Personal Info → Core Values → Tech Focus

MOBILE

Single column, full width cards, same stacking order as Tablet

---

# ACCESSIBILITY

Semantic HTML

ARIA Labels

Keyboard Navigation

Visible Focus States

Alt Text

WCAG AA Contrast

---

# PERFORMANCE

Optimize Images

Lazy Load Media

Avoid Re-renders

Use GPU Transforms

Keep Animations Efficient

---

# FINAL QA

Verify against the reference image, item by item:

✓ Eyebrow reads exactly `/ ABOUT_ME`

✓ Heading reads exactly `About Me` with trailing dot, left-aligned, NOT the long "Building scalable software systems..." sentence

✓ Description is left-aligned (NOT centered), short (3 sentences), and constrained to the left column width only

✓ No profile photo/portrait card exists anywhere in this section

✓ No CTA button ("Let's Work Together" or similar) exists in this section

✓ Personal Info card exists with all 6 rows: Name, Role, Location, Timezone, Email, Availability

✓ Core Values card exists as a compact icon+label list with exactly 5 items: Performance, Simplicity, Scalability, Clean Code, Ownership — NOT as 3 large Mission/Vision/Philosophy cards

✓ Tech Focus card exists with exactly 4 progress bars at the exact values: Backend Development 95%, System Design 90%, API Architecture 92%, Cloud & DevOps 85%

✓ No Statistics Row (4+ Years / 20+ Projects / etc.) exists in this section — that content belongs only to the Hero section

✓ No Professional Timeline exists in this section — that content belongs only to the Experience section

✓ No Closing Statement exists in this section

✓ No TypeScript Errors

✓ No ESLint Errors

✓ No Runtime Errors

✓ No Broken Imports

✓ No Broken Exports

✓ Responsive Works

✓ Cards Hover Correctly

✓ Accessibility Passes

✓ Performance Optimized

✓ Visual Consistency With Header

✓ Premium Product Quality

✓ **Overall layout matches the approved reference image exactly — no extra sections, no missing sections, no substituted content**

---

# CLAUDE CODE FINAL INSTRUCTION

Do not redesign this section. Do not add creative elements not listed above. Do not reuse or duplicate content that already exists in other sections (Hero stats, Experience timeline).

Implement exactly as specified above — this spec has been corrected against the approved reference design and takes priority over any earlier version of this file.

After implementation:

1. Review every requirement in this file.
2. Compare the rendered implementation against the reference image, element by element.
3. Fix any missing, extra, or mismatched details.
4. Perform a second review.
5. Continue refining until the output is visually identical to the reference image.

Task is NOT complete until all requirements above are implemented and match the reference image exactly.