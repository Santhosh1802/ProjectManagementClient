import { useEffect, useId, useRef } from "react"
import {
  Calendar,
  type Options,
  type DateAny,
  time,
} from "vanilla-calendar-pro"

import "vanilla-calendar-pro/styles/core.css"
import "vanilla-calendar-pro/styles/time.css"

import { CalendarDays } from "lucide-react"

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  minDate?: string
  maxDate?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  enableTime?: boolean
}

export function DatePicker({
  value = "",
  onChange,
  minDate,
  maxDate,
  placeholder,
  disabled = false,
  className = "",
  enableTime = false,
}: DatePickerProps) {
  const id = useId().replace(/:/g, "")
  const onChangeRef = useRef(onChange)
  const calendarRef = useRef<Calendar | null>(null)

  const defaultPlaceholder = enableTime
    ? "Select date and time"
    : "Select date"
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const handleEmit = (self: Calendar) => {
      if (!self.context.inputElement) return

      let selectedDate: string | undefined = self.context.selectedDates[0]
      if (!selectedDate && enableTime) {
        const todayStr =
          (self.context.dateToday ? String(self.context.dateToday) : "") ||
          new Date().toISOString().slice(0, 10)
        selectedDate = todayStr
      }

      if (!selectedDate) return

      if (enableTime) {
        const timeStr = self.context.selectedTime || "00:00"
        const [h = "00", m = "00"] = timeStr.split(":")
        const hours = h.padStart(2, "0")
        const minutes = m.padStart(2, "0")

        const dateTime = `${selectedDate} ${hours}:${minutes}`
        self.context.inputElement.value = dateTime
        onChangeRef.current(dateTime)
      } else {
        self.context.inputElement.value = selectedDate
        onChangeRef.current(selectedDate)
        self.hide()
      }
    }

    const options: Options = {
      inputMode: true,
      positionToInput: "auto",
      selectionDatesMode: "single",
      themeAttrDetect: "html[data-mode]",

      ...(enableTime
        ? {
            extensions: [time],
            selectionTimeMode: 24,
          }
        : {
            selectionTimeMode: false,
          }),

      selectedDates: value
        ? [value.split(" ")[0] as DateAny]
        : [],

      selectedTime:
        enableTime && value.includes(" ")
          ? value.split(" ")[1].slice(0, 5)
          : undefined,

      displayDateMin: minDate
        ? (minDate.split(" ")[0] as DateAny)
        : undefined,

      displayDateMax: maxDate
        ? (maxDate.split(" ")[0] as DateAny)
        : undefined,

      onChangeToInput(self) {
        handleEmit(self)
      },

      onChangeTime(self) {
        if (!enableTime) return
        handleEmit(self)
      },
    }

    const calendar = new Calendar(`#${id}`, options)
    calendarRef.current = calendar
    calendar.init()

    return () => {
      calendar.destroy()
      calendarRef.current = null
    }
  }, [id, enableTime, minDate, maxDate])

  useEffect(() => {
    const input = document.getElementById(
      id,
    ) as HTMLInputElement | null

    if (input && input.value !== value) {
      input.value = value
    }

    if (calendarRef.current && calendarRef.current.context?.isInit) {
      const datePart = value ? value.split(" ")[0] : ""
      const currentDate =
        calendarRef.current.context.selectedDates?.[0] ?? ""
      const timePart =
        enableTime && value.includes(" ")
          ? value.split(" ")[1].slice(0, 5)
          : undefined
      const currentTime = calendarRef.current.context.selectedTime

      const isDateDifferent = datePart !== currentDate
      const isTimeDifferent =
        enableTime && Boolean(timePart && timePart !== currentTime)

      if (isDateDifferent || isTimeDifferent) {
        try {
          calendarRef.current.set({
            selectedDates: datePart ? [datePart as DateAny] : [],
            ...(enableTime && timePart ? { selectedTime: timePart } : {}),
          })
        } catch {
          // ignore set errors
        }
      }
    }
  }, [id, value, enableTime])

  return (
    <div className={`relative w-full ${className}`}>
      <CalendarDays
        className="
          pointer-events-none
          absolute left-3 top-1/2 z-10
          size-4 -translate-y-1/2
          text-muted-foreground
        "
      />

      <input
        id={id}
        type="text"
        defaultValue={value}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        readOnly
        className="
          flex h-10 w-full rounded-md border border-input
          bg-background px-3 py-2 pl-9 text-xs shadow-xs transition-colors
          ring-offset-background
          placeholder:text-muted-foreground
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-ring
          focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
        "
      />
    </div>
  )
}
