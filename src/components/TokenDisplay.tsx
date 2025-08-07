import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';

interface TokenDisplayProps {
  current: number;
  total: number;
}

export const TokenDisplay = ({ current, total }: TokenDisplayProps) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-primary" />
        <span className="font-medium text-card-foreground">Tokens</span>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Badge variant={current > 10 ? "default" : "destructive"} className="font-mono">
            {current}/{total}
          </Badge>
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};