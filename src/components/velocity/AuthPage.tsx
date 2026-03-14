import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onAuth: (user: { name: string; tag: string; email: string; avatar: string | null }) => void;
}

const STORAGE_KEY = "velocity_users";

function getUsers(): Record<string, { name: string; tag: string; email: string; password: string; avatar: string | null }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { name: string; tag: string; email: string; password: string; avatar: string | null }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotInfo, setForgotInfo] = useState("");

  function handleLogin() {
    setError("");
    const users = getUsers();
    const u = users[email.toLowerCase()];
    if (!u) { setError("Пользователь не найден"); return; }
    if (u.password !== password) { setError("Неверный пароль"); return; }
    onAuth({ name: u.name, tag: u.tag, email: u.email, avatar: u.avatar });
  }

  function handleRegister() {
    setError("");
    if (!name.trim()) { setError("Введите имя пользователя"); return; }
    if (!tag.trim()) { setError("Введите тег (например: cool123)"); return; }
    if (!email.includes("@")) { setError("Введите корректный email"); return; }
    if (password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    const users = getUsers();
    if (users[email.toLowerCase()]) { setError("Этот email уже зарегистрирован"); return; }
    const newUser = { name: name.trim(), tag: tag.trim().replace(/^#/, ""), email: email.toLowerCase(), password, avatar: null };
    users[email.toLowerCase()] = newUser;
    saveUsers(users);
    onAuth({ name: newUser.name, tag: newUser.tag, email: newUser.email, avatar: null });
  }

  function handleForgot() {
    setError("");
    const users = getUsers();
    const u = users[email.toLowerCase()];
    if (!u) { setError("Пользователь с таким email не найден"); return; }
    setForgotInfo(`Ваш пароль: ${u.password}`);
    setForgotSent(true);
  }

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Лого */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#5865f2] rounded-2xl flex items-center justify-center mb-3">
            <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
              <polygon points="16,3 21,13 18.5,12 18.5,22 16,20.5 13.5,22 13.5,12 11,13" fill="white"/>
              <polygon points="11,13 6,18.5 10.5,16.5 13.5,18.5" fill="#a5b4fc"/>
              <polygon points="21,13 26,18.5 21.5,16.5 18.5,18.5" fill="#a5b4fc"/>
              <rect x="14.2" y="21" width="3.6" height="5" rx="1.8" fill="#a5b4fc"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Velocity</h1>
          <p className="text-[#b9bbbe] text-sm mt-1">Мессенджер нового поколения</p>
        </div>

        {/* Карточка */}
        <div className="bg-[#2b2d31] rounded-2xl p-8 shadow-2xl">
          {mode === "login" && (
            <>
              <h2 className="text-xl font-bold text-white mb-1">С возвращением!</h2>
              <p className="text-[#b9bbbe] text-sm mb-6">Рады снова видеть тебя.</p>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Email</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com"
                    className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-white placeholder:text-[#4e5058] focus:border-[#5865f2] focus:ring-[#5865f2]" />
                </div>
                <div>
                  <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Пароль</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-white placeholder:text-[#4e5058] focus:border-[#5865f2]"
                    onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  <button onClick={() => { setMode("forgot"); setError(""); setForgotSent(false); setForgotInfo(""); }}
                    className="text-[#5865f2] text-xs mt-1 hover:underline">Забыл пароль?</button>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button onClick={handleLogin} className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold py-2.5">
                  Войти
                </Button>
              </div>
              <p className="text-[#b9bbbe] text-sm mt-4">
                Нет аккаунта?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-[#5865f2] hover:underline">Зарегистрироваться</button>
              </p>
            </>
          )}

          {mode === "register" && (
            <>
              <h2 className="text-xl font-bold text-white mb-1">Создать аккаунт</h2>
              <p className="text-[#b9bbbe] text-sm mb-6">Присоединяйся к Velocity!</p>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Имя пользователя</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Алексей"
                    className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-white placeholder:text-[#4e5058]" />
                </div>
                <div>
                  <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Тег (уникальный ID)</Label>
                  <div className="flex mt-1">
                    <span className="bg-[#1e1f22] border border-[#1e1f22] text-[#b9bbbe] px-3 flex items-center rounded-l-md text-sm">#</span>
                    <Input value={tag} onChange={e => setTag(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} placeholder="cool123"
                      className="rounded-l-none bg-[#1e1f22] border-[#1e1f22] text-white placeholder:text-[#4e5058]" />
                  </div>
                </div>
                <div>
                  <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Email</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com"
                    className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-white placeholder:text-[#4e5058]" />
                </div>
                <div>
                  <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Пароль</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Минимум 6 символов"
                    className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-white placeholder:text-[#4e5058]"
                    onKeyDown={e => e.key === "Enter" && handleRegister()} />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button onClick={handleRegister} className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold py-2.5">
                  Зарегистрироваться
                </Button>
              </div>
              <p className="text-[#b9bbbe] text-sm mt-4">
                Уже есть аккаунт?{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-[#5865f2] hover:underline">Войти</button>
              </p>
            </>
          )}

          {mode === "forgot" && (
            <>
              <h2 className="text-xl font-bold text-white mb-1">Восстановление пароля</h2>
              <p className="text-[#b9bbbe] text-sm mb-6">Введи свой email — покажем пароль прямо здесь.</p>
              {!forgotSent ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Email</Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com"
                      className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-white placeholder:text-[#4e5058]"
                      onKeyDown={e => e.key === "Enter" && handleForgot()} />
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <Button onClick={handleForgot} className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold py-2.5">
                    Найти аккаунт
                  </Button>
                </div>
              ) : (
                <div className="bg-[#1e1f22] rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">✉️</div>
                  <p className="text-white font-semibold">Ваши данные</p>
                  <p className="text-[#b9bbbe] text-sm mt-1">Email: <span className="text-white">{email}</span></p>
                  <p className="text-[#b9bbbe] text-sm">{forgotInfo}</p>
                </div>
              )}
              <p className="text-[#b9bbbe] text-sm mt-4">
                <button onClick={() => { setMode("login"); setError(""); }} className="text-[#5865f2] hover:underline">← Назад ко входу</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
