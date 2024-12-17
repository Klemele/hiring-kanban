import { Candidate } from './api'

export type Statuses = 'new' | 'interview' | 'hired' | 'rejected'

export interface SortedCandidates {
  [key: string]: Candidate[]
  new: Candidate[]
  interview: Candidate[]
  hired: Candidate[]
  rejected: Candidate[]
}
