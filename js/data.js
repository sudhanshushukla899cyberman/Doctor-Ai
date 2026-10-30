const SYMPTOMS = [
  'fever','cough','sore throat','headache','fatigue','shortness of breath','nausea','vomiting','diarrhea','rash','runny nose','sneezing','body ache','loss of taste','loss of smell'
];

const DISEASES = [
  'Common Cold', 'Influenza (Flu)', 'COVID-19', 'Strep Throat', 'Pneumonia', 'Bronchitis', 'Asthma', 'Allergic Rhinitis', 'Sinusitis', 'Migraine',
  'Tension Headache', 'Gastroenteritis', 'Urinary Tract Infection', 'Skin Eczema', 'Psoriasis', 'Chickenpox', 'Measles', 'Mumps', 'Dengue Fever', 'Malaria',
  'Tuberculosis', 'Hepatitis A', 'Hepatitis B', 'Hepatitis C', 'Hypertension', 'Diabetes Mellitus', 'Hyperthyroidism', 'Hypothyroidism', 'Anemia', 'Otitis Media'
];

const PREVENTIVE = [
  {name: 'Influenza vaccine', note: 'Annual vaccine recommended for most adults — reduces risk of severe flu.'},
  {name: 'COVID-19 vaccine/boosters', note: 'Follow local guidance for boosters to reduce severe disease.'},
  {name: 'Pneumococcal vaccine', note: 'Recommended for older adults or those with certain conditions.'},
  {name: 'Shingles (Herpes zoster) vaccine', note: 'Recommended for older adults to prevent shingles.'},
  {name: 'Td/Tdap (Tetanus, diphtheria, pertussis)', note: 'Keep up-to-date per schedule; booster when needed.'},
  {name: 'Hepatitis B vaccine', note: 'Recommended in specific risk groups or by provider.'},
  {name: 'HPV vaccine', note: 'Recommended for certain age groups to prevent HPV-related disease.'},
  {name: 'Vitamin D (supplement)', note: 'Commonly recommended in older adults; discuss dosing with a provider.'},
  {name: 'Influenza antiviral prophylaxis', note: 'Used in specific outbreaks or by clinician decision.'},
  {name: 'Hand hygiene & masks', note: 'Not medicines but important preventive measures.'}
];

// Disease-specific info: keywords (for matching), prevention tips, and common medicine names (informational only)
const DISEASE_INFO = {
  'Common Cold': {
    keywords: ['runny nose','sneezing','sore throat','cough'],
    prevention: ['Hand hygiene','Avoid close contact when symptomatic','Rest and fluids'],
    meds: ['Paracetamol (acetaminophen) for fever/pain', 'Antihistamines or decongestants for nasal symptoms']
  },
  'Influenza (Flu)': {
    keywords: ['fever','body ache','cough','sore throat','fatigue'],
    prevention: ['Annual influenza vaccination','Hand hygiene','Stay home if unwell'],
    meds: ['Antivirals (e.g., oseltamivir) — clinician prescribed', 'Paracetamol / ibuprofen for fever']
  },
  'COVID-19': {
    keywords: ['loss of taste','loss of smell','fever','cough','shortness of breath'],
    prevention: ['Vaccination/boosters per local guidance','Masks in high-risk settings','Test and isolate when advised'],
    meds: ['Antiviral or monoclonal therapies in selected patients — clinician prescribed','Symptomatic care (paracetamol)']
  },
  'Pneumonia': {
    keywords: ['fever','cough','shortness of breath','chest pain'],
    prevention: ['Pneumococcal vaccine for eligible adults','Avoid smoking','Seek timely care for respiratory infections'],
    meds: ['Antibiotics when bacterial (prescribed by clinician)','Oxygen support in severe cases']
  },
  'Asthma': {
    keywords: ['shortness of breath','wheeze','cough'],
    prevention: ['Avoid triggers (smoke, allergens)','Use controller inhalers if prescribed','Have rescue inhaler available'],
    meds: ['Short-acting bronchodilator (salbutamol/albuterol) — as prescribed','Inhaled corticosteroids for control — clinician prescribed']
  },
  'Gastroenteritis': {
    keywords: ['diarrhea','nausea','vomiting','abdominal pain'],
    prevention: ['Hand hygiene','Safe food handling','Stay hydrated with ORS'],
    meds: ['Oral rehydration solutions','Antiemetics or antidiarrheals as advised by clinician']
  },
  'Urinary Tract Infection': {
    keywords: ['pain','urine','burning','frequency','fever'],
    prevention: ['Hydration','Urinate after intercourse','Seek care for recurrent symptoms'],
    meds: ['Antibiotics when confirmed (clinician prescribed)']
  },
  'Migraine': {
    keywords: ['headache','nausea','light'],
    prevention: ['Identify and avoid triggers','Regular sleep and hydration'],
    meds: ['Analgesics (paracetamol, NSAIDs)','Triptans for moderate-severe migraine (clinician prescribed)']
  },
  'Chickenpox': {
    keywords: ['fever','rash','itch'],
    prevention: ['Vaccination (varicella)','Avoid contact with infected people'],
    meds: ['Antihistamines for itch','Antivirals for selected patients (clinician prescribed)']
  },
  'Dengue Fever': {
    keywords: ['fever','body ache','rash','platelet'],
    prevention: ['Mosquito bite prevention','Seek care early if high fever or bleeding signs'],
    meds: ['Avoid NSAIDs if dengue suspected; paracetamol preferred; supportive care']
  }
};