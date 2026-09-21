import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
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
    Clock,
    Paperclip,
    ImageIcon,
    FileText,
    X,
    Pencil,
    Trash2,
    Check,
    Download,
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
    const { auth } = usePage().props;
    const currentUserRole = auth?.user?.role?.role_name?.toLowerCase() || '';
    const isAdmin = currentUserRole === 'super_admin' || currentUserRole === 'admin' || auth?.user?.id === 1;

    const [selectedChannel, setSelectedChannel] = useState(initialChannel);
    const [selectedDmUser, setSelectedDmUser] = useState(
        initialDmUserId ? teamMembers.find((m) => m.id === initialDmUserId) : null
    );
    const [messages, setMessages] = useState(initialMessages || []);
    const [unreadCounts, setUnreadCounts] = useState(initialUnreadCounts || { channels: {}, direct: {} });
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);   // { file, preview, type }
    const [editingMsgId, setEditingMsgId] = useState(null);   // id of message being edited
    const [editText, setEditText] = useState('');              // text in edit input
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const prevMessagesLengthRef = useRef(messages?.length || 0);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Only scroll to bottom if the number of messages has changed (e.g. new message received)
        if (messages?.length !== prevMessagesLengthRef.current) {
            scrollToBottom();
            prevMessagesLengthRef.current = messages?.length || 0;
        }
    }, [messages]);

    // Sync active chat state to URL so page reload restores correct chat
    useEffect(() => {
        const url = new URL(window.location.href);
        if (selectedDmUser) {
            url.searchParams.set('dm_user_id', selectedDmUser.id);
            url.searchParams.delete('channel');
        } else {
            url.searchParams.set('channel', selectedChannel);
            url.searchParams.delete('dm_user_id');
        }
        window.history.replaceState({}, '', url.toString());
    }, [selectedChannel, selectedDmUser]);

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

    // Handle file selection
    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const preview = type === 'image' ? URL.createObjectURL(file) : null;
        setSelectedFile({ file, preview, type });
        e.target.value = '';
    };

    // Remove selected file
    const removeFile = () => {
        if (selectedFile?.preview) URL.revokeObjectURL(selectedFile.preview);
        setSelectedFile(null);
    };

    // Handle sending message (text and/or file)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = inputText.trim();
        if (!text && !selectedFile || isSending) return;

        setIsSending(true);
        try {
            const formData = new FormData();
            if (text) formData.append('message', text);
            formData.append('channel', selectedDmUser ? '' : (selectedChannel || 'general'));
            if (selectedDmUser) formData.append('receiver_id', selectedDmUser.id);
            if (selectedFile) formData.append('file', selectedFile.file);

            const res = await axios.post(route('chat.send'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data && res.data.success) {
                setMessages((prev) => [...prev, res.data.message]);
                setInputText('');
                removeFile();
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

    // Save edited message
    const handleEditMessage = async (msgId) => {
        const text = editText.trim();
        if (!text) return;
        try {
            const res = await axios.put(route('chat.edit', msgId), { message: text });
            if (res.data?.success) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === msgId ? { ...m, message: res.data.message.message } : m))
                );
                setEditingMsgId(null);
                setEditText('');
            }
        } catch (err) {
            console.error('Edit failed:', err);
        }
    };

    // Delete message
    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm('Is message ko delete karna chahte hain?')) return;
        try {
            const res = await axios.delete(route('chat.delete', msgId));
            if (res.data?.success) {
                setMessages((prev) => prev.filter((m) => m.id !== msgId));
            }
        } catch (err) {
            console.error('Delete failed:', err);
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

            {/* Chat container — fixed height via calc, independent of parent */}
            <div style={{ height: 'calc(100vh - 10rem)' }} className="w-full flex flex-col">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row flex-1 min-h-0">
                    
                    {/* ========================================================= */}
                    {/* LEFT PANEL: Channels & Team Members                       */}
                    {/* ========================================================= */}
                    <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/60 shrink-0 h-full overflow-hidden">
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
                        <div className="flex-1 overflow-y-auto p-3 space-y-5 min-h-0">
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
                    <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden">
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
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 min-h-0">
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

                                            {/* Message bubble with hover edit/delete */}
                                            <div className={`max-w-md sm:max-w-lg ${isMe ? 'items-end' : 'items-start'} flex flex-col group`}>
                                                {/* Name + time + action buttons row */}
                                                <div className={`flex items-center gap-1.5 mb-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <span className="text-[11px] font-bold text-slate-700">{senderName}</span>
                                                    <span className="text-[10px] text-slate-400">{timeStr}</span>

                                                    {/* Edit / Delete — show on group hover */}
                                                    {(isMe || isAdmin) && editingMsgId !== msg.id && (
                                                        <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                                                            {isMe && (
                                                                <button
                                                                    onClick={() => { setEditingMsgId(msg.id); setEditText(msg.message || ''); }}
                                                                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* File attachment display */}
                                                {msg.file_path && (
                                                    <div className="mb-1">
                                                        {msg.file_type === 'image' ? (
                                                            <div className="relative group/img inline-block">
                                                                <a href={msg.file_path} target="_blank" rel="noreferrer">
                                                                    <img
                                                                        src={msg.file_path}
                                                                        alt={msg.file_name || 'Image'}
                                                                        className="max-w-[240px] max-h-[200px] rounded-2xl object-cover shadow-sm border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                                    />
                                                                </a>
                                                                {/* Download button on image hover */}
                                                                <a
                                                                    href={msg.file_path}
                                                                    download={msg.file_name || 'image'}
                                                                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/70"
                                                                    title="Download"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-xs font-medium ${
                                                                isMe
                                                                    ? 'bg-blue-500 text-white border-blue-400'
                                                                    : 'bg-white text-slate-700 border-slate-200'
                                                            }`}>
                                                                <FileText className="w-4 h-4 shrink-0" />
                                                                <a
                                                                    href={msg.file_path}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="truncate max-w-[160px] hover:underline"
                                                                >
                                                                    {msg.file_name || 'Document.pdf'}
                                                                </a>
                                                                {/* Download button for PDF */}
                                                                <a
                                                                    href={msg.file_path}
                                                                    download={msg.file_name || 'document.pdf'}
                                                                    className={`ml-auto p-1 rounded-lg transition-colors shrink-0 ${
                                                                        isMe
                                                                            ? 'text-white/70 hover:text-white hover:bg-white/20'
                                                                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                                                    }`}
                                                                    title="Download"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Inline edit mode */}
                                                {editingMsgId === msg.id ? (
                                                    <div className="flex items-center gap-1.5 w-full">
                                                        <input
                                                            autoFocus
                                                            value={editText}
                                                            onChange={(e) => setEditText(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleEditMessage(msg.id);
                                                                if (e.key === 'Escape') { setEditingMsgId(null); setEditText(''); }
                                                            }}
                                                            className="flex-1 text-xs sm:text-sm rounded-xl border border-blue-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                                                        />
                                                        <button
                                                            onClick={() => handleEditMessage(msg.id)}
                                                            className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                            title="Save"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingMsgId(null); setEditText(''); }}
                                                            className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : msg.message ? (
                                                    <div
                                                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                                                            isMe
                                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                                        }`}
                                                    >
                                                        {msg.message}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input with File Attachment */}
                        <div className="border-t border-slate-200 bg-white">

                            {/* File preview strip */}
                            {selectedFile && (
                                <div className="px-4 pt-3 pb-0 flex items-center gap-2">
                                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 max-w-xs">
                                        {selectedFile.type === 'image' ? (
                                            <img src={selectedFile.preview} alt="preview" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                        ) : (
                                            <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                                        )}
                                        <span className="text-xs text-slate-600 truncate max-w-[160px]">{selectedFile.file.name}</span>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="ml-1 text-slate-400 hover:text-slate-600 shrink-0"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Input row */}
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-3 sm:p-4">

                                {/* Hidden file inputs */}
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, 'image')}
                                />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, 'pdf')}
                                />

                                {/* Text input with icons inside on the right */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={`Message ${currentTitle}... (Press Enter to send)`}
                                        className="w-full text-xs sm:text-sm rounded-2xl border border-slate-300 px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    />
                                    {/* Icons inside input — right side */}
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                        {isAdmin && (
                                            <>
                                                {/* Image attach button */}
                                                <button
                                                    type="button"
                                                    onClick={() => imageInputRef.current?.click()}
                                                    title="Attach Image"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                </button>
                                                {/* PDF / File attach button */}
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    title="Attach PDF"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <Paperclip className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Send button */}
                                <button
                                    type="submit"
                                    disabled={(!inputText.trim() && !selectedFile) || isSending}
                                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Send</span>
                                </button>
                            </form>

                            {/* Help Text */}
                            {isAdmin && (
                                <div className="px-5 pb-4 text-[11px] text-slate-400 flex items-center gap-1.5">
                                    <Paperclip className="w-3 h-3" />
                                    Attach images or PDF files along with your message.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </HmsLayout>
    );
}
