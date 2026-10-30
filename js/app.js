function matchDiseases(symptoms){
  const s = symptoms.map(x=>x.toLowerCase());
  const scores = [];
  for(const [d,info] of Object.entries(DISEASE_INFO)){
    let matchCount = 0;
    info.keywords.forEach(k=>{ if(s.some(x=>x.includes(k) || k.includes(x))) matchCount++; });
    const score = matchCount / Math.max(1, info.keywords.length);
    if(score>0) scores.push({disease:d,score,info});
  }
  // sort descending
  scores.sort((a,b)=>b.score - a.score);
  return scores;
}

function showDiseaseInfoByName(name){
  const resultsEl = document.getElementById('results');
  const info = DISEASE_INFO[name];
  if(!info){
    resultsEl.innerHTML = `<strong>${name}</strong><div class="small">No detailed info available in this demo.</div>`;
    resultsEl.style.display='block';
    return;
  }
  let html = `<strong>${name}</strong><div class="small" style="margin-top:8px"><em>Prevention</em>:<ul>`;
  info.prevention.forEach(p=> html += `<li>${p}</li>`);
  html += `</ul></div>`;
  if(info.meds && info.meds.length){ html += `<div class="small" style="margin-top:6px"><em>Common medicines (informational only)</em>:<ul>`;
    info.meds.forEach(m => html += `<li>${m}</li>`);
    html += `</ul></div>`;
  }
  html += `<div class="warning" style="margin-top:10px">This information is general. For diagnosis, prescriptions, and dosing consult a licensed clinician or pharmacist.</div>`;
  resultsEl.innerHTML = html;
  resultsEl.style.display='block';
}

function initSymptomCheckboxes(){
  const container = document.getElementById('symptomCheckboxes');
  SYMPTOMS.forEach(s => {
    const id = 'sym_'+s.replace(/\s+/g,'_');
    const div = document.createElement('div');
    div.className = 'symptom-item';
    div.innerHTML = `<input type="checkbox" id="${id}" value="${s}"><label for="${id}">${s}</label>`;
    container.appendChild(div);
  });
  // populate disease datalist
  const data = document.getElementById('diseases');
  if(data){
    DISEASES.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      data.appendChild(opt);
    });
  }
}

function renderPreventivePanel(){
  const el = document.getElementById('preventiveList');
  if(!el) return;
  el.innerHTML = '';
  PREVENTIVE.forEach(p => {
    const div = document.createElement('div');
    div.style.marginBottom = '8px';
    div.innerHTML = `<strong>${p.name}</strong>: ${p.note}`;
    el.appendChild(div);
  });
}

function getSelectedSymptoms(){
  const selected = [];
  SYMPTOMS.forEach(s =>{
    const id = 'sym_'+s.replace(/\s+/g,'_');
    const el = document.getElementById(id);
    if(el && el.checked) selected.push(s);
  });
  const free = document.getElementById('freeSymptoms').value || '';
  free.split(',').map(x=>x.trim().toLowerCase()).filter(x=>x).forEach(tok=>{
    // map common variants
    if(!selected.includes(tok)) selected.push(tok);
  });
  return selected;
}

function computeBMI(height_cm, weight_kg){
  if(!height_cm || !weight_kg) return null;
  const h_m = height_cm/100.0;
  if(h_m <= 0) return null;
  const bmi = weight_kg / (h_m*h_m);
  return Math.round(bmi*10)/10;
}

function bmiCategory(bmi){
  if(bmi==null) return null;
  if(bmi < 18.5) return 'Underweight';
  if(bmi < 25) return 'Normal weight';
  if(bmi < 30) return 'Overweight';
  return 'Obesity';
}

