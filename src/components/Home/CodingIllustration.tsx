import React from 'react';

interface CodingIllustrationProps {
  className?: string;
}

export function CodingIllustration({ className = "" }: CodingIllustrationProps) {
  return (
    <div className={`rounded-lg shadow-xl bg-white dark:bg-gray-800 p-4 ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* 背景 */}
        <rect width="800" height="600" fill="#f8f9fa" className="dark:fill-gray-700" rx="15" ry="15" />
        
        {/* 编辑器窗口 */}
        <rect x="50" y="50" width="700" height="500" rx="10" ry="10" fill="#282c34" />
        
        {/* 窗口顶部栏 */}
        <rect x="50" y="50" width="700" height="35" rx="10" ry="10" fill="#21252b" />
        
        {/* 窗口按钮 */}
        <circle cx="75" cy="67" r="7" fill="#ff5f56" />
        <circle cx="95" cy="67" r="7" fill="#ffbd2e" />
        <circle cx="115" cy="67" r="7" fill="#27c93f" />
        
        {/* 侧边栏 */}
        <rect x="50" y="85" width="150" height="465" fill="#21252b" />
        
        {/* 文件列表 */}
        <rect x="65" y="110" width="120" height="25" rx="3" ry="3" fill="#323842" />
        <rect x="65" y="145" width="120" height="25" rx="3" ry="3" fill="#323842" />
        <rect x="65" y="180" width="120" height="25" rx="3" ry="3" fill="#323842" opacity="0.7" />
        <rect x="65" y="215" width="120" height="25" rx="3" ry="3" fill="#323842" opacity="0.7" />
        <rect x="65" y="250" width="120" height="25" rx="3" ry="3" fill="#323842" opacity="0.4" />
        
        {/* 代码窗口 */}
        <rect x="200" y="85" width="550" height="465" fill="#282c34" />
        
        {/* 行号 */}
        <rect x="200" y="85" width="30" height="465" fill="#21252b" />
        <text x="210" y="120" fontFamily="monospace" fontSize="12" fill="#636d83">1</text>
        <text x="210" y="150" fontFamily="monospace" fontSize="12" fill="#636d83">2</text>
        <text x="210" y="180" fontFamily="monospace" fontSize="12" fill="#636d83">3</text>
        <text x="210" y="210" fontFamily="monospace" fontSize="12" fill="#636d83">4</text>
        <text x="210" y="240" fontFamily="monospace" fontSize="12" fill="#636d83">5</text>
        <text x="210" y="270" fontFamily="monospace" fontSize="12" fill="#636d83">6</text>
        <text x="210" y="300" fontFamily="monospace" fontSize="12" fill="#636d83">7</text>
        <text x="210" y="330" fontFamily="monospace" fontSize="12" fill="#636d83">8</text>
        <text x="210" y="360" fontFamily="monospace" fontSize="12" fill="#636d83">9</text>
        <text x="210" y="390" fontFamily="monospace" fontSize="12" fill="#636d83">10</text>
        
        {/* 代码 */}
        <text x="240" y="120" fontFamily="monospace" fontSize="14" fill="#e06c75">function</text>
        <text x="305" y="120" fontFamily="monospace" fontSize="14" fill="#61afef">createApp</text>
        <text x="380" y="120" fontFamily="monospace" fontSize="14" fill="#abb2bf">()</text>
        <text x="395" y="120" fontFamily="monospace" fontSize="14" fill="#abb2bf">{'{'}</text>
        
        <text x="240" y="150" fontFamily="monospace" fontSize="14" fill="#abb2bf">  </text>
        <text x="260" y="150" fontFamily="monospace" fontSize="14" fill="#e06c75">const</text>
        <text x="305" y="150" fontFamily="monospace" fontSize="14" fill="#e5c07b">app</text>
        <text x="330" y="150" fontFamily="monospace" fontSize="14" fill="#abb2bf">=</text>
        <text x="345" y="150" fontFamily="monospace" fontSize="14" fill="#e06c75">new</text>
        <text x="375" y="150" fontFamily="monospace" fontSize="14" fill="#61afef">App</text>
        <text x="400" y="150" fontFamily="monospace" fontSize="14" fill="#abb2bf">();</text>
        
        <text x="240" y="180" fontFamily="monospace" fontSize="14" fill="#abb2bf">  </text>
        <text x="260" y="180" fontFamily="monospace" fontSize="14" fill="#c678dd">await</text>
        <text x="305" y="180" fontFamily="monospace" fontSize="14" fill="#e5c07b">app</text>
        <text x="330" y="180" fontFamily="monospace" fontSize="14" fill="#abb2bf">.</text>
        <text x="340" y="180" fontFamily="monospace" fontSize="14" fill="#61afef">registerComponents</text>
        <text x="485" y="180" fontFamily="monospace" fontSize="14" fill="#abb2bf">();</text>
        
        <text x="240" y="210" fontFamily="monospace" fontSize="14" fill="#abb2bf">  </text>
        <text x="260" y="210" fontFamily="monospace" fontSize="14" fill="#c678dd">await</text>
        <text x="305" y="210" fontFamily="monospace" fontSize="14" fill="#e5c07b">app</text>
        <text x="330" y="210" fontFamily="monospace" fontSize="14" fill="#abb2bf">.</text>
        <text x="340" y="210" fontFamily="monospace" fontSize="14" fill="#61afef">setupRoutes</text>
        <text x="425" y="210" fontFamily="monospace" fontSize="14" fill="#abb2bf">();</text>
        
        <text x="240" y="240" fontFamily="monospace" fontSize="14" fill="#abb2bf">  </text>
        <text x="260" y="240" fontFamily="monospace" fontSize="14" fill="#c678dd">await</text>
        <text x="305" y="240" fontFamily="monospace" fontSize="14" fill="#e5c07b">app</text>
        <text x="330" y="240" fontFamily="monospace" fontSize="14" fill="#abb2bf">.</text>
        <text x="340" y="240" fontFamily="monospace" fontSize="14" fill="#61afef">initialize</text>
        <text x="410" y="240" fontFamily="monospace" fontSize="14" fill="#abb2bf">();</text>
        
        <text x="240" y="270" fontFamily="monospace" fontSize="14" fill="#abb2bf">  </text>
        <text x="260" y="270" fontFamily="monospace" fontSize="14" fill="#e06c75">return</text>
        <text x="310" y="270" fontFamily="monospace" fontSize="14" fill="#e5c07b">app</text>
        <text x="335" y="270" fontFamily="monospace" fontSize="14" fill="#abb2bf">;</text>
        
        <text x="240" y="300" fontFamily="monospace" fontSize="14" fill="#abb2bf">{'}'}</text>
        
        <text x="240" y="330" fontFamily="monospace" fontSize="14" fill="#7f848e">// 启动应用</text>
        <text x="240" y="360" fontFamily="monospace" fontSize="14" fill="#c678dd">async</text>
        <text x="290" y="360" fontFamily="monospace" fontSize="14" fill="#e06c75">function</text>
        <text x="355" y="360" fontFamily="monospace" fontSize="14" fill="#61afef">main</text>
        <text x="390" y="360" fontFamily="monospace" fontSize="14" fill="#abb2bf">()</text>
        <text x="405" y="360" fontFamily="monospace" fontSize="14" fill="#abb2bf">{'{'}</text>
        <text x="240" y="390" fontFamily="monospace" fontSize="14" fill="#abb2bf">  </text>
        <text x="260" y="390" fontFamily="monospace" fontSize="14" fill="#e06c75">const</text>
        <text x="305" y="390" fontFamily="monospace" fontSize="14" fill="#e5c07b">app</text>
        <text x="330" y="390" fontFamily="monospace" fontSize="14" fill="#abb2bf">=</text>
        <text x="345" y="390" fontFamily="monospace" fontSize="14" fill="#c678dd">await</text>
        <text x="390" y="390" fontFamily="monospace" fontSize="14" fill="#61afef">createApp</text>
        <text x="465" y="390" fontFamily="monospace" fontSize="14" fill="#abb2bf">();</text>
        
        {/* 代码光标 */}
        <rect x="470" y="385" width="2" height="14" fill="#61afef">
          <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
        
        {/* 装饰元素 - 飘动的代码符号 */}
        <g opacity="0.7">
          <text x="670" y="150" fontFamily="monospace" fontSize="16" fill="#c678dd" transform="rotate(15, 670, 150)">{'{ }'}</text>
          <text x="700" y="220" fontFamily="monospace" fontSize="14" fill="#e06c75" transform="rotate(-10, 700, 220)">{'( )'}</text>
          <text x="650" y="280" fontFamily="monospace" fontSize="18" fill="#61afef" transform="rotate(5, 650, 280)">{'< />'}</text>
          <text x="690" y="350" fontFamily="monospace" fontSize="14" fill="#98c379" transform="rotate(-5, 690, 350)">{'" "'}</text>
        </g>
      </svg>
    </div>
  );
} 