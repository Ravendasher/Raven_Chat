import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Compass,
  Copy,
  Cpu,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  Languages,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Sun,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type NavKey = "chat" | "profile" | "settings" | "ai";
type ThemeMode = "light" | "dark" | "auto";

type Conversation = {
  id: string;
  name: string;
  username: string;
  initials: string;
  accent: string;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
};

type Message = {
  id: number;
  from: "me" | "them" | "ai";
  text: string;
  time: string;
  translated?: string;
};

const conversations: Conversation[] = [
  { id: "sakura", name: "Sakura Mori", username: "@sakuramori", initials: "SM", accent: "#b97b5d", preview: "明日の朝、話せる？", time: "10:42", unread: 2, online: true },
  { id: "min", name: "Min Thant", username: "@minthant", initials: "MT", accent: "#6e9b69", preview: "The moss design is perfect.", time: "09:18", online: true },
  { id: "elena", name: "Elena Voss", username: "@elenavoss", initials: "EV", accent: "#8b789c", preview: "Sent a photo", time: "Tue" },
  { id: "noah", name: "Noah Reed", username: "@noahreed", initials: "NR", accent: "#b98a55", preview: "See you in the grove.", time: "Mon" },
];

const initialMessages: Message[] = [
  { id: 1, from: "them", text: "明日の朝、話せる？", translated: "မနက်ဖြန်မနက် စကားပြောလို့ရမလား?", time: "10:39" },
  { id: 2, from: "me", text: "ရပါတယ်။ မနက် ၉ နာရီလောက်ဆို အဆင်ပြေတယ်။", time: "10:40" },
  { id: 3, from: "them", text: "よかった。新しい Raven Chat ကိုလည်း ပြမယ်။", translated: "ကောင်းတယ်။ Raven Chat အသစ်ကိုလည်း ပြမယ်။", time: "10:42" },
];

const navItems: Array<{ id: NavKey; label: string; caption: string; icon: typeof MessageCircle }> = [
  { id: "chat", label: "Chats", caption: "Your conversations", icon: MessageCircle },
  { id: "profile", label: "Profile", caption: "Your identity", icon: UserRound },
  { id: "settings", label: "Settings", caption: "Make it yours", icon: Settings },
  { id: "ai", label: "Raven AI", caption: "A quiet mind to ask", icon: Sparkles },
];

function RavenMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <div className={`${dimensions} relative grid shrink-0 place-items-center overflow-hidden rounded-[26%] border border-[#b4d381]/35 bg-[#0c1915] shadow-[0_10px_26px_rgba(0,0,0,.24)]`} aria-label="Raven Chat logo">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_20%,rgba(199,235,141,.35),transparent_28%),linear-gradient(145deg,#1e5039,#08120f_68%)]" />
      <div className="relative h-[68%] w-[68%] -rotate-6 text-[#b6db7a]">
        <svg viewBox="0 0 80 80" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 28C25 15 48 10 62 22L70 31L58 31C65 38 63 53 52 62C48 65 39 67 34 65L37 56C30 59 20 56 16 50C13 45 14 37 20 33L17 28Z" fill="currentColor" opacity=".9" />
          <path d="M27 32C34 25 44 23 55 28C49 28 44 30 40 34C35 39 32 45 32 51" stroke="#0d2119" strokeWidth="4" strokeLinecap="round" />
          <path d="M55 29L69 20L62 35" fill="#8bb65e" />
          <circle cx="49" cy="32" r="2.8" fill="#0b1914" />
          <path d="M24 49C18 57 12 60 8 59C14 54 16 49 17 44" stroke="#8bb65e" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-[#b6db7a] shadow-[0_0_8px_#b6db7a]" />
    </div>
  );
}

function Avatar({ conversation, size = "md", online = false }: { conversation: Pick<Conversation, "initials" | "accent">; size?: "sm" | "md" | "lg"; online?: boolean }) {
  const sizeClass = size === "lg" ? "h-16 w-16 text-lg" : size === "sm" ? "h-9 w-9 text-[11px]" : "h-11 w-11 text-xs";
  return (
    <div className="relative shrink-0">
      <div className={`${sizeClass} grid place-items-center rounded-[30%] font-semibold text-[#1c211b] shadow-inner`} style={{ background: `linear-gradient(145deg, ${conversation.accent}, #d5c48d)` }}>
        {conversation.initials}
      </div>
      {online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#12241d] bg-[#a9d779]" />}
    </div>
  );
}

function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`wood-panel moss-speckle overflow-hidden rounded-[24px] border border-[#9abc6d]/15 shadow-[0_18px_46px_rgba(0,0,0,.19)] ${className}`}>{children}</section>;
}

