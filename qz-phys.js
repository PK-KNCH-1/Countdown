/* Physics deck: equations to recall, rearranging, units, values to know, definitions.
   Every equation here is one the Cambridge IGCSE Physics 0625 syllabus (2026–2028) says to
   "recall and use"; no equation sheet is given in the exam. Values are the ones the syllabus says to know. */

(() => {
  const { fr, mcq, addCard, addTopics, defs, pickDistinct } = QZ;
  const v = (x) => `<var>${x}</var>`;
  const sq = (x) => `${x}<sup>2</sup>`;
  const D = 'Δ';

  addTopics('phys', {
    peq: 'Equations',
    prearr: 'Rearranging',
    punit: 'Units',
    pval: 'Values to know',
    pdef: 'Definitions',
  });

  /* ── equations ──
     n: what the equation is for; eq: the equation; w: three wrong versions; key: what each symbol means;
     lvl: S for Supplement (Extended only). */
  const EQ = [
    { id: 'speed', n: 'speed', eq: `${v('v')} = ${fr(v('s'), v('t'))}`, w: [`${v('v')} = ${fr(v('t'), v('s'))}`, `${v('v')} = ${v('s')}${v('t')}`, `${v('v')} = ${fr(v('s'), sq(v('t')))}`], key: 'v speed (m/s), s distance (m), t time (s)' },
    { id: 'avspeed', n: 'average speed', eq: `average speed = ${fr('total distance travelled', 'total time taken')}`, w: [`average speed = ${fr('total time taken', 'total distance travelled')}`, 'average speed = total distance × total time', `average speed = ${fr('initial speed + final speed', '2')}`], key: 'use totals for the whole journey, including stops' },
    { id: 'accel', n: 'acceleration', lvl: 'S', eq: `${v('a')} = ${fr(D + v('v'), D + v('t'))}`, w: [`${v('a')} = ${fr(D + v('t'), D + v('v'))}`, `${v('a')} = ${D}${v('v')} × ${D}${v('t')}`, `${v('a')} = ${fr(D + v('s'), D + v('t'))}`], key: 'a acceleration (m/s²), Δv change in velocity (m/s), Δt time taken (s)' },
    { id: 'gfs', n: 'gravitational field strength', eq: `${v('g')} = ${fr(v('W'), v('m'))}`, w: [`${v('g')} = ${fr(v('m'), v('W'))}`, `${v('g')} = ${v('W')}${v('m')}`, `${v('g')} = ${fr(v('F'), v('A'))}`], key: 'g gravitational field strength (N/kg), W weight (N), m mass (kg)' },
    { id: 'density', n: 'density', eq: `${v('ρ')} = ${fr(v('m'), v('V'))}`, w: [`${v('ρ')} = ${fr(v('V'), v('m'))}`, `${v('ρ')} = ${v('m')}${v('V')}`, `${v('ρ')} = ${fr(v('m'), sq(v('V')))}`], key: 'ρ density (kg/m³), m mass (kg), V volume (m³)' },
    { id: 'spring', n: 'the spring constant', lvl: 'S', eq: `${v('k')} = ${fr(v('F'), v('x'))}`, w: [`${v('k')} = ${fr(v('x'), v('F'))}`, `${v('k')} = ${v('F')}${v('x')}`, `${v('k')} = ${fr(v('F'), sq(v('x')))}`], key: 'k spring constant (N/m), F force (N), x extension (m)' },
    { id: 'fma', n: 'resultant force, mass and acceleration', lvl: 'S', eq: `${v('F')} = ${v('m')}${v('a')}`, w: [`${v('F')} = ${fr(v('m'), v('a'))}`, `${v('F')} = ${fr(v('a'), v('m'))}`, `${v('F')} = ${v('m')}${v('v')}`], key: 'F resultant force (N), m mass (kg), a acceleration (m/s²); F and a are in the same direction' },
    { id: 'moment', n: 'the moment of a force', eq: 'moment = force × perpendicular distance from the pivot', w: ['moment = force ÷ perpendicular distance from the pivot', 'moment = mass × perpendicular distance from the pivot', 'moment = force × time for which it acts'], key: 'moment in N m, force in N, distance in m' },
    { id: 'momentum', n: 'momentum', lvl: 'S', eq: `${v('p')} = ${v('m')}${v('v')}`, w: [`${v('p')} = ${fr(v('m'), v('v'))}`, `${v('p')} = ½${v('m')}${sq(v('v'))}`, `${v('p')} = ${v('m')}${sq(v('v'))}`], key: 'p momentum (kg m/s), m mass (kg), v velocity (m/s)' },
    { id: 'impulse', n: 'impulse', lvl: 'S', eq: `impulse = ${v('F')}${D}${v('t')} = ${D}(${v('m')}${v('v')})`, w: [`impulse = ${fr(v('F'), D + v('t'))} = ${D}(${v('m')}${v('v')})`, `impulse = ${v('F')}${D}${v('t')} = ${D}(½${v('m')}${sq(v('v'))})`, `impulse = ${v('F')}${v('d')} = ${D}(${v('m')}${v('v')})`], key: 'impulse (N s) = force (N) × time it acts (s) = change in momentum' },
    { id: 'fdpdt', n: 'resultant force and momentum', lvl: 'S', eq: `${v('F')} = ${fr(D + v('p'), D + v('t'))}`, w: [`${v('F')} = ${fr(D + v('t'), D + v('p'))}`, `${v('F')} = ${D}${v('p')}${D}${v('t')}`, `${v('F')} = ${fr(D + v('v'), D + v('t'))}`], key: 'F resultant force (N), Δp change in momentum (kg m/s), Δt time taken (s)' },
    { id: 'ke', n: 'kinetic energy', lvl: 'S', eq: `${v('E')}<sub>k</sub> = ½${v('m')}${sq(v('v'))}`, w: [`${v('E')}<sub>k</sub> = ${v('m')}${sq(v('v'))}`, `${v('E')}<sub>k</sub> = ½${v('m')}${v('v')}`, `${v('E')}<sub>k</sub> = ${v('m')}${v('g')}${v('h')}`], key: 'Ek kinetic energy (J), m mass (kg), v speed (m/s)' },
    { id: 'gpe', n: 'change in gravitational potential energy', lvl: 'S', eq: `${D}${v('E')}<sub>p</sub> = ${v('m')}${v('g')}${D}${v('h')}`, w: [`${D}${v('E')}<sub>p</sub> = ½${v('m')}${v('g')}${D}${v('h')}`, `${D}${v('E')}<sub>p</sub> = ${fr(v('m') + D + v('h'), v('g'))}`, `${D}${v('E')}<sub>p</sub> = ½${v('m')}${sq(v('v'))}`], key: 'ΔEp (J), m mass (kg), g = 9.8 N/kg, Δh change in height (m)' },
    { id: 'work', n: 'mechanical work done', eq: `${v('W')} = ${v('F')}${v('d')} = ${D}${v('E')}`, w: [`${v('W')} = ${fr(v('F'), v('d'))} = ${D}${v('E')}`, `${v('W')} = ${v('F')}${v('t')} = ${D}${v('E')}`, `${v('W')} = ${v('m')}${v('d')} = ${D}${v('E')}`], key: 'W work done (J), F force (N), d distance moved in the direction of the force (m), ΔE energy transferred (J)' },
    { id: 'eff', n: 'efficiency', lvl: 'S', eq: `efficiency = ${fr('useful energy output', 'total energy input')} (× 100%)`, w: [`efficiency = ${fr('total energy input', 'useful energy output')} (× 100%)`, `efficiency = ${fr('wasted energy output', 'total energy input')} (× 100%)`, `efficiency = ${fr('useful energy output', 'wasted energy output')} (× 100%)`], key: 'also (useful power output ÷ total power input) × 100%' },
    { id: 'power', n: 'power', eq: `${v('P')} = ${fr(v('W'), v('t'))} and ${v('P')} = ${fr(D + v('E'), v('t'))}`, w: [`${v('P')} = ${fr(v('t'), v('W'))} and ${v('P')} = ${fr(v('t'), D + v('E'))}`, `${v('P')} = ${v('W')}${v('t')} and ${v('P')} = ${D}${v('E')}${v('t')}`, `${v('P')} = ${v('F')}${v('d')} and ${v('P')} = ${v('m')}${v('g')}${v('h')}`], key: 'P power (W), W work done (J), ΔE energy transferred (J), t time (s)' },
    { id: 'pressure', n: 'pressure', eq: `${v('p')} = ${fr(v('F'), v('A'))}`, w: [`${v('p')} = ${fr(v('A'), v('F'))}`, `${v('p')} = ${v('F')}${v('A')}`, `${v('p')} = ${fr(v('m'), v('V'))}`], key: 'p pressure (Pa), F force (N), A area (m²)' },
    { id: 'liqp', n: 'change in pressure beneath the surface of a liquid', lvl: 'S', eq: `${D}${v('p')} = ${v('ρ')}${v('g')}${D}${v('h')}`, w: [`${D}${v('p')} = ${v('m')}${v('g')}${D}${v('h')}`, `${D}${v('p')} = ${fr(v('ρ') + D + v('h'), v('g'))}`, `${D}${v('p')} = ${fr(v('ρ') + v('g'), D + v('h'))}`], key: 'Δp (Pa), ρ density of the liquid (kg/m³), g = 9.8 N/kg, Δh change in depth (m)' },
    { id: 'kelvin', n: 'converting °C to kelvin', eq: `${v('T')} (in K) = ${v('θ')} (in °C) + 273`, w: [`${v('T')} (in K) = ${v('θ')} (in °C) − 273`, `${v('θ')} (in °C) = ${v('T')} (in K) + 273`, `${v('T')} (in K) = ${v('θ')} (in °C) × 273`], key: 'absolute zero is −273 °C, which is 0 K' },
    { id: 'boyle', n: 'a fixed mass of gas at constant temperature', lvl: 'S', eq: `${v('p')}${v('V')} = constant`, w: [`${fr(v('p'), v('V'))} = constant`, `${v('p')}${sq(v('V'))} = constant`, `${v('p')} + ${v('V')} = constant`], key: 'so p₁V₁ = p₂V₂: halve the volume and the pressure doubles' },
    { id: 'shc', n: 'specific heat capacity', lvl: 'S', eq: `${v('c')} = ${fr(D + v('E'), v('m') + D + v('θ'))}`, w: [`${v('c')} = ${fr(v('m') + D + v('θ'), D + v('E'))}`, `${v('c')} = ${D}${v('E')}${v('m')}${D}${v('θ')}`, `${v('c')} = ${fr(D + v('E') + D + v('θ'), v('m'))}`], key: 'c (J/(kg °C)), ΔE energy (J), m mass (kg), Δθ temperature rise (°C)' },
    { id: 'wave', n: 'wave speed', eq: `${v('v')} = ${v('f')}${v('λ')}`, w: [`${v('v')} = ${fr(v('f'), v('λ'))}`, `${v('v')} = ${fr(v('λ'), v('f'))}`, `${v('v')} = ${v('f')}${sq(v('λ'))}`], key: 'v wave speed (m/s), f frequency (Hz), λ wavelength (m)' },
    { id: 'snell', n: 'refractive index from the angles', lvl: 'S', eq: `${v('n')} = ${fr('sin ' + v('i'), 'sin ' + v('r'))}`, w: [`${v('n')} = ${fr('sin ' + v('r'), 'sin ' + v('i'))}`, `${v('n')} = ${fr(v('i'), v('r'))}`, `${v('n')} = sin ${v('i')} × sin ${v('r')}`], key: 'i angle of incidence, r angle of refraction (light going into the denser material)' },
    { id: 'critical', n: 'refractive index from the critical angle', lvl: 'S', eq: `${v('n')} = ${fr('1', 'sin ' + v('c'))}`, w: [`${v('n')} = sin ${v('c')}`, `${v('n')} = ${fr('1', 'cos ' + v('c'))}`, `${v('n')} = ${fr('sin ' + v('c'), '2')}`], key: 'c critical angle' },
    { id: 'current', n: 'electric current', lvl: 'S', eq: `${v('I')} = ${fr(v('Q'), v('t'))}`, w: [`${v('I')} = ${v('Q')}${v('t')}`, `${v('I')} = ${fr(v('t'), v('Q'))}`, `${v('I')} = ${fr(v('W'), v('Q'))}`], key: 'I current (A), Q charge (C), t time (s)' },
    { id: 'emf', n: 'e.m.f.', lvl: 'S', eq: `${v('E')} = ${fr(v('W'), v('Q'))}`, w: [`${v('E')} = ${fr(v('Q'), v('W'))}`, `${v('E')} = ${v('W')}${v('Q')}`, `${v('E')} = ${fr(v('W'), v('t'))}`], key: 'E e.m.f. (V), W energy transferred (J), Q charge (C)' },
    { id: 'pd', n: 'potential difference', lvl: 'S', eq: `${v('V')} = ${fr(v('W'), v('Q'))}`, w: [`${v('V')} = ${fr(v('Q'), v('W'))}`, `${v('V')} = ${v('W')}${v('Q')}`, `${v('V')} = ${fr(v('W'), v('t'))}`], key: 'V p.d. (V), W work done (J), Q charge (C)' },
    { id: 'resist', n: 'resistance', eq: `${v('R')} = ${fr(v('V'), v('I'))}`, w: [`${v('R')} = ${fr(v('I'), v('V'))}`, `${v('R')} = ${v('V')}${v('I')}`, `${v('R')} = ${fr(v('V'), sq(v('I')))}`], key: 'R resistance (Ω), V p.d. (V), I current (A)' },
    { id: 'series', n: 'combined resistance of resistors in series', eq: `${v('R')} = ${v('R')}<sub>1</sub> + ${v('R')}<sub>2</sub> + …`, w: [`${fr('1', v('R'))} = ${fr('1', v('R') + '<sub>1</sub>')} + ${fr('1', v('R') + '<sub>2</sub>')}`, `${v('R')} = ${v('R')}<sub>1</sub> × ${v('R')}<sub>2</sub>`, `${v('R')} = ${v('R')}<sub>1</sub> − ${v('R')}<sub>2</sub>`], key: 'in series the total is bigger than any one resistor' },
    { id: 'parallel', n: 'combined resistance of two resistors in parallel', lvl: 'S', eq: `${fr('1', v('R'))} = ${fr('1', v('R') + '<sub>1</sub>')} + ${fr('1', v('R') + '<sub>2</sub>')}`, w: [`${v('R')} = ${v('R')}<sub>1</sub> + ${v('R')}<sub>2</sub>`, `${fr('1', v('R'))} = ${v('R')}<sub>1</sub> + ${v('R')}<sub>2</sub>`, `${v('R')} = ${fr('1', v('R') + '<sub>1</sub>')} + ${fr('1', v('R') + '<sub>2</sub>')}`], key: 'in parallel the total is less than either resistor; remember to flip 1/R at the end' },
    { id: 'epower', n: 'electrical power', eq: `${v('P')} = ${v('I')}${v('V')}`, w: [`${v('P')} = ${fr(v('I'), v('V'))}`, `${v('P')} = ${fr(v('V'), v('I'))}`, `${v('P')} = ${v('I')}${v('V')}${v('t')}`], key: 'P power (W), I current (A), V p.d. (V)' },
    { id: 'eenergy', n: 'electrical energy', eq: `${v('E')} = ${v('I')}${v('V')}${v('t')}`, w: [`${v('E')} = ${fr(v('I') + v('V'), v('t'))}`, `${v('E')} = ${v('I')}${v('V')}`, `${v('E')} = ${fr(v('V') + v('t'), v('I'))}`], key: 'E energy (J), I current (A), V p.d. (V), t time (s)' },
    { id: 'pdiv', n: 'two resistors used as a potential divider', lvl: 'S', eq: `${fr(v('R') + '<sub>1</sub>', v('R') + '<sub>2</sub>')} = ${fr(v('V') + '<sub>1</sub>', v('V') + '<sub>2</sub>')}`, w: [`${fr(v('R') + '<sub>1</sub>', v('R') + '<sub>2</sub>')} = ${fr(v('V') + '<sub>2</sub>', v('V') + '<sub>1</sub>')}`, `${v('R')}<sub>1</sub>${v('V')}<sub>1</sub> = ${v('R')}<sub>2</sub>${v('V')}<sub>2</sub>`, `${v('R')}<sub>1</sub> + ${v('R')}<sub>2</sub> = ${v('V')}<sub>1</sub> + ${v('V')}<sub>2</sub>`], key: 'the bigger resistor gets the bigger share of the p.d.' },
    { id: 'trans', n: 'the transformer turns ratio', eq: `${fr(v('V') + '<sub>p</sub>', v('V') + '<sub>s</sub>')} = ${fr(v('N') + '<sub>p</sub>', v('N') + '<sub>s</sub>')}`, w: [`${fr(v('V') + '<sub>p</sub>', v('V') + '<sub>s</sub>')} = ${fr(v('N') + '<sub>s</sub>', v('N') + '<sub>p</sub>')}`, `${v('V')}<sub>p</sub>${v('N')}<sub>p</sub> = ${v('V')}<sub>s</sub>${v('N')}<sub>s</sub>`, `${fr(v('V') + '<sub>p</sub>', v('V') + '<sub>s</sub>')} = ${fr(v('I') + '<sub>p</sub>', v('I') + '<sub>s</sub>')}`], key: 'p primary, s secondary; V voltage, N number of turns' },
    { id: 'transp', n: 'a 100% efficient transformer', lvl: 'S', eq: `${v('I')}<sub>p</sub>${v('V')}<sub>p</sub> = ${v('I')}<sub>s</sub>${v('V')}<sub>s</sub>`, w: [`${fr(v('I') + '<sub>p</sub>', v('V') + '<sub>p</sub>')} = ${fr(v('I') + '<sub>s</sub>', v('V') + '<sub>s</sub>')}`, `${v('I')}<sub>p</sub>${v('V')}<sub>s</sub> = ${v('I')}<sub>s</sub>${v('V')}<sub>p</sub>`, `${v('I')}<sub>p</sub> + ${v('V')}<sub>p</sub> = ${v('I')}<sub>s</sub> + ${v('V')}<sub>s</sub>`], key: 'power in = power out' },
    { id: 'i2r', n: 'power lost in a cable', lvl: 'S', eq: `${v('P')} = ${sq(v('I'))}${v('R')}`, w: [`${v('P')} = ${v('I')}${sq(v('R'))}`, `${v('P')} = ${fr(sq(v('I')), v('R'))}`, `${v('P')} = ${fr(v('I'), sq(v('R')))}`], key: 'why power is sent at high voltage and low current' },
    { id: 'orbit', n: 'average orbital speed', lvl: 'S', eq: `${v('v')} = ${fr('2π' + v('r'), v('T'))}`, w: [`${v('v')} = ${fr('π' + sq(v('r')), v('T'))}`, `${v('v')} = 2π${v('r')}${v('T')}`, `${v('v')} = ${fr(v('T'), '2π' + v('r'))}`], key: 'r average radius of the orbit (m), T orbital period (s)' },
    { id: 'hubble', n: 'the Hubble constant', lvl: 'S', eq: `${v('H')}<sub>0</sub> = ${fr(v('v'), v('d'))}`, w: [`${v('H')}<sub>0</sub> = ${fr(v('d'), v('v'))}`, `${v('H')}<sub>0</sub> = ${v('v')}${v('d')}`, `${v('H')}<sub>0</sub> = ${fr(v('v'), v('t'))}`], key: 'v speed the galaxy moves away, d its distance from the Earth' },
  ];
  const eqExplain = (e) => `<p class="qz-eq">${e.eq}</p><p class="qz-note">${e.key}${e.lvl === 'S' ? ' · Supplement' : ''}</p>`;
  for (const e of EQ) {
    addCard(`pe-${e.id}`, 'peq', () => ({
      prompt: `Which is the equation for <b>${e.n}</b>?`,
      ...mcq(e.eq, e.w),
      explain: eqExplain(e),
    }));
  }

  /* ── rearranging ── */
  const RE = [
    ['speed', `Make ${v('t')} the subject of ${v('v')} = ${fr(v('s'), v('t'))}`, `${v('t')} = ${fr(v('s'), v('v'))}`, [`${v('t')} = ${fr(v('v'), v('s'))}`, `${v('t')} = ${v('s')}${v('v')}`, `${v('t')} = ${v('s')} − ${v('v')}`]],
    ['density', `Make ${v('V')} the subject of ${v('ρ')} = ${fr(v('m'), v('V'))}`, `${v('V')} = ${fr(v('m'), v('ρ'))}`, [`${v('V')} = ${fr(v('ρ'), v('m'))}`, `${v('V')} = ${v('m')}${v('ρ')}`, `${v('V')} = ${v('m')} − ${v('ρ')}`]],
    ['pressure', `Make ${v('A')} the subject of ${v('p')} = ${fr(v('F'), v('A'))}`, `${v('A')} = ${fr(v('F'), v('p'))}`, [`${v('A')} = ${fr(v('p'), v('F'))}`, `${v('A')} = ${v('p')}${v('F')}`, `${v('A')} = ${v('F')} − ${v('p')}`]],
    ['resist', `Make ${v('I')} the subject of ${v('R')} = ${fr(v('V'), v('I'))}`, `${v('I')} = ${fr(v('V'), v('R'))}`, [`${v('I')} = ${fr(v('R'), v('V'))}`, `${v('I')} = ${v('V')}${v('R')}`, `${v('I')} = ${v('V')} − ${v('R')}`]],
    ['epower', `Make ${v('I')} the subject of ${v('P')} = ${v('I')}${v('V')}`, `${v('I')} = ${fr(v('P'), v('V'))}`, [`${v('I')} = ${fr(v('V'), v('P'))}`, `${v('I')} = ${v('P')}${v('V')}`, `${v('I')} = ${v('P')} − ${v('V')}`]],
    ['wave', `Make ${v('λ')} the subject of ${v('v')} = ${v('f')}${v('λ')}`, `${v('λ')} = ${fr(v('v'), v('f'))}`, [`${v('λ')} = ${fr(v('f'), v('v'))}`, `${v('λ')} = ${v('v')}${v('f')}`, `${v('λ')} = ${v('v')} − ${v('f')}`]],
    ['power', `Make ${v('t')} the subject of ${v('P')} = ${fr(v('W'), v('t'))}`, `${v('t')} = ${fr(v('W'), v('P'))}`, [`${v('t')} = ${fr(v('P'), v('W'))}`, `${v('t')} = ${v('P')}${v('W')}`, `${v('t')} = ${v('W')} − ${v('P')}`]],
    ['ke', `Make ${v('v')} the subject of ${v('E')}<sub>k</sub> = ½${v('m')}${sq(v('v'))}`, `${v('v')} = √(${fr('2' + v('E') + '<sub>k</sub>', v('m'))})`, [`${v('v')} = √(${fr(v('E') + '<sub>k</sub>', '2' + v('m'))})`, `${v('v')} = ${fr('2' + v('E') + '<sub>k</sub>', v('m'))}`, `${v('v')} = √(${fr('2' + v('m'), v('E') + '<sub>k</sub>')})`]],
    ['gpe', `Make ${D}${v('h')} the subject of ${D}${v('E')}<sub>p</sub> = ${v('m')}${v('g')}${D}${v('h')}`, `${D}${v('h')} = ${fr(D + v('E') + '<sub>p</sub>', v('m') + v('g'))}`, [`${D}${v('h')} = ${fr(v('m') + v('g'), D + v('E') + '<sub>p</sub>')}`, `${D}${v('h')} = ${D}${v('E')}<sub>p</sub>${v('m')}${v('g')}`, `${D}${v('h')} = ${fr(D + v('E') + '<sub>p</sub>' + v('g'), v('m'))}`]],
    ['shc', `Make ${D}${v('θ')} the subject of ${v('c')} = ${fr(D + v('E'), v('m') + D + v('θ'))}`, `${D}${v('θ')} = ${fr(D + v('E'), v('m') + v('c'))}`, [`${D}${v('θ')} = ${fr(v('m') + v('c'), D + v('E'))}`, `${D}${v('θ')} = ${D}${v('E')}${v('m')}${v('c')}`, `${D}${v('θ')} = ${fr(D + v('E') + v('c'), v('m'))}`]],
    ['current', `Make ${v('Q')} the subject of ${v('I')} = ${fr(v('Q'), v('t'))}`, `${v('Q')} = ${v('I')}${v('t')}`, [`${v('Q')} = ${fr(v('I'), v('t'))}`, `${v('Q')} = ${fr(v('t'), v('I'))}`, `${v('Q')} = ${v('I')} + ${v('t')}`]],
    ['spring', `Make ${v('x')} the subject of ${v('k')} = ${fr(v('F'), v('x'))}`, `${v('x')} = ${fr(v('F'), v('k'))}`, [`${v('x')} = ${fr(v('k'), v('F'))}`, `${v('x')} = ${v('F')}${v('k')}`, `${v('x')} = ${v('F')} − ${v('k')}`]],
    ['trans', `Make ${v('N')}<sub>s</sub> the subject of ${fr(v('V') + '<sub>p</sub>', v('V') + '<sub>s</sub>')} = ${fr(v('N') + '<sub>p</sub>', v('N') + '<sub>s</sub>')}`, `${v('N')}<sub>s</sub> = ${fr(v('N') + '<sub>p</sub>' + v('V') + '<sub>s</sub>', v('V') + '<sub>p</sub>')}`, [`${v('N')}<sub>s</sub> = ${fr(v('N') + '<sub>p</sub>' + v('V') + '<sub>p</sub>', v('V') + '<sub>s</sub>')}`, `${v('N')}<sub>s</sub> = ${fr(v('V') + '<sub>p</sub>', v('N') + '<sub>p</sub>' + v('V') + '<sub>s</sub>')}`, `${v('N')}<sub>s</sub> = ${v('N')}<sub>p</sub>${v('V')}<sub>p</sub>${v('V')}<sub>s</sub>`]],
    ['snell', `Make sin ${v('r')} the subject of ${v('n')} = ${fr('sin ' + v('i'), 'sin ' + v('r'))}`, `sin ${v('r')} = ${fr('sin ' + v('i'), v('n'))}`, [`sin ${v('r')} = ${v('n')} sin ${v('i')}`, `sin ${v('r')} = ${fr(v('n'), 'sin ' + v('i'))}`, `sin ${v('r')} = sin ${v('i')} − ${v('n')}`]],
  ];
  const eqById = Object.fromEntries(EQ.map((e) => [e.id, e]));
  for (const [id, q, right, wrong] of RE) {
    addCard(`pr-${id}`, 'prearr', () => ({
      prompt: `${q}.`,
      ...mcq(right, wrong),
      explain: `<p class="qz-eq">${right}</p><p class="qz-note">From ${eqById[id].eq}: ${eqById[id].key}.</p>`,
    }));
  }

  /* ── units ── */
  const UNITS = [
    ['speed', 'm/s'], ['acceleration', 'm/s<sup>2</sup>'], ['force', 'N (newton)'], ['weight', 'N (newton)'], ['mass', 'kg'],
    ['density', 'kg/m<sup>3</sup>'], ['gravitational field strength', 'N/kg'], ['the spring constant', 'N/m'], ['moment of a force', 'N m'],
    ['momentum', 'kg m/s'], ['impulse', 'N s'], ['energy and work done', 'J (joule)'], ['power', 'W (watt)'], ['pressure', 'Pa (pascal)'],
    ['specific heat capacity', 'J/(kg °C)'], ['frequency', 'Hz (hertz)'], ['charge', 'C (coulomb)'], ['current', 'A (ampere)'],
    ['potential difference and e.m.f.', 'V (volt)'], ['resistance', 'Ω (ohm)'], ['temperature on the absolute scale', 'K (kelvin)'],
  ];
  const UNIT_POOL = [...new Set(UNITS.map((u) => u[1]))];
  const UNIT_TRAP = {
    momentum: ['kg m/s<sup>2</sup>', 'N (newton)', 'J (joule)'], impulse: ['kg m/s<sup>2</sup>', 'J', 'W'], 'moment of a force': ['J (joule)', 'N/m', 'Pa (pascal)'],
    'the spring constant': ['N m', 'N/kg', 'Pa (pascal)'], 'gravitational field strength': ['N (newton)', 'kg', 'N/m'], pressure: ['N (newton)', 'N m', 'J (joule)'],
    'specific heat capacity': ['J/kg', 'J/°C', 'W (watt)'], acceleration: ['m/s', 'N (newton)', 'm s'], density: ['kg/m<sup>2</sup>', 'g', 'N/m<sup>3</sup>'],
    power: ['J (joule)', 'V (volt)', 'N m'], 'energy and work done': ['W (watt)', 'N (newton)', 'N/m'], charge: ['A (ampere)', 'V (volt)', 'J (joule)'],
    current: ['C (coulomb)', 'V (volt)', 'W (watt)'],
  };
  // Units that are the same thing written another way must never be offered as wrong answers.
  const EQUIV = { momentum: ['N s'], impulse: ['kg m/s'], acceleration: ['N/kg'], 'gravitational field strength': ['m/s<sup>2</sup>'], 'energy and work done': ['N m'] };
  for (const [q, u] of UNITS) {
    const pool = UNIT_POOL.filter((x) => !(EQUIV[q] || []).includes(x));
    addCard(`pu-${q.replace(/[^a-z]+/g, '-')}`, 'punit', () => ({
      prompt: `What is the unit of <b>${q}</b>?`,
      ...mcq(u, pickDistinct(u, (UNIT_TRAP[q] || []).filter((x) => x !== u), pool)),
      explain: `${q.charAt(0).toUpperCase() + q.slice(1)} is measured in ${u}.`,
    }));
  }

  /* ── values the syllabus says to know ── */
  const VALS = [
    ['c', 'the speed of electromagnetic waves (including light) in a vacuum', '3.0 × 10<sup>8</sup> m/s', ['3.0 × 10<sup>6</sup> m/s', '330 m/s', '3.0 × 10<sup>10</sup> m/s'], 'Approximately the same in air. All electromagnetic waves travel at this speed in a vacuum. (The value is Supplement.)'],
    ['sound', 'the speed of sound in air', 'approximately 330–350 m/s', ['approximately 1500 m/s', '3.0 × 10<sup>8</sup> m/s', 'approximately 33–35 m/s'], 'Sound travels faster in liquids and faster still in solids.'],
    ['hearing', 'the range of frequencies audible to humans', '20 Hz to 20 000 Hz', ['2 Hz to 2000 Hz', '20 Hz to 2000 Hz', '200 Hz to 200 000 Hz'], 'Ultrasound is sound above 20 kHz.'],
    ['ultra', 'the frequency of ultrasound', 'above 20 kHz', ['below 20 Hz', 'above 20 Hz', 'between 20 Hz and 20 kHz'], 'Humans hear 20 Hz to 20 000 Hz; ultrasound is higher than that.'],
    ['g', 'the acceleration of free fall, <var>g</var>, near the Earth’s surface', 'approximately 9.8 m/s<sup>2</sup>', ['approximately 98 m/s<sup>2</sup>', 'approximately 3.0 m/s<sup>2</sup>', 'approximately 1.6 m/s<sup>2</sup>'], 'The same number is the gravitational field strength: 9.8 N/kg.'],
    ['abszero', 'absolute zero', '−273 °C (0 K)', ['0 °C (273 K)', '−100 °C (173 K)', '−373 °C (−100 K)'], 'T (in K) = θ (in °C) + 273.'],
    ['melt', 'the melting temperature of water at standard atmospheric pressure', '0 °C', ['100 °C', '−273 °C', '4 °C'], 'Water melts at 0 °C and boils at 100 °C at standard atmospheric pressure.'],
    ['boil', 'the boiling temperature of water at standard atmospheric pressure', '100 °C', ['0 °C', '373 °C', '212 °C'], 'Water melts at 0 °C and boils at 100 °C (373 K) at standard atmospheric pressure.'],
    ['ly', 'one light-year', '9.5 × 10<sup>15</sup> m', ['3.0 × 10<sup>8</sup> m', '9.5 × 10<sup>12</sup> m', '365 days'], 'A light-year is a distance: how far light travels in a year. (Supplement)'],
    ['milky', 'the diameter of the Milky Way', 'approximately 100 000 light-years', ['approximately 100 light-years', 'approximately 1 000 000 000 light-years', 'approximately 9.5 × 10<sup>15</sup> m'], ''],
    ['h0', 'the current estimate of the Hubble constant, <var>H</var><sub>0</sub>', '2.2 × 10<sup>−18</sup> per second', ['2.2 × 10<sup>18</sup> per second', '9.5 × 10<sup>−15</sup> per second', '3.0 × 10<sup>−8</sup> per second'], 'H<sub>0</sub> = v ÷ d. (Supplement)'],
    ['rot', 'how long the Earth takes to rotate once on its axis', 'approximately 24 hours', ['approximately 365 days', 'approximately one month', 'approximately 12 hours'], 'This gives day and night.'],
    ['year', 'how long the Earth takes to orbit the Sun', 'approximately 365 days', ['approximately 24 hours', 'approximately one month', 'approximately 30 days'], ''],
    ['moon', 'how long the Moon takes to orbit the Earth', 'approximately one month', ['approximately 24 hours', 'approximately 365 days', 'approximately one week'], ''],
  ];
  for (const [id, what, right, wrong, note] of VALS) {
    addCard(`pv-${id}`, 'pval', () => ({
      prompt: `What is ${what}?`,
      ...mcq(right, wrong),
      explain: `${what.charAt(0).toUpperCase() + what.slice(1)}: <b>${right}</b>.${note ? ` ${note}` : ''}`,
    }));
  }
  addCard('pv-charges', 'pval', () => ({
    type: 'match',
    prompt: 'Match each particle to its relative charge.',
    pairs: [['proton', '+1'], ['neutron', '0'], ['electron', '−1']],
    explain: 'Protons +1, neutrons 0, electrons −1.',
  }));
  const EM = ['radio waves', 'microwaves', 'infrared', 'visible light', 'ultraviolet', 'X-rays', 'gamma rays'];
  addCard('pv-em-f', 'pval', () => ({
    type: 'order', prompt: 'Put the electromagnetic spectrum in order of <b>increasing frequency</b>.', first: 'the lowest frequency',
    items: EM, explain: `Increasing frequency (decreasing wavelength): ${EM.join(', ')}.`,
  }));
  addCard('pv-em-l', 'pval', () => ({
    type: 'order', prompt: 'Put the electromagnetic spectrum in order of <b>increasing wavelength</b>.', first: 'the shortest wavelength',
    items: EM.slice().reverse(), explain: `Increasing wavelength (decreasing frequency): ${EM.slice().reverse().join(', ')}.`,
  }));
  const COL = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
  addCard('pv-vis-f', 'pval', () => ({
    type: 'order', prompt: 'Put the seven colours of the visible spectrum in order of <b>increasing frequency</b>.', first: 'the lowest frequency',
    items: COL, explain: 'Red has the lowest frequency and longest wavelength; violet the highest frequency and shortest wavelength.',
  }));

  /* ── definitions (syllabus wording) ── */
  defs('phys', 'pdef', [
    { id: 'pd-speed', g: 'per', term: 'Speed', text: '{distance travelled} per {unit time}', x: ['change in velocity', 'unit distance'] },
    { id: 'pd-velocity', term: 'Velocity', text: '{speed} in a {given direction}', x: ['acceleration', 'straight line'] },
    { id: 'pd-accel', g: 'per', term: 'Acceleration', text: '{change in velocity} per {unit time}', note: 'Supplement.', x: ['distance travelled', 'unit distance'] },
    { id: 'pd-gfs', g: 'per', term: 'Gravitational field strength', text: '{force} per {unit mass}', x: ['unit area', 'mass'] },
    { id: 'pd-density', g: 'per', term: 'Density', text: '{mass} per {unit volume}', x: ['weight', 'unit area'] },
    { id: 'pd-spring', g: 'per', term: 'Spring constant', text: '{force} per {unit extension}', note: 'Supplement.', x: ['unit length', 'unit mass'] },
    { id: 'pd-pressure', g: 'per', term: 'Pressure', text: '{force} per {unit area}', x: ['unit volume', 'mass'] },
    { id: 'pd-moment', term: 'Moment of a force', text: '{force} × {perpendicular distance} from the {pivot}', x: ['time', 'mass'] },
    { id: 'pd-momentum', g: 'mom', sw: [['mass', 'velocity']], term: 'Momentum', text: '{mass} × {velocity}', note: 'Supplement.', x: ['acceleration', 'force'] },
    { id: 'pd-impulse', g: 'mom', sw: [['force', 'time']], term: 'Impulse', text: '{force} × {time} for which force acts', note: 'Supplement.', x: ['distance', 'mass'] },
    { id: 'pd-resultant', g: 'mom', term: 'Resultant force', text: 'the {change in momentum} per {unit time}', note: 'Supplement.', x: ['change in velocity', 'unit distance'] },
    { id: 'pd-power', sw: [['work done', 'energy transferred']], term: 'Power', text: '{work done} per {unit time} and also {energy transferred} per unit time', x: ['force', 'unit distance'] },
    { id: 'pd-shc', term: 'Specific heat capacity', text: 'the {energy} required per {unit mass} per {unit temperature increase}', note: 'Supplement.', x: ['unit volume', 'power'] },
    { id: 'pd-refractive', term: 'Refractive index, <var>n</var>', text: 'the {ratio} of the {speeds} of a wave in {two different regions}', note: 'Supplement.', x: ['angles', 'difference', 'frequencies'] },
    { id: 'pd-current', g: 'per', term: 'Electric current', text: 'the {charge} passing a point per {unit time}', note: 'Supplement.', x: ['energy', 'voltage'] },
    { id: 'pd-halflife', term: 'Half-life of a particular isotope', text: 'the {time taken} for {half the nuclei} of that isotope in any sample to {decay}', x: ['all the nuclei', 'half the mass'] },
    { id: 'pd-hubble', term: 'Hubble constant, <var>H</var><sub>0</sub>', text: 'the {ratio} of the {speed} at which the galaxy is moving away from the Earth to its {distance} from the Earth', note: 'Supplement.', x: ['mass', 'age'] },
    { id: 'pd-emf', g: 'emf', term: 'Electromotive force (e.m.f.)', text: 'the {electrical work done} by a source in moving a {unit charge} around a {complete circuit}', x: ['unit mass', 'single component'] },
    { id: 'pd-pd', g: 'emf', term: 'Potential difference (p.d.)', text: 'the {work done} by a {unit charge} passing through a {component}', x: ['unit mass', 'complete circuit'] },
    { id: 'pd-lightyear', term: 'Light-year', text: 'the {distance} travelled in (the vacuum of) space by {light} in {one year}', x: ['time', 'sound', 'one day'] },
  ]);

  /* ── cheat sheet ── */
  const unitTable = () => `<table class="qz-tbl"><tbody>${UNITS.map(([q, u]) => `<tr><th scope="row">${q.charAt(0).toUpperCase() + q.slice(1)}</th><td>${u}</td></tr>`).join('')}</tbody></table>`;
  QZ.SHEETS.phys = () => `<div class="qz-sheet">
    <nav class="qz-jump" aria-label="Jump to"><button data-act="qz-jump" data-to="qzp-eq">Equations</button><button data-act="qz-jump" data-to="qzp-val">Values</button><button data-act="qz-jump" data-to="qzp-unit">Units</button><button data-act="qz-jump" data-to="qzp-def">Definitions</button></nav>
    <h4 id="qzp-eq">Equations you must recall</h4>
    <p class="fine">There is no equation sheet in the exam. <span class="qz-s-tag">S</span> marks Supplement (Extended) equations.</p>
    <ul class="qz-eqs">${EQ.map((e) => `<li><span class="qz-eqn">${e.n.charAt(0).toUpperCase() + e.n.slice(1)}${e.lvl === 'S' ? ' <span class="qz-s-tag">S</span>' : ''}</span><span class="qz-eq">${e.eq}</span><small>${e.key}</small></li>`).join('')}</ul>
    <h4 id="qzp-val">Values to know</h4>
    <dl class="qz-defs">${VALS.map(([, what, right]) => `<div><dt>${what.charAt(0).toUpperCase() + what.slice(1)}</dt><dd><b>${right}</b></dd></div>`).join('')}
      <div><dt>Relative charges</dt><dd>proton <b>+1</b>, neutron <b>0</b>, electron <b>−1</b></dd></div></dl>
    <p class="qz-order"><b>Electromagnetic spectrum</b>, increasing frequency →<br>${EM.join(' · ')}</p>
    <p class="qz-order"><b>Visible spectrum</b>, increasing frequency →<br>${COL.join(' · ')}</p>
    <h4 id="qzp-unit">Units</h4>
    ${unitTable()}
    <h4 id="qzp-def">Definitions</h4>
    ${qzDefsListHTML('phys')}
  </div>`;
})();
