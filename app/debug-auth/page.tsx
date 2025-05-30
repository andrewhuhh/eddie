'use client'

import { useState, useEffect } from 'react'
import { supabase, signInWithGoogle } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugAuthPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  useEffect(() => {
    addLog('Debug page loaded')
    
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        addLog(`Current session: ${data.session ? 'Active' : 'None'}`)
        if (error) addLog(`Session error: ${error.message}`)
        
        setTestResults(prev => ({
          ...prev,
          currentSession: data.session,
          sessionError: error
        }))
      } catch (err) {
        addLog(`Connection test failed: ${err}`)
      }
    }

    testConnection()

    // Listen to all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        addLog(`Auth event: ${event}`)
        addLog(`Session user: ${session?.user?.email || 'None'}`)
        addLog(`Session expires: ${session?.expires_at || 'N/A'}`)
        
        if (session?.user) {
          addLog(`User metadata: ${JSON.stringify(session.user.user_metadata)}`)
          addLog(`App metadata: ${JSON.stringify(session.user.app_metadata)}`)
        }

        setTestResults(prev => ({
          ...prev,
          lastEvent: event,
          lastSession: session,
          timestamp: new Date().toISOString()
        }))
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const testGoogleAuth = async () => {
    addLog('Testing Google OAuth...')
    addLog(`Current origin: ${window.location.origin}`)
    addLog(`Redirect URL will be: ${window.location.origin}/debug-auth`)
    
    try {
      const { data, error } = await signInWithGoogle(`${window.location.origin}/debug-auth`)
      
      addLog(`OAuth response: ${JSON.stringify(data)}`)
      if (error) addLog(`OAuth error: ${error.message}`)
      
      setTestResults(prev => ({
        ...prev,
        oauthTest: { data, error }
      }))
    } catch (err) {
      addLog(`OAuth test failed: ${err}`)
    }
  }

  const testDirectSignIn = async () => {
    addLog('Testing direct sign in...')
    try {
      // This will fail but might give us useful error info
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123'
      })
      
      addLog(`Direct sign in response: ${JSON.stringify(data)}`)
      if (error) addLog(`Direct sign in error: ${error.message}`)
    } catch (err) {
      addLog(`Direct sign in test failed: ${err}`)
    }
  }

  const checkAuthConfig = async () => {
    addLog('Checking auth configuration...')
    try {
      // Try to get user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      addLog(`Get user result: ${userData.user ? 'Success' : 'No user'}`)
      if (userError) addLog(`Get user error: ${userError.message}`)

      // Check if we can access the database
      const { data: dbTest, error: dbError } = await supabase
        .from('people')
        .select('count')
        .limit(1)

      addLog(`Database access: ${dbError ? 'Failed' : 'Success'}`)
      if (dbError) addLog(`Database error: ${dbError.message}`)

      setTestResults(prev => ({
        ...prev,
        authConfig: {
          user: userData.user,
          userError,
          dbAccess: !dbError,
          dbError
        }
      }))
    } catch (err) {
      addLog(`Auth config check failed: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Page</h1>
        
        {user && (
          <div className="bg-green-100 border border-green-400 rounded p-4 mb-6">
            <h2 className="font-semibold text-green-800">Current User</h2>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
            <p>Created: {user.created_at}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <button
              onClick={testGoogleAuth}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Google OAuth
            </button>
            
            <button
              onClick={testDirectSignIn}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Test Direct Sign In
            </button>
            
            <button
              onClick={checkAuthConfig}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Check Auth Config
            </button>

            <button
              onClick={() => {
                setLogs([])
                setTestResults({})
              }}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Logs
            </button>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">Test Results</h3>
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold mb-4">Debug Logs</h3>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-100 border border-yellow-400 rounded p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Try signing in with a different Google account</li>
            <li>Check the logs for any error messages</li>
            <li>Look at the browser network tab for failed requests</li>
            <li>Check if you get redirected back to this page or to login</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 