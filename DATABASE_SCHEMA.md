# CodeForge Database Schema

## Overview
Production-ready database schema for the CodeForge coding assignment platform.

## Tables

### 1. users
Primary table for all platform users (teachers and students).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('teacher', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2. classes
Classes created by teachers.

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  visibility ENUM('public', 'private') DEFAULT 'public',
  join_code VARCHAR(8) UNIQUE NOT NULL,
  max_students INTEGER CHECK (max_students > 0 AND max_students <= 10000),
  is_active BOOLEAN DEFAULT true,
  join_method ENUM('code', 'approval', 'invitation') DEFAULT 'code',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE UNIQUE INDEX idx_classes_join_code ON classes(join_code);
CREATE INDEX idx_classes_visibility_active ON classes(visibility, is_active);
CREATE INDEX idx_classes_created_at ON classes(created_at);
CREATE INDEX idx_classes_name ON classes(name);
```

### 3. enrollments
Junction table for class membership (students in classes).

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  status ENUM('active', 'pending', 'suspended', 'withdrawn') DEFAULT 'active',
  enrolled_at TIMESTAMP DEFAULT NOW(),
  enrolled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  withdrawn_at TIMESTAMP,
  withdrawn_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Ensure one enrollment per student per class
  UNIQUE(student_id, class_id)
);

-- Indexes
CREATE UNIQUE INDEX idx_enrollments_student_class ON enrollments(student_id, class_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_enrolled_at ON enrollments(enrolled_at);
```

### 4. assignments
Assignments created by teachers within classes.

```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  problem_description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_created_at ON assignments(created_at);
CREATE INDEX idx_assignments_title ON assignments(title);
```

### 5. submissions
Student code submissions for assignments.

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  
  -- One submission per student per assignment (can be updated)
  UNIQUE(assignment_id, student_id)
);

-- Indexes
CREATE UNIQUE INDEX idx_submissions_assignment_student ON submissions(assignment_id, student_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
```

## Relationships

### One-to-Many Relationships
- `users` → `classes` (teacher creates multiple classes)
- `users` → `enrollments` (student has multiple enrollments)
- `users` → `submissions` (student has multiple submissions)
- `classes` → `assignments` (class has multiple assignments)
- `classes` → `enrollments` (class has multiple students)
- `assignments` → `submissions` (assignment has multiple submissions)

### Many-to-Many Relationships
- `users` ↔ `classes` through `enrollments` (students can join multiple classes)

## Business Rules

### Class Creation
1. Only teachers can create classes
2. Each class gets a unique 8-character join code
3. Join codes are alphanumeric (A-Z, 0-9)
4. Classes can have capacity limits (max_students)

### Class Enrollment
1. Only students can join classes
2. Students cannot join the same class twice
3. Students cannot join classes at capacity
4. Join methods: code, approval, invitation

### Assignment Creation
1. Only teachers can create assignments
2. Teachers can only create assignments in their own classes
3. Assignments belong to exactly one class

### Submissions
1. Only enrolled students can submit assignments
2. Students can only submit to assignments in classes they're enrolled in
3. One submission per student per assignment (can be updated)

## Security Constraints

### Authentication
- All API endpoints require valid JWT token
- Tokens contain user ID and role

### Authorization
- Teachers can only manage their own classes and assignments
- Students can only join classes and submit to assignments they have access to
- Role-based access control enforced at API level

### Data Integrity
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate enrollments
- Check constraints validate data ranges
- Cascade deletes maintain consistency

## Performance Considerations

### Indexes
- All foreign keys are indexed
- Unique constraints have implicit indexes
- Query-specific indexes for common operations

### Query Optimization
- Use joins instead of N+1 queries
- Paginate large result sets
- Use appropriate WHERE clauses with indexed columns

## Scalability Features

### UUID Primary Keys
- Globally unique identifiers
- Support for distributed systems
- No auto-increment bottlenecks

### Soft Deletes
- Classes can be deactivated (is_active = false)
- Enrollments can be withdrawn (status = 'withdrawn')
- Maintains audit trail

### Audit Trail
- All tables have created_at/updated_at timestamps
- Enrollment changes tracked with enrolled_by/withdrawn_by
- Supports compliance and debugging

## Example Queries

### Get Teacher's Classes with Statistics
```sql
SELECT 
  c.*,
  COUNT(e.id) as current_students,
  COUNT(a.id) as assignment_count
FROM classes c
LEFT JOIN enrollments e ON c.id = e.class_id AND e.status = 'active'
LEFT JOIN assignments a ON c.id = a.class_id
WHERE c.teacher_id = $1 AND c.is_active = true
GROUP BY c.id
ORDER BY c.created_at DESC;
```

### Get Student's Enrolled Classes
```sql
SELECT 
  c.*,
  u.name as teacher_name,
  e.enrolled_at
FROM enrollments e
JOIN classes c ON e.class_id = c.id
JOIN users u ON c.teacher_id = u.id
WHERE e.student_id = $1 AND e.status = 'active' AND c.is_active = true
ORDER BY e.enrolled_at DESC;
```

### Get Class Assignments for Student
```sql
SELECT a.*
FROM assignments a
JOIN classes c ON a.class_id = c.id
JOIN enrollments e ON c.id = e.class_id
WHERE e.student_id = $1 AND e.status = 'active' AND c.id = $2
ORDER BY a.created_at DESC;
```