/**
 * CamTrust Dashboard Shared Data & State Management
 * Provides realistic initial mock data and localStorage persistence for live interactions.
 */

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  location: string;
  type: string;
  status: 'In Progress' | 'At Risk' | 'Completed' | 'On Track';
  progress: number;
  startDate: string;
  expectedEndDate: string;
  budget: number;
  spent: number;
  projectManager: string;
  description: string;
  image?: string;
}

export interface MilestoneItem {
  id: string;
  projectId: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  date?: string;
  progress?: number;
  description?: string;
}

export interface ReportItem {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  date: string;
  author: string;
  authorRole: string;
  photosCount: number;
  images: string[];
  notes: string;
  milestone: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  date: string;
  size: string;
  type: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: 'Active' | 'On Leave' | 'Pending';
  avatar?: string;
  email: string;
  phone: string;
  licenseNumber?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'progress' | 'milestone' | 'message' | 'document' | 'system';
  read: boolean;
  actionUrl?: string;
}

export interface VerificationApplicant {
  id: string;
  name: string;
  title: string;
  licenseNumber: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  dateApplied: string;
  documentsCount: number;
  email: string;
}

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: '1',
    code: 'MV-2025-014',
    name: 'Modern Villa Construction',
    location: 'Yaoundé, Cameroon',
    type: 'Residential',
    status: 'In Progress',
    progress: 72,
    startDate: '10 Apr 2025',
    expectedEndDate: '20 Dec 2025',
    budget: 250000,
    spent: 162500,
    projectManager: 'John Doe',
    description: 'Construction of a 4-bedroom modern family villa with sustainable solar energy and luxury finishing.',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    code: 'DR-2025-009',
    name: 'Duplex Residence',
    location: 'Douala, Cameroon',
    type: 'Residential',
    status: 'In Progress',
    progress: 45,
    startDate: '15 Jan 2025',
    expectedEndDate: '15 Nov 2025',
    budget: 180000,
    spent: 81000,
    projectManager: 'Sarah Jones',
    description: 'Contemporary two-family duplex with reinforced concrete structure and underground parking.',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    code: 'OB-2025-006',
    name: 'Office Building Project',
    location: 'Bafoussam, Cameroon',
    type: 'Commercial',
    status: 'At Risk',
    progress: 26,
    startDate: '01 Mar 2025',
    expectedEndDate: '30 Mar 2026',
    budget: 520000,
    spent: 135200,
    projectManager: 'BuildPro Ltd',
    description: '5-story commercial office complex with fiber-optic readiness and energy efficiency certification.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '4',
    code: 'RA-2025-021',
    name: 'Rental Apartments',
    location: 'Kribi, Cameroon',
    type: 'Residential',
    status: 'Completed',
    progress: 100,
    startDate: '05 Jun 2024',
    expectedEndDate: '15 Jan 2025',
    budget: 310000,
    spent: 305000,
    projectManager: 'John Doe',
    description: '12-unit coastal rental apartment complex with communal pool and beach access.',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '5',
    code: 'WC-2025-032',
    name: 'Warehouse Construction',
    location: 'Limbe, Cameroon',
    type: 'Industrial',
    status: 'In Progress',
    progress: 60,
    startDate: '10 Feb 2025',
    expectedEndDate: '15 Oct 2025',
    budget: 420000,
    spent: 252000,
    projectManager: 'Sarah Jones',
    description: 'Heavy duty steel frame logistics storage facility with climate-controlled zones.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop'
  }
];

