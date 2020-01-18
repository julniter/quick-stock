export interface FirebaseMetaData {
  id: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: any;
}

export enum PageMode {
  New,
  Edit,
  Copy
}
