'use client';

import React from 'react';
import { Users, Key, FileText, Brain, ArrowUpRight, Clock } from 'lucide-react';
import { Card } from '@/components/ui';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total étudiants', value: '1,240', icon: Users, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Codes activés', value: '890', icon: Key, trend: '+5%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Contenus publiés', value: '456', icon: FileText, trend: '+18%', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Exercices', value: '1,092', icon: Brain, trend: '+24%', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const activities = [
    { id: 1, user: 'Ahmed Ben Ali', action: 'a activé le Pack Gold', time: 'Il y a 5 min' },
    { id: 2, user: 'Sarah Mansour', action: 'a terminé l\'examen Blanc', time: 'Il y a 12 min' },
    { id: 3, user: 'Admin', action: 'a publié un nouveau résumé "Analyse S2"', time: 'Il y a 1 heure' },
    { id: 4, user: 'Youssef Trabelsi', action: 's\'est inscrit', time: 'Il y a 2 heures' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-playfair">Tableau de Bord</h1>
        <p className="text-gray-500 mt-1">Bienvenue dans l'espace d'administration Le Major.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {stat.trend}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Activité des utilisateurs (7 derniers jours)</h2>
          <div className="h-64 flex items-end space-x-2">
            {/* Simple CSS Bar Chart */}
            {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div 
                  className="w-full bg-navy-100 group-hover:bg-gold-400 transition-colors rounded-t-sm" 
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-400 mt-2">Jour {i+1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Activité récente</h2>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="mt-0.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium text-navy-900">{activity.user}</span>{' '}
                    <span className="text-gray-600">{activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
