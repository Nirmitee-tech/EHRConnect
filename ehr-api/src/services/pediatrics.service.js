/**
 * Pediatrics Service
 * Manages pediatric-specific clinical data including:
 * - Demographics and birth data
 * - Growth records and percentile calculations
 * - Vital signs with age-appropriate validation
 * - Well-child visits
 * - Immunizations and scheduling
 * - Developmental and health screenings
 */

const { v4: uuidv4 } = require('uuid');

class PediatricsService {
  constructor(pool) {
    this.pool = pool;
  }

  // ============================================
  // Demographics
  // ============================================

  async saveDemographics(data) {
    const {
      patientId,
      birthWeightGrams,
      birthLengthCm,
      birthHeadCircumferenceCm,
      gestationalAgeWeeks,
      gestationalAgeDays,
      linkedMaternalPatientId,
      birthHospital,
      birthComplications,
      apgar1min,
      apgar5min,
      multipleBirth,
      multipleBirthOrder,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO pediatric_patient_demographics
       (id, patient_id, birth_weight_grams, birth_length_cm, birth_head_circumference_cm,
        gestational_age_weeks, gestational_age_days, linked_maternal_patient_id, birth_hospital,
        birth_complications, apgar_1min, apgar_5min, multiple_birth, multiple_birth_order, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (patient_id) 
       DO UPDATE SET
         birth_weight_grams = EXCLUDED.birth_weight_grams,
         birth_length_cm = EXCLUDED.birth_length_cm,
         birth_head_circumference_cm = EXCLUDED.birth_head_circumference_cm,
         gestational_age_weeks = EXCLUDED.gestational_age_weeks,
         gestational_age_days = EXCLUDED.gestational_age_days,
         linked_maternal_patient_id = EXCLUDED.linked_maternal_patient_id,
         birth_hospital = EXCLUDED.birth_hospital,
         birth_complications = EXCLUDED.birth_complications,
         apgar_1min = EXCLUDED.apgar_1min,
         apgar_5min = EXCLUDED.apgar_5min,
         multiple_birth = EXCLUDED.multiple_birth,
         multiple_birth_order = EXCLUDED.multiple_birth_order,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id, patientId, birthWeightGrams, birthLengthCm, birthHeadCircumferenceCm,
        gestationalAgeWeeks, gestationalAgeDays, linkedMaternalPatientId, birthHospital,
        birthComplications, apgar1min, apgar5min, multipleBirth, multipleBirthOrder, orgId
      ]
    );

    return this._formatDemographics(result.rows[0]);
  }

  async getDemographics(patientId) {
    const result = await this.pool.query(
      `SELECT * FROM pediatric_patient_demographics WHERE patient_id = $1`,
      [patientId]
    );

    return result.rows[0] ? this._formatDemographics(result.rows[0]) : null;
  }

  // ============================================
  // Growth Records
  // ============================================

