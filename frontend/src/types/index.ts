export interface FormFieldConfig {
  id?: string;
  field_name: string;
  field_key: string;
  is_required: boolean;
  is_active: boolean;
  category: string;
}

export interface Student {
  name: string;
  ci: string;
  birthDate: string;
  email: string;
  phone: string;
  colegio: string;
  gradeId: string;
  departamento: string;
  provincia: string;
  areas: string[];
  guardian: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Level {
  id: string;
  name: string;
}

export interface Grade {
  id: string;
  name: string;
}

export interface CompetitionArea {
  id: string;
  name: string;
  description: string;
  level: string;
  cost: number;
}

export interface AreaCost {
  id: string;
  areaId: string;
  levelId: string;
  cost: number;
}

export interface RegistrationSummary {
  id: string;
  student: Student;
  areas: CompetitionArea[];
  totalCost: number;
  paymentStatus: string;
  registrationDate: string;
  selectedLevels: Level[];
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  paymentDate?: string;
}

export interface AdminStats {
  totalStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  registrationsByArea: {
    name: string;
    count: number;
  }[];
}