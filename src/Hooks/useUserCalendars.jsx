import { useState } from 'react';
import * as api from '../API Methods/userCalendarsMethods.jsx'; 

export const useUserCalendars = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [userCalendars, setUserCalendars] = useState();

    const execute = async (callback) => {
        setLoading(true);
        setError(null);

        try {
            return await callback();
        } catch (error) {
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /** Получить календарь */
    const getCalendar = (id) => 
        execute(async () => {
            const calendarData = await api.GetCalendar(id);
            return calendarData;
    });

    /** Получить календари пользователя */ 
    const getUserCalendars = (userId) =>
        execute(async () => {
            const calendarData = await api.GetUserCalendars(userId);
            setUserCalendars(calendarData);
            return calendarData;
    });

    /** Добавить календарь */ 
    const addCalendar = (calendarData) => 
        execute(async () => {
            const newCalendar = await api.AddCalendar(calendarData);
            setUserCalendars(prev => [...(prev ?? []), newCalendar]);
            return newCalendar;
    });

    /** Изменить календарь */ 
    const updateCalendar = (id, newCalendarData) =>
        execute(async () => {
            const response = await api.UpdateCalendar(id, newCalendarData);
            setUserCalendars((prev) =>
                (prev ?? []).map((calendar) =>
                    calendar?.id === id ? { ...calendar, ...newCalendarData } : calendar
                )
            );
            return response;
    });

    /** Удалить календарь */ 
    const deleteCalendar = (id) => 
        execute(async () => {
            const responce = await api.DeleteCalendar(id);
            setUserCalendars((prev) => (prev ?? []).filter((calendar) => calendar?.id !== id));
            return responce;
    });

    return {
        loading,
        error,
        userCalendars,
        getCalendar,
        getUserCalendars,
        addCalendar,
        updateCalendar,
        deleteCalendar,
    };
};

// Backward-compatible alias in case old imports still use the previous name.
export const useTodos = useUserCalendars;
