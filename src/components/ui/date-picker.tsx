import { useEffect, useId, useRef } from "react"
import {
  Calendar,
  type Options,
  type DateAny,
} from "vanilla-calendar-pro"

import "vanilla-calendar-pro/styles/core.css"

import { CalendarDays } from "lucide-react"

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  minDate?: string
  maxDate?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value = "",
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  disabled = false,
  className = "",
}: DatePickerProps) {
  const id = useId().replace(/:/g, "")
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const options: Options = {
      inputMode: true,

      // Let Vanilla Calendar calculate the best position.
      positionToInput: "auto",

      selectionDatesMode: "single",

      selectedDates: value
        ? [value as DateAny]
        : [],

      displayDateMin: minDate
        ? (minDate as DateAny)
        : undefined,

      displayDateMax: maxDate
        ? (maxDate as DateAny)
        : undefined,

      onChangeToInput(self) {
        if (!self.context.inputElement) return

        const selectedDate =
          self.context.selectedDates[0] ?? ""

        self.context.inputElement.value = selectedDate

        onChangeRef.current(selectedDate)

        self.hide()
      },
    }

    const calendar = new Calendar(`#${id}`, options)

    calendar.init()

    return () => {
      calendar.destroy()
    }
  }, [id])

  useEffect(() => {
    const input = document.getElementById(
      id,
    ) as HTMLInputElement | null

    if (!input) return

    input.value = value
  }, [id, value])

  return (
    <div className={`relative w-full ${className}`}>
      <CalendarDays
        className="
          pointer-events-none
          absolute
          left-3
          top-1/2
          z-10
          size-4
          -translate-y-1/2
          text-muted-foreground
        "
      />

      <input
        id={id}
        type="text"
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
        className="
          flex
          h-10
          w-full
          rounded-md
          border
          border-input
          bg-background
          px-3
          py-2
          pl-9
          text-sm
          ring-offset-background
          placeholder:text-muted-foreground
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          focus-visible:ring-offset-2
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      />
    </div>
  )
}