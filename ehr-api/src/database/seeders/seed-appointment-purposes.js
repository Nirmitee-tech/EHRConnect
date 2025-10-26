#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Default appointment purposes with automation rules
const DEFAULT_PURPOSES = [
  {
    code: 'annual-physical',
    name: 'Annual Physical Exam',
    description: 'Comprehensive yearly health checkup and physical examination',
    category: 'preventive',
    default_duration: 45,
    buffer_time: 15,
    required_provider_type: 'primary-care',
    color: '#10B981',
    icon: 'heart-pulse',
    automation_rules: [
      {
        trigger_event: 'created',
        action_type: 'send_form',
        action_config: {
          form_code: 'health-history-update',
          required: true,
          send_immediately: true
        },
        priority: 1
      },
      {
        trigger_event: 'created',
        action_type: 'send_reminder',
        action_config: {
          channels: ['email', 'sms'],
          template: 'annual_physical_preparation',
          message: 'Reminder: Your annual physical is coming up. Please complete the health history form.'
        },
        delay_minutes: 10080 // 7 days before (in minutes)
      },
      {
        trigger_event: 'confirmed',
        action_type: 'order_lab',
        action_config: {
          lab_tests: ['cbc', 'cmp', 'lipid_panel', 'hba1c', 'tsh'],
          timing: '7d_before',
          instructions: 'Fasting required - no food or drink (except water) for 12 hours before test'
        }
      },
      {
        trigger_event: 'completed',
        action_type: 'schedule_followup',
        action_config: {
          days: 365,
          purpose: 'annual-physical',
          auto_suggest: true
        }
      }
    ],
    symptom_mappings: [
      {
        keywords: ['annual checkup', 'yearly exam', 'physical exam', 'preventive care'],
        confidence: 0.95,
        urgency: 'routine'
      }
    ]
  },
  {
    code: 'sick-visit',
    name: 'Sick Visit',
    description: 'Visit for acute illness or new symptoms',
    category: 'acute',
    default_duration: 20,
    buffer_time: 10,
    required_provider_type: 'primary-care',
    color: '#EF4444',
    icon: 'thermometer',
    automation_rules: [
      {
        trigger_event: 'created',
        action_type: 'send_form',
        action_config: {
          form_code: 'symptom-assessment',
          required: true,
          send_immediately: true
        },
        priority: 1
      },
      {
        trigger_event: 'created',
        action_type: 'send_reminder',
        action_config: {
          channels: ['sms'],
          template: 'sick_visit_reminder',
          message: 'Your appointment is in 2 hours. Please arrive 10 minutes early.'
        },
        delay_minutes: -120 // 2 hours before
      }
    ],
    symptom_mappings: [
      {
        keywords: ['fever', 'cough', 'cold', 'flu', 'sore throat', 'sick', 'not feeling well'],
        confidence: 0.85,
        urgency: 'urgent',
        timeframe: 'within_24h'
      }
    ]
  },
  {
    code: 'follow-up',
    name: 'Follow-up Visit',
    description: 'Follow-up appointment to review treatment progress',
    category: 'follow-up',
    default_duration: 20,
    buffer_time: 10,
    required_provider_type: 'any',
    color: '#3B82F6',
    icon: 'clipboard-check',
    automation_rules: [
      {
        trigger_event: 'created',
        action_type: 'send_form',
        action_config: {
          form_code: 'treatment-progress',
          required: false
        },
        priority: 2
      },
      {
        trigger_event: 'created',
        action_type: 'send_reminder',
        action_config: {
          channels: ['email'],
          template: 'followup_reminder',
          message: 'Your follow-up appointment is tomorrow. Please bring your medication list.'
        },
        delay_minutes: 1440 // 24 hours before
      }
    ]
  },
  {
    code: 'specialist-consult',
    name: 'Specialist Consultation',
    description: 'Consultation with a medical specialist',
    category: 'specialist',
    default_duration: 40,
    buffer_time: 20,
    required_provider_type: 'specialist',
    requires_referral: true,
    color: '#8B5CF6',
    icon: 'stethoscope',
    automation_rules: [
      {
        trigger_event: 'created',
        action_type: 'verify_referral',
        action_config: {
          required: true,
          check_authorization: true
        },
        priority: 1
      },
      {
        trigger_event: 'created',
        action_type: 'send_form',
        action_config: {
          form_code: 'specialist-intake',
          required: true
        },
        priority: 2
      },
      {
        trigger_event: 'confirmed',
        action_type: 'request_medical_records',
        action_config: {
          from_provider: 'referring_physician',
          documents: ['notes', 'labs', 'imaging']
        }
      }
    ]
  },
  {
    code: 'mental-health',
    name: 'Mental Health Visit',
    description: 'Mental health counseling or psychiatric consultation',
    category: 'specialist',
    default_duration: 50,
    buffer_time: 10,
    required_provider_type: 'mental-health',
    preferred_specialties: ['psychiatry', 'psychology', 'counseling'],
    color: '#06B6D4',
    icon: 'brain',
    automation_rules: [
      {
        trigger_event: 'created',
        action_type: 'send_form',
        action_config: {
          form_code: 'phq9-assessment',
          required: false
        },
        priority: 1
      },
      {
        trigger_event: 'created',
        action_type: 'send_reminder',
        action_config: {
          channels: ['email'],
          template: 'mental_health_reminder',
          message: 'Reminder: Your therapy session is tomorrow. Take time to reflect on what you\'d like to discuss.'
        },
        delay_minutes: 1440 // 24 hours before
      },
      {
        trigger_event: 'completed',
        action_type: 'schedule_followup',
        action_config: {
          days: 14,
          purpose: 'mental-health',
          auto_suggest: true,
          message: 'Regular sessions are important for your mental health journey.'
        }
      }
    ],
    symptom_mappings: [
      {
        keywords: ['depression', 'anxiety', 'stress', 'mental health', 'therapy', 'counseling'],
        confidence: 0.9,
        urgency: 'routine',
        specialty: 'mental-health'
      }
    ]
  },
  {
    code: 'urgent-care',
    name: 'Urgent Care',
    description: 'Same-day urgent medical care for non-life-threatening issues',
    category: 'acute',
    default_duration: 30,
    buffer_time: 0,
    required_provider_type: 'any',
    color: '#F59E0B',
    icon: 'alert-circle',
    automation_rules: [
      {
        trigger_event: 'created',
        action_type: 'send_reminder',
        action_config: {
          channels: ['sms'],
          template: 'urgent_care_immediate',
          message: 'Your urgent care appointment is confirmed. We\'ll see you soon!'
        },
        delay_minutes: 0 // Immediate
      },
      {
        trigger_event: 'confirmed',
        action_type: 'notify_staff',
        action_config: {
          notification_type: 'urgent_arrival',
          message: 'Urgent care patient arriving soon'
        }
      }
    ],
    symptom_mappings: [
      {
        keywords: ['urgent', 'emergency', 'severe pain', 'injury', 'accident'],
        confidence: 0.8,
        urgency: 'urgent',
        timeframe: 'today'
      }
    ]
  },
  {
    code: 'vaccination',
    name: 'Vaccination',
    description: 'Immunization and vaccination appointment',
    category: 'preventive',
    default_duration: 15,
    buffer_time: 5,
    required_provider_type: 'any',
    color: '#10B981',
    icon: 'syringe',
    automation_rules: [
      {
        trigger_event: 'created',
        action_type: 'send_form',
        action_config: {
          form_code: 'vaccination-screening',
          required: true
        },
        priority: 1
      },
      {
        trigger_event: 'created',
        action_type: 'send_reminder',
        action_config: {
          channels: ['sms'],
          template: 'vaccination_reminder',
          message: 'Vaccination appointment reminder. Please complete screening form.'
        },
        delay_minutes: 1440 // 24 hours before
      },
      {
        trigger_event: 'completed',
        action_type: 'update_immunization_record',
        action_config: {
          auto_update: true,
          send_to_registry: true
        }
      }
    ]
  },
  {
    code: 'lab-results',
    name: 'Lab Results Review',
    description: 'Appointment to review laboratory test results',
    category: 'follow-up',
    default_duration: 15,
    buffer_time: 5,
    required_provider_type: 'any',
    color: '#6366F1',
    icon: 'flask',
    automation_rules: [
      {
        trigger_event: 'created',
        action_type: 'attach_lab_results',
        action_config: {
          auto_attach: true,
          notify_if_abnormal: true
        },
        priority: 1
      }
    ]
  }
];