  async saveGrowthRecord(data) {
    const {
      patientId,
      episodeId,
      measurementDate,
      ageMonths,
      weightKg,
      lengthHeightCm,
      headCircumferenceCm,
      recordedBy,
      orgId
    } = data;

    const id = uuidv4();

    // Calculate percentiles and z-scores
    const percentiles = await this._calculatePercentiles(ageMonths, {
      weightKg,
      lengthHeightCm,
      headCircumferenceCm
    });

    // Calculate BMI if applicable (age > 24 months)
    let bmi = null;
    let bmiPercentile = null;
    let bmiZscore = null;
    let bmiCategory = null;

    if (ageMonths >= 24 && weightKg && lengthHeightCm) {
      const heightM = lengthHeightCm / 100;
      bmi = weightKg / (heightM * heightM);
      const bmiStats = await this._calculateBMIPercentile(ageMonths, bmi);
      bmiPercentile = bmiStats.percentile;
      bmiZscore = bmiStats.zscore;
      bmiCategory = this._categorizeBMI(bmiPercentile);
    }

    const result = await this.pool.query(
      `INSERT INTO pediatric_growth_records
       (id, patient_id, episode_id, measurement_date, age_months, weight_kg, 
        weight_percentile, weight_zscore, length_height_cm, length_height_percentile, 
        length_height_zscore, head_circumference_cm, head_circumference_percentile, 
        head_circumference_zscore, bmi, bmi_percentile, bmi_zscore, bmi_category, 
        growth_chart_type, recorded_by, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`,
      [
        id, patientId, episodeId, measurementDate, ageMonths, weightKg,
        percentiles.weightPercentile, percentiles.weightZscore, lengthHeightCm,
        percentiles.lengthHeightPercentile, percentiles.lengthHeightZscore,
        headCircumferenceCm, percentiles.headCircumferencePercentile,
        percentiles.headCircumferenceZscore, bmi, bmiPercentile, bmiZscore,
        bmiCategory, ageMonths < 24 ? 'WHO' : 'CDC', recordedBy, orgId
      ]
    );

    return this._formatGrowthRecord(result.rows[0]);
  }

  async getGrowthRecords(patientId, options = {}) {
    const { episodeId, startDate, endDate } = options;
    let query = `SELECT * FROM pediatric_growth_records WHERE patient_id = $1`;
    const params = [patientId];
    let paramIndex = 2;

    if (episodeId) {
      query += ` AND episode_id = $${paramIndex}`;
      params.push(episodeId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND measurement_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND measurement_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY measurement_date ASC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatGrowthRecord(row));
  }

  async calculateGrowthPercentiles(patientId) {
    const records = await this.getGrowthRecords(patientId);
    
    if (records.length === 0) {
      return null;
    }

    const latest = records[records.length - 1];
    return {
      latestMeasurement: latest,
      growthVelocity: this._calculateGrowthVelocity(records),
      percentiles: {
        weight: latest.weightPercentile,
        lengthHeight: latest.lengthHeightPercentile,
        headCircumference: latest.headCircumferencePercentile,
        bmi: latest.bmiPercentile
      }
    };
  }

  // ============================================
  // Vital Signs
  // ============================================

  async saveVitalSigns(data) {
    const {
      patientId,
      episodeId,
      measurementDatetime,
      ageGroup,
      heartRate,
      respiratoryRate,
      systolicBp,
      diastolicBp,
      temperatureCelsius,
      oxygenSaturation,
      painScore,
      notes,
      recordedBy,
      orgId
    } = data;

    const id = uuidv4();

    // Validate vitals against age-appropriate ranges
    const flags = this._validateVitalSigns(ageGroup, {
      heartRate,
      respiratoryRate,
      systolicBp,
      diastolicBp
    });

    const result = await this.pool.query(
      `INSERT INTO pediatric_vital_signs
       (id, patient_id, episode_id, measurement_datetime, age_group, heart_rate, 
        heart_rate_flag, respiratory_rate, respiratory_rate_flag, systolic_bp, 
        diastolic_bp, bp_flag, temperature_celsius, oxygen_saturation, pain_score, 
        notes, recorded_by, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        id, patientId, episodeId, measurementDatetime, ageGroup, heartRate,
        flags.heartRateFlag, respiratoryRate, flags.respiratoryRateFlag,
        systolicBp, diastolicBp, flags.bpFlag, temperatureCelsius,
        oxygenSaturation, painScore, notes, recordedBy, orgId
      ]
    );

    return this._formatVitalSigns(result.rows[0]);
  }

  async getVitalSigns(patientId, options = {}) {
    const { episodeId, limit = 20 } = options;
    let query = `SELECT * FROM pediatric_vital_signs WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY measurement_datetime DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatVitalSigns(row));
  }

  // ============================================
  // Well-Child Visits
  // ============================================

  async saveWellVisit(data) {
    const {
      patientId,
      episodeId,
      visitDate,
      visitType,
      ageAtVisitMonths,
      completed,
      chiefConcerns,
      developmentalMilestones,
      physicalExam,
      anticipatoryGuidanceProvided,
      nextVisitDue,
      provider,
      notes,
      recordedBy,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO pediatric_well_visits
       (id, patient_id, episode_id, visit_date, visit_type, age_at_visit_months, 
        completed, chief_concerns, developmental_milestones, physical_exam, 
        anticipatory_guidance_provided, next_visit_due, provider, notes, 
        recorded_by, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        id, patientId, episodeId, visitDate, visitType, ageAtVisitMonths,
        completed, chiefConcerns, JSON.stringify(developmentalMilestones),
        JSON.stringify(physicalExam), JSON.stringify(anticipatoryGuidanceProvided),
        nextVisitDue, provider, notes, recordedBy, orgId
      ]
    );

    return this._formatWellVisit(result.rows[0]);
  }

  async getWellVisits(patientId, episodeId = null) {
    let query = `SELECT * FROM pediatric_well_visits WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY visit_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatWellVisit(row));
  }

  async getWellVisitSchedule(patientId) {
    // This would implement AAP Bright Futures schedule
    // For now, return a placeholder
    return {
      dueVisits: [],
      upcomingVisits: []
    };
  }

  // ============================================
  // Immunizations
  // ============================================

  async saveImmunization(data) {
    const {
      patientId,
      episodeId,
      vaccineName,
      vaccineCode,
      cvxCode,
      doseNumber,
      seriesDoses,
      administrationDate,
      expirationDate,
      lotNumber,
      manufacturer,
      route,
      site,
      doseAmount,
      administeredBy,
      visDate,
      visProvided,
      consentObtained,
      adverseReactions,
      notes,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO pediatric_immunizations
       (id, patient_id, episode_id, vaccine_name, vaccine_code, cvx_code, dose_number, 
        series_doses, administration_date, expiration_date, lot_number, manufacturer, 
        route, site, dose_amount, administered_by, vis_date, vis_provided, 
        consent_obtained, adverse_reactions, notes, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
       RETURNING *`,
      [
        id, patientId, episodeId, vaccineName, vaccineCode, cvxCode, doseNumber,
        seriesDoses, administrationDate, expirationDate, lotNumber, manufacturer,
        route, site, doseAmount, administeredBy, visDate, visProvided,
        consentObtained, adverseReactions, notes, orgId
      ]
    );

    // Update immunization status
    await this._updateImmunizationStatus(patientId, vaccineName, orgId);

    return this._formatImmunization(result.rows[0]);
  }

