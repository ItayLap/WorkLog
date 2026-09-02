import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";

export interface PlannableTask{
    id: string;
    title: string;
    estimateMinutes: number;
    priority?: number;
}

export interface ScheduleResult{
    selectedTasks: PlannableTask[];
    skippedTasks: PlannableTask[];
    totalMinutesUsed: number;
    remainingMinutes: number;
    totalPriorityGained: number;
}

export default function PlanOptimalSchedule(tasks: PlannableTask[], avalibleMinutes: number): ScheduleResult{
    const budget = Math.max(0, Math.floor(avalibleMinutes));
    const items = tasks
        .filter(t=> t.estimateMinutes > 0 && t.estimateMinutes <= budget)
        .map(t => ({
            ...t,
            estimateMinutes: Math.floor(t.estimateMinutes),
            priority: t.priority ?? 1,
        }));
    const n = items.length;
    const dp: number[][] = Array.from({length: n + 1},() =>
        new Array(budget + 1).fill(0));
    

    return(

    )
}