async function seedAppointmentPurposes() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding appointment purposes and automation rules...\n');

    await client.query('BEGIN');

    // Get all organizations
    const orgsResult = await client.query(
      'SELECT id, name FROM organizations WHERE status = $1',
      ['active']
    );

    if (orgsResult.rows.length === 0) {
      console.log('⚠️  No active organizations found. Skipping seed.');
      await client.query('ROLLBACK');
      return;
    }

    console.log(`Found ${orgsResult.rows.length} active organization(s)\n`);

    for (const org of orgsResult.rows) {
      console.log(`📋 Seeding purposes for: ${org.name}`);

      for (const purpose of DEFAULT_PURPOSES) {
        // Check if purpose already exists
        const existingPurpose = await client.query(
          'SELECT id FROM appointment_purposes WHERE org_id = $1 AND code = $2',
          [org.id, purpose.code]
        );

        let purposeId;

        if (existingPurpose.rows.length > 0) {
          console.log(`   ⏭️  ${purpose.name} - Already exists, skipping`);
          purposeId = existingPurpose.rows[0].id;
        } else {
          // Insert purpose
          const purposeResult = await client.query(
            `INSERT INTO appointment_purposes (
              org_id, code, name, description, category,
              default_duration, buffer_time, required_provider_type,
              requires_referral, preferred_specialties, color, icon
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id`,
            [
              org.id,
              purpose.code,
              purpose.name,
              purpose.description,
              purpose.category,
              purpose.default_duration,
              purpose.buffer_time || 0,
              purpose.required_provider_type || 'any',
              purpose.requires_referral || false,
              purpose.preferred_specialties || null,
              purpose.color,
              purpose.icon
            ]
          );

          purposeId = purposeResult.rows[0].id;
          console.log(`   ✅ ${purpose.name} - Created`);

          // Insert automation rules
          if (purpose.automation_rules && purpose.automation_rules.length > 0) {
            for (const rule of purpose.automation_rules) {
              await client.query(
                `INSERT INTO appointment_automation_rules (
                  purpose_id, trigger_event, action_type,
                  action_config, priority, delay_minutes
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                  purposeId,
                  rule.trigger_event,
                  rule.action_type,
                  JSON.stringify(rule.action_config),
                  rule.priority || 0,
                  rule.delay_minutes || 0
                ]
              );
            }
            console.log(`      → Added ${purpose.automation_rules.length} automation rule(s)`);
          }

          // Insert symptom mappings
          if (purpose.symptom_mappings && purpose.symptom_mappings.length > 0) {
            for (const mapping of purpose.symptom_mappings) {
              await client.query(
                `INSERT INTO symptom_to_purpose_mapping (
                  org_id, purpose_id, symptom_keywords,
                  confidence_score, urgency_level,
                  recommended_timeframe, preferred_specialty
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                  org.id,
                  purposeId,
                  mapping.keywords,
                  mapping.confidence || 0.8,
                  mapping.urgency || 'routine',
                  mapping.timeframe || null,
                  mapping.specialty || null
                ]
              );
            }
            console.log(`      → Added ${purpose.symptom_mappings.length} symptom mapping(s)`);
          }
        }
      }

      console.log('');
    }

    await client.query('COMMIT');
    console.log('✅ Appointment purposes seeded successfully!\n');

    // Summary
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM appointment_purposes) as purposes,
        (SELECT COUNT(*) FROM appointment_automation_rules) as rules,
        (SELECT COUNT(*) FROM symptom_to_purpose_mapping) as mappings
    `);

    console.log('📊 Summary:');
    console.log(`   Purposes: ${stats.rows[0].purposes}`);
    console.log(`   Automation Rules: ${stats.rows[0].rules}`);
    console.log(`   Symptom Mappings: ${stats.rows[0].mappings}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding appointment purposes:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedAppointmentPurposes()
    .then(() => {
      console.log('\n🎉 Seed completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAppointmentPurposes };
