export interface Catering {
  title: string;
  specialWishes?: string;
  slug?: string;
  remarks?: string;
  place?: string;
  offeringCreated?: boolean;
  numberOfPersons?: number;
  id?: string;
  flow?: string;
  description?: string;
  date?: Date;
  createdAt?: Date;
  client?: string;
  cateringType?: string;
  cateringStyle?: string;
  additionalServices?: string[];
  end?: Date; 
  start?: Date;
  relatedAssets?: {
    url?: string
    id?: string
    fileName?: string
  }[];
}
