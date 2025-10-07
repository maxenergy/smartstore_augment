/**
 * 创建产品页面
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useCreateProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const productSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  price: z.string().min(1, "价格不能为空"),
  currency: z.string().default("USD"),
  sourcePlatform: z.enum(["AMAZON", "TIKTOK", "SHOPIFY", "OWN"]),
  sourceProductId: z.string().min(1, "来源产品ID不能为空"),
  category: z.string().optional(),
  images: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const createProduct = useCreateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      currency: "USD",
      sourcePlatform: "OWN",
      sourceProductId: "",
      category: "",
      images: "",
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setError(null);

    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        images: data.images ? JSON.stringify([data.images]) : JSON.stringify([]),
      };

      await createProduct.mutateAsync(payload);
      router.push("/products");
    } catch {
      setError("创建失败，请重试");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">添加产品</h1>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>产品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>产品标题 *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sourceProductId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>来源产品ID *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>价格 *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>货币</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="CNY">CNY</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sourcePlatform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>来源平台 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AMAZON">Amazon</SelectItem>
                          <SelectItem value="TIKTOK">TikTok</SelectItem>
                          <SelectItem value="SHOPIFY">Shopify</SelectItem>
                          <SelectItem value="OWN">自有</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>分类</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>图片URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={createProduct.isPending}>
                  {createProduct.isPending ? "创建中..." : "创建产品"}
                </Button>
                <Link href="/products">
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
