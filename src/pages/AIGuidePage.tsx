import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { askAIGuide } from '../services/apiClient';
import { AudioNarrationButton } from '../components/AudioNarrationButton';
import { getUIText } from '../i18n/translations';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface Props {
  lang: Language;
}

export const AIGuidePage: React.FC<Props> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content:
          lang === 'te'
            ? 'నమస్కారం! నేను గోదావరి విరాసత్ ఏఐ సాంస్కృతిక మార్గదర్శిని (AI Heritage Guide). గోదావరి పుష్కరాలు 2027 విశేషాలు, నదీ తీర దేవాలయాలు, చాళుక్య వాస్తుశిల్పం, సర్ ఆర్థర్ కాటన్ ఆనకట్ట మరియు సాంప్రదాయాల గురించి మీకు ఏవైనా సందేహాలు ఉంటే అడగండి.'
            : lang === 'hi'
            ? 'नमस्ते! मैं गोदावरी विरासत एआई सांस्कृतिक मार्गदर्शक हूँ। गोदावरी पुष्करालु 2027, नदी तट के प्राचीन मंदिरों, पूर्वी चालुक्य वास्तुकला और ऐतिहासिक परंपराओं के बारे में आप कोई भी प्रश्न पूछ सकते हैं।'
            : 'Namaste! I am your Godavari Virasat AI Cultural Guide. Ask me anything regarding Godavari Pushkaralu 2027, temple architecture across Draksharamam and Bhadrachalam, Sir Arthur Cotton’s engineering marvels, or regional rituals.',
        timestamp: Date.now(),
        sources: ['Curated Pushkaralu Heritage Archives'],
        verificationStatus: 'VERIFIED',
      },
    ];
  });

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    {
      en: 'Why is Godavari Pushkaralu celebrated once every 12 years?',
      te: 'గోదావరి పుష్కరాలు ప్రతి 12 సంవత్సరాలకు ఒకసారి ఎందుకు జరుగుతాయి?',
      hi: 'गोदावरी पुष्करालु हर 12 साल में क्यों मनाया जाता है?',
    },
    {
      en: 'What is the significance of the 14-foot Crystal Lingam at Draksharamam?',
      te: 'ద్రాక్షారామంలోని 14 అడుగుల స్పటిక లింగం ప్రత్యేకత ఏమిటి?',
      hi: 'द्राक्षारामम के 14 फीट ऊंचे स्फटिक शिवलिंग का क्या महत्व है?',
    },
    {
      en: 'How did Sir Arthur Cotton transform the Godavari delta?',
      te: 'సర్ ఆర్థర్ కాటన్ గోదావరి డెల్టాను ఎలా మార్చారు?',
      hi: 'सर आर्थर कॉटन ने गोदावरी डेल्टा का कायाकल्प कैसे किया?',
    },
    {
      en: 'What happens during the evening Godavari Maha Harathi in Rajahmundry?',
      te: 'రాజమండ్రిలో సాయంత్రం జరిగే గోదావరి మహా హారతి విశేషాలు ఏమిటి?',
      hi: 'राजमंड्री में संध्या समय होने वाली गोदावरी महा आरती का क्या महत्व है?',
    },
    {
      en: 'Why do parents bring young children to Basar temple for Akshara Abhyasam?',
      te: 'బాసర సరస్వతి ఆలయానికి అక్షరాభ్యాసం కోసం ఎందుకు వస్తారు?',
      hi: 'बासर मंदिर में बच्चों का अक्षर अभ्यासम संस्कार क्यों कराया जाता है?',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await askAIGuide(q, lang, messages);
      const botMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        sources: response.sources,
        isFallback: response.isFallback,
        verificationStatus: (response.verificationStatus as any) || 'VERIFIED',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          'I apologize, but I could not consult the heritage archive right now. Please try asking again or refer to the FAQ section.',
        timestamp: Date.now(),
        isFallback: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-sky-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Gemini AI + Curated Archives</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heritage text-white">
              {getUIText('aiGuideTitle', lang)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {getUIText('aiGuideSubtitle', lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Inquiries Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          {getUIText('suggestedQuestions', lang)}:
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(sq[lang] || sq.en)}
              className="text-left px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 text-xs text-amber-200/90 hover:text-white transition shadow-sm"
            >
              {sq[lang] || sq.en}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl flex flex-col gap-4 min-h-[460px] max-h-[620px] overflow-y-auto">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-sky-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm shadow-md flex flex-col gap-2 ${
                  isUser
                    ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-100'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

                {/* Assistant Source Citations and Actions */}
                {!isUser && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {m.sources && m.sources.length > 0 && (
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-sky-300 font-mono">
                          Source: {m.sources.join(', ')}
                        </span>
                      )}
                      {m.isFallback && (
                        <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          Offline Knowledge Mode
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <AudioNarrationButton textToRead={m.content} lang={lang} className="text-[10px] py-1 px-2" />
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.content)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Copy message"
                        aria-label="Copy message"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="rounded-2xl p-3.5 bg-slate-900 border border-slate-800 text-xs text-sky-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{getUIText('aiThinking', lang)}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-xl"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={
            lang === 'te'
              ? 'గోదావరి వారసత్వం, ఆలయాలు లేదా పుష్కరాల గురించి ఏదైనా అడగండి...'
              : lang === 'hi'
              ? 'गोदावरी विरासत, मंदिरों या पुष्करालु के बारे में कुछ भी पूछें...'
              : 'Ask anything about Godavari temples, Pushkaralu, or traditions...'
          }
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold disabled:opacity-40 disabled:pointer-events-none shadow-md transition"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
