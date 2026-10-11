/* Chemistry definitions for the daily quiz.
   Wording follows the learning objectives of the Cambridge IGCSE Chemistry 0620 syllabus for 2026–2028
   ("Define…", "State that…", "Describe … as …"). Key words, the ones a mark scheme looks for, are in braces. */

QZ.addTopics('chem', {
  cdef1: 'Definitions: atoms, bonding and moles',
  cdef2: 'Definitions: reactions, energy and acids',
  cdef3: 'Definitions: metals, organic and lab terms',
});

QZ.defs('chem', 'cdef1', [
  { id: 'cd-protonno', g: 'num', term: 'Proton number (atomic number)', text: 'the {number of protons} in the {nucleus} of an atom' },
  { id: 'cd-massno', g: 'num', term: 'Mass number (nucleon number)', text: 'the {total number of protons and neutrons} in the {nucleus} of an atom', x: ['number of neutrons'] },
  { id: 'cd-isotopes', term: 'Isotopes', text: 'different atoms of the {same element} that have the {same number of protons} but {different numbers of neutrons}', x: ['different numbers of protons', 'same number of neutrons'] },
  { id: 'cd-ionic', g: 'bond', term: 'Ionic bond', text: 'a {strong electrostatic attraction} between {oppositely charged ions}', x: ['shared pair of electrons', 'delocalised electrons'] },
  { id: 'cd-covalent', g: 'bond', term: 'Covalent bond', text: 'formed when a {pair of electrons} is {shared} between two atoms, leading to {noble gas electronic configurations}', x: ['transferred', 'oppositely charged ions'] },
  { id: 'cd-metallic', g: 'bond', term: 'Metallic bonding', text: 'the {electrostatic attraction} between the {positive ions} in a {giant metallic lattice} and a ‘sea’ of {delocalised electrons}', x: ['negative ions', 'shared electrons'] },
  { id: 'cd-molform', g: 'formula', term: 'Molecular formula', text: 'the {number and type} of different atoms in {one molecule}', x: ['simplest whole number ratio'] },
  { id: 'cd-empform', g: 'formula', note: 'Supplement.', term: 'Empirical formula', text: 'the {simplest whole number ratio} of the different atoms or ions in a compound', x: ['number and type', 'one molecule'] },
  { id: 'cd-ar', term: 'Relative atomic mass, <var>A</var><sub>r</sub>', text: 'the {average mass} of the {isotopes} of an element compared to {1/12th} of the mass of an atom of <sup>12</sup>C', x: ['1/16th', 'total mass'] },
  { id: 'cd-mr', term: 'Relative molecular mass, <var>M</var><sub>r</sub>', text: 'the {sum} of the {relative atomic masses}', note: 'For ionic compounds the same thing is called relative formula mass, <var>M</var><sub>r</sub>.', x: ['average'] },
  { id: 'cd-mole', term: 'The mole, mol', text: 'the {unit of amount of substance}; one mole contains {6.02 × 10<sup>23</sup>} particles, e.g. atoms, ions, molecules', note: 'Supplement. This number, 6.02 × 10<sup>23</sup>, is the Avogadro constant.', x: ['6.02 × 10<sup>−23</sup>', '6.02 × 10<sup>32</sup>', 'unit of mass'] },
]);

