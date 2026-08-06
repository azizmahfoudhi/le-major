-- Le Major - Database Schema
-- Run this in the Supabase SQL Editor

-- ==============================================================================
-- 1. ENUMS
-- ==============================================================================
CREATE TYPE public.user_role AS ENUM ('student', 'admin');
CREATE TYPE public.content_type AS ENUM ('lesson', 'summary', 'resource');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'intermediate', 'hard');
CREATE TYPE public.activation_status AS ENUM ('available', 'activated', 'expired', 'revoked');
CREATE TYPE public.exam_status AS ENUM ('in_progress', 'completed', 'evaluated');

-- ==============================================================================
-- 2. UTILITY FUNCTIONS (Trigger Functions)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to get user role
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS public.user_role AS $$
DECLARE
    user_role public.user_role;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. TABLES
-- ==============================================================================

-- 3.1. Universities
CREATE TABLE IF NOT EXISTS public.universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2. Formations (Programs of study)
CREATE TABLE IF NOT EXISTS public.formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(university_id, slug)
);

-- 3.3. Levels
CREATE TABLE IF NOT EXISTS public.levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    year_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(formation_id, slug)
);

-- 3.4. Editions (Academic Years)
CREATE TABLE IF NOT EXISTS public.editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5. Semesters
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id UUID NOT NULL REFERENCES public.editions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(edition_id, order_index)
);

-- 3.6. Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(semester_id, slug)
);

-- 3.7. Chapters
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subject_id, slug)
);

-- 3.8. Contents
CREATE TABLE IF NOT EXISTS public.contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type public.content_type NOT NULL,
    status public.content_status NOT NULL DEFAULT 'draft',
    body TEXT, -- Markdown or rich text
    file_url TEXT, -- For PDFs or resources
    video_url TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9. Exercises
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    difficulty public.difficulty_level NOT NULL DEFAULT 'intermediate',
    statement TEXT NOT NULL,
    solution TEXT NOT NULL,
    status public.content_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10. Series
CREATE TABLE IF NOT EXISTS public.series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status public.content_status NOT NULL DEFAULT 'draft',
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.11. Series Exercises
CREATE TABLE IF NOT EXISTS public.series_exercises (
    series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    PRIMARY KEY (series_id, exercise_id)
);

-- 3.12. Exams
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    status public.content_status NOT NULL DEFAULT 'draft',
    is_mock_exam BOOLEAN NOT NULL DEFAULT true,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.13. Exam Chapters (Link between exams and covered chapters)
CREATE TABLE IF NOT EXISTS public.exam_chapters (
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    PRIMARY KEY (exam_id, chapter_id)
);

-- 3.14. Packages
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_tnd NUMERIC(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.15. Package Subjects
CREATE TABLE IF NOT EXISTS public.package_subjects (
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, subject_id)
);

-- 3.16. Activation Codes (Part 1, without profiles FK yet)
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,
    status public.activation_status NOT NULL DEFAULT 'available',
    created_by UUID NOT NULL, -- will reference profiles
    activated_by UUID, -- will reference profiles
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.17. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'student',
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints to activation_codes for users now that profiles exist
ALTER TABLE public.activation_codes
    ADD CONSTRAINT activation_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
    ADD CONSTRAINT activation_codes_activated_by_fkey FOREIGN KEY (activated_by) REFERENCES public.profiles(id);

-- 3.18. Student Activations
CREATE TABLE IF NOT EXISTS public.student_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,
    activation_code_id UUID REFERENCES public.activation_codes(id),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.19. Chapter Progress
CREATE TABLE IF NOT EXISTS public.chapter_progress (
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, chapter_id)
);

-- 3.20. Exercise Progress
CREATE TABLE IF NOT EXISTS public.exercise_progress (
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    status public.exam_status NOT NULL DEFAULT 'in_progress',
    score NUMERIC(5, 2),
    last_attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, exercise_id)
);

-- 3.21. Exam Attempts
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    status public.exam_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    score NUMERIC(5, 2),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.22. Exam Question Evaluations
CREATE TABLE IF NOT EXISTS public.exam_question_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    score NUMERIC(5, 2),
    student_answer TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(attempt_id, question_number)
);

-- ==============================================================================
-- 4. TRIGGERS
-- ==============================================================================

