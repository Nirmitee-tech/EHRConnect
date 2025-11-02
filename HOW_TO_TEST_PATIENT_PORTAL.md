# 🚀 How to Test the Patient Portal

## Quick Start Guide

### Method 1: Grant Access from Provider Interface (Recommended) ⭐

This is the easiest way to test! Providers can grant portal access directly from the patient details page.

#### Step 1: Login as Provider
```bash
# Make sure your app is running
cd ehr-web
npm run dev
```

Navigate to: `http://localhost:3000/login`

#### Step 2: View Patient Details
1. Go to: `http://localhost:3000/patients`
2. Click on any existing patient

#### Step 3: You'll see a NEW "Patient Portal" section in the header!

Look for this new card in the clinical info row (between Insurance and Active Problems):

```
📊 Clinical Info Row now includes:
- Medical Information
- History
- Allergies
- Habits
- Insurance
- 🆕 Patient Portal ← NEW!
- Active Problems
```

#### Step 4: Grant Portal Access

1. **Hover over the "Patient Portal" card**
2. You'll see a **"Grant Access" button** appear
3. Click **"Grant Access"**
4. A dialog will open with:
   - **Email field** (pre-filled if patient has email)
   - **Temporary Password field**
   - **"Generate Strong Password"** button (use this!)
   - **Send invitation email** checkbox

5. Click **"Generate Strong Password"** to create a secure password
6. Click **"Grant Access"**

#### Step 5: Copy Credentials

After granting access, you'll see a success screen with:
- Login URL
- Email
- Temporary Password
- **"Copy Credentials"** button

Click **"Copy Credentials"** to copy all the info!

#### Step 6: Login as Patient

1. Open a **new incognito/private browser window**
2. Go to: `http://localhost:3000/patient-login`
3. Paste the email and password
4. Click **"Sign In"**
5. **You're in!** 🎉

---

### Method 2: Direct Patient Registration

#### Step 1: Register New Patient
Go to: `http://localhost:3000/patient-register`

#### Step 2: Complete 3-Step Form

**Step 1: Personal Information**
- First Name: John
- Last Name: Doe
- Date of Birth: 1990-01-01
- Gender: Male

**Step 2: Contact Information**
- Email: johndoe@test.com
- Phone: (555) 123-4567
- Address: (optional)

**Step 3: Account Setup**
- Password: YourPassword123!
- Confirm Password: YourPassword123!
- ✓ Agree to Terms
- ✓ Agree to Privacy Policy

#### Step 3: Login
Go to: `http://localhost:3000/patient-login`

Credentials:
- Email: johndoe@test.com
- Password: YourPassword123!

---

### Method 3: Quick Test Script

#### Create Test Patient with One Command

```bash
cd ehr-web
node scripts/create-test-patient.js
```

This creates a test patient with:
- **Email**: patient@test.com
- **Password**: Test123!

Then login at: `http://localhost:3000/patient-login`

---

## 🎯 What to Test

### 1. **Patient Dashboard** (`/portal/dashboard`)
- [ ] Welcome message displays
- [ ] Quick action cards work (Book Appointment, Message Doctor, etc.)
- [ ] Next appointment card shows (if you have appointments)
- [ ] Health alerts display
- [ ] Medication list shows
- [ ] Vital signs display
- [ ] Health summary stats are correct

### 2. **Appointments** (`/portal/appointments`)
- [ ] List of appointments loads
- [ ] Tabs work (Upcoming, All, Past)
- [ ] Search appointments
- [ ] Click "Book Appointment" button
- [ ] Complete booking wizard:
  - [ ] Select provider
  - [ ] Choose date and time
  - [ ] Enter reason
  - [ ] Review and confirm

### 3. **Health Records** (`/portal/health-records`)
- [ ] Summary cards show correct counts
- [ ] Medications tab displays list
- [ ] Allergies tab shows warnings
- [ ] Conditions tab lists health conditions
- [ ] Vital signs tab groups measurements
- [ ] Immunizations tab shows vaccines
- [ ] Empty states display nicely

### 4. **Messages** (`/portal/messages`)
- [ ] Conversations list loads
- [ ] Click "New Message" button
- [ ] Select provider and send message
- [ ] Message thread displays
- [ ] Send and receive messages
- [ ] Search conversations

### 5. **Mobile Responsiveness**
- [ ] Open on mobile device or use Chrome DevTools (F12 → Device Mode)
- [ ] Test hamburger menu
- [ ] All pages are readable
- [ ] Buttons are tappable
- [ ] Forms work on mobile

---

## 🔍 Provider View: Grant Portal Access Feature

### Visual Indicators

When viewing a patient details page, you'll see the **Patient Portal** card with these states:

#### ❌ No Access (Before)
```
Patient Portal
🔴 No Access
[Grant Access button appears on hover]
```

#### ✅ Access Granted (After)
```
Patient Portal
✅ Access Granted
```

### Dialog Features

The "Grant Portal Access" dialog includes:

1. **Email Field**
   - Pre-filled if patient has email
   - Used for portal login

2. **Temporary Password Field**
   - Manual entry or auto-generate
   - Click "Generate Strong Password" for secure 12-char password
   - Shown in mono font for clarity

3. **Send Email Checkbox**
   - Toggle email notification
   - (Email service integration pending)

4. **Success Screen**
   - Shows all credentials
   - Copy button for easy sharing
   - Includes login URL

---

## 📝 Test Scenarios

### Scenario 1: Provider Grants Access to Existing Patient

