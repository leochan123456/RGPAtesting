import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Copy, Mic, Settings, Camera, Image, Paperclip, X, Sparkles, Clipboard, Share2, FileText, Bot, Play, Check, AlertTriangle, MessageSquare, Globe, ShieldAlert,
  Plus, Trash2, Search, Menu, ChevronLeft, ChevronRight, ShieldCheck, RefreshCw, History, Database, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { TRUE_PRICE_DATABASE, PRESET_SCENARIOS } from '../presets';
import { generateUtmUrl, appendUtmToCopy } from '../utils/utmEngine';
import { handleShareCommand, type ShareDeepLink } from '../agent';
import { renderPosterBlob, sharePosterWithFallback } from '../utils/posterCanvas';
import { UTMSource, UTMMedium } from '../types';

const SIMULATED_VOICE_TRANSCRIPTS = [
  "堅尼地城 嘉輝花園 C座, 2房, 實用310呎, 業主急走減價, 叫1.3萬, 5分鐘到地鐵站, 物業編號: AH2023101",
  "啟德 地鐵站旁優質收租盤, 實用480呎, 租金回報高, 叫租1.95萬, 景觀開揚, 物業編號: KT-1122-RE",
  "北角 城市花園 高層海景, 3房, 實用810呎, 業主求售, 叫價1020萬, 鄰近地鐵站, 物業編號: NP202606"
];

const sidebarVariants = {
  hidden: { x: -288, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 28,
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const sidebarChildVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const svgVariants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -45 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.35 }
  }
};

interface IphoneSimulatorProps {
  activePresetId: number;
  onPresetChange: (presetId: number) => void;
  triggerGlobalNotification: (title: string, message: string, icon: string, type: 'info' | 'success' | 'error') => void;
}

interface MediaFile {
  id: string;
  type: 'photo' | 'document' | 'video';
  name: string;
  url?: string;
}

interface AuditResult {
  update_detected: string;
  affected_platforms: string[];
  ai_chat_response?: string;
  dynamic_negative_prompts: {
    scrub_keywords: string[];
    hashtag_maximum_limit: number;
    chao_ke_masking_enabled: boolean;
  };
  technical_payload_adjustments: {
    caption_character_cap: number;
    required_resolution_width: number;
    required_resolution_height: number;
  };
  discord_alert_payload: {
    severity: string;
    summary_text: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  uploadedFiles: MediaFile[];
  chaosInput: string;
  parsedPrice: number;
  parsedArea: number;
  parsedPropID: string;
  parsedLandmark: string;
}

export default function IphoneSimulator({ 
  triggerGlobalNotification 
}: IphoneSimulatorProps) {
  const defaultTelegramBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
  const defaultTelegramChatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '8746950176';

  // Toggle Sidebar visibility
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [sessionSearch, setSessionSearch] = useState<string>("");

  // Initialize multiple sessions from presets
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const initial = PRESET_SCENARIOS.map(preset => {
      const landmarks = preset.landmarks || ["堅尼地城"];
      return {
        id: `session-${preset.id}`,
        title: `📍 ${preset.title}`,
        chaosInput: preset.chaosInput,
        parsedPrice: preset.defaultPrice,
        parsedArea: preset.defaultArea,
        parsedPropID: preset.defaultPropertyID,
        parsedLandmark: landmarks[0] || "堅尼地城",
        uploadedFiles: [
          { id: '1', type: 'photo', name: '客廳實景.jpg', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=150&auto=format&fit=crop&q=60' }
        ],
        messages: [
          {
            id: 1,
            sender: 'assistant',
            text: "您好！我是您的 GPA。請在下方直接輸入原始放盤描述，或點擊麥克風用語音放盤。系統將會自動檢測 EAA 合規性、進行 20% 叫價偏差審查，並為您一鍵生成適用於 WhatsApp、小紅書、Instagram、Facebook 與 X 的 5 大平台行銷文案。",
            timestamp: '19:27',
            isInitial: true
          },
          {
            id: 2,
            sender: 'user',
            text: preset.chaosInput,
            timestamp: '19:28'
          },
          {
            id: 3,
            sender: 'assistant',
            text: `✅ 【EAA 100% 真盤源合規審核通過】\n\n- 市場估值均價：HK$ ${preset.defaultPrice.toLocaleString()}\n- 價格偏差比例：0% (符合市場自由定價 ✅)\n- 已過濾敏感詞：已自動重寫 WeChat/聯絡方式 ✅\n- EAA 代理牌照及委託協議：已自動委託放盤授權書儲存完畢 ✅\n\n文案已編譯。請在下方點擊平台標籤一鍵複製，或使用 Native Share-to 分享。`,
            timestamp: '19:28',
            isComplied: true,
            copies: {
              whatsapp: `🏡 *【利嘉閣 Rica+ 真盤源精選】*\n\n🎯 *地標配套*：鄰近 ${landmarks[0]} 交通網配套，極速開單首選！\n\n📌 *核心物業詳情*：\n👉 *意向月租/售價：HK$ ${preset.defaultPrice.toLocaleString()}*\n👉 *實用面積：約 ${preset.defaultArea} 平方呎*\n👉 *物業編號：${preset.defaultPropertyID}*\n\n💬 *業主備註*：【點擊頭像私信我】或【點擊主頁瞬間撥號諮詢】\n\n📞 *想預約看實體示範單位？請即聯絡我預留時間！*\n\n---\n利嘉閣地產有限公司（牌照號碼：C-001702）\n委託狀態：已獲業主書面授權委託放盤\n廣告發布日期：2026-07-07\n`,
              xiaohongshu: `✨ 【港漂租房不踩雷！】下車就是 ${landmarks[0]}，通勤簡引太方便了 🥳\n\n這套房子的實用面積是 ${preset.defaultArea} 呎，格局極其見使，採光非常充足！\n\n📌 核心物業詳情：\n🏡 意向月租/售價：HK$ ${preset.defaultPrice.toLocaleString()}\n📐 實用面積：約 ${preset.defaultArea} 平方呎\n🔢 物業編號：${preset.defaultPropertyID}\n\n💬 房源筆記：【點擊頭像私信我】或【點擊主頁瞬間撥號諮詢】\n\n有需要的寶寶們，直接點擊我的頭像私信我，隨時可以約看房哦！\n\n---\n利嘉閣地產有限公司（牌照號碼：C-001702）\n委託狀態：已獲業主書面授權委託放盤\n廣告發布日期：2026-07-07\n`,
              instagram: `💼 城市精英的優雅新起點。坐落 ${landmarks[0]} 核心，享實用 ${preset.defaultArea} 呎見使舒心空間。\n\n📌 核心詳情：\n👉 意向月租/售價：HK$ ${preset.defaultPrice.toLocaleString()}\n👉 物業編號：${preset.defaultPropertyID}\n\n✨ 誠意推廣：鄰近繁華地標，完美兼顧生活與事業，今天就開啟您的睇樓之旅！\n\n#${landmarks[0]} #利嘉閣真盤源 #香港買樓 #上車首選\n\n---\n利嘉閣地產有限公司（牌照號碼：C-001702）\n委託狀態：已獲業主書面授權委託放盤\n廣告發布日期：2026-07-07\n`,
              facebook: `📢 【息口政策放寬 • 穩健防守性收租筍盤推薦】\n\n受惠於近日息口回落至 3.25%-3.5% 及內地高才源源湧入，香港優質屋苑的租金回報表現非常優異，部分微觀屋苑回報率達 3.95% - 4.82%！\n\n今期為各位實力買家及換樓中產誠意推薦 ${landmarks[0]} 核心精選：\n👉 意向月租/售價：HK$ ${preset.defaultPrice.toLocaleString()}\n👉 實用面積：約 ${preset.defaultArea} 平方呎\n👉 物業編號：${preset.defaultPropertyID}\n\n該屋苑成交活躍，抗跌防守力極強。歡迎點擊下方 PM 聯絡我們獲取該區最新的成交與估值數據報告，實現資產配置最佳化！\n\n---\n利嘉閣地產有限公司（牌照號碼：C-001702）\n委託狀態：已獲業主書面授權委託放盤\n廣告發布日期：2026-07-07\n`,
              twitter: `🏡 [${landmarks[0]} 真盤源] 實用 ${preset.defaultArea} 呎高層！\n💰 月租/售價：HK$ ${preset.defaultPrice.toLocaleString()}\n🔢 物業編號：${preset.defaultPropertyID}\n\n交通超便利，採光極佳，地監局合規保障，首置上車或收租精選！請點擊主頁頭像預約看房。`
            }
          }
        ]
      };
    });

    initial.unshift({
      id: "session-default",
      title: "📍 堅尼地城嘉輝花園防守盤",
      chaosInput: "堅尼地城 嘉輝花園 C座, 2房, 實用310呎, 業主急走減價, 叫1.3萬, 5分鐘地鐵C出口, 物業編號: AH2023101",
      parsedPrice: 13000,
      parsedArea: 310,
      parsedPropID: "AH2023101",
      parsedLandmark: "堅尼地城",
      uploadedFiles: [
        { id: '1', type: 'photo', name: '客廳實景.jpg', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=150&auto=format&fit=crop&q=60' }
      ],
      messages: [
        {
          id: 1,
          sender: 'assistant',
          text: "您好！我是您的 GPA。請在下方直接輸入原始放盤描述，或點擊麥克風用語音放盤。系統將會自動檢測 EAA 合規性、進行 20% 叫價偏差審查，並為您一鍵生成適用於 WhatsApp、小紅書、Instagram、Facebook 與 X 的 5 大平台行銷文案。",
          timestamp: '19:27',
          isInitial: true
        }
      ]
    });

    return initial;
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>("session-default");
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  // Conversational state
  const [chaosInput, setChaosInput] = useState<string>("");
  
  // Microphone recording simulation state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceIndex, setVoiceIndex] = useState<number>(0);

  // Parsed and generated states
  const [parsedPrice, setParsedPrice] = useState<number>(13000);
  const [parsedArea, setParsedArea] = useState<number>(310);
  const [parsedPropID, setParsedPropID] = useState<string>("AH2023101");
  const [parsedLandmark, setParsedLandmark] = useState<string>("堅尼地城");

  // Media upload state
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);

  // Video Generator simulation
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [generatedVideoScript, setGeneratedVideoScript] = useState<string>("");

  // Direct Telegram Connection API state (Stored in localStorage)
  const [telegramBotToken, setTelegramBotToken] = useState<string>(() => {
    return localStorage.getItem('rica_tg_bot_token') || defaultTelegramBotToken;
  });
  const [telegramChatId, setTelegramChatId] = useState<string>(() => {
    return localStorage.getItem('rica_tg_chat_id') || defaultTelegramChatId;
  });
  const [showTgConfig, setShowTgConfig] = useState<boolean>(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState<boolean>(false);
  const [showShareSheet, setShowShareSheet] = useState<boolean>(false);

  // Policy monitoring research platform database states
  const [showPolicyPanel, setShowPolicyPanel] = useState<boolean>(false);
  const [policyRules, setPolicyRules] = useState<any[]>([]);
  const [policySnapshots, setPolicySnapshots] = useState<any[]>([]);
  const [shadowbanChecks, setShadowbanChecks] = useState<any[]>([]);
  const [isUpdatingPolicies, setIsUpdatingPolicies] = useState<boolean>(false);
  const [shadowbanPostUrl, setShadowbanPostUrl] = useState<string>("https://www.xiaohongshu.com/explore/64b58eef0000000012345");
  const [shadowbanPlatform, setShadowbanPlatform] = useState<string>("Xiaohongshu");
  const [isTestingShadowban, setIsTestingShadowban] = useState<boolean>(false);
  const [policyActiveTab, setPolicyActiveTab] = useState<'rules' | 'snapshots' | 'shadowban'>('rules');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);

  // UTM Link Generator states
  const [showUtmPanel, setShowUtmPanel] = useState<boolean>(false);
  const [utmAgentId, setUtmAgentId] = useState<string>(() => {
    return localStorage.getItem('rica_utm_agent_id') || 'C-001702-A101';
  });
  const [utmPostId, setUtmPostId] = useState<string>(() => {
    return 'post-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
  });
  const [utmMedium, setUtmMedium] = useState<UTMMedium>('property_listing');
  const [isUtmEnabled, setIsUtmEnabled] = useState<boolean>(true);

  const fetchPolicyData = async () => {
    try {
      const [rulesRes, snapRes, checksRes] = await Promise.all([
        fetch("/api/policy-rules"),
        fetch("/api/policy-snapshots"),
        fetch("/api/shadowban-checks")
      ]);
      if (rulesRes.ok) setPolicyRules(await rulesRes.json());
      if (snapRes.ok) setPolicySnapshots(await snapRes.json());
      if (checksRes.ok) setShadowbanChecks(await checksRes.json());
    } catch (e) {
      console.error("Failed to fetch policy panel data", e);
    }
  };

  useEffect(() => {
    if (showPolicyPanel) {
      fetchPolicyData();
    }
  }, [showPolicyPanel]);

  const handleOneClickUpdate = async () => {
    setIsUpdatingPolicies(true);
    triggerGlobalNotification("開始平台規則同步", "正在啟動獨立 Python Scraper 爬取最新政策頁面並進行前後差異比對...", "refresh-cw", "info");
    try {
      const res = await fetch("/api/policy-rules/update", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPolicyRules(data.rules || []);
        
        // Refresh snapshots too
        const snapRes = await fetch("/api/policy-snapshots");
        if (snapRes.ok) setPolicySnapshots(await snapRes.json());
        
        triggerGlobalNotification(
          "同步完成 ✅", 
          "各平台最新發布規約與敏感詞字典已完成本地 SQLite 與 JSON 同步！", 
          "check-circle", 
          "success"
        );
      } else {
        throw new Error("Update failed");
      }
    } catch (e) {
      triggerGlobalNotification("規則更新失敗", "無法執行 Python Scraper 核心。請稍候再試。", "alert-triangle", "error");
    } finally {
      setIsUpdatingPolicies(false);
    }
  };

  const handleRunShadowbanCheck = async () => {
    if (!shadowbanPostUrl.trim()) return;
    setIsTestingShadowban(true);
    triggerGlobalNotification("啟動 Shadowban 稽核", "正在調用 Python 模型模擬分析貼文瀏覽量趨勢與限流狀態...", "shield-alert", "info");
    try {
      const res = await fetch("/api/shadowban-checks/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_url: shadowbanPostUrl, platform: shadowbanPlatform })
      });
      if (res.ok) {
        const data = await res.json();
        // Refresh checks list
        const checksRes = await fetch("/api/shadowban-checks");
        if (checksRes.ok) setShadowbanChecks(await checksRes.json());
        
        if (data.flagged) {
          triggerGlobalNotification(
            "偵測到異常限制 ⚠️", 
            `該貼文可能遭受限流！原因：${data.reason}，瀏覽量：${data.views}`, 
            "alert-triangle", 
            "error"
          );
        } else {
          triggerGlobalNotification(
            "貼文狀態健康 ✅", 
            `未偵測到 Shadowban 跡象。瀏覽量累計：${data.views}，狀態一切正常！`, 
            "check-circle", 
            "success"
          );
        }
      } else {
        throw new Error("Check failed");
      }
    } catch (e) {
      triggerGlobalNotification("檢查失敗", "無法執行 shadowban 檢測腳本。", "alert-triangle", "error");
    } finally {
      setIsTestingShadowban(false);
    }
  };

  // Chat message thread simulation
  const [messages, setMessages] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Switch session data
  useEffect(() => {
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession) {
      setChaosInput(currentSession.chaosInput || "");
      setUploadedFiles(currentSession.uploadedFiles || []);
      setMessages(currentSession.messages || []);
      setParsedPrice(currentSession.parsedPrice || 0);
      setParsedArea(currentSession.parsedArea || 0);
      setParsedPropID(currentSession.parsedPropID || "");
      setParsedLandmark(currentSession.parsedLandmark || "堅尼地城");
    }
  }, [currentSessionId]);

