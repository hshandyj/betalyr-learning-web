import api from "@/lib/api";
import { getApiUrl } from "@/config/getEnvConfig";
const API_BASE_URL = getApiUrl();
import { PublicDocumentList } from "@/types/document";

// 分页响应接口
export interface PaginatedResponse {
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
export async function getPublishedDocs(page: number = 1, limit: number = 20): Promise<PaginatedResponse | PublicDocumentList[]> {
  try {
    const response = await api.get(`${API_BASE_URL}/public/documents?page=${page}&limit=${limit}`);
    
    // 判断响应是否符合分页格式
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'meta' in response.data) {
      return response.data as PaginatedResponse;
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