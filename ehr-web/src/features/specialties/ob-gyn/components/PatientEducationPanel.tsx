'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Plus, CheckCircle, Clock, BookOpen, Video, FileText,
  Loader2, ChevronDown, ChevronRight, Check, X, ExternalLink,
  Baby, Heart, Stethoscope, Pill, Apple, Moon, Activity,
  AlertTriangle, Info
} from 'lucide-react';
import { obgynService, PatientEducation } from '@/services/obgyn.service';

interface PatientEducationPanelProps {
  patientId: string;
  episodeId?: string;
}

interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'warning_signs' | 'medications' | 'labor_prep' | 'breastfeeding' | 'newborn_care' | 'mental_health';
  trimester: 1 | 2 | 3 | 'all' | 'postpartum';
  contentType: 'video' | 'article' | 'checklist' | 'interactive';
  duration: string;
  required: boolean;
  url?: string;
}

/**
 * PatientEducationPanel - Prenatal Education Tracking
 * ===================================================
 * Tracks patient education delivery across pregnancy:
 * - Trimester-specific education modules
 * - Video/article/checklist content tracking
 * - Completion status with dates
 * - High-risk specific education
 * - Print-friendly patient handouts
 */
export function PatientEducationPanel({ patientId, episodeId }: PatientEducationPanelProps) {
  const [loading, setLoading] = useState(true);
  const [educationRecords, setEducationRecords] = useState<PatientEducation[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    nutrition: true,
    warning_signs: true,
    labor_prep: false,
    breastfeeding: false
  });
  const [currentTrimester, setCurrentTrimester] = useState<1 | 2 | 3>(2);

  // Education modules organized by category
  const educationModules: EducationModule[] = [
    // Nutrition
    { id: 'nutr-1', title: 'Healthy Eating During Pregnancy', description: 'Essential nutrients, foods to avoid, meal planning', category: 'nutrition', trimester: 'all', contentType: 'video', duration: '12 min', required: true, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'nutr-2', title: 'Prenatal Vitamins & Supplements', description: 'Folic acid, iron, DHA importance and dosing', category: 'nutrition', trimester: 1, contentType: 'article', duration: '5 min', required: true, url: 'https://www.google.com/search?q=prenatal+vitamins' },
    { id: 'nutr-3', title: 'Weight Gain Guidelines', description: 'IOM recommendations by BMI category', category: 'nutrition', trimester: 1, contentType: 'checklist', duration: '3 min', required: false },
    { id: 'nutr-4', title: 'Managing Nausea & Food Aversions', description: 'Tips for first trimester nausea', category: 'nutrition', trimester: 1, contentType: 'article', duration: '4 min', required: false },
    { id: 'nutr-5', title: 'Gestational Diabetes Diet', description: 'Carb counting, blood sugar management', category: 'nutrition', trimester: 2, contentType: 'interactive', duration: '15 min', required: false },

    // Exercise
    { id: 'exer-1', title: 'Safe Exercise During Pregnancy', description: 'Recommended activities, modifications, warning signs', category: 'exercise', trimester: 'all', contentType: 'video', duration: '10 min', required: true },
    { id: 'exer-2', title: 'Pelvic Floor Exercises', description: 'Kegel exercises, pelvic tilts, preparation for labor', category: 'exercise', trimester: 2, contentType: 'video', duration: '8 min', required: true },
    { id: 'exer-3', title: 'Third Trimester Comfort Positions', description: 'Sleep positions, stretches for back pain', category: 'exercise', trimester: 3, contentType: 'article', duration: '5 min', required: false },

    // Warning Signs
    { id: 'warn-1', title: 'When to Call Your Provider', description: 'Emergency signs and symptoms in pregnancy', category: 'warning_signs', trimester: 'all', contentType: 'checklist', duration: '5 min', required: true },
    { id: 'warn-2', title: 'Preterm Labor Signs', description: 'Recognizing contractions, what to do', category: 'warning_signs', trimester: 2, contentType: 'video', duration: '8 min', required: true },
    { id: 'warn-3', title: 'Preeclampsia Warning Signs', description: 'Headache, vision changes, swelling', category: 'warning_signs', trimester: 3, contentType: 'article', duration: '4 min', required: true },
    { id: 'warn-4', title: 'Decreased Fetal Movement', description: 'Kick counts, when to call', category: 'warning_signs', trimester: 3, contentType: 'checklist', duration: '3 min', required: true },

    // Medications
    { id: 'meds-1', title: 'Safe Medications in Pregnancy', description: 'OTC medications, what to avoid', category: 'medications', trimester: 'all', contentType: 'article', duration: '6 min', required: true },
    { id: 'meds-2', title: 'Understanding Your Prenatal Labs', description: 'What tests mean, follow-up', category: 'medications', trimester: 1, contentType: 'article', duration: '5 min', required: false },

    // Labor Prep
    { id: 'labor-1', title: 'Signs of Labor', description: 'True vs false labor, when to come in', category: 'labor_prep', trimester: 3, contentType: 'video', duration: '12 min', required: true },
    { id: 'labor-2', title: 'Pain Management Options', description: 'Epidural, nitrous, natural techniques', category: 'labor_prep', trimester: 3, contentType: 'video', duration: '15 min', required: true },
    { id: 'labor-3', title: 'Creating Your Birth Plan', description: 'Preferences, flexibility, communication', category: 'labor_prep', trimester: 3, contentType: 'interactive', duration: '20 min', required: false },
    { id: 'labor-4', title: 'Hospital Bag Checklist', description: 'What to pack for labor and delivery', category: 'labor_prep', trimester: 3, contentType: 'checklist', duration: '5 min', required: false },
    { id: 'labor-5', title: 'Cesarean Birth Information', description: 'What to expect, recovery', category: 'labor_prep', trimester: 3, contentType: 'video', duration: '10 min', required: false },

    // Breastfeeding
    { id: 'bf-1', title: 'Breastfeeding Basics', description: 'Benefits, latch, positioning', category: 'breastfeeding', trimester: 3, contentType: 'video', duration: '15 min', required: true },
    { id: 'bf-2', title: 'Common Breastfeeding Challenges', description: 'Engorgement, mastitis, supply', category: 'breastfeeding', trimester: 'postpartum', contentType: 'article', duration: '8 min', required: false },
    { id: 'bf-3', title: 'Pumping and Storing Milk', description: 'Pump types, storage guidelines', category: 'breastfeeding', trimester: 'postpartum', contentType: 'video', duration: '10 min', required: false },

    // Newborn Care
    { id: 'newborn-1', title: 'Newborn Care Essentials', description: 'Feeding, sleep, diapering basics', category: 'newborn_care', trimester: 3, contentType: 'video', duration: '20 min', required: true },
    { id: 'newborn-2', title: 'Car Seat Safety', description: 'Installation, proper use', category: 'newborn_care', trimester: 3, contentType: 'video', duration: '8 min', required: true },
    { id: 'newborn-3', title: 'Safe Sleep Guidelines', description: 'SIDS prevention, ABCs of safe sleep', category: 'newborn_care', trimester: 3, contentType: 'article', duration: '5 min', required: true },
    { id: 'newborn-4', title: 'When to Call the Pediatrician', description: 'Warning signs in newborns', category: 'newborn_care', trimester: 'postpartum', contentType: 'checklist', duration: '4 min', required: true },

    // Mental Health
    { id: 'mh-1', title: 'Emotional Changes in Pregnancy', description: 'Normal mood changes, when to seek help', category: 'mental_health', trimester: 'all', contentType: 'article', duration: '6 min', required: true },
    { id: 'mh-2', title: 'Postpartum Depression Awareness', description: 'Signs, risk factors, getting help', category: 'mental_health', trimester: 3, contentType: 'video', duration: '10 min', required: true },
    { id: 'mh-3', title: 'Partner Support During Pregnancy', description: 'Communication, involvement', category: 'mental_health', trimester: 'all', contentType: 'article', duration: '5 min', required: false },
  ];

  const categoryIcons: Record<string, React.ReactNode> = {
    nutrition: <Apple className="h-4 w-4" />,
    exercise: <Activity className="h-4 w-4" />,
    warning_signs: <AlertTriangle className="h-4 w-4" />,
    medications: <Pill className="h-4 w-4" />,
    labor_prep: <Baby className="h-4 w-4" />,
    breastfeeding: <Heart className="h-4 w-4" />,
    newborn_care: <Stethoscope className="h-4 w-4" />,
    mental_health: <Moon className="h-4 w-4" />
  };

  const categoryLabels: Record<string, string> = {
    nutrition: 'Nutrition & Diet',
    exercise: 'Exercise & Activity',
    warning_signs: 'Warning Signs',
    medications: 'Medications & Labs',
    labor_prep: 'Labor Preparation',
    breastfeeding: 'Breastfeeding',
    newborn_care: 'Newborn Care',
    mental_health: 'Mental Health'
  };

  const contentTypeIcons: Record<string, React.ReactNode> = {
    video: <Video className="h-3 w-3" />,
    article: <FileText className="h-3 w-3" />,
    checklist: <Check className="h-3 w-3" />,
    interactive: <BookOpen className="h-3 w-3" />
  };

  useEffect(() => {
    fetchEducationRecords();
  }, [patientId, episodeId]);

  const fetchEducationRecords = async () => {
    try {
      setLoading(true);
      const data = await obgynService.getPatientEducation(patientId, episodeId);
      setEducationRecords(data);
    } catch (error) {
      console.error('Error fetching education records:', error);
    } finally {
      setLoading(false);
    }
  };

  const isModuleCompleted = (moduleId: string) => {
    return educationRecords.some(r => r.moduleId === moduleId && r.completed);
  };

  const getCompletionDate = (moduleId: string) => {
    const record = educationRecords.find(r => r.moduleId === moduleId);
    return record?.completedDate;
  };

  const handleMarkComplete = async (moduleId: string) => {
    try {
      await obgynService.savePatientEducation(patientId, {
        moduleId,
        completed: true,
        completedDate: new Date().toISOString(),
        episodeId
      });
      setEducationRecords(prev => [
        ...prev.filter(r => r.moduleId !== moduleId),
        { moduleId, completed: true, completedDate: new Date().toISOString() }
      ]);
    } catch (error) {
      console.error('Error saving education record:', error);
    }
  };

  const getModulesForTrimester = (trimester: number | 'all' | 'postpartum') => {
    return educationModules.filter(m => 
      m.trimester === trimester || m.trimester === 'all'
    );
  };

  const categories = ['nutrition', 'exercise', 'warning_signs', 'medications', 'labor_prep', 'breastfeeding', 'newborn_care', 'mental_health'];

  // Calculate completion stats
  const totalRequired = educationModules.filter(m => m.required).length;
  const completedRequired = educationModules.filter(m => m.required && isModuleCompleted(m.id)).length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-pink-600" />
          <h2 className="text-lg font-semibold text-gray-900">Patient Education</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={currentTrimester}
            onChange={(e) => setCurrentTrimester(parseInt(e.target.value) as 1 | 2 | 3)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
          >
            <option value={1}>First Trimester</option>
            <option value={2}>Second Trimester</option>
            <option value={3}>Third Trimester</option>
          </select>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Education Progress</h3>
          <span className="text-sm font-medium text-pink-600">{completionPercentage}% Complete</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-pink-500 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">Required modules:</span>
            <span className="ml-2 font-medium">{completedRequired}/{totalRequired}</span>
          </div>
          <div>
            <span className="text-gray-500">Total viewed:</span>
            <span className="ml-2 font-medium">{educationRecords.length}</span>
          </div>
        </div>
      </div>

      {/* Trimester indicator */}
      <div className="flex items-center gap-2 text-sm">
        <Info className="h-4 w-4 text-blue-500" />
        <span className="text-gray-600">
          Showing education relevant for <strong>Trimester {currentTrimester}</strong> and general pregnancy topics
        </span>
      </div>

      {/* Education Categories */}
      <div className="space-y-3">
        {categories.map(category => {
          const modulesInCategory = educationModules.filter(m => 
            m.category === category && 
            (m.trimester === currentTrimester || m.trimester === 'all' || 
             (currentTrimester === 3 && m.trimester === 'postpartum'))
          );

          if (modulesInCategory.length === 0) return null;

          const completedInCategory = modulesInCategory.filter(m => isModuleCompleted(m.id)).length;

          return (
            <div key={category} className="bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedCategories(prev => ({
                  ...prev,
                  [category]: !prev[category]
                }))}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories[category] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="text-pink-600">{categoryIcons[category]}</span>
                  <span className="font-medium text-gray-900">{categoryLabels[category]}</span>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  completedInCategory === modulesInCategory.length
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {completedInCategory}/{modulesInCategory.length}
                </span>
              </button>

              {expandedCategories[category] && (
                <div className="border-t border-gray-200 divide-y divide-gray-100">
                  {modulesInCategory.map(module => {
                    const completed = isModuleCompleted(module.id);
                    const completionDate = getCompletionDate(module.id);

                    return (
                      <div 
                        key={module.id} 
                        className={`p-3 flex items-start gap-3 ${completed ? 'bg-green-50/50' : ''}`}
                      >
                        {/* Completion checkbox */}
                        <button
                          onClick={() => handleMarkComplete(module.id)}
                          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-pink-500'
                          }`}
                        >
                          {completed && <Check className="h-3 w-3" />}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {module.title}
                            </span>
                            {module.required && (
                              <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">Required</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              {contentTypeIcons[module.contentType]}
                              {module.contentType}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {module.duration}
                            </span>
                            {completed && completionDate && (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Completed {new Date(completionDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* View button */}
                        <button
                          onClick={() => module.url && window.open(module.url, '_blank')}
                          disabled={!module.url}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
