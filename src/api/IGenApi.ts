import { Matches } from './genApi.interface'

export interface IGenApi {
    fetchMatches(query: string, threshold: string): Promise<Matches>
}
