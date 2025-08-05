/**
 * Script to enhance the knowledge base with comprehensive diagnostic criteria
 * This adds specific diagnostic guidelines for cardiac conditions
 */

const { storeKnowledgeBaseChunks } = require('../utils/knowledgeBase');

// Enhanced diagnostic criteria and clinical guidelines
const diagnosticKnowledge = `
# Cardiac Diagnostic Criteria and Clinical Guidelines

## Heart Failure with Preserved Ejection Fraction (HFpEF) Diagnosis

### HFpEF Diagnostic Criteria (ESC/AHA 2024 Guidelines)
HFpEF is diagnosed when patients have:
1. **Clinical symptoms and signs of heart failure**
2. **Preserved ejection fraction (≥50%)**
3. **Evidence of diastolic dysfunction**

### HFpEF Risk Scoring
**HFpEF-Score Components:**
- Age ≥65 years (1 point)
- Obesity (BMI ≥30) (2 points)
- Atrial fibrillation (3 points)
- Pulmonary artery systolic pressure ≥35 mmHg (1 point)
- Echocardiographic diastolic dysfunction grade ≥II (1 point)
- Hypertension (1 point)

**Score Interpretation:**
- **0-1 points**: Low probability of HFpEF
- **2-5 points**: Intermediate probability of HFpEF
- **6-9 points**: High probability of HFpEF

### Clinical Significance of HFpEF Score = 4
A HFpEF score of 4 indicates **intermediate probability** of heart failure with preserved ejection fraction. This requires:
- **Further evaluation** with comprehensive echocardiography
- **Exercise testing** or stress testing
- **BNP/NT-proBNP measurement**
- **Assessment for underlying causes**

## Diastolic Dysfunction and Impaired Relaxation

### Diastolic Dysfunction Grading
**Grade I (Mild) - Impaired Relaxation:**
- E/A ratio <0.8
- Septal e' <7 cm/s or lateral e' <10 cm/s
- LA volume index normal (<34 mL/m²)
- **Clinical significance**: Early stage of diastolic dysfunction, often asymptomatic

**Grade II (Moderate) - Pseudonormal:**
- E/A ratio 0.8-2.0
- Average E/e' 9-14
- LA volume index 34-48 mL/m²

**Grade III (Severe) - Restrictive:**
- E/A ratio ≥2.0
- Average E/e' ≥15
- LA volume index >48 mL/m²

### Clinical Implications of Mild Impaired Relaxation (DDIM)
**Mild diastolic dysfunction suggests:**
- **Early heart disease** - often the first sign of cardiac abnormality
- **Increased risk** of developing symptomatic heart failure
- **Associated conditions** - hypertension, diabetes, obesity
- **Need for risk factor modification**

## Aortic Valve Stenosis (AS) Diagnostic Criteria

### Severity Classification
**Mild AS:**
- Aortic jet velocity 2.6-2.9 m/s
- Mean gradient 20-39 mmHg
- Aortic valve area >1.5 cm²

**Moderate AS:**
- Aortic jet velocity 3.0-3.9 m/s
- Mean gradient 40-64 mmHg
- Aortic valve area 1.0-1.5 cm²

**Severe AS:**
- Aortic jet velocity ≥4.0 m/s
- Mean gradient ≥65 mmHg
- Aortic valve area <1.0 cm²

### Clinical Significance of Abnormal AS
**When AS is marked as "Abnormal":**
- Requires **quantitative assessment** via echocardiography
- **Monitor for symptoms**: chest pain, dyspnea, syncope
- **Progressive condition** - worsens over time
- **Potential need for intervention** depending on severity

## Myocardial Perfusion and Performance Abnormalities

### Systolic Performance Index (SPI) Abnormalities
**Abnormal SPI indicates:**
- **Reduced contractility** of the heart muscle
- **Possible coronary artery disease**
- **Need for stress testing** or coronary imaging
- **Risk stratification** for cardiovascular events

### Myocardial Perfusion Index (MPI) Abnormalities
**Abnormal MPI suggests:**
- **Reduced blood flow** to heart muscle
- **Possible coronary artery disease**
- **Ischemia** during stress or at rest
- **Indication for coronary angiography** if clinically indicated

## Diagnostic Recommendations Based on Combined Findings

### For Patients with HFpEF Score = 4 + Mild DDIM + Abnormal AS:
**Immediate Actions:**
1. **Comprehensive echocardiography** with Doppler studies
2. **BNP or NT-proBNP measurement**
3. **Exercise stress test** or cardiopulmonary exercise testing
4. **Assessment for coronary artery disease**

**Follow-up Recommendations:**
1. **Repeat echocardiography** in 6-12 months
2. **Optimize cardiovascular risk factors**
3. **Consider cardiology consultation**
4. **Monitor for symptom development**

### Associated Risk Factors to Address
**Modifiable Risk Factors:**
- **Obesity (BMI ≥30)**: Weight reduction goal 5-10%
- **Hypertension**: Target <130/80 mmHg
- **Diabetes**: HbA1c <7%
- **Dyslipidemia**: LDL <100 mg/dL (or <70 if high risk)

## Clinical Guidelines for Patient Counseling

### What These Findings Mean for the Patient
**Reassuring Points:**
- These are **early findings** that can be managed
- **Lifestyle modifications** can significantly improve outcomes
- **Regular monitoring** can prevent progression
- Many patients with these findings **live normal lives** with proper management

**Action Items for Patient:**
1. **Lifestyle modifications**: diet, exercise, weight management
2. **Regular medical follow-up** with primary care and cardiology
3. **Symptom awareness**: report chest pain, shortness of breath, fatigue
4. **Medication compliance** if prescribed
5. **Risk factor optimization**: blood pressure, diabetes, cholesterol control

### Prognosis and Outlook
**With proper management:**
- **Excellent long-term prognosis** for mild findings
- **Prevention of progression** to symptomatic heart failure
- **Maintained quality of life** with appropriate care
- **Low risk of immediate cardiovascular events**
`;

async function enhanceDiagnosticKnowledge() {
  try {
    console.log("Enhancing knowledge base with diagnostic criteria...");
    
    await storeKnowledgeBaseChunks(
      diagnosticKnowledge,
      "Clinical Guidelines 2024",
      "diagnostic_criteria"
    );
    
    console.log("Diagnostic knowledge enhancement completed successfully!");
    
  } catch (error) {
    console.error("Error enhancing diagnostic knowledge:", error);
  }
}

// Run the enhancement
enhanceDiagnosticKnowledge();
