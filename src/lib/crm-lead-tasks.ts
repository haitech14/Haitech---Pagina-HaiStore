import { randomId } from '@/lib/random-id';
import type { CrmLeadTask } from '@/types/crm-lead-form';
import type { CrmPipelineLead } from '@/types/crm-pipeline';

export function newLeadTask(title = ''): CrmLeadTask {
  return {
    id: randomId(),
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
}

export function normalizeLeadTasks(value: unknown): CrmLeadTask[] {
  if (!Array.isArray(value)) return [];
  const result: CrmLeadTask[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Partial<CrmLeadTask>;
    const title = typeof row.title === 'string' ? row.title.trim() : '';
    if (!title) continue;
    const id = typeof row.id === 'string' && row.id.trim() ? row.id.trim() : randomId();
    const createdAt =
      typeof row.createdAt === 'string' && row.createdAt ? row.createdAt : new Date().toISOString();
    const dueDate =
      typeof row.dueDate === 'string' && row.dueDate.trim() ? row.dueDate.trim() : undefined;

    result.push({
      id,
      title,
      done: row.done === true,
      createdAt,
      ...(dueDate ? { dueDate } : {}),
    });
  }

  return result;
}

export function countPendingLeadTasks(tasks: CrmLeadTask[] | undefined): number {
  return (tasks ?? []).filter((task) => !task.done).length;
}

export function leadHasPendingTasks(lead: CrmPipelineLead): boolean {
  return countPendingLeadTasks(lead.tasks) > 0;
}

export function countPendingTasksForLeads(leads: CrmPipelineLead[]): number {
  return leads.reduce((sum, lead) => sum + countPendingLeadTasks(lead.tasks), 0);
}

export function formatLeadTaskDueLabel(dueDate: string | undefined): string | null {
  if (!dueDate?.trim()) return null;
  const parsed = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(parsed);
  target.setHours(0, 0, 0, 0);
  if (target.getTime() === today.getTime()) return 'Hoy';
  if (target.getTime() < today.getTime()) return 'Vencida';
  return parsed.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}
