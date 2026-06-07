import React, { useState, useEffect, useRef } from 'react';
import { getSupabase } from '../lib/supabase.ts';
import { Send, MessageSquare, Users, User, ArrowRight } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { motion } from 'motion/react';

interface BroadcastMessage {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState<string>(localStorage.getItem('chat-nickname') || '');
  const [isSettingName, setIsSettingName] = useState(!localStorage.getItem('chat-nickname'));
  const [tempName, setTempName] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userName) return;

    const supabase = getSupabase();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel('chat:public', {
      config: { presence: { key: userName } },
    });

    channel
      .on('broadcast', { event: 'message' }, ({ payload }: { payload: BroadcastMessage }) => {
        setMessages(prev => [...prev, payload]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ online_at: string }>();
        setOnlineUsers(Object.keys(state));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userName || !channelRef.current) return;

    const msg: BroadcastMessage = {
      id: crypto.randomUUID(),
      user_name: userName,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    setNewMessage('');
    setMessages(prev => [...prev, msg]);

    await channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: msg,
    });
  };

  const handleSetName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      const name = tempName.trim();
      setUserName(name);
      localStorage.setItem('chat-nickname', name);
      setIsSettingName(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full bg-bg-card border border-border flex flex-col h-full rounded-2xl overflow-hidden shadow-lg transition-colors duration-300">
      {isSettingName ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-tr from-brand/5 to-indigo-500/5">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm glass-panel p-8 flex flex-col items-center text-center border-border"
          >
            <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            
            <h3 className="font-extrabold text-xl tracking-tight text-text-main font-display mb-1">
              Bắt đầu tham gia Chat
            </h3>
            <p className="text-text-muted text-xs mb-6">
              Nhập biệt danh của bạn để bắt đầu trò chuyện trực tuyến với mọi người trong phòng chat chung.
            </p>

            <form onSubmit={handleSetName} className="w-full space-y-3">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Nhập biệt danh của bạn..."
                className="premium-input text-center font-semibold tracking-wide"
                maxLength={25}
                required
              />
              <button 
                type="submit" 
                className="geo-btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                Bắt đầu ngay <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-bg-card/90 backdrop-blur-md flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand/10 text-brand rounded-xl">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-text-main font-display">
                    Phòng Chat Chung
                  </h4>
                  <p className="text-[10px] text-text-muted">
                    Nickname: <span className="font-bold text-brand">{userName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingName(true)}
                className="text-[10px] text-text-muted hover:text-brand font-extrabold uppercase tracking-wider bg-input-bg border border-input-border px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Đổi tên
              </button>
            </div>

            {/* Online status lists */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {onlineUsers.length} Online
                </span>
              </div>
              {onlineUsers.map((user, idx) => (
                <div 
                  key={idx} 
                  className="text-[9px] text-text-muted font-bold bg-input-bg border border-input-border px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1"
                >
                  <div className="w-3 h-3 bg-brand/15 text-brand text-[8px] flex items-center justify-center rounded-full font-black">
                    {getInitials(user)[0]}
                  </div>
                  <span>{user === userName ? 'Bạn' : user}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-main/30" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-text-muted/40">
                <Users className="w-10 h-10 mb-2" />
                <p className="text-center text-[10px] font-bold uppercase tracking-wider">
                  Chưa có tin nhắn nào. Hãy mở lời chào!
                </p>
              </div>
            )}
            {messages.map((msg) => {
              const isSelf = msg.user_name === userName;
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    isSelf ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  {/* Message Avatar */}
                  <div className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm ${
                    isSelf 
                      ? 'bg-brand text-white' 
                      : 'bg-indigo-500/10 text-brand border border-brand/10'
                  }`}>
                    {getInitials(msg.user_name)}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-tight">
                        {msg.user_name}
                      </span>
                      <span className="text-[8px] text-text-muted/60">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                      isSelf
                        ? 'bg-gradient-to-tr from-brand to-indigo-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-chat-bubble-other text-chat-text-other border border-border rounded-2xl rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border bg-bg-card">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập nội dung tin nhắn..."
                className="premium-input"
              />
              <button 
                type="submit" 
                className="geo-btn-primary !p-3.5 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
