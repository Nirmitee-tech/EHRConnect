# Patient Portal Testing Guide

## 🧪 How to Test the Patient Portal

### Prerequisites
1. Ensure the application is running:
   ```bash
   cd ehr-web
   npm run dev
   ```

2. Ensure the backend API is running:
   ```bash
   cd ehr-api
   npm run dev
   ```

3. Ensure Medplum/FHIR server is running

---

## Method 1: Grant Portal Access from Provider Interface (Recommended)

### Step 1: Login as Provider
1. Go to `http://localhost:3000/login`
2. Login with your provider credentials

### Step 2: Navigate to Patient Details
1. Go to Patients list: `http://localhost:3000/patients`
2. Click on any patient to view their details
3. You'll see a new "Patient Portal" section

### Step 3: Grant Portal Access
1. Click the **"Grant Portal Access"** button
2. Fill in the dialog:
   - Email (pre-filled if patient has email)
   - Temporary password
   - Send invitation email (checkbox)
3. Click **"Grant Access"**
4. Patient credentials are created

### Step 4: Login as Patient
1. Open incognito/private browser window
2. Go to `http://localhost:3000/patient-login`
3. Login with the credentials you just created
4. You'll be redirected to `/portal/dashboard`

---

## Method 2: Direct Patient Registration

### Step 1: Register New Patient
1. Go to `http://localhost:3000/patient-register`
2. Complete the 3-step registration:
   - **Step 1**: Personal Information
     - First Name: John
     - Last Name: Doe
     - Date of Birth: 1990-01-01
     - Gender: Male

   - **Step 2**: Contact Information
     - Email: john.doe@test.com
     - Phone: (555) 123-4567
     - Address (optional)

   - **Step 3**: Account Setup
     - Password: TestPassword123
     - Confirm Password: TestPassword123
     - ✓ Agree to Terms
     - ✓ Agree to Privacy Policy

3. Click **"Create Account"**

### Step 2: Login
1. Go to `http://localhost:3000/patient-login`
2. Enter credentials:
   - Email: john.doe@test.com
   - Password: TestPassword123
3. Click **"Sign In"**

---

## Method 3: Use Test Script (Quick Setup)

### Create Test Patient with Portal Access

Run the provided setup script:

```bash
cd ehr-web
npm run setup-test-patient
```

Or manually run:

```bash
node scripts/create-test-patient.js
```

This will create a test patient with these credentials:
- **Email**: patient@test.com
- **Password**: Test123!
- **Name**: Test Patient
- **MRN**: Auto-generated

Then login at: `http://localhost:3000/patient-login`

---

## Testing Checklist

### ✅ Authentication & Registration
- [ ] Patient registration (all 3 steps)
- [ ] Form validation (required fields)
- [ ] Password strength validation
- [ ] Patient login with email/password
- [ ] Error messages for invalid credentials
- [ ] Logout functionality

### ✅ Dashboard
- [ ] Dashboard loads without errors
- [ ] Quick action cards work
- [ ] Next appointment displays (if exists)
- [ ] Health alerts show (if allergies/conditions exist)
- [ ] Widgets display data correctly
- [ ] All navigation links work

### ✅ Appointments
- [ ] Appointments list loads
- [ ] Tab filtering (Upcoming, All, Past)
- [ ] Search functionality
- [ ] "Book Appointment" button works
- [ ] Appointment booking wizard:
  - [ ] Step 1: Provider selection and search
  - [ ] Step 2: Date selection and time slots
  - [ ] Step 3: Reason and notes
  - [ ] Step 4: Review and confirm
- [ ] Back/Continue navigation
- [ ] Booking submission

### ✅ Health Records
- [ ] Health records page loads
- [ ] Summary statistics correct
- [ ] Tab navigation works
- [ ] Medications tab shows data
- [ ] Allergies tab shows warnings
- [ ] Conditions tab shows data
- [ ] Vital signs tab groups correctly
- [ ] Immunizations tab displays records
- [ ] Empty states display properly

### ✅ Messages
- [ ] Messages page loads
- [ ] Conversations list displays
- [ ] "New Message" button works
- [ ] Provider selection in dialog
- [ ] Message sending
- [ ] Conversation selection
- [ ] Message thread display
- [ ] Search conversations

### ✅ Mobile Responsiveness
- [ ] Test on mobile viewport (< 640px)
- [ ] Hamburger menu works
- [ ] All pages are readable
- [ ] Forms are usable
- [ ] Cards stack properly
- [ ] Navigation is accessible

### ✅ Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Alt text on images

---

## Test Data Setup

### Create Sample Data for Testing

#### 1. Create Test Patient with Data

```javascript
// In browser console or via API
const testPatient = {
  email: "patient@test.com",
  password: "Test123!",
  firstName: "John",
  lastName: "Patient",
  dateOfBirth: "1985-05-15",
  gender: "male",
  phone: "(555) 123-4567"
}
```

#### 2. Add Test Appointments

```javascript
// Create past appointment
const pastAppointment = {
  patient: "Patient/[patient-id]",
  practitioner: "Practitioner/[practitioner-id]",
  start: "2024-01-15T10:00:00Z",
  end: "2024-01-15T10:30:00Z",
  status: "fulfilled"
}

// Create upcoming appointment
const upcomingAppointment = {
  patient: "Patient/[patient-id]",
  practitioner: "Practitioner/[practitioner-id]",
  start: "2025-01-20T14:00:00Z",
  end: "2025-01-20T14:30:00Z",
  status: "booked"
}
```

