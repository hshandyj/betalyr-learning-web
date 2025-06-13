
// 公开视频列表项模型
export interface PublicVideoList {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: string;       // 时长，格式如"25:30"
  category: string;        // 分类
  uploadTime: string; 
}

// 视频详情模型
export interface VedioDetail {
  id: string;
  title: string;
  description?: string;
  mediaUrl: string;        // 媒体URL
  preview?: string;        // 预览图URL
  duration?: string;       // 时长，格式如"25:30"
  uploadTime: string;      // 上传时间，格式如"2024-01-15"
  category: string;        // 分类
}

// 公开音频列表项模型
export interface PublicAudioList {
  id: string;
  title: string;
  duration?: string;
  uploadTime: string; 
}

// 音频详情模型
export interface AudioDetail {
  id: string;
  title: string;
  mediaUrl: string;        // 媒体URL
}

// 简化的上传参数（只上传文件和基本信息）
export interface UploadMediaParams {
  file: File;
  title?: string;
  category?: string;
  description?: string;
}

// 分页结果
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
