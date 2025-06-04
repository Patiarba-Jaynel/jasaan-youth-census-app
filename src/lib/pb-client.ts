
import PocketBase from 'pocketbase';

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
  
  // Youth census records
  youth: {
    create: async (data: Omit<YouthRecord, 'id' | 'created' | 'updated'>) => {
      console.log('Creating youth record with data:', data);
      const record = await pb.collection('youth').create(data);
      console.log('Created youth record:', record);
      return record;
    },
    createMany: async (records: Omit<YouthRecord, 'id' | 'created' | 'updated'>[], batchId?: string) => {
      const createdRecords = [];
      for (const record of records) {
        try {
          const recordWithBatch = batchId ? { ...record, batch_id: batchId } : record;
          const createdRecord = await pb.collection('youth').create(recordWithBatch);
          createdRecords.push(createdRecord);
        } catch (error) {
          console.error("Error creating record:", error);
          throw error;
        }
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
      return record;
    },
    delete: async (id: string) => {
      const record = await pb.collection('youth').getOne(id);
      await pb.collection('youth').delete(id);
      return record;
    }
  },
  
  // Consolidated data methods with enhanced error handling and validation
  consolidated: {
    create: async (data: Omit<ConsolidatedData, 'id' | 'created' | 'updated'>) => {
      try {
        console.log('Creating consolidated record with data:', data);
        
        // Validate and sanitize input data
        const sanitizedData = {
          barangay: String(data.barangay || '').trim(),
          age_bracket: String(data.age_bracket || '').trim(),
          gender: String(data.gender || '').trim(),
          year: parseInt(String(data.year)) || new Date().getFullYear(),
          month: String(data.month || '').trim(),
          count: parseInt(String(data.count)) || 0
        };
        
        console.log('Sanitized data:', sanitizedData);
        
        // Validate required fields
        if (!sanitizedData.barangay) {
          throw new Error('Barangay is required');
        }
        if (!sanitizedData.age_bracket) {
          throw new Error('Age bracket is required');
        }
        if (!sanitizedData.gender) {
          throw new Error('Gender is required');
        }
        if (!sanitizedData.month) {
          throw new Error('Month is required');
        }
        if (sanitizedData.count < 0) {
          throw new Error('Count must be a non-negative number');
        }
        if (sanitizedData.year < 2020 || sanitizedData.year > 2030) {
          throw new Error('Year must be between 2020 and 2030');
        }
        
        // Create the record
        const record = await pb.collection('consolidated_data').create(sanitizedData);
        console.log('Successfully created consolidated record:', record);
        
        return record;
      } catch (error) {
        console.error('Error creating consolidated record:', error);
        // Re-throw with more specific error message
        if (error.message && error.message.includes('collection')) {
          throw new Error('Database connection error. Please try again.');
        }
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
        } catch (error) {
          console.error("Error creating consolidated record:", error);
          throw error;
        }
      }
      
      return createdRecords;
    },
    
    getAll: async () => {
      try {
        console.log('Fetching all consolidated data...');
        const records = await pb.collection('consolidated_data').getFullList<ConsolidatedData>({
          sort: 'barangay,age_bracket,gender'
        });
        console.log('Successfully fetched consolidated data:', records.length, 'records');
        return records;
      } catch (error) {
        console.error('Error fetching consolidated data:', error);
        throw new Error('Failed to fetch consolidated data. Please refresh and try again.');
      }
    },
    
    getOne: async (id: string) => {
      try {
        console.log('Fetching consolidated record:', id);
        if (!id || typeof id !== 'string') {
          throw new Error('Invalid record ID');
        }
        const record = await pb.collection('consolidated_data').getOne<ConsolidatedData>(id);
        console.log('Successfully fetched consolidated record:', record);
        return record;
      } catch (error) {
        console.error('Error fetching consolidated record:', error);
        if (error.status === 404) {
          throw new Error('Record not found. It may have been deleted.');
        }
        throw new Error('Failed to fetch record details.');
      }
    },
    
    update: async (id: string, data: Partial<ConsolidatedData>) => {
      try {
        console.log('Updating consolidated record:', id, 'with data:', data);
        
        // Validate ID
        if (!id || typeof id !== 'string') {
          throw new Error('Invalid record ID');
        }
        
        // Check if record exists first
        let currentRecord;
        try {
          currentRecord = await pb.collection('consolidated_data').getOne(id);
          console.log('Found existing record:', currentRecord);
        } catch (error) {
          if (error.status === 404) {
            throw new Error('Record not found. It may have been deleted.');
          }
          throw error;
        }
        
        // Sanitize and validate update data
        const sanitizedData: any = {};
        
        if (data.barangay !== undefined) {
          sanitizedData.barangay = String(data.barangay).trim();
          if (!sanitizedData.barangay) {
            throw new Error('Barangay cannot be empty');
          }
        }
        
        if (data.age_bracket !== undefined) {
          sanitizedData.age_bracket = String(data.age_bracket).trim();
          if (!sanitizedData.age_bracket) {
            throw new Error('Age bracket cannot be empty');
          }
        }
        
        if (data.gender !== undefined) {
          sanitizedData.gender = String(data.gender).trim();
          if (!sanitizedData.gender) {
            throw new Error('Gender cannot be empty');
          }
        }
        
        if (data.year !== undefined) {
          sanitizedData.year = parseInt(String(data.year));
          if (isNaN(sanitizedData.year) || sanitizedData.year < 2020 || sanitizedData.year > 2030) {
            throw new Error('Year must be between 2020 and 2030');
          }
        }
        
        if (data.month !== undefined) {
          sanitizedData.month = String(data.month).trim();
          if (!sanitizedData.month) {
            throw new Error('Month cannot be empty');
          }
        }
        
        if (data.count !== undefined) {
          sanitizedData.count = parseInt(String(data.count));
          if (isNaN(sanitizedData.count) || sanitizedData.count < 0) {
            throw new Error('Count must be a non-negative number');
          }
        }
        
        console.log('Sanitized update data:', sanitizedData);
        
        // Perform the update
        const updatedRecord = await pb.collection('consolidated_data').update(id, sanitizedData);
        console.log('Successfully updated consolidated record:', updatedRecord);
        
        return updatedRecord;
      } catch (error) {
        console.error('Error updating consolidated record:', error);
        if (error.message && error.message.includes('collection')) {
          throw new Error('Database connection error. Please try again.');
        }
        throw error;
      }
    },
    
    delete: async (id: string) => {
      try {
        console.log('Deleting consolidated record:', id);
        
        // Validate ID
        if (!id || typeof id !== 'string') {
          throw new Error('Invalid record ID');
        }
        
        // Get the record first to ensure it exists
        let recordToDelete;
        try {
          recordToDelete = await pb.collection('consolidated_data').getOne(id);
          console.log('Found record to delete:', recordToDelete);
        } catch (error) {
          if (error.status === 404) {
            throw new Error('Record not found. It may have already been deleted.');
          }
          throw error;
        }
        
        // Perform the deletion
        await pb.collection('consolidated_data').delete(id);
        console.log('Successfully deleted consolidated record');
        
        return recordToDelete;
      } catch (error) {
        console.error('Error deleting consolidated record:', error);
        if (error.message && error.message.includes('collection')) {
          throw new Error('Database connection error. Please try again.');
        }
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
