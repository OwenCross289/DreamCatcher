import { generateImage } from '@tanstack/ai'
import { openaiImage } from '@tanstack/ai-openai'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db/index.server'
import { dreams } from '#/db/schema'
import { moods, visualStyles } from '#/lib/dream-options'
import { requireCurrentUser } from '#/lib/session.server'

const createDreamSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(20).max(6_000),
  dreamDate: z.iso.date(),
  mood: z.enum(moods),
  visualStyle: z.enum(visualStyles),
})

const dreamIdSchema = z.object({ dreamId: z.uuid() })

export type CreateDreamInput = z.infer<typeof createDreamSchema>

function buildImagePrompt(dream: CreateDreamInput) {
  return [
    'Create a beautiful, evocative illustration for a private dream journal.',
    `The visual treatment should feel ${dream.visualStyle}, with a ${dream.mood} emotional atmosphere.`,
    'Compose a wide, immersive scene with a clear focal point, subtle depth, rich light, and dreamlike details.',
    'Do not include captions, typography, borders, signatures, or watermarks.',
    '',
    `Dream title: ${dream.title}`,
    `Dream memory: ${dream.content}`,
  ].join('\n')
}

async function decodeGeneratedImage(image: { b64Json?: string; url?: string }) {
  if (image.b64Json) {
    return { data: Buffer.from(image.b64Json, 'base64'), mimeType: 'image/png' }
  }

  if (image.url) {
    const response = await fetch(image.url)
    if (!response.ok) {
      throw new Error('The generated image could not be downloaded.')
    }

    return {
      data: Buffer.from(await response.arrayBuffer()),
      mimeType: response.headers.get('content-type') ?? 'image/png',
    }
  }

  throw new Error('OpenAI returned no image data.')
}

async function generateDreamImage(dreamId: string, input: CreateDreamInput) {
  const model = (process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2') as Parameters<
    typeof openaiImage
  >[0]
  const prompt = buildImagePrompt(input)

  try {
    const result = await generateImage({
      adapter: openaiImage(model),
      prompt,
      size: '1536x1024',
    })
    const image = result.images.at(0)

    if (!image) {
      throw new Error('OpenAI returned no image.')
    }

    const decoded = await decodeGeneratedImage(image)

    await db
      .update(dreams)
      .set({
        imageStatus: 'ready',
        imageData: decoded.data,
        imageMimeType: decoded.mimeType,
        imagePrompt: prompt,
        imageModel: model,
        imageError: null,
        updatedAt: new Date(),
      })
      .where(eq(dreams.id, dreamId))

    return 'ready' as const
  } catch (error) {
    console.error('Dream image generation failed', {
      dreamId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    await db
      .update(dreams)
      .set({
        imageStatus: 'failed',
        imageData: null,
        imageMimeType: null,
        imagePrompt: prompt,
        imageModel: model,
        imageError:
          'The dream was saved, but its picture could not be created.',
        updatedAt: new Date(),
      })
      .where(eq(dreams.id, dreamId))

    return 'failed' as const
  }
}

export const listDreams = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await requireCurrentUser()
    const rows = await db
      .select({
        id: dreams.id,
        title: dreams.title,
        dreamDate: dreams.dreamDate,
        mood: dreams.mood,
        imageStatus: dreams.imageStatus,
        updatedAt: dreams.updatedAt,
      })
      .from(dreams)
      .where(eq(dreams.userId, user.id))
      .orderBy(desc(dreams.dreamDate), desc(dreams.createdAt))

    return {
      user: { name: user.name, email: user.email, image: user.image },
      dreams: rows.map((dream) => ({
        ...dream,
        updatedAt: dream.updatedAt.toISOString(),
      })),
    }
  },
)

export const getDream = createServerFn({ method: 'GET' })
  .validator(dreamIdSchema)
  .handler(async ({ data }) => {
    const user = await requireCurrentUser()
    const rows = await db
      .select({
        id: dreams.id,
        title: dreams.title,
        content: dreams.content,
        dreamDate: dreams.dreamDate,
        mood: dreams.mood,
        visualStyle: dreams.visualStyle,
        imageStatus: dreams.imageStatus,
        imageError: dreams.imageError,
        imageModel: dreams.imageModel,
        createdAt: dreams.createdAt,
        updatedAt: dreams.updatedAt,
      })
      .from(dreams)
      .where(and(eq(dreams.id, data.dreamId), eq(dreams.userId, user.id)))
      .limit(1)
    const dream = rows.at(0)

    if (!dream) throw notFound()

    return {
      ...dream,
      createdAt: dream.createdAt.toISOString(),
      updatedAt: dream.updatedAt.toISOString(),
    }
  })

export const createDream = createServerFn({ method: 'POST' })
  .validator(createDreamSchema)
  .handler(async ({ data }) => {
    const user = await requireCurrentUser()
    const createdRows = await db
      .insert(dreams)
      .values({
        userId: user.id,
        title: data.title,
        content: data.content,
        dreamDate: data.dreamDate,
        mood: data.mood,
        visualStyle: data.visualStyle,
        imageStatus: 'generating',
      })
      .returning({ id: dreams.id })
    const created = createdRows.at(0)

    if (!created) throw new Error('The dream could not be saved.')

    return { id: created.id }
  })

export const generateDreamImageForDream = createServerFn({ method: 'POST' })
  .validator(dreamIdSchema)
  .handler(async ({ data }) => {
    const user = await requireCurrentUser()
    const rows = await db
      .select({
        id: dreams.id,
        title: dreams.title,
        content: dreams.content,
        dreamDate: dreams.dreamDate,
        mood: dreams.mood,
        visualStyle: dreams.visualStyle,
        imageStatus: dreams.imageStatus,
      })
      .from(dreams)
      .where(and(eq(dreams.id, data.dreamId), eq(dreams.userId, user.id)))
      .limit(1)
    const dream = rows.at(0)

    if (!dream) throw notFound()

    if (dream.imageStatus !== 'generating') {
      return { imageStatus: dream.imageStatus }
    }

    const imageStatus = await generateDreamImage(dream.id, {
      ...dream,
      mood: createDreamSchema.shape.mood.parse(dream.mood),
      visualStyle: createDreamSchema.shape.visualStyle.parse(dream.visualStyle),
    })

    return { imageStatus }
  })

export const deleteDream = createServerFn({ method: 'POST' })
  .validator(dreamIdSchema)
  .handler(async ({ data }) => {
    const user = await requireCurrentUser()
    await db
      .delete(dreams)
      .where(and(eq(dreams.id, data.dreamId), eq(dreams.userId, user.id)))

    return { deleted: true }
  })
