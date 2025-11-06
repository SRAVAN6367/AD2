import { useState } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QuestionFormProps {
  onQuestionPosted: () => void;
}

export function QuestionForm({ onQuestionPosted }: QuestionFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const { error: submitError } = await supabase
      .from('questions')
      .insert([{ content: content.trim() }]);

    if (submitError) {
      setError('Failed to post question. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setContent('');
    setIsSubmitting(false);
    onQuestionPosted();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ask your question anonymously..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? 'Posting...' : 'Post Question'}
      </button>
    </form>
  );
}
