export type ItemStatus = string;

export interface ImageCropData {
  url: string; // Base64 or object URL
  fit: 'contain' | 'cover';
  zoom: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

export interface Annotation {
  id: string;
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  width: number; // Percentage (0-100)
  height: number; // Percentage (0-100)
  label?: string;
  order: number; // 1, 2, 3...
  customMarker?: string;
  color?: 'red' | 'green' | 'blue' | 'yellow';
}

export interface ReportItem {
  id: string;
  smallImage: string | null; // Data URL
  productName: string;
  status: ItemStatus;
  customStatus?: string;
  implantations: number | null;
  idcam: string;
  upc: string;
  notes: string;
}

export interface ReportSection {
  id: string;
  sectionTitle: string;
  referenceText: string;
  lastAnalysisDatetime: string;
  slots: number | null;
  mainImage: ImageCropData | null;
  annotations: Annotation[];
  notes: string;
  items: ReportItem[];
}

export interface Report {
  id: string;
  reportTitle: string;
  template: 'SOP' | 'Minimal';
  status: 'Draft' | 'Saved' | 'Deleted';
  createdAt: string;
  updatedAt: string;
  logo: string | null;
  sections: ReportSection[];
}
