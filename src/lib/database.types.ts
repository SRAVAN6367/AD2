export type Database = {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          content: string;
          created_at: string;
          answer_count: number;
        };
        Insert: {
          id?: string;
          content: string;
          created_at?: string;
          answer_count?: number;
        };
        Update: {
          id?: string;
          content?: string;
          created_at?: string;
          answer_count?: number;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
};
