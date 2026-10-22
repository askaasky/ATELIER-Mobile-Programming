/**
 * Client-Side Atelier AI & Translation Service
 * Memungkinkan HP / Aplikasi (Play Store) menjalankan fitur AI & Penerjemah
 * langsung tanpa butuh server Node.js localhost terpisah.
 */

function cleanHtml(text?: string): string {
  if (!text) return ''
  return text.replace(/<[^>]*>/g, '').trim()
}

/**
 * Detect if message is written in English with enhanced pattern & vocabulary analysis
 */
export function isEnglishMessage(text: string): boolean {
  if (!text || text.trim() === '') return false
  const clean = text.toLowerCase().trim()

  // Strong Indonesian indicators
  const idKeywords = [
    'apa', 'siapa', 'kapan', 'dimana', 'di mana', 'mengapa', 'kenapa', 'bagaimana', 'jelaskan',
    'makna', 'sejarah', 'terjemah', 'terjemahkan', 'rekomendasi', 'tahun', 'lukisan', 'seniman',
    'karya', 'lokasi', 'cerita', 'biografi', 'profil', 'aliran', 'gaya', 'pameran', 'disimpan',
    'dibuat', 'pembuat', 'tolong', 'apakah', 'siapakah', 'bagaimanakah', 'berapa', 'museum'
  ]

  // Strong English indicators
  const enKeywords = [
    'what', 'who', 'when', 'where', 'why', 'how', 'tell', 'explain', 'describe', 'meaning',
    'story', 'biography', 'artist', 'recommend', 'similar', 'details', 'location', 'museum',
    'created', 'painted', 'year', 'history', 'background', 'style', 'difference', 'appreciate',
    'explore', 'about', 'full', 'which', 'technique', 'medium', 'paint', 'painting', 'painter',
    'collection', 'housed', 'contrast', 'analysis'
  ]

  let idScore = 0
  let enScore = 0

  const words = clean.split(/\s+/)
  const enCommonWords = new Set(['the', 'is', 'are', 'was', 'were', 'this', 'that', 'these', 'those', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'can', 'could', 'would', 'should', 'of', 'and', 'or', 'to', 'it', 'from', 'my', 'your'])
  const idCommonWords = new Set(['yang', 'ini', 'itu', 'di', 'ke', 'dari', 'pada', 'dengan', 'dan', 'atau', 'secara', 'untuk', 'oleh', 'ada', 'adalah', 'saya', 'kamu', 'anda', 'nya'])

  for (const word of words) {
    const w = word.replace(/[^a-z]/g, '')
    if (enCommonWords.has(w)) enScore += 2
    if (idCommonWords.has(w)) idScore += 2
  }

  for (const kw of idKeywords) {
    if (clean.includes(kw)) idScore += 3
  }

  for (const kw of enKeywords) {
    if (clean.includes(kw)) enScore += 3
  }

  return enScore > idScore
}

// 🌐 UNIVERSAL TRANSLATOR ENGINE (Direct Client-Side)
export async function translateToIndonesian(text: string): Promise<string> {
  if (!text || text.trim() === '') return ''
  const clean = cleanHtml(text)
  if (!clean) return ''

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(clean)}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
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

