import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Crown, CheckCircle, Clock, QrCode, Download, Share2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/integrations/supabase/client";

const QR_CODE_IMAGE = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIB-339435005-NGUYENTUANANH";

interface VipPlanProps {
  duration: string;
  months: number;
  price: number;
  discount?: number;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
}

const VipPlan: React.FC<VipPlanProps> = ({ 
  duration, 
  months, 
  price, 
  discount = 0, 
  features, 
  isPopular = false,
  onSelect
}) => {
  const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
  
  return (
    <Card className={`relative h-full ${isPopular ? 'border-2 border-yellow-500 dark:border-yellow-600' : 'border'}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Phổ biến nhất
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className={`h-5 w-5 ${isPopular ? 'text-yellow-500' : 'text-blue-500'}`} />
          <span>Gói {duration}</span>
        </CardTitle>
        <CardDescription>Truy cập tất cả khóa học VIP trong {months} tháng</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">{finalPrice.toLocaleString('vi-VN')}₫</span>
          {discount > 0 && (
            <span className="text-sm text-muted-foreground line-through">{price.toLocaleString('vi-VN')}₫</span>
          )}
        </div>
        
        {discount > 0 && (
          <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
            Tiết kiệm {discount}%
          </div>
        )}
        
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onSelect}
          className={`w-full ${isPopular ? 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800' : ''}`}
        >
          Chọn gói này
        </Button>
      </CardFooter>
    </Card>
  );
};

const VipPurchaseForm = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("3-months");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const plans = {
    "3-months": {
      title: "3 Tháng",
      months: 3,
      price: 500000,
      discount: 0,
      features: [
        "Truy cập đ��y đủ tất cả khóa học VIP",
        "Bài kiểm tra và đánh giá chuyên sâu",
        "Hỗ trợ trực tiếp từ giảng viên",
        "Chứng chỉ hoàn thành khóa học"
      ]
    },
    "1-year": {
      title: "1 Năm",
      months: 12,
      price: 2000000,
      discount: 10,
      features: [
        "Truy cập đầy đủ tất cả khóa học VIP",
        "Bài kiểm tra và đánh giá chuyên sâu",
        "Hỗ trợ trực tiếp từ giảng viên",
        "Chứng chỉ hoàn thành khóa học",
        "Ưu tiên tiếp cận khóa học mới",
        "Tài liệu bổ sung độc quyền"
      ]
    }
  };
  
  const handleSubmitPurchase = async () => {
    if (!currentUser) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua gói VIP",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error } = await supabase
        .from('user_courses')
        .insert({
          user_id: currentUser.id,
          course_id: selectedPlan === "3-months" ? "vip-3-months" : "vip-1-year",
          has_paid: false,
          payment_amount: selectedPlan === "3-months" ? 500000 : 1800000,
          progress_percentage: 0,
          enrolled_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      setShowSuccessMessage(true);
      toast({
        title: "Đã ghi nhận",
        description: "Chúng tôi đã ghi nhận yêu cầu và sẽ kích hoạt tài khoản của bạn sau khi xác nhận thanh toán.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể xử lý giao dịch. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
  };
  
  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = QR_CODE_IMAGE;
    a.download = 'qr-thanh-toan-vip.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Đã tải xuống",
      description: "Mã QR đã được tải xuống thiết bị của bạn",
    });
  };
  
  if (showSuccessMessage) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Cảm ơn bạn!</h2>
        <p className="text-muted-foreground">
          Chúng tôi đã ghi nhận yêu cầu mua gói VIP của bạn.
          <br />Tài khoản của bạn sẽ được kích hoạt trong vòng 24 giờ sau khi xác nhận thanh toán.
        </p>
        <Button 
          onClick={() => setShowSuccessMessage(false)} 
          variant="outline" 
          className="mt-4"
        >
          Quay lại
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký gói học VIP</h2>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <VipPlan
            duration={plans["3-months"].title}
            months={plans["3-months"].months}
            price={plans["3-months"].price}
            features={plans["3-months"].features}
            onSelect={() => handleSelectPlan("3-months")}
            isPopular={selectedPlan === "3-months"}
          />
          
          <VipPlan
            duration={plans["1-year"].title}
            months={plans["1-year"].months}
            price={plans["1-year"].price}
            discount={plans["1-year"].discount}
            features={plans["1-year"].features}
            onSelect={() => handleSelectPlan("1-year")}
            isPopular={selectedPlan === "1-year"}
          />
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-500" />
              Thanh toán qua mã QR
            </CardTitle>
            <CardDescription>
              Quét mã QR hoặc chuyển khoản đến tài khoản ngân hàng bên dưới
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="qr" className="flex-1">Mã QR</TabsTrigger>
                <TabsTrigger value="bank" className="flex-1">Thông tin chuyển khoản</TabsTrigger>
              </TabsList>
              
              <TabsContent value="qr" className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-md mb-4">
                  <img src={QR_CODE_IMAGE} alt="QR Code" className="w-56 h-56 object-contain" />
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                    <Download className="h-4 w-4 mr-2" />
                    Tải mã QR
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(`VIB - 339435005 - NGUYEN TUAN ANH - ${selectedPlan === "3-months" ? "500,000đ" : "1,800,000đ"}`);
                    toast({ title: "Đã sao chép" });
                  }}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Sao chép thông tin
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="bank">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Ngân hàng</p>
                      <p className="text-sm bg-muted p-2 rounded">VIB (Vietnam International Bank)</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Số tài khoản</p>
                      <p className="text-sm bg-muted p-2 rounded">339435005</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Chủ tài khoản</p>
                      <p className="text-sm bg-muted p-2 rounded">NGUYEN TUAN ANH</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Số tiền</p>
                      <p className="text-sm bg-muted p-2 rounded font-medium">
                        {selectedPlan === "3-months" 
                          ? "500,000đ" 
                          : `${(plans["1-year"].price - (plans["1-year"].price * plans["1-year"].discount / 100)).toLocaleString('vi-VN')}đ`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Nội dung chuyển khoản</p>
                    <p className="text-sm bg-muted p-2 rounded">
                      {currentUser ? `VIP_${selectedPlan}_${currentUser.email.split('@')[0]}` : "VIP_[your-email]"}
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Vui lòng ghi đúng nội dung chuyển khoản để chúng tôi có thể xác nhận thanh toán của bạn.</li>
                      <li>Sau khi chuyển khoản, hãy nhấn "Xác nhận đã thanh toán" bên dưới.</li>
                      <li>Tài khoản VIP của bạn sẽ được kích hoạt trong vòng 24 giờ sau khi xác nhận thanh toán.</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleSubmitPurchase}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận đã thanh toán"
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Bằng cách nhấn nút xác nhận, bạn đồng ý với 
            <a href="#" className="underline ml-1">Điều khoản sử dụng</a> của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VipPurchaseForm;
