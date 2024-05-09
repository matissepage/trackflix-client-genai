import { Matches } from './genApi.interface'
import { IGenApi } from './IGenApi'

export class GenApi implements IGenApi {
    private readonly demoUrl: string

    constructor({ demoUrl }: { demoUrl?: string }) {
        if (!demoUrl)
            throw new Error('DemoAPI: demoUrl is required')

        this.demoUrl = demoUrl
    }

    async fetchMatches(query: string, threshold: string): Promise<Matches> {
        const response = await fetch(`${this.demoUrl}/search`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            body: JSON.stringify({query: query, threshold: threshold})
        })
        
        const responseData = await response.json()

        return responseData as Matches
    }
}