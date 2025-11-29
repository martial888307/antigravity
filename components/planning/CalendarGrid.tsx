'use client';

import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Intervention, Collaborateur } from '@/types';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Maximize2, Minimize2 } from 'lucide-react';
import VoiceRecorder from '../VoiceRecorder';

interface CalendarGridProps {
    currentDate: Date;
    interventions: Intervention[];
    collaborateurs: Collaborateur[];
    onInterventionClick: (intervention: Intervention) => void;
    onDateChange: (date: Date) => void;
    onTodayClick: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onRefresh?: () => void;
    chantiers?: any[]; // Using any[] for now to match PlanningContainer state
}

export default function CalendarGrid({
    currentDate,
    interventions,
    collaborateurs,
    onInterventionClick,
    onDateChange,
    onTodayClick,
    isExpanded,
    onToggleExpand,
    onRefresh,
    chantiers = []
}: CalendarGridProps) {
    // Generate days for the grid (dynamic weeks)
    const getCalendarDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        // First day of the month
        const firstDayOfMonth = new Date(year, month, 1);
        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        let startingDayOfWeek = firstDayOfMonth.getDay();
        // Adjust to make Monday = 0, Sunday = 6
        startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

        // Start date for the grid (Monday of the first week)
        const startDate = new Date(year, month, 1 - startingDayOfWeek);

        const days = [];
        // Generate days until we reach the end of the last week that contains days of the current month
        // We start with 35 days (5 weeks) as a baseline, but check if we need 6
        // Or we can just iterate week by week

        let currentDay = new Date(startDate);
        let weekCount = 0;

        // Always generate at least one week. 
        // Continue adding weeks as long as the week has at least one day in the current month
        // OR if we haven't reached the end of the month yet.

        while (true) {
            // Add a week
            for (let i = 0; i < 7; i++) {
                days.push(new Date(currentDay));
                currentDay.setDate(currentDay.getDate() + 1);
            }
            weekCount++;

            // Check if the next week is needed
            // If the current day (which is now the start of the next week) is in the NEXT month, 
            // AND the last day of the added week was also in the next month (or end of current),
            // we might be done.

            // Simpler logic:
            // If the last day we just added is in the next month (or later), AND it was a Sunday (it is),
            // check if the *start* of this week was already in the next month? No, that's impossible.

            // Check if the *first day of the NEXT week* is still in the current month?
            // If yes, we need another week.
            // If no (it's in next month), we are done.

            if (currentDay.getMonth() !== month && days[days.length - 7].getMonth() !== month) {
                // If the whole last week was outside the month... wait, that shouldn't happen with this logic 
                // unless we started outside.
                // Let's stick to: if the *first day of the next week* is in the next month, stop.
                // But wait, what if the month ends on Sunday? Then currentDay is 1st of next month. Stop.
                // What if month ends on Monday? Then currentDay is 2nd of next month. Stop? No, we needed that week.
            }

            // Robust check:
            // If the *start* of the *next* week is strictly after the end of the current month, stop.
            const nextWeekStart = new Date(currentDay);
            // If nextWeekStart is in a different month AND the previous week covered the end of the month...

            // Actually, simply: Check if the last day of the *current* month is covered.
            const lastDayOfMonth = new Date(year, month + 1, 0);
            if (days[days.length - 1] >= lastDayOfMonth) {
                break;
            }

            // Safety break
            if (weekCount >= 6) break;
        }

        return days;
    };

    const days = getCalendarDays(currentDate);
    const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        onDateChange(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        onDateChange(newDate);
    };

    return (
        <div className={`flex-1 flex flex-col ${isExpanded ? 'h-auto' : 'h-full'} overflow-hidden bg-slate-50`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onTodayClick}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <CalendarIcon size={16} />
                        Aujourd'hui
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 capitalize w-48 text-center">{monthName}</h2>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <VoiceRecorder
                        onRefresh={onRefresh}
                        chantiers={chantiers}
                        collaborateurs={collaborateurs}
                    />
                    <button
                        onClick={onToggleExpand}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title={isExpanded ? "Réduire" : "Agrandir"}
                    >
                        {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Grid Header (Days of week) */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 shrink-0">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-slate-500 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Body */}
            <div className={`flex-1 p-4 ${isExpanded ? '' : 'overflow-y-auto'}`}>
                <div className={`grid grid-cols-7 gap-2 ${isExpanded ? 'auto-rows-auto' : 'auto-rows-fr h-full'}`}>
                    {days.map((day) => (
                        <DayCell
                            key={day.toISOString()}
                            date={day}
                            currentMonth={currentDate}
                            interventions={interventions}
                            collaborateurs={collaborateurs}
                            onInterventionClick={onInterventionClick}
                            minHeight={isExpanded ? 'min-h-[12rem]' : 'min-h-0'}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function DayCell({ date, currentMonth, interventions, collaborateurs, onInterventionClick, minHeight }: {
    date: Date;
    currentMonth: Date;
    interventions: Intervention[];
    collaborateurs: Collaborateur[];
    onInterventionClick: (intervention: Intervention) => void;
    minHeight: string;
}) {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isOutsideMonth = date.getMonth() !== currentMonth.getMonth();
    const isToday = new Date().toDateString() === date.toDateString();

    // Filter interventions for this day
    const dayInterventions = interventions.filter(i => {
        const iDate = new Date(i.date_debut);
        return iDate.getDate() === date.getDate() &&
            iDate.getMonth() === date.getMonth() &&
            iDate.getFullYear() === date.getFullYear();
    });

    const amInterventions = dayInterventions.filter(i => new Date(i.date_debut).getHours() < 12);
    const pmInterventions = dayInterventions.filter(i => new Date(i.date_debut).getHours() >= 12);

    let bgClass = 'bg-white';
    if (isOutsideMonth) bgClass = 'bg-slate-200/60'; // Darker for outside
    else if (isWeekend) bgClass = 'bg-slate-50';

    // Weekend stripe pattern
    const weekendStyle = isWeekend && !isOutsideMonth ? {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)'
    } : {};

    let borderClass = 'border-slate-200';
    if (isToday) borderClass = 'border-blue-400 ring-1 ring-blue-400 z-10';

    return (
        <div
            className={`${bgClass} rounded-lg border ${borderClass} flex flex-col overflow-hidden ${minHeight} transition-colors`}
            style={weekendStyle}
        >
            <div className={`p-1 text-center text-xs font-medium border-b border-slate-100 ${isOutsideMonth ? 'text-slate-400' : 'text-slate-700'} ${isToday ? 'bg-blue-50 text-blue-700' : ''}`}>
                {date.getDate()}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {/* AM Slot */}
                <DroppableSlot
                    date={date}
                    period="AM"
                    interventions={amInterventions}
                    collaborateurs={collaborateurs}
                    onInterventionClick={onInterventionClick}
                    disabled={false}
                    isOutsideMonth={isOutsideMonth}
                />

                <div className="border-t border-slate-100 border-dashed"></div>

                {/* PM Slot */}
                <DroppableSlot
                    date={date}
                    period="PM"
                    interventions={pmInterventions}
                    collaborateurs={collaborateurs}
                    onInterventionClick={onInterventionClick}
                    disabled={false}
                    isOutsideMonth={isOutsideMonth}
                />
            </div>
        </div>
    );
}

function DroppableSlot({ date, period, interventions, collaborateurs, onInterventionClick, disabled, isOutsideMonth }: {
    date: Date;
    period: 'AM' | 'PM';
    interventions: Intervention[];
    collaborateurs: Collaborateur[];
    onInterventionClick: (intervention: Intervention) => void;
    disabled: boolean;
    isOutsideMonth: boolean;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${date.toISOString()}-${period}`,
        data: { date, period },
        disabled: disabled,
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 p-1 transition-colors ${isOver ? 'bg-blue-100/50 ring-2 ring-inset ring-blue-300' : ''} ${isOutsideMonth ? 'opacity-75' : ''}`}
        >
            <div className="text-[10px] text-slate-300 uppercase mb-1">{period}</div>
            <div className="space-y-1">
                {interventions.map(intervention => {
                    const collab = collaborateurs.find(c => c.id === intervention.collaborateur_id);
                    if (!collab) return null;

                    // Determine color based on collaborator index (simple hash for now or pass index)
                    const colors = [
                        'bg-red-100 text-red-800 border-red-200',
                        'bg-green-100 text-green-800 border-green-200',
                        'bg-blue-100 text-blue-800 border-blue-200',
                        'bg-yellow-100 text-yellow-800 border-yellow-200',
                        'bg-purple-100 text-purple-800 border-purple-200',
                        'bg-pink-100 text-pink-800 border-pink-200',
                    ];
                    // Find index of collab in list to match sidebar color
                    const collabIndex = collaborateurs.findIndex(c => c.id === collab.id);
                    const colorClass = colors[collabIndex % colors.length];

                    return (
                        <DraggableIntervention
                            key={intervention.id}
                            intervention={intervention}
                            collaborateur={collab}
                            index={collabIndex}
                            onInterventionClick={onInterventionClick}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function DraggableIntervention({
    intervention,
    collaborateur,
    index,
    onInterventionClick
}: {
    intervention: Intervention;
    collaborateur: Collaborateur;
    index: number;
    onInterventionClick: (intervention: Intervention) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `intervention-${intervention.id}`,
        data: {
            type: 'intervention',
            intervention,
            collaborateur // Pass collab for preview
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
    } : undefined;

    const colors = [
        'bg-red-100 text-red-800 border-red-200',
        'bg-green-100 text-green-800 border-green-200',
        'bg-blue-100 text-blue-800 border-blue-200',
        'bg-yellow-100 text-yellow-800 border-yellow-200',
        'bg-purple-100 text-purple-800 border-purple-200',
        'bg-pink-100 text-pink-800 border-pink-200',
    ];
    const colorClass = colors[index % colors.length];

    if (isDragging) {
        return (
            <div className={`text-xs p-1 rounded border ${colorClass} opacity-30`}>
                <div className="font-semibold truncate">{collaborateur.prenom}</div>
                <div className="truncate opacity-75 text-[10px]">{intervention.chantier?.description}</div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={(e) => {
                e.stopPropagation();
                onInterventionClick(intervention);
            }}
            className={`text-xs p-1 rounded border ${colorClass} cursor-grab active:cursor-grabbing hover:brightness-95 transition-all`}
        >
            <div className="font-semibold truncate">{collaborateur.prenom}</div>
            <div className="truncate opacity-75 text-[10px]">{intervention.chantier?.description}</div>
        </div>
    );
}
