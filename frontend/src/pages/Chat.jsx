import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  User, 
  AlertCircle,
  BrainCircuit,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [chats, setChats] = useState([]);
  const [activeSession, setActiveSession] = useState('');
  const [messages, setMessages] = useState([]);
  
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, submitting]);

  // Load chat session lists
  const loadChats = async () => {
    try {
      const response = await chatAPI.getChats();
      setChats(response.data);
      return response.data;
    } catch (err) {
      console.error("Error loading chat list:", err);
      return [];
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // Sync activeSession based on query string
  useEffect(() => {
    const session = searchParams.get('session');
    const newSession = searchParams.get('new');
    
    if (session) {
      setActiveSession(session);
      loadMessages(session);
    } else if (newSession) {
      setActiveSession(newSession);
      setMessages([]);
    } else {
      // Auto select the first chat if available
      loadChats().then((list) => {
        if (list.length > 0) {
          setSearchParams({ session: list[0].chat_id });
        }
      });
    }
  }, [searchParams]);

  // Load messages for a chat session
  const loadMessages = async (chatId) => {
    setLoadingHistory(true);
    try {
      const response = await chatAPI.getChatDetails(chatId);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || submitting) return;

    setInputText('');
    setSubmitting(true);

    // Optimistically add user message
    const tempUserMsg = {
      message_id: generateId(),
      chat_id: activeSession,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
      metadata: { sentiment: 'neutral' }
    };
    
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await chatAPI.sendMessage(activeSession, text);
      
      // Append AI response to messages (keep the optimistic user message)
      if (response.data) {
        setMessages(prev => [...prev, response.data]);
      }
      
      // Reload chat threads (to update title if first message)
      loadChats();
      
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorDetail = err?.response?.data?.detail || "I'm really sorry, but I encountered a network error. Could you try saying that again?";
      const tempErrorMsg = {
        message_id: generateId(),
        chat_id: activeSession,
        role: 'assistant',
        content: errorDetail,
        created_at: new Date().toISOString(),
        metadata: { error: true }
      };
      setMessages(prev => [...prev, tempErrorMsg]);
    } finally {
      setSubmitting(false);
    }
  };

  const generateId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const createNewSession = () => {
    const newId = generateId();
    setSearchParams({ new: newId });
  };

  const handleDeleteChat = async (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;

    try {
      await chatAPI.deleteChat(chatId);
      const updatedList = await loadChats();
      
      if (activeSession === chatId) {
        if (updatedList.length > 0) {
          setSearchParams({ session: updatedList[0].chat_id });
        } else {
          setSearchParams({});
          setMessages([]);
          setActiveSession('');
        }
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] md:h-[calc(100vh-64px)] flex rounded-3xl overflow-hidden glass-panel relative">
      
      {/* Sidebar - Threads list */}
      <aside className={`h-full border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white/40 dark:bg-slate-900/10 transition-all duration-300 absolute md:relative z-20 w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:border-r-0 overflow-hidden'
      }`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Conversations</span>
          <button
            onClick={createNewSession}
            className="p-2 bg-brand-500/10 text-brand-500 rounded-xl hover:bg-brand-500 hover:text-white transition-all"
            title="Start New Thread"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* List of chat threads */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No chat history.</div>
          ) : (
            chats.map((c) => {
              const isActive = activeSession === c.chat_id;
              return (
                <button
                  key={c.chat_id}
                  onClick={() => setSearchParams({ session: c.chat_id })}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isActive 
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 font-bold'
                      : 'border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="text-xs truncate">{c.title || 'Conversation'}</span>
                  </div>
                  <Trash2
                    onClick={(e) => handleDeleteChat(e, c.chat_id)}
                    className="h-4 w-4 text-slate-400 hover:text-rose-500 shrink-0 transition-colors"
                  />
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Viewport */}
      <div className="flex-1 flex flex-col h-full bg-white/20 dark:bg-slate-900/5 overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white leading-none">Empathy Companion</h3>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active session
              </span>
            </div>
          </div>
        </div>

        {/* Messages list container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loadingHistory ? (
            <div className="h-full flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-4">
              <div className="p-4 bg-brand-500/10 text-brand-500 rounded-full">
                <BrainCircuit className="h-10 w-10 animate-bounce" />
              </div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white">This is your safe, quiet harbor.</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                You can write anything that is on your mind. How are you feeling? Try describing your mood, a stress point, or anything you're struggling with. I am here to listen.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              const isCrisis = m.metadata?.is_crisis;
              
              return (
                <div key={m.message_id} className={`flex items-start gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-xs shadow ${
                    isUser 
                      ? 'bg-brand-500 text-white' 
                      : isCrisis 
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {isUser ? user?.display_name?.charAt(0) || 'U' : 'AI'}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1">
                    {/* Bubble */}
                    <div className={`p-4 rounded-3xl shadow-sm text-sm border leading-relaxed ${
                      isUser 
                        ? 'bg-brand-500 border-transparent text-white rounded-tr-none' 
                        : isCrisis
                          ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 rounded-tl-none font-semibold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 rounded-tl-none'
                    }`}>
                      <div className="prose dark:prose-invert max-w-none text-inherit">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>

                      {/* Crisis helpline resources if crisis flagged */}
                      {isCrisis && m.metadata?.resources && (
                        <div className="mt-4 pt-4 border-t border-rose-200/40 grid sm:grid-cols-2 gap-3 text-xs">
                          {m.metadata.resources.map((res, idx) => (
                            <div key={idx} className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-rose-200/50 dark:border-rose-900/20 text-slate-800 dark:text-slate-200 space-y-1">
                              <span className="font-bold text-rose-600 dark:text-rose-400 block">{res.name}</span>
                              <span className="font-bold text-base block">{res.contact}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">{res.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className={`text-[9px] text-slate-400 dark:text-slate-500 block ${isUser ? 'text-right' : ''}`}>
                      {m.created_at ? (() => {
                        try {
                          const d = new Date(m.created_at);
                          return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch (e) {
                          return '';
                        }
                      })() : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {submitting && (
            <div className="flex items-start gap-3.5 max-w-[85%]">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-semibold shadow">AI</div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-tl-none flex gap-1 items-center">
                <span className="dot h-1.5 w-1.5 bg-slate-400 dark:bg-slate-600 rounded-full"></span>
                <span className="dot h-1.5 w-1.5 bg-slate-400 dark:bg-slate-600 rounded-full"></span>
                <span className="dot h-1.5 w-1.5 bg-slate-400 dark:bg-slate-600 rounded-full"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 glass-panel bg-white/70">
          <div className="flex gap-2 relative">
            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Share what is on your mind..."
              className="flex-1 pl-4 pr-16 py-4 glass-input text-slate-800 dark:text-white placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={submitting || !inputText.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 shadow-md transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Chat;
