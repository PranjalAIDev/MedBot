/**
 * Script to populate the knowledge base with comprehensive medical information
 * This creates the external knowledge that RAG will use to answer questions about patient documents
 */

const path = require('path');
const { storeKnowledgeBaseChunks } = require('../utils/knowledgeBase');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Comprehensive medical knowledge base content
const medicalKnowledge = {
  // Heart and Cardiovascular Health
  cardiovascular: `
# Cardiovascular Health and Heart Disease

## Understanding Cholesterol and Lipid Profiles

### Low-Density Lipoprotein (LDL) Cholesterol
LDL cholesterol is often called "bad cholesterol" because high levels can lead to plaque buildup in arteries and cause heart disease. LDL cholesterol is calculated using the Friedewald equation: LDL = Total Cholesterol - HDL - (Triglycerides/5).

**Normal Ranges:**
- Optimal: Less than 100 mg/dL (2.6 mmol/L)
- Near optimal: 100-129 mg/dL (2.6-3.3 mmol/L)
- Borderline high: 130-159 mg/dL (3.4-4.1 mmol/L)
- High: 160-189 mg/dL (4.1-4.9 mmol/L)
- Very high: 190 mg/dL (4.9 mmol/L) and above

### High-Density Lipoprotein (HDL) Cholesterol
HDL cholesterol is known as "good cholesterol" because it carries cholesterol from other parts of your body back to your liver, which removes the cholesterol from your body.

**Normal Ranges:**
- Men: 40 mg/dL (1.0 mmol/L) or higher
- Women: 50 mg/dL (1.3 mmol/L) or higher
- Protective level for both: 60 mg/dL (1.6 mmol/L) or higher

### Triglycerides
Triglycerides are a type of fat found in your blood. High triglyceride levels combined with high LDL or low HDL cholesterol can increase your risk of heart attack and stroke.

**Normal Ranges:**
- Normal: Less than 150 mg/dL (1.7 mmol/L)
- Borderline high: 150-199 mg/dL (1.7-2.2 mmol/L)
- High: 200-499 mg/dL (2.3-5.6 mmol/L)
- Very high: 500 mg/dL (5.7 mmol/L) or higher

### Total Cholesterol
Total cholesterol is the overall amount of cholesterol in your blood, including LDL and HDL cholesterol.

**Normal Ranges:**
- Desirable: Less than 200 mg/dL (5.2 mmol/L)
- Borderline high: 200-239 mg/dL (5.2-6.2 mmol/L)
- High: 240 mg/dL (6.2 mmol/L) and above

## C-Reactive Protein (CRP) and High-Sensitivity CRP (hs-CRP)

### Understanding Inflammation Markers
C-reactive protein (CRP) is a substance produced by the liver in response to inflammation. High-sensitivity CRP (hs-CRP) is a more precise test that can detect lower levels of CRP and is used to assess cardiovascular disease risk.

**hs-CRP Normal Ranges:**
- Low risk: Less than 1.0 mg/L
- Average risk: 1.0-3.0 mg/L
- High risk: Greater than 3.0 mg/L

**Clinical Significance:**
- hs-CRP levels above 3.0 mg/L indicate increased risk of cardiovascular disease
- Combined with other risk factors, hs-CRP helps predict heart attack and stroke risk
- Elevated hs-CRP may indicate systemic inflammation that affects arterial health

## Cardiovascular Risk Assessment

### Framingham Risk Score
The Framingham Risk Score estimates the 10-year cardiovascular disease risk based on:
- Age, gender, total cholesterol, HDL cholesterol, blood pressure, diabetes, smoking status

### ACC/AHA Risk Calculator
Uses additional factors including:
- Race, treatment for hypertension, aspirin use, family history

### Risk Categories:
- Low risk: <5% 10-year risk
- Intermediate risk: 5-20% 10-year risk  
- High risk: >20% 10-year risk

## Heart Disease Prevention Guidelines

### Lifestyle Modifications:
1. **Diet**: Mediterranean diet, low in saturated fat, high in fiber
2. **Exercise**: At least 150 minutes of moderate-intensity aerobic activity per week
3. **Weight Management**: Maintain BMI between 18.5-24.9
4. **Smoking Cessation**: Complete tobacco avoidance
5. **Alcohol**: Moderate consumption (1 drink/day for women, 2 for men)

### Medication Guidelines:
1. **Statins**: For LDL >190 mg/dL or high cardiovascular risk
2. **ACE Inhibitors/ARBs**: For hypertension or heart failure
3. **Aspirin**: For secondary prevention in established cardiovascular disease
4. **Beta-blockers**: For heart failure or post-myocardial infarction

## American Heart Association Guidelines 2024

### Blood Pressure Targets:
- Normal: <120/80 mmHg
- Elevated: 120-129/<80 mmHg
- Stage 1 Hypertension: 130-139/80-89 mmHg
- Stage 2 Hypertension: ≥140/90 mmHg

### Cholesterol Management:
- Primary prevention: Statin therapy for ASCVD risk ≥7.5%
- Secondary prevention: High-intensity statin therapy
- Target LDL: <70 mg/dL for very high risk patients
`,

  // Diabetes and Metabolic Health
  diabetes: `
# Diabetes and Metabolic Health

## Understanding HbA1c (Glycated Hemoglobin)

### What is HbA1c?
HbA1c, also called glycated hemoglobin, measures your average blood glucose level over the past 2-3 months. It shows the percentage of hemoglobin proteins in your blood that have glucose attached to them.

**Normal Ranges:**
- Normal: Less than 5.7% (39 mmol/mol)
- Prediabetes: 5.7-6.4% (39-47 mmol/mol)
- Diabetes: 6.5% (48 mmol/mol) or higher
- Diabetes management target: Less than 7% (53 mmol/mol) for most adults

**Clinical Significance:**
- Each 1% increase in HbA1c represents approximately 28-30 mg/dL increase in average blood glucose
- HbA1c of 7% correlates to average blood glucose of about 154 mg/dL
- Lower HbA1c reduces risk of diabetes complications

### Relationship Between HbA1c and Average Blood Glucose:
- 5% HbA1c = 97 mg/dL average glucose
- 6% HbA1c = 126 mg/dL average glucose  
- 7% HbA1c = 154 mg/dL average glucose
- 8% HbA1c = 183 mg/dL average glucose
- 9% HbA1c = 212 mg/dL average glucose

## Diabetes Risk Factors and Prevention

### Type 2 Diabetes Risk Factors:
1. **Age**: 45 years or older
2. **Weight**: Overweight (BMI ≥25) or obesity
3. **Family History**: Parent or sibling with diabetes
4. **Physical Inactivity**: Less than 3 times per week
5. **Race/Ethnicity**: African American, Hispanic, Native American, Asian American
6. **Previous Gestational Diabetes**: During pregnancy
7. **Polycystic Ovary Syndrome (PCOS)**
8. **High Blood Pressure**: ≥140/90 mmHg
9. **Abnormal Cholesterol**: HDL <35 mg/dL or triglycerides >250 mg/dL

### American Diabetes Association 2024 Guidelines:

**Screening Recommendations:**
- Adults ≥35 years: Screen every 3 years
- Adults with risk factors: Screen earlier and more frequently
- Pregnant women: Screen for gestational diabetes at 24-28 weeks

**Diagnostic Criteria:**
- Fasting glucose ≥126 mg/dL (7.0 mmol/L)
- 2-hour glucose ≥200 mg/dL (11.1 mmol/L) during OGTT
- HbA1c ≥6.5% (48 mmol/mol)
- Random glucose ≥200 mg/dL (11.1 mmol/L) with symptoms

**Management Targets:**
- HbA1c: <7% for most adults, <6.5% if achieved safely
- Blood Pressure: <130/80 mmHg
- LDL Cholesterol: <100 mg/dL (<70 mg/dL if cardiovascular disease)

## Metabolic Syndrome

### Definition (3+ of the following):
1. **Waist Circumference**: >40 inches (men), >35 inches (women)
2. **Triglycerides**: ≥150 mg/dL
3. **HDL Cholesterol**: <40 mg/dL (men), <50 mg/dL (women)
4. **Blood Pressure**: ≥130/85 mmHg
5. **Fasting Glucose**: ≥100 mg/dL

### Health Implications:
- 2x increased risk of cardiovascular disease
- 5x increased risk of type 2 diabetes
- Increased risk of stroke and kidney disease
`,

  // Laboratory Values and Interpretation
  laboratory: `
# Clinical Laboratory Values and Interpretation

## Complete Blood Count (CBC)

### Red Blood Cell Parameters:
- **Hemoglobin**: Men 14-18 g/dL, Women 12-16 g/dL
- **Hematocrit**: Men 42-52%, Women 37-47%
- **Red Blood Cell Count**: Men 4.7-6.1 million cells/μL, Women 4.2-5.4 million cells/μL
- **Mean Corpuscular Volume (MCV)**: 80-100 fL

### White Blood Cell Parameters:
- **Total WBC Count**: 4,500-11,000 cells/μL
- **Neutrophils**: 1,800-7,800 cells/μL (40-70%)
- **Lymphocytes**: 1,000-4,000 cells/μL (20-40%)
- **Monocytes**: 200-1,000 cells/μL (2-8%)
- **Eosinophils**: 15-500 cells/μL (1-4%)
- **Basophils**: 0-200 cells/μL (0.5-1%)

### Platelet Parameters:
- **Platelet Count**: 150,000-450,000 cells/μL
- **Mean Platelet Volume (MPV)**: 7.5-11.5 fL

## Comprehensive Metabolic Panel (CMP)

### Glucose and Diabetes Markers:
- **Fasting Glucose**: 70-100 mg/dL
- **Random Glucose**: <140 mg/dL
- **HbA1c**: <5.7% (normal), 5.7-6.4% (prediabetes), ≥6.5% (diabetes)

### Kidney Function:
- **Blood Urea Nitrogen (BUN)**: 7-20 mg/dL
- **Creatinine**: Men 0.74-1.35 mg/dL, Women 0.59-1.04 mg/dL
- **eGFR**: >60 mL/min/1.73m² (normal kidney function)
- **BUN/Creatinine Ratio**: 10:1-20:1

### Liver Function:
- **ALT (Alanine Aminotransferase)**: Men <41 U/L, Women <33 U/L
- **AST (Aspartate Aminotransferase)**: Men <40 U/L, Women <32 U/L
- **Total Bilirubin**: 0.3-1.2 mg/dL
- **Alkaline Phosphatase**: 44-147 U/L

### Electrolytes:
- **Sodium**: 136-144 mmol/L
- **Potassium**: 3.5-5.0 mmol/L
- **Chloride**: 98-107 mmol/L
- **CO2**: 22-28 mmol/L

## Cardiac Biomarkers

### Acute Coronary Syndrome:
- **Troponin I**: <0.04 ng/mL (normal), >0.4 ng/mL (myocardial infarction)
- **Troponin T**: <0.01 ng/mL (normal), >0.1 ng/mL (myocardial infarction)
- **CK-MB**: 0-6.3 ng/mL (normal), >6.3 ng/mL (suggestive of MI)

### Heart Failure:
- **BNP (B-type Natriuretic Peptide)**: <100 pg/mL (normal), >400 pg/mL (heart failure)
- **NT-proBNP**: <125 pg/mL (normal), >300 pg/mL (heart failure)

## Thyroid Function Tests

### Primary Thyroid Hormones:
- **TSH (Thyroid Stimulating Hormone)**: 0.27-4.20 mIU/L
- **Free T4 (Thyroxine)**: 12-22 pmol/L
- **Free T3 (Triiodothyronine)**: 3.1-6.8 pmol/L

### Thyroid Antibodies:
- **Anti-TPO**: <34 IU/mL
- **Anti-Thyroglobulin**: <115 IU/mL
- **TSI (Thyroid Stimulating Immunoglobulin)**: <1.3 TSI index

## Inflammatory Markers

### Acute Phase Reactants:
- **ESR (Erythrocyte Sedimentation Rate)**: Men <15 mm/hr, Women <20 mm/hr
- **CRP (C-Reactive Protein)**: <3.0 mg/L
- **hs-CRP (High-sensitivity CRP)**: <1.0 mg/L (low cardiovascular risk)

### Autoimmune Markers:
- **ANA (Antinuclear Antibodies)**: <1:80 (negative)
- **Rheumatoid Factor**: <14 IU/mL
- **Anti-CCP**: <20 units (negative)
`,

  // Treatment Guidelines and Medications
  treatment: `
# Treatment Guidelines and Medication Management

## Cardiovascular Disease Treatment

### Statin Therapy Guidelines (ACC/AHA 2018):

**High-Intensity Statins:**
- Atorvastatin 40-80 mg daily
- Rosuvastatin 20-40 mg daily
- Simvastatin 80 mg daily (avoid due to drug interactions)

**Moderate-Intensity Statins:**
- Atorvastatin 10-20 mg daily
- Rosuvastatin 5-10 mg daily
- Simvastatin 20-40 mg daily
- Pravastatin 40-80 mg daily

**Indications for Statin Therapy:**
1. ASCVD (atherosclerotic cardiovascular disease)
2. LDL ≥190 mg/dL
3. Diabetes mellitus (age 40-75) with LDL 70-189 mg/dL
4. Primary prevention with 10-year ASCVD risk ≥7.5%

### Hypertension Management (AHA 2017):

**First-Line Agents:**
- ACE Inhibitors: Lisinopril, Enalapril, Ramipril
- ARBs: Losartan, Valsartan, Irbesartan  
- Calcium Channel Blockers: Amlodipine, Nifedipine
- Thiazide Diuretics: Hydrochlorothiazide, Chlorthalidone

**Blood Pressure Targets:**
- General population: <130/80 mmHg
- Diabetes or CKD: <130/80 mmHg
- Age ≥65: <130/80 mmHg (if tolerated)

### Heart Failure Treatment (AHA/ACC 2022):

**Stage A (At Risk):**
- Lifestyle modifications
- Risk factor management

**Stage B (Structural Disease, No Symptoms):**
- ACE inhibitor or ARB
- Beta-blocker if prior MI

**Stage C (Symptomatic Heart Failure):**
- ACE inhibitor/ARB or ARNI
- Beta-blocker (carvedilol, metoprolol, bisoprolol)
- Diuretics for fluid retention
- Aldosterone receptor antagonist

**Stage D (Refractory Symptoms):**
- Consider advanced therapies
- Heart transplant evaluation
- Mechanical circulatory support

## Diabetes Management

### Type 2 Diabetes Treatment Algorithm (ADA 2024):

**First-Line Therapy:**
- Metformin 500-2000 mg daily (unless contraindicated)
- Lifestyle modifications (diet, exercise, weight management)

**Second-Line Therapy (if HbA1c >7% after 3 months):**
- SGLT2 inhibitors: Empagliflozin, Dapagliflozin
- GLP-1 agonists: Semaglutide, Liraglutide, Dulaglutide
- DPP-4 inhibitors: Sitagliptin, Linagliptin
- Sulfonylureas: Glipizide, Glyburide (if cost is a concern)

**Injectable Therapies:**
- GLP-1 receptor agonists (preferred if obesity or CVD)
- Insulin (if HbA1c >10% or glucose >300 mg/dL)

### Glucose Monitoring:
- HbA1c every 3-6 months
- Self-monitoring blood glucose for insulin users
- Continuous glucose monitoring when appropriate

### Diabetes Complications Screening:
- **Diabetic Retinopathy**: Annual dilated eye exam
- **Diabetic Nephropathy**: Annual urine microalbumin, eGFR
- **Diabetic Neuropathy**: Annual foot exam, monofilament testing
- **Cardiovascular Disease**: Lipid panel, blood pressure monitoring

## Lipid Management

### Primary Prevention:
- Statin therapy if 10-year ASCVD risk ≥7.5%
- Consider if risk 5-7.5% with risk enhancers
- Target LDL <100 mg/dL

### Secondary Prevention:
- High-intensity statin therapy
- Target LDL <70 mg/dL (<50 mg/dL for very high risk)
- Add ezetimibe if not at goal
- Consider PCSK9 inhibitors for very high risk

### Hypertriglyceridemia:
- Lifestyle modifications first
- If triglycerides >500 mg/dL: fibrates or high-dose omega-3
- If triglycerides 200-499 mg/dL: consider icosapent ethyl

## Medication Interactions and Contraindications

### Statin Interactions:
- **Avoid with**: Gemfibrozil, cyclosporine, HIV protease inhibitors
- **Use caution with**: Amiodarone, verapamil, diltiazem
- **Monitor**: CK levels, liver enzymes

### ACE Inhibitor/ARB Contraindications:
- **Absolute**: Pregnancy, bilateral renal artery stenosis, hyperkalemia
- **Relative**: eGFR <30 mL/min/1.73m², potassium >5.0 mEq/L

### Metformin Contraindications:
- **Absolute**: eGFR <30 mL/min/1.73m², acute heart failure
- **Relative**: Alcohol abuse, liver disease, chronic hypoxemia
`
};

async function populateKnowledgeBase() {
  console.log('Starting knowledge base population...');
  
  try {
    // Store each category of medical knowledge
    for (const [category, content] of Object.entries(medicalKnowledge)) {
      console.log(`Storing ${category} knowledge...`);
      await storeKnowledgeBaseChunks(
        content, 
        `Medical Guidelines - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        category
      );
      console.log(`✓ Completed ${category} knowledge storage`);
    }
    
    console.log('✓ Knowledge base population completed successfully!');
    console.log('The RAG system now has external medical knowledge to reference when answering questions about patient documents.');
    
  } catch (error) {
    console.error('❌ Error populating knowledge base:', error);
    process.exit(1);
  }
  
  console.log('Exiting...');
  process.exit(0);
}

// Run the population script
if (require.main === module) {
  populateKnowledgeBase();
}

module.exports = { populateKnowledgeBase, medicalKnowledge };
