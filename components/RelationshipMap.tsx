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

  // Create the D3 visualization with pan functionality
  useEffect(() => {
    if (!svgRef.current || people.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Responsive dimensions
    const containerWidth = svgRef.current.parentElement?.clientWidth || 600
    const width = Math.min(containerWidth - 32, 600)
    const height = Math.min(width * 0.8, 400)
    const centerX = width / 2
    const centerY = height / 2
    
    svg.attr('width', width).attr('height', height)

    // Create radial gradient for background
    const defs = svg.append('defs')
    const gradient = defs.append('radialGradient')
      .attr('id', 'centerGradient')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', Math.min(width, height) * 0.6)
      .attr('gradientUnits', 'userSpaceOnUse')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#fef7f0')
      .attr('stop-opacity', 0.8)

    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#fef2e7')
      .attr('stop-opacity', 0.4)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f9fafb')
      .attr('stop-opacity', 0.1)

    // Create main group for all elements
    const g = svg.append('g')

    // Add gradient background to the main group (so it moves with pan/zoom)
    // Center it around the "You" node position
    g.append('rect')
      .attr('x', centerX - width * 1.5)
      .attr('y', centerY - height * 1.5)
      .attr('width', width * 3)
      .attr('height', height * 3)
      .attr('fill', 'url(#centerGradient)')

    // Create zoom behavior with boundaries - properly centered around the "You" node
    const zoom = d3.zoom()
      .scaleExtent([0.4, 3])
      // Center the translate extent around the "You" node position
      .translateExtent([
        [centerX - width * 0.75, centerY - height * 0.75], 
        [centerX + width * 0.75, centerY + height * 0.75]
      ])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    // Apply zoom to SVG
    svg.call(zoom as any)

    // Reset to center the "You" node in the viewport
    const initialTransform = d3.zoomIdentity
      .translate(0, 0) // Start with no translation since our content is already centered
      .scale(1)
    svg.call(zoom.transform as any, initialTransform)

    // Create groups for better organization
    const connectionGroup = g.append('g').attr('class', 'connections')
    const nodeGroup = g.append('g').attr('class', 'nodes')

    // Position connections in concentric circles - closer relationships appear closer to "You"
    const baseRadius = Math.min(width, height) * 0.12
    const maxRadius = Math.min(width, height) * 0.35
    const positionedConnections = people.map((connection, index) => {
      // Invert closeness: 5 (Very Close) = closest, 1 (Distant) = furthest
      const invertedCloseness = 6 - connection.closeness
      const radius = baseRadius + (invertedCloseness - 1) * ((maxRadius - baseRadius) / 4)
      
      // Add some randomness to angle to prevent perfect overlap
      const baseAngle = (index / people.length) * 2 * Math.PI
      const angleVariation = (Math.random() - 0.5) * 0.3 // ±0.15 radians variation
      const angle = baseAngle + angleVariation
      
      // Add subtle ambient movement offset
      const ambientOffset = 3 // 3px radius for ambient movement
      const ambientAngle = Date.now() * 0.0005 + index * 0.5 // Slow rotation unique per node
      const ambientX = Math.cos(ambientAngle) * ambientOffset
      const ambientY = Math.sin(ambientAngle) * ambientOffset
      
      return {
        ...connection,
        x: centerX + Math.cos(angle) * radius + ambientX,
        y: centerY + Math.sin(angle) * radius + ambientY,
        baseX: centerX + Math.cos(angle) * radius,
        baseY: centerY + Math.sin(angle) * radius,
        angle: angle,
        radius: radius
      }
    })

    // Draw connections to center
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
        switch (d.health) {
          case 'healthy': return '#10b981'
          case 'attention': return '#f59e0b'
          case 'inactive': return '#6b7280'
          default: return '#6b7280'
        }
      })
      .attr('stroke-width', width < 400 ? 1.5 : 2)
      .attr('stroke-opacity', 0.3)

    // Draw center node (user)
    const centerRadius = width < 400 ? 20 : 25
    nodeGroup
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', centerRadius)
      .attr('fill', '#f97316')
      .attr('stroke', '#fff')
      .attr('stroke-width', width < 400 ? 2 : 3)

    nodeGroup
      .append('text')
      .attr('x', centerX)
      .attr('y', centerY + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', width < 400 ? '10px' : '12px')
      .attr('font-weight', 'bold')
      .text('You')

    // Draw connection nodes - responsive size
    const nodeRadius = width < 400 ? 18 : 22
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
      .attr('stroke-width', width < 400 ? 2 : 3)

    // Add avatar images or fallback
    nodes.each(function(this: SVGGElement, d: any) {
      const node = d3.select(this)
      
      if (d.avatar_url) {
        // Create circular clipping path for avatar
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
        
        // Add avatar image
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
        // Fallback to initials
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
      .attr('dy', nodeRadius + (width < 400 ? 12 : 15))
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
      .attr('dy', -(nodeRadius + (width < 400 ? 8 : 10)))
      .attr('fill', '#6b7280')
      .attr('font-size', width < 400 ? '8px' : '10px')
      .text(d => d.preferred_platform.charAt(0).toUpperCase())

    // Add resize listener
    const handleResize = () => {
      setTimeout(() => {
        if (svgRef.current) {
          // setRefreshTrigger(prev => prev + 1)
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
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('transform', (d: any) => {
          const ambientOffset = 3
          const ambientAngle = Date.now() * 0.0005 + d.id.charCodeAt(0) * 0.5
          const ambientX = Math.cos(ambientAngle) * ambientOffset
          const ambientY = Math.sin(ambientAngle) * ambientOffset
          return `translate(${d.baseX + ambientX}, ${d.baseY + ambientY})`
        })
    }, 2000)

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
          style={{ minHeight: '250px' }}
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