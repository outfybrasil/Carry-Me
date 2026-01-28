
import React, { useRef, useEffect } from 'react';
import { Send, MessageSquare, Wifi, Terminal, Signal } from 'lucide-react';
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

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    return (
        <div className="w-full h-full bg-[#121417] border border-white/5 rounded-sm flex flex-col overflow-hidden noise-bg">
            <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
                <h3 className="text-xs font-tactical font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
                    <Terminal size={16} className="text-[#ffb800]" /> Link_Comando_Squad
                </h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-black/40 rounded-sm border border-white/5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#ffb800] shadow-[0_0_5px_#ffb800] animate-pulse' : 'bg-red-500'}`}></span>
                        <span className={`text-[8px] font-mono font-black uppercase tracking-widest ${isConnected ? 'text-[#ffb800]' : 'text-slate-700'}`}>{isConnected ? 'SYNC_ACTIVE' : 'OFFLINE'}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
                {chat.length === 0 && (
                    <div className="text-center text-slate-800 mt-20">
                        <Signal size={32} className="mx-auto mb-4 opacity-10" />
                        <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em]">Aguardando transmissão...</p>
                    </div>
                )}
                {chat.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center' : msg.senderId === user.id ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                        {msg.isSystem ? (
                            <div className="my-4 px-4 py-1 bg-white/5 border border-white/5 rounded-sm">
                                <span className="text-[8px] font-mono font-black text-slate-600 uppercase tracking-widest">{msg.text}</span>
                            </div>
                        ) : (
                            <div className={`max-w-[85%] ${msg.senderId === user.id ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                <div className={`px-4 py-3 rounded-sm text-xs font-mono font-bold leading-relaxed shadow-lg ${msg.senderId === user.id
                                    ? 'bg-[#ffb800] text-black border border-[#ffb800]'
                                    : 'bg-[#1c1f24] text-slate-300 border border-white/5'
                                    }`}>
                                    {msg.text}
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    {msg.senderId !== user.id && <span className="text-[8px] font-mono font-black text-[#ffb800] uppercase tracking-widest">{msg.senderName}</span>}
                                    <span className="text-[8px] font-mono font-black text-slate-700 tracking-widest">{msg.timestamp}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={onSendMessage} className="p-4 bg-black/40 border-t border-white/5 flex gap-3">
                <input
                    type="text"
                    placeholder={isConnected ? "TRANSMITIR..." : "SINC_REQUERIDO..."}
                    disabled={!isConnected}
                    className="flex-1 bg-black/60 border border-white/5 rounded-sm px-4 py-4 text-white placeholder:text-slate-800 focus:outline-none focus:border-[#ffb800]/30 text-xs font-mono font-bold disabled:opacity-50 transition-all"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={!inputText.trim() || !isConnected}
                    className="aspect-square w-12 bg-[#ffb800] hover:bg-[#ffc933] text-black rounded-sm flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale active:scale-95 shadow-xl"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default LobbyChat;
