import api from "@/lib/api";
import { getApiUrl } from "@/config/getEnvConfig";
const API_BASE_URL = getApiUrl();
import { PublicDocumentList } from "@/types/document";
import { PublicVideoList, PaginatedResponse as MediaPaginatedResponse, PublicAudioList } from "@/types/media";

// 文档分页响应接口
export interface DocumentPaginatedResponse {
  data: PublicDocumentList[];
  meta: {
    limit: number;
    page: number;
    total: number;
  };
}

/**
 * 获取所有公开发布的文章
 * @param page 页码，默认为1
 * @param limit 每页限制，默认为20
 * @returns 分页的文档列表或普通文档列表（兼容旧格式）
 */
export async function getPublishedDocs(page: number = 1, limit: number = 20): Promise<DocumentPaginatedResponse | PublicDocumentList[]> {
  try {
    const response = await api.get(`${API_BASE_URL}/public/documents?page=${page}&limit=${limit}`);
    
    // 判断响应是否符合分页格式
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'meta' in response.data) {
      return response.data as DocumentPaginatedResponse;
    }
    
    // 兼容旧格式
    return response.data as PublicDocumentList[];
  } catch (error) {
    console.error("Error fetching published documents:", error);
    // 返回默认空的分页响应
    return {
      data: [],
      meta: {
        limit,
        page,
        total: 0
      }
    };
  }
}

/**
 * 获取公开的媒体列表（支持分页）
 * @param page 页码，默认为1
 * @param limit 每页限制，默认为20
 * @param mediaType 媒体类型筛选，可选
 * @returns 分页的公开媒体列表
 */
export async function getPublicVedioList(
  page: number = 1, 
  limit: number = 20, 
  mediaType?: 'video' | 'audio' | 'image'
): Promise<MediaPaginatedResponse<PublicVideoList>> {
  try {
    let url = `${API_BASE_URL}/public/media/video?page=${page}&limit=${limit}`;
    const response = await api.get(url);
    // 判断响应是否符合分页格式
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as MediaPaginatedResponse<PublicVideoList>;
    }
    
    // 兼容旧格式，转换为分页格式
    const mediaList = response.data as PublicVideoList[];
    return {
      data: mediaList,
      total: mediaList.length,
      page: 1,
      limit: mediaList.length,
      totalPages: 1
    };
  } catch (error) {
    console.error("Error fetching public media list:", error);
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }
}

export async function getPublicAudioList(
  page: number = 1, 
  limit: number = 20, 
  mediaType?: 'video' | 'audio' | 'image'
): Promise<PublicAudioList[]> {
  try {
    let url = `${API_BASE_URL}/public/media/audio`;
    
    const response = await api.get(url);
  
    return response.data as PublicAudioList[];
  } catch (error) {
    console.error("Error fetching public media list:", error);
    return [];
  }
}