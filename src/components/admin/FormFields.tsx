
export function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-300 mb-1 block">{label}</label>
      <input
        type={type}
        className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:border-[#5eead4] focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function FieldArea({ label, value, onChange, rows = 3, placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; mono?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-300 mb-1 block">{label}</label>
      <textarea
        className={`w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:border-[#5eead4] focus:outline-none resize-none ${mono ? "font-mono" : ""}`}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function FolderIcon() {
  return (
    <svg className="w-12 h-12 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}