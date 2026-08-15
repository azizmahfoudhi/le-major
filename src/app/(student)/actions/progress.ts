'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Mark a chapter as completed for the current authenticated student
 */
export async function markChapterComplete(chapterId: string, redirectPath?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  // Upsert the progress
  const { error } = await supabase
    .from('chapter_progress')
    .upsert({
      student_id: user.id,
      chapter_id: chapterId,
      is_completed: true,
      last_accessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'student_id, chapter_id'
    });

  if (error) {
    console.error('Error updating progress:', error);
    throw new Error('Erreur lors de la mise à jour de la progression');
  }

  // Revalidate the dashboard and course pages
  revalidatePath('/accueil');
  revalidatePath('/matieres', 'layout');
  
  if (redirectPath) {
    revalidatePath(redirectPath);
  }
}

/**
 * Toggle a specific content as completed or not completed
 */
export async function toggleContentComplete(contentId: string, currentlyCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  if (currentlyCompleted) {
    // Mark as not completed instead of deleting
    const { error } = await supabase
      .from('content_progress')
      .update({ is_completed: false })
      .eq('student_id', user.id)
      .eq('content_id', contentId);

    if (error) {
      console.error('Error removing content progress:', error);
      throw new Error('Erreur lors de la mise à jour de la progression');
    }
  } else {
    // Upsert as completed
    const { error } = await supabase
      .from('content_progress')
      .upsert({
        student_id: user.id,
        content_id: contentId,
        is_completed: true,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'student_id, content_id'
      });

    if (error) {
      console.error('Error updating content progress:', error);
      throw new Error('Erreur lors de la mise à jour de la progression');
    }
  }

  // Auto-sync chapter_progress
  // 1. Get the chapter_id for this content
  const { data: contentData } = await supabase
    .from('contents')
    .select('chapter_id')
    .eq('id', contentId)
    .single();

  if (contentData?.chapter_id) {
    const chapterId = contentData.chapter_id;
    
    // 2. Get all contents for this chapter
    const { data: chapterContents } = await supabase
      .from('contents')
      .select('id')
      .eq('chapter_id', chapterId);
      
    if (chapterContents && chapterContents.length > 0) {
      const contentIds = chapterContents.map(c => c.id);
      
      // 3. Get progress for all these contents
      const { data: userProgress } = await supabase
        .from('content_progress')
        .select('content_id, is_completed')
        .eq('student_id', user.id)
        .in('content_id', contentIds);
        
      // 4. Check if ALL contents are completed
      const allCompleted = chapterContents.every(c => {
        const prog = (userProgress || []).find(p => p.content_id === c.id);
        return prog?.is_completed === true;
      });
      
      // 5. Update chapter_progress
      await supabase
        .from('chapter_progress')
        .upsert({
          student_id: user.id,
          chapter_id: chapterId,
          is_completed: allCompleted,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'student_id, chapter_id'
        });
    }
  }

  revalidatePath('/accueil');
  revalidatePath('/matieres', 'layout');
}

/**
 * Mark a specific content (lesson/resource) as completed for the current authenticated student
 */
export async function markContentComplete(contentId: string, redirectPath?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  // Upsert the content progress
  const { error } = await supabase
    .from('content_progress')
    .upsert({
      student_id: user.id,
      content_id: contentId,
      is_completed: true,
      last_accessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'student_id, content_id'
    });

  if (error) {
    console.error('Error updating content progress:', error);
    throw new Error('Erreur lors de la mise à jour de la progression');
  }

  // Auto-sync chapter_progress
  // 1. Get the chapter_id for this content
  const { data: contentData } = await supabase
    .from('contents')
    .select('chapter_id')
    .eq('id', contentId)
    .single();

  if (contentData?.chapter_id) {
    const chapterId = contentData.chapter_id;
    
    // 2. Get all contents for this chapter
    const { data: chapterContents } = await supabase
      .from('contents')
      .select('id')
      .eq('chapter_id', chapterId);
      
    if (chapterContents && chapterContents.length > 0) {
      const contentIds = chapterContents.map(c => c.id);
      
      // 3. Get progress for all these contents
      const { data: userProgress } = await supabase
        .from('content_progress')
        .select('content_id, is_completed')
        .eq('student_id', user.id)
        .in('content_id', contentIds);
        
      // 4. Check if ALL contents are completed
      const allCompleted = chapterContents.every(c => {
        const prog = (userProgress || []).find(p => p.content_id === c.id);
        return prog?.is_completed === true;
      });
      
      // 5. Update chapter_progress
      await supabase
        .from('chapter_progress')
        .upsert({
          student_id: user.id,
          chapter_id: chapterId,
          is_completed: allCompleted,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'student_id, chapter_id'
        });
    }
  }

  // Revalidate the dashboard and course pages
  revalidatePath('/accueil');
  revalidatePath('/matieres', 'layout');
  
  if (redirectPath) {
    revalidatePath(redirectPath);
  }
}

