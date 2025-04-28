"use client"
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { findDoc } from "@/service/notionEditorService";
import { isValidObjectID } from "@/lib/utils";
import ReactResizablePanels from "@/components/MyResizablePanels/ResizablePanels";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [defaultLayout, setDefaultLayout] = useState<any>(undefined);

  useEffect(() => {
    // 获取默认布局
    const getDefaultLayout = async () => {
      try {
        const storedLayout = localStorage.getItem("react-resizable-panels:layout");
        if (storedLayout) {
          setDefaultLayout(JSON.parse(storedLayout));
        }
      } catch (error) {
        console.error("Failed to parse layout from localStorage:", error);
      }
    };

    // 验证文档ID
    const validateDocument = async () => {
      if (!documentId) {
        setLoading(false);
        return;
      }

      const validObjectID = isValidObjectID(documentId);
      if (!validObjectID) {
        setLoading(false);
        return;
      }

      try {
        const document = await findDoc(documentId);
        if (document) {
          setIsValid(true);
        }
      } catch (error) {
        console.error("Failed to find document:", error);
      } finally {
        setLoading(false);
      }
    };

    getDefaultLayout();
    validateDocument();
  }, [documentId]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">加载中...</div>;
  }

  if (!isValid && !loading) {
    return <div className="h-screen w-full flex items-center justify-center">文档不存在或无法访问</div>;
  }

  return (
    <div className="h-screen w-full flex">
      <ReactResizablePanels defaultLayout={defaultLayout} right={children} />
    </div>
  );
};

export default Layout;