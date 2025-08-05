/**
 * Script to populate the vector database with heart-related medical information
 * This will create a synthetic medical document with heart-related information
 * and store it in the database with proper embeddings
 */

const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { chunkText, cleanText, extractMedicalSections } = require('../utils/textProcessing');
const { generateEmbedding, storeChunksWithEmbeddings } = require('../utils/embeddings');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// MongoDB connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "medBookRAG";

// Enhanced heart-related medical information with comprehensive cardiovascular data
const heartMedicalInfo = `
# Comprehensive Cardiovascular Medicine and Cardiology Guidelines

## Heart Anatomy and Physiology - Advanced

### Cardiac Chambers and Valves
The heart is a four-chambered muscular pump with specific anatomical features:
- **Right Atrium**: Receives deoxygenated blood from superior and inferior vena cava
- **Right Ventricle**: Pumps blood to pulmonary circulation via pulmonary artery
- **Left Atrium**: Receives oxygenated blood from pulmonary veins
- **Left Ventricle**: Main pumping chamber, generates systemic pressure (120 mmHg systolic)

### Heart Valves and Normal Pressures
- **Tricuspid Valve**: Between right atrium and ventricle (normal gradient <5 mmHg)
- **Pulmonary Valve**: Right ventricle to pulmonary artery (normal pressure 8-20 mmHg)
- **Mitral Valve**: Left atrium to left ventricle (normal gradient <5 mmHg)
- **Aortic Valve**: Left ventricle to aorta (normal gradient <10 mmHg)

### Cardiac Conduction System
- **Sinoatrial (SA) Node**: Natural pacemaker (60-100 bpm)
- **Atrioventricular (AV) Node**: Delays impulse (PR interval 120-200 ms)
- **Bundle of His**: Conducts to ventricles
- **Purkinje Fibers**: Ventricular depolarization (QRS <120 ms)

### Normal Cardiac Parameters
- **Stroke Volume**: 70 mL per beat
- **Cardiac Output**: 5-6 L/min (stroke volume × heart rate)
- **Ejection Fraction**: 55-70% (normal left ventricular function)
- **End-Diastolic Volume**: 120-130 mL
- **End-Systolic Volume**: 40-50 mL

## Cardiovascular Diseases - Comprehensive Classification

### Coronary Artery Disease (CAD) - Advanced
Coronary artery disease involves atherosclerotic plaque buildup in epicardial coronary arteries, leading to myocardial ischemia.

#### Clinical Presentation Types:
- **Stable Angina**: Predictable chest pain with exertion, relieved by rest or nitroglycerin
- **Unstable Angina**: New onset, crescendo, or rest angina without troponin elevation
- **NSTEMI**: Non-ST elevation myocardial infarction with troponin elevation
- **STEMI**: ST-elevation myocardial infarction with complete coronary occlusion

#### Risk Stratification (GRACE Score Components):
- Age (>65 years: +28 points)
- Heart rate (>110 bpm: +11 points)
- Systolic BP (<90 mmHg: +24 points)
- Creatinine (>2.0 mg/dL: +4 points)
- Cardiac arrest at admission (+39 points)
- ST deviation (+11 points)
- Elevated cardiac enzymes (+14 points)

#### Laboratory Markers for CAD:
- **Troponin I**: >0.04 ng/mL (diagnostic for MI)
- **Troponin T**: >0.014 ng/mL (diagnostic for MI)
- **CK-MB**: >6.3 ng/mL or >5% of total CK
- **Myoglobin**: Early marker (rises 1-3 hours post-MI)
- **LDH**: Late marker (peaks 48-72 hours)

### Heart Failure - Classification and Management

#### Heart Failure with Reduced Ejection Fraction (HFrEF)
- **Definition**: EF ≤40% with symptoms of heart failure
- **Pathophysiology**: Systolic dysfunction with impaired contractility
- **NYHA Class I**: No symptoms with ordinary activity
- **NYHA Class II**: Slight limitation with ordinary activity
- **NYHA Class III**: Marked limitation with less than ordinary activity
- **NYHA Class IV**: Symptoms at rest or with any physical activity

#### Heart Failure with Preserved Ejection Fraction (HFpEF)
- **Definition**: EF ≥50% with symptoms and signs of heart failure
- **Pathophysiology**: Diastolic dysfunction with impaired relaxation
- **Diagnostic Criteria**: Elevated BNP/NT-proBNP + structural heart disease

#### Advanced Heart Failure Biomarkers:
- **BNP**: >100 pg/mL (acute), >35 pg/mL (chronic)
- **NT-proBNP**: Age-specific cutoffs
  - <50 years: >450 pg/mL
  - 50-75 years: >900 pg/mL
  - >75 years: >1800 pg/mL
- **Troponin**: Often chronically elevated in heart failure
- **Galectin-3**: Novel biomarker for fibrosis (>17.8 ng/mL)
- **ST2**: Prognostic marker (>35 ng/mL indicates poor prognosis)

### Arrhythmias - Comprehensive Classification

#### Atrial Fibrillation (AFib)
- **Paroxysmal**: Self-terminating within 7 days
- **Persistent**: Continuous >7 days, requires cardioversion
- **Long-standing persistent**: Continuous >12 months
- **Permanent**: Accepted, no attempts at rhythm control

#### CHA2DS2-VASc Score for Stroke Risk:
- Congestive heart failure (+1)
- Hypertension (+1)
- Age ≥75 years (+2)
- Diabetes mellitus (+1)
- Stroke/TIA/thromboembolism history (+2)
- Vascular disease (+1)
- Age 65-74 years (+1)
- Sex category (female) (+1)

#### HAS-BLED Score for Bleeding Risk:
- Hypertension (+1)
- Abnormal renal/liver function (+1 each)
- Stroke history (+1)
- Bleeding tendency (+1)
- Labile INR (+1)
- Elderly >65 years (+1)
- Drugs/alcohol (+1 each)

#### Ventricular Arrhythmias
- **Ventricular Tachycardia (VT)**: >100 bpm, wide QRS (>120 ms)
  - Monomorphic VT: Single morphology
  - Polymorphic VT: Variable morphology
  - Torsades de Pointes: Polymorphic VT with long QT
- **Ventricular Fibrillation (VF)**: Chaotic, life-threatening rhythm

### Valvular Heart Disease - Advanced Classification

#### Aortic Stenosis (AS)
- **Mild AS**: Valve area >1.5 cm², mean gradient <20 mmHg
- **Moderate AS**: Valve area 1.0-1.5 cm², mean gradient 20-40 mmHg
- **Severe AS**: Valve area <1.0 cm², mean gradient >40 mmHg
- **Critical AS**: Valve area <0.6 cm², mean gradient >50 mmHg

#### Aortic Regurgitation (AR)
- **Mild AR**: Regurgitant volume <30 mL/beat
- **Moderate AR**: Regurgitant volume 30-59 mL/beat
- **Severe AR**: Regurgitant volume ≥60 mL/beat

#### Mitral Stenosis (MS)
- **Mild MS**: Valve area >1.5 cm², mean gradient <5 mmHg
- **Moderate MS**: Valve area 1.0-1.5 cm², mean gradient 5-10 mmHg
- **Severe MS**: Valve area <1.0 cm², mean gradient >10 mmHg

#### Mitral Regurgitation (MR)
- **Primary MR**: Degenerative (mitral valve prolapse, flail leaflet)
- **Secondary MR**: Functional (ischemic, dilated cardiomyopathy)

### Cardiomyopathies

#### Hypertrophic Cardiomyopathy (HCM)
- **Definition**: Left ventricular wall thickness ≥15 mm
- **Obstructive HCM**: LVOT gradient ≥30 mmHg at rest or ≥50 mmHg with Valsalva
- **Risk Factors for Sudden Death**:
  - Family history of sudden cardiac death
  - Unexplained syncope
  - Massive LVH (≥30 mm)
  - Non-sustained VT on Holter
  - Abnormal blood pressure response to exercise

#### Dilated Cardiomyopathy (DCM)
- **Definition**: LVEF <50% with LV dilation (LVEDD >112% predicted)
- **Etiologies**: Ischemic, viral myocarditis, alcohol, chemotherapy, genetic

#### Restrictive Cardiomyopathy
- **Characteristics**: Impaired ventricular filling with normal or near-normal systolic function
- **Causes**: Amyloidosis, sarcoidosis, hemochromatosis, radiation

### Pericardial Diseases

#### Acute Pericarditis
- **Clinical Criteria** (2 of 4):
  - Typical chest pain (sharp, positional)
  - Pericardial friction rub
  - ECG changes (widespread ST elevation)
  - Pericardial effusion

#### Constrictive Pericarditis
- **Hemodynamics**: Equalization of diastolic pressures
- **Imaging**: Septal bounce, respirophasic ventricular interdependence
- **Catheterization**: Square root sign, elevated and equal filling pressures

### Pulmonary Hypertension

#### WHO Classification:
- **Group 1**: Pulmonary arterial hypertension (PAH)
- **Group 2**: PH due to left heart disease
- **Group 3**: PH due to lung disease/hypoxia
- **Group 4**: Chronic thromboembolic PH
- **Group 5**: PH with unclear/multifactorial mechanisms

#### Hemodynamic Definitions:
- **Pre-capillary PH**: mPAP ≥20 mmHg, PCWP ≤15 mmHg
- **Post-capillary PH**: mPAP ≥20 mmHg, PCWP >15 mmHg

## Comprehensive Cardiac Laboratory Tests and Reference Values

### Cardiac Biomarkers - Detailed Analysis

#### Troponin Testing (High-Sensitivity)
- **hs-cTnI (High-Sensitivity Troponin I)**:
  - Normal: <0.045 ng/mL (male), <0.012 ng/mL (female)
  - 99th percentile: 0.045 ng/mL (male), 0.012 ng/mL (female)
  - Peak: 12-48 hours post-MI
  - Duration: Elevated 7-10 days
- **hs-cTnT (High-Sensitivity Troponin T)**:
  - Normal: <0.014 ng/mL
  - 99th percentile: 0.014 ng/mL
  - Peak: 12-48 hours post-MI
  - Duration: Elevated 7-14 days

#### Creatine Kinase Isoenzymes
- **Total CK**: 30-200 U/L (male), 20-180 U/L (female)
- **CK-MB**: 0-6.3 ng/mL (or <5% of total CK)
- **CK-MB Index**: (CK-MB/Total CK) × 100 (normal <3%)
- **Peak Time**: 12-24 hours post-MI
- **Return to Normal**: 2-3 days

#### Myoglobin
- **Normal Range**: 28-72 ng/mL (male), 25-58 ng/mL (female)
- **Peak Time**: 1-4 hours post-MI (earliest marker)
- **Return to Normal**: 24 hours
- **Limitation**: Not cardiac-specific (also elevated in skeletal muscle injury)

### Heart Failure Biomarkers - Advanced

#### B-Type Natriuretic Peptides
- **BNP (B-Type Natriuretic Peptide)**:
  - Normal: <100 pg/mL
  - Heart failure unlikely: <100 pg/mL
  - Heart failure possible: 100-400 pg/mL
  - Heart failure likely: >400 pg/mL
- **NT-proBNP (N-Terminal pro-BNP)**:
  - Age-adjusted normal values:
    - <50 years: <125 pg/mL
    - 50-75 years: <450 pg/mL
    - >75 years: <900 pg/mL
  - Acute heart failure: >450 pg/mL
  - Chronic heart failure: Variable, trending more important

#### Novel Heart Failure Biomarkers
- **Galectin-3**:
  - Normal: <17.8 ng/mL
  - Elevated: Associated with cardiac fibrosis and worse prognosis
- **Soluble ST2 (sST2)**:
  - Normal: <35 ng/mL
  - Elevated: Associated with myocardial fibrosis and remodeling
- **Growth Differentiation Factor-15 (GDF-15)**:
  - Normal: <1200 pg/mL
  - Elevated: Associated with inflammation and poor prognosis

### Comprehensive Lipid Assessment

#### Standard Lipid Panel
- **Total Cholesterol**:
  - Desirable: <200 mg/dL
  - Borderline high: 200-239 mg/dL
  - High: ≥240 mg/dL
- **LDL Cholesterol** (calculated or direct):
  - Optimal: <100 mg/dL
  - Near optimal: 100-129 mg/dL
  - Borderline high: 130-159 mg/dL
  - High: 160-189 mg/dL
  - Very high: ≥190 mg/dL
- **HDL Cholesterol**:
  - Low (increased risk): <40 mg/dL (male), <50 mg/dL (female)
  - Protective: ≥60 mg/dL
- **Triglycerides**:
  - Normal: <150 mg/dL
  - Borderline high: 150-199 mg/dL
  - High: 200-499 mg/dL
  - Very high: ≥500 mg/dL

#### Advanced Lipid Testing
- **Non-HDL Cholesterol**: Total cholesterol - HDL cholesterol
  - Goal: <130 mg/dL (general), <100 mg/dL (high risk)
- **Apolipoprotein B (ApoB)**:
  - Normal: <90 mg/dL
  - High risk: ≥120 mg/dL
- **Apolipoprotein A1 (ApoA1)**:
  - Normal: >120 mg/dL (male), >140 mg/dL (female)
- **Lipoprotein(a) [Lp(a)]**:
  - Normal: <50 mg/dL or <125 nmol/L
  - High risk: >50 mg/dL
- **LDL Particle Number (LDL-P)**:
  - Optimal: <1000 nmol/L
  - Near optimal: 1000-1299 nmol/L
  - Borderline high: 1300-1599 nmol/L
  - High: ≥1600 nmol/L

### Inflammatory and Thrombotic Markers

#### C-Reactive Protein (CRP)
- **Standard CRP**: <3.0 mg/L
- **High-Sensitivity CRP (hs-CRP)**:
  - Low cardiovascular risk: <1.0 mg/L
  - Average risk: 1.0-3.0 mg/L
  - High risk: >3.0 mg/L
  - Very high risk: >10 mg/L (suggests acute inflammation)

#### Homocysteine
- **Normal**: 4-15 μmol/L
- **Mild elevation**: 15-30 μmol/L
- **Moderate elevation**: 30-100 μmol/L
- **Severe elevation**: >100 μmol/L

#### Fibrinogen
- **Normal**: 200-400 mg/dL
- **Elevated**: >400 mg/dL (associated with increased CV risk)

#### D-Dimer
- **Normal**: <0.5 μg/mL
- **Elevated**: Suggests thrombotic activity (not specific for cardiac events)

### Coagulation Studies for Cardiac Patients

#### Warfarin Monitoring
- **INR (International Normalized Ratio)**:
  - Normal: 0.8-1.2
  - Atrial fibrillation: 2.0-3.0
  - Mechanical heart valves: 2.5-3.5 (mitral), 2.0-3.0 (aortic)

#### Heparin Monitoring
- **aPTT (Activated Partial Thromboplastin Time)**:
  - Normal: 25-35 seconds
  - Therapeutic heparin: 60-80 seconds (1.5-2.5 × control)
- **Anti-Xa Level**:
  - Therapeutic UFH: 0.3-0.7 U/mL
  - Therapeutic LMWH: 0.5-1.0 U/mL

#### Platelet Function Testing
- **Platelet Count**: 150,000-450,000/μL
- **Bleeding Time**: 2-7 minutes
- **PFA-100**: Assesses platelet aggregation
- **Light Transmission Aggregometry**: Gold standard for platelet function

### Cardiac-Specific Enzyme Panels

#### Lactate Dehydrogenase (LDH) Isoenzymes
- **Total LDH**: 140-280 U/L
- **LDH1 (cardiac)**: 17-27% of total
- **LDH2 (cardiac)**: 27-37% of total
- **LDH1:LDH2 Ratio**: Normal <1.0, >1.0 suggests MI

#### Aspartate Aminotransferase (AST)
- **Normal**: 10-40 U/L
- **Peak**: 12-48 hours post-MI
- **Return to Normal**: 3-4 days
- **Limitation**: Not cardiac-specific

### Electrolyte Imbalances Affecting Cardiac Function

#### Potassium
- **Normal**: 3.5-5.0 mEq/L
- **Hypokalemia (<3.5 mEq/L)**: Arrhythmias, prolonged QT
- **Hyperkalemia (>5.0 mEq/L)**: Peaked T waves, widened QRS, heart block

#### Magnesium
- **Normal**: 1.7-2.2 mg/dL
- **Hypomagnesemia**: Arrhythmias, torsades de pointes
- **Often depleted with diuretic use**

#### Calcium
- **Total Calcium**: 8.5-10.5 mg/dL
- **Ionized Calcium**: 4.5-5.5 mg/dL
- **Hypocalcemia**: Prolonged QT, heart failure
- **Hypercalcemia**: Shortened QT, arrhythmias

### Renal Function in Cardiac Disease

#### Creatinine and eGFR
- **Serum Creatinine**:
  - Normal: 0.6-1.2 mg/dL (varies by muscle mass, age, sex)
- **Estimated GFR (eGFR)**:
  - Normal: >90 mL/min/1.73m²
  - Mild decrease: 60-89 mL/min/1.73m²
  - Moderate decrease: 30-59 mL/min/1.73m²
  - Severe decrease: 15-29 mL/min/1.73m²
  - Kidney failure: <15 mL/min/1.73m²

#### Blood Urea Nitrogen (BUN)
- **Normal**: 7-20 mg/dL
- **BUN:Creatinine Ratio**:
  - Normal: 10:1 to 20:1
  - >20:1 suggests prerenal azotemia (dehydration, heart failure)

### Thyroid Function in Cardiac Disease

#### Thyroid Hormones
- **TSH**: 0.4-4.0 mIU/L
- **Free T4**: 0.9-1.7 ng/dL
- **Free T3**: 2.3-4.2 pg/mL
- **Hyperthyroidism**: Can cause atrial fibrillation, heart failure
- **Hypothyroidism**: Can cause bradycardia, heart failure

### Diabetes and Metabolic Markers in Cardiac Disease

#### Glucose Metabolism
- **Fasting Glucose**: 70-100 mg/dL (normal)
- **HbA1c**:
  - Normal: <5.7%
  - Prediabetes: 5.7-6.4%
  - Diabetes: ≥6.5%
  - Goal for cardiac patients: <7% (individualized)

#### Insulin Resistance
- **HOMA-IR**: (Fasting glucose × Fasting insulin)/405
  - Normal: <2.5
  - Insulin resistance: >2.5

## Advanced Cardiovascular Pharmacology

### Antiplatelet and Anticoagulant Therapy

#### Antiplatelet Agents - Mechanisms and Dosing
- **Aspirin (ASA)**:
  - Mechanism: Irreversible COX-1 inhibition
  - Primary prevention: 81 mg daily (age 40-70 with increased CVD risk)
  - Secondary prevention: 75-100 mg daily
  - Acute coronary syndrome: 162-325 mg loading, then 81 mg daily
- **Clopidogrel (Plavix)**:
  - Mechanism: P2Y12 receptor antagonist
  - Standard dose: 75 mg daily
  - Loading dose: 300-600 mg
  - Duration: 12 months post-ACS, lifelong in some cases
- **Prasugrel (Effient)**:
  - Mechanism: More potent P2Y12 antagonist
  - Loading: 60 mg, maintenance: 10 mg daily
  - Contraindicated: History of stroke/TIA, age >75 years (relative), weight <60 kg
- **Ticagrelor (Brilinta)**:
  - Mechanism: Reversible P2Y12 antagonist
  - Loading: 180 mg, maintenance: 90 mg BID
  - Advantage: Reversible binding, faster offset
- **Cangrelor (Kengreal)**:
  - Mechanism: IV P2Y12 antagonist
  - Use: Procedural anticoagulation during PCI
  - Dose: 30 μg/kg bolus, then 4 μg/kg/min infusion

#### Anticoagulant Agents - Advanced
- **Warfarin (Coumadin)**:
  - Mechanism: Vitamin K antagonist (factors II, VII, IX, X)
  - Monitoring: INR (target 2.0-3.0 for AFib, 2.5-3.5 for mechanical valves)
  - Half-life: 36-42 hours
  - Reversal: Vitamin K, fresh frozen plasma, prothrombin complex concentrate
- **Dabigatran (Pradaxa)**:
  - Mechanism: Direct thrombin inhibitor
  - Dose: 150 mg BID (110 mg BID if age >80 or bleeding risk)
  - Monitoring: Not required (aPTT may be prolonged)
  - Reversal: Idarucizumab (Praxbind)
- **Rivaroxaban (Xarelto)**:
  - Mechanism: Factor Xa inhibitor
  - AFib dose: 20 mg daily with food (15 mg if CrCl 15-50)
  - VTE treatment: 15 mg BID × 21 days, then 20 mg daily
  - Reversal: Andexanet alfa (limited availability)
- **Apixaban (Eliquis)**:
  - Mechanism: Factor Xa inhibitor
  - Standard dose: 5 mg BID (2.5 mg BID if ≥2: age ≥80, weight ≤60 kg, SCr ≥1.5)
  - Advantage: Lowest bleeding risk among DOACs
- **Edoxaban (Savaysa)**:
  - Mechanism: Factor Xa inhibitor
  - Dose: 60 mg daily (30 mg if CrCl 15-50, weight ≤60 kg, certain P-gp inhibitors)

### Beta-Blockers - Comprehensive Classification

#### Cardioselective Beta-Blockers
- **Metoprolol Succinate (Toprol-XL)**:
  - Selectivity: β1-selective
  - Heart failure dose: Start 12.5-25 mg daily, target 200 mg daily
  - Post-MI dose: 25-50 mg BID
  - Hypertension: 50-100 mg daily
- **Metoprolol Tartrate (Lopressor)**:
  - Same selectivity, immediate-release formulation
  - Dose: 25-100 mg BID
- **Bisoprolol (Zebeta)**:
  - Selectivity: Highly β1-selective
  - Heart failure: Start 1.25 mg daily, target 10 mg daily
  - Half-life: 10-12 hours
- **Atenolol (Tenormin)**:
  - Selectivity: β1-selective
  - Dose: 25-100 mg daily
  - Renal elimination (dose adjust for kidney disease)
- **Esmolol (Brevibloc)**:
  - Ultra-short acting, IV only
  - Half-life: 9 minutes
  - Use: Perioperative blood pressure control

#### Non-Selective Beta-Blockers
- **Propranolol (Inderal)**:
  - Selectivity: Non-selective (β1 and β2)
  - Uses: Migraine prevention, anxiety, essential tremor
  - Dose: 40-320 mg daily (divided doses)
- **Nadolol (Corgard)**:
  - Long half-life: 14-24 hours
  - Dose: 40-240 mg daily
- **Timolol**:
  - Uses: Post-MI, hypertension, migraine prevention
  - Dose: 10-60 mg daily

#### Beta-Blockers with Alpha-Blocking Activity
- **Carvedilol (Coreg)**:
  - Mechanism: Non-selective β-blocker + α1-blocker
  - Heart failure: Start 3.125 mg BID, target 25-50 mg BID
  - Antioxidant properties
  - Immediate-release: BID dosing
- **Carvedilol CR (Coreg CR)**:
  - Extended-release formulation
  - Once-daily dosing
- **Labetalol (Trandate)**:
  - IV and oral formulations
  - Use: Hypertensive emergencies, pregnancy
  - Dose: 100-400 mg BID (oral), 20-80 mg IV bolus

### ACE Inhibitors and ARBs - Detailed Pharmacology

#### ACE Inhibitors - Classification by Half-Life
**Short-Acting (require BID-TID dosing):**
- **Captopril (Capoten)**:
  - Half-life: 2 hours
  - Dose: 12.5-50 mg TID
  - Advantage: Rapid onset/offset
  - Use: Heart failure, post-MI, hypertension

**Intermediate-Acting (BID dosing):**
- **Enalapril (Vasotec)**:
  - Half-life: 11 hours (enalaprilat)
  - Dose: 2.5-20 mg BID
  - Available as IV formulation (enalaprilat)

**Long-Acting (Once daily dosing):**
- **Lisinopril (Prinivil, Zestril)**:
  - Half-life: 12 hours
  - Dose: 5-40 mg daily
  - Renal elimination (no hepatic metabolism)
  - Heart failure: Start 2.5-5 mg daily, target 20-40 mg daily
- **Ramipril (Altace)**:
  - Half-life: 13-17 hours (ramiprilat)
  - Dose: 1.25-20 mg daily
  - Strong evidence for cardiovascular outcomes (HOPE trial)
- **Perindopril (Aceon)**:
  - Half-life: 30-120 hours (perindoprilat)
  - Dose: 4-8 mg daily
- **Trandolapril (Mavik)**:
  - Half-life: 10-24 hours
  - Dose: 1-4 mg daily

#### Angiotensin Receptor Blockers (ARBs)
- **Losartan (Cozaar)**:
  - Half-life: 6-9 hours
  - Dose: 25-100 mg daily
  - Metabolite: E-3174 (more potent, longer half-life)
  - Additional benefit: Uric acid lowering
- **Valsartan (Diovan)**:
  - Half-life: 6 hours
  - Heart failure dose: Start 40 mg BID, target 160 mg BID
  - Post-MI: Start 20 mg BID, target 160 mg BID
- **Irbesartan (Avapro)**:
  - Half-life: 11-15 hours
  - Dose: 150-300 mg daily
  - Strong nephroprotective effects
- **Olmesartan (Benicar)**:
  - Half-life: 13 hours
  - Dose: 20-40 mg daily
  - Warning: Sprue-like enteropathy (rare)
- **Telmisartan (Micardis)**:
  - Half-life: 24 hours
  - Dose: 20-80 mg daily
  - Partial PPAR-γ agonist activity
- **Candesartan (Atacand)**:
  - Half-life: 9-12 hours
  - Heart failure: Start 4 mg daily, target 32 mg daily

#### ARNI (Angiotensin Receptor-Neprilysin Inhibitor)
- **Sacubitril/Valsartan (Entresto)**:
  - Mechanism: ARB + neprilysin inhibitor
  - Heart failure dose: Start 24/26 mg BID, target 97/103 mg BID
  - Contraindication: History of angioedema with ACE inhibitor
  - Washout: 36 hours from ACE inhibitor before starting

### Calcium Channel Blockers - Advanced Classification

#### Dihydropyridines (Primarily Vasodilatory)
- **Amlodipine (Norvasc)**:
  - Half-life: 30-50 hours
  - Dose: 2.5-10 mg daily
  - Advantage: Once daily, minimal negative inotropy
- **Nifedipine (Procardia XL)**:
  - Immediate-release contraindicated in acute settings
  - Extended-release: 30-90 mg daily
- **Felodipine (Plendil)**:
  - Half-life: 11-16 hours
  - Dose: 2.5-10 mg daily
- **Clevidipine (Cleviprex)**:
  - Ultra-short acting IV formulation
  - Half-life: 1 minute
  - Use: Perioperative blood pressure control

#### Non-Dihydropyridines (Rate and Blood Pressure Control)
- **Verapamil (Calan SR)**:
  - Mechanism: L-type calcium channel blocker
  - Uses: Hypertension, atrial fibrillation rate control, PSVT
  - Dose: 120-480 mg daily (extended-release)
  - Contraindications: Heart failure with reduced EF, heart block
- **Diltiazem (Cardizem CD)**:
  - Similar to verapamil but less negative inotropy
  - Dose: 120-360 mg daily (extended-release)
  - IV formulation available for acute rate control

### Diuretics - Comprehensive Classification

#### Loop Diuretics
- **Furosemide (Lasix)**:
  - Mechanism: Na-K-2Cl cotransporter inhibition (ascending limb)
  - Oral bioavailability: 40-60% (variable)
  - Dose: 20-600 mg daily (divided doses)
  - IV:PO ratio: 1:2
- **Bumetanide (Bumex)**:
  - More predictable oral absorption
  - Dose: 0.5-10 mg daily
  - IV:PO ratio: 1:1
- **Torsemide (Demadex)**:
  - Longest half-life among loop diuretics
  - Better oral bioavailability: 80-90%
  - Dose: 10-200 mg daily
  - Additional aldosterone antagonist effects

#### Thiazide and Thiazide-like Diuretics
- **Hydrochlorothiazide (HCTZ)**:
  - Mechanism: NaCl cotransporter inhibition (distal tubule)
  - Dose: 12.5-50 mg daily
  - Duration: 6-12 hours
- **Chlorthalidone (Thalitone)**:
  - Half-life: 24-72 hours
  - Preferred for cardiovascular outcomes
  - Dose: 12.5-25 mg daily
- **Indapamide (Lozol)**:
  - Vasodilatory properties
  - Less metabolic side effects
  - Dose: 1.25-2.5 mg daily

#### Potassium-Sparing Diuretics
- **Spironolactone (Aldactone)**:
  - Mechanism: Aldosterone receptor antagonist
  - Heart failure dose: 12.5-50 mg daily
  - Monitor: Potassium, kidney function
  - Side effects: Gynecomastia, hyperkalemia
- **Eplerenone (Inspra)**:
  - Selective aldosterone antagonist
  - Less gynecomastia than spironolactone
  - Post-MI dose: 25-50 mg daily
- **Amiloride (Midamor)**:
  - Mechanism: ENaC channel blocker
  - Usually combined with HCTZ
- **Triamterene (Dyrenium)**:
  - Similar mechanism to amiloride
  - Usually combined with HCTZ (Dyazide, Maxzide)

### Lipid-Lowering Therapy - Advanced

#### HMG-CoA Reductase Inhibitors (Statins)
- **Atorvastatin (Lipitor)**:
  - Half-life: 14 hours
  - Potency: High
  - Dose: 10-80 mg daily
  - Drug interactions: Strong CYP3A4 substrate
- **Rosuvastatin (Crestor)**:
  - Half-life: 19 hours
  - Most potent statin
  - Dose: 5-40 mg daily
  - Least drug interactions
- **Simvastatin (Zocor)**:
  - Half-life: 5 hours
  - Dose limit: 40 mg (80 mg contraindicated due to myopathy risk)
  - Strong CYP3A4 substrate
- **Pravastatin (Pravachol)**:
  - Hydrophilic (less CNS penetration)
  - Dose: 10-80 mg daily
  - Fewer drug interactions
- **Pitavastatin (Livalo)**:
  - Minimal CYP metabolism
  - Dose: 1-4 mg daily
  - Fewer drug interactions

#### Non-Statin Lipid Therapies
- **Ezetimibe (Zetia)**:
  - Mechanism: Cholesterol absorption inhibitor
  - Dose: 10 mg daily
  - Often combined with statins
- **PCSK9 Inhibitors**:
  - **Evolocumab (Repatha)**: 140 mg Q2 weeks or 420 mg monthly SC
  - **Alirocumab (Praluent)**: 75-150 mg Q2 weeks SC
  - Indication: Familial hypercholesterolemia, statin-intolerant, CVD with inadequate LDL control
- **Bile Acid Sequestrants**:
  - **Cholestyramine (Questran)**: 4-24 g daily
  - **Colesevelam (Welchol)**: 3.75 g daily
  - Drug interactions: Reduce absorption of many medications

### Advanced Heart Failure Medications

#### SGLT2 Inhibitors (Gliflozins)
- **Dapagliflozin (Farxiga)**:
  - Heart failure indication: 10 mg daily
  - Benefits: Reduced HF hospitalizations, CV death
  - Side effects: UTI, genital infections, DKA risk
- **Empagliflozin (Jardiance)**:
  - Similar benefits and dosing
  - Strong CV outcomes data (EMPA-REG OUTCOME)

#### Vasodilators
- **Hydralazine/Isosorbide Dinitrate (BiDil)**:
  - Combination therapy for African American patients with HFrEF
  - Dose: 37.5 mg/20 mg TID, target 75 mg/40 mg TID
- **Nitroglycerin**:
  - Sublingual: 0.3-0.6 mg PRN chest pain
  - Patch: 0.2-0.8 mg/hr (remove 12 hours daily to prevent tolerance)
  - IV: 10-200 μg/min

#### Inotropic Agents
- **Digoxin (Lanoxin)**:
  - Mechanism: Na-K ATPase inhibition
  - Dose: 0.125-0.25 mg daily
  - Target level: 0.5-2.0 ng/mL (1.0-1.5 ng/mL preferred)
  - Contraindications: Heart block, hypertrophic cardiomyopathy
- **Milrinone (Primacor)**:
  - Mechanism: Phosphodiesterase III inhibitor
  - IV only: 0.125-0.75 μg/kg/min
  - Use: Acute decompensated heart failure, cardiogenic shock

### Antiarrhythmic Drugs - Vaughan Williams Classification

#### Class I (Sodium Channel Blockers)
**Class Ia:**
- **Quinidine**: 200-400 mg QID
- **Procainamide**: 250-500 mg QID
- **Disopyramide**: 100-200 mg QID

**Class Ib:**
- **Lidocaine**: IV only, 1-4 mg/min
- **Mexiletine**: 150-300 mg TID

**Class Ic:**
- **Flecainide**: 50-200 mg BID
- **Propafenone**: 150-300 mg TID

#### Class II (Beta-Blockers)
- See beta-blocker section above

#### Class III (Potassium Channel Blockers)
- **Amiodarone (Cordarone)**:
  - Loading: 400-800 mg daily × 1-3 weeks
  - Maintenance: 100-400 mg daily
  - Half-life: 25-110 days
  - Side effects: Pulmonary fibrosis, thyroid dysfunction, hepatotoxicity
- **Dronedarone (Multaq)**:
  - Dose: 400 mg BID
  - Contraindicated in heart failure
- **Sotalol (Betapace)**:
  - Dose: 80-320 mg BID
  - Monitor: QT interval, kidney function
- **Dofetilide (Tikosyn)**:
  - Dose: 125-500 μg BID
  - Requires inpatient initiation
- **Ibutilide (Corvert)**:
  - IV only for acute cardioversion
  - Dose: 1 mg over 10 minutes

#### Class IV (Calcium Channel Blockers)
- **Verapamil**: See calcium channel blocker section
- **Diltiazem**: See calcium channel blocker section

## Advanced Cardiac Diagnostic Procedures and Imaging

### Electrocardiography - Comprehensive Analysis

#### Standard 12-Lead ECG Interpretation
- **Heart Rate Calculation**:
  - Regular rhythm: 300 ÷ number of large boxes between R waves
  - Irregular rhythm: Count R waves in 6 seconds × 10
- **Normal Intervals**:
  - PR interval: 120-200 ms (3-5 small boxes)
  - QRS duration: <120 ms (<3 small boxes)
  - QT interval: <440 ms (male), <460 ms (female)
  - QTc (corrected): QT ÷ √RR interval

#### Advanced ECG Findings
- **ST-Elevation MI (STEMI) Criteria**:
  - ≥1 mm ST elevation in 2 contiguous limb leads
  - ≥2 mm ST elevation in 2 contiguous precordial leads
  - New left bundle branch block
- **Non-STEMI Patterns**:
  - ST depression ≥0.5 mm in 2 contiguous leads
  - T wave inversions in 2 contiguous leads
  - Transient ST elevation <20 minutes
- **High-Risk ECG Features**:
  - Wellens' signs (biphasic or inverted T waves in V2-V3)
  - De Winter pattern (upsloping ST depression with tall R waves)
  - Sgarbossa criteria for MI with LBBB

#### Specialized ECG Testing
- **Exercise Stress ECG**:
  - Bruce protocol (most common)
  - Target heart rate: 85% of (220 - age)
  - Positive test: ≥1 mm horizontal/downsloping ST depression
  - Duke Treadmill Score: Prognostic tool
- **Holter Monitoring** (24-48 hours):
  - Indications: Arrhythmia detection, syncope evaluation
  - Analysis: Heart rate variability, arrhythmia burden
- **Event Monitors**:
  - Loop recorders: 2-4 weeks monitoring
  - Implantable loop recorders: Up to 3 years

### Echocardiography - Advanced Assessment

#### Transthoracic Echocardiography (TTE)
- **Left Ventricular Assessment**:
  - Ejection fraction (EF): Normal 55-70%
  - Wall motion analysis: 17-segment model
  - Diastolic function: E/A ratio, E/e' ratio, deceleration time
  - Strain imaging: Global longitudinal strain (normal >-18%)

#### Advanced Doppler Techniques
- **Tissue Doppler Imaging (TDI)**:
  - Mitral annular velocities (e', a', s')
  - E/e' ratio: <8 normal, 8-14 intermediate, >14 elevated filling pressures
- **Strain and Strain Rate**:
  - Speckle tracking echocardiography
  - Global longitudinal strain: Early marker of systolic dysfunction
  - Regional strain: Detects regional wall motion abnormalities

#### Specialized Echocardiographic Studies
- **Stress Echocardiography**:
  - Dobutamine stress: For patients unable to exercise
  - Protocol: 10-40 μg/kg/min dobutamine infusion
  - Endpoints: Target heart rate, chest pain, arrhythmias, wall motion abnormalities
- **Transesophageal Echocardiography (TEE)**:
  - Superior image quality for posterior structures
  - Indications: Endocarditis, aortic pathology, atrial thrombus, prosthetic valves
  - Contraindications: Esophageal pathology, severe cervical spine disease

#### 3D Echocardiography
- **Real-time 3D imaging**:
  - More accurate volume calculations
  - Detailed valve morphology assessment
  - Mitral valve analysis for surgical planning

### Cardiac CT Imaging

#### Coronary Artery Calcium Scoring
- **Agatston Score**:
  - 0: No identifiable plaque
  - 1-10: Minimal plaque
  - 11-100: Mild plaque
  - 101-400: Moderate plaque
  - >400: Extensive plaque
- **Clinical Applications**:
  - Risk stratification in intermediate-risk patients
  - Class IIA recommendation for shared decision-making

#### CT Coronary Angiography (CTCA)
- **Image Quality Requirements**:
  - Heart rate <65 bpm (beta-blockers often needed)
  - Breath-hold capability
  - Normal kidney function (contrast load)
- **Diagnostic Accuracy**:
  - Sensitivity: 95-99% for detecting significant CAD
  - Specificity: 85-95%
  - Negative predictive value: >95%
- **Limitations**:
  - Heavy calcification reduces accuracy
  - Radiation exposure (1-5 mSv with modern scanners)
  - Contrast nephropathy risk

#### Cardiac CT for Structural Heart Disease
- **Aortic Valve Assessment**:
  - TAVR planning: Annular measurements, access route evaluation
  - Bicuspid aortic valve morphology
- **Pulmonary Vein Imaging**:
  - Pre-ablation planning for atrial fibrillation
  - Pulmonary vein stenosis detection

### Cardiac MRI (CMR)

#### Standard CMR Protocols
- **Cine Imaging**:
  - Steady-state free precession (SSFP)
  - Ventricular function assessment
  - Most accurate method for EF calculation
- **T1 and T2-Weighted Imaging**:
  - Tissue characterization
  - Edema detection (T2-weighted)
  - Fat detection (T1-weighted)

#### Late Gadolinium Enhancement (LGE)
- **Myocardial Viability Assessment**:
  - <50% transmural enhancement: Viable myocardium
  - >50% transmural enhancement: Non-viable myocardium
- **Scar Pattern Recognition**:
  - Subendocardial: Ischemic cardiomyopathy
  - Mid-wall: Non-ischemic cardiomyopathy
  - Subepicardial: Myocarditis, sarcoidosis

#### Parametric Mapping
- **T1 Mapping**:
  - Native T1: Detects diffuse fibrosis, edema
  - Post-contrast T1: Extracellular volume calculation
- **T2 Mapping**:
  - Myocardial edema quantification
  - Acute myocarditis, acute MI
- **T2* Mapping**:
  - Iron overload detection (thalassemia, hemochromatosis)

### Nuclear Cardiology

#### Single Photon Emission CT (SPECT) Imaging
- **Stress/Rest Myocardial Perfusion**:
  - Tracers: Tc-99m sestamibi, Tc-99m tetrofosmin, Tl-201
  - Stress methods: Exercise, pharmacologic (adenosine, regadenoson, dobutamine)
  - Interpretation: 17-segment model, summed stress/rest scores
- **Gated SPECT**:
  - Simultaneous perfusion and function assessment
  - Ejection fraction calculation
  - Wall motion and thickening analysis

#### Positron Emission Tomography (PET)
- **Myocardial Perfusion PET**:
  - Tracers: Rb-82, N-13 ammonia, F-18 flurpiridaz
  - Superior image quality compared to SPECT
  - Absolute quantification of myocardial blood flow
- **Metabolic Imaging**:
  - F-18 FDG: Myocardial viability assessment
  - Hibernating myocardium identification

### Invasive Cardiac Procedures

#### Cardiac Catheterization - Advanced Hemodynamics
- **Normal Pressures and Resistances**:
  - Right atrial pressure: 2-8 mmHg
  - RV pressure: 15-30/2-8 mmHg
  - Pulmonary artery: 15-30/5-15 mmHg
  - Pulmonary capillary wedge: 6-15 mmHg
  - Left ventricular: 90-140/5-12 mmHg
  - Aortic pressure: 90-140/60-90 mmHg
  - Cardiac output: 4-8 L/min
  - Cardiac index: 2.5-4.0 L/min/m²

#### Coronary Angiography Interpretation
- **Coronary Artery Anatomy**:
  - Left main: Supplies 75% of left ventricle
  - LAD: Supplies anterior wall and septum
  - LCX: Supplies lateral wall
  - RCA: Supplies inferior wall and RV (85% dominant)
- **Stenosis Severity Grading**:
  - Mild: <50% diameter stenosis
  - Moderate: 50-69% diameter stenosis
  - Severe: 70-99% diameter stenosis
  - Total occlusion: 100% stenosis
- **Lesion Complexity (ACC/AHA Classification)**:
  - Type A: Low risk, high success rate
  - Type B1/B2: Moderate complexity
  - Type C: High risk, lower success rate

#### Fractional Flow Reserve (FFR)
- **Principle**: Pressure wire measurement during hyperemia
- **Normal Value**: >0.80
- **Intermediate Zone**: 0.75-0.80
- **Significant Stenosis**: ≤0.75
- **Clinical Application**: Guides revascularization decisions

#### Optical Coherence Tomography (OCT)
- **High-Resolution Intravascular Imaging**:
  - Resolution: 10-15 μm
  - Tissue characterization of plaques
  - Stent optimization
- **Vulnerable Plaque Features**:
  - Thin-cap fibroatheroma (<65 μm cap)
  - Large lipid core
  - Macrophage infiltration

#### Intravascular Ultrasound (IVUS)
- **Applications**:
  - Vessel sizing for stent selection
  - Assessment of stent deployment
  - Plaque composition analysis
- **Measurements**:
  - Minimal lumen area (MLA)
  - Plaque burden percentage
  - Vessel remodeling assessment

### Electrophysiology Studies

#### Diagnostic EP Study
- **Baseline Intervals**:
  - AH interval: 60-125 ms
  - HV interval: 35-55 ms
  - Sinus node recovery time: <1500 ms
- **Programmed Stimulation**:
  - Ventricular effective refractory period
  - Atrial effective refractory period
  - Inducibility of arrhythmias

#### Catheter Ablation Procedures
- **Atrial Fibrillation Ablation**:
  - Pulmonary vein isolation (PVI)
  - Linear ablations (roof line, mitral isthmus)
  - Complex fractionated atrial electrograms (CFAE)
- **VT Ablation**:
  - Substrate modification
  - Pace mapping
  - Entrainment mapping
- **Supraventricular Tachycardia**:
  - AVNRT: Slow pathway modification
  - AVRT: Accessory pathway ablation

### Advanced Imaging for Specific Conditions

#### Hypertrophic Cardiomyopathy Imaging
- **Echocardiographic Assessment**:
  - Wall thickness measurement (≥15 mm diagnostic)
  - LVOT gradient assessment (rest and provoked)
  - Mitral valve morphology (SAM)
- **CMR Assessment**:
  - Late gadolinium enhancement (risk stratification)
  - T1 mapping (diffuse fibrosis)
  - Cine imaging (detailed wall motion)

#### Cardiac Amyloidosis Imaging
- **Echocardiographic Features**:
  - Increased wall thickness with normal/reduced voltages on ECG
  - Granular sparkling myocardial texture
  - Diastolic dysfunction
- **Nuclear Imaging**:
  - Tc-99m PYP/DPD scintigraphy
  - Grade 2-3 uptake suggests ATTR amyloidosis
- **CMR Features**:
  - Subendocardial late gadolinium enhancement
  - Inability to null myocardium
  - Elevated native T1 values

#### Cardiac Sarcoidosis
- **FDG-PET Imaging**:
  - Metabolically active inflammation detection
  - Treatment response monitoring
- **CMR Features**:
  - Mid-wall and subepicardial enhancement
  - Basal septal predilection
  - Associated with ventricular arrhythmias

## Heart-Healthy Lifestyle Recommendations

### Diet
- Mediterranean diet rich in fruits, vegetables, whole grains, fish, and olive oil
- Limit saturated and trans fats, sodium, and added sugars
- DASH diet (Dietary Approaches to Stop Hypertension) for blood pressure management

### Exercise
- At least 150 minutes of moderate-intensity aerobic activity per week
- Muscle-strengthening activities at least 2 days per week
- Regular physical activity helps control weight, reduce blood pressure, and improve cholesterol levels

### Stress Management
- Chronic stress can contribute to high blood pressure and other heart disease risks
- Techniques include meditation, deep breathing exercises, yoga, and regular physical activity

### Sleep
- Aim for 7-9 hours of quality sleep per night
- Poor sleep is linked to high blood pressure, type 2 diabetes, and obesity

### Smoking Cessation
- Smoking damages blood vessels and can lead to atherosclerosis
- Quitting smoking reduces the risk of heart disease and stroke

## Preventive Cardiology and Risk Assessment

### Cardiovascular Risk Calculators
- **ASCVD Risk Calculator (ACC/AHA)**:
  - Estimates 10-year risk of ASCVD
  - Age, sex, race, cholesterol, blood pressure, diabetes, smoking
  - Treatment recommendations based on risk thresholds
- **Framingham Risk Score**:
  - Traditional risk calculator
  - 10-year CHD risk estimation
- **SCORE Risk Calculator (European)**:
  - 10-year fatal CVD risk
  - Separate charts for high-risk and low-risk countries

### Primary Prevention Guidelines
- **Lifestyle Modifications**:
  - Mediterranean diet or DASH diet
  - ≥150 minutes moderate exercise weekly
  - Weight management (BMI 18.5-24.9 kg/m²)
  - Smoking cessation
  - Alcohol moderation
- **Pharmacologic Interventions**:
  - Statin therapy: ASCVD risk ≥7.5% (Class I), 5-7.5% (Class IIa)
  - Aspirin: Age 40-70 with increased CVD risk and low bleeding risk
  - Blood pressure management: <130/80 mmHg

### Secondary Prevention Guidelines
- **Dual Antiplatelet Therapy**:
  - Aspirin + P2Y12 inhibitor × 12 months post-ACS
  - Longer duration if high ischemic risk, low bleeding risk
- **Statin Therapy**:
  - High-intensity statin for LDL <70 mg/dL
  - Very high-risk patients: LDL <55 mg/dL
- **ACE Inhibitor/ARB**:
  - All patients with reduced EF
  - Diabetes or hypertension
- **Beta-Blocker**:
  - All patients post-MI
  - Heart failure with reduced EF

## Interventional Cardiology - Advanced Procedures

### Percutaneous Coronary Intervention (PCI)
- **Indications**:
  - STEMI: Primary PCI within 90-120 minutes
  - NSTEMI/Unstable angina: Early invasive strategy (<24 hours)
  - Stable CAD: Ischemia-guided revascularization
- **Stent Types**:
  - Bare metal stents (BMS): Limited use
  - Drug-eluting stents (DES): First-line therapy
  - Bioresorbable scaffolds: Investigational

### Structural Heart Interventions
- **Transcatheter Aortic Valve Replacement (TAVR)**:
  - Indications: High/intermediate surgical risk severe AS
  - Approaches: Transfemoral (preferred), transapical, transaortic
  - Valve types: Balloon-expandable, self-expanding
- **MitraClip**:
  - Percutaneous mitral valve repair
  - Indications: Severe MR, high surgical risk
  - Anatomic requirements: Central/posterior leaflet pathology
- **Left Atrial Appendage Closure**:
  - Watchman device
  - Indications: AFib with contraindication to anticoagulation

### Mechanical Circulatory Support
- **Intra-Aortic Balloon Pump (IABP)**:
  - Indications: Cardiogenic shock, high-risk PCI
  - Mechanism: Diastolic augmentation, afterload reduction
- **Impella Devices**:
  - Percutaneous left ventricular assist devices
  - Types: Impella 2.5, CP, 5.0, 5.5
  - Flow rates: 2.5-5.5 L/min
- **ECMO (Extracorporeal Membrane Oxygenation)**:
  - VA-ECMO: Cardiac and respiratory support
  - VV-ECMO: Respiratory support only

## Heart Transplantation and Advanced Heart Failure

### Heart Transplant Evaluation
- **Indications**:
  - End-stage heart failure despite optimal medical therapy
  - Life expectancy <1 year without transplant
  - Good functional status potential
- **Contraindications**:
  - Age >70 years (relative)
  - Irreversible pulmonary hypertension
  - Active malignancy
  - Substance abuse
  - Severe comorbidities

### Ventricular Assist Devices (VADs)
- **Indications**:
  - Bridge to transplant
  - Destination therapy
  - Bridge to recovery (rare)
- **Device Types**:
  - Continuous flow (axial, centrifugal)
  - Pulsatile flow (largely obsolete)
- **Complications**:
  - Bleeding, infection, thrombosis
  - Device malfunction, arrhythmias

## Cardiac Rehabilitation

### Components of Cardiac Rehabilitation
- **Exercise Training**:
  - Aerobic exercise: 30-60 minutes, 3-5 days/week
  - Resistance training: 2-3 days/week
  - Flexibility training: Daily
- **Education and Counseling**:
  - Disease process understanding
  - Medication adherence
  - Risk factor modification
  - Psychosocial support
- **Nutritional Counseling**:
  - Heart-healthy diet education
  - Weight management
  - Sodium restriction (<2.3 g/day)

### Phases of Cardiac Rehabilitation
- **Phase I (Inpatient)**:
  - Early mobilization
  - Initial education
  - Discharge planning
- **Phase II (Outpatient)**:
  - Supervised exercise program
  - Risk stratification
  - 36 sessions over 12-18 weeks
- **Phase III (Maintenance)**:
  - Long-term lifestyle maintenance
  - Community-based programs
  - Self-directed exercise

## Women and Heart Disease

### Gender Differences in CAD
- **Presentation**:
  - Atypical symptoms more common
  - Fatigue, shortness of breath, nausea
  - Later age of presentation
- **Pathophysiology**:
  - Microvascular dysfunction
  - Coronary artery spasm
  - Spontaneous coronary artery dissection (SCAD)
- **Risk Factors**:
  - Pregnancy-related conditions (preeclampsia, gestational diabetes)
  - Autoimmune diseases
  - Early menopause
  - Hormonal factors

### Pregnancy and Heart Disease
- **Hemodynamic Changes**:
  - Increased blood volume (40-50%)
  - Increased cardiac output (30-50%)
  - Decreased systemic vascular resistance
- **High-Risk Conditions**:
  - Pulmonary hypertension
  - Severe aortic stenosis
  - Marfan syndrome with aortic dilatation
  - Eisenmenger syndrome
- **Management Considerations**:
  - Multidisciplinary team approach
  - Medication safety in pregnancy
  - Delivery planning

## Geriatric Cardiology

### Age-Related Cardiovascular Changes
- **Structural Changes**:
  - Increased arterial stiffness
  - Left ventricular hypertrophy
  - Valvular calcification
  - Reduced ventricular compliance
- **Functional Changes**:
  - Reduced maximum heart rate
  - Decreased exercise capacity
  - Impaired autonomic function
  - Altered drug metabolism

### Special Considerations in Elderly
- **Polypharmacy**:
  - Drug-drug interactions
  - Medication adherence challenges
  - Altered pharmacokinetics
- **Comorbidities**:
  - Diabetes, kidney disease, cognitive impairment
  - Frailty assessment
  - Quality of life considerations
- **Treatment Modifications**:
  - Lower target blood pressures in frail patients
  - Careful anticoagulation decisions
  - Shared decision-making

## Emerging Therapies and Future Directions

### Novel Therapeutic Targets
- **PCSK9 Inhibitors**:
  - Monoclonal antibodies and siRNA
  - Dramatic LDL reduction (50-70%)
  - Cardiovascular outcomes benefits
- **Inclisiran**:
  - siRNA targeting PCSK9
  - Twice-yearly dosing
  - Long-term LDL reduction
- **Bempedoic Acid**:
  - Oral cholesterol synthesis inhibitor
  - Alternative for statin-intolerant patients

### Gene Therapy and Regenerative Medicine
- **Cardiac Gene Therapy**:
  - Myosin modulators for HCM
  - Gene editing for inherited cardiomyopathies
- **Stem Cell Therapy**:
  - Cardiac progenitor cells
  - Induced pluripotent stem cells
  - Tissue engineering approaches
- **Artificial Hearts**:
  - Total artificial heart devices
  - Bioengineered heart tissues

### Digital Health and Cardiology
- **Wearable Technology**:
  - Continuous heart rate monitoring
  - ECG monitoring (Apple Watch, KardiaMobile)
  - Activity tracking and exercise prescription
- **Telemedicine**:
  - Remote monitoring of heart failure patients
  - Digital therapeutics for cardiac rehabilitation
  - AI-assisted diagnosis and risk prediction
- **Artificial Intelligence**:
  - ECG interpretation algorithms
  - Imaging analysis and diagnosis
  - Predictive analytics for adverse events

### Precision Medicine in Cardiology
- **Pharmacogenomics**:
  - CYP2C19 testing for clopidogrel metabolism
  - Warfarin dosing algorithms
  - Statin-induced myopathy risk
- **Genetic Testing**:
  - Familial hypercholesterolemia screening
  - Cardiomyopathy gene panels
  - Channelopathy evaluation
- **Biomarker-Guided Therapy**:
  - NT-proBNP-guided heart failure management
  - Troponin for risk stratification
  - Novel biomarkers for personalized treatment
`;

