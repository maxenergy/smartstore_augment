/**
 * 认证页面布局
 * 用于登录和注册页面的共享布局
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            跨境电商分销系统
          </h1>
          <p className="text-gray-600 dark:text-gray-400">全自动化的跨境电商分销平台</p>
        </div>
        {children}
      </div>
    </div>
  );
}
