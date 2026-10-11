/* Economics definitions for the daily quiz.
   The Cambridge IGCSE Economics 0455 syllabus for 2027–2029 lists the terms you must be able to define
   but doesn't give the wording, so these follow the precise style mark schemes reward: the key words
   in braces are the ones that earn the marks. */

(() => {
  const { addTopics, defs } = QZ;

  addTopics('econ', {
    edef1: 'Definitions: the economic problem and markets',
    edef2: 'Definitions: market failure and intervention',
    edef3: 'Definitions: firms, costs and population',
    edef4: 'Definitions: the macroeconomy',
    edef5: 'Definitions: development and trade',
  });

  defs('econ', 'edef1', [
    { id: 'ed-econproblem', term: 'Basic economic problem', text: '{finite} (limited) resources to meet {infinite} (unlimited) wants', note: 'This is why choices have to be made.' },
    { id: 'ed-scarcity', term: 'Scarcity', text: 'when there are {not enough resources} to satisfy {all wants}', x: ['too many resources'] },
    { id: 'ed-econgood', g: 'goods', term: 'Economic good', text: 'a good that is {scarce} and so has an {opportunity cost}', x: ['free', 'no opportunity cost'] },
    { id: 'ed-freegood', g: 'goods', term: 'Free good', text: 'a good that is {not scarce}, so it has {no opportunity cost}', note: 'For example air or sunlight.', x: ['scarce', 'a high opportunity cost'] },
    { id: 'ed-fop', sw: [['land', 'labour', 'capital', 'enterprise']], term: 'Factors of production', text: 'the {resources} used to produce goods and services: {land}, {labour}, {capital} and {enterprise}', x: ['money', 'profit'] },
    { id: 'ed-land', g: 'fop', term: 'Land', text: '{natural resources} used in production', note: 'One of the four factors of production.', x: ['human effort', 'human-made goods'] },
    { id: 'ed-labour', g: 'fop', term: 'Labour', text: '{human effort}, physical and mental, used in production', note: 'One of the four factors of production.', x: ['natural resources', 'machinery'] },
    { id: 'ed-capital', g: 'fop', term: 'Capital', text: '{human-made goods} used to {produce other goods and services}', note: 'One of the four factors of production. For example machinery, tools and factories.', x: ['natural resources', 'money saved'] },
    { id: 'ed-enterprise', g: 'fop', term: 'Enterprise', text: 'the {organising} of the other factors of production and {taking risks}', note: 'One of the four factors of production.', x: ['human effort', 'avoiding risks'] },
    { id: 'ed-oppcost', term: 'Opportunity cost', text: 'the {next best alternative} {forgone} (given up) when a choice is made', x: ['most expensive alternative', 'gained'] },
    { id: 'ed-ppc', term: 'Production possibility curve (PPC)', text: 'a curve showing the {maximum combinations} of {two goods} or services an economy can produce when all its resources are {fully and efficiently} used', x: ['minimum combinations', 'partly'] },
    { id: 'ed-market', term: 'Market', text: 'where {buyers and sellers} come together to {exchange} goods and services', x: ['producers only'] },
    { id: 'ed-demand', g: 'ds', term: 'Demand', text: 'the {willingness and ability} to {buy} a good or service at a given price', note: 'Both willingness and ability are needed for the mark.', x: ['sell', 'need'] },
    { id: 'ed-supply', g: 'ds', term: 'Supply', text: 'the {willingness and ability} to {sell} a good or service at a given price', x: ['buy', 'desire'] },
    { id: 'ed-equilibrium', g: 'eq', term: 'Market equilibrium', text: 'when {demand equals supply} at a particular price, so there is {no pressure} for the price to change', x: ['demand exceeds supply'] },
    { id: 'ed-disequilibrium', g: 'eq', term: 'Market disequilibrium', text: 'when demand and supply are {not equal} at the current price, so there is a {shortage or surplus}' },
    { id: 'ed-shortage', g: 'eq', nx: ['Market disequilibrium'], term: 'Shortage (excess demand)', text: 'when {demand is greater than supply} at a given price', x: ['supply is greater than demand'] },
    { id: 'ed-surplus', g: 'eq', nx: ['Market disequilibrium'], term: 'Surplus (excess supply)', text: 'when {supply is greater than demand} at a given price', x: ['demand is greater than supply'] },
    { id: 'ed-ped', g: 'el', term: 'Price elasticity of demand (PED)', text: 'a measure of the {responsiveness} of {quantity demanded} to a {change in price}', note: 'PED = % change in quantity demanded ÷ % change in price.', x: ['quantity supplied', 'change in income'] },
    { id: 'ed-pes', g: 'el', term: 'Price elasticity of supply (PES)', text: 'a measure of the {responsiveness} of {quantity supplied} to a {change in price}', note: 'PES = % change in quantity supplied ÷ % change in price.', x: ['quantity demanded', 'change in income'] },
  ]);

  defs('econ', 'edef2', [
    { id: 'ed-marketsys', g: 'sys', term: 'Market economic system', text: 'an economic system in which resources are allocated by the {price mechanism} (market forces of demand and supply) and are owned by the {private sector}', x: ['government', 'public sector'] },
    { id: 'ed-mixedsys', g: 'sys', term: 'Mixed economic system', text: 'an economic system in which resources are allocated by {both} the {private sector} (price mechanism) and the {public sector} (government)' },
    { id: 'ed-marketfail', term: 'Market failure', text: 'when the market forces of demand and supply {fail to allocate resources efficiently}', x: ['allocate resources efficiently'] },
    { id: 'ed-public', g: 'mg', sw: [['non-excludable', 'non-rival']], term: 'Public good', text: 'a good that is {non-excludable} and {non-rival}', note: 'Because of the free rider problem, markets may not provide it at all, e.g. street lighting.', x: ['excludable', 'rival'] },
    { id: 'ed-merit', g: 'mg', term: 'Merit good', text: 'a good that is {under-consumed} in a free market because people {underestimate its benefits}', note: 'It also tends to have external benefits, e.g. education and healthcare.', x: ['over-consumed', 'underestimate its harm'] },
    { id: 'ed-demerit', g: 'mg', term: 'Demerit good', text: 'a good that is {over-consumed} in a free market because people {underestimate its harm}', note: 'It also tends to have external costs, e.g. cigarettes.', x: ['under-consumed', 'underestimate its benefits'] },
    { id: 'ed-privben', g: 'ext', term: 'Private benefits', text: 'the benefits received by the {consumers or producers} {directly involved} in an activity', x: ['third parties'] },
    { id: 'ed-extben', g: 'ext', term: 'External benefits', text: 'the benefits received by {third parties} {not directly involved} in an activity', x: ['directly involved'] },
    { id: 'ed-socben', g: 'ext', sw: [['private benefits', 'external benefits']], term: 'Social benefits', text: '{private benefits} {plus} {external benefits}', x: ['minus'] },
    { id: 'ed-privcost', g: 'ext', term: 'Private costs', text: 'the costs paid by the {consumers or producers} {directly involved} in an activity', x: ['third parties'] },
    { id: 'ed-extcost', g: 'ext', term: 'External costs', text: 'the costs imposed on {third parties} {not directly involved} in an activity', x: ['directly involved'] },
    { id: 'ed-soccost', g: 'ext', sw: [['private costs', 'external costs']], term: 'Social costs', text: '{private costs} {plus} {external costs}', x: ['minus'] },
    { id: 'ed-monopoly', term: 'Monopoly', text: 'a market with a {single supplier} (seller) of a product', note: 'Barriers to entry keep other firms out.', x: ['many suppliers', 'single buyer'] },
    { id: 'ed-maxprice', g: 'pc', term: 'Maximum price', text: 'a price set by the government {below the equilibrium price}, which the market price {cannot rise above}', x: ['above the equilibrium price', 'cannot fall below'] },
    { id: 'ed-minprice', g: 'pc', term: 'Minimum price', text: 'a price set by the government {above the equilibrium price}, which the market price {cannot fall below}', x: ['below the equilibrium price', 'cannot rise above'] },
    { id: 'ed-indirect', g: 'gov', term: 'Indirect tax', text: 'a tax on {spending} (on goods and services), paid to the government by {producers or sellers}', note: 'For example GST or VAT.', x: ['income'] },
    { id: 'ed-subsidy', g: 'gov', term: 'Subsidy', text: 'a {payment} by the {government} to producers (or consumers) to {lower costs} and encourage production or consumption', x: ['tax'] },
    { id: 'ed-regulation', g: 'gov', term: 'Regulation', text: '{rules and laws} set by the government to {control the behaviour} of firms and consumers' },
    { id: 'ed-privatisation', g: 'own', term: 'Privatisation', text: 'the {transfer} of firms or industries from the {public sector} to the {private sector}', x: ['private sector to the public sector'] },
    { id: 'ed-nationalisation', g: 'own', term: 'Nationalisation', text: 'the {transfer} of firms or industries from the {private sector} to the {public sector}' },
    { id: 'ed-directprov', g: 'gov', term: 'Direct provision', text: 'when the {government} itself {provides} goods or services, e.g. state schools and hospitals' },
  ]);

  defs('econ', 'edef3', [
    { id: 'ed-tc', g: 'cost', sw: [['total fixed cost', 'total variable cost']], term: 'Total cost', text: '{total fixed cost} {plus} {total variable cost}', x: ['minus'] },
    { id: 'ed-atc', g: 'cost', term: 'Average total cost', text: '{total cost} {divided by} {output}', x: ['multiplied by'] },
    { id: 'ed-fc', g: 'cost', term: 'Fixed costs', text: 'costs that {do not change} with {output}', note: 'For example rent.', x: ['change'] },
    { id: 'ed-afc', g: 'cost', term: 'Average fixed cost', text: '{total fixed cost} {divided by} {output}' },
    { id: 'ed-vc', g: 'cost', term: 'Variable costs', text: 'costs that {change} with {output}', note: 'For example raw materials.', x: ['do not change'] },
    { id: 'ed-avc', g: 'cost', term: 'Average variable cost', text: '{total variable cost} {divided by} {output}' },
    { id: 'ed-tr', g: 'rev', term: 'Total revenue', text: '{price} {multiplied by} {quantity sold}', x: ['divided by'] },
    { id: 'ed-ar', g: 'rev', term: 'Average revenue', text: '{total revenue} {divided by} {quantity sold}', note: 'Average revenue equals the price.', x: ['multiplied by'] },
    { id: 'ed-dol', term: 'Division of labour', text: 'when production is {split into separate tasks}, with each worker {specialising} in one task' },
    { id: 'ed-horizontal', g: 'merge', term: 'Horizontal merger', text: 'when two firms at the {same stage of production} in the {same industry} join together', x: ['different stages of production', 'different industries'] },
    { id: 'ed-vertical', g: 'merge', term: 'Vertical merger', text: 'when two firms at {different stages of production} in the {same industry} join together', note: 'Forward towards the consumer, or backward towards raw materials.', x: ['same stage of production'] },
    { id: 'ed-conglomerate', g: 'merge', term: 'Conglomerate merger', text: 'when two firms in {different industries} join together', x: ['the same industry'] },
    { id: 'ed-birthrate', g: 'pop', term: 'Birth rate', text: 'the number of {live births} per {thousand} of the population in a {year}', x: ['hundred', 'month'] },
    { id: 'ed-deathrate', g: 'pop', term: 'Death rate', text: 'the number of {deaths} per {thousand} of the population in a {year}', x: ['hundred', 'month'] },
    { id: 'ed-netmig', g: 'pop', sw: [['immigration', 'emigration']], term: 'Net migration', text: 'the difference between {immigration} and {emigration}', note: 'Net migration = immigration − emigration.' },
    { id: 'ed-immigration', g: 'pop', term: 'Immigration', text: 'people {coming into} a country {to live}', x: ['leaving'] },
    { id: 'ed-emigration', g: 'pop', term: 'Emigration', text: 'people {leaving} a country {to live} in another country', x: ['coming into'] },
  ]);

  defs('econ', 'edef4', [
    { id: 'ed-budget', g: 'bud', term: 'Government budget', text: 'a plan of the government’s {revenue} (mainly taxes) and {spending} over a {year}' },
    { id: 'ed-deficit', g: 'bud', term: 'Budget deficit', text: 'when government {spending} is {greater than} government {revenue}', x: ['less than'] },
    { id: 'ed-bsurplus', g: 'bud', term: 'Budget surplus', text: 'when government {revenue} is {greater than} government {spending}', x: ['less than'] },
    { id: 'ed-fiscal', g: 'pol', sw: [['government spending', 'taxation']], term: 'Fiscal policy', text: 'the use of {government spending} and {taxation} to influence the economy (aggregate demand)', x: ['interest rates', 'money supply'] },
    { id: 'ed-moneysupply', term: 'Money supply', text: 'the {total amount of money} in an {economy}', x: ['total income'] },
    { id: 'ed-monetary', g: 'pol', sw: [['interest rates', 'money supply', 'foreign exchange rate']], term: 'Monetary policy', text: 'changing {interest rates}, the {money supply} or the {foreign exchange rate} to influence the economy (aggregate demand)', x: ['taxation', 'government spending'] },
    { id: 'ed-supplyside', g: 'pol', term: 'Supply-side policy', text: 'policies that increase the {productive capacity} of the economy by improving the {quantity and quality} of the {factors of production}', x: ['aggregate demand'] },
    { id: 'ed-growth', g: 'gdp', term: 'Economic growth', text: 'an {increase} in {real GDP}', note: 'An increase in the output of an economy over time.', x: ['decrease', 'nominal prices'] },
    { id: 'ed-recession', g: 'gdp', term: 'Recession', text: 'when {real GDP falls} for {two} or more {consecutive quarters}', x: ['rises', 'six', 'consecutive years'] },
    { id: 'ed-employment', g: 'emp', term: 'Employment', text: 'people {working} in a {paid job}' },
    { id: 'ed-unemployment', g: 'emp', term: 'Unemployment', text: 'when people who are {willing and able to work}, and {actively seeking work}, {cannot find a job}' },
    { id: 'ed-fullemp', g: 'emp', term: 'Full employment', text: 'when {everyone} who is {willing and able to work} {has a job}', note: 'In practice unemployment never falls to zero, so full employment means very low unemployment.' },
    { id: 'ed-inflation', g: 'inf', term: 'Inflation', text: 'a {sustained increase} in the {general price level}', x: ['one-off increase', 'price of one good'] },
    { id: 'ed-deflation', g: 'inf', term: 'Deflation', text: 'a {sustained fall} in the {general price level}', x: ['one-off fall', 'price of one good'] },
  ]);

  defs('econ', 'edef5', [
    { id: 'ed-abspov', g: 'pov', term: 'Absolute poverty', text: 'when people do not have enough income to meet their {basic needs}, such as {food, clothing and shelter}', x: ['average income'] },
    { id: 'ed-relpov', g: 'pov', term: 'Relative poverty', text: 'when people’s income is {well below the average} income in their {country}', x: ['basic needs'] },
    { id: 'ed-specialisation', term: 'Specialisation by country', text: 'when a country {concentrates} on producing the goods and services it is {most efficient} at producing (lowest opportunity cost)', x: ['least efficient'] },
    { id: 'ed-freetrade', g: 'trade', term: 'Free trade', text: 'international trade {without restrictions} such as {tariffs and quotas}', x: ['with restrictions'] },
    { id: 'ed-globalisation', g: 'trade', sw: [['integrated', 'interdependent']], term: 'Globalisation', text: 'the process by which the world’s economies become increasingly {integrated} and {interdependent} through trade and the movement of capital, labour and information' },
    { id: 'ed-quota', g: 'trade', term: 'Quota', text: 'a {limit} on the {quantity} of a good that can be imported', x: ['tax', 'price'] },
    { id: 'ed-fxrate', g: 'fx', term: 'Foreign exchange rate', text: 'the {price} of one {currency} in terms of {another currency}' },
    { id: 'ed-floating', g: 'fx', term: 'Floating exchange rate', text: 'an exchange rate determined by the {market forces} of {demand and supply} of the currency', x: ['government'] },
    { id: 'ed-appreciation', g: 'fx', term: 'Appreciation', text: 'a {rise} in the {value} of a currency in a {floating} exchange rate system', x: ['fall', 'fixed'] },
    { id: 'ed-depreciation', g: 'fx', term: 'Depreciation', text: 'a {fall} in the {value} of a currency in a {floating} exchange rate system', note: 'Not to be confused with the fall in value of a capital asset over time.', x: ['rise', 'fixed'] },
  ]);

  QZ.SHEETS.econ = () => `<div class="qz-sheet">
    <p class="qz-callout">The 2027–2029 syllabus lists these terms but not their wording. These follow the style mark schemes reward; learn the bold words.</p>
    ${qzDefsListHTML('econ')}
  </div>`;
})();
