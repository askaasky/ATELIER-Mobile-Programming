export interface Artwork {
  id: number
  title: string
  artist_display: string | null
  date_display: string | null
  image_id: string | null
  thumbnail: {
    lqip: string
    width: number
    height: number
    alt_text: string
  } | null
}