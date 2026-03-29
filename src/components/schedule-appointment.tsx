'use client'
import { RefObject, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShakeElement, ShakeHandle } from './shake-element'

interface CalendarAppointmentProps {
  onConfirm?: (date: Date, time: string) => void
  onCancel?: () => void
  shakeRef?: RefObject<ShakeHandle | null>
}

function getNextWeekday(from: Date): Date {
  const d = new Date(from)
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

const CalendarAppointment = ({ onConfirm, onCancel, shakeRef }: CalendarAppointmentProps) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const maxDate = new Date(tomorrow)
  maxDate.setMonth(maxDate.getMonth() + 1)
  const defaultMonth = getNextWeekday(tomorrow)

  // No defaults — user must explicitly pick both
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const timeSlots = Array.from({ length: 57 }, (_, i) => {
    const totalMinutes = i * 15
    const hour24 = Math.floor(totalMinutes / 60) + 9
    const minute = totalMinutes % 60
    const period = hour24 >= 12 ? 'PM' : 'AM'
    let hour12 = hour24 % 12
    if (hour12 === 0) hour12 = 12
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`
  })

  const isDisabled = (day: Date) => {
    const d = new Date(day)
    d.setHours(0, 0, 0, 0)
    const dayOfWeek = d.getDay()
    return d < tomorrow || d > maxDate || dayOfWeek === 0 || dayOfWeek === 6
  }

  const handleConfirm = () => {
    if (date && selectedTime) onConfirm?.(date, selectedTime)
  }

  const handleCancel = () => {
    setDate(undefined)
    setSelectedTime(null)
    onCancel?.()
  }

  const canConfirm = !!date && !!selectedTime

  return (
    <div>
      <div className="relative p-0 md:pr-48">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={defaultMonth}
            startMonth={tomorrow}
            endMonth={maxDate}
            disabled={isDisabled}
            showOutsideDays={false}
            className="bg-transparent p-0 [--cell-size:--spacing(10)]"
            formatters={{
              formatWeekdayName: d =>
                d.toLocaleString('en-US', { weekday: 'short' }),
            }}
          />
        </div>

        {/* Time column */}
        <div className="inset-y-0 right-0 flex w-full flex-col border-t max-md:h-60 md:absolute md:w-48 md:border-l md:border-t-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-6">
              {timeSlots.map(time => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  onClick={() => setSelectedTime(time)}
                  className="w-full shadow-none"
                >
                  {time}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 border-t px-6 py-5">
        <p className="flex-1 text-sm text-muted-foreground">
          {canConfirm ? (
            <>
              Set appointment for{' '}
              <span className="font-medium text-foreground">
                {date!.toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>{' '}
              at{' '}
              <span className="font-medium text-foreground">{selectedTime}</span>.
            </>
          ) : (
            'Select a date and time for your appointment.'
          )}
        </p>

        <ShakeElement ref={shakeRef}>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCancel}
              title="Cancel"
            >
              <X className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              disabled={!canConfirm}
              onClick={handleConfirm}
              title="Confirm appointment"
            >
              <Check className="size-4" />
            </Button>
          </div>
        </ShakeElement>
      </div>
    </div>
  )
}

export default CalendarAppointment