1. **Provider**: Login to provider portal
2. **Provider**: Navigate to patient details
3. **Provider**: Click "Grant Access" in Patient Portal card
4. **Provider**: Generate password and grant access
5. **Provider**: Copy credentials and share with patient
6. **Patient**: Login to patient portal
7. **Patient**: View dashboard, appointments, health records
8. **Patient**: Book new appointment
9. **Patient**: Send message to provider

### Scenario 2: New Patient Self-Registration

1. **Patient**: Go to registration page
2. **Patient**: Complete 3-step form
3. **Patient**: Verify email (pending implementation)
4. **Patient**: Login to portal
5. **Patient**: Explore dashboard
6. **Patient**: Book first appointment
7. **Patient**: Update profile information

### Scenario 3: Mobile Patient Experience

1. **Patient**: Open portal on mobile device
2. **Patient**: Navigate using hamburger menu
3. **Patient**: View appointments
4. **Patient**: Send message to doctor
5. **Patient**: View health records
6. **Patient**: All features work smoothly

---

## 🛠 Troubleshooting

### Issue: Can't see "Grant Access" button

**Solution**: Hover over the Patient Portal card - the button appears on hover

### Issue: Dialog doesn't open

**Solution**:
- Check browser console for errors
- Ensure React DevTools shows component is mounted
- Try refreshing the page

### Issue: "Patient not found" error

**Solution**:
- Verify patient ID exists in FHIR server
- Check API endpoint is running
- Review backend logs

### Issue: Password validation fails

**Solution**:
- Password must be at least 8 characters
- Use "Generate Strong Password" button
- Check for special characters if required

### Issue: Portal access already exists

**Solution**:
- Check patient already has portal tag
- Patient Portal card should show "Access Granted"
- Patient can login with existing credentials

---

## 🔐 Security Notes

### Password Handling
- Passwords are hashed with bcrypt (12 rounds)
- Never stored in plain text
- Temporary passwords should be changed after first login (future feature)

### FHIR Storage
Portal credentials are stored as FHIR extensions:
- `urn:oid:ehrconnect:password` - Hashed password
- `urn:oid:ehrconnect:portal-access-granted` - Grant timestamp
- Meta tag: `portal-patient` - Identifies portal users

### Access Control
- Patients can only view their own data
- Session-based authentication
- HIPAA-compliant data handling

---

## 📊 API Endpoints

### Check Portal Access
```bash
GET /api/patient/check-portal-access?patientId=PATIENT_ID
```

Response:
```json
{
  "hasAccess": true,
  "email": "patient@example.com"
}
```

### Grant Portal Access
```bash
POST /api/patient/grant-portal-access
Content-Type: application/json

{
  "patientId": "PATIENT_ID",
  "email": "patient@example.com",
  "tempPassword": "SecurePassword123!",
  "sendEmail": true
}
```

Response:
```json
{
  "message": "Portal access granted successfully",
  "patientId": "PATIENT_ID",
  "email": "patient@example.com"
}
```

---

## 🎨 Visual Guide

### Patient Portal Card States

#### Before Access is Granted:
```
┌─────────────────────────────────┐
│ 🌐 Patient Portal               │
│                                  │
│ Status: ❌ No Access            │
│                                  │
│ [Grant Access] ← Hover to see   │
└─────────────────────────────────┘
```

#### After Access is Granted:
```
┌─────────────────────────────────┐
│ 🌐 Patient Portal               │
│                                  │
│ Status: ✅ Access Granted       │
│                                  │
│ (No button - already granted)   │
└─────────────────────────────────┘
```

### Grant Access Dialog:
```
┌────────────────────────────────────────┐
│ Grant Portal Access                     │
│ ──────────────────────────────────────│
│                                        │
│ Email Address *                        │
│ ┌────────────────────────────────────┐│
│ │ patient@example.com                ││
│ └────────────────────────────────────┘│
│                                        │
│ Temporary Password *    [Generate]     │
│ ┌────────────────────────────────────┐│
│ │ Abc123!@#Xyz                       ││
│ └────────────────────────────────────┘│
│                                        │
│ ☑ Send invitation email               │
│                                        │
│ ℹ️ Patient will receive access to:    │
│   - View health records                │
│   - Book appointments                  │
│   - Message care team                  │
│                                        │
│          [Cancel]  [Grant Access]      │
└────────────────────────────────────────┘
```

---

## 🎓 Best Practices

### For Providers

1. **Always generate strong passwords** - Use the generator button
2. **Verify patient email** - Ensure it's correct before granting access
3. **Copy credentials immediately** - Share them securely with patient
4. **Instruct patients** - Tell them to change password after first login

### For Testing

1. **Use incognito mode** - Test different user types simultaneously
2. **Test on mobile** - Patient portal is mobile-first
3. **Check all tabs** - Verify data displays correctly
4. **Test booking flow** - Complete appointment booking
5. **Try messaging** - Send test messages

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12)
2. Review network requests
3. Check server logs
4. Verify FHIR server is running
5. Review this guide
6. Check main documentation: `PATIENT_PORTAL_IMPLEMENTATION.md`

---

## ✨ Summary

You now have a fully functional patient portal access management system!

**Provider capabilities:**
- ✅ View portal access status for each patient
- ✅ Grant portal access with one click
- ✅ Generate secure passwords automatically
- ✅ Copy credentials to share with patients

**Patient capabilities:**
- ✅ Register for portal access
- ✅ Login securely
- ✅ View health dashboard
- ✅ Book appointments
- ✅ View health records
- ✅ Send messages to care team

**Next steps:**
- Implement email notifications
- Add password reset functionality
- Enable two-factor authentication
- Build mobile app

---

**Happy Testing! 🎉**

For detailed implementation info, see: `PATIENT_PORTAL_IMPLEMENTATION.md`
For comprehensive testing, see: `PATIENT_PORTAL_TESTING.md`
