export interface Student {
  name: string;
  lastName: string;
  ci: string;
  birthDate: string;
  email: string;
  phone: string;
  colegio: string; // Added field for educational institution
  gradeId: string; // Added field for grade id
  areas: string[]; // Added field for department
  departamento: string;
  provincia: string;
  guardian: {
    name: string;
    ci: string;
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
  grade: string; 
  cost: number;
}

export interface AreaCost {
  id: string;
  areaId: string;
  levelId: string;
  cost: number;
}

export interface RegistrationSummary {
  id: string|undefined;
  student: Student;
  areas: CompetitionArea[]|'';
  totalCost: number;
  paymentStatus: 'pending' | 'completed';
  registrationDate: string;
  selectedLevels: Level[]|''; // Changed to array of Level objects
  teachers: Teacher[]| null;
  olympiadId: string|undefined; 
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
    areas: string[];
    guardian: {
      name: string;
      email: string;
      phone: string;
    };
  }
}
  export interface CompetitionArea {
    id: string;
    name: string;
    description: string;
    level: string;
    cost: number;
  }
  

  
  export interface PaymentDetails {
    amount: number;
    currency: string;
    method: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transactionId?: string;
    paymentDate?: string;
  }

  export interface Teacher {
    name: string, 
    lastName: string,
    ci: string,
    email: string,
    phone: string
  }