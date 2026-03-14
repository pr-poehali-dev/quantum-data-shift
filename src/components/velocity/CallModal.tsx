import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  type: "audio" | "video";
  chatName?: string;
  onClose: () => void;
}

export default function CallModal({ type, chatName, onClose }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1e1f22] rounded-3xl p-8 w-80 flex flex-col items-center gap-6 shadow-2xl">
        {/* Аватар */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#5865f2] to-[#eb459e] flex items-center justify-center">
          {type === "video" && !cameraOff ? (
            <div className="w-full h-full rounded-full bg-[#2b2d31] flex items-center justify-center">
              <Icon name="Video" size={36} className="text-[#5865f2]" />
            </div>
          ) : (
            <span className="text-white font-bold text-4xl">{chatName?.[0]?.toUpperCase()}</span>
          )}
        </div>

        <div className="text-center">
          <div className="text-white font-bold text-xl">{chatName}</div>
          <div className="text-[#b9bbbe] text-sm mt-1">
            {type === "video" ? "Видеозвонок" : "Аудиозвонок"} · {fmt(seconds)}
          </div>
        </div>

        {/* Управление */}
        <div className="flex items-center gap-4">
          <button onClick={() => setMuted(!muted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-red-500" : "bg-[#383a40] hover:bg-[#4e5058]"}`}>
            <Icon name={muted ? "MicOff" : "Mic"} size={20} className="text-white" />
          </button>
          {type === "video" && (
            <button onClick={() => setCameraOff(!cameraOff)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${cameraOff ? "bg-red-500" : "bg-[#383a40] hover:bg-[#4e5058]"}`}>
              <Icon name={cameraOff ? "VideoOff" : "Video"} size={20} className="text-white" />
            </button>
          )}
          <button onClick={onClose}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <Icon name="PhoneOff" size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
