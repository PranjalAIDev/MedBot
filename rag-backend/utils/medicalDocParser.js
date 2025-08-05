/**
 * Medical Document Parser
 * Specialized parser for extracting structured data from medical documents
 */

/**
 * Extract medical test results from text using regex patterns
 * @param {string} text - The document text
 * @returns {Object} - Extracted test results with values and ranges
 */
function extractTestResults(text) {
  // Initialize results object
  const results = {};

  // Define regex patterns for comprehensive cardiovascular medical tests
  const patterns = {
    // Existing basic patterns
    hsCRP: /hs-?CRP\s*(?:\(mg\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/[lL])?/i,
    hbA1c: /(?:HbA1c|A1c|Hemoglobin\s*A1c)\s*(?:\(%\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:%)?/i,
    triglycerides: /(?:triglycerides|TG)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    cholesterol: /(?:cholesterol|total\s*cholesterol)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    hdl: /(?:HDL|HDL-C|high-density\s*lipoprotein)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    ldl: /(?:LDL|LDL-C|low-density\s*lipoprotein)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,

    // Cardiac Biomarkers
    troponinI: /(?:troponin\s*I|TNI|cTnI|cardiac\s*troponin\s*I)\s*(?:\(ng\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/m[lL])?/i,
    troponinT: /(?:troponin\s*T|TNT|cTnT|cardiac\s*troponin\s*T)\s*(?:\(ng\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/m[lL])?/i,
    hsTroponinI: /(?:hs-?troponin\s*I|hs-?TNI|hs-?cTnI)\s*(?:\(ng\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/m[lL])?/i,
    hsTroponinT: /(?:hs-?troponin\s*T|hs-?TNT|hs-?cTnT)\s*(?:\(ng\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/m[lL])?/i,
    ckMB: /(?:CK-?MB|creatine\s*kinase\s*MB)\s*(?:\(ng\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/m[lL])?/i,
    myoglobin: /myoglobin\s*(?:\(ng\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/m[lL])?/i,

    // Heart Failure Biomarkers
    bnp: /(?:BNP|B-type\s*natriuretic\s*peptide)\s*(?:\(pg\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:pg\/m[lL])?/i,
    ntProBNP: /(?:NT-?proBNP|N-terminal\s*pro\s*BNP)\s*(?:\(pg\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:pg\/m[lL])?/i,

    // Advanced Lipid Panel
    nonHdlCholesterol: /(?:non-?HDL\s*cholesterol|non\s*HDL-C)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    apolipoproteinA1: /(?:apolipoprotein\s*A1|apo\s*A1|apoA1)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    apolipoproteinB: /(?:apolipoprotein\s*B|apo\s*B|apoB)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    lipoproteinA: /(?:lipoprotein\s*\(a\)|Lp\(a\))\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,

    // Inflammatory Markers
    crp: /(?:CRP|C-reactive\s*protein)\s*(?:\(mg\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/[lL])?/i,
    homocysteine: /homocysteine\s*(?:\(μmol\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:μmol\/[lL])?/i,
    fibrinogen: /fibrinogen\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,

    // Coagulation Studies
    pt: /(?:PT|prothrombin\s*time)\s*(?:\(sec(?:onds?)?\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:sec(?:onds?)?)?/i,
    inr: /INR\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)/i,
    aptt: /(?:aPTT|activated\s*partial\s*thromboplastin\s*time)\s*(?:\(sec(?:onds?)?\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:sec(?:onds?)?)?/i,
    dDimer: /(?:D-?dimer)\s*(?:\(μg\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:μg\/m[lL])?/i,

    // Electrolytes and Metabolic Panel
    sodium: /(?:sodium|Na\+?)\s*(?:\(mEq\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mEq\/[lL])?/i,
    potassium: /(?:potassium|K\+?)\s*(?:\(mEq\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mEq\/[lL])?/i,
    chloride: /(?:chloride|Cl-?)\s*(?:\(mEq\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mEq\/[lL])?/i,
    magnesium: /magnesium\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    calcium: /(?:calcium|Ca\+?\+?)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    phosphorus: /phosphorus\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,

    // Renal Function
    creatinine: /creatinine\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    bun: /(?:BUN|blood\s*urea\s*nitrogen)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    egfr: /(?:eGFR|estimated\s*GFR)\s*(?:\(mL\/min\/1\.73m²?\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mL\/min\/1\.73m²?)?/i,

    // Liver Function
    alt: /(?:ALT|alanine\s*aminotransferase)\s*(?:\(U\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:U\/[lL])?/i,
    ast: /(?:AST|aspartate\s*aminotransferase)\s*(?:\(U\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:U\/[lL])?/i,
    totalBilirubin: /(?:total\s*bilirubin|bilirubin)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    albumin: /albumin\s*(?:\(g\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:g\/d[lL])?/i,

    // Thyroid Function
    tsh: /(?:TSH|thyroid\s*stimulating\s*hormone)\s*(?:\(mIU\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mIU\/[lL])?/i,
    freeT4: /(?:free\s*T4|FT4)\s*(?:\(ng\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/d[lL])?/i,
    freeT3: /(?:free\s*T3|FT3)\s*(?:\(pg\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:pg\/m[lL])?/i,

    // Complete Blood Count
    hemoglobin: /(?:hemoglobin|Hgb|Hb)\s*(?:\(g\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:g\/d[lL])?/i,
    hematocrit: /(?:hematocrit|Hct)\s*(?:\(%\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:%)?/i,
    wbc: /(?:WBC|white\s*blood\s*cell\s*count)\s*(?:\(×?10³?\/μ[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:×?10³?\/μ[lL])?/i,
    platelets: /(?:platelets|PLT)\s*(?:\(×?10³?\/μ[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:×?10³?\/μ[lL])?/i,

    // Blood Glucose and Diabetes
    glucose: /(?:glucose|blood\s*glucose)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,
    fastingGlucose: /(?:fasting\s*glucose|FPG)\s*(?:\(mg\/d[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/d[lL])?/i,

    // Cardiac Specific Additional Tests
    ldh: /(?:LDH|lactate\s*dehydrogenase)\s*(?:\(U\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:U\/[lL])?/i,
    totalCk: /(?:total\s*CK|creatine\s*kinase)\s*(?:\(U\/[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:U\/[lL])?/i,

    // Vital Signs
    systolicBP: /(?:systolic\s*(?:blood\s*)?pressure|SBP)\s*(?:\(mmHg\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mmHg)?/i,
    diastolicBP: /(?:diastolic\s*(?:blood\s*)?pressure|DBP)\s*(?:\(mmHg\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:mmHg)?/i,
    heartRate: /(?:heart\s*rate|HR|pulse)\s*(?:\(bpm\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:bpm)?/i,

    // Additional Cardiac Markers
    galectin3: /galectin-?3\s*(?:\(ng\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/m[lL])?/i,
    st2: /(?:ST2|sST2)\s*(?:\(ng\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/m[lL])?/i,
    gdf15: /(?:GDF-?15|growth\s*differentiation\s*factor\s*15)\s*(?:\(pg\/m[lL]\))?\s*(?:level|value|result)?s?(?:\s*(?:is|was|of|:))?\s*([0-9]+\.?[0-9]*)\s*(?:pg\/m[lL])?/i
  };

  // Extract values using regex patterns
  for (const [test, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      results[test] = parseFloat(match[1]);
    }
  }

  // Enhanced patterns for chart-based values with arrows/indicators
  // These patterns look for test names followed by values in boxes or with arrows
  const chartPatterns = [
    // hs-CRP patterns for chart-based values
    {
      test: 'hsCRP',
      patterns: [
        /hs-?CRP\s*\(mg\/[lL]\)[\s\S]{0,100}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,30}?([0-9]+\.?[0-9]*)/i,
        /hs-?CRP[\s\S]{0,50}?([0-9]+\.?[0-9]*)[\s\S]{0,20}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)/i,
        /([0-9]+\.?[0-9]*)[\s\S]{0,30}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,50}?hs-?CRP/i,
      ]
    },

    // HbA1c patterns
    {
      test: 'hbA1c',
      patterns: [
        /HbA1c\s*\(%\)[\s\S]{0,100}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,30}?([0-9]+\.?[0-9]*)/i,
        /HbA1c[\s\S]{0,50}?([0-9]+\.?[0-9]*)[\s\S]{0,20}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)/i,
        /([0-9]+\.?[0-9]*)[\s\S]{0,30}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,50}?HbA1c/i,
      ]
    },

    // Triglycerides patterns
    {
      test: 'triglycerides',
      patterns: [
        /Triglycerides\s*\(mg\/d[lL]\)[\s\S]{0,100}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,30}?([0-9]+\.?[0-9]*)/i,
        /Triglycerides[\s\S]{0,50}?([0-9]+\.?[0-9]*)[\s\S]{0,20}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)/i,
        /([0-9]+\.?[0-9]*)[\s\S]{0,30}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,50}?Triglycerides/i,
      ]
    },

    // Cholesterol patterns
    {
      test: 'cholesterol',
      patterns: [
        /Cholesterol\s*\(mg\/d[lL]\)[\s\S]{0,100}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,30}?([0-9]+\.?[0-9]*)/i,
        /Cholesterol[\s\S]{0,50}?([0-9]+\.?[0-9]*)[\s\S]{0,20}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)/i,
        /([0-9]+\.?[0-9]*)[\s\S]{0,30}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,50}?Cholesterol/i,
      ]
    },

    // HDL patterns
    {
      test: 'hdl',
      patterns: [
        /HDL\s*\(mg\/d[lL]\)[\s\S]{0,100}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,30}?([0-9]+\.?[0-9]*)/i,
        /HDL[\s\S]{0,50}?([0-9]+\.?[0-9]*)[\s\S]{0,20}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)/i,
        /([0-9]+\.?[0-9]*)[\s\S]{0,30}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,50}?HDL/i,
      ]
    },

    // LDL patterns
    {
      test: 'ldl',
      patterns: [
        /LDL\s*\(mg\/d[lL]\)[\s\S]{0,100}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,30}?([0-9]+\.?[0-9]*)/i,
        /LDL[\s\S]{0,50}?([0-9]+\.?[0-9]*)[\s\S]{0,20}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)/i,
        /([0-9]+\.?[0-9]*)[\s\S]{0,30}?(?:box|square|bracket|chart|arrow|→|↓|↑|▼|▲|►)[\s\S]{0,50}?LDL/i,
      ]
    }
  ];

  // Check for chart-based patterns
  for (const { test, patterns } of chartPatterns) {
    // Only check if we haven't already found a value for this test
    if (!results[test]) {
      // Check each pattern
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const value = parseFloat(match[1]);
          if (!isNaN(value)) {
            console.log(`Found chart-based match for ${test}: ${value}`);
            results[test] = value;
            break;
          }
        }
      }
    }
  }

  // Look for specific visual indicators of test values
  // This is particularly important for chart-based reports
  const visualIndicators = [
    // Look for test names followed by arrows and values
    { regex: /hs-?CRP\s*\(mg\/[lL]\)[\s\S]{0,200}?(?:→|↓|↑|▼|▲|►|arrow)[\s\S]{0,50}?([0-9]+\.?[0-9]*)/i, test: 'hsCRP' },
    { regex: /HbA1c\s*\(%\)[\s\S]{0,200}?(?:→|↓|↑|▼|▲|►|arrow)[\s\S]{0,50}?([0-9]+\.?[0-9]*)/i, test: 'hbA1c' },
    { regex: /Triglycerides\s*\(mg\/d[lL]\)[\s\S]{0,200}?(?:→|↓|↑|▼|▲|►|arrow)[\s\S]{0,50}?([0-9]+\.?[0-9]*)/i, test: 'triglycerides' },
    { regex: /Cholesterol\s*\(mg\/d[lL]\)[\s\S]{0,200}?(?:→|↓|↑|▼|▲|►|arrow)[\s\S]{0,50}?([0-9]+\.?[0-9]*)/i, test: 'cholesterol' },
    { regex: /HDL\s*\(mg\/d[lL]\)[\s\S]{0,200}?(?:→|↓|↑|▼|▲|►|arrow)[\s\S]{0,50}?([0-9]+\.?[0-9]*)/i, test: 'hdl' },
    { regex: /LDL\s*\(mg\/d[lL]\)[\s\S]{0,200}?(?:→|↓|↑|▼|▲|►|arrow)[\s\S]{0,50}?([0-9]+\.?[0-9]*)/i, test: 'ldl' },

    // Look for values in boxes/brackets near test names
    { regex: /hs-?CRP[\s\S]{0,100}?\[([0-9]+\.?[0-9]*)\]/i, test: 'hsCRP' },
    { regex: /hs-?CRP[\s\S]{0,100}?\(([0-9]+\.?[0-9]*)\)/i, test: 'hsCRP' },
    { regex: /hs-?CRP[\s\S]{0,100}?(?:box|square|bracket|chart)[\s\S]{0,30}?([0-9]+\.?[0-9]*)/i, test: 'hsCRP' },

    // Look for values with units near test names
    { regex: /([0-9]+\.?[0-9]*)\s*mg\/[lL][\s\S]{0,50}?hs-?CRP/i, test: 'hsCRP' },
    { regex: /([0-9]+\.?[0-9]*)\s*%[\s\S]{0,50}?HbA1c/i, test: 'hbA1c' },
  ];

  // Check for visual indicators
  for (const { regex, test } of visualIndicators) {
    if (!results[test]) {
      const match = text.match(regex);
      if (match && match[1]) {
        const value = parseFloat(match[1]);
        if (!isNaN(value)) {
          console.log(`Found visual indicator for ${test}: ${value}`);
          results[test] = value;
        }
      }
    }
  }

  // Extract normal ranges from text and visual elements
  const rangePatterns = {
    // Text-based range patterns
    hsCRP: [
      /hs-?CRP[\s\S]{0,100}?normal\s*range[\s\S]{0,30}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)/i,
      /hs-?CRP[\s\S]{0,100}?(?:0|0\.0)\s*-\s*([0-9]+\.?[0-9]*)/i, // Range format: 0-3
      /normal[\s\S]{0,50}?(?:0|0\.0)\s*-\s*([0-9]+\.?[0-9]*)[\s\S]{0,50}?hs-?CRP/i
    ],
    hbA1c: [
      /HbA1c[\s\S]{0,100}?normal\s*range[\s\S]{0,30}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)/i,
      /HbA1c[\s\S]{0,100}?([0-9]+\.?[0-9]*)\s*-\s*([0-9]+\.?[0-9]*)/i, // Range format: 4-6.5
      /normal[\s\S]{0,50}?([0-9]+\.?[0-9]*)\s*-\s*([0-9]+\.?[0-9]*)[\s\S]{0,50}?HbA1c/i
    ],
    triglycerides: [
      /triglycerides[\s\S]{0,100}?normal\s*range[\s\S]{0,30}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)/i,
      /triglycerides[\s\S]{0,100}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)/i,
      /normal[\s\S]{0,50}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)[\s\S]{0,50}?triglycerides/i
    ],
    cholesterol: [
      /cholesterol[\s\S]{0,100}?normal\s*range[\s\S]{0,30}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)/i,
      /cholesterol[\s\S]{0,100}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)/i,
      /normal[\s\S]{0,50}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)[\s\S]{0,50}?cholesterol/i
    ],
    hdl: [
      /HDL[\s\S]{0,100}?normal\s*range[\s\S]{0,30}?(?:>|greater than|above)\s*([0-9]+\.?[0-9]*)/i,
      /HDL[\s\S]{0,100}?(?:>|greater than|above|≥|>=)\s*([0-9]+\.?[0-9]*)/i,
      /normal[\s\S]{0,50}?(?:>|greater than|above|≥|>=)\s*([0-9]+\.?[0-9]*)[\s\S]{0,50}?HDL/i
    ],
    ldl: [
      /LDL[\s\S]{0,100}?normal\s*range[\s\S]{0,30}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)/i,
      /LDL[\s\S]{0,100}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)/i,
      /normal[\s\S]{0,50}?(?:<|less than|under)\s*([0-9]+\.?[0-9]*)[\s\S]{0,50}?LDL/i
    ]
  };

  // Visual range patterns from charts/graphs
  const visualRanges = {
    hsCRP: { min: 0, max: 3 },
    hbA1c: { min: 4, max: 6.5 },
    triglycerides: { min: 0, max: 150 },
    cholesterol: { min: 0, max: 200 },
    hdl: { min: 40, max: 100 },
    ldl: { min: 0, max: 130 }
  };

  // Store ranges
  const ranges = {};

  // Extract ranges from text
  for (const [test, patterns] of Object.entries(rangePatterns)) {
    // Try each pattern for this test
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        if (pattern.toString().includes('-') && match[2]) {
          // Handle range format (min-max)
          ranges[test] = {
            min: parseFloat(match[1]),
            max: parseFloat(match[2])
          };
        } else {
          // Handle threshold format (< X or > X)
          const threshold = parseFloat(match[1]);
          if (pattern.toString().includes('>|greater|above|≥|>=')) {
            ranges[test] = { min: threshold };
          } else {
            ranges[test] = { max: threshold };
          }
        }
        break;
      }
    }

    // If no range found in text, use visual ranges from charts
    if (!ranges[test] && visualRanges[test]) {
      ranges[test] = visualRanges[test];
    }
  }

  // Special case for visual indicators in charts/graphs
  // Look for specific markers like arrows with values
  const arrowPattern = /([0-9]+\.?[0-9]*)\s*(?:▼|▲|►|↓|↑|→)/g;
  const arrowMatches = [...text.matchAll(arrowPattern)];

  if (arrowMatches.length > 0) {
    // Process potential visual indicators
    arrowMatches.forEach(match => {
      const value = parseFloat(match[1]);
      // Check if this value appears near a test name
      const context = text.substring(Math.max(0, match.index - 50), match.index + 50);

      if (context.match(/hs-?CRP/i) && !results.hsCRP) {
        results.hsCRP = value;
      } else if (context.match(/HbA1c/i) && !results.hbA1c) {
        results.hbA1c = value;
      } else if (context.match(/triglycerides/i) && !results.triglycerides) {
        results.triglycerides = value;
      } else if (context.match(/cholesterol/i) && !results.cholesterol) {
        results.cholesterol = value;
      } else if (context.match(/HDL/i) && !results.hdl) {
        results.hdl = value;
      } else if (context.match(/LDL/i) && !results.ldl) {
        results.ldl = value;
      }
    });
  }

  // Enhanced detection for chart-based values
  // This section looks for specific visual indicators without hardcoded values

  // Look for values in charts with visual elements
  if (text.includes('CARDIO HEALTH TEST REPORT') || text.includes('YOUR TEST RESULTS')) {
    console.log('Detected chart-based medical report - searching for visual indicators');

    // Generic patterns to find values near test names in chart format
    const chartValuePatterns = [
      { regex: /hs-?CRP[\s\S]{0,100}?(?:0|0\.0)\s*-\s*3[\s\S]{0,100}?([0-9]+\.?[0-9]*)/i, test: 'hsCRP' },
      { regex: /HbA1c[\s\S]{0,100}?4\s*-\s*6\.5[\s\S]{0,100}?([0-9]+\.?[0-9]*)/i, test: 'hbA1c' },
      { regex: /Triglycerides[\s\S]{0,100}?(?:<|less than)\s*150[\s\S]{0,100}?([0-9]+\.?[0-9]*)/i, test: 'triglycerides' },
      { regex: /Cholesterol[\s\S]{0,100}?(?:<|less than)\s*200[\s\S]{0,100}?([0-9]+\.?[0-9]*)/i, test: 'cholesterol' },
      { regex: /HDL[\s\S]{0,100}?(?:>|greater than|≥)\s*40[\s\S]{0,100}?([0-9]+\.?[0-9]*)/i, test: 'hdl' },
      { regex: /LDL[\s\S]{0,100}?(?:<|less than)\s*130[\s\S]{0,100}?([0-9]+\.?[0-9]*)/i, test: 'ldl' },
    ];

    // Apply chart value patterns only if we haven't found the values yet
    for (const { regex, test } of chartValuePatterns) {
      if (!results[test]) {
        const match = text.match(regex);
        if (match && match[1]) {
          const value = parseFloat(match[1]);
          if (!isNaN(value)) {
            console.log(`Found chart value for ${test}: ${value}`);
            results[test] = value;
          }
        }
      }
    }
  }

  return {
    results,
    ranges
  };
}

/**
 * Validate test results against expected ranges and formats
 * @param {Object} results - The extracted test results
 * @returns {Object} - Validated test results
 */
function validateTestResults(results) {
  const validated = { ...results };

  // Define typical ranges for common tests
  const typicalRanges = {
    hsCRP: { min: 0, max: 10 },
    hbA1c: { min: 4, max: 15 },
    triglycerides: { min: 40, max: 500 },
    cholesterol: { min: 100, max: 300 },
    hdl: { min: 20, max: 100 },
    ldl: { min: 40, max: 200 }
  };

  // Validate each result against typical ranges
  for (const [test, value] of Object.entries(validated.results)) {
    if (typicalRanges[test]) {
      const { min, max } = typicalRanges[test];

      // If value is outside typical range, warn but don't auto-correct unless clearly wrong
      if (value < min || value > max) {
        console.warn(`Warning: ${test} value ${value} is outside typical range (${min}-${max})`);
        
        // Only correct obviously wrong OCR values (extreme outliers)
        if (value < min / 10 || value > max * 10) {
          console.warn(`Extreme outlier detected for ${test}: ${value}. This may be an OCR error.`);
          // Don't auto-correct, just flag for review
        }
      }
    }
  }

  // Only correct clear OCR errors, not actual patient values
  // Remove specific value corrections that were hardcoded

  return validated;
}

/**
 * Extract medical test results from document text
 * @param {string} text - The document text
 * @returns {Object} - Structured test results
 */
function parseTestResults(text) {
  // Extract raw results
  const extractedData = extractTestResults(text);

  // Add the original text to help with validation
  extractedData.reportText = text;

  // Validate and correct results
  const validatedData = validateTestResults(extractedData);

  // Format results for display
  const formattedResults = formatTestResults(validatedData);

  // Add additional information about the report
  formattedResults.reportInfo = {
    type: text.includes('CARDIO HEALTH TEST REPORT') ? 'Cardio Health Test Report' : 'Medical Test Report',
    hasVisualElements: text.includes('YOUR TEST RESULTS') || text.match(/(?:→|↓|↑|▼|▲|►|arrow)/i) ? true : false,
    detectedTests: Object.keys(formattedResults).filter(key => key !== 'reportInfo')
  };

  return formattedResults;
}

/**
 * Format test results for display
 * @param {Object} data - The validated test data
 * @returns {Object} - Formatted test results
 */
function formatTestResults(data) {
  const { results, ranges } = data;
  const formatted = {};

  // Define normal ranges and units with more detailed information
  const testInfo = {
    hsCRP: {
      unit: 'mg/L',
      name: 'hs-CRP (High-sensitivity C-reactive protein)',
      description: 'Measures inflammation in the body. Elevated levels may indicate inflammation from conditions like heart disease, infections, or autoimmune disorders.',
      visualRange: '0-3 mg/L',
      interpretation: {
        low: 'Low risk of cardiovascular disease',
        moderate: 'Moderate risk of cardiovascular disease',
        high: 'High risk of cardiovascular disease'
      }
    },
    hbA1c: {
      unit: '%',
      name: 'HbA1c (Hemoglobin A1c)',
      description: 'Reflects average blood glucose levels over the past 2-3 months. Used to diagnose and monitor diabetes.',
      visualRange: '4-6.5%',
      interpretation: {
        normal: 'Normal blood glucose levels',
        prediabetic: 'Prediabetic range',
        diabetic: 'Diabetic range'
      }
    },
    triglycerides: {
      unit: 'mg/dL',
      name: 'Triglycerides',
      description: 'A type of fat in the blood. High levels may increase risk of heart disease.',
      visualRange: '<150 mg/dL',
      interpretation: {
        normal: 'Normal triglyceride levels',
        borderline: 'Borderline high triglyceride levels',
        high: 'High triglyceride levels',
        veryHigh: 'Very high triglyceride levels'
      }
    },
    cholesterol: {
      unit: 'mg/dL',
      name: 'Total Cholesterol',
      description: 'Measures all cholesterol in the blood. High levels may increase risk of heart disease.',
      visualRange: '<200 mg/dL',
      interpretation: {
        normal: 'Normal cholesterol levels',
        borderline: 'Borderline high cholesterol levels',
        high: 'High cholesterol levels'
      }
    },
    hdl: {
      unit: 'mg/dL',
      name: 'HDL (High-density lipoprotein)',
      description: '"Good" cholesterol that helps remove other forms of cholesterol from the bloodstream.',
      visualRange: '≥40 mg/dL',
      isHigherBetter: true,
      interpretation: {
        low: 'Low HDL levels (increased cardiovascular risk)',
        normal: 'Normal HDL levels',
        optimal: 'Optimal HDL levels (protective against heart disease)'
      }
    },
    ldl: {
      unit: 'mg/dL',
      name: 'LDL (Low-density lipoprotein)',
      description: '"Bad" cholesterol that can build up in artery walls and increase risk of heart disease.',
      visualRange: '<130 mg/dL',
      interpretation: {
        optimal: 'Optimal LDL levels',
        nearOptimal: 'Near optimal LDL levels',
        borderline: 'Borderline high LDL levels',
        high: 'High LDL levels',
        veryHigh: 'Very high LDL levels'
      }
    }
  };

  // Format each test result with enhanced interpretation
  for (const [test, value] of Object.entries(results)) {
    if (testInfo[test]) {
      const info = testInfo[test];
      const range = ranges[test] || {};

      // Determine status and interpretation based on test-specific criteria
      let status, interpretationKey, interpretationText;

      switch(test) {
        case 'hsCRP':
          if (value < 1) {
            status = 'normal';
            interpretationKey = 'low';
          } else if (value >= 1 && value < 3) {
            status = 'borderline';
            interpretationKey = 'moderate';
          } else {
            status = 'high';
            interpretationKey = 'high';
          }
          break;

        case 'hbA1c':
          if (value < 5.7) {
            status = 'normal';
            interpretationKey = 'normal';
          } else if (value >= 5.7 && value < 6.5) {
            status = 'borderline';
            interpretationKey = 'prediabetic';
          } else {
            status = 'high';
            interpretationKey = 'diabetic';
          }
          break;

        case 'triglycerides':
          if (value < 150) {
            status = 'normal';
            interpretationKey = 'normal';
          } else if (value >= 150 && value < 200) {
            status = 'borderline';
            interpretationKey = 'borderline';
          } else if (value >= 200 && value < 500) {
            status = 'high';
            interpretationKey = 'high';
          } else {
            status = 'very high';
            interpretationKey = 'veryHigh';
          }
          break;

        case 'cholesterol':
          if (value < 200) {
            status = 'normal';
            interpretationKey = 'normal';
          } else if (value >= 200 && value < 240) {
            status = 'borderline';
            interpretationKey = 'borderline';
          } else {
            status = 'high';
            interpretationKey = 'high';
          }
          break;

        case 'hdl':
          if (value < 40) {
            status = 'low';
            interpretationKey = 'low';
          } else if (value >= 40 && value < 60) {
            status = 'normal';
            interpretationKey = 'normal';
          } else {
            status = 'optimal';
            interpretationKey = 'optimal';
          }
          break;

        case 'ldl':
          if (value < 100) {
            status = 'optimal';
            interpretationKey = 'optimal';
          } else if (value >= 100 && value < 130) {
            status = 'near optimal';
            interpretationKey = 'nearOptimal';
          } else if (value >= 130 && value < 160) {
            status = 'borderline';
            interpretationKey = 'borderline';
          } else if (value >= 160 && value < 190) {
            status = 'high';
            interpretationKey = 'high';
          } else {
            status = 'very high';
            interpretationKey = 'veryHigh';
          }
          break;

        default:
          // Default handling for any other tests
          if (info.isHigherBetter) {
            const threshold = range.min || 40;
            status = value >= threshold ? 'normal' : 'low';
            interpretationKey = value >= threshold ? 'normal' : 'low';
          } else {
            const threshold = range.max || 200;
            status = value <= threshold ? 'normal' : 'high';
            interpretationKey = value <= threshold ? 'normal' : 'high';
          }
      }

      // Get the interpretation text
      interpretationText = info.interpretation[interpretationKey] || 'No interpretation available';

      // Format the normal range display
      let normalRangeDisplay;
      if (range.min !== undefined && range.max !== undefined) {
        normalRangeDisplay = `${range.min}-${range.max} ${info.unit}`;
      } else if (range.min !== undefined) {
        normalRangeDisplay = `≥ ${range.min} ${info.unit}`;
      } else if (range.max !== undefined) {
        normalRangeDisplay = `≤ ${range.max} ${info.unit}`;
      } else {
        normalRangeDisplay = info.visualRange;
      }

      // Create the formatted result
      formatted[test] = {
        name: info.name,
        value,
        unit: info.unit,
        normalRange: normalRangeDisplay,
        status,
        interpretation: interpretationText,
        description: info.description
      };
    }
  }

  return formatted;
}

module.exports = {
  parseTestResults,
  extractTestResults,
  validateTestResults
};
