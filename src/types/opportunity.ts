export interface ProjectCategory {
  title: string;
  description: string;
}

export interface ParsedAddress {
  streetNumber: string;
  street: string;
  city: string;
  area: string;
  country: string;
  countryCode: string;
  postalCode: string;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
  parsedAddress: ParsedAddress;
}

export interface ProjectDetails {
  title: string;
  description: string;
}

export interface Contact {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
}

export interface Metadata {
  submittedAt: string;
  locale: string;
  source: string;
  version: string;
}

export interface OpportunityPayload {
  project: {
    category: string;
    location: Location;
    details: ProjectDetails;
  };
  contact: Contact;
} 