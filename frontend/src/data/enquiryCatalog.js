/** Catalogue-based enquiry choices. No external package required. */
export const ENQUIRY_CATEGORIES = [
  { id: 'agriculture', name: 'Agricultural Commodities', caption: 'Rice, grains, flour & turmeric' },
  { id: 'building-materials', name: 'Building Materials', caption: 'Scaffolding & construction supplies' },
  { id: 'technology', name: 'Technology Distribution', caption: 'Distribution & retail partnerships' },
];

export const ENQUIRY_PRODUCTS = {
  agriculture: [
    '1121 Basmati Rice', 'Steam & Sella Rice', 'Sona Masoori Rice',
    'Khapli Wheat', 'Black Rice', 'Kala Namak Rice', 'Maida',
    'Sooji (Semolina)', 'Double Fingers Turmeric', 'Other Agricultural Product',
  ],
  'building-materials': [
    'Tie Rod', 'Brace Lock Pin', 'Swivel Coupler', 'Ledger Blade',
    'U Jack (U-Head Jack)', 'Base Jack', 'Wing Nut',
    'Anchor Nut (with Plate)', 'Winding Wire',
    'Thread Rod - Zinc Plated', 'Horizontal (Ledger)',
    'Flower Plate (Rosette)', 'Base Plate',
    'Top Cup - Casted', 'Top Cup - Forged', 'Bottom Cup',
    'Other Building Material',
  ],
  technology: [
    'Technology Product Distribution', 'Dealer / Distributor Partnership',
    'Retail Store Enquiry', 'Other Technology Product',
  ],
};

export const COUNTRY_DIAL_CODES = [
  ['IN','India','+91'], ['AE','United Arab Emirates','+971'],
  ['US','United States','+1'], ['GB','United Kingdom','+44'],
  ['SA','Saudi Arabia','+966'], ['QA','Qatar','+974'], ['OM','Oman','+968'],
  ['KW','Kuwait','+965'], ['BH','Bahrain','+973'], ['SG','Singapore','+65'],
  ['MY','Malaysia','+60'], ['ID','Indonesia','+62'], ['TH','Thailand','+66'],
  ['VN','Vietnam','+84'], ['PH','Philippines','+63'], ['CN','China','+86'],
  ['HK','Hong Kong','+852'], ['TW','Taiwan','+886'], ['JP','Japan','+81'],
  ['KR','South Korea','+82'], ['AU','Australia','+61'], ['NZ','New Zealand','+64'],
  ['CA','Canada','+1'], ['DE','Germany','+49'], ['FR','France','+33'],
  ['IT','Italy','+39'], ['ES','Spain','+34'], ['NL','Netherlands','+31'],
  ['BE','Belgium','+32'], ['CH','Switzerland','+41'], ['SE','Sweden','+46'],
  ['NO','Norway','+47'], ['DK','Denmark','+45'], ['FI','Finland','+358'],
  ['IE','Ireland','+353'], ['PL','Poland','+48'], ['PT','Portugal','+351'],
  ['TR','Türkiye','+90'], ['RU','Russia','+7'], ['UA','Ukraine','+380'],
  ['ZA','South Africa','+27'], ['NG','Nigeria','+234'], ['KE','Kenya','+254'],
  ['EG','Egypt','+20'], ['MA','Morocco','+212'], ['GH','Ghana','+233'],
  ['BR','Brazil','+55'], ['MX','Mexico','+52'], ['AR','Argentina','+54'],
  ['CL','Chile','+56'], ['CO','Colombia','+57'], ['PE','Peru','+51'],
  ['PK','Pakistan','+92'], ['BD','Bangladesh','+880'], ['LK','Sri Lanka','+94'],
  ['NP','Nepal','+977'], ['BT','Bhutan','+975'], ['MM','Myanmar','+95'],
  ['IL','Israel','+972'], ['JO','Jordan','+962'], ['LB','Lebanon','+961'],
  ['IQ','Iraq','+964'], ['IR','Iran','+98'], ['AF','Afghanistan','+93'],
  ['KZ','Kazakhstan','+7'], ['UZ','Uzbekistan','+998'], ['ET','Ethiopia','+251'],
  ['TZ','Tanzania','+255'], ['UG','Uganda','+256'], ['ZW','Zimbabwe','+263'],
].map(([iso, name, dial]) => ({ iso, name, dial }));
