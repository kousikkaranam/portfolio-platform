"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
      <div className="bg-[#121826] border border-gray-800 rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          Portfolio Platform
        </h1>
        <p className="text-gray-400 mb-8">
          Sign in to manage your portfolio
        </p>

        <button
          onClick={() => signIn("github", { callbackUrl: "/admin" })}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <Github size={20} />
          Continue with GitHub
        </button>

        <p className="text-gray-500 text-sm mt-6">
          Your GitHub profile will be used to create your portfolio.
        </p>
      </div>
    </div>
  );
}