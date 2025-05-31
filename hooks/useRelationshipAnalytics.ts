import { useMemo, useEffect } from 'react'
import { useRelationshipData } from '@/contexts/RelationshipDataContext'
import { NotificationService } from '@/lib/notifications'

interface RelationshipSuggestion {
  personId: string
  personName: string
  currentCloseness: number
  suggestedCloseness: number
  reason: string
  confidence: 'high' | 'medium' | 'low'
  actionType: 'promote' | 'demote' | 'maintain'
  interactionCount: number
  daysSinceLastContact: number
  averageInteractionQuality: number
}

interface RelationshipAnalytics {
  suggestions: RelationshipSuggestion[]
  totalSuggestions: number
  promotions: RelationshipSuggestion[]
  demotions: RelationshipSuggestion[]
  insights: {
    mostActiveRelationships: Array<{ personId: string; personName: string; interactionCount: number }>
    neglectedRelationships: Array<{ personId: string; personName: string; daysSinceLastContact: number }>
    risingConnections: Array<{ personId: string; personName: string; trend: number }>
  }
}

export function useRelationshipAnalytics(): RelationshipAnalytics {
  const { people, interactions } = useRelationshipData()

  const analytics = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const suggestions: RelationshipSuggestion[] = []

    people.forEach(person => {
      // Get interactions for this person
      const personInteractions = interactions.filter(i => i.person_id === person.id)
      const recentInteractions = personInteractions.filter(i => i.occurred_at >= thirtyDaysAgo)
      const veryRecentInteractions = personInteractions.filter(i => i.occurred_at >= sevenDaysAgo)
      
      // Calculate metrics
      const totalInteractions = personInteractions.length
      const recentInteractionCount = recentInteractions.length
      const veryRecentCount = veryRecentInteractions.length
      
      const lastInteraction = personInteractions[0] // Already sorted by date desc
      const daysSinceLastContact = lastInteraction 
        ? Math.floor((now.getTime() - lastInteraction.occurred_at.getTime()) / (1000 * 60 * 60 * 24))
        : 999
      
      // Calculate interaction quality (based on type and duration)
      const qualityScore = personInteractions.reduce((sum, interaction) => {
        let score = 1 // Base score
        
        // Higher quality for more personal interactions
        switch (interaction.type) {
          case 'in_person': score = 5; break
          case 'video_call': score = 4; break
          case 'call': score = 3; break
          case 'text': score = 2; break
          case 'email': score = 1.5; break
          case 'social_media': score = 1; break
        }
        
        // Bonus for longer interactions
        if (interaction.duration_minutes) {
          if (interaction.duration_minutes > 60) score *= 1.5
          else if (interaction.duration_minutes > 30) score *= 1.3
          else if (interaction.duration_minutes > 15) score *= 1.1
        }
        
        return sum + score
      }, 0)
      
      const averageInteractionQuality = totalInteractions > 0 ? qualityScore / totalInteractions : 0
      
      // Calculate suggested closeness based on multiple factors
      let suggestedCloseness = person.closeness
      let reason = ''
      let confidence: 'high' | 'medium' | 'low' = 'medium'
      let actionType: 'promote' | 'demote' | 'maintain' = 'maintain'
      
      // Promotion logic
      if (veryRecentCount >= 5 && person.closeness < 5) {
        // Very frequent recent contact
        suggestedCloseness = Math.min(5, person.closeness + 1)
        reason = `${veryRecentCount} interactions in the past week suggests a very close relationship`
        confidence = 'high'
        actionType = 'promote'
      } else if (recentInteractionCount >= 8 && averageInteractionQuality > 2.5 && person.closeness < 4) {
        // High frequency + quality in past month
        suggestedCloseness = Math.min(4, person.closeness + 1)
        reason = `${recentInteractionCount} high-quality interactions this month indicates growing closeness`
        confidence = 'high'
        actionType = 'promote'
      } else if (recentInteractionCount >= 5 && person.closeness < 3) {
        // Moderate frequency suggests closer than current rating
        suggestedCloseness = Math.min(3, person.closeness + 1)
        reason = `${recentInteractionCount} interactions this month suggests closer relationship`
        confidence = 'medium'
        actionType = 'promote'
      }
      
      // Demotion logic
      else if (daysSinceLastContact > 90 && person.closeness > 2) {
        // Long time without contact
        suggestedCloseness = Math.max(1, person.closeness - 1)
        reason = `${daysSinceLastContact} days since last contact suggests relationship has become more distant`
        confidence = 'medium'
        actionType = 'demote'
      } else if (daysSinceLastContact > 60 && recentInteractionCount === 0 && person.closeness > 3) {
        // No recent contact for very close relationships
        suggestedCloseness = Math.max(2, person.closeness - 1)
        reason = `No contact in ${daysSinceLastContact} days for a close relationship suggests it needs attention`
        confidence = 'medium'
        actionType = 'demote'
      } else if (daysSinceLastContact > 180 && person.closeness > 1) {
        // Very long time without contact
        suggestedCloseness = 1
        reason = `${daysSinceLastContact} days without contact suggests this relationship has become distant`
        confidence = 'high'
        actionType = 'demote'
      }
      
      // Only suggest if there's a meaningful change
      if (suggestedCloseness !== person.closeness) {
        suggestions.push({
          personId: person.id,
          personName: person.name,
          currentCloseness: person.closeness,
          suggestedCloseness,
          reason,
          confidence,
          actionType,
          interactionCount: totalInteractions,
          daysSinceLastContact,
          averageInteractionQuality
        })
      }
    })

    // Generate insights
    const mostActiveRelationships = people
      .map(person => ({
        personId: person.id,
        personName: person.name,
        interactionCount: interactions.filter(i => i.person_id === person.id && i.occurred_at >= thirtyDaysAgo).length
      }))
      .filter(p => p.interactionCount > 0)
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, 5)

    const neglectedRelationships = people
      .map(person => {
        const lastInteraction = interactions.find(i => i.person_id === person.id)
        const daysSince = lastInteraction 
          ? Math.floor((now.getTime() - lastInteraction.occurred_at.getTime()) / (1000 * 60 * 60 * 24))
          : 999
        return {
          personId: person.id,
          personName: person.name,
          daysSinceLastContact: daysSince
        }
      })
      .filter(p => p.daysSinceLastContact > 30 && p.daysSinceLastContact < 999)
      .sort((a, b) => b.daysSinceLastContact - a.daysSinceLastContact)
      .slice(0, 5)

    // Calculate rising connections (people with increasing interaction frequency)
    const risingConnections = people
      .map(person => {
        const allInteractions = interactions.filter(i => i.person_id === person.id)
        const recentCount = allInteractions.filter(i => i.occurred_at >= thirtyDaysAgo).length
        const previousCount = allInteractions.filter(i => 
          i.occurred_at >= new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) && 
          i.occurred_at < thirtyDaysAgo
        ).length
        
        const trend = recentCount - previousCount
        return {
          personId: person.id,
          personName: person.name,
          trend
        }
      })
      .filter(p => p.trend > 2)
      .sort((a, b) => b.trend - a.trend)
      .slice(0, 5)

    return {
      suggestions: suggestions.sort((a, b) => {
        // Sort by confidence first, then by action type (promotions first)
        if (a.confidence !== b.confidence) {
          const confidenceOrder = { high: 3, medium: 2, low: 1 }
          return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
        }
        if (a.actionType !== b.actionType) {
          return a.actionType === 'promote' ? -1 : 1
        }
        return 0
      }),
      totalSuggestions: suggestions.length,
      promotions: suggestions.filter(s => s.actionType === 'promote'),
      demotions: suggestions.filter(s => s.actionType === 'demote'),
      insights: {
        mostActiveRelationships,
        neglectedRelationships,
        risingConnections
      }
    }
  }, [people, interactions])

  // Create notifications for high-confidence suggestions
  useEffect(() => {
    if (analytics.suggestions.length === 0) return

    const highConfidenceSuggestions = analytics.suggestions.filter(s => s.confidence === 'high')
    
    if (highConfidenceSuggestions.length > 0) {
      // Create a notification for relationship insights
      NotificationService.createNotification({
        type: 'activity',
        title: 'New Relationship Insights Available',
        description: `${highConfidenceSuggestions.length} high-confidence suggestions for updating your relationship circles`,
        priority: 'medium',
        isActionable: true,
        actionUrl: '/?view=map',
        metadata: {
          suggestion_count: highConfidenceSuggestions.length,
          suggestion_types: highConfidenceSuggestions.map(s => s.actionType)
        }
      }).catch(error => {
        console.error('Error creating relationship suggestion notification:', error)
      })
    }
  }, [analytics.suggestions])

  return analytics
} 