/**
 * AI Clinical Intelligence Service
 * 
 * This service provides AI-powered clinical decision support, including:
 * - Smart clinical note auto-completion
 * - Differential diagnosis suggestions
 * - Medication interaction checking
 * - Predictive risk assessment
 * - Natural language queries for patient data
 * - Automated coding suggestions (ICD-10/CPT)
 * - Clinical guideline recommendations
 * - Real-time documentation quality checking
 */

const axios = require('axios');
const db = require('../models');

class AIClinicalIntelligenceService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    this.apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.AI_MODEL || 'gpt-4';
    this.enabled = !!this.apiKey;
  }

  /**
   * Auto-complete clinical notes based on context
   * @param {Object} params - { partialNote, patientContext, encounterType }
   * @returns {Object} - { completion, suggestions }
   */
  async autoCompleteNote(params) {
    if (!this.enabled) {
      return { completion: '', suggestions: [], aiEnabled: false };
    }

    const { partialNote, patientContext, encounterType } = params;

    const prompt = `You are an experienced physician assistant helping complete clinical documentation.

Context:
- Patient: ${patientContext.age} year old ${patientContext.gender}
- Chief Complaint: ${patientContext.chiefComplaint || 'N/A'}
- Medical History: ${patientContext.medicalHistory || 'N/A'}
- Current Medications: ${patientContext.medications || 'N/A'}
- Encounter Type: ${encounterType}

Partial Note:
${partialNote}

Please provide:
1. A natural completion of the clinical note in SOAP format
2. Three alternative phrasing suggestions

Format your response as JSON:
{
  "completion": "completed text here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    try {
      const response = await this._callAI(prompt);
      const result = JSON.parse(response);
      return { ...result, aiEnabled: true };
    } catch (error) {
      console.error('AI auto-complete error:', error.message);
      return { completion: '', suggestions: [], aiEnabled: true, error: error.message };
    }
  }

  /**
   * Generate differential diagnosis suggestions
   * @param {Object} params - { symptoms, vitals, labResults, patientHistory }
   * @returns {Array} - Array of potential diagnoses with confidence scores
   */
  async suggestDifferentialDiagnosis(params) {
    if (!this.enabled) {
      return { diagnoses: [], aiEnabled: false };
    }

    const { symptoms, vitals, labResults, patientHistory } = params;

    const prompt = `You are an expert diagnostician. Based on the following clinical information, suggest the top 5 differential diagnoses.

Symptoms: ${JSON.stringify(symptoms)}
Vitals: ${JSON.stringify(vitals)}
Lab Results: ${JSON.stringify(labResults)}
Patient History: ${JSON.stringify(patientHistory)}

For each diagnosis, provide:
1. ICD-10 code
2. Diagnosis name
3. Confidence score (0-100)
4. Key supporting factors
5. Recommended next steps

Format as JSON array:
[
  {
    "icd10": "E11.9",
    "diagnosis": "Type 2 Diabetes Mellitus",
    "confidence": 85,
    "supportingFactors": ["elevated glucose", "family history"],
    "nextSteps": ["HbA1c test", "fasting glucose"]
  }
]`;

    try {
      const response = await this._callAI(prompt);
      const diagnoses = JSON.parse(response);
      return { diagnoses, aiEnabled: true };
    } catch (error) {
      console.error('AI differential diagnosis error:', error.message);
      return { diagnoses: [], aiEnabled: true, error: error.message };
    }
  }

  /**
   * Check medication interactions with AI insights
   * @param {Array} medications - Array of medication objects
   * @returns {Object} - Interaction analysis
   */
  async checkMedicationInteractions(medications) {
    if (!this.enabled) {
      return { interactions: [], aiEnabled: false };
    }

    const prompt = `You are a clinical pharmacologist. Analyze the following medication list for potential interactions:

Medications:
${JSON.stringify(medications, null, 2)}

Provide:
1. Critical interactions (require immediate action)
2. Moderate interactions (monitor closely)
3. Minor interactions (minimal clinical significance)
4. Recommendations for each interaction

Format as JSON:
{
  "critical": [{"drugs": ["drug1", "drug2"], "risk": "description", "action": "recommendation"}],
  "moderate": [...],
  "minor": [...],
  "overallRisk": "low|medium|high"
}`;

    try {
      const response = await this._callAI(prompt);
      const interactions = JSON.parse(response);
      return { ...interactions, aiEnabled: true };
    } catch (error) {
      console.error('AI medication interaction check error:', error.message);
      return { interactions: [], aiEnabled: true, error: error.message };
    }
  }

  /**
   * Predict patient risk scores
   * @param {Object} patientData - Comprehensive patient data
   * @returns {Object} - Risk assessment
   */
  async predictPatientRisk(patientData) {
    if (!this.enabled) {
      return { risks: [], aiEnabled: false };
    }

    const prompt = `You are a clinical risk assessment expert. Analyze this patient's data and predict risks:

Patient Data:
${JSON.stringify(patientData, null, 2)}

Assess risk for:
1. Hospital readmission (30-day)
2. Disease progression
3. Medication non-adherence
4. Fall risk
5. Sepsis risk

For each risk, provide:
- Risk score (0-100)
- Risk level (low/medium/high/critical)
- Contributing factors
- Preventive recommendations

Format as JSON:
{
  "risks": [
    {
      "type": "readmission",
      "score": 45,
      "level": "medium",
      "factors": ["recent hospitalization", "multiple conditions"],
      "recommendations": ["follow-up in 7 days", "home health visit"]
    }
  ],
  "overallRisk": "medium"
}`;

    try {
      const response = await this._callAI(prompt);
      const riskAssessment = JSON.parse(response);
      return { ...riskAssessment, aiEnabled: true };
    } catch (error) {
      console.error('AI risk prediction error:', error.message);
      return { risks: [], aiEnabled: true, error: error.message };
    }
  }

  /**
   * Natural language query for patient data
   * @param {String} query - Natural language query
   * @param {String} orgId - Organization ID for context
   * @returns {Object} - Query results
   */
  async naturalLanguageQuery(query, orgId) {
    if (!this.enabled) {
      return { sql: null, explanation: 'AI not enabled', aiEnabled: false };
    }

    const prompt = `You are a SQL expert for a healthcare database. Convert this natural language query to SQL.

Database Schema Context:
- patients table: id, org_id, first_name, last_name, date_of_birth, gender
- encounters table: id, patient_id, encounter_date, diagnosis_codes
- observations table: id, patient_id, observation_code, value, date
- medications table: id, patient_id, medication_name, start_date, end_date

Query: "${query}"
Organization ID: ${orgId}

Provide:
1. Safe SQL query (use parameterized queries, include org_id filter for multi-tenancy)
2. Explanation of what the query does
3. Expected result columns

Format as JSON:
{
  "sql": "SELECT ... WHERE org_id = :orgId",
  "explanation": "This query finds...",
  "resultColumns": ["column1", "column2"],
  "parameters": {"orgId": "${orgId}"}
}`;

    try {
      const response = await this._callAI(prompt);
      const queryResult = JSON.parse(response);
      return { ...queryResult, aiEnabled: true };
    } catch (error) {
      console.error('AI natural language query error:', error.message);
      return { sql: null, explanation: error.message, aiEnabled: true, error: error.message };
    }
  }

  /**
   * Suggest ICD-10 and CPT codes automatically
   * @param {Object} encounterData - Clinical encounter documentation
   * @returns {Object} - Coding suggestions
   */
  async suggestCoding(encounterData) {
    if (!this.enabled) {
      return { icd10: [], cpt: [], aiEnabled: false };
    }

    const { chiefComplaint, assessment, procedures, duration } = encounterData;

    const prompt = `You are a certified medical coder. Based on this clinical encounter, suggest appropriate codes:

Chief Complaint: ${chiefComplaint}
Assessment/Diagnosis: ${assessment}
Procedures Performed: ${procedures}
Encounter Duration: ${duration} minutes

Provide:
1. ICD-10 codes (primary and secondary diagnoses)
2. CPT codes (evaluation and procedures)
3. Confidence level for each code
4. Documentation requirements for each code

Format as JSON:
{
  "icd10": [
    {"code": "E11.9", "description": "Type 2 DM", "confidence": 95, "position": "primary"}
  ],
  "cpt": [
    {"code": "99213", "description": "Office visit", "confidence": 90, "modifiers": []}
  ],
  "estimatedReimbursement": "$120",
  "documentationGaps": ["need to document BMI"]
}`;

    try {
      const response = await this._callAI(prompt);
      const codingSuggestions = JSON.parse(response);
      return { ...codingSuggestions, aiEnabled: true };
    } catch (error) {
      console.error('AI coding suggestion error:', error.message);
      return { icd10: [], cpt: [], aiEnabled: true, error: error.message };
    }
  }

  /**
   * Provide clinical guideline recommendations
   * @param {Object} params - { diagnosis, patientAge, comorbidities }
   * @returns {Object} - Guideline recommendations
   */
  async getGuidelineRecommendations(params) {
    if (!this.enabled) {
      return { guidelines: [], aiEnabled: false };
    }

    const { diagnosis, patientAge, comorbidities } = params;

    const prompt = `You are a clinical guidelines expert. Provide evidence-based recommendations for:

Diagnosis: ${diagnosis}
Patient Age: ${patientAge}
Comorbidities: ${JSON.stringify(comorbidities)}

Include:
1. Latest clinical practice guidelines
2. Recommended screening tests
3. Treatment protocols
4. Monitoring frequency
5. Patient education topics
6. Evidence level (A/B/C)

Format as JSON:
{
  "guidelines": [
    {
      "source": "ADA 2024",
      "recommendation": "Screen for retinopathy annually",
      "evidenceLevel": "A",
      "references": ["PMID: 12345678"]
    }
  ],
  "keyActions": ["action 1", "action 2"]
}`;

    try {
      const response = await this._callAI(prompt);
      const guidelines = JSON.parse(response);
      return { ...guidelines, aiEnabled: true };
    } catch (error) {
      console.error('AI guideline recommendations error:', error.message);
      return { guidelines: [], aiEnabled: true, error: error.message };
    }
  }

  /**
   * Check documentation quality in real-time
   * @param {String} documentationText - Clinical note text
   * @param {String} documentType - Type of document (SOAP, H&P, etc.)
   * @returns {Object} - Quality assessment
   */
  async checkDocumentationQuality(documentationText, documentType) {
    if (!this.enabled) {
      return { score: 0, issues: [], aiEnabled: false };
    }

    const prompt = `You are a clinical documentation improvement (CDI) specialist. Review this ${documentType} note:

${documentationText}

Assess:
1. Completeness (all required elements present)
2. Specificity (sufficient detail for coding)
3. Clarity (unambiguous language)
4. Compliance (meets regulatory requirements)
5. Medical necessity documentation

Provide:
- Overall quality score (0-100)
- Missing elements
- Specificity improvements
- Risk areas (potential compliance issues)
- Suggestions for improvement

Format as JSON:
{
  "score": 75,
  "issues": [
    {"type": "missing", "element": "Review of Systems", "severity": "moderate"}
  ],
  "strengths": ["clear assessment", "detailed plan"],
  "improvements": [
    {"issue": "diagnosis lacks specificity", "suggestion": "specify type and laterality"}
  ]
}`;

    try {
      const response = await this._callAI(prompt);
      const qualityCheck = JSON.parse(response);
      return { ...qualityCheck, aiEnabled: true };
    } catch (error) {
      console.error('AI documentation quality check error:', error.message);
      return { score: 0, issues: [], aiEnabled: true, error: error.message };
    }
  }

  /**
   * Smart patient summary generation
   * @param {String} patientId - Patient ID
   * @param {String} orgId - Organization ID
   * @returns {Object} - AI-generated patient summary
   */
  async generatePatientSummary(patientId, orgId) {
    if (!this.enabled) {
      return { summary: '', aiEnabled: false };
    }

    try {
      // Fetch patient data
      const patient = await db.Patient.findOne({
        where: { id: patientId, org_id: orgId },
        include: [
          { model: db.Encounter, limit: 10, order: [['encounter_date', 'DESC']] },
          { model: db.Medication, where: { status: 'active' }, required: false },
          { model: db.Observation, limit: 20, order: [['date', 'DESC']] }
        ]
      });

      if (!patient) {
        throw new Error('Patient not found');
      }

      const patientData = patient.toJSON();

      const prompt = `You are a physician reviewing a patient's chart. Generate a concise clinical summary:

Patient Data:
${JSON.stringify(patientData, null, 2)}

Provide a structured summary including:
1. Patient demographics and key identifiers
2. Active problems and diagnoses
3. Current medications
4. Recent vital signs and labs (with trends)
5. Care gaps (overdue screenings, missing documentation)
6. Clinical insights and recommendations

Keep it concise, clinically relevant, and actionable.

Format as structured text with clear sections.`;

      const response = await this._callAI(prompt);
      return { summary: response, aiEnabled: true };
    } catch (error) {
      console.error('AI patient summary error:', error.message);
      return { summary: '', aiEnabled: true, error: error.message };
    }
  }

  /**
   * Private method to call AI API
   * @param {String} prompt - The prompt to send
   * @returns {String} - AI response
   */
  async _callAI(prompt, options = {}) {
    if (!this.enabled) {
      throw new Error('AI service not configured. Set OPENAI_API_KEY or AI_API_KEY environment variable.');
    }

    const maxRetries = options.maxRetries || 2;
    const temperature = options.temperature || 0.3; // Lower temperature for medical accuracy
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          this.apiUrl,
          {
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'You are a medical AI assistant providing evidence-based clinical support. Always prioritize patient safety and follow clinical guidelines. Your responses must be in valid JSON format when requested.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature,
            max_tokens: options.maxTokens || 2000,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            timeout: 30000 // 30 second timeout
          }
        );

        return response.data.choices[0].message.content;
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(`AI API call failed after ${maxRetries + 1} attempts: ${error.message}`);
        }
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Check if AI service is enabled and configured
   * @returns {Boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get AI service status and configuration
   * @returns {Object}
   */
  getStatus() {
    return {
      enabled: this.enabled,
      model: this.model,
      apiUrl: this.apiUrl,
      features: [
        'autoCompleteNote',
        'suggestDifferentialDiagnosis',
        'checkMedicationInteractions',
        'predictPatientRisk',
        'naturalLanguageQuery',
        'suggestCoding',
        'getGuidelineRecommendations',
        'checkDocumentationQuality',
        'generatePatientSummary'
      ]
    };
  }
}

module.exports = new AIClinicalIntelligenceService();
