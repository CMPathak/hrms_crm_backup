import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import HmsLayout from '@/Layouts/HmsLayout';
import axios from 'axios';
import {
    MessageSquare,
    Hash,
    Send,
    Users,
    User as UserIcon,
    Shield,
    Sparkles,
    Circle,
    Clock
} from 'lucide-react';

export default function ChatIndex({
    channels = [],
    activeChannel: initialChannel = 'general',
    activeDmUserId: initialDmUserId = null,
    teamMembers = [],
    initialMessages = [],
    initialUnreadCounts = { channels: {}, direct: {} },
    currentUserId,
}) {
    const [selectedChannel, setSelectedChannel] = useState(initialChannel);
    const [selectedDmUser, setSelectedDmUser] = useState(
        initialDmUserId ? teamMembers.find((m) => m.id === initialDmUserId) : null
    );
    const [messages, setMessages] = useState(initialMessages || []);
    const [unreadCounts, setUnreadCounts] = useState(initialUnreadCounts || { channels: {}, direct: {} });
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling effect every 3 seconds to fetch new messages live
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const params = {};
                if (selectedDmUser) {
                    params.dm_user_id = selectedDmUser.id;
                } else {
                    params.channel = selectedChannel;
                }
                const res = await axios.get(route('chat.messages'), { params });
                if (res.data) {
                    if (res.data.messages) {
                        setMessages(res.data.messages);
                    }
                    if (res.data.unreadCounts) {
                        setUnreadCounts(res.data.unreadCounts);
                    }
                }
            } catch (err) {
                console.error('Failed to poll chat messages:', err);
            }
        };

        // Fetch immediately on switch
        fetchLatest();

        const interval = setInterval(fetchLatest, 3000);
        return () => clearInterval(interval);
    }, [selectedChannel, selectedDmUser]);

    // Handle sending message (Strictly text-only, no file sharing)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = inputText.trim();
        if (!text || isSending) return;

        setIsSending(true);
        try {
            const payload = {
                message: text,
                channel: selectedDmUser ? null : selectedChannel,
                receiver_id: selectedDmUser ? selectedDmUser.id : null,
            };

            const res = await axios.post(route('chat.send'), payload);
            if (res.data && res.data.success) {
                setMessages((prev) => [...prev, res.data.message]);
                setInputText('');
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const currentTitle = selectedDmUser
        ? selectedDmUser.name
        : '#' + (channels.find((c) => c.id === selectedChannel)?.name || selectedChannel);

    const currentDescription = selectedDmUser
        ? `${selectedDmUser.role?.display_name || 'Team Member'} • Direct Message`
        : channels.find((c) => c.id === selectedChannel)?.description || 'Team discussion channel';

    return (
        <HmsLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        Internal Team Chat
                    </h2>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        🔒 Text-Only Internal Communications
                    </span>
                </div>
            }
        >
            <Head title="Internal Team Chat" />

            <div className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-175px)] min-h-[550px]">
                    
                    {/* ========================================================= */}
                    {/* LEFT PANEL: Channels & Team Members                       */}
                    {/* ========================================================= */}
                    <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/60 shrink-0">
                        {/* Team Chat Branding */}
                        <div className="p-4 border-b border-slate-200 bg-white">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">HubTech Team Chat</h3>
                                    <p className="text-[11px] text-slate-400">Live Internal Messenger</p>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable list */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-5">
                            {/* Channels Section */}
                            <div>
                                <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                    <span>Team Channels</span>
                                    <span className="text-blue-600 font-normal">{channels.length}</span>
                                </div>
                                <div className="space-y-1">
                                    {channels.map((ch) => {
                                        const isSelected = !selectedDmUser && selectedChannel === ch.id;
                                        const channelBadge = unreadCounts.channels?.[ch.id] || 0;
                                        return (
                                            <button
                                                key={ch.id}
                                                onClick={() => {
                                                    setSelectedDmUser(null);
                                                    setSelectedChannel(ch.id);
                                                    setUnreadCounts((prev) => ({
                                                        ...prev,
                                                        channels: { ...(prev.channels || {}), [ch.id]: 0 },
                                                    }));
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                                                    isSelected
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-slate-700 hover:bg-slate-200/70'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <Hash className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                                    <span className="truncate">{ch.name}</span>
                                                </div>
                                                {channelBadge > 0 && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-1.5 ${
                                                        isSelected ? 'bg-white text-blue-600' : 'bg-rose-500 text-white animate-pulse'
                                                    }`}>
                                                        {channelBadge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Direct Messages Section */}
                            <div>
                                <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                    <span>Direct Messages</span>
                                    <span className="text-blue-600 font-normal">{teamMembers.length}</span>
                                </div>
                                <div className="space-y-1">
                                    {teamMembers.map((member) => {
                                        const isSelected = selectedDmUser && selectedDmUser.id === member.id;
                                        const dmBadge = unreadCounts.direct?.[member.id] || 0;
                                        return (
                                            <button
                                                key={member.id}
                                                onClick={() => {
                                                    setSelectedDmUser(member);
                                                    setSelectedChannel(null);
                                                    setUnreadCounts((prev) => ({
                                                        ...prev,
                                                        direct: { ...(prev.direct || {}), [member.id]: 0 },
                                                    }));
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                                                    isSelected
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-slate-700 hover:bg-slate-200/70'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="relative shrink-0">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                                        }`}>
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5"></span>
                                                    </div>
                                                    <div className="truncate">
                                                        <div className="truncate font-medium">{member.name}</div>
                                                        <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                                            {member.role?.display_name || 'Staff'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {dmBadge > 0 && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2 ${
                                                        isSelected ? 'bg-white text-blue-600' : 'bg-rose-600 text-white shadow-sm animate-bounce'
                                                    }`}>
                                                        {dmBadge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* RIGHT PANEL: Chat Conversation Area                       */}
                    {/* ========================================================= */}
                    <div className="flex-1 flex flex-col bg-white">
                        {/* Chat Header */}
                        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-2.5">
                                {selectedDmUser ? (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                        {selectedDmUser.name.charAt(0).toUpperCase()}
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                                        <Hash className="w-4 h-4" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                        {currentTitle}
                                    </h4>
                                    <p className="text-[11px] text-slate-400">{currentDescription}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                                    <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                                    Live Sync
                                </span>
                            </div>
                        </div>

                        {/* Messages Thread */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-16">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">No messages yet in {currentTitle}</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                                        Start the conversation by sending a message below.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUserId;
                                    const senderName = msg.sender?.name || (isMe ? 'You' : 'Team Member');
                                    const timeStr = msg.created_at
                                        ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '';

                                    return (
                                        <div
                                            key={msg.id || idx}
                                            className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {/* Avatar */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                                isMe ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                {senderName.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Message bubble */}
                                            <div className={`max-w-md sm:max-w-lg ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                                    <span className="text-[11px] font-bold text-slate-700">{senderName}</span>
                                                    <span className="text-[10px] text-slate-400">{timeStr}</span>
                                                </div>
                                                <div
                                                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                                                        isMe
                                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                                    }`}
                                                >
                                                    {msg.message}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Text-Only Chat Input (No File Attachments Allowed) */}
                        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={`Message ${currentTitle}... (Press Enter to send)`}
                                        className="w-full text-xs sm:text-sm rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isSending}
                                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Send</span>
                                </button>
                            </form>
                            <p className="text-[11px] text-slate-400 mt-1.5 px-1">
                                💬 Strictly text communication enabled. File sharing is disabled for internal security.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </HmsLayout>
    );
}
