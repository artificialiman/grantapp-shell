# quiz-ui Taxonomy

This is the core invariant of the mastery engine. It is a dual-axis taxonomy applied per question. **Every question can carry multiple tags per axis** — tags are not mutually exclusive.

## Axis 1: Cognitive Pattern
The type of mental operation the question demands. (Base set — subject to refinement.)

- Pragmatic
- Logical
- Canon / Administrative
- Statistical / Predictive
- Pure Mathematical

Math questions may touch **Pure Mathematical** in addition to any Math-specific Information Type tags below — "math is math." This axis is not currently subject-expanded the way Information Type is.

## Axis 2: Information Type
The category of knowledge/content the question draws on.

### Base set
- Essential
- Contextual
- Abstract / Visual
- Procedural
- Mathematical Proofs

### Math expansion (additive, not a replacement)
Math's Information Type gets subject-specific sub-categories layered on top of the base set:

- Theory topics
- Law topics
- Formula topics
- Symbol / notation topics
- Pattern / process topics
- Interpretation (skill)
- Computation (skill)

Other JAMB subjects (Physics, English, Chemistry) have not yet received their own subject-specific expansions — TBD.

## Tagging rules
- Tag **robustly**: a question can and often should carry multiple values on each axis.
- Data model implication: each axis should be modeled as an array of tags per question, not a single enum value.
- Taxonomy vocabulary is expected to keep evolving — treat tag lists as extensible, not fixed enums baked into UI logic.

## Scope notes
- Current exam focus: **JAMB (UTME) only**. Other exams (SAT, AP, AWS Certs) are not active scope.
- quiz-ui must not dictate exam-organizer HTML/messaging — it should consume exam type as external context/config, not hard-code JAMB-specific chrome.
- Stack: **Svelte** (already in use in the repo).
