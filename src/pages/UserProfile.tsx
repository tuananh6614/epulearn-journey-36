import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Lock, User } from 'lucide-react';
import UserSidebar from '@/components/UserSidebar';
import ProfileForm from '@/components/ProfileForm'; // Đã cập nhật hỗ trợ avatar
import SecurityForm from '@/components/SecurityForm';
import CertificatesTab from '@/components/CertificatesTab';

// API URL
const API_URL = 'http://localhost:3000/api/users';

const UserProfile = () => {
  const { currentUser } = useAuth();

  // Fetch enrolled courses cho người dùng hiện tại
  const fetchUserCourses = async () => {
    if (!currentUser?.id) return [];
    
    try {
      const response = await fetch(`${API_URL}/user-courses/${currentUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
      }
      const data = await response.json();
      return data.courses || [];
    } catch (error) {
      console.error('Error fetching user courses:', error);
      return [];
    }
  };

  // Fetch certificates cho người dùng hiện tại
  const fetchUserCertificates = async () => {
    if (!currentUser?.id) return [];
    
    try {
      const response = await fetch(`${API_URL}/user-certificates/${currentUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }
      const data = await response.json();
      return data.certificates || [];
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      return [];
    }
  };

  // Sử dụng React Query để lấy khóa học người dùng
  const { data: userCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['userCourses', currentUser?.id],
    queryFn: fetchUserCourses,
    enabled: !!currentUser?.id,
  });

  // Sử dụng React Query để lấy chứng chỉ người dùng
  const { data: userCertificates, isLoading: isLoadingCertificates } = useQuery({
    queryKey: ['userCertificates', currentUser?.id],
    queryFn: fetchUserCertificates,
    enabled: !!currentUser?.id,
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
                <p className="text-muted-foreground mb-6">Vui lòng đăng nhập để xem hồ sơ của bạn</p>
                <Button asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Component */}
            <UserSidebar 
              enrolledCourses={userCourses || []} 
              isLoadingCourses={isLoadingCourses}
            />
            
            {/* Nội dung chính */}
            <div className="flex-grow">
              <Tabs defaultValue="profile">
                <TabsList className="mb-6 w-full justify-start">
                  <TabsTrigger value="profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Thông tin cá nhân
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Bảo mật
                  </TabsTrigger>
                  <TabsTrigger value="certificates" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Chứng chỉ
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Card>
                    <CardContent className="pt-6">
                      <ProfileForm />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card>
                    <CardContent className="pt-6">
                      <SecurityForm />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="certificates">
                  <CertificatesTab 
                    certificates={userCertificates || []} 
                    isLoading={isLoadingCertificates}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
