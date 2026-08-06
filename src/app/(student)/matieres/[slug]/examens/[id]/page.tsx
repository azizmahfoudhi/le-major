import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, FileText, CheckCircle, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Examen Blanc | Le Major',
  description: "Annales et examens blancs",
};

export default async function ExamPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug } = await params;
  const subjectName = slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ');

  const exam = {
    title: 'Examen Blanc : Synthèse Globale',
    year: '2025',
    session: 'Janvier',
    duration: '3h00',
    type: 'Examen Blanc'
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 mb-2">
        <Link href={`/matieres/${slug}`} className="hover:text-navy-900 transition-colors flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Retour à {subjectName}
        </Link>
      </div>

      <div className="flex flex-col gap-4 bg-navy-900 text-white p-8 rounded-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex gap-2 mb-3">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium uppercase tracking-wider">{exam.type}</span>
            <span className="px-3 py-1 bg-gold-500/20 text-gold-600 rounded-full text-xs font-medium">{subjectName}</span>
          </div>
          <h1 className="font-display text-4xl mb-4">{exam.title}</h1>
          <div className="flex flex-wrap gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-600" />
              Session {exam.session} {exam.year}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-600" />
              Durée conseillée : {exam.duration}
            </div>
          </div>
        </div>
      </div>

      <Card className="rounded-card border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-8 md:p-12">
          <div className="flex items-center gap-2 text-navy-900 font-display text-2xl mb-6 border-b pb-4">
            <FileText className="w-6 h-6 text-gold-600" />
            <h2>Sujet de l'examen</h2>
          </div>
          
          <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-navy-900 mb-12">
            <h3>Dossier 1 : Analyse stratégique (10 points)</h3>
            <p>
              L'entreprise "Alpha" opère sur un marché très concurrentiel. Ses dirigeants souhaitent lancer un nouveau
              produit innovant. Les données du marché sont les suivantes...
            </p>
            <p><strong>Travail à faire :</strong></p>
            <ol>
              <li>Identifiez les forces concurrentielles de Porter pour ce marché.</li>
              <li>Proposez une recommandation stratégique justifiée.</li>
            </ol>

            <h3>Dossier 2 : Évaluation financière (10 points)</h3>
            <p>
              Pour financer ce développement, un investissement de 500 000 € est nécessaire. Les flux nets de trésorerie 
              attendus sur 5 ans sont de 150 000 € par an. Le taux d'actualisation est de 8%.
            </p>
            <p><strong>Travail à faire :</strong></p>
            <ol>
              <li>Calculez la Valeur Actuelle Nette (VAN) du projet.</li>
              <li>Calculez le Taux de Rentabilité Interne (TRI).</li>
              <li>Le projet est-il acceptable ? Justifiez.</li>
            </ol>
          </div>

          <details className="group mt-12">
            <summary className="flex items-center gap-3 cursor-pointer list-none justify-center py-4 border-2 border-navy-900 text-navy-900 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              <CheckCircle className="w-5 h-5" />
              <span>Consulter le corrigé officiel</span>
            </summary>
            
            <div className="mt-8 p-8 rounded-xl bg-gray-50 border border-gray-200">
              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-display text-navy-900 mb-6">Corrigé indicatif</h3>
                
                <h4 className="text-lg text-emerald-800 font-medium">Dossier 1 : Analyse stratégique</h4>
                <p>
                  <strong>1. Forces de Porter :</strong><br/>
                  - Intensité concurrentielle : forte (marché saturé)<br/>
                  - Menace des nouveaux entrants : faible (barrières à l'entrée technologiques élevées)<br/>
                  - Pouvoir de négociation des clients : fort (nombreuses alternatives)
                </p>

                <h4 className="text-lg text-emerald-800 font-medium mt-6">Dossier 2 : Évaluation financière</h4>
                <p>
                  <strong>1. Calcul de la VAN :</strong><br/>
                  VAN = -500 000 + 150 000 * [1 - (1+0.08)^-5] / 0.08<br/>
                  VAN = -500 000 + 150 000 * 3.9927<br/>
                  VAN = -500 000 + 598 905 = <strong>98 905 €</strong>
                </p>
                <p>
                  <strong>3. Conclusion :</strong><br/>
                  La VAN étant positive (98 905 € {'>'} 0), le projet crée de la valeur et est donc financièrement acceptable.
                </p>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
