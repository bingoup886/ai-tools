import { useState, useEffect } from 'react'

const VOTES_STORAGE_KEY = 'userVotes'

export const useVote = () => {
  const [votes, setVotes] = useState({})

  useEffect(() => {
    const savedVotes = localStorage.getItem(VOTES_STORAGE_KEY)
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes))
    }
  }, [])

  const getUserVote = (toolId) => {
    return votes[toolId]
  }

  const setUserVote = (toolId, type) => {
    const newVotes = { ...votes, [toolId]: type }
    setVotes(newVotes)
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(newVotes))
  }

  const removeUserVote = (toolId) => {
    const newVotes = { ...votes }
    delete newVotes[toolId]
    setVotes(newVotes)
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(newVotes))
  }

  return {
    getUserVote,
    setUserVote,
    removeUserVote
  }
}

