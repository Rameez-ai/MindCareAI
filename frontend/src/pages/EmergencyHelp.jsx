import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  ShieldAlert, 
  HelpCircle, 
  Heart, 
  Play, 
  ArrowRight, 
  Compass, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

const HELPLINES = [
  {
    name: "Suicide & Crisis Lifeline",
    contact: "988",
    description: "Call or text 988. Free, confidential support for anyone experiencing distress or suicidal thoughts. Available 24/7.",
    hours: "24/7"
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    description: "Connect with a crisis counselor 24/7 via text messaging. Free support for any type of crisis.",
    hours: "24/7"
  },
  {
    name: "Emergency Services",
    contact: "911",
    description: "If you are in immediate danger of hurting yourself or others, call local emergency services immediately.",
    hours: "24/7"
  },
  {
    name: "The Trevor Project (LGBTQ+)",
    contact: "1-866-488-7386",
    description: "Crisis intervention and suicide prevention services for lesbian, gay, bisexual, transgender, queer & questioning youth.",
    hours: "24/7"
  }
];

const GROUNDING_STEPS = [
  {
    title: "1. Focus on Breathing",
    instructions: "Let's start by slowing down. Follow the breathing circle below. Inhale deeply... and exhale slowly...",
    isBreathing: true
  },
  {
    title: "2. Five Things You See",
    instructions: "Look around you. Name 5 specific things you can see. It could be a pen, a pattern on the wall, or a shadow.",
  },
  {
    title: "3. Four Things You Touch",
    instructions: "Pay attention to your body. Touch 4 things near you. Note their texture: the softness of your clothes, the coolness of a desk, the hardness of your phone.",
  },
  {
    title: "4. Three Things You Hear",
    instructions: "Close your eyes if you want. Listen for 3 distinct sounds. It could be the hum of a fan, traffic outside, or your own breathing.",
  },
  {
    title: "5. Two Things You Smell",
    instructions: "Take a deep breath. Focus on 2 scents you can notice. The smell of coffee, soap, or just the air in the room.",
  },
  {
    title: "6. One Thing You Taste",
    instructions: "What is 1 thing you can taste? Your toothpaste, a sip of water, or simply focus on the current taste in your mouth.",
  },
  {
    title: "7. Return to the Present",
    instructions: "You've successfully completed the grounding cycle. Note how your body feels. You are here, you are safe, and this moment will pass.",
    isDone: true
  }
];

const EmergencyHelp = () => {
  const [activeStep, setActiveStep] = useState(-1); // -1 means not started
  const [breathPhase, setBreathPhase] = useState('Inhale');

  // Timer loop for breathing animation
  useEffect(() => {
    if (activeStep !== 0) return;
    
    const interval = setInterval(() => {
      setBreathPhase(prev => prev === 'Inhale' ? 'Exhale' : 'Inhale');
    }, 4000); // 4 seconds inhale / 4 seconds exhale

    return () => clearInterval(interval);
  }, [activeStep]);

  const handleNextStep = () => {
    setActiveStep(prev => Math.min(prev + 1, GROUNDING_STEPS.length - 1));
  };

  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const resetGrounding = () => {
    setActiveStep(-1);
    setBreathPhase('Inhale');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Title */}
      <div className="p-6 bg-rose-500/10 border border-rose-200 dark:border-rose-950/40 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="p-3 bg-rose-500 text-white rounded-2xl w-fit">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-rose-700 dark:text-rose-400">Emergency & Crisis Support</h2>
          <p className="text-sm text-rose-600/80 dark:text-rose-400/80">If you are in immediate danger or having suicidal thoughts, please seek professional human help now.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left column: Crisis contacts list */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Phone className="h-5 w-5 text-rose-500 animate-bounce" /> Verified Hotlines & Text Lines
          </h3>

          <div className="space-y-4">
            {HELPLINES.map((h, idx) => (
              <div key={idx} className="p-5 glass-panel rounded-2xl space-y-2.5 relative border border-slate-200/50 dark:border-slate-800/40">
                <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                  {h.hours}
                </span>
                <h4 className="font-bold text-base text-slate-800 dark:text-white">{h.name}</h4>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {h.contact}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {h.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-2xl text-xs text-center text-slate-500">
            For international directory of support lines, visit{' '}
            <a 
              href="https://findahelpline.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-500 font-bold hover:underline"
            >
              Findahelpline.com
            </a>.
          </div>
        </div>

        {/* Right column: Timed panic grounding buddy */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-500" /> Interactive Grounding Guide
          </h3>

          {activeStep === -1 ? (
            /* Intro State */
            <div className="p-6 md:p-8 glass-panel rounded-3xl space-y-6 text-center">
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full w-fit mx-auto">
                <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-xl text-slate-800 dark:text-white">Feeling panicked or overloaded?</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                  This grounding exercise uses the 5-4-3-2-1 sensory technique to redirect your focus, lowering stress hormones and calming your mind.
                </p>
              </div>
              <button
                onClick={handleNextStep}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 mx-auto"
              >
                Start Grounding Guide <Play className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Exercise step state */
            <div className="p-6 md:p-8 glass-panel rounded-3xl space-y-6 relative border border-emerald-500/20">
              
              {/* Title and stats count */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                  Grounding buddy active
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Step {activeStep + 1} of {GROUNDING_STEPS.length}
                </span>
              </div>

              {/* Instructions viewport */}
              <div className="space-y-4 text-center min-h-[140px] flex flex-col justify-center">
                <h4 className="font-bold text-xl text-slate-800 dark:text-white">
                  {GROUNDING_STEPS[activeStep].title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                  {GROUNDING_STEPS[activeStep].instructions}
                </p>

                {/* Breathing circle animation widget */}
                {GROUNDING_STEPS[activeStep].isBreathing && (
                  <div className="py-4 flex justify-center items-center">
                    <div className={`rounded-full flex items-center justify-center font-bold text-sm text-white bg-brand-500 transition-all duration-[4000ms] ${
                      breathPhase === 'Inhale' 
                        ? 'h-28 w-28 scale-[1.15] bg-emerald-500 shadow-lg shadow-emerald-500/25' 
                        : 'h-24 w-24 scale-[0.9] bg-brand-500 shadow-md'
                    }`}>
                      {breathPhase === 'Inhale' ? 'Breathe In' : 'Breathe Out'}
                    </div>
                  </div>
                )}

                {/* Done Sparkles */}
                {GROUNDING_STEPS[activeStep].isDone && (
                  <div className="flex justify-center py-2 text-amber-500">
                    <Sparkles className="h-10 w-10 animate-bounce" />
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/40">
                <button
                  onClick={resetGrounding}
                  className="p-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl text-slate-500"
                  title="Reset Guide"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                
                <div className="flex gap-2">
                  {activeStep > 0 && (
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-bold"
                    >
                      Back
                    </button>
                  )}
                  {activeStep < GROUNDING_STEPS.length - 1 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      Next <ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  ) : (
                    <button
                      onClick={resetGrounding}
                      className="px-5 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl text-xs font-bold"
                    >
                      Restart Exercise
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default EmergencyHelp;
