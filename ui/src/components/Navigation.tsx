import Link from "next/link";
import { IconExternalLink, IconInfoCircle, IconBrandGithub } from "@tabler/icons-react";

export default function Navigation({
  title = "eCFR Analyzer",
}: {
  title?: string;
}) {
  return (
    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-white">{title}</h1>
            </Link>
            <p className="text-sm text-blue-100 mt-1">
              Analyzing Federal Regulations for the Department of Government Efficiency (DOGE)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.ecfr.gov/" target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition">
              <span>Visit eCFR Website</span>
              <IconExternalLink size={16} />
            </a>
            <a href="https://github.com/boriskizenko/ecfr-analyzer-v5" target="_blank" rel="noopener" className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-md text-white transition">
              <IconBrandGithub size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
