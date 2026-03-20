import { motion } from 'framer-motion';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const LearningTools = ({ user, profile, onSignOut }) => {
  const tools = [
    {
      id: 1,
      title: 'Learning Resources',
      icon: '🧠',
      description: 'Access curated learning materials and guides for your skills',
      color: 'bg-blue-500',
      features: ['Skill guides', 'Video tutorials', 'Reading materials', 'Practice exercises']
    },
    {
      id: 2,
      title: 'Mini Quizzes',
      icon: '📝',
      description: 'Test your knowledge with interactive quizzes and assessments',
      color: 'bg-green-500',
      features: ['Create quizzes', 'Take assessments', 'Track progress', 'Earn XP']
    },
    {
      id: 3,
      title: 'Session Notes',
      icon: '💬',
      description: 'Save and organize notes from your learning sessions',
      color: 'bg-purple-500',
      features: ['Note taking', 'Session summaries', 'Progress tracking', 'Search notes']
    },
    {
      id: 4,
      title: 'Skill Guides',
      icon: '📚',
      description: 'Comprehensive guides and tutorials for mastering new skills',
      color: 'bg-orange-500',
      features: ['Step-by-step guides', 'Expert tips', 'Best practices', 'Common mistakes']
    }
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-cream">
      <Header user={user} profile={profile} onSignOut={onSignOut} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-navy mb-8">Learning Tools</h1>
            <p className="text-lg text-gray-600 mb-8">
              Enhance your learning experience with our comprehensive toolkit
            </p>

            {/* Tools Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-16 h-16 ${tool.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-navy mb-2">{tool.title}</h3>
                      <p className="text-gray-600 mb-4">{tool.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button className={`w-full py-3 px-4 ${tool.color} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}>
                    Get Started
                  </button>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default LearningTools;
