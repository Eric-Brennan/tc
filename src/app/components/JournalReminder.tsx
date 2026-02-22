import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockJournalEntries } from '../data/mockData';

interface JournalReminderProps {
  clientId: string;
}

export function JournalReminder({ clientId }: JournalReminderProps) {
  const navigate = useNavigate();

  // Get journal entries for current client
  const clientJournalEntries = mockJournalEntries
    .filter(j => j.clientId === clientId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const lastJournalEntry = clientJournalEntries[0];

  // Check if user has journaled today
  const hasJournaledToday = () => {
    if (!lastJournalEntry) return false;
    const today = new Date();
    const lastEntryDate = new Date(lastJournalEntry.date);
    return (
      lastEntryDate.getDate() === today.getDate() &&
      lastEntryDate.getMonth() === today.getMonth() &&
      lastEntryDate.getFullYear() === today.getFullYear()
    );
  };

  const journaledToday = hasJournaledToday();

  return (
    <Alert className={journaledToday ? 'border-green-200 bg-green-50' : ''}>
      <BookOpen className={`h-4 w-4 ${journaledToday ? 'text-green-600' : ''}`} />
      <div className="col-start-2 flex flex-col gap-1">
        <div className="font-medium tracking-tight">
          {journaledToday ? 'Journal Entry Complete' : 'Daily Journal'}
        </div>
        <div className="text-sm text-muted-foreground">
          {journaledToday 
            ? 'You\'ve journaled today. Great work maintaining your practice!'
            : 'Take a moment to reflect on your day and record your thoughts.'
          }
        </div>
      </div>
      <Button 
        onClick={() => navigate('/journal')} 
        size="sm" 
        variant={journaledToday ? 'outline' : 'default'}
        className="col-span-2 w-full mt-2"
      >
        {journaledToday ? 'View Journals' : 'Add Journal Entry'}
      </Button>
    </Alert>
  );
}