function analyzeSymptoms(symptoms){
  // Very simple rule-based matcher for demo purposes.
  const s = new Set(symptoms.map(x=>x.toLowerCase()));
  const suggestions = [];

  function add(cond, score, reasons, prevention, meds){
    suggestions.push({condition:cond,score, reasons, prevention, meds});
  }

  if(s.has('fever') && (s.has('cough') || s.has('sore throat') || s.has('body ache'))){
    add('Viral respiratory infection (e.g., common cold or influenza)', 0.7,
        ['fever','cough or sore throat','body ache'],
        ['rest','stay hydrated','isolate while febrile','get influenza vaccine annually'],
        ['Symptomatic relief: acetaminophen or ibuprofen for fever/pain (consult provider for dose)','stay home if contagious']
    );
  }

  if(s.has('fever') && s.has('rash')){
    add('Infectious disease with rash (e.g., viral exanthem, allergic reaction)', 0.6,
        ['fever','rash'],
        ['avoid known allergens','seek medical assessment for rash with fever'],
        ['Antihistamines may help itch (e.g., cetirizine) — consult provider']
    );
  }

  if(s.has('cough') && s.has('shortness of breath')){
    add('Lower respiratory infection or asthma exacerbation', 0.8,
        ['cough','shortness of breath'],
        ['seek medical attention if breathing difficulty','avoid smoke and triggers'],
        ['If known asthma, use rescue inhaler as prescribed; seek care if worsening']
    );
  }

  if(s.has('diarrhea') || s.has('nausea') || s.has('vomiting')){
    add('Gastroenteritis (stomach bug)', 0.65,
        ['diarrhea','nausea','vomiting'],
        ['stay hydrated; use oral rehydration solutions','avoid high-risk foods while symptomatic'],
        ['Oral rehydration; avoid unnecessary antibiotics unless prescribed']
    );
  }

  if(s.has('loss of taste') || s.has('loss of smell')){
    add('Possible viral infection (e.g., COVID-19)', 0.7,
        ['loss of taste or smell'],
        ['test according to local guidance; isolate until advised'],
        ['Follow public health guidance; symptomatic care']
    );
  }

  if(s.has('headache') && s.has('fever') && s.has('stiff neck')){
    add('Serious infection possible (e.g., meningitis) — urgent evaluation', 0.95,
        ['headache','fever','neck stiffness'],
        ['seek emergency care immediately'],
        ['Do not delay — urgent medical assessment required']
    );
  }

  // Fallback
  if(s.size>0 && suggestions.length===0){
    add('Non-specific symptoms — symptomatic relief and monitoring', 0.4,
        Array.from(s),
        ['rest','fluids','monitor symptoms for worsening over 48–72 hours'],
        ['Symptomatic OTC options may help (paracetamol, ibuprofen, antihistamines) — consult provider']
    );
  }

  if(s.size===0){
    add('No symptoms provided', 0.0, [], ['Maintain healthy habits: vaccination, hand-washing, balanced diet, regular exercise'], []);
  }

  return suggestions.sort((a,b)=>b.score - a.score);
}

// New: show reasons first, then disease name(s) for top matches
function renderSubmitResults(){
  const resultsEl = document.getElementById('results');
  const symptoms = getSelectedSymptoms();
  const analysis = analyzeSymptoms(symptoms);
  const diseaseMatches = matchDiseases(symptoms);

  if(!diseaseMatches || diseaseMatches.length === 0){
    resultsEl.innerHTML = `<strong>No likely disease match found</strong><div class="small">Try adding more symptoms or use Analyze for broader suggestions.</div>`;
    resultsEl.style.display = 'block';
    return;
  }

  let html = `<strong>Diagnosis (reasons first)</strong><br/>`;
  diseaseMatches.slice(0,3).forEach((m, idx) => {
    const info = m.info || {};
    // collect reasons by matching disease keywords to provided symptoms
    const reasons = [];
    if(info.keywords && info.keywords.length){
      info.keywords.forEach(k => {
        if(symptoms.some(s => s.toLowerCase().includes(k) || k.includes(s.toLowerCase()))) reasons.push(k);
      });
    }
    // fallback to analysis reasons
    if(reasons.length === 0 && analysis && analysis.length){
      const fallback = analysis.find(a => a.reasons && a.reasons.length);
      if(fallback) reasons.push(...fallback.reasons.slice(0,3));
    }

    html += `<div style="margin-top:8px">`;
    html += `<div class="small"><em>Reason(s):</em> ${reasons.length? reasons.join(', ') : 'Based on symptom overlap'}</div>`;
    html += `<div><strong>Disease: ${m.disease}</strong> <span class="small">(match ${(m.score*100).toFixed(0)}%)</span></div>`;
    if(info.prevention && info.prevention.length){
      html += `<div class="small" style="margin-top:6px"><em>Prevention:</em><ul>`;
      info.prevention.forEach(p=> html += `<li>${p}</li>`);
      html += `</ul></div>`;
    }
    html += `</div>`;
  });

  resultsEl.innerHTML = html;
  resultsEl.style.display = 'block';
}

