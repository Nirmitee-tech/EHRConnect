'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Brain, AlertTriangle, CheckCircle, Info, Save, X,
  ChevronLeft, ChevronRight, Clock, FileText, Printer, Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import obgynService, { EPDSAssessment, getApiHeaders } from '@/services/obgyn.service';

/**
 * EPDS (Edinburgh Postnatal Depression Scale) Calculator
 * =======================================================
 * 
 * A validated 10-question screening tool for postpartum depression.
 * Used worldwide to identify mothers at risk for postpartum depression.
 * 
 * SCORING:
 * - 0-9: Depression unlikely
 * - 10-12: Possible depression (re-screen in 2-4 weeks)
 * - 13+: Likely depression (refer for clinical assessment)
 * - Question 10 (self-harm): Any score > 0 requires immediate evaluation
 * 
 * CLINICAL USE:
 * - Administered at 2-week, 6-week, and 12-week postpartum visits
 * - Takes approximately 5 minutes to complete
 * - Mother completes herself or with provider assistance
 */

interface EPDSQuestion {
  id: number;
  text: string;
  options: { value: number; label: string }[];
  isReversed?: boolean; // Some questions are scored in reverse
}

interface EPDSResult {
  totalScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  interpretation: string;
  recommendation: string;
  selfHarmRisk: boolean;
  answers: number[];
  completedAt: string;
}

interface EPDSHistory {
  date: string;
  score: number;
  riskLevel: string;
  provider: string;
}

interface EPDSCalculatorProps {
  patientId: string;
  episodeId?: string;
  onSave?: (result: EPDSResult) => void;
  onClose?: () => void;
}

// EPDS Questions (standard validated questionnaire)
const EPDS_QUESTIONS: EPDSQuestion[] = [
  {
    id: 1,
    text: "I have been able to laugh and see the funny side of things",
    options: [
      { value: 0, label: "As much as I always could" },
      { value: 1, label: "Not quite so much now" },
      { value: 2, label: "Definitely not so much now" },
      { value: 3, label: "Not at all" }
    ]
  },
  {
    id: 2,
    text: "I have looked forward with enjoyment to things",
    options: [
      { value: 0, label: "As much as I ever did" },
      { value: 1, label: "Rather less than I used to" },
      { value: 2, label: "Definitely less than I used to" },
      { value: 3, label: "Hardly at all" }
    ]
  },
  {
    id: 3,
    text: "I have blamed myself unnecessarily when things went wrong",
    isReversed: true,
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, some of the time" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, never" }
    ]
  },
  {
    id: 4,
    text: "I have been anxious or worried for no good reason",
    options: [
      { value: 0, label: "No, not at all" },
      { value: 1, label: "Hardly ever" },
      { value: 2, label: "Yes, sometimes" },
      { value: 3, label: "Yes, very often" }
    ]
  },
  {
    id: 5,
    text: "I have felt scared or panicky for no very good reason",
    isReversed: true,
    options: [
      { value: 3, label: "Yes, quite a lot" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "No, not much" },
      { value: 0, label: "No, not at all" }
    ]
  },
  {
    id: 6,
    text: "Things have been getting on top of me",
    isReversed: true,
    options: [
      { value: 3, label: "Yes, most of the time I haven't been able to cope at all" },
      { value: 2, label: "Yes, sometimes I haven't been coping as well as usual" },
      { value: 1, label: "No, most of the time I have coped quite well" },
      { value: 0, label: "No, I have been coping as well as ever" }
    ]
  },
  {
    id: 7,
    text: "I have been so unhappy that I have had difficulty sleeping",
    isReversed: true,
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" }
    ]
  },
  {
    id: 8,
    text: "I have felt sad or miserable",
    isReversed: true,
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" }
    ]
  },
  {
    id: 9,
    text: "I have been so unhappy that I have been crying",
    isReversed: true,
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Only occasionally" },
      { value: 0, label: "No, never" }
    ]
  },
  {
    id: 10,
    text: "The thought of harming myself has occurred to me",
    isReversed: true,
    options: [
      { value: 3, label: "Yes, quite often" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Hardly ever" },
      { value: 0, label: "Never" }
    ]
  }
];

