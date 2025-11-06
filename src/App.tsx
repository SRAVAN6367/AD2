import { useState, useEffect } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';
import { supabase } from './lib/supabase';
import { QuestionForm } from './components/QuestionForm';
import { QuestionCard } from './components/QuestionCard';
import type { Database } from './lib/database.types';

type Question = Database['public']['Tables']['questions']['Row'];

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadQuestions = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setQuestions(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadQuestions();

    const channel = supabase
      .channel('questions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        () => {
          loadQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Query Cloud
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ask questions and share knowledge anonymously. Your identity stays private while you learn and help others.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ask a Question
          </h2>
          <QuestionForm onQuestionPosted={loadQuestions} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Recent Questions
          </h2>
          <button
            onClick={loadQuestions}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No questions yet
            </h3>
            <p className="text-gray-600">
              Be the first to ask a question and start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>

      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>All posts are completely anonymous. No user data is tracked or stored.</p>
      </footer>
    </div>
  );
}

export default App;
