'use server';

import { createClient } from '@/lib/supabase/server';

export interface TreeNode {
  id: string;
  name: string;
  type: string;
  children?: TreeNode[];
}

export async function getAcademicTree(): Promise<TreeNode[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Verify Admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    throw new Error('Not authorized');
  }

  // Fetch all hierarchy levels
  const [
    { data: universities },
    { data: formations },
    { data: levels },
    { data: editions },
    { data: semesters },
    { data: subjects },
    { data: chapters }
  ] = await Promise.all([
    supabase.from('universities').select('*'),
    supabase.from('formations').select('*'),
    supabase.from('levels').select('*'),
    supabase.from('editions').select('*'),
    supabase.from('semesters').select('*'),
    supabase.from('subjects').select('*'),
    supabase.from('chapters').select('id, title, subject_id')
  ]);

  // Build the tree
  const tree: TreeNode[] = [];

  for (const uni of (universities || [])) {
    const uniNode: TreeNode = { id: uni.id, name: uni.name, type: 'Université', children: [] };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniFormations = (formations || []).filter((f: any) => f.university_id === uni.id);
    for (const form of uniFormations) {
      const formNode: TreeNode = { id: form.id, name: form.name, type: 'Formation', children: [] };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formLevels = (levels || []).filter((l: any) => l.formation_id === form.id);
      for (const level of formLevels) {
        const levelNode: TreeNode = { id: level.id, name: level.name, type: 'Niveau', children: [] };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const levelEditions = (editions || []).filter((e: any) => e.level_id === level.id);
        for (const edition of levelEditions) {
          const editionNode: TreeNode = { id: edition.id, name: edition.name, type: 'Édition', children: [] };
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const editionSemesters = (semesters || []).filter((s: any) => s.edition_id === edition.id);
          for (const sem of editionSemesters) {
            const semNode: TreeNode = { id: sem.id, name: sem.name, type: 'Semestre', children: [] };
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const semSubjects = (subjects || []).filter((sub: any) => sub.semester_id === sem.id);
            for (const subject of semSubjects) {
              const subNode: TreeNode = { id: subject.id, name: subject.name, type: 'Matière', children: [] };
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const subChapters = (chapters || []).filter((c: any) => c.subject_id === subject.id);
              for (const chapter of subChapters) {
                 subNode.children!.push({ id: chapter.id, name: chapter.title, type: 'Chapitre' });
              }
              
              semNode.children!.push(subNode);
            }
            editionNode.children!.push(semNode);
          }
          levelNode.children!.push(editionNode);
        }
        formNode.children!.push(levelNode);
      }
      uniNode.children!.push(formNode);
    }
    tree.push(uniNode);
  }

  return tree;
}
