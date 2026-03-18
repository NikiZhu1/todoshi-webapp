import { useState } from 'react';
import * as api from '../API Methods/timeSlotMethodts.jsx';

export const useTimeSlots = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [timeSlots, setTimeSlots] = useState([]);

    const execute = async (callback) => {
        setLoading(true);
        setError(null);

        try {
            return await callback();
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /** Создать слот */
    const createSlot = (timePlanId, slotData) =>
        execute(async () => {
            const newSlot = await api.AddSlot(timePlanId, slotData);
            setTimeSlots((prev) => [...(prev ?? []), newSlot]);
            return newSlot;
        });

    /** Обновить слот */
    const updateSlot = (id, newSlotData) =>
        execute(async () => {
            const response = await api.UpdateSlot(id, newSlotData);
            setTimeSlots((prev) =>
                (prev ?? []).map((slot) =>
                    slot?.id === id ? { ...slot, ...newSlotData } : slot
                )
            );
            return response;
        });

    /** Удалить слот */
    const deleteSlot = (id) =>
        execute(async () => {
            const response = await api.DeleteSlot(id);
            setTimeSlots((prev) => (prev ?? []).filter((slot) => slot?.id !== id));
            return response;
        });

    return {
        loading,
        error,
        timeSlots,
        setTimeSlots,
        createSlot,
        updateSlot,
        deleteSlot,
    };
};
