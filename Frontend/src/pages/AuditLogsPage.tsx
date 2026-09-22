import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Activity, Clock } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsPageProps {
  auditLogs: AuditLog[];
}

export const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ auditLogs }) => {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.username && log.username.toLowerCase().includes(search.toLowerCase())) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(search.toLowerCase()));

    const matchesEntity = entityFilter === 'ALL' || log.entity_type === entityFilter;

    return matchesSearch && matchesEntity;
  });

  const entityTypes = Array.from(
    new Set(auditLogs.map((l) => l.entity_type).filter(Boolean))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">System Audit Trail</h2>
            <p className="text-xs text-slate-400">Security audit history, entity modifications, and user activity</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="ALL">All Entity Types</option>
          {entityTypes.map((et) => (
            <option key={et} value={et as string}>
              {et}
            </option>
          ))}
        </select>
      </div>

      {/* Audit List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity Type & ID</th>
                <th className="px-6 py-4">Triggered By</th>
                <th className="px-6 py-4">Payload Summary</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono text-xs">
                    <span className="text-slate-200 font-bold">{log.entity_type || 'System'}</span>
                    {log.entity_id && <span className="text-slate-400"> #{log.entity_id}</span>}
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-200">{log.username || 'System Admin'}</span>
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-slate-400 max-w-xs truncate">
                    {log.new_values ? JSON.stringify(log.new_values) : '-'}
                  </td>

                  <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                    {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : 'Recent'}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No system audit logs found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
