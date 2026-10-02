// each product line in the csv is split into a few named models
const CATALOG = {
  "Men's Street Footwear": ['Stan Smith', 'Samba OG', 'Gazelle', 'Superstar', 'Forum Low'],
  "Men's Athletic Footwear": [
    'Ultraboost Light',
    'Adizero Boston',
    'Supernova Rise',
    'Duramo SL',
    'Terrex Swift',
  ],
  "Women's Street Footwear": [
    'Campus 00s',
    'Handball Spezial',
    'VL Court 3.0',
    'Grand Court 2.0',
    'Superstar W',
  ],
  "Women's Athletic Footwear": [
    'Ultraboost 5',
    'Adizero Evo SL',
    'Response Super',
    'Cloudfoam Pure',
    'Galaxy 6',
  ],
  "Men's Apparel": [
    'Essentials Hoodie',
    'Tiro 24 Track Jacket',
    'Trefoil Tee',
    'Own The Run Shorts',
    'Firebird Track Top',
  ],
  "Women's Apparel": [
    'Adicolor Tee',
    'Tiro Track Pants',
    'Yoga Essentials Tights',
    'Essentials Fleece Hoodie',
    'Run Fast Jacket',
  ],
};

const COLORS = [
  'Core Black',
  'Cloud White',
  'Team Navy',
  'Solar Red',
  'Semi Lucid Blue',
  'Grey Three',
];

function parseLine(line) {
  const gender = line.startsWith('Men') ? 'Men' : 'Women';
  const category = line.includes('Footwear') ? 'Footwear' : 'Apparel';

  let style = 'Apparel';
  if (line.includes('Street')) {
    style = 'Street';
  } else if (line.includes('Athletic')) {
    style = 'Athletic';
  }

  return { gender, style, category };
}

module.exports = { CATALOG, COLORS, parseLine };
