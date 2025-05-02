
import PocketBase from 'pocketbase';

// Create a PocketBase client instance
const pb = new PocketBase('http://127.0.0.1:8090');

export interface YouthRecord {
  id: string;
  region: string;
  province: string;
  city_municipality: string;
  barangay: string;
  name: string;
  age: string;
  birthday: Date;
  sex: "MALE" | "FEMALE";
  civil_status: "SINGLE" | "MARRIED" | "LIVED-IN" | "WIDOWED";
  youth_classification: "ISY" | "OSY" | "WY" | "YSN";
  youth_age_group: "CORE YOUTH (18-24)" | "CHILD YOUTH (15-17)" | "YOUNG ADULT (25-30)";
  email_address: string;
  contact_number: string;
  home_address: string;
  highest_education: string;
  work_status: string;
  registered_voter: string;
  voted_last_election: string;
  attended_kk_assembly: string;
  kk_assemblies_attended: number;
  created: string;
  updated: string;
}

type RecordModel = {
  id: string;
  created: string;
  updated: string;
  [key: string]: any;
};

export const pbClient = {
  // Authentication methods
  auth: {
    login: async (email: string, password: string) => {
      return await pb.collection('_superusers').authWithPassword(email, password);
    },
    logout: () => {
      pb.authStore.clear();
    },
    get isValid() {
      return pb.authStore.isValid;
    },
    isLoggedIn: () => {
      return pb.authStore.isValid;
    }
  },
  
  // Youth census records
  youth: {
    create: async (data: Omit<YouthRecord, 'id' | 'created' | 'updated'>) => {
      return await pb.collection('youth').create(data);
    },
    getAll: async () => {
      return await pb.collection('youth').getFullList<YouthRecord>();
    },
    getOne: async (id: string) => {
      return await pb.collection('youth').getOne<YouthRecord>(id);
    },
    update: async (id: string, data: Partial<YouthRecord>) => {
      return await pb.collection('youth').update(id, data);
    },
    delete: async (id: string) => {
      return await pb.collection('youth').delete(id);
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