-- Apply handle_updated_at to all tables with updated_at
CREATE TRIGGER set_updated_at_universities BEFORE UPDATE ON public.universities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_formations BEFORE UPDATE ON public.formations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_levels BEFORE UPDATE ON public.levels FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_editions BEFORE UPDATE ON public.editions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_semesters BEFORE UPDATE ON public.semesters FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_subjects BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_chapters BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_contents BEFORE UPDATE ON public.contents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_exercises BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_series BEFORE UPDATE ON public.series FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_exams BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_packages BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_activation_codes BEFORE UPDATE ON public.activation_codes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_student_activations BEFORE UPDATE ON public.student_activations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_chapter_progress BEFORE UPDATE ON public.chapter_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_exercise_progress BEFORE UPDATE ON public.exercise_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_exam_attempts BEFORE UPDATE ON public.exam_attempts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_exam_question_evaluations BEFORE UPDATE ON public.exam_question_evaluations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        'student'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. ADVANCED FUNCTIONS & RPCs
-- ==============================================================================

-- Check if user has access to a subject
CREATE OR REPLACE FUNCTION public.has_subject_access(p_user_id UUID, p_subject_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_accessible BOOLEAN;
BEGIN
    IF public.is_admin() THEN
        RETURN true;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM public.student_activations sa
        JOIN public.package_subjects ps ON ps.package_id = sa.package_id
        WHERE sa.student_id = p_user_id
          AND ps.subject_id = p_subject_id
          AND sa.is_active = true
          AND sa.start_date <= NOW()
          AND sa.end_date >= NOW()
    ) INTO is_accessible;

    RETURN is_accessible;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to a chapter
CREATE OR REPLACE FUNCTION public.has_chapter_access(p_user_id UUID, p_chapter_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_accessible BOOLEAN;
    v_subject_id UUID;
    v_is_free BOOLEAN;
BEGIN
    IF public.is_admin() THEN
        RETURN true;
    END IF;

    SELECT subject_id, is_free INTO v_subject_id, v_is_free
    FROM public.chapters WHERE id = p_chapter_id;
    
    IF v_is_free THEN
        RETURN true;
    END IF;

    RETURN public.has_subject_access(p_user_id, v_subject_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redeem activation code
CREATE OR REPLACE FUNCTION public.redeem_activation_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
    v_code_record RECORD;
    v_package_duration INTEGER;
    v_user_id UUID;
    v_activation_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Find and lock the code record
    SELECT ac.*, p.duration_days 
    INTO v_code_record
    FROM public.activation_codes ac
    JOIN public.packages p ON p.id = ac.package_id
    WHERE ac.code = p_code
    FOR UPDATE OF ac;

    IF v_code_record IS NULL THEN
        RAISE EXCEPTION 'Invalid activation code';
    END IF;

    IF v_code_record.status != 'available' THEN
        RAISE EXCEPTION 'Code is already %', v_code_record.status;
    END IF;

    IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW() THEN
        UPDATE public.activation_codes SET status = 'expired' WHERE id = v_code_record.id;
        RAISE EXCEPTION 'Code has expired';
    END IF;

    -- Activate the code
    UPDATE public.activation_codes
    SET status = 'activated',
        activated_by = v_user_id,
        activated_at = NOW()
    WHERE id = v_code_record.id;

    -- Create student activation
    INSERT INTO public.student_activations (
        student_id,
        package_id,
        activation_code_id,
        start_date,
        end_date,
        is_active
    ) VALUES (
        v_user_id,
        v_code_record.package_id,
        v_code_record.id,
        NOW(),
        NOW() + (v_code_record.duration_days || ' days')::INTERVAL,
        true
    ) RETURNING id INTO v_activation_id;

    RETURN json_build_object(
        'success', true,
        'activation_id', v_activation_id,
        'package_id', v_code_record.package_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. INDEXES
-- ==============================================================================
-- Foreign Key Indexes
CREATE INDEX idx_formations_university_id ON public.formations(university_id);
CREATE INDEX idx_levels_formation_id ON public.levels(formation_id);
CREATE INDEX idx_editions_level_id ON public.editions(level_id);
CREATE INDEX idx_semesters_edition_id ON public.semesters(edition_id);
CREATE INDEX idx_subjects_semester_id ON public.subjects(semester_id);
CREATE INDEX idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX idx_contents_chapter_id ON public.contents(chapter_id);
CREATE INDEX idx_exercises_chapter_id ON public.exercises(chapter_id);
CREATE INDEX idx_series_chapter_id ON public.series(chapter_id);
CREATE INDEX idx_exams_subject_id ON public.exams(subject_id);
CREATE INDEX idx_activation_codes_package_id ON public.activation_codes(package_id);
CREATE INDEX idx_student_activations_student_id ON public.student_activations(student_id);
CREATE INDEX idx_student_activations_package_id ON public.student_activations(package_id);

-- Partial and composite indexes
CREATE INDEX idx_active_student_activations ON public.student_activations(student_id, package_id) WHERE is_active = true;
CREATE INDEX idx_published_contents ON public.contents(chapter_id) WHERE status = 'published';
CREATE INDEX idx_published_exercises ON public.exercises(chapter_id) WHERE status = 'published';


-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_question_evaluations ENABLE ROW LEVEL SECURITY;

-- 7.1. Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

-- 7.2. Public Read / Admin All (Universities, Formations, Levels, Editions, Semesters)
CREATE POLICY "Public read access for universities" ON public.universities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all access for universities" ON public.universities FOR ALL USING (public.is_admin());

CREATE POLICY "Public read access for formations" ON public.formations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all access for formations" ON public.formations FOR ALL USING (public.is_admin());

CREATE POLICY "Public read access for levels" ON public.levels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all access for levels" ON public.levels FOR ALL USING (public.is_admin());

CREATE POLICY "Public read access for editions" ON public.editions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all access for editions" ON public.editions FOR ALL USING (public.is_admin());

CREATE POLICY "Public read access for semesters" ON public.semesters FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all access for semesters" ON public.semesters FOR ALL USING (public.is_admin());

-- 7.3. Subjects & Chapters (Admin all, Students read accessible)
CREATE POLICY "Admin all access for subjects" ON public.subjects FOR ALL USING (public.is_admin());
CREATE POLICY "Students read accessible subjects" ON public.subjects FOR SELECT USING (
    public.has_subject_access(auth.uid(), id)
);

CREATE POLICY "Admin all access for chapters" ON public.chapters FOR ALL USING (public.is_admin());
CREATE POLICY "Students read accessible chapters" ON public.chapters FOR SELECT USING (
    public.has_chapter_access(auth.uid(), id)
);

-- 7.4. Contents, Exercises, Series, Exams (Admin all, Students read published accessible)
CREATE POLICY "Admin all access for contents" ON public.contents FOR ALL USING (public.is_admin());
CREATE POLICY "Students read published contents" ON public.contents FOR SELECT USING (
    status = 'published' AND public.has_chapter_access(auth.uid(), chapter_id)
);

CREATE POLICY "Admin all access for exercises" ON public.exercises FOR ALL USING (public.is_admin());
CREATE POLICY "Students read published exercises" ON public.exercises FOR SELECT USING (
    status = 'published' AND public.has_chapter_access(auth.uid(), chapter_id)
);

CREATE POLICY "Admin all access for series" ON public.series FOR ALL USING (public.is_admin());
CREATE POLICY "Students read published series" ON public.series FOR SELECT USING (
    status = 'published' AND public.has_chapter_access(auth.uid(), chapter_id)
);

CREATE POLICY "Admin all access for series_exercises" ON public.series_exercises FOR ALL USING (public.is_admin());
CREATE POLICY "Students read accessible series_exercises" ON public.series_exercises FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.status = 'published' AND public.has_chapter_access(auth.uid(), s.chapter_id))
);

CREATE POLICY "Admin all access for exams" ON public.exams FOR ALL USING (public.is_admin());
CREATE POLICY "Students read published exams" ON public.exams FOR SELECT USING (
    status = 'published' AND public.has_subject_access(auth.uid(), subject_id)
);

CREATE POLICY "Admin all access for exam_chapters" ON public.exam_chapters FOR ALL USING (public.is_admin());
CREATE POLICY "Students read exam_chapters" ON public.exam_chapters FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND e.status = 'published' AND public.has_subject_access(auth.uid(), e.subject_id))
);

