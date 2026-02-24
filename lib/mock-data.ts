// Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  insurance: {
    primary: {
      name: string;
      bin: string;
      pcn: string;
      group: string;
      memberId: string;
      relationshipCode: string;
    };
    secondary?: {
      name: string;
      bin: string;
      pcn: string;
      group: string;
      memberId: string;
      relationshipCode: string;
    };
  };
  allergies: string[];
  conditions: string[];
  lastRxDate: string;
}

export interface Drug {
  ndc: string;
  name: string;
  strength: string;
  form: string;
  manufacturer: string;
}

export interface Prescriber {
  id: string;
  npi: string;
  firstName: string;
  lastName: string;
  specialty: string;
  phone: string;
  address: string;
  deaNumber: string;
}

export interface Prescription {
  id: string;
  rxNumber: string;
  patientId: string;
  patientName: string;
  drug: string;
  ndc: string;
  strength: string;
  qty: number;
  daysSupply: number;
  refillsAllowed: number;
  refillsRemaining: number;
  sig: string;
  dawCode: string;
  prescriberId: string;
  prescriberName: string;
  writtenDate: string;
  filledDate?: string;
  status: 'pending_verification' | 'fill_count' | 'final_check' | 'ready_pickup' | 'dispensed' | 'returned';
  durAlerts?: DURAlert[];
  copay?: number;
}

export interface DURAlert {
  id: string;
  type: 'drug_interaction' | 'allergy' | 'duplicate' | 'age' | 'dose';
  severity: 'high' | 'medium' | 'low';
  description: string;
  acknowledged: boolean;
}

export interface WillCallItem {
  id: string;
  patientName: string;
  rxNumber: string;
  drug: string;
  dateFilled: string;
  daysInQueue: number;
  status: 'ready' | 'expiring_soon' | 'return_to_stock';
  copay: number;
}

