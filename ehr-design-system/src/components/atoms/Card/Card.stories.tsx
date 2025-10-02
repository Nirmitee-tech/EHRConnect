import type { Meta, StoryObj } from "@storybook/react";
import { Heart, Activity, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
import { Button } from "../Button/Button";
import { Badge } from "../Badge/Badge";

const meta = {
  title: "Atoms/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Patient Record</CardTitle>
        <CardDescription>View patient medical information</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Patient medical history and records are displayed here.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Appointment Details</CardTitle>
        <CardDescription>Scheduled for tomorrow</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm"><strong>Patient:</strong> John Doe</p>
          <p className="text-sm"><strong>Time:</strong> 10:00 AM</p>
          <p className="text-sm"><strong>Type:</strong> Follow-up</p>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="medical">Confirm</Button>
        <Button variant="outline">Reschedule</Button>
      </CardFooter>
    </Card>
  ),
};

export const PatientCard: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            John Doe
          </CardTitle>
          <Badge variant="success">Active</Badge>
        </div>
        <CardDescription>MRN: 12345 | Age: 45 | M</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">BP: 120/80 mmHg</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Last Visit: Jan 15, 2025</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="medical" className="w-full">View Full Record</Button>
      </CardFooter>
    </Card>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Total Patients</CardTitle>
          <CardDescription>Active patient count</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">1,234</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Appointments Today</CardTitle>
          <CardDescription>Scheduled visits</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">42</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Critical Alerts</CardTitle>
          <CardDescription>Requires attention</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-500">3</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
          <CardDescription>Action items</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">18</p>
        </CardContent>
      </Card>
    </div>
  ),
};
