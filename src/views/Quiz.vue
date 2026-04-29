<script setup>
import { computed, onMounted, onUnmounted, ref, watch, inject } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  subject: {
    type: String,
    required: true
  }
})

const router = useRouter()

// 國文科題目
const chinesePracticeQuestions = [
  { id: 1, type: 'single', title: '「詩經」是中國最早的詩歌總集，其中「國風」部分的詩歌主要反映了什麼？', options: [{ value: 'court', label: '宮廷生活', color: '#60a5fa' }, { value: 'folk', label: '民間生活', color: '#34d399' }, { value: 'nature', label: '自然景物', color: '#f97316' }, { value: 'war', label: '戰爭場面', color: '#a78bfa' }], answer: 'folk', keywords: ['詩經', '國風', '民間'], explanation: '國風是詩經的重要組成部分，主要反映了周代民間的生活和風俗。' },
  { id: 2, type: 'multiple', title: '下列哪些是唐詩的特點？（可複選）', options: [{ value: 'rhythm', label: '音韻和諧', color: '#38bdf8' }, { value: 'vernacular', label: '通俗易懂', color: '#f97316' }, { value: 'imagery', label: '意象豐富', color: '#6ee7b7' }, { value: 'rhyme', label: '押韻嚴格', color: '#a78bfa' }], answer: ['rhythm', 'imagery', 'rhyme'], keywords: ['唐詩', '音韻', '意象'], explanation: '唐詩注重音韻和諧、意象豐富，並有嚴格的押韻要求。' },
  { id: 3, type: 'tf', title: '「紅樓夢」是中國古典小說的巔峰之作。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['紅樓夢', '古典小說', '巔峰'], explanation: '紅樓夢被譽為中國古典小說的巔峰之作，藝術成就極高。' },
  { id: 4, type: 'single', title: '下列哪位詩人是唐代著名詩人？', options: [{ value: 'li bai', label: '李白', color: '#22c55e' }, { value: 'su shi', label: '蘇軾', color: '#ef4444' }, { value: 'du fu', label: '杜甫', color: '#f59e0b' }, { value: 'lu xun', label: '魯迅', color: '#6366f1' }], answer: 'li bai', keywords: ['唐代', '詩人', '李白'], explanation: '李白是唐代最著名的浪漫主義詩人之一。' },
  { id: 5, type: 'multiple', title: '現代文閱讀中，什麼是理解文章主旨的關鍵？（可複選）', options: [{ value: 'title', label: '標題', color: '#60a5fa' }, { value: 'conclusion', label: '結論', color: '#f97316' }, { value: 'examples', label: '例子', color: '#34d399' }, { value: 'thesis', label: '論點', color: '#a78bfa' }], answer: ['title', 'conclusion', 'thesis'], keywords: ['主旨', '標題', '結論'], explanation: '標題、結論和論點是理解文章主旨的重要線索。' },
  { id: 6, type: 'tf', title: '文言文的語法與現代漢語完全相同。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'false', keywords: ['文言文', '語法', '差異'], explanation: '文言文的語法與現代漢語有很大差異，需要特別學習。' },
  { id: 7, type: 'single', title: '「推敲」一詞最早是用來形容什麼？', options: [{ value: 'painting', label: '繪畫技巧', color: '#f97316' }, { value: 'poetry', label: '詩歌創作', color: '#2563eb' }, { value: 'music', label: '音樂演奏', color: '#6ee7b7' }, { value: 'dance', label: '舞蹈表演', color: '#a78bfa' }], answer: 'poetry', keywords: ['推敲', '詩歌', '創作'], explanation: '推敲原指詩人創作時反覆琢磨字句的過程。' },
  { id: 8, type: 'multiple', title: '閱讀理解中，以下哪些是常見的閱讀技巧？（可複選）', options: [{ value: 'skimming', label: '略讀', color: '#38bdf8' }, { value: 'scanning', label: '掃讀', color: '#a78bfa' }, { value: 'intensive', label: '精讀', color: '#f59e0b' }, { value: 'guessing', label: '猜測', color: '#4f46e5' }], answer: ['skimming', 'scanning', 'intensive'], keywords: ['閱讀技巧', '略讀', '掃讀'], explanation: '略讀、掃讀和精讀是基本的閱讀理解技巧。' },
  { id: 9, type: 'tf', title: '「楚辭」是戰國時期楚地的詩歌形式。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['楚辭', '戰國', '楚地'], explanation: '楚辭是戰國時期楚地的一種詩歌形式，以屈原的作品為代表。' },
  { id: 10, type: 'single', title: '下列哪部作品是魯迅先生的代表作？', options: [{ value: 'ah q', label: '阿Q正傳', color: '#22c55e' }, { value: 'dream', label: '紅樓夢', color: '#0ea5e9' }, { value: 'journey', label: '西遊記', color: '#a78bfa' }, { value: 'water', label: '水滸傳', color: '#f97316' }], answer: 'ah q', keywords: ['魯迅', '阿Q正傳', '代表作'], explanation: '阿Q正傳是魯迅先生的代表作之一。' },
  { id: 11, type: 'multiple', title: '古典詩詞中，什麼是對仗的要求？（可複選）', options: [{ value: 'word', label: '詞性對應', color: '#60a5fa' }, { value: 'meaning', label: '意義相關', color: '#f97316' }, { value: 'tone', label: '平仄相對', color: '#34d399' }, { value: 'length', label: '字數相同', color: '#a78bfa' }], answer: ['word', 'tone'], keywords: ['對仗', '詞性', '平仄'], explanation: '對仗要求詞性對應和平仄相對。' },
  { id: 12, type: 'tf', title: '現代詩沒有固定的格式和韻律。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['現代詩', '格式', '韻律'], explanation: '現代詩打破了傳統的格式和韻律限制，更注重個性表達。' },
  { id: 13, type: 'single', title: '「五四運動」對中國文學有什麼重大影響？', options: [{ value: 'vernacular', label: '推廣白話文', color: '#f97316' }, { value: 'classical', label: '復興古文', color: '#2563eb' }, { value: 'foreign', label: '引進外國文學', color: '#6ee7b7' }, { value: 'traditional', label: '保持傳統', color: '#a78bfa' }], answer: 'vernacular', keywords: ['五四運動', '白話文', '文學'], explanation: '五四運動大力推廣白話文，對中國現代文學發展有重大影響。' },
  { id: 14, type: 'multiple', title: '寫作時，以下哪些是修辭手法？（可複選）', options: [{ value: 'metaphor', label: '比喻', color: '#38bdf8' }, { value: 'personification', label: '擬人', color: '#a78bfa' }, { value: 'hyperbole', label: '誇張', color: '#f59e0b' }, { value: 'grammar', label: '語法', color: '#4f46e5' }], answer: ['metaphor', 'personification', 'hyperbole'], keywords: ['修辭手法', '比喻', '擬人'], explanation: '比喻、擬人和誇張都是常見的修辭手法。' },
  { id: 15, type: 'tf', title: '「論語」是孔子及其弟子的言論集。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['論語', '孔子', '言論集'], explanation: '論語記錄了孔子及其弟子的言論，是儒家經典著作。' },
  { id: 16, type: 'single', title: '下列哪位作家是現代文學家？', options: [{ value: 'lu xun', label: '魯迅', color: '#22c55e' }, { value: 'li bai', label: '李白', color: '#ef4444' }, { value: 'su shi', label: '蘇軾', color: '#f59e0b' }, { value: 'du fu', label: '杜甫', color: '#6366f1' }], answer: 'lu xun', keywords: ['現代文學', '魯迅', '作家'], explanation: '魯迅是中國現代文學的重要作家。' },
  { id: 17, type: 'multiple', title: '文學作品中，什麼是主題的表現方式？（可複選）', options: [{ value: 'plot', label: '情節發展', color: '#60a5fa' }, { value: 'character', label: '人物塑造', color: '#f97316' }, { value: 'setting', label: '環境描寫', color: '#34d399' }, { value: 'language', label: '語言運用', color: '#a78bfa' }], answer: ['plot', 'character', 'setting'], keywords: ['主題', '情節', '人物'], explanation: '情節、人物和環境都是表現主題的重要方式。' },
  { id: 18, type: 'tf', title: '古詩十九首是漢代無名氏的作品集。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['古詩十九首', '漢代', '無名氏'], explanation: '古詩十九首是東漢時期無名氏創作的詩歌集。' },
  { id: 19, type: 'single', title: '「文心雕龍」是哪方面的著作？', options: [{ value: 'poetry', label: '詩歌理論', color: '#f97316' }, { value: 'literary', label: '文學理論', color: '#2563eb' }, { value: 'history', label: '歷史著作', color: '#6ee7b7' }, { value: 'philosophy', label: '哲學著作', color: '#a78bfa' }], answer: 'literary', keywords: ['文心雕龍', '文學理論', '劉勰'], explanation: '文心雕龍是南朝劉勰撰寫的文學理論著作。' },
  { id: 20, type: 'multiple', title: '閱讀小說時，以下哪些是分析人物的方法？（可複選）', options: [{ value: 'dialogue', label: '對話分析', color: '#38bdf8' }, { value: 'action', label: '行為觀察', color: '#a78bfa' }, { value: 'appearance', label: '外貌描寫', color: '#f59e0b' }, { value: 'thought', label: '心理描寫', color: '#4f46e5' }], answer: ['dialogue', 'action', 'appearance', 'thought'], keywords: ['人物分析', '對話', '行為'], explanation: '對話、行為、外貌和心理都是分析人物的重要方法。' }
]

const chineseTestQuestions = [
  { id: 1, type: 'single', title: '「詩經」中共有多少首詩？', options: [{ value: '305', label: '305首', color: '#60a5fa' }, { value: '300', label: '300首', color: '#34d399' }, { value: '310', label: '310首', color: '#f97316' }, { value: '320', label: '320首', color: '#a78bfa' }], answer: '305', keywords: ['詩經', '詩歌數量', '經典'], explanation: '詩經共收錄了305首詩歌，是中國最早的詩歌總集。' },
  { id: 2, type: 'multiple', title: '唐詩的特點包括哪些？（可複選）', options: [{ value: 'natural', label: '自然流暢', color: '#38bdf8' }, { value: 'formal', label: '形式嚴謹', color: '#f97316' }, { value: 'emotional', label: '情感豐富', color: '#6ee7b7' }, { value: 'simple', label: '語言簡潔', color: '#a78bfa' }], answer: ['natural', 'emotional', 'simple'], keywords: ['唐詩', '特點', '情感'], explanation: '唐詩語言自然流暢，情感豐富，語言簡潔明快。' },
  { id: 3, type: 'tf', title: '「西遊記」是明代小說家吳承恩的作品。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['西遊記', '吳承恩', '明代'], explanation: '西遊記是明代小說家吳承恩創作的古典小說。' },
  { id: 4, type: 'single', title: '下列哪位詩人被稱為「詩仙」？', options: [{ value: 'li bai', label: '李白', color: '#22c55e' }, { value: 'du fu', label: '杜甫', color: '#ef4444' }, { value: 'bai ju yi', label: '白居易', color: '#f59e0b' }, { value: 'wang wei', label: '王維', color: '#6366f1' }], answer: 'li bai', keywords: ['詩仙', '李白', '稱號'], explanation: '李白被後人稱為「詩仙」，以其浪漫主義詩風聞名。' },
  { id: 5, type: 'multiple', title: '現代漢語的語法特點包括？（可複選）', options: [{ value: 'svo', label: '主語在前', color: '#60a5fa' }, { value: 'flexible', label: '詞序靈活', color: '#f97316' }, { value: 'concise', label: '表達簡潔', color: '#34d399' }, { value: 'complex', label: '結構複雜', color: '#a78bfa' }], answer: ['svo', 'flexible', 'concise'], keywords: ['現代漢語', '語法', '詞序'], explanation: '現代漢語主語在前，詞序靈活，表達簡潔。' },
  { id: 6, type: 'tf', title: '「史記」是中國第一部紀傳體通史。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['史記', '紀傳體', '通史'], explanation: '史記是司馬遷撰寫的中國第一部紀傳體通史。' },
  { id: 7, type: 'single', title: '「長恨歌」是哪位詩人的作品？', options: [{ value: 'li bai', label: '李白', color: '#f97316' }, { value: 'du fu', label: '杜甫', color: '#2563eb' }, { value: 'bai ju yi', label: '白居易', color: '#6ee7b7' }, { value: 'li shang yin', label: '李商隱', color: '#a78bfa' }], answer: 'bai ju yi', keywords: ['長恨歌', '白居易', '作品'], explanation: '長恨歌是唐代詩人白居易的著名長篇敘事詩。' },
  { id: 8, type: 'multiple', title: '文學批評的基本方法包括？（可複選）', options: [{ value: 'textual', label: '文本分析', color: '#38bdf8' }, { value: 'contextual', label: '語境分析', color: '#a78bfa' }, { value: 'comparative', label: '比較研究', color: '#f59e0b' }, { value: 'historical', label: '歷史考察', color: '#4f46e5' }], answer: ['textual', 'contextual', 'historical'], keywords: ['文學批評', '文本分析', '語境'], explanation: '文學批評的基本方法包括文本分析、語境分析和歷史考察。' },
  { id: 9, type: 'tf', title: '「離騷」是屈原的代表作。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['離騷', '屈原', '代表作'], explanation: '離騷是戰國時期詩人屈原的代表作，收錄在楚辭中。' },
  { id: 10, type: 'single', title: '下列哪部作品是曹雪芹的作品？', options: [{ value: 'dream', label: '紅樓夢', color: '#22c55e' }, { value: 'journey', label: '西遊記', color: '#0ea5e9' }, { value: 'water', label: '水滸傳', color: '#a78bfa' }, { value: 'three', label: '三國演義', color: '#f97316' }], answer: 'dream', keywords: ['紅樓夢', '曹雪芹', '作品'], explanation: '紅樓夢是清代作家曹雪芹創作的古典小說。' },
  { id: 11, type: 'multiple', title: '詩歌的修辭手法包括哪些？（可複選）', options: [{ value: 'metaphor', label: '隱喻', color: '#60a5fa' }, { value: 'alliteration', label: '頭韻', color: '#f97316' }, { value: 'assonance', label: '元音韻', color: '#34d399' }, { value: 'onomatopoeia', label: '擬聲詞', color: '#a78bfa' }], answer: ['metaphor', 'alliteration', 'onomatopoeia'], keywords: ['修辭手法', '隱喻', '頭韻'], explanation: '詩歌常用的修辭手法包括隱喻、頭韻和擬聲詞等。' },
  { id: 12, type: 'tf', title: '現代詩強調個性化和創新。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['現代詩', '個性化', '創新'], explanation: '現代詩打破傳統束縛，強調詩人的個性表達和創新。' },
  { id: 13, type: 'single', title: '「新青年」雜誌與哪場運動相關？', options: [{ value: 'may fourth', label: '五四運動', color: '#f97316' }, { value: 'cultural', label: '文化大革命', color: '#2563eb' }, { value: 'reform', label: '戊戌變法', color: '#6ee7b7' }, { value: 'republican', label: '辛亥革命', color: '#a78bfa' }], answer: 'may fourth', keywords: ['新青年', '五四運動', '雜誌'], explanation: '新青年雜誌是五四運動時期的重要刊物，推廣新文化。' },
  { id: 14, type: 'multiple', title: '寫作的基本要素包括？（可複選）', options: [{ value: 'content', label: '內容豐富', color: '#38bdf8' }, { value: 'structure', label: '結構完整', color: '#a78bfa' }, { value: 'language', label: '語言得體', color: '#f59e0b' }, { value: 'creativity', label: '創意十足', color: '#4f46e5' }], answer: ['content', 'structure', 'language'], keywords: ['寫作要素', '內容', '結構'], explanation: '寫作的基本要素包括內容豐富、結構完整和語言得體。' },
  { id: 15, type: 'tf', title: '「孟子」是儒家經典著作之一。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['孟子', '儒家', '經典'], explanation: '孟子是儒家經典著作之一，記錄了孟子的言論和思想。' },
  { id: 16, type: 'single', title: '下列哪位是現當代作家？', options: [{ value: 'lu xun', label: '魯迅', color: '#22c55e' }, { value: 'lao she', label: '老舍', color: '#ef4444' }, { value: 'mao dun', label: '茅盾', color: '#f59e0b' }, { value: 'ba jin', label: '巴金', color: '#6366f1' }], answer: 'lu xun', keywords: ['現當代作家', '魯迅', '文學'], explanation: '魯迅是中國現代文學的重要作家。' },
  { id: 17, type: 'multiple', title: '小說的敘事角度包括？（可複選）', options: [{ value: 'first', label: '第一人稱', color: '#60a5fa' }, { value: 'third', label: '第三人稱', color: '#f97316' }, { value: 'omniscient', label: '全知視角', color: '#34d399' }, { value: 'limited', label: '限知視角', color: '#a78bfa' }], answer: ['first', 'third', 'omniscient', 'limited'], keywords: ['敘事角度', '第一人稱', '第三人稱'], explanation: '小說常見的敘事角度包括第一人稱、第三人稱全知和限知視角。' },
  { id: 18, type: 'tf', title: '「古文觀止」是一部古文選集。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['古文觀止', '古文選集', '吳楚材'], explanation: '古文觀止是清代吳楚材編選的古文選集。' },
  { id: 19, type: 'single', title: '「文選」是哪個朝代的選集？', options: [{ value: 'tang', label: '唐代', color: '#f97316' }, { value: 'song', label: '宋代', color: '#2563eb' }, { value: 'ming', label: '明代', color: '#6ee7b7' }, { value: 'qing', label: '清代', color: '#a78bfa' }], answer: 'tang', keywords: ['文選', '蕭統', '選集'], explanation: '文選是南朝梁蕭統編選的詩文選集。' },
  { id: 20, type: 'multiple', title: '散文的寫作特點包括？（可複選）', options: [{ value: 'flexible', label: '形式靈活', color: '#38bdf8' }, { value: 'expressive', label: '抒情性強', color: '#a78bfa' }, { value: 'realistic', label: '貼近生活', color: '#f59e0b' }, { value: 'rhythmic', label: '韻律感強', color: '#4f46e5' }], answer: ['flexible', 'expressive', 'realistic'], keywords: ['散文', '形式靈活', '抒情'], explanation: '散文形式靈活，抒情性強，內容貼近生活。' }
]

// 社會科題目
const socialPracticeQuestions = [
  { id: 1, type: 'single', title: '中國歷史上，哪個朝代實行了「開元盛世」？', options: [{ value: 'tang', label: '唐朝', color: '#60a5fa' }, { value: 'song', label: '宋朝', color: '#34d399' }, { value: 'ming', label: '明朝', color: '#f97316' }, { value: 'qing', label: '清朝', color: '#a78bfa' }], answer: 'tang', keywords: ['開元盛世', '唐朝', '玄宗'], explanation: '唐玄宗開元年間出現了政治清明、經濟繁榮的盛世局面。' },
  { id: 2, type: 'multiple', title: '地理上，什麼是季風氣候的特點？（可複選）', options: [{ value: 'rainy summer', label: '夏季多雨', color: '#38bdf8' }, { value: 'dry winter', label: '冬季乾燥', color: '#f97316' }, { value: 'temperature', label: '溫差大', color: '#6ee7b7' }, { value: 'wind', label: '風向變化', color: '#a78bfa' }], answer: ['rainy summer', 'dry winter', 'wind'], keywords: ['季風氣候', '夏季多雨', '風向'], explanation: '季風氣候夏季受海洋季風影響多雨，冬季受大陸季風影響乾燥，風向有明顯變化。' },
  { id: 3, type: 'tf', title: '公民權利包括言論自由和集會自由。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['公民權利', '言論自由', '集會自由'], explanation: '言論自由和集會自由都是憲法保障的基本公民權利。' },
  { id: 4, type: 'single', title: '下列哪座山脈是中國的天然屏障？', options: [{ value: 'himalaya', label: '喜馬拉雅山', color: '#22c55e' }, { value: 'taishan', label: '泰山', color: '#ef4444' }, { value: 'changbai', label: '長白山', color: '#f59e0b' }, { value: 'wuyi', label: '武夷山', color: '#6366f1' }], answer: 'himalaya', keywords: ['喜馬拉雅山', '天然屏障', '西南邊疆'], explanation: '喜馬拉雅山脈是中國西南邊疆的天然屏障。' },
  { id: 5, type: 'multiple', title: '歷史上，什麼是「五四運動」的起因？（可複選）', options: [{ value: 'treaty', label: '巴黎和約', color: '#60a5fa' }, { value: 'japan', label: '日本侵略', color: '#f97316' }, { value: 'corruption', label: '官場腐敗', color: '#34d399' }, { value: 'inequality', label: '社會不公', color: '#a78bfa' }], answer: ['treaty', 'japan'], keywords: ['五四運動', '巴黎和約', '山東問題'], explanation: '五四運動的直接起因是巴黎和會上中國外交失敗和山東問題。' },
  { id: 6, type: 'tf', title: '台灣是中國的一部分。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['台灣', '中國', '主權'], explanation: '台灣自古就是中國領土的一部分，這是歷史事實。' },
  { id: 7, type: 'single', title: '地理上，什麼是「人口老化」現象？', options: [{ value: 'aging', label: '老年人口比例增加', color: '#f97316' }, { value: 'young', label: '年輕人口減少', color: '#2563eb' }, { value: 'birth', label: '出生率下降', color: '#6ee7b7' }, { value: 'death', label: '死亡率上升', color: '#a78bfa' }], answer: 'aging', keywords: ['人口老化', '老年人口', '比例'], explanation: '人口老化指65歲以上老年人口占總人口比例超過一定標準的現象。' },
  { id: 8, type: 'multiple', title: '公民的義務包括哪些？（可複選）', options: [{ value: 'tax', label: '繳納稅款', color: '#38bdf8' }, { value: 'military', label: '服兵役', color: '#a78bfa' }, { value: 'education', label: '接受教育', color: '#f59e0b' }, { value: 'vote', label: '參加選舉', color: '#4f46e5' }], answer: ['tax', 'military', 'education'], keywords: ['公民義務', '繳稅', '服兵役'], explanation: '公民的基本義務包括繳納稅款、服兵役和接受義務教育。' },
  { id: 9, type: 'tf', title: '長江是中國第一大河。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['長江', '第一大河', '流域面積'], explanation: '長江是中國第一大河，流域面積廣，流量大。' },
  { id: 10, type: 'single', title: '歷史上，「戊戌變法」發生在哪個朝代？', options: [{ value: 'qing', label: '清朝', color: '#22c55e' }, { value: 'ming', label: '明朝', color: '#0ea5e9' }, { value: 'yuan', label: '元朝', color: '#a78bfa' }, { value: 'song', label: '宋朝', color: '#f97316' }], answer: 'qing', keywords: ['戊戌變法', '清朝', '光緒帝'], explanation: '戊戌變法發生在清朝光緒年間，是中國近代史上一次重要的維新運動。' },
  { id: 11, type: 'multiple', title: '地理上，什麼是「城市化」的表現？（可複選）', options: [{ value: 'population', label: '人口集中', color: '#60a5fa' }, { value: 'industry', label: '工業發展', color: '#f97316' }, { value: 'infrastructure', label: '基礎設施完善', color: '#34d399' }, { value: 'commerce', label: '商業繁榮', color: '#a78bfa' }], answer: ['population', 'industry', 'infrastructure'], keywords: ['城市化', '人口集中', '工業'], explanation: '城市化表現為人口向城市集中、工業發展和基礎設施完善等。' },
  { id: 12, type: 'tf', title: '中華人民共和國成立於1949年。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['中華人民共和國', '1949年', '成立'], explanation: '中華人民共和國於1949年10月1日正式成立。' },
  { id: 13, type: 'single', title: '下列哪個是中國的直轄市？', options: [{ value: 'beijing', label: '北京', color: '#f97316' }, { value: 'shanghai', label: '上海', color: '#2563eb' }, { value: 'guangzhou', label: '廣州', color: '#6ee7b7' }, { value: 'shenzhen', label: '深圳', color: '#a78bfa' }], answer: 'beijing', keywords: ['直轄市', '北京', '行政區劃'], explanation: '北京是中國的直轄市之一，直轄於中央政府。' },
  { id: 14, type: 'multiple', title: '歷史上，什麼是「辛亥革命」的意義？（可複選）', options: [{ value: 'monarchy', label: '推翻帝制', color: '#38bdf8' }, { value: 'republic', label: '建立共和', color: '#a78bfa' }, { value: 'unification', label: '實現統一', color: '#f59e0b' }, { value: 'modernization', label: '促進現代化', color: '#4f46e5' }], answer: ['monarchy', 'republic'], keywords: ['辛亥革命', '推翻帝制', '共和'], explanation: '辛亥革命推翻了清朝帝制，建立起亞洲第一個共和國。' },
  { id: 15, type: 'tf', title: '珠穆朗瑪峰是世界最高峰。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['珠穆朗瑪峰', '世界最高峰', '8848米'], explanation: '珠穆朗瑪峰海拔8848米，是世界最高峰。' },
  { id: 16, type: 'single', title: '公民教育中，什麼是「法治精神」？', options: [{ value: 'rule', label: '依法治國', color: '#22c55e' }, { value: 'power', label: '權力至上', color: '#ef4444' }, { value: 'authority', label: '權威優先', color: '#f59e0b' }, { value: 'tradition', label: '傳統優先', color: '#6366f1' }], answer: 'rule', keywords: ['法治精神', '依法治國', '權利義務'], explanation: '法治精神強調依法治國，所有人都必須在法律框架內行使權利履行義務。' },
  { id: 17, type: 'multiple', title: '地理上，什麼是「可持續發展」的目標？（可複選）', options: [{ value: 'economic', label: '經濟增長', color: '#60a5fa' }, { value: 'environmental', label: '環境保護', color: '#f97316' }, { value: 'social', label: '社會公平', color: '#34d399' }, { value: 'cultural', label: '文化傳承', color: '#a78bfa' }], answer: ['economic', 'environmental', 'social'], keywords: ['可持續發展', '經濟', '環境'], explanation: '可持續發展追求經濟增長、環境保護和社會公平的協調發展。' },
  { id: 18, type: 'tf', title: '中國的首都是北京。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['中國首都', '北京', '政治中心'], explanation: '北京是中華人民共和國的首都和政治中心。' },
  { id: 19, type: 'single', title: '歷史上，「鴉片戰爭」爆發的原因是什麼？', options: [{ value: 'trade', label: '貿易糾紛', color: '#f97316' }, { value: 'territory', label: '領土爭端', color: '#2563eb' }, { value: 'opium', label: '鴉片貿易', color: '#6ee7b7' }, { value: 'religion', label: '宗教衝突', color: '#a78bfa' }], answer: 'opium', keywords: ['鴉片戰爭', '鴉片貿易', '禁煙'], explanation: '鴉片戰爭是因英國向中國大量輸入鴉片引發的貿易和外交衝突。' },
  { id: 20, type: 'multiple', title: '公民參與社會事務的方式包括？（可複選）', options: [{ value: 'vote', label: '選舉投票', color: '#38bdf8' }, { value: 'petition', label: '請願上訪', color: '#a78bfa' }, { value: 'volunteer', label: '志願服務', color: '#f59e0b' }, { value: 'protest', label: '和平示威', color: '#4f46e5' }], answer: ['vote', 'volunteer', 'protest'], keywords: ['公民參與', '選舉', '志願服務'], explanation: '公民可以通過選舉投票、志願服務和和平示威等方式參與社會事務。' }
]

const socialTestQuestions = [
  { id: 1, type: 'single', title: '中國歷史上，「康乾盛世」出現在哪個朝代？', options: [{ value: 'ming', label: '明朝', color: '#60a5fa' }, { value: 'qing', label: '清朝', color: '#34d399' }, { value: 'tang', label: '唐朝', color: '#f97316' }, { value: 'song', label: '宋朝', color: '#a78bfa' }], answer: 'qing', keywords: ['康乾盛世', '清朝', '康熙乾隆'], explanation: '康乾盛世指清朝康熙、雍正、乾隆三帝時期國力強盛的局面。' },
  { id: 2, type: 'multiple', title: '地理上，中國的氣候類型包括哪些？（可複選）', options: [{ value: 'temperate', label: '溫帶氣候', color: '#38bdf8' }, { value: 'tropical', label: '熱帶氣候', color: '#f97316' }, { value: 'subtropical', label: '亞熱帶氣候', color: '#6ee7b7' }, { value: 'continental', label: '大陸性氣候', color: '#a78bfa' }], answer: ['temperate', 'tropical', 'subtropical', 'continental'], keywords: ['中國氣候', '溫帶', '熱帶'], explanation: '中國地域遼闊，氣候類型多樣，包括溫帶、熱帶、亞熱帶和大陸性氣候等。' },
  { id: 3, type: 'tf', title: '憲法是國家的根本大法。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['憲法', '根本大法', '最高效力'], explanation: '憲法是國家的根本大法，具有最高的法律效力。' },
  { id: 4, type: 'single', title: '下列哪條河流是中國的母親河？', options: [{ value: 'yellow', label: '黃河', color: '#22c55e' }, { value: 'yangtze', label: '長江', color: '#ef4444' }, { value: 'pearl', label: '珠江', color: '#f59e0b' }, { value: 'heilong', label: '黑龍江', color: '#6366f1' }], answer: 'yellow', keywords: ['黃河', '母親河', '中華民族'], explanation: '黃河被稱為中華民族的母親河，哺育了中華文明。' },
  { id: 5, type: 'multiple', title: '歷史上，「抗日戰爭」的階段包括？（可複選）', options: [{ value: 'resistance', label: '正面抵抗', color: '#60a5fa' }, { value: 'guerrilla', label: '游擊戰爭', color: '#f97316' }, { value: 'international', label: '國際援助', color: '#34d399' }, { value: 'victory', label: '最終勝利', color: '#a78bfa' }], answer: ['resistance', 'guerrilla', 'victory'], keywords: ['抗日戰爭', '正面抵抗', '游擊戰'], explanation: '抗日戰爭包括正面抵抗、敵後游擊戰爭和最終勝利等階段。' },
  { id: 6, type: 'tf', title: '香港是中國的特別行政區。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['香港', '特別行政區', '一國兩制'], explanation: '香港是中華人民共和國的特別行政區，實行一國兩制。' },
  { id: 7, type: 'single', title: '地理上，什麼是「人口密度」？', options: [{ value: 'average', label: '單位面積人口數', color: '#f97316' }, { value: 'total', label: '總人口數', color: '#2563eb' }, { value: 'growth', label: '人口增長率', color: '#6ee7b7' }, { value: 'structure', label: '人口結構', color: '#a78bfa' }], answer: 'average', keywords: ['人口密度', '單位面積', '人口數'], explanation: '人口密度指單位面積土地上居住的人口數量。' },
  { id: 8, type: 'multiple', title: '公民的權利包括哪些？（可複選）', options: [{ value: 'speech', label: '言論自由', color: '#38bdf8' }, { value: 'assembly', label: '集會自由', color: '#a78bfa' }, { value: 'religion', label: '宗教信仰自由', color: '#f59e0b' }, { value: 'property', label: '財產權', color: '#4f46e5' }], answer: ['speech', 'assembly', 'religion', 'property'], keywords: ['公民權利', '言論自由', '集會'], explanation: '公民的基本權利包括言論自由、集會自由、宗教信仰自由和財產權等。' },
  { id: 9, type: 'tf', title: '青藏高原是世界屋脊。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['青藏高原', '世界屋脊', '平均海拔'], explanation: '青藏高原平均海拔4000米以上，被稱為世界屋脊。' },
  { id: 10, type: 'single', title: '歷史上，「文化大革命」發生在哪個時期？', options: [{ value: '1950s', label: '1950年代', color: '#22c55e' }, { value: '1960s', label: '1960年代', color: '#0ea5e9' }, { value: '1970s', label: '1970年代', color: '#a78bfa' }, { value: '1980s', label: '1980年代', color: '#f97316' }], answer: '1960s', keywords: ['文化大革命', '1960年代', '十年動亂'], explanation: '文化大革命發生在1966年至1976年，是中國歷史上的特殊時期。' },
  { id: 11, type: 'multiple', title: '地理上，什麼是「全球化」的表現？（可複選）', options: [{ value: 'trade', label: '貿易往來', color: '#60a5fa' }, { value: 'communication', label: '信息交流', color: '#f97316' }, { value: 'migration', label: '人口遷移', color: '#34d399' }, { value: 'culture', label: '文化交流', color: '#a78bfa' }], answer: ['trade', 'communication', 'culture'], keywords: ['全球化', '貿易', '信息交流'], explanation: '全球化表現為貿易往來頻繁、信息交流便捷和文化交流廣泛等。' },
  { id: 12, type: 'tf', title: '中國共產黨成立於1921年。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['中國共產黨', '1921年', '成立'], explanation: '中國共產黨於1921年7月在上海成立。' },
  { id: 13, type: 'single', title: '下列哪個省份不屬於東北地區？', options: [{ value: 'liaoning', label: '遼寧', color: '#f97316' }, { value: 'jilin', label: '吉林', color: '#2563eb' }, { value: 'heilongjiang', label: '黑龍江', color: '#6ee7b7' }, { value: 'neimenggu', label: '內蒙古', color: '#a78bfa' }], answer: 'neimenggu', keywords: ['東北地區', '遼寧吉林黑龍江', '內蒙古'], explanation: '東北地區通常指遼寧、吉林和黑龍江三省，內蒙古屬於華北地區。' },
  { id: 14, type: 'multiple', title: '歷史上，「改革開放」的內容包括？（可複選）', options: [{ value: 'economy', label: '經濟體制改革', color: '#38bdf8' }, { value: 'politics', label: '政治體制改革', color: '#a78bfa' }, { value: 'opening', label: '對外開放', color: '#f59e0b' }, { value: 'education', label: '教育改革', color: '#4f46e5' }], answer: ['economy', 'opening'], keywords: ['改革開放', '經濟體制', '對外開放'], explanation: '改革開放主要包括經濟體制改革和對外開放兩個方面。' },
  { id: 15, type: 'tf', title: '南海諸島屬於中國領土。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['南海諸島', '中國領土', '主權'], explanation: '南海諸島自古就是中國領土的一部分。' },
  { id: 16, type: 'single', title: '公民教育中，什麼是「社會責任」？', options: [{ value: 'duty', label: '履行義務', color: '#22c55e' }, { value: 'right', label: '享受權利', color: '#ef4444' }, { value: 'freedom', label: '個人自由', color: '#f59e0b' }, { value: 'interest', label: '追求利益', color: '#6366f1' }], answer: 'duty', keywords: ['社會責任', '履行義務', '公民'], explanation: '社會責任指公民應當履行對社會和國家的義務。' },
  { id: 17, type: 'multiple', title: '地理上，什麼是「環境問題」的表現？（可複選）', options: [{ value: 'pollution', label: '環境污染', color: '#60a5fa' }, { value: 'deforestation', label: '森林砍伐', color: '#f97316' }, { value: 'desertification', label: '土地沙漠化', color: '#34d399' }, { value: 'biodiversity', label: '生物多樣性減少', color: '#a78bfa' }], answer: ['pollution', 'deforestation', 'desertification', 'biodiversity'], keywords: ['環境問題', '污染', '砍伐'], explanation: '環境問題包括環境污染、森林砍伐、土地沙漠化和生物多樣性減少等。' },
  { id: 18, type: 'tf', title: '澳門是中國的特別行政區。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['澳門', '特別行政區', '回歸'], explanation: '澳門於1999年回歸祖國，是中華人民共和國的特別行政區。' },
  { id: 19, type: 'single', title: '歷史上，「西安事變」發生在哪一年？', options: [{ value: '1936', label: '1936年', color: '#f97316' }, { value: '1937', label: '1937年', color: '#2563eb' }, { value: '1938', label: '1938年', color: '#6ee7b7' }, { value: '1939', label: '1939年', color: '#a78bfa' }], answer: '1936', keywords: ['西安事變', '1936年', '張學良'], explanation: '西安事變發生在1936年12月，是中國歷史上的重要轉折點。' },
  { id: 20, type: 'multiple', title: '公民參與政治的方式包括？（可複選）', options: [{ value: 'election', label: '參加選舉', color: '#38bdf8' }, { value: 'petition', label: '向政府請願', color: '#a78bfa' }, { value: 'supervision', label: '社會監督', color: '#f59e0b' }, { value: 'discussion', label: '政治討論', color: '#4f46e5' }], answer: ['election', 'petition', 'supervision'], keywords: ['公民參與', '選舉', '請願'], explanation: '公民可以通過參加選舉、向政府請願和社會監督等方式參與政治。' }
]

// 自然科題目
const sciencePracticeQuestions = [
  { id: 1, type: 'single', title: '生物學中，什麼是「光合作用」的主要產物？', options: [{ value: 'oxygen', label: '氧氣', color: '#60a5fa' }, { value: 'glucose', label: '葡萄糖', color: '#34d399' }, { value: 'protein', label: '蛋白質', color: '#f97316' }, { value: 'fat', label: '脂肪', color: '#a78bfa' }], answer: 'glucose', keywords: ['光合作用', '葡萄糖', '產物'], explanation: '光合作用的主要產物是葡萄糖，同時釋放氧氣。' },
  { id: 2, type: 'multiple', title: '物理學中，什麼是「牛頓運動定律」的內容？（可複選）', options: [{ value: 'inertia', label: '慣性定律', color: '#38bdf8' }, { value: 'force', label: '力學定律', color: '#f97316' }, { value: 'action', label: '作用力與反作用力', color: '#6ee7b7' }, { value: 'acceleration', label: '加速度定律', color: '#a78bfa' }], answer: ['inertia', 'force', 'action'], keywords: ['牛頓定律', '慣性', '作用力'], explanation: '牛頓三大運動定律包括慣性定律、F=ma和作用力與反作用力定律。' },
  { id: 3, type: 'tf', title: '化學中，酸的pH值小於7。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['酸', 'pH值', '小於7'], explanation: '酸的pH值範圍是0-7，中性為7，鹼大於7。' },
  { id: 4, type: 'single', title: '下列哪種是「可再生能源」？', options: [{ value: 'solar', label: '太陽能', color: '#22c55e' }, { value: 'coal', label: '煤炭', color: '#ef4444' }, { value: 'oil', label: '石油', color: '#f59e0b' }, { value: 'nuclear', label: '核能', color: '#6366f1' }], answer: 'solar', keywords: ['可再生能源', '太陽能', '永續'], explanation: '太陽能是可再生能源，不會耗盡且對環境友好。' },
  { id: 5, type: 'multiple', title: '生物學中，人體的循環系統包括？（可複選）', options: [{ value: 'heart', label: '心臟', color: '#60a5fa' }, { value: 'blood', label: '血液', color: '#f97316' }, { value: 'vessels', label: '血管', color: '#34d399' }, { value: 'lungs', label: '肺臟', color: '#a78bfa' }], answer: ['heart', 'blood', 'vessels'], keywords: ['循環系統', '心臟', '血液'], explanation: '人體循環系統由心臟、血液和血管組成，肺臟屬於呼吸系統。' },
  { id: 6, type: 'tf', title: '物理學中，聲音能在真空中傳播。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'false', keywords: ['聲音', '真空', '傳播'], explanation: '聲音需要介質才能傳播，真空中沒有聲音。' },
  { id: 7, type: 'single', title: '化學中，什麼是「化合反應」的特點？', options: [{ value: 'mass', label: '質量守恆', color: '#f97316' }, { value: 'energy', label: '能量變化', color: '#2563eb' }, { value: 'new', label: '生成新物質', color: '#6ee7b7' }, { value: 'reversible', label: '可逆反應', color: '#a78bfa' }], answer: 'new', keywords: ['化合反應', '新物質', '生成'], explanation: '化合反應是生成新物質的化學反應。' },
  { id: 8, type: 'multiple', title: '地球科學中，什麼是「岩石圈」的組成？（可複選）', options: [{ value: 'crust', label: '地殼', color: '#38bdf8' }, { value: 'mantle', label: '地幔', color: '#a78bfa' }, { value: 'core', label: '地核', color: '#f59e0b' }, { value: 'ocean', label: '海洋', color: '#4f46e5' }], answer: ['crust', 'mantle'], keywords: ['岩石圈', '地殼', '地幔'], explanation: '岩石圈由地殼和地幔上部組成，是地球最外層的固體部分。' },
  { id: 9, type: 'tf', title: '生物學中，病毒是一種活的生物。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'false', keywords: ['病毒', '非細胞生物', '生命'], explanation: '病毒不是細胞生物，不能獨立進行新陳代謝，不被認為是活的生物。' },
  { id: 10, type: 'single', title: '物理學中，什麼是「電流」的單位？', options: [{ value: 'volt', label: '伏特', color: '#22c55e' }, { value: 'ampere', label: '安培', color: '#ef4444' }, { value: 'ohm', label: '歐姆', color: '#f59e0b' }, { value: 'watt', label: '瓦特', color: '#6366f1' }], answer: 'ampere', keywords: ['電流', '安培', '單位'], explanation: '電流的單位是安培（A）。' },
  { id: 11, type: 'multiple', title: '化學中，什麼是「元素」的特點？（可複選）', options: [{ value: 'indivisible', label: '不能再分', color: '#60a5fa' }, { value: 'same', label: '性質相同', color: '#f97316' }, { value: 'symbol', label: '有符號', color: '#34d399' }, { value: 'compound', label: '可化合', color: '#a78bfa' }], answer: ['indivisible', 'same', 'symbol'], keywords: ['元素', '不能再分', '符號'], explanation: '元素是不能再分的物質，具有相同性質的原子，並用符號表示。' },
  { id: 12, type: 'tf', title: '地球科學中，地震主要發生在斷層帶。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['地震', '斷層帶', '地殼運動'], explanation: '地震主要發生在地殼斷層帶，是地殼運動的結果。' },
  { id: 13, type: 'single', title: '生物學中，什麼是「遺傳」的載體？', options: [{ value: 'dna', label: 'DNA', color: '#f97316' }, { value: 'rna', label: 'RNA', color: '#2563eb' }, { value: 'protein', label: '蛋白質', color: '#6ee7b7' }, { value: 'carbohydrate', label: '碳水化合物', color: '#a78bfa' }], answer: 'dna', keywords: ['遺傳', 'DNA', '載體'], explanation: 'DNA是遺傳信息的載體，攜帶著生物的遺傳信息。' },
  { id: 14, type: 'multiple', title: '物理學中，什麼是「光的性質」？（可複選）', options: [{ value: 'reflection', label: '反射', color: '#38bdf8' }, { value: 'refraction', label: '折射', color: '#a78bfa' }, { value: 'diffraction', label: '繞射', color: '#f59e0b' }, { value: 'interference', label: '干涉', color: '#4f46e5' }], answer: ['reflection', 'refraction', 'diffraction'], keywords: ['光的性質', '反射', '折射'], explanation: '光具有反射、折射、繞射等波的性質。' },
  { id: 15, type: 'tf', title: '化學中，所有的鹽都能溶於水。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'false', keywords: ['鹽', '溶解性', '水'], explanation: '不是所有的鹽都能溶於水，有些鹽的溶解度很小。' },
  { id: 16, type: 'single', title: '地球科學中，什麼是「溫室效應」的成因？', options: [{ value: 'co2', label: '二氧化碳增加', color: '#22c55e' }, { value: 'ozone', label: '臭氧層破壞', color: '#ef4444' }, { value: 'uv', label: '紫外線增強', color: '#f59e0b' }, { value: 'volcano', label: '火山噴發', color: '#6366f1' }], answer: 'co2', keywords: ['溫室效應', '二氧化碳', '氣體'], explanation: '溫室效應主要是由大氣中二氧化碳等溫室氣體增加引起的。' },
  { id: 17, type: 'multiple', title: '生物學中，什麼是「生態系統」的組成？（可複選）', options: [{ value: 'producer', label: '生產者', color: '#60a5fa' }, { value: 'consumer', label: '消費者', color: '#f97316' }, { value: 'decomposer', label: '分解者', color: '#34d399' }, { value: 'environment', label: '環境', color: '#a78bfa' }], answer: ['producer', 'consumer', 'decomposer', 'environment'], keywords: ['生態系統', '生產者', '消費者'], explanation: '生態系統由生產者、消費者、分解者和環境組成。' },
  { id: 18, type: 'tf', title: '物理學中，電阻越大，電流越小。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['電阻', '電流', '歐姆定律'], explanation: '根據歐姆定律，電阻越大，在電壓一定時，電流越小。' },
  { id: 19, type: 'single', title: '化學中，什麼是「催化劑」的功能？', options: [{ value: 'speed', label: '加快反應速度', color: '#f97316' }, { value: 'change', label: '改變反應產物', color: '#2563eb' }, { value: 'increase', label: '增加產物數量', color: '#6ee7b7' }, { value: 'absorb', label: '吸收熱量', color: '#a78bfa' }], answer: 'speed', keywords: ['催化劑', '反應速度', '不變'], explanation: '催化劑能加快化學反應速度，但本身不被消耗。' },
  { id: 20, type: 'multiple', title: '地球科學中，什麼是「水循環」的過程？（可複選）', options: [{ value: 'evaporation', label: '蒸發', color: '#38bdf8' }, { value: 'condensation', label: '凝結', color: '#a78bfa' }, { value: 'precipitation', label: '降水', color: '#f59e0b' }, { value: 'runoff', label: '徑流', color: '#4f46e5' }], answer: ['evaporation', 'condensation', 'precipitation', 'runoff'], keywords: ['水循環', '蒸發', '降水'], explanation: '水循環包括蒸發、凝結、降水和徑流等過程。' }
]

const scienceTestQuestions = [
  { id: 1, type: 'single', title: '生物學中，人體最大的器官是什麼？', options: [{ value: 'heart', label: '心臟', color: '#60a5fa' }, { value: 'liver', label: '肝臟', color: '#34d399' }, { value: 'skin', label: '皮膚', color: '#f97316' }, { value: 'brain', label: '大腦', color: '#a78bfa' }], answer: 'skin', keywords: ['皮膚', '最大器官', '保護'], explanation: '皮膚是人體最大的器官，具有保護、調節體溫等功能。' },
  { id: 2, type: 'multiple', title: '物理學中，什麼是「電磁波」的種類？（可複選）', options: [{ value: 'radio', label: '無線電波', color: '#38bdf8' }, { value: 'light', label: '可見光', color: '#f97316' }, { value: 'xray', label: 'X射線', color: '#6ee7b7' }, { value: 'gamma', label: '伽馬射線', color: '#a78bfa' }], answer: ['radio', 'light', 'xray', 'gamma'], keywords: ['電磁波', '無線電波', '可見光'], explanation: '電磁波包括無線電波、可見光、X射線和伽馬射線等。' },
  { id: 3, type: 'tf', title: '化學中，中性物質的pH值為7。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['中性', 'pH值', '7'], explanation: '中性物質的pH值為7，酸小於7，鹼大於7。' },
  { id: 4, type: 'single', title: '下列哪種能源是「核能」？', options: [{ value: 'hydro', label: '水能', color: '#22c55e' }, { value: 'nuclear', label: '核能', color: '#ef4444' }, { value: 'wind', label: '風能', color: '#f59e0b' }, { value: 'bio', label: '生物能', color: '#6366f1' }], answer: 'nuclear', keywords: ['核能', '原子核', '裂變'], explanation: '核能是通過原子核裂變或聚變釋放的能量。' },
  { id: 5, type: 'multiple', title: '生物學中，植物的生長需要什麼？（可複選）', options: [{ value: 'water', label: '水分', color: '#60a5fa' }, { value: 'sunlight', label: '陽光', color: '#f97316' }, { value: 'nutrients', label: '養分', color: '#34d399' }, { value: 'oxygen', label: '氧氣', color: '#a78bfa' }], answer: ['water', 'sunlight', 'nutrients'], keywords: ['植物生長', '水分', '陽光'], explanation: '植物生長需要水分、陽光和土壤養分，氧氣主要用於呼吸。' },
  { id: 6, type: 'tf', title: '物理學中，光速在真空中是常數。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['光速', '真空', '常數'], explanation: '在真空中，光速約為3×10^8 m/s，是自然界的常數。' },
  { id: 7, type: 'single', title: '化學中，什麼是「氧化反應」？', options: [{ value: 'gain', label: '得電子', color: '#f97316' }, { value: 'lose', label: '失電子', color: '#2563eb' }, { value: 'oxygen', label: '與氧結合', color: '#6ee7b7' }, { value: 'hydrogen', label: '與氫結合', color: '#a78bfa' }], answer: 'lose', keywords: ['氧化反應', '失電子', '還原'], explanation: '氧化反應是物質失去電子的過程。' },
  { id: 8, type: 'multiple', title: '地球科學中，什麼是「大氣層」的組成？（可複選）', options: [{ value: 'nitrogen', label: '氮氣', color: '#38bdf8' }, { value: 'oxygen', label: '氧氣', color: '#a78bfa' }, { value: 'argon', label: '氬氣', color: '#f59e0b' }, { value: 'carbon', label: '二氧化碳', color: '#4f46e5' }], answer: ['nitrogen', 'oxygen', 'argon', 'carbon'], keywords: ['大氣層', '氮氣', '氧氣'], explanation: '大氣層主要由氮氣、氧氣、氬氣和二氧化碳等組成。' },
  { id: 9, type: 'tf', title: '生物學中，所有的細菌都有害於人體。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'false', keywords: ['細菌', '有益', '有害'], explanation: '細菌有有益的（如腸道菌群）和有害的（如致病菌）。' },
  { id: 10, type: 'single', title: '物理學中，什麼是「功率」的單位？', options: [{ value: 'joule', label: '焦耳', color: '#22c55e' }, { value: 'watt', label: '瓦特', color: '#ef4444' }, { value: 'newton', label: '牛頓', color: '#f59e0b' }, { value: 'pascal', label: '帕斯卡', color: '#6366f1' }], answer: 'watt', keywords: ['功率', '瓦特', '單位'], explanation: '功率的單位是瓦特（W），1W = 1J/s。' },
  { id: 11, type: 'multiple', title: '化學中，什麼是「酸鹼中和反應」的產物？（可複選）', options: [{ value: 'salt', label: '鹽', color: '#60a5fa' }, { value: 'water', label: '水', color: '#f97316' }, { value: 'gas', label: '氣體', color: '#34d399' }, { value: 'heat', label: '熱量', color: '#a78bfa' }], answer: ['salt', 'water'], keywords: ['酸鹼中和', '鹽', '水'], explanation: '酸鹼中和反應生成鹽和水。' },
  { id: 12, type: 'tf', title: '地球科學中，火山主要分布在板塊邊界。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['火山', '板塊邊界', '構造'], explanation: '火山主要分布在板塊構造運動活躍的地區。' },
  { id: 13, type: 'single', title: '生物學中，什麼是「細胞核」的功能？', options: [{ value: 'control', label: '控制細胞活動', color: '#f97316' }, { value: 'energy', label: '提供能量', color: '#2563eb' }, { value: 'transport', label: '運輸物質', color: '#6ee7b7' }, { value: 'protect', label: '保護細胞', color: '#a78bfa' }], answer: 'control', keywords: ['細胞核', '控制', '遺傳'], explanation: '細胞核控制細胞的生長、分裂和遺傳信息。' },
  { id: 14, type: 'multiple', title: '物理學中，什麼是「熱傳遞」的形式？（可複選）', options: [{ value: 'conduction', label: '傳導', color: '#38bdf8' }, { value: 'convection', label: '對流', color: '#a78bfa' }, { value: 'radiation', label: '輻射', color: '#f59e0b' }, { value: 'diffusion', label: '擴散', color: '#4f46e5' }], answer: ['conduction', 'convection', 'radiation'], keywords: ['熱傳遞', '傳導', '對流'], explanation: '熱傳遞有三種形式：傳導、對流和輻射。' },
  { id: 15, type: 'tf', title: '化學中，所有的金屬都能與酸反應。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'false', keywords: ['金屬', '酸', '反應'], explanation: '不是所有的金屬都能與酸反應，如金、鉑等貴金屬不反應。' },
  { id: 16, type: 'single', title: '地球科學中，什麼是「洋流」的成因？', options: [{ value: 'wind', label: '風力', color: '#22c55e' }, { value: 'density', label: '密度差', color: '#ef4444' }, { value: 'tide', label: '潮汐', color: '#f59e0b' }, { value: 'earth', label: '地球自轉', color: '#6366f1' }], answer: 'wind', keywords: ['洋流', '風力', '成因'], explanation: '洋流主要由風力和密度差引起。' },
  { id: 17, type: 'multiple', title: '生物學中，什麼是「食物鏈」的組成？（可複選）', options: [{ value: 'plant', label: '植物', color: '#60a5fa' }, { value: 'herbivore', label: '食草動物', color: '#f97316' }, { value: 'carnivore', label: '食肉動物', color: '#34d399' }, { value: 'decomposer', label: '分解者', color: '#a78bfa' }], answer: ['plant', 'herbivore', 'carnivore', 'decomposer'], keywords: ['食物鏈', '植物', '動物'], explanation: '食物鏈由生產者、初級消費者、次級消費者、分解者組成。' },
  { id: 18, type: 'tf', title: '物理學中，靜電可以通過接地消除。', options: [{ value: 'true', label: '是', icon: '⭕', color: '#2563eb' }, { value: 'false', label: '否', icon: '❌', color: '#dc2626' }], answer: 'true', keywords: ['靜電', '接地', '消除'], explanation: '靜電可以通過接地將電荷導入大地而消除。' },
  { id: 19, type: 'single', title: '化學中，什麼是「化學平衡」的特點？', options: [{ value: 'static', label: '靜止不動', color: '#f97316' }, { value: 'dynamic', label: '動態平衡', color: '#2563eb' }, { value: 'complete', label: '完全反應', color: '#6ee7b7' }, { value: 'irreversible', label: '不可逆', color: '#a78bfa' }], answer: 'dynamic', keywords: ['化學平衡', '動態平衡', '可逆'], explanation: '化學平衡是可逆反應中正逆反應速度相等時的動態平衡。' },
  { id: 20, type: 'multiple', title: '地球科學中，什麼是「地質年代」的劃分依據？（可複選）', options: [{ value: 'fossil', label: '化石記錄', color: '#38bdf8' }, { value: 'rock', label: '岩石層序', color: '#a78bfa' }, { value: 'climate', label: '氣候變化', color: '#f59e0b' }, { value: 'magnetic', label: '地磁極性', color: '#4f46e5' }], answer: ['fossil', 'rock'], keywords: ['地質年代', '化石', '岩石'], explanation: '地質年代主要依據化石記錄和岩石層序來劃分。' }
]

const subjectData = {
  chinese: { practice: chinesePracticeQuestions, test: chineseTestQuestions },
  social: { practice: socialPracticeQuestions, test: socialTestQuestions },
  science: { practice: sciencePracticeQuestions, test: scienceTestQuestions }
}

// 隨機選擇10題
const getRandomQuestions = (questions, count = 10) => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const mode = ref('practice')
const currentIndex = ref(0)
const selected = ref([])
const submitted = ref(false)
const finished = ref(false)
const answers = ref([])
const weakNotes = ref([])
const comboActive = ref(false)
const consecutiveCorrect = ref(0)
const reviewIndex = ref(0)
const timeLeft = ref(600)
const timerId = ref(null)

const questions = computed(() => {
  const subjectQuestions = subjectData[props.subject]
  if (!subjectQuestions) return []
  const baseQuestions = mode.value === 'practice' ? subjectQuestions.practice : subjectQuestions.test
  return getRandomQuestions(baseQuestions)
})
const totalQuestions = computed(() => questions.value.length)
const currentQuestion = computed(() => questions.value[currentIndex.value])
const answeredCount = computed(() => answers.value.filter(Boolean).length)
const completedCount = computed(() => (mode.value === 'test' ? answeredCount.value : answers.value.filter((item) => item !== null).length))
const progressPercent = computed(() => Math.round((completedCount.value / totalQuestions.value) * 100))
const remainingTime = computed(() => {
  const minutes = String(Math.floor(timeLeft.value / 60)).padStart(2, '0')
  const seconds = String(timeLeft.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

const score = computed(() => {
  const correct = answers.value.filter((item) => item?.correct).length
  return correct * 10
})

const correctCount = computed(() => answers.value.filter((item) => item?.correct).length)
const wrongCount = computed(() => totalQuestions.value - correctCount.value)

const isSelected = (option) => selected.value.includes(option.value)

const toggleOption = (option) => {
  const question = currentQuestion.value
  if (question.type === 'single' || question.type === 'tf') {
    selected.value = [option.value]
    return
  }

  if (selected.value.includes(option.value)) {
    selected.value = selected.value.filter((value) => value !== option.value)
  } else {
    selected.value = [...selected.value, option.value]
  }
}

const normalizeArray = (arr) => [...arr].sort().join(',')

const calculateCorrect = (question, selectedAnswers) => {
  if (question.type === 'single' || question.type === 'tf') {
    return selectedAnswers[0] === question.answer
  }
  return normalizeArray(selectedAnswers) === normalizeArray(question.answer)
}

const addWeakNote = (question) => {
  if (!weakNotes.value.some((note) => note.id === question.id)) {
    weakNotes.value.push({ id: question.id, title: question.title })
  }
}

const finalizeExam = () => {
  if (timerId.value) {
    clearInterval(timerId.value)
    timerId.value = null
  }

  questions.value.forEach((question, index) => {
    if (!answers.value[index]) {
      answers.value[index] = {
        questionId: question.id,
        selected: [],
        correct: false
      }
      addWeakNote(question)
    }
  })

  finished.value = true
  reviewIndex.value = 0
}

const submitAnswer = () => {
  if (!selected.value.length || finished.value) return

  const question = currentQuestion.value
  const isCorrect = calculateCorrect(question, selected.value)
  const answerRecord = {
    questionId: question.id,
    selected: [...selected.value],
    correct: isCorrect
  }

  answers.value[currentIndex.value] = answerRecord
  submitted.value = true

  if (mode.value === 'practice') {
    if (isCorrect) {
      consecutiveCorrect.value += 1
      if (consecutiveCorrect.value >= 3) {
        comboActive.value = true
        setTimeout(() => {
          comboActive.value = false
        }, 1600)
      }
      if (currentIndex.value === totalQuestions.value - 1) {
        finalizeExam()
      }
    } else {
      consecutiveCorrect.value = 0
      addWeakNote(question)
    }
    return
  }
}

const retryQuestion = () => {
  selected.value = []
  submitted.value = false
}

const previousQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1
    selected.value = answers.value[currentIndex.value]?.selected ? [...answers.value[currentIndex.value].selected] : []
    submitted.value = !!answers.value[currentIndex.value]
  }
}

const nextQuestion = () => {
  if (mode.value === 'test' && !submitted.value && selected.value.length) {
    submitAnswer()
  }
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value += 1
    selected.value = answers.value[currentIndex.value]?.selected ? [...answers.value[currentIndex.value].selected] : []
    submitted.value = !!answers.value[currentIndex.value]
  } else {
    finalizeExam()
  }
}

const handleSubmitExam = () => {
  nextQuestion()
}

const goToReviewQuestion = (index) => {
  reviewIndex.value = index
}

const restartQuiz = () => {
  currentIndex.value = 0
  selected.value = []
  submitted.value = false
  finished.value = false
  answers.value = Array(totalQuestions.value).fill(null)
  weakNotes.value = []
  consecutiveCorrect.value = 0
  comboActive.value = false
  reviewIndex.value = 0
  timeLeft.value = 600
  if (timerId.value) {
    clearInterval(timerId.value)
    timerId.value = null
  }
  if (mode.value === 'test') {
    startTimer()
  }
}

const currentAnswerRecord = computed(() => answers.value[currentIndex.value] || null)
const reviewQuestion = computed(() => questions.value[reviewIndex.value])
const reviewAnswerRecord = computed(() => answers.value[reviewIndex.value] || { selected: [] })

const startTimer = () => {
  if (timerId.value) return
  timerId.value = setInterval(() => {
    if (finished.value) {
      clearInterval(timerId.value)
      timerId.value = null
      return
    }
    if (timeLeft.value > 0) {
      timeLeft.value -= 1
    } else {
      clearInterval(timerId.value)
      timerId.value = null
      finalizeExam()
    }
  }, 1000)
}

onMounted(() => {
  if (mode.value === 'test') {
    startTimer()
  }
})

onUnmounted(() => {
  if (timerId.value) {
    clearInterval(timerId.value)
  }
})

watch(mode, () => {
  currentIndex.value = 0
  selected.value = []
  submitted.value = false
  finished.value = false
  answers.value = Array(totalQuestions.value).fill(null)
  weakNotes.value = []
  consecutiveCorrect.value = 0
  comboActive.value = false
  reviewIndex.value = 0
  timeLeft.value = 600
  if (timerId.value) {
    clearInterval(timerId.value)
    timerId.value = null
  }
  if (mode.value === 'test') {
    startTimer()
  }
})

watch(currentQuestion, () => {
  if (!finished.value) {
    selected.value = answers.value[currentIndex.value]?.selected ? [...answers.value[currentIndex.value].selected] : []
    submitted.value = !!answers.value[currentIndex.value]
  }
})
</script>

<template>
  <section class="exam-shell">
    <div class="exam-header">
      <button class="back-home" @click="router.push('/')">← 返回主頁</button>
      <div>
        <p class="exam-label">數位測驗系統</p>
        <h1>{{ subject === 'chinese' ? '國文科' : subject === 'social' ? '社會科' : '自然科' }}小考</h1>
      </div>
      <div class="header-right">
        <div class="mode-switch">
          <button :class="mode === 'practice' ? 'active' : ''" @click="mode = 'practice'">練習模式</button>
          <button :class="mode === 'test' ? 'active' : ''" @click="mode = 'test'">測驗模式</button>
        </div>
      </div>
    </div>

    <div class="progress-area">
      <div class="progress-label">
        <span>已完成 {{ completedCount }} / {{ totalQuestions }} 題</span>
        <strong v-if="mode === 'test'">剩餘時間 {{ remainingTime }}</strong>
        <strong v-else>練習模式 (無時間限制)</strong>
      </div>
      <div class="progress-track">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        <div class="combo-badge" v-if="comboActive">Combo x3 🎉</div>
      </div>
    </div>

    <main class="exam-body">
      <div class="question-card">
        <div class="question-top">
          <span class="question-tag">{{ currentQuestion.type === 'single' ? '單選題' : currentQuestion.type === 'multiple' ? '複選題' : '是非題' }}</span>
          <h2>{{ currentQuestion.title }}</h2>
        </div>

        <div class="option-grid">
          <button
            v-for="option in currentQuestion.options"
            :key="option.value"
            class="option-card"
            :class="{
              selected: isSelected(option),
              correct: (mode === 'practice' || finished) && submitted && (currentQuestion.type !== 'multiple' ? option.value === currentQuestion.answer : currentQuestion.answer.includes(option.value)),
              wrong: (mode === 'practice' || finished) && submitted && isSelected(option) && (currentQuestion.type === 'multiple' ? !currentQuestion.answer.includes(option.value) : option.value !== currentQuestion.answer)
            }"
            :style="{ borderColor: isSelected(option) ? option.color : '#d1d5db', background: isSelected(option) ? option.color + '22' : '#ffffff' }"
            :disabled="submitted && mode === 'test'"
            @click="toggleOption(option)"
          >
            <div class="option-icon" :style="{ background: option.color + '20', color: option.color }">
              <span v-if="currentQuestion.type === 'tf'">{{ option.icon }}</span>
              <span v-else>{{ option.label.charAt(0) }}</span>
            </div>
            <div class="option-text">
              <p>{{ option.label }}</p>
              <span v-if="currentQuestion.type === 'multiple' && isSelected(option)" class="check-tag">✔</span>
            </div>
          </button>
        </div>

        <div class="action-row">
          <button v-if="mode === 'practice'" class="submit-btn" @click="submitAnswer" :disabled="!selected.length || submitted">
            送出答案
          </button>
          <button
            v-if="currentIndex > 0"
            class="prev-btn"
            @click="previousQuestion"
          >
            ← 上一題
          </button>
          <button
            class="next-btn"
            @click="nextQuestion"
            :disabled="mode === 'practice' && !submitted"
          >
            {{ currentIndex === totalQuestions - 1 ? '提交試卷' : '下一題 →' }}
          </button>
        </div>

        <div class="feedback-panel" v-if="mode === 'practice' && submitted">
          <div class="feedback-tag" :class="currentAnswerRecord?.correct ? 'correct-tag' : 'wrong-tag'">
            {{ currentAnswerRecord?.correct ? '答對了！' : '答錯了，請再試一次。' }}
          </div>
          <div class="feedback-note">
            <p>正確答案：
              <strong>
                <template v-if="currentQuestion.type === 'multiple'">
                  {{ currentQuestion.options.filter((item) => currentQuestion.answer.includes(item.value)).map((item) => item.label).join('、') }}
                </template>
                <template v-else>
                  {{ currentQuestion.options.find((item) => item.value === currentQuestion.answer).label }}
                </template>
              </strong>
            </p>
            <p class="hint-keywords">解題關鍵：{{ currentQuestion.keywords.join('、') }}</p>
            <p class="full-explain">完整解析：{{ currentQuestion.explanation }}</p>
          </div>
          <button
            class="retry-btn"
            v-if="!currentAnswerRecord?.correct"
            @click="retryQuestion"
          >
            再試一次
          </button>
        </div>

        <div class="feedback-panel" v-if="mode === 'test' && submitted && !finished">
          <div class="feedback-tag info-tag">答案已鎖定，請繼續下一題。</div>
        </div>
      </div>

      <aside class="dashboard-panel" v-if="finished">
        <div class="score-card">
          <p>{{ mode === 'test' ? '答題成績' : '答題報告' }}</p>
          <div class="ring-chart" :style="{ '--rate': (score / 100) * 100 + '%' }">
            <span>{{ score }}<small>/100</small></span>
          </div>
          <div class="summary-items">
            <div>
              <strong>{{ correctCount }}</strong>
              <span>答對題數</span>
            </div>
            <div>
              <strong>{{ wrongCount }}</strong>
              <span>錯題數</span>
            </div>
            <div>
              <strong>{{ totalQuestions }}</strong>
              <span>總題數</span>
            </div>
          </div>
        </div>

        <div class="dot-map">
          <p>答題分佈</p>
          <div class="dots">
            <button
              v-for="(item, index) in questions"
              :key="item.id"
              :class="['dot', { wrong: answers[index] && !answers[index].correct, active: reviewIndex === index } ]"
              @click="goToReviewQuestion(index)"
            >{{ index + 1 }}</button>
          </div>
          <p class="dot-clue">紅色代表錯題，點擊可回到該題解析。</p>
        </div>

        <div class="weak-note-box">
          <p>我的筆記 - 錯題弱點</p>
          <ul>
            <li v-if="weakNotes.length === 0">你答對所有題目，暫無弱題。</li>
            <li v-for="note in weakNotes" :key="note.id">• {{ note.title }}</li>
          </ul>
        </div>

        <button class="restart-btn" @click="restartQuiz">重新開始測驗</button>
      </aside>
    </main>

    <section class="review-area" v-if="finished">
      <div class="review-card">
        <div class="review-header">
          <h3>題目回顧：第 {{ reviewIndex + 1 }} 題</h3>
          <p>{{ reviewQuestion.title }}</p>
        </div>
        <div class="review-options">
          <div
            v-for="option in reviewQuestion.options"
            :key="option.value"
            :class="[
              'review-option',
              { correct: reviewQuestion.type !== 'multiple' ? option.value === reviewQuestion.answer : reviewQuestion.answer.includes(option.value),
                wrong: reviewAnswerRecord?.selected.includes(option.value) && !reviewQuestion.answer.includes(option.value)
              }
            ]"
          >
            <span class="review-label">{{ option.label }}</span>
            <span v-if="reviewQuestion.type === 'tf'" class="review-icon">{{ option.icon }}</span>
          </div>
        </div>
        <div class="review-analysis">
          <div class="analysis-row correct-answer">
            <strong>正確答案</strong>
            <span>
              <template v-if="reviewQuestion.type === 'multiple'">
                {{ reviewQuestion.options.filter((item) => reviewQuestion.answer.includes(item.value)).map((item) => item.label).join('、') }}
              </template>
              <template v-else>
                {{ reviewQuestion.options.find((item) => item.value === reviewQuestion.answer).label }}
              </template>
            </span>
          </div>
          <div class="analysis-row keywords">
            <strong>解題關鍵字</strong>
            <span>{{ reviewQuestion.keywords.join('、') }}</span>
          </div>
          <div class="analysis-row full-explain">
            <strong>完整詳解</strong>
            <span>{{ reviewQuestion.explanation }}</span>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.exam-shell {
  min-height: 100vh;
  padding: 28px;
  color: #1f2937;
  font-family: 'Noto Sans TC', system-ui, sans-serif;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
}

/* 深色模式樣式 */
:deep(.dark-mode) .exam-shell {
  color: #e2e8f0;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

:deep(.dark-mode) .exam-label {
  color: #94a3b8;
}

:deep(.dark-mode) .exam-header h1 {
  color: #f1f5f9;
}

:deep(.dark-mode) .mode-switch button {
  background: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}

:deep(.dark-mode) .mode-switch button.active {
  border-color: #60a5fa;
  color: #3b82f6;
}

:deep(.dark-mode) .progress-label {
  color: #cbd5e1;
}

:deep(.dark-mode) .question-card,
:deep(.dark-mode) .dashboard-panel,
:deep(.dark-mode) .review-card {
  background: #1e293b;
  color: #e2e8f0;
}

:deep(.dark-mode) .option-card {
  background: #334155;
  border-color: #475569;
  color: #e2e8f0;
}

:deep(.dark-mode) .option-card:hover {
  background: #475569;
}

:deep(.dark-mode) .option-text p {
  color: #f1f5f9;
}

:deep(.dark-mode) .back-home {
  background: rgba(255, 255, 255, 0.18);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.25);
}

:deep(.dark-mode) .next-btn,
:deep(.dark-mode) .prev-btn {
  background: #334155;
  color: #e2e8f0;
}

:deep(.dark-mode) .feedback-panel {
  background: #1e293b;
  border-color: #334155;
}

:deep(.dark-mode) .summary-items div {
  background: #1e293b;
  color: #e2e8f0;
}

:deep(.dark-mode) .dot {
  background: #1e293b;
  border-color: #475569;
  color: #e2e8f0;
}

:deep(.dark-mode) .dot.wrong {
  background: #451a1a;
  border-color: #7f1d1d;
}

:deep(.dark-mode) .review-option {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

:deep(.dark-mode) .analysis-row {
  background: #1e293b;
  border-color: #334155;
}

:deep(.dark-mode) .analysis-row strong {
  color: #f1f5f9;
}

:deep(.dark-mode) .analysis-row span {
  color: #cbd5e1;
}

:deep(.dark-mode) .theme-toggle {
  background: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}

:deep(.dark-mode) .theme-toggle:hover {
  background: #334155;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: #f8fafc;
}

.exam-label {
  font-size: 0.9rem;
  color: #6b7280;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.exam-header h1 {
  margin: 0;
  font-size: 2rem;
}

.mode-switch {
  display: flex;
  gap: 10px;
}

.mode-switch button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-switch button.active {
  border-color: #3b82f6;
  color: #1d4ed8;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.16);
}

.progress-area {
  margin-bottom: 26px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #334155;
}

.progress-track {
  height: 14px;
  border-radius: 999px;
  background: #e2e8f0;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #4f46e5, #22c55e);
  transition: width 0.4s ease;
}

.combo-badge {
  position: absolute;
  right: 8px;
  top: -28px;
  background: rgba(59, 130, 246, 0.96);
  color: #fff;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.16);
}

.exam-body {
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 22px;
}

.question-card,
.dashboard-panel,
.review-card {
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  padding: 24px;
}

.question-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.question-top {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-tag {
  display: inline-block;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.9rem;
}

.question-top h2 {
  margin: 0;
  font-size: 1.55rem;
  line-height: 1.4;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 84px;
  padding: 18px;
  border: 2px solid #d1d5db;
  border-radius: 22px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.option-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}

.option-card.selected {
  border-width: 3px;
}

.option-card.correct {
  border-color: #16a34a;
  background: #ecfdf5;
}

.option-card.wrong {
  border-color: #dc2626;
  background: #fef2f2;
}

.option-icon {
  min-width: 48px;
  min-height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.option-text {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.option-text p {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.check-tag {
  display: inline-flex;
  min-width: 26px;
  height: 26px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background: #22c55e;
  color: white;
  font-size: 0.9rem;
}

.action-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.submit-btn,
.next-btn,
.prev-btn,
.restart-btn,
.retry-btn,
.back-home {
  border: none;
  border-radius: 16px;
  padding: 14px 22px;
  cursor: pointer;
  font-weight: 400;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-btn,
.retry-btn,
.restart-btn,
.combo-badge {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.submit-btn {
  background: #2563eb;
  color: white;
}

.submit-btn:disabled,
.next-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.retry-btn {
  background: #f59e0b;
  color: white;
  border-radius: 14px;
  margin-top: 12px;
}

.info-tag {
  background: #e2e8f0;
  color: #1e3a8a;
  border-radius: 999px;
  padding: 10px 16px;
  display: inline-block;
}

.back-home {
  background: rgba(255, 255, 255, 0.65);
  color: #1f2937;
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 10px 16px;
  border-radius: 999px;
}

.next-btn {
  background: #e2e8f0;
  color: #1f2937;
}

.prev-btn {
  background: #e2e8f0;
  color: #1f2937;
}

.restart-btn {
  width: 100%;
  background: #1d4ed8;
  color: white;
  margin-top: 18px;
}

.feedback-panel {
  background: #f8fafc;
  border-radius: 20px;
  padding: 18px;
  border: 1px solid #cbd5e1;
}

.feedback-tag {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
  margin-bottom: 14px;
}

.correct-tag {
  background: #ecfdf5;
  color: #166534;
}

.wrong-tag {
  background: #fef2f2;
  color: #991b1b;
}

.feedback-note p {
  margin: 0 0 10px 0;
  line-height: 1.7;
}

.hint-keywords {
  font-weight: 700;
  color: #0f172a;
}

.full-explain {
  color: #475569;
}

.dashboard-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.score-card p {
  margin: 0 0 10px 0;
  color: #64748b;
}

.ring-chart {
  --rate: 0%;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: conic-gradient(#22c55e calc(var(--rate) * 1), #e2e8f0 0);
  display: grid;
  place-items: center;
  position: relative;
  margin: 0 auto 14px;
}

.ring-chart::after {
  content: '';
  width: 98px;
  height: 98px;
  border-radius: 50%;
  background: #ffffff;
  position: absolute;
}

.ring-chart span {
  position: relative;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.ring-chart small {
  font-size: 0.9rem;
  font-weight: 600;
}

.summary-items {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summary-items div {
  border-radius: 20px;
  background: #f8fafc;
  padding: 16px;
  text-align: center;
}

.summary-items strong {
  display: block;
  font-size: 1.5rem;
}

.summary-items span {
  color: #475569;
}

.dot-map p,
.weak-note-box p {
  margin: 0 0 10px 0;
  font-weight: 700;
}

.dots {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dot {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  cursor: pointer;
  color: #0f172a;
  font-weight: 700;
}

.dot.wrong {
  background: #fee2e2;
  border-color: #fca5a5;
}

.dot.active {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
}

.dot-clue {
  margin-top: 10px;
  color: #64748b;
  font-size: 0.95rem;
}

.weak-note-box ul {
  margin: 0;
  padding-left: 18px;
  color: #334155;
}

.review-area {
  margin-top: 24px;
}

.review-card {
  padding: 20px;
}

.review-header h3 {
  margin: 0 0 8px 0;
}

.review-options {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.review-option {
  background: #f8fafc;
  border-radius: 18px;
  padding: 14px 18px;
  border: 1px solid #cbd5e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-option.correct {
  border-color: #16a34a;
  background: #ecfdf5;
}

.review-option.wrong {
  border-color: #dc2626;
  background: #fef2f2;
  text-decoration: line-through;
}

.review-label {
  font-weight: 700;
}

.review-icon {
  font-size: 1.3rem;
}

.review-analysis {
  margin-top: 22px;
  display: grid;
  gap: 14px;
}

.analysis-row {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  padding: 16px;
}

.analysis-row strong {
  display: block;
  margin-bottom: 8px;
  color: #0f172a;
}

.analysis-row span {
  color: #475569;
  line-height: 1.7;
}

@media (max-width: 1000px) {
  .exam-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .option-grid {
    grid-template-columns: 1fr;
  }
  .exam-header {
    align-items: flex-start;
  }
}
</style>