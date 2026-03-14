import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import EmojiPicker from "@/components/velocity/EmojiPicker";
import CallModal from "@/components/velocity/CallModal";
import GroupSettingsModal from "@/components/velocity/GroupSettingsModal";
import ProfileSettingsModal from "@/components/velocity/ProfileSettingsModal";

interface User {
  name: string;
  tag: string;
  email: string;
  avatar: string | null;
}

interface Message {
  id: string;
  from: string;
  text: string;
  image?: string;
  isVideo?: boolean;
  videoUrl?: string;
  reactions: Record<string, string[]>;
  time: string;
  isAI?: boolean;
}

interface Chat {
  id: string;
  name: string;
  type: "dm" | "group" | "ai";
  avatar: string | null;
  members?: string[];
  messages: Message[];
  photo?: string | null;
}

const AI_RESPONSES = [
  "Привет! Я Velocity AI. Чем могу помочь? 🚀",
  "Интересный вопрос! Давай разберёмся вместе.",
  "Конечно, я могу помочь с этим!",
  "Хм, дай подумаю... Вот что я об этом думаю:",
  "Отличная идея! Вот несколько мыслей по этому поводу:",
  "Я рад помочь! Вот мой ответ:",
  "Это сложная тема, но я постараюсь объяснить просто.",
  "Ты задаёшь правильные вопросы! 👍",
  "Velocity AI всегда готов помочь — задавай ещё вопросы!",
];

function randomAiReply(): string {
  return AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
}

const INITIAL_CHATS: Chat[] = [
  {
    id: "ai",
    name: "Velocity AI",
    type: "ai",
    avatar: null,
    messages: [
      {
        id: "1",
        from: "ai",
        text: "Привет! Я Velocity AI — твой личный ассистент. Спрашивай что угодно! 🚀",
        reactions: {},
        time: "сейчас",
        isAI: true,
      },
    ],
  },
  {
    id: "group-1",
    name: "Общий чат",
    type: "group",
    avatar: null,
    photo: null,
    members: ["Алекс", "Маша", "Дима"],
    messages: [
      { id: "g1", from: "Маша", text: "Всем привет! 👋", reactions: {}, time: "10:00" },
      { id: "g2", from: "Дима", text: "Привет! Как дела?", reactions: {}, time: "10:02" },
    ],
  },
  {
    id: "dm-1",
    name: "Алекс",
    type: "dm",
    avatar: null,
    messages: [
      { id: "d1", from: "Алекс", text: "Привет! Как дела?", reactions: {}, time: "вчера" },
    ],
  },
];

const EMOJIS = ["👍","❤️","😂","😮","😢","🔥","👏","🎉","💯","🚀"];

