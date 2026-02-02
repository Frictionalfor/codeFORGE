import React, { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { classService, ClassInfo } from '../../services/classService'

interface JoinClassFormProps {
  onSuccess: (_classInfo: ClassInfo) => void
  onCancel?: () => void
  onStepChange?: (_step: 'enter-code' | 'confirm-join') => void
}

const JoinClassForm: React.FC<JoinClassFormProps> = ({ onSuccess, onCancel, onStepChange }) => {
  const [joinCode, setJoinCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [step, setStep] = useState<'enter-code' | 'confirm-join'>('enter-code')

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!joinCode.trim()) {
      setError('Please enter a join code')
      return
    }

    if (joinCode.length !== 8) {
      setError('Join code must be exactly 8 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const info = await classService.getClassByJoinCode(joinCode.toUpperCase())
      setClassInfo(info)
      setStep('confirm-join')
      onStepChange?.('confirm-join')
    } catch (error: any) {
      if (error.response?.data?.error?.code === 'CLASS_NOT_FOUND') {
        setError('Invalid join code. Please check the code and try again.')
      } else {
        setError('An error occurred while looking up the class. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinClass = async () => {
    if (!classInfo) return

    setIsLoading(true)
    setError('')

    try {
      await classService.joinClass({ join_code: joinCode.toUpperCase() })
      onSuccess(classInfo)
    } catch (error: any) {
      const errorCode = error.response?.data?.error?.code
      
      switch (errorCode) {
        case 'ALREADY_ENROLLED':
          setError('You are already enrolled in this class.')
          break
        case 'CLASS_FULL':
          setError('This class has reached its maximum capacity.')
          break
        case 'INVALID_JOIN_CODE':
          setError('The join code is incorrect.')
          break
        case 'CLASS_INACTIVE':
          setError('This class is no longer active.')
          break
        default:
          setError('An error occurred while joining the class. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep('enter-code')
    setClassInfo(null)
    setError('')
    onStepChange?.('enter-code')
  }

  const formatJoinCode = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    return cleaned.slice(0, 8) // Limit to 8 characters
  }

  const handleJoinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatJoinCode(e.target.value)
    setJoinCode(formatted)
    if (error) setError('')
  }

  if (step === 'confirm-join' && classInfo) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white">{classInfo.name}</h3>
          <p className="text-gray-400 mt-1">by {classInfo.teacher_name}</p>
        </div>
        
        <div className="bg-dark-700 p-4 rounded-lg">
          <p className="text-gray-300 text-sm leading-relaxed">
            {classInfo.description}
          </p>
        </div>
        
        <div className="flex justify-between text-sm text-gray-400">
          <span>Current Students:</span>
          <span>
            {classInfo.current_students}
            {classInfo.max_students && ` / ${classInfo.max_students}`}
          </span>
        </div>
        
        {classInfo.already_enrolled && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              You are already enrolled in this class.
            </p>
          </div>
        )}
        
        {classInfo.at_capacity && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">
              This class has reached its maximum capacity.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleJoinClass}
            disabled={isLoading || !classInfo.can_join}
            loading={isLoading}
            className="flex-1"
          >
            {classInfo.already_enrolled ? 'Already Enrolled' : 'Join Class'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCodeSubmit} className="space-y-6">
        <div>
          <Input
            label="Class Join Code"
            type="text"
            value={joinCode}
            onChange={handleJoinCodeChange}
            placeholder="Enter 8-character code"
            error={error}
            disabled={isLoading}
            className="text-center text-lg tracking-widest font-mono"
            maxLength={8}
          />
          <p className="text-sm text-gray-400 mt-2 text-center">
            Ask your teacher for the class join code
          </p>
        </div>

        <div className="flex space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || joinCode.length !== 8}
            loading={isLoading}
            className={onCancel ? "flex-1" : "w-full"}
          >
            Look Up Class
          </Button>
        </div>
      </form>
      
      <div className="pt-6 border-t border-gray-600">
        <p className="text-sm text-gray-400 text-center">
          Need help? Contact your teacher for the correct join code.
        </p>
      </div>
    </div>
  )
}

export default JoinClassForm