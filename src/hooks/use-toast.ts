/* eslint-disable no-unused-vars */
// Adapted for Sonner toast library
import * as React from "react";
import { toast as sonnerToast, ExternalToast } from "sonner";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
} & ExternalToast;

interface ToastErrorProps {
  error: any;
  description?: string;
  axiosPayloadDesc?: string;
  title?: string;
}

function toast(props: ToastProps) {
  const { title, description, action, ...restProps } = props;

  // 确保至少有title或description
  if (!title && !description) {
    console.warn('Toast调用时缺少title和description');
    return sonnerToast('操作完成', restProps);
  }

  if (title && description) {
    return sonnerToast(title as string, {
      description,
      action,
      ...restProps,
    });
  }

  // 如果只有title，将其作为主要消息
  if (title && !description) {
    return sonnerToast(title as string, {
      action,
      ...restProps,
    });
  }

  // 如果只有description，将其作为主要消息
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
