import React from 'react';
import { Sparkles, Zap, Brain, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStartChat: () => void;
}

const suggestions = [
  { icon: Sparkles, text: 'اسأل عن أي شيء', emoji: '✨' },
  { icon: Zap, text: 'ترجمة النصوص', emoji: '⚡' },
  { icon: Brain, text: 'تحليل البيانات', emoji: '🧠' },
  { icon: Rocket, text: 'بناء التطبيقات', emoji: '🚀' },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      {/* Nova Logo */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
          <span className="text-5xl font-bold text-white">N</span>
        </div>
      </motion.div>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Nova
      </h1>
      <p className="text-slate-400 mb-2 text-sm">بواسطة الحاج ياسر</p>
      <p className="text-slate-500 mb-8 max-w-md">منصة ذكاء اصطناعي متقدمة مع وكلاء متعددين وأدوات قابلة للتوسع</p>

      {/* Suggestions */}
      <div className="grid grid-cols-2 gap-3 mb-12 w-full max-w-md">
        {suggestions.map((item, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.05 }}
            onClick={onStartChat}
            className="glass px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-left group"
          >
            <div className="text-2xl mb-2">{item.emoji}</div>
            <p className="text-sm font-medium group-hover:text-white text-slate-300">{item.text}</p>
          </motion.button>
        ))}
      </div>

      {/* Features */}
      <div className="text-xs text-slate-500 max-w-md space-y-2">
        <p>🎙️ محادثة صوتية | 🌐 بحث الويب | 📁 معالجة الملفات</p>
        <p>💻 تحليل الأكواد | 🔄 الترجمة | 🤖 وكلاء متعددين</p>
      </div>
    </motion.div>
  );
};