// Connect to MongoDB and populate the database
async function populateHeartData() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db(dbName);
    
    // Clean the text
    const cleanedText = cleanText(heartMedicalInfo);
    
    // Extract medical sections
    const sections = extractMedicalSections(cleanedText);
    
    // Chunk the text with overlap for better context
    const chunks = chunkText(cleanedText, 1000, 200);
    
    // Create a document object with comprehensive medical categories
    const document = {
      fileName: "Comprehensive_Cardiovascular_Medicine_Guidelines.pdf",
      uploadDate: new Date(),
      content: cleanedText,
      sections: sections,
      chunks: chunks.map((chunk, index) => ({
        id: index,
        content: chunk.content,
      })),
      medicalCategories: [
        'cardiology',
        'cardiovascular',
        'coronary_artery_disease',
        'heart_failure',
        'arrhythmias',
        'valvular_disease',
        'cardiomyopathy',
        'hypertension',
        'cardiac_pharmacology',
        'cardiac_imaging',
        'electrocardiography',
        'echocardiography',
        'cardiac_catheterization',
        'nuclear_cardiology',
        'cardiac_ct',
        'cardiac_mri',
        'electrophysiology',
        'interventional_cardiology',
        'preventive_cardiology',
        'lipid_disorders',
        'anticoagulation',
        'cardiac_biomarkers',
        'hemodynamics',
        'pericardial_disease',
        'pulmonary_hypertension',
        'cardiac_rehabilitation',
        'heart_transplantation',
        'mechanical_circulatory_support',
        'cardiac_surgery',
        'congenital_heart_disease'
      ]
    };
    
    // Insert the document into MongoDB
    const result = await db.collection("documents").insertOne(document);
    console.log(`Document inserted with ID: ${result.insertedId}`);
    
    // Store chunks with vector embeddings for semantic search
    await storeChunksWithEmbeddings(document, chunks, result.insertedId.toString());
    
    console.log("Heart data successfully populated in the vector database!");
    
  } catch (error) {
    console.error("Error populating heart data:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run the population script
populateHeartData();
