---
name: <skill-name>
description: >
  <Use this skill when...>
---

# <Skill Name>

<What this skill helps design, and its boundary. Keep this short.>

## Workflow

1. Inspect the current project / artifact context before applying an external style.
2. Open the relevant references below.
3. Compare multiple references using the observation axes.
4. Extract repeated relationships and trade-offs rather than copying one example.
5. Translate the findings into the current artifact.
6. Verify the delivered artifact itself.

## Observe

- <composition / layout axis>
- <typography axis>
- <color / material axis>
- <image / shape / texture axis>
- <motion / interaction axis if relevant>
- <medium-specific axis>

Delete axes that are irrelevant. Add domain-specific axes discovered during research.

## References

- [<Primary reference 1>](https://example.com/)
  - Observe: <what the agent should inspect>
  - Useful for: <when this reference is relevant>
- [<Primary reference 2>](https://example.com/)
  - Observe: <what the agent should inspect>
  - Useful for: <when this reference is relevant>

Add enough independent references to establish repeated patterns. Prefer primary artifacts, official guidance, and production examples.

## Avoid

- Do not infer the style from its name alone; inspect the references.
- Do not copy proprietary assets, brand identity, source code, or arbitrary pixel values.
- <domain-specific failure mode only if useful>

## Verify

- Compare the result against the extracted observation axes.
- Check the final rendered / exported / played-back artifact, not only the source representation.
- <domain-specific verification>

<!--
Optional sections when the research needs them:

## Variants
## Decision rules
## Historical context
## Current status
last-reviewed: YYYY-MM-DD
## Implementation notes

Move references into references/*.md only when the reference set becomes large enough that SKILL.md is hard to scan.
-->