export default function MessengerApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>("ai");
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [callModal, setCallModal] = useState<{ type: "audio" | "video" } | null>(null);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length]);

  function sendMessage(extraImage?: string, isVideo?: boolean, videoUrl?: string) {
    if (!text.trim() && !extraImage) return;
    const msg: Message = {
      id: Date.now().toString(),
      from: currentUser.name,
      text: text.trim(),
      image: extraImage,
      isVideo,
      videoUrl,
      reactions: {},
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
    };
    setChats(prev => prev.map(c =>
      c.id === activeChatId ? { ...c, messages: [...c.messages, msg] } : c
    ));
    const sentText = text.trim();
    setText("");
    setShowEmoji(false);

    if (activeChat?.type === "ai" && sentText) {
      setTimeout(() => {
        const aiMsg: Message = {
          id: Date.now().toString() + "_ai",
          from: "Velocity AI",
          text: randomAiReply(),
          reactions: {},
          time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
          isAI: true,
        };
        setChats(prev => prev.map(c =>
          c.id === activeChatId ? { ...c, messages: [...c.messages, aiMsg] } : c
        ));
      }, 800);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>, isVideo?: boolean) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      if (isVideo) {
        sendMessage(undefined, true, result);
      } else {
        sendMessage(result, false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function addReaction(msgId: string, emoji: string) {
    setChats(prev => prev.map(c =>
      c.id === activeChatId ? {
        ...c,
        messages: c.messages.map(m => {
          if (m.id !== msgId) return m;
          const users = m.reactions[emoji] || [];
          const has = users.includes(currentUser.name);
          return {
            ...m,
            reactions: {
              ...m.reactions,
              [emoji]: has ? users.filter(u => u !== currentUser.name) : [...users, currentUser.name],
            },
          };
        }),
      } : c
    ));
    setShowReactionPicker(null);
  }

  function updateGroupSettings(name: string, photo: string | null) {
    setChats(prev => prev.map(c =>
      c.id === activeChatId ? { ...c, name, photo } : c
    ));
    setShowGroupSettings(false);
  }

  function updateProfile(updated: User) {
    setCurrentUser(updated);
    setShowProfile(false);
  }

  return (
    <div className="flex h-screen bg-[#1e1f22] overflow-hidden">
      {/* Боковая панель */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-200 overflow-hidden flex-shrink-0 flex flex-col bg-[#2b2d31] border-r border-[#1e1f22]`}>
        {/* Заголовок */}
        <div className="px-4 py-3 flex items-center gap-2 border-b border-[#1e1f22]">
          <div className="w-7 h-7 bg-[#5865f2] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <polygon points="16,3 21,13 18.5,12 18.5,22 16,20.5 13.5,22 13.5,12 11,13" fill="white"/>
              <polygon points="11,13 6,18.5 10.5,16.5 13.5,18.5" fill="#a5b4fc"/>
              <polygon points="21,13 26,18.5 21.5,16.5 18.5,18.5" fill="#a5b4fc"/>
            </svg>
          </div>
          <span className="text-white font-bold text-base">Velocity</span>
          <div className="ml-auto">
            <Icon name="Search" size={16} className="text-[#b9bbbe] cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Список чатов */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => { setActiveChatId(chat.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeChatId === chat.id ? "bg-[#404249]" : "hover:bg-[#35373c]"}`}
            >
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: chat.type === "ai" ? "linear-gradient(135deg,#5865f2,#eb459e)" : "#5865f2" }}>
                {chat.photo ? <img src={chat.photo} className="w-full h-full object-cover" alt="" /> :
                  chat.type === "ai" ? <span className="text-white text-lg">⚡</span> :
                  chat.type === "group" ? <Icon name="Users" size={18} className="text-white" /> :
                  <span className="text-white font-bold text-sm">{chat.name[0].toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{chat.name}</div>
                <div className="text-[#b9bbbe] text-xs truncate">
                  {chat.messages.at(-1)?.text?.slice(0, 30) || "Нет сообщений"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Профиль пользователя */}
        <div className="p-2 bg-[#232428] flex items-center gap-2">
          <div onClick={() => setShowProfile(true)}
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 cursor-pointer bg-[#5865f2] flex items-center justify-center hover:opacity-80 transition-opacity">
            {currentUser.avatar
              ? <img src={currentUser.avatar} className="w-full h-full object-cover" alt="" />
              : <span className="text-white font-bold text-sm">{currentUser.name[0].toUpperCase()}</span>}
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowProfile(true)}>
            <div className="text-white text-sm font-medium truncate">{currentUser.name}</div>
            <div className="text-[#b9bbbe] text-xs truncate">#{currentUser.tag}</div>
          </div>
          <button onClick={onLogout} className="text-[#b9bbbe] hover:text-red-400 transition-colors p-1">
            <Icon name="LogOut" size={16} />
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Заголовок чата */}
        <div className="h-12 bg-[#2b2d31] border-b border-[#1e1f22] flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#b9bbbe] hover:text-white mr-1">
            <Icon name="Menu" size={20} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: activeChat?.type === "ai" ? "linear-gradient(135deg,#5865f2,#eb459e)" : "#5865f2" }}>
            {activeChat?.photo ? <img src={activeChat.photo} className="w-full h-full object-cover" alt="" /> :
              activeChat?.type === "ai" ? <span className="text-sm">⚡</span> :
              activeChat?.type === "group" ? <Icon name="Users" size={14} className="text-white" /> :
              <span className="text-white font-bold text-xs">{activeChat?.name[0].toUpperCase()}</span>}
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">{activeChat?.name}</div>
            {activeChat?.type === "group" && (
              <div className="text-[#b9bbbe] text-xs">{activeChat.members?.length} участников</div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {activeChat?.type !== "ai" && (
              <>
                <button onClick={() => setCallModal({ type: "audio" })} className="text-[#b9bbbe] hover:text-white transition-colors p-1.5 rounded hover:bg-[#40444b]">
                  <Icon name="Phone" size={18} />
                </button>
                <button onClick={() => setCallModal({ type: "video" })} className="text-[#b9bbbe] hover:text-white transition-colors p-1.5 rounded hover:bg-[#40444b]">
                  <Icon name="Video" size={18} />
                </button>
              </>
            )}
            {activeChat?.type === "group" && (
              <button onClick={() => setShowGroupSettings(true)} className="text-[#b9bbbe] hover:text-white transition-colors p-1.5 rounded hover:bg-[#40444b]">
                <Icon name="Settings" size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {activeChat?.messages.map((msg, i) => {
            const isMe = msg.from === currentUser.name;
            const isAI = msg.isAI;
            const prevMsg = activeChat.messages[i - 1];
            const showName = !prevMsg || prevMsg.from !== msg.from;
            return (
              <div key={msg.id} className={`group flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} items-end`}>
                {/* Аватар */}
                {!isMe && showName && (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mb-4 overflow-hidden"
                    style={{ background: isAI ? "linear-gradient(135deg,#5865f2,#eb459e)" : "#5865f2" }}>
                    {isAI ? <span className="text-sm">⚡</span> : <span className="text-white text-xs font-bold">{msg.from[0].toUpperCase()}</span>}
                  </div>
                )}
                {!isMe && !showName && <div className="w-8 flex-shrink-0" />}

                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                  {showName && !isMe && (
                    <span className="text-xs text-[#b9bbbe] mb-1 ml-1">{msg.from}</span>
                  )}
                  <div className="relative">
                    {/* Кружок видео */}
                    {msg.isVideo && msg.videoUrl ? (
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#5865f2] bg-black">
                        <video src={msg.videoUrl} className="w-full h-full object-cover" controls muted />
                      </div>
                    ) : msg.image ? (
                      <img src={msg.image} alt="фото"
                        className="max-w-full max-h-64 rounded-2xl object-cover cursor-pointer"
                        style={{ maxWidth: "280px" }} />
                    ) : null}
                    {msg.text && (
                      <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-[#5865f2] text-white rounded-br-md" : "bg-[#383a40] text-[#dcddde] rounded-bl-md"} ${msg.image || msg.isVideo ? "mt-1" : ""}`}
                        style={{ wordBreak: "break-word", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                        {msg.text}
                      </div>
                    )}

                    {/* Реакции */}
                    {Object.keys(msg.reactions).filter(e => msg.reactions[e].length > 0).length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                        {Object.entries(msg.reactions)
                          .filter(([, users]) => users.length > 0)
                          .map(([emoji, users]) => (
                            <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                              className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors ${users.includes(currentUser.name) ? "bg-[#5865f2]/20 border-[#5865f2] text-white" : "bg-[#383a40] border-[#4e5058] text-[#dcddde] hover:border-[#5865f2]"}`}>
                              {emoji} {users.length}
                            </button>
                          ))}
                      </div>
                    )}

                    {/* Кнопка реакции */}
                    <button
                      onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                      className={`absolute ${isMe ? "left-0 -translate-x-full" : "right-0 translate-x-full"} top-0 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded-full bg-[#383a40] text-sm hover:bg-[#4e5058] ml-1 mr-1`}>
                      😊
                    </button>
                    {showReactionPicker === msg.id && (
                      <div className={`absolute top-0 ${isMe ? "right-8" : "left-8"} z-10 bg-[#2b2d31] border border-[#1e1f22] rounded-xl p-2 flex gap-1 flex-wrap shadow-xl`} style={{ width: "220px" }}>
                        {EMOJIS.map(e => (
                          <button key={e} onClick={() => addReaction(msg.id, e)}
                            className="text-lg hover:scale-125 transition-transform p-1">{e}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[#72767d] text-xs mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода */}
        <div className="px-4 pb-4 flex-shrink-0">
          {showEmoji && (
            <EmojiPicker onSelect={e => { setText(t => t + e); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />
          )}
          <div className="bg-[#383a40] rounded-2xl flex items-end gap-2 px-4 py-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, false)} />
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e, true)} />
            <button onClick={() => fileInputRef.current?.click()} className="text-[#b9bbbe] hover:text-white transition-colors flex-shrink-0 mb-0.5">
              <Icon name="ImagePlus" size={20} />
            </button>
            <button onClick={() => videoInputRef.current?.click()} className="text-[#b9bbbe] hover:text-white transition-colors flex-shrink-0 mb-0.5">
              <Icon name="Video" size={20} />
            </button>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder={`Написать в ${activeChat?.name || "чат"}...`}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder:text-[#72767d] resize-none outline-none text-sm leading-5 max-h-32 overflow-y-auto"
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            />
            <button onClick={() => setShowEmoji(!showEmoji)} className="text-[#b9bbbe] hover:text-white transition-colors flex-shrink-0 mb-0.5">
              <Icon name="Smile" size={20} />
            </button>
            <button onClick={() => sendMessage()}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-xl p-2 flex-shrink-0 transition-colors disabled:opacity-50"
              disabled={!text.trim()}>
              <Icon name="Send" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Модалки */}
      {callModal && <CallModal type={callModal.type} chatName={activeChat?.name} onClose={() => setCallModal(null)} />}
      {showGroupSettings && activeChat?.type === "group" && (
        <GroupSettingsModal
          chat={activeChat}
          onSave={updateGroupSettings}
          onClose={() => setShowGroupSettings(false)} />
      )}
      {showProfile && (
        <ProfileSettingsModal
          user={currentUser}
          onSave={updateProfile}
          onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