  async getImmunizations(patientId, episodeId = null) {
    let query = `SELECT * FROM pediatric_immunizations WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY administration_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatImmunization(row));
  }

  async getImmunizationSchedule(patientId) {
    // Get cached schedule
    const result = await this.pool.query(
      `SELECT * FROM pediatric_vaccination_schedule_cache WHERE patient_id = $1`,
      [patientId]
    );

    if (result.rows[0]) {
      return this._formatScheduleCache(result.rows[0]);
    }

    // Generate new schedule
    return await this.generateCatchUpSchedule(patientId);
  }

  async generateCatchUpSchedule(patientId) {
    // This would implement CDC/ACIP 2024 catch-up schedule
    // For now, return a placeholder
    return {
      dueVaccines: [],
      overdueVaccines: [],
      upcomingVaccines: [],
      catchUpRequired: false
    };
  }

  // ============================================
  // Developmental Screening
  // ============================================

  async saveDevelopmentalScreening(data) {
    const {
      patientId,
      episodeId,
      screeningDate,
      ageMonths,
      screeningTool,
      domainsAssessed,
      overallResult,
      grossMotorScore,
      fineMotorScore,
      languageScore,
      personalSocialScore,
      referralRecommended,
      referralDetails,
      followUpDate,
      screenedBy,
      notes,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO pediatric_developmental_screening
       (id, patient_id, episode_id, screening_date, age_months, screening_tool, 
        domains_assessed, overall_result, gross_motor_score, fine_motor_score, 
        language_score, personal_social_score, referral_recommended, referral_details, 
        follow_up_date, screened_by, notes, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        id, patientId, episodeId, screeningDate, ageMonths, screeningTool,
        JSON.stringify(domainsAssessed), overallResult, JSON.stringify(grossMotorScore),
        JSON.stringify(fineMotorScore), JSON.stringify(languageScore),
        JSON.stringify(personalSocialScore), referralRecommended, referralDetails,
        followUpDate, screenedBy, notes, orgId
      ]
    );

    return this._formatDevelopmentalScreening(result.rows[0]);
  }

  async getDevelopmentalScreenings(patientId, episodeId = null) {
    let query = `SELECT * FROM pediatric_developmental_screening WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY screening_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatDevelopmentalScreening(row));
  }

  // ============================================
  // Newborn Screening
  // ============================================

  async saveNewbornScreening(data) {
    const {
      patientId,
      episodeId,
      screeningDate,
      stateProgram,
      specimenCollectionTime,
      testPanel,
      overallResult,
      abnormalFindings,
      followUpRequired,
      followUpNotes,
      providerNotified,
      notificationDate,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO pediatric_newborn_screening
       (id, patient_id, episode_id, screening_date, state_program, 
        specimen_collection_time, test_panel, overall_result, abnormal_findings, 
        follow_up_required, follow_up_notes, provider_notified, notification_date, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        id, patientId, episodeId, screeningDate, stateProgram,
        specimenCollectionTime, JSON.stringify(testPanel), overallResult,
        JSON.stringify(abnormalFindings), followUpRequired, followUpNotes,
        providerNotified, notificationDate, orgId
      ]
    );

    return this._formatNewbornScreening(result.rows[0]);
  }

  async getNewbornScreenings(patientId) {
    const result = await this.pool.query(
      `SELECT * FROM pediatric_newborn_screening WHERE patient_id = $1 ORDER BY screening_date DESC`,
      [patientId]
    );

    return result.rows.map(row => this._formatNewbornScreening(row));
  }

  // ============================================
  // HEADSS Assessment
  // ============================================

  async saveHEADSSAssessment(data) {
    const {
      patientId,
      episodeId,
      assessmentDate,
      ageYears,
      homeEnvironment,
      educationEmployment,
      activitiesPeers,
      drugsAlcoholTobacco,
      sexuality,
      suicideSafety,
      overallRiskLevel,
      concernsIdentified,
      interventionsRecommended,
      referralsMade,
      followUpRequired,
      followUpDate,
      assessedBy,
      confidentialityDiscussed,
      notes,
      orgId
    } = data;

    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO pediatric_headss_assessment
       (id, patient_id, episode_id, assessment_date, age_years, home_environment, 
        education_employment, activities_peers, drugs_alcohol_tobacco, sexuality, 
        suicide_safety, overall_risk_level, concerns_identified, interventions_recommended, 
        referrals_made, follow_up_required, follow_up_date, assessed_by, 
        confidentiality_discussed, notes, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`,
      [
        id, patientId, episodeId, assessmentDate, ageYears, JSON.stringify(homeEnvironment),
        JSON.stringify(educationEmployment), JSON.stringify(activitiesPeers),
        JSON.stringify(drugsAlcoholTobacco), JSON.stringify(sexuality),
        JSON.stringify(suicideSafety), overallRiskLevel, concernsIdentified,
        interventionsRecommended, referralsMade, followUpRequired, followUpDate,
        assessedBy, confidentialityDiscussed, notes, orgId
      ]
    );

    return this._formatHEADSSAssessment(result.rows[0]);
  }

  async getHEADSSAssessments(patientId, episodeId = null) {
    let query = `SELECT * FROM pediatric_headss_assessment WHERE patient_id = $1`;
    const params = [patientId];

    if (episodeId) {
      query += ` AND episode_id = $2`;
      params.push(episodeId);
    }

    query += ` ORDER BY assessment_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this._formatHEADSSAssessment(row));
  }

  // ============================================
  // Additional Screening Methods
  // ============================================

  async saveLeadScreening(data) {
    const id = uuidv4();
    const result = await this.pool.query(
      `INSERT INTO pediatric_lead_screening
       (id, patient_id, episode_id, screening_date, age_months, test_type, 
        blood_lead_level, result_category, risk_assessment, environmental_interventions, 
        follow_up_required, follow_up_date, provider_notified, health_dept_notified, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [id, data.patientId, data.episodeId, data.screeningDate, data.ageMonths,
       data.testType, data.bloodLeadLevel, data.resultCategory, JSON.stringify(data.riskAssessment),
       data.environmentalInterventions, data.followUpRequired, data.followUpDate,
       data.providerNotified, data.healthDeptNotified, data.orgId]
    );
    return this._formatLeadScreening(result.rows[0]);
  }

  async getLeadScreenings(patientId) {
    const result = await this.pool.query(
      `SELECT * FROM pediatric_lead_screening WHERE patient_id = $1 ORDER BY screening_date DESC`,
      [patientId]
    );
    return result.rows.map(row => this._formatLeadScreening(row));
  }

  async saveAutismScreening(data) {
    const id = uuidv4();
    const result = await this.pool.query(
      `INSERT INTO pediatric_autism_screening
       (id, patient_id, episode_id, screening_date, age_months, screening_tool, 
        responses, total_score, risk_level, critical_items_positive, 
        referral_recommended, referral_details, follow_up_screening_date, 
        screened_by, notes, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [id, data.patientId, data.episodeId, data.screeningDate, data.ageMonths,
       data.screeningTool, JSON.stringify(data.responses), data.totalScore,
       data.riskLevel, data.criticalItemsPositive, data.referralRecommended,
       data.referralDetails, data.followUpScreeningDate, data.screenedBy,
       data.notes, data.orgId]
    );
    return this._formatAutismScreening(result.rows[0]);
  }

  async getAutismScreenings(patientId) {
    const result = await this.pool.query(
      `SELECT * FROM pediatric_autism_screening WHERE patient_id = $1 ORDER BY screening_date DESC`,
      [patientId]
    );
    return result.rows.map(row => this._formatAutismScreening(row));
  }

  // ============================================
  // Helper Methods
  // ============================================

  async _calculatePercentiles(ageMonths, measurements) {
    // Placeholder for WHO/CDC percentile calculations
    // In production, this would use actual WHO/CDC growth chart data
    return {
      weightPercentile: 50,
      weightZscore: 0,
      lengthHeightPercentile: 50,
      lengthHeightZscore: 0,
      headCircumferencePercentile: 50,
      headCircumferenceZscore: 0
    };
  }

  async _calculateBMIPercentile(ageMonths, bmi) {
    // Placeholder for BMI percentile calculation
    return {
      percentile: 50,
      zscore: 0
    };
  }

  _categorizeBMI(percentile) {
    if (percentile < 5) return 'underweight';
    if (percentile < 85) return 'healthy';
    if (percentile < 95) return 'overweight';
    return 'obese';
  }

  _calculateGrowthVelocity(records) {
    if (records.length < 2) return null;

    const recent = records.slice(-2);
    const timeDiff = (new Date(recent[1].measurementDate) - new Date(recent[0].measurementDate)) / (1000 * 60 * 60 * 24 * 30);
    
    if (timeDiff === 0) return null;

    return {
      weightVelocity: (recent[1].weightKg - recent[0].weightKg) / timeDiff,
      heightVelocity: (recent[1].lengthHeightCm - recent[0].lengthHeightCm) / timeDiff
    };
  }

  _validateVitalSigns(ageGroup, vitals) {
    const ranges = this._getVitalSignRanges(ageGroup);
    const flags = {
      heartRateFlag: null,
      respiratoryRateFlag: null,
      bpFlag: null
    };

    if (vitals.heartRate) {
      if (vitals.heartRate < ranges.heartRate.min) flags.heartRateFlag = 'low';
      else if (vitals.heartRate > ranges.heartRate.max) flags.heartRateFlag = 'high';
      else flags.heartRateFlag = 'normal';
    }

    if (vitals.respiratoryRate) {
      if (vitals.respiratoryRate < ranges.respiratoryRate.min) flags.respiratoryRateFlag = 'low';
      else if (vitals.respiratoryRate > ranges.respiratoryRate.max) flags.respiratoryRateFlag = 'high';
      else flags.respiratoryRateFlag = 'normal';
    }

    if (vitals.systolicBp && vitals.diastolicBp) {
      if (vitals.systolicBp < ranges.systolicBP.min || vitals.diastolicBp < ranges.diastolicBP.min) {
        flags.bpFlag = 'low';
      } else if (vitals.systolicBp > ranges.systolicBP.max || vitals.diastolicBp > ranges.diastolicBP.max) {
        flags.bpFlag = 'high';
      } else {
        flags.bpFlag = 'normal';
      }
    }

    return flags;
  }

  _getVitalSignRanges(ageGroup) {
    const ranges = {
      newborn: { heartRate: {min: 100, max: 160}, respiratoryRate: {min: 30, max: 60}, systolicBP: {min: 60, max: 90}, diastolicBP: {min: 20, max: 60} },
      infant: { heartRate: {min: 100, max: 160}, respiratoryRate: {min: 25, max: 40}, systolicBP: {min: 80, max: 100}, diastolicBP: {min: 55, max: 65} },
      toddler: { heartRate: {min: 90, max: 150}, respiratoryRate: {min: 20, max: 30}, systolicBP: {min: 95, max: 105}, diastolicBP: {min: 60, max: 70} },
      preschool: { heartRate: {min: 80, max: 120}, respiratoryRate: {min: 20, max: 25}, systolicBP: {min: 95, max: 110}, diastolicBP: {min: 60, max: 75} },
      'school-age': { heartRate: {min: 70, max: 110}, respiratoryRate: {min: 18, max: 22}, systolicBP: {min: 100, max: 120}, diastolicBP: {min: 60, max: 75} },
      adolescent: { heartRate: {min: 60, max: 100}, respiratoryRate: {min: 12, max: 20}, systolicBP: {min: 100, max: 135}, diastolicBP: {min: 65, max: 85} }
    };

    return ranges[ageGroup] || ranges.adolescent;
  }

  async _updateImmunizationStatus(patientId, vaccineSeries, orgId) {
    // Placeholder for updating immunization status tracking
    // Would count doses and determine if series is complete
  }

  // Formatting methods
  _formatDemographics(row) { return this._camelCaseKeys(row); }
  _formatGrowthRecord(row) { return this._camelCaseKeys(row); }
  _formatVitalSigns(row) { return this._camelCaseKeys(row); }
  _formatWellVisit(row) { return this._camelCaseKeys(row); }
  _formatImmunization(row) { return this._camelCaseKeys(row); }
  _formatDevelopmentalScreening(row) { return this._camelCaseKeys(row); }
  _formatNewbornScreening(row) { return this._camelCaseKeys(row); }
  _formatHEADSSAssessment(row) { return this._camelCaseKeys(row); }
  _formatScheduleCache(row) { return this._camelCaseKeys(row); }
  _formatLeadScreening(row) { return this._camelCaseKeys(row); }
  _formatAutismScreening(row) { return this._camelCaseKeys(row); }

  _camelCaseKeys(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = value;
    }
    return result;
  }
}

module.exports = PediatricsService;
