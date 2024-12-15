type Job = {
  id: string
  name: string
}

export type Candidate = {
  id: number
  email: string
  status: 'new' | 'interview' | 'hired' | 'rejected'
  position: number
}

export const getJobs = async (): Promise<Job[]> => {
  const response = await fetch(`http://localhost:4000/api/jobs`)
  const { data } = await response.json()
  return data
}

export const getJob = async (jobId?: string): Promise<Job | null> => {
  if (!jobId) return null
  const response = await fetch(`http://localhost:4000/api/jobs/${jobId}`)
  const { data } = await response.json()
  return data
}

export const getCandidates = async (jobId?: string): Promise<Candidate[]> => {
  if (!jobId) return []
  const response = await fetch(`http://localhost:4000/api/jobs/${jobId}/candidates`)
  const { data } = await response.json()
  return data
}

export const updateCandidate = async (
  jobId: string,
  candidate: Candidate
): Promise<Candidate | undefined> => {
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')

  try {
    const response = await fetch(
      `http://localhost:4000/api/jobs/${jobId}/candidates/${candidate.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ candidate }),
        headers,
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const { data } = await response.json()

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update candidate: ${error.message}`)
    }
  }
}
