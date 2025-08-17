import { CommentGenerator } from '@/components/CommentGenerator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Heart, 
  MessageSquare, 
  Send, 
  MoreHorizontal, 
  RefreshCw, 
  Chrome, 
  Download,
  Repeat2,
  ThumbsUp,
  Award
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SAMPLE_POSTS = {
  'SaaS Founder': [
    '🚀 AI is transforming SaaS in 2025! Just implemented automated customer onboarding that reduced churn by 40%. The key is personalization at scale. What AI features are you building into your products?',
    '💡 Scaling startups with AI tools has been a game-changer. Our team productivity increased 60% after integrating AI workflows. The future of work is here! What\'s your experience with AI adoption?',
    '🎯 Founder tip: AI adoption isn\'t about replacing humans, it\'s about amplifying their capabilities. We\'ve seen 3x faster product development cycles. How are you leveraging AI in your organization?',
    '📈 SaaS growth hack: Use AI for predictive analytics to identify expansion opportunities. We increased upsells by 45% this quarter! Data-driven decisions are everything.',
    '🤖 AI trends every founder should watch: Autonomous agents, personalized experiences, and predictive customer success. The landscape is evolving rapidly!'
  ],
  'Marketer': [
    '🎯 Marketing strategies for 2025: AI-powered personalization is no longer optional. We\'re seeing 300% better engagement rates with dynamic content. What\'s working for your campaigns?',
    '💡 Digital ads with AI optimization have transformed our ROI. Automated bidding and creative testing delivered 150% better performance. The data speaks for itself!',
    '📝 Content marketing tips: Use AI to analyze audience sentiment and optimize messaging. Our blog traffic increased 200% with AI-driven content strategy.',
    '🔍 SEO in the AI era requires understanding search intent better than ever. Voice search and AI assistants are changing how people discover content.',
    '📱 Social media growth hacks: AI-powered posting schedules and content optimization have 2x our engagement. Timing and relevance are everything!'
  ],
  'Other': [
    '🚀 Leadership tips for the digital age: Embrace continuous learning and foster a culture of experimentation. The best leaders are the most adaptable.',
    '💡 Innovation in tech is accelerating faster than ever. The companies that adapt quickest will dominate the next decade. How is your organization preparing?',
    '⚡ Productivity hacks that actually work: Time-blocking, automated workflows, and strategic delegation. Small improvements compound into massive gains.',
    '🤝 Networking advice: Quality over quantity always wins. Build genuine relationships and focus on providing value first. The opportunities will follow.',
    '🎯 Professional development insight: The skills gap is widening. Invest in learning new technologies and methodologies to stay relevant and valuable.'
  ]
};

export const Demo = () => {
  const navigate = useNavigate();
  const [currentPost, setCurrentPost] = useState('🚀 Leadership tips for the digital age: Embrace continuous learning and foster a culture of experimentation. The best leaders are the most adaptable.');
  const [currentPersona, setCurrentPersona] = useState('Other');

  const generateRandomPost = () => {
    const personas = Object.keys(SAMPLE_POSTS);
    const randomPersona = personas[Math.floor(Math.random() * personas.length)];
    const posts = SAMPLE_POSTS[randomPersona as keyof typeof SAMPLE_POSTS];
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    setCurrentPost(randomPost);
    setCurrentPersona(randomPersona);
  };

  useEffect(() => {
    const savedPersona = localStorage.getItem('persona') || 'Other';
    setCurrentPersona(savedPersona);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AutoComment.AI Demo
            </h1>
            <p className="text-gray-600 mb-4">
              Experience how our Chrome extension generates intelligent LinkedIn comments in real-time
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={generateRandomPost} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Different Post
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* LinkedIn-style Post Card */}
        <Card className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Post Header */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" alt="Sarah Chen" />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                  SC
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Sarah Chen</h3>
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    1st
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {currentPersona} | AI Enthusiast | Building the Future
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <span>2h</span>
                  <span>•</span>
                  <span>🌍</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            <p className="text-gray-900 leading-relaxed text-sm">
              {currentPost}
            </p>
          </div>

          {/* Extension CTA - Exactly like in your image */}
          <div className="mx-4 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Chrome className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 text-sm">
                  Get Instant AI Comments on LinkedIn
                </h4>
                <p className="text-xs text-blue-700">
                  Download our Chrome extension for real-time comment suggestions
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-medium"
                onClick={() => window.open('/auth', '_self')}
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border border-white">
                    <ThumbsUp className="w-2 h-2 text-white" />
                  </div>
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-white">
                    <Heart className="w-2 h-2 text-white" />
                  </div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border border-white">
                    <Award className="w-2 h-2 text-white" />
                  </div>
                </div>
                <span>142</span>
              </div>
              <div className="flex gap-4">
                <span>23 comments</span>
                <span>8 reposts</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200">
            <div className="flex">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">Like</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Comment</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition-colors">
                <Repeat2 className="w-4 h-4" />
                <span className="text-sm font-medium">Repost</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition-colors">
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">Send</span>
              </button>
            </div>
          </div>
        </Card>

        {/* AI Comment Generator Demo */}
        <div className="mt-8">
          <CommentGenerator defaultPost={currentPost} />
        </div>

        {/* How It Works Section */}
        <Card className="mt-8 bg-white shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How AutoComment.AI Works
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Install Chrome Extension</p>
                  <p>Add our extension to your Chrome browser - it's free and takes 30 seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Browse LinkedIn Normally</p>
                  <p>Our AI automatically detects posts and generates relevant comment suggestions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Choose & Engage</p>
                  <p>Select from AI-generated comments, customize if needed, and engage with your network</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Start Your Free Trial Today
              </Button>
            </div>
          </div>
        </Card>

        {/* Real Extension Process */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Chrome className="w-5 h-5" />
              About the Real Chrome Extension
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>🎯 What you see above is a demo simulation.</strong> The actual Chrome extension works directly on LinkedIn.com and provides:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Automatic detection:</strong> No copy-pasting needed - comments appear instantly when you visit LinkedIn posts</li>
                <li><strong>One-click commenting:</strong> Generated comments can be inserted directly into LinkedIn's comment box</li>
                <li><strong>Personal branding:</strong> AI learns your writing style and professional persona over time</li>
                <li><strong>Privacy focused:</strong> All processing happens securely - we never store your LinkedIn data</li>
                <li><strong>Smart timing:</strong> Suggests optimal comment timing based on post engagement patterns</li>
              </ul>
              <div className="mt-4 p-3 bg-white/60 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>📋 Installation note:</strong> Due to Chrome Web Store review process, the extension is currently available to beta users.
                  Sign up to join our beta program and get early access to the full Chrome extension!
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Demo;
