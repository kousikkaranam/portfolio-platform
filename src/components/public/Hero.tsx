import { MapPin, Github, Linkedin, Twitter, Mail, Circle } from "lucide-react";
import Image from "next/image";

interface Props {
  name: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  location: string;
  availableForHire: boolean;
  socialLinks: Record<string, string>;
  accent: string;
}

const socialIcons: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
};

export default function Hero({
  name, tagline, bio, avatarUrl, location,
  availableForHire, socialLinks, accent,
}: Props) {
  return (
    <section id="hero" className="pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar */}
          {avatarUrl && (
            <div
              className="w-28 h-28 rounded-2xl overflow-hidden border-2 flex-shrink-0"
              style={{ borderColor: accent }}
            >
              <Image
                src={avatarUrl}
                alt={name}
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="flex-1">
            {/* Available badge */}
            {availableForHire && (
              <div className="flex items-center gap-2 mb-4">
                <Circle size={8} fill="#22c55e" className="text-green-500" />
                <span className="text-sm text-green-400">Available for hire</span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              {name}
            </h1>

            <p className="text-xl text-gray-400 mb-4">{tagline}</p>

            {location && (
              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <MapPin size={16} />
                <span className="text-sm">{location}</span>
              </div>
            )}

            {bio && (
              <p className="text-gray-400 leading-relaxed max-w-2xl mb-8">
                {bio}
              </p>
            )}

            {/* Social links */}
            <div className="flex items-center gap-4">
              {Object.entries(socialLinks).map(([key, url]) => {
                if (!url) return null;
                const Icon = socialIcons[key];
                if (!Icon) return null;
                const href = key === "email" ? `mailto:${url}` : url;

                return (
                  <a
                    key={key}
                    href={href}
                    target={key === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-[#121826] border border-gray-800 flex items-center justify-center text-gray-400 hover:border-gray-600 transition-colors"
                    style={{ ["--hover-color" as string]: accent }}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}