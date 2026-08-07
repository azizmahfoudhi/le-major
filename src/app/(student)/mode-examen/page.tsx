import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Mode Examen | Le Major',
  description: 'Entraînez-vous dans les conditions réelles',
};

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  // 1. Fetch subjects the student has access to
  const { data: activations } = await supabase
    .from('student_activations')
    .select(`
      packages (
        package_subjects (
          subject_id
        )
      )
    `)
    .eq('student_id', user.id)
    .eq('is_active', true);

  const subjectIds = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activations?.forEach((act: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    act.packages?.package_subjects?.forEach((ps: any) => {
      subjectIds.add(ps.subject_id);
    });
  });

  // 2. Fetch exams for these subjects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exams: any[] = [];
  if (subjectIds.size > 0) {
    const { data } = await supabase
      .from('exams')
      .select(`
        id, 
        title, 
        description, 
        duration_minutes, 
        is_mock_exam,
        subjects!inner (
          name,
          slug
        )
      `)
      .in('subject_id', Array.from(subjectIds))
      .eq('status', 'published');
    exams = data || [];
  }

  // 3. Fetch user's previous exam attempts
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('exam_id, status, score')
    .eq('student_id', user.id);

  // Map attempts to exams
  const examsWithAttempts = exams.map(exam => {
    const examAttempts = attempts?.filter(a => a.exam_id === exam.id) || [];
    const bestAttempt = examAttempts.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    return {
      ...exam,
      attemptsCount: examAttempts.length,
      bestScore: bestAttempt?.score || null,
      isCompleted: examAttempts.some(a => a.status === 'completed' || a.status === 'evaluated')
    };
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold text-navy-900 mb-4">
          Mode Examen
        </h1>
        <p className="text-lg text-slate-600">
          Entraînez-vous dans les conditions réelles avec nos annales et examens blancs.
        </p>
      </div>

      <div className="space-y-6">
        {examsWithAttempts.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-navy-900 mb-2">Aucun examen disponible</p>
            <p>Il n'y a pas d'examens publiés pour vos matières actuellement.</p>
          </Card>
        ) : (
          examsWithAttempts.map((exam) => (
            <Card key={exam.id} className="overflow-hidden hover:border-gold-300 transition-colors">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2 py-1 rounded-full uppercase tracking-wider">
                        {exam.subjects?.name}
                      </span>
                      {exam.is_mock_exam && (
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider">
                          Examen Blanc
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-navy-900 mb-2">{exam.title}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {exam.description || 'Testez vos connaissances sur ce sujet avec cet examen complet.'}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {exam.duration_minutes} minutes
                      </div>
                      {exam.isCompleted && (
                        <div className="flex items-center text-emerald-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Terminé {exam.bestScore !== null ? `(Meilleur score : ${exam.bestScore}/20)` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 min-w-[200px]">
                    <Link href={`/mode-examen/session/${exam.id}`} className="w-full">
                      <Button className="w-full">
                        {exam.attemptsCount > 0 ? 'Recommencer' : 'Commencer'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
