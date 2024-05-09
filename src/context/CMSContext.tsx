import { IApi } from '../api/IApi'
import { IGenApi } from '../api/IGenApi'
import { StrapiApi } from '../api/StrapiApi'
import { createContext } from 'react'
import { GenApi } from '../api/GenApi'

export const CMSContext = createContext<{
    api: IApi
}>({
    api: new StrapiApi({
        baseUrl: process.env.REACT_APP_CMS_BASE_URL,
        token: process.env.REACT_APP_CMS_TOKEN,
    }),
})

export const DemoContext = createContext<{
    genApi: IGenApi
}>({
    genApi: new GenApi({
        demoUrl: process.env.DEMO_API_URL,
    }),
})
