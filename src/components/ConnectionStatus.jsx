import React from 'react'
import { useSupabaseConnection } from '../hooks/useSupabaseConnection'

const ConnectionStatus = () => {
  const { isConnected, isLoading, error } = useSupabaseConnection()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span>Checking connection...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span>Database connection error</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isConnected ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-600">Database connected</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-red-600">Database disconnected</span>
        </>
      )}
    </div>
  )
}

export default ConnectionStatus