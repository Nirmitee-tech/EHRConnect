'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Target, Plus, CheckCircle2, Calendar, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

type Goal = {
  id?: string
  description?: {
    text?: string
  }
  startDate?: string
  target?: Array<{
    dueDate?: string
  }>
  lifecycleStatus?: string
  category?: Array<{ text?: string }>
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  onhold: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function PatientGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    description: '',
    category: '',
    targetDate: '',
    status: 'active',
  })
  const { toast } = useToast()

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/goals')
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load goals')
      }
      const data = await response.json()
      setGoals(data.goals || [])
    } catch (err) {
      console.error('Error loading goals:', err)
      setError(err instanceof Error ? err.message : 'Unable to load goals right now.')
    } finally {
      setLoading(false)
    }
  }

  const saveGoal = async (updates?: Partial<typeof form> & { id?: string }) => {
    try {
      setSaving(true)
      const response = await fetch('/api/patient/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates || form),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to save goal')
      }

      await loadGoals()
      if (!updates || !updates?.id) {
        setForm({
          description: '',
          category: '',
          targetDate: '',
          status: 'active',
        })
      }
      toast({ title: 'Goal saved', description: 'Your care plan has been updated.' })
    } catch (err) {
      console.error('Error saving goal:', err)
      toast({
        title: 'Unable to save goal',
        description: err instanceof Error ? err.message : 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const markGoalCompleted = async (goal: Goal) => {
    if (!goal.id) return
    await saveGoal({ id: goal.id, status: 'completed', description: goal.description?.text })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Care Goals</h1>
          <p className="text-gray-600">
            Track wellness goals, rehabilitation targets, and shared care plans.
          </p>
        </div>
        <Button variant="outline" onClick={loadGoals}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Create a goal
          </CardTitle>
          <CardDescription>
            Set personal health goals to share with your care team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="goal-description">Goal description</Label>
            <Textarea
              id="goal-description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="e.g., Walk 30 minutes daily, reduce HbA1c, improve sleep hygiene"
            />
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="goal-category">Category</Label>
              <Input
                id="goal-category"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                placeholder="Wellness, Nutrition, Rehab..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-target">Target date</Label>
              <Input
                id="goal-target"
                type="date"
                value={form.targetDate}
                onChange={(event) => setForm((prev) => ({ ...prev, targetDate: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="onhold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => saveGoal()}
            disabled={saving || !form.description.trim()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Save goal
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing goals</CardTitle>
          <CardDescription>Mark them complete as you make progress.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : error ? (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          ) : goals.length === 0 ? (
            <p className="text-sm text-gray-600">No goals yet. Start by creating one above.</p>
          ) : (
            goals.map((goal) => {
              const statusKey = goal.lifecycleStatus?.toLowerCase() || 'active'
              const targetDate = goal.target?.[0]?.dueDate
              return (
                <div
                  key={goal.id || goal.description?.text}
                  className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        {goal.description?.text || 'Goal'}
                      </h3>
                      <Badge className={`${STATUS_COLORS[statusKey] || 'bg-gray-100 text-gray-700 border-gray-200'} border uppercase`}>
                        {goal.lifecycleStatus || 'active'}
                      </Badge>
                    </div>
                    {goal.category?.[0]?.text && (
                      <p className="text-sm text-gray-600">{goal.category[0].text}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {goal.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Started {format(new Date(goal.startDate), 'MMM d, yyyy')}
                        </span>
                      )}
                      {targetDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Target {format(new Date(targetDate), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  {goal.lifecycleStatus !== 'completed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markGoalCompleted(goal)}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark complete
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
