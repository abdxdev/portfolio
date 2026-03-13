'use client'

import { useState } from 'react'
// import { CircleCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CalendarAppointmentProps {
  onConfirm?: (date: Date, time: string) => void
}

function getNextWeekday(from: Date): Date {
  const d = new Date(from)
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

const CalendarAppointment = ({ onConfirm }: CalendarAppointmentProps) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const maxDate = new Date(tomorrow)
  maxDate.setMonth(maxDate.getMonth() + 1)

  const defaultDate = getNextWeekday(tomorrow)

  const [date, setDate] = useState<Date | undefined>(defaultDate)
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00 AM')

  const timeSlots = Array.from({ length: 57 }, (_, i) => {
    const totalMinutes = i * 15
    const hour24 = Math.floor(totalMinutes / 60) + 9
    const minute = totalMinutes % 60
    const period = hour24 >= 12 ? 'PM' : 'AM'
    let hour12 = hour24 % 12
    if (hour12 === 0) hour12 = 12
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`
  })

  // Disable: before tomorrow, after 1 month, and weekends
  const isDisabled = (day: Date) => {
    const d = new Date(day)
    d.setHours(0, 0, 0, 0)
    const dayOfWeek = d.getDay()
    return d < tomorrow || d > maxDate || dayOfWeek === 0 || dayOfWeek === 6
  }

  const handleConfirm = () => {
    if (date && selectedTime && onConfirm) {
      onConfirm(date, selectedTime)
    }
  }

  return (
    <div>
      <div className='relative p-0 md:pr-48'>
        <div className='p-6'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={setDate}
            defaultMonth={defaultDate}
            fromDate={tomorrow}
            toDate={maxDate}
            disabled={isDisabled}
            showOutsideDays={false}
            className='bg-transparent p-0 [--cell-size:--spacing(10)]'
            formatters={{
              formatWeekdayName: d =>
                d.toLocaleString('en-US', { weekday: 'short' })
            }}
          />
        </div>

        {/* Time column */}
        <div className='inset-y-0 right-0 flex w-full flex-col border-t max-md:h-60 md:absolute md:w-48 md:border-t-0 md:border-l'>
          <ScrollArea className='h-full'>
            <div className='flex flex-col gap-2 p-6'>
              {timeSlots.map(time => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  onClick={() => setSelectedTime(time)}
                  className='w-full shadow-none'
                >
                  {time}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Footer */}
      <div className='flex flex-col gap-4 border-t px-6 py-5 md:flex-row'>
        <div className='flex items-center gap-2 text-sm'>
          {date && selectedTime ? (
            <>
              <span>
                Schedule an appointment for{' '}
                <span className='font-medium'>
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>{' '}
                at <span className='font-medium'>{selectedTime}</span>.
              </span>
            </>
          ) : (
            <>Select a date and time for your meeting.</>
          )}
        </div>
        <Button
          disabled={!date || !selectedTime}
          className='w-full md:ml-auto md:w-auto'
          onClick={handleConfirm}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default CalendarAppointment