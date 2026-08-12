export const APP_NAME = 'Le Major';

export const ROUTES = {
  // Public
  home: '/',
  connexion: '/connexion',
  inscription: '/inscription',
  activation: '/activation',

  // Student
  accueil: '/accueil',
  matieres: '/matieres',
  matiere: (slug: string) => `/matieres/${slug}`,
  chapitre: (matiereSlug: string, chapitreSlug: string) =>
    `/matieres/${matiereSlug}/${chapitreSlug}`,
  cours: (matiereSlug: string, chapitreSlug: string, id: string) =>
    `/matieres/${matiereSlug}/${chapitreSlug}/cours/${id}`,
  exercice: (matiereSlug: string, id: string) =>
    `/matieres/${matiereSlug}/exercices/${id}`,
  serie: (matiereSlug: string, id: string) =>
    `/matieres/${matiereSlug}/series/${id}`,
  examen: (matiereSlug: string, id: string) =>
    `/matieres/${matiereSlug}/examens/${id}`,
  modeExamen: '/mode-examen',
  modeExamenSession: (id: string) => `/mode-examen/session/${id}`,
  modeExamenResultats: (id: string) => `/mode-examen/resultats/${id}`,
  progression: '/progression',
  profil: '/profil',

  // Admin
  admin: '/admin',
  adminStructure: '/admin/structure',
  adminContenus: '/admin/contenus',
  adminContenuNouveau: '/admin/contenus/nouveau',
  adminContenuModifier: (id: string) => `/admin/contenus/${id}/modifier`,
  adminRessources: '/admin/ressources',
  adminExercices: '/admin/exercices',
  adminSeries: '/admin/series',
  adminExamens: '/admin/examens',
  adminPacks: '/admin/packs',
  adminCodes: '/admin/codes',
  adminEtudiants: '/admin/etudiants',
  adminStatistiques: '/admin/statistiques',
  adminParametres: '/admin/parametres',
} as const;

export const STUDENT_NAV = [
  { label: 'Accueil', href: ROUTES.accueil },
  { label: 'Matières', href: ROUTES.matieres },
  { label: 'Mode Examen', href: ROUTES.modeExamen },
  { label: 'Progression', href: ROUTES.progression },
] as const;

export const ADMIN_NAV = [
  { section: 'Gestion', items: [
    { label: 'Tableau de bord', href: ROUTES.admin, icon: 'LayoutDashboard' },
    { label: 'Structure', href: ROUTES.adminStructure, icon: 'Building2' },
    { label: 'Résumés', href: ROUTES.adminContenus, icon: 'FileText' },
    { label: 'Ressources', href: ROUTES.adminRessources, icon: 'FolderOpen' },
    { label: 'Exercices', href: ROUTES.adminExercices, icon: 'PenTool' },
    { label: 'Séries', href: ROUTES.adminSeries, icon: 'Layers' },
    { label: 'Examens', href: ROUTES.adminExamens, icon: 'ClipboardList' },
  ]},
  { section: 'Accès', items: [
    { label: 'Packs', href: ROUTES.adminPacks, icon: 'Package' },
    { label: 'Codes', href: ROUTES.adminCodes, icon: 'Key' },
    { label: 'Étudiants', href: ROUTES.adminEtudiants, icon: 'Users' },
  ]},
  { section: 'Système', items: [
    { label: 'Statistiques', href: ROUTES.adminStatistiques, icon: 'BarChart3' },
    { label: 'Paramètres', href: ROUTES.adminParametres, icon: 'Settings' },
  ]},
] as const;

export const DIFFICULTY_LABELS = {
  easy: 'Facile',
  intermediate: 'Intermédiaire',
  hard: 'Difficile',
} as const;

export const CONTENT_STATUS_LABELS = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
} as const;
