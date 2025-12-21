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
      if (existing.rows.length === 0) {
        throw new Error(`Labor/delivery record not found: ${recordId}`);
      }
      return this._formatLaborDeliveryRecord(existing.rows[0]);
    }

    const result = await this.pool.query(
      `UPDATE obgyn_labor_delivery_records
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error(`Labor/delivery record not found: ${recordId}`);
    }

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

  // ============================================
  // Complications
  // ============================================

  /**
   * Save complication record
   * @param {Object} data - Complication data
   * @returns {Promise<Object>} Saved record
   */
  async saveComplication(data) {
    const {
      patientId,
      episodeId,
      type,
      severity,
      detectedAt,
      detectedDate,
      status,
      description,
      actionsTaken,
      supportServices,
      notes,
      recordedBy,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_complications
       (id, patient_id, episode_id, type, severity, detected_at, detected_date,
        status, description, actions_taken, support_services, notes, recorded_by, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        type,
        severity,
        detectedAt,
        detectedDate,
        status,
        description,
        actionsTaken ? JSON.stringify(actionsTaken) : '[]',
        supportServices ? JSON.stringify(supportServices) : '[]',
        notes,
        recordedBy,
        orgId
      ]
    );

    return this._formatComplication(result.rows[0]);
  }

  /**
   * Get complications for a patient/episode
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID filter
   * @returns {Promise<Array>} Complications
   */
  async getComplications(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_complications WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY detected_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatComplication(row));
  }

  /**
   * Update complication status
   * @param {string} complicationId - Complication ID
   * @param {Object} updates - Updates to apply
   * @param {string} updatedBy - User ID
   * @returns {Promise<Object>} Updated complication
   */
  async updateComplication(complicationId, updates, updatedBy) {
    const { status, actionsTaken, notes } = updates;

    const result = await this.pool.query(
      `UPDATE obgyn_complications
       SET status = COALESCE($2, status),
           actions_taken = COALESCE($3, actions_taken),
           notes = COALESCE($4, notes),
           updated_by = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [
        complicationId,
        status,
        actionsTaken ? JSON.stringify(actionsTaken) : null,
        notes,
        updatedBy
      ]
    );

    if (result.rows.length === 0) {
      throw new Error(`Complication not found: ${complicationId}`);
    }

    return this._formatComplication(result.rows[0]);
  }

  _formatComplication(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      type: row.type,
      severity: row.severity,
      detectedAt: row.detected_at,
      detectedDate: row.detected_date,
      status: row.status,
      description: row.description,
      actionsTaken: row.actions_taken ? (typeof row.actions_taken === 'string' ? JSON.parse(row.actions_taken) : row.actions_taken) : [],
      supportServices: row.support_services ? (typeof row.support_services === 'string' ? JSON.parse(row.support_services) : row.support_services) : [],
      notes: row.notes,
      recordedBy: row.recorded_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Baby Records
  // ============================================

  /**
   * Save baby record
   * @param {Object} data - Baby data
   * @returns {Promise<Object>} Saved record
   */
  async saveBabyRecord(data) {
    const {
      maternalPatientId,
      deliveryEncounterId,
      episodeId,
      birthOrder,
      sex,
      birthDateTime,
      gestationalAgeAtBirth,
      birthWeight,
      birthLength,
      headCircumference,
      apgarScores,
      resuscitation,
      cordBlood,
      skinToSkin,
      breastfeedingInitiated,
      vitaminK,
      eyeProphylaxis,
      nicuAdmission,
      twinType,
      tttsStatus,
      createdBy,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_baby_records
       (id, maternal_patient_id, delivery_encounter_id, episode_id, birth_order,
        sex, birth_datetime, gestational_age_at_birth, birth_weight, birth_length,
        head_circumference, apgar_scores, resuscitation, cord_blood, skin_to_skin,
        breastfeeding_initiated, vitamin_k, eye_prophylaxis, nicu_admission,
        twin_type, ttts_status, created_by, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
       RETURNING *`,
      [
        id,
        maternalPatientId,
        deliveryEncounterId,
        episodeId,
        birthOrder,
        sex,
        birthDateTime,
        gestationalAgeAtBirth,
        birthWeight,
        birthLength,
        headCircumference,
        apgarScores ? JSON.stringify(apgarScores) : null,
        resuscitation,
        cordBlood,
        skinToSkin,
        breastfeedingInitiated,
        vitaminK,
        eyeProphylaxis,
        nicuAdmission ? JSON.stringify(nicuAdmission) : null,
        twinType,
        tttsStatus,
        createdBy,
        orgId
      ]
    );

    return this._formatBabyRecord(result.rows[0]);
  }

  /**
   * Get baby records for a maternal patient
   * @param {string} maternalPatientId - Maternal patient ID
   * @param {string} [episodeId] - Optional episode ID filter
   * @returns {Promise<Array>} Baby records
   */
  async getBabyRecords(maternalPatientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_baby_records WHERE maternal_patient_id = $1`;
    const params = [maternalPatientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY birth_order ASC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatBabyRecord(row));
  }

  _formatBabyRecord(row) {
    return {
      id: row.id,
      maternalPatientId: row.maternal_patient_id,
      deliveryEncounterId: row.delivery_encounter_id,
      episodeId: row.episode_id,
      birthOrder: row.birth_order,
      sex: row.sex,
      birthDateTime: row.birth_datetime,
      gestationalAgeAtBirth: row.gestational_age_at_birth,
      birthWeight: row.birth_weight,
      birthLength: row.birth_length,
      headCircumference: row.head_circumference,
      apgarScores: row.apgar_scores ? (typeof row.apgar_scores === 'string' ? JSON.parse(row.apgar_scores) : row.apgar_scores) : null,
      resuscitation: row.resuscitation,
      cordBlood: row.cord_blood,
      skinToSkin: row.skin_to_skin,
      breastfeedingInitiated: row.breastfeeding_initiated,
      vitaminK: row.vitamin_k,
      eyeProphylaxis: row.eye_prophylaxis,
      nicuAdmission: row.nicu_admission ? (typeof row.nicu_admission === 'string' ? JSON.parse(row.nicu_admission) : row.nicu_admission) : null,
      twinType: row.twin_type,
      tttsStatus: row.ttts_status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Pregnancy History
  // ============================================

  /**
   * Save pregnancy history (GTPAL and prior pregnancies)
   * @param {string} patientId - Patient ID
   * @param {Object} data - History data
   * @returns {Promise<Object>} Saved history
   */
  async savePregnancyHistory(patientId, data) {
    const { episodeId, gtpal, priorPregnancies, riskFactors, orgId, userId } = data;
    const id = uuidv4();

    // Upsert the history record
    const result = await this.pool.query(
      `INSERT INTO obgyn_pregnancy_history
       (id, patient_id, episode_id, gtpal, prior_pregnancies, risk_factors, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         gtpal = $4,
         prior_pregnancies = $5,
         risk_factors = $6,
         updated_by = $8,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(gtpal),
        JSON.stringify(priorPregnancies),
        JSON.stringify(riskFactors),
        orgId,
        userId
      ]
    );

    return this._formatPregnancyHistory(result.rows[0]);
  }

  /**
   * Get pregnancy history for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} History or null
   */
  async getPregnancyHistory(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_pregnancy_history WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatPregnancyHistory(result.rows[0]) : null;
  }

  _formatPregnancyHistory(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      gtpal: row.gtpal ? (typeof row.gtpal === 'string' ? JSON.parse(row.gtpal) : row.gtpal) : null,
      priorPregnancies: row.prior_pregnancies ? (typeof row.prior_pregnancies === 'string' ? JSON.parse(row.prior_pregnancies) : row.prior_pregnancies) : [],
      riskFactors: row.risk_factors ? (typeof row.risk_factors === 'string' ? JSON.parse(row.risk_factors) : row.risk_factors) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Genetic Screening
  // ============================================

  /**
   * Save genetic screening data
   * @param {string} patientId - Patient ID
   * @param {Object} data - Screening data
   * @returns {Promise<Object>} Saved data
   */
  async saveGeneticScreening(patientId, data) {
    const { episodeId, nipt, nt, invasive, carrier, counseling, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_genetic_screening
       (id, patient_id, episode_id, nipt_results, nt_results, invasive_tests, carrier_screening, counseling_sessions, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         nipt_results = $4,
         nt_results = $5,
         invasive_tests = $6,
         carrier_screening = $7,
         counseling_sessions = $8,
         updated_by = $10,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(nipt || []),
        JSON.stringify(nt || []),
        JSON.stringify(invasive || []),
        JSON.stringify(carrier || []),
        JSON.stringify(counseling || []),
        orgId,
        userId
      ]
    );

    return this._formatGeneticScreening(result.rows[0]);
  }

  /**
   * Get genetic screening for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} Screening data or null
   */
  async getGeneticScreening(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_genetic_screening WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatGeneticScreening(result.rows[0]) : null;
  }

  _formatGeneticScreening(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      nipt: row.nipt_results ? (typeof row.nipt_results === 'string' ? JSON.parse(row.nipt_results) : row.nipt_results) : [],
      nt: row.nt_results ? (typeof row.nt_results === 'string' ? JSON.parse(row.nt_results) : row.nt_results) : [],
      invasive: row.invasive_tests ? (typeof row.invasive_tests === 'string' ? JSON.parse(row.invasive_tests) : row.invasive_tests) : [],
      carrier: row.carrier_screening ? (typeof row.carrier_screening === 'string' ? JSON.parse(row.carrier_screening) : row.carrier_screening) : [],
      counseling: row.counseling_sessions ? (typeof row.counseling_sessions === 'string' ? JSON.parse(row.counseling_sessions) : row.counseling_sessions) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Labs Tracking
  // ============================================

  /**
   * Save labs tracking data
   * @param {string} patientId - Patient ID
   * @param {Object} data - Labs data
   * @returns {Promise<Object>} Saved data
   */
  async saveLabsTracking(patientId, data) {
    const { episodeId, labs, glucoseLogs, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_labs_tracking
       (id, patient_id, episode_id, labs, glucose_logs, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         labs = $4,
         glucose_logs = $5,
         updated_by = $7,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(labs || []),
        JSON.stringify(glucoseLogs || []),
        orgId,
        userId
      ]
    );

    return this._formatLabsTracking(result.rows[0]);
  }

  /**
   * Get labs tracking for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} Labs data or null
   */
  async getLabsTracking(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_labs_tracking WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatLabsTracking(result.rows[0]) : null;
  }

  _formatLabsTracking(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      labs: row.labs ? (typeof row.labs === 'string' ? JSON.parse(row.labs) : row.labs) : [],
      glucoseLogs: row.glucose_logs ? (typeof row.glucose_logs === 'string' ? JSON.parse(row.glucose_logs) : row.glucose_logs) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Kick Counts (Fetal Movement)
  // ============================================

  /**
   * Save kick count sessions
   * @param {string} patientId - Patient ID
   * @param {Object} data - Kick count data
   * @returns {Promise<Object>} Saved data
   */
  async saveKickCounts(patientId, data) {
    const { episodeId, sessions, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_kick_counts
       (id, patient_id, episode_id, sessions, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         sessions = $4,
         updated_by = $6,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(sessions || []),
        orgId,
        userId
      ]
    );

    return this._formatKickCounts(result.rows[0]);
  }

  /**
   * Get kick counts for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} Kick count data or null
   */
  async getKickCounts(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_kick_counts WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatKickCounts(result.rows[0]) : null;
  }

  _formatKickCounts(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      sessions: row.sessions ? (typeof row.sessions === 'string' ? JSON.parse(row.sessions) : row.sessions) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Birth Plan
  // ============================================

  /**
   * Save birth plan
   * @param {string} patientId - Patient ID
   * @param {Object} data - Birth plan data
   * @returns {Promise<Object>} Saved plan
   */
  async saveBirthPlan(patientId, data) {
    const { episodeId, orgId, userId, ...planData } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_birth_plans
       (id, patient_id, episode_id, plan_data, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         plan_data = $4,
         updated_by = $6,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(planData),
        orgId,
        userId
      ]
    );

    return this._formatBirthPlan(result.rows[0]);
  }

  /**
   * Get birth plan for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} Birth plan or null
   */
  async getBirthPlan(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_birth_plans WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatBirthPlan(result.rows[0]) : null;
  }

  _formatBirthPlan(row) {
    const planData = row.plan_data ? (typeof row.plan_data === 'string' ? JSON.parse(row.plan_data) : row.plan_data) : {};
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      ...planData,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Vitals Log
  // ============================================

  /**
   * Save vitals log entry
   * @param {string} patientId - Patient ID
   * @param {Object} data - Vitals data
   * @returns {Promise<Object>} Saved entry
   */
  async saveVitalsLog(patientId, data) {
    const { episodeId, entries, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_vitals_log
       (id, patient_id, episode_id, entries, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         entries = $4,
         updated_by = $6,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(entries || []),
        orgId,
        userId
      ]
    );

    return this._formatVitalsLog(result.rows[0]);
  }

  /**
   * Get vitals log for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} Vitals log or null
   */
  async getVitalsLog(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_vitals_log WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatVitalsLog(result.rows[0]) : null;
  }

  _formatVitalsLog(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      entries: row.entries ? (typeof row.entries === 'string' ? JSON.parse(row.entries) : row.entries) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // NST/BPP Records
  // ============================================

  /**
   * Save NST record
   * @param {string} patientId - Patient ID
   * @param {Object} data - NST data
   * @returns {Promise<Object>} Saved record
   */
  async saveNSTRecord(patientId, data) {
    const { episodeId, nstRecords, bppRecords, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_fetal_assessment
       (id, patient_id, episode_id, nst_records, bpp_records, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         nst_records = $4,
         bpp_records = $5,
         updated_by = $7,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(nstRecords || []),
        JSON.stringify(bppRecords || []),
        orgId,
        userId
      ]
    );

    return this._formatFetalAssessment(result.rows[0]);
  }

  /**
   * Get fetal assessment records for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} Assessment records or null
   */
  async getFetalAssessment(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_fetal_assessment WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatFetalAssessment(result.rows[0]) : null;
  }

  _formatFetalAssessment(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      nstRecords: row.nst_records ? (typeof row.nst_records === 'string' ? JSON.parse(row.nst_records) : row.nst_records) : [],
      bppRecords: row.bpp_records ? (typeof row.bpp_records === 'string' ? JSON.parse(row.bpp_records) : row.bpp_records) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Risk Assessment
  // ============================================

  /**
   * Save risk assessment
   * @param {string} patientId - Patient ID
   * @param {Object} data - Risk assessment data
   * @returns {Promise<Object>} Saved assessment
   */
  async saveRiskAssessment(patientId, data) {
    const { episodeId, assessments, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_risk_assessments
       (id, patient_id, episode_id, assessments, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         assessments = $4,
         updated_by = $6,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(assessments || []),
        orgId,
        userId
      ]
    );

    return this._formatRiskAssessment(result.rows[0]);
  }

  /**
   * Get risk assessments for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} Risk assessments or null
   */
  async getRiskAssessment(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_risk_assessments WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatRiskAssessment(result.rows[0]) : null;
  }

  _formatRiskAssessment(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      assessments: row.assessments ? (typeof row.assessments === 'string' ? JSON.parse(row.assessments) : row.assessments) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Medication Review
  // ============================================

  /**
   * Save medication review
   * @param {string} patientId - Patient ID
   * @param {Object} data - Medication data
   * @returns {Promise<Object>} Saved review
   */
  async saveMedicationReview(patientId, data) {
    const { episodeId, medications, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_medications
       (id, patient_id, episode_id, medications, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         medications = $4,
         updated_by = $6,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(medications || []),
        orgId,
        userId
      ]
    );

    return this._formatMedicationReview(result.rows[0]);
  }

  /**
   * Get medication review for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} Medication review or null
   */
  async getMedicationReview(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_medications WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatMedicationReview(result.rows[0]) : null;
  }

  _formatMedicationReview(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      medications: row.medications ? (typeof row.medications === 'string' ? JSON.parse(row.medications) : row.medications) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Consent Management
  // ============================================

  /**
   * Save consent records
   * @param {string} patientId - Patient ID
   * @param {Object} data - Consent data
   * @returns {Promise<Object>} Saved consents
   */
  async saveConsents(patientId, data) {
    const { episodeId, consents, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_consents
       (id, patient_id, episode_id, consents, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (patient_id, COALESCE(episode_id, ''))
       DO UPDATE SET
         consents = $4,
         updated_by = $6,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        JSON.stringify(consents || []),
        orgId,
        userId
      ]
    );

    return this._formatConsents(result.rows[0]);
  }

  /**
   * Get consents for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Object|null>} Consents or null
   */
  async getConsents(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_consents WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY updated_at DESC LIMIT 1`;

    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this._formatConsents(result.rows[0]) : null;
  }

  _formatConsents(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      consents: row.consents ? (typeof row.consents === 'string' ? JSON.parse(row.consents) : row.consents) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // IVF Cycles
  // ============================================

  /**
   * Get IVF cycles for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Array>} IVF cycles
   */
  async getIVFCycles(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_ivf_cycles WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY start_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatIVFCycle(row));
  }

  /**
   * Create a new IVF cycle
   * @param {string} patientId - Patient ID
   * @param {Object} data - Cycle data
   * @returns {Promise<Object>} Created cycle
   */
  async createIVFCycle(patientId, data) {
    const id = uuidv4();
    const {
      episodeId,
      cycleType,
      protocolType,
      status,
      startDate,
      donorCycle,
      indications,
      baseline,
      semenAnalysis,
      medications,
      retrievalDate,
      oocytesRetrieved,
      matureOocytes,
      embryos,
      monitoringVisits,
      transfers,
      cryoStorage,
      outcome,
      orgId,
      userId
    } = data;

    const result = await this.pool.query(
      `INSERT INTO obgyn_ivf_cycles
       (id, patient_id, episode_id, cycle_type, protocol_type, status, start_date,
        donor_cycle, indications, baseline, semen_analysis, medications, retrieval_date,
        oocytes_retrieved, mature_oocytes, embryos, monitoring_visits, transfers,
        cryo_storage, outcome, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        cycleType,
        protocolType,
        status || 'active',
        startDate,
        donorCycle || false,
        indications ? JSON.stringify(indications) : '[]',
        baseline ? JSON.stringify(baseline) : null,
        semenAnalysis ? JSON.stringify(semenAnalysis) : null,
        medications ? JSON.stringify(medications) : null,
        retrievalDate,
        oocytesRetrieved,
        matureOocytes,
        embryos ? JSON.stringify(embryos) : null,
        monitoringVisits ? JSON.stringify(monitoringVisits) : null,
        transfers ? JSON.stringify(transfers) : null,
        cryoStorage ? JSON.stringify(cryoStorage) : null,
        outcome ? JSON.stringify(outcome) : null,
        orgId,
        userId
      ]
    );

    return this._formatIVFCycle(result.rows[0]);
  }

  /**
   * Update an IVF cycle
   * @param {string} cycleId - Cycle ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated cycle
   */
  async updateIVFCycle(cycleId, updates) {
    const {
      cycleType,
      protocolType,
      status,
      startDate,
      donorCycle,
      indications,
      baseline,
      semenAnalysis,
      medications,
      retrievalDate,
      oocytesRetrieved,
      matureOocytes,
      embryos,
      monitoringVisits,
      transfers,
      cryoStorage,
      outcome,
      userId
    } = updates;

    const result = await this.pool.query(
      `UPDATE obgyn_ivf_cycles SET
        cycle_type = COALESCE($1, cycle_type),
        protocol_type = COALESCE($2, protocol_type),
        status = COALESCE($3, status),
        start_date = COALESCE($4, start_date),
        donor_cycle = COALESCE($5, donor_cycle),
        indications = COALESCE($6, indications),
        baseline = COALESCE($7, baseline),
        semen_analysis = COALESCE($8, semen_analysis),
        medications = COALESCE($9, medications),
        retrieval_date = COALESCE($10, retrieval_date),
        oocytes_retrieved = COALESCE($11, oocytes_retrieved),
        mature_oocytes = COALESCE($12, mature_oocytes),
        embryos = COALESCE($13, embryos),
        monitoring_visits = COALESCE($14, monitoring_visits),
        transfers = COALESCE($15, transfers),
        cryo_storage = COALESCE($16, cryo_storage),
        outcome = COALESCE($17, outcome),
        updated_by = $18,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $19
       RETURNING *`,
      [
        cycleType,
        protocolType,
        status,
        startDate,
        donorCycle,
        indications ? JSON.stringify(indications) : null,
        baseline ? JSON.stringify(baseline) : null,
        semenAnalysis ? JSON.stringify(semenAnalysis) : null,
        medications ? JSON.stringify(medications) : null,
        retrievalDate,
        oocytesRetrieved,
        matureOocytes,
        embryos ? JSON.stringify(embryos) : null,
        monitoringVisits ? JSON.stringify(monitoringVisits) : null,
        transfers ? JSON.stringify(transfers) : null,
        cryoStorage ? JSON.stringify(cryoStorage) : null,
        outcome ? JSON.stringify(outcome) : null,
        userId,
        cycleId
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('IVF cycle not found');
    }

    return this._formatIVFCycle(result.rows[0]);
  }

  _formatIVFCycle(row) {
    const parseJSON = (val) => {
      if (!val) return null;
      return typeof val === 'string' ? JSON.parse(val) : val;
    };

    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      cycleType: row.cycle_type,
      protocolType: row.protocol_type,
      status: row.status,
      startDate: row.start_date,
      donorCycle: row.donor_cycle,
      indications: parseJSON(row.indications) || [],
      baseline: parseJSON(row.baseline),
      semenAnalysis: parseJSON(row.semen_analysis),
      medications: parseJSON(row.medications) || [],
      retrievalDate: row.retrieval_date,
      oocytesRetrieved: row.oocytes_retrieved,
      matureOocytes: row.mature_oocytes,
      embryos: parseJSON(row.embryos) || [],
      monitoringVisits: parseJSON(row.monitoring_visits) || [],
      transfers: parseJSON(row.transfers) || [],
      cryoStorage: parseJSON(row.cryo_storage) || [],
      outcome: parseJSON(row.outcome),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // IVF Monitoring (Daily Stimulation Tracking)
  // ============================================

  /**
   * Get monitoring records for an IVF cycle
   * @param {string} cycleId - IVF Cycle ID
   * @returns {Promise<Array>} Monitoring records
   */
  async getIVFMonitoring(cycleId) {
    const result = await this.pool.query(
      `SELECT * FROM obgyn_ivf_monitoring
       WHERE cycle_id = $1
       ORDER BY monitoring_date ASC, stim_day ASC`,
      [cycleId]
    );

    return result.rows.map(row => this._formatIVFMonitoring(row));
  }

  /**
   * Create monitoring record
   * @param {string} cycleId - IVF Cycle ID
   * @param {Object} data - Monitoring data
   * @returns {Promise<Object>} Created monitoring record
   */
  async createIVFMonitoring(cycleId, data) {
    const {
      patientId,
      monitoringDate,
      stimDay,
      folliclesRight = [],
      folliclesLeft = [],
      estradiolPgMl,
      lhMiuMl,
      progesteroneNgMl,
      endometrialThicknessMm,
      endometrialPattern,
      medicationChanges = [],
      assessment,
      plan,
      triggerReady = false,
      ohssRiskLevel,
      orgId,
      userId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_ivf_monitoring
       (id, cycle_id, patient_id, monitoring_date, stim_day,
        follicles_right, follicles_left, estradiol_pg_ml, lh_miu_ml, progesterone_ng_ml,
        endometrial_thickness_mm, endometrial_pattern, medication_changes,
        assessment, plan, trigger_ready, ohss_risk_level, org_id, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        id,
        cycleId,
        patientId,
        monitoringDate,
        stimDay,
        JSON.stringify(folliclesRight),
        JSON.stringify(folliclesLeft),
        estradiolPgMl,
        lhMiuMl,
        progesteroneNgMl,
        endometrialThicknessMm,
        endometrialPattern,
        JSON.stringify(medicationChanges),
        assessment,
        plan,
        triggerReady,
        ohssRiskLevel,
        orgId,
        userId
      ]
    );

    return this._formatIVFMonitoring(result.rows[0]);
  }

  /**
   * Update monitoring record
   * @param {string} monitoringId - Monitoring record ID
   * @param {Object} updates - Updated fields
   * @returns {Promise<Object>} Updated monitoring record
   */
  async updateIVFMonitoring(monitoringId, updates) {
    const {
      stimDay,
      folliclesRight,
      folliclesLeft,
      estradiolPgMl,
      lhMiuMl,
      progesteroneNgMl,
      endometrialThicknessMm,
      endometrialPattern,
      medicationChanges,
      assessment,
      plan,
      triggerReady,
      ohssRiskLevel
    } = updates;

    const result = await this.pool.query(
      `UPDATE obgyn_ivf_monitoring SET
        stim_day = COALESCE($1, stim_day),
        follicles_right = COALESCE($2, follicles_right),
        follicles_left = COALESCE($3, follicles_left),
        estradiol_pg_ml = COALESCE($4, estradiol_pg_ml),
        lh_miu_ml = COALESCE($5, lh_miu_ml),
        progesterone_ng_ml = COALESCE($6, progesterone_ng_ml),
        endometrial_thickness_mm = COALESCE($7, endometrial_thickness_mm),
        endometrial_pattern = COALESCE($8, endometrial_pattern),
        medication_changes = COALESCE($9, medication_changes),
        assessment = COALESCE($10, assessment),
        plan = COALESCE($11, plan),
        trigger_ready = COALESCE($12, trigger_ready),
        ohss_risk_level = COALESCE($13, ohss_risk_level),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        stimDay,
        folliclesRight ? JSON.stringify(folliclesRight) : null,
        folliclesLeft ? JSON.stringify(folliclesLeft) : null,
        estradiolPgMl,
        lhMiuMl,
        progesteroneNgMl,
        endometrialThicknessMm,
        endometrialPattern,
        medicationChanges ? JSON.stringify(medicationChanges) : null,
        assessment,
        plan,
        triggerReady,
        ohssRiskLevel,
        monitoringId
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Monitoring record not found');
    }

    return this._formatIVFMonitoring(result.rows[0]);
  }

  /**
   * Delete monitoring record
   * @param {string} monitoringId - Monitoring record ID
   * @returns {Promise<void>}
   */
  async deleteIVFMonitoring(monitoringId) {
    await this.pool.query(
      'DELETE FROM obgyn_ivf_monitoring WHERE id = $1',
      [monitoringId]
    );
  }

  _formatIVFMonitoring(row) {
    const parseJSON = (val) => {
      if (!val) return null;
      return typeof val === 'string' ? JSON.parse(val) : val;
    };

    return {
      id: row.id,
      cycleId: row.cycle_id,
      patientId: row.patient_id,
      monitoringDate: row.monitoring_date,
      stimDay: row.stim_day,
      folliclesRight: parseJSON(row.follicles_right) || [],
      folliclesLeft: parseJSON(row.follicles_left) || [],
      estradiolPgMl: row.estradiol_pg_ml ? parseFloat(row.estradiol_pg_ml) : null,
      lhMiuMl: row.lh_miu_ml ? parseFloat(row.lh_miu_ml) : null,
      progesteroneNgMl: row.progesterone_ng_ml ? parseFloat(row.progesterone_ng_ml) : null,
      endometrialThicknessMm: row.endometrial_thickness_mm ? parseFloat(row.endometrial_thickness_mm) : null,
      endometrialPattern: row.endometrial_pattern,
      medicationChanges: parseJSON(row.medication_changes) || [],
      assessment: row.assessment,
      plan: row.plan,
      triggerReady: row.trigger_ready,
      ohssRiskLevel: row.ohss_risk_level,
      recordedBy: row.recorded_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // IVF Retrievals (Egg Collection Procedures)
  // ============================================

  /**
   * Get retrieval record for a cycle
   * @param {string} cycleId - IVF Cycle ID
   * @returns {Promise<Object|null>} Retrieval record or null
   */
  async getIVFRetrieval(cycleId) {
    const result = await this.pool.query(
      'SELECT * FROM obgyn_ivf_retrievals WHERE cycle_id = $1',
      [cycleId]
    );

    return result.rows.length > 0 ? this._formatIVFRetrieval(result.rows[0]) : null;
  }

  /**
   * Create retrieval record
   * @param {string} cycleId - IVF Cycle ID
   * @param {Object} data - Retrieval data
   * @returns {Promise<Object>} Created retrieval record
   */
  async createIVFRetrieval(cycleId, data) {
    const {
      patientId,
      retrievalDate,
      retrievalTime,
      triggerDate,
      triggerTime,
      triggerMedication,
      anesthesiaType,
      anesthesiologist,
      rightOvaryFolliclesAspirated,
      leftOvaryFolliclesAspirated,
      aspirationDifficulty,
      aspirationNotes,
      totalOocytesRetrieved,
      matureOocytes,
      immatureOocytes,
      cumulusQuality,
      follicularFluidQuality,
      complications = [],
      procedureDuration,
      primaryPhysician,
      embryologist,
      physicianNotes,
      embryologistNotes,
      orgId,
      userId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_ivf_retrievals
       (id, cycle_id, patient_id, retrieval_date, retrieval_time, trigger_date, trigger_time,
        trigger_medication, anesthesia_type, anesthesiologist, right_ovary_follicles_aspirated,
        left_ovary_follicles_aspirated, aspiration_difficulty, aspiration_notes,
        total_oocytes_retrieved, mature_oocytes, immature_oocytes, cumulus_quality,
        follicular_fluid_quality, complications, procedure_duration, primary_physician,
        embryologist, physician_notes, embryologist_notes, org_id, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
       RETURNING *`,
      [
        id, cycleId, patientId, retrievalDate, retrievalTime, triggerDate, triggerTime,
        triggerMedication, anesthesiaType, anesthesiologist, rightOvaryFolliclesAspirated,
        leftOvaryFolliclesAspirated, aspirationDifficulty, aspirationNotes,
        totalOocytesRetrieved, matureOocytes, immatureOocytes, cumulusQuality,
        follicularFluidQuality, JSON.stringify(complications), procedureDuration, primaryPhysician,
        embryologist, physicianNotes, embryologistNotes, orgId, userId
      ]
    );

    return this._formatIVFRetrieval(result.rows[0]);
  }

  /**
   * Update retrieval record
   * @param {string} retrievalId - Retrieval record ID
   * @param {Object} updates - Updated fields
   * @returns {Promise<Object>} Updated retrieval record
   */
  async updateIVFRetrieval(retrievalId, updates) {
    const {
      retrievalDate, retrievalTime, triggerDate, triggerTime, triggerMedication,
      anesthesiaType, anesthesiologist, rightOvaryFolliclesAspirated,
      leftOvaryFolliclesAspirated, aspirationDifficulty, aspirationNotes,
      totalOocytesRetrieved, matureOocytes, immatureOocytes, cumulusQuality,
      follicularFluidQuality, complications, procedureDuration, primaryPhysician,
      embryologist, physicianNotes, embryologistNotes
    } = updates;

    const result = await this.pool.query(
      `UPDATE obgyn_ivf_retrievals SET
        retrieval_date = COALESCE($1, retrieval_date),
        retrieval_time = COALESCE($2, retrieval_time),
        trigger_date = COALESCE($3, trigger_date),
        trigger_time = COALESCE($4, trigger_time),
        trigger_medication = COALESCE($5, trigger_medication),
        anesthesia_type = COALESCE($6, anesthesia_type),
        anesthesiologist = COALESCE($7, anesthesiologist),
        right_ovary_follicles_aspirated = COALESCE($8, right_ovary_follicles_aspirated),
        left_ovary_follicles_aspirated = COALESCE($9, left_ovary_follicles_aspirated),
        aspiration_difficulty = COALESCE($10, aspiration_difficulty),
        aspiration_notes = COALESCE($11, aspiration_notes),
        total_oocytes_retrieved = COALESCE($12, total_oocytes_retrieved),
        mature_oocytes = COALESCE($13, mature_oocytes),
        immature_oocytes = COALESCE($14, immature_oocytes),
        cumulus_quality = COALESCE($15, cumulus_quality),
        follicular_fluid_quality = COALESCE($16, follicular_fluid_quality),
        complications = COALESCE($17, complications),
        procedure_duration = COALESCE($18, procedure_duration),
        primary_physician = COALESCE($19, primary_physician),
        embryologist = COALESCE($20, embryologist),
        physician_notes = COALESCE($21, physician_notes),
        embryologist_notes = COALESCE($22, embryologist_notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $23
       RETURNING *`,
      [
        retrievalDate, retrievalTime, triggerDate, triggerTime, triggerMedication,
        anesthesiaType, anesthesiologist, rightOvaryFolliclesAspirated,
        leftOvaryFolliclesAspirated, aspirationDifficulty, aspirationNotes,
        totalOocytesRetrieved, matureOocytes, immatureOocytes, cumulusQuality,
        follicularFluidQuality, complications ? JSON.stringify(complications) : null,
        procedureDuration, primaryPhysician, embryologist, physicianNotes,
        embryologistNotes, retrievalId
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Retrieval record not found');
    }

    return this._formatIVFRetrieval(result.rows[0]);
  }

  _formatIVFRetrieval(row) {
    const parseJSON = (val) => {
      if (!val) return null;
      return typeof val === 'string' ? JSON.parse(val) : val;
    };

    return {
      id: row.id,
      cycleId: row.cycle_id,
      patientId: row.patient_id,
      retrievalDate: row.retrieval_date,
      retrievalTime: row.retrieval_time,
      triggerDate: row.trigger_date,
      triggerTime: row.trigger_time,
      triggerMedication: row.trigger_medication,
      anesthesiaType: row.anesthesia_type,
      anesthesiologist: row.anesthesiologist,
      rightOvaryFolliclesAspirated: row.right_ovary_follicles_aspirated,
      leftOvaryFolliclesAspirated: row.left_ovary_follicles_aspirated,
      aspirationDifficulty: row.aspiration_difficulty,
      aspirationNotes: row.aspiration_notes,
      totalOocytesRetrieved: row.total_oocytes_retrieved,
      matureOocytes: row.mature_oocytes,
      immatureOocytes: row.immature_oocytes,
      cumulusQuality: row.cumulus_quality,
      follicularFluidQuality: row.follicular_fluid_quality,
      complications: parseJSON(row.complications) || [],
      procedureDuration: row.procedure_duration,
      primaryPhysician: row.primary_physician,
      embryologist: row.embryologist,
      physicianNotes: row.physician_notes,
      embryologistNotes: row.embryologist_notes,
      recordedBy: row.recorded_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // IVF Oocytes (Individual Oocyte Tracking)
  // ============================================

  /**
   * Get oocytes for a retrieval
   * @param {string} retrievalId - Retrieval ID
   * @returns {Promise<Array>} Oocyte records
   */
  async getIVFOocytes(retrievalId) {
    const result = await this.pool.query(
      'SELECT * FROM obgyn_ivf_oocytes WHERE retrieval_id = $1 ORDER BY oocyte_number ASC',
      [retrievalId]
    );

    return result.rows.map(row => this._formatIVFOocyte(row));
  }

  /**
   * Create oocyte record
   * @param {string} retrievalId - Retrieval ID
   * @param {Object} data - Oocyte data
   * @returns {Promise<Object>} Created oocyte record
   */
  async createIVFOocyte(retrievalId, data) {
    const {
      cycleId, patientId, oocyteNumber, ovarySide, maturityGrade, cumulusCells,
      fertilizationMethod, inseminationTime, fertilizationCheckTime, pronucleiCount,
      fertilizationStatus, polarBodies, cytoplasmQuality, zonaPellucida,
      developedToEmbryo, embryoId, embryologistNotes, orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_ivf_oocytes
       (id, retrieval_id, cycle_id, patient_id, oocyte_number, ovary_side, maturity_grade,
        cumulus_cells, fertilization_method, insemination_time, fertilization_check_time,
        pronuclei_count, fertilization_status, polar_bodies, cytoplasm_quality, zona_pellucida,
        developed_to_embryo, embryo_id, embryologist_notes, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        id, retrievalId, cycleId, patientId, oocyteNumber, ovarySide, maturityGrade,
        cumulusCells, fertilizationMethod, inseminationTime, fertilizationCheckTime,
        pronucleiCount, fertilizationStatus, polarBodies, cytoplasmQuality, zonaPellucida,
        developedToEmbryo, embryoId, embryologistNotes, orgId
      ]
    );

    return this._formatIVFOocyte(result.rows[0]);
  }

  /**
   * Update oocyte record
   * @param {string} oocyteId - Oocyte record ID
   * @param {Object} updates - Updated fields
   * @returns {Promise<Object>} Updated oocyte record
   */
  async updateIVFOocyte(oocyteId, updates) {
    const {
      fertilizationMethod, inseminationTime, fertilizationCheckTime, pronucleiCount,
      fertilizationStatus, polarBodies, cytoplasmQuality, zonaPellucida,
      developedToEmbryo, embryoId, embryologistNotes
    } = updates;

    const result = await this.pool.query(
      `UPDATE obgyn_ivf_oocytes SET
        fertilization_method = COALESCE($1, fertilization_method),
        insemination_time = COALESCE($2, insemination_time),
        fertilization_check_time = COALESCE($3, fertilization_check_time),
        pronuclei_count = COALESCE($4, pronuclei_count),
        fertilization_status = COALESCE($5, fertilization_status),
        polar_bodies = COALESCE($6, polar_bodies),
        cytoplasm_quality = COALESCE($7, cytoplasm_quality),
        zona_pellucida = COALESCE($8, zona_pellucida),
        developed_to_embryo = COALESCE($9, developed_to_embryo),
        embryo_id = COALESCE($10, embryo_id),
        embryologist_notes = COALESCE($11, embryologist_notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        fertilizationMethod, inseminationTime, fertilizationCheckTime, pronucleiCount,
        fertilizationStatus, polarBodies, cytoplasmQuality, zonaPellucida,
        developedToEmbryo, embryoId, embryologistNotes, oocyteId
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Oocyte record not found');
    }

    return this._formatIVFOocyte(result.rows[0]);
  }

  _formatIVFOocyte(row) {
    return {
      id: row.id,
      retrievalId: row.retrieval_id,
      cycleId: row.cycle_id,
      patientId: row.patient_id,
      oocyteNumber: row.oocyte_number,
      ovarySide: row.ovary_side,
      maturityGrade: row.maturity_grade,
      cumulusCells: row.cumulus_cells,
      fertilizationMethod: row.fertilization_method,
      inseminationTime: row.insemination_time,
      fertilizationCheckTime: row.fertilization_check_time,
      pronucleiCount: row.pronuclei_count,
      fertilizationStatus: row.fertilization_status,
      polarBodies: row.polar_bodies,
      cytoplasmQuality: row.cytoplasm_quality,
      zonaPellucida: row.zona_pellucida,
      developedToEmbryo: row.developed_to_embryo,
      embryoId: row.embryo_id,
      embryologistNotes: row.embryologist_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // IVF Embryo Development (Day-by-Day Tracking)
  // ============================================

  /**
   * Get embryo development records for a cycle
   * @param {string} cycleId - IVF Cycle ID
   * @returns {Promise<Array>} Embryo development records
   */
  async getIVFEmbryoDevelopment(cycleId) {
    const result = await this.pool.query(
      'SELECT * FROM obgyn_ivf_embryo_development WHERE cycle_id = $1 ORDER BY embryo_number ASC',
      [cycleId]
    );

    return result.rows.map(row => this._formatIVFEmbryoDevelopment(row));
  }

  /**
   * Helper: Convert time string (HH:MM) to timestamp using today's date
   * @param {string} timeStr - Time in HH:MM format or full timestamp
   * @returns {string|null} ISO timestamp or null
   */
  _timeToTimestamp(timeStr) {
    if (!timeStr || timeStr.trim() === '') return null;

    // If already a full timestamp, return as-is
    if (timeStr.includes('T') || timeStr.includes(' ')) {
      return timeStr;
    }

    // Convert HH:MM to today's date + time
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${today}T${timeStr}:00`;
  }

  /**
   * Create embryo development record
   * @param {string} cycleId - IVF Cycle ID
   * @param {Object} data - Embryo development data
   * @returns {Promise<Object>} Created embryo development record
   */
  async createIVFEmbryoDevelopment(cycleId, data) {
    const {
      oocyteId, patientId, embryoNumber,
      day1CheckTime, day1Pronuclei, day1PolarBodies, day1Status, day1Notes,
      day2CheckTime, day2CellCount, day2Fragmentation, day2Symmetry, day2Grade, day2Notes,
      day3CheckTime, day3CellCount, day3Fragmentation, day3Symmetry, day3Compaction, day3Grade, day3Notes,
      day4CheckTime, day4Stage, day4Notes,
      day5CheckTime, day5Stage, day5Expansion, day5IcmGrade, day5TeGrade, day5OverallGrade, day5Notes,
      day6CheckTime, day6Stage, day6Expansion, day6IcmGrade, day6TeGrade, day6OverallGrade, day6Notes,
      day7CheckTime, day7Stage, day7Notes,
      cultureMedia, incubatorType, co2Concentration, o2Concentration,
      finalDisposition, dispositionDate, freezingMethod, thawSurvival,
      biopsyDate, biopsyDay, pgtResult, pgtDetails,
      primaryEmbryologist, orgId
    } = data;

    const id = uuidv4();

    // Convert time-only strings to full timestamps
    const day1Timestamp = this._timeToTimestamp(day1CheckTime);
    const day2Timestamp = this._timeToTimestamp(day2CheckTime);
    const day3Timestamp = this._timeToTimestamp(day3CheckTime);
    const day4Timestamp = this._timeToTimestamp(day4CheckTime);
    const day5Timestamp = this._timeToTimestamp(day5CheckTime);
    const day6Timestamp = this._timeToTimestamp(day6CheckTime);
    const day7Timestamp = this._timeToTimestamp(day7CheckTime);

    const result = await this.pool.query(
      `INSERT INTO obgyn_ivf_embryo_development
       (id, oocyte_id, cycle_id, patient_id, embryo_number,
        day1_check_time, day1_pronuclei, day1_polar_bodies, day1_status, day1_notes,
        day2_check_time, day2_cell_count, day2_fragmentation, day2_symmetry, day2_grade, day2_notes,
        day3_check_time, day3_cell_count, day3_fragmentation, day3_symmetry, day3_compaction, day3_grade, day3_notes,
        day4_check_time, day4_stage, day4_notes,
        day5_check_time, day5_stage, day5_expansion, day5_icm_grade, day5_te_grade, day5_overall_grade, day5_notes,
        day6_check_time, day6_stage, day6_expansion, day6_icm_grade, day6_te_grade, day6_overall_grade, day6_notes,
        day7_check_time, day7_stage, day7_notes,
        culture_media, incubator_type, co2_concentration, o2_concentration,
        final_disposition, disposition_date, freezing_method, thaw_survival,
        biopsy_date, biopsy_day, pgt_result, pgt_details,
        primary_embryologist, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
               $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
               $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
               $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57)
       RETURNING *`,
      [
        id, oocyteId, cycleId, patientId, embryoNumber,
        day1Timestamp, day1Pronuclei, day1PolarBodies, day1Status, day1Notes,
        day2Timestamp, day2CellCount, day2Fragmentation, day2Symmetry, day2Grade, day2Notes,
        day3Timestamp, day3CellCount, day3Fragmentation, day3Symmetry, day3Compaction, day3Grade, day3Notes,
        day4Timestamp, day4Stage, day4Notes,
        day5Timestamp, day5Stage, day5Expansion, day5IcmGrade, day5TeGrade, day5OverallGrade, day5Notes,
        day6Timestamp, day6Stage, day6Expansion, day6IcmGrade, day6TeGrade, day6OverallGrade, day6Notes,
        day7Timestamp, day7Stage, day7Notes,
        cultureMedia, incubatorType, co2Concentration, o2Concentration,
        finalDisposition, dispositionDate, freezingMethod, thawSurvival,
        biopsyDate, biopsyDay, pgtResult, pgtDetails ? JSON.stringify(pgtDetails) : null,
        primaryEmbryologist, orgId
      ]
    );

    return this._formatIVFEmbryoDevelopment(result.rows[0]);
  }

  /**
   * Update embryo development record
   * @param {string} embryoId - Embryo development record ID
   * @param {Object} updates - Updated fields
   * @returns {Promise<Object>} Updated embryo development record
   */
  async updateIVFEmbryoDevelopment(embryoId, updates) {
    // This is a complex update with many optional fields
    // Build dynamic query based on provided fields
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Helper to add field to update
    const addField = (dbField, value) => {
      if (value !== undefined && value !== null) {
        fields.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    };

    // Day 1 fields
    addField('day1_check_time', this._timeToTimestamp(updates.day1CheckTime));
    addField('day1_pronuclei', updates.day1Pronuclei);
    addField('day1_polar_bodies', updates.day1PolarBodies);
    addField('day1_status', updates.day1Status);
    addField('day1_notes', updates.day1Notes);

    // Day 2 fields
    addField('day2_check_time', this._timeToTimestamp(updates.day2CheckTime));
    addField('day2_cell_count', updates.day2CellCount);
    addField('day2_fragmentation', updates.day2Fragmentation);
    addField('day2_symmetry', updates.day2Symmetry);
    addField('day2_grade', updates.day2Grade);
    addField('day2_notes', updates.day2Notes);

    // Day 3 fields
    addField('day3_check_time', this._timeToTimestamp(updates.day3CheckTime));
    addField('day3_cell_count', updates.day3CellCount);
    addField('day3_fragmentation', updates.day3Fragmentation);
    addField('day3_symmetry', updates.day3Symmetry);
    addField('day3_compaction', updates.day3Compaction);
    addField('day3_grade', updates.day3Grade);
    addField('day3_notes', updates.day3Notes);

    // Day 4 fields
    addField('day4_check_time', this._timeToTimestamp(updates.day4CheckTime));
    addField('day4_stage', updates.day4Stage);
    addField('day4_notes', updates.day4Notes);

    // Day 5 fields
    addField('day5_check_time', this._timeToTimestamp(updates.day5CheckTime));
    addField('day5_stage', updates.day5Stage);
    addField('day5_expansion', updates.day5Expansion);
    addField('day5_icm_grade', updates.day5IcmGrade);
    addField('day5_te_grade', updates.day5TeGrade);
    addField('day5_overall_grade', updates.day5OverallGrade);
    addField('day5_notes', updates.day5Notes);

    // Day 6 fields
    addField('day6_check_time', this._timeToTimestamp(updates.day6CheckTime));
    addField('day6_stage', updates.day6Stage);
    addField('day6_expansion', updates.day6Expansion);
    addField('day6_icm_grade', updates.day6IcmGrade);
    addField('day6_te_grade', updates.day6TeGrade);
    addField('day6_overall_grade', updates.day6OverallGrade);
    addField('day6_notes', updates.day6Notes);

    // Day 7 fields
    addField('day7_check_time', this._timeToTimestamp(updates.day7CheckTime));
    addField('day7_stage', updates.day7Stage);
    addField('day7_notes', updates.day7Notes);

    // Culture and outcome fields
    addField('culture_media', updates.cultureMedia);
    addField('incubator_type', updates.incubatorType);
    addField('co2_concentration', updates.co2Concentration);
    addField('o2_concentration', updates.o2Concentration);
    addField('final_disposition', updates.finalDisposition);
    addField('disposition_date', updates.dispositionDate);
    addField('freezing_method', updates.freezingMethod);
    addField('thaw_survival', updates.thawSurvival);
    addField('biopsy_date', updates.biopsyDate);
    addField('biopsy_day', updates.biopsyDay);
    addField('pgt_result', updates.pgtResult);
    if (updates.pgtDetails) {
      addField('pgt_details', JSON.stringify(updates.pgtDetails));
    }
    addField('primary_embryologist', updates.primaryEmbryologist);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Always update timestamp
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(embryoId);

    const query = `UPDATE obgyn_ivf_embryo_development SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await this.pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Embryo development record not found');
    }

    return this._formatIVFEmbryoDevelopment(result.rows[0]);
  }

  _formatIVFEmbryoDevelopment(row) {
    const parseJSON = (val) => {
      if (!val) return null;
      return typeof val === 'string' ? JSON.parse(val) : val;
    };

    return {
      id: row.id,
      oocyteId: row.oocyte_id,
      cycleId: row.cycle_id,
      patientId: row.patient_id,
      embryoNumber: row.embryo_number,
      day1CheckTime: row.day1_check_time,
      day1Pronuclei: row.day1_pronuclei,
      day1PolarBodies: row.day1_polar_bodies,
      day1Status: row.day1_status,
      day1Notes: row.day1_notes,
      day2CheckTime: row.day2_check_time,
      day2CellCount: row.day2_cell_count,
      day2Fragmentation: row.day2_fragmentation,
      day2Symmetry: row.day2_symmetry,
      day2Grade: row.day2_grade,
      day2Notes: row.day2_notes,
      day3CheckTime: row.day3_check_time,
      day3CellCount: row.day3_cell_count,
      day3Fragmentation: row.day3_fragmentation,
      day3Symmetry: row.day3_symmetry,
      day3Compaction: row.day3_compaction,
      day3Grade: row.day3_grade,
      day3Notes: row.day3_notes,
      day4CheckTime: row.day4_check_time,
      day4Stage: row.day4_stage,
      day4Notes: row.day4_notes,
      day5CheckTime: row.day5_check_time,
      day5Stage: row.day5_stage,
      day5Expansion: row.day5_expansion,
      day5IcmGrade: row.day5_icm_grade,
      day5TeGrade: row.day5_te_grade,
      day5OverallGrade: row.day5_overall_grade,
      day5Notes: row.day5_notes,
      day6CheckTime: row.day6_check_time,
      day6Stage: row.day6_stage,
      day6Expansion: row.day6_expansion,
      day6IcmGrade: row.day6_icm_grade,
      day6TeGrade: row.day6_te_grade,
      day6OverallGrade: row.day6_overall_grade,
      day6Notes: row.day6_notes,
      day7CheckTime: row.day7_check_time,
      day7Stage: row.day7_stage,
      day7Notes: row.day7_notes,
      cultureMedia: row.culture_media,
      incubatorType: row.incubator_type,
      co2Concentration: row.co2_concentration ? parseFloat(row.co2_concentration) : null,
      o2Concentration: row.o2_concentration ? parseFloat(row.o2_concentration) : null,
      finalDisposition: row.final_disposition,
      dispositionDate: row.disposition_date,
      freezingMethod: row.freezing_method,
      thawSurvival: row.thaw_survival,
      biopsyDate: row.biopsy_date,
      biopsyDay: row.biopsy_day,
      pgtResult: row.pgt_result,
      pgtDetails: parseJSON(row.pgt_details),
      primaryEmbryologist: row.primary_embryologist,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ============================================
  // Cervical Length
  // ============================================

  /**
   * Get cervical length measurements for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Array>} Measurements
   */
  async getCervicalLengths(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_cervical_length WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatCervicalLength(row));
  }

  /**
   * Save cervical length measurement
   * @param {string} patientId - Patient ID
   * @param {Object} data - Measurement data
   * @returns {Promise<Object>} Saved measurement
   */
  async saveCervicalLength(patientId, data) {
    const id = uuidv4();
    const {
      episodeId,
      date,
      gestationalAge,
      length,
      method,
      funneling,
      funnelingLength,
      internalOsOpen,
      notes,
      orgId,
      userId
    } = data;

    const result = await this.pool.query(
      `INSERT INTO obgyn_cervical_length
       (id, patient_id, episode_id, date, gestational_age, length, method,
        funneling, funneling_length, internal_os_open, notes, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        date,
        gestationalAge,
        length,
        method,
        funneling || false,
        funnelingLength,
        internalOsOpen || false,
        notes,
        orgId,
        userId
      ]
    );

    return this._formatCervicalLength(result.rows[0]);
  }

  _formatCervicalLength(row) {
    return {
      id: row.id,
      patientId: row.patient_id,
      episodeId: row.episode_id,
      date: row.date,
      gestationalAge: row.gestational_age,
      length: row.length,
      method: row.method,
      funneling: row.funneling,
      funnelingLength: row.funneling_length,
      internalOsOpen: row.internal_os_open,
      notes: row.notes,
      createdAt: row.created_at
    };
  }

  // ============================================
  // Patient Education
  // ============================================

  /**
   * Get patient education records
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID
   * @returns {Promise<Array>} Education records
   */
  async getPatientEducation(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_patient_education WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY completed_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => ({
      moduleId: row.module_id,
      completed: row.completed,
      completedDate: row.completed_date,
      episodeId: row.episode_id
    }));
  }

  /**
   * Save patient education record
   * @param {string} patientId - Patient ID
   * @param {Object} data - Education data
   * @returns {Promise<Object>} Saved record
   */
  async savePatientEducation(patientId, data) {
    const { moduleId, completed, completedDate, episodeId, orgId, userId } = data;

    const result = await this.pool.query(
      `INSERT INTO obgyn_patient_education
       (patient_id, episode_id, module_id, completed, completed_date, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (patient_id, module_id)
       DO UPDATE SET
         completed = $4,
         completed_date = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        patientId,
        episodeId,
        moduleId,
        completed,
        completedDate,
        orgId,
        userId
      ]
    );

    return {
      moduleId: result.rows[0].module_id,
      completed: result.rows[0].completed,
      completedDate: result.rows[0].completed_date,
      episodeId: result.rows[0].episode_id
    };
  }

  // ============================================
  // Care Plans (FHIR R4)
  // ============================================

  /**
   * Get care plans for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [episodeId] - Optional episode ID filter
   * @returns {Promise<Array>} Care plans
   */
  async getCarePlans(patientId, episodeId = null) {
    let query = `SELECT * FROM obgyn_care_plans WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatCarePlan(row));
  }

  /**
   * Create a new care plan
   * @param {string} patientId - Patient ID
   * @param {Object} data - Care plan data
   * @returns {Promise<Object>} Created care plan
   */
  async createCarePlan(patientId, data) {
    const { carePlan, episodeId, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_care_plans
       (id, patient_id, episode_id, status, intent, title, description, 
        period_start, period_end, activity, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        id,
        patientId,
        episodeId,
        carePlan.status || 'active',
        carePlan.intent || 'plan',
        carePlan.title,
        carePlan.description,
        carePlan.period?.start,
        carePlan.period?.end,
        JSON.stringify(carePlan.activity || []),
        orgId,
        userId
      ]
    );

    return this._formatCarePlan(result.rows[0]);
  }

  /**
   * Update a care plan
   * @param {string} carePlanId - Care plan ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated care plan
   */
  async updateCarePlan(carePlanId, updates) {
    const { status, title, description, activity } = updates;
    
    const result = await this.pool.query(
      `UPDATE obgyn_care_plans
       SET status = COALESCE($2, status),
           title = COALESCE($3, title),
           description = COALESCE($4, description),
           activity = COALESCE($5, activity),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [
        carePlanId,
        status,
        title,
        description,
        activity ? JSON.stringify(activity) : null
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Care plan not found');
    }

    return this._formatCarePlan(result.rows[0]);
  }

  /**
   * Add activity to care plan
   * @param {string} carePlanId - Care plan ID
   * @param {Object} activity - Activity to add
   * @returns {Promise<Object>} Updated care plan
   */
  async addCarePlanActivity(carePlanId, activity) {
    // Get current activities
    const current = await this.pool.query(
      `SELECT activity FROM obgyn_care_plans WHERE id = $1`,
      [carePlanId]
    );

    if (current.rows.length === 0) {
      throw new Error('Care plan not found');
    }

    const activities = current.rows[0].activity || [];
    activities.push(activity);

    const result = await this.pool.query(
      `UPDATE obgyn_care_plans
       SET activity = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [carePlanId, JSON.stringify(activities)]
    );

    return this._formatCarePlan(result.rows[0]);
  }

  /**
   * Update activity status
   * @param {string} carePlanId - Care plan ID
   * @param {number} activityIndex - Index of activity to update
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated care plan
   */
  async updateActivityStatus(carePlanId, activityIndex, status) {
    // Get current activities
    const current = await this.pool.query(
      `SELECT activity FROM obgyn_care_plans WHERE id = $1`,
      [carePlanId]
    );

    if (current.rows.length === 0) {
      throw new Error('Care plan not found');
    }

    const activities = current.rows[0].activity || [];
    if (activityIndex < 0 || activityIndex >= activities.length) {
      throw new Error('Invalid activity index');
    }

    activities[activityIndex].detail.status = status;

    const result = await this.pool.query(
      `UPDATE obgyn_care_plans
       SET activity = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [carePlanId, JSON.stringify(activities)]
    );

    return this._formatCarePlan(result.rows[0]);
  }

  /**
   * Format care plan from database row
   */
  _formatCarePlan(row) {
    return {
      id: row.id,
      resourceType: 'CarePlan',
      status: row.status,
      intent: row.intent,
      title: row.title,
      description: row.description,
      subject: { reference: `Patient/${row.patient_id}` },
      period: {
        start: row.period_start,
        end: row.period_end
      },
      created: row.created_at,
      activity: row.activity || [],
      episodeId: row.episode_id
    };
  }

  // ============================================
  // Goals (FHIR R4)
  // ============================================

  /**
   * Get goals for a patient
   * @param {string} patientId - Patient ID
   * @param {string} [carePlanId] - Optional care plan ID filter
   * @param {string} [episodeId] - Optional episode ID filter
   * @returns {Promise<Array>} Goals
   */
  async getGoals(patientId, carePlanId = null, episodeId = null) {
    let query = `SELECT * FROM obgyn_goals WHERE patient_id = $1`;
    const params = [patientId];
    let paramIndex = 2;

    if (carePlanId) {
      query += ` AND care_plan_id = $${paramIndex}`;
      params.push(carePlanId);
      paramIndex++;
    }

    if (episodeId) {
      query += ` AND episode_id = $${paramIndex}`;
      params.push(episodeId);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatGoal(row));
  }

  /**
   * Create a new goal
   * @param {string} patientId - Patient ID
   * @param {Object} data - Goal data
   * @returns {Promise<Object>} Created goal
   */
  async createGoal(patientId, data) {
    const { goal, carePlanId, episodeId, orgId, userId } = data;
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO obgyn_goals
       (id, patient_id, care_plan_id, episode_id, lifecycle_status, priority, 
        category, description, start_date, target, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        id,
        patientId,
        carePlanId,
        episodeId,
        goal.lifecycleStatus || 'active',
        JSON.stringify(goal.priority),
        JSON.stringify(goal.category),
        goal.description?.text,
        goal.startDate,
        JSON.stringify(goal.target),
        orgId,
        userId
      ]
    );

    return this._formatGoal(result.rows[0]);
  }

  /**
   * Update a goal
   * @param {string} goalId - Goal ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated goal
   */
  async updateGoal(goalId, updates) {
    const { lifecycleStatus, achievementStatus, note } = updates;
    
    const result = await this.pool.query(
      `UPDATE obgyn_goals
       SET lifecycle_status = COALESCE($2, lifecycle_status),
           achievement_status = COALESCE($3, achievement_status),
           notes = COALESCE($4, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [
        goalId,
        lifecycleStatus,
        achievementStatus ? JSON.stringify(achievementStatus) : null,
        note ? JSON.stringify(note) : null
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Goal not found');
    }

    return this._formatGoal(result.rows[0]);
  }

  /**
   * Delete a goal
   * @param {string} goalId - Goal ID
   */
  async deleteGoal(goalId) {
    await this.pool.query(`DELETE FROM obgyn_goals WHERE id = $1`, [goalId]);
  }

  /**
   * Format goal from database row
   */
  _formatGoal(row) {
    return {
      id: row.id,
      resourceType: 'Goal',
      lifecycleStatus: row.lifecycle_status,
      achievementStatus: row.achievement_status,
      priority: row.priority,
      category: row.category,
      description: { text: row.description },
      subject: { reference: `Patient/${row.patient_id}` },
      startDate: row.start_date,
      target: row.target,
      carePlanId: row.care_plan_id,
      episodeId: row.episode_id,
      note: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = ObGynService;
