import React, { useState } from 'react';
import IphoneSimulator from './components/IphoneSimulator';
import { 
  CheckCircle2, AlertTriangle, HelpCircle, X
} from 'lucide-react';

export default function App() {
  const [activePresetId, setActivePresetId] = useState<number>(1);
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    icon: string;
    type: 'info' | 'success' | 'error';
  }>({
    show: false,
    title: '',
    message: '',
    icon: 'info',
    type: 'info'
  });

  const triggerGlobalNotification = (
    title: string, 
    message: string, 
    icon: string, 
    type: 'info' | 'success' | 'error'
  ) => {
    setNotification({
      show: true,
      title,
      message,
      icon,
      type
    });
    
    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const dismissNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans relative antialiased p-0 sm:p-6">
      
      {/* Background decoration for extra visual polish */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Dynamic Floating Global Notification Toast */}
      {notification.show && (
        <div className="fixed top-5 right-5 z-[100] max-w-sm w-full bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-4 flex items-start space-x-3 transition-all duration-300 animate-slide-in">
          <div className={`p-1.5 rounded-xl ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-600' 
              : notification.type === 'error' 
                 ? 'bg-rose-50 text-rose-600' 
                 : 'bg-blue-50 text-blue-600'
          }`}>
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            {notification.type === 'info' && <HelpCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1 text-left">
            <h5 className="text-xs font-extrabold text-slate-900">{notification.title}</h5>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notification.message}</p>
          </div>
          <button onClick={dismissNotification} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Main Interactive Web Dashboard (Removed simulated phone boundaries for high-trust professional look) */}
      <div className="w-full max-w-6xl h-screen sm:h-[820px] bg-white sm:rounded-[32px] sm:shadow-2xl border border-slate-200/60 relative z-10 flex flex-col justify-center overflow-hidden">
        <IphoneSimulator 
          activePresetId={activePresetId}
          onPresetChange={(id) => setActivePresetId(id)}
          triggerGlobalNotification={triggerGlobalNotification}
        />
      </div>

    </div>
  );
}
