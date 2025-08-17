// hooks/use-toast.ts
import { toast as sonnerToast } from "sonner";

export const useToast = () => {
  return {
    toast: sonnerToast,
    success: (
      title: string,
      options?: { description?: string; duration?: number }
    ) => {
      return sonnerToast.success(title, {
        description: options?.description,
        duration: options?.duration || 4000,
      });
    },
    error: (
      title: string,
      options?: { description?: string; duration?: number }
    ) => {
      return sonnerToast.error(title, {
        description: options?.description,
        duration: options?.duration || 5000,
      });
    },
    info: (
      title: string,
      options?: { description?: string; duration?: number }
    ) => {
      return sonnerToast.info(title, {
        description: options?.description,
        duration: options?.duration || 4000,
      });
    },
    warning: (
      title: string,
      options?: { description?: string; duration?: number }
    ) => {
      return sonnerToast.warning(title, {
        description: options?.description,
        duration: options?.duration || 4000,
      });
    },
    loading: (title: string, options?: { description?: string }) => {
      return sonnerToast.loading(title, {
        description: options?.description,
      });
    },
    promise: <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
        description?: string;
      }
    ) => {
      return sonnerToast.promise(promise, options);
    },
  };
};
