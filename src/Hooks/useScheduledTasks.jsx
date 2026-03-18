import { useState } from 'react';
import * as api from '../API Methods/scheduledTaskMethods'; 

export const useTodos = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [userScheduledTask, setScheduledTask] = useState();

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

    /** Получить Todo */
    const getTask = (id) => 
        execute(async () => {
            const todoData = api.GetScheduledTask(id);
            return todoData;
    });

    /** Получить задачи пользователя */ 
    const getUserTasks = (userId) =>
        execute(async () => {
            const todoData = await api.GetUserScheduledTasks(userId);
            setScheduledTask(todoData);
            return todoData;
    });

    /** Создать */ 
    const createTask = (todoData) => 
        execute(async () => {
            const newTask = await api.AddScheduledTask(todoData);
            setScheduledTask(prev => [...prev, newTask]);
            return newTask;
    });

    /** Изменить */ 
    const updateTask = (id, startTime, endTime) =>
        execute(async () => {
            const response = api.UpdateScheduledTask(id, startTime, endTime)
            setScheduledTask((prev) =>
                (prev ?? []).map((task) =>
                    task?.id === id ? { ...task, ...{taskId: id, startTime: startTime, endTime: endTime}} : task
                )
            );
            return response;
    });

    /** Удалить */ 
    const deleteTask = (id) => 
        execute(async () => {
            const responce = await api.DeleteScheduledTask(id);
            setScheduledTask((prev) => (prev ?? []).filter((task) => task?.id !== id));
            return responce;
    });

    return {
        loading,
        error,
        userScheduledTask,
        getTask,
        getUserTasks,
        createTask,
        updateTask,
        deleteTask,
    };
};