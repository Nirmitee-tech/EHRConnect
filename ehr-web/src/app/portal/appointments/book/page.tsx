'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday } from 'date-fns'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  User,
  Stethoscope,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

const APPOINTMENT_TYPES = [
  { value: 'in-person', label: 'In-Person Visit', icon: MapPin, description: 'Visit the clinic' },
  { value: 'video', label: 'Video Call', icon: Video, description: 'Virtual consultation' },
]

const SPECIALTIES = [
  'Primary Care',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Mental Health',
  'Dentistry',
]

export default function BookAppointmentPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Step management
  const [step, setStep] = useState(1)

  // Step 1: Provider Selection
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [providers, setProviders] = useState<any[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)

  // Step 2: Appointment Type & Date
  const [appointmentType, setAppointmentType] = useState('in-person')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)

  // Step 3: Details
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  // Step 4: Booking
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetchProviders()
  }, [selectedSpecialty])

  useEffect(() => {
    if (selectedProvider && selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedProvider, selectedDate])

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true)
      const response = await fetch(
        `/api/patient/providers?specialty=${selectedSpecialty}&search=${searchQuery}`
      )
      const data = await response.json()
      setProviders(data.providers || [])
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoadingProviders(false)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!selectedProvider || !selectedDate) return

    try {
      setLoadingSlots(true)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/patient/availability?providerId=${selectedProvider.id}&date=${dateStr}`
      )
      const data = await response.json()
      setAvailableSlots(data.slots || [])
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider)
    setStep(2)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot)
  }

  const handleBookAppointment = async () => {
    try {
      setBooking(true)

      const appointmentData = {
        practitionerId: selectedProvider.id,
        serviceType: reason,
        start: selectedSlot.start,
        end: selectedSlot.end,
        reason,
        notes,
        type: appointmentType,
      }

      const response = await fetch('/api/patient/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        throw new Error('Failed to book appointment')
      }

      const data = await response.json()

      toast({
        title: 'Appointment Booked!',
        description: 'Your appointment has been successfully scheduled.',
      })

      router.push(`/portal/appointments/${data.appointmentId}`)
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setBooking(false)
    }
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600 mt-1">Schedule a visit with your healthcare provider</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Select Provider' },
            { num: 2, label: 'Choose Time' },
            { num: 3, label: 'Add Details' },
            { num: 4, label: 'Confirm' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  step === s.num
                    ? 'bg-blue-600 text-white scale-110'
                    : step > s.num
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    step >= s.num ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </p>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 transition-all ${
                    step > s.num ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Provider Selection */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search providers by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {SPECIALTIES.map((spec) => (
                      <SelectItem key={spec} value={spec.toLowerCase()}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Providers List */}
          <div className="grid md:grid-cols-2 gap-4">
            {loadingProviders ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </>
            ) : providers.length > 0 ? (
              providers.map((provider) => (
                <Card
                  key={provider.id}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-500"
                  onClick={() => handleProviderSelect(provider)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={provider.photo?.[0]?.url} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                          {provider.name?.[0]?.given?.[0]?.[0]}
                          {provider.name?.[0]?.family?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {provider.name?.[0]?.given?.[0]} {provider.name?.[0]?.family}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {provider.qualification?.[0]?.code?.text || 'Healthcare Provider'}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Array.isArray(provider.specialty) && provider.specialty.map((spec: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {spec.text}
                            </Badge>
                          ))}
                        </div>
                        {provider.telecom && (
                          <p className="text-sm text-gray-500">
                            {provider.telecom.find((t: any) => t.system === 'phone')?.value}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="md:col-span-2">
                <CardContent className="py-12 text-center">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No providers found. Try adjusting your search.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="w-fit -ml-2 mb-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Change Provider
              </Button>
              <CardTitle>Selected Provider</CardTitle>
              <div className="flex items-center gap-4 pt-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedProvider?.photo?.[0]?.url} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {selectedProvider?.name?.[0]?.given?.[0]?.[0]}
                    {selectedProvider?.name?.[0]?.family?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    Dr. {selectedProvider?.name?.[0]?.given?.[0]} {selectedProvider?.name?.[0]?.family}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedProvider?.qualification?.[0]?.code?.text}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Appointment Type */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Type</CardTitle>
              <CardDescription>Choose how you'd like to meet</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={appointmentType} onValueChange={setAppointmentType}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {APPOINTMENT_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        appointmentType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} />
                      <type.icon
                        className={`w-6 h-6 ${
                          appointmentType === type.value ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Date & Time</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Week Calendar */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isPast = day < new Date() && !isToday(day)
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => !isPast && handleDateSelect(day)}
                      disabled={isPast}
                      className={`p-3 rounded-lg text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isPast
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-xs font-medium">{format(day, 'EEE')}</p>
                      <p className="text-lg font-bold mt-1">{format(day, 'd')}</p>
                    </button>
                  )
                })}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Available Times for {format(selectedDate, 'MMMM d, yyyy')}
                  </h4>
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-10" />
                      ))}
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            selectedSlot === slot
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }`}
                        >
                          {format(new Date(slot.start), 'h:mm a')}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      No available slots for this date. Please select another date.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedSlot}
                  size="lg"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Additional Details */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(2)}
                className="w-fit -ml-2 mb-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Change Time
              </Button>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Tell us about the reason for your visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit *</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Annual checkup, Follow-up, New symptoms"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information you'd like to share..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!reason} className="flex-1">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Review & Confirm */}
      {step === 4 && (
        <div className="space-y-6">
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-2xl">Review Your Appointment</CardTitle>
              <CardDescription>Please review the details before confirming</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider */}
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  Provider
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedProvider?.photo?.[0]?.url} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {selectedProvider?.name?.[0]?.given?.[0]?.[0]}
                      {selectedProvider?.name?.[0]?.family?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Dr. {selectedProvider?.name?.[0]?.given?.[0]} {selectedProvider?.name?.[0]?.family}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedProvider?.qualification?.[0]?.code?.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  Date & Time
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    {selectedSlot && (
                      <>
                        {format(new Date(selectedSlot.start), 'h:mm a')} -{' '}
                        {format(new Date(selectedSlot.end), 'h:mm a')}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Type */}
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Appointment Type</h3>
                <div className="flex items-center gap-2">
                  {appointmentType === 'video' ? (
                    <>
                      <Video className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-900">Video Call</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">In-Person Visit</span>
                    </>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Reason for Visit</h3>
                <p className="text-gray-900">{reason}</p>
                {notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</p>
                    <p className="text-sm text-gray-600">{notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleBookAppointment}
                  disabled={booking}
                  className="flex-1"
                  size="lg"
                >
                  {booking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
