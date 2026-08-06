import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Exercice | Le Major',
  description: "Détail de l'exercice",
};

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug } = await params;
  
  const subjectName = slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ');

  // Mock data
  const exercise = {
    title: 'Cas pratique n°1 : Application directe',
    difficulty: 'Moyen',
    points: 15,
    statement: `
### Énoncé

Une entreprise produit un bien avec un coût fixe de 10 000 € et un coût variable unitaire de 5 €.
Le prix de vente sur le marché est fixé à 15 €.

**Travail à faire :**
1. Calculez le seuil de rentabilité en volume.
2. Déterminez le résultat pour une vente de 1 500 unités.
    `,
    correction: `
### Correction détaillée

**1. Calcul du seuil de rentabilité**
- Marge sur Coût Variable (MCV) unitaire = Prix de vente - Coût Variable unitaire
- MCV = 15 - 5 = 10 €
- Seuil de rentabilité (volume) = Coûts Fixes / MCV unitaire
- SR = 10 000 / 10 = **1 000 unités**

L'entreprise doit vendre 1 000 unités pour atteindre son point mort.

**2. Résultat pour 1 500 unités**
- Chiffre d'affaires = 1 500 * 15 = 22 500 €
- Coûts Variables = 1 500 * 5 = 7 500 €
- Marge sur Coût Variable globale = 22 500 - 7 500 = 15 000 €
- Résultat = MCV globale - Coûts Fixes = 15 000 - 10 000 = **5 000 €**
    `
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 mb-2">
        <Link href={`/matieres/${slug}`} className="hover:text-navy-700 transition-colors flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Retour à {subjectName}
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <h1 className="font-display text-3xl text-navy-900">{exercise.title}</h1>
          <div className="flex gap-3">
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
              {exercise.difficulty}
            </Badge>
            <span className="text-sm font-medium text-gold-600 px-3 py-1 bg-gold-50 rounded-full">
              {exercise.points} pts
            </span>
          </div>
        </div>
      </div>

      <Card className="rounded-card border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-8">
          <div className="prose prose-slate max-w-none mb-8">
            <h3 className="text-xl font-display text-navy-900 mb-4 border-b pb-2">Énoncé</h3>
            <p className="text-gray-700 leading-relaxed">
              Une entreprise produit un bien avec un coût fixe de 10 000 € et un coût variable unitaire de 5 €.<br/>
              Le prix de vente sur le marché est fixé à 15 €.
            </p>
            <p className="font-medium mt-4">Travail à faire :</p>
            <ol>
              <li>Calculez le seuil de rentabilité en volume.</li>
              <li>Déterminez le résultat pour une vente de 1 500 unités.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Progressive disclosure using HTML5 details/summary */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer list-none justify-center py-4 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors font-medium">
          <CheckCircle className="w-5 h-5" />
          <span>Voir la correction</span>
        </summary>
        
        <Card className="rounded-card border border-emerald-100 bg-emerald-50/30 shadow-sm mt-6">
          <CardContent className="p-8">
            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-display text-emerald-800 mb-4 border-b border-emerald-200 pb-2">Correction détaillée</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-navy-900">1. Calcul du seuil de rentabilité</h4>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>Marge sur Coût Variable (MCV) unitaire = Prix de vente - Coût Variable unitaire</li>
                    <li>MCV = 15 - 5 = 10 €</li>
                    <li>Seuil de rentabilité (volume) = Coûts Fixes / MCV unitaire</li>
                    <li>SR = 10 000 / 10 = <span className="font-bold text-emerald-700">1 000 unités</span></li>
                  </ul>
                  <p className="text-gray-600 italic mt-2">L'entreprise doit vendre 1 000 unités pour atteindre son point mort.</p>
                </div>

                <div>
                  <h4 className="font-medium text-navy-900">2. Résultat pour 1 500 unités</h4>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>Chiffre d'affaires = 1 500 * 15 = 22 500 €</li>
                    <li>Coûts Variables = 1 500 * 5 = 7 500 €</li>
                    <li>Marge sur Coût Variable globale = 22 500 - 7 500 = 15 000 €</li>
                    <li>Résultat = MCV globale - Coûts Fixes = 15 000 - 10 000 = <span className="font-bold text-emerald-700">5 000 €</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </details>
    </div>
  );
}
