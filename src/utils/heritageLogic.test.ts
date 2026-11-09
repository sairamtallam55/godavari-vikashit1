import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceKm,
  assessQuizSubmission,
  filterDestinations,
  isDemoRecord,
} from './heritageLogic';
import { HeritageDestination, QuizQuestion } from '../types';

test('calculateDistanceKm returns accurate distance between Rajahmundry and Bhadrachalam', () => {
  // Rajahmundry ~ (17.0005, 81.8040)
  // Bhadrachalam ~ (17.6688, 80.8936)
  const dist = calculateDistanceKm(17.0005, 81.804, 17.6688, 80.8936);
  assert.ok(dist > 110 && dist < 140, `Distance was ${dist} km, expected ~120-130 km`);
});

test('assessQuizSubmission correctly calculates score, percentage, and assigns badge', () => {
  const dummyQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      level: 'beginner',
      category: 'pushkaralu',
      question: { en: 'Pushkaralu frequency?', te: 'ఎన్ని ఏళ్లు?', hi: 'कितने साल?' },
      options: [
        { en: '6 years', te: '6 ఏళ్లు', hi: '6 साल' },
        { en: '12 years', te: '12 ఏళ్లు', hi: '12 साल' },
      ],
      correctIndex: 1,
      explanation: { en: 'Every 12 years', te: '12 ఏళ్లకు ఒకసారి', hi: 'हर 12 साल में' },
      isDemo: true,
      verificationStatus: 'DEMO',
    },
    {
      id: 'q2',
      level: 'beginner',
      category: 'temples',
      question: { en: 'Where is Kotilingeshwara temple?', te: 'ఎక్కడ ఉంది?', hi: 'कहाँ है?' },
      options: [
        { en: 'Rajahmundry', te: 'రాజమండ్రి', hi: 'राजमंड्री' },
        { en: 'Vijayawada', te: 'విజయవాడ', hi: 'विजयवाड़ा' },
      ],
      correctIndex: 0,
      explanation: { en: 'Rajahmundry ghats', te: 'రాజమండ్రి తీరం', hi: 'राजमंड्री तट' },
      isDemo: true,
      verificationStatus: 'DEMO',
    },
  ];

  // Full score
  const res100 = assessQuizSubmission({ q1: 1, q2: 0 }, dummyQuestions);
  assert.equal(res100.score, 2);
  assert.equal(res100.percentage, 100);
  assert.equal(res100.passed, true);
  assert.equal(res100.earnedBadge?.id, 'godavari_acharya');

  // Half score (50%)
  const res50 = assessQuizSubmission({ q1: 1, q2: 1 }, dummyQuestions);
  assert.equal(res50.score, 1);
  assert.equal(res50.percentage, 50);
  assert.equal(res50.passed, false);
});

test('filterDestinations filters by category and search keyword', () => {
  const sampleDestinations: HeritageDestination[] = [
    {
      id: 'dest_1',
      name: { en: 'Pushkar Ghat Rajahmundry', te: 'పుష్కర ఘాట్', hi: 'पुष्कर घाट' },
      tagline: { en: 'Sacred riverfront', te: 'పవిత్ర ఘాట్', hi: 'पवित्र घाट' },
      category: 'ghat',
      district: 'East Godavari',
      state: 'Andhra Pradesh',
      coordinates: { lat: 17.0005, lng: 81.804 },
      period: 'Ancient',
      description: { en: 'Grand river steps', te: 'విశాలమైన ఘాట్లు', hi: 'विशाल घाट' },
      significance: { en: 'Holy dip point', te: 'పుణ్యస్నాన ఘాట్', hi: 'पवित्र स्नान स्थल' },
      pushkaraluSignificance: { en: 'Epicenter of 2027', te: 'కేంద్ర బిందువు', hi: 'महाकुंभ केंद्र' },
      imageUrl: '/images/ghat.jpg',
      has3DModel: true,
      hasVirtualTour: true,
      verificationStatus: 'VERIFIED',
      isDemo: false,
      keyFeatures: ['Pushkaralu', 'Harathi', 'River Bathing'],
    },
    {
      id: 'dest_2',
      name: { en: 'Bhadrachalam Temple', te: 'భద్రాచలం రామాలయం', hi: 'भद्राचलम मंदिर' },
      tagline: { en: 'Sri Rama Temple', te: 'శ్రీరామ క్షేత్రం', hi: 'श्री राम मंदिर' },
      category: 'temple',
      district: 'Bhadradri Kothagudem',
      state: 'Telangana',
      coordinates: { lat: 17.6688, lng: 80.8936 },
      period: '17th Century',
      description: { en: 'Built by Bhakta Ramadasu', te: 'రామదాసు నిర్మితం', hi: 'रामदास द्वारा निर्मित' },
      significance: { en: 'Vaikuntha Ekadasi', te: 'వైకుంఠ ఏకాదశి', hi: 'वैकुंठ एकादशी' },
      pushkaraluSignificance: { en: 'Holy bath at Godavari', te: 'గోదావరి స్నానం', hi: 'गोदावरी स्नान' },
      imageUrl: '/images/bhadrachalam.jpg',
      has3DModel: true,
      hasVirtualTour: true,
      verificationStatus: 'DEMO',
      isDemo: true,
      keyFeatures: ['Rama', 'Temple', 'Architecture'],
    },
  ];

  // Category filter
  const temples = filterDestinations(sampleDestinations, { category: 'temple' });
  assert.equal(temples.length, 1);
  assert.equal(temples[0].id, 'dest_2');

  // Search filter
  const searchResults = filterDestinations(sampleDestinations, { searchQuery: 'Rajahmundry' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, 'dest_1');

  // Verification filter
  const verifiedOnly = filterDestinations(sampleDestinations, { status: 'VERIFIED' });
  assert.equal(verifiedOnly.length, 1);
  assert.equal(verifiedOnly[0].id, 'dest_1');
});

test('isDemoRecord identifies demo flag and status correctly', () => {
  assert.equal(isDemoRecord({ isDemo: true, verificationStatus: 'DEMO' }), true);
  assert.equal(isDemoRecord({ isDemo: false, verificationStatus: 'VERIFIED' }), false);
  assert.equal(isDemoRecord({ isDemo: false, verificationStatus: 'DEMO' }), true);
});
