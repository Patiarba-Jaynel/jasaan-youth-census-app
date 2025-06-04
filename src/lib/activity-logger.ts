
import { pbClient } from './pb-client';

interface ActivityLog {
  action: string;
  blame: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  batch_id?: string;
}

export const activityLogger = {
  async log(action: string, blame: string, entityType?: string, entityId?: string, details?: string, batchId?: string) {
    try {
      const logData: ActivityLog = {
        action,
        blame,
        entity_type: entityType,
        entity_id: entityId,
        details,
        batch_id: batchId
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

  async logYouthCreate(youthId: string, youthName: string, userName: string, batchId?: string) {
    return await this.log(
      'CREATE',
      userName,
      'youth',
      youthId,
      `Created youth record: ${youthName}`,
      batchId
    );
  },

  async logYouthUpdate(youthId: string, youthName: string, userName: string, changes?: string) {
    return await this.log(
      'UPDATE',
      userName,
      'youth',
      youthId,
      `Updated youth record: ${youthName}${changes ? ` - ${changes}` : ''}`
    );
  },

  async logYouthDelete(youthId: string, youthName: string, userName: string) {
    return await this.log(
      'DELETE',
      userName,
      'youth',
      youthId,
      `Deleted youth record: ${youthName}`
    );
  },

  async logBatchImport(recordCount: number, userName: string, batchId: string) {
    return await this.log(
      'IMPORT',
      userName,
      'batch',
      batchId,
      `Imported ${recordCount} youth records`,
      batchId
    );
  },

  async logConsolidatedCreate(recordId: string, userName: string, details: string) {
    return await this.log(
      'CREATE',
      userName,
      'consolidated_data',
      recordId,
      `Created consolidated record: ${details}`
    );
  },

  async logConsolidatedUpdate(recordId: string, userName: string, details: string) {
    return await this.log(
      'UPDATE',
      userName,
      'consolidated_data',
      recordId,
      `Updated consolidated record: ${details}`
    );
  },

  async logConsolidatedDelete(recordId: string, userName: string, details: string) {
    return await this.log(
      'DELETE',
      userName,
      'consolidated_data',
      recordId,
      `Deleted consolidated record: ${details}`
    );
  },

  async getActivityLogs() {
    try {
      const records = await pbClient.collection('activity_logs').getFullList({
        sort: '-created'
      });
      return { items: records, totalItems: records.length, totalPages: 1 };
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      return { items: [], totalItems: 0, totalPages: 0 };
    }
  }
};
