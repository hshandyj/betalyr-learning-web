/* eslint-disable no-unused-vars */
// Adapted for Sonner toast library
import * as React from "react";
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
  [key: string]: any; // 允许其他属性
};

interface ToastErrorProps {
  error: any;
  description?: string;
  axiosPayloadDesc?: string;
  title?: string;
}

function toast(props: ToastProps) {
  const { title, description, action, ...restProps } = props;

  if (title && description) {
    return sonnerToast(title as string, {
      description,
      action,
      ...restProps,
    });
  }

  return sonnerToast(description as string, {
    action,
    ...restProps,
  });
}

const toastError = ({
  error,
  description,
  title,
  axiosPayloadDesc,
}: ToastErrorProps): any => {
  const errorMessage = axiosPayloadDesc || 
    error.response?.data?.message || 
    error.message || 
    description || 
    "Something went wrong";
  
  const errorTitle = title || "Something went wrong";

  return toast({
    title: errorTitle,
    description: errorMessage,
    variant: "destructive",
  });
};

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    },
  };
}

export { useToast, toast, toastError };
