import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { PatientPortalService } from '@/services/patient-portal.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      password,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender || !email || !phone || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if patient already exists with this email
    const existingPatient = await PatientPortalService.findPatientByEmail(email)
    if (existingPatient) {
      return NextResponse.json(
        { message: 'A patient with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create FHIR Patient resource
    const patientData = {
      firstName,
      lastName,
      dateOfBirth,
      gender: gender.toLowerCase(),
      email,
      phone,
      address: address ? {
        line: [address],
        city,
        state,
        postalCode: zipCode,
        country: 'USA',
      } : undefined,
    }

    // Register patient in system
    const patient = await PatientPortalService.registerPatient(patientData, hashedPassword)

    // TODO: Send verification email
    // await EmailService.sendVerificationEmail(email, patient.id)

    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        patientId: patient.id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Patient registration error:', error)
    return NextResponse.json(
      { message: error.message || 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
