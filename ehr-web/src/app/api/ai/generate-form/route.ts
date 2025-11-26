import { NextRequest, NextResponse } from 'next/server';

// Types for AI-generated form questions
interface AIGeneratedQuestion {
  text: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface AIGeneratedForm {
  title: string;
  description: string;
  questions: AIGeneratedQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const prompt = formData.get('prompt') as string || '';

    let extractedText = '';

    // If a PDF file is uploaded, extract text from it
    if (file) {
      // For now, we'll use a simple approach
      // In production, you'd use a PDF parsing library like pdf-parse
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Simple text extraction (in production, use pdf-parse or similar)
      // This is a placeholder - actual PDF parsing would be more complex
      extractedText = `Document: ${file.name}\n`;

      // Try to extract readable text from PDF buffer
      const textContent = buffer.toString('utf-8');
      const readableText = textContent.replace(/[^\x20-\x7E\n]/g, ' ').trim();
      if (readableText.length > 100) {
        extractedText += readableText.substring(0, 5000); // Limit to first 5000 chars
      }
    }

    // Combine extracted text with user prompt
    const fullContext = extractedText
      ? `Based on this document content:\n${extractedText}\n\nUser request: ${prompt}`
      : prompt;

    // Call OpenAI or similar AI service
    // For now, we'll use a mock response for demonstration
    // In production, you'd call your AI service here

    const openAIKey = process.env.OPENAI_API_KEY;

    if (openAIKey) {
      // Real AI call
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a healthcare form designer. Generate FHIR-compliant questionnaire items based on the provided context.

              Return a JSON object with this structure:
              {
                "title": "Form title",
                "description": "Brief description of the form",
                "questions": [
                  {
                    "text": "Question text",
                    "type": "text|number|date|boolean|single_choice|multiple_choice",
                    "required": true/false,
                    "options": ["option1", "option2"] // only for choice types
                  }
                ]
              }

              Focus on creating comprehensive, clinically relevant questions.
              Include appropriate question types for the context.
              Group related questions logically.
              Make questions clear and unambiguous.`
            },
            {
              role: 'user',
              content: fullContext || 'Create a general patient intake form'
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        const content = data.choices[0]?.message?.content;

        try {
          // Parse JSON from AI response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const generatedForm = JSON.parse(jsonMatch[0]) as AIGeneratedForm;
            return NextResponse.json(generatedForm);
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
        }
      }
    }

    // Fallback: Generate mock data based on prompt keywords
    const generatedForm = generateMockForm(prompt || extractedText);
    return NextResponse.json(generatedForm);

  } catch (error) {
    console.error('AI form generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate form' },
      { status: 500 }
    );
  }
}

// Mock form generator for demonstration
function generateMockForm(prompt: string): AIGeneratedForm {
  const lowerPrompt = prompt.toLowerCase();

  // Detect form type from prompt
  if (lowerPrompt.includes('covid') || lowerPrompt.includes('screening')) {
    return {
      title: 'COVID-19 Screening Questionnaire',
      description: 'Pre-visit screening questionnaire for COVID-19 symptoms and exposure',
      questions: [
        { text: 'Have you experienced fever (temperature > 100.4F/38C) in the past 14 days?', type: 'boolean', required: true },
        { text: 'Have you had a new or worsening cough?', type: 'boolean', required: true },
        { text: 'Have you experienced shortness of breath or difficulty breathing?', type: 'boolean', required: true },
        { text: 'Have you had loss of taste or smell?', type: 'boolean', required: true },
        { text: 'Have you been in close contact with anyone diagnosed with COVID-19 in the past 14 days?', type: 'boolean', required: true },
        { text: 'Have you traveled outside your state/country in the past 14 days?', type: 'boolean', required: true },
        { text: 'Date of symptom onset (if applicable)', type: 'date', required: false },
        { text: 'Current vaccination status', type: 'single_choice', required: true, options: ['Fully vaccinated', 'Partially vaccinated', 'Not vaccinated', 'Prefer not to say'] },
        { text: 'Additional symptoms or comments', type: 'text', required: false },
      ]
    };
  }

  if (lowerPrompt.includes('pre-op') || lowerPrompt.includes('operative') || lowerPrompt.includes('surgery')) {
    return {
      title: 'Pre-Operative Assessment Form',
      description: 'Comprehensive pre-surgical evaluation questionnaire',
      questions: [
        { text: 'Scheduled procedure/surgery', type: 'text', required: true },
        { text: 'Date of last meal/drink', type: 'datetime', required: true },
        { text: 'Do you have any allergies to medications, latex, or anesthesia?', type: 'boolean', required: true },
        { text: 'If yes, please list all allergies', type: 'text', required: false },
        { text: 'Current medications (including over-the-counter and supplements)', type: 'text', required: true },
        { text: 'Have you had any previous surgeries?', type: 'boolean', required: true },
        { text: 'If yes, please list previous surgeries and dates', type: 'text', required: false },
        { text: 'Do you have a history of heart disease?', type: 'boolean', required: true },
        { text: 'Do you have a history of lung disease or breathing problems?', type: 'boolean', required: true },
        { text: 'Do you have diabetes?', type: 'boolean', required: true },
        { text: 'Do you smoke or use tobacco products?', type: 'single_choice', required: true, options: ['Never', 'Former smoker', 'Current smoker'] },
        { text: 'Do you consume alcohol?', type: 'single_choice', required: true, options: ['Never', 'Occasionally', 'Regularly'] },
        { text: 'Do you have or have you ever had problems with anesthesia?', type: 'boolean', required: true },
        { text: 'Family history of anesthesia complications', type: 'boolean', required: true },
        { text: 'Current weight (kg)', type: 'number', required: true },
        { text: 'Current height (cm)', type: 'number', required: true },
      ]
    };
  }

  if (lowerPrompt.includes('mental') || lowerPrompt.includes('psych') || lowerPrompt.includes('depression') || lowerPrompt.includes('anxiety')) {
    return {
      title: 'Mental Health Intake Assessment',
      description: 'Initial mental health evaluation questionnaire',
      questions: [
        { text: 'What is the primary reason for your visit today?', type: 'text', required: true },
        { text: 'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?', type: 'single_choice', required: true, options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
        { text: 'Over the past 2 weeks, how often have you had little interest or pleasure in doing things?', type: 'single_choice', required: true, options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
        { text: 'Over the past 2 weeks, how often have you felt nervous, anxious, or on edge?', type: 'single_choice', required: true, options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
        { text: 'How would you rate your current stress level?', type: 'single_choice', required: true, options: ['Low', 'Moderate', 'High', 'Very High'] },
        { text: 'Are you currently experiencing thoughts of self-harm or suicide?', type: 'boolean', required: true },
        { text: 'Have you received mental health treatment before?', type: 'boolean', required: true },
        { text: 'Are you currently taking any psychiatric medications?', type: 'boolean', required: true },
        { text: 'If yes, please list medications', type: 'text', required: false },
        { text: 'How many hours of sleep do you typically get per night?', type: 'number', required: true },
        { text: 'Do you use alcohol or recreational drugs?', type: 'single_choice', required: true, options: ['Never', 'Occasionally', 'Regularly'] },
        { text: 'What are your main goals for therapy/treatment?', type: 'text', required: false },
      ]
    };
  }

  if (lowerPrompt.includes('pediatric') || lowerPrompt.includes('child') || lowerPrompt.includes('well-visit') || lowerPrompt.includes('wellness')) {
    return {
      title: 'Pediatric Well-Visit Questionnaire',
      description: 'Routine pediatric wellness check questionnaire',
      questions: [
        { text: "Child's date of birth", type: 'date', required: true },
        { text: "Child's current weight", type: 'text', required: true },
        { text: "Child's current height", type: 'text', required: true },
        { text: 'Are immunizations up to date?', type: 'boolean', required: true },
        { text: 'Any concerns about growth or development?', type: 'boolean', required: true },
        { text: 'If yes, please describe concerns', type: 'text', required: false },
        { text: 'How would you describe your child\'s eating habits?', type: 'single_choice', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { text: 'How many hours of sleep does your child get per night?', type: 'number', required: true },
        { text: 'How many hours of screen time per day?', type: 'number', required: true },
        { text: 'Does your child participate in regular physical activity?', type: 'boolean', required: true },
        { text: 'Any behavioral concerns?', type: 'boolean', required: true },
        { text: 'How is your child doing in school/daycare?', type: 'single_choice', required: true, options: ['Excellent', 'Good', 'Some concerns', 'Significant concerns'] },
        { text: 'Any recent illnesses or injuries?', type: 'text', required: false },
        { text: 'Is your child taking any medications or supplements?', type: 'boolean', required: true },
        { text: 'Any allergies?', type: 'text', required: false },
        { text: 'Additional questions or concerns for the provider', type: 'text', required: false },
      ]
    };
  }

  // Default general intake form
  return {
    title: 'Patient Intake Form',
    description: 'General patient information and medical history questionnaire',
    questions: [
      { text: 'Full Legal Name', type: 'text', required: true },
      { text: 'Date of Birth', type: 'date', required: true },
      { text: 'Gender', type: 'single_choice', required: true, options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
      { text: 'Primary Phone Number', type: 'text', required: true },
      { text: 'Email Address', type: 'text', required: false },
      { text: 'Emergency Contact Name', type: 'text', required: true },
      { text: 'Emergency Contact Phone', type: 'text', required: true },
      { text: 'Reason for Visit', type: 'text', required: true },
      { text: 'Current Medications', type: 'text', required: false },
      { text: 'Known Allergies', type: 'text', required: false },
      { text: 'Do you have any chronic medical conditions?', type: 'boolean', required: true },
      { text: 'If yes, please list conditions', type: 'text', required: false },
      { text: 'Have you had any surgeries?', type: 'boolean', required: true },
      { text: 'Do you smoke or use tobacco?', type: 'boolean', required: true },
      { text: 'Do you consume alcohol?', type: 'single_choice', required: true, options: ['Never', 'Occasionally', 'Regularly'] },
      { text: 'Family Medical History (significant conditions)', type: 'text', required: false },
    ]
  };
}
