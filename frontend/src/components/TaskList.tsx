import React, { useState } from 'react';
import { useRealtimeTasks } from '../hooks/useRealtimeTasks.ts';
import { TaskItem } from './TaskItem.tsx';
import { AnimatePresence, motion } from 'motion/react';
import { ListTodo, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { TaskStatus } from '../types.ts';

export const TaskList: React.FC = () => {
  const { tasks, loading, error } = useRealtimeTasks();
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-brand" />
        <p className="font-semibold text-sm tracking-wide">Đang tải danh sách công việc...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-2xl flex flex-col items-center text-center max-w-lg mx-auto backdrop-blur-md">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="text-rose-600 font-bold mb-1 font-display">Không thể tải công việc</h3>
        <p className="text-text-muted text-sm mb-4 leading-relaxed">{error}</p>
        <p className="text-xs text-text-muted/60">Vui lòng kiểm tra lại cấu hình Supabase trong .env</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xs uppercase tracking-wider text-text-muted font-bold font-display flex items-center gap-2">
          <span className="p-1.5 bg-brand/10 text-brand rounded-lg">
            <ListTodo className="w-4 h-4" />
          </span>
          Danh Sách Công Việc
          <span className="ml-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-brand text-white rounded-full">
            {filteredTasks.length}
          </span>
        </h2>

        {/* Filters */}
        <div className="flex bg-input-bg border border-input-border p-1 rounded-xl shrink-0 self-start sm:self-auto">
          {(['all', 'open', 'in_progress', 'done'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                filter === status
                  ? 'bg-bg-card text-brand shadow-sm font-extrabold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {status === 'all' ? 'Tất cả' : status === 'in_progress' ? 'Đang chạy' : status === 'done' ? 'Hoàn thành' : 'Mở'}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-bg-card border border-border border-dashed rounded-2xl flex flex-col items-center justify-center text-text-muted shadow-sm"
        >
          <Inbox className="w-10 h-10 mb-3 text-text-muted/40" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted/60">Không có công việc nào</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
