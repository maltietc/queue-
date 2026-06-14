'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CalendarClient({ posts }: { posts: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Scheduled posts
  const scheduledPosts = posts.filter(p => p.status === 'SCHEDULED' && p.publishAt);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getPostsForDay = (date: Date) => {
    return scheduledPosts.filter(p => isSameDay(new Date(p.publishAt), date));
  };

  const selectedDayPosts = selectedDate ? getPostsForDay(selectedDate) : [];

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold capitalize">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#444] rounded-lg overflow-hidden border border-[#444]">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="bg-[#222] p-3 text-center text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}
        
        {days.map((day, idx) => {
          const dayPosts = getPostsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div 
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`min-h-[100px] bg-[#1a1a1a] p-2 transition-colors cursor-pointer hover:bg-[#252525] relative
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
              `}
            >
              <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                ${isToday ? 'bg-blue-600 text-white' : 'text-gray-300'}
              `}>
                {format(day, 'd')}
              </div>
              
              <div className="mt-2 flex flex-col gap-1">
                {dayPosts.length > 0 && (
                  <div className="bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded border border-blue-800/50 font-medium">
                    {dayPosts.length} постов
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="absolute top-0 right-0 w-80 h-full bg-[#111] border-l border-[#333] p-6 shadow-2xl flex flex-col z-20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {format(selectedDate, 'd MMMM', { locale: ru })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-[#333] rounded-md transition-colors text-gray-400">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            {selectedDayPosts.length === 0 ? (
              <p className="text-gray-500 text-sm">На этот день постов не запланировано</p>
            ) : (
              selectedDayPosts.map(post => (
                <div key={post.id} className="bg-[#222] border border-[#333] rounded-lg p-4">
                  <div className="text-xs text-blue-400 font-medium mb-2 flex justify-between">
                    <span>{format(new Date(post.publishAt), 'HH:mm')}</span>
                    <div className="flex gap-1">
                      {post.publications?.map((pub: any) => (
                        <span key={pub.id} className="bg-blue-900/50 px-1.5 py-0.5 rounded text-[10px]">
                          {pub.channel?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div 
                    className="text-sm text-gray-300 line-clamp-3 prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
