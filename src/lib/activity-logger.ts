
import { pbClient } from './pb-client';

export interface ActivityLog {
  id: string;
  action: string;
  blame: string;
  created: string;
  updated: string;
}

export interface UserLog {
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

  async logUser(action: string, blame: string) {
    try {
      const logData = {
        action,
        blame
      };
      
      console.log('Logging user activity:', logData);
      const result = await pbClient.collection('user_logs').create(logData);
      console.log('User activity logged successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to log user activity:', error);
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

  async logUserLogin(userName: string) {
    return this.logUser(`LOGIN: User logged in`, userName);
  },

  async logUserLogout(userName: string) {
    return this.logUser(`LOGOUT: User logged out`, userName);
  },

  async logUserCreate(createdUserName: string, adminName: string) {
    return this.logUser(`CREATE: Added new user ${createdUserName}`, adminName);
  },

  async logUserUpdate(updatedUserName: string, adminName: string) {
    return this.logUser(`UPDATE: Modified user ${updatedUserName}`, adminName);
  },

  async logUserDelete(deletedUserName: string, adminName: string) {
    return this.logUser(`DELETE: Removed user ${deletedUserName}`, adminName);
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
  },

  async getUserLogs() {
    try {
      const records = await pbClient.collection('user_logs').getFullList({
        sort: '-created'
      });
      
      // Properly convert RecordModel to UserLog
      const userLogs: UserLog[] = records.map(record => ({
        id: record.id,
        action: record.action || '',
        blame: record.blame || '',
        created: record.created || '',
        updated: record.updated || ''
      }));
      
      return { items: userLogs, totalItems: userLogs.length, totalPages: 1 };
    } catch (error) {
      console.error('Failed to fetch user logs:', error);
      return { items: [], totalItems: 0, totalPages: 0 };
    }
  }
};
