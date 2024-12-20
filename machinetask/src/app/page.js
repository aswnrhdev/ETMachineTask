'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BsAlarm } from 'react-icons/bs';
import { z } from 'zod';

export default function CheckAvailableSlots() {
    const [selectedName, setSelectedName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [errors, setErrors] = useState({});
    const [schedules, setSchedules] = useState({});

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch('/api/add-participant');
                const data = await response.json();
                if (data.participants) {
                    setParticipants(data.participants);
                }
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };
        fetchParticipants();

        const fetchSchedules = async () => {
            try {
                const response = await fetch('/api/get-schedules');
                const data = await response.json();
                setSchedules(data.schedules || {});
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
        };
        fetchSchedules();
    }, []);

    const validationSchema = z.object({
        selectedName: z.string().min(1, 'Participant name is required'),
        startDate: z.string().min(1, 'Start date is required'),
        endDate: z.string().min(1, 'End date is required'),
    });

    const handleCheckSlots = () => {
        try {
            validationSchema.parse({
                selectedName,
                startDate,
                endDate,
            });
            
            const filteredSchedules = Object.entries(schedules)
                .flatMap(([day, dates]) =>
                    Object.entries(dates)
                        .filter(([date, slots]) => {
                            const currentDate = new Date(date);
                            return currentDate >= new Date(startDate) && currentDate <= new Date(endDate);
                        })
                        .map(([date, slots]) => ({ date, slots }))
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort in descending order

            setAvailableSlots(filteredSchedules);
            setErrors({});
        } catch (error) {
            setErrors(error.formErrors.fieldErrors);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto sm:px-4 lg:px-8">
            <h1 className="text-3xl mt-6 text-center">Check Availability</h1>
            <div className="text-center text-gray-500 mb-6">
                <p>If you would like to manage available slots, please visit the <Link href="/slots" className="text-indigo-600 hover:cursor-pointer">slots</Link> page.</p>
            </div>

            <div className="mb-4">
                <select
                    id="name"
                    value={selectedName}
                    onChange={(e) => setSelectedName(e.target.value)}
                    className="mt-1 block w-full bg-gray-200 border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-4 p-2"
                >
                    <option value="" disabled>Choose participant</option>
                    {participants.map((participant, index) => (
                        <option key={index} value={participant.name}>{participant.name}</option>
                    ))}
                </select>
                {errors.selectedName && (
                    <p className="text-red-500 text-sm mt-1">{errors.selectedName}</p>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-200 py-3 p-2"
                />
                {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-200 py-3 p-2"
                />
                {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
            </div>

            <button
                onClick={handleCheckSlots}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700"
            >
                Check Slots
            </button>

            {availableSlots.length === 0 && (
                <div className="mt-6 text-center text-gray-500">
                    <p>Please choose a participant and set the start and end date to see available slots.</p>
                </div>
            )}

            {availableSlots.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl text-center mb-4">Available Slots</h2>
                    <p className='text-center mb-4'>Please review the available slots listed below.</p>
                    <div className="bg-yellow-50 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left font-medium ">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left font-medium ">
                                        Slots
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {availableSlots.map(({ date, slots }, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{date}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {slots.map((slot, i) => (
                                                    <button
                                                        key={i}
                                                        className="bg-indigo-500 text-white px-3 py-1 rounded-md flex items-center hover:bg-indigo-600 focus:outline-none text-sm"
                                                        onClick={() => console.log(`Slot selected: ${slot.start} - ${slot.end}`)}
                                                    >
                                                        <BsAlarm className="mr-2" /> {slot.start} - {slot.end}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

