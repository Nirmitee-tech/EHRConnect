/**
 * BirthPlanPanel - Delivery Planning & Preferences
 * 
 * Comprehensive birth plan documentation including:
 * - Labor preferences (environment, pain management, support)
 * - Delivery preferences (positions, interventions)
 * - Newborn care preferences
 * - Emergency scenarios (C-section, NICU)
 * - Support team and communication
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  FileText,
  Save,
  Printer,
  CheckCircle2,
  Heart,
  Baby,
  Stethoscope,
  Users,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { obgynService } from '@/services/obgyn.service';

interface BirthPlanPanelProps {
  patientId: string;
  episodeId?: string;
  edd?: string;
  isHighRisk?: boolean;
  onUpdate?: () => void;
}

interface BirthPlan {
  id: string;
  status: 'draft' | 'reviewed' | 'finalized';
  lastUpdated: string;
  reviewedBy?: string;
  reviewedDate?: string;
  
  // Labor Preferences
  laborEnvironment: {
    lighting: string;
    music: boolean;
    aromatherapy: boolean;
    mobilityPreference: string;
    laboringPositions: string[];
    hydrotherapy: boolean;
    birthdayBall: boolean;
    otherRequests?: string;
  };
  
  painManagement: {
    preferNatural: boolean;
    openToEpidural: boolean;
    epiduralTiming?: string;
    nitrous: boolean;
    ivNarcotics: boolean;
    tens: boolean;
    otherMethods: string[];
  };
  
  // Delivery Preferences
  deliveryPreferences: {
    preferredPositions: string[];
    mirrorToWatch: boolean;
    touchCrowning: boolean;
    perinealSupport: boolean;
    episiotomy: 'avoid' | 'only_if_necessary' | 'provider_discretion';
    cordClamping: 'immediate' | 'delayed' | 'cord_blood_banking';
    cordCutBy?: string;
    placentaDelivery: 'natural' | 'active_management';
    skinToSkin: 'immediate' | 'after_assessment' | 'partner_first';
  };
  
  // Support Team
  supportTeam: {
    primarySupport: string;
    additionalSupport: string[];
    doula: boolean;
    doulaName?: string;
    photographyAllowed: boolean;
    videoAllowed: boolean;
    limitVisitors: boolean;
  };
  
  // Newborn Care
  newbornCare: {
    breastfeeding: boolean;
    formulaIfNeeded: boolean;
    roominIn: boolean;
    pacifier: boolean;
    circumcision?: boolean;
    vitaminK: 'injection' | 'oral' | 'decline';
    eyeOintment: boolean;
    hepatitisB: boolean;
    bathing: 'delay' | 'immediate' | 'parents_do_it';
  };
  
  // C-Section Preferences (if needed)
  cesareanPreferences: {
    partnerPresent: boolean;
    clearDrape: boolean;
    musicDuringProcedure: boolean;
    immediateSkintToSkin: boolean;
    delayedCordClamping: boolean;
    narrateDelivery: boolean;
  };
  
  // Emergency Scenarios
  emergencyPreferences: {
    nicuSeparation: 'partner_stays' | 'partner_goes_with_baby' | 'flexible';
    bloodTransfusion: boolean;
    emergencyCSection: 'understand_necessary' | 'want_full_explanation';
    resuscitation: 'full_measures' | 'limited' | 'discuss_with_provider';
  };
  
  // Special Requests
  specialRequests?: string;
  
  // Cultural/Religious
  culturalConsiderations?: string;
}

const LABORING_POSITIONS = [
  'Walking',
  'Standing',
  'Hands and knees',
  'Side lying',
  'Squatting',
  'Birthing ball',
  'Rocking chair',
  'Shower/tub',
];

const DELIVERY_POSITIONS = [
  'Semi-reclined',
  'Side lying',
  'Squatting',
  'Hands and knees',
  'Birthing stool',
  'Provider discretion',
];

const PAIN_METHODS = [
  'Breathing techniques',
  'Massage',
  'Counter-pressure',
  'Hypnobirthing',
  'Acupressure',
  'Cold/hot packs',
];

export function BirthPlanPanel({
  patientId,
  episodeId,
  edd,
  isHighRisk,
  onUpdate,
}: BirthPlanPanelProps) {
  const [birthPlan, setBirthPlan] = useState<BirthPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('labor');

  useEffect(() => {
    loadBirthPlan();
  }, [patientId, episodeId]);

  const loadBirthPlan = async () => {
    setIsLoading(true);
    try {
      const data = await obgynService.getBirthPlan(patientId, episodeId);
      if (data) {
        setBirthPlan(data);
      } else {
        // Initialize default birth plan
        initializeDefaultPlan();
      }
    } catch (error) {
      console.error('Failed to load birth plan:', error);
      initializeDefaultPlan();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultPlan = () => {
    const defaultPlan: BirthPlan = {
      id: `bp-${Date.now()}`,
      status: 'draft',
      lastUpdated: new Date().toISOString(),
      laborEnvironment: {
        lighting: 'dim',
        music: true,
        aromatherapy: false,
        mobilityPreference: 'freedom_to_move',
        laboringPositions: ['Walking', 'Birthing ball'],
        hydrotherapy: true,
        birthdayBall: true,
      },
      painManagement: {
        preferNatural: true,
        openToEpidural: true,
        epiduralTiming: 'when_needed',
        nitrous: true,
        ivNarcotics: false,
        tens: false,
        otherMethods: ['Breathing techniques', 'Massage'],
      },
      deliveryPreferences: {
        preferredPositions: ['Semi-reclined'],
        mirrorToWatch: false,
        touchCrowning: false,
        perinealSupport: true,
        episiotomy: 'only_if_necessary',
        cordClamping: 'delayed',
        placentaDelivery: 'active_management',
        skinToSkin: 'immediate',
      },
      supportTeam: {
        primarySupport: '',
        additionalSupport: [],
        doula: false,
        photographyAllowed: true,
        videoAllowed: false,
        limitVisitors: true,
      },
      newbornCare: {
        breastfeeding: true,
        formulaIfNeeded: true,
        roominIn: true,
        pacifier: false,
        vitaminK: 'injection',
        eyeOintment: true,
        hepatitisB: true,
        bathing: 'delay',
      },
      cesareanPreferences: {
        partnerPresent: true,
        clearDrape: true,
        musicDuringProcedure: true,
        immediateSkintToSkin: true,
        delayedCordClamping: true,
        narrateDelivery: true,
      },
      emergencyPreferences: {
        nicuSeparation: 'flexible',
        bloodTransfusion: true,
        emergencyCSection: 'understand_necessary',
        resuscitation: 'full_measures',
      },
    };
    setBirthPlan(defaultPlan);
  };

  const saveBirthPlan = async () => {
    if (!birthPlan) return;
    
    setIsSaving(true);
    try {
      await obgynService.saveBirthPlan(patientId, {
        episodeId,
        ...birthPlan,
        lastUpdated: new Date().toISOString(),
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save birth plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePlan = <K extends keyof BirthPlan>(
    section: K,
    updates: Partial<BirthPlan[K]>
  ) => {
    if (!birthPlan) return;
    setBirthPlan({
      ...birthPlan,
      [section]: typeof birthPlan[section] === 'object' 
        ? { ...birthPlan[section] as object, ...updates }
        : updates,
    });
  };

  const toggleArrayItem = <K extends keyof BirthPlan>(
    section: K,
    field: string,
    item: string
  ) => {
    if (!birthPlan) return;
    const sectionData = birthPlan[section] as Record<string, unknown>;
    const currentArray = (sectionData[field] as string[]) || [];
    
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    updatePlan(section, { [field]: newArray } as unknown as Partial<BirthPlan[K]>);
  };

  const getStatusBadge = () => {
    if (!birthPlan) return null;
    
    switch (birthPlan.status) {
      case 'finalized':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Finalized</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800"><Stethoscope className="h-3 w-3 mr-1" />Reviewed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
        </CardContent>
      </Card>
    );
  }

  if (!birthPlan) return null;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-pink-500" />
              Birth Plan
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                size="sm" 
                onClick={saveBirthPlan}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isHighRisk && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                High-risk pregnancy: Some preferences may need modification based on clinical situation
              </span>
            </div>
          )}
          
          {edd && (
            <div className="text-sm text-muted-foreground">
              Estimated Due Date: {new Date(edd).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Birth Plan Tabs */}
      <Card>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="labor">Labor</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="baby">Baby Care</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
            </TabsList>

            {/* Labor Tab */}
            <TabsContent value="labor" className="space-y-6">
              {/* Environment */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  Labor Environment
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lighting Preference</Label>
                    <Select
                      value={birthPlan.laborEnvironment.lighting}
                      onValueChange={(value) => updatePlan('laborEnvironment', { lighting: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dim">Dim lighting</SelectItem>
                        <SelectItem value="natural">Natural light</SelectItem>
                        <SelectItem value="bright">Bright</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Mobility</Label>
                    <Select
                      value={birthPlan.laborEnvironment.mobilityPreference}
                      onValueChange={(value) => updatePlan('laborEnvironment', { mobilityPreference: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freedom_to_move">Freedom to move</SelectItem>
                        <SelectItem value="limited_monitoring">Limited for monitoring</SelectItem>
                        <SelectItem value="bed_rest">Prefer bed rest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.laborEnvironment.music}
                      onCheckedChange={(checked) => updatePlan('laborEnvironment', { music: checked })}
                    />
                    <Label>Music</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.laborEnvironment.aromatherapy}
                      onCheckedChange={(checked) => updatePlan('laborEnvironment', { aromatherapy: checked })}
                    />
                    <Label>Aromatherapy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.laborEnvironment.hydrotherapy}
                      onCheckedChange={(checked) => updatePlan('laborEnvironment', { hydrotherapy: checked })}
                    />
                    <Label>Tub/Shower</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.laborEnvironment.birthdayBall}
                      onCheckedChange={(checked) => updatePlan('laborEnvironment', { birthdayBall: checked })}
                    />
                    <Label>Birth Ball</Label>
                  </div>
                </div>

                <div>
                  <Label>Laboring Positions</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {LABORING_POSITIONS.map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          checked={birthPlan.laborEnvironment.laboringPositions.includes(position)}
                          onCheckedChange={() => toggleArrayItem('laborEnvironment', 'laboringPositions', position)}
                        />
                        <label className="text-sm">{position}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pain Management */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-pink-500" />
                  Pain Management
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.painManagement.preferNatural}
                      onCheckedChange={(checked) => updatePlan('painManagement', { preferNatural: checked })}
                    />
                    <Label>Prefer natural/unmedicated</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.painManagement.openToEpidural}
                      onCheckedChange={(checked) => updatePlan('painManagement', { openToEpidural: checked })}
                    />
                    <Label>Open to epidural</Label>
                  </div>
                </div>

                {birthPlan.painManagement.openToEpidural && (
                  <div>
                    <Label>Epidural Timing</Label>
                    <Select
                      value={birthPlan.painManagement.epiduralTiming}
                      onValueChange={(value) => updatePlan('painManagement', { epiduralTiming: value })}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="when_needed">When I feel I need it</SelectItem>
                        <SelectItem value="active_labor">During active labor</SelectItem>
                        <SelectItem value="last_resort">Only as last resort</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.painManagement.nitrous}
                      onCheckedChange={(checked) => updatePlan('painManagement', { nitrous: checked })}
                    />
                    <Label>Nitrous oxide</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.painManagement.ivNarcotics}
                      onCheckedChange={(checked) => updatePlan('painManagement', { ivNarcotics: checked })}
                    />
                    <Label>IV pain meds</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.painManagement.tens}
                      onCheckedChange={(checked) => updatePlan('painManagement', { tens: checked })}
                    />
                    <Label>TENS unit</Label>
                  </div>
                </div>

                <div>
                  <Label>Non-medical Pain Methods</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {PAIN_METHODS.map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          checked={birthPlan.painManagement.otherMethods.includes(method)}
                          onCheckedChange={() => toggleArrayItem('painManagement', 'otherMethods', method)}
                        />
                        <label className="text-sm">{method}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Delivery Preferences</h3>

                <div>
                  <Label>Preferred Delivery Positions</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {DELIVERY_POSITIONS.map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          checked={birthPlan.deliveryPreferences.preferredPositions.includes(position)}
                          onCheckedChange={() => toggleArrayItem('deliveryPreferences', 'preferredPositions', position)}
                        />
                        <label className="text-sm">{position}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.deliveryPreferences.mirrorToWatch}
                      onCheckedChange={(checked) => updatePlan('deliveryPreferences', { mirrorToWatch: checked })}
                    />
                    <Label>Use mirror to watch</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.deliveryPreferences.touchCrowning}
                      onCheckedChange={(checked) => updatePlan('deliveryPreferences', { touchCrowning: checked })}
                    />
                    <Label>Touch baby crowning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.deliveryPreferences.perinealSupport}
                      onCheckedChange={(checked) => updatePlan('deliveryPreferences', { perinealSupport: checked })}
                    />
                    <Label>Perineal support</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Episiotomy Preference</Label>
                    <Select
                      value={birthPlan.deliveryPreferences.episiotomy}
                      onValueChange={(value) => updatePlan('deliveryPreferences', { 
                        episiotomy: value as BirthPlan['deliveryPreferences']['episiotomy']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avoid">Avoid if possible</SelectItem>
                        <SelectItem value="only_if_necessary">Only if necessary</SelectItem>
                        <SelectItem value="provider_discretion">Provider discretion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cord Clamping</Label>
                    <Select
                      value={birthPlan.deliveryPreferences.cordClamping}
                      onValueChange={(value) => updatePlan('deliveryPreferences', { 
                        cordClamping: value as BirthPlan['deliveryPreferences']['cordClamping']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="delayed">Delayed (1-3 min)</SelectItem>
                        <SelectItem value="cord_blood_banking">Cord blood banking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cord Cut By</Label>
                    <Input
                      placeholder="e.g., Partner, Self, Provider"
                      value={birthPlan.deliveryPreferences.cordCutBy || ''}
                      onChange={(e) => updatePlan('deliveryPreferences', { cordCutBy: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Skin-to-Skin Contact</Label>
                    <Select
                      value={birthPlan.deliveryPreferences.skinToSkin}
                      onValueChange={(value) => updatePlan('deliveryPreferences', { 
                        skinToSkin: value as BirthPlan['deliveryPreferences']['skinToSkin']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="after_assessment">After brief assessment</SelectItem>
                        <SelectItem value="partner_first">Partner first if I cannot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* C-Section Preferences */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">If Cesarean Section Needed</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.cesareanPreferences.partnerPresent}
                      onCheckedChange={(checked) => updatePlan('cesareanPreferences', { partnerPresent: checked })}
                    />
                    <Label>Partner present</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.cesareanPreferences.clearDrape}
                      onCheckedChange={(checked) => updatePlan('cesareanPreferences', { clearDrape: checked })}
                    />
                    <Label>Clear drape to watch</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.cesareanPreferences.musicDuringProcedure}
                      onCheckedChange={(checked) => updatePlan('cesareanPreferences', { musicDuringProcedure: checked })}
                    />
                    <Label>Music during procedure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.cesareanPreferences.immediateSkintToSkin}
                      onCheckedChange={(checked) => updatePlan('cesareanPreferences', { immediateSkintToSkin: checked })}
                    />
                    <Label>Immediate skin-to-skin in OR</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.cesareanPreferences.narrateDelivery}
                      onCheckedChange={(checked) => updatePlan('cesareanPreferences', { narrateDelivery: checked })}
                    />
                    <Label>Narrate delivery moment</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Baby Care Tab */}
            <TabsContent value="baby" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Baby className="h-4 w-4 text-pink-500" />
                  Newborn Care Preferences
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.newbornCare.breastfeeding}
                      onCheckedChange={(checked) => updatePlan('newbornCare', { breastfeeding: checked })}
                    />
                    <Label>Plan to breastfeed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.newbornCare.formulaIfNeeded}
                      onCheckedChange={(checked) => updatePlan('newbornCare', { formulaIfNeeded: checked })}
                    />
                    <Label>Formula if needed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.newbornCare.roominIn}
                      onCheckedChange={(checked) => updatePlan('newbornCare', { roominIn: checked })}
                    />
                    <Label>Room-in with baby</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.newbornCare.pacifier}
                      onCheckedChange={(checked) => updatePlan('newbornCare', { pacifier: checked })}
                    />
                    <Label>Pacifier OK</Label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Vitamin K</Label>
                    <Select
                      value={birthPlan.newbornCare.vitaminK}
                      onValueChange={(value) => updatePlan('newbornCare', { 
                        vitaminK: value as BirthPlan['newbornCare']['vitaminK']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="injection">Injection (recommended)</SelectItem>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="decline">Decline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>First Bath</Label>
                    <Select
                      value={birthPlan.newbornCare.bathing}
                      onValueChange={(value) => updatePlan('newbornCare', { 
                        bathing: value as BirthPlan['newbornCare']['bathing']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delay">Delay 24+ hours</SelectItem>
                        <SelectItem value="immediate">Within hours</SelectItem>
                        <SelectItem value="parents_do_it">Parents do it</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.newbornCare.eyeOintment}
                      onCheckedChange={(checked) => updatePlan('newbornCare', { eyeOintment: checked })}
                    />
                    <Label>Eye prophylaxis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.newbornCare.hepatitisB}
                      onCheckedChange={(checked) => updatePlan('newbornCare', { hepatitisB: checked })}
                    />
                    <Label>Hepatitis B vaccine</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-pink-500" />
                  Support Team
                </h3>

                <div>
                  <Label>Primary Support Person</Label>
                  <Input
                    placeholder="Name and relationship"
                    value={birthPlan.supportTeam.primarySupport}
                    onChange={(e) => updatePlan('supportTeam', { primarySupport: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={birthPlan.supportTeam.doula}
                    onCheckedChange={(checked) => updatePlan('supportTeam', { doula: checked })}
                  />
                  <Label>Using a doula</Label>
                </div>

                {birthPlan.supportTeam.doula && (
                  <div>
                    <Label>Doula Name</Label>
                    <Input
                      placeholder="Doula name and contact"
                      value={birthPlan.supportTeam.doulaName || ''}
                      onChange={(e) => updatePlan('supportTeam', { doulaName: e.target.value })}
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.supportTeam.photographyAllowed}
                      onCheckedChange={(checked) => updatePlan('supportTeam', { photographyAllowed: checked })}
                    />
                    <Label>Photography OK</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.supportTeam.videoAllowed}
                      onCheckedChange={(checked) => updatePlan('supportTeam', { videoAllowed: checked })}
                    />
                    <Label>Video OK</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={birthPlan.supportTeam.limitVisitors}
                      onCheckedChange={(checked) => updatePlan('supportTeam', { limitVisitors: checked })}
                    />
                    <Label>Limit visitors</Label>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Special Requests</h3>
                <Textarea
                  placeholder="Any cultural, religious, or personal considerations..."
                  value={birthPlan.culturalConsiderations || ''}
                  onChange={(e) => setBirthPlan({ ...birthPlan, culturalConsiderations: e.target.value })}
                  rows={3}
                />
                <Textarea
                  placeholder="Other special requests..."
                  value={birthPlan.specialRequests || ''}
                  onChange={(e) => setBirthPlan({ ...birthPlan, specialRequests: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Emergency Tab */}
            <TabsContent value="emergency" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-pink-500" />
                  Emergency Scenarios
                </h3>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                  These preferences help your care team understand your wishes in emergency situations.
                  Clinical judgment will always prioritize safety.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>If Baby Needs NICU</Label>
                    <Select
                      value={birthPlan.emergencyPreferences.nicuSeparation}
                      onValueChange={(value) => updatePlan('emergencyPreferences', { 
                        nicuSeparation: value as BirthPlan['emergencyPreferences']['nicuSeparation']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partner_stays">Partner stays with me</SelectItem>
                        <SelectItem value="partner_goes_with_baby">Partner goes with baby</SelectItem>
                        <SelectItem value="flexible">Flexible based on situation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Emergency C-Section</Label>
                    <Select
                      value={birthPlan.emergencyPreferences.emergencyCSection}
                      onValueChange={(value) => updatePlan('emergencyPreferences', { 
                        emergencyCSection: value as BirthPlan['emergencyPreferences']['emergencyCSection']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="understand_necessary">I understand may be necessary</SelectItem>
                        <SelectItem value="want_full_explanation">Want full explanation first if time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={birthPlan.emergencyPreferences.bloodTransfusion}
                    onCheckedChange={(checked) => updatePlan('emergencyPreferences', { bloodTransfusion: checked })}
                  />
                  <Label>Accept blood transfusion if needed</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
