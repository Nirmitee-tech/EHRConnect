# Pediatrics Clinical Workflows

## Well-Child Visit Workflows

### Newborn Visit (Birth - 1 month)

**Schedule**: Birth, 3-5 days, 7-10 days, 1 month

**Clinical Components**:
1. Birth data review
   - Birth weight, length, head circumference
   - Gestational age
   - Apgar scores
   - Birth complications

2. Physical examination
   - General appearance
   - Skin (jaundice assessment)
   - Eyes (red reflex)
   - Cardiovascular
   - Umbilical cord status

3. Feeding assessment
   - Breastfeeding vs formula
   - Frequency and duration
   - Weight gain/loss
   - Elimination patterns

4. Newborn screening
   - State NHS panel
   - Hearing screening
   - Cardiac screening (if applicable)

5. Anticipatory guidance
   - Safe sleep practices
   - Car seat safety
   - Injury prevention
   - When to call the doctor

**Documentation**: Record in `pediatric_well_visits` and `pediatric_newborn_screening`

### Infant Visits (1-12 months)

**Schedule**: 1, 2, 4, 6, 9, 12 months

**Clinical Components**:
1. Growth monitoring
   - Weight, length, head circumference
   - Plot on WHO growth charts
   - Calculate percentiles

2. Developmental screening
   - Gross motor milestones
   - Fine motor skills
   - Language development
   - Social-emotional development

3. Immunizations (per CDC schedule)
   - 2 months: DTaP, IPV, Hib, PCV13, Rotavirus, HepB
   - 4 months: DTaP, IPV, Hib, PCV13, Rotavirus
   - 6 months: DTaP, IPV, Hib, PCV13, Rotavirus, Influenza
   - 12 months: Hib, PCV13, MMR, Varicella, HepA

4. Nutrition counseling
   - Breastfeeding support
   - Introduction of solid foods (4-6 months)
   - Vitamin D supplementation
   - Iron-rich foods (6+ months)

5. Safety anticipatory guidance
   - Car seat (rear-facing)
   - Poison prevention
   - Fall prevention
   - Water safety

### Toddler Visits (1-3 years)

**Schedule**: 15, 18, 24, 30 months

**Clinical Components**:
1. Growth assessment
   - Transition to CDC charts at 24 months
   - BMI calculation begins
   - Monitor growth velocity

2. Developmental screening
   - Formal screening at 18 and 24 months
   - Language milestones (50+ words by 24 months)
   - Toilet training readiness

3. Autism screening
   - M-CHAT at 18 and 24 months
   - Red flags: lack of eye contact, no pointing, regression

4. Lead screening
   - Blood lead level at 12 and 24 months
   - Environmental risk assessment

5. Behavioral guidance
   - Temper tantrums
   - Setting limits
   - Positive discipline

### Preschool Visits (3-5 years)

**Schedule**: 3, 4, 5 years

**Clinical Components**:
1. School readiness assessment
   - Pre-reading skills
   - Number recognition
   - Social skills
   - Attention span

2. Vision screening
   - Visual acuity testing
   - Photoscreening if available
   - Strabismus screening

3. Hearing screening
   - Pure tone audiometry
   - Speech discrimination

4. Immunizations
   - 4 years: DTaP, IPV, MMR, Varicella
   - Influenza annually

5. Anticipatory guidance
   - Kindergarten preparation
   - Screen time limits
   - Physical activity
   - Healthy eating

### School-Age Visits (5-13 years)

**Schedule**: Annual well-child visits

**Clinical Components**:
1. Growth and BMI tracking
   - Monitor for obesity
   - Eating disorders screening (if concerns)

2. Academic performance
   - School grades
   - Learning difficulties
   - ADHD screening (if indicated)

3. Sports participation
   - Sports physical examination
   - Cardiovascular screening
   - Musculoskeletal assessment

4. Immunizations
   - 11-12 years: Tdap, MenACWY, HPV series start
   - Influenza annually

5. Anticipatory guidance
   - Nutrition and exercise
   - Bullying prevention
   - Internet safety
   - Injury prevention (bike helmets, sports equipment)

### Adolescent Visits (13-18 years)

**Schedule**: Annual well-child visits

**Clinical Components**:
1. HEADSS assessment (confidential)
   - Home environment
   - Education/Employment
   - Activities/Peers
   - Drugs/Alcohol/Tobacco
   - Sexuality
   - Suicide/Depression

2. Mental health screening
   - PHQ-9 Modified for adolescents
   - Anxiety screening
   - Eating disorder screening

3. Substance use screening
   - CRAFFT questionnaire
   - Brief intervention if positive

4. Sexual health assessment
   - STI screening (if sexually active)
   - Contraception counseling
   - Pregnancy testing (if indicated)

5. Immunizations
   - 16 years: MenACWY booster, MenB series
   - HPV series completion
   - Influenza annually

## Immunization Workflows

### Standard Visit Immunization Process

1. **Pre-Assessment**
   - Review immunization history
   - Check CDC/ACIP schedule
   - Identify due vaccines
   - Screen contraindications
   - Review allergies

2. **Education & Consent**
   - Provide VIS documents
   - Explain benefits and risks
   - Address parent concerns
   - Obtain informed consent

