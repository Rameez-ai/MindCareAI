import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { moodAPI, chatAPI, analyticsAPI } from '../services/api';
import { 
  Smile, 
  Compass, 
  MessageSquare, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Sparkles,
  ChevronRight,
  Activity,
  Heart
} from 'lucide-react';

const MOODS = [
  { name: 'happy', label: 'Happy', emoji: '😊', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { name: 'calm', label: 'Calm', emoji: '😌', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { name: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
  { name: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { name: 'stressed', label: 'Stressed', emoji: '🥵', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { name: 'lonely', label: 'Lonely', emoji: '🥺', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { name: 'sad', label: 'Sad', emoji: '😢', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  { name: 'angry', label: 'Angry', emoji: '😠', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [loggingMood, setLoggingMood] = useState(false);
  const [moodSuccess, setMoodSuccess] = useState(false);

  const [recentChats, setRecentChats] = useState([]);
  const [lastMood, setLastMood] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = async () => {
    try {
      // Fetch chats, history, analytics in parallel
      const [chatsRes, moodRes, analyticsRes] = await Promise.all([
        chatAPI.getChats(),
        moodAPI.getMoodHistory(5),
        analyticsAPI.getAnalytics()
      ]);

      setRecentChats(chatsRes.data.slice(0, 3));
      
      const history = moodRes.data;
      if (history.length > 0) {
        setLastMood(history[0]);
      }
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Set wellness suggestions based on last mood or checked mood
  useEffect(() => {
    const activeMood = selectedMood || lastMood?.mood || 'neutral';
    
    // Dynamic matching of activities based on mood (matches wellness_service.py)
    const activities = {
      happy: [
        { title: "Three Good Things", duration: "5 mins", desc: "List three specific details you're grateful for today." },
      ],
      calm: [
        { title: "Body Scan Meditation", duration: "5 mins", desc: "Mindfully observe physical sensations from head to toe." },
      ],
      neutral: [
        { title: "Body Scan Meditation", duration: "5 mins", desc: "Mindfully observe physical sensations from head to toe." },
      ],
      anxious: [
        { title: "Box Breathing Exercise", duration: "4 mins", desc: "Inhale, hold, exhale, hold for 4 seconds each to lower panic." },
        { title: "5-4-3-2-1 Grounding Method", duration: "5 mins", desc: "Identify sights, textures, sounds, smells, and taste." }
      ],
      stressed: [
        { title: "Progressive Muscle Relaxation", duration: "8 mins", desc: "Tense and release muscle groups sequentially to dump physical tension." }
      ],
      lonely: [
        { title: "Reach Out to One Person", duration: "5 mins", desc: "Send a brief checking text message to one friend or family member." }
      ],
      sad: [
        { title: "Small Step Activation", duration: "10 mins", desc: "Complete one small 5-minute task to build momentum." },
        { title: "Self-Compassion Writing", duration: "10 mins", desc: "Write down critical thoughts and rephrase them with warmth." }
      ],
      angry: [
        { title: "Sensory Reset", duration: "2 mins", desc: "Splash cold face water or hold ice cubes to trigger diving reflex." }
      ]
    };

    setSuggestions(activities[activeMood] || activities['neutral']);
  }, [selectedMood, lastMood]);

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) return;
    setLoggingMood(true);
    setMoodSuccess(false);

    try {
      const response = await moodAPI.logMood(selectedMood, intensity, note);
      setLastMood(response.data);
      setNote('');
      setMoodSuccess(true);
      
      // Reload analytics to update dashboard counts
      const analyticsRes = await analyticsAPI.getAnalytics();
      setAnalytics(analyticsRes.data);

      setTimeout(() => setMoodSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to log mood:", err);
    } finally {
      setLoggingMood(false);
    }
  };

  const startNewChat = async () => {
    const generateId = () => {
      return typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    try {
      const newChatId = generateId();
      navigate(`/chat?new=${newChatId}`);
    } catch (err) {
      navigate('/chat');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Hello, {user?.display_name}</h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome to your safe haven. Let's check in on your emotional health today.</p>
        </div>
        <button
          onClick={startNewChat}
          className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 flex items-center gap-2 hover:scale-[1.01] transition-all w-fit"
        >
          <Plus className="h-5 w-5" /> Start New Chat
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: Mood Tracker & Suggestions */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Mood Check-in Widget */}
          <div className="p-6 md:p-8 glass-panel rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/10 rounded-xl text-brand-500">
                <Smile className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-white">How are you feeling right now?</h3>
            </div>

            <form onSubmit={handleMoodSubmit} className="space-y-6">
              {/* Emojis Select */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {MOODS.map((m) => {
                  const isSelected = selectedMood === m.name;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedMood(m.name)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'border-brand-500 ring-2 ring-brand-500/20 scale-[1.05] ' + m.color
                          : 'border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/10 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="text-2xl mb-1">{m.emoji}</span>
                      <span className="text-xs font-bold">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedMood && (
                <div className="space-y-4 animate-slideDown">
                  {/* Intensity Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">Emotional Intensity:</span>
                      <span className="text-brand-500 font-bold">{intensity} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                  </div>

                  {/* Optional Note */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Add a brief note (optional):</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What is causing this feeling? (e.g., job stress, good sleep, exercise...)"
                      className="w-full px-4 py-3 glass-input text-slate-800 dark:text-white placeholder-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loggingMood}
                    className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg transition-all"
                  >
                    {loggingMood ? 'Logging...' : 'Log Mood Check-in'}
                  </button>

                  {moodSuccess && (
                    <span className="ml-4 text-sm font-bold text-emerald-500 animate-pulse">Logged successfully!</span>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Personalized Suggestions Widget */}
          <div className="p-6 md:p-8 glass-panel rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-white">Recommended Wellness Suggestions</h3>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Exercises tailored to help balance your current state of: <strong className="text-brand-500 capitalize">{selectedMood || lastMood?.mood || 'neutral'}</strong>.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {suggestions.map((s, idx) => (
                <div key={idx} className="p-5 glass-card space-y-3 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-bl-xl text-xs font-semibold">
                    {s.duration}
                  </div>
                  <h4 className="font-bold text-base text-slate-800 dark:text-white group-hover:text-brand-500 transition-colors flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" /> {s.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                  <Link
                    to="/emergency"
                    className="text-xs text-brand-500 dark:text-brand-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    Guide <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Quick Stats & Recent Chats */}
        <div className="space-y-8">
          
          {/* Quick Stats Panel */}
          <div className="p-6 glass-panel rounded-3xl space-y-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-500" /> Quick Metrics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100/60 dark:bg-slate-900/30 rounded-2xl text-center space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">AVG INTENSITY</span>
                <p className="text-2xl font-black text-brand-500">{analytics?.mood_analytics?.average_intensity || '0.0'}</p>
              </div>

              <div className="p-4 bg-slate-100/60 dark:bg-slate-900/30 rounded-2xl text-center space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">LAST MOOD</span>
                <p className="text-xl font-bold capitalize text-slate-700 dark:text-slate-200">
                  {lastMood ? `${lastMood.mood}` : 'None'}
                </p>
              </div>
            </div>

            <Link
              to="/analytics"
              className="w-full py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/60 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors text-slate-600 dark:text-slate-400"
            >
              <TrendingUp className="h-4 w-4" /> View Full Analytics
            </Link>
          </div>

          {/* Recent Conversations */}
          <div className="p-6 glass-panel rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand-500" /> Recent Chats
              </h3>
              <Link to="/chat" className="text-xs font-bold text-brand-500 hover:underline">See All</Link>
            </div>

            {loadingData ? (
              <div className="space-y-3">
                <div className="h-16 w-full animate-pulse bg-slate-200 dark:bg-slate-900 rounded-2xl" />
                <div className="h-16 w-full animate-pulse bg-slate-200 dark:bg-slate-900 rounded-2xl" />
              </div>
            ) : recentChats.length === 0 ? (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                No recent conversations found. Start chatting to begin.
              </div>
            ) : (
              <div className="space-y-3">
                {recentChats.map((c) => (
                  <Link
                    key={c.chat_id}
                    to={`/chat?session=${c.chat_id}`}
                    className="flex items-center gap-3 p-4 bg-white/20 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl hover:border-brand-500 transition-colors"
                  >
                    <div className="p-2 bg-brand-500/10 text-brand-500 rounded-xl">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate text-slate-800 dark:text-white">{c.title || 'Conversation'}</h4>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(c.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
