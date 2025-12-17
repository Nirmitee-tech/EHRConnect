'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  FileText, 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  Search, 
  Code, 
  BookOpen, 
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function AIClinicalAssistant() {
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('auto-complete');

  // Auto-complete state
  const [partialNote, setPartialNote] = useState('');
  const [noteCompletion, setNoteCompletion] = useState<any>(null);

  // Differential diagnosis state
  const [symptoms, setSymptoms] = useState('');
  const [diagnoses, setDiagnoses] = useState<any[]>([]);

  // Medication interaction state
  const [medications, setMedications] = useState('');
  const [interactions, setInteractions] = useState<any>(null);

  // Coding suggestions state
  const [encounterText, setEncounterText] = useState('');
  const [codingSuggestions, setCodingSuggestions] = useState<any>(null);

  const handleAutoComplete = async () => {
    if (!partialNote.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai-clinical/auto-complete-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partialNote,
          patientContext: {
            age: 45,
            gender: 'Female',
            chiefComplaint: 'Chest pain',
            medicalHistory: 'Hypertension, Type 2 Diabetes'
          },
          encounterType: 'Office Visit'
        })
      });
      const data = await response.json();
      setNoteCompletion(data);
      setAiEnabled(data.aiEnabled !== false);
    } catch (error) {
      console.error('Auto-complete error:', error);
    }
    setLoading(false);
  };

  const handleDifferentialDiagnosis = async () => {
    if (!symptoms.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai-clinical/differential-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptoms.split('\n').filter(s => s.trim()),
          vitals: { bp: '140/90', hr: 88, temp: 98.6 },
          labResults: [],
          patientHistory: { diabetes: true, hypertension: true }
        })
      });
      const data = await response.json();
      setDiagnoses(data.diagnoses || []);
      setAiEnabled(data.aiEnabled !== false);
    } catch (error) {
      console.error('Differential diagnosis error:', error);
    }
    setLoading(false);
  };

  const handleMedicationInteractions = async () => {
    if (!medications.trim()) return;
    
    setLoading(true);
    try {
      const medList = medications.split('\n').filter(m => m.trim()).map(med => ({
        name: med.trim(),
        dosage: '1 tablet daily'
      }));
      
      const response = await fetch('/api/ai-clinical/medication-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: medList })
      });
      const data = await response.json();
      setInteractions(data);
      setAiEnabled(data.aiEnabled !== false);
    } catch (error) {
      console.error('Medication interaction error:', error);
    }
    setLoading(false);
  };

  const handleCodingSuggestions = async () => {
    if (!encounterText.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai-clinical/suggest-coding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chiefComplaint: 'Chest pain',
          assessment: encounterText,
          procedures: 'EKG, Chest X-ray',
          duration: 30
        })
      });
      const data = await response.json();
      setCodingSuggestions(data);
      setAiEnabled(data.aiEnabled !== false);
    } catch (error) {
      console.error('Coding suggestion error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">AI Clinical Intelligence</h1>
          <Badge variant={aiEnabled ? "default" : "secondary"} className="ml-2">
            {aiEnabled ? "AI Enabled" : "AI Not Configured"}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Leverage AI to enhance clinical decision-making, improve documentation, and optimize patient care
        </p>
      </div>

      {!aiEnabled && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              AI Service Not Configured
            </CardTitle>
            <CardDescription className="text-yellow-700">
              To enable AI features, set the OPENAI_API_KEY or AI_API_KEY environment variable in your .env file.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-2">
          <TabsTrigger value="auto-complete">
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="diagnosis">
            <Stethoscope className="h-4 w-4 mr-2" />
            Diagnosis
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="h-4 w-4 mr-2" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="coding">
            <Code className="h-4 w-4 mr-2" />
            Coding
          </TabsTrigger>
        </TabsList>

        {/* Auto-complete Notes */}
        <TabsContent value="auto-complete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Smart Clinical Note Auto-Completion
              </CardTitle>
              <CardDescription>
                Start writing your clinical note and let AI complete it with contextually appropriate content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Partial Clinical Note</label>
                <Textarea
                  value={partialNote}
                  onChange={(e) => setPartialNote(e.target.value)}
                  placeholder="Subjective: Patient presents with..."
                  rows={6}
                  className="font-mono"
                />
              </div>
              <Button onClick={handleAutoComplete} disabled={loading || !partialNote.trim()}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Complete Note
              </Button>

              {noteCompletion && (
                <div className="mt-4 space-y-4">
                  {noteCompletion.completion && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold mb-2">AI Completion:</h4>
                      <p className="whitespace-pre-wrap font-mono text-sm">{noteCompletion.completion}</p>
                    </div>
                  )}
                  {noteCompletion.suggestions && noteCompletion.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Alternative Suggestions:</h4>
                      {noteCompletion.suggestions.map((suggestion: string, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 border rounded mb-2">
                          <p className="text-sm font-mono">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Differential Diagnosis */}
        <TabsContent value="diagnosis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                AI-Powered Differential Diagnosis
              </CardTitle>
              <CardDescription>
                Enter patient symptoms to receive AI-suggested differential diagnoses with confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Symptoms (one per line)</label>
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Chest pain&#10;Shortness of breath&#10;Diaphoresis&#10;Nausea"
                  rows={6}
                />
              </div>
              <Button onClick={handleDifferentialDiagnosis} disabled={loading || !symptoms.trim()}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Stethoscope className="h-4 w-4 mr-2" />}
                Analyze Symptoms
              </Button>

              {diagnoses && diagnoses.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-semibold">Differential Diagnoses:</h4>
                  {diagnoses.map((dx: any, idx: number) => (
                    <Card key={idx} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="outline" className="mb-2">{dx.icd10}</Badge>
                          <h5 className="font-semibold">{dx.diagnosis}</h5>
                        </div>
                        <Badge 
                          variant={dx.confidence > 80 ? "default" : dx.confidence > 60 ? "secondary" : "outline"}
                        >
                          {dx.confidence}% confidence
                        </Badge>
                      </div>
                      {dx.supportingFactors && (
                        <div className="text-sm mb-2">
                          <strong>Supporting:</strong> {dx.supportingFactors.join(', ')}
                        </div>
                      )}
                      {dx.nextSteps && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Next Steps:</strong> {dx.nextSteps.join(', ')}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medication Interactions */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medication Interaction Checker
              </CardTitle>
              <CardDescription>
                Check for potential drug interactions with AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Medications (one per line)</label>
                <Textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="Metformin&#10;Lisinopril&#10;Aspirin&#10;Warfarin"
                  rows={6}
                />
              </div>
              <Button onClick={handleMedicationInteractions} disabled={loading || !medications.trim()}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pill className="h-4 w-4 mr-2" />}
                Check Interactions
              </Button>

              {interactions && (
                <div className="mt-4 space-y-4">
                  {interactions.overallRisk && (
                    <div className={`p-4 rounded-lg ${
                      interactions.overallRisk === 'high' ? 'bg-red-50 border-red-200' :
                      interactions.overallRisk === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    } border`}>
                      <strong>Overall Risk: </strong>
                      <Badge variant={
                        interactions.overallRisk === 'high' ? 'destructive' :
                        interactions.overallRisk === 'medium' ? 'secondary' :
                        'default'
                      }>
                        {interactions.overallRisk.toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  {interactions.critical && interactions.critical.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Critical Interactions:</h4>
                      {interactions.critical.map((interaction: any, idx: number) => (
                        <Card key={idx} className="p-4 mb-2 border-red-200">
                          <p><strong>Drugs:</strong> {interaction.drugs.join(' + ')}</p>
                          <p><strong>Risk:</strong> {interaction.risk}</p>
                          <p className="text-red-600"><strong>Action:</strong> {interaction.action}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coding Suggestions */}
        <TabsContent value="coding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Automated Medical Coding
              </CardTitle>
              <CardDescription>
                Get AI-suggested ICD-10 and CPT codes with confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Clinical Assessment</label>
                <Textarea
                  value={encounterText}
                  onChange={(e) => setEncounterText(e.target.value)}
                  placeholder="Patient diagnosed with Type 2 Diabetes Mellitus, uncontrolled. Initiated on Metformin. Counseling provided on diet and exercise."
                  rows={6}
                />
              </div>
              <Button onClick={handleCodingSuggestions} disabled={loading || !encounterText.trim()}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Code className="h-4 w-4 mr-2" />}
                Suggest Codes
              </Button>

              {codingSuggestions && (
                <div className="mt-4 space-y-4">
                  {codingSuggestions.icd10 && codingSuggestions.icd10.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">ICD-10 Codes:</h4>
                      {codingSuggestions.icd10.map((code: any, idx: number) => (
                        <Card key={idx} className="p-3 mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge variant="outline" className="mb-1">{code.code}</Badge>
                              <p className="text-sm font-medium">{code.description}</p>
                              <p className="text-xs text-muted-foreground">{code.position}</p>
                            </div>
                            <Badge>{code.confidence}%</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {codingSuggestions.cpt && codingSuggestions.cpt.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">CPT Codes:</h4>
                      {codingSuggestions.cpt.map((code: any, idx: number) => (
                        <Card key={idx} className="p-3 mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge variant="outline" className="mb-1">{code.code}</Badge>
                              <p className="text-sm font-medium">{code.description}</p>
                            </div>
                            <Badge>{code.confidence}%</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {codingSuggestions.estimatedReimbursement && (
                    <Card className="p-4 bg-green-50 border-green-200">
                      <p><strong>Estimated Reimbursement:</strong> {codingSuggestions.estimatedReimbursement}</p>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
