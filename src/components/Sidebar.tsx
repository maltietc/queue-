'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenSquare, History, Calendar, Settings, FileEdit, Network } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Редактор', href: '/', icon: PenSquare },
    { name: 'Черновики', href: '/drafts', icon: FileEdit },
    { name: 'История', href: '/history', icon: History },
    { name: 'Календарь', href: '/calendar', icon: Calendar },
    { name: 'Каналы', href: '/channels', icon: Network },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#111] border-r border-[#333] hidden md:flex flex-col h-full sticky top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          TG Scheduler
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#222]'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-400' : 'text-gray-500'} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#333]">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#222] transition-colors"
        >
          <Settings size={20} className="text-gray-500" />
          Настройки
        </Link>
      </div>
    </aside>
  );
}