// 🖼️ DYNAMIC RECOMMENDATIONS ENGINE
export async function fetchDynamicSimilarArtworks(artwork: any): Promise<{ title: string; artist: string }[]> {
  const artist = artwork?.artist || artwork?.artist_display || ''
  const title = artwork?.title || ''
  const medium = artwork?.medium_display || ''

  let searchQuery = artist.split('(')[0].split(',')[0].trim()
  if (!searchQuery || searchQuery.toLowerCase().includes('unknown')) {
    searchQuery = medium.split(' ')[0] || 'portrait'
  }

  const results: { title: string; artist: string }[] = []
  const seenTitles = new Set<string>([title.toLowerCase()])

  try {
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

// 🎨 SMART ARTWORK ASSISTANT ENGINE (Client-Side Intelligence & Rich Fallback)
export async function generateArtAssistantResponse(message: string, artwork: any): Promise<string> {
  const isEng = isEnglishMessage(message)
  const lowerMsg = message.toLowerCase()

  // A. GENERAL QUESTIONS (No artwork explicitly active)
  if (!artwork) {
    if (lowerMsg.includes('apresiasi') || lowerMsg.includes('membaca') || lowerMsg.includes('appreciate') || lowerMsg.includes('analyze')) {
      if (isEng) {
        return `**How to Analyze & Appreciate Paintings:**\n\n` +
          `1. **Subject & Visual Composition**: Observe what is depicted—the main figures, landscape, focal point, and light distribution.\n` +
          `2. **Color & Brushwork**: Pay attention to color harmony, contrast, and whether brushstrokes are smooth (Classic) or energetic (Impressionism).\n` +
          `3. **Historical Context**: Consider when it was painted and what emotional or political message the artist aimed to deliver.\n` +
          `4. **Personal Connection**: Reflect on how the masterpiece makes you feel when viewing its fine details.`
      }
      return `**Cara Membaca & Mengapresiasi Lukisan:**\n\n` +
        `1. **Komposisi Visual**: Perhatikan objek utama, pencahayaan, serta keseimbangan elemen dalam kanvas.\n` +
        `2. **Warna & Goresan Kuas**: Amati harmoni warna dan teknik sapuan kuas—apakah halus (Klasik) atau tegas bertekstur (Impressionisme).\n` +
        `3. **Konteks Sejarah**: Pahami era pembuatan lukisan serta cerita atau latar belakang emosional sang seniman.\n` +
        `4. **Resonansi Emosional**: Rasakan kesan serta suasana yang dipancarkan oleh karya tersebut saat Anda memandangnya.`
    }

    if (lowerMsg.includes('impressionism') || lowerMsg.includes('renaissance') || lowerMsg.includes('aliran') || lowerMsg.includes('style')) {
      if (isEng) {
        return `**Impressionism vs. Renaissance Art:**\n\n` +
          `• **Renaissance (14th - 17th Century)**: Focused on realism, precise anatomical perspective, religious/mythological themes, and balanced geometric composition (e.g., Leonardo da Vinci, Michelangelo).\n` +
          `• **Impressionism (Late 19th Century)**: Focused on capturing natural light, outdoor atmospheres (en plein air), vivid colors, and visible, energetic brushstrokes (e.g., Claude Monet, Vincent van Gogh).`
      }
      return `**Perbedaan Aliran Renaissance & Impressionisme:**\n\n` +
        `• **Renaissance (Abad 14 - 17)**: Berfokus pada realisme presisi, anatomi manusia yang sempurna, perspektif realistis, serta tema mitologi/keagamaan (contoh: Leonardo da Vinci, Michelangelo).\n` +
        `• **Impressionisme (Akhir Abad 19)**: Berfokus pada momen pencahayaan alami, lukisan di luar ruangan (en plein air), warna cerah, dan gubahan kuas spontan bertekstur (contoh: Claude Monet, Vincent van Gogh).`
    }

    if (lowerMsg.includes('museum') || lowerMsg.includes('koleksi') || lowerMsg.includes('collection')) {
      if (isEng) {
        return `**Museum Collections Integrated in Atelier:**\n\n` +
          `1. **The Metropolitan Museum of Art (The Met, New York)**: World-renowned institution holding over 5,000 years of global art masterpieces.\n` +
          `2. **Cleveland Museum of Art (CMA, Ohio)**: Premier international art collection featuring high-resolution open access masterpieces.`
      }
      return `**Koleksi Museum yang Terintegrasi di Atelier:**\n\n` +
        `1. **The Metropolitan Museum of Art (The Met, New York)**: Salah satu museum terbesar di dunia yang menyimpan koleksi karya mahakarya dari berbagai zaman.\n` +
        `2. **Cleveland Museum of Art (CMA, Ohio)**: Museum seni terkemuka dengan akses terbuka digital berkualitas ultra-tinggi.`
    }

    if (isEng) {
      return `Hello! I am Atelier Curator AI.\n\n` +
        `You can select any artwork in the app to ask specific questions about its artist, history, technique, or meaning. You can also ask me general art history and appreciation questions!`
    }
    return `Halo! Saya Atelier Curator AI.\n\n` +
      `Silakan buka salah satu karya seni di aplikasi untuk menanyakan detail pembuat, makna, teknik, maupun biografi seniman. Anda juga dapat menanyakan sejarah seni secara umum!`
  }

  // B. SPECIFIC ARTWORK QUESTIONS
  const title = artwork.title || artwork.name || 'Untitled Artwork'
  const artist = artwork.artist || artwork.artist_display || 'Unknown Artist'
  const date = artwork.date || artwork.date_display || 'Date unspecified'
  const technique = artwork.technique || artwork.medium_display || 'Unspecified'
  const museum = artwork.museum || 'Museum Collection'
  const placeOfOrigin = artwork.place_of_origin || 'Unspecified'
  const dimensions = artwork.dimensions || 'Unspecified'
  const creditLine = artwork.credit_line || 'Museum Collection'
  const rawEngDesc = cleanHtml(artwork.description || artwork.description_text || '')
  const rawArtistBio = cleanHtml(artwork.artist_bio || '')

  // 1. FULL DETAILS / TRANSLATION ALL
  if (
    lowerMsg.includes('semua') ||
    lowerMsg.includes('seluruh') ||
    lowerMsg.includes('detail karya') ||
    (lowerMsg.includes('translate') && (lowerMsg.includes('all') || lowerMsg.includes('full')))
  ) {
    const indoDesc = await translateToIndonesian(rawEngDesc)
    const indoBio = rawArtistBio ? await translateToIndonesian(rawArtistBio) : ''

    return `**Detail Lengkap Karya "${title}"**\n\n` +
      `• **Judul Karya**: ${title}\n` +
      `• **Seniman**: ${artist}\n` +
      (indoBio ? `• **Biografi Seniman**: ${indoBio}\n` : '') +
      `• **Tahun Pembuatan**: ${date}\n` +
      `• **Teknik & Medium**: ${technique}\n` +
      `• **Dimensi Ukuran**: ${dimensions}\n` +
      `• **Asal Wilayah**: ${placeOfOrigin}\n` +
      `• **Lokasi Museum**: ${museum}\n` +
      `• **Kredit Koleksi**: ${creditLine}\n\n` +
      `**Deskripsi Naratif**:\n` +
      `${indoDesc || 'Deskripsi naratif karya seni ini bersumber dari katalog arsip museum.'}`
  }

  // 2. ARTIST / BIO / PEMBUAT / SENIMAN
  if (
    lowerMsg.includes('bio') ||
    lowerMsg.includes('biografi') ||
    lowerMsg.includes('biography') ||
    lowerMsg.includes('profile') ||
    lowerMsg.includes('artist') ||
    lowerMsg.includes('seniman') ||
    lowerMsg.includes('pembuat') ||
    lowerMsg.includes('pelukis') ||
    lowerMsg.includes('who painted') ||
    lowerMsg.includes('who created') ||
    lowerMsg.includes('who is the artist')
  ) {
    if (lowerMsg.includes('terjemah') || lowerMsg.includes('translate')) {
      const bioText = rawArtistBio || artist
      const indoBio = await translateToIndonesian(bioText)

      return `**Profil & Biografi Seniman**\n\n` +
        `• **Nama Seniman**: ${artist}\n` +
        `• **Latar Belakang**: ${indoBio || artist}\n\n` +
        `Karya "${title}" ini diciptakan pada tahun ${date} dan saat ini menjadi koleksi pameran di ${museum}.`
    }

    if (isEng) {
      return `**Artist Profile & Biography**\n\n` +
        `• **Artist Name**: ${artist}\n` +
        `• **Background**: ${rawArtistBio || artist}\n\n` +
        `This masterpiece "${title}" was created in ${date} and is preserved at ${museum}.`
    }

    const bioText = rawArtistBio || artist
    const indoBio = await translateToIndonesian(bioText)
    return `**Profil & Biografi Seniman**\n\n` +
      `• **Nama Seniman**: ${artist}\n` +
      `• **Latar Belakang**: ${indoBio || artist}\n\n` +
      `Karya "${title}" ini diciptakan pada tahun ${date} dan menjadi koleksi di ${museum}.`
  }

  // 3. RECOMMENDATIONS / LUKISAN SERUPA
  if (
    lowerMsg.includes('rekomendasi') ||
    lowerMsg.includes('recommend') ||
    lowerMsg.includes('serupa') ||
    lowerMsg.includes('similar') ||
    lowerMsg.includes('mirip') ||
    lowerMsg.includes('like this')
  ) {
    const recommendations = await fetchDynamicSimilarArtworks(artwork)

    if (isEng) {
      let reply = `**Recommended Artworks Similar to "${title}"**:\n\n`
      recommendations.forEach((item, idx) => {
        reply += `${idx + 1}. **"${item.title}"**\n   Artist: ${item.artist}\n\n`
      })
      reply += `*You can search these titles in the Explore tab to view full details.*`
      return reply
    } else {
      let reply = `**Rekomendasi Lukisan Serupa dengan "${title}"**:\n\n`
      recommendations.forEach((item, idx) => {
        reply += `${idx + 1}. **"${item.title}"**\n   Pembuat: ${item.artist}\n\n`
      })
      reply += `*Ketik judul atau seniman di atas pada tab Explore untuk melihat gambar dan detailnya.*`
      return reply
    }
  }

  // 4. YEAR & LOCATION / TAHUN & MUSEUM
  if (
    lowerMsg.includes('tahun') ||
    lowerMsg.includes('year') ||
    lowerMsg.includes('museum') ||
    lowerMsg.includes('kapan') ||
    lowerMsg.includes('dimana') ||
    lowerMsg.includes('when') ||
    lowerMsg.includes('where') ||
    lowerMsg.includes('disimpan') ||
    lowerMsg.includes('location')
  ) {
    if (isEng) {
      return `**Artwork Origin & Museum Location**\n\n` +
        `• **Title**: "${title}"\n` +
        `• **Artist**: ${artist}\n` +
        `• **Year Created**: ${date}\n` +
        `• **Museum Location**: ${museum}\n` +
        `• **Place of Origin**: ${placeOfOrigin}`
    }
    return `**Informasi Tahun & Lokasi Penyimpanan**\n\n` +
      `• **Judul Karya**: "${title}"\n` +
      `• **Seniman**: ${artist}\n` +
      `• **Tahun Dibuat**: ${date}\n` +
      `• **Museum Penyimpanan**: ${museum}\n` +
      `• **Asal Wilayah**: ${placeOfOrigin}`
  }

  // 5. MEDIUM & TECHNIQUE / TEKNIK & BAHAN
  if (
    lowerMsg.includes('teknik') ||
    lowerMsg.includes('technique') ||
    lowerMsg.includes('medium') ||
    lowerMsg.includes('bahan') ||
    lowerMsg.includes('dimensi') ||
    lowerMsg.includes('dimension') ||
    lowerMsg.includes('material')
  ) {
    if (isEng) {
      return `**Technique & Medium Information**\n\n` +
        `• **Artwork Title**: "${title}"\n` +
        `• **Technique/Medium**: ${technique}\n` +
        `• **Dimensions**: ${dimensions}\n` +
        `• **Credit Line**: ${creditLine}`
    }
    return `**Informasi Teknik & Medium**\n\n` +
      `• **Judul Karya**: "${title}"\n` +
      `• **Teknik & Medium**: ${technique}\n` +
      `• **Dimensi Ukuran**: ${dimensions}\n` +
      `• **Kredit Koleksi**: ${creditLine}`
  }

  // 6. TRANSLATION / TERJEMAHAN DESKRIPSI
  if (
    lowerMsg.includes('terjemah') ||
    (lowerMsg.includes('translate') && lowerMsg.includes('indonesian'))
  ) {
    const indoDesc = await translateToIndonesian(rawEngDesc)
    if (!indoDesc || indoDesc.toLowerCase().includes('no description')) {
      return `**Deskripsi "${title}"** oleh ${artist}: Karya ini tersimpan di ${museum} dengan medium ${technique}.`
    }
    return `**Deskripsi & Makna "${title}" (Bahasa Indonesia)**:\n\n${indoDesc}\n\n*Karya oleh ${artist}, dipamerkan di ${museum}.*`
  }

  // 7. EXPLANATION / STORY / MEANING / ANALISIS / DESKRIPSI
  if (
    lowerMsg.includes('makna') ||
    lowerMsg.includes('meaning') ||
    lowerMsg.includes('cerita') ||
    lowerMsg.includes('story') ||
    lowerMsg.includes('jelaskan') ||
    lowerMsg.includes('explain') ||
    lowerMsg.includes('deskripsi') ||
    lowerMsg.includes('description') ||
    lowerMsg.includes('analisis') ||
    lowerMsg.includes('analysis') ||
    lowerMsg.includes('about')
  ) {
    if (isEng) {
      return `**Description & Narrative Analysis of "${title}"**\n\n` +
        `• **Artist**: ${artist} (${date})\n` +
        `• **Museum**: ${museum}\n\n` +
        `**Overview & Details**:\n` +
        `${rawEngDesc || `This masterpiece was executed in ${date} using ${technique}. It represents a distinguished example from the collection at ${museum}.`}`
    }

    const indoDesc = await translateToIndonesian(rawEngDesc)
    return `**Deskripsi & Analisis Naratif "${title}"**\n\n` +
      `• **Seniman**: ${artist} (${date})\n` +
      `• **Museum**: ${museum}\n\n` +
      `**Ulasan Karya**:\n` +
      `${indoDesc || `Karya mahakarya ini dibuat pada tahun ${date} dengan teknik ${technique} dan dipamerkan di ${museum}.`}`
  }

  // 8. CATCH-ALL RICH STRUCTURED RESPONSE
  if (isEng) {
    return `**Curator Overview: "${title}"**\n\n` +
      `• **Artist**: ${artist}\n` +
      `• **Date Created**: ${date}\n` +
      `• **Medium**: ${technique}\n` +
      `• **Location**: ${museum}\n\n` +
      `**Description**:\n` +
      `${rawEngDesc || `Preserved at ${museum}, this artwork showcases fine artistic skill and historic significance.`}\n\n` +
      `*Feel free to ask me for artist biography, recommendations, or specific details!*`
  }

  const indoDesc = await translateToIndonesian(rawEngDesc)
  return `**Ringkasan Kurator: "${title}"**\n\n` +
    `• **Seniman**: ${artist}\n` +
    `• **Tahun Dibuat**: ${date}\n` +
    `• **Medium**: ${technique}\n` +
    `• **Museum**: ${museum}\n\n` +
    `**Deskripsi**:\n` +
    `${indoDesc || `Tersimpan di ${museum}, karya seni ini menampilkan keindahan visual dan nilai sejarah yang luar biasa.`}\n\n` +
    `*Anda dapat menanyakan biografi seniman, rekomendasi karya serupa, atau makna lukisan ini!*`
}

/**
 * Main Chat Entry Point for Client-Side AI Execution
 */
export async function sendChatMessage(message: string, artwork: any): Promise<string> {
  const apiKey = (
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    (import.meta.env.GEMINI_API_KEY as string) ||
    ''
  ).trim()

  // Jika API Key tidak disetel di env client, gunakan Intelligent Engine
  if (!apiKey) {
    return await generateArtAssistantResponse(message, artwork)
  }

  const sourceMuseumName = artwork?._source === 'cleveland'
    ? 'Cleveland Museum of Art'
    : artwork?._source === 'met'
      ? 'The Metropolitan Museum of Art'
      : (artwork?.museum || 'Museum')

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
Description (English): ${rawEngDesc || 'None'}
`
    : 'No specific artwork currently open. Answer general art questions expertly.'

  const prompt = `
You are Atelier AI, an expert, eloquent, and highly knowledgeable museum art curator.

USER QUESTION:
"${message}"

ARTWORK CONTEXT:
${artworkContext}

STRICT INSTRUCTIONS:
1. LANGUAGE HARMONY:
   - Determine the language of the USER QUESTION.
   - If the user asks in INDONESIAN (or uses Indonesian keywords), reply strictly in elegant, grammatically natural INDONESIAN.
   - If the user asks in ENGLISH, reply strictly in polished, professional ENGLISH.
   - EXCEPTION: If asked to translate artwork details or bio into Indonesian ("terjemahkan..."), present the translation in natural INDONESIAN.
2. FORMATTING & STYLE:
   - Use bold text (e.g. **Judul Karya**, **Seniman**, **Analisis**) for clear headers and key points.
   - Structure responses cleanly using bullet points or numbered lists where appropriate.
   - Avoid generic robotic replies. Provide insightful art criticism, historical context, and interesting details.
3. RECOMMENDATIONS:
   - When asked for recommendations (lukisan serupa / similar artworks), list 3-4 relevant masterpieces with Title and Artist, mentioning they can be searched in Explore.
`

  // Valid current Gemini models in Gemini API API v1beta
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
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
      console.warn(`[AI SERVICE] Model ${model} fetch error:`, e)
    }
  }

  if (generatedText) {
    return generatedText
  }

  return await generateArtAssistantResponse(message, artwork)
}


