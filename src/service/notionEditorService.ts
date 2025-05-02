import { Document,DocumentList } from "@/types/db";
import api from "@/lib/api";
import { getApiUrl } from "@/config/getEnvConfig";
const API_BASE_URL = getApiUrl();

export async function findDoc(documentId: string): Promise<Boolean | null> {
  try {
    const response = await api.get(`${API_BASE_URL}/documents/findDoc/${documentId}`);
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error fetching document:", error);
    return null;
  }
}


/**
 * 通过API查找文档
 * @param documentId 文档ID
 * @returns Document结构的文档数据
 */
export async function getDoc(documentId: string): Promise<Document | null> {
  try {
    const response = await api.get(`${API_BASE_URL}/documents/${documentId}`);
    return response.data as Document;
  } catch (error) {
    console.error("Error fetching document:", error);
    return null;
  }
}

/**
 * 创建空文档
 * @param title 文档标题
 * @returns 创建的Document结构文档
 */
export async function createEmptyDoc(): Promise<Document | null> {
  try { 
    const response = await api.post(`${API_BASE_URL}/documents/createEmptyDoc`);
    return response.data as Document;
  } catch (error) {
    console.error("Error creating document:", error);
    return null;
  }
}

/**
 * 获取用户的文档列表
 * @param userId 用户ID
 * @returns Document结构的文档列表
 */
export async function getUserDocs(): Promise<DocumentList[]> {
  try {
    const response = await api.get(`${API_BASE_URL}/documents/user`);
    return response.data as DocumentList[];
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return [];
  }
}

/**
 * 更新文档内容
 * @param documentId 文档ID
 * @param content 文档内容
 * @returns 更新后的Document结构文档
 */
export async function updateDoc(documentId: string, content: Partial<Document>): Promise<boolean> {
  try {
    const response = await api.put(`${API_BASE_URL}/documents/${documentId}`, content);
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
}

/**
 * 发布文档（设置为公开）
 * @param documentId 文档ID
 * @returns 是否成功发布
 */
export async function publishDoc(documentId: string): Promise<boolean> {
  try {
    const response = await api.patch(`${API_BASE_URL}/documents/${documentId}/publish`);
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error publishing document:", error);
    throw error;
  }
}

/**
 * 取消发布文档
 * @param documentId 文档ID
 * @returns 是否成功取消发布
 */
export async function unpublishDoc(documentId: string): Promise<boolean> {
  try {
    const response = await api.patch(`${API_BASE_URL}/documents/${documentId}/unpublish`);
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error unpublishing document:", error);
    throw error;
  }
}

/**
 * 删除文档
 * @param documentId 文档ID
 * @returns 删除结果
 */
export async function deleteDoc(documentId: string):Promise<Boolean | null>{
  try{
    const response = await api.delete(`${API_BASE_URL}/documents/deleteDoc/${documentId}`);
    return response.status === 200 || response.status === 201;
  } catch(error){
    console.error("Error deleting document:", error);
    throw error;
  }
}
