import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart, Sparkles, Shield, Compass, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden flex flex-col font-sans">
      
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-200/20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-500/10 rounded-xl text-brand-500">
            <Brain className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl text-slate-800 dark:text-white">MindCareAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Empathetic AI Companion
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Your safe space for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-emerald-500">mental clarity</span> and wellness.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            MindCareAI is an intelligent, empathetic companion that helps you track your emotions, practice CBT-based coping techniques, and build mindful habits. Always safe, confidential, and available 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link to="/register" className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/30 hover:scale-[1.02] transition-all">
              Start Free Consultation <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/emergency" className="flex items-center justify-center gap-2 px-8 py-4 border border-rose-200 dark:border-rose-900/40 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold rounded-2xl transition-all">
              Crisis Helplines
            </Link>
          </div>
        </div>

        {/* Decorative Grid Card */}
        <div className="relative flex justify-center items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-brand-400/20 dark:bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="w-full max-w-md p-6 md:p-8 glass-panel rounded-3xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                M
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white leading-tight">MindCareAI Agent</p>
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span> Listening
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-2xl text-sm max-w-[85%] text-slate-700 dark:text-slate-300">
                Hi! I'm here to support you. How are you feeling today?
              </div>
              <div className="p-4 bg-brand-500 text-white rounded-2xl text-sm max-w-[85%] ml-auto shadow-md">
                I've been feeling pretty stressed and overwhelmed with work lately.
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-2xl text-sm max-w-[85%] text-slate-700 dark:text-slate-300">
                I hear you, and it makes complete sense to feel that way. Work pressure can build up so quickly. Let's take a deep breath together. Would you like to try a 2-minute relaxation exercise to ground ourselves?
              </div>
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-semibold">CBT Grounding</span>
              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">Mood Tracking</span>
              <span className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-semibold">Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-100/50 dark:bg-slate-950/40 py-16 md:py-24 border-t border-slate-200/20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Designed around safety and support</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We leverage Cognitive Behavioral Therapy (CBT) frameworks and modern AI technologies to provide confidential tools for mental wellness.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 glass-card text-left space-y-4 hover:scale-[1.03] transition-all">
              <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl w-fit">
                <Heart className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white">Empathetic Chat</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Conversational AI that validates your feelings, listens actively, and offers warm guidance.</p>
            </div>

            <div className="p-6 glass-card text-left space-y-4 hover:scale-[1.03] transition-all">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit">
                <Compass className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white">CBT Tools & Exercises</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Practical box breathing, progressive muscle relaxation, and cognitive distortion challenging exercises.</p>
            </div>

            <div className="p-6 glass-card text-left space-y-4 hover:scale-[1.03] transition-all">
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl w-fit">
                <Brain className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white">Mood Analytics</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Log check-ins manually, view weekly emotional charts, and trace long-term trends.</p>
            </div>

            <div className="p-6 glass-card text-left space-y-4 hover:scale-[1.03] transition-all">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white">Crisis Guardrails</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Built-in safety triggers to identify severe distress and automatically suggest certified helpline contacts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200/20 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>© 2026 MindCareAI. All rights reserved. This AI is a mental wellness companion, not a replacement for therapy or professional medical care.</p>
      </footer>
    </div>
  );
};

export default Landing;
