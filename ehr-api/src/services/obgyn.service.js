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
        donor_cycle, baseline, semen_analysis, medications, retrieval_date,
        oocytes_retrieved, mature_oocytes, embryos, monitoring_visits, transfers,
        cryo_storage, outcome, org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
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
        baseline = COALESCE($6, baseline),
        semen_analysis = COALESCE($7, semen_analysis),
        medications = COALESCE($8, medications),
        retrieval_date = COALESCE($9, retrieval_date),
        oocytes_retrieved = COALESCE($10, oocytes_retrieved),
        mature_oocytes = COALESCE($11, mature_oocytes),
        embryos = COALESCE($12, embryos),
        monitoring_visits = COALESCE($13, monitoring_visits),
        transfers = COALESCE($14, transfers),
        cryo_storage = COALESCE($15, cryo_storage),
        outcome = COALESCE($16, outcome),
        updated_by = $17,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $18
       RETURNING *`,
      [
        cycleType,
        protocolType,
        status,
        startDate,
        donorCycle,
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
}

module.exports = ObGynService;
