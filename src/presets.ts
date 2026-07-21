import { PresetScenario, QuizQuestion } from './types';

export const TRUE_PRICE_DATABASE: Record<string, { avgPrice: number; saleableArea: number }> = {
  "香港大学 / 堅尼地城": { avgPrice: 18000, saleableArea: 450 }, // rent (HKD)
  "啟德": { avgPrice: 19500, saleableArea: 480 }, // rent (HKD)
  "太古城": { avgPrice: 10200000, saleableArea: 810 }, // sale (HKD)
  "將軍澳日出康城": { avgPrice: 4200000, saleableArea: 420 }, // sale (HKD)
  "東涌藍天海岸": { avgPrice: 7500000, saleableArea: 590 }, // sale (HKD)
  "奧運站 / 大角咀": { avgPrice: 22000, saleableArea: 510 }, // rent (HKD)
};

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 1,
    title: "港大新生租房 (小紅書)",
    targetAudience: "Mainland Students / Talents (內地專才與留學生)",
    platform: "Xiaohongshu (RED)",
    language: "zh-Hans",
    landmarks: ["香港大学", "堅尼地城站C出口", "西宝城"],
    defaultPrice: 18000, // Monthly Rent (HKD)
    defaultArea: 450,
    defaultPropertyID: "KL-9988-TY",
    chaosInput: "港大新生租房！近坚尼地城C口，行去港大，海景两房，极简装修拎包入住，租金1万8，免中介。微信联系我：vx_hongkong_rent99，电话852-91234567，WhatsApp同号。",
    copywriting: "🎓港大新生租房看过来！下楼即達堅尼地城站C出口，步行或一站地鐵直達香港大學校園。周邊配套極其便利，西寶城大型超市、各類網紅茶餐廳應有盡有。高層海景兩房，採光極佳，全新極簡裝修，支持拎包入住。和小夥伴合租首選，無中介費真盤源！ #香港租房 #港大租房 #堅尼地城 #香港留學 #利嘉閣"
  },
  {
    id: 2,
    title: "啟德收租回報 (微信朋友圈)",
    targetAudience: "Yield Hunters / Investors (投資客)",
    platform: "WeChat Moments / Channels",
    language: "zh-Hant-HK",
    landmarks: ["啟德地鐵站", "AIRSIDE"],
    defaultPrice: 19500, // Monthly Rent (HKD)
    defaultArea: 480,
    defaultPropertyID: "KT-1122-RE",
    chaosInput: "啟德地段優質收租盤，租金19500，近地鐵同AIRSIDE，實用高層，租金回報3.9%。有意WhatsApp 92345678或微訊號 qide_invest 詳談，業主誠意放盤。",
    copywriting: "📈 啟德核心地段優質收租盤，防守性極強！受惠於息口回落至 3.25%-3.5% 及內地人才流入，區內租金回報表現亮眼。此單位鄰近啟德地鐵站及全新地標 AIRSIDE，實用高層兩房，現時 gross rental yield 達 3.9% 以上，極具防守力。歡迎私訊索取最新成交數據與 3D 虛擬看房連結！ #啟德業主 #香港樓市 #租金回報 #利嘉閣 #真盤源"
  },
  {
    id: 3,
    title: "太古城換樓策略 (Facebook)",
    targetAudience: "Upgraders (換樓客)",
    platform: "Facebook",
    language: "zh-Hant-HK",
    landmarks: ["太古城", "太古城中心", "太古港鐵站"],
    defaultPrice: 10200000, // Sale Price (HKD)
    defaultArea: 810,
    defaultPropertyID: "TK-8877-UP",
    chaosInput: "太古城高層三房1020萬，想換樓要計數？先買後賣定先賣後買？睇樓加微信 taikoo_agent 啦，或者打電話 61234567 搵我做免費估值啦。",
    copywriting: "🏡 住緊兩房想換三房，煩惱緊「先買後賣」定「先賣後買」？公司最新 Rica+ AI 智能助理幫你一鍵拆解兩個方案嘅利弊與稅務雜費開支。今期誠意推薦太古城高層優質三房，鄰近太古城中心，間隔實用，極具自住價值。想預算爆數開單零出錯？即刻 inbox 我地做個免費物業估值先啦！ #太古城 #換樓攻略 #香港買樓 #利嘉閣 #真盤源"
  },
  {
    id: 4,
    title: "日出康城首置上車 (Instagram)",
    targetAudience: "First-Time Homebuyers (首次置業客)",
    platform: "Instagram",
    language: "zh-Hant-HK",
    landmarks: ["將軍澳", "日出康城", "康城港鐵站"],
    defaultPrice: 4200000, // Sale Price (HKD)
    defaultArea: 420,
    defaultPropertyID: "LO-4433-SB",
    chaosInput: "康城高層一房420萬，首次置業唔知首期同按揭成數？有3D Walkthrough，有意留微信或電聯98761234，免傭金。",
    copywriting: "✨ 第一次買樓唔知點入手？首期、印花稅、按揭成數計到頭都大埋？🤯 別慌！我地為你整理左超詳細嘅【首次置業懶人包】，等您置業一步到位。精選將軍澳日出康城高層一房，鄰近康城站及 The LOHAS 康城商場，上車首選！ 點擊 link in bio 即睇 3D Walkthrough，輕鬆搵到你嘅 Dream Home！ #首次置業 #上車盤 #日出康城 #將軍澳物業 #利嘉閣"
  },
  {
    id: 5,
    title: "藍天海岸業主放盤 (WhatsApp)",
    targetAudience: "Property Sellers (業主放盤)",
    platform: "WhatsApp Broadcast",
    language: "zh-Hant-HK",
    landmarks: ["東涌", "藍天海岸", "東涌港鐵站"],
    defaultPrice: 7500000, // Sale Price (HKD)
    defaultArea: 590,
    defaultPropertyID: "TC-5566-V1",
    chaosInput: "東涌藍天海岸高層海景兩房750萬，成交活躍。想放盤、了解市場估值，加我微訊 tcocean 或WhatsApp 98765432 精準叫價。",
    copywriting: "陳生您好，近期東涌藍天海岸成交相當活躍，最新實用呎價已穩步回升。因應近日有多位優質連帶資金嘅準買家積極尋找高層海景兩房單位，若您有意調整持倉或放售單位，我地可以用 Rica+ 系統為您提供即時市場估值與定價分析，幫您精準叫價。有興趣了解更多歡迎隨時回覆！ #東涌物業 #藍天海岸 #業主放盤 #利嘉閣"
  },
  {
    id: 6,
    title: "奧運站會所兩房 (Telegram)",
    targetAudience: "Demanding Tenants (對配套有要求之租客)",
    platform: "Telegram",
    language: "zh-Hant-HK",
    landmarks: ["大角咀", "奧運港鐵站", "奧海城"],
    defaultPrice: 22000, // Monthly Rent (HKD)
    defaultArea: 510,
    defaultPropertyID: "OL-3311-TG",
    chaosInput: "奧運沿線高尚會所兩房22000，交通購物方便。想睇樓加微信 olagent 或 WhatsApp 90123456 詳談。",
    copywriting: "🚇【地鐵沿線奧運站・高CP值高尚會所兩房】\n\n📌位置：大角咀鄰近奧運站，3分鐘直達奧海城，交通購物極方便\n📌配套：連大型住客會所（泳池、Gym房室），高層向南採光充足\n📌預算：租金性價比極高，適合注重生活品質嘅專業人士/情侶！\n\n💡支持即時看房。拎包入住，附全套現代極簡傢俬。有興趣即刻 DM @hk_agent_bot 諮詢！ #奧運站 #大角咀租房 #會所住宅 #利嘉閣"
  },
  {
    id: 7,
    title: "息口放寬防守收租 (堅尼地城)",
    targetAudience: "Yield Hunters / Investors (投資客)",
    platform: "WhatsApp / Facebook / Xiaohongshu",
    language: "zh-Hant-HK",
    landmarks: ["香港大学", "堅尼地城"],
    defaultPrice: 13000,
    defaultArea: 310,
    defaultPropertyID: "AH2023101",
    chaosInput: "堅尼地城高層一房租1萬3，實用310呎，物業編號AH2023101，受惠息口減到3.25至3.5，又有內地高才源源湧入，回報有成3.95%到4.82%，防守力好強。想放盤、了解市場估值，PM聯絡我啦！",
    copywriting: "📢 【息口政策放寬 • 穩健防守性收租筍盤推薦】\n\n受惠於近日息口回落至 3.25%-3.5% 及內地高才源源湧入，香港優質屋苑的租金回報表現非常優異，部分微觀屋苑回報率達 3.95% - 4.82%！\n\n今期為各位實力買家及換樓中產誠意推薦 堅尼地城 核心精選：\n👉 意向月租：HK$ 13,000 /月\n👉 實用面積：約 310 平方呎\n👉 物業編號：AH2023101\n\n該屋苑成交活躍，抗跌防守力極強。歡迎點擊下方 PM 聯絡我們獲取該區最新的成交與估值數據報告，實現資產配置最佳化！\n\n---\n利嘉閣地產有限公司（牌照號碼：C-001702）\n委託狀態：已獲業主書面授權委託放盤\n廣告發布日期：2026-07-20"
  }
];

