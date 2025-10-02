import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Molecules/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'CodeBlock component for displaying multi-line code snippets with syntax highlighting, line numbers, copy functionality, and healthcare-specific configurations. Perfect for API documentation, configuration files, and technical specifications.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    copyable: {
      control: 'boolean',
    },
    showLineNumbers: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Default: Story = {
  args: {
    children: `const patient = {
  id: "MRN-123456",
  name: "John Doe",
  age: 45
};`,
    language: 'javascript',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Patient Data Model',
    language: 'typescript',
    children: `interface Patient {
  id: string;
  name: string;
  dateOfBirth: Date;
  medicalRecordNumber: string;
  primaryCarePhysician: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}`,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <CodeBlock variant="default" title="Default Configuration">
{`server:
  host: localhost
  port: 3000`}
      </CodeBlock>
      
      <CodeBlock variant="primary" title="API Response" language="json">
{`{
  "status": "success",
  "data": {
    "patientId": "MRN-123456"
  }
}`}
      </CodeBlock>
      
      <CodeBlock variant="success" title="Successful Deployment" language="bash">
{`✅ Deployment completed successfully
🚀 Application is running on port 3000
📊 Health check passed`}
      </CodeBlock>
      
      <CodeBlock variant="warning" title="Configuration Warning" language="yaml">
{`# Warning: Development configuration
debug: true
logging: verbose`}
      </CodeBlock>
      
      <CodeBlock variant="danger" title="Error Log" language="text">
{`ERROR: Database connection failed
STACK: Connection timeout after 30s
ACTION: Check database server status`}
      </CodeBlock>
    </div>
  ),
};

export const WithLineNumbers: Story = {
  render: () => (
    <CodeBlock
      title="Patient Service Implementation"
      language="typescript"
      showLineNumbers
      highlightLines={[5, 12]}
    >
{`class PatientService {
  private db: Database;
  
  constructor(database: Database) {
    this.db = database; // Highlighted line
  }
  
  async getPatient(id: string): Promise<Patient> {
    const result = await this.db.query(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    ); // Highlighted line
    
    if (!result.rows.length) {
      throw new Error('Patient not found');
    }
    
    return result.rows[0];
  }
}`}
    </CodeBlock>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">FHIR Patient Resource</h3>
        <CodeBlock
          title="FHIR R4 Patient Resource"
          language="json"
          variant="primary"
          showLineNumbers
        >
{`{
  "resourceType": "Patient",
  "id": "patient-123",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2024-01-15T09:30:00Z"
  },
  "identifier": [
    {
      "use": "usual",
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "MR"
        }]
      },
      "value": "MRN-123456789"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Doe",
      "given": ["John", "Michael"]
    }
  ],
  "gender": "male",
  "birthDate": "1978-05-15",
  "address": [
    {
      "use": "home",
      "line": ["123 Main St"],
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345"
    }
  ]
}`}
        </CodeBlock>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">HL7 v2.x Message</h3>
        <CodeBlock
          title="ADT^A08 - Update Patient Information"
          language="text"
          variant="success"
          copyable
        >
{`MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|20240115093000||ADT^A08|MSG123456|P|2.5
EVN|A08|20240115093000|||USER123|20240115093000
PID|1||MRN123456789^^^HOSPITAL^MR||DOE^JOHN^MICHAEL||19780515|M|||123 MAIN ST^^ANYTOWN^CA^12345||(555)123-4567|(555)987-6543||S||123456789|999-99-9999
PV1|1|I|ICU^101^01^HOSPITAL|||123456^SMITH^JOHN^A^MD||SUR|||A|||123456^SMITH^JOHN^A^MD|INP|SELF|||||||||||||||||||N||20240115093000`}
        </CodeBlock>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Database Schema</h3>
        <CodeBlock
          title="Patients Table Schema"
          language="sql"
          variant="primary"
          showLineNumbers
          highlightLines={[1, 15, 20]}
        >
{`CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    phone_home VARCHAR(20),
    phone_mobile VARCHAR(20),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'USA',
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_patients_mrn ON patients(medical_record_number);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);`}
        </CodeBlock>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
        <CodeBlock
          title="EHR API Configuration"
          language="yaml"
          variant="warning"
          copyable
        >
{`# EHR Connect API Configuration
server:
  host: 0.0.0.0
  port: 8080
  environment: production

database:
  host: postgres.ehr.internal
  port: 5432
  database: ehrconnect_prod
  ssl: true
  pool_size: 20
  connection_timeout: 30s

security:
  jwt_secret: ${JWT_SECRET}
  jwt_expiration: 24h
  rate_limiting:
    enabled: true
    requests_per_minute: 1000
  
  cors:
    allowed_origins:
      - https://app.ehrconnect.com
      - https://admin.ehrconnect.com
    allowed_headers:
      - Authorization
      - Content-Type
      - X-Requested-With

logging:
  level: info
  format: json
  output: /var/log/ehr/app.log
  
  # HIPAA Audit Logging
  audit:
    enabled: true
    log_patient_access: true
    log_data_modifications: true
    retention_days: 2555  # 7 years

features:
  fhir_api: true
  hl7_integration: true
  telemedicine: true
  patient_portal: true`}
        </CodeBlock>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Docker Configuration</h3>
        <CodeBlock
          title="Dockerfile for EHR Application"
          language="dockerfile"
          variant="success"
          showLineNumbers
        >
{`FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S ehruser && \\
    adduser -S ehruser -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=ehruser:ehruser /app/dist ./dist
COPY --from=builder --chown=ehruser:ehruser /app/node_modules ./node_modules
COPY --from=builder --chown=ehruser:ehruser /app/package.json ./

# Switch to non-root user
USER ehruser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["node", "dist/server.js"]`}
        </CodeBlock>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Error Handling</h3>
        <CodeBlock
          title="API Error Response"
          language="json"
          variant="danger"
          maxHeight="200px"
        >
{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Patient data validation failed",
    "details": [
      {
        "field": "dateOfBirth",
        "message": "Date of birth cannot be in the future",
        "value": "2025-01-01"
      },
      {
        "field": "medicalRecordNumber",
        "message": "Medical record number already exists",
        "value": "MRN-123456"
      }
    ],
    "timestamp": "2024-01-15T09:30:00Z",
    "requestId": "req_abc123def456",
    "supportCode": "ERR_2024_0115_093000"
  }
}`}
        </CodeBlock>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [selectedExample, setSelectedExample] = React.useState('patient-model');
    const [customCode, setCustomCode] = React.useState('');
    
    const codeExamples = {
      'patient-model': {
        title: 'Patient Data Model',
        language: 'typescript',
        code: `interface Patient {
  id: string;
  medicalRecordNumber: string;
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
  };
  contact: {
    phone: string;
    email: string;
    address: Address;
  };
  medicalHistory: MedicalCondition[];
  allergies: Allergy[];
  medications: Medication[];
}`,
      },
      'api-endpoint': {
        title: 'Patient API Endpoints',
        language: 'javascript',
        code: `// GET /api/patients/:id
