
"use client";
import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, folder = "general", className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) upload(f);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
        dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      } ${className}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
      />
      {uploading ? (
        <div className="py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Uploading...</p>
        </div>
      ) : value ? (
        <div className="relative">
          <Image src={value} alt="Preview" width={200} height={200} className="mx-auto rounded-md object-cover" />
          <p className="text-xs text-gray-400 mt-2">Click or drag to replace</p>
        </div>
      ) : (
        <div className="py-8">
          <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m-4 4l4-4 4 4m5 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1m16-4l-3.17-3.17a2 2 0 00-2.83 0L9.83 12.83a2 2 0 01-2.83 0L4 9.83" />
          </svg>
          <p className="text-sm text-gray-500 mt-2">Click or drag image here</p>
        </div>
      )}
    </div>
  );
}