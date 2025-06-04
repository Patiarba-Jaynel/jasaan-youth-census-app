
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

  async getActivityLogs() {
    try {
      const records = await pbClient.collection('activity_logs').getFullList({
        sort: '-created'
      });
      return { items: records as ActivityLog[], totalItems: records.length, totalPages: 1 };
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      return { items: [], totalItems: 0, totalPages: 0 };
    }
  }
};