export interface Claim {
  id: string;
  patientName: string;
  drug: string;
  payer: string;
  amountBilled: number;
  amountPaid: number;
  status: 'paid' | 'rejected' | 'pending' | 'submitted';
  rejectionCode?: string;
  rejectionReason?: string;
  submittedDate: string;
  rxNumber: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Pharmacist' | 'Technician' | 'Owner';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export interface ActivityItem {
  id: string;
  type: 'rx_received' | 'rx_filled' | 'claim_submitted' | 'patient_added' | 'rx_picked_up';
  description: string;
  timestamp: string;
  patientName: string;
}

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: 'p001',
    firstName: 'Margaret',
    lastName: 'Thompson',
    dob: '1958-03-14',
    phone: '(555) 234-5678',
    email: 'margaret.thompson@email.com',
    address: '142 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    insurance: {
      primary: {
        name: 'Blue Cross Blue Shield',
        bin: '004336',
        pcn: 'ADV',
        group: 'GRP12345',
        memberId: 'XYZ987654321',
        relationshipCode: '01',
      },
      secondary: {
        name: 'Medicare Part D',
        bin: '610014',
        pcn: 'MEDDPART',
        group: 'MED2024',
        memberId: 'M123456789A',
        relationshipCode: '01',
      },
    },
    allergies: ['PCN', 'Sulfa', 'Aspirin'],
    conditions: ['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia'],
    lastRxDate: '2024-01-18',
  },
  {
    id: 'p002',
    firstName: 'James',
    lastName: 'Rivera',
    dob: '1972-07-22',
    phone: '(555) 345-6789',
    email: 'jrivera@email.com',
    address: '87 Maple Avenue',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    insurance: {
      primary: {
        name: 'Aetna',
        bin: '010517',
        pcn: 'AETNARX',
        group: 'AET54321',
        memberId: 'AET123456789',
        relationshipCode: '01',
      },
    },
    allergies: ['Codeine', 'Latex'],
    conditions: ['Asthma', 'GERD'],
    lastRxDate: '2024-01-20',
  },
  {
    id: 'p003',
    firstName: 'Dorothy',
    lastName: 'Chen',
    dob: '1945-11-08',
    phone: '(555) 456-7890',
    email: 'dchen@email.com',
    address: '315 Elm Drive',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    insurance: {
      primary: {
        name: 'Humana Medicare',
        bin: '015581',
        pcn: 'HUM',
        group: 'HUM2024',
        memberId: 'HUM987654321',
        relationshipCode: '01',
      },
    },
    allergies: ['NSAIDs'],
    conditions: ['Atrial Fibrillation', 'Osteoporosis', 'Hypothyroidism'],
    lastRxDate: '2024-01-21',
  },
  {
    id: 'p004',
    firstName: 'Robert',
    lastName: 'Washington',
    dob: '1965-05-30',
    phone: '(555) 567-8901',
    email: 'rwashington@email.com',
    address: '29 Birch Lane',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    insurance: {
      primary: {
        name: 'Cigna',
        bin: '009999',
        pcn: 'CIG',
        group: 'CIG67890',
        memberId: 'CIG111222333',
        relationshipCode: '01',
      },
    },
    allergies: ['Erythromycin'],
    conditions: ['Hypertension', 'Chronic Kidney Disease'],
    lastRxDate: '2024-01-17',
  },
  {
    id: 'p005',
    firstName: 'Patricia',
    lastName: 'O\'Brien',
    dob: '1980-09-15',
    phone: '(555) 678-9012',
    email: 'pobrien@email.com',
    address: '558 Cedar Court',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    insurance: {
      primary: {
        name: 'UnitedHealth',
        bin: '610020',
        pcn: 'UHC',
        group: 'UHC11111',
        memberId: 'UHC444555666',
        relationshipCode: '01',
      },
    },
    allergies: [],
    conditions: ['Depression', 'Anxiety'],
    lastRxDate: '2024-01-19',
  },
  {
    id: 'p006',
    firstName: 'William',
    lastName: 'Foster',
    dob: '1950-12-03',
    phone: '(555) 789-0123',
    email: 'wfoster@email.com',
    address: '77 Pine Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    insurance: {
      primary: {
        name: 'Medicare Part D',
        bin: '610014',
        pcn: 'MEDDPART',
        group: 'MED2024',
        memberId: 'M987654321B',
        relationshipCode: '01',
      },
    },
    allergies: ['PCN', 'Cephalosporins'],
    conditions: ['COPD', 'Heart Failure', 'Type 2 Diabetes'],
    lastRxDate: '2024-01-16',
  },
  {
    id: 'p007',
    firstName: 'Linda',
    lastName: 'Martinez',
    dob: '1988-04-27',
    phone: '(555) 890-1234',
    email: 'lmartinez@email.com',
    address: '203 Willow Way',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    insurance: {
      primary: {
        name: 'Medicaid',
        bin: '600428',
        pcn: 'ILMED',
        group: 'ILMED2024',
        memberId: 'IL123456789',
        relationshipCode: '01',
      },
    },
    allergies: ['Sulfa'],
    conditions: ['Asthma', 'Hypothyroidism'],
    lastRxDate: '2024-01-22',
  },
  {
    id: 'p008',
    firstName: 'Charles',
    lastName: 'Nguyen',
    dob: '1942-08-11',
    phone: '(555) 901-2345',
    email: 'cnguyen@email.com',
    address: '432 Spruce Avenue',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    insurance: {
      primary: {
        name: 'Humana Medicare',
        bin: '015581',
        pcn: 'HUM',
        group: 'HUM2024',
        memberId: 'HUM111222333',
        relationshipCode: '01',
      },
      secondary: {
        name: 'Aetna Supplemental',
        bin: '010517',
        pcn: 'AETNASUPP',
        group: 'SUPP2024',
        memberId: 'AET999888777',
        relationshipCode: '01',
      },
    },
    allergies: ['Warfarin', 'Statins'],
    conditions: ['Parkinson\'s Disease', 'Hypertension'],
    lastRxDate: '2024-01-15',
  },
  {
    id: 'p009',
    firstName: 'Barbara',
    lastName: 'Kim',
    dob: '1975-01-19',
    phone: '(555) 012-3456',
    email: 'bkim@email.com',
    address: '19 Ash Boulevard',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    insurance: {
      primary: {
        name: 'Blue Cross Blue Shield',
        bin: '004336',
        pcn: 'ADV',
        group: 'GRP55555',
        memberId: 'XYZ111222333',
        relationshipCode: '01',
      },
    },
    allergies: [],
    conditions: ['Rheumatoid Arthritis', 'Fibromyalgia'],
    lastRxDate: '2024-01-23',
  },
  {
    id: 'p010',
    firstName: 'Thomas',
    lastName: 'Jackson',
    dob: '1990-06-08',
    phone: '(555) 123-9876',
    email: 'tjackson@email.com',
    address: '655 Poplar Drive',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    insurance: {
      primary: {
        name: 'Cigna',
        bin: '009999',
        pcn: 'CIG',
        group: 'CIG22222',
        memberId: 'CIG777888999',
        relationshipCode: '01',
      },
    },
    allergies: ['Penicillin'],
    conditions: ['ADHD', 'Seasonal Allergies'],
    lastRxDate: '2024-01-24',
  },
  {
    id: 'p011',
    firstName: 'Susan',
    lastName: 'Patel',
    dob: '1963-10-25',
    phone: '(555) 234-8765',
    email: 'spatel@email.com',
    address: '88 Hickory Lane',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    insurance: {
      primary: {
        name: 'UnitedHealth',
        bin: '610020',
        pcn: 'UHC',
        group: 'UHC33333',
        memberId: 'UHC321654987',
        relationshipCode: '01',
      },
    },
    allergies: ['Aspirin', 'Ibuprofen'],
    conditions: ['Type 2 Diabetes', 'Hypertension', 'Depression'],
    lastRxDate: '2024-01-21',
  },
  {
    id: 'p012',
    firstName: 'Michael',
    lastName: 'Garcia',
    dob: '1955-02-14',
    phone: '(555) 345-7654',
    email: 'mgarcia@email.com',
    address: '274 Magnolia Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    insurance: {
      primary: {
        name: 'Aetna',
        bin: '010517',
        pcn: 'AETNARX',
        group: 'AET99999',
        memberId: 'AET654321987',
        relationshipCode: '01',
      },
    },
    allergies: [],
    conditions: ['Gout', 'Hypertension'],
    lastRxDate: '2024-01-18',
  },
];

