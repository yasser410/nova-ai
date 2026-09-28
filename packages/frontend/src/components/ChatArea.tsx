import React from 'react';
import { Message as MessageType } from '../store/chat';
import { Message } from './Message';
import { LoadingSpinner } from './LoadingSpinner';

interface ChatAreaProps {
  messages: MessageType[];
  isLoading: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">N</span>
            </div>
            <LoadingSpinner />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
