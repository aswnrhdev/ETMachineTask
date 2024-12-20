'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const predefinedSlots = [
    { start: "09:00", end: "09:30" },
    { start: "09:30", end: "10:00" },
    { start: "10:00", end: "10:30" },
    { start: "10:30", end: "11:00" },
    { start: "11:00", end: "11:30" },
    { start: "11:30", end: "12:00" },
    { start: "12:00", end: "12:30" },
    { start: "12:30", end: "13:00" },
    { start: "13:00", end: "13:30" },
    { start: "13:30", end: "14:00" },
    { start: "14:00", end: "14:30" },
    { start: "14:30", end: "15:00" },
    { start: "15:00", end: "15:30" },
    { start: "15:30", end: "16:00" },
    { start: "16:00", end: "16:30" },
    { start: "16:30", end: "17:00" },
];

export default function AdminPage() {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set());
    const [schedules, setSchedules] = useState({});
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await fetch('/api/get-schedules');
                const data = await response.json();
                setSchedules(data.schedules || {});
            } catch (error) {
                console.error('Error fetching schedules:', error);
                setSchedules({});
            }
        };

        fetchSchedules();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const day = new Date(selectedDate).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
            const existingSlots = schedules[day]?.[selectedDate] || [];
            const available = predefinedSlots.filter(slot => 
                !existingSlots.some(existingSlot => 
                    existingSlot.start === slot.start && existingSlot.end === slot.end
                )
            );
            setAvailableSlots(available);
            setSelectedTimeSlots(new Set());
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate, schedules]);

    const addTimeSlot = async () => {
        if (!selectedDate || selectedTimeSlots.size === 0) return;

        const newSlots = Array.from(selectedTimeSlots);

        setSchedules((prev) => {
            const updatedSchedules = { ...prev };
            const day = new Date(selectedDate).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
            if (!updatedSchedules[day]) {
                updatedSchedules[day] = {};
            }
            if (!updatedSchedules[day][selectedDate]) {
                updatedSchedules[day][selectedDate] = [];
            }
            updatedSchedules[day][selectedDate] = [
                ...updatedSchedules[day][selectedDate],
                ...newSlots,
            ];
            return updatedSchedules;
        });

        await saveScheduleToRedis(selectedDate, newSlots);
        setSelectedTimeSlots(new Set());
    };

    const saveScheduleToRedis = async (date, slots) => {
        try {
            await fetch('/api/save-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, slots }),
            });
        } catch (error) {
            console.error('Error saving schedule to Redis:', error);
        }
    };

    const toggleSlotSelection = (slot) => {
        setSelectedTimeSlots((prev) => {
            const newSelection = new Set(prev);
            if (newSelection.has(slot)) {
                newSelection.delete(slot);
            } else {
                newSelection.add(slot);
            }
            return newSelection;
        });
    };

    const removeTimeSlot = async (day, date, index) => {
        setSchedules((prev) => {
            const updatedSchedules = { ...prev };
            if (updatedSchedules[day] && updatedSchedules[day][date]) {
                updatedSchedules[day][date] = updatedSchedules[day][date].filter((_, i) => i !== index);
                if (updatedSchedules[day][date].length === 0) {
                    delete updatedSchedules[day][date];
                }
                if (Object.keys(updatedSchedules[day]).length === 0) {
                    delete updatedSchedules[day];
                }
            }
            return updatedSchedules;
        });

        await removeScheduleFromRedis(date, index);
    };

    const removeScheduleFromRedis = async (date, index) => {
        try {
            await fetch('/api/remove-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, index }),
            });
        } catch (error) {
            console.error('Error removing schedule from Redis:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl text-center font-sans">Manage Slot</h1>
            <p className="mb-8 text-center mt-1">
                Please <Link href="/" className="text-indigo-600 hover:underline">click here</Link> to return to the home page and view the available slots.
            </p>

            <div className="flex flex-col items-center justify-center mb-4">
                <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border rounded-md w-full sm:w-1/3 font-sans"
                />

                {selectedDate && availableSlots.length > 0 && (
                    <div className="mb-4 w-full">
                        <label className="font-medium">Select Time Slots</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            {availableSlots.map((slot, index) => {
                                const isSelected = selectedTimeSlots.has(slot);
                                return (
                                    <button
                                        key={index}
                                        onClick={() => toggleSlotSelection(slot)}
                                        className={`px-4 py-2 rounded-md transition-colors ${isSelected
                                            ? "bg-gray-400 hover:bg-gray-500"
                                            : "bg-slate-200 hover:bg-slate-300"
                                            }`}
                                    >
                                        {slot.start} - {slot.end}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                {selectedDate && availableSlots.length === 0 && (
                    <p className="mt-4 text-red-500">No available slots for this date.</p>
                )}
                <button
                    onClick={addTimeSlot}
                    disabled={!selectedDate || selectedTimeSlots.size === 0}
                    className="bg-green-500 text-white px-6 py-3 rounded-md mt-4 hover:bg-green-600 font-sans w-full sm:w-1/3 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Add Slots
                </button>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl text-center">All Schedules</h2>
                <p className='text-center mb-4'>Please review the scheduled slots listed below.</p>
                {Object.keys(schedules).length === 0 ? (
                    <p>No schedules available.</p>
                ) : (
                    <table className="min-w-full table-auto border-collapse">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border-b text-left">Date</th>
                                <th className="px-4 py-2 border-b text-left">Slots</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(schedules)
                                .flatMap(([day, dates]) =>
                                    Object.entries(dates).map(([date, slots]) => ({ day, date, slots }))
                                )
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map(({ day, date, slots }) => (
                                    <tr key={`${day}-${date}`} className="border-t">
                                        <td className="px-4 py-2">{date}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-wrap gap-2">
                                                {slots.map((slot, index) => (
                                                    <button
                                                        key={index}
                                                        className="bg-yellow-100 text-black px-3 py-1 rounded-md flex items-center hover:bg-yellow-50"
                                                        onClick={() => removeTimeSlot(day, date, index)}
                                                    >
                                                        {slot.start} - {slot.end}
                                                        <span className="ml-2 text-red-500">&times;</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

