import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  PHQ9Response, 
  GAD7Response, 
  AssessmentFrequency,
  calculatePHQ9Score,
  calculateGAD7Score,
  getPHQ9Severity,
  getGAD7Severity
} from '../data/mockData';

interface AssessmentFormProps {
  onSubmit: (phq9: PHQ9Response, gad7: GAD7Response) => void;
  onCancel?: () => void;
}

const frequencyOptions: { value: AssessmentFrequency; label: string }[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' }
];

const impairmentOptions = [
  { value: 'notDifficult', label: 'Not difficult at all' },
  { value: 'somewhatDifficult', label: 'Somewhat difficult' },
  { value: 'veryDifficult', label: 'Very difficult' },
  { value: 'extremelyDifficult', label: 'Extremely difficult' }
];

export function AssessmentForm({ onSubmit, onCancel }: AssessmentFormProps) {
  const [step, setStep] = useState<'phq9' | 'gad7' | 'review'>('phq9');
  
  const [phq9, setPHQ9] = useState<PHQ9Response>({
    littleInterest: undefined as any,
    feelingDown: undefined as any,
    sleepProblems: undefined as any,
    feelingTired: undefined as any,
    appetiteProblems: undefined as any,
    feelingBad: undefined as any,
    troubleConcentrating: undefined as any,
    movingSpeaking: undefined as any,
    selfHarmThoughts: undefined as any,
    functionalImpairment: undefined
  });

  const [gad7, setGAD7] = useState<GAD7Response>({
    feelingNervous: undefined as any,
    cantStopWorrying: undefined as any,
    worryingTooMuch: undefined as any,
    troubleRelaxing: undefined as any,
    beingRestless: undefined as any,
    easilyAnnoyed: undefined as any,
    feelingAfraid: undefined as any,
    functionalImpairment: undefined
  });

  const phq9Questions = [
    { key: 'littleInterest' as const, text: 'Little interest or pleasure in doing things' },
    { key: 'feelingDown' as const, text: 'Feeling down, depressed, or hopeless' },
    { key: 'sleepProblems' as const, text: 'Trouble falling or staying asleep, or sleeping too much' },
    { key: 'feelingTired' as const, text: 'Feeling tired or having little energy' },
    { key: 'appetiteProblems' as const, text: 'Poor appetite or overeating' },
    { key: 'feelingBad' as const, text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down' },
    { key: 'troubleConcentrating' as const, text: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
    { key: 'movingSpeaking' as const, text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual' },
    { key: 'selfHarmThoughts' as const, text: 'Thoughts that you would be better off dead, or of hurting yourself in some way' }
  ];

  const gad7Questions = [
    { key: 'feelingNervous' as const, text: 'Feeling nervous, anxious or on edge' },
    { key: 'cantStopWorrying' as const, text: 'Not being able to stop or control worrying' },
    { key: 'worryingTooMuch' as const, text: 'Worrying too much about different things' },
    { key: 'troubleRelaxing' as const, text: 'Trouble relaxing' },
    { key: 'beingRestless' as const, text: "Being so restless that it's hard to sit still" },
    { key: 'easilyAnnoyed' as const, text: 'Becoming easily annoyed or irritable' },
    { key: 'feelingAfraid' as const, text: 'Feeling afraid as if something awful might happen' }
  ];

  const handlePHQ9Continue = () => {
    const allQuestionsAnswered = phq9Questions.every(q => phq9[q.key] !== undefined);
    if (allQuestionsAnswered && phq9.functionalImpairment) {
      setStep('gad7');
    }
  };

  const handleGAD7Continue = () => {
    const allQuestionsAnswered = gad7Questions.every(q => gad7[q.key] !== undefined);
    if (allQuestionsAnswered && gad7.functionalImpairment) {
      setStep('review');
    }
  };

  const handleSubmit = () => {
    onSubmit(phq9, gad7);
  };

  const phq9Score = calculatePHQ9Score(phq9);
  const gad7Score = calculateGAD7Score(gad7);

  return (
    <div>
      {step === 'phq9' && (
        <Card>
          <CardHeader>
            <CardTitle>Wellbeing screening</CardTitle>
            <CardDescription>
              Over the last 2 weeks, how often have you been bothered by any of the following problems?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium align-top w-1/2">Question</th>
                    {frequencyOptions.map((option) => (
                      <th key={option.value} className="text-center p-3 font-medium text-sm align-top">
                        {option.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {phq9Questions.map((question, index) => (
                    <tr key={question.key} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">
                        <span className="font-medium">{index + 1}.</span> {question.text}
                      </td>
                      {frequencyOptions.map((option) => (
                        <td key={option.value} className="p-3 text-center">
                          <label className="flex items-center justify-center cursor-pointer w-full h-full">
                            <input
                              type="radio"
                              name={`phq9-${question.key}`}
                              value={option.value}
                              checked={phq9[question.key] === option.value}
                              onChange={(e) => {
                                console.log('Radio changed:', question.key, option.value);
                                setPHQ9({ ...phq9, [question.key]: option.value });
                              }}
                              className="assessment-radio"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {phq9Questions.map((question, index) => (
                <div key={question.key} className="border rounded-lg px-3 py-4 space-y-3">
                  <div className="text-sm font-medium">
                    <span className="font-bold">{index + 1}.</span> {question.text}
                  </div>
                  <div className="flex flex-col gap-2">
                    {frequencyOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          phq9[question.key] === option.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`phq9-${question.key}`}
                          value={option.value}
                          checked={phq9[question.key] === option.value}
                          onChange={() => {
                            setPHQ9({ ...phq9, [question.key]: option.value });
                          }}
                          className="sr-only"
                        />
                        <span className="text-xs font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 mt-6 border-t">
              <Label className="text-base font-medium">
                If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {impairmentOptions.map((option) => (
                  <div key={option.value} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="phq9-impairment"
                      id={`phq9-impairment-${option.value}`}
                      value={option.value}
                      checked={phq9.functionalImpairment === option.value}
                      onChange={() => setPHQ9({ ...phq9, functionalImpairment: option.value as PHQ9Response['functionalImpairment'] })}
                      className="assessment-radio"
                    />
                    <Label htmlFor={`phq9-impairment-${option.value}`} className="font-normal cursor-pointer gap-0">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handlePHQ9Continue} 
                disabled={!phq9Questions.every(q => phq9[q.key] !== undefined) || !phq9.functionalImpairment}
                className="ml-auto"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'gad7' && (
        <Card>
          <CardHeader>
            <CardTitle>Anxiety screening</CardTitle>
            <CardDescription>
              Over the last 2 weeks, how often have you been bothered by any of the following problems?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium align-top w-1/2">Question</th>
                    {frequencyOptions.map((option) => (
                      <th key={option.value} className="text-center p-3 font-medium text-sm align-top">
                        {option.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gad7Questions.map((question, index) => (
                    <tr key={question.key} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">
                        <span className="font-medium">{index + 1}.</span> {question.text}
                      </td>
                      {frequencyOptions.map((option) => (
                        <td key={option.value} className="p-3 text-center">
                          <label className="flex items-center justify-center cursor-pointer w-full h-full">
                            <input
                              type="radio"
                              name={`gad7-${question.key}`}
                              value={option.value}
                              checked={gad7[question.key] === option.value}
                              onChange={(e) => {
                                console.log('Radio changed:', question.key, option.value);
                                setGAD7({ ...gad7, [question.key]: option.value });
                              }}
                              className="assessment-radio"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {gad7Questions.map((question, index) => (
                <div key={question.key} className="border rounded-lg px-3 py-4 space-y-3">
                  <div className="text-sm font-medium">
                    <span className="font-bold">{index + 1}.</span> {question.text}
                  </div>
                  <div className="flex flex-col gap-2">
                    {frequencyOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          gad7[question.key] === option.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`gad7-${question.key}`}
                          value={option.value}
                          checked={gad7[question.key] === option.value}
                          onChange={() => {
                            setGAD7({ ...gad7, [question.key]: option.value });
                          }}
                          className="sr-only"
                        />
                        <span className="text-xs font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 mt-6 border-t">
              <Label className="text-base font-medium">
                If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {impairmentOptions.map((option) => (
                  <div key={option.value} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="gad7-impairment"
                      id={`gad7-impairment-${option.value}`}
                      value={option.value}
                      checked={gad7.functionalImpairment === option.value}
                      onChange={() => setGAD7({ ...gad7, functionalImpairment: option.value as GAD7Response['functionalImpairment'] })}
                      className="assessment-radio"
                    />
                    <Label htmlFor={`gad7-impairment-${option.value}`} className="font-normal cursor-pointer gap-0">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setStep('phq9')}>
                Back
              </Button>
              <Button 
                onClick={handleGAD7Continue} 
                disabled={!gad7Questions.every(q => gad7[q.key] !== undefined) || !gad7.functionalImpairment}
              >
                Review Responses
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Responses</CardTitle>
            <CardDescription>
              Please review your assessment before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold">Wellbeing Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {getPHQ9Severity(phq9Score)} depression symptoms
                  </p>
                </div>
                <div className="text-3xl font-bold">{phq9Score}/27</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold">Anxiety Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {getGAD7Severity(gad7Score)} anxiety symptoms
                  </p>
                </div>
                <div className="text-3xl font-bold">{gad7Score}/21</div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> These assessments are screening tools and do not constitute a diagnosis. 
                Your responses will be shared with your therapist to help guide your treatment.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('gad7')}>
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Submit Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}