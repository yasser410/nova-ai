import React from 'react';
import { Message as MessageType } from '../store/chat';
import Markdown from 'react-markdown';
import { Copy, Thumbs, MessageSquare } from 'lucide-react';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 mb-4 animate-slide-in ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold">N</span>
        </div>
      )}

      <div className={`max-w-2xl ${isUser ? 'mr-8' : ''}`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'glass'
          }`}
        >
          <Markdown className="prose prose-invert max-w-none prose-sm">
            {message.content}
          </Markdown>
        </div>

        {!isUser && (
          <div className="mt-2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 text-xs rounded hover:bg-slate-800 transition-colors"
              title="Copy"
            >
              <Copy size={14} />
            </button>
            <button className="p-1.5 text-xs rounded hover:bg-slate-800 transition-colors" title="Helpful">
              <Thumbs size={14} />
            </button>
            <button className="p-1.5 text-xs rounded hover:bg-slate-800 transition-colors" title="Reply">
              <MessageSquare size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
