
import React, { useRef, useEffect } from 'react';
import { Send, MessageSquare, Wifi } from 'lucide-react';
import { ChatMessage, Player } from '../../types';

interface LobbyChatProps {
    chat: ChatMessage[];
    user: Player;
    isConnected: boolean;
    inputText: string;
    setInputText: (text: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
}

const LobbyChat: React.FC<LobbyChatProps> = ({
    chat,
    user,
    isConnected,
    inputText,
    setInputText,
    onSendMessage
}) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    return (
        <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-3 md:p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                    <MessageSquare size={16} className="text-blue-500" /> Chat do Time
                </h3>
                <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className={isConnected ? 'text-green-500' : 'text-slate-500'}>{isConnected ? 'Realtime' : 'Conectando...'}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar bg-slate-950/30">
                {chat.length === 0 && (
                    <div className="text-center text-slate-600 mt-10 text-sm">
                        <Wifi size={24} className="mx-auto mb-2 opacity-20" />
                        <p>Inicie a conversa...</p>
                        <p className="text-xs text-slate-700 mt-1">Conectado via Supabase Realtime</p>
                    </div>
                )}
                {chat.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center' : msg.senderId === user.id ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        {msg.isSystem ? (
                            <span className="text-[10px] text-slate-500 my-2 px-2 py-1 bg-slate-800/50 rounded-full border border-slate-800">{msg.text}</span>
                        ) : (
                            <>
                                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm shadow-sm ${msg.senderId === user.id
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-600 mt-1 px-1">
                                    {msg.senderId !== user.id && <span className="font-bold mr-1">{msg.senderName}</span>}
                                    {msg.timestamp}
                                </span>
                            </>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={onSendMessage} className="p-2 md:p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                    type="text"
                    placeholder={isConnected ? "Mensagem..." : "Conectando..."}
                    disabled={!isConnected}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={!inputText.trim() || !isConnected}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default LobbyChat;
