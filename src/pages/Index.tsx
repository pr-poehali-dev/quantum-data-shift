import { useState, useRef, useEffect } from "react";
import AuthPage from "@/components/velocity/AuthPage";
import MessengerApp from "@/components/velocity/MessengerApp";

export default function Index() {
  const [user, setUser] = useState<null | { name: string; tag: string; email: string; avatar: string | null }>(null);

  if (!user) {
    return <AuthPage onAuth={setUser} />;
  }
  return <MessengerApp user={user} onLogout={() => setUser(null)} />;
}
