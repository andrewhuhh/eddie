'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Person {
  id: string
  name: string
  relationship: string
  preferred_platform: string
  closeness: number
  health: 'healthy' | 'attention' | 'inactive'
  lastContact: Date | null
  avatar_url?: string | null
  email?: string | null
  phone?: string | null
  notes?: string | null
}

interface Interaction {
  id: string
  person_id: string
  person_name: string
  type: string
  platform: string
  occurred_at: Date
  description: string
  duration_minutes?: number | null
}

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string
  created_at: Date
  person_id?: string | null
  person_name?: string
  tags?: string[] | null
}

interface RelationshipDataContextType {
  people: Person[]
  interactions: Interaction[]
  journalEntries: JournalEntry[]
  loading: boolean
  refreshData: () => Promise<void>
  addPerson: (person: any) => Promise<any>
  addInteraction: (interaction: any) => Promise<any>
  addJournalEntry: (entry: any) => Promise<any>
}

const RelationshipDataContext = createContext<RelationshipDataContextType | undefined>(undefined)

export function RelationshipDataProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchAllData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch people with their latest interactions
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select(`
          id,
          name,
          relationship,
          preferred_platform,
          custom_platform,
          closeness,
          health,
          avatar_url,
          email,
          phone,
          notes,
          interactions (
            occurred_at,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (peopleError) throw peopleError

      // Transform people data
      const transformedPeople: Person[] = (peopleData || []).map(person => {
        const latestInteraction = person.interactions?.[0]
        const lastContactDate = latestInteraction?.occurred_at || latestInteraction?.created_at
        const lastContact = lastContactDate ? new Date(lastContactDate) : null

        // Calculate health based on last contact
        let health: 'healthy' | 'attention' | 'inactive' = 'inactive'
        if (lastContact) {
          const daysSince = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
          if (daysSince <= 7) health = 'healthy'
          else if (daysSince <= 21) health = 'attention'
          else health = 'inactive'
        }

        return {
          id: person.id,
          name: person.name,
          relationship: person.relationship || 'Friend',
          preferred_platform: person.custom_platform || person.preferred_platform || 'whatsapp',
          closeness: person.closeness || 3,
          health,
          lastContact,
          avatar_url: person.avatar_url || undefined,
          email: person.email || undefined,
          phone: person.phone || undefined,
          notes: person.notes || undefined
        }
      })

      // Fetch interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('interactions')
        .select(`
          id,
          person_id,
          type,
          platform,
          custom_platform,
          occurred_at,
          description,
          duration_minutes,
          people (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false })
        .limit(100)

      if (interactionsError) throw interactionsError

      const transformedInteractions: Interaction[] = (interactionsData || []).map(interaction => ({
        id: interaction.id,
        person_id: interaction.person_id || '',
        person_name: interaction.people?.name || 'Unknown',
        type: interaction.type,
        platform: interaction.custom_platform || interaction.platform || 'whatsapp',
        occurred_at: new Date(interaction.occurred_at || new Date()),
        description: interaction.description || '',
        duration_minutes: interaction.duration_minutes || undefined
      }))

      // Fetch journal entries
      const { data: journalData, error: journalError } = await supabase
        .from('journal_entries')
        .select(`
          id,
          title,
          content,
          mood,
          created_at,
          person_id,
          tags,
          people (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (journalError) throw journalError

      const transformedJournalEntries: JournalEntry[] = (journalData || []).map(entry => ({
        id: entry.id,
        title: entry.title || 'Untitled',
        content: entry.content,
        mood: entry.mood || 'neutral',
        created_at: new Date(entry.created_at || new Date()),
        person_id: entry.person_id || undefined,
        person_name: entry.people?.name,
        tags: entry.tags
      }))

      setPeople(transformedPeople)
      setInteractions(transformedInteractions)
      setJournalEntries(transformedJournalEntries)
    } catch (error) {
      console.error('Error fetching relationship data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPerson = async (personData: any) => {
    const { data, error } = await supabase
      .from('people')
      .insert({
        ...personData,
        user_id: user?.id
      })
      .select()
      .single()

    if (error) throw error
    await fetchAllData() // Refresh all data
    return data
  }

  const addInteraction = async (interactionData: any) => {
    const { data, error } = await supabase
      .from('interactions')
      .insert({
        ...interactionData,
        user_id: user?.id
      })
      .select()
      .single()

    if (error) throw error
    await fetchAllData() // Refresh all data
    return data
  }

  const addJournalEntry = async (entryData: any) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        ...entryData,
        user_id: user?.id
      })
      .select()
      .single()

    if (error) throw error
    await fetchAllData() // Refresh all data
    return data
  }

  useEffect(() => {
    if (user) {
      fetchAllData()

      // Set up real-time subscriptions for automatic data syncing
      const peopleSubscription = supabase
        .channel('people_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'people',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh data when people table changes
            fetchAllData()
          }
        )
        .subscribe()

      const interactionsSubscription = supabase
        .channel('interactions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'interactions',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh data when interactions table changes
            fetchAllData()
          }
        )
        .subscribe()

      const journalSubscription = supabase
        .channel('journal_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'journal_entries',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh data when journal entries table changes
            fetchAllData()
          }
        )
        .subscribe()

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(peopleSubscription)
        supabase.removeChannel(interactionsSubscription)
        supabase.removeChannel(journalSubscription)
      }
    }
  }, [user])

  const value = {
    people,
    interactions,
    journalEntries,
    loading,
    refreshData: fetchAllData,
    addPerson,
    addInteraction,
    addJournalEntry
  }

  return (
    <RelationshipDataContext.Provider value={value}>
      {children}
    </RelationshipDataContext.Provider>
  )
}

export function useRelationshipData() {
  const context = useContext(RelationshipDataContext)
  if (context === undefined) {
    throw new Error('useRelationshipData must be used within a RelationshipDataProvider')
  }
  return context
} 