'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion } from 'framer-motion'
import { User, Plus, Users, X } from 'lucide-react'
import { useRelationshipData } from '@/contexts/RelationshipDataContext'

interface RelationshipMapProps {
  onAddConnection?: () => void
}

export default function RelationshipMap({ onAddConnection }: RelationshipMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedConnection, setSelectedConnection] = useState<any>(null)
  const { people, loading } = useRelationshipData()

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

    // Position connections in concentric circles
    const baseRadius = Math.min(width, height) * 0.15
    const positionedConnections = people.map((connection, index) => {
      const radius = baseRadius + (connection.closeness - 1) * (Math.min(width, height) * 0.1)
      const angle = (index / people.length) * 2 * Math.PI
      return {
        ...connection,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
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

    nodes
      .append('circle')
      .attr('r', nodeRadius)
      .attr('fill', d => {
        switch (d.health) {
          case 'healthy': return '#10b981'
          case 'attention': return '#f59e0b'
          case 'inactive': return '#6b7280'
          default: return '#6b7280'
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', width < 400 ? 1.5 : 2)

    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', 'white')
      .attr('font-size', width < 400 ? '8px' : '10px')
      .attr('font-weight', 'bold')
      .text(d => {
        const firstName = d.name.split(' ')[0]
        return width < 400 && firstName.length > 6 ? firstName.substring(0, 6) : firstName
      })

    // Add platform icons
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', width < 400 ? -20 : -25)
      .attr('fill', '#6b7280')
      .attr('font-size', width < 400 ? '7px' : '8px')
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
    return () => window.removeEventListener('resize', handleResize)

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
      </div>

      {/* Connection Details Panel */}
      {selectedConnection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 sm:mt-6 p-3 sm:p-4 bg-neutral-50 rounded-xl sm:rounded-2xl"
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
            <button
              onClick={() => setSelectedConnection(null)}
              className="text-neutral-400 hover:text-neutral-600 p-1 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
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
                {selectedConnection.platform}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 