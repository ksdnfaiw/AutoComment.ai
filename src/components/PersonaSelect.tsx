import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonaSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const PersonaSelect = ({ value, onValueChange }: PersonaSelectProps) => {
  const personas = [
    { value: 'saas-founder', label: 'SaaS Founder' },
    { value: 'marketer', label: 'Marketer' },
    { value: 'analyst', label: 'Analyst' }
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select your persona" />
      </SelectTrigger>
      <SelectContent>
        {personas.map((persona) => (
          <SelectItem key={persona.value} value={persona.value}>
            {persona.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};