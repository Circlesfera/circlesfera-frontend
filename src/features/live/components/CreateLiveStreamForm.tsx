import React, { useState } from 'react'
import { Button } from '@/design-system/Button'
import { Input } from '@/design-system/Input'
import { Textarea } from '@/design-system/Textarea'
import { Label } from '@/design-system/Label'

interface CreateLiveStreamFormProps {
  onSubmit?: (data: LiveStreamData) => void
  onCancel?: () => void
  onSuccess?: (streamId: string) => void
  loading?: boolean
}

interface LiveStreamData {
  title: string
  description: string
  isPublic: boolean
  category: string
}

export const CreateLiveStreamForm: React.FC<CreateLiveStreamFormProps> = ({
  onSubmit,
  onCancel,
  onSuccess,
  loading = false
}) => {
  const [formData, setFormData] = useState<LiveStreamData>({
    title: '',
    description: '',
    isPublic: true,
    category: 'general'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    } else if (onSuccess) {
      // Simular creación exitosa
      onSuccess(`stream_${Date.now()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title" required>Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Título de tu transmisión"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe tu transmisión..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="category">Categoría</Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="general">General</option>
          <option value="gaming">Gaming</option>
          <option value="music">Música</option>
          <option value="sports">Deportes</option>
          <option value="education">Educación</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isPublic">Transmisión pública</Label>
      </div>

      <div className="flex space-x-3">
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !formData.title.trim()}
          className="flex-1"
        >
          {loading ? 'Creando...' : 'Iniciar Transmisión'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export default CreateLiveStreamForm
