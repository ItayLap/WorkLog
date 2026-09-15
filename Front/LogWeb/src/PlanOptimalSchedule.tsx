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

export function planOptimalSchedule(tasks: PlannableTask[], avalibleMinutes: number): ScheduleResult{
    const budget = Math.max(0, Math.floor(avalibleMinutes));
    const items = tasks
        .filter(t=> t.estimateMinutes > 0 && t.estimateMinutes <= budget)
        .map(t => ({
            ...t,
            estimateMinutes: Math.floor(t.estimateMinutes),
            priority: (t.priority ?? 1)* 1000 + t.estimateMinutes,
        }));
    const n = items.length;
    const dp: number[][] = Array.from({length: n + 1},() =>
        new Array(budget + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const task = items[i - 1];
        for (let t = 0; t <= budget; t++) {
            const WithoutTask = dp[i - 1][t];
            const withTask = task.estimateMinutes <= t
            ? dp[i - 1][t - task.estimateMinutes] + task.priority : -Infinity;
            dp[i][t] = Math.max(WithoutTask, withTask);
        }
    }
    const selected : PlannableTask[] = [];
    let remaining = budget;
    for(let i = n; i >= 1; i--){
        if (dp[i][remaining] !== dp[i - 1][remaining]) {
            const task = items[i - 1];
            selected.push(task);
            remaining -= task.estimateMinutes;
        }
    } 
    selected.reverse();
    const selectedIds = new Set(selected.map(t => t.id));
    const skipped = tasks.filter(t => !selectedIds.has(t.id));

    const totalMinutesUsed = selected.reduce((sum, t) => sum + t.estimateMinutes, 0);
    return{
        selectedTasks: selected,
        skippedTasks: skipped,
        totalMinutesUsed,
        remainingMinutes: budget - totalMinutesUsed,
        totalPriorityGained: n > 0 && budget > 0 ? dp[n][budget] : 0,
    };
}