export function EPDSCalculator({ patientId, episodeId, onSave, onClose }: EPDSCalculatorProps) {
  const { data: session } = useSession();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(10).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<EPDSHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch EPDS history from API
  useEffect(() => {
    async function fetchHistory() {
      if (!patientId) return;
      setLoadingHistory(true);
      try {
        const headers = getApiHeaders(session);
        const assessments = await obgynService.getEPDSAssessments(patientId, episodeId, headers);
        setHistory(assessments.map((a: EPDSAssessment) => ({
          date: new Date(a.createdAt).toLocaleDateString(),
          score: a.totalScore,
          riskLevel: a.riskLevel,
          provider: a.assessedBy
        })));
      } catch (error) {
        console.error('Error fetching EPDS history:', error);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [patientId, episodeId, session]);

  // Check if all questions are answered
  const isComplete = useMemo(() => {
    return answers.every(a => a !== null);
  }, [answers]);

  // Calculate result
  const result = useMemo((): EPDSResult | null => {
    if (!isComplete) return null;

    const totalScore = answers.reduce((sum: number, a) => sum + (a || 0), 0);
    const selfHarmRisk = (answers[9] || 0) > 0;

    let riskLevel: EPDSResult['riskLevel'];
    let interpretation: string;
    let recommendation: string;

    if (selfHarmRisk) {
      riskLevel = 'critical';
      interpretation = 'Self-harm ideation detected. This requires immediate attention.';
      recommendation = 'URGENT: Conduct immediate safety assessment. Consider psychiatric consultation. Do not leave patient alone.';
    } else if (totalScore >= 13) {
      riskLevel = 'high';
      interpretation = 'Score indicates likely depression. Further assessment needed.';
      recommendation = 'Refer for clinical depression assessment. Consider mental health consultation. Schedule follow-up within 1 week.';
    } else if (totalScore >= 10) {
      riskLevel = 'moderate';
      interpretation = 'Score indicates possible depression. Monitor closely.';
      recommendation = 'Re-screen in 2-4 weeks. Provide support resources. Discuss symptoms with patient.';
    } else {
      riskLevel = 'low';
      interpretation = 'Score within normal range. Continue routine monitoring.';
      recommendation = 'Re-screen at next postpartum visit. Educate about warning signs.';
    }

    return {
      totalScore,
      riskLevel,
      interpretation,
      recommendation,
      selfHarmRisk,
      answers: answers as number[],
      completedAt: new Date().toISOString()
    };
  }, [answers, isComplete]);

  // Handle answer selection
  const handleAnswer = useCallback((questionIndex: number, value: number) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = value;
      return newAnswers;
    });
  }, []);

  // Navigation
  const goToNext = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion(prev => prev + 1);
    } else if (isComplete) {
      setShowResults(true);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Save result
  const handleSave = async () => {
    if (!result) return;
    
    setSaving(true);
    try {
      const headers = getApiHeaders(session);
      
      await obgynService.saveEPDSAssessment(patientId, result, episodeId, headers);
      
      // Update local history
      setHistory(prev => [{
        date: new Date().toLocaleDateString(),
        score: result.totalScore,
        riskLevel: result.riskLevel,
        provider: session?.user?.name || 'Unknown'
      }, ...prev]);
      
      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving EPDS assessment:', error);
    } finally {
      setSaving(false);
    }
  };

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'moderate': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      default: return 'text-green-700 bg-green-100 border-green-300';
    }
  };

  const currentQ = EPDS_QUESTIONS[currentQuestion];
  const progress = ((answers.filter(a => a !== null).length) / 10) * 100;

  // Results View
  if (showResults && result) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6" />
              <div>
                <h2 className="text-lg font-bold">EPDS Assessment Complete</h2>
                <p className="text-xs text-purple-100">Edinburgh Postnatal Depression Scale</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Score Display */}
        <div className="p-6">
          {/* Self-Harm Alert */}
          {result.selfHarmRisk && (
            <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-900 text-lg">⚠️ IMMEDIATE ATTENTION REQUIRED</div>
                <p className="text-red-800 text-sm mt-1">
                  Patient has indicated thoughts of self-harm. Conduct immediate safety assessment.
                </p>
              </div>
            </div>
          )}

          {/* Score Card */}
          <div className="text-center mb-6">
            <div className={`inline-block px-8 py-4 rounded-2xl border-2 ${getRiskColor(result.riskLevel)}`}>
              <div className="text-5xl font-bold">{result.totalScore}</div>
              <div className="text-sm font-semibold uppercase mt-1">{result.riskLevel} Risk</div>
            </div>
            <div className="text-xs text-gray-500 mt-2">Score range: 0-30</div>
          </div>

          {/* Interpretation */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-gray-600" />
                <span className="font-semibold text-gray-800 text-sm">Interpretation</span>
              </div>
              <p className="text-gray-700 text-sm">{result.interpretation}</p>
            </div>

            <div className={`rounded-lg p-4 ${
              result.riskLevel === 'critical' || result.riskLevel === 'high' 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-semibold text-sm">Recommendation</span>
              </div>
              <p className="text-sm">{result.recommendation}</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="text-xs font-semibold text-gray-700 mb-2">Score Breakdown by Question</div>
            <div className="grid grid-cols-10 gap-1">
              {result.answers.map((score, idx) => (
                <div
                  key={idx}
                  className={`text-center p-1.5 rounded text-[10px] font-bold ${
                    idx === 9 && score > 0 
                      ? 'bg-red-200 text-red-800' 
                      : score >= 2 
                        ? 'bg-orange-200 text-orange-800' 
                        : 'bg-gray-200 text-gray-700'
                  }`}
                  title={`Q${idx + 1}: ${EPDS_QUESTIONS[idx].text.substring(0, 30)}...`}
                >
                  Q{idx + 1}<br/>{score}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-500 mt-2">
              Note: Q10 (self-harm thoughts) highlighted in red if any positive response
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Review Answers
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50">
                <Printer className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save to Record'}
              </button>
            </div>
          </div>
        </div>

        {/* Reference Scale */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
          <div className="text-[10px] text-gray-600">
            <span className="font-semibold">Scoring Reference:</span>{' '}
            0-9 = Low risk (unlikely depression) |{' '}
            10-12 = Moderate risk (possible depression) |{' '}
            13+ = High risk (likely depression) |{' '}
            Q10 {'>'} 0 = Critical (immediate evaluation)
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire View
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-bold">EPDS Screening</h2>
              <p className="text-xs text-purple-100">Edinburgh Postnatal Depression Scale</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 flex items-center gap-1"
            >
              <Clock className="h-3 w-3" />
              History
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-purple-100 mb-1">
            <span>Question {currentQuestion + 1} of 10</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-1.5 bg-purple-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-semibold text-gray-700 mb-2">Previous Assessments</div>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              <span className="ml-2 text-xs text-gray-600">Loading history...</span>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-1">
              {history.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200">
                  <span className="text-gray-600">{h.date}</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    h.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                    h.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Score: {h.score}
                  </span>
                  <span className="text-gray-500">{h.provider}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic py-2">No previous assessments found.</div>
          )}
        </div>
      )}

      {/* Question */}
      <div className="p-6">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            In the past 7 days:
          </div>
          <p className="text-lg font-medium text-gray-900">
            {currentQuestion + 1}. {currentQ.text}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = answers[currentQuestion] === option.value;
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion, option.value)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                  }`}>
                    {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm">{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Question 10 Warning */}
        {currentQuestion === 9 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <strong>Important:</strong> Any positive response to this question requires immediate clinical attention and safety assessment.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={goToPrevious}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 text-sm font-medium rounded flex items-center gap-2 ${
            currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {/* Question Indicators */}
        <div className="flex items-center gap-1">
          {EPDS_QUESTIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentQuestion
                  ? 'bg-purple-600 scale-125'
                  : answers[idx] !== null
                    ? 'bg-purple-300'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={answers[currentQuestion] === null}
          className={`px-4 py-2 text-sm font-medium rounded flex items-center gap-2 ${
            answers[currentQuestion] === null
              ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
              : currentQuestion === 9
                ? 'text-white bg-purple-600 hover:bg-purple-700'
                : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {currentQuestion === 9 ? (isComplete ? 'View Results' : 'Complete All Questions') : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Info Footer */}
      <div className="bg-gray-100 px-6 py-2 text-[10px] text-gray-500">
        The EPDS is a validated screening tool for postpartum depression. It is not a diagnostic instrument.
        Clinical judgment should be used in interpreting results.
      </div>
    </div>
  );
}
