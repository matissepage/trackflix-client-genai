const executeQuery = require('./executeQuery.js')

const removeHighlightedVideos = async () => {
    const highlightedMedias = await executeQuery('ListMedia', {
        filter: { highlighted: { eq: true } },
    })
    if (
        !highlightedMedias ||
        !highlightedMedias.data ||
        !highlightedMedias.data.listMedia ||
        !highlightedMedias.data.listMedia.items
    ) {
        throw new Error("Can't list highlited videos")
    }

    for (const media of highlightedMedias.data.listMedia.items) {
        await executeQuery('UpdateMedia', {
            input: { id: media.id, highlighted: false },
        })
    }
}

const MediaManager = {
    getMedia: async ({ id }) => {
        const mediaData = await executeQuery('GetMedia', { id })
        if (!mediaData || !mediaData.data || !mediaData.data.getMedia) {
            return {
                statusCode: 404,
                body: `Media "${id}" not found`,
            }
        }
        const mediasSectionsData = await executeQuery('ListMediasSections', {
            filter: { mediaID: { eq: id } },
        })
        const sections =
            mediasSectionsData &&
            mediasSectionsData.data &&
            mediasSectionsData.data.listMediasSections &&
            mediasSectionsData.data.listMediasSections.items
                ? mediasSectionsData.data.listMediasSections.items.map(
                      (item) => item.section
                  )
                : []

        return {
            statusCode: 200,
            body: {
                ...mediaData.data.getMedia,
                sections,
            },
        }
    },
    createMedia: async ({ input }) => {
        if (input.highlighted === true) {
            await removeHighlightedVideos()
        }

        const mediaData = await executeQuery('CreateMedia', {
            input: { ...input, sections: undefined },
        })

        if (input.sections) {
            for (const section of input.sections) {
                await executeQuery('CreateMediasSections', {
                    input: {
                        sectionID: section,
                        mediaID: mediaData.data.createMedia.id,
                    },
                })
            }
        }
        return {
            statusCode: 200,
            body: mediaData,
        }
    },
    deleteMedia: async ({ id }) => {
        const mediasSectionsData = await executeQuery('ListMediasSections', {
            filter: { mediaID: { eq: id } },
        })
        if (
            mediasSectionsData &&
            mediasSectionsData.data &&
            mediasSectionsData.data.listMediasSections &&
            mediasSectionsData.data.listMediasSections.items
        ) {
            for (const mediasSection of mediasSectionsData.data
                .listMediasSections.items) {
                if (!mediasSection) continue
                await executeQuery('DeleteMediasSections', {
                    input: { id: mediasSection.id },
                })
            }
        }
        const mediaData = await executeQuery('DeleteMedia', { input: { id } })
        return {
            statusCode: 200,
            body: mediaData,
        }
    },
    updateMedia: async ({ input }) => {
        if (input.highlighted === true) {
            await removeHighlightedVideos()
        }

        const mediaData = await executeQuery('UpdateMedia', {
            input: { ...input, sections: undefined },
        })
        if (input.sections) {
            const mediasSectionsData = await executeQuery(
                'ListMediasSections',
                {
                    filter: { mediaID: { eq: input.id } },
                }
            )
            if (
                mediasSectionsData &&
                mediasSectionsData.data &&
                mediasSectionsData.data.listMediasSections &&
                mediasSectionsData.data.listMediasSections.items
            ) {
                for (const mediasSection of mediasSectionsData.data
                    .listMediasSections.items) {
                    if (!mediasSection) continue
                    await executeQuery('DeleteMediasSections', {
                        input: { id: mediasSection.id },
                    })
                }
            }
            for (const section of input.sections) {
                await executeQuery('CreateMediasSections', {
                    input: {
                        sectionID: section,
                        mediaID: input.id,
                    },
                })
            }
        }
        return {
            statusCode: 200,
            body: { ...mediaData, sections: undefined },
        }
    },
}

module.exports = MediaManager
