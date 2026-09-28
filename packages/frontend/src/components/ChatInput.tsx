import React from 'react';
import { Mic, Send, Paperclip, Settings, Sparkles } from 'lucide-react';
import { useChatStore } from '../store/chat';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceStart?: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onVoiceStart,
  isLoading,
}) => {
  const [message, setMessage] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-slate-900/50 border-t border-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          {/* Attachment button */}
          <button className="p-2.5 rounded-lg hover:bg-slate-800 transition-colors">
            <Paperclip size={20} className="text-slate-400" />
          </button>

          {/* Message input */}
          <div className="flex-1 glass px-4 py-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالة... / Type a message..."
              className="w-full bg-transparent outline-none text-sm resize-none max-h-24"
              rows={1}
            />
          </div>

          {/* Voice button */}
          <button
            onClick={() => {
              setIsRecording(!isRecording);
              onVoiceStart?.();
            }}
            className={`p-2.5 rounded-lg transition-colors ${
              isRecording ? 'bg-red-500/20 text-red-400' : 'hover:bg-slate-800'
            }`}
          >
            <Mic size={20} />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Quick actions */}
        <div className="mt-3 flex gap-2 flex-wrap">
          <button className="px-3 py-1.5 text-xs rounded-full glass hover:bg-slate-700/50 transition-colors flex items-center gap-1">
            <Sparkles size={14} />
            أفكار
          </button>
          <button className="px-3 py-1.5 text-xs rounded-full glass hover:bg-slate-700/50 transition-colors">
            🌐 ابحث
          </button>
          <button className="px-3 py-1.5 text-xs rounded-full glass hover:bg-slate-700/50 transition-colors">
            📁 ملف
          </button>
        </div>
      </div>
    </div>
  );
};
