export interface ProjectCategory {
  title: string;
  description: string;
}

export interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  }
}

export interface ProjectDetails {
  description: string;
}

export interface Contact {
  fullName: string;
  email: string;
  phone: {
    countryCode: string;
    number: string;
  }
}

export interface Metadata {
  submittedAt: string;
  locale: string;
  source: string;
  version: string;
}

export interface OpportunityPayload {
  project: {
    category: ProjectCategory;
    location: Location;
    details: ProjectDetails;
  };
  contact: Contact;
  metadata: Metadata;
} 