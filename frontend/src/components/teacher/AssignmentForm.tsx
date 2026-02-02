import React, { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface AssignmentFormProps {
  initialData?: {
    title: string
    problem_description: string
  }
  onSubmit: (_formData: { title: string; problem_description: string }) => Promise<void>
  onCancel: () => void
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    problem_description: initialData?.problem_description || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Assignment title is required'
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    }
    
    if (!formData.problem_description.trim()) {
      newErrors.problem_description = 'Problem description is required'
    } else if (formData.problem_description.trim().length < 20) {
      newErrors.problem_description = 'Description must be at least 20 characters'
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
        title: formData.title.trim(),
        problem_description: formData.problem_description.trim()
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
        label="Assignment Title"
        name="title"
        type="text"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="e.g., Hello World Program"
        error={errors.title}
        disabled={isLoading}
      />

      <div>
        <label htmlFor="problem_description" className="block text-sm font-medium text-gray-300 mb-2">
          Problem Description
        </label>
        <textarea
          id="problem_description"
          name="problem_description"
          value={formData.problem_description}
          onChange={handleInputChange}
          placeholder="Describe the programming problem students need to solve. Include requirements, constraints, examples, and any helpful hints..."
          rows={8}
          disabled={isLoading}
          className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none ${
            errors.problem_description ? 'border-red-500' : 'border-gray-600'
          }`}
        />
        {errors.problem_description && (
          <p className="text-sm text-red-400 mt-2">{errors.problem_description}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Tip: Include example inputs/outputs, constraints, and step-by-step requirements to help students understand the problem.
        </p>
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
          {initialData ? 'Update Assignment' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  )
}

export default AssignmentForm