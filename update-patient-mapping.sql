-- Update feginy@mailinator.com to point to the patient with appointments
-- WARNING: This will change which patient this email sees

UPDATE patient_portal_users
SET fhir_patient_id = '74ad0612-3858-445a-ba2c-51d9d961ab00'
WHERE email = 'feginy@mailinator.com';

-- Verify the update
SELECT id, email, fhir_patient_id
FROM patient_portal_users
WHERE email = 'feginy@mailinator.com';