// Mock Prescribers
export const mockPrescribers: Prescriber[] = [
  {
    id: 'dr001',
    npi: '1234567890',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    specialty: 'Internal Medicine',
    phone: '(555) 100-2000',
    address: '500 Medical Center Drive, Springfield, IL 62701',
    deaNumber: 'BM1234563',
  },
  {
    id: 'dr002',
    npi: '0987654321',
    firstName: 'David',
    lastName: 'Park',
    specialty: 'Family Medicine',
    phone: '(555) 100-3000',
    address: '120 Family Care Blvd, Springfield, IL 62702',
    deaNumber: 'BP9876541',
  },
  {
    id: 'dr003',
    npi: '1122334455',
    firstName: 'Jennifer',
    lastName: 'Adams',
    specialty: 'Endocrinology',
    phone: '(555) 100-4000',
    address: '300 Specialty Clinic Way, Springfield, IL 62703',
    deaNumber: 'BA1122334',
  },
  {
    id: 'dr004',
    npi: '5544332211',
    firstName: 'Robert',
    lastName: 'Harris',
    specialty: 'Cardiology',
    phone: '(555) 100-5000',
    address: '800 Heart Center Road, Springfield, IL 62704',
    deaNumber: 'BH5544332',
  },
];

// Mock Drugs (FDB-style results)
export const mockDrugs: Drug[] = [
  { ndc: '00093-1174-01', name: 'Metformin HCl', strength: '500 mg', form: 'Tablet', manufacturer: 'Teva' },
  { ndc: '00093-1175-01', name: 'Metformin HCl', strength: '1000 mg', form: 'Tablet', manufacturer: 'Teva' },
  { ndc: '00071-0156-23', name: 'Lisinopril', strength: '10 mg', form: 'Tablet', manufacturer: 'Parke-Davis' },
  { ndc: '00071-0157-23', name: 'Lisinopril', strength: '20 mg', form: 'Tablet', manufacturer: 'Parke-Davis' },
  { ndc: '00185-0060-01', name: 'Atorvastatin', strength: '40 mg', form: 'Tablet', manufacturer: 'Sandoz' },
  { ndc: '00185-0061-01', name: 'Atorvastatin', strength: '80 mg', form: 'Tablet', manufacturer: 'Sandoz' },
  { ndc: '00143-9924-01', name: 'Amlodipine', strength: '5 mg', form: 'Tablet', manufacturer: 'West-Ward' },
  { ndc: '00143-9925-01', name: 'Amlodipine', strength: '10 mg', form: 'Tablet', manufacturer: 'West-Ward' },
  { ndc: '16714-0001-01', name: 'Omeprazole', strength: '20 mg', form: 'Capsule', manufacturer: 'NorthStar' },
  { ndc: '00406-8764-05', name: 'Hydrocodone/APAP', strength: '5/325 mg', form: 'Tablet', manufacturer: 'Mallinckrodt' },
  { ndc: '00555-0766-02', name: 'Levothyroxine', strength: '50 mcg', form: 'Tablet', manufacturer: 'Barr' },
  { ndc: '00555-0767-02', name: 'Levothyroxine', strength: '100 mcg', form: 'Tablet', manufacturer: 'Barr' },
  { ndc: '00228-2765-96', name: 'Sertraline HCl', strength: '50 mg', form: 'Tablet', manufacturer: 'Actavis' },
  { ndc: '68180-0347-06', name: 'Albuterol Sulfate', strength: '90 mcg', form: 'Inhaler', manufacturer: 'Lupin' },
  { ndc: '00169-4060-12', name: 'Insulin Glargine', strength: '100 units/mL', form: 'Pen', manufacturer: 'Novo Nordisk' },
];

