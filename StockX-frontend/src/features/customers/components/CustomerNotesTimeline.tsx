'use client';

import React, { useState } from 'react';
import { CustomerNote } from '../types/customers.types';
import { addCustomerNote } from '../services/customers.service';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';
import { useToast } from '@/components/ui/Toast';
import { MessageSquare, Plus, User, Clock, Loader2 } from 'lucide-react';

interface CustomerNotesTimelineProps {
  customerId: string;
  initialNotes: CustomerNote[];
}

export function CustomerNotesTimeline({ customerId, initialNotes }: CustomerNotesTimelineProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<CustomerNote[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setLoading(true);
    const { data, error } = await addCustomerNote(customerId, newNote.trim());
    setLoading(false);

    if (error) {
      showToast(error, 'error');
    } else if (data) {
      showToast('Note added to timeline!', 'success');
      setNotes((prev) => [data, ...prev]);
      setNewNote('');
    }
  };

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="bg-[#141416] border border-[#27272A] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-400" />
          <span>Follow-Up Notes Timeline</span>
        </h3>
        <span className="text-xs text-gray-400 font-mono">{notes.length} Notes</span>
      </div>

      {/* Add Note Form - Permission Gated */}
      <RequirePermission permission={PERMISSIONS.CUSTOMER_UPDATE}>
        <form onSubmit={handleAddNote} className="space-y-2.5">
          <textarea
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add follow-up notes, call summaries, or customer updates..."
            className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-xs text-white placeholder:text-gray-500 focus:border-brand-500 focus:outline-none resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !newNote.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add Note</span>
            </button>
          </div>
        </form>
      </RequirePermission>

      {/* Timeline List */}
      <div className="space-y-3 pt-1">
        {sortedNotes.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">No timeline notes recorded yet.</p>
        ) : (
          sortedNotes.map((noteItem) => (
            <div
              key={noteItem.id}
              className="p-3 bg-[#1C1C20]/70 border border-[#27272A] rounded-lg space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1 font-medium text-gray-300">
                  <User className="w-3 h-3 text-brand-400" />
                  <span>{noteItem.createdBy?.name || noteItem.user?.name || 'Staff Member'}</span>
                </span>
                <span className="flex items-center gap-1 font-mono text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(noteItem.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
              </div>
              <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                {noteItem.note}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
