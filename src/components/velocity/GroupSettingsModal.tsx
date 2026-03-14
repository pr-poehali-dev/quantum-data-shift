import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Chat {
  id: string;
  name: string;
  photo?: string | null;
  members?: string[];
}

interface Props {
  chat: Chat;
  onSave: (name: string, photo: string | null) => void;
  onClose: () => void;
}

export default function GroupSettingsModal({ chat, onSave, onClose }: Props) {
  const [name, setName] = useState(chat.name);
  const [photo, setPhoto] = useState<string | null>(chat.photo || null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2b2d31] rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Настройки группы</h2>
          <button onClick={onClose} className="text-[#b9bbbe] hover:text-white"><Icon name="X" size={20} /></button>
        </div>

        {/* Фото группы */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 rounded-full bg-[#5865f2] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group">
            {photo
              ? <img src={photo} className="w-full h-full object-cover" alt="" />
              : <Icon name="Users" size={36} className="text-white" />}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Icon name="Camera" size={24} className="text-white" />
            </div>
          </div>
          <p className="text-[#b9bbbe] text-xs mt-2">Нажми, чтобы изменить фото</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Название */}
        <div className="mb-4">
          <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Название группы</Label>
          <Input value={name} onChange={e => setName(e.target.value)}
            className="mt-1 bg-[#1e1f22] border-[#1e1f22] text-white" />
        </div>

        {/* Участники */}
        {chat.members && (
          <div className="mb-6">
            <Label className="text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide">Участники ({chat.members.length})</Label>
            <div className="mt-2 space-y-2">
              {chat.members.map(m => (
                <div key={m} className="flex items-center gap-2 text-[#dcddde] text-sm">
                  <div className="w-7 h-7 rounded-full bg-[#5865f2] flex items-center justify-center text-xs text-white font-bold">{m[0].toUpperCase()}</div>
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 text-[#b9bbbe] hover:text-white hover:bg-[#383a40]">Отмена</Button>
          <Button onClick={() => onSave(name, photo)} className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] text-white">Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
