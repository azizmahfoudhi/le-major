'use server';

import { createClient } from '@/lib/supabase/server';

export interface TreeNode {
  id: string;
  name: string;
  type: string;
  children?: TreeNode[];
}

// Proper slugify that handles French accents
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Non autorisé');
}

export async function getAcademicTree(): Promise<TreeNode[]> {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const [
    { data: universities },
    { data: formations },
    { data: levels },
    { data: semesters },
    { data: subjects },
    { data: chapters }
  ] = await Promise.all([
    supabase.from('universities').select('*'),
    supabase.from('formations').select('*'),
    supabase.from('levels').select('*'),
    supabase.from('semesters').select('*'),
    supabase.from('subjects').select('*'),
    supabase.from('chapters').select('id, title, subject_id, order_index').order('order_index', { ascending: true })
  ]);

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
        // Semesters now link directly to levels (no edition layer)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const levelSemesters = (semesters || []).filter((s: any) => s.level_id === level.id);
        for (const sem of levelSemesters) {
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
          levelNode.children!.push(semNode);
        }
        formNode.children!.push(levelNode);
      }
      uniNode.children!.push(formNode);
    }
    tree.push(uniNode);
  }

  return tree;
}

export async function createUniversity(name: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { error } = await supabase.from('universities').insert({ name });
  if (error) throw new Error(error.message);
}

export async function createStructureNode(type: string, parentId: string, name: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  let table = '';
  let parentColumn = '';
  let nameColumn = 'name';

  switch (type) {
    case 'Formation': table = 'formations'; parentColumn = 'university_id'; break;
    case 'Niveau':    table = 'levels';     parentColumn = 'formation_id'; break;
    case 'Semestre':  table = 'semesters';  parentColumn = 'level_id'; break;  // directly to level now
    case 'Matière':   table = 'subjects';   parentColumn = 'semester_id'; break;
    case 'Chapitre':  table = 'chapters';   parentColumn = 'subject_id'; nameColumn = 'title'; break;
    default: throw new Error('Type non supporté');
  }

  // For semesters: auto-increment order_index within the level
  let orderIndex = 1;
  if (type === 'Semestre') {
    const { data: existing } = await supabase
      .from('semesters')
      .select('order_index')
      .eq('level_id', parentId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    orderIndex = ((existing?.order_index) ?? 0) + 1;
  }

  // For chapters: auto-increment order_index within the subject
  if (type === 'Chapitre') {
    const { data: existing } = await supabase
      .from('chapters')
      .select('order_index')
      .eq('subject_id', parentId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    orderIndex = ((existing?.order_index) ?? 0) + 1;
  }

  const { error } = await supabase.from(table).insert({
    [nameColumn]: name,
    [parentColumn]: parentId,
    ...(type === 'Matière' ? { slug: slugify(name) } : {}),
    ...(type === 'Chapitre' ? { slug: slugify(name), order_index: orderIndex } : {}),
    ...(type === 'Semestre' ? { order_index: orderIndex } : {}),
  });

  if (error) throw new Error(error.message);
}

export async function updateStructureNode(type: string, id: string, name: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  let table = '';
  let nameColumn = 'name';

  switch (type) {
    case 'Université': table = 'universities'; break;
    case 'Formation':  table = 'formations'; break;
    case 'Niveau':     table = 'levels'; break;
    case 'Semestre':   table = 'semesters'; break;
    case 'Matière':    table = 'subjects'; break;
    case 'Chapitre':   table = 'chapters'; nameColumn = 'title'; break;
    default: throw new Error('Type non supporté');
  }

  const updatePayload: Record<string, string> = { [nameColumn]: name };
  // Also regenerate slug when renaming a Matière or Chapitre
  if (type === 'Matière' || type === 'Chapitre') {
    updatePayload.slug = slugify(name);
  }

  const { error } = await supabase.from(table).update(updatePayload).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteStructureNode(type: string, id: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  let table = '';
  switch (type) {
    case 'Université': table = 'universities'; break;
    case 'Formation':  table = 'formations'; break;
    case 'Niveau':     table = 'levels'; break;
    case 'Semestre':   table = 'semesters'; break;
    case 'Matière':    table = 'subjects'; break;
    case 'Chapitre':   table = 'chapters'; break;
    default: throw new Error('Type non supporté');
  }

  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