// Mock Prescriptions
export const mockPrescriptions: Prescription[] = [
  {
    id: 'rx001',
    rxNumber: 'RX-2024-001847',
    patientId: 'p001',
    patientName: 'Margaret Thompson',
    drug: 'Metformin HCl',
    ndc: '00093-1174-01',
    strength: '500 mg',
    qty: 60,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 4,
    sig: 'Take 1 tablet twice daily with meals',
    dawCode: '0',
    prescriberId: 'dr003',
    prescriberName: 'Dr. Jennifer Adams',
    writtenDate: '2024-01-20',
    status: 'pending_verification',
    durAlerts: [
      {
        id: 'dur001',
        type: 'drug_interaction',
        severity: 'medium',
        description: 'Metformin + Contrast Dye: Hold metformin before iodinated contrast procedures. Monitor renal function.',
        acknowledged: false,
      },
    ],
    copay: 5.00,
  },
  {
    id: 'rx002',
    rxNumber: 'RX-2024-001848',
    patientId: 'p002',
    patientName: 'James Rivera',
    drug: 'Albuterol Sulfate',
    ndc: '68180-0347-06',
    strength: '90 mcg',
    qty: 1,
    daysSupply: 30,
    refillsAllowed: 3,
    refillsRemaining: 3,
    sig: 'Inhale 2 puffs every 4-6 hours as needed for shortness of breath',
    dawCode: '0',
    prescriberId: 'dr002',
    prescriberName: 'Dr. David Park',
    writtenDate: '2024-01-20',
    status: 'fill_count',
    copay: 10.00,
  },
  {
    id: 'rx003',
    rxNumber: 'RX-2024-001849',
    patientId: 'p003',
    patientName: 'Dorothy Chen',
    drug: 'Levothyroxine',
    ndc: '00555-0766-02',
    strength: '50 mcg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 11,
    refillsRemaining: 10,
    sig: 'Take 1 tablet once daily on an empty stomach 30-60 minutes before breakfast',
    dawCode: '1',
    prescriberId: 'dr001',
    prescriberName: 'Dr. Sarah Mitchell',
    writtenDate: '2024-01-21',
    status: 'final_check',
    copay: 3.50,
  },
  {
    id: 'rx004',
    rxNumber: 'RX-2024-001850',
    patientId: 'p004',
    patientName: 'Robert Washington',
    drug: 'Lisinopril',
    ndc: '00071-0156-23',
    strength: '10 mg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 5,
    sig: 'Take 1 tablet once daily',
    dawCode: '0',
    prescriberId: 'dr001',
    prescriberName: 'Dr. Sarah Mitchell',
    writtenDate: '2024-01-21',
    status: 'ready_pickup',
    copay: 4.00,
  },
  {
    id: 'rx005',
    rxNumber: 'RX-2024-001851',
    patientId: 'p005',
    patientName: 'Patricia O\'Brien',
    drug: 'Sertraline HCl',
    ndc: '00228-2765-96',
    strength: '50 mg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 5,
    sig: 'Take 1 tablet once daily in the morning',
    dawCode: '0',
    prescriberId: 'dr002',
    prescriberName: 'Dr. David Park',
    writtenDate: '2024-01-22',
    status: 'pending_verification',
    durAlerts: [
      {
        id: 'dur002',
        type: 'drug_interaction',
        severity: 'high',
        description: 'Sertraline + Tramadol: Increased risk of serotonin syndrome. Monitor closely for signs of serotonin toxicity.',
        acknowledged: false,
      },
      {
        id: 'dur003',
        type: 'duplicate',
        severity: 'medium',
        description: 'Therapeutic duplication: Patient has active Escitalopram on profile. Review for duplicate SSRI therapy.',
        acknowledged: false,
      },
    ],
    copay: 8.00,
  },
  {
    id: 'rx006',
    rxNumber: 'RX-2024-001852',
    patientId: 'p006',
    patientName: 'William Foster',
    drug: 'Atorvastatin',
    ndc: '00185-0060-01',
    strength: '40 mg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 11,
    refillsRemaining: 8,
    sig: 'Take 1 tablet once daily at bedtime',
    dawCode: '0',
    prescriberId: 'dr004',
    prescriberName: 'Dr. Robert Harris',
    writtenDate: '2024-01-18',
    filledDate: '2024-01-19',
    status: 'dispensed',
    copay: 7.50,
  },
  {
    id: 'rx007',
    rxNumber: 'RX-2024-001853',
    patientId: 'p007',
    patientName: 'Linda Martinez',
    drug: 'Omeprazole',
    ndc: '16714-0001-01',
    strength: '20 mg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 5,
    sig: 'Take 1 capsule once daily before breakfast',
    dawCode: '0',
    prescriberId: 'dr002',
    prescriberName: 'Dr. David Park',
    writtenDate: '2024-01-22',
    status: 'fill_count',
    copay: 6.00,
  },
  {
    id: 'rx008',
    rxNumber: 'RX-2024-001854',
    patientId: 'p008',
    patientName: 'Charles Nguyen',
    drug: 'Amlodipine',
    ndc: '00143-9924-01',
    strength: '5 mg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 2,
    sig: 'Take 1 tablet once daily',
    dawCode: '0',
    prescriberId: 'dr004',
    prescriberName: 'Dr. Robert Harris',
    writtenDate: '2024-01-20',
    status: 'pending_verification',
    copay: 5.00,
  },
  {
    id: 'rx009',
    rxNumber: 'RX-2024-001855',
    patientId: 'p009',
    patientName: 'Barbara Kim',
    drug: 'Lisinopril',
    ndc: '00071-0157-23',
    strength: '20 mg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 5,
    sig: 'Take 1 tablet once daily',
    dawCode: '0',
    prescriberId: 'dr001',
    prescriberName: 'Dr. Sarah Mitchell',
    writtenDate: '2024-01-23',
    status: 'final_check',
    copay: 4.00,
  },
  {
    id: 'rx010',
    rxNumber: 'RX-2024-001856',
    patientId: 'p010',
    patientName: 'Thomas Jackson',
    drug: 'Metformin HCl',
    ndc: '00093-1175-01',
    strength: '1000 mg',
    qty: 60,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 3,
    sig: 'Take 1 tablet twice daily with meals',
    dawCode: '0',
    prescriberId: 'dr003',
    prescriberName: 'Dr. Jennifer Adams',
    writtenDate: '2024-01-24',
    status: 'fill_count',
    copay: 5.00,
  },
  {
    id: 'rx011',
    rxNumber: 'RX-2024-001857',
    patientId: 'p011',
    patientName: 'Susan Patel',
    drug: 'Atorvastatin',
    ndc: '00185-0061-01',
    strength: '80 mg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 11,
    refillsRemaining: 11,
    sig: 'Take 1 tablet once daily at bedtime',
    dawCode: '0',
    prescriberId: 'dr001',
    prescriberName: 'Dr. Sarah Mitchell',
    writtenDate: '2024-01-21',
    status: 'ready_pickup',
    copay: 9.00,
  },
  {
    id: 'rx012',
    rxNumber: 'RX-2024-001858',
    patientId: 'p012',
    patientName: 'Michael Garcia',
    drug: 'Allopurinol',
    ndc: '00555-0100-02',
    strength: '300 mg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 4,
    sig: 'Take 1 tablet once daily with food',
    dawCode: '0',
    prescriberId: 'dr001',
    prescriberName: 'Dr. Sarah Mitchell',
    writtenDate: '2024-01-18',
    status: 'pending_verification',
    copay: 6.50,
  },
  {
    id: 'rx013',
    rxNumber: 'RX-2024-001841',
    patientId: 'p001',
    patientName: 'Margaret Thompson',
    drug: 'Insulin Glargine',
    ndc: '00169-4060-12',
    strength: '100 units/mL',
    qty: 5,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 5,
    sig: 'Inject 20 units subcutaneously at bedtime',
    dawCode: '1',
    prescriberId: 'dr003',
    prescriberName: 'Dr. Jennifer Adams',
    writtenDate: '2024-01-15',
    filledDate: '2024-01-15',
    status: 'dispensed',
    copay: 35.00,
  },
  {
    id: 'rx014',
    rxNumber: 'RX-2024-001842',
    patientId: 'p003',
    patientName: 'Dorothy Chen',
    drug: 'Warfarin',
    ndc: '00054-0167-25',
    strength: '5 mg',
    qty: 30,
    daysSupply: 30,
    refillsAllowed: 11,
    refillsRemaining: 9,
    sig: 'Take as directed per INR results',
    dawCode: '1',
    prescriberId: 'dr004',
    prescriberName: 'Dr. Robert Harris',
    writtenDate: '2024-01-14',
    filledDate: '2024-01-14',
    status: 'dispensed',
    copay: 2.00,
  },
  {
    id: 'rx015',
    rxNumber: 'RX-2024-001860',
    patientId: 'p006',
    patientName: 'William Foster',
    drug: 'Metformin HCl',
    ndc: '00093-1174-01',
    strength: '500 mg',
    qty: 60,
    daysSupply: 30,
    refillsAllowed: 5,
    refillsRemaining: 5,
    sig: 'Take 1 tablet twice daily with meals',
    dawCode: '0',
    prescriberId: 'dr003',
    prescriberName: 'Dr. Jennifer Adams',
    writtenDate: '2024-01-24',
    status: 'ready_pickup',
    copay: 5.00,
  },
];

