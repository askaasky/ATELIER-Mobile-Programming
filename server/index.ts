import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
    dotenv.config()
    const apiKey = process.env.GEMINI_API_KEY
    res.json({
        success: true,
        message: 'Atelier AI server is running',
        hasApiKey: Boolean(apiKey && apiKey.trim() !== '')
    })
})

function cleanHtml(text?: string): string {
    if (!text) return ''
    return text
        .replace(/<[^>]*>/g, '')
        .trim()
}

// 🌐 UNIVERSAL TRANSLATOR ENGINE
async function translateToIndonesian(text: string): Promise<string> {
    if (!text || text.trim() === '') return ''
    const clean = cleanHtml(text)
    if (!clean) return ''

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(clean)}`
        const res = await fetch(url)
        if (res.ok) {
            const data = await res.json()
            // data[0] adalah array of [translated, original, ...] pairs
            // Setiap elemen adalah segmen kalimat — gabungkan HANYA translated-nya (index 0)
            if (data && Array.isArray(data[0])) {
                const seen = new Set<string>()
                const parts: string[] = []
                for (const item of data[0]) {
                    const segment = item[0]
                    if (segment && typeof segment === 'string') {
                        const trimmed = segment.trim()
                        if (trimmed && !seen.has(trimmed)) {
                            seen.add(trimmed)
                            parts.push(trimmed)
                        }
                    }
                }
                if (parts.length > 0) {
                    return parts.join(' ')
                }
            }
        }
    } catch (e) {
        console.warn('[TRANSLATOR] Google GTX fetch error:', e)
    }

    return clean
}

// 🖼️ DYNAMIC RECOMMENDATIONS ENGINE: Mencari lukisan serupa secara dinamis berdasarkan Seniman/Medium dari API Museum
async function fetchDynamicSimilarArtworks(artwork: any): Promise<{ title: string; artist: string }[]> {
    const artist = artwork?.artist || artwork?.artist_display || ''
    const title = artwork?.title || ''
    const medium = artwork?.medium_display || ''

    // Kata kunci untuk pencarian rekomendasi
    let searchQuery = artist.split('(')[0].split(',')[0].trim()
    if (!searchQuery || searchQuery.toLowerCase().includes('unknown')) {
        searchQuery = medium.split(' ')[0] || 'portrait'
    }

    const results: { title: string; artist: string }[] = []
    const seenTitles = new Set<string>([title.toLowerCase()])

    try {
        // Cari di Cleveland Museum API
        const cmaUrl = `https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=10&q=${encodeURIComponent(searchQuery)}`
        const cmaRes = await fetch(cmaUrl)
        if (cmaRes.ok) {
            const cmaData = await cmaRes.json()
            if (cmaData?.data && Array.isArray(cmaData.data)) {
                for (const item of cmaData.data) {
                    const itemTitle = item.title || ''
                    if (itemTitle && !seenTitles.has(itemTitle.toLowerCase())) {
                        let itemArtist = 'Unknown Artist'
                        if (item.creators && item.creators[0]?.description) {
                            itemArtist = item.creators[0].description
                        } else if (item.culture && item.culture[0]) {
                            itemArtist = item.culture[0]
                        }
                        seenTitles.add(itemTitle.toLowerCase())
                        results.push({ title: itemTitle, artist: itemArtist })
                    }
                    if (results.length >= 4) break
                }
            }
        }
    } catch (e) {
        console.warn('[RECOMMENDATIONS] CMA API search error:', e)
    }

    // Jika hasil rekomendasi kurang, lengkapi dari Met Museum masterpieces
    if (results.length < 3) {
        const metBackup = [
            { title: 'Wheat Field with Cypresses', artist: 'Vincent van Gogh' },
            { title: 'Self-Portrait with a Straw Hat', artist: 'Vincent van Gogh' },
            { title: 'The Water Lily Pond', artist: 'Claude Monet' },
            { title: 'Madame X (Madame Pierre Gautreau)', artist: 'John Singer Sargent' },
            { title: 'The Death of Socrates', artist: 'Jacques Louis David' },
            { title: 'The Denial of Saint Peter', artist: 'Caravaggio' },
            { title: 'The Harvesters', artist: 'Pieter Bruegel the Elder' },
            { title: 'The Sleeping Gypsy', artist: 'Henri Rousseau' }
        ]

        for (const item of metBackup) {
            if (!seenTitles.has(item.title.toLowerCase())) {
                seenTitles.add(item.title.toLowerCase())
                results.push(item)
            }
            if (results.length >= 4) break
        }
    }

    return results.slice(0, 4)
}

// 🎨 SMART ARTWORK ASSISTANT ENGINE (Generates tailored responses for ANY artwork)
async function generateArtAssistantResponse(message: string, artwork: any): Promise<string> {
    if (!artwork) {
        return 'Halo! Saya Atelier AI. Silakan buka salah satu lukisan di aplikasi untuk mulai bertanya, meminta penerjemahan bio seniman, deskripsi, atau seluruh detail lukisan.'
    }

    const title = artwork.title || artwork.name || 'Lukisan Ini'
    const artist = artwork.artist || artwork.artist_display || 'Seniman Tidak Diketahui'
    const date = artwork.date || artwork.date_display || 'Tanggal tidak tertera'
    const technique = artwork.technique || artwork.medium_display || 'Tidak disebutkan'
    const museum = artwork.museum || 'Museum Seni'
    const placeOfOrigin = artwork.place_of_origin || 'Tidak disebutkan'
    const dimensions = artwork.dimensions || 'Tidak tertera'
    const creditLine = artwork.credit_line || 'Koleksi Museum'
    const rawEngDesc = artwork.description || artwork.description_text || ''
    const rawArtistBio = artwork.artist_bio || ''

    const lowerMsg = message.toLowerCase()

    // 1. TERJEMAHKAN SEMUA DETAIL KARYA (hanya translate sekali per field yang dibutuhkan)
    if (
        lowerMsg.includes('semua') ||
        lowerMsg.includes('seluruh') ||
        lowerMsg.includes('detail karya') ||
        lowerMsg.includes('semuanya') ||
        lowerMsg.includes('lengkap')
    ) {
        const indoDesc = await translateToIndonesian(rawEngDesc)
        const indoBio = rawArtistBio ? await translateToIndonesian(rawArtistBio) : ''

        return `Detail Lengkap Karya "${title}":\n\n` +
            `Judul Karya: ${title}\n` +
            `Seniman / Pembuat: ${artist}\n` +
            (indoBio ? `Biografi Seniman: ${indoBio}\n` : '') +
            `Tahun Dibuat: ${date}\n` +
            `Teknik & Medium: ${technique}\n` +
            `Dimensi Ukuran: ${dimensions}\n` +
            `Asal Wilayah: ${placeOfOrigin}\n` +
            `Lokasi Museum: ${museum}\n` +
            `Kredit Koleksi: ${creditLine}\n\n` +
            `Deskripsi (Bahasa Indonesia):\n` +
            `${indoDesc || 'Deskripsi naratif tidak tersedia dalam data museum.'}`
    }

    // 2. TERJEMAHKAN BIO ARTIST / SENIMAN (hanya translate bio)
    if (
        lowerMsg.includes('bio') ||
        lowerMsg.includes('biografi') ||
        lowerMsg.includes('profil') ||
        (lowerMsg.includes('terjemah') && (lowerMsg.includes('seniman') || lowerMsg.includes('artist')))
    ) {
        const bioText = rawArtistBio || artist
        const indoBio = await translateToIndonesian(bioText)

        return `Profil & Biografi Seniman untuk "${title}":\n\n` +
            `Nama Seniman: ${artist}\n` +
            `Biografi & Latar Belakang: ${indoBio || artist}\n\n` +
            `Karya ini dibuat pada tahun ${date} dan dipamerkan di ${museum}.`
    }

    // 3. Rekomendasi Lukisan Serupa
    if (
        lowerMsg.includes('rekomendasi') ||
        lowerMsg.includes('serupa') ||
        lowerMsg.includes('mirip') ||
        lowerMsg.includes('sejenis') ||
        lowerMsg.includes('karya lain')
    ) {
        const recommendations = await fetchDynamicSimilarArtworks(artwork)

        let reply = `Rekomendasi lukisan serupa dengan "${title}" karya ${artist} (cari judulnya di menu Explore):\n\n`
        recommendations.forEach((item, idx) => {
            reply += `${idx + 1}. Judul: "${item.title}"\n   Pembuat: ${item.artist}\n\n`
        })
        reply += `Ketik judul atau nama pembuat di atas pada kolom pencarian Explore untuk menemukan gambar dan detail lengkapnya.`
        return reply
    }

    // 4. Tahun & Museum Penyimpanan
    if (
        lowerMsg.includes('tahun') ||
        lowerMsg.includes('museum') ||
        lowerMsg.includes('kapan') ||
        lowerMsg.includes('dimana') ||
        lowerMsg.includes('disimpan') ||
        lowerMsg.includes('lokasi')
    ) {
        return `Informasi Tahun & Museum Penyimpanan:\n\n` +
            `Judul Lukisan: "${title}"\n` +
            `Pembuat / Seniman: ${artist}\n` +
            `Tahun Dibuat: ${date}\n` +
            `Museum Penyimpanan: ${museum}`
    }

    // 5. Penerjemahan Deskripsi (hanya translate deskripsi)
    if (
        lowerMsg.includes('terjemah') ||
        lowerMsg.includes('translate') ||
        lowerMsg.includes('deskripsi') ||
        lowerMsg.includes('artinya') ||
        lowerMsg.includes('makna') ||
        lowerMsg.includes('jelaskan')
    ) {
        const indoDesc = await translateToIndonesian(rawEngDesc)
        if (!indoDesc || indoDesc.toLowerCase().includes('no description')) {
            return `Deskripsi untuk "${title}" oleh ${artist}: Karya ini tersimpan di ${museum} dengan media ${technique}.`
        }

        return `Deskripsi & Makna "${title}" (Bahasa Indonesia):\n\n${indoDesc}\n\nKarya oleh ${artist}, tersimpan di ${museum}.`
    }

    // Default Response (terjemahkan deskripsi saja)
    const indoDesc = await translateToIndonesian(rawEngDesc)
    return `Karya "${title}" oleh ${artist} (${date}). Dipamerkan di ${museum}.` +
        (indoDesc ? `\n\nDeskripsi:\n${indoDesc}` : '')
}

app.post('/api/chat', async (req, res) => {
    try {
        dotenv.config()
        const apiKey = (process.env.GEMINI_API_KEY || '').trim()

        const { message, artwork } = req.body

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            })
        }

        // Jika API Key tidak ada / tidak dikonfigurasi, gunakan Engine Pintar
        if (!apiKey) {
            console.log('[AI SERVER] GEMINI_API_KEY kosong, menggunakan Intelligent Art Assistant Engine.')
            const smartReply = await generateArtAssistantResponse(message, artwork)
            return res.json({
                success: true,
                answer: smartReply,
                reply: smartReply
            })
        }

        const sourceMuseumName = artwork?._source === 'cleveland'
            ? 'Cleveland Museum of Art'
            : artwork?._source === 'met'
                ? 'The Metropolitan Museum of Art'
                : (artwork?.museum || 'Museum')

        // Kirim teks asli Bahasa Inggris ke Gemini — biarkan Gemini yang menerjemahkan
        // (jangan pre-translate dulu, itu yang menyebabkan konten muncul 2x)
        const rawEngDesc = cleanHtml(artwork?.description || artwork?.description_text || '')
        const rawArtistBio = cleanHtml(artwork?.artist_bio || artwork?.artist_display || '')

        const artworkContext = artwork
            ? `
