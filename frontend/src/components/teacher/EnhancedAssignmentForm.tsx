import React, { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Calendar, Clock, AlertTriangle } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { TestCase } from '../../types/api'

interface AssignmentFormData {
  title: string
  problem_description: string
  language: 'c' | 'cpp' | 'java' | 'python' | 'javascript'
  time_limit: number
  memory_limit: number
  due_date: string | null // ISO string format
  allow_late_submission: boolean
  late_penalty_per_day: number
  max_late_days: number
  is_published: boolean
  test_cases: Omit<TestCase, 'id' | 'assignment_id' | 'created_at' | 'updated_at'>[]
}

interface EnhancedAssignmentFormProps {
  initialData?: Partial<AssignmentFormData>
  onSubmit: (data: AssignmentFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const EnhancedAssignmentForm: React.FC<EnhancedAssignmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: initialData?.title || '',
    problem_description: initialData?.problem_description || '',
    language: initialData?.language || 'c',
    time_limit: initialData?.time_limit || 5000,
    memory_limit: initialData?.memory_limit || 128,
    due_date: initialData?.due_date || null,
    allow_late_submission: initialData?.allow_late_submission || false,
    late_penalty_per_day: initialData?.late_penalty_per_day || 10,
    max_late_days: initialData?.max_late_days || 0,
    is_published: initialData?.is_published || true,
    test_cases: initialData?.test_cases || [
      {
        input: '',
        expected_output: '',
        is_hidden: false,
        points: 10,
        time_limit: 5000,
        memory_limit: 128
      }
    ]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof AssignmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: any) => {
    setFormData(prev => ({
      ...prev,
      test_cases: prev.test_cases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }))
  }

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      test_cases: [
        ...prev.test_cases,
        {
          input: '',
          expected_output: '',
          is_hidden: false,
          points: 10,
          time_limit: formData.time_limit,
          memory_limit: formData.memory_limit
        }
      ]
    }))
  }

  const removeTestCase = (index: number) => {
    if (formData.test_cases.length > 1) {
      setFormData(prev => ({
        ...prev,
        test_cases: prev.test_cases.filter((_, i) => i !== index)
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.problem_description.trim()) {
      newErrors.problem_description = 'Problem description is required'
    }

    if (formData.test_cases.length === 0) {
      newErrors.test_cases = 'At least one test case is required'
    }

    formData.test_cases.forEach((tc, index) => {
      if (!tc.expected_output.trim()) {
        newErrors[`test_case_${index}_output`] = 'Expected output is required'
      }
      if (tc.points <= 0) {
        newErrors[`test_case_${index}_points`] = 'Points must be greater than 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const totalPoints = formData.test_cases.reduce((sum, tc) => sum + tc.points, 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <Input
          label="Assignment Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          disabled={isLoading}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Problem Description
          </label>
          <textarea
            value={formData.problem_description}
            onChange={(e) => handleInputChange('problem_description', e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical min-h-[120px]"
            placeholder="Describe the problem, requirements, and any constraints..."
            disabled={isLoading}
            required
          />
          {errors.problem_description && (
            <p className="mt-1 text-sm text-red-400">{errors.problem_description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <Input
            label="Time Limit (ms)"
            type="number"
            value={formData.time_limit}
            onChange={(e) => handleInputChange('time_limit', parseInt(e.target.value) || 5000)}
            min={100}
            max={30000}
            disabled={isLoading}
          />

          <Input
            label="Memory Limit (MB)"
            type="number"
            value={formData.memory_limit}
            onChange={(e) => handleInputChange('memory_limit', parseInt(e.target.value) || 128)}
            min={16}
            max={512}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Scheduling & Deadlines */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Scheduling & Deadlines
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.due_date || ''}
              onChange={(e) => handleInputChange('due_date', e.target.value || null)}
              className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="mt-1 text-xs text-gray-400">
              Leave empty for no deadline
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => handleInputChange('is_published', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-dark-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              disabled={isLoading}
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-300">
              Publish immediately (visible to students)
            </label>
          </div>
        </div>

        {/* Late Submission Settings */}
        <div className="bg-dark-700 p-4 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              id="allow_late_submission"
              checked={formData.allow_late_submission}
              onChange={(e) => handleInputChange('allow_late_submission', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-dark-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              disabled={isLoading || !formData.due_date}
            />
            <label htmlFor="allow_late_submission" className="text-sm font-medium text-gray-300 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Allow late submissions
            </label>
          </div>

          {formData.allow_late_submission && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Penalty per day late (%)"
                type="number"
                value={formData.late_penalty_per_day}
                onChange={(e) => handleInputChange('late_penalty_per_day', parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                step={0.1}
                disabled={isLoading}
                helperText="Percentage points deducted per day late"
              />

              <Input
                label="Maximum late days"
                type="number"
                value={formData.max_late_days}
                onChange={(e) => handleInputChange('max_late_days', parseInt(e.target.value) || 0)}
                min={0}
                max={30}
                disabled={isLoading}
                helperText="Maximum days after deadline to accept submissions"
              />
            </div>
          )}

          {!formData.due_date && (
            <div className="flex items-center space-x-2 text-yellow-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Set a due date to enable late submission options</span>
            </div>
          )}
        </div>
      </div>

      {/* Test Cases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Test Cases ({formData.test_cases.length}) - Total Points: {totalPoints}
          </h3>
          <Button
            type="button"
            variant="outline"
            onClick={addTestCase}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Test Case</span>
          </Button>
        </div>

        {errors.test_cases && (
          <p className="text-sm text-red-400">{errors.test_cases}</p>
        )}

        <div className="space-y-4">
          {formData.test_cases.map((testCase, index) => (
            <div key={index} className="bg-dark-700 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Test Case {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleTestCaseChange(index, 'is_hidden', !testCase.is_hidden)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                      testCase.is_hidden 
                        ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30' 
                        : 'bg-green-900/20 text-green-400 border border-green-500/30'
                    }`}
                    disabled={isLoading}
                  >
                    {testCase.is_hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{testCase.is_hidden ? 'Hidden' : 'Visible'}</span>
                  </button>
                  
                  {formData.test_cases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Input
                  </label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                    placeholder="Input for this test case..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expected Output *
                  </label>
                  <textarea
                    value={testCase.expected_output}
                    onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                    placeholder="Expected output for this test case..."
                    rows={3}
                    disabled={isLoading}
                    required
                  />
                  {errors[`test_case_${index}_output`] && (
                    <p className="mt-1 text-sm text-red-400">{errors[`test_case_${index}_output`]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Points"
                  type="number"
                  value={testCase.points}
                  onChange={(e) => handleTestCaseChange(index, 'points', parseInt(e.target.value) || 1)}
                  min={1}
                  max={100}
                  disabled={isLoading}
                  error={errors[`test_case_${index}_points`]}
                />

                <Input
                  label="Time Limit (ms)"
                  type="number"
                  value={testCase.time_limit}
                  onChange={(e) => handleTestCaseChange(index, 'time_limit', parseInt(e.target.value) || formData.time_limit)}
                  min={100}
                  max={30000}
                  disabled={isLoading}
                />

                <Input
                  label="Memory Limit (MB)"
                  type="number"
                  value={testCase.memory_limit}
                  onChange={(e) => handleTestCaseChange(index, 'memory_limit', parseInt(e.target.value) || formData.memory_limit)}
                  min={16}
                  max={512}
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3 justify-end pt-6 border-t border-gray-600">
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
          disabled={isLoading}
        >
          {initialData ? 'Update Assignment' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  )
}

export default EnhancedAssignmentForm