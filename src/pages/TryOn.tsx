import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Sparkles, ArrowLeft, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const TryOn = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const clothInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  
  const [clothImage, setClothImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Redirect unauthenticated users to sign in
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to use the Virtual Try-On feature');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Pre-fill cloth image from URL parameter
  useEffect(() => {
    const imageUrl = searchParams.get('image');
    if (imageUrl) {
      setClothImage(decodeURIComponent(imageUrl));
    }
  }, [searchParams]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (img: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setResultImage(null); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!clothImage || !modelImage) {
      toast.error('Please upload both cloth and model images');
      return;
    }
    
    setIsProcessing(true);
    setResultImage(null);
    setProgress(0);

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 12;
      });
    }, 500);
    
    try {
      const { data, error } = await supabase.functions.invoke('virtual-try-on', {
        body: { clothImage, modelImage }
      });

      if (error) {
        throw error;
      }

      if (data.success && data.resultImage) {
        setResultImage(data.resultImage);
        toast.success('Try-on complete!');
      } else {
        toast.error(data.message || 'Could not generate result. Please try again.');
      }
    } catch (error: any) {
      console.error('Try-on error:', error);
      toast.error(error.message || 'Failed to process. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const UploadBox = ({
    label,
    image,
    inputRef,
    onClear
  }: {
    label: string;
    image: string | null;
    inputRef: React.RefObject<HTMLInputElement>;
    onClear: () => void;
  }) => (
    <div className="flex flex-col items-center gap-3">
      <h3 className="font-medium text-foreground">{label}</h3>
      <div
        className="relative w-full max-w-sm aspect-[3/4] bg-secondary/30 rounded-lg border-2 border-dashed border-muted-foreground/30 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {image ? (
          <>
            <img src={image} alt={label} className="w-full h-full object-cover" />
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 rounded-full h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Choose File</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Virtual Cloth Assistant
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Wanna try out how that cloth suits you?
              <br />
              Upgrade your shopping experience with an intelligent trial room.
            </p>
            <div className="w-16 h-1 bg-primary mx-auto mt-6" />
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <UploadBox
                label="Cloth Image"
                image={clothImage}
                inputRef={clothInputRef}
                onClear={() => {
                  setClothImage(null);
                  setResultImage(null);
                }}
              />
              <UploadBox
                label="Model Image"
                image={modelImage}
                inputRef={modelInputRef}
                onClear={() => {
                  setModelImage(null);
                  setResultImage(null);
                }}
              />
            </div>

            <input
              ref={clothInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, setClothImage)}
            />
            <input
              ref={modelInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, setModelImage)}
            />

            {/* Try It Button */}
            <div className="flex justify-start mb-12">
              <Button
                size="lg"
                className="px-8"
                disabled={!clothImage || !modelImage || isProcessing}
                onClick={handleTryOn}
              >
                {isProcessing ? (
                  <>
                    Processing...
                    <Sparkles className="ml-2 h-5 w-5 animate-spin" />
                  </>
                ) : (
                  <>
                    Try It
                    <Sparkles className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                HERE IS YOUR RESULT
              </h2>
              <div className="bg-secondary/30 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                    <Progress value={progress} className="w-full" />
                    <p className="text-muted-foreground">
                      Creating your virtual try-on... {Math.round(progress)}%
                    </p>
                  </div>
                ) : resultImage ? (
                  <img
                    src={resultImage}
                    alt="Try-on result"
                    className="max-h-[500px] rounded-lg shadow-lg"
                  />
                ) : (
                  <p className="text-muted-foreground">
                    Upload both images and click "Try It" to see the result
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TryOn;
