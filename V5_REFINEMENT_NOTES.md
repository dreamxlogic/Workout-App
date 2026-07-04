# Coach V5 UI Refinement Notes

## Implemented

- Enlarged all shared back-button hit areas to 48 by 48 pixels and made the plan-detail hero back control use the same component.
- Replaced translucent avatar compositing with real alpha cutouts. Added all eight finalized avatar choices and consistent Home, Coach Tip, Settings, and onboarding usage.
- Added partial-screen earned-badge celebrations with confetti and support for multiple badges earned at once.
- Updated the saved-plan hero to the Home soft-block visual language.
- Locked History to a polished three-card weekly overview and placed the interactive calendar directly below it.
- Renamed `Volume` to `lbs lifted` and removed the History Settings chip.
- Removed orange/coral palette choices and orange gradient mixing; added complementary green and blue themes.
- Restored the original Increments & Defaults preview and grouped stepper layout.
- Made profile-name editing save on input so Home and workout celebration copy stay current.
- Replaced placeholder avatar logic with the finalized `images/avatars` set.
- Made first-open onboarding a Coach-led flow that collects the user's name and avatar before the first workout.
- Corrected avatar direction, Coach-card headroom, male hero scale, Miles color, and the Atiya/Montez display names.
- Changed multi-badge feedback into a sequential `Next` flow with fresh confetti per badge.
- Replaced the Plans navigation icon with the approved clipboard/checklist shape.
- Changed recent workout labels to weekday-based names and made the Home badge card conditional on an earned badge.
- Fixed Add Set defaults so saved Settings values control new strength and cardio exercises instead of per-machine sample values.
- Standardized all eight Coach Tip crops to head-only portraits clipped at the card's lower edge.
- Expanded Coach-led Setup to five saved steps: name, large avatar selection, theme, favorite machines, and workout defaults; completion now lands on Home.
- Re-audited all 38 exercise thumbnails on a contrasting background and removed remaining edge-connected white matte fragments without regenerating the equipment artwork.
- Removed the remaining visible white matte boxes from exercise thumbnails by compositing the PNGs into their tinted thumbnail wells.

## Review board

Open `V5_REFINEMENT_OPTIONS.html` to compare:

1. Archived History card studies.
2. Archived Defaults layout studies.
3. Archived onboarding studies.

This board is now an archived exploration record. The working app uses one three-card History overview, the original Defaults screen, and Coach-led Setup.

## Recommended finalization order

1. Compare the 38-item catalog against the exact machines at the intended gym, if Coach is location-specific.
2. Run a full fresh-install walkthrough: onboarding, name/avatar selection, first set, difficulty rating, save workout, and multi-badge celebration sequence.
3. Run one returning-user walkthrough with migrated local data, including an older coral or blush theme and a legacy avatar ID.
4. Verify text scaling, VoiceOver labels, keyboard focus, and reduced-motion behavior.
5. Test on one small iPhone viewport and one larger Android viewport, including safe-area spacing and bottom-sheet reachability.
6. Create the final release archive after device QA.
