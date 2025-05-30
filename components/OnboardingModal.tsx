import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, MessageCircle, Calendar, Heart, ArrowRight, ArrowLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to "i miss my friends"',
    description: 'A mindful way to nurture your relationships and stay connected with the people who matter most.',
    icon: Heart,
    highlight: null,
  },
  {
    id: 'map',
    title: 'Relationship Map',
    description: 'Visualize your connections in an interactive map. People closer to the center are those you interact with most frequently.',
    icon: Users,
    highlight: 'map-tab',
  },
  {
    id: 'timeline',
    title: 'Interaction Timeline',
    description: 'Track all your conversations, calls, and interactions in one place. See patterns and stay on top of your relationships.',
    icon: MessageCircle,
    highlight: 'timeline-tab',
  },
  {
    id: 'journal',
    title: 'Reflection Journal',
    description: 'Record meaningful moments, gratitude, and insights from your interactions. Build deeper connections through mindful reflection.',
    icon: Calendar,
    highlight: 'journal-tab',
  },
  {
    id: 'start',
    title: 'Ready to Begin?',
    description: 'Start by adding your first connection using the "Add Connection" button. You can import from your contacts or add manually.',
    icon: Users,
    highlight: 'add-connection-btn',
  },
]

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  // Highlight elements when step changes
  useEffect(() => {
    if (!isOpen) return

    const step = onboardingSteps[currentStep]
    if (step.highlight) {
      const element = document.querySelector(`[data-highlight="${step.highlight}"]`)
      if (element) {
        element.classList.add('highlight-pulse')
        return () => element.classList.remove('highlight-pulse')
      }
    }
  }, [currentStep, isOpen])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
    onClose()
  }

  const currentStepData = onboardingSteps[currentStep]
  const Icon = currentStepData.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Onboarding</DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-coral-600 rounded-3xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-neutral-800">
              {currentStepData.title}
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-coral-500'
                    : index < currentStep
                    ? 'bg-coral-300'
                    : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-neutral-500 hover:text-neutral-700"
            >
              Skip
            </Button>

            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                size="sm"
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  'Get Started'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 