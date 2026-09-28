import React from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useChatStore } from './store/chat';

function App() {
  const {
    currentConversationId,
    isLoading,
    error,
    getCurrentConversation,
    createConversation,
    sendMessage,
    clearError,
  } = useChatStore();

  const currentConversation = getCurrentConversation();
  const messages = currentConversation?.messages || [];

  const handleSendMessage = async (message: string) => {
    if (!currentConversationId) {
      await createConversation();
    }
    await sendMessage(message, true);
  };

  const handleStartChat = async () => {
    const convId = await createConversation();
    if (convId) {
      // Focus on input
      document.querySelector('textarea')?.focus();
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Error notification */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 m-3 rounded-lg flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-sm font-medium hover:underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chat content */}
        {messages.length === 0 && !currentConversationId ? (
          <WelcomeScreen onStartChat={handleStartChat} />
        ) : (
          <ChatArea messages={messages} isLoading={isLoading} />
        )}

        {/* Chat input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;
