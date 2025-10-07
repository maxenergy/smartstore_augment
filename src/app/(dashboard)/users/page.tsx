/**
 * 用户管理页面
 * 支持筛选、搜索、分页
 */

"use client";

import { useState } from "react";
import { useUsers, useDeleteUser } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Pencil, Trash2, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading, error } = useUsers({
    page,
    pageSize: 10,
    search: search || undefined,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
  });

  const deleteUser = useDeleteUser();

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个用户吗？此操作不可恢复！")) {
      try {
        await deleteUser.mutateAsync(id);
      } catch {
        alert("删除失败，请重试");
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">加载失败，请刷新重试</p>
      </div>
    );
  }

  const users = data?.data?.data || [];
  const pagination = data?.data?.meta;

  // 角色徽章颜色
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "MANAGER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "USER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // 状态徽章颜色
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "SUSPENDED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // 角色显示文本
  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "管理员";
      case "MANAGER":
        return "经理";
      case "USER":
        return "用户";
      default:
        return role;
    }
  };

  // 状态显示文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "活跃";
      case "INACTIVE":
        return "未激活";
      case "SUSPENDED":
        return "已暂停";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">用户管理</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">管理系统中的所有用户</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          添加用户
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索用户（姓名/邮箱）..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="ADMIN">管理员</SelectItem>
                <SelectItem value="MANAGER">经理</SelectItem>
                <SelectItem value="USER">用户</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="ACTIVE">活跃</SelectItem>
                <SelectItem value="INACTIVE">未激活</SelectItem>
                <SelectItem value="SUSPENDED">已暂停</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setRole("all");
                setStatus("all");
              }}
            >
              重置筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无用户</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleText(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(user.status)}>
                          {getStatusText(user.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                显示 {(pagination.currentPage - 1) * pagination.pageSize + 1} 到{" "}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} 条，
                共 {pagination.total} 条
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

