import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

interface PersonaSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const PersonaSelect = ({ value, onValueChange, disabled = false }: PersonaSelectProps) => {
  const personas = [
    { value: 'professional', label: 'Professional', premium: false },
    { value: 'saas-founder', label: 'SaaS Founder', premium: true },
    { value: 'marketer', label: 'Digital Marketer', premium: true },
    { value: 'analyst', label: 'Data Analyst', premium: true },
    { value: 'creative', label: 'Creative Professional', premium: true },
    { value: 'consultant', label: 'Business Consultant', premium: true }
  ];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select your persona" />
      </SelectTrigger>
      <SelectContent>
        {personas.map((persona) => (
          <SelectItem
            key={persona.value}
            value={persona.value}
            disabled={persona.premium && disabled}
            className={persona.premium && disabled ? 'opacity-50' : ''}
          >
            <div className="flex items-center justify-between w-full">
              <span>{persona.label}</span>
              {persona.premium && (
                <Badge variant="outline" className="text-xs ml-2">
                  <Lock className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
