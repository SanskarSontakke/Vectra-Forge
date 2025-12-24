export type Tab = 'mockup' | 'editor';

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  createdAt: number;
  type: 'mockup' | 'edit' | 'pro-gen';
}

export type ProductType = 'mug' | 't-shirt' | 'hoodie' | 'tote-bag' | 'cap' | 'notebook';

export enum ImageSize {
  Size_1K = '1K',
  Size_2K = '2K',
  Size_4K = '4K',
}