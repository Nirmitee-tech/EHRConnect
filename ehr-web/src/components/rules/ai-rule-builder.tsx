'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AIRuleBuilderProps {
  value: any;
  onChange: (value: any) => void;
  availableFields?: Array<{ name: string; label: string; type?: string }>;
}

export function AIRuleBuilder({ value, onChange, availableFields = [] }: AIRuleBuilderProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  const examplePrompts = [
    'Create a task when patient age is over 65',
    'Alert when blood pressure systolic is above 140',
    'Assign medication when patient has diagnosis code E11.9',
    'Send reminder if lab result is abnormal',
  ];

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processNaturalLanguage = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);

    try {
      // TODO: Replace with actual AI API call
      // For now, we'll use simple pattern matching as a demo
      const result = await simulateAIProcessing(input, availableFields);

      if (result) {
        onChange(result);
        setSuggestions([
          'Add another condition',
          'Change to OR logic',
          'Add priority level',
        ]);
      }
    } catch (error) {
      console.error('Error processing natural language:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateAIProcessing = async (
    text: string,
    fields: Array<{ name: string; label: string; type?: string }>
  ): Promise<any> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lowerText = text.toLowerCase();
    const rules: any[] = [];

    // Simple pattern matching (this would be replaced with actual AI)
    if (lowerText.includes('age') && (lowerText.includes('over') || lowerText.includes('above') || lowerText.includes('>'))) {
      const ageMatch = text.match(/(\d+)/);
      if (ageMatch) {
        rules.push({
          field: 'patient.age',
          operator: '>',
          value: parseInt(ageMatch[1]),
        });
      }
    }

    if (lowerText.includes('blood pressure') || lowerText.includes('bp')) {
      if (lowerText.includes('systolic')) {
        const bpMatch = text.match(/(\d+)/);
        if (bpMatch) {
          rules.push({
            field: 'var.bp_systolic',
            operator: lowerText.includes('above') || lowerText.includes('>') ? '>' : '<',
            value: parseInt(bpMatch[1]),
          });
        }
      }
    }

    if (lowerText.includes('gender')) {
      if (lowerText.includes('male')) {
        rules.push({
          field: 'patient.gender',
          operator: '=',
          value: 'male',
        });
      } else if (lowerText.includes('female')) {
        rules.push({
          field: 'patient.gender',
          operator: '=',
          value: 'female',
        });
      }
    }

    // Determine combinator
    const combinator = lowerText.includes(' or ') ? 'or' : 'and';

    return {
      combinator,
      rules: rules.length > 0 ? rules : [{ field: '', operator: '=', value: '' }],
    };
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <div className="space-y-3">
      {/* AI Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-md p-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <h3 className="text-xs font-semibold text-purple-900">AI Rule Assistant</h3>
        </div>
        <p className="text-xs text-purple-700">
          Describe your rule in plain English. Type or speak naturally, and I'll create the rule for you.
        </p>
      </div>

      {/* Example Prompts */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-700">Try these examples:</p>
        <div className="grid grid-cols-2 gap-1.5">
          {examplePrompts.map((example, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(example)}
              className="text-left p-2 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="relative">
          <Textarea
            placeholder="Example: Create a task when patient age is over 65 and blood pressure is above 140..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                processNaturalLanguage();
              }
            }}
            className="min-h-[100px] text-sm pr-12"
            disabled={isListening || isProcessing}
          />

          {/* Voice Button */}
          <button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={isProcessing}
            className={`absolute bottom-2 right-2 p-2 rounded transition-colors ${
              isListening
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            <div className="flex gap-1">
              <span className="w-1 h-3 bg-red-600 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-3 bg-red-600 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-3 bg-red-600 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="font-medium">Listening... Speak now</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Cmd+Enter</kbd> or{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> to process
          </p>
          <Button
            onClick={processNaturalLanguage}
            disabled={!input.trim() || isProcessing || isListening}
            size="sm"
            className="h-7"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Create Rule
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-700">Suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setInput(input + ' ' + suggestion)}
                className="px-2 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview of Generated Rule */}
      {value && value.rules && value.rules.length > 0 && value.rules[0].field && (
        <div className="bg-green-50 border border-green-200 rounded-md p-2">
          <p className="text-xs font-medium text-green-800 mb-1">✓ Rule Created</p>
          <div className="text-xs text-green-700">
            <p>
              When <span className="font-medium">{value.combinator.toUpperCase()}</span> of:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {value.rules.map((rule: any, i: number) => {
                const field = availableFields.find((f) => f.name === rule.field);
                return (
                  <li key={i}>
                    <span className="font-medium">{field?.label || rule.field}</span>{' '}
                    {rule.operator} {rule.value}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
        <p className="text-xs font-medium text-gray-700 mb-1">Tips for better results:</p>
        <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
          <li>Be specific about values and operators (over, under, equals, etc.)</li>
          <li>Use "and" or "or" to combine multiple conditions</li>
          <li>Mention field names clearly (age, blood pressure, gender, etc.)</li>
          <li>You can edit the generated rule afterwards</li>
        </ul>
      </div>
    </div>
  );
}
