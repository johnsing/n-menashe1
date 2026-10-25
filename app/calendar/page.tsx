'use client';

import { useMemo, useState } from 'react';

type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  color: string;
  time: string;
};

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createEvent = (id: number, title: string, date: Date, color: string, time: string): CalendarEvent => ({
  id,
  title,
  date: toDateKey(date),
  color,
  time,
});

const buildMonthEvents = (referenceDate: Date): CalendarEvent[] => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  return [
    createEvent(1, 'Team Sync', new Date(year, month, 2), '#4f46e5', '09:00 AM'),
    createEvent(2, 'Design Review', new Date(year, month, 5), '#f59e0b', '11:30 AM'),
    createEvent(3, 'Project Check-in', new Date(year, month, 9), '#10b981', '02:00 PM'),
    createEvent(4, 'Client Call', new Date(year, month, 12), '#ec4899', '04:15 PM'),
    createEvent(5, 'Lunch with Sam', new Date(year, month, 15), '#38bdf8', '12:30 PM'),
    createEvent(6, 'Sprint Demo', new Date(year, month, 19), '#8b5cf6', '10:00 AM'),
    createEvent(7, 'Planning', new Date(year, month, 23), '#ef4444', '01:45 PM'),
    createEvent(8, 'Workshop', new Date(year, month, 27), '#14b8a6', '03:00 PM'),
    createEvent(9, 'Quarterly Review', new Date(year, month, 30), '#f97316', '09:30 AM'),
  ];
};

const getCalendarDates = (monthDate: Date) => {
  const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstWeekday = firstDayOfMonth.getDay();

  const cells: Date[] = [];

  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - firstWeekday + 1;
    const cellDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayOffset);
    cells.push(cellDate);
  }

  return cells;
};

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);

  const calendarDates = useMemo(() => getCalendarDates(currentMonth), [currentMonth]);
  const monthEvents = useMemo(() => buildMonthEvents(currentMonth), [currentMonth]);

  const monthLabel = currentMonth.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const selectedKey = toDateKey(selectedDate);
  const selectedDayEvents = monthEvents.filter((event) => event.date === selectedKey);

  const handleMonthChange = (direction: number) => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
    const clampedDay = Math.min(selectedDate.getDate(), lastDayOfNextMonth);

    setCurrentMonth(nextMonth);
    setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), clampedDay));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const upcomingEvents = [...monthEvents]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 100%)',
        padding: '32px 20px',
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#0f172a',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '26px 28px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#64748b',
                fontWeight: 700,
              }}
            >
              Calendar
            </p>
            <h1 style={{ margin: '8px 0 0', fontSize: '2.1rem', lineHeight: 1.1 }}> {monthLabel} </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => handleMonthChange(-1)}
              style={navButtonStyle}
              aria-label="Previous month"
            >
              ←
            </button>
            <button onClick={goToToday} style={primaryButtonStyle}>
              Today
            </button>
            <button
              onClick={() => handleMonthChange(1)}
              style={navButtonStyle}
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: '10px',
            padding: '18px 22px 0',
          }}
        >
          {weekdays.map((day) => (
            <div
              key={day}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 0',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: '10px',
            padding: '12px 22px 22px',
          }}
        >
          {calendarDates.map((date) => {
            const key = toDateKey(date);
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isSelected = key === selectedKey;
            const isToday = key === toDateKey(today);
            const dayEvents = monthEvents.filter((event) => event.date === key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(date)}
                style={{
                  minHeight: '120px',
                  borderRadius: '18px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : isCurrentMonth ? '#ffffff' : '#f8fafc',
                  padding: '10px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  boxShadow: isSelected ? '0 8px 20px rgba(37, 99, 235, 0.12)' : 'none',
                  color: isCurrentMonth ? '#0f172a' : '#94a3b8',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: isToday ? '#2563eb' : 'transparent',
                      color: isToday ? '#ffffff' : 'inherit',
                      fontWeight: 700,
                    }}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      title={event.title}
                      style={{
                        display: 'inline-block',
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: event.color,
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.9)',
                      }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(240px, 0.7fr)',
            gap: '20px',
            padding: '0 28px 28px',
          }}
        >
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '20px 22px',
            }}
          >
            <h2 style={{ margin: '0 0 18px', fontSize: '1.2rem' }}>
              {selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h2>

            {selectedDayEvents.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#ffffff',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: event.color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{event.title}</div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>{event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#64748b' }}>No events scheduled for this date.</p>
            )}
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '20px 22px',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Upcoming</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {upcomingEvents.map((event) => (
                <div key={event.id} style={{ display: 'grid', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: event.color,
                      }}
                    />
                    <span style={{ fontWeight: 700 }}>{event.title}</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    • {event.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const navButtonStyle: React.CSSProperties = {
  border: '1px solid #dbe3f0',
  background: '#ffffff',
  color: '#1e293b',
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  fontSize: '1.1rem',
  cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
};

const primaryButtonStyle: React.CSSProperties = {
  border: 'none',
  background: '#2563eb',
  color: '#ffffff',
  padding: '10px 16px',
  borderRadius: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)',
};
