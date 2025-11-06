/*
  # Anonymous Q&A Platform Schema

  ## Overview
  This migration creates the core tables for an anonymous student Q&A platform where students can post questions and answers without revealing their identity.

  ## New Tables
  
  ### `questions`
  - `id` (uuid, primary key) - Unique identifier for each question
  - `content` (text) - The question text content
  - `created_at` (timestamptz) - Timestamp when question was posted
  - `answer_count` (integer) - Number of answers for this question (default 0)
  
  ### `answers`
  - `id` (uuid, primary key) - Unique identifier for each answer
  - `question_id` (uuid, foreign key) - Reference to the parent question
  - `content` (text) - The answer text content
  - `created_at` (timestamptz) - Timestamp when answer was posted
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS enabled on both tables
  - Public read access for all questions and answers (anyone can view)
  - Public insert access for questions and answers (anonymous posting)
  - No update or delete permissions (preserve data integrity)
  
  ## Important Notes
  1. No user tracking - completely anonymous system
  2. Content is immutable after posting (no edits/deletes)
  3. Trigger automatically updates answer_count on questions table
*/

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  answer_count integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can post questions"
  ON questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view answers"
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can post answers"
  ON answers FOR INSERT
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION increment_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questions
  SET answer_count = answer_count + 1
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_answer_created
  AFTER INSERT ON answers
  FOR EACH ROW
  EXECUTE FUNCTION increment_answer_count();

CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC);