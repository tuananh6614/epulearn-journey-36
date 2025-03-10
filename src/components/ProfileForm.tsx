
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import UserAvatar from './UserAvatar';

// Schema for profile update
const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  lastName: z.string().min(2, { message: "Họ phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileForm: React.FC = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'none' | 'synced' | 'local'>('none');
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      bio: currentUser?.bio || "",
    },
  });
  
  const onSubmit = async (values: ProfileFormValues) => {
    if (!currentUser) return;
    
    setLoading(true);
    setSyncStatus('none');
    
    try {
      // Call the API to update user profile
      const success = await updateCurrentUser({
        firstName: values.firstName,
        lastName: values.lastName,
        bio: values.bio
      });
      
      if (success) {
        // Check toast message to determine sync status
        // This is a workaround - in a real app, you'd get this from the API response
        if (document.body.textContent?.includes("đồng bộ với máy chủ")) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('local');
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Lỗi cập nhật thông tin");
      setSyncStatus('none');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Pencil className="h-5 w-5 mr-2 text-blue-500" />
        Cập nhật thông tin cá nhân
      </h2>
      
      <div className="flex flex-col items-center mb-6">
        <UserAvatar 
          avatarUrl={currentUser?.avatarUrl || null}
          firstName={currentUser?.firstName}
          lastName={currentUser?.lastName}
          size="lg"
          editable={true}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Nhấp vào biểu tượng để cập nhật ảnh đại diện
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên của bạn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ của bạn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@example.com" {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới thiệu</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Giới thiệu ngắn gọn về bản thân..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
            </Button>
            
            {syncStatus !== 'none' && (
              <div className="flex items-center text-sm">
                <Database className="h-4 w-4 mr-1 text-blue-500" />
                {syncStatus === 'synced' ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Đã đồng bộ với máy chủ
                  </span>
                ) : (
                  <span className="flex items-center text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Đã lưu cục bộ, chưa đồng bộ
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </Form>
    </>
  );
};

export default ProfileForm;
