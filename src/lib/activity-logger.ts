
import { pbClient } from './pb-client';

export interface ActivityLog {
  id: string;
  action: string;
  blame: string;
  created: string;
  updated: string;
}

export const activityLogger = {
  async log(action: string, blame: string) {
    try {
      const logData = {
        action,
        blame
      };
      
      console.log('Logging activity:', logData);
      const result = await pbClient.collection('activity_logs').create(logData);
      console.log('Activity logged successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to log activity:', error);
      return null;
    }
  },

  async logYouthCreate(youthName: string, userName: string) {
    return this.log(`CREATE: Added youth record for ${youthName}`, userName);
  },

  async logYouthUpdate(youthName: string, userName: string) {
    return this.log(`UPDATE: Modified youth record for ${youthName}`, userName);
  },

  async logYouthDelete(youthName: string, userName: string) {
    return this.log(`DELETE: Removed youth record for ${youthName}`, userName);
  },

  async logBatchImport(count: number, userName: string) {
    return this.log(`IMPORT: Batch imported ${count} youth records`, userName);
  },

  async logConsolidatedCreate(barangay: string, userName: string) {
    return this.log(`CREATE: Added consolidated data for ${barangay}`, userName);
  },

  async logConsolidatedUpdate(barangay: string, userName: string) {
    return this.log(`UPDATE: Modified consolidated data for ${barangay}`, userName);
  },

  async logConsolidatedDelete(barangay: string, userName: string) {
    return this.log(`DELETE: Removed consolidated data for ${barangay}`, userName);
  },

  async logConsolidatedBatchImport(count: number, userName: string) {
    return this.log(`IMPORT: Batch imported ${count} consolidated records`, userName);
  },

  async getActivityLogs() {
    try {
      const records = await pbClient.collection('activity_logs').getFullList({
        sort: '-created'
      });
      
      // Properly convert RecordModel to ActivityLog
      const activityLogs: ActivityLog[] = records.map(record => ({
        id: record.id,
        action: record.action || '',
        blame: record.blame || '',
        created: record.created || '',
        updated: record.updated || ''
      }));
      
      return { items: activityLogs, totalItems: activityLogs.length, totalPages: 1 };
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      return { items: [], totalItems: 0, totalPages: 0 };
    }
  }
};
