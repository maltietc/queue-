'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenSquare, History, Calendar, FileEdit, LayoutGrid, Settings, ChevronDown, Zap } from 'lucide-react';

const mainLinks = [
  { name: 'Редактор', href: '/', icon: PenSquare },
  { name: 'Черновики', href: '/drafts', icon: FileEdit },
  { name: 'Календарь', href: '/calendar', icon: Calendar },
  { name: 'История', href: '/history', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className="flex-shrink-0 hidden md:flex flex-col h-full sticky top-0 overflow-y-auto"
      style={{
        width: '240px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-default)',
      }}
    >
      {/* Workspace Header */}
      <div
        className="flex items-center gap-2 px-3 py-3 cursor-pointer transition-colors rounded-sm mx-1 mt-1"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
          style={{ background: 'var(--accent)' }}
        >
          C
        </div>
        <span className="font-semibold text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
          Content Scheduler
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
      </div>

      {/* Quick New */}
      <div className="px-2 mt-1">
        <Link
          href="/"
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-sm text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <span className="w-5 h-5 flex items-center justify-center text-lg leading-none" style={{ color: 'var(--text-tertiary)' }}>+</span>
          Новый пост
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-3 my-2" style={{ height: '1px', background: 'var(--border-default)' }} />

      {/* Main Navigation */}
      <nav className="px-2 flex flex-col gap-0.5">
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
          Контент
        </p>
        {mainLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors"
              style={{
                background: active ? 'var(--bg-active)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? '500' : '400',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={16} style={{ color: active ? 'var(--text-primary)' : 'var(--text-tertiary)', flexShrink: 0 }} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-2" style={{ height: '1px', background: 'var(--border-default)' }} />

      {/* Channels Section */}
      <nav className="px-2 flex flex-col gap-0.5">
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
          Каналы
        </p>
        <Link
          href="/channels"
          className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors"
          style={{
            background: isActive('/channels') ? 'var(--bg-active)' : 'transparent',
            color: isActive('/channels') ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: isActive('/channels') ? '500' : '400',
          }}
          onMouseEnter={e => {
            if (!isActive('/channels')) {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={e => {
            if (!isActive('/channels')) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <LayoutGrid size={16} style={{ color: isActive('/channels') ? 'var(--text-primary)' : 'var(--text-tertiary)', flexShrink: 0 }} />
          Управление каналами
        </Link>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Section */}
      <div className="px-2 py-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
        {/* Integrations label */}
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-default mb-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <Zap size={14} />
          <span style={{ fontSize: '12px' }}>Интеграции</span>
        </div>

        {/* Platform indicators */}
        <div className="flex items-center gap-1.5 px-2 py-1 flex-wrap">
          {[
            { name: 'TG', color: '#0088cc', active: true },
            { name: 'VK', color: '#0077FF', active: false },
            { name: 'YT', color: '#FF0000', active: false },
            { name: 'IG', color: '#E1306C', active: false },
          ].map(p => (
            <div
              key={p.name}
              title={p.active ? 'Подключено' : 'Скоро'}
              className="w-6 h-6 rounded flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: p.active ? p.color : 'var(--bg-hover)',
                color: p.active ? '#fff' : 'var(--text-tertiary)',
                fontSize: '9px',
                fontWeight: '700',
                border: p.active ? 'none' : '1px solid var(--border-medium)',
                cursor: 'default',
                opacity: p.active ? 1 : 0.5,
              }}
            >
              {p.name}
            </div>
          ))}
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors mt-1"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Settings size={16} style={{ color: 'var(--text-tertiary)' }} />
          Настройки
        </Link>
      </div>
    </aside>
  );
}
