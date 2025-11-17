import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLogEntry {
  action: 'created' | 'updated' | 'deleted' | 'marked_arrived' | 'qr_generated' | 'form_submitted';
  tableName: string;
  recordId: string;
  changes?: Record<string, unknown>;
}

export function useAuditLog() {
  const { user } = useAuth();

  const logAction = useCallback(
    async (entry: AuditLogEntry) => {
      if (!user) {
        console.warn('User not authenticated, skipping audit log');
        return;
      }

      try {
        const { error } = await supabase.from('audit_log').insert({
          user_id: user.id,
          action: entry.action,
          table_name: entry.tableName,
          record_id: entry.recordId,
          changes: entry.changes || null,
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error logging audit action:', error);
        }
      } catch (err) {
        console.error('Error logging audit action:', err);
      }
    },
    [user]
  );

  return { logAction };
}