// Mock Will-Call Items
export const mockWillCallItems: WillCallItem[] = [
  {
    id: 'wc001',
    patientName: 'Robert Washington',
    rxNumber: 'RX-2024-001850',
    drug: 'Lisinopril 10 mg',
    dateFilled: '2024-01-21',
    daysInQueue: 3,
    status: 'ready',
    copay: 4.00,
  },
  {
    id: 'wc002',
    patientName: 'Susan Patel',
    rxNumber: 'RX-2024-001857',
    drug: 'Atorvastatin 80 mg',
    dateFilled: '2024-01-21',
    daysInQueue: 3,
    status: 'ready',
    copay: 9.00,
  },
  {
    id: 'wc003',
    patientName: 'William Foster',
    rxNumber: 'RX-2024-001860',
    drug: 'Metformin 500 mg',
    dateFilled: '2024-01-24',
    daysInQueue: 0,
    status: 'ready',
    copay: 5.00,
  },
  {
    id: 'wc004',
    patientName: 'Dorothy Chen',
    rxNumber: 'RX-2024-001835',
    drug: 'Levothyroxine 50 mcg',
    dateFilled: '2024-01-14',
    daysInQueue: 10,
    status: 'expiring_soon',
    copay: 3.50,
  },
  {
    id: 'wc005',
    patientName: 'Charles Nguyen',
    rxNumber: 'RX-2024-001828',
    drug: 'Amlodipine 5 mg',
    dateFilled: '2024-01-07',
    daysInQueue: 17,
    status: 'return_to_stock',
    copay: 5.00,
  },
  {
    id: 'wc006',
    patientName: 'Barbara Kim',
    rxNumber: 'RX-2024-001836',
    drug: 'Celecoxib 200 mg',
    dateFilled: '2024-01-05',
    daysInQueue: 19,
    status: 'return_to_stock',
    copay: 15.00,
  },
  {
    id: 'wc007',
    patientName: 'James Rivera',
    rxNumber: 'RX-2024-001848',
    drug: 'Albuterol Inhaler',
    dateFilled: '2024-01-24',
    daysInQueue: 0,
    status: 'ready',
    copay: 10.00,
  },
  {
    id: 'wc008',
    patientName: 'Patricia O\'Brien',
    rxNumber: 'RX-2024-001844',
    drug: 'Sertraline 50 mg',
    dateFilled: '2024-01-13',
    daysInQueue: 11,
    status: 'expiring_soon',
    copay: 8.00,
  },
  {
    id: 'wc009',
    patientName: 'Thomas Jackson',
    rxNumber: 'RX-2024-001851',
    drug: 'Adderall XR 20 mg',
    dateFilled: '2024-01-23',
    daysInQueue: 1,
    status: 'ready',
    copay: 45.00,
  },
  {
    id: 'wc010',
    patientName: 'Linda Martinez',
    rxNumber: 'RX-2024-001847',
    drug: 'Omeprazole 20 mg',
    dateFilled: '2024-01-22',
    daysInQueue: 2,
    status: 'ready',
    copay: 6.00,
  },
];

