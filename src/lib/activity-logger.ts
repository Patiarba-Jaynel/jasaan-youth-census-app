
import { pbClient } from './pb-client';

export interface ActivityLog {
  id?: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'LOGIN' | 'LOGOUT';
  entity_type: 'youth' | 'user' | 'consolidated' | 'session';
  entity_id: string;
  entity_name: string;
  user_id: string;
  user_name: string;
  details: string;
  batch_id?: string;
  timestamp: string;
  created?: string;
  updated?: string;
}

export const activityLogger = {
  async log(activity: Omit<ActivityLog, 'id' | 'timestamp' | 'created' | 'updated'>) {
    try {
      const authData = pbClient.auth.getAuthData();
      if (!authData?.record) {
        console.warn('No authenticated user for activity logging');
        return;
      }

      const logEntry: Omit<ActivityLog, 'id' | 'created' | 'updated'> = {
        ...activity,
        user_id: authData.record.id,
        user_name: authData.record.name || authData.record.email,
        timestamp: new Date().toISOString()
      };

      await pbClient.collection('activity_logs').create(logEntry);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Youth operations
  async logYouthCreate(youthId: string, youthName: string, batchId?: string) {
    await this.log({
      action: 'CREATE',
      entity_type: 'youth',
      entity_id: youthId,
      entity_name: youthName,
      details: batchId ? `Youth record created via batch import (batch: ${batchId})` : 'Youth record created manually',
      batch_id: batchId
    });
  },

  async logYouthUpdate(youthId: string, youthName: string, changes: Record<string, any>) {
    const changedFields = Object.keys(changes).join(', ');
    await this.log({
      action: 'UPDATE',
      entity_type: 'youth',
      entity_id: youthId,
      entity_name: youthName,
      details: `Updated fields: ${changedFields}`
    });
  },

  async logYouthDelete(youthId: string, youthName: string, batchId?: string) {
    await this.log({
      action: 'DELETE',
      entity_type: 'youth',
      entity_id: youthId,
      entity_name: youthName,
      details: batchId ? `Youth record deleted via batch operation (batch: ${batchId})` : 'Youth record deleted manually',
      batch_id: batchId
    });
  },

  async logBatchImport(batchId: string, recordCount: number) {
    await this.log({
      action: 'IMPORT',
      entity_type: 'youth',
      entity_id: batchId,
      entity_name: `Batch ${batchId}`,
      details: `Imported ${recordCount} youth records`,
      batch_id: batchId
    });
  },

  // Consolidated data operations
  async logConsolidatedCreate(recordId: string, barangay: string, details: string) {
    await this.log({
      action: 'CREATE',
      entity_type: 'consolidated',
      entity_id: recordId,
      entity_name: `${barangay} Record`,
      details: details
    });
  },

  async logConsolidatedUpdate(recordId: string, barangay: string, changes: Record<string, any>) {
    const changedFields = Object.keys(changes).join(', ');
    await this.log({
      action: 'UPDATE',
      entity_type: 'consolidated',
      entity_id: recordId,
      entity_name: `${barangay} Record`,
      details: `Updated fields: ${changedFields}`
    });
  },

  async logConsolidatedDelete(recordId: string, barangay: string) {
    await this.log({
      action: 'DELETE',
      entity_type: 'consolidated',
      entity_id: recordId,
      entity_name: `${barangay} Record`,
      details: 'Consolidated record deleted manually'
    });
  },

  async logConsolidatedImport(batchId: string, recordCount: number) {
    await this.log({
      action: 'IMPORT',
      entity_type: 'consolidated',
      entity_id: batchId,
      entity_name: `Consolidated Batch ${batchId}`,
      details: `Imported ${recordCount} consolidated records`,
      batch_id: batchId
    });
  },

  // User operations
  async logUserCreate(userId: string, userName: string, userEmail: string) {
    await this.log({
      action: 'CREATE',
      entity_type: 'user',
      entity_id: userId,
      entity_name: userName,
      details: `User created with email: ${userEmail}`
    });
  },

  async logUserUpdate(userId: string, userName: string, changes: Record<string, any>) {
    const changedFields = Object.keys(changes).join(', ');
    await this.log({
      action: 'UPDATE',
      entity_type: 'user',
      entity_id: userId,
      entity_name: userName,
      details: `Updated user fields: ${changedFields}`
    });
  },

  async logUserDelete(userId: string, userName: string) {
    await this.log({
      action: 'DELETE',
      entity_type: 'user',
      entity_id: userId,
      entity_name: userName,
      details: 'User account deleted'
    });
  },

  // Session operations
  async logLogin(userId: string, userName: string) {
    await this.log({
      action: 'LOGIN',
      entity_type: 'session',
      entity_id: userId,
      entity_name: userName,
      details: 'User logged in'
    });
  },

  async logLogout(userId: string, userName: string) {
    await this.log({
      action: 'LOGOUT',
      entity_type: 'session',
      entity_id: userId,
      entity_name: userName,
      details: 'User logged out'
    });
  },

  async getActivityLogs(limit = 100) {
    try {
      return await pbClient.collection('activity_logs').getList(1, limit, {
        sort: '-created'
      });
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      return { items: [], totalItems: 0, totalPages: 0 };
    }
  },

  async getBatchLogs() {
    try {
      return await pbClient.collection('activity_logs').getFullList({
        filter: 'batch_id != ""',
        sort: '-created'
      });
    } catch (error) {
      console.error('Failed to fetch batch logs:', error);
      return [];
    }
  },

  async getConsolidatedLogs() {
    try {
      return await pbClient.collection('activity_logs').getFullList({
        filter: 'entity_type = "consolidated"',
        sort: '-created'
      });
    } catch (error) {
      console.error('Failed to fetch consolidated logs:', error);
      return [];
    }
  },

  async getUserLogs() {
    try {
      return await pbClient.collection('activity_logs').getFullList({
        filter: 'entity_type = "user" || entity_type = "session"',
        sort: '-created'
      });
    } catch (error) {
      console.error('Failed to fetch user logs:', error);
      return [];
    }
  },

  async deleteBatch(batchId: string) {
    try {
      // Get all records in this batch
      const batchRecords = await pbClient.collection('youth').getFullList({
        filter: `batch_id = "${batchId}"`
      });

      // Delete all youth records in this batch
      for (const record of batchRecords) {
        await pbClient.youth.delete(record.id);
        await this.logYouthDelete(record.id, record.name, batchId);
      }

      // Log the batch deletion
      await this.log({
        action: 'DELETE',
        entity_type: 'youth',
        entity_id: batchId,
        entity_name: `Batch ${batchId}`,
        details: `Deleted batch with ${batchRecords.length} records`,
        batch_id: batchId
      });

      return { success: true, deletedCount: batchRecords.length };
    } catch (error) {
      console.error('Failed to delete batch:', error);
      return { success: false, error };
    }
  }
};
