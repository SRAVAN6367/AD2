import { useState, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AnswerForm } from './AnswerForm';
import type { Database } from '../lib/database.types';

type Question = Database['public']['Tables']['questions']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const loadAnswers = async () => {
    setIsLoadingAnswers(true);
    const { data } = await supabase
      .from('answers')
      .select('*')
      .eq('question_id', question.id)
      .order('created_at', { ascending: false });

    if (data) {
      setAnswers(data);
    }
    setIsLoadingAnswers(false);
  };

  useEffect(() => {
    if (isExpanded && answers.length === 0) {
      loadAnswers();
    }
  }, [isExpanded]);

  const handleAnswerPosted = () => {
    setShowAnswerForm(false);
    loadAnswers();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div>
        <p className="text-gray-800 text-lg leading-relaxed">{question.content}</p>
        <p className="text-gray-500 text-sm mt-2">{formatDate(question.created_at)}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {question.answer_count} {question.answer_count === 1 ? 'Answer' : 'Answers'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setShowAnswerForm(!showAnswerForm)}
          className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
        >
          {showAnswerForm ? 'Cancel' : 'Write Answer'}
        </button>
      </div>

      {showAnswerForm && (
        <div className="pt-4 border-t border-gray-200">
          <AnswerForm questionId={question.id} onAnswerPosted={handleAnswerPosted} />
        </div>
      )}

      {isExpanded && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          {isLoadingAnswers ? (
            <p className="text-gray-500 text-sm">Loading answers...</p>
          ) : answers.length === 0 ? (
            <p className="text-gray-500 text-sm">No answers yet. Be the first to answer!</p>
          ) : (
            answers.map((answer) => (
              <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800">{answer.content}</p>
                <p className="text-gray-500 text-xs mt-2">{formatDate(answer.created_at)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
