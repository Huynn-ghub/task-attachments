import React, { useState } from 'react';
import { Task, TaskStatus } from '../types.ts';
import { Paperclip, ExternalLink, Loader2, Upload, Trash2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api.ts';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      await apiFetch(`/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      window.dispatchEvent(new CustomEvent('tasks-changed'));
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiFetch(`/api/tasks/${task.id}/attachment`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      window.dispatchEvent(new CustomEvent('tasks-changed'));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async () => {
    setIsDeleting(true);
    try {
      const response = await apiFetch(`/api/tasks/${task.id}/attachment`, {
        method: 'DELETE',
      });
      if (response.ok) {
        window.dispatchEvent(new CustomEvent('tasks-changed'));
      }
    } catch (error: unknown) {
      console.error('Error deleting attachment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusStyle = () => {
    switch (task.status) {
      case 'done':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          text: 'text-emerald-500 dark:text-emerald-400',
          border: 'border-emerald-500/20',
          label: 'Hoàn thành'
        };
      case 'in_progress':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          text: 'text-amber-500 dark:text-amber-400',
          border: 'border-amber-500/20',
          label: 'Đang chạy'
        };
      default:
        return {
          bg: 'bg-slate-500/10 dark:bg-slate-500/20',
          text: 'text-slate-500 dark:text-slate-400',
          border: 'border-slate-500/20',
          label: 'Mở'
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className={`geo-card relative overflow-hidden group/item ${
        task.status === 'done' ? 'opacity-85' : ''
      }`}
    >
      {/* Visual top indicator glow depending on status */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${
        task.status === 'done' ? 'bg-emerald-500' : task.status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-400'
      }`} />

      <div className="flex flex-col h-full justify-between gap-4 mt-1">
        {/* Title, description, status indicator */}
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {task.status === 'in_progress' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                )}
                {statusStyle.label}
              </span>
            </div>
            
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              disabled={isUpdating}
              className="text-[10px] uppercase font-bold px-2 py-1 rounded-lg border border-border bg-input-bg text-text-muted outline-none focus:border-brand cursor-pointer transition-all duration-200"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <h3 className={`text-sm font-bold tracking-tight transition-all duration-300 font-display ${
              task.status === 'done'
                ? 'line-through text-text-muted/60'
                : 'text-text-main'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-[12px] text-text-muted mt-1.5 line-clamp-3 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-3 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.attachment_url ? (
                <div className="flex items-center gap-2 bg-brand/5 dark:bg-brand/10 border border-brand/10 rounded-xl px-2.5 py-1.5">
                  <a
                    href={task.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-bold text-brand hover:opacity-85 transition-opacity uppercase tracking-wider"
                  >
                    <Paperclip className="w-3 h-3 text-brand" />
                    <span className="max-w-[120px] truncate">{task.attachment_name}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <button
                    onClick={handleDeleteAttachment}
                    disabled={isDeleting}
                    className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors disabled:opacity-30 cursor-pointer ml-1 p-0.5 rounded-lg hover:bg-rose-500/10"
                    title="Xoá đính kèm"
                  >
                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-text-muted/50 flex items-center gap-1.5 uppercase font-bold tracking-wider py-1">
                  <Paperclip className="w-3 h-3" />
                  Trống
                </span>
              )}
            </div>

            <label className={`cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              isUploading
                ? 'text-text-muted/40 cursor-not-allowed'
                : 'text-text-muted hover:text-brand'
            }`}>
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin text-brand" /> : <Upload className="w-3 h-3" />}
              {isUploading ? 'ĐANG TẢI...' : 'ĐÍNH KÈM'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>

          {/* Footer timestamp */}
          <div className="flex justify-between items-center text-[9px] text-text-muted/65 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              Cập nhật
            </span>
            <span>
              {new Date(task.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
