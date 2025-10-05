"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "用户名至少需要 2 个字符。",
  }),
  email: z.string().email({
    message: "请输入有效的邮箱地址。",
  }),
  platform: z.string().min(1, {
    message: "请选择一个平台。",
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: "您必须同意条款和条件。",
  }),
});

export default function TestComponentsPage() {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      platform: "",
      terms: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // eslint-disable-next-line no-console
    console.log(values);
    alert("表单提交成功！查看控制台获取详细信息。");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">shadcn/ui 组件测试页面</h1>

      <div className="grid gap-8">
        {/* Button 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>Button 组件</CardTitle>
            <CardDescription>测试不同变体和大小的按钮</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>默认按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="destructive">危险按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="link">链接按钮</Button>
            <Button size="sm">小按钮</Button>
            <Button size="lg">大按钮</Button>
          </CardContent>
        </Card>

        {/* Input 和 Label 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>Input 和 Label 组件</CardTitle>
            <CardDescription>测试输入框和标签</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </CardContent>
        </Card>

        {/* Select 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>Select 组件</CardTitle>
            <CardDescription>测试选择器</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>选择平台</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择一个平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="tiktok">TikTok Shop</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Checkbox 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>Checkbox 组件</CardTitle>
            <CardDescription>测试复选框</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms1" />
              <Label htmlFor="terms1">接受条款和条件</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="marketing" />
              <Label htmlFor="marketing">接收营销邮件</Label>
            </div>
          </CardContent>
        </Card>

        {/* Dialog 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog 组件</CardTitle>
            <CardDescription>测试对话框</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>确认操作</DialogTitle>
                  <DialogDescription>这是一个测试对话框。您确定要继续吗？</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={() => setOpen(false)}>确认</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Form 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>Form 组件</CardTitle>
            <CardDescription>测试表单组件（集成 react-hook-form 和 zod）</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名</FormLabel>
                      <FormControl>
                        <Input placeholder="输入用户名" {...field} />
                      </FormControl>
                      <FormDescription>这是您的公开显示名称。</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>平台</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择一个平台" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="amazon">Amazon</SelectItem>
                          <SelectItem value="tiktok">TikTok Shop</SelectItem>
                          <SelectItem value="shopify">Shopify</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>接受条款和条件</FormLabel>
                        <FormDescription>您同意我们的服务条款和隐私政策。</FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit">提交</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
