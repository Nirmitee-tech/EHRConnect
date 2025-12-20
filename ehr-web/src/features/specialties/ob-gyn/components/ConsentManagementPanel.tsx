/**
 * ConsentManagementPanel - OB/GYN Consent Tracking
 * 
 * Clinical micro-features:
 * - Track all pregnancy-related consents
 * - Genetic testing consent documentation
 * - Procedure consent tracking
 * - VBAC/TOLAC consent forms
 * - Blood transfusion consents
 * - Cesarean consent tracking
 * - Sterilization consent (Medicaid 30-day rule)
 * - Patient education documentation
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Save,
  Download,
  Printer,
  FileCheck,
  FilePlus,
  ClipboardCheck,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays } from 'date-fns';

interface ConsentManagementPanelProps {
  patientId: string;
  episodeId?: string;
  gestationalAge?: string;
  edd?: string;
  hasPriorCesarean?: boolean;
  onUpdate?: () => void;
}

interface ConsentRecord {
  id: string;
  consentType: string;
  category: 'genetic' | 'procedure' | 'delivery' | 'education' | 'research' | 'other';
  status: 'pending' | 'signed' | 'declined' | 'expired' | 'revoked';
  
  // Dates
  dateDiscussed?: string;
  dateSigned?: string;
  dateExpires?: string;
  
  // Details
  discussedBy?: string;
  witnessedBy?: string;
  patientSignature?: boolean;
  guardianSignature?: boolean;
  guardianName?: string;
  guardianRelationship?: string;
  
  // Education
  risksBenefitsDiscussed: boolean;
  alternativesDiscussed: boolean;
  questionsAnswered: boolean;
  
  // Additional
  languageUsed?: string;
  interpreterUsed?: boolean;
  interpreterName?: string;
  notes?: string;
  documentUrl?: string;
}

// Consent types specific to OB/GYN
const CONSENT_TYPES = [
  // Genetic Testing
  { type: 'NIPT Consent', category: 'genetic', description: 'Non-invasive prenatal testing for chromosomal abnormalities' },
  { type: 'Carrier Screening', category: 'genetic', description: 'Carrier screening for genetic conditions' },
  { type: 'CVS Consent', category: 'genetic', description: 'Chorionic villus sampling procedure consent' },
  { type: 'Amniocentesis Consent', category: 'genetic', description: 'Amniocentesis procedure consent' },
  { type: 'Genetic Counseling', category: 'genetic', description: 'Documentation of genetic counseling session' },
  
  // Procedures
  { type: 'Cerclage Consent', category: 'procedure', description: 'Cervical cerclage procedure consent' },
  { type: 'External Cephalic Version', category: 'procedure', description: 'ECV attempt for breech presentation' },
  { type: 'D&C/D&E Consent', category: 'procedure', description: 'Uterine evacuation procedure consent' },
  { type: 'Fetal Reduction', category: 'procedure', description: 'Multifetal pregnancy reduction consent' },
  { type: 'Intrauterine Transfusion', category: 'procedure', description: 'Fetal blood transfusion consent' },
  
  // Delivery Related
  { type: 'VBAC/TOLAC Consent', category: 'delivery', description: 'Trial of labor after cesarean consent', requiresPriorCesarean: true },
  { type: 'Elective Cesarean Consent', category: 'delivery', description: 'Planned cesarean section consent' },
  { type: 'Emergency Cesarean Consent', category: 'delivery', description: 'Emergency cesarean section consent' },
  { type: 'Blood Transfusion Consent', category: 'delivery', description: 'Consent for blood/blood products administration' },
  { type: 'Epidural/Anesthesia Consent', category: 'delivery', description: 'Regional anesthesia consent' },
  { type: 'Sterilization (Tubal Ligation)', category: 'delivery', description: 'Postpartum sterilization consent - 30 day Medicaid rule applies', hasMedicaidRule: true },
  { type: 'Vacuum/Forceps Consent', category: 'delivery', description: 'Operative vaginal delivery consent' },
  
  // Education
  { type: 'Prenatal Education', category: 'education', description: 'General prenatal education documentation' },
  { type: 'Circumcision Education', category: 'education', description: 'Newborn circumcision education provided' },
  { type: 'Breastfeeding Education', category: 'education', description: 'Breastfeeding education and counseling' },
  { type: 'EPDS Consent', category: 'education', description: 'Consent for depression screening' },
  
  // Research
  { type: 'Research Study Enrollment', category: 'research', description: 'Clinical trial/research study consent' },
  { type: 'Biobanking Consent', category: 'research', description: 'Specimen storage for research' },
];

export function ConsentManagementPanel({
  patientId,
  episodeId,
  gestationalAge,
  edd,
  hasPriorCesarean,
  onUpdate,
}: ConsentManagementPanelProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedConsentType, setSelectedConsentType] = useState<string>('');
  
  const [newConsent, setNewConsent] = useState<Partial<ConsentRecord>>({
    status: 'pending',
    risksBenefitsDiscussed: false,
    alternativesDiscussed: false,
    questionsAnswered: false,
    patientSignature: false,
    interpreterUsed: false,
    languageUsed: 'English',
  });

  // Load consents
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setConsents([
        {
          id: '1',
          consentType: 'NIPT Consent',
          category: 'genetic',
          status: 'signed',
          dateDiscussed: '2025-01-10',
          dateSigned: '2025-01-10',
          discussedBy: 'Dr. Smith',
          witnessedBy: 'Nurse Johnson',
          patientSignature: true,
          risksBenefitsDiscussed: true,
          alternativesDiscussed: true,
          questionsAnswered: true,
          languageUsed: 'English',
          interpreterUsed: false,
          notes: 'Patient counseled on NIPT screening options. Chose expanded panel.',
        },
        {
          id: '2',
          consentType: 'Carrier Screening',
          category: 'genetic',
          status: 'signed',
          dateDiscussed: '2025-01-10',
          dateSigned: '2025-01-10',
          discussedBy: 'Dr. Smith',
          patientSignature: true,
          risksBenefitsDiscussed: true,
          alternativesDiscussed: true,
          questionsAnswered: true,
          languageUsed: 'English',
          interpreterUsed: false,
        },
        {
          id: '3',
          consentType: 'Blood Transfusion Consent',
          category: 'delivery',
          status: 'signed',
          dateDiscussed: '2025-03-01',
          dateSigned: '2025-03-01',
          discussedBy: 'Dr. Johnson',
          patientSignature: true,
          risksBenefitsDiscussed: true,
          alternativesDiscussed: true,
          questionsAnswered: true,
          languageUsed: 'English',
          notes: 'Standing consent for delivery - will accept transfusion if medically necessary',
        },
        {
          id: '4',
          consentType: 'Epidural/Anesthesia Consent',
          category: 'delivery',
          status: 'pending',
          dateDiscussed: '2025-03-15',
          discussedBy: 'Anesthesiology',
          risksBenefitsDiscussed: true,
          alternativesDiscussed: true,
          questionsAnswered: true,
          patientSignature: false,
          notes: 'Discussed during anesthesia consult. Patient planning epidural. Will sign on admission.',
        },
        {
          id: '5',
          consentType: 'Sterilization (Tubal Ligation)',
          category: 'delivery',
          status: 'signed',
          dateDiscussed: '2025-02-01',
          dateSigned: '2025-02-01',
          dateExpires: '2025-08-15', // EDD - must be signed 30 days before
          discussedBy: 'Dr. Smith',
          witnessedBy: 'Nurse Williams',
          patientSignature: true,
          risksBenefitsDiscussed: true,
          alternativesDiscussed: true,
          questionsAnswered: true,
          languageUsed: 'English',
          notes: 'Patient is G4P3. Counseled extensively. 30-day Medicaid rule satisfied.',
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, [patientId, episodeId]);

  // Check sterilization consent timing
  const sterilizationAlert = useMemo(() => {
    const sterilConsent = consents.find(c => 
      c.consentType.includes('Sterilization') && c.status === 'signed'
    );
    
    if (!sterilConsent?.dateSigned || !edd) return null;
    
    const signDate = new Date(sterilConsent.dateSigned);
    const eddDate = new Date(edd);
    const daysBefore = differenceInDays(eddDate, signDate);
    
    if (daysBefore < 30) {
      return {
        type: 'warning',
        message: `Sterilization consent signed only ${daysBefore} days before EDD. Medicaid requires 30 days minimum.`,
      };
    }
    return null;
  }, [consents, edd]);

  // Get consent type details
  const getConsentTypeDetails = (type: string) => {
    return CONSENT_TYPES.find(ct => ct.type === type);
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const typeDetails = getConsentTypeDetails(selectedConsentType);
      
      const consent: ConsentRecord = {
        id: Date.now().toString(),
        consentType: selectedConsentType,
        category: typeDetails?.category || 'other',
        status: newConsent.patientSignature ? 'signed' : 'pending',
        dateDiscussed: newConsent.dateDiscussed || format(new Date(), 'yyyy-MM-dd'),
        dateSigned: newConsent.patientSignature ? (newConsent.dateSigned || format(new Date(), 'yyyy-MM-dd')) : undefined,
        dateExpires: newConsent.dateExpires,
        discussedBy: newConsent.discussedBy,
        witnessedBy: newConsent.witnessedBy,
        patientSignature: newConsent.patientSignature || false,
        guardianSignature: newConsent.guardianSignature,
        guardianName: newConsent.guardianName,
        guardianRelationship: newConsent.guardianRelationship,
        risksBenefitsDiscussed: newConsent.risksBenefitsDiscussed || false,
        alternativesDiscussed: newConsent.alternativesDiscussed || false,
        questionsAnswered: newConsent.questionsAnswered || false,
        languageUsed: newConsent.languageUsed,
        interpreterUsed: newConsent.interpreterUsed,
        interpreterName: newConsent.interpreterName,
        notes: newConsent.notes,
      };

      setConsents(prev => [...prev, consent]);
      setIsDialogOpen(false);
      resetForm();
      onUpdate?.();
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedConsentType('');
    setNewConsent({
      status: 'pending',
      risksBenefitsDiscussed: false,
      alternativesDiscussed: false,
      questionsAnswered: false,
      patientSignature: false,
      interpreterUsed: false,
      languageUsed: 'English',
    });
  };

  const handleStatusChange = (id: string, newStatus: ConsentRecord['status']) => {
    setConsents(prev => prev.map(c => 
      c.id === id 
        ? { 
            ...c, 
            status: newStatus,
            dateSigned: newStatus === 'signed' ? format(new Date(), 'yyyy-MM-dd') : c.dateSigned,
          } 
        : c
    ));
    onUpdate?.();
  };

  const getStatusBadge = (status: ConsentRecord['status']) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Signed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'revoked':
        return <Badge className="bg-orange-100 text-orange-800"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'genetic': return '🧬';
      case 'procedure': return '🔬';
      case 'delivery': return '👶';
      case 'education': return '📚';
      case 'research': return '🔍';
      default: return '📄';
    }
  };

  // Group consents by category
  const consentsByCategory = useMemo(() => {
    const grouped: Record<string, ConsentRecord[]> = {};
    consents.forEach(c => {
      if (!grouped[c.category]) {
        grouped[c.category] = [];
      }
      grouped[c.category].push(c);
    });
    return grouped;
  }, [consents]);

  // Calculate consent statistics
  const stats = useMemo(() => ({
    total: consents.length,
    signed: consents.filter(c => c.status === 'signed').length,
    pending: consents.filter(c => c.status === 'pending').length,
    declined: consents.filter(c => c.status === 'declined').length,
  }), [consents]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-pink-600" />
          <h2 className="text-lg font-semibold">Consent Management</h2>
          <Badge variant="outline">{stats.total} consents</Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Consent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Document Consent</DialogTitle>
              <DialogDescription>
                Record consent discussion and patient signature
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Consent Type */}
              <div>
                <Label>Consent Type *</Label>
                <Select
                  value={selectedConsentType}
                  onValueChange={setSelectedConsentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select consent type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {['genetic', 'procedure', 'delivery', 'education', 'research'].map(category => (
                      <React.Fragment key={category}>
                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                          {getCategoryIcon(category)} {category}
                        </div>
                        {CONSENT_TYPES
                          .filter(ct => ct.category === category)
                          .filter(ct => !ct.requiresPriorCesarean || hasPriorCesarean)
                          .map(ct => (
                            <SelectItem key={ct.type} value={ct.type}>
                              <div>
                                <div>{ct.type}</div>
                                <div className="text-xs text-gray-500">{ct.description}</div>
                              </div>
                            </SelectItem>
                          ))
                        }
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Medicaid Warning for Sterilization */}
              {selectedConsentType?.includes('Sterilization') && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Medicaid 30-Day Rule</AlertTitle>
                  <AlertDescription>
                    Sterilization consent must be signed at least 30 days before the procedure. 
                    Patient must be at least 21 years old. Consent is valid for 180 days.
                    {edd && (
                      <div className="mt-2 font-medium">
                        Based on EDD ({edd}), consent must be signed by {format(addDays(new Date(edd), -30), 'MMMM d, yyyy')}.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Discussion Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date Discussed</Label>
                  <Input
                    type="date"
                    value={newConsent.dateDiscussed || ''}
                    onChange={e => setNewConsent(prev => ({ ...prev, dateDiscussed: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Discussed By</Label>
                  <Input
                    placeholder="Provider name"
                    value={newConsent.discussedBy || ''}
                    onChange={e => setNewConsent(prev => ({ ...prev, discussedBy: e.target.value }))}
                  />
                </div>
              </div>

              {/* Discussion Checklist */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Discussion Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newConsent.risksBenefitsDiscussed}
                      onCheckedChange={checked => setNewConsent(prev => ({ ...prev, risksBenefitsDiscussed: !!checked }))}
                    />
                    <Label>Risks and benefits explained to patient</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newConsent.alternativesDiscussed}
                      onCheckedChange={checked => setNewConsent(prev => ({ ...prev, alternativesDiscussed: !!checked }))}
                    />
                    <Label>Alternatives discussed</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newConsent.questionsAnswered}
                      onCheckedChange={checked => setNewConsent(prev => ({ ...prev, questionsAnswered: !!checked }))}
                    />
                    <Label>Patient questions answered to satisfaction</Label>
                  </div>
                </div>
              </Card>

              {/* Language/Interpreter */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Language Used</Label>
                  <Select
                    value={newConsent.languageUsed}
                    onValueChange={value => setNewConsent(prev => ({ ...prev, languageUsed: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                      <SelectItem value="Korean">Korean</SelectItem>
                      <SelectItem value="Tagalog">Tagalog</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newConsent.interpreterUsed}
                      onCheckedChange={checked => setNewConsent(prev => ({ ...prev, interpreterUsed: !!checked }))}
                    />
                    <Label>Interpreter Used</Label>
                  </div>
                </div>
              </div>

              {newConsent.interpreterUsed && (
                <div>
                  <Label>Interpreter Name</Label>
                  <Input
                    placeholder="Interpreter name"
                    value={newConsent.interpreterName || ''}
                    onChange={e => setNewConsent(prev => ({ ...prev, interpreterName: e.target.value }))}
                  />
                </div>
              )}

              {/* Signature Section */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Signature</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newConsent.patientSignature}
                      onCheckedChange={checked => setNewConsent(prev => ({ ...prev, patientSignature: !!checked }))}
                    />
                    <Label className="font-medium">Patient Signature Obtained</Label>
                  </div>

                  {newConsent.patientSignature && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label>Date Signed</Label>
                        <Input
                          type="date"
                          value={newConsent.dateSigned || ''}
                          onChange={e => setNewConsent(prev => ({ ...prev, dateSigned: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Witnessed By</Label>
                        <Input
                          placeholder="Witness name"
                          value={newConsent.witnessedBy || ''}
                          onChange={e => setNewConsent(prev => ({ ...prev, witnessedBy: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newConsent.guardianSignature}
                      onCheckedChange={checked => setNewConsent(prev => ({ ...prev, guardianSignature: !!checked }))}
                    />
                    <Label>Guardian/POA Signature (if applicable)</Label>
                  </div>

                  {newConsent.guardianSignature && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label>Guardian Name</Label>
                        <Input
                          value={newConsent.guardianName || ''}
                          onChange={e => setNewConsent(prev => ({ ...prev, guardianName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Input
                          placeholder="e.g., Parent, Spouse, POA"
                          value={newConsent.guardianRelationship || ''}
                          onChange={e => setNewConsent(prev => ({ ...prev, guardianRelationship: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes about the consent discussion..."
                  value={newConsent.notes || ''}
                  onChange={e => setNewConsent(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving || !selectedConsentType}>
                <Save className="h-4 w-4 mr-2" />
                Save Consent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {sterilizationAlert && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Timing Issue</AlertTitle>
          <AlertDescription>{sterilizationAlert.message}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Consents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold">{stats.signed}</div>
            <div className="text-sm text-gray-600">Signed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-yellow-600 mb-1" />
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-6 w-6 mx-auto text-red-600 mb-1" />
            <div className="text-2xl font-bold">{stats.declined}</div>
            <div className="text-sm text-gray-600">Declined</div>
          </CardContent>
        </Card>
      </div>

      {/* Consents by Category */}
      <Accordion type="multiple" defaultValue={['delivery', 'genetic']} className="w-full">
        {Object.entries(consentsByCategory).map(([category, categoryConsents]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span>{getCategoryIcon(category)}</span>
                <span className="capitalize">{category} Consents</span>
                <Badge variant="outline">{categoryConsents.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 p-2">
                {categoryConsents.map(consent => (
                  <Card key={consent.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{consent.consentType}</span>
                            {getStatusBadge(consent.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {consent.dateDiscussed && (
                              <div>Discussed: {consent.dateDiscussed} by {consent.discussedBy}</div>
                            )}
                            {consent.dateSigned && (
                              <div>Signed: {consent.dateSigned} {consent.witnessedBy && `• Witness: ${consent.witnessedBy}`}</div>
                            )}
                            {consent.notes && (
                              <div className="italic">{consent.notes}</div>
                            )}
                          </div>
                          {/* Checklist indicators */}
                          <div className="flex gap-2 mt-2">
                            {consent.risksBenefitsDiscussed && (
                              <Badge variant="outline" className="text-xs">Risks/Benefits ✓</Badge>
                            )}
                            {consent.alternativesDiscussed && (
                              <Badge variant="outline" className="text-xs">Alternatives ✓</Badge>
                            )}
                            {consent.questionsAnswered && (
                              <Badge variant="outline" className="text-xs">Q&A ✓</Badge>
                            )}
                            {consent.interpreterUsed && (
                              <Badge variant="outline" className="text-xs">Interpreter ✓</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {consent.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(consent.id, 'signed')}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Mark Signed
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(consent.id, 'declined')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Declined
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost">
                            <Printer className="h-3 w-3 mr-1" />
                            Print
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* No Consents */}
      {consents.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <ClipboardCheck className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>No consents documented yet</p>
            <p className="text-sm">Click &quot;Add Consent&quot; to document a consent discussion</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
