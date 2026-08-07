'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createContent(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const chapter_id = formData.get('chapter_id') as string;
  const type = formData.get('type') as string;
  const difficulty = formData.get('difficulty') as string;
  const mdx_content = formData.get('mdx_content') as string;

  if (!title || !chapter_id || !mdx_content) {
    return { success: false, error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  const { error } = await supabase.from('contents').insert({
    title,
    chapter_id,
    type,
    difficulty,
    body: mdx_content,
    status: 'published',
  });

  if (error) {
    console.error('Erreur création contenu:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/contenus');
  redirect('/admin/contenus');
}
