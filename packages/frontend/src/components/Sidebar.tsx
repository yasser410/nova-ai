import React from 'react';
import { ChevronDown, MessageSquarePlus, Settings, LogOut } from 'lucide-react';
import { useChatStore, Conversation } from '../store/chat';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { conversations, currentConversationId, createConversation, selectConversation } =
    useChatStore();
  const [isOpen, setIsOpen] = React.useState(true);

  const handleNewChat = async () => {
    await createConversation();
  };

  const conversationList = Array.from(conversations.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  return (
    <motion.div
      animate={{ width: isOpen ? 280 : 64 }}
      className="bg-slate-900 border-r border-slate-800 h-screen flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-bold">N</span>
              </div>
              <span className="font-bold text-sm">Nova</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <ChevronDown size={18} className={`${isOpen ? '' : 'rotate-90'}`} />
          </button>
        </div>
      </div>

      {/* New chat button */}
      {isOpen && (
        <button
          onClick={handleNewChat}
          className="m-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <MessageSquarePlus size={18} />
          محادثة جديدة
        </button>
      )}

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {conversationList.map((conv) => (
          <button
            key={conv.id}
            onClick={() => selectConversation(conv.id)}
            className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors truncate text-sm ${
              currentConversationId === conv.id
                ? 'bg-slate-700 text-white'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
            title={conv.title}
          >
            {isOpen ? conv.title : conv.title[0]}
          </button>
        ))}
      </div>

      {/* Footer */}
      {isOpen && (
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm">
            <Settings size={18} />
            الإعدادات
          </button>
          <div className="px-3 py-2 text-xs text-slate-500 border-t border-slate-800 pt-3">
            <p className="font-medium mb-1">المطور</p>
            <p>الحاج ياسر</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
