/**
 * Helper to detect candidate gender based on first names commonly found in Côte d'Ivoire / Francophone West Africa,
 * and provide specialized professional avatar portraits for Male / Female candidates.
 */

// Common female first names in Côte d'Ivoire & Francophone West Africa
const FEMALE_NAMES = new Set([
  'marie', 'fatou', 'fatoumata', 'aminata', 'aya', 'adjoba', 'affoué', 'affoue',
  'akissi', 'amlan', 'aïcha', 'aicha', 'bintou', 'mariam', 'salimata', 'kadidiatou',
  'fanta', 'rokia', 'ouattara', 'adjoua', 'koko', 'n\'goran', 'grace', 'grâce',
  'esther', 'ruth', 'sarah', 'sara', 'rebecca', 'priscille', 'priscilla', 'christelle',
  'delphine', 'rosine', 'patricia', 'sylvie', 'edwige', 'clarisse', 'charlotte',
  'sandrine', 'nadege', 'nadège', 'viviane', 'solange', 'evelyne', 'angele', 'angèle',
  'florence', 'cynthia', 'audrey', 'raissa', 'raïssa', 'carine', 'sonia', 'vanessa',
  'diane', 'estelle', 'sophie', 'julie', 'julienne', 'jeanne', 'therese', 'thérèse',
  'charlène', 'charlene', 'laetitia', 'létitia', 'laetitia', 'inès', 'ines', 'dorcas',
  'deborah', 'déborah', 'miriam', 'hadja', 'moussokoro', 'ramatou', 'awa', 'coumba',
  'kady', 'djenaba', 'djenabou', 'djeneba', 'djénéba', 'assetou', 'assétou', 'massandje',
  'massandjé', 'maïmouna', 'maimouna', 'nassira', 'safiatou', 'saran', 'tenin', 'ténin',
  'nounou', 'yasmine', 'yasmina', 'nadia', 'valerie', 'valérie', 'beatrice', 'béatrice',
  'marthe', 'monique', 'odette', 'alice', 'genevieve', 'geneviève', 'lucie', 'cécile',
  'cecile', 'pauline', 'yvonne', 'anne', 'annick', 'blanche', 'catherine', 'colette',
  'denise', 'eliane', 'éliane', 'felicite', 'félicité', 'hortense', 'irene', 'irène',
  'jacqueline', 'madeleine', 'marguerite', 'rose', 'suzanne', 'victoria', 'abiba',
  'afia', 'akouba', 'amie', 'amina', 'antoinette', 'arlette', 'assiata', 'aude',
  'augustine', 'bakayoko', 'bernadette', 'berthe', 'brigitte', 'carole', 'celine',
  'cécile', 'chantal', 'claudine', 'clémence', 'clemence', 'corine', 'corinne',
  'danielle', 'daniella', 'dominique', 'dorothée', 'dorothee', 'elisabeth', 'émilienne',
  'emilienne', 'eugenie', 'eugénie', 'faustine', 'flore', 'georgette', 'germaine',
  'ghislaine', 'gisèle', 'gisele', 'helene', 'hélène', 'henriette', 'hugues', 'isabelle',
  'joelle', 'joëlle', 'josette', 'josiane', 'judith', 'julienne', 'justine', 'leocadie',
  'léocadie', 'leontine', 'léontine', 'louise', 'lucienne', 'lydie', 'marceline',
  'marcelline', 'marlène', 'marlene', 'martine', 'mathilde', 'maurice', 'nadine',
  'nicole', 'noelle', 'noëlle', 'olga', 'paulette', 'regina', 'régina', 'reine',
  'rolande', 'sabine', 'severine', 'séverine', 'simone', 'tatiana', 'victorine',
  'virginie', 'yolande'
]);

