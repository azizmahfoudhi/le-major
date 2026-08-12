'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createResource(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const chapter_id = formData.get('chapter_id') as string;
  const mdx_content = formData.get('mdx_content') as string;

  if (!title || !chapter_id || !mdx_content) {
    return { success: false, error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  // Auto-increment order_index within the chapter
  const { data: existing } = await supabase
    .from('contents')
    .select('order_index')
    .eq('chapter_id', chapter_id)
    .eq('type', 'resource')
    .order('order_index', { ascending: false })
    .limit(1)
    .single();
  const orderIndex = ((existing?.order_index) ?? 0) + 1;

  const { error } = await supabase.from('contents').insert({
    title,
    chapter_id,
    type: 'resource',
    body: mdx_content,
    status: 'published',
    order_index: orderIndex,
  });

  if (error) {
    console.error('Erreur création ressource:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/ressources');
  redirect('/admin/ressources');
}

export async function updateResource(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const chapter_id = formData.get('chapter_id') as string;
  const mdx_content = formData.get('mdx_content') as string;

  if (!title || !chapter_id || !mdx_content) {
    return { success: false, error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  const { error } = await supabase.from('contents').update({
    title,
    chapter_id,
    type: 'resource',
    body: mdx_content,
  }).eq('id', id);

  if (error) {
    console.error('Erreur modification ressource:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/ressources');
  redirect('/admin/ressources');
}

export async function deleteResource(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('contents').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/ressources');
}
