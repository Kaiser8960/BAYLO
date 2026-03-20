import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { dummyMatches } from '../data/dummyMatches';

const Tag = ({ children }) => (
  <span className="px-2 py-1 rounded-full bg-cream text-navy border text-xs">{children}</span>
);

const FindMatches = ({ user, profile: initialProfile, onSignOut }) => {
  const [profile] = useState(initialProfile);

  const matches = useMemo(() => {
    if (!profile) return [];
    const learnSet = new Set((profile.skillsLearn || []).map((s) => s.toLowerCase()));
    return dummyMatches.filter(m => (m.skillsKnow || []).some(sk => learnSet.has(sk.toLowerCase())));
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-navy mb-8">Find Matches</h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover people who can teach you new skills
            </p>

            {!profile || (profile.skillsLearn || []).length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No skills to learn yet!</h3>
                  <p className="text-gray-500 mb-4">
                    Add skills you want to learn in your profile to see matches.
                  </p>
                  <button className="inline-block py-2 px-4 bg-navy text-cream rounded-lg font-medium hover:bg-navy-light transition-colors">
                    Update Profile
                  </button>
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No matches found!</h3>
                  <p className="text-gray-500 mb-4">
                    Try adding more skills to your profile to find better matches.
                  </p>
                  <button className="inline-block py-2 px-4 bg-navy text-cream rounded-lg font-medium hover:bg-navy-light transition-colors">
                    Update Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <img src={m.profileImage} alt={m.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-navy">{m.name}</h3>
                              <p className="text-gray-600">{m.country}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="font-semibold">{m.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs font-semibold text-gray-600 mb-1">Teaches</div>
                            <div className="flex flex-wrap gap-2">
                              {(m.skillsKnow||[]).slice(0,6).map((s)=>(<Tag key={s}>{s}</Tag>))}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-gray-600 mb-1">Wants to learn</div>
                            <div className="flex flex-wrap gap-2">
                              {(m.skillsLearn||[]).slice(0,6).map((s)=>(<Tag key={s}>{s}</Tag>))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <div className="flex gap-3">
                        <button className="btn-secondary flex-1">View Profile</button>
                        <button className="btn-primary flex-1">Start Session</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default FindMatches;


