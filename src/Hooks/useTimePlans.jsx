import { useState } from 'react';
import * as api from '../API Methods/timePlanMethodts.jsx';

export const useTimePlans = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [userPlans, setUserPlans] = useState([]);

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

    /** Получить один план */
    const getPlan = (id) =>
        execute(async () => {
            const planData = await api.GetPlan(id);
            return planData;
        });

    /** Получить планы пользователя */
    const getUserPlans = (userId) =>
        execute(async () => {
            const plansData = await api.GetUserPlan(userId);
            setUserPlans(plansData ?? []);
            return plansData;
        });

    /** Создать план */
    const createPlan = (name, isDefault) =>
        execute(async () => {
            const planData = {
                "name": name,
                "isDefault": isDefault
            } 
            const newPlan = await api.AddPlan(planData);
            setUserPlans((prev) => [...(prev ?? []), newPlan]);
            return newPlan;
        });

    /** Обновить план */
    const updatePlan = (id, newPlanData) =>
        execute(async () => {
            const response = await api.UpdatePlan(id, newPlanData);
            setUserPlans((prev) =>
                (prev ?? []).map((plan) =>
                    plan?.id === id ? { ...plan, ...newPlanData } : plan
                )
            );
            return response;
        });

    /** Удалить план */
    const deletePlan = (id) =>
        execute(async () => {
            const response = await api.DeletePlan(id);
            setUserPlans((prev) => (prev ?? []).filter((plan) => plan?.id !== id));
            return response;
        });

    return {
        loading,
        error,
        userPlans,
        getPlan,
        getUserPlans,
        createPlan,
        updatePlan,
        deletePlan,
    };
};
