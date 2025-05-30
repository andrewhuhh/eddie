'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion } from 'framer-motion'
import { User, MessageCircle, Phone, Mail } from 'lucide-react'

interface Connection {
  id: string
  name: string
  relationship: string
  lastContact: Date
  health: 'healthy' | 'attention' | 'inactive'
  closeness: number // 1-5, determines distance from center
  platform: 'whatsapp' | 'instagram' | 'facebook'
}

// Mock data for demo
const mockConnections: Connection[] = [
  { id: '1', name: 'Sarah', relationship: 'Best Friend', lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), health: 'healthy', closeness: 1, platform: 'whatsapp' },
  { id: '2', name: 'Mike', relationship: 'Brother', lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), health: 'attention', closeness: 1, platform: 'whatsapp' },
  { id: '3', name: 'Emma', relationship: 'Colleague', lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), health: 'attention', closeness: 3, platform: 'instagram' },
  { id: '4', name: 'David', relationship: 'Friend', lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), health: 'inactive', closeness: 2, platform: 'facebook' },
  { id: '5', name: 'Lisa', relationship: 'Cousin', lastContact: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), health: 'inactive', closeness: 4, platform: 'whatsapp' },
  { id: '6', name: 'Alex', relationship: 'Friend', lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), health: 'healthy', closeness: 2, platform: 'instagram' },
]

export default function RelationshipMap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 500
    const centerX = width / 2
    const centerY = height / 2

    svg.attr('width', width).attr('height', height)

    // Create groups for better organization
    const connectionGroup = svg.append('g').attr('class', 'connections')
    const nodeGroup = svg.append('g').attr('class', 'nodes')

    // Position connections in concentric circles
    const positionedConnections = mockConnections.map((connection, index) => {
      const angle = (index / mockConnections.length) * 2 * Math.PI
      const radius = 50 + (connection.closeness * 30) // Closer relationships are nearer to center
      
      return {
        ...connection,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      }
    })

    // Draw connections (lines from center to each person)
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
          case 'healthy': return '#6d946d'
          case 'attention': return '#e67e5f'
          case 'inactive': return '#a8a29e'
          default: return '#a8a29e'
        }
      })
      .attr('stroke-width', 2)
      .attr('opacity', 0.3)

    // Central node (user)
    nodeGroup
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 25)
      .attr('fill', 'url(#centerGradient)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)

    // Add gradient definition
    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'centerGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('style', 'stop-color:#f09d8e;stop-opacity:1')

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('style', 'stop-color:#e67e5f;stop-opacity:1')

    // Connection nodes
    const nodes = nodeGroup
      .selectAll('.connection-node')
      .data(positionedConnections)
      .enter()
      .append('g')
      .attr('class', 'connection-node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedConnection(d))
      .on('mouseover', function() {
        d3.select(this).select('circle').transition().duration(200).attr('r', 22)
      })
      .on('mouseout', function() {
        d3.select(this).select('circle').transition().duration(200).attr('r', 18)
      })

    // Connection circles
    nodes
      .append('circle')
      .attr('r', 18)
      .attr('fill', d => {
        switch (d.health) {
          case 'healthy': return '#6d946d'
          case 'attention': return '#e67e5f'
          case 'inactive': return '#a8a29e'
          default: return '#a8a29e'
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // Connection initials
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text(d => d.name.charAt(0))

    // Connection labels
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '2.5em')
      .attr('fill', '#57534e')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text(d => d.name)

  }, [])

  const formatLastContact = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 font-serif">Your Network</h2>
          <p className="text-sm text-neutral-500">Visual map of your relationships</p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-healthy"></div>
            <span className="text-neutral-600">Healthy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-attention"></div>
            <span className="text-neutral-600">Needs Attention</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-inactive"></div>
            <span className="text-neutral-600">Inactive</span>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="flex-1">
          <svg ref={svgRef} className="w-full h-auto"></svg>
        </div>

        {selectedConnection && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 pl-6 border-l border-neutral-100"
          >
            <div className="sticky top-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold ${
                  selectedConnection.health === 'healthy' ? 'bg-healthy' :
                  selectedConnection.health === 'attention' ? 'bg-attention' :
                  'bg-inactive'
                }`}>
                  {selectedConnection.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800">{selectedConnection.name}</h3>
                  <p className="text-sm text-neutral-500">{selectedConnection.relationship}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Last Contact</label>
                  <p className="text-neutral-600">{formatLastContact(selectedConnection.lastContact)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700">Platform</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedConnection.platform === 'whatsapp' && <MessageCircle className="w-4 h-4 text-green-600" />}
                    {selectedConnection.platform === 'instagram' && <User className="w-4 h-4 text-pink-600" />}
                    {selectedConnection.platform === 'facebook' && <Mail className="w-4 h-4 text-blue-600" />}
                    <span className="text-sm text-neutral-600 capitalize">{selectedConnection.platform}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button className="w-full btn-primary">
                    Send Message
                  </button>
                  <button className="w-full btn-ghost">
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 