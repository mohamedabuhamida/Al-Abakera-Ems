CREATE TABLE academic.stages (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    name_ar TEXT NOT NULL,

    name_en TEXT,

    display_order INTEGER NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(center_id, name_ar)
);

CREATE TABLE academic.grades (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    stage_id UUID NOT NULL
        REFERENCES academic.stages(id)
        ON DELETE CASCADE,

    name_ar TEXT NOT NULL,

    name_en TEXT,

    display_order INTEGER NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academic.parents (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    full_name TEXT NOT NULL,

    phone TEXT,

    whatsapp TEXT,

    email CITEXT,

    occupation TEXT,

    address TEXT,

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academic.students (

    profile_id UUID PRIMARY KEY
        REFERENCES identity.profiles(id)
        ON DELETE CASCADE,

    center_id UUID NOT NULL
        REFERENCES core.centers(id),

    student_code TEXT UNIQUE,

    grade_id UUID
        REFERENCES academic.grades(id),

    date_of_birth DATE,

    gender gender_type,

    national_id TEXT,

    school TEXT,

    address TEXT,

    status student_status DEFAULT 'active',

    notes TEXT,

    registration_date DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academic.student_parents (

    student_id UUID
        REFERENCES academic.students(profile_id)
        ON DELETE CASCADE,

    parent_id UUID
        REFERENCES academic.parents(id)
        ON DELETE CASCADE,

    relationship TEXT,

    PRIMARY KEY(student_id,parent_id)
);

CREATE TABLE academic.teachers (

    profile_id UUID PRIMARY KEY
        REFERENCES identity.profiles(id)
        ON DELETE CASCADE,

    center_id UUID NOT NULL
        REFERENCES core.centers(id),

    qualification TEXT,

    salary_type salary_type,

    salary_value NUMERIC(12,2),

    status teacher_status DEFAULT 'active',

    bio TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academic.subjects (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id),

    name_ar TEXT NOT NULL,

    name_en TEXT,

    code TEXT,

    color TEXT,

    description TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academic.teacher_subjects (

    teacher_id UUID
        REFERENCES academic.teachers(profile_id)
        ON DELETE CASCADE,

    subject_id UUID
        REFERENCES academic.subjects(id)
        ON DELETE CASCADE,

    PRIMARY KEY(teacher_id,subject_id)
);

CREATE TABLE academic.classrooms (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id),

    name TEXT NOT NULL,

    capacity INTEGER,

    floor INTEGER,

    notes TEXT
);

CREATE TABLE academic.groups (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    subject_id UUID NOT NULL
        REFERENCES academic.subjects(id),

    grade_id UUID NOT NULL
        REFERENCES academic.grades(id),

    name TEXT NOT NULL,

    description TEXT,

    capacity INTEGER NOT NULL DEFAULT 30,

    monthly_price NUMERIC(12,2) NOT NULL,

    status group_status NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE academic.group_sessions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL
        REFERENCES academic.groups(id)
        ON DELETE CASCADE,

    teacher_id UUID NOT NULL
        REFERENCES academic.teachers(profile_id),

    classroom_id UUID
        REFERENCES academic.classrooms(id),

    weekday SMALLINT NOT NULL
        CHECK (weekday BETWEEN 0 AND 6),

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (start_time < end_time)
);

CREATE TABLE academic.lessons (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL
        REFERENCES academic.groups(id)
        ON DELETE CASCADE,

    teacher_id UUID
        REFERENCES academic.teachers(profile_id),

    title TEXT NOT NULL,

    description TEXT,

    lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,

    starts_at TIMESTAMPTZ,

    ends_at TIMESTAMPTZ,

    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (ends_at IS NULL OR starts_at IS NULL OR starts_at < ends_at)
);

CREATE TABLE academic.lesson_materials (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lesson_id UUID NOT NULL
        REFERENCES academic.lessons(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    material_type material_type NOT NULL DEFAULT 'file',

    content TEXT,

    file_url TEXT,

    display_order INTEGER NOT NULL DEFAULT 0,

    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE academic.enrollments (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID
        REFERENCES academic.students(profile_id)
        ON DELETE CASCADE,

    group_id UUID
        REFERENCES academic.groups(id)
        ON DELETE CASCADE,

    status enrollment_status DEFAULT 'active',

    enrolled_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(student_id,group_id)
);

CREATE TABLE academic.attendance (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lesson_id UUID NOT NULL
        REFERENCES academic.lessons(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL
        REFERENCES academic.students(profile_id)
        ON DELETE CASCADE,

    status attendance_status NOT NULL DEFAULT 'present',

    marked_by UUID
        REFERENCES identity.profiles(id),

    marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    notes TEXT,

    UNIQUE(lesson_id, student_id)
);

CREATE TABLE academic.exams (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    group_id UUID
        REFERENCES academic.groups(id)
        ON DELETE CASCADE,

    subject_id UUID
        REFERENCES academic.subjects(id),

    teacher_id UUID
        REFERENCES academic.teachers(profile_id),

    title TEXT NOT NULL,

    exam_type exam_type NOT NULL DEFAULT 'quiz',

    total_marks NUMERIC(8,2) NOT NULL DEFAULT 0,

    pass_marks NUMERIC(8,2),

    starts_at TIMESTAMPTZ,

    ends_at TIMESTAMPTZ,

    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (total_marks >= 0),

    CHECK (pass_marks IS NULL OR pass_marks >= 0),

    CHECK (ends_at IS NULL OR starts_at IS NULL OR starts_at < ends_at)
);

CREATE TABLE academic.exam_questions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    exam_id UUID NOT NULL
        REFERENCES academic.exams(id)
        ON DELETE CASCADE,

    question_text TEXT NOT NULL,

    question_type TEXT NOT NULL DEFAULT 'written',

    options JSONB NOT NULL DEFAULT '[]'::jsonb,

    correct_answer TEXT,

    marks NUMERIC(8,2) NOT NULL DEFAULT 0,

    display_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (marks >= 0)
);

CREATE TABLE academic.exam_results (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    exam_id UUID NOT NULL
        REFERENCES academic.exams(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL
        REFERENCES academic.students(profile_id)
        ON DELETE CASCADE,

    score NUMERIC(8,2) NOT NULL DEFAULT 0,

    feedback TEXT,

    graded_by UUID
        REFERENCES identity.profiles(id),

    graded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(exam_id, student_id),

    CHECK (score >= 0)
);

CREATE TABLE academic.assignments (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    group_id UUID NOT NULL
        REFERENCES academic.groups(id)
        ON DELETE CASCADE,

    teacher_id UUID
        REFERENCES academic.teachers(profile_id),

    title TEXT NOT NULL,

    description TEXT,

    attachment_url TEXT,

    total_marks NUMERIC(8,2) NOT NULL DEFAULT 0,

    status assignment_status NOT NULL DEFAULT 'draft',

    due_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (total_marks >= 0)
);

CREATE TABLE academic.assignment_submissions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assignment_id UUID NOT NULL
        REFERENCES academic.assignments(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL
        REFERENCES academic.students(profile_id)
        ON DELETE CASCADE,

    answer_text TEXT,

    attachment_url TEXT,

    status submission_status NOT NULL DEFAULT 'not_submitted',

    submitted_at TIMESTAMPTZ,

    score NUMERIC(8,2),

    feedback TEXT,

    graded_by UUID
        REFERENCES identity.profiles(id),

    graded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(assignment_id, student_id),

    CHECK (score IS NULL OR score >= 0)
);

