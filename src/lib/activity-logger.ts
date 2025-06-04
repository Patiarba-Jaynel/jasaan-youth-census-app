
// This file is now empty since activity_logs collection doesn't exist
// All activity logging has been disabled

export const activityLogger = {
  // Disabled logging methods - no-op functions
  async log() { return null; },
  async logYouthCreate() { return null; },
  async logYouthUpdate() { return null; },
  async logYouthDelete() { return null; },
  async logBatchImport() { return null; },
  async logConsolidatedCreate() { return null; },
  async logConsolidatedUpdate() { return null; },
  async logConsolidatedDelete() { return null; },
  async logConsolidatedImport() { return null; },
  async logUserCreate() { return null; },
  async logUserUpdate() { return null; },
  async logUserDelete() { return null; },
  async logLogin() { return null; },
  async logLogout() { return null; },
  async getActivityLogs() { return { items: [], totalItems: 0, totalPages: 0 }; },
  async getBatchLogs() { return []; },
  async getConsolidatedLogs() { return []; },
  async getUserLogs() { return []; },
  async deleteBatch() { return { success: false, error: 'Activity logging disabled' }; }
};