ARTWORK INFORMATION FROM MUSEUM API:
Title: ${artwork.title || artwork.name || 'Unknown'}
Artist: ${artwork.artist || artwork.artist_display || 'Unknown'}
Artist Bio (English): ${rawArtistBio || artwork.artist_display || 'Unknown'}
Year/Date: ${artwork.date || artwork.date_display || 'Unknown'}
Technique/Medium: ${artwork.technique || artwork.medium_display || 'Unknown'}
Museum Location: ${sourceMuseumName}
Place of Origin: ${artwork.place_of_origin || 'Unknown'}
Dimensions: ${artwork.dimensions || 'Unknown'}
Credit Line: ${artwork.credit_line || 'Unknown'}
Description (English, to be translated): ${rawEngDesc || 'None'}
`
            : 'No artwork currently open.'

        const prompt = `
You are Atelier AI, a polite Indonesian art curator assistant.

USER QUESTION:
"${message}"

ARTWORK CONTEXT:
${artworkContext}

STRICT INSTRUCTIONS:
1. ALWAYS ANSWER ENTIRELY IN BAHASA INDONESIA. DO NOT OUTPUT ENGLISH TEXT IN THE RESPONSE.
2. TRANSLATION REQUESTS — translate the English fields from the context above into natural Indonesian:
   - "terjemahkan deskripsi": Translate the Description field to Indonesian. Output it ONCE only, no repetition.
   - "terjemahkan bio seniman / bio artist": Translate the Artist Bio field to Indonesian. Output it ONCE only.
   - "terjemahkan semua / detail lengkap / semua detail": Output ALL artwork info in structured Indonesian sections. Each piece of info appears ONCE only — do NOT repeat any section.
