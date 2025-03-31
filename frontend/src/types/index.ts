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
  school: string;
  grade: string;
  city: string;
  province: string;
  areas: string[];
  guardian: {
    name: string;
    email: string;
    phone: string;
  };
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
  paymentStatus: string;
  registrationDate: string;
}