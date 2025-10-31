// =============================================
// FILE: src/features/players/components/PlayerWallet.jsx
// Gestione wallet e transazioni del giocatore
// =============================================

import React, { useState } from 'react';
import { uid } from '@lib/ids.js';
import { createTransactionSchema } from '../types/playerTypes.js';
import { useUI } from '@contexts/UIContext.jsx';

export default function PlayerWallet({ player, onUpdate, T }) {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionData, setTransactionData] = useState(createTransactionSchema());
  const { addNotification } = useUI();

  const wallet = player.wallet || {
    balance: 0,
    currency: 'EUR',
    transactions: [],
  };
  const transactions = wallet.transactions || [];

  const handleAddTransaction = () => {
    // Alert specifically when description is missing
    if (!transactionData.description || !transactionData.description.trim()) {
      addNotification({
        type: 'warning',
        title: 'Descrizione mancante',
        message: 'Aggiungi una breve descrizione del movimento prima di continuare.',
      });
      return;
    }

    // Keep amount validation silent for now (scope: only description alert)
    if (!transactionData.amount) return;

    const newTransaction = {
      ...transactionData,
      id: uid(),
      createdAt: new Date().toISOString(),
      createdBy: 'current-user', // In futuro userà l'ID utente corrente
    };

    const newBalance =
      transactionData.type === 'credit'
        ? wallet.balance + Math.abs(transactionData.amount)
        : wallet.balance - Math.abs(transactionData.amount);

    const updatedWallet = {
      ...wallet,
      balance: Math.max(0, newBalance), // Non permettere saldo negativo
      lastUpdate: new Date().toISOString(),
      transactions: [newTransaction, ...transactions],
    };

    onUpdate({
      wallet: updatedWallet,
      updatedAt: new Date().toISOString(),
    });

    setTransactionData(createTransactionSchema());
    setShowAddTransaction(false);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return '💰';
      case 'debit':
        return '💸';
      case 'refund':
        return '↩️';
      case 'bonus':
        return '🎁';
      default:
        return '💱';
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'credit':
        return 'Ricarica';
      case 'debit':
        return 'Addebito';
      case 'refund':
        return 'Rimborso';
      case 'bonus':
        return 'Bonus';
      default:
        return 'Transazione';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'credit':
        return 'text-green-600 text-green-400';
      case 'debit':
        return 'text-red-600 text-red-400';
      case 'refund':
        return 'text-blue-600 text-blue-400';
      case 'bonus':
        return 'text-purple-600 text-purple-400';
      default:
        return T.text;
    }
  };

  const formatAmount = (amount, type) => {
    const sign = type === 'credit' || type === 'refund' || type === 'bonus' ? '+' : '-';
    return `${sign}€${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Hero - Saldo corrente */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 from-green-900/20 via-emerald-900/20 to-teal-900/20 rounded-2xl p-8 border-2 border-green-200 border-green-700 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500" />
        </div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-5xl">💰</span>
            <div className="text-left">
              <div className="text-xs font-bold text-green-900 text-green-200 uppercase tracking-wider">
                Saldo Disponibile
              </div>
              <div className="text-5xl font-black text-green-600 text-green-400">
                €{wallet.balance.toFixed(2)}
              </div>
            </div>
          </div>
          <div className={`text-sm font-semibold ${T.subtext} mb-5`}>Valuta: {wallet.currency}</div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setTransactionData({
                  ...createTransactionSchema(),
                  type: 'credit',
                });
                setShowAddTransaction(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:shadow-lg transition-shadow hover:scale-105 transform"
            >
              <span className="mr-2">�</span>
              Ricarica
            </button>
            <button
              onClick={() => {
                setTransactionData({
                  ...createTransactionSchema(),
                  type: 'debit',
                });
                setShowAddTransaction(true);
              }}
              className="px-6 py-3 bg-white bg-gray-800 text-gray-700 text-gray-300 border-2 border-gray-300 border-gray-600 rounded-xl font-bold hover:shadow-lg transition-shadow hover:scale-105 transform"
            >
              <span className="mr-2">💸</span>
              Addebito
            </button>
          </div>
        </div>
      </div>

      {/* Form aggiunta transazione */}
      {showAddTransaction && (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
          <h4 className={`font-medium ${T.text} mb-4`}>Nuova Transazione</h4>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>Tipo</label>
                <select
                  value={transactionData.type}
                  onChange={(e) =>
                    setTransactionData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className={`${T.input} w-full`}
                >
                  <option value="credit">💰 Ricarica</option>
                  <option value="debit">💸 Addebito</option>
                  <option value="refund">↩️ Rimborso</option>
                  <option value="bonus">🎁 Bonus</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>Importo (€)</label>
                <input
                  type="number"
                  value={transactionData.amount || ''}
                  onChange={(e) =>
                    setTransactionData((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                  className={`${T.input} w-full`}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Descrizione</label>
              <input
                type="text"
                value={transactionData.description}
                onChange={(e) =>
                  setTransactionData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={`${T.input} w-full`}
                placeholder="Descrizione della transazione..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Riferimento (opzionale)
              </label>
              <input
                type="text"
                value={transactionData.reference}
                onChange={(e) =>
                  setTransactionData((prev) => ({
                    ...prev,
                    reference: e.target.value,
                  }))
                }
                className={`${T.input} w-full`}
                placeholder="ID prenotazione, fattura, etc..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddTransaction(false);
                  setTransactionData(createTransactionSchema());
                }}
                className={`${T.btnSecondary} px-4 py-2`}
              >
                Annulla
              </button>
              <button onClick={handleAddTransaction} className={`${T.btnPrimary} px-4 py-2`}>
                Aggiungi Transazione
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiche rapide */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-blue-600 text-blue-400">
            {transactions.length}
          </div>
          <div className={`text-xs ${T.subtext}`}>Transazioni</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-green-600 text-green-400">
            {
              transactions.filter(
                (t) => t.type === 'credit' || t.type === 'refund' || t.type === 'bonus'
              ).length
            }
          </div>
          <div className={`text-xs ${T.subtext}`}>Entrate</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-red-600 text-red-400">
            {transactions.filter((t) => t.type === 'debit').length}
          </div>
          <div className={`text-xs ${T.subtext}`}>Uscite</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className={`text-2xl font-bold ${T.text}`}>
            €
            {transactions
              .reduce((sum, t) => {
                return t.type === 'credit' || t.type === 'refund' || t.type === 'bonus'
                  ? sum + t.amount
                  : sum - t.amount;
              }, 0)
              .toFixed(2)}
          </div>
          <div className={`text-xs ${T.subtext}`}>Totale Movimenti</div>
        </div>
      </div>

      {/* Storico transazioni */}
      <div>
        <h4 className={`font-semibold ${T.text} mb-4`}>
          Storico Transazioni ({transactions.length})
        </h4>

        {transactions.length === 0 ? (
          <div className={`text-center py-8 ${T.cardBg} ${T.border} rounded-xl`}>
            <div className="text-4xl mb-2">💳</div>
            <div className={`${T.subtext} mb-4`}>Nessuna transazione presente</div>
            <button
              onClick={() => {
                setTransactionData({
                  ...createTransactionSchema(),
                  type: 'credit',
                });
                setShowAddTransaction(true);
              }}
              className={`${T.btnPrimary} px-6 py-3`}
            >
              Aggiungi Prima Transazione
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((transaction) => (
                <div key={transaction.id} className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${T.text}`}>{transaction.description}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 bg-gray-700 ${T.subtext}`}
                          >
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 text-gray-400">
                          <span>
                            📅 {new Date(transaction.createdAt).toLocaleDateString('it-IT')}
                          </span>
                          {transaction.reference && <span>🔗 {transaction.reference}</span>}
                          <span>👤 {transaction.createdBy || 'Sistema'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
