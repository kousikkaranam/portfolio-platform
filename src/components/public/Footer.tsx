interface Props {
  name: string;
  accent: string;
}

export default function Footer({ name }: Props) {
  return (
    <footer className="border-t border-gray-800 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} {name}. Built with Next.js & Prisma.
        </p>
        <p className="text-sm text-gray-600">
          Powered by Portfolio Platform
        </p>
      </div>
    </footer>
  );
}