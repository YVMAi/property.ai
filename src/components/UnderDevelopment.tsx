import { Construction } from 'lucide-react';

interface UnderDevelopmentProps {
  title: string;
}

export default function UnderDevelopment({ title }: UnderDevelopmentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <Construction className="h-16 w-16 text-muted-foreground/50 mb-6" />
      <h1 className="text-2xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-lg text-muted-foreground">Under Development</p>
      <div className="mt-8 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-75" />
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150" />
      </div>
    </div>
  );
}
