import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-6">文档不存在或无法访问</h2>
      <p className="text-gray-500 mb-8 text-center">
        您要访问的文档可能已被删除、移动或者您没有访问权限。
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        返回主页
      </Link>
    </div>
  );
} 