export const INITIAL_MILESTONES: MilestoneItem[] = [
  { id: 'm1', projectId: '1', title: 'Land Preparation', status: 'Completed', date: '10 Apr 2025', progress: 100 },
  { id: 'm2', projectId: '1', title: 'Foundation', status: 'Completed', date: '28 Apr 2025', progress: 100 },
  { id: 'm3', projectId: '1', title: 'Columns & Beams', status: 'Completed', date: '15 May 2025', progress: 100 },
  { id: 'm4', projectId: '1', title: 'Walls & Masonry', status: 'Completed', date: '02 Jun 2025', progress: 100 },
  { id: 'm5', projectId: '1', title: 'Roofing Structure', status: 'In Progress', date: '18 Jun 2025', progress: 75 },
  { id: 'm6', projectId: '1', title: 'Electrical & Plumbing', status: 'Pending', date: 'Estimated Jul 2025', progress: 0 },
  { id: 'm7', projectId: '1', title: 'Finishing & Painting', status: 'Pending', date: 'Estimated Sep 2025', progress: 0 },
  { id: 'm8', projectId: '1', title: 'Handover & Inspection', status: 'Pending', date: 'Estimated Dec 2025', progress: 0 },
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'r1',
    projectId: '1',
    projectName: 'Modern Villa Construction',
    title: 'Roofing work in progress',
    date: '18 June 2025',
    author: 'Eng. Mark Tala',
    authorRole: 'Civil Engineer',
    photosCount: 12,
    images: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=300&auto=format&fit=crop'
    ],
    notes: 'Truss placement 85% completed. Waterproof underlayment started on south wing. Weather conditions clear.',
    milestone: 'Roofing Structure'
  },
  {
    id: 'r2',
    projectId: '1',
    projectName: 'Modern Villa Construction',
    title: 'Walls completed & inspected',
    date: '02 June 2025',
    author: 'Eng. Mark Tala',
    authorRole: 'Civil Engineer',
    photosCount: 8,
    images: [
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=300&auto=format&fit=crop'
    ],
    notes: 'Ground floor and first floor brickwork cured and checked against structural drawings. Approved for roof truss installation.',
    milestone: 'Walls & Masonry'
  },
  {
    id: 'r3',
    projectId: '1',
    projectName: 'Modern Villa Construction',
    title: 'Columns completed',
    date: '15 May 2025',
    author: 'Eng. Mark Tala',
    authorRole: 'Civil Engineer',
    photosCount: 6,
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=300&auto=format&fit=crop'
    ],
    notes: 'All 18 load bearing columns cast with Grade C30 concrete. Slump test: 100mm. Compression test satisfactory.',
    milestone: 'Columns & Beams'
  },
  {
    id: 'r4',
    projectId: '1',
    projectName: 'Modern Villa Construction',
    title: 'Foundation completed',
    date: '28 Apr 2025',
    author: 'Eng. Mark Tala',
    authorRole: 'Civil Engineer',
    photosCount: 10,
    images: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=300&auto=format&fit=crop'
    ],
    notes: 'Reinforced concrete strip foundation poured and damp-proof membrane installed.',
    milestone: 'Foundation'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  { id: 'd1', name: 'Architectural Plans.pdf', category: 'Drawings', date: 'May 10, 2025', size: '2.4 MB', type: 'pdf' },
  { id: 'd2', name: 'Building Permit.pdf', category: 'Permits', date: 'Apr 28, 2025', size: '1.8 MB', type: 'pdf' },
  { id: 'd3', name: 'Contract Agreement.pdf', category: 'Contracts', date: 'Apr 18, 2025', size: '1.2 MB', type: 'pdf' },
  { id: 'd4', name: 'Budget Breakdown.xlsx', category: 'Finance', date: 'Apr 25, 2025', size: '920 KB', type: 'xlsx' },
  { id: 'd5', name: 'Soil Test Report.pdf', category: 'Engineering', date: 'Apr 15, 2025', size: '1.6 MB', type: 'pdf' },
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 't1',
    name: 'Eng. Mark Tala',
    role: 'Civil Engineer',
    specialty: 'Project Lead & Structural',
    status: 'Active',
    email: 'mark.tala@camtrust.org',
    phone: '+237 670 123 456',
    licenseNumber: 'CIV/2017/04589',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 't2',
    name: 'Martin Njeh',
    role: 'Site Supervisor',
    specialty: 'Quality & Safety Officer',
    status: 'Active',
    email: 'martin.njeh@camtrust.org',
    phone: '+237 677 890 123',
    licenseNumber: 'SUP/2019/01124',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 't3',
    name: 'BuildPro Contractors',
    role: 'General Contractor',
    specialty: 'Civil Works & Construction',
    status: 'Active',
    email: 'contact@buildpro.cm',
    phone: '+237 699 456 789',
    licenseNumber: 'CT/2014/095',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 't4',
    name: 'Jean Paul',
    role: 'Architect',
    specialty: 'Exterior & Interior Design',
    status: 'Active',
    email: 'jean.paul@camtrust.org',
    phone: '+237 655 234 567',
    licenseNumber: 'AR/2019/043',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New progress report uploaded',
    description: 'Modern Villa Construction • 18 June 2025 - 09:30 AM',
    date: '10m ago',
    category: 'progress',
    read: false
  },
  {
    id: 'n2',
    title: 'Milestone completed: Walls & Masonry',
    description: 'Walls has been completed • 02 June 2025 - 04:15 PM',
    date: '2h ago',
    category: 'milestone',
    read: false
  },
  {
    id: 'n3',
    title: 'New message from Engineer Mark',
    description: '"Roof trusses delivered on site and ready for mounting."',
    date: 'Yesterday',
    category: 'message',
    read: false
  },
  {
    id: 'n4',
    title: 'Document uploaded: Soil Test Report.pdf',
    description: 'Uploaded by Martin Njeh • 15 May 2025',
    date: '3 days ago',
    category: 'document',
    read: true
  }
];

export const INITIAL_VERIFICATIONS: VerificationApplicant[] = [
  {
    id: 'v1',
    name: 'Eng. Mark Tala',
    title: 'Civil Engineer (Soil/Structural)',
    licenseNumber: 'CIV/2017/04589',
    status: 'Verified',
    dateApplied: '12 Jan 2025',
    documentsCount: 4,
    email: 'mark@camtrust.org'
  },
  {
    id: 'v2',
    name: 'Eng. Sarah J.',
    title: 'Geotechnical Civil Engineer',
    licenseNumber: 'CIV/2019/01102',
    status: 'Pending',
    dateApplied: '04 Jun 2025',
    documentsCount: 3,
    email: 'sarah@camtrust.org'
  },
  {
    id: 'v3',
    name: 'Arch. Paul M.',
    title: 'Architect',
    licenseNumber: 'AR/2019/043',
    status: 'Verified',
    dateApplied: '18 Mar 2025',
    documentsCount: 5,
    email: 'paul@camtrust.org'
  },
  {
    id: 'v4',
    name: 'BuildPro Contractors',
    title: 'Contractor Licensure',
    licenseNumber: 'CT/2014/095',
    status: 'Verified',
    dateApplied: '02 Feb 2025',
    documentsCount: 6,
    email: 'info@buildpro.cm'
  }
];
