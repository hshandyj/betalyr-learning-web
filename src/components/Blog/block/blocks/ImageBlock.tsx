"use client"

import { useState, useRef } from 'react';
import { JSONContent } from '@tiptap/react';
import { Upload, X, Pencil } from 'lucide-react';

interface ImageBlockProps {
  content: JSONContent;
  isSelected: boolean;
  url: string;
  alt: string;
  onChange: (content: JSONContent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
}

const ImageBlock: React.FC<ImageBlockProps> = ({
  content,
  isSelected,
  url,
  alt,
  onChange,
  onKeyDown,
  readOnly
}) => {
  const [imageUrl, setImageUrl] = useState(url);
  const [imageAlt, setImageAlt] = useState(alt);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 处理图片上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 在实际应用中，这里会上传文件到服务器并获取URL
    // 这里为了演示，直接创建一个本地URL
    const tempUrl = URL.createObjectURL(file);
    setImageUrl(tempUrl);
    
    // 更新内容
    const updatedContent = {
      ...content,
      attrs: {
        ...content.attrs,
        src: tempUrl,
        alt: imageAlt
      }
    };
    
    onChange(updatedContent as JSONContent);
  };
  
  // 处理URL输入
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };
  
  // 处理Alt文本输入
  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageAlt(e.target.value);
  };
  
  // 保存图片设置
  const handleSave = () => {
    const updatedContent = {
      ...content,
      attrs: {
        ...content.attrs,
        src: imageUrl,
        alt: imageAlt
      }
    };
    
    onChange(updatedContent as JSONContent);
    setIsEditing(false);
  };
  
  return (
    <div 
      className={`image-block ${isSelected ? 'image-selected' : ''}`}
      onKeyDown={onKeyDown}
      tabIndex={0}
      data-block-id={content.attrs?.id || ''}
    >
      {imageUrl ? (
        <div className="image-container">
          <img 
            src={imageUrl} 
            alt={imageAlt || '图片'} 
            className="image-content"
          />
          
          {isSelected && !readOnly && (
            <div className="image-actions">
              <button 
                className="image-edit-button"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="image-placeholder">
          {!readOnly && (
            <button 
              className="image-upload-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} />
              <span>上传图片</span>
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
      )}
      
      {isEditing && !readOnly && (
        <div className="image-editor">
          <div className="image-editor-header">
            <h3>编辑图片</h3>
            <button 
              className="image-editor-close"
              onClick={() => setIsEditing(false)}
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="image-editor-content">
            <div className="image-editor-field">
              <label htmlFor="image-url">图片URL</label>
              <input 
                id="image-url"
                type="text" 
                value={imageUrl} 
                onChange={handleUrlChange}
                placeholder="输入图片URL"
              />
            </div>
            
            <div className="image-editor-field">
              <label htmlFor="image-alt">图片描述</label>
              <input 
                id="image-alt"
                type="text" 
                value={imageAlt} 
                onChange={handleAltChange}
                placeholder="输入图片描述"
              />
            </div>
            
            <div className="image-editor-field">
              <label htmlFor="image-upload">或上传图片</label>
              <input 
                id="image-upload"
                type="file" 
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            
            <div className="image-editor-actions">
              <button 
                className="image-editor-save"
                onClick={handleSave}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBlock; 