// Mock Claims
export const mockClaims: Claim[] = [
  {
    id: 'cl001',
    patientName: 'Margaret Thompson',
    drug: 'Metformin 500 mg',
    payer: 'Blue Cross Blue Shield',
    amountBilled: 45.00,
    amountPaid: 40.00,
    status: 'paid',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001847',
  },
  {
    id: 'cl002',
    patientName: 'James Rivera',
    drug: 'Albuterol Inhaler',
    payer: 'Aetna',
    amountBilled: 68.50,
    amountPaid: 0,
    status: 'rejected',
    rejectionCode: '75',
    rejectionReason: 'Prior authorization required',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001848',
  },
  {
    id: 'cl003',
    patientName: 'Dorothy Chen',
    drug: 'Levothyroxine 50 mcg',
    payer: 'Humana Medicare',
    amountBilled: 22.00,
    amountPaid: 18.50,
    status: 'paid',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001849',
  },
  {
    id: 'cl004',
    patientName: 'Robert Washington',
    drug: 'Lisinopril 10 mg',
    payer: 'Cigna',
    amountBilled: 35.00,
    amountPaid: 31.00,
    status: 'paid',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001850',
  },
  {
    id: 'cl005',
    patientName: 'Patricia O\'Brien',
    drug: 'Sertraline 50 mg',
    payer: 'UnitedHealth',
    amountBilled: 55.00,
    amountPaid: 0,
    status: 'rejected',
    rejectionCode: '88',
    rejectionReason: 'Non-formulary drug. Step therapy required.',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001851',
  },
  {
    id: 'cl006',
    patientName: 'William Foster',
    drug: 'Atorvastatin 40 mg',
    payer: 'Medicare Part D',
    amountBilled: 48.00,
    amountPaid: 40.50,
    status: 'paid',
    submittedDate: '2024-01-23',
    rxNumber: 'RX-2024-001852',
  },
  {
    id: 'cl007',
    patientName: 'Linda Martinez',
    drug: 'Omeprazole 20 mg',
    payer: 'Medicaid',
    amountBilled: 28.00,
    amountPaid: 25.00,
    status: 'paid',
    submittedDate: '2024-01-23',
    rxNumber: 'RX-2024-001853',
  },
  {
    id: 'cl008',
    patientName: 'Charles Nguyen',
    drug: 'Amlodipine 5 mg',
    payer: 'Humana Medicare',
    amountBilled: 32.00,
    amountPaid: 0,
    status: 'pending',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001854',
  },
  {
    id: 'cl009',
    patientName: 'Barbara Kim',
    drug: 'Lisinopril 20 mg',
    payer: 'Blue Cross Blue Shield',
    amountBilled: 38.00,
    amountPaid: 34.00,
    status: 'paid',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001855',
  },
  {
    id: 'cl010',
    patientName: 'Thomas Jackson',
    drug: 'Metformin 1000 mg',
    payer: 'Cigna',
    amountBilled: 52.00,
    amountPaid: 0,
    status: 'rejected',
    rejectionCode: '04',
    rejectionReason: 'Days supply limitation exceeded',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001856',
  },
  {
    id: 'cl011',
    patientName: 'Susan Patel',
    drug: 'Atorvastatin 80 mg',
    payer: 'UnitedHealth',
    amountBilled: 62.00,
    amountPaid: 53.00,
    status: 'paid',
    submittedDate: '2024-01-23',
    rxNumber: 'RX-2024-001857',
  },
  {
    id: 'cl012',
    patientName: 'Michael Garcia',
    drug: 'Allopurinol 300 mg',
    payer: 'Aetna',
    amountBilled: 29.50,
    amountPaid: 0,
    status: 'pending',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001858',
  },
  {
    id: 'cl013',
    patientName: 'Margaret Thompson',
    drug: 'Insulin Glargine',
    payer: 'Blue Cross Blue Shield',
    amountBilled: 185.00,
    amountPaid: 150.00,
    status: 'paid',
    submittedDate: '2024-01-22',
    rxNumber: 'RX-2024-001841',
  },
  {
    id: 'cl014',
    patientName: 'Dorothy Chen',
    drug: 'Warfarin 5 mg',
    payer: 'Humana Medicare',
    amountBilled: 18.00,
    amountPaid: 16.00,
    status: 'paid',
    submittedDate: '2024-01-21',
    rxNumber: 'RX-2024-001842',
  },
  {
    id: 'cl015',
    patientName: 'William Foster',
    drug: 'Metformin 500 mg',
    payer: 'Medicare Part D',
    amountBilled: 42.00,
    amountPaid: 37.00,
    status: 'paid',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001860',
  },
  {
    id: 'cl016',
    patientName: 'James Rivera',
    drug: 'Amoxicillin 500 mg',
    payer: 'Aetna',
    amountBilled: 24.00,
    amountPaid: 0,
    status: 'rejected',
    rejectionCode: '14',
    rejectionReason: 'Refill too soon',
    submittedDate: '2024-01-24',
    rxNumber: 'RX-2024-001861',
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'u001',
    name: 'Dr. Amanda Chen',
    email: 'achen@riversidepharmacy.com',
    role: 'Pharmacist',
    status: 'Active',
    lastLogin: '2024-01-24 08:15 AM',
  },
  {
    id: 'u002',
    name: 'Mark Johnson',
    email: 'mjohnson@riversidepharmacy.com',
    role: 'Technician',
    status: 'Active',
    lastLogin: '2024-01-24 07:45 AM',
  },
  {
    id: 'u003',
    name: 'Sarah Williams',
    email: 'swilliams@riversidepharmacy.com',
    role: 'Technician',
    status: 'Active',
    lastLogin: '2024-01-23 06:30 PM',
  },
  {
    id: 'u004',
    name: 'Robert Davis',
    email: 'rdavis@riversidepharmacy.com',
    role: 'Owner',
    status: 'Active',
    lastLogin: '2024-01-24 09:00 AM',
  },
  {
    id: 'u005',
    name: 'Lisa Thompson',
    email: 'lthompson@riversidepharmacy.com',
    role: 'Technician',
    status: 'Inactive',
    lastLogin: '2024-01-10 03:15 PM',
  },
];

