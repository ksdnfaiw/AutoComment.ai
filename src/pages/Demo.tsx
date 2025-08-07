import { LinkedInButton } from '@/components/LinkedInButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Heart, MessageSquare, Send, MoreHorizontal } from 'lucide-react';

export const Demo = () => {
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
                  SaaS Founder | AI Enthusiast | Building the Future
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
                🚀 Just launched our new AI-powered feature that automates customer support responses! 
                <br /><br />
                The results are incredible:
                <br />• 90% faster response times
                <br />• 95% customer satisfaction 
                <br />• 60% reduction in support tickets
                <br /><br />
                AI isn't replacing our team - it's making them superhuman! 💪
                <br /><br />
                What's your experience with AI in customer service? Drop your thoughts below! 👇
              </p>
            </div>

            {/* AutoComment.AI Button Demo */}
            <div className="mb-4">
              <LinkedInButton />
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

        {/* Instructions */}
        <div className="mt-8 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <p>Click the blue "Suggest Comments" button above to see AI-generated comments</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <p>Review the 2-3 comment suggestions in the popup</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <p>Click "Approve" to copy the comment to your clipboard, or "Reject" to provide feedback</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <p>Paste the approved comment in LinkedIn's comment box</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Demo;