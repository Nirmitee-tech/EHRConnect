/**
 * Review of Systems configuration
 * Defines the body systems used in ROS documentation
 */

/**
 * Standard Review of Systems body systems
 */
export const ROS_SYSTEMS = [
  'Constitutional',
  'Eyes',
  'ENT/Mouth',
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Genitourinary',
  'Musculoskeletal',
  'Integumentary',
  'Neurological',
  'Psychiatric',
  'Endocrine',
  'Hematologic/Lymphatic',
  'Allergic/Immunologic'
] as const;

export type ROSSystem = typeof ROS_SYSTEMS[number];

/**
 * ROS check status options
 */
export const ROS_CHECK_STATUS = {
  NORMAL: 'Normal',
  ABNORMAL: 'Abnormal',
  NOT_EXAMINED: 'Not Examined'
} as const;

export type ROSCheckStatus = typeof ROS_CHECK_STATUS[keyof typeof ROS_CHECK_STATUS];