function LoginScreen({ onLogin }: { onLogin: (name: string) => void }) {
  const [email, setEmail] = useState("admin@raven.chat");
  const [password, setPassword] = useState("raven-demo");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      onLogin(email.split("@")[0] || "raven");
      toast.success("Welcome back to the grove");
      setLoading(false);
    }, 500);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1813] px-5 py-8 text-[#edf2e6]">
      <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_15%_25%,rgba(119,157,78,.18),transparent_22%),radial-gradient(circle_at_84%_74%,rgba(82,117,67,.2),transparent_24%),linear-gradient(120deg,#10251d,#07100d_60%,#1a2d1f)]" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full border border-[#8daf65]/10 bg-[#829f4a]/5 blur-2xl" />
      <div className="absolute -right-20 bottom-0 h-[32rem] w-[32rem] rounded-full border border-[#8daf65]/10 bg-[#526f3c]/10 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[34px] border border-[#bad88b]/15 bg-[#11231c]/88 shadow-[0_28px_90px_rgba(0,0,0,.44)] backdrop-blur-xl lg:grid-cols-[1.03fr_.97fr]">
        <div className="relative hidden min-h-[650px] overflow-hidden border-r border-[#bad88b]/10 lg:block">
          <div className="absolute inset-0 opacity-75 wood-panel" />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,29,20,.08),rgba(9,18,13,.88))]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-3"><RavenMark size="sm" /><div><div className="font-display text-2xl font-semibold tracking-wide">Raven Chat</div><div className="text-[10px] uppercase tracking-[.28em] text-[#a6c77b]">A quieter way to connect</div></div></div>
            <div>
              <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[.3em] text-[#b3ce88]"><Leaf className="h-4 w-4" /> Enter the grove</div>
              <h1 className="max-w-sm font-display text-6xl leading-[.9] text-[#f2e8d1]">Messages that feel like <span className="text-[#b5d77b]">home.</span></h1>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#c1cbb8]">A private corner for conversations, slow mornings, and the people you never want to lose.</p>
            </div>
            <div className="flex gap-3 text-xs text-[#8ea48c]"><span className="rounded-full border border-[#b5d77b]/20 px-3 py-2">Private by design</span><span className="rounded-full border border-[#b5d77b]/20 px-3 py-2">Built for presence</span></div>
          </div>
        </div>
        <div className="flex items-center px-6 py-10 sm:px-12 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-9 flex items-center gap-3 lg:hidden"><RavenMark size="sm" /><div><div className="font-display text-2xl font-semibold">Raven Chat</div><div className="text-[10px] uppercase tracking-[.24em] text-[#a6c77b]">The grove is open</div></div></div>
            <div className="mb-8"><p className="mb-3 text-xs font-semibold uppercase tracking-[.28em] text-[#a5c476]">Admin access</p><h2 className="font-display text-5xl leading-none text-[#f3ead7]">Welcome back.</h2><p className="mt-4 text-sm leading-6 text-[#aab9a8]">Sign in to your quiet place for conversations.</p></div>
            <form onSubmit={submit} className="space-y-5">
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[.15em] text-[#a6b7a2]">Email address</span><div className="relative"><UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72915c]" /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="focus-ring w-full rounded-2xl border border-[#a5c477]/15 bg-[#0a1914]/70 px-11 py-3.5 text-sm text-[#edf2e6] outline-none transition focus:border-[#a5c477]/55" placeholder="you@raven.chat" /></div></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[.15em] text-[#a6b7a2]">Password</span><div className="relative"><Shield className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72915c]" /><input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} className="focus-ring w-full rounded-2xl border border-[#a5c477]/15 bg-[#0a1914]/70 px-11 py-3.5 pr-12 text-sm text-[#edf2e6] outline-none transition focus:border-[#a5c477]/55" placeholder="Your password" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((v) => !v)} className="focus-ring absolute right-4 top-1/2 -translate-y-1/2 text-[#789966] hover:text-[#c6e893]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
              <div className="flex items-center justify-between text-xs"><button type="button" className="flex items-center gap-2 text-[#aebfa6]" onClick={() => setRemember((v) => !v)}><span className={`grid h-4 w-4 place-items-center rounded-md border transition ${remember ? "border-[#a9ce76] bg-[#90b661] text-[#132219]" : "border-[#8ca57e]/30"}`}>{remember && <Check className="h-3 w-3" />}</span> Remember this device</button><button type="button" onClick={() => toast("Ask the owner to reset your Raven access.")} className="text-[#b4d27f] hover:text-[#d5efaa]">Forgot password?</button></div>
              <button disabled={loading} className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#a8ca73] px-5 py-3.5 text-sm font-bold text-[#172318] shadow-[0_10px_25px_rgba(128,166,76,.18)] transition hover:bg-[#c3e390] active:scale-[.98] disabled:opacity-70">{loading ? "Opening the grove…" : "Enter Raven Chat"}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
            </form>
            <div className="mt-9 flex items-center gap-3 text-[11px] text-[#718979]"><div className="h-px flex-1 bg-[#aac779]/10" /><span>encrypted conversations</span><div className="h-px flex-1 bg-[#aac779]/10" /></div>
          </div>
        </div>
      </div>
    </main>
  );
}

function EmptyChat() {
  return <div className="flex h-full min-h-[460px] flex-col items-center justify-center px-8 text-center"><div className="mb-6 grid h-20 w-20 place-items-center rounded-[30%] border border-[#bad889]/20 bg-[#bad889]/8 text-[#acd27b]"><MessageCircle className="h-9 w-9" /></div><h3 className="font-display text-4xl text-[#f0e5cc]">Choose a conversation</h3><p className="mt-3 max-w-sm text-sm leading-6 text-[#a7b6a5]">A small hello can become a whole world. Pick a chat from the left to begin.</p></div>;
}

function ChatView({ currentConversation, onBack }: { currentConversation: Conversation; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [showTranslation, setShowTranslation] = useState(true);
  const [translatedIds, setTranslatedIds] = useState<number[]>([1, 3]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((items) => [...items, { id: Date.now(), from: "me", text, time: "now" }]);
    setDraft("");
    window.setTimeout(() => setMessages((items) => [...items, { id: Date.now() + 1, from: "them", text: "ရောက်ပြီ။ ခဏနေရင် ပြန်ပြောမယ် 🌿", time: "now" }]), 800);
  };

  const translate = (message: Message) => {
    if (translatedIds.includes(message.id)) {
      setTranslatedIds((ids) => ids.filter((id) => id !== message.id));
    } else {
      setTranslatedIds((ids) => [...ids, message.id]);
      toast.success("Translation shown in Burmese");
    }
  };

  return <div className="flex h-full min-h-0 flex-col">
    <div className="flex items-center justify-between border-b border-[#c0dd94]/10 bg-[#10231c]/80 px-4 py-3 sm:px-6"><div className="flex min-w-0 items-center gap-3"><button onClick={onBack} className="focus-ring rounded-xl p-2 text-[#a4b99d] hover:bg-white/5 md:hidden"><ArrowRight className="h-4 w-4 rotate-180" /></button><Avatar conversation={currentConversation} online={currentConversation.online} /><div className="min-w-0"><div className="truncate text-sm font-semibold text-[#f2e8d3]">{currentConversation.name}</div><div className="flex items-center gap-1.5 text-[11px] text-[#91b069]"><span className="h-1.5 w-1.5 rounded-full bg-[#a9d77b]" /> {currentConversation.online ? "in the grove now" : "last seen recently"}</div></div></div><div className="flex items-center gap-1"><button className="focus-ring rounded-xl p-2 text-[#8da58b] hover:bg-white/5 hover:text-[#d5eaa9]" onClick={() => toast("Search within this conversation") }><Search className="h-4 w-4" /></button><button className="focus-ring rounded-xl p-2 text-[#8da58b] hover:bg-white/5 hover:text-[#d5eaa9]" onClick={() => toast("Conversation details coming next") }><MoreHorizontal className="h-5 w-5" /></button></div></div>
    <div className="flex items-center justify-between border-b border-[#c0dd94]/8 bg-[#172c22]/60 px-4 py-2.5 text-[11px] sm:px-6"><div className="flex items-center gap-2 text-[#9faf95]"><Languages className="h-3.5 w-3.5 text-[#accf77]" /> Translation is on <span className="text-[#7f977e]">· Burmese</span></div><button onClick={() => setShowTranslation((v) => !v)} className={`rounded-full px-2.5 py-1 font-semibold transition ${showTranslation ? "bg-[#9ec46d]/15 text-[#bce28a]" : "bg-white/5 text-[#819581]"}`}>{showTranslation ? "ON" : "OFF"}</button></div>
    <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto mb-6 flex max-w-md items-center gap-3 text-[10px] uppercase tracking-[.2em] text-[#758d78]"><div className="h-px flex-1 bg-[#aecb7c]/10" /> Today <div className="h-px flex-1 bg-[#aecb7c]/10" /></div>
      {messages.map((message) => { const mine = message.from === "me"; const isTranslated = translatedIds.includes(message.id); return <div key={message.id} className={`flex animate-float-in ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] sm:max-w-[72%] ${mine ? "items-end" : "items-start"}`}><div className={`rounded-[20px] px-4 py-3 text-sm leading-6 shadow-sm ${mine ? "rounded-br-md bg-[#9fbe69] text-[#172217]" : "rounded-bl-md border border-[#d6af73]/18 bg-[#3a2418] text-[#f2e8d4]"}`}><div>{message.text}</div>{showTranslation && message.translated && isTranslated && <div className={`mt-2 border-t pt-2 text-xs leading-5 ${mine ? "border-[#28451f]/20 text-[#385235]" : "border-[#e4c48e]/15 text-[#c5cda9]"}`}><span className="mr-1 text-[9px] font-bold uppercase tracking-wider opacity-70">tran</span>{message.translated}</div>}</div><div className={`mt-1.5 flex items-center gap-2 text-[10px] text-[#829a84] ${mine ? "justify-end" : "justify-start"}`}><span>{message.time}</span>{message.translated && <button onClick={() => translate(message)} className="font-semibold text-[#abc978] hover:text-[#d4eea6]">{isTranslated ? "hide tran" : "tran"}</button>}{mine && <Check className="h-3 w-3 text-[#9fc76b]" />}</div></div></div>; })}
    </div>
    <div className="border-t border-[#c0dd94]/10 bg-[#10231c]/80 p-3 sm:p-4"><div className="flex items-end gap-2 rounded-[18px] border border-[#c8dd9b]/15 bg-[#07130f]/65 p-2"><button className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#91aa7c] hover:bg-white/5 hover:text-[#cae799]" onClick={() => toast("Attach a file in the next build") }><Paperclip className="h-4 w-4" /></button><textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} rows={1} placeholder="Write a message…" className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-[#e8efde] outline-none placeholder:text-[#6e866f]" /><button className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition active:scale-95 ${draft.trim() ? "bg-[#a8ce74] text-[#142217] hover:bg-[#c3e894]" : "text-[#6f886f]"}`} onClick={sendMessage}><Send className="h-4 w-4" /></button></div><div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[#657d69]"><span>Enter to send · Shift + Enter for a new line</span><span className="flex items-center gap-1"><Shield className="h-3 w-3" /> private</span></div></div>
  </div>;
}

function ChatList({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = conversations.filter((item) => `${item.name} ${item.username} ${item.preview}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="flex h-full min-h-0 flex-col"><div className="border-b border-[#c0dd94]/10 p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#9fbd6d]">Your grove</p><h1 className="mt-1 font-display text-4xl text-[#f2e8d1]">Messages</h1></div><button className="focus-ring grid h-10 w-10 place-items-center rounded-xl border border-[#b9d988]/15 bg-[#b6d37a]/8 text-[#b3d47c] hover:bg-[#b6d37a]/15" onClick={() => toast("New conversation flow is next") }><Plus className="h-5 w-5" /></button></div><div className="relative mt-5"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d886e]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a conversation" className="focus-ring w-full rounded-2xl border border-[#abc97a]/12 bg-[#0b1813]/65 py-3 pl-10 pr-3 text-xs text-[#ebf0e1] outline-none placeholder:text-[#6b836c]" /></div></div><div className="flex-1 overflow-y-auto p-3 sm:p-4">{filtered.length ? filtered.map((item) => <button key={item.id} onClick={() => onSelect(item.id)} className={`focus-ring mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selectedId === item.id ? "bg-[#a8cd73]/12 shadow-inner" : "hover:bg-white/[.035]"}`}><Avatar conversation={item} online={item.online} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-[#e7eddc]">{item.name}</span><span className="shrink-0 text-[10px] text-[#708770]">{item.time}</span></div><div className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-xs text-[#829682]">{item.preview}</span>{item.unread && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#a8ce74] px-1 text-[10px] font-bold text-[#192619]">{item.unread}</span>}</div></div></button>) : <div className="px-4 py-10 text-center text-sm text-[#829682]">No mossy trail found.</div>}</div><div className="border-t border-[#c0dd94]/10 p-4"><div className="flex items-center gap-3 rounded-2xl border border-[#c9dd9f]/10 bg-[#0c1914]/40 p-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#a8cd73]/12 text-[#b7db81]"><UsersRound className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="text-xs font-semibold text-[#dbe6d1]">Invite your circle</div><div className="mt-0.5 text-[10px] text-[#7c947e]">Bring someone into the grove</div></div><ArrowRight className="h-4 w-4 text-[#78966e]" /></div></div></div>;
}

function ProfileView({ displayName, onNameChange }: { displayName: string; onNameChange: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName === "admin" ? "Raven Admin" : displayName);
  const [username, setUsername] = useState("ravenkeeper");
  const save = () => { onNameChange(name); setEditing(false); toast.success("Profile updated"); };
  return <div className="h-full overflow-y-auto p-5 sm:p-8"><div className="mx-auto max-w-3xl"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#a3c574]">Your identity</p><h1 className="mt-1 font-display text-5xl text-[#f3e8d1]">Profile</h1><p className="mt-2 text-sm text-[#98ac95]">Leave a little light wherever you go.</p></div><button onClick={() => setEditing((v) => !v)} className="flex items-center gap-2 rounded-xl border border-[#c6da9a]/15 bg-[#b2d47b]/8 px-3 py-2 text-xs font-semibold text-[#badf88] hover:bg-[#b2d47b]/15"><Edit3 className="h-3.5 w-3.5" /> {editing ? "Cancel" : "Edit profile"}</button></div><Surface className="p-5 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="relative"><Avatar conversation={{ initials: "RA", accent: "#a5be69" }} size="lg" online /><button onClick={() => toast("Avatar upload is ready for the storage phase") } className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl border-4 border-[#352217] bg-[#a6cc72] text-[#1b281b]"><ImagePlus className="h-4 w-4" /></button></div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-4xl text-[#f2e7d0]">{name || "Raven Admin"}</h2><span className="rounded-full border border-[#b3d17c]/20 bg-[#b3d17c]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#b9dc87]">admin</span></div><p className="mt-1 text-sm text-[#a4b29d]">@{username} · in the grove since 2026</p><p className="mt-4 max-w-lg text-sm leading-6 text-[#d3ceb6]">Building small corners of the internet where people can be present, kind, and a little more human.</p></div></div>{editing && <div className="mt-8 grid gap-4 border-t border-[#d6be8a]/10 pt-6 sm:grid-cols-2"><label className="text-xs text-[#a2b198]">Display name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d2c08f]/15 bg-[#1b130f]/40 px-3 py-3 text-sm text-[#eee7d4] outline-none focus:border-[#b6d47b]/45" /></label><label className="text-xs text-[#a2b198]">Username<input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d2c08f]/15 bg-[#1b130f]/40 px-3 py-3 text-sm text-[#eee7d4] outline-none focus:border-[#b6d47b]/45" /></label><div className="sm:col-span-2"><button onClick={save} className="rounded-xl bg-[#a8cb72] px-4 py-2.5 text-xs font-bold text-[#1b2819] hover:bg-[#c4e593]">Save changes</button></div></div>}</Surface><div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><Surface className="p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-display text-3xl text-[#f0e3c7]">My Day</h3><p className="mt-1 text-xs text-[#99aa91]">Little notes from your day</p></div><button className="grid h-9 w-9 place-items-center rounded-xl bg-[#a8cd73]/10 text-[#b6da7d]" onClick={() => toast("My Day composer is next") }><Plus className="h-4 w-4" /></button></div><div className="rounded-2xl border border-[#d8bd81]/12 bg-[#1e1610]/40 p-4"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[#a3c373]"><Clock3 className="h-3.5 w-3.5" /> Today · 08:21</div><p className="mt-3 font-display text-2xl leading-tight text-[#eadfca]">“Slow days are still moving forward.”</p><p className="mt-3 text-xs leading-5 text-[#a7a58e]">A quiet reminder for whoever needs it.</p><div className="mt-4 flex items-center gap-2 text-[10px] text-[#829378]"><span className="rounded-full bg-[#a8cd73]/10 px-2 py-1 text-[#b3d57e]">12 moss hearts</span><span>·</span><span>3 replies</span></div></div></Surface><Surface className="p-6"><h3 className="font-display text-3xl text-[#f0e3c7]">Presence</h3><div className="mt-5 space-y-4"><div><div className="flex justify-between text-xs"><span className="text-[#9caa91]">People reached</span><span className="font-semibold text-[#c3df91]">48</span></div><div className="mt-2 h-1.5 rounded-full bg-[#182b20]"><div className="h-full w-[68%] rounded-full bg-[#98be65]" /></div></div><div><div className="flex justify-between text-xs"><span className="text-[#9caa91]">Conversations</span><span className="font-semibold text-[#c3df91]">16</span></div><div className="mt-2 h-1.5 rounded-full bg-[#182b20]"><div className="h-full w-[43%] rounded-full bg-[#bd8b54]" /></div></div><p className="border-t border-[#d6be8a]/10 pt-4 text-xs leading-5 text-[#a29f88]">Your grove is a little warmer because you showed up today.</p></div></Surface></div></div></div>;
}

function SettingsView({ theme, setTheme }: { theme: ThemeMode; setTheme: (theme: ThemeMode) => void }) {
  const [notifications, setNotifications] = useState(true);
  const [receipts, setReceipts] = useState(true);
  const [transcription, setTranscription] = useState(true);
  const [language, setLanguage] = useState("Burmese");
  const Toggle = ({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) => <button onClick={() => onChange(!value)} aria-label="Toggle setting" className={`relative h-6 w-11 rounded-full transition ${value ? "bg-[#a5ca70]" : "bg-[#2a3c2d]"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-[#f1e7ce] shadow transition ${value ? "left-6" : "left-1"}`} /></button>;
  return <div className="h-full overflow-y-auto p-5 sm:p-8"><div className="mx-auto max-w-3xl"><div className="mb-8"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#a3c574]">Make it yours</p><h1 className="mt-1 font-display text-5xl text-[#f3e8d1]">Settings</h1><p className="mt-2 text-sm text-[#98ac95]">Soft edges, clear boundaries, your way.</p></div><div className="space-y-5"><Surface className="p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#a9cc73]/10 text-[#b6d87e]"><Sun className="h-5 w-5" /></div><div><h2 className="font-display text-2xl text-[#efe2c5]">Appearance</h2><p className="text-xs text-[#99a995]">Choose the light around your conversations</p></div></div><div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-[#c9db9b]/10 bg-[#101b15]/50 p-1.5">{(["light", "dark", "auto"] as ThemeMode[]).map((item) => <button key={item} onClick={() => { setTheme(item); toast(`${item[0].toUpperCase()}${item.slice(1)} mode selected`); }} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${theme === item ? "bg-[#a8cc73] text-[#172319]" : "text-[#92a48d] hover:bg-white/5"}`}>{item === "light" ? <Sun className="h-3.5 w-3.5" /> : item === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Compass className="h-3.5 w-3.5" />}{item[0].toUpperCase() + item.slice(1)}</button>)}</div></Surface><Surface className="divide-y divide-[#d1bb84]/10"><div className="flex items-center gap-4 p-6"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#a9cc73]/10 text-[#b6d87e]"><Bell className="h-5 w-5" /></div><div className="flex-1"><h2 className="font-display text-2xl text-[#efe2c5]">Notifications</h2><p className="text-xs text-[#99a995]">Keep the important pings, lose the noise.</p></div><Toggle value={notifications} onChange={setNotifications} /></div><div className="flex items-center gap-4 p-6"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#a9cc73]/10 text-[#b6d87e]"><Check className="h-5 w-5" /></div><div className="flex-1"><h2 className="font-display text-2xl text-[#efe2c5]">Read receipts</h2><p className="text-xs text-[#99a995]">Let people know when you have read their message.</p></div><Toggle value={receipts} onChange={setReceipts} /></div><div className="flex items-center gap-4 p-6"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#a9cc73]/10 text-[#b6d87e]"><Languages className="h-5 w-5" /></div><div className="flex-1"><h2 className="font-display text-2xl text-[#efe2c5]">Transcription language</h2><p className="text-xs text-[#99a995]">Tap “tran” below a message to see your chosen language.</p><select value={language} onChange={(e) => { setLanguage(e.target.value); toast.success(`Translation language: ${e.target.value}`); }} className="mt-3 rounded-xl border border-[#c9db9b]/15 bg-[#101b15]/70 px-3 py-2 text-xs text-[#e9e6d1] outline-none"><option>Burmese</option><option>English</option><option>Japanese</option><option>Korean</option><option>Thai</option></select></div><Toggle value={transcription} onChange={setTranscription} /></div></Surface><Surface className="p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#a9cc73]/10 text-[#b6d87e]"><Zap className="h-5 w-5" /></div><div><h2 className="font-display text-2xl text-[#efe2c5]">Chat atmosphere</h2><p className="text-xs text-[#99a995]">Current style · Old Wood / Moss</p></div></div><div className="mt-5 flex gap-3"><button className="relative h-16 flex-1 overflow-hidden rounded-2xl border-2 border-[#b6d87e] wood-grain"><span className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-wider text-[#f4e5c6]">Old wood</span></button><button onClick={() => toast("More themes are growing soon") } className="relative h-16 flex-1 overflow-hidden rounded-2xl border border-[#c6da9a]/15 bg-[#25382b]"><span className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-wider text-[#b8cd99]">More soon</span></button></div></Surface><button onClick={() => toast("You are signed out of this demo session") } className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c68066]/20 bg-[#5d2e24]/10 px-5 py-3 text-xs font-bold text-[#d99a7e] hover:bg-[#6b3428]/25"><LogOut className="h-4 w-4" /> Sign out</button></div></div></div>;
}

function AiView() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ from: "ai" | "me"; text: string }>>([{ from: "ai", text: "Hello from the quiet side of the grove. I’m Raven AI — ask me to think, explain, plan, or simply keep you company." }]);
  const askRaven = trpc.ravenAi.ask.useMutation();
  const suggestions = ["Help me write a kind reply", "Explain something simply", "Plan a calm day"];
  const ask = async (value = prompt) => { const text = value.trim(); if (!text) return; setMessages((items) => [...items, { from: "me", text }]); setPrompt(""); try { const result = await askRaven.mutateAsync({ prompt: text }); setMessages((items) => [...items, { from: "ai", text: result.text }]); } catch { setMessages((items) => [...items, { from: "ai", text: text.toLowerCase().includes("reply") ? "Try this: “That sounds good to me. Thanks for letting me know — I’ll be there.” It keeps the warmth without over-explaining." : text.toLowerCase().includes("plan") ? "A gentle plan: one important thing before noon, one nourishing break, and one small thing that makes you feel like yourself. The rest can stay for tomorrow." : "I can help with ideas, writing, language, planning, and reflection. I can’t help access accounts, passwords, private data, or anything that could harm someone." }]); } };
  return <div className="flex h-full min-h-0 flex-col p-5 sm:p-8"><div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#a3c574]">A quiet mind to ask</p><h1 className="mt-1 font-display text-5xl text-[#f3e8d1]">Raven AI</h1><p className="mt-2 text-sm text-[#98ac95]">Thoughtful help, with boundaries.</p></div><div className="hidden items-center gap-2 rounded-full border border-[#b9d988]/15 bg-[#b6d37a]/8 px-3 py-2 text-[10px] text-[#b7d884] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#b6d884]" /> {askRaven.isPending ? "thinking" : "online"}</div></div><Surface className="flex min-h-0 flex-1 flex-col"><div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-8">{messages.map((message, index) => <div key={`${message.from}-${index}`} className={`flex gap-3 ${message.from === "me" ? "justify-end" : "justify-start"}`}>{message.from === "ai" && <RavenMark size="sm" />}<div className={`max-w-[86%] rounded-[20px] px-4 py-3 text-sm leading-6 ${message.from === "me" ? "rounded-br-md bg-[#a8ca73] text-[#1a281a]" : "rounded-bl-md border border-[#d5b67e]/16 bg-[#3c2519] text-[#f0e2c7]"}`}>{message.text}</div></div>)}</div><div className="border-t border-[#d5b77d]/10 p-4 sm:p-5"><div className="mb-3 flex flex-wrap gap-2">{suggestions.map((item) => <button key={item} onClick={() => void ask(item)} className="rounded-full border border-[#b9d988]/15 bg-[#b6d37a]/7 px-3 py-1.5 text-[10px] text-[#b4ca9d] hover:bg-[#b6d37a]/15">{item}</button>)}</div><div className="flex items-end gap-2 rounded-[18px] border border-[#c8dd9b]/15 bg-[#07130f]/65 p-2"><textarea rows={1} value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void ask(); } }} placeholder="Ask Raven anything within the grove…" className="min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#e8efde] outline-none placeholder:text-[#6e866f]" /><button disabled={askRaven.isPending} onClick={() => void ask()} className="grid h-9 w-9 place-items-center rounded-xl bg-[#a8ce74] text-[#142217] hover:bg-[#c3e894] disabled:opacity-50"><Send className="h-4 w-4" /></button></div><div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#718a72]"><CircleHelp className="h-3 w-3" /> Raven AI will never help with account access, passwords, private data, or harmful instructions.</div></div></Surface></div></div>;
}

function Dashboard({ displayName, onLogout }: { displayName: string; onLogout: () => void }) {
  const [active, setActive] = useState<NavKey>("chat");
  const [selectedId, setSelectedId] = useState("sakura");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [profileName, setProfileName] = useState(displayName);
  const currentConversation = useMemo(() => conversations.find((item) => item.id === selectedId) ?? conversations[0], [selectedId]);
  const activeItem = navItems.find((item) => item.id === active);
  return <div className="raven-app min-h-screen bg-[#0b1813] text-[#ebf0e1]" data-theme={theme === "auto" ? "dark" : theme}><div className="flex min-h-screen"><aside className={`fixed inset-y-0 left-0 z-30 flex w-[280px] shrink-0 flex-col border-r border-[#b8d583]/10 bg-[#0d1c16]/95 p-5 backdrop-blur-xl transition-transform md:static md:translate-x-0 ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}><div className="flex items-center gap-3 px-2"><RavenMark size="sm" /><div><div className="font-display text-2xl font-semibold tracking-wide text-[#eef0dd]">Raven Chat</div><div className="text-[9px] uppercase tracking-[.26em] text-[#94b366]">The grove is open</div></div><button onClick={() => setMobileMenu(false)} className="ml-auto rounded-lg p-1 text-[#7e967f] md:hidden"><X className="h-4 w-4" /></button></div><div className="my-8 h-px bg-[#bad98b]/10" /><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.24em] text-[#698466]">Navigate</div><nav className="space-y-1">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setActive(item.id); setMobileMenu(false); }} className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active === item.id ? "bg-[#a7cb71]/12 text-[#c5e597]" : "text-[#8ca18b] hover:bg-white/[.035] hover:text-[#d2e2bf]"}`}><span className={`grid h-9 w-9 place-items-center rounded-xl transition ${active === item.id ? "bg-[#a7cb71]/15 text-[#b6db80]" : "bg-[#b4d17a]/5 text-[#71906d] group-hover:text-[#b5d27f]"}`}><Icon className="h-4 w-4" /></span><span className="flex-1"><span className="block text-sm font-semibold">{item.label}</span><span className="mt-0.5 block text-[10px] text-[#6f876f]">{item.caption}</span></span>{item.id === "chat" && <span className="h-2 w-2 rounded-full bg-[#a7d177] shadow-[0_0_7px_#a7d177]" />}</button>; })}</nav><div className="mt-auto"><div className="mb-4 rounded-2xl border border-[#b8d583]/10 bg-[#b8d583]/5 p-4"><div className="flex items-center gap-2 text-[#bada86]"><Leaf className="h-4 w-4" /><span className="text-xs font-semibold">Your grove is calm</span></div><p className="mt-2 text-[11px] leading-5 text-[#80967d]">4 conversations are waiting for your light.</p></div><button onClick={() => { setActive("profile"); setMobileMenu(false); }} className="flex w-full items-center gap-3 rounded-2xl border border-[#b7d284]/10 bg-[#b7d284]/5 p-3 text-left hover:bg-[#b7d284]/10"><Avatar conversation={{ initials: "RA", accent: "#a5be69" }} online size="sm" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[#dae7ce]">{profileName === "admin" ? "Raven Admin" : profileName}</span><span className="block text-[10px] text-[#7d967d]">@ravenkeeper</span></span><ChevronDown className="h-4 w-4 rotate-[-90deg] text-[#708b70]" /></button></div></aside>{mobileMenu && <button aria-label="Close navigation" onClick={() => setMobileMenu(false)} className="fixed inset-0 z-20 bg-black/50 md:hidden" />}
      <main className="min-w-0 flex-1"><header className="flex h-[76px] items-center justify-between border-b border-[#b8d583]/10 bg-[#0d1b15]/80 px-4 backdrop-blur-xl sm:px-6"><div className="flex items-center gap-3"><button onClick={() => setMobileMenu(true)} className="focus-ring grid h-10 w-10 place-items-center rounded-xl border border-[#b8d583]/10 text-[#a5bc93] md:hidden"><Menu className="h-5 w-5" /></button><div className="md:hidden"><div className="font-display text-2xl text-[#efe7d3]">{activeItem?.label}</div></div><div className="hidden items-center gap-2 text-xs text-[#759075] md:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#a8d176]" /> Everything is growing quietly</div></div><div className="flex items-center gap-2"><button onClick={() => toast("You are all caught up") } className="focus-ring relative grid h-10 w-10 place-items-center rounded-xl border border-[#b8d583]/10 text-[#8fa78c] hover:bg-white/5"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c2df84]" /></button><button onClick={onLogout} className="focus-ring hidden items-center gap-2 rounded-xl border border-[#b8d583]/10 px-3 py-2 text-xs font-semibold text-[#91a88c] hover:bg-white/5 sm:flex"><LogOut className="h-3.5 w-3.5" /> Leave grove</button></div></header><div className="h-[calc(100vh-76px)] min-h-0">{active === "chat" && <div className="grid h-full min-h-0 md:grid-cols-[330px_minmax(0,1fr)] xl:grid-cols-[370px_minmax(0,1fr)]"><div className="min-h-0 border-r border-[#b8d583]/10"><ChatList selectedId={selectedId} onSelect={setSelectedId} /></div><div className="hidden min-h-0 md:block"><ChatView currentConversation={currentConversation} onBack={() => undefined} /></div><div className="block min-h-0 md:hidden"><ChatView currentConversation={currentConversation} onBack={() => setActive("chat")} /></div></div>}{active === "profile" && <ProfileView displayName={profileName} onNameChange={setProfileName} />}{active === "settings" && <SettingsView theme={theme} setTheme={setTheme} />}{active === "ai" && <AiView />}</div></main></div></div>;
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("admin");
  return loggedIn ? <Dashboard displayName={displayName} onLogout={() => { setLoggedIn(false); toast("You have left the grove"); }} /> : <LoginScreen onLogin={(name) => { setDisplayName(name); setLoggedIn(true); }} />;
}
