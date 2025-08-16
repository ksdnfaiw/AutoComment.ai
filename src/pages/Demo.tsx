import { CommentGenerator } from '@/components/CommentGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Heart, MessageSquare, Send, MoreHorizontal, RefreshCw, Chrome, Download } from 'lucide-react';
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
  'Analyst': [
    '📊 Data analysis trends show AI is becoming the standard for predictive modeling. Real-time insights are driving 40% faster decision-making across industries.',
    '🤖 AI in analytics is revolutionizing how we interpret complex datasets. Machine learning models now identify patterns humans would miss in massive data volumes.',
    '💼 Market insights with AI reveal consumer behavior trends 6 months ahead of traditional methods. The competitive advantage is substantial for early adopters.',
    '🔧 Business intelligence tools powered by AI are democratizing data analysis. Non-technical teams can now generate sophisticated reports and insights independently.',
    '🎯 Predictive analytics tips: Focus on data quality first, then model complexity. Clean data with simple models often outperforms complex algorithms on messy data.'
  ],
  'Investor': [
    '💰 Investment opportunities in AI are unprecedented. Portfolio companies using AI show 3x faster growth rates. The infrastructure layer is particularly compelling.',
    '🚀 VC trends for 2025: AI-first companies are commanding higher valuations. Due diligence now includes AI strategy assessment as a core competency.',
    '💡 Startup funding tip: Show clear AI ROI metrics in your pitch. Investors want to see operational efficiency gains, not just technology demos.',
    '👀 AI startups to watch: Companies solving real business problems with measurable outcomes. The hype cycle is over - execution matters most.',
    '📈 Portfolio management with AI helps identify at-risk investments earlier. Predictive models flag potential issues 2-3 quarters in advance.'
  ],
  'Other': [
    '🌟 Innovation in tech is accelerating faster than ever. The companies that adapt quickest will dominate the next decade. How is your organization preparing?',
    '👨‍💼 Leadership tips for the digital age: Embrace continuous learning and foster a culture of experimentation. The best leaders are the most adaptable.',
    '⚡ Productivity hacks that actually work: Time-blocking, automated workflows, and strategic delegation. Small improvements compound into massive gains.',
    '🤝 Networking advice: Quality over quantity always wins. Build genuine relationships and focus on providing value first. The opportunities will follow.',
    '🎯 Professional development insight: The skills gap is widening. Invest in learning new technologies and methodologies to stay relevant and valuable.'
  ]
};

export const Demo = () => {
  const navigate = useNavigate();
  const [currentPost, setCurrentPost] = useState('');
  const [currentPersona, setCurrentPersona] = useState('SaaS Founder');

  const generateRandomPost = () => {
    const savedPersona = localStorage.getItem('persona') || 'Other';
    const posts = SAMPLE_POSTS[savedPersona as keyof typeof SAMPLE_POSTS] || SAMPLE_POSTS['Other'];
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    setCurrentPost(randomPost);
    setCurrentPersona(savedPersona);
  };

  useEffect(() => {
    generateRandomPost();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Chrome Extension Demo
          </h1>
          <p className="text-muted-foreground">
            See how AutoComment.AI works on LinkedIn posts
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Button onClick={generateRandomPost} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Generate New Post
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
              Go to Dashboard
            </Button>
          </div>
        </div>

        {/* Mock LinkedIn Post */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-card-foreground">Sarah Chen</h3>
                  <Badge variant="secondary" className="text-xs">1st</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {currentPersona} | AI Enthusiast | Building the Future
                </p>
                <p className="text-xs text-muted-foreground">2h • 🌍</p>
              </div>
              <button className="p-1 hover:bg-accent rounded">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="mb-4">
              <p className="text-card-foreground leading-relaxed">
                {currentPost}
              </p>
            </div>

            {/* Chrome Extension CTA */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Chrome className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">Get Instant AI Comments on LinkedIn</h4>
                  <p className="text-sm text-blue-700">Download our Chrome extension for real-time comment suggestions</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </Button>
              </div>
            </div>

            {/* LinkedIn Engagement Bar */}
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">👍</span>
                    </div>
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">❤️</span>
                    </div>
                  </div>
                  <span>142</span>
                </div>
                <div className="flex gap-4">
                  <span>23 comments</span>
                  <span>8 reposts</span>
                </div>
              </div>

              <div className="flex items-center justify-around pt-2 border-t border-border">
                <button className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span>Like</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>Comment</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent text-muted-foreground">
                  <Send className="w-4 h-4" />
                  <span>Repost</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent text-muted-foreground">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Comment Generator */}
        <div className="mt-8 max-w-2xl mx-auto">
          <CommentGenerator defaultPost={currentPost} />
        </div>
      </div>
    </div>
  );
};

export default Demo;