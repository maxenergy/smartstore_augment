/**
 * 设置页面
 */

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  // 个人信息状态
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  // 通知设置状态
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [syncNotifications, setSyncNotifications] = useState(false);

  // 主题设置状态
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: 实现保存个人信息的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("个人信息已保存");
    } catch (error) {
      alert("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      // TODO: 实现保存通知设置的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("通知设置已保存");
    } catch (error) {
      alert("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      // TODO: 实现保存外观设置的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("外观设置已保存");
    } catch (error) {
      alert("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">设置</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">管理您的账户设置和偏好</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            个人信息
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            安全设置
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            外观设置
          </TabsTrigger>
        </TabsList>

        {/* 个人信息 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>个人信息</CardTitle>
              <CardDescription>更新您的个人资料信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  disabled
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  邮箱地址不可修改
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Input
                  id="role"
                  value={session?.user?.role || "USER"}
                  disabled
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  角色由管理员分配
                </p>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "保存中..." : "保存更改"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>管理您接收通知的方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>邮件通知</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    接收重要更新的邮件通知
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>订单通知</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    新订单和订单状态变更通知
                  </p>
                </div>
                <Switch
                  checked={orderNotifications}
                  onCheckedChange={setOrderNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>同步通知</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    数据同步完成和失败通知
                  </p>
                </div>
                <Switch
                  checked={syncNotifications}
                  onCheckedChange={setSyncNotifications}
                />
              </div>

              <Button onClick={handleSaveNotifications} disabled={isSaving}>
                {isSaving ? "保存中..." : "保存更改"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>管理您的账户安全</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="请输入当前密码"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="请输入新密码"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="请再次输入新密码"
                />
              </div>

              <Button disabled>
                修改密码（功能开发中）
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 外观设置 */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>外观设置</CardTitle>
              <CardDescription>自定义应用的外观</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>深色模式</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    启用深色主题
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>

              <Button onClick={handleSaveAppearance} disabled={isSaving}>
                {isSaving ? "保存中..." : "保存更改"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