// Common male first names in Côte d'Ivoire & Francophone West Africa
const MALE_NAMES = new Set([
  'koffi', 'kouassi', 'kouame', 'kouamé', 'yao', 'konan', 'n\'guessan', 'nguessan',
  'assi', 'aka', 'adama', 'ibrahim', 'ibrahima', 'moussa', 'mamadou', 'seydou',
  'bakary', 'ali', 'amadou', 'cheick', 'souleymane', 'drissa', 'yacouba', 'aboubacar',
  'lassina', 'tidiane', 'oumar', 'ousmane', 'jean', 'paul', 'pierre', 'michel',
  'charles', 'francois', 'françois', 'patrick', 'serge', 'alain', 'didier', 'eric',
  'éric', 'stephane', 'stéphane', 'cedric', 'cédric', 'thierry', 'roland', 'christian',
  'emmanuel', 'marc', 'david', 'samuel', 'joseph', 'daniel', 'elvis', 'julien',
  'arsene', 'arsène', 'eugene', 'eugène', 'blaise', 'guy', 'herve', 'hervé',
  'fabrice', 'franck', 'gervais', 'ghislain', 'gilbert', 'guillaume', 'henri',
  'honore', 'honoré', 'hubert', 'ignace', 'innocent', 'jacques', 'joachim', 'joel',
  'joël', 'jules', 'justin', 'laurent', 'leon', 'léon', 'luc', 'lucien', 'marcel',
  'mathieu', 'mathias', 'maurice', 'maxime', 'nicolas', 'noel', 'noël', 'norbert',
  'olivier', 'pascal', 'patrice', 'philippe', 'prosper', 'raphael', 'raphaël',
  'raymond', 'richard', 'robert', 'roger', 'romain', 'salomon', 'sebastien', 'sébastien',
  'severin', 'séverin', 'simeon', 'siméon', 'simon', 'stanislas', 'sylvain', 'theodore',
  'théodore', 'theophile', 'théophile', 'thomas', 'valentin', 'victor', 'vincent',
  'wilfried', 'xavier', 'yves', 'zacharie', 'soumaila', 'soumaïla', 'abdoulaye',
  'abou', 'alassane', 'amadou', 'boubacar', 'brahim', 'daouda', 'djibril', 'fousseyni',
  'harouna', 'issa', 'kalilou', 'karim', 'kassim', 'laciné', 'lacine', 'madou',
  'mahamadou', 'moriba', 'nouhoum', 'salif', 'sambou', 'sanogo', 'sekou', 'sékou',
  'siaka', 'sinaly', 'soumaila', 'tiemoko', 'tiémoko', 'toure', 'touré', 'vassiriki',
  'yaya', 'youssouf', 'zié', 'zie', 'gnanien', 'bamba', 'traore', 'traoré', 'fofana',
  'kone', 'koné', 'coulibaly', 'cisse', 'cissé', 'sangare', 'sangaré', 'diabate', 'diabaté'
]);

// African professional teacher & academic portraits (Warm, friendly, highly professional)
export const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1580894732484-934371427a1b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
];

export const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
];

/**
 * Determine gender ('F' | 'M' | 'UNKNOWN') from full name
 */
export function detectGenderFromName(fullName?: string): 'F' | 'M' {
  if (!fullName) return 'M';

  // Normalize and split into tokens
  const clean = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-']/g, ' ');

  const parts = clean.split(/[\s\-']+/).filter(Boolean);

  let femaleScore = 0;
  let maleScore = 0;

  for (const part of parts) {
    if (FEMALE_NAMES.has(part)) femaleScore += 2;
    if (MALE_NAMES.has(part)) maleScore += 2;

    // Suffix rules for francophone/African female names (e.g., -ine, -ette, -elle, -isse, -ou)
    if (part.endsWith('ine') || part.endsWith('ette') || part.endsWith('elle') || part.endsWith('issa')) {
      femaleScore += 1;
    }
  }

  // If tied or undetermined, default to Male or Female based on primary part
  if (femaleScore > maleScore) {
    return 'F';
  }
  return 'M';
}

/**
 * Get an adapted profile avatar photo tailored to candidate's name / gender
 */
export function getGenderAdaptedAvatar(fullName?: string, customAvatarUrl?: string | null): string {
  // If a valid uploaded custom avatar exists and is not the generic placeholder, return it
  if (customAvatarUrl && customAvatarUrl.trim() !== '' && !customAvatarUrl.includes('placeholder')) {
    return customAvatarUrl;
  }

  const gender = detectGenderFromName(fullName);
  const avatarList = gender === 'F' ? FEMALE_AVATARS : MALE_AVATARS;

  // Stable hashing based on name characters so the same candidate always receives the same photo
  const seed = (fullName || 'EDULINK').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(seed) % avatarList.length;

  return avatarList[index];
}
