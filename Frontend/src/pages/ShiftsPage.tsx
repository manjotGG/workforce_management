import React, { useState } from 'react';
import { Clock, Plus, Edit2, Trash2, Moon, Sun, Users } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Shift } from '../types';

interface ShiftsPageProps {
  shifts: Shift[];
  currentUserRole?: string;
  onAddShift: (data: Partial<Shift>) => Promise<void>;
  onUpdateShift: (id: number, data: Partial<Shift>) => Promise<void>;
  onDeleteShift: (id: number) => Promise<void>;
}

export const ShiftsPage: React.FC<ShiftsPageProps> = ({
  shifts,
  currentUserRole,
  onAddShift,
  onUpdateShift,
  onDeleteShift,
}) => {
  const isAdmin = currentUserRole === 'ADMIN';
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    start_time: '09:00',
    end_time: '17:30',
    is_overnight: false,
    is_active: true,
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      start_time: '09:00',
      end_time: '17:30',
      is_overnight: false,
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      start_time: shift.start_time.substring(0, 5),
      end_time: shift.end_time.substring(0, 5),
      is_overnight: shift.is_overnight,
      is_active: shift.is_active,
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddShift({
        name: formData.name,
        start_time: `${formData.start_time}:00`,
        end_time: `${formData.end_time}:00`,
        is_overnight: formData.is_overnight,
        is_active: formData.is_active,
      });
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;
    setIsSubmitting(true);
    try {
      await onUpdateShift(editingShift.id, {
        name: formData.name,
        start_time: `${formData.start_time}:00`,
        end_time: `${formData.end_time}:00`,
        is_overnight: formData.is_overnight,
        is_active: formData.is_active,
      });
      setEditingShift(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Shift & Roster Management</h2>
            <p className="text-xs text-slate-400">Total {shifts.length} active shift timings and work hours</p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Create Shift
          </button>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            Read-Only Mode ({currentUserRole?.replace('_', ' ')})
          </span>
        )}
      </div>

      {/* Grid of Shifts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between relative group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    shift.is_overnight
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {shift.is_overnight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(shift)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete ${shift.name}?`)) {
                          await onDeleteShift(shift.id);
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>


              <h3 className="text-lg font-bold text-slate-100 mt-4">{shift.name}</h3>

              <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-500 uppercase font-semibold block">Start Time</span>
                  <span className="text-sm font-bold text-slate-200">{shift.start_time}</span>
                </div>
                <div className="h-6 w-[1px] bg-slate-800"></div>
                <div className="text-xs text-right">
                  <span className="text-slate-500 uppercase font-semibold block">End Time</span>
                  <span className="text-sm font-bold text-slate-200">{shift.end_time}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-4 h-4 text-brand-400" />
                <span className="font-bold text-slate-100">{shift.employee_count || 0}</span> Employees Assigned
              </span>

              {shift.is_overnight && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-semibold">
                  Overnight Shift
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Shift Schedule">
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Shift Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="overnight"
              checked={formData.is_overnight}
              onChange={(e) => setFormData({ ...formData, is_overnight: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
            />
            <label htmlFor="overnight" className="text-sm font-medium text-slate-300">
              Is Overnight Shift (crosses midnight)
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Shift'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingShift} onClose={() => setEditingShift(null)} title="Edit Shift Schedule">
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Shift Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="overnight-edit"
              checked={formData.is_overnight}
              onChange={(e) => setFormData({ ...formData, is_overnight: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
            />
            <label htmlFor="overnight-edit" className="text-sm font-medium text-slate-300">
              Is Overnight Shift (crosses midnight)
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingShift(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Shift'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
