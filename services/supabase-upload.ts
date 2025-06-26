import { createClient } from '@/lib/supabase/client';

const supabase = createClient()

const BUCKET_NAME = 'yoshida-cor'

export const uploadFile = async (file: File, fileName?: string): Promise<{
    path: string;
    publicUrl: string;
}> => {
    try {
        const fileExt = file.name.split('.').pop()
        const finalFileName = fileName || `${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(finalFileName, file)

        if (error) {
            throw error
        }

        const publicUrl = getPublicUrl(data.path)

        return {
            path: data.path,
            publicUrl
        }
    } catch (error) {
        console.error('Error uploading file:', error)
        throw error
    }
}

export const getPublicUrl = (filePath: string): string => {
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

    return data.publicUrl
}

export const removeFile = async (filePath: string): Promise<boolean> => {
    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath])

        if (error) {
            throw error
        }

        return true
    } catch (error) {
        console.error('Error removing file:', error)
        throw error
    }
}
