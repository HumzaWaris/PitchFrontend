// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white text-black py-4">
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Left */}
        <div>
          <Link href="/" className="hover:underline font-medium">
            Privacy Policy
          </Link>
        </div>

        {/* Center */}
        <div className="text-center font-medium">
          Made w/❤️ by The Huddle Team
        </div>

        {/* Right */}
        <div className="text-right font-medium">
          © 2025 Huddle Social
        </div>
      </div>
    </footer>
  );
}
