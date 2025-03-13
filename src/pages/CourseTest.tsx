
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { fetchCourseTests, supabase } from '@/integrations/supabase/client';
import CourseTestForm from '@/components/CourseTestForm';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Clock, FileText, Book, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CourseTest: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousResults, setPreviousResults] = useState<any[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadTests = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const testsData = await fetchCourseTests(courseId);
        console.log('Tests data:', testsData);
        setTests(testsData);
        
        // If user is logged in, fetch their previous test results
        if (user) {
          const { data: resultsData, error: resultsError } = await supabase
            .from('user_test_results')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId);
            
          if (resultsError) {
            console.error('Error fetching test results:', resultsError);
          } else {
            setPreviousResults(resultsData || []);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load tests:', error);
        toast.error('Không thể tải bài kiểm tra');
        setLoading(false);
      }
    };
    
    loadTests();
  }, [courseId, user]);
  
  const handleTestSelect = (test: any) => {
    setSelectedTest(test);
  };
  
  const handleTestComplete = async (score: number, passed: boolean) => {
    if (!user || !courseId || !selectedTest) return;
    
    try {
      // Record cheat attempts (tab switches)
      const cheatAttempts = document.visibilityState === 'hidden' ? 1 : 0;
      
      // Save test result to database
      const { error } = await supabase
        .from('user_test_results')
        .insert({
          user_id: user.id,
          course_id: courseId,
          course_test_id: selectedTest.id,
          score,
          passed,
          time_taken: Math.floor(selectedTest.time_limit * 60),
          answers: JSON.stringify({}), // Can be enhanced to store actual answers
        });
        
      if (error) throw error;
      
      // If passed, update course progress
      if (passed) {
        // Check if user is enrolled in the course
        const { data: enrollment } = await supabase
          .from('user_courses')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
          
        if (enrollment) {
          // Update progress - a simple increment here, could be more sophisticated
          const newProgress = Math.min(100, (enrollment.progress_percentage || 0) + 10);
          
          await supabase
            .from('user_courses')
            .update({ 
              progress_percentage: newProgress,
              last_accessed: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('course_id', courseId);
        }
      }
      
      toast.success(passed ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra' : 'Bạn chưa đạt điểm yêu cầu cho bài kiểm tra này');
      
      // Refresh previous results
      const { data: resultsData } = await supabase
        .from('user_test_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);
        
      setPreviousResults(resultsData || []);
      
    } catch (error) {
      console.error('Failed to save test result:', error);
      toast.error('Không thể lưu kết quả bài kiểm tra');
    }
  };
  
  // Check if user is enrolled in the course
  const checkEnrollment = async () => {
    if (!user || !courseId) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
        
      if (error) {
        console.error('Error checking enrollment:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Failed to check enrollment:', error);
      return false;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
        {selectedTest ? (
          <div className="max-w-3xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTest(null)}
              className="mb-6"
            >
              ← Quay lại danh sách bài kiểm tra
            </Button>
            <CourseTestForm 
              test={selectedTest} 
              courseId={courseId || ''} 
              onComplete={handleTestComplete} 
            />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Bài kiểm tra</h1>
              <p className="text-muted-foreground mt-2">Hoàn thành bài kiểm tra để đánh giá kiến thức của bạn</p>
            </div>
            
            {!user && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bạn cần đăng nhập để tham gia và lưu kết quả bài kiểm tra
                </AlertDescription>
              </Alert>
            )}
            
            {user && previousResults.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Kết quả bài kiểm tra trước đây</h2>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {previousResults.slice(0, 3).map((result) => (
                      <div key={result.id} className="bg-background p-4 rounded-md border">
                        <p className="font-medium">{tests.find(t => t.id === result.course_test_id)?.title || 'Bài kiểm tra'}</p>
                        <div className="flex justify-between mt-2 text-sm">
                          <span>Điểm số:</span>
                          <span className={result.score >= 70 ? 'text-green-500' : 'text-red-500'}>
                            {result.score}%
                          </span>
                        </div>
                        <div className="flex justify-between mt-1 text-sm">
                          <span>Trạng thái:</span>
                          <span className={result.passed ? 'text-green-500' : 'text-red-500'}>
                            {result.passed ? 'Đạt' : 'Chưa đạt'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(result.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {tests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium">Chưa có bài kiểm tra nào</p>
                  <p className="text-muted-foreground mt-1">Khóa học này chưa có bài kiểm tra tổng quát.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate(`/course/${courseId}`)}
                  >
                    Quay lại khóa học
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => {
                  // Find user's best result for this test, if any
                  const testResults = previousResults.filter(r => r.course_test_id === test.id);
                  const bestResult = testResults.length > 0 
                    ? testResults.reduce((prev, current) => 
                        (prev.score > current.score) ? prev : current)
                    : null;
                    
                  return (
                    <Card key={test.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{test.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {test.description || 'Đánh giá kiến thức của bạn về chủ đề này'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{test.questions?.length || 0} câu hỏi</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{test.time_limit} phút</span>
                          </div>
                          <div className="flex items-center">
                            <Book className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Điểm đạt: {test.passing_score}%</span>
                          </div>
                          
                          {bestResult && (
                            <div className={`px-3 py-1 mt-2 text-xs rounded-full ${
                              bestResult.passed 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {bestResult.passed 
                                ? `Đã hoàn thành với ${bestResult.score}%` 
                                : `Chưa đạt - ${bestResult.score}%`}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <Separator />
                      <CardFooter className="pt-4">
                        <Button 
                          className="w-full" 
                          onClick={() => handleTestSelect(test)}
                        >
                          {bestResult?.passed ? 'Làm lại bài kiểm tra' : 'Bắt đầu làm bài'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
            
            <div className="mt-10">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/course/${courseId}`)}
              >
                Quay lại khóa học
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseTest;
