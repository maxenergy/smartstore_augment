/**
 * 店铺表单组件
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateShop, useUpdateShop } from "@/hooks/use-shops";
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

const shopSchema = z.object({
  shopName: z.string().min(1, "店铺名称不能为空"),
  shopId: z.string().min(1, "店铺ID不能为空"),
  platform: z.enum(["AMAZON", "TIKTOK", "SHOPIFY", "OWN"]),
  accessToken: z.string().min(1, "访问令牌不能为空"),
});

type ShopFormValues = z.infer<typeof shopSchema>;

interface ShopFormProps {
  shop?: any;
  onSuccess: () => void;
}

export function ShopForm({ shop, onSuccess }: ShopFormProps) {
  const [error, setError] = useState<string | null>(null);
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      shopName: "",
      shopId: "",
      platform: "OWN",
      accessToken: "",
    },
  });

  useEffect(() => {
    if (shop) {
      form.reset({
        shopName: shop.shopName,
        shopId: shop.shopId,
        platform: shop.platform,
        accessToken: shop.accessToken || "",
      });
    }
  }, [shop, form]);

  const onSubmit = async (data: ShopFormValues) => {
    setError(null);

    try {
      if (shop) {
        await updateShop.mutateAsync({ id: shop.id, data });
      } else {
        await createShop.mutateAsync(data);
      }
      onSuccess();
    } catch {
      setError(shop ? "更新失败，请重试" : "创建失败，请重试");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="shopName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>店铺名称 *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shopId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>店铺ID *</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>平台 *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
          name="accessToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>访问令牌 *</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={createShop.isPending || updateShop.isPending}
            className="flex-1"
          >
            {createShop.isPending || updateShop.isPending
              ? "保存中..."
              : shop
                ? "保存更改"
                : "创建店铺"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
