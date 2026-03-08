"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2, UserPlus } from "lucide-react";

interface RegistrationRequest {
  id: string;
  email: string;
  name: string | null;
  githubUsername: string | null;
  image: string | null;
  status: string;
  createdAt: string;
}

export default function RegistrationsPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/registrations");
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActing(id);
    await fetch("/api/admin/registrations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    await load();
    setActing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[#5eead4] animate-spin" />
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === "pending");
  const handled = requests.filter((r) => r.status !== "pending");

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Registration Requests</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Approve or reject users who want to create a portfolio on your platform.
        </p>
      </div>

      {pending.length === 0 && handled.length === 0 && (
        <div className="bg-[#121826] border border-gray-800 rounded-xl p-8 text-center">
          <UserPlus className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No registration requests yet.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pending ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((req) => (
              <div key={req.id} className="flex items-center gap-4 bg-[#121826] border border-gray-800 rounded-xl p-4">
                {req.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={req.image} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">
                    {req.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{req.name || "Unknown"}</p>
                  <p className="text-gray-500 text-xs truncate">
                    {req.githubUsername && <span className="text-gray-400">@{req.githubUsername}</span>}
                    {req.githubUsername && " · "}
                    {req.email}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={acting === req.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {acting === req.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "reject")}
                    disabled={acting === req.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X size={13} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {handled.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            History
          </h2>
          <div className="space-y-2">
            {handled.map((req) => (
              <div key={req.id} className="flex items-center gap-4 bg-[#121826] border border-gray-800 rounded-xl p-4 opacity-60">
                {req.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={req.image} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">
                    {req.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{req.name || "Unknown"}</p>
                  <p className="text-gray-500 text-xs truncate">
                    {req.githubUsername && <span className="text-gray-400">@{req.githubUsername}</span>}
                    {req.githubUsername && " · "}
                    {req.email}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  req.status === "approved"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {req.status === "approved" ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
