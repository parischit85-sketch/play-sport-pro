/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase.js';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  Flag,
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Percent,
} from 'lucide-react';

const FeatureFlags = () => {
  const navigate = useNavigate();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFlag, setEditingFlag] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'feature_flags'));
      const flagsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlags(flagsData);
    } catch (error) {
      console.error('Errore caricamento feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlag = async (flagData) => {
    try {
      if (editingFlag) {
        await updateDoc(doc(db, 'feature_flags', editingFlag.id), flagData);
      } else {
        const newFlagId = flagData.key.toLowerCase().replace(/\s+/g, '_');
        await setDoc(doc(db, 'feature_flags', newFlagId), {
          ...flagData,
          createdAt: new Date(),
        });
      }
      setShowForm(false);
      setEditingFlag(null);
      loadFlags();
    } catch (error) {
      console.error('Errore salvataggio flag:', error);
      alert('Errore durante il salvataggio');
    }
  };

  const handleToggleFlag = async (flag) => {
    try {
      await updateDoc(doc(db, 'feature_flags', flag.id), {
        enabled: !flag.enabled,
      });
      loadFlags();
    } catch (error) {
      console.error('Errore toggle flag:', error);
    }
  };

  const handleDeleteFlag = async (flagId) => {
    if (!window.confirm('Confermi di voler eliminare questo feature flag?')) return;
    
    try {
      await deleteDoc(doc(db, 'feature_flags', flagId));
      loadFlags();
    } catch (error) {
      console.error('Errore eliminazione flag:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Flag className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Feature Flags</h1>
            </div>
            <button
              onClick={() => {
                setEditingFlag(null);
                setShowForm(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Flag</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {flags.map((flag) => (
              <div key={flag.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{flag.name}</h3>
                      <button
                        onClick={() => handleToggleFlag(flag)}
                        className={`p-1 rounded-lg transition-colors ${
                          flag.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {flag.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                      {flag.key}
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingFlag(flag);
                        setShowForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFlag(flag.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Stato:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {flag.enabled ? 'Attivo' : 'Disattivo'}
                    </span>
                  </div>

                  {flag.rolloutPercentage && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rollout:</span>
                      <div className="flex items-center space-x-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{flag.rolloutPercentage}%</span>
                      </div>
                    </div>
                  )}

                  {flag.targetClubs && flag.targetClubs.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Circoli target:</span>
                      <span className="font-medium">{flag.targetClubs.length}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <FeatureFlagForm
            flag={editingFlag}
            onSave={handleSaveFlag}
            onCancel={() => {
              setShowForm(false);
              setEditingFlag(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

const FeatureFlagForm = ({ flag, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    key: flag?.key || '',
    name: flag?.name || '',
    description: flag?.description || '',
    enabled: flag?.enabled || false,
    rolloutPercentage: flag?.rolloutPercentage || 100,
    targetClubs: flag?.targetClubs || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {flag ? 'Modifica Feature Flag' : 'Nuovo Feature Flag'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chiave (identificatore unico) *
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="new_tournament_flow"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nuovo flusso tornei"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Attivo</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rollout Percentuale (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.rolloutPercentage}
              onChange={(e) =>
                setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeatureFlags;
