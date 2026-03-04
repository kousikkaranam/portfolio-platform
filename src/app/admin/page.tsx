"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Code2,
  Briefcase,
  FolderKanban,
  Cpu,
  PenLine,
} from "lucide-react";

interface Stats {
  skills: number;
  experiences: number;
  projects: number;
  engineering: number;
  blogs: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    { label: "Skills", count: stats?.skills ?? 0, icon: Code2, color: "text-blue-400" },
    { label: "Experience", count: stats?.experiences ?? 0, icon: Briefcase, color: "text-green-400" },
    { label: "Projects", count: stats?.projects ?? 0, icon: FolderKanban, color: "text-purple-400" },
    { label: "Engineering", count: stats?.engineering ?? 0, icon: Cpu, color: "text-orange-400" },
    { label: "Blog Posts", count: stats?.blogs ?? 0, icon: PenLine, color: "text-pink-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your portfolio content from here.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[#121826] border border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className={card.color} />
              </div>
              <p className="text-2xl font-bold text-white">{card.count}</p>
              <p className="text-sm text-gray-400 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}