-- 7.5. Admin only data (Packages, Codes)
CREATE POLICY "Admin all access for packages" ON public.packages FOR ALL USING (public.is_admin());
CREATE POLICY "Admin all access for package_subjects" ON public.package_subjects FOR ALL USING (public.is_admin());
CREATE POLICY "Public read for packages" ON public.packages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read for package_subjects" ON public.package_subjects FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all access for activation_codes" ON public.activation_codes FOR ALL USING (public.is_admin());

-- 7.6. Student Activations
CREATE POLICY "Admin all access for student_activations" ON public.student_activations FOR ALL USING (public.is_admin());
CREATE POLICY "Students view own activations" ON public.student_activations FOR SELECT USING (student_id = auth.uid());

-- 7.7. Progress & Attempts
CREATE POLICY "Users manage own chapter_progress" ON public.chapter_progress FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Users manage own exercise_progress" ON public.exercise_progress FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Users manage own exam_attempts" ON public.exam_attempts FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Admin read exam_attempts" ON public.exam_attempts FOR SELECT USING (public.is_admin());
CREATE POLICY "Users manage own exam_question_evaluations" ON public.exam_question_evaluations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.exam_attempts ea WHERE ea.id = attempt_id AND ea.student_id = auth.uid())
);
CREATE POLICY "Admin read exam_question_evaluations" ON public.exam_question_evaluations FOR SELECT USING (public.is_admin());
