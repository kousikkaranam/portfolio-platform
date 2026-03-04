export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 text-lg mb-6">This portfolio doesn&apos;t exist yet.</p>
        <a href="/" className="text-[#5eead4] hover:underline">Go home</a>
      </div>
    </div>
  );
}
