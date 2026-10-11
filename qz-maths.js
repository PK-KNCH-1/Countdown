/* Maths deck: only what the Cambridge IGCSE International Mathematics 0607 (Extended, 2025–2027) syllabus
   expects you to know without being given it. Areas and volumes of circles, cylinders, cones, spheres, pyramids and prisms,
   the quadratic formula, the sine and cosine rules and ½ab sin C are printed on page 2 of Papers 2 and 4,
   so they are left out on purpose. */

(() => {
  const { fr, mcq, addCard, addTopics, shuffle } = QZ;
  const v = (x) => `<var>${x}</var>`;
  const sq = (x) => `${x}<sup>2</sup>`;
  const sub = (x, n) => `${v(x)}<sub>${n}</sub>`;
  const x1 = sub('x', 1), x2 = sub('x', 2), y1 = sub('y', 1), y2 = sub('y', 2);
  const cv = (a, b) => `<span class="cv"><span>${a}</span><span>${b}</span></span>`;

  addTopics('maths', {
    mform: 'Formulas you must know',
    mtrig: 'Exact trig values',
    mangle: 'Angles and polygons',
    mcircle: 'Circle theorems',
    mfunc: 'Functions, graphs and logs',
    mprob: 'Probability, proportion and sequences',
  });

  /* ── formulas not given in the exam ── */
  const F = [
    ['pyth', 'Pythagoras’ theorem', `For a right-angled triangle with hypotenuse ${v('c')} and shorter sides ${v('a')} and ${v('b')}, which is true?`, `${sq(v('a'))} + ${sq(v('b'))} = ${sq(v('c'))}`, [`${sq(v('a'))} + ${sq(v('c'))} = ${sq(v('b'))}`, `${v('a')} + ${v('b')} = ${v('c')}`, `${sq(v('c'))} = ${sq(v('a'))} − ${sq(v('b'))}`], 'The hypotenuse is the longest side, opposite the right angle.'],
    ['sin', 'Sine ratio', `In a right-angled triangle, sin ${v('x')} =`, fr('opposite', 'hypotenuse'), [fr('adjacent', 'hypotenuse'), fr('opposite', 'adjacent'), fr('hypotenuse', 'opposite')], 'SOH CAH TOA: Sin = Opposite ÷ Hypotenuse.'],
    ['cos', 'Cosine ratio', `In a right-angled triangle, cos ${v('x')} =`, fr('adjacent', 'hypotenuse'), [fr('opposite', 'hypotenuse'), fr('opposite', 'adjacent'), fr('hypotenuse', 'adjacent')], 'SOH CAH TOA: Cos = Adjacent ÷ Hypotenuse.'],
    ['tan', 'Tangent ratio', `In a right-angled triangle, tan ${v('x')} =`, fr('opposite', 'adjacent'), [fr('adjacent', 'opposite'), fr('opposite', 'hypotenuse'), fr('adjacent', 'hypotenuse')], 'SOH CAH TOA: Tan = Opposite ÷ Adjacent.'],
    ['trap', 'Area of a trapezium', `Area of a trapezium with parallel sides ${v('a')} and ${v('b')} and height ${v('h')}:`, `½(${v('a')} + ${v('b')})${v('h')}`, [`(${v('a')} + ${v('b')})${v('h')}`, `½${v('a')}${v('b')}${v('h')}`, `½(${v('a')} − ${v('b')})${v('h')}`], 'Of the rectangle, triangle, parallelogram and trapezium, only the triangle’s area formula is given.'],
    ['para', 'Area of a parallelogram', 'Area of a parallelogram:', 'base × perpendicular height', ['½ × base × perpendicular height', 'base × slanting side', '2 × (base + height)'], 'Use the perpendicular height, not the slanting side.'],
    ['cubv', 'Volume of a cuboid', `Volume of a cuboid ${v('l')} by ${v('w')} by ${v('h')}:`, `${v('l')}${v('w')}${v('h')}`, [`2(${v('l')}${v('w')} + ${v('l')}${v('h')} + ${v('w')}${v('h')})`, `${v('l')}${v('w')} + ${v('h')}`, `⅓${v('l')}${v('w')}${v('h')}`], 'A cuboid is a prism, so its volume is also area of cross-section × length.'],
    ['cubsa', 'Surface area of a cuboid', `Total surface area of a cuboid ${v('l')} by ${v('w')} by ${v('h')}:`, `2(${v('l')}${v('w')} + ${v('l')}${v('h')} + ${v('w')}${v('h')})`, [`${v('l')}${v('w')}${v('h')}`, `${v('l')}${v('w')} + ${v('l')}${v('h')} + ${v('w')}${v('h')}`, `6${v('l')}${v('w')}`], 'Six faces in three matching pairs.'],
    ['arc', 'Arc length', `Length of an arc with angle ${v('θ')}° at the centre, radius ${v('r')}:`, `${fr(v('θ'), '360')} × 2π${v('r')}`, [`${fr(v('θ'), '360')} × π${sq(v('r'))}`, `${fr('360', v('θ'))} × 2π${v('r')}`, `${v('θ')} × 2π${v('r')}`], 'Not on the formula list: it is θ/360 of the circumference 2πr, which is given.'],
    ['sector', 'Area of a sector', `Area of a sector with angle ${v('θ')}° at the centre, radius ${v('r')}:`, `${fr(v('θ'), '360')} × π${sq(v('r'))}`, [`${fr(v('θ'), '360')} × 2π${v('r')}`, `${fr('360', v('θ'))} × π${sq(v('r'))}`, `${v('θ')}π${sq(v('r'))}`], 'Not on the formula list: it is θ/360 of the circle area πr², which is given.'],
    ['grad', 'Gradient from two points', `Gradient of the line through (${x1}, ${y1}) and (${x2}, ${y2}):`, fr(`${y2} − ${y1}`, `${x2} − ${x1}`), [fr(`${x2} − ${x1}`, `${y2} − ${y1}`), fr(`${y2} + ${y1}`, `${x2} + ${x1}`), fr(`${y2} − ${x2}`, `${y1} − ${x1}`)], 'Change in y ÷ change in x (“rise over run”).'],
    ['length', 'Length of a line segment', `Length of the line from (${x1}, ${y1}) to (${x2}, ${y2}):`, `√((${x2} − ${x1})<sup>2</sup> + (${y2} − ${y1})<sup>2</sup>)`, [`(${x2} − ${x1}) + (${y2} − ${y1})`, `(${x2} − ${x1})<sup>2</sup> + (${y2} − ${y1})<sup>2</sup>`, `√((${x2} + ${x1})<sup>2</sup> + (${y2} + ${y1})<sup>2</sup>)`], 'Pythagoras on the change in x and the change in y.'],
    ['mid', 'Midpoint of a line segment', `Midpoint of the line from (${x1}, ${y1}) to (${x2}, ${y2}):`, `(${fr(`${x1} + ${x2}`, '2')}, ${fr(`${y1} + ${y2}`, '2')})`, [`(${fr(`${x2} − ${x1}`, '2')}, ${fr(`${y2} − ${y1}`, '2')})`, `(${x1} + ${x2}, ${y1} + ${y2})`, `(${fr(`${x1} + ${y1}`, '2')}, ${fr(`${x2} + ${y2}`, '2')})`], 'Average the x-coordinates and average the y-coordinates.'],
    ['ymxc', 'y = mx + c', `In ${v('y')} = ${v('m')}${v('x')} + ${v('c')}, what are ${v('m')} and ${v('c')}?`, `${v('m')} is the gradient; ${v('c')} is the ${v('y')}-intercept`, [`${v('m')} is the ${v('y')}-intercept; ${v('c')} is the gradient`, `${v('m')} is the ${v('x')}-intercept; ${v('c')} is the ${v('y')}-intercept`, `${v('m')} is the gradient; ${v('c')} is the ${v('x')}-intercept`], 'Rearrange into y = mx + c first, e.g. 5x + 4y = 8 gives y = −1.25x + 2.'],
    ['parallel', 'Parallel lines', 'Two straight lines are parallel when…', 'they have the same gradient', ['their gradients multiply to −1', 'they have the same y-intercept', 'their gradients add to 0'], 'Parallel lines have equal gradients.'],
    ['perp', 'Perpendicular gradients', `A line has gradient ${v('m')}. A line perpendicular to it has gradient…`, `−${fr('1', v('m'))}`, [fr('1', v('m')), `−${v('m')}`, v('m')], `The two gradients multiply to −1: ${v('m')}<sub>1</sub> × ${v('m')}<sub>2</sub> = −1.`],
    ['speed', 'Speed', 'Average speed =', fr('total distance', 'total time'), [fr('total time', 'total distance'), 'total distance × total time', fr('total distance', '2')], 'The syllabus says you need to know this one.'],
    ['simple', 'Simple interest', `Simple interest on ${v('P')} at ${v('r')}% a year for ${v('n')} years:`, fr(`${v('P')} × ${v('r')} × ${v('n')}`, '100'), [`${v('P')}(1 + ${fr(v('r'), '100')})<sup>${v('n')}</sup>`, `${v('P')} × ${v('r')} × ${v('n')}`, `${v('P')} + ${fr(v('r') + v('n'), '100')}`], 'Interest formulas are not given in the exam.'],
    ['compound', 'Compound interest', `Value of ${v('P')} after ${v('n')} years at ${v('r')}% compound interest:`, `${v('P')}(1 + ${fr(v('r'), '100')})<sup>${v('n')}</sup>`, [`${v('P')}(1 + ${fr(v('r') + v('n'), '100')})`, `${v('P')}(${fr(v('r'), '100')})<sup>${v('n')}</sup>`, `${v('P')}(1 + ${v('r')})<sup>${v('n')}</sup>`], 'Subtract P at the end if the question asks for the interest only.'],
    ['deprec', 'Depreciation', `Value of ${v('P')} after ${v('n')} years losing ${v('r')}% a year:`, `${v('P')}(1 − ${fr(v('r'), '100')})<sup>${v('n')}</sup>`, [`${v('P')}(1 + ${fr(v('r'), '100')})<sup>${v('n')}</sup>`, `${v('P')} − ${fr(v('r') + v('n'), '100')}`, `${v('P')}(${fr(v('r'), '100')})<sup>${v('n')}</sup>`], 'Same as compound interest, with a minus.'],
    ['pchange', 'Percentage change', 'Percentage increase or decrease =', `${fr('change', 'original')} × 100`, [`${fr('change', 'new value')} × 100`, `${fr('new value', 'original')} × 100`, `${fr('original', 'change')} × 100`], 'Always divide by the original amount.'],
    ['reverse', 'Reverse percentages', 'After a 20% increase a price is $96. The original price is…', '$96 ÷ 1.2', ['$96 × 0.8', '$96 ÷ 0.8', '$96 − 20% of $96'], 'Original = new ÷ (1 + r/100) after an increase, or new ÷ (1 − r/100) after a decrease.'],
    ['notp', 'Probability of “not”', 'P(A′), the probability of not A, =', '1 − P(A)', ['P(A) − 1', '1 ÷ P(A)', '0.5 − P(A)'], 'Probabilities of all outcomes add up to 1.'],
    ['vec', 'Magnitude of a vector', `The magnitude of the vector ${cv(v('x'), v('y'))} is…`, `√(${sq(v('x'))} + ${sq(v('y'))})`, [`${v('x')} + ${v('y')}`, `${sq(v('x'))} + ${sq(v('y'))}`, `√(${v('x')} + ${v('y')})`], 'Pythagoras on the two components. Written with modulus signs, e.g. |<b>a</b>|.'],
  ];
  for (const [id, , q, right, wrong, note] of F) {
    addCard(`mf-${id}`, 'mform', () => ({ prompt: q, ...mcq(right, wrong), explain: `<p class="qz-eq">${right}</p><p class="qz-note">${note}</p>` }));
  }
  const IDX = [
    ['mult', `${v('a')}<sup>${v('m')}</sup> × ${v('a')}<sup>${v('n')}</sup> =`, `${v('a')}<sup>${v('m')} + ${v('n')}</sup>`, [`${v('a')}<sup>${v('m')}${v('n')}</sup>`, `${v('a')}<sup>${v('m')} − ${v('n')}</sup>`, `(2${v('a')})<sup>${v('m')} + ${v('n')}</sup>`]],
    ['div', `${v('a')}<sup>${v('m')}</sup> ÷ ${v('a')}<sup>${v('n')}</sup> =`, `${v('a')}<sup>${v('m')} − ${v('n')}</sup>`, [`${v('a')}<sup>${v('m')} ÷ ${v('n')}</sup>`, `${v('a')}<sup>${v('m')} + ${v('n')}</sup>`, `1<sup>${v('m')} − ${v('n')}</sup>`]],
    ['pow', `(${v('a')}<sup>${v('m')}</sup>)<sup>${v('n')}</sup> =`, `${v('a')}<sup>${v('m')}${v('n')}</sup>`, [`${v('a')}<sup>${v('m')} + ${v('n')}</sup>`, `${v('a')}<sup>${v('m')}<sup>${v('n')}</sup></sup>`, `${v('n')}${v('a')}<sup>${v('m')}</sup>`]],
    ['zero', `${v('a')}<sup>0</sup> =`, '1', ['0', v('a'), 'undefined']],
    ['neg', `${v('a')}<sup>−${v('n')}</sup> =`, fr('1', `${v('a')}<sup>${v('n')}</sup>`), [`−${v('a')}<sup>${v('n')}</sup>`, fr(`−1`, `${v('a')}<sup>${v('n')}</sup>`), `${v('a')}<sup>${fr('1', v('n'))}</sup>`]],
    ['frac', `${v('a')}<sup>${fr(v('m'), v('n'))}</sup> =`, `(<sup>${v('n')}</sup>√${v('a')})<sup>${v('m')}</sup>`, [`(<sup>${v('m')}</sup>√${v('a')})<sup>${v('n')}</sup>`, fr(`${v('a')}<sup>${v('m')}</sup>`, v('n')), `${v('a')}<sup>${v('m')}</sup> − ${v('a')}<sup>${v('n')}</sup>`]],
  ];
  for (const [id, q, right, wrong] of IDX) {
    addCard(`mi-${id}`, 'mform', () => ({ prompt: `Laws of indices: ${q}`, ...mcq(right, wrong), explain: `<p class="qz-eq">${q} ${right}</p>` }));
  }

  /* ── exact trigonometric values ── */
  const R2 = fr('√2', '2'), R3 = fr('√3', '2'), H = fr('1', '2'), T30 = fr('1', '√3');
  const TRIG = [
    ['sin', 0, '0'], ['sin', 30, H], ['sin', 45, R2], ['sin', 60, R3], ['sin', 90, '1'],
    ['cos', 0, '1'], ['cos', 30, R3], ['cos', 45, R2], ['cos', 60, H], ['cos', 90, '0'],
    ['tan', 0, '0'], ['tan', 30, T30], ['tan', 45, '1'], ['tan', 60, '√3'],
  ];
  const TRIG_POOL = ['0', H, R2, R3, '1', T30, '√3'];
  const trigNote = (f, a, val) => `${f} ${a}° = ${val}${f === 'tan' && a === 30 ? ` (also written ${fr('√3', '3')})` : ''}${val === R2 ? ` (also written ${fr('1', '√2')})` : ''}.`;
  for (const [f, a, val] of TRIG) {
    addCard(`mt-${f}${a}`, 'mtrig', () => ({
      prompt: `What is the exact value of <b>${f} ${a}°</b>?`,
      ...mcq(val, shuffle(TRIG_POOL.filter((x) => x !== val)).slice(0, 3)),
      explain: `<p class="qz-eq">${trigNote(f, a, val)}</p><p class="qz-note">Memory aid: sin 0°, 30°, 45°, 60°, 90° = √0⁄2, √1⁄2, √2⁄2, √3⁄2, √4⁄2. Cos runs the same list backwards. tan = sin ÷ cos.</p>`,
    }));
  }
  addCard('mt-match-sin', 'mtrig', () => ({
    type: 'match', prompt: 'Match each angle to its sine.',
    pairs: [['sin 30°', H], ['sin 45°', R2], ['sin 60°', R3], ['sin 90°', '1']],
    explain: 'sin 30° = ½, sin 45° = √2⁄2, sin 60° = √3⁄2, sin 90° = 1.',
  }));
  addCard('mt-match-tan', 'mtrig', () => ({
    type: 'match', prompt: 'Match each angle to its tangent.',
    pairs: [['tan 0°', '0'], ['tan 30°', T30], ['tan 45°', '1'], ['tan 60°', '√3']],
    explain: 'tan 0° = 0, tan 30° = 1⁄√3, tan 45° = 1, tan 60° = √3. tan 90° is undefined.',
  }));

  /* ── angles and polygons ── */
  const ANG = [
    ['point', 'Angles at a point add up to…', '360°', ['180°', '90°', '540°']],
    ['line', 'Angles at a point on a straight line add up to…', '180°', ['360°', '90°', '270°']],
    ['vert', 'Vertically opposite angles are…', 'equal', ['supplementary (add to 180°)', 'complementary (add to 90°)', 'in the ratio 1 : 2']],
    ['tri', 'The angles in a triangle add up to…', '180°', ['360°', '90°', '270°']],
    ['quad', 'The angles in a quadrilateral add up to…', '360°', ['180°', '540°', '720°']],
    ['corr', 'Where a line crosses parallel lines, corresponding angles are…', 'equal', ['supplementary (add to 180°)', 'complementary (add to 90°)', 'unrelated']],
    ['alt', 'Where a line crosses parallel lines, alternate angles are…', 'equal', ['supplementary (add to 180°)', 'complementary (add to 90°)', 'unrelated']],
    ['coint', 'Where a line crosses parallel lines, co-interior angles…', 'add up to 180° (supplementary)', ['are equal', 'add up to 90°', 'add up to 360°']],
    ['sumint', `The interior angles of a polygon with ${v('n')} sides add up to…`, `(${v('n')} − 2) × 180°`, [`${v('n')} × 180°`, `(${v('n')} − 2) × 360°`, `(${v('n')} + 2) × 180°`]],
    ['sumext', 'The exterior angles of any polygon add up to…', '360°', ['180°', `(${v('n')} − 2) × 180°`, '540°']],
    ['regext', `Each exterior angle of a regular polygon with ${v('n')} sides is…`, `${fr('360°', v('n'))}`, [fr('180°', v('n')), fr(`(${v('n')} − 2) × 180°`, '360'), `360° − ${v('n')}`]],
    ['intext', 'An interior angle and its exterior angle add up to…', '180°', ['360°', '90°', 'the number of sides × 180°']],
    ['hex', 'Each interior angle of a regular hexagon is…', '120°', ['108°', '135°', '60°']],
    ['oct', 'Each exterior angle of a regular octagon is…', '45°', ['135°', '40°', '60°']],
    ['pent', 'The interior angles of a pentagon add up to…', '540°', ['360°', '720°', '900°']],
    ['sides', 'A regular polygon has exterior angles of 30°. How many sides does it have?', '12', ['6', '10', '30']],
  ];
  const angNote = {
    hex: 'Exterior angle = 360° ÷ 6 = 60°, so interior = 180° − 60° = 120°.', oct: '360° ÷ 8 = 45°.', pent: '(5 − 2) × 180° = 540°.', sides: '360° ÷ 30° = 12 sides.',
  };
  for (const [id, q, right, wrong] of ANG) {
    addCard(`ma-${id}`, 'mangle', () => ({ prompt: q, ...mcq(right, wrong), explain: `${q.replace(/…$/, '')} <b>${right}</b>.${angNote[id] ? ` ${angNote[id]}` : ''}` }));
  }

  /* ── functions, graphs and logarithms (0607 Extended) ── */
  const FN = [
    ['log', 'Logarithms', `If ${v('y')} = ${v('a')}<sup>${v('x')}</sup>, then ${v('x')} =`, `log<sub>${v('a')}</sub> ${v('y')}`, [`log<sub>${v('y')}</sub> ${v('a')}`, `${v('y')} log ${v('a')}`, `<sup>${v('a')}</sup>√${v('y')}`], 'The logarithm is the inverse of the exponential function. Logs are base 10 unless stated.'],
    ['logsolve', 'Solving with logs', `The solution of ${v('a')}<sup>${v('x')}</sup> = ${v('b')} is ${v('x')} =`, fr(`log ${v('b')}`, `log ${v('a')}`), [fr(`log ${v('a')}`, `log ${v('b')}`), `log(${v('b')} − ${v('a')})`, fr(v('b'), v('a'))], 'Take logs of both sides: x log a = log b.'],
    ['transup', 'Translation up or down', `The graph of ${v('y')} = f(${v('x')}) + ${v('k')} is the graph of ${v('y')} = f(${v('x')})…`, `translated by ${cv('0', v('k'))}: ${v('k')} units up`, [`translated by ${cv(v('k'), '0')}: ${v('k')} units right`, `translated by ${cv('−' + v('k'), '0')}: ${v('k')} units left`, `stretched by a factor of ${v('k')}`], 'Adding outside the bracket moves the graph up (or down if k is negative).'],
    ['transleft', 'Translation left or right', `The graph of ${v('y')} = f(${v('x')} + ${v('k')}) is the graph of ${v('y')} = f(${v('x')})…`, `translated by ${cv('−' + v('k'), '0')}: ${v('k')} units left`, [`translated by ${cv(v('k'), '0')}: ${v('k')} units right`, `translated by ${cv('0', v('k'))}: ${v('k')} units up`, `translated by ${cv('0', '−' + v('k'))}: ${v('k')} units down`], 'Inside the bracket works the opposite way: + k moves the graph left.'],
    ['composite', 'Composite functions', 'gf(<var>x</var>) means…', 'g(f(<var>x</var>)): apply f first, then g', ['f(g(<var>x</var>)): apply g first, then f', 'g(<var>x</var>) × f(<var>x</var>)', 'g(<var>x</var>) + f(<var>x</var>)'], 'Work from the inside out: the function nearest x acts first.'],
    ['inverse', 'Inverse functions', 'To find f<sup>−1</sup>(<var>x</var>) from <var>y</var> = f(<var>x</var>)…', 'make <var>x</var> the subject, then swap <var>x</var> and <var>y</var>', ['write 1 ÷ f(<var>x</var>)', 'replace <var>x</var> with −<var>x</var>', 'square f(<var>x</var>)'], 'f<sup>−1</sup> undoes f. It is not 1 ÷ f(x).'],
    ['period', 'Period of sin and cos', `The period of ${v('y')} = sin ${v('x')} and of ${v('y')} = cos ${v('x')} is…`, '360°', ['180°', '90°', '720°'], 'They repeat every 360°. tan x repeats every 180°.'],
    ['tanperiod', 'Period of tan', `The period of ${v('y')} = tan ${v('x')} is…`, '180°', ['360°', '90°', '45°'], 'tan x repeats every 180° and is undefined at 90° and 270°.'],
    ['amp', 'Amplitude and period', `For ${v('y')} = ${v('a')} sin(${v('b')}${v('x')}), the amplitude and period are…`, `amplitude ${v('a')}, period ${fr('360°', v('b'))}`, [`amplitude ${v('b')}, period ${fr('360°', v('a'))}`, `amplitude ${v('a')}, period 360° × ${v('b')}`, `amplitude 2${v('a')}, period ${fr('180°', v('b'))}`], 'The same for a cos(bx).'],
  ];
  for (const [id, , q, right, wrong, note] of FN) {
    addCard(`mg-${id}`, 'mfunc', () => ({ prompt: q, ...mcq(right, wrong), explain: `<p class="qz-eq">${right}</p><p class="qz-note">${note}</p>` }));
  }

  /* ── probability, proportion and sequences ── */
  const PR = [
    ['or', 'Mutually exclusive events', 'For mutually exclusive events, P(A or B) =', 'P(A) + P(B)', ['P(A) × P(B)', 'P(A) + P(B) − 1', '1 − P(A) × P(B)'], 'Mutually exclusive: they cannot both happen.'],
    ['and', 'Independent events', 'For independent events, P(A and B) =', 'P(A) × P(B)', ['P(A) + P(B)', 'P(A) ÷ P(B)', '1 − P(A) − P(B)'], 'Independent: one happening doesn’t change the chance of the other.'],
    ['direct', 'Direct proportion', `${v('y')} is directly proportional to the square of ${v('x')}. So…`, `${v('y')} = ${v('k')}${sq(v('x'))}`, [`${v('y')} = ${sq(v('x'))} + ${v('k')}`, `${v('y')} = ${fr(v('k'), sq(v('x')))}`, `${v('y')} = ${v('k')}${v('x')}`], 'y ∝ x² means y = kx². Find k from one pair of values first.'],
    ['inverse', 'Inverse proportion', `${v('y')} is inversely proportional to ${v('x')}. So…`, `${v('y')} = ${fr(v('k'), v('x'))}`, [`${v('y')} = ${v('k')}${v('x')}`, `${v('y')} = ${v('x')} − ${v('k')}`, `${v('y')} = ${fr(v('k'), sq(v('x')))}`], 'y ∝ 1/x means y = k/x.'],
    ['linear', 'Linear sequences', 'The <var>n</var>th term of 5, 8, 11, 14, … is', '3<var>n</var> + 2', ['5<var>n</var> + 3', '3<var>n</var> + 5', '<var>n</var> + 3'], 'The common difference (3) is the number in front of n; then adjust so the first term is right: 3 × 1 + 2 = 5.'],
    ['quadratic', 'Quadratic sequences', 'A sequence has a constant second difference of 4. Its <var>n</var>th term starts with…', '2<var>n</var><sup>2</sup>', ['4<var>n</var><sup>2</sup>', '<var>n</var><sup>2</sup>', '8<var>n</var><sup>2</sup>'], 'The n² coefficient is half the second difference.'],
  ];
  for (const [id, , q, right, wrong, note] of PR) {
    addCard(`mp-${id}`, 'mprob', () => ({ prompt: q, ...mcq(right, wrong), explain: `<p class="qz-eq">${right}</p><p class="qz-note">${note}</p>` }));
  }

  /* ── circle theorems, with diagrams ── */
  const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="cl"/>`;
  const L = (a, b, cls = 'ln') => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cls}"/>`;
  const Dot = (p) => `<circle cx="${p[0]}" cy="${p[1]}" r="2.6" class="dt"/>`;
  const T = (p, t, cls = 'lb') => `<text x="${p[0]}" y="${p[1]}" class="${cls}">${t}</text>`;
  const P = (deg, r = 44, cx = 60, cy = 60) => [+(cx + r * Math.cos((deg * Math.PI) / 180)).toFixed(1), +(cy - r * Math.sin((deg * Math.PI) / 180)).toFixed(1)];
  const RA = (p, ux, uy, vx, vy, s = 8) => `<path d="M${p[0] + ux * s} ${p[1] + uy * s} L${p[0] + (ux + vx) * s} ${p[1] + (uy + vy) * s} L${p[0] + vx * s} ${p[1] + vy * s}" class="ra"/>`;
  const svg = (inner, label) => `<svg class="qz-circ" viewBox="0 0 120 120" role="img" aria-label="${label}">${inner}</svg>`;
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy); return [dx / m, dy / m]; };
  const O = [60, 60];
  const tickAt = (a, b) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; const [ux, uy] = unit(a, b); return L([+(m[0] - uy * 5).toFixed(1), +(m[1] + ux * 5).toFixed(1)], [+(m[0] + uy * 5).toFixed(1), +(m[1] - ux * 5).toFixed(1)], 'tk'); };

  const semiA = P(180), semiB = P(0), semiC = P(62);
  const semi = (() => { const u = unit(semiC, semiA), w = unit(semiC, semiB); return svg(`${C(60, 60, 44)}${L(semiA, semiB)}${L(semiA, semiC, 'hl')}${L(semiB, semiC, 'hl')}${RA(semiC, u[0], u[1], w[0], w[1])}${Dot(O)}`, 'Triangle drawn on a diameter, with a right angle at the circumference'); })();
  const tanT = P(270);
  const tanrad = svg(`${C(60, 60, 44)}${L([12, tanT[1]], [108, tanT[1]], 'hl')}${L(O, tanT)}${RA(tanT, 0, -1, 1, 0)}${Dot(O)}${Dot(tanT)}`, 'Radius meeting a tangent at a right angle');
  const cA = P(215), cB = P(325), cC = P(95);
  const centre = svg(`${C(60, 60, 44)}${L(O, cA, 'hl')}${L(O, cB, 'hl')}${L(cC, cA)}${L(cC, cB)}${Dot(O)}${T([52, 76], '2x', 'lb hlt')}${T([55, 34], 'x')}`, 'Angle at the centre is twice the angle at the circumference');
  const sA = P(205), sB = P(335), s1 = P(120), s2 = P(65);
  const segment = svg(`${C(60, 60, 44)}${L(sA, sB)}${L(sA, s1, 'hl')}${L(sB, s1, 'hl')}${L(sA, s2, 'hl2')}${L(sB, s2, 'hl2')}${T([s1[0] - 2, s1[1] + 16], 'x')}${T([s2[0] - 4, s2[1] + 16], 'x')}`, 'Two angles standing on the same chord in the same segment are equal');
  const q1 = P(100), q2 = P(200), q3 = P(285), q4 = P(15);
  const cyclic = svg(`${C(60, 60, 44)}${L(q1, q2, 'hl')}${L(q2, q3, 'hl')}${L(q3, q4, 'hl')}${L(q4, q1, 'hl')}${T([q1[0] - 3, q1[1] + 16], 'x')}${T([q3[0] - 13, q3[1] - 13], '180−x', 'lb sm')}`, 'Cyclic quadrilateral: opposite angles add to 180 degrees');
  const aT = P(270), aA = P(25), aB = P(150);
  const altseg = svg(`${C(60, 60, 44)}${L([10, aT[1]], [110, aT[1]])}${L(aT, aA, 'hl')}${L(aT, aB)}${L(aA, aB)}${T([84, 99], 'x', 'lb hlt')}${T([aB[0] + 8, aB[1] + 13], 'x', 'lb hlt')}`, 'Alternate segment theorem: angle between tangent and chord equals the angle in the alternate segment');
  const e1 = P(205), e2 = P(335), e3 = P(25), e4 = P(155);
  const f1 = [60, +(60 + 44 * Math.cos((65 * Math.PI) / 180)).toFixed(1)];
  const mid34 = [+((e3[0] + e4[0]) / 2).toFixed(1), +((e3[1] + e4[1]) / 2).toFixed(1)];
  const equal = svg(`${C(60, 60, 44)}${L(e1, e2, 'hl')}${L(e3, e4, 'hl')}${tickAt(e1, e2)}${tickAt(e3, e4)}${L(O, f1, 'dash')}${L(O, mid34, 'dash')}${Dot(O)}`, 'Two equal chords are the same distance from the centre');
  const b1 = P(215), b2 = P(325);
  const bis = svg(`${C(60, 60, 44)}${L(b1, b2, 'hl')}${L([60, 8], [60, 112], 'dash')}${RA([60, b1[1]], 0, -1, 1, 0, 6)}${Dot(O)}`, 'The perpendicular bisector of a chord passes through the centre');
  const tc = [46, 60], tr = 32, tp = [112, 60];
  const phi = Math.acos(tr / (tp[0] - tc[0]));
  const t1 = [+(tc[0] + tr * Math.cos(phi)).toFixed(1), +(tc[1] - tr * Math.sin(phi)).toFixed(1)], t2 = [t1[0], +(tc[1] + tr * Math.sin(phi)).toFixed(1)];
  const tangents = svg(`${C(tc[0], tc[1], tr)}${L(tp, t1, 'hl')}${L(tp, t2, 'hl')}${tickAt(tp, t1)}${tickAt(tp, t2)}${Dot(tp)}${Dot(t1)}${Dot(t2)}`, 'Two tangents from an external point are equal in length');

  const CT = [
    ['semi', 'Angle in a semicircle', 'The angle in a semicircle is…', '90°', ['180°', '60°', '45°'], semi],
    ['tanrad', 'Tangent and radius', 'The angle between a tangent and the radius at the point of contact is…', '90°', ['180°', '45°', 'equal to the angle in the alternate segment'], tanrad],
    ['centre', 'Angle at the centre', 'The angle at the centre is … the angle at the circumference (standing on the same arc).', 'twice', ['half', 'equal to', '180° minus'], centre],
    ['segment', 'Angles in the same segment', 'Angles in the same segment are…', 'equal', ['supplementary (add to 180°)', 'right angles', 'double each other'], segment],
    ['cyclic', 'Cyclic quadrilateral', 'Opposite angles of a cyclic quadrilateral…', 'add up to 180° (supplementary)', ['are equal', 'add up to 360°', 'add up to 90°'], cyclic],
    ['altseg', 'Alternate segment theorem', 'The angle between a tangent and a chord is equal to…', 'the angle in the alternate segment', ['the angle at the centre', '90°', 'half the angle in the alternate segment'], altseg],
    ['equal', 'Equal chords', 'Equal chords are…', 'equidistant from the centre', ['parallel', 'perpendicular to each other', 'twice as far from the centre as the radius'], equal],
    ['bisector', 'Perpendicular bisector of a chord', 'The perpendicular bisector of a chord…', 'passes through the centre', ['is a tangent', 'is equal in length to the chord', 'meets the circle at 45°'], bis],
    ['tangents', 'Tangents from an external point', 'Two tangents drawn to a circle from an external point are…', 'equal in length', ['perpendicular', 'parallel', 'equal to the radius'], tangents],
  ];
  for (const [id, name, q, right, wrong, pic] of CT) {
    addCard(`mc-${id}`, 'mcircle', () => ({ prompt: q, visual: pic, ...mcq(right, wrong), explain: `<b>${name}</b>: ${q.replace(/…\.?$/, '').replace(' … ', ` ${right} `)}${q.includes(' … ') ? '' : ` ${right}`}.` }));
    addCard(`mc-name-${id}`, 'mcircle', () => ({
      prompt: 'Which circle property does this diagram show?',
      visual: pic,
      ...mcq(name, shuffle(CT.filter((x) => x[0] !== id).map((x) => x[1])).slice(0, 3)),
      explain: `<b>${name}</b>: ${q.replace(/…\.?$/, '').replace(' … ', ` ${right} `)}${q.includes(' … ') ? '' : ` ${right}`}. As a reason in an answer, write the property in full, e.g. “angle between tangent and radius = 90°”.`,
    }));
  }

  /* ── cheat sheet ── */
  const PRE = {
    sin: `sin ${v('x')} = `, cos: `cos ${v('x')} = `, tan: `tan ${v('x')} = `, trap: 'area = ', para: 'area = ', cubv: 'volume = ', cubsa: 'surface area = ',
    arc: 'arc length = ', sector: 'sector area = ', grad: 'gradient = ', length: 'length = ', mid: 'midpoint = ', perp: 'perpendicular gradient = ',
    speed: 'speed = ', simple: 'interest = ', compound: 'value = ', deprec: 'value = ', pchange: 'percentage change = ', fd: 'frequency density = ', notp: 'P(not A) = ',
  };
  QZ.SHEETS.maths = () => `<div class="qz-sheet">
    <nav class="qz-jump" aria-label="Jump to"><button data-act="qz-jump" data-to="qzm-f">Formulas</button><button data-act="qz-jump" data-to="qzm-t">Trig values</button><button data-act="qz-jump" data-to="qzm-a">Angles</button><button data-act="qz-jump" data-to="qzm-g">Functions</button><button data-act="qz-jump" data-to="qzm-p">Probability</button><button data-act="qz-jump" data-to="qzm-c">Circle theorems</button></nav>
    <p class="qz-callout"><b>Printed on page 2 of Papers 2 and 4, so not here:</b> area of a triangle and circle, circumference, curved surface areas of a cylinder and cone, surface area of a sphere, volumes of a prism, pyramid, cylinder, cone and sphere, the quadratic formula, the sine rule, the cosine rule and ½<var>ab</var> sin <var>C</var>.</p>
    <h4 id="qzm-f">Formulas you must know</h4>
    <dl class="qz-defs">${F.map(([id, name, , right]) => `<div><dt>${name}</dt><dd class="qz-eq">${PRE[id] || ''}${right}</dd></div>`).join('')}
      <div><dt>Laws of indices</dt><dd class="qz-eq">${IDX.map(([, q, r]) => `${q} ${r}`).join('<br>')}</dd></div></dl>
    <h4 id="qzm-t">Exact trig values</h4>
    <table class="qz-tbl qz-trig"><thead><tr><th></th>${[0, 30, 45, 60, 90].map((a) => `<th scope="col">${a}°</th>`).join('')}</tr></thead><tbody>
      ${['sin', 'cos', 'tan'].map((f) => `<tr><th scope="row">${f}</th>${[0, 30, 45, 60, 90].map((a) => { const t = TRIG.find((x) => x[0] === f && x[1] === a); return `<td>${t ? t[2] : '–'}</td>`; }).join('')}</tr>`).join('')}
    </tbody></table>
    <h4 id="qzm-a">Angles and polygons</h4>
    <dl class="qz-defs">${ANG.slice(0, 12).map(([, q, right]) => `<div><dt>${q.replace(/…$/, '').replace(/^./, (c) => c.toUpperCase())}</dt><dd>${right}</dd></div>`).join('')}</dl>
    <h4 id="qzm-g">Functions, graphs and logs</h4>
    <dl class="qz-defs">${FN.map(([, name, q, right]) => `<div><dt>${name}</dt><dd class="qz-eq">${q.replace(/…$/, '').replace(/ =$/, ' =')} ${right}</dd></div>`).join('')}</dl>
    <h4 id="qzm-p">Probability, proportion and sequences</h4>
    <dl class="qz-defs">${PR.map(([, name, q, right]) => `<div><dt>${name}</dt><dd class="qz-eq">${q.replace(/…$/, '').replace(/ So$/, '')} ${right}</dd></div>`).join('')}</dl>
    <h4 id="qzm-c">Circle theorems</h4>
    <ul class="qz-circs">${CT.map(([, name, q, right, , pic]) => `<li>${pic}<div><b>${name}</b><span>${q.replace(/…\.?$/, '').replace(' … ', ` ${right} `)}${q.includes(' … ') ? '' : ` ${right}`}</span></div></li>`).join('')}</ul>
  </div>`;
})();
