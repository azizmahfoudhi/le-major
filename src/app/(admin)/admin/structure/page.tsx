'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, Folder, FolderOpen, Book, BookOpen } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { getAcademicTree, TreeNode, createStructureNode, updateStructureNode, deleteStructureNode } from '../../actions/admin';

function getChildType(type: string) {
  switch (type) {
    case 'Université': return 'Formation';
    case 'Formation': return 'Niveau';
    case 'Niveau': return 'Édition';
    case 'Édition': return 'Semestre';
    case 'Semestre': return 'Matière';
    case 'Matière': return 'Chapitre';
    default: return null;
  }
}

function TreeItem({ 
  node, 
  level = 0, 
  onAdd, 
  onEdit, 
  onDelete 
}: { 
  node: TreeNode; 
  level?: number;
  onAdd: (parentId: string, type: string) => void;
  onEdit: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
}) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const childType = getChildType(node.type);

  return (
    <div>
      <div 
        className="flex items-center group py-2 hover:bg-gray-50 rounded-md px-2 transition-colors cursor-pointer"
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-5 h-5 flex items-center justify-center mr-1">
          {hasChildren ? (
            isOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <span className="w-4 h-4" />
          )}
        </div>
        
        <div className="flex items-center space-x-2 flex-1">
          {node.type === 'Matière' ? (
            <Book className="h-4 w-4 text-blue-500" />
          ) : node.type === 'Chapitre' ? (
            <BookOpen className="h-4 w-4 text-emerald-500" />
          ) : isOpen && hasChildren ? (
            <FolderOpen className="h-4 w-4 text-gold-500" />
          ) : (
            <Folder className="h-4 w-4 text-gold-500" />
          )}
          <span className="font-medium text-navy-900">{node.name}</span>
          <span className="text-xs text-gray-400 font-normal px-2 py-0.5 bg-gray-100 rounded-full">
            {node.type}
          </span>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {childType && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-navy-900" onClick={(e) => { e.stopPropagation(); onAdd(node.id, childType); }}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-navy-900" onClick={(e) => { e.stopPropagation(); onEdit(node); }}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-rose-600" onClick={(e) => { e.stopPropagation(); onDelete(node); }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StructureManager() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [addModal, setAddModal] = useState<{ open: boolean; parentId: string; type: string }>({ open: false, parentId: '', type: '' });
  const [editModal, setEditModal] = useState<{ open: boolean; node: TreeNode | null }>({ open: false, node: null });
  const [nameInput, setNameInput] = useState('');

  const loadTree = () => {
    setIsLoading(true);
    getAcademicTree()
      .then(data => {
        setTree(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadTree();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createStructureNode(addModal.type, addModal.parentId, nameInput);
      setAddModal({ open: false, parentId: '', type: '' });
      setNameInput('');
      loadTree();
    } catch {
      alert("Erreur lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editModal.node) {
        await updateStructureNode(editModal.node.type, editModal.node.id, nameInput);
        setEditModal({ open: false, node: null });
        setNameInput('');
        loadTree();
      }
    } catch {
      alert("Erreur lors de la modification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (node: TreeNode) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce nœud (${node.type}: ${node.name}) ? Cela supprimera également tous les enfants.`)) {
      try {
        await deleteStructureNode(node.type, node.id);
        loadTree();
      } catch {
        alert("Erreur lors de la suppression. Des données liées existent peut-être.");
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Structure Académique</h1>
          <p className="text-gray-500 mt-1">Gérez les universités, formations, niveaux et matières.</p>
        </div>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement de la structure...</div>
        ) : tree.length === 0 ? (
          <div className="p-8 text-center text-gray-500">La base de données est vide. Utilisez les scripts SQL pour initialiser la structure.</div>
        ) : (
          <div className="space-y-1">
            {tree.map((node) => (
              <TreeItem 
                key={node.id} 
                node={node} 
                onAdd={(parentId, type) => { setAddModal({ open: true, parentId, type }); setNameInput(''); }}
                onEdit={(n) => { setEditModal({ open: true, node: n }); setNameInput(n.name); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Card>

      {addModal.open && (
        <div className="fixed inset-0 bg-navy-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy-900">Nouveau {addModal.type}</h2>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <Input required value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddModal({ open: false, parentId: '', type: '' })}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Chargement...' : 'Créer'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal.open && (
        <div className="fixed inset-0 bg-navy-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy-900">Modifier {editModal.node?.type}</h2>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <Input required value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditModal({ open: false, node: null })}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Chargement...' : 'Enregistrer'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