export const REVISION_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: "Use Case Model (需求分析)",
    question: "在 Rica+ 系統中，經紀正在生成文案，到一半時外部房產數據庫（True Price Database）超時離線，導致 AI 產生的文案缺少精確平方呎數據。在標準使用案例描述（Use Case Description）範本中，系統在此超時情境下的應對行為應記錄於哪一個特定章節？",
    choices: [
      { text: "主要成功流程 (Main Success Flow)", isCorrect: false },
      { text: "替代流 / 例外流 (Alternative Flows / Exception Flows / 雨天流)", isCorrect: true },
      { text: "前置條件 (Preconditions)", isCorrect: false },
      { text: "系統邊界 (System Boundary)", isCorrect: false }
    ],
    rationale: "主成功流程只記錄一切順利的完美路徑。任何網絡逾時、系統異常或資料庫連線失敗，都屬於偏離主路徑的例外情況，必須在『替代/例外流程』區塊中予以捕獲和詳細定義。"
  },
  {
    id: 2,
    category: "Domain Class Diagrams (類別圖)",
    question: "請參考以下房地產經紀與 AI 會話間的多重性關係：Agent [1..1] ------------------ [0..*] AI_AssistantSession。根據 UML 類別圖的『黃金法則』，請從單一 AI_AssistantSession 實例的角度來解讀此關聯的 1..1 多重性意義。",
    choices: [
      { text: "在系統中，同一個 AI_AssistantSession 實例可以同時分配給多位經紀共享使用。", isCorrect: false },
      { text: "一個特定的 AI_AssistantSession 實例在運行時，必須且只能 (1..1) 屬於一個已通過驗證的 Agent。", isCorrect: true },
      { text: "每個經紀在同一時間內，最多只能同時啟動且運行 1 個 AI_AssistantSession 實例。", isCorrect: false },
      { text: "系統在內存中最多只能加載 1 個 Agent 與 1 個 AI_AssistantSession 類別。", isCorrect: false }
    ],
    rationale: "多重性的『黃金法則』：從相反面開始，對單個 AI_AssistantSession 實例而言，它所連結的 Agent 數量最少為 1，最大為 1。這在架構層面強制執行了安全規範：帳戶不得共享，且每位註冊用戶限制同時只能在單一裝置上線。"
  },
  {
    id: 3,
    category: "Sequence Diagrams (序列圖)",
    question: "客服人員（經紀）在介面上點選生成，控制層 AI_AssistantController 向實體 ClientProfile 發送 verifyBudgetConstraints() 訊息。為了使此 UML 序列圖（Sequence Diagram）在語意上完全合規且有效，下列哪項類別操作（Operations）定義是必須的？",
    choices: [
      { text: "AI_AssistantController 類別中必須定義 verifyBudgetConstraints() 作為其公開操作。", isCorrect: false },
      { text: "接收此訊息的 ClientProfile 類別，必須在其操作（Operations）中定義並實現 verifyBudgetConstraints() 方法。", isCorrect: true },
      { text: "Agent 主體類別中必須包含 verifyBudgetConstraints() 方法的完整實現代碼。", isCorrect: false },
      { text: "此訊息是控制訊息，不屬於任何類別的操作，因此不需要在任何類別中進行定義。", isCorrect: false }
    ],
    rationale: "序列圖中的訊息箭頭代表方法調用（函式呼叫）。箭頭指向哪個物件，該物件所屬的類別（此處為 ClientProfile）就必須在其屬性與操作定義中包含並執行該方法，這保障了物件導向設計的封裝性。"
  },
  {
    id: 4,
    category: "State Machine Lifecycles (狀態機圖)",
    question: "當發生 priceChanged 事件時，若新申報價格與經過系統核實的市場平均成交價相差超過 20%，系統會自動將 PropertyListing 的狀態從 Active 切換為 Suspended。在 UML 狀態機圖中，括號內的這個『[deviation > 20%]』檢查稱為？",
    choices: [
      { text: "轉換觸發器 (Transition Trigger)", isCorrect: false },
      { text: "守衛條件 (Guard Condition)", isCorrect: true },
      { text: "原子動作 (Atomic Action)", isCorrect: false },
      { text: "後置狀態 (Post-state)", isCorrect: false }
    ],
    rationale: "在狀態機轉換中，括號內 `[條件]` 為守衛條件（Guard Condition）。只有當該布林表達式評估為 true 時，轉換才會被觸發。標準 UML 轉換箭頭文字語法為：`事件 [守衛] / 動作` (E.g. `priceChanged [deviation > 20%] / logSuspension()`)"
  },
  {
    id: 5,
    category: "System Analysis Concepts (系統分析概念)",
    question: "利嘉閣資訊部門計劃加入一個合規模組（Rica+ AI Undercover Co-Pilot），用於在文案發布前，自動且隱形地發現前線經紀輸入中的敏感引流詞、錯別字或法規錯誤（e.g., validateCompliance() 機制）。在系統分析中，此合規性控制邏輯在領域類別圖中應被設計為？",
    choices: [
      { text: "外部使用者執行角色 (User Actor)，因為它模擬了合規官的稽核角色。", isCorrect: false },
      { text: "類別屬性 (Class Attribute)，因為它是一套靜態的法規規則庫。", isCorrect: false },
      { text: "類別方法/操作 (Method/Operation)，如在控制器層中模擬自動驗證行為。", isCorrect: true },
      { text: "關聯多重性 (Association Multiplicity)，用於限制數據的流動方向。", isCorrect: false }
    ],
    rationale: "自動校驗合規性的逻辑是系統在後台執行的處理行為或業務規則。這代表系統的行為功能，在物件導向建模中對應為類別的『操作/方法』（Method/Operation），它與經紀的輸入步驟解耦，在背景隱行運作。"
  }
];
