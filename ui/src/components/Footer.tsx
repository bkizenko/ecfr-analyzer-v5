import { IconCopyright, IconBrandGithub, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">eCFR Analyzer</h3>
            <p className="text-gray-400 mb-4">
              A modern platform for analyzing federal regulations and providing insights into regulatory metrics.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/boriskizenko/ecfr-analyzer-v5" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 h-10 w-10 rounded-full flex items-center justify-center transition-colors">
                <IconBrandGithub size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  <IconChevronRight size={14} stroke={2} />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/agency" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  <IconChevronRight size={14} stroke={2} />
                  <span>Agencies</span>
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  <IconChevronRight size={14} stroke={2} />
                  <span>Search</span>
                </Link>
              </li>
              <li>
                <Link href="/updates" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  <IconChevronRight size={14} stroke={2} />
                  <span>Updates</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.ecfr.gov/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  <IconChevronRight size={14} stroke={2} />
                  <span>eCFR Website</span>
                </a>
              </li>
              <li>
                <a href="https://www.govinfo.gov/bulkdata/ECFR" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  <IconChevronRight size={14} stroke={2} />
                  <span>GovInfo Bulk Data</span>
                </a>
              </li>
              <li>
                <a href="https://www.ecfr.gov/developers/documentation/api/v1#/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  <IconChevronRight size={14} stroke={2} />
                  <span>eCFR API</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0 flex items-center gap-1">
            <IconCopyright size={14} stroke={1.5} /> 2025 eCFR Analyzer. All rights reserved.
          </div>
          
          <div className="flex gap-6">
            <Link href="/terms-and-conditions" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy-notice" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
