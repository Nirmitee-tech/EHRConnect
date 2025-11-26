# Forms System - Complete Feature Set

## 🎨 Layout Options

### 1. **Compact Layout**
- Minimal spacing and padding
- Perfect for mobile devices
- Tight question spacing
- Thin progress bars
- Small buttons and text

### 2. **Standard Layout**
- Balanced spacing for desktop
- Comfortable padding
- Medium-sized elements
- Professional appearance

### 3. **Wizard Layout**
- Step-by-step guided experience
- One section at a time
- Navigation buttons (Previous/Next)
- Progress indicator shows current step
- Great for complex forms

### 4. **Card Layout**
- Each question in its own card
- Drop shadows and spacing
- Modern, clean appearance
- Easy to scan

### 5. **Accordion Layout**
- Collapsible sections
- Show/hide question groups
- Saves screen space
- Good for long forms

---

## 📱 Display Modes

### 1. **Single Page**
- All questions visible at once
- Scroll through entire form
- Best for short forms (< 20 questions)

### 2. **Paginated**
- Split into multiple pages
- Page navigation at bottom
- Automatic or manual breaks
- Shows page X of Y

### 3. **Section by Section**
- Navigate by form sections
- Tab-based or button navigation
- Complete one section before moving to next

---

## 🎯 Behavior Settings

### Anonymous Access
- ✅ Enable: Anyone can fill form without login
- ❌ Disable: Requires authentication
- Use case: Public surveys, patient intake forms

### Auto-Save
- Automatically save progress every N seconds
- Configurable interval (10-300 seconds)
- Prevents data loss
- Shows "Saving..." indicator

### Save Draft
- Allow users to save and return later
- Resume from where they left off
- Draft management

### Validation
- **On Blur**: Validate when field loses focus
- **On Submit**: Validate only when submitting
- **Real-time**: Validate as user types

### Required Questions
- Individual: Mark specific questions as required
- All: Force all questions to be required
- Override individual settings

### Shuffle Questions
- Randomize question order
- Useful for surveys/tests
- Prevents pattern bias

---

## 🎨 Branding & Customization

### Logo
- Upload custom logo
- Displays in form header
- Supports PNG, JPG, SVG

### Colors
- **Primary Color**: Buttons, progress bars, accents
- **Accent Color**: Links, highlights, secondary elements
- Color picker with hex input

### Header/Footer
- Custom header text/HTML
- Custom footer text/HTML
- Can include:
  - Organization name
  - Contact information
  - Terms & conditions
  - Privacy policy links

### Custom CSS
- Add your own CSS rules
- Full control over styling
- Target specific elements
- Advanced users only

---

## 📊 Progress & Feedback

### Progress Bar
- Show/hide completion percentage
- Visual progress indicator
- Question count (e.g., "15/33 answered")
- Motivates form completion

### Question Numbers
- Show/hide question numbering
- Format: 1, 2, 3... or 1.1, 1.2, 2.1...
- Helps with navigation

### Validation Messages
- Inline error messages
- Success indicators (✓)
- Required field markers (*)
- Custom error text

---

## 🔧 Advanced Features

### Conditional Logic
- Show/hide questions based on answers
- Enable/disable fields
- Skip logic and branching
- Complex rules with AND/OR

### Question Types
- Text (short answer)
- Textarea (long answer)
- Number (integer/decimal)
- Date/Time/DateTime
- Boolean (Yes/No)
- Choice (single/multiple)
- Dropdown
- File upload
- Signature

### Data Features
- Pre-population from patient record
- Calculated fields
- Data extraction to FHIR resources
- Export to PDF/CSV/JSON

---

## 🚀 How to Use These Features

### In Form Builder

1. **Open Form Builder**
   - Navigate to Forms → Builder
   - Create new or edit existing form

2. **Access Settings Panel**
   - Click "Settings" icon (⚙️) in top right
   - Or press keyboard shortcut

3. **Configure Layout**
   - Go to "Layout" tab
   - Select layout style
   - Choose display mode
   - Toggle progress bar
   - Toggle question numbers

4. **Configure Behavior**
   - Go to "Behavior" tab
   - Enable/disable anonymous access
   - Configure auto-save
   - Set validation rules
   - Toggle required questions

5. **Customize Branding**
   - Go to "Branding" tab
   - Upload logo
   - Set colors
   - Add header/footer text

6. **Add Custom CSS** (Advanced)
   - Go to "Advanced" tab
   - Write custom CSS
   - Preview changes

7. **Save Settings**
   - Settings auto-save with form
   - Preview to see changes
   - Publish when ready

---

## 📋 Form Settings JSON Structure

```json
{
  "layout": "compact",
  "displayMode": "single-page",
  "allowAnonymous": true,
  "showProgressBar": true,
  "showQuestionNumbers": false,
  "autoSave": true,
  "autoSaveInterval": 30,
  "allowSaveDraft": true,
  "requireAllQuestions": false,
  "shuffleQuestions": false,
  "showValidationOnBlur": true,
  "branding": {
    "logoUrl": "https://example.com/logo.png",
    "headerText": "Patient Intake Form",
    "footerText": "© 2024 Your Clinic",
    "primaryColor": "#3B82F6",
    "accentColor": "#10B981"
  },
  "customCss": ".form-question { margin-bottom: 20px; }"
}
```

---

## 🎯 Use Cases

### Patient Intake Forms
- **Layout**: Standard or Card
- **Display**: Single page
- **Anonymous**: Yes
- **Auto-save**: Yes
- **Branding**: Clinic logo and colors

### Medical Questionnaires (PHQ-9, GAD-7)
- **Layout**: Compact
- **Display**: Single page
- **Anonymous**: Optional
- **Progress Bar**: Yes
- **Question Numbers**: Yes

### Complex Assessment Forms
- **Layout**: Wizard
- **Display**: Section by section
- **Anonymous**: No
- **Progress**: Yes
- **Validation**: On blur

### Quick Surveys
- **Layout**: Compact
- **Display**: Single page
- **Anonymous**: Yes
- **Auto-save**: No
- **Shuffle**: Optional

---

## 🔐 Security & Privacy

- Anonymous forms don't require login
- Data encrypted in transit (HTTPS)
- Draft responses stored securely
- HIPAA-compliant storage
- Audit trail for all submissions
- Role-based access control for viewing responses

---

## 📱 Mobile Optimization

- All layouts are responsive
- Touch-friendly inputs
- Large tap targets
- Swipe gestures (wizard mode)
- Works offline with auto-save
- Progressive Web App (PWA) support

---

## 🎉 Coming Soon

- [ ] Multi-language support
- [ ] Digital signatures
- [ ] Payment integration
- [ ] Appointment scheduling
- [ ] SMS notifications
- [ ] Email confirmations
- [ ] Analytics dashboard
- [ ] A/B testing
- [ ] Form templates marketplace
- [ ] AI-powered form suggestions

---

## Need Help?

- Documentation: `/docs/forms`
- Support: support@ehrconnect.com
- Community: https://community.ehrconnect.com
