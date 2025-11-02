/**
 * Quick script to create a test patient with portal access
 * Run: node scripts/create-test-patient.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function createTestPatient() {
  console.log('Creating test patient...')

  try {
    // Register patient
    const registerResponse = await fetch(`${API_URL}/api/patient/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Patient',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        email: 'patient@test.com',
        phone: '(555) 123-4567',
        password: 'Test123!',
      }),
    })

    const registerData = await registerResponse.json()

    if (!registerResponse.ok) {
      throw new Error(registerData.message || 'Registration failed')
    }

    console.log('✅ Test patient created successfully!')
    console.log('\n📧 Login Credentials:')
    console.log('   URL: http://localhost:3000/patient-login')
    console.log('   Email: patient@test.com')
    console.log('   Password: Test123!')
    console.log('\n🔑 Patient ID:', registerData.patientId)
    console.log('\nYou can now login to the patient portal!')
  } catch (error) {
    console.error('❌ Error creating test patient:', error.message)
  }
}

createTestPatient()
