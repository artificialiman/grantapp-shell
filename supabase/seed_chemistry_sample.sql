-- Sample question seed — Chemistry, drawn from real JAMB syllabus topics
-- (Separation of Mixtures, Atomic Structure, Chemical Bonding,
-- Stoichiometry — confirmed against the 2026 JAMB syllabus). This is a
-- small starter set (10 questions) to exercise the schema and adaptive
-- engine end-to-end, NOT the 10,000-question bank itself — that's a
-- separate authoring/import effort via /admin/questions.
--
-- Tagged against TAXONOMY.md's dual axes. Tag choices here are a
-- reasonable first pass, not canon — Iman should treat these as
-- editable once real content review starts.

insert into public.questions
  (subject, topic, subtopic, cognitive_patterns, information_types, prompt, options, correct_option_id, explanation, negative_marking_value, difficulty, source, created_by)
values
  (
    'chemistry', 'Separation of Mixtures and Purification of Chemical Substances', 'Distillation',
    array['Procedural / supply chain'], array['Essential / definitive', 'Procedural / supply chain'],
    'Which separation technique is most suitable for separating a mixture of ethanol and water?',
    '[{"id":"a","text":"Filtration"},{"id":"b","text":"Fractional distillation"},{"id":"c","text":"Decantation"},{"id":"d","text":"Sublimation"}]'::jsonb,
    'b',
    'Ethanol and water are miscible liquids with different boiling points, so fractional distillation separates them by boiling point.',
    0.25, 2, 'JAMB-style, authored', 'seed'
  ),
  (
    'chemistry', 'Separation of Mixtures and Purification of Chemical Substances', 'Chromatography',
    array['Pragmatic'], array['Essential / definitive'],
    'Paper chromatography is commonly used to separate the components of which of the following?',
    '[{"id":"a","text":"Crude oil"},{"id":"b","text":"Plant pigments"},{"id":"c","text":"Salt and sand"},{"id":"d","text":"Iron filings and sulfur"}]'::jsonb,
    'b',
    'Chromatography separates substances based on differential movement through a medium — classically used for pigments like chlorophyll.',
    0.25, 1, 'JAMB-style, authored', 'seed'
  ),
  (
    'chemistry', 'Atomic Structure and Bonding', 'Electronic Configuration',
    array['Logical'], array['Essential / definitive', 'Theory topics'],
    'What is the electronic configuration of an atom with atomic number 12?',
    '[{"id":"a","text":"2,8,2"},{"id":"b","text":"2,8,1"},{"id":"c","text":"2,2,8"},{"id":"d","text":"2,10"}]'::jsonb,
    'a',
    'Atomic number 12 (magnesium) fills shells in order: 2 electrons in the 1st shell, 8 in the 2nd, 2 in the 3rd.',
    0.25, 2, 'JAMB-style, authored', 'seed'
  ),
  (
    'chemistry', 'Atomic Structure and Bonding', 'Periodic Trends',
    array['Logical', 'Statistical / Predictive'], array['Theory topics', 'Pattern / process topics'],
    'Across a period from left to right, atomic radius generally:',
    '[{"id":"a","text":"Increases"},{"id":"b","text":"Decreases"},{"id":"c","text":"Stays constant"},{"id":"d","text":"Increases then decreases"}]'::jsonb,
    'b',
    'Across a period, increasing nuclear charge pulls electrons closer, so atomic radius decreases left to right.',
    0.25, 3, 'JAMB-style, authored', 'seed'
  ),
  (
    'chemistry', 'Chemical Bonding', 'Covalent Bonding',
    array['Logical'], array['Essential / definitive', 'Theory topics'],
    'Which type of bond is formed when two atoms share a pair of electrons?',
    '[{"id":"a","text":"Ionic bond"},{"id":"b","text":"Covalent bond"},{"id":"c","text":"Metallic bond"},{"id":"d","text":"Hydrogen bond"}]'::jsonb,
    'b',
    'A covalent bond forms when two atoms share one or more pairs of electrons.',
    0.25, 1, 'JAMB-style, authored', 'seed'
  ),
  (
    'chemistry', 'Chemical Bonding', 'VSEPR Theory',
    array['Logical', 'Statistical / Predictive'], array['Abstract / Visual', 'Theory topics'],
    'According to VSEPR theory, a molecule with 4 bonding pairs and no lone pairs on the central atom has what shape?',
    '[{"id":"a","text":"Trigonal planar"},{"id":"b","text":"Tetrahedral"},{"id":"c","text":"Linear"},{"id":"d","text":"Bent"}]'::jsonb,
    'b',
    'Four bonding pairs with no lone pairs arrange themselves tetrahedrally to minimize electron repulsion.',
    0.25, 3, 'JAMB-style, authored', 'seed'
  ),
  (
    'chemistry', 'Stoichiometry and Chemical Calculations', 'Mole Concept',
    array['Pure Mathematical'], array['Formula topics', 'Computation (skill)'],
    'How many moles are in 22g of CO2? (C=12, O=16)',
    '[{"id":"a","text":"0.5 mol"},{"id":"b","text":"1.0 mol"},{"id":"c","text":"2.0 mol"},{"id":"d","text":"22 mol"}]'::jsonb,
    'a',
    'Molar mass of CO2 = 12 + (16×2) = 44 g/mol. Moles = 22g / 44g/mol = 0.5 mol.',
    0.25, 2, 'JAMB-style, authored', 'seed'
  ),
  (
    'chemistry', 'Stoichiometry and Chemical Calculations', 'Balancing Equations',
    array['Procedural / supply chain', 'Pure Mathematical'], array['Procedural / supply chain', 'Symbol / notation topics'],
    'Balance the equation: __N2 + __H2 -> __NH3',
    '[{"id":"a","text":"1, 3, 2"},{"id":"b","text":"2, 3, 1"},{"id":"c","text":"1, 2, 3"},{"id":"d","text":"2, 1, 2"}]'::jsonb,
    'a',
    'N2 + 3H2 -> 2NH3 balances both nitrogen (2=2) and hydrogen (6=6) atoms on each side.',
    0.25, 2, 'JAMB-style, authored', 'seed'
  ),
  (
    'chemistry', 'States of Matter', 'Gas Laws',
    array['Pure Mathematical', 'Statistical / Predictive'], array['Formula topics', 'Computation (skill)'],
    'Using Boyle''s Law, if a gas occupies 4L at 2atm, what volume will it occupy at 1atm (constant temperature)?',
    '[{"id":"a","text":"2L"},{"id":"b","text":"4L"},{"id":"c","text":"8L"},{"id":"d","text":"16L"}]'::jsonb,
    'c',
    'Boyle''s Law: P1V1 = P2V2. (2)(4) = (1)(V2), so V2 = 8L.',
    0.25, 3, 'JAMB-style, authored', 'seed'
  ),
  (
    'chemistry', 'States of Matter', 'Kinetic Theory',
    array['Logical'], array['Essential / definitive', 'Theory topics'],
    'According to the kinetic theory of matter, particles in a gas:',
    '[{"id":"a","text":"Are tightly packed and vibrate in place"},{"id":"b","text":"Move randomly and rapidly with large spaces between them"},{"id":"c","text":"Are arranged in a fixed lattice"},{"id":"d","text":"Do not move at all"}]'::jsonb,
    'b',
    'Gas particles have high kinetic energy, move randomly and rapidly, and have large spaces between them relative to solids/liquids.',
    0.25, 1, 'JAMB-style, authored', 'seed'
  );
