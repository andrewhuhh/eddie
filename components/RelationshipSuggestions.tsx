'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Check, X, AlertCircle, Users, ArrowRight, Sparkles } from 'lucide-react'
import { useRelationshipAnalytics } from '@/hooks/useRelationshipAnalytics'
import { useRelationshipData } from '@/contexts/RelationshipDataContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RelationshipSuggestionsProps {
  onSuggestionApplied?: () => void
}

export default function RelationshipSuggestions({ onSuggestionApplied }: RelationshipSuggestionsProps) {
  const { suggestions, promotions, demotions, insights } = useRelationshipAnalytics()
  const { updatePerson } = useRelationshipData()
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const handleAcceptSuggestion = async (suggestion: any) => {
    setProcessingIds(prev => new Set(prev).add(suggestion.personId))
    
    try {
      await updatePerson(suggestion.personId, {
        closeness: suggestion.suggestedCloseness
      })
      
      setDismissedIds(prev => new Set(prev).add(suggestion.personId))
      onSuggestionApplied?.()
    } catch (error) {
      console.error('Error updating person closeness:', error)
      alert('Failed to update relationship. Please try again.')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(suggestion.personId)
        return newSet
      })
    }
  }

  const handleDismissSuggestion = (suggestionId: string) => {
    setDismissedIds(prev => new Set(prev).add(suggestionId))
  }

  const getClosenessLabel = (closeness: number) => {
    switch (closeness) {
      case 5: return 'Inner Circle'
      case 4: return 'Close Friends'
      case 3: return 'Regular Contact'
      case 2: return 'Distant'
      case 1: return 'Very Distant'
      default: return 'Unknown'
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-amber-600 bg-amber-50'
      case 'low': return 'text-neutral-600 bg-neutral-50'
      default: return 'text-neutral-600 bg-neutral-50'
    }
  }

  const visibleSuggestions = suggestions.filter(s => !dismissedIds.has(s.personId))

  if (visibleSuggestions.length === 0 && insights.mostActiveRelationships.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Relationship Movement Suggestions */}
      {visibleSuggestions.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-amber-800">Smart Relationship Insights</CardTitle>
                <p className="text-sm text-amber-700 mt-1">
                  Based on your interaction patterns, here are some suggestions for updating your relationship circles
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <AnimatePresence>
              {visibleSuggestions.slice(0, 3).map((suggestion) => (
                <motion.div
                  key={suggestion.personId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl p-3 sm:p-4 border border-amber-100 shadow-sm"
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${
                          suggestion.actionType === 'promote' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {suggestion.actionType === 'promote' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <h3 className="font-semibold text-neutral-800 text-sm sm:text-base">
                          {suggestion.personName}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                          {suggestion.confidence} confidence
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2 text-sm">
                        <span className="text-neutral-600">
                          {getClosenessLabel(suggestion.currentCloseness)}
                        </span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" />
                        <span className="font-medium text-neutral-800">
                          {getClosenessLabel(suggestion.suggestedCloseness)}
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-neutral-600 mb-3">
                        {suggestion.reason}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-neutral-500">
                        <span>{suggestion.interactionCount} total interactions</span>
                        <span>
                          {suggestion.daysSinceLastContact === 0 
                            ? 'Contacted today' 
                            : `${suggestion.daysSinceLastContact} days ago`
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismissSuggestion(suggestion.personId)}
                        disabled={processingIds.has(suggestion.personId)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        disabled={processingIds.has(suggestion.personId)}
                        className="h-8 px-3 bg-amber-600 hover:bg-amber-700"
                      >
                        {processingIds.has(suggestion.personId) ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {visibleSuggestions.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-sm text-amber-700">
                  +{visibleSuggestions.length - 3} more suggestions available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Relationship Insights */}
      {insights.mostActiveRelationships.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Most Active */}
          {insights.mostActiveRelationships.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Most Active (30 days)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.mostActiveRelationships.slice(0, 3).map((person) => (
                  <div key={person.personId} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-800 truncate">
                      {person.personName}
                    </span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {person.interactionCount} interactions
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Neglected Relationships */}
          {insights.neglectedRelationships.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Needs Attention</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.neglectedRelationships.slice(0, 3).map((person) => (
                  <div key={person.personId} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-800 truncate">
                      {person.personName}
                    </span>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      {person.daysSinceLastContact} days
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Rising Connections */}
          {insights.risingConnections.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Rising Connections</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.risingConnections.slice(0, 3).map((person) => (
                  <div key={person.personId} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-800 truncate">
                      {person.personName}
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      +{person.trend} this month
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
} 