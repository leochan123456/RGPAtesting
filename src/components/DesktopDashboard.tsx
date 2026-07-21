import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Languages, GitFork, Award, Database, ShieldCheck, 
  HelpCircle, ChevronLeft, ChevronRight, AlertOctagon, Terminal, Play, CheckCircle, Info, FileCode, CheckSquare
} from 'lucide-react';
import { REVISION_QUESTIONS, TRUE_PRICE_DATABASE } from '../presets';
import { QuizQuestion } from '../types';

interface DesktopDashboardProps {
  activePresetId: number;
  onSelectPreset: (id: number) => void;
  triggerGlobalNotification: (title: string, message: string, icon: string, type: 'info' | 'success' | 'error') => void;
}

export default function DesktopDashboard({
  activePresetId,
  onSelectPreset,
  triggerGlobalNotification
}: DesktopDashboardProps) {
  
  // Tab controller: 'economics' | 'copywriting' | 'uml' | 'revision'
  const [activeTab, setActiveTab] = useState<'economics' | 'copywriting' | 'uml' | 'revision'>('economics');
  
  // UML Subtab: 'usecase' | 'class' | 'sequence' | 'state'
  const [activeUmlTab, setActiveUMLTab] = useState<'usecase' | 'class' | 'sequence' | 'state'>('usecase');
  
  // Sequence Step
  const [seqStep, setSeqStep] = useState<number>(1);

  // State Diagram manual evaluation variables
  const [marketPrice, setMarketPrice] = useState<number>(7500000);
  const [proposedPrice, setProposedPrice] = useState<number>(8500000);

  // Quiz States
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({});
  const [showRationale, setShowRationale] = useState<boolean>(false);

  // Developer API states
  const [selectedApiCode, setSelectedApiCode] = useState<string>('facebook');
  const [apiConsoleLogs, setApiConsoleLogs] = useState<string[]>(["[SYS] Developer Sandbox ready. AD Sync complete.", "[SYS] Intranet Gateway connected via SSL on C-001702."]);

  const handleAnswerSelection = (choiceIndex: number) => {
    if (answeredQuestions[quizIndex]) return; // already answered
    setSelectedChoiceIndex(choiceIndex);
    const question = REVISION_QUESTIONS[quizIndex];
    const isCorrect = question.choices[choiceIndex].isCorrect;
    
    setAnsweredQuestions(prev => ({ ...prev, [quizIndex]: true }));
    setShowRationale(true);

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      triggerGlobalNotification(
        "答對了！", 
        "符合 ISOM3210 系統分析學術理論規限。",
        "award",
        "success"
      );
    } else {
      triggerGlobalNotification(
        "概念未完全掌握", 
        "請仔細核對下方提供的詳細解析。",
        "help-circle",
        "error"
      );
    }
  };

  const handleNextQuiz = () => {
    setSelectedChoiceIndex(null);
    setShowRationale(false);
    setQuizIndex(prev => (prev + 1) % REVISION_QUESTIONS.length);
  };

  // State diagram calculations
  const deviationVal = Math.abs(proposedPrice - marketPrice) / marketPrice;
  const isViolation = deviationVal > 0.20;

  // Run Developer mock API call
  const triggerApiSimulation = (apiType: string) => {
    let logs: string[] = [];
    const timestamp = new Date().toLocaleTimeString();

    if (apiType === 'facebook') {
      logs = [
        `[${timestamp}] [API_CALL] POST /v15.0/1202859732904422/feed`,
        `[${timestamp}] [PAYLOAD] { "message": "🏡 藍天海岸 精選放盤...", "access_token": "EAAT7X2..." }`,
        `[${timestamp}] [STATUS] Checking App Review pages_manage_posts credentials... Passed.`,
        `[${timestamp}] [STATUS] Checking Business Verification BR files... Passed.`,
        `[${timestamp}] [RESPONSE] 200 OK - { "id": "1202859732904422_987654321" }`,
        `[${timestamp}] [SUCCESS] FB page post updated with licacorp authority watermark.`
      ];
    } else if (apiType === 'xiaohongshu') {
      const payload = {
        app_key: "xhs_realestate_dev_key",
        timestamp: Math.floor(Date.now() / 1000).toString(),
        note_id: "649c46ab000000002702ad36",
        sign_method: "md5"
      };
      // ASCII Parameter Sort
      const sortedKeys = Object.keys(payload).sort();
      let queryStr = "";
      sortedKeys.forEach(k => {
        queryStr += `${k}${(payload as any)[k]}`;
      });
      const mockSecret = "32_digit_hex_app_secret_value";
      const signRaw = `${queryStr}${mockSecret}`;
      
      logs = [
        `[${timestamp}] [ASCII_SORT] Sorted parameters: ${sortedKeys.join(', ')}`,
        `[${timestamp}] [CONCATENATE] Raw signature payload: "${signRaw}"`,
        `[${timestamp}] [MD5_HASH] Hashed sign value: "8f5b40cfb7d46c820df38c53876d729e"`,
        `[${timestamp}] [API_CALL] GET /api/rednote/note_details?sign=8f5b40cfb7d46c820df38c53876d729e`,
        `[${timestamp}] [RESPONSE] 200 OK - { "status": "signed_payload_validated", "saves": 512, "shares": 94 }`
      ];
    } else if (apiType === 'youtube') {
      logs = [
        `[${timestamp}] [API_CALL] POST /upload/youtube/v3/videos?uploadType=resumable`,
        `[${timestamp}] [PAYLOAD] { "snippet": { "title": "東涌藍天海岸 Luxury Walkthrough", "categoryId": "22" } }`,
        `[${timestamp}] [RESPONSE] 200 OK - Location Header: "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=resumable_session_9921"`,
        `[${timestamp}] [CHUNK] Sending bytes 0-1048575 / 10485760 (resumable stream)...`,
        `[${timestamp}] [STATUS] Session verified. Placed in private draft box queue.`
      ];
    } else if (apiType === 'whatsapp') {
      logs = [
        `[${timestamp}] [API_CALL] POST /v22.0/whatsapp_phone_id/messages`,
        `[${timestamp}] [PAYLOAD] { "messaging_product": "whatsapp", "to": "85296701234", "type": "template" }`,
        `[${timestamp}] [STATUS] Checking recipient number E.164 compliance structure... Passed.`,
        `[${timestamp}] [RESPONSE] 200 OK - { "messages": [ { "id": "wamid.HBgM..." } ] }`,
        `[${timestamp}] [SUCCESS] Broadcast delivered outside the 24-hour conversational session window.`
      ];
    }

    setApiConsoleLogs(prev => [...logs, ...prev]);
    triggerGlobalNotification(
      "API 呼叫測試成功", 
      `成功模擬調用 ${apiType.toUpperCase()} 集成網關。`,
      "terminal",
      "success"
    );
  };

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Upper Navigation Menu Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-1 transition-all duration-300">
        <button 
          onClick={() => setActiveTab('economics')}
          className={`flex items-center space-x-2.5 px-4 py-2 text-sm font-semibold rounded-xl transition duration-200 ${
            activeTab === 'economics' 
              ? 'bg-[#FF6600] text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LineChart className="w-4 h-4" />
          <span>Platform Economics (平台經濟指標)</span>
        </button>
        <button 
          onClick={() => setActiveTab('uml')}
          className={`flex items-center space-x-2.5 px-4 py-2 text-sm font-semibold rounded-xl transition duration-200 ${
            activeTab === 'uml' 
              ? 'bg-[#FF6600] text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>UML Design Playground (UML 建模分析)</span>
        </button>
        <button 
          onClick={() => setActiveTab('revision')}
          className={`flex items-center space-x-2.5 px-4 py-2 text-sm font-semibold rounded-xl transition duration-200 ${
            activeTab === 'revision' 
              ? 'bg-[#FF6600] text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ISOM3210 Exam Revision Hub (診斷自測)</span>
        </button>
      </div>

      {/* Main Workspace Frame */}
      <div className="grid grid-cols-1 gap-6">

        {/* TAB 1: PLATFORM ECONOMICS */}
        {activeTab === 'economics' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            
            {/* ROI Simulation Widget */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl -z-10"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-md font-bold text-slate-900">Rica+ ROI Programmatic Lead Forecaster</h3>
                  <p className="text-xs text-slate-400">Calculate economic outcomes and marketing conversion ratios based on your selected preset parameters.</p>
                </div>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100/50 mt-2 md:mt-0 font-bold">
                  ROI Formula: ((L × C × V) - I) / I
                </span>
              </div>

              {/* Presets Row */}
              <div className="mb-6 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">一鍵套用渠道經濟預設參數</span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      setMarketPrice(18000); setProposedPrice(18000);
                      onSelectPreset(1);
                      triggerGlobalNotification("Xiaohongshu 預設", "已載入小紅書港漂新生客群預設數據。", "sparkles", "info");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      activePresetId === 1 ? 'bg-[#FF6600]/10 border-[#FF6600] text-[#FF6600]' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    1. 港大新生租房 (小紅書)
                  </button>
                  <button 
                    onClick={() => {
                      setMarketPrice(19500); setProposedPrice(19500);
                      onSelectPreset(2);
                      triggerGlobalNotification("WeChat Moments 預設", "已載入微信朋友圈投資收租客群預設數據。", "message-square", "info");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      activePresetId === 2 ? 'bg-[#FF6600]/10 border-[#FF6600] text-[#FF6600]' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    2. 啟德收租盤 (微信朋友圈)
                  </button>
                  <button 
                    onClick={() => {
                      setMarketPrice(10200000); setProposedPrice(10200000);
                      onSelectPreset(3);
                      triggerGlobalNotification("Facebook 預設", "已載入 Facebook 換樓客群預設數據。", "facebook", "info");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      activePresetId === 3 ? 'bg-[#FF6600]/10 border-[#FF6600] text-[#FF6600]' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    3. 太古城三房 (Facebook)
                  </button>
                  <button 
                    onClick={() => {
                      setMarketPrice(4200000); setProposedPrice(4200000);
                      onSelectPreset(4);
                      triggerGlobalNotification("Instagram 預設", "已載入 Instagram 首置客群預設數據。", "sparkles", "info");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      activePresetId === 4 ? 'bg-[#FF6600]/10 border-[#FF6600] text-[#FF6600]' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    4. 日出康城一房 (Instagram)
                  </button>
                </div>
              </div>

              {/* Economic stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 text-white p-6 rounded-2xl relative">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Average Close Conversion</span>
                  <p className="text-2xl font-black font-mono">1.0% - 9.0%</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">WhatsApp Direct Close offers maximum conversion depth up to 9.0%.</p>
                </div>
                <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Hong Kong Expats Segment Size</span>
                  <p className="text-2xl font-black font-mono text-emerald-400">2,000,000+ Active</p>
                  <p className="text-xs text-emerald-500/80 mt-1 leading-relaxed">High saturation of new mainland professionals & students seeking central flats.</p>
                </div>
                <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">EAA Legal Watermark Protection</span>
                  <p className="text-2xl font-black font-mono text-blue-400">100% Guaranteed</p>
                  <p className="text-xs text-blue-300 mt-1 leading-relaxed">Ensuring C-001702 brand license matches all clipboard copy assets.</p>
                </div>
              </div>
            </div>

            {/* Developer API Sandbox Control Center */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-slate-900">Programmatic Multichannel API Sandbox Gateways</h3>
                  <p class="text-xs text-slate-400">Directly mock corporate-verified API payloads required for social media content syndication.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left controls */}
                <div className="lg:col-span-4 space-y-4">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Gateway Endpoints</h4>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedApiCode('facebook')}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition ${
                        selectedApiCode === 'facebook' ? 'border-blue-500 bg-blue-50/40 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>Meta Page Post /photos (CJS)</span>
                      <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">CJS</span>
                    </button>
                    
                    <button 
                      onClick={() => setSelectedApiCode('xiaohongshu')}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition ${
                        selectedApiCode === 'xiaohongshu' ? 'border-blue-500 bg-blue-50/40 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>RED Note MD5 Signature (GET)</span>
                      <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">MD5</span>
                    </button>

                    <button 
                      onClick={() => setSelectedApiCode('youtube')}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition ${
                        selectedApiCode === 'youtube' ? 'border-blue-500 bg-blue-50/40 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>YouTube Resumable Chunk Upload</span>
                      <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">CHUNK</span>
                    </button>

                    <button 
                      onClick={() => setSelectedApiCode('whatsapp')}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition ${
                        selectedApiCode === 'whatsapp' ? 'border-blue-500 bg-blue-50/40 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>WhatsApp Media Template (Session)</span>
                      <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">E.164</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => triggerApiSimulation(selectedApiCode)}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center space-x-1.5 shadow"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Simulated API Call</span>
                  </button>
                </div>

                {/* Right code/console display */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>Production Implementation Blueprint</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Node.js ESM / Python v3.11</span>
                  </div>

                  {/* Dynamic Code Window */}
                  <div className="bg-slate-950 text-slate-300 p-4 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 max-h-[160px]">
                    {selectedApiCode === 'facebook' && (
                      <pre>{`def post_to_facebook_page(page_id: str, page_token: str, message: str, link_url: str) -> dict:
    url = f"https://graph.facebook.com/v15.0/{page_id}/feed"
    payload = {
        "message": message,
        "link": link_url,
        "access_token": page_token
    }
    response = requests.post(url, json=payload)
    return response.json() # Securely processed on server-side`}</pre>
                    )}
                    {selectedApiCode === 'xiaohongshu' && (
                      <pre>{`def generate_xiaohongshu_signature(params: dict, app_secret: str) -> str:
    # Sort keys alphabetically to match RED Open Platform specs
    sorted_items = sorted(params.items(), key=lambda x: x[0])
    query_string = "".join(f"{k}{v}" for k, v in sorted_items)
    sign_raw = f"{query_string}{app_secret}"
    return hashlib.md5(sign_raw.encode("utf-8")).hexdigest() # Sign validation`}</pre>
                    )}
                    {selectedApiCode === 'youtube' && (
                      <pre>{`def initiate_youtube_resumable_upload(token: str, title: str) -> str:
    url = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable"
    headers = { "Authorization": f"Bearer {token}", "Content-Type": "application/json" }
    payload = { "snippet": { "title": title, "categoryId": "22" } }
    response = requests.post(url, headers=headers, json=payload)
    return response.headers.get("Location") # Resumable session anchor`}</pre>
                    )}
                    {selectedApiCode === 'whatsapp' && (
                      <pre>{`def send_whatsapp_media_template(phone_id: str, token: str, recipient: str) -> dict:
    # Recipient must follow strict E.164 Hong Kong structure (e.g. 852xxxx)
    url = f"https://graph.facebook.com/v22.0/{phone_id}/messages"
    payload = { "messaging_product": "whatsapp", "to": recipient, "type": "template" }
    return requests.post(url, json=payload, headers={"Authorization": f"Bearer {token}"}).json()`}</pre>
                    )}
                  </div>

                  {/* Terminal Console Logs */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">API Log Output</span>
                    <div className="bg-slate-900 text-slate-300 p-3 rounded-xl font-mono text-[10px] space-y-1 h-[100px] overflow-y-auto border border-slate-800">
                      {apiConsoleLogs.map((l, i) => (
                        <div key={i} className={`${l.includes('SUCCESS') || l.includes('200 OK') ? 'text-emerald-400' : l.includes('ERROR') ? 'text-rose-400' : 'text-slate-300'}`}>
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: UML MODELS PLAYGROUND */}
        {activeTab === 'uml' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            
            {/* Sub-tab selection row */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-1">
              <button 
                onClick={() => setActiveUMLTab('usecase')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeUmlTab === 'usecase' ? 'bg-slate-900 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                1. Use Case Diagram (使用案例)
              </button>
              <button 
                onClick={() => setActiveUMLTab('class')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeUmlTab === 'class' ? 'bg-slate-900 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                2. Domain Class Diagram (類別圖)
              </button>
              <button 
                onClick={() => setActiveUMLTab('sequence')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeUmlTab === 'sequence' ? 'bg-slate-900 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                3. Sequence Diagram (序列圖)
              </button>
              <button 
                onClick={() => setActiveUMLTab('state')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeUmlTab === 'state' ? 'bg-slate-900 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                4. State Machine Diagram (狀態機)
              </button>
            </div>

            {/* UML 3A: USE CASE DIAGRAM */}
            {activeUmlTab === 'usecase' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 relative flex flex-col justify-center min-h-[300px]">
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-slate-400 uppercase font-mono">System Boundary: Rica+ App v4.7.1</span>
                  
                  <div className="flex items-center justify-around">
                    
                    {/* Actor representation */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-blue-100 border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-600 shadow-md">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span className="font-bold text-xs text-slate-800 block">持牌地產代理</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Frontline Agent</span>
                      </div>
                    </div>

                    {/* Connecting dashed vector */}
                    <div className="flex-1 px-4 relative">
                      <div className="border-t-2 border-dashed border-slate-300 w-full"></div>
                    </div>

                    {/* Use Case Oval shapes */}
                    <div className="space-y-3.5 w-60">
                      <div className="bg-white border border-blue-200 rounded-full px-4 py-3 text-center shadow-sm hover:border-blue-500 transition duration-150 cursor-pointer">
                        <span className="text-xs font-bold text-blue-700 block font-mono">UC1: Profile Customer Requirements</span>
                      </div>
                      <div className="bg-white border border-blue-200 rounded-full px-4 py-3 text-center shadow-sm hover:border-blue-500 transition duration-150 cursor-pointer relative bg-blue-50/40">
                        <span className="text-xs font-bold text-blue-700 block font-mono">UC2: Generate Copy Draft</span>
                        <span className="absolute right-2 top-2 text-[8px] bg-blue-100 text-blue-800 rounded px-1 font-bold font-mono">Beta Active</span>
                      </div>
                      <div className="bg-white border border-blue-200 rounded-full px-4 py-3 text-center shadow-sm hover:border-blue-500 transition duration-150 cursor-pointer">
                        <span className="text-xs font-bold text-blue-700 block font-mono">UC3: Query Market Statistics</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right side educational info */}
                <div className="lg:col-span-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">UML Exception Flow (QA Focus)</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-3 leading-relaxed">
                    <p className="font-bold text-slate-800">CILO: CM02, CM03, PS03 Mapping</p>
                    <p className="text-slate-600">The <strong>Exception Flow</strong> handles anomalies that deviate from the standard path without crashing the system.</p>
                    <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-800">
                      <span className="font-bold block mb-1">True Price DB Timeout Exception</span>
                      If the database goes offline, the system catches the query failure, falls back to a cached local pricing index, and outputs a slightly lower confidence warning.
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* UML 3B: DOMAIN CLASS DIAGRAM */}
            {activeUmlTab === 'class' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 relative flex flex-col justify-center min-h-[300px] overflow-x-auto">
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-slate-400 uppercase font-mono">Domain Structure Model</span>
                  
                  <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
                    
                    {/* Agent Class */}
                    <div className="w-52 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-xs">
                      <div className="bg-slate-800 text-white p-2 font-bold font-mono text-center">Agent</div>
                      <div className="p-2 border-b border-slate-100 space-y-1 font-mono">
                        <p>- adAccount: String</p>
                        <p>- district: String</p>
                      </div>
                      <div className="p-2 space-y-1 font-mono bg-slate-50">
                        <p>+ analyzeNeeds()</p>
                        <p>+ generateCopy()</p>
                      </div>
                    </div>

                    {/* Connecting multiplicity lines */}
                    <div className="flex flex-col items-center justify-center font-mono text-xs w-16">
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold mb-1">Assoc</span>
                      <div className="w-full border-t-2 border-slate-300 relative">
                        <span className="absolute left-0 top-1 text-[10px] font-bold">1..1</span>
                        <span className="absolute right-0 top-1 text-[10px] font-bold">0..*</span>
                      </div>
                    </div>

                    {/* AI_AssistantSession Class */}
                    <div className="w-56 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-xs">
                      <div className="bg-slate-800 text-white p-2 text-center font-bold font-mono">AI_AssistantSession</div>
                      <div className="p-2 border-b border-slate-100 space-y-1 font-mono">
                        <p>- sessionID: UUID</p>
                        <p>- currentScenario: String</p>
                      </div>
                      <div className="p-2 space-y-1 font-mono bg-slate-50">
                        <p>+ queryExternalData()</p>
                        <p>+ validateCompliance()</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right side educational info */}
                <div className="lg:col-span-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Multiplicity Golden Rule</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-3 leading-relaxed">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Reading Association Limits</span>
                    </p>
                    <p className="text-slate-600">Always interpret multiplicities starting from the opposite class object perspective:</p>
                    <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 font-medium">
                      "For a single AI_AssistantSession instance, there is exactly 1 (1..1) Agent assigned to manage its data stream."
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* UML 3C: SEQUENCE DIAGRAM */}
            {activeUmlTab === 'sequence' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 relative flex flex-col justify-start min-h-[320px]">
                  
                  {/* Step controls */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Sequence step-by-step validator</span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSeqStep(prev => Math.max(1, prev - 1))}
                        className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono font-bold">Step {seqStep} of 4</span>
                      <button 
                        onClick={() => setSeqStep(prev => Math.min(4, prev + 1))}
                        className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message Lifelines grid */}
                  <div className="grid grid-cols-3 text-center font-mono text-xs relative h-48 border-b border-slate-200/50">
                    <div className="flex flex-col items-center">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold border border-blue-200 shadow-sm">:Agent</span>
                      <div className="w-0.5 bg-slate-300 h-full border-dashed border"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold border border-slate-300 shadow-sm">:AI_Controller</span>
                      <div className="w-0.5 bg-slate-300 h-full border-dashed border"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold border border-indigo-200 shadow-sm">:ClientProfile</span>
                      <div className="w-0.5 bg-slate-300 h-full border-dashed border"></div>
                    </div>

                    {/* Step-by-step vector arrows */}
                    <AnimatePresence mode="popLayout">
                      {seqStep >= 1 && (
                        <motion.div 
                          key="step-1"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="absolute top-8 left-[16%] right-[50%] border-t-2 border-blue-500 flex justify-center pt-1"
                        >
                          <span className="text-[9px] font-bold text-blue-600 bg-slate-50 px-1">1. analyzeNeeds()</span>
                          <div className="absolute right-0 -top-1.5 border-t-4 border-b-4 border-l-8 border-transparent border-l-blue-500"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence mode="popLayout">
                      {seqStep >= 2 && (
                        <motion.div 
                          key="step-2"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="absolute top-16 left-[50%] right-[16%] border-t-2 border-indigo-500 flex justify-center pt-1"
                        >
                          <span className="text-[9px] font-bold text-indigo-600 bg-slate-50 px-1">2. verifyBudgetConstraints()</span>
                          <div className="absolute right-0 -top-1.5 border-t-4 border-b-4 border-l-8 border-transparent border-l-indigo-500"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence mode="popLayout">
                      {seqStep >= 3 && (
                        <motion.div 
                          key="step-3"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="absolute top-24 left-[50%] right-[16%] border-t-2 border-indigo-500 flex justify-center pt-1"
                        >
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-1">3. return constraints status</span>
                          <div className="absolute left-0 -top-1.5 border-t-4 border-b-4 border-r-8 border-transparent border-r-slate-400"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence mode="popLayout">
                      {seqStep >= 4 && (
                        <motion.div 
                          key="step-4"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="absolute top-32 left-[16%] right-[50%] border-t-2 border-slate-400 border-dashed flex justify-center pt-1"
                        >
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-1">4. returnCopyDraft()</span>
                          <div className="absolute left-0 -top-1.5 border-t-4 border-b-4 border-r-8 border-transparent border-r-slate-400"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>

                {/* Right side educational info */}
                <div className="lg:col-span-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Methods Encapsulation Principle</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-3 leading-relaxed">
                    <p className="font-bold text-slate-800">Operations Placement Rules</p>
                    <p className="text-slate-600">Since <code>AI_Controller</code> sends the call `verifyBudgetConstraints()` to `ClientProfile`, the method must structurally exist on <strong>ClientProfile</strong>.</p>
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 font-medium">
                      "In OOP modeling, the receiving class's interface is always responsible for hosting and executing the incoming function payload."
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* UML 3D: STATE MACHINE DIAGRAM */}
            {activeUmlTab === 'state' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 relative flex flex-col justify-center min-h-[300px]">
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-slate-400 uppercase font-mono">Dynamic State Transition simulation</span>
                  
                  <div className="flex justify-around items-center py-4">
                    
                    {/* Active State block */}
                    <div className={`border-2 rounded-2xl p-4 w-40 text-center shadow-sm relative transition duration-300 ${
                      !isViolation ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      <div className="absolute top-[-10px] right-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Active</div>
                      <h4 className="font-bold text-sm">Active</h4>
                      <p className="text-[10px] mt-1 leading-relaxed">Publicly displayed and syndicated on APIs.</p>
                    </div>

                    {/* Transition Vector Arrow with bracketed Guard */}
                    <div className="flex-1 px-4 relative flex flex-col items-center">
                      <span className="text-[9px] font-bold text-slate-500 font-mono text-center leading-tight mb-2">
                        priceChanged<br />
                        <strong className="text-rose-600 font-bold">[deviation &gt; 20%]</strong>
                      </span>
                      <div className="w-full border-t-2 border-slate-300 relative">
                        <div className="absolute right-0 -top-1.5 border-t-4 border-b-4 border-l-8 border-transparent border-l-slate-400"></div>
                      </div>
                    </div>

                    {/* Suspended State block */}
                    <div className={`border-2 rounded-2xl p-4 w-40 text-center shadow-sm relative transition duration-300 ${
                      isViolation ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      <div className="absolute top-[-10px] right-2 bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Suspended</div>
                      <h4 className="font-bold text-sm">Suspended</h4>
                      <p className="text-[10px] mt-1 leading-relaxed">Locked. Triggers logSuspension() audit.</p>
                    </div>

                  </div>
                </div>

                {/* Right side educational info / manual pricing input */}
                <div className="lg:col-span-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manual Price Deviation Tester</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-3 leading-relaxed">
                    
                    <div class="space-y-1">
                      <label className="block font-bold text-slate-400 uppercase text-[9px]">True Market Value (HK$)</label>
                      <input 
                        type="number" 
                        value={marketPrice} 
                        onChange={(e) => setMarketPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-bold focus:outline-none" 
                      />
                    </div>

                    <div class="space-y-1">
                      <label className="block font-bold text-slate-400 uppercase text-[9px]">Proposed Update (HK$)</label>
                      <input 
                        type="number" 
                        value={proposedPrice} 
                        onChange={(e) => setProposedPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-bold focus:outline-none" 
                      />
                    </div>

                    <div className="border-t border-slate-200 pt-3 space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span class="text-slate-400">Deviation Percentage:</span>
                        <span className={`font-bold ${(deviationVal * 100) > 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {(deviationVal * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span class="text-slate-400">Guard Evaluates:</span>
                        <span className={`font-bold ${isViolation ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isViolation ? 'Tripped (Locked)' : 'Safe (Allowed)'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </motion.div>
        )}

        {/* TAB 3: ISOM3210 EXAM REVISION HUB */}
        {activeTab === 'revision' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            
            {/* Interactive Quiz Interface */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-md font-bold text-slate-900">ISOM3210 System Analysis Exam Quiz</h3>
                  <p className="text-xs text-slate-400">Practice questions extracted from corporate and academic assessment sheets.</p>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100/50">
                  Revision Mastery Score: {quizScore} / {Object.keys(answeredQuestions).length}
                </span>
              </div>

              {/* Main Quiz Flow */}
              <div className="space-y-6">
                
                {/* Question segment */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                  <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {REVISION_QUESTIONS[quizIndex].category}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base leading-relaxed">
                    {REVISION_QUESTIONS[quizIndex].question}
                  </h4>
                </div>

                {/* Multiple Choices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REVISION_QUESTIONS[quizIndex].choices.map((choice, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isAnswered = answeredQuestions[quizIndex];
                    const isSelected = selectedChoiceIndex === i;
                    
                    let bgClass = "bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/20";
                    if (isAnswered) {
                      if (choice.isCorrect) {
                        bgClass = "bg-emerald-50 border-emerald-500 text-emerald-800";
                      } else if (isSelected) {
                        bgClass = "bg-rose-50 border-rose-500 text-rose-800";
                      } else {
                        bgClass = "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={isAnswered}
                        onClick={() => handleAnswerSelection(i)}
                        className={`p-3.5 border rounded-xl flex items-start text-left space-x-3 transition duration-150 ${bgClass}`}
                      >
                        <span className="bg-slate-100 text-slate-700 font-mono font-bold text-xs px-2 py-1 rounded shadow-sm">
                          {letter}
                        </span>
                        <span className="text-xs font-semibold">{choice.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Rationale feedback panel */}
                {showRationale && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800 space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Academic Rationale & Slide Analysis</span>
                    </p>
                    <p className="leading-relaxed">
                      {REVISION_QUESTIONS[quizIndex].rationale}
                    </p>
                  </div>
                )}

                {/* Question navigations */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400 font-semibold font-mono">
                    Question {quizIndex + 1} of {REVISION_QUESTIONS.length}
                  </span>
                  <button 
                    onClick={handleNextQuiz}
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 transition flex items-center gap-1.5"
                  >
                    <span>Next Exam Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}

      </div>

    </div>
  );
}
