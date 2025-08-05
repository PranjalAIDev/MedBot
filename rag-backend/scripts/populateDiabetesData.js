/**
 * Script to populate diabetes-specific medical information
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { chunkText, cleanText, extractMedicalSections } = require('../utils/textProcessing');
const { storeChunksWithEmbeddings } = require('../utils/embeddings');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "medBookRAG";

const diabetesData = `
# Comprehensive Diabetes Diagnostic Criteria and Management Guidelines

## American Diabetes Association (ADA) 2024 Standards

### Type 1 Diabetes Diagnostic Criteria
Type 1 diabetes is characterized by absolute insulin deficiency due to autoimmune destruction of pancreatic beta cells.

#### Diagnostic Criteria:
- Random plasma glucose ≥200 mg/dL (11.1 mmol/L) with classic symptoms of hyperglycemia
- Fasting plasma glucose ≥126 mg/dL (7.0 mmol/L) on two separate occasions
- 2-hour plasma glucose ≥200 mg/dL (11.1 mmol/L) during 75g oral glucose tolerance test
- HbA1c ≥6.5% (48 mmol/mol)

#### Additional Markers:
- C-peptide levels: typically low (<0.6 ng/mL)
- Autoantibodies: GAD, IA-2, ZnT8, IAA
- Age at onset: typically <30 years, but can occur at any age

### Type 2 Diabetes Diagnostic Criteria
Type 2 diabetes is characterized by insulin resistance and progressive beta-cell dysfunction.

#### Same glucose criteria as Type 1, but with:
- Typically older age at onset (>40 years)
- Associated with obesity and metabolic syndrome
- Family history often positive
- C-peptide levels: normal or elevated initially

### Prediabetes (Intermediate Hyperglycemia)
#### Criteria (any one of the following):
- Impaired Fasting Glucose (IFG): 100-125 mg/dL (5.6-6.9 mmol/L)
- Impaired Glucose Tolerance (IGT): 2-hour OGTT 140-199 mg/dL (7.8-11.0 mmol/L)
- HbA1c: 5.7-6.4% (39-46 mmol/mol)

#### Risk Factors for Progression:
- BMI ≥25 kg/m² (≥23 kg/m² in Asian Americans)
- Physical inactivity
- First-degree relative with diabetes
- High-risk ethnicity (African American, Latino, Native American, Asian American, Pacific Islander)
- History of gestational diabetes
- Hypertension (≥140/90 mmHg)
- HDL cholesterol <35 mg/dL and/or triglycerides >250 mg/dL
- PCOS
- HbA1c ≥5.7%, IGT, or IFG on previous testing

### Gestational Diabetes Mellitus (GDM)
#### One-Step Approach (75g OGTT at 24-28 weeks):
- Fasting: ≥92 mg/dL (5.1 mmol/L)
- 1-hour: ≥180 mg/dL (10.0 mmol/L)
- 2-hour: ≥153 mg/dL (8.5 mmol/L)

#### Two-Step Approach:
Step 1: 50g glucose challenge test
- If 1-hour glucose ≥140 mg/dL (or ≥130 mg/dL for higher sensitivity)
Step 2: 100g OGTT with Carpenter-Coustan criteria

### MODY (Maturity-Onset Diabetes of the Young)
#### Clinical Features:
- Family history of diabetes in multiple generations
- Age at onset typically <25 years
- Normal BMI
- Negative pancreatic autoantibodies
- Significant endogenous insulin production

## Diabetes Complications and Screening

### Diabetic Nephropathy
#### Screening Recommendations:
- Annual screening starting 5 years after T1DM diagnosis
- Annual screening at T2DM diagnosis
- Urine albumin-to-creatinine ratio (UACR)
- Serum creatinine for eGFR calculation

#### Classification:
- Normal: UACR <30 mg/g
- Microalbuminuria: UACR 30-299 mg/g
- Macroalbuminuria: UACR ≥300 mg/g

#### eGFR Stages:
- Stage 1: ≥90 mL/min/1.73m² (normal/high)
- Stage 2: 60-89 mL/min/1.73m² (mildly decreased)
- Stage 3a: 45-59 mL/min/1.73m² (mild-moderate decrease)
- Stage 3b: 30-44 mL/min/1.73m² (moderate-severe decrease)
- Stage 4: 15-29 mL/min/1.73m² (severely decreased)
- Stage 5: <15 mL/min/1.73m² (kidney failure)

### Diabetic Retinopathy
#### Screening Recommendations:
- T1DM: within 5 years of diagnosis, then annually
- T2DM: at diagnosis, then annually
- Pregnancy: before conception, first trimester, then as directed

#### Classification:
- No retinopathy
- Mild nonproliferative (microaneurysms only)
- Moderate nonproliferative (more than microaneurysms)
- Severe nonproliferative (extensive retinal changes)
- Proliferative diabetic retinopathy

### Diabetic Neuropathy
#### Screening Methods:
- 10g monofilament testing
- Vibration perception threshold
- Ankle reflexes
- Symptoms assessment

#### Types:
- Distal symmetric sensorimotor polyneuropathy (most common)
- Autonomic neuropathy
- Focal/multifocal neuropathy

## Laboratory Values and Monitoring

### Glycemic Targets
#### HbA1c Goals:
- General adult population: <7.0% (53 mmol/mol)
- More stringent: <6.5% (48 mmol/mol) if achievable without hypoglycemia
- Less stringent: <8.0% (64 mmol/mol) for:
  - Limited life expectancy
  - Extensive comorbidities
  - History of severe hypoglycemia
  - Advanced microvascular complications

#### Glucose Targets:
- Preprandial: 80-130 mg/dL (4.4-7.2 mmol/L)
- Peak postprandial: <180 mg/dL (10.0 mmol/L)

### Other Important Markers
#### Insulin and C-peptide:
- Fasting insulin: 2.6-24.9 μIU/mL
- C-peptide: 1.1-4.4 ng/mL
- HOMA-IR: <2.5 (normal insulin sensitivity)

#### Autoantibodies (Type 1 DM):
- GAD antibodies
- IA-2 antibodies
- ZnT8 antibodies
- Insulin autoantibodies (IAA)

## Cardiovascular Risk in Diabetes

### ASCVD Risk Assessment
#### High-Risk Features:
- Duration of diabetes ≥10 years (T2DM) or ≥20 years (T1DM)
- Albuminuria
- eGFR <60 mL/min/1.73m²
- Retinopathy
- Neuropathy
- Ankle-brachial index <0.9

#### Lipid Targets in Diabetes:
- LDL cholesterol: <100 mg/dL (general), <70 mg/dL (very high risk)
- HDL cholesterol: >40 mg/dL (men), >50 mg/dL (women)
- Triglycerides: <150 mg/dL
- Non-HDL cholesterol: <130 mg/dL (general), <100 mg/dL (very high risk)

### Blood Pressure Targets
- <140/90 mmHg (general)
- <130/80 mmHg if tolerated and at high cardiovascular risk

## Medication Guidelines

### Metformin
#### Indications:
- First-line therapy for T2DM unless contraindicated
- Can be considered in prediabetes

#### Contraindications:
- eGFR <30 mL/min/1.73m²
- Severe liver disease
- Unstable heart failure
- Severe infection or dehydration

### GLP-1 Receptor Agonists
#### Preferred in patients with:
- Established ASCVD
- Heart failure
- Chronic kidney disease
- Need for weight loss

#### Examples and CV benefits:
- Liraglutide (Victoza): LEADER trial
- Semaglutide (Ozempic): SUSTAIN-6 trial
- Dulaglutide (Trulicity): REWIND trial

### SGLT-2 Inhibitors
#### Preferred in patients with:
- Heart failure with reduced ejection fraction
- Chronic kidney disease
- Need for weight loss

#### Warnings:
- Diabetic ketoacidosis risk
- Genital mycotic infections
- Volume depletion
- Fournier's gangrene (rare)

### Insulin Therapy
#### Indications for initiation:
- HbA1c >10% at diagnosis
- Blood glucose >300 mg/dL with symptoms
- HbA1c >7% despite optimal oral therapy

#### Types:
- Rapid-acting: lispro, aspart, glulisine
- Short-acting: regular insulin
- Intermediate-acting: NPH
- Long-acting: glargine, detemir, degludec

## Special Populations

### Pregnancy and Diabetes
#### Preconception counseling
- HbA1c target: <6.5% if achievable without hypoglycemia
- Folic acid supplementation
- ACE inhibitor/ARB discontinuation

#### Gestational diabetes management
- Lifestyle modifications first
- Insulin if inadequate glycemic control
- Metformin may be used if insulin refused

### Pediatric Diabetes
#### T1DM management in children
- HbA1c target: <7.5% for most children
- Continuous glucose monitoring recommended
- Insulin pump therapy consideration

#### T2DM in youth
- Increasing prevalence
- More aggressive than adult-onset
- Metformin first-line, insulin if severe
`;

async function populateDiabetesData() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db(dbName);
    
    const cleanedText = cleanText(diabetesData);
    const sections = extractMedicalSections(cleanedText);
    const chunks = chunkText(cleanedText, 1000, 200);
    
    const document = {
      fileName: "Diabetes_Diagnostic_Guidelines.pdf",
      uploadDate: new Date(),
      content: cleanedText,
      sections: sections,
      chunks: chunks.map((chunk, index) => ({
        id: index,
        content: chunk.content,
      })),
      medicalCategories: ['diabetes', 'diagnostic_criteria', 'endocrinology', 'laboratory', 'complications']
    };
    
    const result = await db.collection("documents").insertOne(document);
    console.log(`Diabetes document inserted with ID: ${result.insertedId}`);
    
    await storeChunksWithEmbeddings(document, chunks, result.insertedId.toString());
    
    console.log("Diabetes data successfully populated!");
    
  } catch (error) {
    console.error("Error populating diabetes data:", error);
  } finally {
    await client.close();
  }
}

populateDiabetesData();