// Mock Activity Feed
export const mockActivity: ActivityItem[] = [
  {
    id: 'act001',
    type: 'rx_received',
    description: 'New prescription received for Metformin 500 mg',
    timestamp: '2 min ago',
    patientName: 'Margaret Thompson',
  },
  {
    id: 'act002',
    type: 'rx_filled',
    description: 'Prescription filled — Albuterol Inhaler',
    timestamp: '8 min ago',
    patientName: 'James Rivera',
  },
  {
    id: 'act003',
    type: 'claim_submitted',
    description: 'Claim submitted to Blue Cross Blue Shield',
    timestamp: '15 min ago',
    patientName: 'Dorothy Chen',
  },
  {
    id: 'act004',
    type: 'rx_picked_up',
    description: 'Prescription picked up — Lisinopril 10 mg',
    timestamp: '22 min ago',
    patientName: 'Robert Washington',
  },
  {
    id: 'act005',
    type: 'patient_added',
    description: 'New patient profile created',
    timestamp: '41 min ago',
    patientName: 'Thomas Jackson',
  },
  {
    id: 'act006',
    type: 'rx_received',
    description: 'New prescription received for Sertraline 50 mg',
    timestamp: '55 min ago',
    patientName: 'Patricia O\'Brien',
  },
  {
    id: 'act007',
    type: 'claim_submitted',
    description: 'Claim rejected — Prior auth required',
    timestamp: '1 hr ago',
    patientName: 'James Rivera',
  },
  {
    id: 'act008',
    type: 'rx_filled',
    description: 'Prescription filled — Atorvastatin 40 mg',
    timestamp: '1.5 hr ago',
    patientName: 'William Foster',
  },
];
