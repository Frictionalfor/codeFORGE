import React, { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface ClassFormProps {
  initialData?: {
    name: string
    description: string
  }
  onSubmit: (_formData: { name: string; description: string }) => Promise<void>
  onCancel: () => void
}

const ClassForm: React.FC<ClassFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Class name must be at least 3 characters'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim()
      })
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Class Name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="e.g., Introduction to Programming"
        error={errors.name}
        disabled={isLoading}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe what this class is about, what students will learn, and any prerequisites..."
          rows={4}
          disabled={isLoading}
          className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-600'
          }`}
        />
        {errors.description && (
          <p className="text-sm text-red-400 mt-2">{errors.description}</p>
        )}
      </div>

      <div className="flex space-x-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          {initialData ? 'Update Class' : 'Create Class'}
        </Button>
      </div>
    </form>
  )
}

export default ClassForm