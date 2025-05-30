import React, { useState, useEffect } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface CustomSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string; icon?: React.ComponentType<any> }[]
  placeholder?: string
  customPlaceholder?: string
  label?: string
  className?: string
  allowCustom?: boolean
}

export function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  customPlaceholder = "Enter custom value",
  label,
  className,
  allowCustom = true,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState('')

  // Check if current value is a custom value (not in predefined options)
  const isCustomValue = value && !options.some(option => option.value === value)
  
  useEffect(() => {
    if (isCustomValue) {
      setCustomValue(value)
      setShowCustomInput(true)
    }
  }, [value, isCustomValue])

  const handleSelectOption = (optionValue: string) => {
    if (optionValue === 'custom') {
      setShowCustomInput(true)
      setCustomValue('')
    } else {
      setShowCustomInput(false)
      onValueChange(optionValue)
      setOpen(false)
    }
  }

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onValueChange(customValue.trim())
      setOpen(false)
    }
  }

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomSubmit()
    }
  }

  const getDisplayValue = () => {
    if (isCustomValue) {
      return value
    }
    const selectedOption = options.find(option => option.value === value)
    return selectedOption?.label || placeholder
  }

  const getDisplayIcon = () => {
    if (isCustomValue) {
      return null
    }
    const selectedOption = options.find(option => option.value === value)
    return selectedOption?.icon
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              {(() => {
                const IconComponent = getDisplayIcon()
                return IconComponent ? <IconComponent className="w-4 h-4" /> : null
              })()}
              <span className={cn(
                "truncate",
                !value && "text-muted-foreground"
              )}>
                {getDisplayValue()}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search options..." />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelectOption(option.value)}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      {option.icon && <option.icon className="w-4 h-4" />}
                      <span>{option.label}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
                {allowCustom && (
                  <CommandItem
                    value="custom"
                    onSelect={() => handleSelectOption('custom')}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <Plus className="w-4 h-4" />
                      <span>Add custom option</span>
                    </div>
                  </CommandItem>
                )}
              </CommandGroup>
              {showCustomInput && (
                <div className="p-2 border-t">
                  <div className="space-y-2">
                    <Label className="text-xs">Custom Value</Label>
                    <Input
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={handleCustomKeyDown}
                      placeholder={customPlaceholder}
                      className="text-sm"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleCustomSubmit}
                        disabled={!customValue.trim()}
                        className="flex-1"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCustomInput(false)
                          setCustomValue('')
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
} 