import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { 
  BarChart2, 
  TrendingUp, 
  Activity, 
  Calendar, 
  Heart,
  HelpCircle,
  Award
} from 'lucide-react';

const MOOD_EMOJIS = {
  happy: '😊',
  calm: '😌',
  neutral: '😐',
  anxious: '😰',
  stressed: '🥵',
  lonely: '🥺',
  sad: '😢',
  angry: '😠',
};

const MoodAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await analyticsAPI.getAnalytics();
        setData(response.data);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const moodCounts = data?.mood_analytics?.mood_counts || {};
  const history = data?.mood_analytics?.history || [];
  const averageIntensity = data?.mood_analytics?.average_intensity || 0.0;
  
  // Calculate total counts
  const totalCheckins = Object.values(moodCounts).reduce((a, b) => a + b, 0);

  // Classify general wellness score based on check-ins
  let wellnessVerdict = "Not enough check-ins logged yet. Keep logging your daily states.";
  if (totalCheckins > 0) {
    const positiveCounts = (moodCounts.happy || 0) + (moodCounts.calm || 0);
    const negativeCounts = (moodCounts.anxious || 0) + (moodCounts.stressed || 0) + (moodCounts.sad || 0) + (moodCounts.angry || 0) + (moodCounts.lonely || 0);
    if (positiveCounts > negativeCounts) {
      wellnessVerdict = "Your emotional state leans positive. You are maintaining good balance!";
    } else {
      wellnessVerdict = "You are carrying some heavy emotions lately. Be gentle with yourself and try applying CBT exercises.";
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Mood Analytics & Trends</h2>
        <p className="text-slate-500 dark:text-slate-400">Track and review your emotional patterns over time.</p>
      </div>

      {totalCheckins === 0 ? (
        <div className="p-8 text-center glass-panel rounded-3xl space-y-4 max-w-md mx-auto">
          <HelpCircle className="h-10 w-10 text-slate-400 mx-auto animate-pulse" />
          <h4 className="font-bold text-slate-800 dark:text-white">No analytics data found.</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please log your mood at least once from the Dashboard to unlock emotional reports and tracking metrics.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Stats Summary cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 glass-panel rounded-3xl flex items-center gap-4">
              <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">Average Intensity</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{averageIntensity} / 10</span>
              </div>
            </div>

            <div className="p-6 glass-panel rounded-3xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">Total Check-ins</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{totalCheckins} logs</span>
              </div>
            </div>

            <div className="p-6 glass-panel rounded-3xl flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">Wellness Verdict</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block leading-normal mt-1">{wellnessVerdict}</span>
              </div>
            </div>
          </div>

          {/* Graphical Representation (Custom pure CSS percentages bar) */}
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Mood Frequency Distribution */}
            <div className="p-6 md:p-8 glass-panel rounded-3xl space-y-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-brand-500" /> Mood Frequency Distribution
              </h3>

              <div className="space-y-4">
                {Object.entries(moodCounts).map(([mood, count]) => {
                  const percentage = Math.round((count / totalCheckins) * 100);
                  return (
                    <div key={mood} className="space-y-1.5">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="capitalize text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span>{MOOD_EMOJIS[mood] || '😐'}</span> {mood}
                        </span>
                        <span className="text-slate-400 font-bold">{count} check-ins ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-brand-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emotional Intensity Trend logs */}
            <div className="p-6 md:p-8 glass-panel rounded-3xl space-y-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-500" /> Emotional Intensity Log (Latest)
              </h3>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {history.map((log) => (
                  <div key={log.log_id} className="flex items-center justify-between p-3.5 bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{MOOD_EMOJIS[log.mood] || '😐'}</span>
                      <div>
                        <span className="text-sm font-bold capitalize text-slate-800 dark:text-slate-200">{log.mood}</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-lg text-xs font-black">
                      Level {log.intensity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Detailed Logs Grid */}
          <div className="p-6 md:p-8 glass-panel rounded-3xl space-y-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-500" /> Complete Mood History
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Mood</th>
                    <th className="py-4 px-4">Intensity</th>
                    <th className="py-4 px-4">Journal Note</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((log) => (
                    <tr key={log.log_id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                      <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-400">
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 font-bold capitalize text-slate-800 dark:text-slate-200">
                        <span className="mr-1.5">{MOOD_EMOJIS[log.mood]}</span> {log.mood}
                      </td>
                      <td className="py-4 px-4 font-bold text-brand-500">{log.intensity} / 10</td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={log.note}>
                        {log.note || <span className="italic text-slate-300 dark:text-slate-600">No note added</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default MoodAnalytics;
