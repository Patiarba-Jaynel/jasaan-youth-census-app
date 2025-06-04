
import PocketBase from 'pocketbase';
import { activityLogger } from './activity-logger';

// Create a PocketBase client instance
const pb = new PocketBase('https://pocket.jwisnetwork.com');

export interface YouthRecord {
  id: string;
  region: string;
  province: string;
  city_municipality: string;
  barangay: string;
  name: string;
  age: string;
  birthday: Date;
  sex: "Male" | "Female";
  civil_status: "Single" | "Married" | "Lived-In" | "Widowed";
  youth_classification: "ISY" | "OSY" | "WY" | "YSN";
  youth_age_group: "Core Youth (18-24)" | "Child Youth (15-17)" | "Young Adult (25-30)";
  email_address: string;
  contact_number: string;
  home_address: string;
  highest_education: string;
  work_status: string;
  registered_voter: string;
  voted_last_election: string;
  attended_kk_assembly: string;
  kk_assemblies_attended: number;
  batch_id?: string;
  created: string;
  updated: string;
}

export interface ConsolidatedData {
  id: string;
  barangay: string;
  age_bracket: string;
  gender: string;
  year: number;
  month: string;
  count: number;
  batch_id?: string;
  created: string;
  updated: string;
}

type RecordModel = {
  id: string;
  created: string;
  updated: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const pbClient = {
  // Raw PocketBase instance access
  collection: (name: string) => pb.collection(name),
  
  // Authentication methods
  auth: {
    login: async (email: string, password: string) => {
      return await pb.collection('users').authWithPassword(email, password);
    },
    logout: () => {
      pb.authStore.clear();
    },
    get isValid() {
      return pb.authStore.isValid;
    },
    isLoggedIn: () => {
      return pb.authStore.isValid;
    },
    getAuthData: () => {
      return {
        record: pb.authStore.model,
        token: pb.authStore.token
      };
    }
  },
  
  // Youth census records with activity logging
  youth: {
    create: async (data: Omit<YouthRecord, 'id' | 'created' | 'updated'>) => {
      console.log('Creating youth record with data:', data);
      const record = await pb.collection('youth').create(data);
      console.log('Created youth record:', record);
      await activityLogger.logYouthCreate(record.id, data.name, data.batch_id);
      console.log('Logged youth creation activity');
      return record;
    },
    createMany: async (records: Omit<YouthRecord, 'id' | 'created' | 'updated'>[], batchId?: string) => {
      const createdRecords = [];
      for (const record of records) {
        try {
          const recordWithBatch = batchId ? { ...record, batch_id: batchId } : record;
          const createdRecord = await pb.collection('youth').create(recordWithBatch);
          createdRecords.push(createdRecord);
          await activityLogger.logYouthCreate(createdRecord.id, record.name, batchId);
        } catch (error) {
          console.error("Error creating record:", error);
          throw error;
        }
      }
      
      if (batchId) {
        await activityLogger.logBatchImport(batchId, createdRecords.length);
      }
      
      return createdRecords;
    },
    getAll: async () => {
      return await pb.collection('youth').getFullList<YouthRecord>();
    },
    getOne: async (id: string) => {
      return await pb.collection('youth').getOne<YouthRecord>(id);
    },
    update: async (id: string, data: Partial<YouthRecord>) => {
      const record = await pb.collection('youth').update(id, data);
      const currentRecord = await pb.collection('youth').getOne(id);
      await activityLogger.logYouthUpdate(id, currentRecord.name, data);
      return record;
    },
    delete: async (id: string) => {
      const record = await pb.collection('youth').getOne(id);
      await pb.collection('youth').delete(id);
      await activityLogger.logYouthDelete(id, record.name);
      return record;
    }
  },
  
  // Consolidated data methods with improved error handling
  consolidated: {
    create: async (data: Omit<ConsolidatedData, 'id' | 'created' | 'updated'>) => {
      try {
        console.log('Creating consolidated record with data:', data);
        
        // Ensure all required fields are present and properly formatted
        const cleanData = {
          barangay: String(data.barangay).trim(),
          age_bracket: String(data.age_bracket).trim(),
          gender: String(data.gender).trim(),
          year: Number(data.year),
          month: String(data.month).trim(),
          count: Number(data.count)
        };
        
        // Validate required fields
        if (!cleanData.barangay || !cleanData.age_bracket || !cleanData.gender || 
            !cleanData.year || !cleanData.month || cleanData.count < 0) {
          throw new Error('Missing or invalid required fields for consolidated data');
        }
        
        console.log('Clean data for creation:', cleanData);
        const record = await pb.collection('consolidated_data').create(cleanData);
        console.log('Created consolidated record:', record);
        
        await activityLogger.logConsolidatedCreate(
          record.id, 
          cleanData.barangay, 
          `${cleanData.age_bracket} - ${cleanData.gender} (${cleanData.count} records)`
        );
        
        return record;
      } catch (error) {
        console.error('Error creating consolidated record:', error);
        throw error;
      }
    },
    createMany: async (records: Omit<ConsolidatedData, 'id' | 'created' | 'updated'>[], batchId?: string) => {
      const createdRecords = [];
      for (const record of records) {
        try {
          const recordWithBatch = batchId ? { ...record, batch_id: batchId } : record;
          const createdRecord = await pb.collection('consolidated_data').create(recordWithBatch);
          createdRecords.push(createdRecord);
          await activityLogger.logConsolidatedCreate(createdRecord.id, record.barangay, `${record.age_bracket} - ${record.gender} (${record.count} records) - Batch: ${batchId}`);
        } catch (error) {
          console.error("Error creating consolidated record:", error);
          throw error;
        }
      }
      
      if (batchId) {
        await activityLogger.logConsolidatedImport(batchId, createdRecords.length);
      }
      
      return createdRecords;
    },
    getAll: async () => {
      try {
        return await pb.collection('consolidated_data').getFullList<ConsolidatedData>();
      } catch (error) {
        console.error('Error fetching consolidated data:', error);
        throw error;
      }
    },
    getOne: async (id: string) => {
      try {
        return await pb.collection('consolidated_data').getOne<ConsolidatedData>(id);
      } catch (error) {
        console.error('Error fetching consolidated record:', error);
        throw error;
      }
    },
    update: async (id: string, data: Partial<ConsolidatedData>) => {
      try {
        console.log('Updating consolidated record with ID:', id, 'Data:', data);
        
        // Clean and validate the update data
        const cleanData: any = {};
        if (data.barangay !== undefined) cleanData.barangay = String(data.barangay).trim();
        if (data.age_bracket !== undefined) cleanData.age_bracket = String(data.age_bracket).trim();
        if (data.gender !== undefined) cleanData.gender = String(data.gender).trim();
        if (data.year !== undefined) cleanData.year = Number(data.year);
        if (data.month !== undefined) cleanData.month = String(data.month).trim();
        if (data.count !== undefined) cleanData.count = Number(data.count);
        
        console.log('Clean data for update:', cleanData);
        
        // Get current record for logging
        const currentRecord = await pb.collection('consolidated_data').getOne(id);
        console.log('Current record before update:', currentRecord);
        
        const record = await pb.collection('consolidated_data').update(id, cleanData);
        console.log('Updated consolidated record:', record);
        
        await activityLogger.logConsolidatedUpdate(id, currentRecord.barangay, cleanData);
        return record;
      } catch (error) {
        console.error('Error updating consolidated record:', error);
        throw error;
      }
    },
    delete: async (id: string) => {
      try {
        console.log('Deleting consolidated record with ID:', id);
        const record = await pb.collection('consolidated_data').getOne(id);
        console.log('Record to delete:', record);
        
        await pb.collection('consolidated_data').delete(id);
        console.log('Successfully deleted consolidated record');
        
        await activityLogger.logConsolidatedDelete(id, record.barangay);
        return record;
      } catch (error) {
        console.error('Error deleting consolidated record:', error);
        throw error;
      }
    }
  },
  
  // Analytics data
  analytics: {
    getDistributionByBarangay: async () => {
      const records = await pb.collection('youth').getFullList<YouthRecord>();
      const distribution = records.reduce((acc: { [key: string]: number }, record) => {
        if (!acc[record.barangay]) {
          acc[record.barangay] = 0;
        }
        acc[record.barangay]++;
        return acc;
      }, {});
      
      return distribution;
    },
    
    getDistributionByAge: async () => {
      const records = await pb.collection('youth').getFullList<YouthRecord>();
      const distribution = records.reduce((acc: { [key: string]: number }, record) => {
        if (!acc[record.youth_age_group]) {
          acc[record.youth_age_group] = 0;
        }
        acc[record.youth_age_group]++;
        return acc;
      }, {});
      
      return distribution;
    },
    
    getDistributionByClassification: async () => {
      const records = await pb.collection('youth').getFullList<YouthRecord>();
      const distribution = records.reduce((acc: { [key: string]: number }, record) => {
        if (!acc[record.youth_classification]) {
          acc[record.youth_classification] = 0;
        }
        acc[record.youth_classification]++;
        return acc;
      }, {});
      
      return distribution;
    }
  }
};