3. **Administration**
   - Verify correct vaccine
   - Check expiration date
   - Record lot number
   - Administer per protocol
   - Document site, route, dose

4. **Post-Administration**
   - Observe for reactions (15-30 min)
   - Provide aftercare instructions
   - Schedule next vaccines
   - Update immunization card

5. **Documentation**
   - Record in `pediatric_immunizations`
   - Update `pediatric_immunization_status`
   - Submit to state registry
   - Generate reminder notices

### Catch-Up Immunization Schedule

For children behind on vaccines:

1. **Assessment**
   - Determine missing vaccines
   - Calculate patient's current age
   - Review contraindications

2. **Schedule Generation**
   - Use CDC catch-up schedule
   - Minimum intervals between doses
   - Priority vaccines first

3. **Implementation**
   - Administer maximum allowable vaccines per visit
   - Follow minimum intervals
   - Document catch-up plan

## Developmental Screening Workflow

### Ages & Stages Questionnaire (ASQ-3)

**Schedule**: 9, 18, 24, 30 months; 4 years

1. **Parent Completion**
   - Provide age-appropriate questionnaire
   - Allow 10-15 minutes
   - Offer assistance if needed

2. **Scoring**
   - Calculate domain scores
   - Compare to cutoff scores
   - Identify areas of concern

3. **Interpretation**
   - Normal: Continue monitoring
   - Monitoring zone: Provide activities, rescreen
   - Referral zone: Refer for evaluation

4. **Follow-Up**
   - Document in `pediatric_developmental_screening`
   - Provide developmental activities
   - Make referrals if needed
   - Schedule follow-up

### M-CHAT (Autism Screening)

**Schedule**: 18 and 24 months

1. **Initial Screening**
   - Parent completes 20-item questionnaire
   - Score responses

2. **Risk Assessment**
   - Low risk: 0-2 failed items
   - Medium risk: 3-7 failed items → Follow-up interview
   - High risk: 8+ failed items → Immediate referral

3. **Follow-Up**
   - Medium risk: Complete M-CHAT-F interview
   - Refer for evaluation if still concerning
   - Document in `pediatric_autism_screening`

## HEADSS Assessment Workflow

**For adolescents 13-18 years**

### Setup
1. Establish confidentiality
2. Explain limits (safety issues)
3. Meet with teen alone

### Assessment Domains

**H - Home**
- Who lives at home?
- Relationships with family members?
- Recent changes or stressors?
- Feel safe at home?

**E - Education/Employment**
- School grade/performance?
- Favorite subjects?
- Attendance issues?
- Future plans?
- Work (hours, type)?

**A - Activities**
- What do you do for fun?
- Sports/hobbies?
- Friends?
- Screen time?

**D - Drugs**
- Friends use substances?
- Have you tried? (alcohol, tobacco, marijuana, others)
- Frequency of use?
- Ever driven under influence?

**S - Sexuality**
- Attracted to males/females/both?
- Sexually active?
- Contraception use?
- History of STIs?
- Ever forced/uncomfortable?

**S - Suicide/Depression**
- Mood (sad, anxious, irritable)?
- Sleep changes?
- Changes in appetite/weight?
- Thoughts of harming self?
- Suicide plan?

### Risk Level Determination

- **Low Risk**: No concerning responses
- **Moderate Risk**: Some risk factors, no immediate danger
- **High Risk**: Multiple risk factors, safety concerns
- **Immediate Risk**: Suicidal ideation with plan

### Intervention

1. **Low/Moderate Risk**
   - Anticipatory guidance
   - Resources provided
   - Follow-up in 3-6 months

2. **High Risk**
   - Same-day mental health referral
   - Parent notification (unless contraindicated)
   - Safety plan

3. **Immediate Risk**
   - Do not leave alone
   - Emergency mental health evaluation
   - Parent notification
   - Consider hospitalization

## Special Situations

### Sports Physical

1. **Medical History**
   - Previous injuries
   - Cardiovascular symptoms
   - Medications
   - Family history (sudden death, heart disease)

2. **Physical Examination**
   - Cardiovascular (heart sounds, pulses)
   - Musculoskeletal (strength, flexibility, stability)
   - Vision screening
   - General health

3. **Clearance Decision**
   - Cleared without restrictions
   - Cleared with restrictions
   - Not cleared - further evaluation needed

4. **Documentation**
   - Record in `pediatric_sports_physicals`
   - Provide clearance form
   - Valid for 1 year

### Maternal-Newborn Linkage

1. **At Birth**
   - Link newborn to maternal record
   - Import pregnancy/delivery data
   - Flag maternal complications

2. **Ongoing Care**
   - Review maternal health issues
   - Coordinate postpartum care
   - Monitor for genetic conditions

3. **Multiple Births**
   - Track twin/triplet status
   - Coordinate care for siblings
   - Monitor growth differentials

## Quality Metrics

Track in `reports/pediatric-kpis.json`:
- Immunization up-to-date rate
- Well-child visit completion
- Developmental screening rates
- Lead screening completion
- BMI percentile distribution
- HEADSS assessment completion (13-18y)
