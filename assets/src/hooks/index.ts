import { Channel, Socket } from 'phoenix'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { getCandidates, getJob, getJobs } from '../api'

export const useJobs = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  })

  return { isLoading, error, jobs: data }
}

export const useJob = (jobId?: string) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    enabled: !!jobId,
  })

  return { isLoading, error, job: data }
}

export const useCandidates = (jobId?: string) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['candidates', jobId],
    queryFn: () => getCandidates(jobId),
    enabled: !!jobId,
  })

  return { isLoading, error, candidates: data }
}

export const useSocketChannel = (endpoint: string, topic: string, subtopic = '') => {
  const [socket, setSocket] = useState<Socket>()
  const [channel, setChannel] = useState<Channel>()

  useEffect(() => {
    const socketInstance = new Socket(`http://localhost:4000/${endpoint}`, {})
    const channelInstance = socketInstance.channel(`${topic}:${subtopic}`, {})

    socketInstance.connect()
    setSocket(socketInstance)
    channelInstance
      .join()
      .receive('ok', () => console.log('Joined successfully'))
      .receive('error', () => console.log('Unable to join'))
    setChannel(channelInstance)

    return () => {
      channelInstance.leave()
      socketInstance.disconnect()
    }
  }, [endpoint, topic, subtopic])

  return { socket, channel }
}
