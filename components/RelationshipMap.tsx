'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Plus, Users, X, Edit } from 'lucide-react'
import { useRelationshipData } from '@/contexts/RelationshipDataContext'
import EditConnectionModal from '@/components/EditConnectionModal'

interface RelationshipMapProps {
  onAddConnection?: () => void
}

export default function RelationshipMap({ onAddConnection }: RelationshipMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedConnection, setSelectedConnection] = useState<any>(null)
  const [editingConnection, setEditingConnection] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const { people, loading, refreshData } = useRelationshipData()

  // Create the D3 visualization with enhanced zones and grouping
  useEffect(() => {
    if (!svgRef.current || people.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Responsive dimensions - larger to accommodate zones
    const containerWidth = svgRef.current.parentElement?.clientWidth || 700
    const width = Math.min(containerWidth - 32, 700)
    const height = Math.min(width * 0.85, 500)
    const centerX = width / 2
    const centerY = height / 2
    
    svg.attr('width', width).attr('height', height)

    // Define zone radii - 3x spacing for expansive relationship landscape
    const zones = {
      inner: Math.min(width, height) * 0.45,    // Very close relationships
      middle: Math.min(width, height) * 0.75,   // Close relationships  
      outer: Math.min(width, height) * 1.05,    // Regular relationships
      distant: Math.min(width, height) * 1.26   // Distant relationships
    }

    // Create radial gradient for background
    const defs = svg.append('defs')
    const gradient = defs.append('radialGradient')
      .attr('id', 'centerGradient')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', zones.distant * 1.2)
      .attr('gradientUnits', 'userSpaceOnUse')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#fef7f0')
      .attr('stop-opacity', 0.9)

    gradient.append('stop')
      .attr('offset', '30%')
      .attr('stop-color', '#fef2e7')
      .attr('stop-opacity', 0.6)

    gradient.append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#f9fafb')
      .attr('stop-opacity', 0.3)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f3f4f6')
      .attr('stop-opacity', 0.1)

    // Create main group for all elements
    const g = svg.append('g')

    // Add gradient background - larger to cover 3x spaced zones
    g.append('rect')
      .attr('x', centerX - width * 2.5)
      .attr('y', centerY - height * 2.5)
      .attr('width', width * 5)
      .attr('height', height * 5)
      .attr('fill', 'url(#centerGradient)')

    // Create zoom behavior with much larger boundaries for 3x spaced zones
    const zoom = d3.zoom()
      .scaleExtent([0.2, 3])
      .translateExtent([
        [centerX - width * 2, centerY - height * 2], 
        [centerX + width * 2, centerY + height * 2]
      ])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom as any)

    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1)
    svg.call(zoom.transform as any, initialTransform)

    // Create groups for better organization
    const ringGroup = g.append('g').attr('class', 'rings')
    const connectionGroup = g.append('g').attr('class', 'connections')
    const nodeGroup = g.append('g').attr('class', 'nodes')
    const labelGroup = g.append('g').attr('class', 'zone-labels')

    // Draw zone rings with labels
    const zoneData = [
      { radius: zones.inner, label: 'Inner Circle', color: '#f97316', opacity: 0.15 },
      { radius: zones.middle, label: 'Close Friends', color: '#f59e0b', opacity: 0.12 },
      { radius: zones.outer, label: 'Regular Contact', color: '#10b981', opacity: 0.1 },
      { radius: zones.distant, label: 'Distant', color: '#6b7280', opacity: 0.08 }
    ]

    // Draw zone rings
    ringGroup
      .selectAll('.zone-ring')
      .data(zoneData)
      .enter()
      .append('circle')
      .attr('class', 'zone-ring')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', d => d.radius)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.3)
      .attr('stroke-dasharray', '5,5')

    // Add zone fill areas
    ringGroup
      .selectAll('.zone-fill')
      .data(zoneData)
      .enter()
      .append('circle')
      .attr('class', 'zone-fill')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('fill-opacity', d => d.opacity)

    // Add zone labels
    labelGroup
      .selectAll('.zone-label')
      .data(zoneData)
      .enter()
      .append('text')
      .attr('class', 'zone-label')
      .attr('x', centerX)
      .attr('y', d => centerY - d.radius - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.color)
      .attr('font-size', width < 400 ? '9px' : '11px')
      .attr('font-weight', '500')
      .attr('opacity', 0.7)
      .text(d => d.label)

    // Group people by relationship type for better positioning
    const groupedPeople = people.reduce((groups: any, person: any) => {
      const category = person.relationship.toLowerCase()
      if (category.includes('family') || category.includes('parent') || category.includes('sibling')) {
        groups.family = groups.family || []
        groups.family.push(person)
      } else if (category.includes('work') || category.includes('colleague') || category.includes('boss')) {
        groups.work = groups.work || []
        groups.work.push(person)
      } else if (category.includes('friend')) {
        groups.friends = groups.friends || []
        groups.friends.push(person)
      } else {
        groups.other = groups.other || []
        groups.other.push(person)
      }
      return groups
    }, {})

    // Position connections with grouping and proper zone spacing
    const positionedConnections: any[] = []
    let groupIndex = 0
    const groupColors = ['#f97316', '#10b981', '#8b5cf6', '#f59e0b']

    Object.entries(groupedPeople).forEach(([groupName, groupPeople]: [string, any]) => {
      const groupAngleStart = (groupIndex / Object.keys(groupedPeople).length) * 2 * Math.PI
             const groupAngleSpan = (2 * Math.PI) / Object.keys(groupedPeople).length * 0.9 // More spread with 3x spacing
      
      groupPeople.forEach((person: any, personIndex: number) => {
        // Map closeness to zones more distinctly
        let radius: number
        switch (person.closeness) {
          case 5: // Very close
            radius = zones.inner + Math.random() * (zones.middle - zones.inner) * 0.3
            break
          case 4: // Close
            radius = zones.inner + (zones.middle - zones.inner) * 0.7 + Math.random() * (zones.middle - zones.inner) * 0.3
            break
          case 3: // Moderate
            radius = zones.middle + (zones.outer - zones.middle) * 0.3 + Math.random() * (zones.outer - zones.middle) * 0.4
            break
          case 2: // Distant
            radius = zones.outer + Math.random() * (zones.distant - zones.outer) * 0.5
            break
          case 1: // Very distant
            radius = zones.outer + (zones.distant - zones.outer) * 0.5 + Math.random() * (zones.distant - zones.outer) * 0.5
            break
          default:
            radius = zones.middle
        }

        // Position within group angle span
        const angleWithinGroup = (personIndex / groupPeople.length) * groupAngleSpan
        const angle = groupAngleStart + angleWithinGroup + (Math.random() - 0.5) * 0.2

        // Add subtle ambient movement
        const ambientOffset = 2
        const ambientAngle = Date.now() * 0.0003 + person.id.charCodeAt(0) * 0.3
        const ambientX = Math.cos(ambientAngle) * ambientOffset
        const ambientY = Math.sin(ambientAngle) * ambientOffset

        positionedConnections.push({
          ...person,
          x: centerX + Math.cos(angle) * radius + ambientX,
          y: centerY + Math.sin(angle) * radius + ambientY,
          baseX: centerX + Math.cos(angle) * radius,
          baseY: centerY + Math.sin(angle) * radius,
          angle: angle,
          radius: radius,
          groupName: groupName,
          groupColor: groupColors[groupIndex % groupColors.length]
        })
      })
      groupIndex++
    })

    // Draw connections to center with group-based styling
    connectionGroup
      .selectAll('line')
      .data(positionedConnections)
      .enter()
      .append('line')
      .attr('x1', centerX)
      .attr('y1', centerY)
      .attr('x2', d => d.x)
      .attr('y2', d => d.y)
      .attr('stroke', d => {
        // Use health status for primary color, but with group influence
        switch (d.health) {
          case 'healthy': return '#10b981'
          case 'attention': return '#f59e0b'
          case 'inactive': return '#6b7280'
          default: return d.groupColor
        }
      })
      .attr('stroke-width', d => {
        // Thicker lines for closer relationships
        const baseWidth = width < 400 ? 1 : 1.5
        return baseWidth + (d.closeness - 1) * 0.3
      })
      .attr('stroke-opacity', d => 0.2 + (d.closeness / 5) * 0.3)

    // Draw center node (user) - larger and more prominent
    const centerRadius = width < 400 ? 25 : 32
    nodeGroup
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', centerRadius)
      .attr('fill', '#f97316')
      .attr('stroke', '#fff')
      .attr('stroke-width', width < 400 ? 3 : 4)
      .attr('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))')

    nodeGroup
      .append('text')
      .attr('x', centerX)
      .attr('y', centerY + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', width < 400 ? '12px' : '14px')
      .attr('font-weight', 'bold')
      .text('You')

    // Draw connection nodes with enhanced styling
    const nodeRadius = width < 400 ? 16 : 20
    const nodes = nodeGroup
      .selectAll('.connection-node')
      .data(positionedConnections)
      .enter()
      .append('g')
      .attr('class', 'connection-node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedConnection(d))
      .on('dblclick', (event, d) => {
        event.stopPropagation()
        setEditingConnection(d)
        setShowEditModal(true)
      })

    // Add subtle group indicator ring
    nodes
      .append('circle')
      .attr('r', nodeRadius + 3)
      .attr('fill', 'none')
      .attr('stroke', d => d.groupColor)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)

    // Add avatar background circle
    nodes
      .append('circle')
      .attr('r', nodeRadius)
      .attr('fill', '#fff')
      .attr('stroke', d => {
        switch (d.health) {
          case 'healthy': return '#10b981'
          case 'attention': return '#f59e0b'
          case 'inactive': return '#6b7280'
          default: return '#6b7280'
        }
      })
      .attr('stroke-width', d => {
        // Thicker borders for closer relationships
        const baseWidth = width < 400 ? 2 : 2.5
        return baseWidth + (d.closeness - 1) * 0.2
      })
      .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')

    // Add avatar images or fallback
    nodes.each(function(this: SVGGElement, d: any) {
      const node = d3.select(this)
      
      if (d.avatar_url) {
        const clipId = `clip-${d.id}`
        const defs = svg.select('defs')
        if (defs.empty()) {
          svg.append('defs')
        }
        
        svg.select('defs')
          .append('clipPath')
          .attr('id', clipId)
          .append('circle')
          .attr('r', nodeRadius - 2)
        
        node
          .append('image')
          .attr('href', d.avatar_url)
          .attr('x', -(nodeRadius - 2))
          .attr('y', -(nodeRadius - 2))
          .attr('width', (nodeRadius - 2) * 2)
          .attr('height', (nodeRadius - 2) * 2)
          .attr('clip-path', `url(#${clipId})`)
          .attr('preserveAspectRatio', 'xMidYMid slice')
      } else {
        node
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', 4)
          .attr('fill', d => {
            switch ((d as any).health) {
              case 'healthy': return '#10b981'
              case 'attention': return '#f59e0b'
              case 'inactive': return '#6b7280'
              default: return '#6b7280'
            }
          })
          .attr('font-size', width < 400 ? '10px' : '12px')
          .attr('font-weight', 'bold')
          .text(d.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2))
      }
    })

    // Add name labels below nodes
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', nodeRadius + (width < 400 ? 14 : 18))
      .attr('fill', '#374151')
      .attr('font-size', width < 400 ? '9px' : '11px')
      .attr('font-weight', '500')
      .text(d => {
        const firstName = d.name.split(' ')[0]
        return width < 400 && firstName.length > 8 ? firstName.substring(0, 8) + '...' : firstName
      })

    // Add platform icons
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -(nodeRadius + (width < 400 ? 10 : 12)))
      .attr('fill', '#6b7280')
      .attr('font-size', width < 400 ? '8px' : '10px')
      .text(d => d.preferred_platform.charAt(0).toUpperCase())

    // Add resize listener
    const handleResize = () => {
      setTimeout(() => {
        if (svgRef.current) {
          // Trigger re-render on resize
        }
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    
    // Set up ambient movement animation
    const animationInterval = setInterval(() => {
      if (!svgRef.current) return
      
      const svg = d3.select(svgRef.current)
      const nodes = svg.selectAll('.connection-node')
      
      nodes.transition()
        .duration(3000)
        .ease(d3.easeLinear)
        .attr('transform', (d: any) => {
          const ambientOffset = 2
          const ambientAngle = Date.now() * 0.0003 + d.id.charCodeAt(0) * 0.3
          const ambientX = Math.cos(ambientAngle) * ambientOffset
          const ambientY = Math.sin(ambientAngle) * ambientOffset
          return `translate(${d.baseX + ambientX}, ${d.baseY + ambientY})`
        })
    }, 3000)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearInterval(animationInterval)
    }

  }, [people])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-4 sm:p-8">
        <div className="flex items-center justify-center h-64 sm:h-96">
          <div className="text-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-neutral-600">Loading your connections...</p>
          </div>
        </div>
      </div>
    )
  }

  if (people.length === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-4 sm:p-8">
        <div className="flex items-center justify-center h-64 sm:h-96">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-coral-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-2">No connections yet</h3>
            <p className="text-sm sm:text-base text-neutral-600 mb-4 px-4">Start building your relationship map by adding your first connection.</p>
            <button 
              onClick={onAddConnection}
              className="btn-primary flex items-center space-x-2 mx-auto text-sm sm:text-base px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Connection</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Relationship Map</h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Visualize your connections • {people.length} {people.length === 1 ? 'person' : 'people'}
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs overflow-x-auto">
          <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            <span className="text-neutral-600 whitespace-nowrap">Healthy</span>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-500 rounded-full"></div>
            <span className="text-neutral-600 whitespace-nowrap">Needs attention</span>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-neutral-400 rounded-full"></div>
            <span className="text-neutral-600 whitespace-nowrap">Inactive</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <svg 
          ref={svgRef} 
          className="w-full h-auto border border-neutral-100 rounded-xl sm:rounded-2xl bg-neutral-50 cursor-pointer"
          style={{ minHeight: '350px' }}
        ></svg>
        
        {/* Connection Details Toast */}
        <AnimatePresence>
          {selectedConnection && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 z-10"
            >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedConnection.health === 'healthy' ? 'bg-green-100 text-green-600' :
                  selectedConnection.health === 'attention' ? 'bg-amber-100 text-amber-600' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-800 text-sm sm:text-base truncate">{selectedConnection.name}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 truncate">{selectedConnection.relationship}</p>
                  {selectedConnection.groupName && (
                    <p className="text-xs text-neutral-500 capitalize">{selectedConnection.groupName} group</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditingConnection(selectedConnection)
                    setShowEditModal(true)
                    setSelectedConnection(null)
                  }}
                  className="text-neutral-400 hover:text-neutral-600 p-1 flex-shrink-0 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedConnection(null)}
                  className="text-neutral-400 hover:text-neutral-600 p-1 flex-shrink-0 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-neutral-500">Last contact:</span>
                <p className="font-medium text-neutral-800">
                  {selectedConnection.lastContact 
                    ? selectedConnection.lastContact.toLocaleDateString()
                    : 'No interactions yet'
                  }
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Preferred platform:</span>
                <p className="font-medium text-neutral-800 capitalize">
                  {selectedConnection.preferred_platform}
                </p>
              </div>
            </div>
           </motion.div>
         )}
        </AnimatePresence>
      </div>

      {/* Edit Connection Modal */}
      <EditConnectionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingConnection(null)
        }}
        onSuccess={() => {
          refreshData()
          setShowEditModal(false)
          setEditingConnection(null)
        }}
        connection={editingConnection}
      />
    </div>
  )
} 