import React, { useState } from 'react';
import { Plus, Loader2, Upload, FileText, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api.ts';

export const TaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (file) formData.append('file', file);

    try {
      const response = await apiFetch('/api/tasks', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setFile(null);
        // Dispatch custom event for immediate local update
        window.dispatchEvent(new CustomEvent('tasks-changed'));
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="geo-card"
    >
      <h2 className="geo-card-title flex items-center gap-2 text-text-main font-bold">
        <span className="p-1.5 bg-brand/10 text-brand rounded-lg">
          <Plus className="w-4 h-4" />
        </span>
        Tạo Việc Mới
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-text-muted mb-1.5 tracking-wider font-display">Tiêu đề</label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="premium-input pl-10"
              placeholder="Nhập tiêu đề công việc..."
              required
            />
            <CheckSquare className="absolute left-3.5 top-3 w-4 h-4 text-text-muted/50" />
          </div>
        </div>
        
        <div>
          <label className="block text-[10px] uppercase font-bold text-text-muted mb-1.5 tracking-wider font-display">Mô tả</label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="premium-input pl-10 min-h-[90px] resize-none"
              placeholder="Chi tiết công việc..."
              rows={3}
            />
            <FileText className="absolute left-3.5 top-3 w-4 h-4 text-text-muted/50" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-text-muted mb-1.5 tracking-wider font-display">Đính kèm</label>
          <div className="relative group">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="task-file-upload"
            />
            <label 
              htmlFor="task-file-upload"
              className="flex flex-col items-center justify-center gap-2 w-full px-4 py-6 border border-dashed border-input-border bg-input-bg/40 text-text-muted text-xs font-bold uppercase tracking-widest cursor-pointer hover:border-brand hover:bg-brand/5 hover:text-brand rounded-2xl transition-all duration-300 shadow-sm"
            >
              <Upload className="w-5 h-5 mb-1 text-text-muted group-hover:text-brand transition-colors" />
              {file ? (
                <span className="text-[11px] text-brand lowercase font-normal truncate max-w-[200px]">{file.name}</span>
              ) : (
                <span className="text-[10px]">Chọn file đính kèm...</span>
              )}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="geo-btn-primary w-full flex items-center justify-center gap-2 py-3 mt-3 shadow-lg shadow-brand/25"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          LƯU CÔNG VIỆC
        </button>
      </form>
    </motion.div>
  );
};
