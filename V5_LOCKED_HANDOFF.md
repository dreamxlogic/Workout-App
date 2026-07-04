# Coach V5 Locked Design Handoff

## Source of truth

The working app is `V5/index.html` with `V5/app.js` and `V5/styles.css`.
The `*-options.html` files remain design records only.

## Locked directions

- Navigation: Light Sculpted Rail with theme-linked active color; five destinations: Home, Workout, Plans, Calendar, Profile.
- Home: Soft Color Blocks hero, selected avatar portrait, Clean Float workout card, original recent-workout and badge layouts, polished week and coach cards.
- Workout: Sculpted Stage active-exercise card, all logged sets stacked under muscle tags, large uncropped exercise art, removable sets, emphasized Add Set, History, Done, Save, completed cards, Add Exercise, and Complete Workout.
- Info: Editorial Guide with chevron back, equipment image, muscle chips, numbered guidance, visible Safety Tip, and visible common mistakes. The Add to Workout CTA is intentionally removed.
- Exercise History: Progress Sheet with Current Best, range filters (`4W`, `3M`, `1Y`, `All`), horizontal timeline scrolling, selectable points, session/weekly/monthly aggregation, and progressively loaded session cards.

## History behavior

- `4W`: one point per workout session.
- `3M`: best working weight per week.
- `1Y` and `All`: best working weight per month.
- Weight is never averaged.
- Selecting a point shows the period, weight or duration, reps/intensity, set count, and rating.

## Image treatment

- All 76 machine PNGs were cleaned to remove hidden white matte data from transparent and partially transparent pixels.
- Tinted image surfaces use transparent cutout compositing so enclosed white background remnants blend cleanly without erasing legitimate white shoes or machine highlights.

## Verification baseline

- `node --check V5/app.js`
- `node --check V5/js/icons.js`
- JSON validation for `manifest.webmanifest` and `winners.json`
- Route smoke tests passed for Home, Active Workout, Info, and Exercise History.
- Interaction smoke tests passed for removing a set, opening Exercise History, switching to weekly aggregation, selecting a graph point, and saving workout progress.
- All machine PNGs are RGBA with transparent corners.

The in-app browser may block automated refreshes of `file://` URLs. Manual refresh is sufficient when reviewing locally.

## July 3 refinement delta

- Back controls now use a minimum 48 by 48 pixel interactive target, including the plan hero treatment.
- All eight finalized avatar portraits in `images/avatars` are wired to Home, Coach Tips, onboarding, and Settings with context-specific crops and flips.
- Dedicated transparent avatar cutouts remove the translucent rectangular backgrounds and protect headroom.
- Earned badges now open a partial-screen celebration modal with confetti. Plan-created badges use the same feedback pattern.
- Saved-plan heroes now use the Home soft-block background language and transparent machine art.
- History removes the Settings chip and calendar shortcut, labels weekly load as `lbs lifted`, uses one polished three-card weekly overview, and always shows the interactive calendar below it.
- Orange/coral theme choices and orange gradient mixing were removed. Green and blue were added as complementary palette choices.
- Increments & Defaults retains the original preview and grouped stepper layout.
- Fresh installs now enter a Coach-led name-and-avatar onboarding flow instead of automatically seeding demo history.
- `V5_REFINEMENT_OPTIONS.html` contains side-by-side alternatives for History cards, defaults, and onboarding.
- `CONTENT_AND_ASSET_AUDIT.md` records the complete 38-exercise, 76-machine-image audit.

## July 3 follow-up corrections

- Avatar framing now follows one rule: angled portraits face left in heroes and right in Coach cards; straight-on portraits remain straight.
- Coach cards preserve full headroom, and male Home heroes are scaled up so their heads reach the top visual zone.
- Miles uses a rebuilt neutral-color alpha matte without magenta-key despill shifting his skin green.
- Avatar display names now include Atiya and Montez.
- Multi-badge celebrations show one badge at a time with a `Next` CTA and replay confetti for every badge.
- Plans uses the custom clipboard/checklist SVG derived from the approved reference.
- Recent workout cards use weekday titles such as `Monday Workout`.
- Home hides the latest-badge card until a badge exists and uses only the current badge PNG artwork.
- Add Set now takes every new strength and cardio starting value directly from Settings. Machine sample data no longer overrides saved weight, reps, sets, or cardio minutes; optional last-used values still take precedence when enabled.
- Coach Tips use a shared portrait mask for all eight avatars: only the head portrait is visible, top overlap is allowed, and the image is clipped at the card's bottom edge.
- First-open Setup is now a five-step guided flow for name, a larger two-column avatar picker, theme, favorite machines, and workout defaults.
- Setup controls save into the same theme, favorite, and default fields used by Settings, then finish on Home without automatically launching a workout.
- Exercise thumbnails now use tinted-surface compositing to suppress faint semi-transparent white matte rectangles in the source PNGs.