QZ.defs('chem', 'cdef2', [
  { id: 'cd-electrolysis', term: 'Electrolysis', text: 'the {decomposition} of an {ionic compound}, when {molten or in aqueous solution}, by the passage of an {electric current}', x: ['covalent compound', 'solid'] },
  { id: 'cd-anode', g: 'elec', term: 'Anode', text: 'the {positive} electrode' },
  { id: 'cd-cathode', g: 'elec', term: 'Cathode', text: 'the {negative} electrode' },
  { id: 'cd-electrolyte', g: 'elec', term: 'Electrolyte', text: 'the {molten or aqueous substance} that {undergoes electrolysis}' },
  { id: 'cd-exo', g: 'energy', term: 'Exothermic reaction', text: '{transfers} thermal energy {to the surroundings}, leading to an {increase} in the temperature of the surroundings', x: ['takes in', 'from the surroundings'] },
  { id: 'cd-endo', g: 'energy', term: 'Endothermic reaction', text: '{takes in} thermal energy {from the surroundings}, leading to a {decrease} in the temperature of the surroundings', x: ['transfers', 'to the surroundings'] },
  { id: 'cd-dh', g: 'energy', note: 'Supplement.', term: 'Enthalpy change, Δ<var>H</var>', text: 'the {transfer of thermal energy} during a reaction; Δ<var>H</var> is {negative} for exothermic reactions and {positive} for endothermic reactions' },
  { id: 'cd-ea', note: 'Supplement.', term: 'Activation energy, <var>E</var><sub>a</sub>', text: 'the {minimum energy} that {colliding particles} must have {to react}', x: ['average energy'] },
  { id: 'cd-catalyst', note: 'The activation energy part is Supplement.', term: 'Catalyst', text: '{increases the rate} of a reaction and is {unchanged} at the end of a reaction; it {decreases the activation energy}, <var>E</var><sub>a</sub>', x: ['used up', 'increases the activation energy'] },
  { id: 'cd-equilibrium', sw: [['rate of the forward reaction', 'rate of the reverse reaction']], term: 'Equilibrium', note: 'Supplement.', text: 'a reversible reaction in a {closed system} is at equilibrium when the {rate of the forward reaction} is equal to the {rate of the reverse reaction} and the {concentrations} of reactants and products are {no longer changing}', x: ['open system', 'equal'] },
  { id: 'cd-redox', g: 'redox', term: 'Redox reactions', text: 'reactions involving {simultaneous} {oxidation and reduction}' },
  { id: 'cd-oxidation', g: 'redox', sw: [['gain of oxygen', 'loss of electrons', 'increase in oxidation number']], term: 'Oxidation', text: '{gain of oxygen}; also {loss of electrons} and an {increase in oxidation number}', note: 'Loss of electrons and increase in oxidation number are Supplement.', x: ['loss of oxygen', 'gain of electrons', 'decrease in oxidation number'] },
  { id: 'cd-reduction', g: 'redox', sw: [['loss of oxygen', 'gain of electrons', 'decrease in oxidation number']], term: 'Reduction', text: '{loss of oxygen}; also {gain of electrons} and a {decrease in oxidation number}', note: 'Gain of electrons and decrease in oxidation number are Supplement.', x: ['gain of oxygen', 'loss of electrons', 'increase in oxidation number'] },
  { id: 'cd-oxagent', g: 'agent', note: 'Supplement.', term: 'Oxidising agent', text: 'a substance that {oxidises} another substance and is itself {reduced}' },
  { id: 'cd-redagent', g: 'agent', note: 'Supplement.', term: 'Reducing agent', text: 'a substance that {reduces} another substance and is itself {oxidised}' },
  { id: 'cd-bases', g: 'acid', term: 'Bases and alkalis', text: 'bases are {oxides or hydroxides} of metals and alkalis are {soluble bases}', x: ['insoluble bases', 'proton donors'] },
  { id: 'cd-ions', g: 'acid', term: 'Acids and alkalis in water', text: 'aqueous solutions of acids contain {H<sup>+</sup>} ions and aqueous solutions of alkalis contain {OH<sup>−</sup>} ions', x: ['Cl<sup>−</sup>', 'Na<sup>+</sup>'] },
  { id: 'cd-bronsted', g: 'acid', note: 'Supplement.', term: 'Acids and bases, in terms of protons', text: 'acids are {proton donors} and bases are {proton acceptors}', x: ['electron donors', 'electron acceptors'] },
  { id: 'cd-strong', g: 'strength', note: 'Supplement.', term: 'Strong acid', text: 'an acid that is {completely dissociated} in {aqueous solution}', x: ['concentrated'] },
  { id: 'cd-weak', g: 'strength', note: 'Supplement.', term: 'Weak acid', text: 'an acid that is {partially dissociated} in {aqueous solution}', x: ['dilute'] },
  { id: 'cd-amphoteric', note: 'Supplement.', term: 'Amphoteric oxides', text: 'oxides that {react with acids and with bases} to produce {a salt and water}', x: ['react with neither acids nor bases', 'a salt and hydrogen'] },
  { id: 'cd-hydrated', g: 'hyd', term: 'Hydrated substance', text: 'a substance that is {chemically combined with water}', x: ['dissolved in water'] },
  { id: 'cd-anhydrous', g: 'hyd', term: 'Anhydrous substance', text: 'a substance {containing no water}' },
  { id: 'cd-woc', g: 'hyd', note: 'Supplement.', term: 'Water of crystallisation', text: 'the {water molecules} present in {hydrated crystals}, including CuSO<sub>4</sub>•5H<sub>2</sub>O and CoCl<sub>2</sub>•6H<sub>2</sub>O' },
]);

