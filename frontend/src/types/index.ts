
export interface Guardian {
  name: string;
  email: string;
  phone: string;
}

export interface Student {
  name: string;
  ci: string;
  birthDate: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  city: string;
  province: string;
  areas: string[];
  guardian: Guardian; 
}

export interface CompetitionArea {
  id: string;
  name: string;
  description: string;
  level: string;
  cost: number;
}

export interface RegistrationSummary {
  student: Student;
  areas: CompetitionArea[];
  totalCost: number;
  paymentStatus: 'pending' | 'completed';
  registrationDate: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  paymentDate?: string;
}

export interface FormFieldConfig {
  id: string;
  field_name: string;
  field_key: string;
  is_required: boolean;
  is_active: boolean;
  category: 'student' | 'guardian' | 'competition';
}