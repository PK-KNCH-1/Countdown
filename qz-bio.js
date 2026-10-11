/* Biology deck: definitions, food tests, animal groups, enzymes, equations and nutrients.
   Definitions use the wording of the Cambridge IGCSE Biology 0610 syllabus for 2026–2028
   ("Describe X as …", "Define X as …"). Key words, the ones a mark scheme looks for, are in braces. */

(() => {
  const { mcq, addCard, addTopics, defs, shuffle } = QZ;

  addTopics('bio', {
    bdef1: 'Definitions: life processes, transport and nutrition',
    bdef2: 'Definitions: disease, respiration, coordination and reproduction',
    bdef3: 'Definitions: inheritance and variation',
    bdef4: 'Definitions: ecology and biotechnology',
    bfood: 'Food tests',
    bclass: 'Animal groups',
    bfacts: 'Enzymes, equations and nutrients',
  });

  /* ── definitions ── */
  defs('bio', 'bdef1', [
    { id: 'bd-movement', g: 'mrs', term: 'Movement', text: 'an {action} by an organism or part of an organism causing a {change of position or place}', note: 'One of the seven characteristics of living organisms.' },
    { id: 'bd-respiration', g: 'mrs', term: 'Respiration', text: 'the {chemical reactions} in {cells} that break down {nutrient molecules} and {release energy} for metabolism', note: 'One of the seven characteristics of living organisms.', x: ['physical processes', 'take in energy'] },
    { id: 'bd-sensitivity', g: 'mrs', term: 'Sensitivity', text: 'the ability to {detect} and {respond} to {changes} in the internal or external environment', note: 'One of the seven characteristics of living organisms.' },
    { id: 'bd-growth', g: 'mrs', sw: [['size', 'dry mass']], term: 'Growth', text: 'a {permanent increase} in {size} and {dry mass}', note: 'One of the seven characteristics of living organisms.', x: ['temporary increase', 'wet mass'] },
    { id: 'bd-reproduction', g: 'mrs', term: 'Reproduction', text: 'the {processes} that make {more of the same kind} of organism', note: 'One of the seven characteristics of living organisms.' },
    { id: 'bd-excretion', g: 'mrs', term: 'Excretion', text: 'the {removal} of the {waste products of metabolism} and {substances in excess} of requirements', note: 'One of the seven characteristics of living organisms. Not the same as egestion (getting rid of undigested food).', x: ['undigested food'] },
    { id: 'bd-nutrition', g: 'mrs', term: 'Nutrition', text: 'the {taking in} of materials for {energy}, {growth and development}', note: 'One of the seven characteristics of living organisms.' },
    { id: 'bd-species', term: 'Species', text: 'a group of organisms that can {reproduce} to produce {fertile offspring}', x: ['identical offspring', 'sterile offspring'] },
    { id: 'bd-binomial', term: 'Binomial system', text: 'an {internationally agreed} system in which the scientific name of an organism is made up of {two parts} showing the {genus and species}', x: ['kingdom and species', 'three parts'] },
    { id: 'bd-diffusion', g: 'move', term: 'Diffusion', text: 'the {net movement} of {particles} from a region of their {higher} concentration to a region of their {lower} concentration (i.e. down a concentration gradient), as a result of their {random movement}', x: ['using energy from respiration'] },
    { id: 'bd-osmosis', g: 'move', term: 'Osmosis', text: 'the {net movement} of {water molecules} from a region of {higher} water potential (dilute solution) to a region of {lower} water potential (concentrated solution), through a {partially permeable membrane}', note: 'Supplement.', x: ['fully permeable membrane', 'particles'] },
    { id: 'bd-active', g: 'move', term: 'Active transport', text: 'the movement of particles through a cell membrane from a region of {lower} concentration to a region of {higher} concentration (i.e. {against a concentration gradient}), using {energy from respiration}', x: ['down a concentration gradient', 'random movement'] },
    { id: 'bd-catalyst', g: 'enz', nx: ['Enzymes'], term: 'Catalyst', text: 'a substance that {increases the rate} of a chemical reaction and is {not changed} by the reaction', x: ['used up'] },
    { id: 'bd-enzymes', g: 'enz', term: 'Enzymes', text: '{proteins} that are involved in all {metabolic reactions}, where they function as {biological catalysts}', x: ['carbohydrates', 'fats'] },
    { id: 'bd-photosynthesis', term: 'Photosynthesis', text: 'the process by which plants {synthesise carbohydrates} from {raw materials} using {energy from light}', x: ['break down carbohydrates', 'energy from respiration'] },
    { id: 'bd-chlorophyll', term: 'Chlorophyll', text: 'a {green pigment} that is found in {chloroplasts}', x: ['mitochondria', 'vacuoles'] },
    { id: 'bd-physdig', g: 'dig', term: 'Physical digestion', text: 'the breakdown of food into {smaller pieces} {without chemical change} to the food molecules', x: ['small soluble molecules'] },
    { id: 'bd-chemdig', g: 'dig', term: 'Chemical digestion', text: 'the breakdown of {large insoluble molecules} into {small soluble molecules}', x: ['smaller pieces', 'large soluble molecules'] },
    { id: 'bd-transpiration', g: 'plant', term: 'Transpiration', text: 'the {loss of water vapour} from {leaves}', x: ['roots', 'uptake of water'] },
    { id: 'bd-translocation', g: 'plant', term: 'Translocation', text: 'the movement of {sucrose and amino acids} in {phloem} from {sources to sinks}', x: ['xylem', 'sinks to sources', 'water and mineral ions'] },
    { id: 'bd-source', g: 'plant', term: 'Sources (in plants)', text: 'the parts of plants that {release} sucrose or amino acids', x: ['use or store'] },
    { id: 'bd-sink', g: 'plant', term: 'Sinks (in plants)', text: 'the parts of plants that {use or store} sucrose or amino acids', x: ['release'] },
    { id: 'bd-circulatory', term: 'Circulatory system', text: 'a system of {blood vessels} with a {pump} and {valves} to ensure {one-way flow} of blood' },
    { id: 'bd-clotting', term: 'Clotting', text: 'the conversion of {fibrinogen} to {fibrin} to form a {mesh}', note: 'Supplement.', x: ['haemoglobin', 'platelets'] },
  ]);

  defs('bio', 'bdef2', [
    { id: 'bd-pathogen', g: 'dis', term: 'Pathogen', text: 'a {disease-causing organism}', x: ['protein that binds to antigens'] },
    { id: 'bd-transmissible', g: 'dis', term: 'Transmissible disease', text: 'a disease in which the {pathogen} can be {passed from one host to another}', x: ['antibody', 'inherited'] },
    { id: 'bd-activeimm', g: 'imm', term: 'Active immunity', text: 'defence against a pathogen by {antibody production} {in the body}', note: 'Supplement. Gained after an infection or by vaccination.', x: ['antibodies acquired from another individual'] },
    { id: 'bd-passiveimm', g: 'imm', term: 'Passive immunity', text: 'a {short-term} defence against a pathogen by {antibodies acquired from another individual}, including across the {placenta} and in {breast milk}', note: 'Supplement.', x: ['long-term', 'antibody production in the body'] },
    { id: 'bd-antibodies', g: 'imm', term: 'Antibodies', text: '{proteins} that {bind to antigens} leading to direct destruction of pathogens or {marking of pathogens} for destruction by {phagocytes}', note: 'Supplement.', x: ['carbohydrates', 'lymphocytes'] },
    { id: 'bd-cholera', term: 'Cholera', text: 'a disease caused by a {bacterium} which is transmitted in {contaminated water}', x: ['virus', 'contaminated air'] },
    { id: 'bd-aerobic', g: 'resp', term: 'Aerobic respiration', text: 'the chemical reactions in cells that {use oxygen} to break down {nutrient molecules} to {release energy}', x: ['without using oxygen'] },
    { id: 'bd-anaerobic', g: 'resp', term: 'Anaerobic respiration', text: 'the chemical reactions in cells that break down {nutrient molecules} to {release energy} {without using oxygen}', x: ['use oxygen'] },
    { id: 'bd-deamination', term: 'Deamination', text: 'the removal of the {nitrogen-containing part} of {amino acids} to form {urea}', note: 'Supplement. Happens in the liver.', x: ['fatty acids', 'glucose'] },
    { id: 'bd-synapse', term: 'Synapse', text: 'a {junction} between {two neurones}', x: ['gap between two muscles'] },
    { id: 'bd-senseorgans', term: 'Sense organs', text: 'groups of {receptor cells} responding to {specific stimuli}: light, sound, touch, temperature and chemicals', x: ['effectors'] },
    { id: 'bd-hormone', term: 'Hormone', text: 'a {chemical substance}, produced by a {gland} and carried by the {blood}, which alters the activity of one or more specific {target organs}', x: ['nerve impulse', 'neurone'] },
    { id: 'bd-homeostasis', term: 'Homeostasis', text: 'the {maintenance} of a {constant internal environment}', x: ['changing internal environment'] },
    { id: 'bd-gravitropism', g: 'trop', term: 'Gravitropism', text: 'a response in which parts of a plant {grow} towards or away from {gravity}', x: ['the direction of the light source'] },
    { id: 'bd-phototropism', g: 'trop', term: 'Phototropism', text: 'a response in which parts of a plant {grow} towards or away from the {direction of the light source}', x: ['gravity'] },
    { id: 'bd-drug', term: 'Drug', text: 'any substance taken into the body that {modifies or affects} {chemical reactions} in the body' },
    { id: 'bd-asexual', g: 'repro', term: 'Asexual reproduction', text: 'a process resulting in the production of {genetically identical} offspring from {one parent}', x: ['genetically different', 'two parents'] },
    { id: 'bd-sexual', g: 'repro', term: 'Sexual reproduction', text: 'a process involving the {fusion} of the nuclei of {two gametes} to form a {zygote} and the production of offspring that are {genetically different} from each other', x: ['genetically identical', 'one parent'] },
    { id: 'bd-fertilisation', g: 'repro', term: 'Fertilisation', text: 'the {fusion} of the {nuclei} of {gametes}', note: 'In humans: the fusion of the nuclei from a male gamete (sperm) and a female gamete (egg cell).', x: ['transfer of pollen'] },
    { id: 'bd-pollination', g: 'poll', term: 'Pollination', text: 'the {transfer} of {pollen grains} from an {anther} to a {stigma}', x: ['fusion', 'stigma to an anther'] },
    { id: 'bd-selfpoll', g: 'poll', term: 'Self-pollination', text: 'the transfer of pollen grains from the anther of a flower to the stigma of the {same flower} or a {different flower on the same plant}', note: 'Supplement.', x: ['different plant of the same species'] },
    { id: 'bd-crosspoll', g: 'poll', term: 'Cross-pollination', text: 'the transfer of pollen grains from the anther of a flower to the stigma of a flower on a {different plant} of the {same species}', note: 'Supplement.', x: ['same flower', 'different species'] },
    { id: 'bd-sti', term: 'Sexually transmitted infection (STI)', text: 'an infection that is {transmitted} through {sexual contact}', x: ['contaminated water'] },
  ]);

  defs('bio', 'bdef3', [
    { id: 'bd-gene', g: 'gen', term: 'Gene', text: 'a length of {DNA} that {codes for a protein}', x: ['RNA', 'codes for a carbohydrate'] },
    { id: 'bd-allele', g: 'gen', term: 'Allele', text: 'an {alternative form} of a {gene}', x: ['chromosome'] },
    { id: 'bd-haploid', g: 'ploid', term: 'Haploid nucleus', text: 'a nucleus containing {a single set} of {chromosomes}' },
    { id: 'bd-diploid', g: 'ploid', term: 'Diploid nucleus', text: 'a nucleus containing {two sets} of {chromosomes}' },
    { id: 'bd-mitosis', g: 'div', term: 'Mitosis', text: '{nuclear division} giving rise to {genetically identical} cells', x: ['genetically different', 'reduction division'] },
    { id: 'bd-meiosis', g: 'div', term: 'Meiosis', text: 'a {reduction division} in which the {chromosome number} is {halved} from {diploid} to {haploid} resulting in {genetically different} cells', x: ['doubled', 'genetically identical'] },
    { id: 'bd-stem', g: 'div', term: 'Stem cells', text: '{unspecialised} cells that divide by {mitosis} to produce daughter cells that can become {specialised} for specific functions', x: ['meiosis'] },
    { id: 'bd-inheritance', term: 'Inheritance', text: 'the {transmission} of {genetic information} from {generation to generation}' },
    { id: 'bd-genotype', g: 'type', term: 'Genotype', text: 'the {genetic make-up} of an organism and in terms of the {alleles present}', x: ['observable features'] },
    { id: 'bd-phenotype', g: 'type', term: 'Phenotype', text: 'the {observable features} of an organism', x: ['genetic make-up'] },
    { id: 'bd-homozygous', g: 'zyg', term: 'Homozygous', text: 'having {two identical alleles} of a {particular gene}', x: ['two different alleles'] },
    { id: 'bd-heterozygous', g: 'zyg', term: 'Heterozygous', text: 'having {two different alleles} of a {particular gene}', x: ['two identical alleles'] },
    { id: 'bd-dominant', g: 'dom', term: 'Dominant allele', text: 'an allele that is {expressed} if it is {present} in the genotype', x: ['only expressed'] },
    { id: 'bd-recessive', g: 'dom', term: 'Recessive allele', text: 'an allele that is {only expressed} when there is {no dominant allele} of the gene present in the genotype' },
    { id: 'bd-codominance', g: 'dom', term: 'Codominance', text: 'a situation in which {both alleles} in {heterozygous} organisms {contribute to the phenotype}', note: 'Supplement.', x: ['homozygous', 'neither allele'] },
    { id: 'bd-sexlinked', term: 'Sex-linked characteristic', text: 'a feature in which the gene responsible is located on a {sex chromosome} and that this makes the characteristic {more common in one sex} than in the other', note: 'Supplement.', x: ['equally common in both sexes'] },
    { id: 'bd-variation', g: 'var', nx: ['Mutation', 'Gene mutation'], term: 'Variation', text: '{differences} between individuals of the {same species}', x: ['different species'] },
    { id: 'bd-mutation', term: 'Mutation', text: '{genetic change}' },
    { id: 'bd-genemut', term: 'Gene mutation', text: 'a {random change} in the {base sequence} of {DNA}', note: 'Supplement.', x: ['planned change', 'amino acid sequence'] },
    { id: 'bd-adaptivefeat', g: 'adapt', term: 'Adaptive feature', text: 'an {inherited} feature that helps an organism to {survive and reproduce} in its {environment}', x: ['acquired'] },
    { id: 'bd-adaptation', g: 'adapt', term: 'Adaptation', text: 'the process, resulting from {natural selection}, by which {populations} become more suited to their environment over {many generations}', note: 'Supplement.', x: ['artificial selection', 'individuals', 'one generation'] },
  ]);

  defs('bio', 'bdef4', [
    { id: 'bd-foodchain', g: 'chain', term: 'Food chain', text: 'showing the {transfer of energy} from one organism to the next, beginning with a {producer}', x: ['consumer', 'transfer of nutrients'] },
    { id: 'bd-foodweb', g: 'chain', term: 'Food web', text: 'a {network} of {interconnected food chains}' },
    { id: 'bd-producer', g: 'feed', term: 'Producer', text: 'an organism that {makes its own organic nutrients}, usually using {energy from sunlight}, through {photosynthesis}', x: ['feeding on other organisms'] },
    { id: 'bd-consumer', g: 'feed', term: 'Consumer', text: 'an organism that gets its energy by {feeding on other organisms}' },
    { id: 'bd-herbivore', g: 'feed', term: 'Herbivore', text: 'an {animal} that gets its energy by {eating plants}', x: ['eating other animals'] },
    { id: 'bd-carnivore', g: 'feed', term: 'Carnivore', text: 'an {animal} that gets its energy by {eating other animals}', x: ['eating plants'] },
    { id: 'bd-decomposer', g: 'feed', term: 'Decomposer', text: 'an organism that gets its energy from {dead or waste organic material}', x: ['living plants'] },
    { id: 'bd-trophic', term: 'Trophic level', text: 'the {position} of an organism in a {food chain}, food web or ecological pyramid' },
    { id: 'bd-population', g: 'eco', sw: [['same area', 'same time']], term: 'Population', text: 'a group of organisms of {one species}, living in the {same area}, at the {same time}', x: ['different species'] },
    { id: 'bd-community', g: 'eco', term: 'Community', text: 'all of the {populations} of {different species} in an {ecosystem}', x: ['one species'] },
    { id: 'bd-ecosystem', g: 'eco', term: 'Ecosystem', text: 'a unit containing the {community} of organisms and their {environment}, {interacting together}' },
    { id: 'bd-biodiversity', term: 'Biodiversity', text: 'the {number of different species} that live in an {area}', x: ['number of individuals'] },
    { id: 'bd-sustainable', term: 'Sustainable resource', text: 'one which is produced {as rapidly as it is removed} from the environment so that it {does not run out}', x: ['more slowly than it is removed'] },
    { id: 'bd-gm', term: 'Genetic modification', text: 'changing the {genetic material} of an organism by {removing, changing or inserting} {individual genes}', x: ['whole chromosomes', 'selective breeding'] },
  ]);

  /* ── food tests ── */
  const FT = [
    { id: 'starch', what: 'starch', reagent: 'iodine solution', method: 'add a few drops of iodine solution', from: ['orange-brown', '#c47a24'], to: ['blue-black', '#1f2540'], result: 'turns from orange-brown to blue-black' },
    { id: 'sugar', what: 'reducing sugars', reagent: 'Benedict’s solution', method: 'add Benedict’s solution and heat in a hot water bath', from: ['blue', '#3a78d6'], to: ['brick-red', '#b4472b'], result: 'turns from blue to green, yellow, orange or brick-red (brick-red means the most sugar)' },
    { id: 'protein', what: 'proteins', reagent: 'biuret solution', method: 'add biuret solution (no heating)', from: ['blue', '#4b85d8'], to: ['purple', '#7d3fb2'], result: 'turns from blue to purple' },
    { id: 'fat', what: 'fats and oils', reagent: 'ethanol (the ethanol emulsion test)', method: 'shake the food with ethanol, then pour the ethanol into water', from: ['clear', 'transparent'], to: ['cloudy white', '#eef0ec'], result: 'a cloudy white (milky) emulsion forms' },
    { id: 'vitc', what: 'vitamin C', reagent: 'DCPIP solution', method: 'add the food solution drop by drop to blue DCPIP', from: ['blue', '#3157cf'], to: ['colourless', 'transparent'], result: 'blue DCPIP becomes colourless (decolourised)' },
  ];
  const ftTube = (c, label) => `<figure class="qzb-fig"><span class="qzb-t${c[1] === 'transparent' ? ' clear' : ''}${c[0] === 'cloudy white' ? ' cloudy' : ''}" style="--c:${c[1]}" aria-hidden="true"></span><figcaption>${label || c[0]}</figcaption></figure>`;
  const ftVisual = (f) => `<div class="qzb-pair" role="img" aria-label="${f.reagent}: ${f.from[0]} to ${f.to[0]}">${ftTube(f.from)}<span class="qzb-arrow" aria-hidden="true">→</span>${ftTube(f.to, f.to[0])}</div>`;
  const ftFact = (f) => `<div class="qzv-fact"><div class="qzv-txt"><b>${f.what.charAt(0).toUpperCase() + f.what.slice(1)}</b>: ${f.method}. Positive result: ${f.result}.</div>${ftVisual(f)}</div>`;
  for (const f of FT) {
    const others = FT.filter((x) => x !== f);
    addCard(`bf-reagent-${f.id}`, 'bfood', () => ({
      prompt: `Which reagent is used to test for <b>${f.what}</b>?`,
      ...mcq(f.reagent, shuffle(others.map((x) => x.reagent)).slice(0, 3)),
      explain: ftFact(f),
    }));
    addCard(`bf-result-${f.id}`, 'bfood', () => ({
      prompt: `What is the positive result when testing for <b>${f.what}</b> with ${f.reagent}?`,
      ...mcq(f.result, shuffle(others.map((x) => x.result)).slice(0, 3)),
      explain: ftFact(f),
    }));
    addCard(`bf-id-${f.id}`, 'bfood', () => ({
      prompt: `A food is tested with ${f.reagent.replace(/ \(.*\)/, '')}. Result: <i>${f.result}</i>. Which nutrient is present?`,
      visual: ftVisual(f),
      ...mcq(f.what, shuffle(others.map((x) => x.what)).slice(0, 3)),
      explain: ftFact(f),
    }));
  }
  addCard('bf-heat', 'bfood', () => ({
    prompt: 'Which food test needs <b>heating</b> in a hot water bath?',
    ...mcq('Benedict’s test for reducing sugars', ['iodine test for starch', 'biuret test for proteins', 'DCPIP test for vitamin C']),
    explain: ftFact(FT[1]),
  }));
  addCard('bf-match', 'bfood', () => ({
    type: 'match',
    prompt: 'Match each test to the nutrient it detects.',
    pairs: shuffle(FT.slice()).slice(0, 4).map((f) => [f.reagent.replace(/ \(.*\)/, ''), f.what]),
    explain: FT.map((f) => `${f.reagent.replace(/ \(.*\)/, '')}: ${f.what}`).join('; ') + '.',
  }));

  /* ── animal groups ── */
  const GROUPS = [
    { id: 'mammal', k: 'v', name: 'Mammals', f: ['fur or hair', 'external ears (pinnae)', 'mammary glands that produce milk'] },
    { id: 'bird', k: 'v', name: 'Birds', f: ['feathers', 'a beak', 'front limbs are wings', 'eggs with hard shells'] },
    { id: 'reptile', k: 'v', name: 'Reptiles', f: ['dry, scaly skin', 'eggs with rubbery (leathery) shells, laid on land'] },
    { id: 'amphib', k: 'v', name: 'Amphibians', f: ['moist skin with no scales', 'eggs laid in water', 'larvae (tadpoles) live in water and breathe with gills; adults have lungs'] },
    { id: 'fish', k: 'v', name: 'Fish', f: ['wet scales', 'fins', 'gills for breathing', 'a lateral line'] },
    { id: 'insect', k: 'a', name: 'Insects', f: ['three pairs of jointed legs', 'three body parts: head, thorax and abdomen', 'one pair of antennae', 'usually two pairs of wings'] },
    { id: 'arachnid', k: 'a', name: 'Arachnids', f: ['four pairs of jointed legs', 'two body parts: cephalothorax and abdomen', 'no antennae'] },
    { id: 'crust', k: 'a', name: 'Crustaceans', f: ['more than four pairs of jointed legs', 'two pairs of antennae', 'mostly live in water and breathe with gills'] },
    { id: 'myria', k: 'a', name: 'Myriapods', f: ['many pairs of jointed legs (one or two pairs on each segment)', 'a long body of many similar segments', 'one pair of antennae'] },
  ];
  const groupFact = (g) => `<b>${g.name}</b> (${g.k === 'v' ? 'vertebrates' : 'arthropods'}): ${g.f.join('; ')}.`;
  for (const g of GROUPS) {
    const same = GROUPS.filter((x) => x.k === g.k && x !== g);
    addCard(`bc-which-${g.id}`, 'bclass', () => ({
      prompt: `${g.k === 'v' ? 'A vertebrate' : 'An arthropod'} has: <i>${g.f.join('; ')}</i>. Which group is it in?`,
      ...mcq(g.name, shuffle(same.map((x) => x.name)).slice(0, 3)),
      explain: groupFact(g),
    }));
    addCard(`bc-feat-${g.id}`, 'bclass', () => ({
      prompt: `Which of these is a main feature of <b>${g.name.toLowerCase()}</b>?`,
      ...mcq(g.f[0], shuffle(same.map((x) => x.f[0])).slice(0, 3)),
      explain: groupFact(g),
    }));
  }
  addCard('bc-arthropods', 'bclass', () => ({
    prompt: 'Which features do <b>all arthropods</b> share?',
    ...mcq('an exoskeleton, jointed legs and a segmented body', ['a backbone, four limbs and lungs', 'an exoskeleton, wings and three body parts', 'a soft body, a shell and a muscular foot']),
    explain: 'All arthropods have an exoskeleton, jointed legs and a segmented body. The four groups are insects, arachnids, crustaceans and myriapods.',
  }));
  addCard('bc-legs', 'bclass', () => ({
    type: 'match',
    prompt: 'Match each arthropod group to its legs.',
    pairs: [['Insects', 'three pairs'], ['Arachnids', 'four pairs'], ['Crustaceans', 'more than four pairs'], ['Myriapods', 'many pairs, on every segment']],
    explain: GROUPS.filter((g) => g.k === 'a').map(groupFact).join('<br>'),
  }));
  addCard('bc-skin', 'bclass', () => ({
    type: 'match',
    prompt: 'Match each vertebrate group to its body covering.',
    pairs: [['Mammals', 'fur or hair'], ['Birds', 'feathers'], ['Reptiles', 'dry scales'], ['Amphibians', 'moist skin, no scales'], ['Fish', 'wet scales']],
    explain: GROUPS.filter((g) => g.k === 'v').map(groupFact).join('<br>'),
  }));

  /* ── enzymes, equations, nutrients ── */
  const FACTS = [
    ['amylase', 'Amylase', 'What does <b>amylase</b> break down, and into what?', 'starch into simple reducing sugars', ['protein into amino acids', 'fats and oils into fatty acids and glycerol', 'maltose into glucose'], 'Amylase breaks down starch to simple reducing sugars (to maltose; Supplement).'],
    ['protease', 'Proteases', 'What do <b>proteases</b> break down, and into what?', 'protein into amino acids', ['starch into simple reducing sugars', 'fats and oils into fatty acids and glycerol', 'amino acids into urea'], 'Proteases break down protein to amino acids.'],
    ['lipase', 'Lipase', 'What does <b>lipase</b> break down, and into what?', 'fats and oils into fatty acids and glycerol', ['protein into amino acids', 'starch into simple reducing sugars', 'fats and oils into glucose'], 'Lipase breaks down fats and oils to fatty acids and glycerol.'],
    ['maltase', 'Maltase (S)', 'What does <b>maltase</b> break down, and where?', 'maltose into glucose, on the membranes of the epithelium lining the small intestine', ['starch into maltose, in the mouth', 'protein into amino acids, in the stomach', 'glucose into maltose, in the liver'], 'Supplement. Amylase breaks starch to maltose; maltase breaks maltose to glucose in the small intestine.'],
    ['pepsin', 'Pepsin and trypsin (S)', 'Pepsin and trypsin are both…', 'proteases that work in different parts of the gut: pepsin in the stomach, trypsin in the small intestine', ['carbohydrases: pepsin in the mouth, trypsin in the stomach', 'lipases that both work in the small intestine', 'proteases that both work in the stomach'], 'Supplement. Pepsin works in the acidic stomach; trypsin in the small intestine.'],
    ['photo-word', 'Photosynthesis', 'What is the word equation for <b>photosynthesis</b>?', 'carbon dioxide + water → glucose + oxygen', ['glucose + oxygen → carbon dioxide + water', 'carbon dioxide + oxygen → glucose + water', 'glucose → carbon dioxide + water'], 'Carbon dioxide + water → glucose + oxygen, in the presence of light and chlorophyll.'],
    ['photo-bal', 'Photosynthesis, balanced (S)', 'What is the balanced equation for <b>photosynthesis</b>?', '6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>', ['C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O', '6CO<sub>2</sub> + 12H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>', 'CO<sub>2</sub> + H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + O<sub>2</sub>'], 'Supplement. Needs light energy, absorbed by chlorophyll.'],
    ['aer-word', 'Aerobic respiration', 'What is the word equation for <b>aerobic respiration</b>?', 'glucose + oxygen → carbon dioxide + water', ['carbon dioxide + water → glucose + oxygen', 'glucose → lactic acid', 'glucose → alcohol + carbon dioxide'], 'Glucose + oxygen → carbon dioxide + water (energy released).'],
    ['aer-bal', 'Aerobic respiration, balanced (S)', 'What is the balanced equation for <b>aerobic respiration</b>?', 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O', ['6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>', 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> → 2C<sub>2</sub>H<sub>5</sub>OH + 2CO<sub>2</sub>', 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + O<sub>2</sub> → CO<sub>2</sub> + H<sub>2</sub>O'], 'Supplement.'],
    ['ana-yeast', 'Anaerobic respiration, yeast', 'What is the word equation for <b>anaerobic respiration in yeast</b>?', 'glucose → alcohol + carbon dioxide', ['glucose → lactic acid', 'glucose + oxygen → carbon dioxide + water', 'glucose → alcohol + oxygen'], 'Yeast makes alcohol (ethanol) and carbon dioxide; muscles make lactic acid.'],
    ['ana-bal', 'Anaerobic respiration in yeast, balanced (S)', 'What is the balanced equation for <b>anaerobic respiration in yeast</b>?', 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> → 2C<sub>2</sub>H<sub>5</sub>OH + 2CO<sub>2</sub>', ['C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> → C<sub>2</sub>H<sub>5</sub>OH + CO<sub>2</sub>', 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O', 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> → 2C<sub>3</sub>H<sub>6</sub>O<sub>3</sub>'], 'Supplement.'],
    ['ana-muscle', 'Anaerobic respiration, muscles', 'What is the word equation for <b>anaerobic respiration in muscles</b> during vigorous exercise?', 'glucose → lactic acid', ['glucose → alcohol + carbon dioxide', 'glucose + oxygen → lactic acid', 'lactic acid → glucose + oxygen'], 'In muscles: glucose → lactic acid. This builds up an oxygen debt.'],
    ['nitrate', 'Nitrate ions', 'Why do plants need <b>nitrate ions</b>?', 'for making amino acids', ['for making glucose', 'for making starch', 'for making cellulose'], 'Nitrate ions are needed for making amino acids (and so proteins).'],
    ['magnesium', 'Magnesium ions', 'Why do plants need <b>magnesium ions</b>?', 'for making chlorophyll', ['for making amino acids', 'for making proteins', 'for making glucose'], 'Magnesium ions are needed for making chlorophyll; without them leaves turn yellow.'],
    ['scurvy', 'Scurvy', 'What causes <b>scurvy</b>?', 'a lack of vitamin C in the diet', ['a lack of vitamin D in the diet', 'a lack of iron in the diet', 'too much fat in the diet'], 'Scurvy: lack of vitamin C. Rickets: lack of vitamin D (or calcium).'],
    ['rickets', 'Rickets', 'What causes <b>rickets</b>?', 'a lack of vitamin D (or calcium) in the diet', ['a lack of vitamin C in the diet', 'a lack of iron in the diet', 'a lack of fibre in the diet'], 'Rickets: lack of vitamin D (or calcium), so bones are weak. Scurvy: lack of vitamin C.'],
  ];
  for (const [id, , q, right, wrong, note] of FACTS) {
    addCard(`bx-${id}`, 'bfacts', () => ({ prompt: q, ...mcq(right, wrong), explain: `<b>${right}</b>. ${note}` }));
  }

  /* ── cheat sheet ── */
  QZ.SHEETS.bio = () => `<div class="qz-sheet">
    <nav class="qz-jump" aria-label="Jump to"><button data-act="qz-jump" data-to="qzb-food">Food tests</button><button data-act="qz-jump" data-to="qzb-groups">Animal groups</button><button data-act="qz-jump" data-to="qzb-facts">Enzymes and equations</button><button data-act="qz-jump" data-to="qzb-def">Definitions</button></nav>
    <h4 id="qzb-food">Food tests</h4>
    <ul class="qz-list">${FT.map((f) => `<li class="qz-vcard"><div class="qz-vtop"><p class="qz-ion">${f.what.charAt(0).toUpperCase() + f.what.slice(1)} <small>${f.reagent}</small></p>${ftVisual(f)}</div>
      <dl><dt>Method</dt><dd>${f.method}</dd><dt>Positive result</dt><dd>${f.result}</dd></dl></li>`).join('')}</ul>
    <h4 id="qzb-groups">Animal groups</h4>
    <p class="fine">All vertebrates have a backbone. All arthropods have an exoskeleton, jointed legs and a segmented body.</p>
    <div class="qz-groups">${['v', 'a'].map((k) => `<div><h5 class="qz-sh5">${k === 'v' ? 'Vertebrates' : 'Arthropods'}</h5><dl class="qz-defs">${GROUPS.filter((g) => g.k === k).map((g) => `<div><dt>${g.name}</dt><dd>${g.f.join('; ')}</dd></div>`).join('')}</dl></div>`).join('')}</div>
    <h4 id="qzb-facts">Enzymes, equations and nutrients</h4>
    <dl class="qz-defs">${FACTS.map(([, label, , right]) => `<div><dt>${label}</dt><dd>${right}</dd></div>`).join('')}</dl>
    <h4 id="qzb-def">Definitions</h4>
    ${qzDefsListHTML('bio')}
  </div>`;
})();
