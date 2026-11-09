export type Language = 'en' | 'te' | 'hi';

export interface LocalizedString {
  en: string;
  te: string;
  hi: string;
}

export type VerificationStatus = 'VERIFIED' | 'DEMO' | 'PROPOSED';

export interface HeritageDestination {
  id: string;
  name: LocalizedString;
  tagline: LocalizedString;
  category: 'ghat' | 'temple' | 'architecture' | 'nature' | 'cultural_hub';
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  period: string;
  description: LocalizedString;
  significance: LocalizedString;
  pushkaraluSignificance: LocalizedString;
  imageUrl: string;
  has3DModel: boolean;
  modelId?: string;
  hasVirtualTour: boolean;
  tourId?: string;
  verificationStatus: VerificationStatus;
  isDemo: boolean;
  keyFeatures: string[];
}

export interface Model3DItem {
  id: string;
  title: LocalizedString;
  category: 'artifact' | 'architecture' | 'sculpture' | 'ritual_vessel' | 'rivercraft';
  historicalPeriod: string;
  originLocation: string;
  material: string;
  description: LocalizedString;
  culturalContext: LocalizedString;
  pushkaraluRole: LocalizedString;
  proceduralType: 'kalash' | 'lingam_gopuram' | 'cotton_barrage' | 'kondapalli_toy' | 'rama_bow' | 'harathi_diya' | 'ancient_coin' | 'country_boat';
  glbUrl?: string;
  previewColor: string;
  dimensions: string;
  isDemo: boolean;
  verificationStatus: VerificationStatus;
}

export interface TourStop {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  imageUrl: string;
  audioTranscript?: LocalizedString;
  historicalNote: LocalizedString;
  hotspots?: {
    x: number; // percentage
    y: number;
    title: string;
    info: string;
  }[];
}

export interface VirtualTour {
  id: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  destinationId: string;
  coverImage: string;
  estimatedMinutes: number;
  stopsCount: number;
  stops: TourStop[];
  historicalEra: string;
  isDemo: boolean;
  verificationStatus: VerificationStatus;
}

export interface CulturalArticle {
  id: string;
  title: LocalizedString;
  category: 'festivals' | 'architecture' | 'crafts' | 'culinary' | 'music_dance' | 'folklore' | 'figures';
  author: string;
  readTime: string;
  summary: LocalizedString;
  content: LocalizedString;
  imageUrl: string;
  tags: string[];
  isDemo: boolean;
  verificationStatus: VerificationStatus;
}

export interface QuizQuestion {
  id: string;
  level: 'beginner' | 'advanced';
  category: 'pushkaralu' | 'history' | 'temples' | 'geography' | 'crafts';
  question: LocalizedString;
  options: LocalizedString[];
  correctIndex: number;
  explanation: LocalizedString;
  isDemo: boolean;
  verificationStatus: VerificationStatus;
}

export interface ExhibitionItem {
  id: string;
  title: LocalizedString;
  era: string;
  yearRange: string;
  category: 'archaeology' | 'photograph' | 'manuscript' | 'tool_craft';
  imageUrl: string;
  description: LocalizedString;
  curatorNotes: LocalizedString;
  isDemo: boolean;
  verificationStatus: VerificationStatus;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  sources?: string[];
  isFallback?: boolean;
  verificationStatus?: VerificationStatus;
}

export interface UserPreferences {
  language: Language;
  soundEnabled: boolean;
  highContrast: boolean;
  bookmarks: string[];
  completedTours: string[];
  quizScores: {
    quizId: string;
    score: number;
    total: number;
    date: string;
    level: string;
  }[];
  unlockedBadges: string[];
}
