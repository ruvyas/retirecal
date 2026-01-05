import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PROVINCES } from '@/lib/calculations/tax-brackets'
import type { Province } from '@/lib/types/tax'

interface ProvinceSelectorProps {
  value: Province
  onChange: (province: Province) => void
  disabled?: boolean
}

export function ProvinceSelector({ value, onChange, disabled = false }: ProvinceSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="province" className="text-sm font-medium">
        Province/Territory
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as Province)} disabled={disabled}>
        <SelectTrigger id="province" className="w-full">
          <SelectValue placeholder="Select your province" />
        </SelectTrigger>
        <SelectContent>
          {PROVINCES.map((province) => (
            <SelectItem key={province.code} value={province.code}>
              {province.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
