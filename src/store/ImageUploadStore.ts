import { create } from "zustand";

export interface PendingImage {
  file: File;
  preview: string; // URL.createObjectURL() pour l'aperçu
  id: string; // identifiant unique
}

interface ImageUploadState {
  pendingImages: PendingImage[];
  uploadedUrls: string[];
  addPendingImage: (file: File, customId?: string) => void;
  removePendingImage: (id: string) => void;
  reorderPendingImages: (fromIndex: number, toIndex: number) => void;
  addUploadedUrl: (url: string) => void;
  removeUploadedUrl: (url: string) => void;
  clearPendingImages: () => void;
  clearUploadedUrls: () => void;
  resetAll: () => void;
}

export const useImageUploadStore = create<ImageUploadState>((set, get) => ({
  pendingImages: [],
  uploadedUrls: [],

  addPendingImage: (file: File, customId?: string) => {
    const id = customId || Math.random().toString(36).substring(7);
    const preview = URL.createObjectURL(file);
    
    set((state) => ({
      pendingImages: [
        ...state.pendingImages,
        { file, preview, id }
      ]
    }));
  },

  removePendingImage: (id: string) => {
    const { pendingImages } = get();
    const imageToRemove = pendingImages.find(img => img.id === id);

    if (imageToRemove) {
      // Nettoyer l'URL de preview
      URL.revokeObjectURL(imageToRemove.preview);
    }

    set((state) => ({
      pendingImages: state.pendingImages.filter(img => img.id !== id)
    }));
  },

  reorderPendingImages: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newImages = [...state.pendingImages];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return { pendingImages: newImages };
    });
  },

  addUploadedUrl: (url: string) => {
    set((state) => ({
      uploadedUrls: [...state.uploadedUrls, url]
    }));
  },

  removeUploadedUrl: (url: string) => {
    set((state) => ({
      uploadedUrls: state.uploadedUrls.filter(u => u !== url)
    }));
  },

  clearPendingImages: () => {
    const { pendingImages } = get();
    // Nettoyer toutes les URLs de preview
    pendingImages.forEach(img => {
      URL.revokeObjectURL(img.preview);
    });
    
    set({ pendingImages: [] });
  },

  clearUploadedUrls: () => {
    set({ uploadedUrls: [] });
  },

  resetAll: () => {
    const { pendingImages } = get();
    // Nettoyer toutes les URLs de preview
    pendingImages.forEach(img => {
      URL.revokeObjectURL(img.preview);
    });
    
    set({
      pendingImages: [],
      uploadedUrls: []
    });
  }
}));