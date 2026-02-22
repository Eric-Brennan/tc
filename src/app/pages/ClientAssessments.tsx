import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AssessmentForm } from '../components/AssessmentForm';
import Layout from '../components/Layout';
import { 
  mockAssessments, 
  mockClients,
  PHQ9Response,
  GAD7Response,
  calculatePHQ9Score,
  calculateGAD7Score,
  getPHQ9Severity,
  getGAD7Severity,
  Assessment
} from '../data/mockData';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, FileText, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { toast } from 'sonner';

export function ClientAssessments() {
  const [showForm, setShowForm] = useState(false);
  const [assessments, setAssessments] = useState(mockAssessments);
  const currentUser = mockClients[0]; // Simulating logged-in client
  
  // Get assessments for current client
  const clientAssessments = assessments
    .filter(a => a.clientId === currentUser.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const lastAssessment = clientAssessments[0];
  const previousAssessment = clientAssessments[1];

  // Calculate if assessment is due (every 2 weeks)
  const isAssessmentDue = () => {
    if (!lastAssessment) return true;
    const daysSinceLastAssessment = Math.floor(
      (new Date().getTime() - lastAssessment.date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastAssessment >= 14;
  };

  const handleSubmit = (phq9: PHQ9Response, gad7: GAD7Response) => {
    const phq9Score = calculatePHQ9Score(phq9);
    const gad7Score = calculateGAD7Score(gad7);
    
    const newAssessment: Assessment = {
      id: `a${assessments.length + 1}`,
      clientId: currentUser.id,
      therapistId: 't1', // Current therapist
      date: new Date(),
      phq9,
      gad7,
      phq9Score,
      gad7Score,
      createdAt: new Date()
    };

    // Add to assessments list
    setAssessments([newAssessment, ...assessments]);
    setShowForm(false);
    
    toast.success('Assessment completed successfully', {
      description: `PHQ-9: ${phq9Score}/27 (${getPHQ9Severity(phq9Score)}), GAD-7: ${gad7Score}/21 (${getGAD7Severity(gad7Score)})`
    });
  };

  const getTrendIcon = (current: number, previous: number | undefined) => {
    if (previous === undefined) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (showForm) {
    return (
      <Layout userType="client" userName={currentUser.name} userAvatar={currentUser.avatar}>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="mb-4 md:mb-6">
            <h1 className="text-3xl font-bold">Complete Your Assessment</h1>
            <p className="text-muted-foreground mt-2">
              This should take about 5-10 minutes to complete
            </p>
          </div>
          <AssessmentForm 
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType="client" userName={currentUser.name} userAvatar={currentUser.avatar}>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Assessments</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Track your mental health progress with regular PHQ-9 and GAD-7 screenings
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} size="lg" className="w-full md:w-auto">
            New Assessment
          </Button>
        </div>

        {isAssessmentDue() && (
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
            <Button onClick={() => setShowForm(true)} className="col-span-2 w-full sm:w-auto mt-2">
              Complete Assessment
            </Button>
          </Alert>
        )}

        {!isAssessmentDue() && lastAssessment && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">Up to Date</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              Your next assessment is due on {format(new Date(lastAssessment.date.getTime() + 14 * 24 * 60 * 60 * 1000), 'MMMM d, yyyy')}
            </AlertDescription>
          </Alert>
        )}

        {lastAssessment && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest wellbeing score</CardTitle>
                <CardDescription>
                  Wellbeing screening from {format(lastAssessment.date, 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold">{lastAssessment.phq9Score}</div>
                    <div className="text-sm text-muted-foreground">out of 27</div>
                    <div className="mt-2 inline-block px-3 py-1 bg-muted rounded-full text-sm font-medium">
                      {getPHQ9Severity(lastAssessment.phq9Score)}
                    </div>
                  </div>
                  {previousAssessment && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getTrendIcon(lastAssessment.phq9Score, previousAssessment.phq9Score)}
                        <span>
                          {Math.abs(lastAssessment.phq9Score - previousAssessment.phq9Score)} point
                          {Math.abs(lastAssessment.phq9Score - previousAssessment.phq9Score) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        from previous
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest anxiety score</CardTitle>
                <CardDescription>
                  Anxiety screening from {format(lastAssessment.date, 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold">{lastAssessment.gad7Score}</div>
                    <div className="text-sm text-muted-foreground">out of 21</div>
                    <div className="mt-2 inline-block px-3 py-1 bg-muted rounded-full text-sm font-medium">
                      {getGAD7Severity(lastAssessment.gad7Score)}
                    </div>
                  </div>
                  {previousAssessment && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getTrendIcon(lastAssessment.gad7Score, previousAssessment.gad7Score)}
                        <span>
                          {Math.abs(lastAssessment.gad7Score - previousAssessment.gad7Score)} point
                          {Math.abs(lastAssessment.gad7Score - previousAssessment.gad7Score) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        from previous
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Assessment History</CardTitle>
            <CardDescription>
              Your completed PHQ-9 and GAD-7 assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientAssessments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No assessments completed yet</p>
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  Complete Your First Assessment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {clientAssessments.map((assessment, index) => (
                  <div 
                    key={assessment.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {format(assessment.date, 'MMMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completed {format(assessment.createdAt, 'h:mm a')}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8 justify-around md:justify-end">
                      <div className="text-center min-w-[100px] md:min-w-[120px]">
                        <div className="text-xs md:text-sm text-muted-foreground mb-1">PHQ-9</div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl md:text-2xl font-bold">{assessment.phq9Score}</span>
                          {index < clientAssessments.length - 1 && (
                            <span className="text-sm text-muted-foreground">
                              {getTrendIcon(assessment.phq9Score, clientAssessments[index + 1].phq9Score)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getPHQ9Severity(assessment.phq9Score)}
                        </div>
                      </div>
                      <div className="text-center min-w-[100px] md:min-w-[120px]">
                        <div className="text-xs md:text-sm text-muted-foreground mb-1">GAD-7</div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl md:text-2xl font-bold">{assessment.gad7Score}</span>
                          {index < clientAssessments.length - 1 && (
                            <span className="text-sm text-muted-foreground">
                              {getTrendIcon(assessment.gad7Score, clientAssessments[index + 1].gad7Score)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getGAD7Severity(assessment.gad7Score)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About These Assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">PHQ-9 (Patient Health Questionnaire)</h4>
              <p className="text-sm text-muted-foreground">
                A 9-item screening tool for depression. Scores range from 0-27, with higher scores indicating more severe depression symptoms.
              </p>
              <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
                <li>0-4: Minimal depression</li>
                <li>5-9: Mild depression</li>
                <li>10-14: Moderate depression</li>
                <li>15-19: Moderately severe depression</li>
                <li>20-27: Severe depression</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">GAD-7 (Generalized Anxiety Disorder)</h4>
              <p className="text-sm text-muted-foreground">
                A 7-item screening tool for anxiety. Scores range from 0-21, with higher scores indicating more severe anxiety symptoms.
              </p>
              <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
                <li>0-4: Minimal anxiety</li>
                <li>5-9: Mild anxiety</li>
                <li>10-14: Moderate anxiety</li>
                <li>15-21: Severe anxiety</li>
              </ul>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Important:</strong> These assessments are screening tools and not diagnostic. They help you and your therapist track your progress over time. Always discuss results with your therapist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}