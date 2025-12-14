'use client';

import { useState } from 'react';
import { Bot, Lightbulb, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getAIGoalSuggestions } from '@/app/actions';

import type { SuggestGoalsInput, SuggestGoalsOutput } from '@/ai/flows/ai-generated-goals';

type AIGoalSuggesterProps = {
  studentProfile: SuggestGoalsInput['studentProfile'];
};

export default function AIGoalSuggester({ studentProfile }: AIGoalSuggesterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestGoalsOutput | null>(null);
  const { toast } = useToast();

  const handleSuggestGoals = async () => {
    setIsLoading(true);
    setSuggestion(null);
    const result = await getAIGoalSuggestions(studentProfile);
    setIsLoading(false);

    if (result.success && result.data) {
      setSuggestion(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-headline">
          <Bot className="h-8 w-8 text-primary" />
          <span>AI-Powered Goal Recommendations</span>
        </CardTitle>
        <CardDescription>
          Use AI to generate realistic fitness goals and training intensities based on the student's profile and performance data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-4">
          <Button onClick={handleSuggestGoals} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Suggest Goals'
            )}
          </Button>

          {isLoading && (
             <div className="w-full text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-2 text-muted-foreground">Analyzing data and generating recommendations...</p>
             </div>
          )}

          {suggestion && (
            <div className="mt-4 w-full grid md:grid-cols-2 gap-4 animate-in fade-in-50">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-accent" />
                    Suggested Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert">
                  <p>{suggestion.suggestedGoals}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="text-accent" />
                    Training Intensity
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert">
                  <p>{suggestion.trainingIntensity}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
