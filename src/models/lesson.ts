
// Lesson data structures for our application

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'lesson' | 'test' | 'video';
  duration: string;
  chapterId: string;
  courseId: string;
  orderIndex: number;
  completed?: boolean;
  current?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  level: string;
  duration: string;
  category: string;
  image: string;
  color: string;
  chapters: Chapter[];
  requirements?: string[];
  objectives?: string[];
}

export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface LessonData {
  id: string;
  title: string;
  content: string;
  course: string;
  courseId: string;
  duration: string;
  description: string;
  courseStructure: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: string;
      completed: boolean;
      current?: boolean;
    }[];
  }[];
  quiz?: Quiz[];
  videoUrl?: string;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastPosition?: string;
  completedAt?: string;
}

export interface UserCourse {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  startDate: string;
  lastAccessDate: string;
  status: 'active' | 'completed' | 'paused';
  course?: Course;
}

export interface UserCertificate {
  id: string;
  userId: string;
  courseId: string;
  certificateId: string;
  issueDate: string;
  courseName: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  lastNameChanged?: string;
  avatarUrl?: string; // Support for user avatar
  bio?: string;
  courses?: UserCourse[];
  certificates?: UserCertificate[];
}

// Add a new interface for avatar upload response
export interface AvatarUploadResponse {
  success: boolean;
  avatarUrl?: string;
  message?: string;
}

// Add a new interface for password verification response
export interface PasswordVerificationResponse {
  success: boolean;
  message?: string;
}

// Add a new interface for password change response
export interface PasswordChangeResponse {
  success: boolean;
  message?: string;
}
