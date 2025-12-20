/**
 * OB/GYN Service
 * Manages OB/GYN-specific clinical data including:
 * - EPDS (Edinburgh Postnatal Depression Scale) assessments
 * - Labor & Delivery records
 * - Postpartum visits
 * - Ultrasound records
 */

const { v4: uuidv4 } = require('uuid');

class ObGynService {
  constructor(pool) {
    this.pool = pool;
  }

  // ============================================
  // EPDS (Edinburgh Postnatal Depression Scale)
  // ============================================

  /**
   * Save EPDS assessment
   * @param {Object} data - EPDS assessment data
   * @returns {Promise<Object>} Saved assessment
   */
  async saveEPDSAssessment(data) {
    const {
      patientId,
      episodeId,
      answers,
      totalScore,
      riskLevel,
      selfHarmRisk,
      interpretation,
      recommendation,
      assessedBy,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_epds_assessments
       (id, patient_id, episode_id, answers, total_score, risk_level, 
        self_harm_risk, interpretation, recommendation, assessed_by, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(answers),
        totalScore,
        riskLevel,
        selfHarmRisk,
        interpretation,
        recommendation,
        assessedBy,
        orgId
      ]
    );

    return this._formatEPDSRecord(result.rows[0]);
  }

  /**
   * Get EPDS assessments for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID filter
   * @returns {Promise<Array>} EPDS assessments
   */
  async getEPDSAssessments(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_epds_assessments WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatEPDSRecord(row));
  }

  /**
   * Get latest EPDS assessment
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object|null>} Latest assessment or null
   */
  async getLatestEPDS(patientId) {
    const result = await this.pool.query(
      `SELECT * FROM obgyn_epds_assessments 
       WHERE patient_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [patientId]
    );

    return result.rows.length > 0 ? this._formatEPDSRecord(result.rows[0]) : null;
  }

  // ============================================
  // Labor & Delivery
  // ============================================

  /**
   * Save labor & delivery record
   * @param {Object} data - Delivery data
   * @returns {Promise<Object>} Saved record
   */
  async saveLaborDeliveryRecord(data) {
    const {
      patientId,
      episodeId,
      deliveryDateTime,
      gestationalAge,
      deliveryMode,
      laborOnset,
      ruptureOfMembranes,
      amnioticFluid,
      anesthesiaType,
      cesareanDetails,
      bloodLoss,
      episiotomy,
      laceration,
      placentaDelivery,
      uterotonic,
      maternalComplications,
      newborn,
      deliveryProvider,
      notes,
      recordedBy,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_labor_delivery_records
       (id, patient_id, episode_id, delivery_datetime, gestational_age,
        delivery_mode, labor_onset, rupture_of_membranes, amniotic_fluid,
        anesthesia_type, cesarean_details, blood_loss, episiotomy, laceration,
        placenta_delivery, uterotonic, maternal_complications, newborn_data,
        delivery_provider, notes, recorded_by, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        deliveryDateTime,
        gestationalAge,
        deliveryMode,
        laborOnset,
        ruptureOfMembranes,
        amnioticFluid,
        anesthesiaType,
        cesareanDetails ? JSON.stringify(cesareanDetails) : null,
        bloodLoss,
        episiotomy,
        laceration,
        placentaDelivery,
        uterotonic,
        maternalComplications ? JSON.stringify(maternalComplications) : null,
        newborn ? JSON.stringify(newborn) : null,
        deliveryProvider,
        notes,
        recordedBy,
        orgId
      ]
    );

    return this._formatLaborDeliveryRecord(result.rows[0]);
  }

  /**
   * Get labor & delivery record for an episode
   * @param {string} episodeId - Episode ID
   * @returns {Promise<Object|null>} Delivery record or null
   */
  async getLaborDeliveryRecord(episodeId) {
    const result = await this.pool.query(
      `SELECT * FROM obgyn_labor_delivery_records WHERE episode_id = $1`,
      [episodeId]
    );

    return result.rows.length > 0 ? this._formatLaborDeliveryRecord(result.rows[0]) : null;
  }

  /**
   * Update labor & delivery record
   * @param {string} recordId - Record ID
   * @param {Object} updates - Updates to apply
   * @param {string} updatedBy - User ID
   * @returns {Promise<Object>} Updated record
   */
  async updateLaborDeliveryRecord(recordId, updates, updatedBy) {
    const fields = [];
    const params = [recordId];
    let paramIndex = 2;

    const fieldMappings = {
      deliveryDateTime: 'delivery_datetime',
      gestationalAge: 'gestational_age',
      deliveryMode: 'delivery_mode',
      laborOnset: 'labor_onset',
      ruptureOfMembranes: 'rupture_of_membranes',
      amnioticFluid: 'amniotic_fluid',
      anesthesiaType: 'anesthesia_type',
      cesareanDetails: 'cesarean_details',
      bloodLoss: 'blood_loss',
      episiotomy: 'episiotomy',
      laceration: 'laceration',
      placentaDelivery: 'placenta_delivery',
      uterotonic: 'uterotonic',
      maternalComplications: 'maternal_complications',
      newborn: 'newborn_data',
      deliveryProvider: 'delivery_provider',
      notes: 'notes'
    };

    for (const [key, dbField] of Object.entries(fieldMappings)) {
      if (updates[key] !== undefined) {
        let value = updates[key];
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        fields.push(`${dbField} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    fields.push(`updated_by = $${paramIndex}`);
    params.push(updatedBy);

    if (fields.length === 1) {
      // Only updated_by, no real updates
      const existing = await this.pool.query(
        `SELECT * FROM obgyn_labor_delivery_records WHERE id = $1`,
        [recordId]
      );
      return this._formatLaborDeliveryRecord(existing.rows[0]);
    }

    const result = await this.pool.query(
      `UPDATE obgyn_labor_delivery_records
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      params
    );

    return this._formatLaborDeliveryRecord(result.rows[0]);
  }

  // ============================================
  // Postpartum Visits
  // ============================================

  /**
   * Save postpartum visit
   * @param {Object} data - Visit data
   * @returns {Promise<Object>} Saved visit
   */
  async savePostpartumVisit(data) {
    const {
      patientId,
      episodeId,
      visitDate,
      visitType,
      daysPostpartum,
      vitals,
      physicalExam,
      mentalHealth,
      breastfeeding,
      contraception,
      labs,
      notes,
      nextVisitDate,
      provider,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_postpartum_visits
       (id, patient_id, episode_id, visit_date, visit_type, days_postpartum,
        vitals, physical_exam, mental_health, breastfeeding, contraception,
        labs, notes, next_visit_date, provider, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        visitDate,
        visitType,
        daysPostpartum,
        vitals ? JSON.stringify(vitals) : null,
        physicalExam ? JSON.stringify(physicalExam) : null,
        mentalHealth ? JSON.stringify(mentalHealth) : null,
        breastfeeding ? JSON.stringify(breastfeeding) : null,
        contraception ? JSON.stringify(contraception) : null,
        labs ? JSON.stringify(labs) : null,
        notes,
        nextVisitDate,
        provider,
        orgId
      ]
    );

    return this._formatPostpartumVisit(result.rows[0]);
  }

  /**
   * Get postpartum visits for a patient/episode
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID filter
   * @returns {Promise<Array>} Postpartum visits
   */
  async getPostpartumVisits(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_postpartum_visits WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY visit_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatPostpartumVisit(row));
  }

  // ============================================
  // Ultrasound Records
  // ============================================

  /**
   * Save ultrasound record
   * @param {Object} data - Ultrasound data
   * @returns {Promise<Object>} Saved record
   */
  async saveUltrasoundRecord(data) {
    const {
      patientId,
      episodeId,
      scanDate,
      gestationalAge,
      scanType,
      indication,
      provider,
      facility,
      fetalNumber,
      presentation,
      placentaLocation,
      amnioticFluid,
      biometry,
      findings,
      assessment,
      abnormalFindings,
      recommendations,
      imageCount,
      reportUrl,
      notes,
      recordedBy,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_ultrasound_records
       (id, patient_id, episode_id, scan_date, gestational_age, scan_type,
        indication, provider, facility, fetal_number, presentation,
        placenta_location, amniotic_fluid, biometry, findings, assessment,
        abnormal_findings, recommendations, image_count, report_url, notes,
        recorded_by, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        scanDate,
        gestationalAge,
        scanType,
        indication,
        provider,
        facility,
        fetalNumber,
        presentation,
        placentaLocation,
        amnioticFluid ? JSON.stringify(amnioticFluid) : null,
        biometry ? JSON.stringify(biometry) : null,
        findings ? JSON.stringify(findings) : null,
        assessment,
        abnormalFindings ? JSON.stringify(abnormalFindings) : null,
        recommendations ? JSON.stringify(recommendations) : null,
        imageCount,
        reportUrl,
        notes,
        recordedBy,
        orgId
      ]
    );

    return this._formatUltrasoundRecord(result.rows[0]);
  }

  /**
   * Get ultrasound records for a patient/episode
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID filter
   * @returns {Promise<Array>} Ultrasound records
   */
  async getUltrasoundRecords(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_ultrasound_records WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY scan_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatUltrasoundRecord(row));
  }

  /**
   * Get ultrasound record by ID
   * @param {string} recordId - Record ID
   * @returns {Promise<Object|null>} Ultrasound record or null
   */
  async getUltrasoundById(recordId) {
    const result = await this.pool.query(
      `SELECT * FROM obgyn_ultrasound_records WHERE id = $1`,
      [recordId]
    );

    return result.rows.length > 0 ? this._formatUltrasoundRecord(result.rows[0]) : null;
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  _formatEPDSRecord(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
      totalScore: row.total_score,
      riskLevel: row.risk_level,
      selfHarmRisk: row.self_harm_risk,
      interpretation: row.interpretation,
      recommendation: row.recommendation,
      assessedBy: row.assessed_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  _formatLaborDeliveryRecord(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      deliveryDateTime: row.delivery_datetime,
      gestationalAge: row.gestational_age,
      deliveryMode: row.delivery_mode,
      laborOnset: row.labor_onset,
      ruptureOfMembranes: row.rupture_of_membranes,
      amnioticFluid: row.amniotic_fluid,
      anesthesiaType: row.anesthesia_type,
      cesareanDetails: row.cesarean_details ? 
        (typeof row.cesarean_details === 'string' ? JSON.parse(row.cesarean_details) : row.cesarean_details) : null,
      bloodLoss: row.blood_loss,
      episiotomy: row.episiotomy,
      laceration: row.laceration,
      placentaDelivery: row.placenta_delivery,
      uterotonic: row.uterotonic,
      maternalComplications: row.maternal_complications ?
        (typeof row.maternal_complications === 'string' ? JSON.parse(row.maternal_complications) : row.maternal_complications) : [],
      newborn: row.newborn_data ?
        (typeof row.newborn_data === 'string' ? JSON.parse(row.newborn_data) : row.newborn_data) : null,
      deliveryProvider: row.delivery_provider,
      notes: row.notes,
      recordedBy: row.recorded_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  _formatPostpartumVisit(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      visitDate: row.visit_date,
      visitType: row.visit_type,
      daysPostpartum: row.days_postpartum,
      vitals: row.vitals ? (typeof row.vitals === 'string' ? JSON.parse(row.vitals) : row.vitals) : null,
      physicalExam: row.physical_exam ? (typeof row.physical_exam === 'string' ? JSON.parse(row.physical_exam) : row.physical_exam) : null,
      mentalHealth: row.mental_health ? (typeof row.mental_health === 'string' ? JSON.parse(row.mental_health) : row.mental_health) : null,
      breastfeeding: row.breastfeeding ? (typeof row.breastfeeding === 'string' ? JSON.parse(row.breastfeeding) : row.breastfeeding) : null,
      contraception: row.contraception ? (typeof row.contraception === 'string' ? JSON.parse(row.contraception) : row.contraception) : null,
      labs: row.labs ? (typeof row.labs === 'string' ? JSON.parse(row.labs) : row.labs) : null,
      notes: row.notes,
      nextVisitDate: row.next_visit_date,
      provider: row.provider,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  _formatUltrasoundRecord(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      scanDate: row.scan_date,
      gestationalAge: row.gestational_age,
      scanType: row.scan_type,
      indication: row.indication,
      provider: row.provider,
      facility: row.facility,
      fetalNumber: row.fetal_number,
      presentation: row.presentation,
      placentaLocation: row.placenta_location,
      amnioticFluid: row.amniotic_fluid ? (typeof row.amniotic_fluid === 'string' ? JSON.parse(row.amniotic_fluid) : row.amniotic_fluid) : null,
      biometry: row.biometry ? (typeof row.biometry === 'string' ? JSON.parse(row.biometry) : row.biometry) : null,
      findings: row.findings ? (typeof row.findings === 'string' ? JSON.parse(row.findings) : row.findings) : [],
      assessment: row.assessment,
      abnormalFindings: row.abnormal_findings ? (typeof row.abnormal_findings === 'string' ? JSON.parse(row.abnormal_findings) : row.abnormal_findings) : [],
      recommendations: row.recommendations ? (typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations) : [],
      imageCount: row.image_count,
      reportUrl: row.report_url,
      notes: row.notes,
      recordedBy: row.recorded_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = ObGynService;
