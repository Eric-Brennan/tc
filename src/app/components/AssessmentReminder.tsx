import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockAssessments } from '../data/mockData';
import { format } from 'date-fns';

interface AssessmentReminderProps {
  clientId: string;
}

export function AssessmentReminder({ clientId }: AssessmentReminderProps) {
  const navigate = useNavigate();

  // Get assessments for current client
  const clientAssessments = mockAssessments
    .filter(a => a.clientId === clientId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const lastAssessment = clientAssessments[0];

  // Calculate if assessment is due (every 2 weeks)
  const isAssessmentDue = () => {
    if (!lastAssessment) return true;
    const daysSinceLastAssessment = Math.floor(
      (new Date().getTime() - lastAssessment.date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastAssessment >= 14;
  };

  const isDue = isAssessmentDue();

  if (!isDue) return null;

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <div className="col-start-2 flex flex-col gap-1">
        <div className="font-medium tracking-tight">Assessment Due</div>
        <div className="text-sm text-muted-foreground">
          {lastAssessment 
            ? 'It\'s been 2 weeks since your last assessment. Please complete your fortnightly wellbeing check-in.'
            : 'Please complete your initial wellbeing assessment to establish a baseline for your treatment.'
          }
        </div>
      </div>
      <Button onClick={() => navigate('/c/assessments')} size="sm" className="col-span-2 w-full sm:w-auto mt-2">
        Complete Assessment
      </Button>
    </Alert>
  );
}