#### 3. Add Test Medications

```javascript
const medication = {
  resourceType: "MedicationRequest",
  status: "active",
  subject: { reference: "Patient/[patient-id]" },
  medicationCodeableConcept: {
    text: "Lisinopril 10mg"
  },
  dosageInstruction: [{
    text: "Take 1 tablet daily"
  }]
}
```

#### 4. Add Test Allergies

```javascript
const allergy = {
  resourceType: "AllergyIntolerance",
  clinicalStatus: {
    coding: [{
      system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
      code: "active"
    }]
  },
  patient: { reference: "Patient/[patient-id]" },
  code: { text: "Penicillin" },
  criticality: "high"
}
```

---

## Common Issues & Solutions

### Issue: "Patient ID not found"
**Solution**: Make sure patient has `patientId` in session. Check auth configuration.

### Issue: "Dashboard shows no data"
**Solution**:
- Patient may not have any data yet
- Check FHIR server connection
- Verify patient ID is correct

### Issue: "Cannot login - Invalid credentials"
**Solution**:
- Check patient exists in database
- Verify password was hashed correctly
- Check `patient-portal.service.ts` authentication method

### Issue: "Appointments don't load"
**Solution**:
- Check API endpoint `/api/patient/appointments`
- Verify FHIR search parameters
- Check patient has appointments in FHIR server

### Issue: "Portal layout not showing"
**Solution**:
- Check session is valid
- Verify patient role exists
- Check middleware is protecting routes correctly

---

## API Endpoints to Test

### Test with cURL or Postman

#### 1. Register Patient
```bash
curl -X POST http://localhost:3000/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "email": "test@example.com",
    "phone": "(555) 123-4567",
    "password": "Test123!"
  }'
```

#### 2. Get Dashboard Data
```bash
curl -X GET http://localhost:3000/api/patient/dashboard \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### 3. Get Appointments
```bash
curl -X GET "http://localhost:3000/api/patient/appointments?filter=upcoming" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## Browser DevTools Testing

### Open React DevTools
1. Install React DevTools extension
2. Open browser DevTools (F12)
3. Go to Components tab
4. Inspect component props and state

### Check Network Requests
1. Open Network tab
2. Filter by XHR/Fetch
3. Verify API calls are successful
4. Check response data

### Console Errors
1. Open Console tab
2. Look for any errors or warnings
3. Check for CORS issues
4. Verify authentication tokens

---

## Performance Testing

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit with:
   - ✓ Performance
   - ✓ Accessibility
   - ✓ Best Practices
   - ✓ SEO
4. Target scores:
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90

### Load Time Testing
- Dashboard: < 2 seconds
- Appointments: < 1.5 seconds
- Health Records: < 2 seconds
- Messages: < 1 second

---

## Automated Testing (Future)

### Unit Tests with Jest
```bash
npm run test
```

### E2E Tests with Playwright
```bash
npm run test:e2e
```

### Example E2E Test
```javascript
test('patient can login and view dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/patient-login')
  await page.fill('input[name="email"]', 'patient@test.com')
  await page.fill('input[name="password"]', 'Test123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/portal/dashboard')
  await expect(page.locator('h1')).toContainText('Welcome back')
})
```

---

## Security Testing

### Test Authentication
- [ ] Cannot access portal without login
- [ ] Session expires after timeout
- [ ] Password is never visible in network requests
- [ ] CSRF tokens are validated

### Test Authorization
- [ ] Patient can only see their own data
- [ ] Cannot access other patient records
- [ ] Cannot modify other patient data
- [ ] API returns 401 for unauthorized requests

### Test Data Privacy
- [ ] PHI is encrypted in transit (HTTPS)
- [ ] Sensitive data is not logged
- [ ] Audit trail records all access
- [ ] Password reset requires email verification

---

## Useful Test Accounts

Create these test accounts for different scenarios:

### 1. New Patient (No Data)
- Email: newpatient@test.com
- Password: Test123!
- Use case: Test empty states

### 2. Patient with Full Data
- Email: fullpatient@test.com
- Password: Test123!
- Use case: Test all features with data

### 3. Patient with Upcoming Appointment
- Email: appointment@test.com
- Password: Test123!
- Use case: Test appointment features

### 4. Patient with Allergies
- Email: allergies@test.com
- Password: Test123!
- Use case: Test health alerts

---

## Quick Start Commands

```bash
# Start development server
npm run dev

# Create test patient
npm run setup-test-patient

# Run tests
npm run test

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## Testing Tools

### Recommended Browser Extensions
- React DevTools
- Redux DevTools (if using Redux)
- Lighthouse
- axe DevTools (accessibility)
- WAVE (accessibility)

### Recommended Tools
- Postman (API testing)
- Insomnia (API testing)
- BrowserStack (cross-browser testing)
- ngrok (mobile device testing)

---

## Getting Help

If you encounter issues:

1. Check browser console for errors
2. Check network tab for failed requests
3. Review server logs
4. Check FHIR server is running
5. Verify environment variables
6. Check this testing guide
7. Review code comments

---

## Next Steps After Testing

Once testing is complete:

1. Document any bugs found
2. Prioritize bug fixes
3. Implement remaining features
4. Add automated tests
5. Perform security audit
6. Conduct user acceptance testing
7. Prepare for deployment

---

**Happy Testing! 🚀**
