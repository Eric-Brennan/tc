import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { 
  mockAssessments, 
  mockClients,
  mockTherapists,
  getPHQ9Severity,
  getGAD7Severity,
  Assessment
} from '../data/mockData';
import { format } from 'date-fns';
import { ArrowLeft, TrendingDown, TrendingUp, Minus, FileText, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useNavigate, useParams } from 'react-router';
import { useIsMobileView } from '../hooks/useIsMobileView';
import { useState } from 'react';

export function TherapistClientAssessments() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobileView();
  const therapistId = 't1';
  const currentTherapist = mockTherapists.find(t => t.id === therapistId)!;
  const client = mockClients.find(c => c.id === clientId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const clientAssessments = mockAssessments
    .filter(a => a.clientId === clientId && a.therapistId === therapistId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getTrendIcon = (current: number, previous: number | undefined) => {
    if (previous === undefined) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minimal': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      case 'Mild': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
      case 'Moderate': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
      case 'Moderately Severe': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      case 'Severe': return 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const frequencyLabels = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
  const impairmentLabels: Record<string, string> = {
    notDifficult: 'Not difficult at all',
    somewhatDifficult: 'Somewhat difficult',
    veryDifficult: 'Very difficult',
    extremelyDifficult: 'Extremely difficult'
  };

  if (!client) {
    return (
      <Layout userType="therapist" userName={currentTherapist.name} userAvatar={currentTherapist.avatar}>
        <div className="p-6 max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Client not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/t/assessments')}>
            Back to Assessments
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType="therapist" userName={currentTherapist.name} userAvatar={currentTherapist.avatar}>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/t/assessments')}
            className="shrink-0 mt-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <img
                src={client.avatar}
                alt={client.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{client.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {clientAssessments.length} assessment{clientAssessments.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assessments list */}
        {clientAssessments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No assessments completed yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {clientAssessments.map((assessment, index) => {
              const previousAssessment = clientAssessments[index + 1];
              const isExpanded = expandedId === assessment.id;

              return (
                <Card key={assessment.id}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : assessment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base md:text-lg">
                          {format(assessment.date, 'MMMM d, yyyy')}
                        </CardTitle>
                        <CardDescription>
                          Completed at {format(assessment.createdAt, 'h:mm a')}
                          {index === 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">Latest</Badge>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">PHQ-9</div>
                          <div className="flex items-center gap-1">
                            <span className="text-lg md:text-xl font-bold">{assessment.phq9Score}</span>
                            <span className="text-xs text-muted-foreground">/27</span>
                            {previousAssessment && getTrendIcon(assessment.phq9Score, previousAssessment.phq9Score)}
                          </div>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getSeverityColor(getPHQ9Severity(assessment.phq9Score))}`}>
                            {getPHQ9Severity(assessment.phq9Score)}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">GAD-7</div>
                          <div className="flex items-center gap-1">
                            <span className="text-lg md:text-xl font-bold">{assessment.gad7Score}</span>
                            <span className="text-xs text-muted-foreground">/21</span>
                            {previousAssessment && getTrendIcon(assessment.gad7Score, previousAssessment.gad7Score)}
                          </div>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getSeverityColor(getGAD7Severity(assessment.gad7Score))}`}>
                            {getGAD7Severity(assessment.gad7Score)}
                          </Badge>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent>
                      <Tabs defaultValue="phq9" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="phq9">PHQ-9 Responses</TabsTrigger>
                          <TabsTrigger value="gad7">GAD-7 Responses</TabsTrigger>
                        </TabsList>

                        <TabsContent value="phq9" className="space-y-4 mt-4">
                          <div className="space-y-3">
                            <ResponseItem question="Little interest or pleasure in doing things" value={assessment.phq9.littleInterest} label={frequencyLabels[assessment.phq9.littleInterest]} />
                            <ResponseItem question="Feeling down, depressed, or hopeless" value={assessment.phq9.feelingDown} label={frequencyLabels[assessment.phq9.feelingDown]} />
                            <ResponseItem question="Trouble falling or staying asleep, or sleeping too much" value={assessment.phq9.sleepProblems} label={frequencyLabels[assessment.phq9.sleepProblems]} />
                            <ResponseItem question="Feeling tired or having little energy" value={assessment.phq9.feelingTired} label={frequencyLabels[assessment.phq9.feelingTired]} />
                            <ResponseItem question="Poor appetite or overeating" value={assessment.phq9.appetiteProblems} label={frequencyLabels[assessment.phq9.appetiteProblems]} />
                            <ResponseItem question="Feeling bad about yourself" value={assessment.phq9.feelingBad} label={frequencyLabels[assessment.phq9.feelingBad]} />
                            <ResponseItem question="Trouble concentrating" value={assessment.phq9.troubleConcentrating} label={frequencyLabels[assessment.phq9.troubleConcentrating]} />
                            <ResponseItem question="Moving or speaking slowly/being fidgety" value={assessment.phq9.movingSpeaking} label={frequencyLabels[assessment.phq9.movingSpeaking]} />
                            <ResponseItem question="Thoughts of self-harm" value={assessment.phq9.selfHarmThoughts} label={frequencyLabels[assessment.phq9.selfHarmThoughts]} highlight={assessment.phq9.selfHarmThoughts > 0} />
                          </div>
                          {assessment.phq9.functionalImpairment && (
                            <div className="pt-4 border-t">
                              <p className="text-sm font-medium mb-2">Functional Impairment:</p>
                              <p className="text-sm text-muted-foreground">
                                {impairmentLabels[assessment.phq9.functionalImpairment]}
                              </p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="gad7" className="space-y-4 mt-4">
                          <div className="space-y-3">
                            <ResponseItem question="Feeling nervous, anxious or on edge" value={assessment.gad7.feelingNervous} label={frequencyLabels[assessment.gad7.feelingNervous]} />
                            <ResponseItem question="Not being able to stop or control worrying" value={assessment.gad7.cantStopWorrying} label={frequencyLabels[assessment.gad7.cantStopWorrying]} />
                            <ResponseItem question="Worrying too much about different things" value={assessment.gad7.worryingTooMuch} label={frequencyLabels[assessment.gad7.worryingTooMuch]} />
                            <ResponseItem question="Trouble relaxing" value={assessment.gad7.troubleRelaxing} label={frequencyLabels[assessment.gad7.troubleRelaxing]} />
                            <ResponseItem question="Being so restless that it's hard to sit still" value={assessment.gad7.beingRestless} label={frequencyLabels[assessment.gad7.beingRestless]} />
                            <ResponseItem question="Becoming easily annoyed or irritable" value={assessment.gad7.easilyAnnoyed} label={frequencyLabels[assessment.gad7.easilyAnnoyed]} />
                            <ResponseItem question="Feeling afraid as if something awful might happen" value={assessment.gad7.feelingAfraid} label={frequencyLabels[assessment.gad7.feelingAfraid]} />
                          </div>
                          {assessment.gad7.functionalImpairment && (
                            <div className="pt-4 border-t">
                              <p className="text-sm font-medium mb-2">Functional Impairment:</p>
                              <p className="text-sm text-muted-foreground">
                                {impairmentLabels[assessment.gad7.functionalImpairment]}
                              </p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ResponseItem({ 
  question, 
  value, 
  label, 
  highlight = false 
}: { 
  question: string; 
  value: number; 
  label: string; 
  highlight?: boolean;
}) {
  const getColorClass = (val: number) => {
    if (val === 0) return 'bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800';
    if (val === 1) return 'bg-yellow-100 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
    if (val === 2) return 'bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
    return 'bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-800';
  };

  return (
    <div className={`p-3 rounded-lg border ${highlight ? 'ring-2 ring-red-500' : getColorClass(value)}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium flex-1">{question}</p>
        <div className="text-right">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">Score: {value}</div>
        </div>
      </div>
    </div>
  );
}