QZ.defs('chem', 'cdef3', [
  { id: 'cd-ptable', term: 'The Periodic Table', text: 'an arrangement of elements in {periods and groups} and in order of {increasing proton number/atomic number}', x: ['increasing mass number', 'increasing relative atomic mass'] },
  { id: 'cd-transition', sw: [['high densities', 'high melting points']], term: 'Transition elements', text: 'metals that have {high densities}, have {high melting points}, form {coloured compounds} and often act as {catalysts} as elements and in compounds', note: 'Supplement: their ions have variable oxidation numbers, including iron(II) and iron(III).', x: ['low densities', 'white compounds', 'low melting points'] },
  { id: 'cd-noble', sw: [['unreactive', 'monatomic']], term: 'Group VIII noble gases', text: '{unreactive}, {monatomic} gases', note: 'Explained by their full outer shells (stable electronic configuration).', x: ['diatomic', 'reactive'] },
  { id: 'cd-alloy', term: 'Alloy', text: 'a {mixture} of a {metal} with {other elements}', note: 'Brass is a mixture of copper and zinc. Stainless steel is a mixture of iron and other elements such as chromium, nickel and carbon.', x: ['compound', 'non-metal only'] },
  { id: 'cd-brass', g: 'alloyx', sw: [['copper', 'zinc']], term: 'Brass', text: 'a mixture of {copper} and {zinc}', x: ['iron', 'tin', 'chromium'] },
  { id: 'cd-steel', g: 'alloyx', sw: [['chromium', 'carbon']], term: 'Stainless steel', text: 'a mixture of {iron} and other elements such as {chromium}, nickel and {carbon}', x: ['copper', 'zinc'] },
  { id: 'cd-fgroup', g: 'org', term: 'Functional group', text: 'an {atom or group of atoms} that determine the {chemical properties} of a {homologous series}', x: ['physical properties'] },
  { id: 'cd-homol', g: 'org', term: 'Homologous series', text: 'a {family} of similar compounds with {similar chemical properties} due to the presence of the {same functional group}', note: 'Supplement: they have the same functional group and the same general formula, differ by a –CH<sub>2</sub>– unit from one member to the next, show a trend in physical properties and share similar chemical properties.', x: ['same physical properties', 'same molecular formula'] },
  { id: 'cd-saturated', g: 'sat', term: 'Saturated compound', text: 'has molecules in which {all} carbon–carbon bonds are {single bonds}', x: ['double bonds'] },
  { id: 'cd-unsaturated', g: 'sat', term: 'Unsaturated compound', text: 'has molecules in which {one or more} carbon–carbon bonds are {not single bonds}', x: ['all', 'single bonds'] },
  { id: 'cd-isomers', g: 'org', term: 'Structural isomers', text: 'compounds with the {same molecular formula}, but {different structural formulae}', note: 'Supplement. For example C<sub>4</sub>H<sub>10</sub> as CH<sub>3</sub>CH<sub>2</sub>CH<sub>2</sub>CH<sub>3</sub> and CH<sub>3</sub>CH(CH<sub>3</sub>)CH<sub>3</sub>.', x: ['different molecular formulae', 'same structural formula'] },
  { id: 'cd-hydrocarbon', term: 'Hydrocarbons', text: 'compounds that contain {hydrogen and carbon only}', x: ['hydrogen, carbon and oxygen'] },
  { id: 'cd-petroleum', term: 'Petroleum', text: 'a {mixture} of {hydrocarbons}', x: ['compound', 'alcohols'] },
  { id: 'cd-polymers', term: 'Polymers', text: '{large molecules} built up from many {smaller molecules} called {monomers}', note: 'Plastics are made from polymers. Proteins are natural polyamides made from amino acid monomers.', x: ['isomers', 'atoms'] },
  { id: 'cd-solvent', g: 'sol', term: 'Solvent', text: 'a substance that {dissolves} a solute' },
  { id: 'cd-solute', g: 'sol', term: 'Solute', text: 'a substance that is {dissolved} in a solvent' },
  { id: 'cd-solution', g: 'sol', term: 'Solution', text: 'a {mixture} of one or more {solutes} dissolved in a {solvent}', x: ['compound'] },
  { id: 'cd-satsol', g: 'sol', term: 'Saturated solution', text: 'a solution containing the {maximum concentration} of a solute dissolved in the solvent at a {specified temperature}', x: ['minimum concentration', 'any temperature'] },
  { id: 'cd-residue', g: 'sep', term: 'Residue', text: 'a substance that {remains} after evaporation, distillation, filtration or any similar process', x: ['passes through'] },
  { id: 'cd-filtrate', g: 'sep', term: 'Filtrate', text: 'a {liquid or solution} that has {passed through a filter}', x: ['remains on the filter'] },
]);
