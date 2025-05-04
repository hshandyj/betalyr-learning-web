import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryCloudName, getCloudinaryApiKey, getCloudinaryApiSecret } from '@/config/getEnvConfig';
// 配置Cloudinary
cloudinary.config({
  cloud_name: getCloudinaryCloudName(),
  api_key: getCloudinaryApiKey(),
  api_secret: getCloudinaryApiSecret(),
});

export default cloudinary;