function renderResults(){
  const resultsEl = document.getElementById('results');
  const age = Number(document.getElementById('age').value)||null;
  const sex = document.getElementById('sex').value;
  const height = Number(document.getElementById('height').value)||null;
  const weight = Number(document.getElementById('weight').value)||null;
  const symptoms = getSelectedSymptoms();
  const bmi = computeBMI(height, weight);
  const bmiCat = bmiCategory(bmi);

  const analysis = analyzeSymptoms(symptoms);

  // attempt to match diseases from symptoms
  const diseaseMatches = matchDiseases(symptoms);

  let html = '';
  html += `<strong>Inputs</strong><br/>`;
  html += `<div class="small">Age: ${age?age:'—'} | Sex: ${sex} | Height: ${height?height+' cm':'—'} | Weight: ${weight?weight+' kg':'—'}</div>`;
  if(bmi){ html += `<div class="small">BMI: <strong>${bmi}</strong> (${bmiCat})</div>`; }
  html += `<hr/>`;

  html += `<strong>Identified symptoms</strong>: ${symptoms.length? symptoms.join(', '): '<em>none</em>'}<br/><br/>`;

  html += `<strong>Suggestions</strong><br/>`;
  analysis.forEach((a,idx)=>{
    html += `<div style="margin-bottom:10px"><strong>${idx+1}. ${a.condition}</strong> <span class="small">(confidence ${(a.score*100).toFixed(0)}%)</span><br/>`;
    if(a.reasons && a.reasons.length) html += `<div class="small">Based on: ${a.reasons.join(', ')}</div>`;
    if(a.prevention && a.prevention.length){ html += `<div style="margin-top:6px"><em>Prevention / self-care:</em><ul>`;
      a.prevention.forEach(p=> html += `<li>${p}</li>`);
      html += `</ul></div>` }
    if(a.meds && a.meds.length){ html += `<div style="margin-top:6px"><em>Possible medicines / symptomatic measures:</em><ul>`;
      a.meds.forEach(m=> html += `<li>${m}</li>`);
      html += `</ul></div>` }
    html += `</div>`;
  });

  html += `<div class="warning"><strong>Important:</strong> This tool gives broad suggestions only. For any moderate or severe symptoms (high fever, breathing trouble, fainting, confusion, unresponsiveness, persistent chest pain, severe dehydration), seek immediate medical care. For medication choices and dosing, consult a licensed clinician or pharmacist.</div>`;

  // show disease matches (top 3)
  if(diseaseMatches && diseaseMatches.length){
    html += `<hr/><strong>Possible matching diseases (by symptom overlap)</strong><br/>`;
    diseaseMatches.slice(0,3).forEach((m, i) =>{
      html += `<div style="margin-top:8px"><strong>${i+1}. ${m.disease}</strong> <span class="small">(match ${(m.score*100).toFixed(0)}%)</span>`;
      if(m.info && m.info.prevention){
        html += `<div class="small" style="margin-top:6px"><em>Prevention:</em><ul>`;
        m.info.prevention.forEach(p=> html += `<li>${p}</li>`);
        html += `</ul></div>`;
      }
      if(m.info && m.info.meds){
        html += `<div class="small" style="margin-top:6px"><em>Common medicines (informational):</em><ul>`;
        m.info.meds.forEach(md=> html += `<li>${md}</li>`);
        html += `</ul></div>`;
      }
      html += `</div>`;
    });
  }

  resultsEl.innerHTML = html;
  resultsEl.style.display = 'block';
}

function clearForm(){
  document.getElementById('age').value = '';
  document.getElementById('height').value = '';
  document.getElementById('weight').value = '';
  document.getElementById('freeSymptoms').value = '';
  SYMPTOMS.forEach(s=>{
    const id = 'sym_'+s.replace(/\s+/g,'_');
    const el = document.getElementById(id);
    if(el) el.checked = false;
  });
  document.getElementById('results').style.display='none';
}

// wire up
initSymptomCheckboxes();
document.getElementById('analyzeBtn').addEventListener('click', renderResults);
document.getElementById('clearBtn').addEventListener('click', clearForm);
document.getElementById('submitBtn').addEventListener('click', renderSubmitResults);
// accessibility controls
document.getElementById('textSize').addEventListener('change', (e)=>{
  document.body.classList.remove('large-text','xlarge-text');
  if(e.target.value === 'large') document.body.classList.add('large-text');
  if(e.target.value === 'xlarge') document.body.classList.add('xlarge-text');
});
document.getElementById('highContrast').addEventListener('change', (e)=>{
  if(e.target.checked) document.documentElement.classList.add('high-contrast');
  else document.documentElement.classList.remove('high-contrast');
});
document.getElementById('speakBtn').addEventListener('click', ()=>{
  const resultsEl = document.getElementById('results');
  const text = resultsEl && resultsEl.innerText ? resultsEl.innerText : 'No results to read';
  if('speechSynthesis' in window){
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } else {
    alert('Speech output not supported in this browser.');
  }
});

// render preventive list on load
renderPreventivePanel();

// show disease info when user selects/changes disease search
const diseaseInput = document.getElementById('diseaseSearch');
if(diseaseInput){
  diseaseInput.addEventListener('change', (e)=>{
    const val = (e.target.value || '').trim();
    if(!val) return;
    // exact match first
    if(DISEASES.includes(val)) return showDiseaseInfoByName(val);
    // try case-insensitive find
    const found = DISEASES.find(d => d.toLowerCase() === val.toLowerCase() || d.toLowerCase().includes(val.toLowerCase()));
    if(found) return showDiseaseInfoByName(found);
    // otherwise, show name and a note
    const resultsEl = document.getElementById('results');
    resultsEl.innerHTML = `<strong>${val}</strong><div class="small">No detailed info available for this term in the demo. Try a disease from the suggestions.</div>`;
    resultsEl.style.display = 'block';
  });
}