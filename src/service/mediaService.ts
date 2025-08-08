import {  
  VedioDetail,
  UploadMediaParams, 
  AudioDetail, 
} from "@/types/media";
import api from "@/lib/api";
import { getApiUrl } from "@/config/getEnvConfig";

const API_BASE_URL = getApiUrl();

/**
 * 通过API获取媒体详情
 * @param mediaId 媒体ID
 * @returns MediaDetail结构的媒体数据
 */
export async function getVideoDetail(mediaId: string): Promise<VedioDetail | null> {
  try {
    const response = await api.get(`${API_BASE_URL}/media/video/${mediaId}`);
    const data = response.data as VedioDetail;
    return data;
  } catch (error) {
    console.error("Error fetching video detail:", error);
    return null;
  }
}

export async function getAudioDetail(mediaId:string):Promise<AudioDetail | null> {
  try{
    const response = await api.get(`${API_BASE_URL}/media/audio/${mediaId}`);
    const data=response.data as AudioDetail;
    return data;
  }catch(error){
    console.error("Error fetching audio detail:", error);
    return null;
  }
}

/**
 * 上传视频文件
 * @param params 上传参数
 * @returns 上传成功确认信息
 */
export async function uploadVideo(params: UploadMediaParams): Promise<{ success: boolean;} | null> {
  try {
    const { file, title, category, description } = params;
    
    const formData = new FormData();
    formData.append("file", file);
    
    // 只传递基本信息，让后端处理文件分析和元数据提取
    if (title) {
      formData.append("title", title);
    }
    
    if (category) {
      formData.append("category", category);
    }

    if (description) {
      formData.append("description", description);
    }

    const response = await api.post<{ id: string; message: string }>(
      `${API_BASE_URL}/media/upload/video`,
      formData,
      {
        headers: {
          'Content-Type': undefined, // 让浏览器自动设置 multipart/form-data 和 boundary
        },
        // 上传进度回调
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      }
    );

    // 直接使用HTTP状态码判断成功
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true
      };
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Error uploading video:", error);
    return {
      success: false
    };
  }
}

/**
 * 上传音频文件
 * @param params 上传参数（音频只需要文件和标题）
 * @returns 上传成功确认信息
 */
export async function uploadAudio(params: UploadMediaParams): Promise<{ success: boolean;} | null> {
  try {
    const { file, title } = params;
    
    const formData = new FormData();
    formData.append("file", file);
    
    if (title) {
      formData.append("title", title);
    }

    const response = await api.post<{ id: string; message: string }>(
      `${API_BASE_URL}/media/upload/audio`,
      formData,
      {
        headers: {
          'Content-Type': undefined, // 让浏览器自动设置 multipart/form-data 和 boundary
        },
        // 上传进度回调
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      }
    );

    // 直接使用HTTP状态码判断成功
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true
      };
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Error uploading audio:", error);
    return {
      success: false
    };
  }
}

/**
 * 删除媒体文件
 * @param mediaId 媒体ID
 * @returns 删除结果
 */
export async function deleteMedia(mediaId: string): Promise<boolean> {
  try {
    const response = await api.delete(`${API_BASE_URL}/media/${mediaId}`);
    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error("Error deleting media:", error);
    throw error;
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取文件预览信息
 * @param file 文件对象
 * @returns 文件信息
 */
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified).toLocaleString(),
  };
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @returns 文件类型
 */
export function validateFileType(file: File): 'video' | 'audio' | 'image' {
  const allowedVideoTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv'
  ];
  
  const allowedAudioTypes = [
    'audio/mp3',
    'audio/wav',
    'audio/aac',
    'audio/flac',
    'audio/ogg',
    'audio/mpeg'
  ];

  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedVideoTypes.includes(file.type)) {
    return 'video';
  } else if (allowedAudioTypes.includes(file.type)) {
    return 'audio';
  } else if (allowedImageTypes.includes(file.type)) {
    return 'image';
  } else {
    throw new Error(`不支持的文件类型: ${file.type}。请上传视频文件（mp4, avi, mov等）、音频文件（mp3, wav, aac等）或图片文件（jpg, png, gif等）`);
  }
} 