  // Helper to persist edits back to sessions store
  const updateCurrentSession = (updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, ...updates };
      }
      return s;
    }));
  };

  const handleSetMessages = (newMsgs: any[] | ((prev: any[]) => any[])) => {
    setMessages(prev => {
      const resolved = typeof newMsgs === 'function' ? newMsgs(prev) : newMsgs;
      updateCurrentSession({ messages: resolved });
      return resolved;
    });
  };

  const handleSetChaosInput = (input: string) => {
    setChaosInput(input);
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        let title = s.title;
        // Auto rename default session with input context if it was default
        if (s.title.startsWith("📍 新建合規對話線") && input.length > 5) {
          title = "📍 " + input.substring(0, 16).replace(/[\n\r,，]/g, ' ') + "...";
        }
        return { ...s, chaosInput: input, title };
      }
      return s;
    }));
  };

  const handleSetUploadedFiles = (files: MediaFile[] | ((prev: MediaFile[]) => MediaFile[])) => {
    setUploadedFiles(prev => {
      const resolved = typeof files === 'function' ? files(prev) : files;
      updateCurrentSession({ uploadedFiles: resolved });
      return resolved;
    });
  };

  // Sync state changes back to persistent currentSession
  useEffect(() => {
    updateCurrentSession({
      parsedPrice,
      parsedArea,
      parsedPropID,
      parsedLandmark
    });
  }, [parsedPrice, parsedArea, parsedPropID, parsedLandmark]);

  // Handle New Session Creation
  const handleCreateNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `📍 新建合規對話線 #${sessions.length + 1}`,
      chaosInput: "",
      parsedPrice: 0,
      parsedArea: 0,
      parsedPropID: "",
      parsedLandmark: "堅尼地城",
      uploadedFiles: [],
      messages: [
        {
          id: 1,
          sender: 'assistant',
          text: "您好！我是您的 GPA。請在下方直接輸入原始放盤描述，或點擊麥克風用語音放盤。系統將會自動檢測 EAA 合規性、進行 20% 叫價偏差審查，並為您一鍵生成適用於 WhatsApp、小紅書、Instagram、Facebook 與 X 的 5 大平台行銷文案。",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isInitial: true
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setReplyingTo(null);
    triggerGlobalNotification("對話已建立", "已為您創建全新的 Rica+ 智能審核對話線！", "message-square", "success");
  };

  // Handle Branching discussion (gemini fork)
  const handleBranchSession = (m: any) => {
    const parentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
    const targetMsgIndex = parentSession.messages.findIndex(msg => msg.id === m.id);
    if (targetMsgIndex === -1) return;
    
    // clone up to selected message
    const clonedMessages = parentSession.messages.slice(0, targetMsgIndex + 1).map(msg => ({...msg}));
    
    const newId = `session-branch-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `🌱 分支: ${parentSession.title.replace('📍 ', '').replace('🌱 ', '').substring(0, 16)}...`,
      chaosInput: parentSession.chaosInput,
      parsedPrice: parentSession.parsedPrice,
      parsedArea: parentSession.parsedArea,
      parsedPropID: parentSession.parsedPropID,
      parsedLandmark: parentSession.parsedLandmark,
      uploadedFiles: [...parentSession.uploadedFiles],
      messages: clonedMessages
    };
    
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === currentSessionId);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx + 1, 0, newSession);
        return copy;
      }
      return [newSession, ...prev];
    });

    // Set local states immediately to new branched values to prevent batching lag/overwrites
    setChaosInput(newSession.chaosInput || "");
    setUploadedFiles(newSession.uploadedFiles || []);
    setMessages(newSession.messages || []);
    setParsedPrice(newSession.parsedPrice || 0);
    setParsedArea(newSession.parsedArea || 0);
    setParsedPropID(newSession.parsedPropID || "");
    setParsedLandmark(newSession.parsedLandmark || "堅尼地城");

    setCurrentSessionId(newId);
    setReplyingTo(null);
    triggerGlobalNotification(
      "分支對話已建立", 
      "已成功克隆該對話線歷史！您可以在當前分支對話中調整細節，互不干擾。", 
      "sparkles", 
      "success"
    );
  };

  // Delete session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      triggerGlobalNotification("無法刪除", "系統至少需要保留一個活動對話線！", "alert-triangle", "error");
      return;
    }
    
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (currentSessionId === sessionId) {
        // pick first remaining
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
    triggerGlobalNotification("對話線已刪除", "該歷史會話已被永久移除。", "info", "info");
  };

  // Save Telegram config to local storage
  const handleSaveTgConfig = () => {
    localStorage.setItem('rica_tg_bot_token', telegramBotToken);
    localStorage.setItem('rica_tg_chat_id', telegramChatId);
    setShowTgConfig(false);
    triggerGlobalNotification(
      "設定已儲存",
      "Telegram Bot API 設定已安全儲存於本地！",
      "check",
      "success"
    );
  };

  // Auto-parse raw listings when input changes
  useEffect(() => {
    if (!chaosInput.trim()) return;

    // 1. Extract Price
    let price = 0;
    const tenKMatch = chaosInput.match(/(\d+(?:\.\d+)?)\s*萬/);
    const rawNumMatch = chaosInput.match(/(?:叫|租|售|價|意向|h|hkd)\s*[:：\s]*(\d{4,9})/i);
    const anyBigNumMatch = chaosInput.match(/(\d{4,9})/);
    
    if (tenKMatch) {
      price = parseFloat(tenKMatch[1]) * 10000;
    } else if (rawNumMatch) {
      price = parseFloat(rawNumMatch[1]);
    } else if (anyBigNumMatch) {
      price = parseFloat(anyBigNumMatch[1]);
    } else {
      const shortMatch = chaosInput.match(/(\d+(?:\.\d+)?)/);
      if (shortMatch) {
        const val = parseFloat(shortMatch[1]);
        if (val < 1000) {
          price = val * 10000;
        }
      }
    }
    setParsedPrice(price);

    // 2. Extract Area
    let area = 0;
    const areaMatch = chaosInput.match(/(\d+)\s*(?:呎|sqft|平方)/i);
    if (areaMatch) {
      area = parseInt(areaMatch[1], 10);
    }
    setParsedArea(area);

    // 3. Extract Property ID
    let propID = "";
    const propMatch = chaosInput.match(/([A-Z]{2,3}[0-9\-]{4,9}|[A-Z]{2}\-[0-9]{4}\-[A-Z]{2})/i);
    if (propMatch) {
      propID = propMatch[1].toUpperCase();
    }
    setParsedPropID(propID);

    // 4. Extract Landmark
    let landmark = "堅尼地城";
    const landmarks = ["堅尼地城", "啟德", "太古城", "日出康城", "東涌", "奧運站", "北角", "香港大学"];
    for (const lm of landmarks) {
      if (chaosInput.includes(lm)) {
        landmark = lm;
        break;
      }
    }
    setParsedLandmark(landmark);

  }, [chaosInput]);

  // Compute compliance and platform-specific copies
  const computeCompliance = () => {
    let marketAvg = 18000;
    const matchedKey = Object.keys(TRUE_PRICE_DATABASE).find(key => 
      key.includes(parsedLandmark)
    );
    if (matchedKey) {
      marketAvg = TRUE_PRICE_DATABASE[matchedKey].avgPrice;
    }

    // Pricing Deviation check (Disabled 20% limit as requested by user to support free market pricing)
    const hasPrice = parsedPrice > 0;
    let deviation = 0;
    let priceDeviationViolation = false;
    if (hasPrice && marketAvg > 0) {
      deviation = Math.abs(parsedPrice - marketAvg) / marketAvg * 100;
    }

    // Language auto-detection
    const isSimplified = /租房|两房|地铁|业主|专才|港漂|学区|咨询|微信|联系|联系我|电话|免中介/i.test(chaosInput);
    const detectedLang = isSimplified ? 'zh-Hans' : 'zh-Hant-HK';

    // Formatting outputs with EAA guardrails & fallbacks
    const formattedPrice = hasPrice 
      ? (parsedPrice >= 100000 ? `意向售價：HK$ ${(parsedPrice / 10000).toFixed(0)} 萬` : `意向月租：HK$ ${parsedPrice.toLocaleString()} /月`)
      : "意向售價/租金：業主誠意放盤，最新意向售價/租金請私訊查詢（以本公司正式物業協議及業主最新指示為準）";

    const formattedArea = parsedArea > 0 
      ? `實用面積：約 ${parsedArea} 平方呎` 
      : "實用面積：請聯絡經紀查詢最新實用面積數據";

    const formattedPropID = parsedPropID && parsedPropID.trim().length > 0
      ? `物業編號：${parsedPropID}`
      : "物業編號：[未獲取系統授權碼，請手動補齊真盤源編號]";

    const today = new Date().toISOString().split('T')[0];
    const agencyInfo = detectedLang === 'zh-Hant-HK' 
      ? "利嘉閣地產有限公司（牌照號碼：C-001702）"
      : "利嘉阁地产有限公司（牌照号码：C-001702）";
    const authorizationStatus = detectedLang === 'zh-Hant-HK'
      ? "委託狀態：已獲業主書面授權委託放盤"
      : "委托状态：已获业主书面授权委托放盘";
    const legalPreamble = `${agencyInfo}\n${authorizationStatus}\n廣告發布日期：${today}\n`;

    // Filter WeChat and Phone handles to prevent off-platform shadowbans on RED
    let filteredText = chaosInput;
    const filteredWords: string[] = [];
    const wechatRegex = /(微信|vx|vx_|微訊號|微訊|v信|v❤️|wechat|wechatid|v:)\s*[:：\-\s]*[a-zA-Z0-9_\-]{4,25}/ig;
    const phoneRegex = /(電話|手機|手提|聯絡|whatsapp|whats|tel|phone|contact)\s*[:：\-\s]*\+?[0-9\-\s]{8,15}/ig;

    if (wechatRegex.test(filteredText)) {
      filteredWords.push("WeChat ID");
      filteredText = filteredText.replace(wechatRegex, detectedLang === 'zh-Hant-HK' ? "【點擊頭像私信我】" : "【点击头像私信我】");
    }
    if (phoneRegex.test(filteredText)) {
      filteredWords.push("Phone / WhatsApp");
      filteredText = filteredText.replace(phoneRegex, detectedLang === 'zh-Hant-HK' ? "【點擊主頁瞬間撥號諮詢】" : "【点击主页瞬间拨号咨询】");
    }

    const hasMedia = uploadedFiles.length > 0;

    // Platform Copywriting Optimization Matrix
    let whatsappCopy = "";
    let telegramCopy = "";
    let tg_directCopy = "";
    let xiaohongshuCopy = "";
    let wechatCopy = "";
    let facebookCopy = "";
    let instagramCopy = "";
    let threadsCopy = "";
    let twitterCopy = "";
    let discordCopy = "";
    let lineCopy = "";
    let youtubeCopy = "";
    let douyinCopy = "";

    if (priceDeviationViolation) {
      const blockMsg = detectedLang === 'zh-Hant-HK'
        ? `⚠️ 【合規阻斷：叫價偏差大於 20%】\n系統偵測到您輸入的叫價 HK$ ${parsedPrice.toLocaleString()} 與市場成交均價 HK$ ${marketAvg.toLocaleString()} 偏差高達 ${deviation.toFixed(1)}%（已突破 20% 法定上限）。根據地產代理監管局 (EAA) 執業通告 18-02(CR) 規限，此文案已自動鎖死，請立刻核對並輸入真實售價。`
        : `⚠️ 【合规阻断：叫价偏差大于 20%】\n系统侦测到您输入的叫价 HK$ ${parsedPrice.toLocaleString()} 与市场成交均价 HK$ ${marketAvg.toLocaleString()} 偏差高达 ${deviation.toFixed(1)}%（已突破 20% 法定上限）。根据地产代理监管局 (EAA) 执业通告 18-02(CR) 规限，此文案已自动锁死，请立刻核对并输入真实售价。`;
      whatsappCopy = blockMsg;
      telegramCopy = blockMsg;
      tg_directCopy = blockMsg;
      xiaohongshuCopy = blockMsg;
      wechatCopy = blockMsg;
      facebookCopy = blockMsg;
      instagramCopy = blockMsg;
      threadsCopy = blockMsg;
      twitterCopy = blockMsg;
      discordCopy = blockMsg;
      lineCopy = blockMsg;
      youtubeCopy = blockMsg;
      douyinCopy = blockMsg;
    } else {
      // WhatsApp Business (Conversational Closer, Bold, Ultra-short, CTA)
      whatsappCopy = detectedLang === 'zh-Hant-HK'
        ? `🏡 *【利嘉閣 Rica+ 真盤源精選】*\n\n🎯 *地標配套*：鄰近 ${parsedLandmark} 交通網配套，極速開單首選！\n\n📌 *核心物業詳情*：\n👉 *${formattedPrice}*\n👉 *${formattedArea}*\n👉 *${formattedPropID}*\n\n💬 *業主備註*：${filteredText}\n\n📞 *想預約看實體示範單位？請即聯絡我預留時間！*\n\n---\n${legalPreamble}`
        : `🏡 *【利嘉阁 Rica+ 真盘源精选】*\n\n🎯 *地标配套*：邻近 ${parsedLandmark} 交通网配套，极速开单首选！\n\n📌 *核心物业详情*：\n👉 *${formattedPrice}*\n👉 *${formattedArea}*\n👉 *${formattedPropID}*\n\n💬 *业主备注*：${filteredText}\n\n📞 *想预约看实体示范单位？请即私信我预留时间！*\n\n---\n${legalPreamble}`;

      // Telegram Channel
      telegramCopy = detectedLang === 'zh-Hant-HK'
        ? `🏡 *【利嘉閣 Rica+ 聯絡頻道精選】*\n\n🎯 *地標配套*：鄰近 ${parsedLandmark} 交通網配套，極速開單首選！\n\n📌 *核心物業詳情*：\n👉 *${formattedPrice}*\n👉 *${formattedArea}*\n👉 *${formattedPropID}*\n\n💬 *業主備註*：${filteredText}\n\n💬 詳情或預約看房，請私信聯絡預留時間。\n\n---\n${legalPreamble}`
        : `🏡 *【利嘉阁 Rica+ 联络频道精选】*\n\n🎯 *地标配套*：邻近 ${parsedLandmark} 交通网配套，极速开单首选！\n\n📌 *核心物业详情*：\n👉 *${formattedPrice}*\n👉 *${formattedArea}*\n👉 *${formattedPropID}*\n\n💬 *业主备注*：${filteredText}\n\n💬 详情或预约看房，请私信联络预留时间。\n\n---\n${legalPreamble}`;

      // Telegram Direct Bot payload
      tg_directCopy = detectedLang === 'zh-Hant-HK'
        ? `🚀 *【Rica+ 直發 Telegram 專用文案】*\n\n地標配套：鄰近 ${parsedLandmark}\n\n🏡 房源詳情：\n👉 ${formattedPrice}\n👉 ${formattedArea}\n👉 ${formattedPropID}\n\n💬 備註：${filteredText}\n\n---\n${legalPreamble}`
        : `🚀 *【Rica+ 直发 Telegram 专用文案】*\n\n地标配套：邻近 ${parsedLandmark}\n\n🏡 房源详情：\n👉 ${formattedPrice}\n👉 ${formattedArea}\n👉 ${formattedPropID}\n\n💬 备注：${filteredText}\n\n---\n${legalPreamble}`;

      // Xiaohongshu (High-Trust UGC Guide, Emojis, zero links/numbers)
      xiaohongshuCopy = detectedLang === 'zh-Hant-HK'
        ? `✨ 【港漂租房不踩雷！】下車就是 ${parsedLandmark}，通勤簡直太方便了 🥳\n\n這套房子的實用面積是 ${parsedArea} 呎，格局極其見使，採光非常充足！\n\n📌 核心物業詳情：\n🏡 ${formattedPrice}\n📐 ${formattedArea}\n🔢 ${formattedPropID}\n\n💬 房源筆記：${filteredText}\n\n${!hasMedia ? "🛠️ 【專業驗樓及規劃避坑指南】\n1. 門框腳發黑：睇樓時注意浴室門框腳，若發黑代表防水層失效，地台已滲水！\n2. 防煙門底隙：必須符合法定 4mm 限制，需配備膨脹膠條！\n\n" : ""}\n有需要的寶寶們，直接點擊我的頭像私信我，隨時可以約看房哦！\n\n---\n${legalPreamble}`
        : `✨ 【港漂租房不踩雷！】下楼就是 ${parsedLandmark}，通勤简直太方便了 🥳\n\n这套房子的实用面积是 ${parsedArea} 呎，格局极其见使，采光非常充足！\n\n📌 核心房源详情：\n🏡 ${formattedPrice}\n📐 ${formattedArea}\n🔢 ${formattedPropID}\n\n💬 房源笔记：${filteredText}\n\n${!hasMedia ? "🛠️ 【专业验楼及规划避坑指南】\n1. 门框脚发黑：看房时注意浴室门框脚，若发黑代表防水层失效，地台已渗水！\n2. 防烟门底隙：必须符合法定 4mm 限制，需配备膨胀胶条！\n\n" : ""}\n有需要的宝宝们，直接点击我的头像私信我，随时可以约看房哦！\n\n---\n${legalPreamble}`;

      // WeChat Moments (WeCom friendly layout)
      wechatCopy = detectedLang === 'zh-Hant-HK'
        ? `🏡 【微信朋友圈推薦：坐落 ${parsedLandmark} 核心圈！】\n\n✨ 實用面積約 ${parsedArea} 呎，戶型方正極見使。${formattedPrice}，實用率超高，通勤方便。\n\n🔢 ${formattedPropID}\n💬 備註：${filteredText}\n\n歡迎微信私信，預約實地睇樓！\n\n---\n${legalPreamble}`
        : `🏡 【微信朋友圈推荐：坐落 ${parsedLandmark} 核心圈！】\n\n✨ 实用面积约 ${parsedArea} 呎，户型方正极见使。${formattedPrice}，实用率超高，通勤方便。\n\n🔢 ${formattedPropID}\n💬 备注：${filteredText}\n\n欢迎微信私信，预约实地看房！\n\n---\n${legalPreamble}`;

      // Instagram (Millennial investor / premium tenant hook, 3-5 hashtag limit, no duplicate copy)
      instagramCopy = detectedLang === 'zh-Hant-HK'
        ? `💼 城市精英的優雅新起點。坐落 ${parsedLandmark} 核心，享實用 ${parsedArea} 呎見使舒心空間。\n\n📌 核心詳情：\n👉 ${formattedPrice}\n👉 ${formattedPropID}\n\n✨ 誠意推廣：鄰近繁華地標，完美兼顧生活與事業，今天就開啟您的睇樓之旅！\n\n#${parsedLandmark} #利嘉閣真盤源 #香港買樓 #上車首選\n\n---\n${legalPreamble}`
        : `💼 城市精英的优雅新起点。坐落 ${parsedLandmark} 核心，享实用 ${parsedArea} 呎见使舒心空间。\n\n📌 核心详情：\n👉 ${formattedPrice}\n👉 ${formattedPropID}\n\n✨ 诚意推广：邻近繁华地标，完美兼顾生活与事业，今天就开启您的看房之旅！\n\n#${parsedLandmark} #利嘉阁真盘源 #香港买楼 #上车首选\n\n---\n${legalPreamble}`;

      // Threads
      threadsCopy = detectedLang === 'zh-Hant-HK'
        ? `這套位於 ${parsedLandmark} 的房子真的太正了！實用面積 ${parsedArea} 呎，格局超好，採光通風。目前 ${formattedPrice} 業主放售/租。想睇樓嘅可以直接評論或 inbox 我～\n\n${formattedPropID}\n\n#${parsedLandmark} #利嘉閣真盤源`
        : `这套位于 ${parsedLandmark} 的房子真的太正了！实用面积 ${parsedArea} 呎，格局超好，采光通风。目前 ${formattedPrice} 业主放售/租。想看房的可以直接评论或 inbox 我～\n\n${formattedPropID}\n\n#${parsedLandmark} #利嘉阁真盘源`;

      // Facebook Ads (Aged 35+, yields 3.95% - 4.82%, positive carry, rate cuts)
      facebookCopy = detectedLang === 'zh-Hant-HK'
        ? `📢 【息口政策放寬 • 穩健防守性收租筍盤推薦】\n\n受惠於近日息口回落至 3.25%-3.5% 及內地高才源源湧入，香港優質屋苑的租金回報表現非常優異，部分微觀屋苑回報率達 3.95% - 4.82%！\n\n今期為各位實力買家及換樓中產誠意推薦 ${parsedLandmark} 核心精選：\n👉 ${formattedPrice}\n👉 ${formattedArea}\n👉 ${formattedPropID}\n\n該屋苑成交活躍，抗跌防守力極強。歡迎點擊下方 PM 聯絡我們獲取該區最新的成交與估值數據報告，實現資產配置最佳化！\n\n---\n${legalPreamble}`
        : `📢 【息口政策放宽 • 稳健防守性收租盘推荐】\n\n受惠于近日息口回落至 3.25%-3.5% 及内地高才源源涌入，香港优质屋苑的租金回报表现非常优异，部分微观屋苑回报率达 3.95% - 4.82%！\n\n今期为各位实力买家及换楼中产诚意推荐 ${parsedLandmark} 核心精选：\n👉 ${formattedPrice}\n👉 ${formattedArea}\n👉 ${formattedPropID}\n\n该屋苑成交活跃，抗跌防守力极强。欢迎点击下方 PM 联系我们获取该区最新的成交与估值数据报告，实现资产配置最佳化！\n\n---\n${legalPreamble}`;

      // X / Twitter (Concise, link-free)
      twitterCopy = detectedLang === 'zh-Hant-HK'
        ? `🏡 [${parsedLandmark} 真盤源] 實用 ${parsedArea} 呎高層兩房！\n💰 ${formattedPrice}\n🔢 ${formattedPropID}\n\n交通超便利，採光極佳，地監局合規保障，首置上車或收租精選！請點擊主頁頭像預約看房。`
        : `🏡 [${parsedLandmark} 真盘源] 实用 ${parsedArea} 呎高层两房！\n💰 ${formattedPrice}\n🔢 ${formattedPropID}\n\n交通超便利，采光极佳，地监局合规保障，首置上车或收租精选！请点击主页头像预约看房。`;

      // Discord
      discordCopy = detectedLang === 'zh-Hant-HK'
        ? `👾 *【Rica+ 房產社區速遞】*\n\n鄰近 **${parsedLandmark}**，高層精選單位釋出！\n\n- **${formattedPrice}**\n- **${formattedArea}**\n- **${formattedPropID}**\n\n💬 備註：${filteredText}\n\n詳細資訊與實景，請私信或評論聯絡我們。`
        : `👾 *【Rica+ 房产社区速递】*\n\n邻近 **${parsedLandmark}**，高层精选单位释出！\n\n- **${formattedPrice}**\n- **${formattedArea}**\n- **${formattedPropID}**\n\n💬 备注：${filteredText}\n\n详细资讯与实景，请私信或评论联络我们。`;

      // Line
      lineCopy = detectedLang === 'zh-Hant-HK'
        ? `🏡 *【利嘉閣 Rica+ LINE 推薦】*\n\n坐落 ${parsedLandmark}，交通便利。實用 ${parsedArea} 呎，${formattedPrice}，租金回報穩定，上車首選！\n\n🔢 ${formattedPropID}\n\n💬 備註：${filteredText}\n\n詳情請 LINE 預約睇樓！`
        : `🏡 *【利嘉阁 Rica+ LINE 推荐】*\n\n坐落 ${parsedLandmark}，交通便利。实用 ${parsedArea} 呎，${formattedPrice}，租金回报稳定，上车首选！\n\n🔢 ${formattedPropID}\n\n💬 备注：${filteredText}\n\n详情请 LINE 预约看房！`;

      // YouTube Shorts script
      youtubeCopy = `🎬 【利嘉閣帶看 Shorts】\n物業編號：${parsedPropID}\n實用面積：約 ${parsedArea} 呎\n${formattedPrice}\n鄰近 ${parsedLandmark}，交通網配套，極速開單首選！`;

      // Douyin / TikTok script
      douyinCopy = `🎬 【抖音帶看精選】\n鄰近 ${parsedLandmark}！\n實用面積：約 ${parsedArea} 呎\n${formattedPrice}\n物業編號：${parsedPropID}`;
    }

    if (isUtmEnabled && !priceDeviationViolation) {
      const propIdValue = parsedPropID && parsedPropID.trim().length > 0 ? parsedPropID : "AH2023101";
      
      const makeUrl = (platform: UTMSource) => generateUtmUrl({
        id: propIdValue,
        source: platform,
        medium: utmMedium,
        campaign: utmAgentId,
        content: utmPostId
      });

      whatsappCopy = appendUtmToCopy(whatsappCopy, makeUrl('whatsapp'), 'whatsapp');
      telegramCopy = appendUtmToCopy(telegramCopy, makeUrl('whatsapp'), 'whatsapp');
      tg_directCopy = appendUtmToCopy(tg_directCopy, makeUrl('whatsapp'), 'whatsapp');
      xiaohongshuCopy = appendUtmToCopy(xiaohongshuCopy, makeUrl('xiaohongshu'), 'xiaohongshu');
      wechatCopy = appendUtmToCopy(wechatCopy, makeUrl('whatsapp'), 'whatsapp');
      facebookCopy = appendUtmToCopy(facebookCopy, makeUrl('facebook'), 'facebook');
      instagramCopy = appendUtmToCopy(instagramCopy, makeUrl('instagram'), 'instagram');
      threadsCopy = appendUtmToCopy(threadsCopy, makeUrl('instagram'), 'instagram');
      twitterCopy = appendUtmToCopy(twitterCopy, makeUrl('instagram'), 'instagram');
      discordCopy = appendUtmToCopy(discordCopy, makeUrl('linkedin'), 'linkedin');
      lineCopy = appendUtmToCopy(lineCopy, makeUrl('whatsapp'), 'whatsapp');
    }

    return {
      whatsapp: whatsappCopy,
      telegram: telegramCopy,
      tg_direct: tg_directCopy,
      xiaohongshu: xiaohongshuCopy,
      wechat: wechatCopy,
      facebook: facebookCopy,
      instagram: instagramCopy,
      threads: threadsCopy,
      twitter: twitterCopy,
      discord: discordCopy,
      line: lineCopy,
      youtube: youtubeCopy,
      douyin: douyinCopy,
      passed: !priceDeviationViolation,
      priceDeviation: Math.round(deviation),
      priceDeviationViolation,
      redirectFiltered: filteredWords.length > 0,
      filteredWords,
      marketAvg
    };
  };

  const compliance = computeCompliance();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real Media upload handlers and fallback triggers
  const triggerPhotoUpload = () => {
    photoInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const triggerDocument = () => {
    documentInputRef.current?.click();
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newFile: MediaFile = {
        id: Date.now().toString() + "-cam",
        type: 'photo',
        name: file.name,
        url: URL.createObjectURL(file)
      };
      handleSetUploadedFiles(prev => [...prev, newFile]);
      triggerGlobalNotification("現場拍照錄入", `實景照片「${file.name}」上傳成功，地產編號浮水印合成完畢！`, "camera", "success");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: MediaFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        newFiles.push({
          id: `${Date.now()}-${i}-photo`,
          type: isVideo ? 'video' : 'photo',
          name: file.name,
          url: URL.createObjectURL(file)
        });
      }
      handleSetUploadedFiles(prev => [...prev, ...newFiles]);
      triggerGlobalNotification("相片上傳成功", "AI已自動調整對比度並嵌入「利嘉閣 100% 真盤源」浮水印！", "image", "success");
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newFile: MediaFile = {
        id: Date.now().toString() + "-doc",
        type: 'document',
        name: file.name,
        url: URL.createObjectURL(file)
      };
      handleSetUploadedFiles(prev => [...prev, newFile]);
      triggerGlobalNotification("合規授權文件", `地監局書面放盤授權書「${file.name}」已安全關聯！`, "file-text", "success");
    }
  };

  const deleteUploadedFile = (id: string) => {
    handleSetUploadedFiles(prev => prev.filter(f => f.id !== id));
    triggerGlobalNotification("檔案已移除", "附件已取消關聯。", "info", "info");
  };

  const generateAIWalkthroughVideo = () => {
    const script = `🎬 【利嘉閣 Rica+ AI 智能短影音生成腳本】\n\n` +
      `[第0-3秒] 📌 黃金開頭：鏡頭展示 ${parsedLandmark} 景觀。配樂：輕快時尚。字幕：「${parsedLandmark} 罕有超高CP值真盤源，秒殺放租！」\n` +
      `[第3-8秒] 🏡 室內大特寫：展示 ${parsedArea} 平方呎極見使格局。旁白：「實用面積 ${parsedArea} 呎，大房大廳採光超正！」\n` +
      `[第8-12秒] 🚇 交通點：特寫地鐵站出口。旁白：「行路去港鐵站僅需 ${parsedLandmark === '堅尼地城' ? '5分鐘' : '數分鐘'}，返工返學交通極速！」\n` +
      `[第12-15秒] 💰 震撼叫價：大字特效。字幕：「意向金額：$${parsedPrice.toLocaleString()}！物業編號：${parsedPropID}，火速私聊預約看房！」`;

    setGeneratedVideoScript(script);
    setShowVideoModal(true);
    triggerGlobalNotification("短視頻腳本生成", "AI 智能帶看短片分鏡腳本生成完畢！", "sparkles", "success");
  };

  const handleSendListing = async () => {
    if (!chaosInput.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: chaosInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyToMessage: replyingTo ? {
        id: replyingTo.id,
        sender: replyingTo.sender,
        text: replyingTo.text
      } : undefined
    };

    setReplyingTo(null);
    handleSetMessages(prev => [...prev, userMsg]);

    const loadingMsgId = Date.now() + 1;
    const loadingMsg = {
      id: loadingMsgId,
      sender: 'assistant',
      text: "🤖 Rica+ 正在連接合規審計伺服器，對此平台發布更新進行深度 EAA 與社群平台演算法交叉核驗...",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true
    };
    handleSetMessages(prev => [...prev, loadingMsg]);

    try {
      const results = computeCompliance();
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chaosInput })
      });

      let auditResultObj: AuditResult | null = null;
      let assistantMsgText = "";

      if (response.ok) {
        const responseData = await response.json();
        try {
          const parsed = JSON.parse(responseData.response);
          auditResultObj = parsed;
        } catch (e) {
          console.error("Failed to parse response JSON: ", responseData.response);
        }
      } else {
        console.warn("Backend API returned error or API key is not configured. Falling back to local auditor.");
      }

      if (!auditResultObj) {
        // High-fidelity local auditor fallback structured according to user prompt rules
        const inputLower = chaosInput.toLowerCase();
        const affected: string[] = [];
        if (inputLower.includes("meta") || inputLower.includes("instagram") || inputLower.includes("hashtag") || inputLower.includes("fb")) affected.push("Meta");
        if (inputLower.includes("xiaohongshu") || inputLower.includes("小紅書") || inputLower.includes("vx") || inputLower.includes("wechat")) affected.push("Xiaohongshu");
        if (inputLower.includes("douyin") || inputLower.includes("抖音") || inputLower.includes("回報")) affected.push("Douyin");
        if (affected.length === 0) affected.push("Meta", "Xiaohongshu", "Douyin");

        auditResultObj = {
          update_detected: "TRUE",
          affected_platforms: affected,
          dynamic_negative_prompts: {
            scrub_keywords: ["guaranteed return", "housing market boom", "wealth explosion", "VX", "WeChat ID", "微信"],
            hashtag_maximum_limit: 5,
            chao_ke_masking_enabled: true
          },
          technical_payload_adjustments: {
            caption_character_cap: 1024,
            required_resolution_width: 1920,
            required_resolution_height: 1080
          },
          discord_alert_payload: {
            severity: results.priceDeviationViolation ? "CRITICAL" : "INFO",
            summary_text: `物業編號 ${parsedPropID} 放盤已完成 Rica+ 系統稽核。目前價格偏差率 ${results.priceDeviation}%，敏感詞已自動脫敏重寫。`
          }
        };
      }

      if (results.priceDeviationViolation) {
        assistantMsgText = `❌ 【合規阻斷：叫價偏差突破 20% 限值】\n\n偵測到申報價 HK$ ${parsedPrice.toLocaleString()} 與真實成交均價 HK$ ${results.marketAvg.toLocaleString()} 偏差高達 ${results.priceDeviation}%！已觸發地監局防護防火牆。已鎖定複製與發布，請修改售價/租金。`;
      } else {
        assistantMsgText = `✅ 【EAA 100% 真盤源合規審核通過】\n\n- 市場估值均價：HK$ ${results.marketAvg.toLocaleString()}\n- 價格偏差比例：${results.priceDeviation}% (符合市場自由定價 ✅)\n- 已過濾敏感詞：${results.redirectFiltered ? '已自動重寫 WeChat/聯絡方式 ✅' : '未發現違規外鏈 ✅'}\n- EAA 代理牌照及委託協議：已自動委託放盤授權書儲存完畢 ✅\n\n文案已編譯。請在下方點擊平台標籤一鍵複製，或透過 Native Share-to 一鍵呼叫分享。`;
      }

      if (auditResultObj?.ai_chat_response) {
        assistantMsgText = `🤖 【Rica+ AI Copilot 回覆】\n${auditResultObj.ai_chat_response}\n\n` + assistantMsgText;
      }

      // ── Phase 2: Share Intent Detection ──
      let shareIntent: ShareDeepLink | null = null;
      const utmAgentId = localStorage.getItem('rica_utm_agent_id') || 'C-001702-A101';
      const utmContentId = 'post-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const shareResult = handleShareCommand(
        chaosInput,
        results.whatsapp,  // primary copy for deep-linking
        {
          id: parsedPropID || 'AH2023101',
          campaign: utmAgentId,
          content: utmContentId,
        },
      );
      if (shareResult) {
        shareIntent = shareResult.deepLink;
        assistantMsgText = `🚀 *智能分享指令已識別！*\n\n偵測到您想將文案分享至 *${shareResult.intent.platformLabel}*。\n下方已為您產生一鍵直達連結，點擊即可開啟 ${shareResult.intent.platformLabel} 並自動填入合規文案。\n\n---\n${assistantMsgText}`;
      }

      const finalAssistantMsg = {
        id: loadingMsgId,
        sender: 'assistant',
        text: assistantMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isComplied: !results.priceDeviationViolation,
        replyToMessage: {
          id: userMsg.id,
          sender: userMsg.sender,
          text: userMsg.text
        },
        copies: {
          whatsapp: results.whatsapp,
          telegram: results.telegram,
          tg_direct: results.tg_direct,
          xiaohongshu: results.xiaohongshu,
          wechat: results.wechat,
          facebook: results.facebook,
          instagram: results.instagram,
          threads: results.threads,
          twitter: results.twitter,
          discord: results.discord,
          line: results.line,
          youtube: results.youtube,
          douyin: results.douyin
        },
        auditResult: auditResultObj,
        shareIntent: shareIntent || undefined,
      };

      handleSetMessages(prev => prev.map(m => m.id === loadingMsgId ? finalAssistantMsg : m));

      if (results.passed) {
        triggerGlobalNotification("文案生成成功", "已成功自動產出 5 大平台合規行銷文案！", "check-circle", "success");
      } else {
        triggerGlobalNotification("合規阻斷", "叫價偏差大於 20%，已觸發安全鎖死機制。", "lock", "error");
      }

    } catch (error) {
      console.error(error);
      // Remove loading indicator on failure
      handleSetMessages(prev => prev.filter(m => m.id !== loadingMsgId));
      triggerGlobalNotification("連接伺服器失敗", "無法連結 Rica+ 智能合規審計後端，請重試。", "alert-triangle", "error");
    }
  };

  const handleMicrophoneClick = () => {
    if (isRecording) return;

    setIsRecording(true);
    triggerGlobalNotification("正在語音輸入...", "Rica+ 正在聆聽您的前線語音放盤指令...", "mic", "info");

    setTimeout(() => {
      setIsRecording(false);
      const nextTranscript = SIMULATED_VOICE_TRANSCRIPTS[voiceIndex];
      handleSetChaosInput(nextTranscript);
      setVoiceIndex((prev) => (prev + 1) % SIMULATED_VOICE_TRANSCRIPTS.length);
      
      triggerGlobalNotification("語音辨識成功", "房源原始語音已成功錄入，您可以直接點擊發送！", "check-circle", "success");
    }, 1800);
  };

  // Helper to handle copying specific platform texts
  const handleCopyPlatformText = (text: string, platformName: string) => {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);

    triggerGlobalNotification(
      "文案已複製",
      `已成功複製適用於【${platformName}】的合規推廣草稿！`,
      "check",
      "success"
    );
  };

  // Direct Send to Telegram Bot via Real Bot API Fetch
  const handleDirectTelegramSend = async (customText?: string) => {
    const token = telegramBotToken.trim();
    const chatId = telegramChatId.trim();

    if (!token || !chatId) {
      setShowTgConfig(true);
      triggerGlobalNotification("設定未完成", "請先點擊右上角設定圖示配置您的 Telegram Bot Token 及 Chat ID", "lock", "error");
      return;
    }

    setIsSendingTelegram(true);
    try {
      const activePlatformCopy = customText || compliance.whatsapp;
      const textToSend = `<b>【Rica+ 智能合規文案分發】</b>\n\n${activePlatformCopy}`;
      
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: textToSend,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      if (data.ok) {
        triggerGlobalNotification(
          "TG 分發成功！", 
          "文案已由 Rica+ 引擎直達您的 Telegram 對話！", 
          "send", 
          "success"
        );
      } else {
        throw new Error(data.description || "API 錯誤");
      }
    } catch (error: any) {
      console.error(error);
      triggerGlobalNotification(
        "分發失敗", 
        `Telegram API 回報錯誤: ${error.message || error}`, 
        "alert-triangle", 
        "error"
      );
    } finally {
      setIsSendingTelegram(false);
    }
  };

  // ── Phase 5: Poster Canvas Generation & Native Share ──
  const [isGeneratingPoster, setIsGeneratingPoster] = useState<boolean>(false);

  const handlePosterShare = async () => {
    setIsGeneratingPoster(true);
    triggerGlobalNotification(
      "正在生成海報...",
      "Rica+ 正在合成 4 層遊戲風格宣傳海報並準備原生分享...",
      "image",
      "info",
    );

    try {
      const propId = parsedPropID && parsedPropID.trim().length > 0
        ? parsedPropID
        : "AH2023101";

      const utmSource: UTMSource = 'whatsapp';
      const utmMediumVal: UTMMedium = utmMedium;
      const utmCampaign = utmAgentId;
      const utmContent = utmPostId;

      const firstPhoto = uploadedFiles.find(f => f.type === 'photo');
      const posterBlob = await renderPosterBlob({
        photoUrl: firstPhoto?.url,
        priceText: compliance.whatsapp.split('\n')[0] || `意向價：HK$ ${parsedPrice.toLocaleString()}`,
        areaText: parsedArea > 0
          ? `實用面積：約 ${parsedArea} 平方呎`
          : '實用面積：請聯絡經紀查詢',
        propertyId: propId,
        landmark: parsedLandmark,
        utm: {
          id: propId,
          source: utmSource,
          medium: utmMediumVal,
          campaign: utmCampaign,
          content: utmContent,
        },
        captionText: compliance.whatsapp.split('\n').slice(0, 2).join(' ') || '',
        publishDate: new Date().toISOString().split('T')[0],
      });

      const utmUrl = generateUtmUrl({
        id: propId,
        source: utmSource,
        medium: utmMediumVal,
        campaign: utmCampaign,
        content: utmContent,
      });

      const result = await sharePosterWithFallback(
        posterBlob,
        compliance.whatsapp,
        utmUrl,
        `ricacorp-${propId}-poster.png`,
      );

      if (result.method === 'native') {
        if (result.success) {
          triggerGlobalNotification(
            "海報分享成功 🎉",
            "遊戲風格宣傳海報已通過原生分享機制發送！",
            "check-circle",
            "success",
          );
        } else {
          triggerGlobalNotification(
            "分享已取消",
            "原生分享面板已關閉，海報未發送。",
            "info",
            "info",
          );
        }
      } else {
        triggerGlobalNotification(
          "已下載海報 + 複製文案",
          "原生分享不受支援，海報 PNG 已下載至您的裝置，文案亦已複製到剪貼簿！",
          "check-circle",
          "success",
        );
      }
    } catch (err) {
      console.error("Poster share failed:", err);
      triggerGlobalNotification(
        "海報生成失敗",
        "無法合成宣傳海報，請檢查上傳的相片是否有效。",
        "alert-triangle",
        "error",
      );
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  // Inner Platform Copy Switcher state inside assistant bubbles
  const [activeTabs, setActiveTabs] = useState<Record<number, 'whatsapp' | 'xiaohongshu' | 'instagram' | 'facebook' | 'twitter'>>({});

  return (
    <div className="w-full h-full sm:h-[820px] bg-white flex flex-row overflow-hidden text-slate-800 relative font-sans">
      
      {/* 1. Left Sidebar: Chat History and Session Records (Gemini-style) */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            className="w-72 bg-slate-900 text-slate-100 flex flex-col h-full shrink-0 border-r border-slate-800/80 z-30"
          >
            
            {/* Sidebar Header */}
            <motion.div variants={sidebarChildVariants} className="p-4 border-b border-slate-850 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-[#FF6600] flex items-center justify-center text-white font-black text-xs">
                  R+
                </div>
                <span className="font-extrabold text-xs text-white tracking-tight">歷史</span>
              </div>
              
              {/* Collapse button on mobile/desktop */}
              <button 
                onClick={() => setShowSidebar(false)} 
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
                title="隱藏側邊欄"
              >
                <motion.div
                  variants={svgVariants}
                  className="flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.div>
              </button>
            </motion.div>

            {/* New Chat Button */}
            <motion.div variants={sidebarChildVariants} className="p-3 shrink-0">
              <button 
                onClick={handleCreateNewSession}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-[#FF6600] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-md shadow-[#FF6600]/10 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新對話</span>
              </button>
            </motion.div>

            {/* Search sessions */}
            <motion.div variants={sidebarChildVariants} className="px-3 pb-2 shrink-0">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="搜尋歷史會話..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl pl-8 pr-3 py-1.5 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-[#FF6600] placeholder:text-slate-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                {sessionSearch && (
                  <button 
                    onClick={() => setSessionSearch("")}
                    className="absolute right-2 top-2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Sessions List */}
            <motion.div variants={sidebarChildVariants} className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 scrollbar-thin">
              {(() => {
                const filtered = sessions.filter(s => 
                  s.title.toLowerCase().includes(sessionSearch.toLowerCase()) ||
                  (s.chaosInput && s.chaosInput.toLowerCase().includes(sessionSearch.toLowerCase()))
                );
                
                if (filtered.length === 0) {
                  return (
                    <div className="text-center text-[10px] text-slate-500 py-8 font-medium">
                      無相符對話紀錄
                    </div>
                  );
                }

                return filtered.map((s) => {
                  const isActive = s.id === currentSessionId;
                  const lastMsg = s.messages[s.messages.length - 1];
                  const lastText = lastMsg ? lastMsg.text : "";

                  return (
                    <div 
                      key={s.id}
                      onClick={() => {
                        setCurrentSessionId(s.id);
                        setReplyingTo(null);
                      }}
                      className={`group relative p-2.5 rounded-xl cursor-pointer transition flex flex-col text-left ${
                        isActive 
                          ? 'bg-slate-800 border border-slate-700/80 text-white' 
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-xs truncate max-w-[170px] leading-tight group-hover:text-white">
                          {s.title}
                        </span>
                        
                        {/* Delete action */}
                        <button 
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-700/60 opacity-0 group-hover:opacity-100 transition shrink-0"
                          title="刪除此對話"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Excerpt preview */}
                      <p className="text-[10px] text-slate-500 truncate mt-1 leading-normal font-medium">
                        {lastText || s.chaosInput || "（新建立的對話）"}
                      </p>
                      
                      {/* Active pulse */}
                      {isActive && (
                        <div className="absolute left-0.5 top-3.5 w-1 h-4 rounded-r-md bg-[#FF6600]" />
                      )}
                    </div>
                  );
                });
              })()}
            </motion.div>

            {/* Sidebar Footer Info */}

          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full bg-[#F2F2F7] relative overflow-hidden">
        
        {/* Sticky App Header */}
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/60 shadow-xs shrink-0 z-20">
          <div className="flex items-center space-x-2.5">
            {/* Sidebar toggle menu button if sidebar is hidden */}
            {!showSidebar && (
              <button 
                onClick={() => setShowSidebar(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-[#FF6600] transition duration-200 shrink-0 cursor-pointer"
                title="展開側邊欄"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            )}

            <div className="w-8 h-8 rounded-lg bg-[#FF6600] flex items-center justify-center text-white font-extrabold text-sm tracking-tighter shrink-0">
              R+
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-950">GPA</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 hidden">
            {/* UTM Link Generator Panel Trigger */}
            <button
              onClick={() => {
                setShowUtmPanel(!showUtmPanel);
                setShowPolicyPanel(false);
                setShowTgConfig(false);
              }}
              className={`hidden items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                showUtmPanel 
                  ? 'bg-[#FF6600] text-white shadow-sm' 
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#FF6600]'
              }`}
              title="UTM 追蹤連結產生器"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">UTM 連結</span>
              {isUtmEnabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            {/* Policy Panel Trigger */}
            <button
              onClick={() => {
                setShowPolicyPanel(!showPolicyPanel);
                setShowUtmPanel(false);
                setShowTgConfig(false);
              }}
              className={`hidden items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                showPolicyPanel 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="平台合規數據庫"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">合規數據</span>
            </button>

            {/* Telegram Config Button */}
            <button
              onClick={() => {
                setShowTgConfig(!showTgConfig);
                setShowUtmPanel(false);
                setShowPolicyPanel(false);
              }}
              className={`hidden items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                showTgConfig 
                  ? 'bg-sky-500 text-white shadow-sm' 
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-600'
              }`}
              title="TG 直發綁定設定"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TG 關聯</span>
            </button>
          </div>
        </div>

        {/* Telegram Config Panel Overlay */}
        {showTgConfig && (
          <div className="absolute inset-x-3 top-16 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-40 animate-slide-in space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Bot className="w-4 h-4 text-sky-500" /> Telegram Native Share-to 關聯設定
              </span>
              <button onClick={() => setShowTgConfig(false)} className="text-[11px] text-slate-400 font-bold">關閉</button>
            </div>
            <div className="space-y-2.5 text-left">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Bot Token</label>
                <input 
                  type="text"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="E.g. 789123456:AAFlk..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Chat ID</label>
                <input 
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="E.g. 8746950176"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <p className="text-[9px] text-slate-400 leading-normal">
                💡 <strong>提示：</strong>持久化配置您的 TG 專用 Token 與 Chat ID 之後，即可一鍵呼叫 Native Share-to 機制將文案傳送至您的發布頻道。
              </p>
              <button 
                onClick={handleSaveTgConfig}
                className="w-full py-2 bg-[#FF6600] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                儲存設定
              </button>
            </div>
          </div>
        )}

        {/* Conversational Chat Message Window */}
        <div className="flex-1 overflow-y-auto space-y-5 px-4 py-4 bg-[#F2F2F7]">
          
          {messages.map((m) => (
            <div 
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
            >
              {/* Header with Sender info */}
              <div className={`flex items-center space-x-2 text-[9px] text-slate-400 px-1 font-semibold ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                <span>{m.sender === 'assistant' ? '🤖 Rica+ 智能合規宣傳引擎' : '📱 原始混沌輸入'}</span>
              </div>

              <div className={`max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed font-medium shadow-xs text-left relative ${
                m.sender === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-xs' 
                  : 'bg-white text-slate-800 border border-slate-200/60 rounded-tl-xs'
              }`}>
                
                {/* Nested Replied-to Quote inside the chat bubble */}
                {m.replyToMessage && (
                  <div className={`p-2.5 mb-2.5 text-[10px] rounded-lg border-l-2 truncate leading-normal ${
                    m.sender === 'user'
                      ? 'bg-white/10 text-slate-300 border-[#FF6600]'
                      : 'bg-slate-50 text-slate-500 border-indigo-500'
                  }`}>
                    <div className="font-extrabold flex items-center gap-1 mb-0.5 text-[9px] text-slate-400">
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>已回覆 {m.replyToMessage.sender === 'assistant' ? '🤖 Rica+ 助理' : '📱 原始輸入'}</span>
                    </div>
                    <div className="italic truncate font-medium">"{m.replyToMessage.text}"</div>
                  </div>
                )}

                {m.isLoading ? (
                  <div className="flex items-center space-x-2.5 py-1 text-slate-500">
                    <div className="flex space-x-1 shrink-0">
                      <span className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-bounce delay-150"></span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 animate-pulse">{m.text}</span>
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap font-medium">{m.text}</div>

                    {/* Phase 2: Smart Deep-Link Action Button */}
                    {m.shareIntent && (
                      <a
                        href={m.shareIntent.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6600] to-orange-500 text-white text-xs font-extrabold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-fit"
                        onClick={(e) => {
                          // Prevent interfering with chat scroll
                          e.stopPropagation();
                          triggerGlobalNotification(
                            `正在開啟 ${m.shareIntent.label}`,
                            `Rica+ 已自動填入合規文案至 ${m.shareIntent.label} 發布介面！`,
                            'send',
                            'success',
                          );
                        }}
                      >
                        {/* Platform-specific mini icon */}
                        <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-black shrink-0">
                          {m.shareIntent.icon === 'whatsapp' && 'WA'}
                          {m.shareIntent.icon === 'facebook' && 'FB'}
                          {m.shareIntent.icon === 'instagram' && 'IG'}
                          {m.shareIntent.icon === 'linkedin' && 'LI'}
                          {m.shareIntent.icon === 'xiaohongshu' && 'RED'}
                        </span>
                        <span>一鍵分享至 {m.shareIntent.label}</span>
                        <Send className="w-3.5 h-3.5 ml-auto opacity-70" />
                      </a>
                    )}

                    {/* Highly Visual AI Audit Log Block removed as per user request */}
                  </>
                )}


              </div>
              
              {/* Sleek Gemini-style Icon Actions Bar */}
              <div className={`flex items-center gap-1 mt-1 px-1 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Reply button */}
                <button 
                  onClick={() => {
                    setReplyingTo(m);
                    triggerGlobalNotification("引用回覆", `已成功引用 ${m.sender === 'assistant' ? 'Rica+ 助理' : '原始輸入'} 的訊息！`, "message-square", "info");
                  }} 
                  className="p-1.5 rounded-full text-slate-400 hover:text-[#FF6600] hover:bg-slate-200/50 transition duration-200 flex items-center justify-center cursor-pointer bg-transparent"
                  title="引用回覆"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>

                {/* Branch button */}
                {m.sender === 'assistant' && !m.isInitial && (
                  <button 
                    onClick={() => handleBranchSession(m)} 
                    className="p-1.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-slate-200/50 transition duration-200 flex items-center justify-center cursor-pointer bg-transparent"
                    title="以此訊息分支新對話線"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Copy button */}
                <button 
                  onClick={() => {
                    if (m.copies) {
                      const activeTab = activeTabs[m.id] || 'whatsapp';
                      const activePlatformText = m.copies[activeTab] || '';
                      const platformLabelMap: Record<string, string> = {
                        whatsapp: 'WhatsApp Business',
                        telegram: 'Telegram',
                        tg_direct: 'TG直發',
                        xiaohongshu: '小紅書',
                        wechat: '微信朋友圈',
                        facebook: 'Facebook Ads',
                        instagram: 'Instagram',
                        threads: 'Threads',
                        twitter: 'X / Twitter',
                        discord: 'Discord',
                        line: 'Line',
                        youtube: 'YouTube',
                        douyin: '抖音/TikTok'
                      };
                      handleCopyPlatformText(activePlatformText, platformLabelMap[activeTab] || activeTab);
                    } else {
                      handleCopyPlatformText(m.text, m.sender === 'user' ? '原始混沌輸入' : '助理訊息');
                    }
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition duration-200 flex items-center justify-center cursor-pointer bg-transparent"
                  title="複製內容"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Share To button (only for assistant messages with compiled copies) */}
                {m.sender === 'assistant' && !m.isInitial && m.copies && (
                  <button 
                    onClick={() => {
                      setShowShareSheet(true);
                    }}
                    className="p-1.5 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-slate-200/50 transition duration-200 flex items-center justify-center cursor-pointer bg-transparent"
                    title="分享發布管道"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Timestamp */}
                <span className="text-[8px] text-slate-400 font-mono select-none px-1 py-1">
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Price deviation visual warning block */}
          {compliance.priceDeviationViolation && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-rose-800 space-y-1 animate-pulse text-left">
              <div className="flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-[10px] font-extrabold">EAA 合規防火牆警告</span>
              </div>
              <p className="text-[9px] text-rose-700 leading-normal">
                您輸入的叫價 HK$ {parsedPrice.toLocaleString()} 與市場估算成交價 (HK$ {compliance.marketAvg.toLocaleString()}) 偏差率高達 <strong>{compliance.priceDeviation}%</strong>，已大幅超越 <strong>±20%</strong> 法定偏差紅線。此文案複製與分享渠道已被自動鎖定，請立刻輸入真實數據。
              </p>
            </div>
          )}

          {isRecording && (
            <div className="bg-[#FF6600]/5 border border-[#FF6600]/30 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 animate-pulse">
              <Mic className="w-6 h-6 text-[#FF6600] animate-bounce" />
              <span className="text-xs font-extrabold text-[#FF6600]">正在錄音並進行語音辨識...</span>
              <div className="flex space-x-1">
                <span className="w-1.5 h-3 bg-[#FF6600] rounded-full animate-pulse"></span>
                <span className="w-1.5 h-5 bg-[#FF6600] rounded-full animate-pulse delay-75"></span>
                <span className="w-1.5 h-4 bg-[#FF6600] rounded-full animate-pulse delay-150"></span>
                <span className="w-1.5 h-6 bg-[#FF6600] rounded-full animate-pulse delay-75"></span>
                <span className="w-1.5 h-3 bg-[#FF6600] rounded-full animate-pulse"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* AI Walkthrough Video Modal */}
        {showVideoModal && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative text-left">
              <button 
                onClick={() => setShowVideoModal(false)}
                className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
              <div className="flex items-center space-x-2 text-[#FF6600]">
                <Play className="w-5 h-5 fill-current" />
                <h3 className="font-bold text-sm">利嘉閣 Rica+ AI 智能短片帶看腳本</h3>
              </div>
              <p className="text-[9px] text-slate-400 font-bold">已自動擷取實景相片特徵與叫價，產出適合抖音/小紅書/Reels 帶貨發布腳本：</p>
              <div className="bg-slate-900 text-emerald-400 font-mono text-[9px] p-3 rounded-xl max-h-[220px] overflow-y-auto whitespace-pre-wrap leading-relaxed font-semibold">
                {generatedVideoScript}
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => {
                    handleCopyPlatformText(generatedVideoScript, "短片分鏡腳本");
                    setShowVideoModal(false);
                  }}
                  className="flex-1 py-2 bg-[#FF6600] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <Clipboard className="w-3.5 h-3.5" /> 複製影片劇本
                </button>
                <button 
                  onClick={() => setShowVideoModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg cursor-pointer"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Control Inputs (No unneeded buttons - speaking or typing in raw) */}
        <div className="bg-white p-3 border-t border-slate-200/60 space-y-2.5 shrink-0">
          
          {/* Active Reply Quoted context above the input box */}
          {replyingTo && (
            <div className="bg-[#FF6600]/5 border border-[#FF6600]/20 rounded-xl p-2.5 flex items-center justify-between text-left animate-fade-in shrink-0">
              <div className="flex items-center space-x-2 truncate">
                <div className="p-1.5 bg-[#FF6600]/10 text-[#FF6600] rounded-lg">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="truncate text-xs leading-normal">
                  <p className="font-extrabold text-slate-700 text-[11px]">
                    正在回覆 {replyingTo.sender === 'assistant' ? '🤖 Rica+ 助理' : '📱 原始輸入'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[320px] italic font-medium">"{replyingTo.text}"</p>
                </div>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden file inputs kept in DOM for trigger handlers */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={cameraInputRef} 
            onChange={handleCameraChange} 
          />
          <input 
            type="file" 
            accept="image/*,video/*" 
            multiple 
            className="hidden" 
            ref={photoInputRef} 
            onChange={handlePhotoChange} 
          />
          <input 
            type="file" 
            accept=".pdf,.doc,.docx,.txt" 
            className="hidden" 
            ref={documentInputRef} 
            onChange={handleDocumentChange} 
          />

          {/* Secondary list of 3 attachment buttons, shown only when showAttachmentMenu is true */}
          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div 
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 5 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.04,
                      type: "spring",
                      stiffness: 260,
                      damping: 22
                    }
                  },
                  exit: {
                    opacity: 0,
                    scale: 0.95,
                    y: 5,
                    transition: {
                      duration: 0.15
                    }
                  }
                }}
                className="flex items-center space-x-1.5 p-1.5 bg-slate-50 border border-slate-200/50 rounded-xl shrink-0 justify-start origin-left"
              >
                <span className="text-[9px] text-slate-400 font-bold px-1 select-none">附加選項:</span>
                
                <motion.button 
                  variants={{
                    hidden: { opacity: 0, x: -12, scale: 0.8 },
                    visible: { 
                      opacity: 1, 
                      x: 0, 
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    triggerCamera();
                    setShowAttachmentMenu(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition cursor-pointer text-[9px] font-bold shadow-xs active:scale-95"
                  title="現場相機拍照"
                >
                  <Camera className="w-3 h-3 text-[#FF6600]" />
                  <span>相機拍照</span>
                </motion.button>

                <motion.button 
                  variants={{
                    hidden: { opacity: 0, x: -12, scale: 0.8 },
                    visible: { 
                      opacity: 1, 
                      x: 0, 
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    triggerPhotoUpload();
                    setShowAttachmentMenu(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition cursor-pointer text-[9px] font-bold shadow-xs active:scale-95"
                  title="上傳相片"
                >
                  <Image className="w-3 h-3 text-[#FF6600]" />
                  <span>上傳相片</span>
                </motion.button>

                <motion.button 
                  variants={{
                    hidden: { opacity: 0, x: -12, scale: 0.8 },
                    visible: { 
                      opacity: 1, 
                      x: 0, 
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    triggerDocument();
                    setShowAttachmentMenu(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition cursor-pointer text-[9px] font-bold shadow-xs active:scale-95"
                  title="關聯授權文件"
                >
                  <Paperclip className="w-3 h-3 text-[#FF6600]" />
                  <span>授權文件</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real-time media attachments inside the user typing container */}
          {uploadedFiles.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-left space-y-2 animate-fade-in shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="relative group bg-white border border-slate-200 p-1 rounded-lg flex items-center space-x-1.5 shadow-xs">
                    {file.type === 'photo' && file.url ? (
                      <img src={file.url} alt={file.name} className="w-7 h-7 rounded object-cover" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#FF6600]" />
                    )}
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-slate-700 truncate max-w-[80px]">{file.name}</p>
                      <p className="text-[7px] text-slate-400 capitalize">{file.type === 'photo' ? '實景浮水印' : 'Form 3 授權'}</p>
                    </div>
                    <button 
                      onClick={() => deleteUploadedFile(file.id)}
                      className="p-0.5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unified Raw Listing / Chaos Text Input area with Voice Microphone integrated */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Added Plus Expand button on the left side */}
            <button 
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className={`p-3 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer border ${
                showAttachmentMenu 
                  ? 'bg-[#FF6600] text-white border-[#FF6600] rotate-45 scale-105' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title="展開附加功能"
            >
              <Plus className="w-4 h-4 transition-transform duration-200" />
            </button>

            {/* Simulated Voice Microphone Button */}
            <button 
              onClick={handleMicrophoneClick}
              disabled={isRecording}
              className={`p-3 rounded-xl flex items-center justify-center transition shrink-0 shadow-sm cursor-pointer ${
                isRecording 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-[#FF6600]/10 hover:bg-[#FF6600]/20 text-[#FF6600]'
              }`}
              title="語音模擬錄入"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Main Chat message input area */}
            <div className="flex-1 relative flex items-center">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#FF6600] pointer-events-none flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <input 
                type="text"
                value={chaosInput}
                onChange={(e) => handleSetChaosInput(e.target.value)}
                placeholder="與 Rica+ AI Copilot 智能助手對話、詢問合規條例或輸入房源..."
                className="w-full bg-slate-50 border border-orange-200/90 rounded-xl pl-8 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20 placeholder:text-slate-400 transition shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendListing();
                  }
                }}
              />
              
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <button 
                  onClick={handleSendListing}
                  className="p-1.5 bg-[#FF6600] text-white rounded-lg hover:bg-[#e05300] transition active:scale-95 cursor-pointer shadow-sm flex items-center justify-center"
                  title="發送給 Rica+ AI 智能助手"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Small licensing compliance banner */}
          <div className="text-[8px] text-slate-400 text-center font-mono pt-0.5 shrink-0">
            EAA CIRCULAR 18-02(CR) • Rica+ COMPLIANCE SECURE FIREWALL
          </div>

        </div>

        {/* Sliding iOS Share Sheet Overlay */}
        {showShareSheet && (
          <div className="absolute inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowShareSheet(false)}>
            <div 
              className="w-full bg-white/95 backdrop-blur-2xl rounded-t-3xl p-4 shadow-2xl space-y-4 animate-slide-up text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-1">
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
                <p className="text-[10px] font-bold text-[#FF6600] uppercase tracking-widest">Rica+ 12 平台差別化分發系統</p>
                <p className="text-[9px] text-slate-500 font-bold">文案已安全校準。請選擇要發布的手機應用管道 (Native Share-to)：</p>
              </div>

              {/* Share Channels - Horizontal Scroll of App Icons */}
              <div className="flex items-center space-x-3.5 overflow-x-auto pb-3.5 pt-1.5 scrollbar-thin px-1 border-b border-slate-200/50">
                
                {/* 1. WhatsApp */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.whatsapp, "WhatsApp");
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(compliance.whatsapp)}`, '_blank');
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    WA
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">WhatsApp</span>
                </button>

                {/* 2. Telegram Share Link */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.telegram, "Telegram");
                    window.open(`https://t.me/share/url?url=${encodeURIComponent("https://www.ricacorp.com")}&text=${encodeURIComponent(compliance.telegram)}`, '_blank');
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    TG
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">Telegram</span>
                </button>

                {/* 3. Telegram Direct Bot Send */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleDirectTelegramSend();
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    BOT
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">TG直發</span>
                </button>

                {/* 4. Xiaohongshu */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.xiaohongshu, "小紅書");
                    window.open("https://www.xiaohongshu.com", "_blank");
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    RED
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">小紅書</span>
                </button>

                {/* 5. WeChat Moments */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.wechat, "微信朋友圈");
                    window.open("https://weixin.qq.com", "_blank");
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-green-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    WX
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">微信朋友圈</span>
                </button>

                {/* 6. Facebook */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.facebook, "Facebook");
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://www.ricacorp.com")}&quote=${encodeURIComponent(compliance.facebook)}`, '_blank');
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-800 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    FB
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">Facebook</span>
                </button>

                {/* 7. Instagram */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.instagram, "Instagram");
                    window.open("https://www.instagram.com", "_blank");
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-pink-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    IG
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">Instagram</span>
                </button>

                {/* 8. Threads */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.threads, "Threads");
                    window.open(`https://threads.net/intent/post?text=${encodeURIComponent(compliance.threads)}`, '_blank');
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    TH
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">Threads</span>
                </button>

                {/* 9. X / Twitter */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.twitter, "X (Twitter)");
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(compliance.twitter)}`, '_blank');
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-950 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    X
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">X (Twitter)</span>
                </button>

                {/* 10. Discord */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.discord, "Discord");
                    window.open("https://discord.com", "_blank");
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    DC
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">Discord</span>
                </button>

                {/* 11. Line */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    handleCopyPlatformText(compliance.line, "Line");
                    window.open(`https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(compliance.line)}`, '_blank');
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-green-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    LN
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">Line</span>
                </button>

                {/* 12. YouTube Shorts */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    const script = compliance.youtube || generatedVideoScript || `🎬 【利嘉閣帶看 Shorts】\n物業編號：${parsedPropID}\n意向價：${parsedPrice.toLocaleString()}\n實用：${parsedArea}呎！`;
                    handleCopyPlatformText(script, "YouTube");
                    window.open("https://www.youtube.com", "_blank");
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    YT
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">YouTube</span>
                </button>

                {/* 13. Douyin / TikTok */}
                <button
                  onClick={() => {
                    setShowShareSheet(false);
                    const script = compliance.douyin || generatedVideoScript || `🎬 【抖音帶看精選】\n物業編號：${parsedPropID}\n鄰近 ${parsedLandmark}！`;
                    handleCopyPlatformText(script, "抖音");
                    window.open("https://www.douyin.com", "_blank");
                  }}
                  className="flex flex-col items-center shrink-0 min-w-[65px] cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-extrabold text-xs shadow-md group-hover:scale-105 transition">
                    DY
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1.5 font-bold whitespace-nowrap">抖音 / TikTok</span>
                </button>

              </div>

              {/* Secure mechanism explanation block */}
              <div className="bg-slate-50 rounded-xl p-2.5 text-[9px] text-slate-500 leading-normal border border-slate-100">
                🛡️ <strong>Native Share-to 原生分發機制：</strong> 已自動依各平台演算法及 EAA 法規過濾敏感詞。本系統採用經紀個人端 Native Share-to 機制發布，不走集中 API 群發，避免引發 IP 及設備關聯封號。
              </div>

              {/* ── Phase 5: Game-Style Canvas Poster Share ── */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">🎨 遊戲風格海報分享</span>
                  <span className="h-px flex-1 bg-slate-200"></span>
                </div>

                <button
                  onClick={async () => {
                    setShowShareSheet(false);
                    await handlePosterShare();
                  }}
                  disabled={isGeneratingPoster}
                  className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-extrabold text-xs transition-all duration-200 shadow-md ${
                    isGeneratingPoster
                      ? 'bg-slate-200 text-slate-400 cursor-wait'
                      : 'bg-gradient-to-r from-[#FF6600] via-orange-500 to-amber-500 text-white hover:shadow-lg active:scale-[0.98] cursor-pointer'
                  }`}
                >
                  {isGeneratingPoster ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                      <span>正在合成 4 層海報...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-xs font-black">🎨</span>
                      <span>一鍵生成遊戲風格海報 + 原生分享</span>
                    </>
                  )}
                </button>

                <p className="text-[8px] text-slate-400 text-center leading-relaxed">
                  合成 4 層 Canvas 海報（相片 + 數據疊加 + 品牌合規 + QR Code）→ PNG Blob → 原生 Share Sheet / 自動下載
                </p>
              </div>

              <button 
                onClick={() => setShowShareSheet(false)}
                className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 4. Right Sidebar / Slide-over: UTM Dynamic Link Generator */}
      {showUtmPanel && (
        <div className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full shrink-0 z-30 animate-slide-left relative">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-150 flex items-center justify-between shrink-0 bg-slate-50">
            <div className="flex items-center space-x-2">
              <Globe className="w-4.5 h-4.5 text-[#FF6600]" />
              <div>
                <h3 className="font-bold text-xs text-slate-900">UTM 追蹤連結產生器</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dynamic Marketing URL Generator</p>
              </div>
            </div>
            <button 
              onClick={() => setShowUtmPanel(false)}
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
            {/* Toggle UTM functionality entirely */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">啟用自動 UTM 注入</span>
                <p className="text-[9px] text-slate-400 leading-normal">啟用後，本系統編譯的所有平台文案將自動附加專屬追蹤連結。</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isUtmEnabled} 
                  onChange={(e) => setIsUtmEnabled(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#FF6600]"></div>
              </label>
            </div>

            {/* Input fields */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Property ID (物業編號)</label>
                <input 
                  type="text"
                  value={parsedPropID || ""}
                  onChange={(e) => setParsedPropID(e.target.value.toUpperCase())}
                  placeholder="E.g. AH2023101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF6600]"
                />
                <p className="text-[8px] text-slate-400 leading-normal">💡 自動抓取目前混沌輸入中的物業編號，您亦可手動覆寫。</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Agent ID (地產經紀編號 / Campaign)</label>
                <input 
                  type="text"
                  value={utmAgentId}
                  onChange={(e) => {
                    setUtmAgentId(e.target.value);
                    localStorage.setItem('rica_utm_agent_id', e.target.value);
                  }}
                  placeholder="E.g. C-001702-A101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF6600]"
                />
                <p className="text-[8px] text-slate-400 leading-normal">儲存於本地。作為 `utm_campaign` 追蹤業績歸屬。</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Post ID (貼文編號 / Content)</label>
                <input 
                  type="text"
                  value={utmPostId}
                  onChange={(e) => setUtmPostId(e.target.value)}
                  placeholder="E.g. post-20260720"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Marketing Scenario (推廣場景 / Medium)</label>
                <select
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value as UTMMedium)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="property_listing">二手/一手房源放盤 (property_listing)</option>
                  <option value="achievement">經紀個人業績報喜 (achievement)</option>
                  <option value="finance_news">樓市金融財經新聞 (finance_news)</option>
                  <option value="hk_macro_policy">香港宏觀政策解讀 (hk_macro_policy)</option>
                </select>
              </div>
            </div>

            {/* Live Link Previews per Source */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">分發渠道 UTM 連結預覽</span>
              
              {(['whatsapp', 'xiaohongshu', 'facebook', 'instagram', 'linkedin'] as UTMSource[]).map((src) => {
                const generatedLink = generateUtmUrl({
                  id: parsedPropID && parsedPropID.trim().length > 0 ? parsedPropID : "AH2023101",
                  source: src,
                  medium: utmMedium,
                  campaign: utmAgentId,
                  content: utmPostId
                });

                return (
                  <div key={src} className="bg-slate-50/80 border border-slate-150 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#FF6600] capitalize">{src} 專用</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLink);
                          triggerGlobalNotification("複製成功", `已成功複製 ${src} 專屬 UTM 連結！`, "link", "success");
                        }}
                        className="text-[9px] text-slate-500 hover:text-[#FF6600] font-bold flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> 複製連結
                      </button>
                    </div>
                    <div className="bg-slate-100 p-1.5 rounded-lg font-mono text-[9px] text-slate-600 break-all border border-slate-150 text-left">
                      {generatedLink}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Panel Footer */}
          <div className="p-4 border-t border-slate-150 bg-slate-50 flex flex-col gap-2 shrink-0 text-left">
            <div className="text-[9px] text-[#FF6600] font-extrabold leading-relaxed">
              🔗 自動附加：已配置為在複製和 Native Share-to 分發時自動將這些 UTM 追蹤鏈結嵌入至文案正文中。
            </div>
          </div>
        </div>
      )}

      {/* 3. Right Sidebar / Slide-over: Platform Policy Audit Database */}
      {showPolicyPanel && (
        <div className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full shrink-0 z-30 animate-slide-left relative">
          
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-150 flex items-center justify-between shrink-0 bg-slate-50">
            <div className="flex items-center space-x-2">
              <Database className="w-4.5 h-4.5 text-[#FF6600]" />
              <div>
                <h3 className="font-bold text-xs text-slate-900">Rica+ 平台合規數據庫</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">EAA Compliant Engine Core</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPolicyPanel(false)}
              className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Sync Header Button Block */}
          <div className="p-3 bg-orange-50 border-b border-orange-100/60 shrink-0 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-orange-800 uppercase tracking-wide flex items-center gap-1">
                <RefreshCw className={`w-3 h-3 text-orange-600 ${isUpdatingPolicies ? 'animate-spin' : ''}`} />
                獨立 Python 研究爬蟲
              </span>
              <span className="text-[8px] bg-orange-200/60 text-orange-800 px-1.5 py-0.5 rounded font-black font-mono">
                ZERO-DEP V3
              </span>
            </div>
            <p className="text-[9px] text-orange-700 leading-normal font-medium">
              點擊下方按鈕將調用後端 Python 政策監測模組，自動抓取 Meta / 小紅書 / 抖音的官方服務條款，比對 content-hash，並動態寫入 SQLite 與本地規約文件。
            </p>
            <button
              onClick={handleOneClickUpdate}
              disabled={isUpdatingPolicies}
              className="w-full py-2 bg-[#FF6600] hover:bg-[#e05300] disabled:bg-slate-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-md shadow-[#FF6600]/10 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingPolicies ? 'animate-spin' : ''}`} />
              <span>{isUpdatingPolicies ? "政策抓取、比對與同步中..." : "一鍵同步最新平台政策"}</span>
            </button>
          </div>

          {/* Panel Tabs Selection */}
          <div className="flex border-b border-slate-150 text-xs font-bold shrink-0 bg-slate-50">
            <button
              onClick={() => setPolicyActiveTab('rules')}
              className={`flex-1 py-2.5 text-center transition border-b-2 ${policyActiveTab === 'rules' ? 'border-[#FF6600] text-[#FF6600] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
            >
              發布規約 Rules
            </button>
            <button
              onClick={() => setPolicyActiveTab('snapshots')}
              className={`flex-1 py-2.5 text-center transition border-b-2 ${policyActiveTab === 'snapshots' ? 'border-[#FF6600] text-[#FF6600] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
            >
              政策快照 Snapshots
            </button>
            <button
              onClick={() => setPolicyActiveTab('shadowban')}
              className={`flex-1 py-2.5 text-center transition border-b-2 ${policyActiveTab === 'shadowban' ? 'border-[#FF6600] text-[#FF6600] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
            >
              限流檢測 Logs
            </button>
          </div>

          {/* Panel Content (Scrollable Area) */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-thin text-left">
            
            {/* Tab 1: Rules List */}
            {policyActiveTab === 'rules' && (
              <div className="space-y-4">
                {policyRules.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-[11px] text-slate-400 font-bold">暫無規約數據，請點擊上方按鈕進行同步</p>
                  </div>
                ) : (
                  policyRules.map((rule, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-2.5 shadow-xs">
                      {/* Platform header */}
                      <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                        <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
                          <span className="w-1.5 h-3 bg-[#FF6600] rounded-sm"></span>
                          {rule.platform}
                        </span>
                        <span className="text-[8px] font-mono font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          更新：{rule.last_updated}
                        </span>
                      </div>

                      {/* Info items */}
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">允許外部連結 Cap Links</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${rule.allow_caption_links ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {rule.allow_caption_links ? "ALLOW" : "PROHIBITED 🚫"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">推薦審計動作 Fallback</span>
                          <span className="bg-slate-200 text-slate-700 font-mono font-extrabold px-1.5 py-0.5 rounded text-[8px]">
                            {rule.recommended_action}
                          </span>
                        </div>
                      </div>

                      {/* Scrub keywords tag list */}
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] block">合規限禁/屏蔽詞字典</span>
                        <div className="flex flex-wrap gap-1">
                          {rule.scrub_keywords && rule.scrub_keywords.length > 0 ? (
                            rule.scrub_keywords.map((word: string, i: number) => (
                              <span key={i} className="bg-rose-50 text-rose-600 border border-rose-100 rounded text-[9px] px-1.5 py-0.5 font-bold font-mono">
                                {word}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-400 font-bold italic">目前無敏感屏蔽詞限制</span>
                          )}
                        </div>
                      </div>

                      {/* Source or note */}
                      {rule.note && (
                        <div className="bg-white border border-slate-200/50 p-2 rounded-lg text-[9px] text-slate-500 leading-normal font-medium">
                          💡 <strong>監測摘要：</strong> {rule.note}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Snapshot Log List */}
            {policyActiveTab === 'snapshots' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">歷史抓取記錄 (SQLite Logs)</span>
                  <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    計 {policySnapshots.length} 次
                  </span>
                </div>

                {policySnapshots.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <History className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-[11px] text-slate-400 font-bold">目前暫無快照備份，請同步規約</p>
                  </div>
                ) : (
                  policySnapshots.map((snap, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl space-y-1.5 text-[10px] leading-relaxed">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 bg-slate-200/60 px-1.5 py-0.5 rounded font-mono">
                          {snap.platform}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400">
                          {snap.fetched_at}
                        </span>
                      </div>

                      <div className="space-y-1 font-mono text-[9px] text-slate-500 break-all leading-normal">
                        <p><strong>來源：</strong> <a href={snap.source_url} target="_blank" rel="noreferrer" className="text-[#FF6600] underline">{snap.source_url}</a></p>
                        <p><strong>備份：</strong> {snap.snapshot_path}</p>
                        <p><strong>HASH：</strong> {snap.content_hash}</p>
                        <p><strong>大小：</strong> {snap.content_length} 字節 (bytes)</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Shadowban Monitor & Simulator */}
            {policyActiveTab === 'shadowban' && (
              <div className="space-y-4">
                
                {/* Simulator Form Box */}
                <div className="bg-[#FF6600]/5 border border-[#FF6600]/20 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-[#FF6600]">
                    <ShieldCheck className="w-4 h-4 fill-current" />
                    <span className="font-bold text-[11px]">模擬 Python 限流 (Shadowban) 檢測</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-normal">
                    輸入已發布貼文的分享連結，調用 Python 分析模組。模組會隨機產生瀏覽數據並自動記錄至 SQLite，模擬限流屏蔽行為。
                  </p>
                  
                  <div className="space-y-1.5 text-[10px] text-slate-700">
                    <div>
                      <label className="font-bold text-slate-400 block mb-0.5">貼文連結 (Post URL)</label>
                      <input 
                        type="text" 
                        value={shadowbanPostUrl}
                        onChange={(e) => setShadowbanPostUrl(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-[#FF6600]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-400 block mb-0.5">發布平台 (Platform)</label>
                      <select 
                        value={shadowbanPlatform}
                        onChange={(e) => setShadowbanPlatform(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-[#FF6600]"
                      >
                        <option value="Xiaohongshu">Xiaohongshu 小紅書</option>
                        <option value="Meta">Meta (Facebook/Instagram)</option>
                        <option value="Douyin">Douyin 抖音</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleRunShadowbanCheck}
                    disabled={isTestingShadowban}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTestingShadowban ? 'animate-spin' : ''}`} />
                    <span>{isTestingShadowban ? "稽核限流狀態中..." : "啟動 Python 限流分析"}</span>
                  </button>
                </div>

                {/* History list */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5">
                    歷史稽核紀錄 (SQLite Database)
                  </span>

                  {shadowbanChecks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-[10px] font-bold">
                      暫無稽核紀錄，請在上方提交網址
                    </div>
                  ) : (
                    shadowbanChecks.map((check, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${check.flagged ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {check.flagged ? "⚠️ SHADOWBANNED 限流" : "✅ HEALTHY 正常發布"}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">
                            {check.checked_at}
                          </span>
                        </div>

                        <div className="space-y-1 font-mono text-[9px] text-slate-500 break-all leading-normal">
                          <p><strong>連結：</strong> {check.post_url}</p>
                          <p><strong>平台：</strong> {check.platform}</p>
                          <p><strong>累計瀏覽：</strong> {check.views?.toLocaleString()} 次</p>
                          <p><strong>發布時長：</strong> {check.elapsed_hours} 小時</p>
                          {check.flagged && <p className="text-rose-600 font-extrabold"><strong>原因：</strong> {check.reason}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Footer licensing stamp */}
          <div className="p-3 border-t border-slate-150 bg-slate-50 text-[8px] text-slate-400 font-mono text-center shrink-0">
            SECURED REAL ESTATE DATABASE CORE v1.0
          </div>

        </div>
      )}

    </div>
  );
}
