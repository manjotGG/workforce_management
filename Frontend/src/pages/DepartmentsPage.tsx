import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, Layers } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Department } from '../types';

interface DepartmentsPageProps {
  departments: Department[];
  currentUserRole?: string;
  onAddDepartment: (data: Partial<Department>) => Promise<void>;
  onUpdateDepartment: (id: number, data: Partial<Department>) => Promise<void>;
  onDeleteDepartment: (id: number) => Promise<void>;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  departments,
  currentUserRole,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}) => {
  const isAdmin = currentUserRole === 'ADMIN';
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '', is_active: true });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      is_active: dept.is_active,
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddDepartment(formData);
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setIsSubmitting(true);
    try {
      await onUpdateDepartment(editingDept.id, formData);
      setEditingDept(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Department Management</h2>
            <p className="text-xs text-slate-400">Total {departments.length} registered operational departments</p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            Read-Only Mode ({currentUserRole?.replace('_', ' ')})
          </span>
        )}
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between relative group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
                  {dept.name.charAt(0)}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete ${dept.name}?`)) {
                          try {
                            await onDeleteDepartment(dept.id);
                          } catch (err: any) {
                            alert(err.response?.data?.detail || 'Cannot delete department');
                          }
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>


              <h3 className="text-lg font-bold text-slate-100 mt-4">{dept.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {dept.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-4 h-4 text-brand-400" />
                <span className="font-bold text-slate-100">{dept.employee_count || 0}</span> Staff Allocated
              </span>

              <span
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                  dept.is_active
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {dept.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Department">
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Department Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
            />
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingDept} onClose={() => setEditingDept(null)} title="Edit Department">
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Department Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingDept(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
