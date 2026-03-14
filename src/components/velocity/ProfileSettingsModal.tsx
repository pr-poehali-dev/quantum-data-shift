import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface User {
  name: string;
  tag: string;
  email: string;
  avatar: string | null;
}

interface Props {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
}

export default function ProfileSettingsModal({ user, onSave, onClose }: Props) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState<string | null>(user.avatar);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2b2d31] rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Мой профиль</h2>
          <button onClick={onClose} className="text-[#b9bbbe] hover:text-white"><Icon name="X" size={20} /></button>
        </div>

        {/* Аватар */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 rounded-full bg-[#5865f2] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group">
            {avatar
              ? <img src={avatar} className="w-full h-full object-cover" alt="" />
              : <span className="text-white font-bold text-3xl">{user.name[0].toUpperCase()}</span>}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Icon name="Camera" size={24} className="text-white" />
            </div>
          </div>
          <p className="text-[#b9bbbe] text-xs mt-2">Нажми, чтобы изменить фото</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Поля */}
        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Имя</Label>
            <Input value={name} onChange={e => setName(e.target.value)}
              className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-white" />
          </div>
          <div>
            <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Тег</Label>
            <Input value={`#${user.tag}`} disabled
              className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-[#b9bbbe] opacity-60" />
          </div>
          <div>
            <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Email</Label>
            <Input value={user.email} disabled
              className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-[#b9bbbe] opacity-60" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 text-[#b9bbbe] hover:text-white hover:bg-[#383a40]">Отмена</Button>
          <Button onClick={() => onSave({ ...user, name, avatar })} className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] text-white">Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
