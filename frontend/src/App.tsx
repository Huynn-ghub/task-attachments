import { useState, useEffect } from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { ChatBox } from './components/ChatBox';
import { Database, AlertTriangle, LayoutDashboard, MessageSquare, Sun, Moon } from 'lucide-react';

type ActiveMenu = 'dashboard' | 'chat';

export default function App() {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-text-main transition-colors duration-300 font-sans">
      {/* Header */}
      <header className="glass-header h-16 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand/10 rounded-xl">
            <Database className="w-5 h-5 text-brand" />
          </div>
          <span className="font-extrabold text-lg text-text-main tracking-tight font-display">
            CORE<span className="text-brand">.SYSTEM</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-text-muted">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-brand/10 hover:text-brand transition-all duration-300 focus:outline-none"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 transition-transform duration-500 rotate-0 hover:rotate-12" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 transition-transform duration-500 rotate-0 hover:rotate-45" />
            )}
          </button>
          
          <div className="w-px h-6 bg-border"></div>
          
          <span className="font-semibold text-text-main font-display">Project Lab 1</span>
          <div className="w-8 h-8 bg-brand/20 border border-brand/40 text-brand font-bold text-xs flex items-center justify-center rounded-full shadow-sm">
            US
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar-bg border-r border-border p-6 hidden md:flex flex-col gap-2 shrink-0 transition-colors duration-300">
          <div className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest px-4 mb-2">Navigation</div>
          
          <div
            className={`geo-nav-item ${activeMenu === 'dashboard' ? 'geo-nav-item-active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <LayoutDashboard className="w-4 h-4" />
            Bảng điều khiển
          </div>
          <div
            className={`geo-nav-item ${activeMenu === 'chat' ? 'geo-nav-item-active' : ''}`}
            onClick={() => setActiveMenu('chat')}
          >
            <MessageSquare className="w-4 h-4" />
            Chat Realtime
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-bg-main transition-colors duration-300">
          {!isConfigured && (
            <div className="mb-6">
              <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex items-start gap-4 backdrop-blur-md">
                <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-rose-600 font-bold mb-1 uppercase text-[11px] tracking-wider font-display">Configuration Required</h3>
                  <p className="text-text-main/80 text-sm">Please set Supabase credentials in your secrets or .env file to enable full features.</p>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
              <div className="lg:col-span-4">
                <TaskForm />
              </div>
              <div className="lg:col-span-8">
                <TaskList />
              </div>
            </div>
          )}

          {activeMenu === 'chat' && (
            <div className="h-[calc(100vh-9.5rem)] max-w-5xl mx-auto">
              <ChatBox />
            </div>
          )}
        </main>
      </div>

      <footer className="h-10 bg-sidebar-bg border-t border-border flex items-center justify-center text-[10px] text-text-muted uppercase tracking-widest shrink-0 transition-colors duration-300 font-display">
        Hệ thống quản lý doanh nghiệp &copy; 2026 | Phiên bản 2.0.0
      </footer>
    </div>
  );
}
