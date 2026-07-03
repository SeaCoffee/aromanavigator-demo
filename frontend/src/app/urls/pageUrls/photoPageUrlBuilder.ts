export const photoPageUrlBuilder = {
  anchors: {
    photos: 'photos',
    cover: 'cover',
    attachments: 'attachments',
  },

  withPhotosAnchor: (pagePath: string) => `${pagePath}#photos`,
  withCoverAnchor: (pagePath: string) => `${pagePath}#cover`,
  withAttachmentsAnchor: (pagePath: string) => `${pagePath}#attachments`,
} as const;
