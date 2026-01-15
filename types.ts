
export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: 'Hiragana' | 'Katakana' | 'Kanji' | 'Grammar' | 'Vocabulary';
  level: 'Basic' | 'Intermediate' | 'Advanced';
  stars: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  romaji?: string;
  example?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppRoute {
  HOME = 'home',
  LESSONS = 'lessons',
  FLASHCARDS = 'flashcards',
  TUTOR = 'tutor',
  PROGRESS = 'progress'
}
