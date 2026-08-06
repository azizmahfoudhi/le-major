-- Le Major - Seed Data for Development
-- Insert seed data for IHEC Carthage -> 1ère LSG

-- 1. University
INSERT INTO public.universities (id, name, slug) VALUES 
('11111111-1111-1111-1111-111111111111', 'IHEC Carthage', 'ihec-carthage')
ON CONFLICT (slug) DO NOTHING;

-- 2. Formation
INSERT INTO public.formations (id, university_id, name, slug) VALUES 
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '1ère LSG (Licence Sciences de Gestion)', '1ere-lsg')
ON CONFLICT (university_id, slug) DO NOTHING;

-- 3. Level
INSERT INTO public.levels (id, formation_id, name, slug, year_number) VALUES 
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'L1', 'l1', 1)
ON CONFLICT (formation_id, slug) DO NOTHING;

-- 4. Edition
INSERT INTO public.editions (id, level_id, name, start_date, end_date, is_active) VALUES 
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '2025-2026', '2025-09-01', '2026-06-30', true)
ON CONFLICT DO NOTHING;

-- 5. Semester 1
INSERT INTO public.semesters (id, edition_id, name, order_index) VALUES 
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Semestre 1', 1)
ON CONFLICT (edition_id, order_index) DO NOTHING;

-- 6. Subjects for Semester 1
INSERT INTO public.subjects (id, semester_id, name, slug, icon_name) VALUES 
('66666666-0001-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'Principes de Gestion', 'principes-de-gestion', 'briefcase'),
('66666666-0002-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'Introduction à l''Économie', 'introduction-economie', 'trending-up'),
('66666666-0003-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'Comptabilité Financière I', 'comptabilite-financiere-1', 'calculator'),
('66666666-0004-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'Mathématiques I', 'mathematiques-1', 'functions'),
('66666666-0005-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'Anglais des Affaires', 'anglais-affaires', 'language'),
('66666666-0006-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'Informatique I', 'informatique-1', 'monitor')
ON CONFLICT (semester_id, slug) DO NOTHING;

-- 7. Chapters (2 for each subject)
-- Principes de Gestion
INSERT INTO public.chapters (id, subject_id, title, slug, order_index, is_free) VALUES 
('77777777-0101-7777-7777-777777777777', '66666666-0001-6666-6666-666666666666', 'L''entreprise et son environnement', 'entreprise-environnement', 1, true),
('77777777-0102-7777-7777-777777777777', '66666666-0001-6666-6666-666666666666', 'Les fonctions de l''entreprise', 'fonctions-entreprise', 2, false);

-- Introduction à l'Économie
INSERT INTO public.chapters (id, subject_id, title, slug, order_index, is_free) VALUES 
('77777777-0201-7777-7777-777777777777', '66666666-0002-6666-6666-666666666666', 'Les grands courants de la pensée économique', 'grands-courants', 1, true),
('77777777-0202-7777-7777-777777777777', '66666666-0002-6666-6666-666666666666', 'Le circuit économique', 'circuit-economique', 2, false);

-- Comptabilité Financière I
INSERT INTO public.chapters (id, subject_id, title, slug, order_index, is_free) VALUES 
('77777777-0301-7777-7777-777777777777', '66666666-0003-6666-6666-666666666666', 'Le Bilan', 'le-bilan', 1, true),
('77777777-0302-7777-7777-777777777777', '66666666-0003-6666-6666-666666666666', 'L''État de Résultat', 'etat-resultat', 2, false);

-- Mathématiques I
INSERT INTO public.chapters (id, subject_id, title, slug, order_index, is_free) VALUES 
('77777777-0401-7777-7777-777777777777', '66666666-0004-6666-6666-666666666666', 'Fonctions à une variable réelle', 'fonctions-une-variable', 1, true),
('77777777-0402-7777-7777-777777777777', '66666666-0004-6666-6666-666666666666', 'Calcul matriciel', 'calcul-matriciel', 2, false);

-- Anglais des Affaires
INSERT INTO public.chapters (id, subject_id, title, slug, order_index, is_free) VALUES 
('77777777-0501-7777-7777-777777777777', '66666666-0005-6666-6666-666666666666', 'Business Etiquette', 'business-etiquette', 1, true),
('77777777-0502-7777-7777-777777777777', '66666666-0005-6666-6666-666666666666', 'Company Structure', 'company-structure', 2, false);

-- Informatique I
INSERT INTO public.chapters (id, subject_id, title, slug, order_index, is_free) VALUES 
('77777777-0601-7777-7777-777777777777', '66666666-0006-6666-6666-666666666666', 'Architecture des Ordinateurs', 'architecture-ordinateurs', 1, true),
('77777777-0602-7777-7777-777777777777', '66666666-0006-6666-6666-666666666666', 'Introduction à l''Algorithmique', 'introduction-algorithmique', 2, false);

-- 8. Sample Package linking all subjects
INSERT INTO public.packages (id, name, description, price_tnd, duration_days) VALUES 
('88888888-8888-8888-8888-888888888888', 'Pack Semestre 1 - Complet', 'Accès complet à toutes les matières du premier semestre.', 99.00, 180)
ON CONFLICT DO NOTHING;

-- Link subjects to package
INSERT INTO public.package_subjects (package_id, subject_id) VALUES 
('88888888-8888-8888-8888-888888888888', '66666666-0001-6666-6666-666666666666'),
('88888888-8888-8888-8888-888888888888', '66666666-0002-6666-6666-666666666666'),
('88888888-8888-8888-8888-888888888888', '66666666-0003-6666-6666-666666666666'),
('88888888-8888-8888-8888-888888888888', '66666666-0004-6666-6666-666666666666'),
('88888888-8888-8888-8888-888888888888', '66666666-0005-6666-6666-666666666666'),
('88888888-8888-8888-8888-888888888888', '66666666-0006-6666-6666-666666666666')
ON CONFLICT DO NOTHING;

-- 9. Sample Activation Codes
/*
NOTE: To create activation codes, you must first create an admin user through Supabase Auth,
then update their role to 'admin' in the `profiles` table.
Example manual SQL after creating an admin user:

UPDATE public.profiles SET role = 'admin' WHERE id = 'your-admin-user-uuid';

INSERT INTO public.activation_codes (code, package_id, created_by) VALUES 
('LM-TEST01', '88888888-8888-8888-8888-888888888888', 'your-admin-user-uuid'),
('LM-TEST02', '88888888-8888-8888-8888-888888888888', 'your-admin-user-uuid');
*/
