// app/admin/page.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingCards, setPendingCards] = useState<any[]>([]);

  const loginAndFetch = async () => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "GET_PENDING", password }),
    });
    if (res.ok) {
      const data = await res.json();
      setPendingCards(data);
      setIsLoggedIn(true);
    } else {
      alert("Password salah!");
    }
  };

  const handleUpdate = async (id: string, action: "APPROVE" | "REJECT") => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id, password }),
    });
    if (res.ok) {
      setPendingCards(pendingCards.filter(card => card.id !== id));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center space-y-6 max-w-sm mx-auto">
        <h1 className="text-3xl font-sans font-bold">Admin Login</h1>
        <input 
          type="password" 
          placeholder="Enter password..." 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg font-mono focus:outline-none focus:border-indigo-600"
        />
        <Button onClick={loginAndFetch} className="w-full">Masuk</Button>
      </div>
    );
  }

  return (
    <div className="pt-20 space-y-8 pb-20">
      <h1 className="text-3xl font-sans font-bold">Moderasi Postcards</h1>
      <p className="font-mono text-gray-500">Ada {pendingCards.length} kartu yang menunggu persetujuanmu.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingCards.map(card => (
          <Card key={card.id} className="space-y-4">
            <p className="font-[family-name:var(--font-handwriting)] text-2xl leading-relaxed">{card.message}</p>
            <div className="text-sm font-mono text-gray-500 bg-white p-3 rounded border border-gray-100">
              <p>Dari: <span className="font-bold text-gray-800">{card.name}</span></p>
              <p>Email: {card.email || "-"}</p>
              <p>URL: {card.url || "-"}</p>
              <p>Tanggal: {new Date(card.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            {card.stamp_path && <img src={card.stamp_path} alt="Stamp" className="w-20 h-20 object-contain border border-dashed border-gray-300 p-1" />}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button onClick={() => handleUpdate(card.id, "APPROVE")} className="flex-1 bg-green-100 text-green-700 py-2 rounded font-bold hover:bg-green-200 transition">Approve</button>
              <button onClick={() => handleUpdate(card.id, "REJECT")} className="flex-1 bg-red-100 text-red-700 py-2 rounded font-bold hover:bg-red-200 transition">Reject</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}