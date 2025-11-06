import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnswerFormProps {
  questionId: string;
  onAnswerPosted: () => void;
}

export function AnswerForm({ questionId, onAnswerPosted }: AnswerFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter an answer');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const { error: submitError } = await supabase
      .from('answers')
      .insert([{ question_id: questionId, content: content.trim() }]);

    if (submitError) {
      setError('Failed to post answer. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setContent('');
    setIsSubmitting(false);
    onAnswerPosted();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your answer anonymously..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
        rows={3}
        disabled={isSubmitting}
      />

      {error && (
        <p className="text-red-600 text-xs">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 text-sm transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        {isSubmitting ? 'Posting...' : 'Post Answer'}
      </button>
    </form>
  );
}