app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await PatientService.findById(req.params.id);
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(404).json({ 
      success: false, 
      error: 'Patient not found' 
    });
  }
});

// POST /api/patients
app.post('/api/patients', async (req, res) => {
  const patient = await PatientService.create(req.body);
  res.status(201).json({ success: true, data: patient });
});`,
      },
      'fhir-resource': {
        title: 'FHIR Observation Resource',
        language: 'json',
        code: `{
  "resourceType": "Observation",
  "id": "blood-pressure-001",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "85354-9",
        "display": "Blood pressure panel"
      }
    ]
  },
  "subject": {
    "reference": "Patient/patient-123"
  },
  "effectiveDateTime": "2024-01-15T09:30:00Z",
  "valueQuantity": {
    "value": 120,
    "unit": "mmHg",
    "system": "http://unitsofmeasure.org",
    "code": "mm[Hg]"
  }
}`,
      },
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Healthcare Code Examples</h3>
          <div className="flex gap-2 mb-4">
            {Object.entries(codeExamples).map(([key, example]) => (
              <button
                key={key}
                onClick={() => setSelectedExample(key)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedExample === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>
          
          <CodeBlock
            title={codeExamples[selectedExample as keyof typeof codeExamples].title}
            language={codeExamples[selectedExample as keyof typeof codeExamples].language}
            variant="primary"
            showLineNumbers
            copyable
          >
            {codeExamples[selectedExample as keyof typeof codeExamples].code}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Custom Code Editor</h3>
          <div className="space-y-3">
            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Enter your code here..."
              className="w-full h-24 p-3 border rounded-md font-mono text-sm resize-vertical"
            />
            <div className="text-sm text-muted-foreground">
              Enter any code above to see it rendered in a CodeBlock
            </div>
          </div>
          
          {customCode && (
            <CodeBlock
              title="Custom Code Preview"
              language="javascript"
              variant="success"
              copyable
            >
              {customCode}
            </CodeBlock>
          )}
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Code Block Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">✅ Supported Features:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Copy to clipboard functionality</li>
                <li>• Line numbers and highlighting</li>
                <li>• Multiple language support</li>
                <li>• Variant styling for context</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">🏥 Healthcare Use Cases:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• FHIR resource documentation</li>
                <li>• API integration examples</li>
                <li>• Configuration files</li>
                <li>• Database schemas</li>
                <li>• Error logs and debugging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};