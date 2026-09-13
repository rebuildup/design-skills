# Interaction state references

Last reviewed: **2026-09-12**

Open these references when `interaction-states` is used. Compare semantics and behavior; do not copy exact colors, token values, dimensions, or component-specific styling.

## W3C / WAI

- [ARIA Authoring Practices Guide — Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
  - Observe: focus vs selection, persistent visible focus, selection-follows-focus trade-offs, disabled-control discoverability, pointer/keyboard consistency.
  - Useful for: deciding which state represents navigation position vs persistent choice.

- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria/)
  - Observe: semantic differences among `aria-pressed`, `aria-checked`, `aria-selected`, `aria-expanded`, `aria-current`, `aria-disabled`, `aria-readonly`, `aria-busy`, and `aria-invalid`.
  - Useful for: verifying that the visual state model corresponds to the component's actual meaning.
  - Avoid: adding ARIA only to reproduce a visual appearance; use native host-language semantics when available.

- [ARIA APG — Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
  - Observe: ordinary action button vs toggle button, `aria-pressed`, focus after activation, unavailable action semantics.
  - Useful for: separating momentary activation from persistent pressed state.

- [ARIA APG — Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
  - Observe: selected state vs focus, single vs multiple selection, selection-follows-focus behavior.
  - Useful for: testing dual focus/selection presentation.

## IBM Carbon

- [Carbon — Color: Interaction states](https://carbondesignsystem.com/elements/color/overview/#interaction-states)
  - Observe: enabled / hover / active / selected / focus / disabled roles; state tokens remain semantic across themes.
  - Useful for: comparing transient and persistent state treatment within a production design system.
  - Avoid copying: IBM palette step differences and exact token values.

- [Carbon — Tag](https://carbondesignsystem.com/components/tag/usage/)
  - Observe: read-only, operational, dismissible, selectable variants expose different applicable state sets.
  - Useful for: demonstrating that every component does not need every state.

- [Carbon — Form](https://carbondesignsystem.com/components/form/usage/)
  - Observe: enabled / active / focus / error / warning / disabled / skeleton distinctions.
  - Useful for: separating interaction state from validation/status and pending state.

## Adobe Spectrum

- [Spectrum — States](https://spectrum.adobe.com/page/states/)
  - Observe: user-initiated vs component-option states; default, hover, down, keyboard focus, disabled, selected, dragged, error.
  - Useful for: state taxonomy and checking which state categories are applicable to a component.

- [Spectrum — Combo box](https://spectrum.adobe.com/page/combo-box/)
  - Observe: error, disabled, read-only, keyboard/high-contrast treatment.
  - Useful for: disabled vs read-only comparison and state survival outside the default theme.

- [Spectrum — Swatch](https://spectrum.adobe.com/page/swatch/)
  - Observe: guidance to hide unavailable choices when showing disabled options would only create clutter, while retaining them when disappearance would confuse users.
  - Useful for: deciding whether unavailable options should remain visible.

## U.S. Web Design System

- [USWDS — Button](https://designsystem.digital.gov/components/button/)
  - Observe: default, hover, active, focus, native disabled, and `aria-disabled` examples across variants.
  - Useful for: comparing native disabled behavior with perceivable/focusable unavailable-state patterns.

## GitHub Primer

- [Primer — ActionList Guidelines](https://primer.style/product/components/action-list/guidelines/)
  - Observe: hover / active / focus, disabled and read-only item support, touch-adapted interactive lists.
  - Useful for: production UI comparison where one component family supports action, navigation, and option roles.

## Comparison checklist

When comparing references, record:

- Which states are transient and which persist?
- Which states encode input modality vs product meaning?
- Can focus and selection coexist and remain distinguishable?
- Is unavailable content removed, disabled, or read-only, and why?
- Which states remain focusable?
- Does the component expose every generic state, or only those meaningful to its role?
- How are error/status states distinguished from interactive feedback?
- Does state meaning survive dark/high-contrast/touch environments?
