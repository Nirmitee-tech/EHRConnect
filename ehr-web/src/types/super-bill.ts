export interface Provider {
  id: string;
  name: string;
  npiNumber: string;
}

export interface ICD10Code {
  id: string;
  code: string;
  description: string;
}

export interface BillingItem {
  id: string;
  procedureCode: string;
  modifiers?: string;
  amount: number;
  quantity: number;
  subtotal: number;
  icd10Codes: ICD10Code[];
}

export interface PatientInsurance {
  insuranceType: string;
  payerName: string;
  planName: string;
  insuranceIdNumber: string;
  groupId?: string;
  effectiveEndDate?: string;
  eligibility?: string;
}

export interface SuperBill {
  id?: string;
  patientId: string;
  patientName: string;
  billingProvider: Provider;
  referringProvider?: Provider;
  orderingProvider?: Provider;
  billingItems: BillingItem[];
  totalCharges: number;
  proceduralCharges: number;
  status: 'draft' | 'submitted' | 'paid' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SuperBillFormData {
  patientId: string;
  billingProviderId: string;
  referringProviderId?: string;
  orderingProviderId?: string;
  billingItems: BillingItem[];
}