3. RECOMMENDATIONS (rekomendasi lukisan serupa):
   - Provide 3-4 recommendations of similar paintings relevant to this artwork's style or artist.
   - Format each as:
     Judul: "[Nama Lukisan]"
     Pembuat: [Nama Artist]
   - Mention that the user can search these in the Explore tab.
4. Keep the response concise, clear, and structured. No repeated paragraphs.
5. Do NOT use markdown asterisks (**) or ###. Write clean plain text.
`

        const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
        let generatedText = ''

        for (const model of models) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        {
                                            text: prompt
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                )

                if (response.ok) {
                    const data = await response.json()
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
                    if (text) {
                        generatedText = text
                        break
                    }
                }
            } catch (e) {
                console.warn(`[AI SERVER] Model ${model} fetch error:`, e)
            }
        }

        if (generatedText) {
            const cleanedText = generatedText.replace(/\*\*/g, '').replace(/###/g, '')
            return res.json({
                success: true,
                answer: cleanedText,
                reply: cleanedText
            })
        }

        const fallbackReply = await generateArtAssistantResponse(message, artwork)
        return res.json({
            success: true,
            answer: fallbackReply,
            reply: fallbackReply
        })

    } catch (error) {
        console.error('[AI SERVER] Unexpected server error:', error)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
})

app.listen(PORT, () => {
    console.log('')
    console.log('================================')
    console.log('       ATELIER AI SERVER')
    console.log('================================')
    console.log('Server running at http://localhost:' + PORT)
    console.log('================================')
})