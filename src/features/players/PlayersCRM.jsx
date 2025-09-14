// =============================================
// FILE: src/features/players/PlayersCRM.jsx
// Sistema CRM completo per la gestione giocatori
// =============================================

import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Section from "@ui/Section.jsx";
import Modal from "@ui/Modal.jsx";
import { uid } from "@lib/ids.js";
import { byPlayerFirstAlpha } from "@lib/names.js";
import { createPlayerSchema, PLAYER_CATEGORIES } from "./types/playerTypes.js";
import PlayerCard from "./components/PlayerCard";
import PlayerForm from "./components/PlayerForm";
import PlayerDetails from "./components/PlayerDetails";
import CRMTools from "./components/CRMTools";
import { useAuth } from "@contexts/AuthContext.jsx";

export default function PlayersCRM({
  state,
  setState,
  onOpenStats,
  playersById,
  T,
}) {
  const { user } = useAuth();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showTools, setShowTools] = useState(false);

  const players = Array.isArray(state?.players) ? state.players : [];

  // Deriva il giocatore selezionato dai dati correnti (si aggiorna live)
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId) return null;
    return players.find((p) => p.id === selectedPlayerId) || null;
  }, [players, selectedPlayerId]);

  // Filtri e ricerca
  const filteredPlayers = useMemo(() => {
    let filtered = [...players];

    // Filtro per categoria
    if (filterCategory !== "all") {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    // Ricerca per nome, email, telefono
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          p.phone?.includes(term) ||
          p.firstName?.toLowerCase().includes(term) ||
          p.lastName?.toLowerCase().includes(term),
      );
    }

    return filtered.sort(byPlayerFirstAlpha);
  }, [players, filterCategory, searchTerm]);

  // Statistiche rapide
  const stats = useMemo(() => {
    const total = players.length;
    const members = players.filter(
      (p) => p.category === PLAYER_CATEGORIES.MEMBER,
    ).length;
    const active = players.filter((p) => p.isActive !== false).length;
    const withAccount = players.filter((p) => p.isAccountLinked).length;

    return { total, members, active, withAccount };
  }, [players]);

  const handleAddPlayer = (playerData) => {
    const newPlayer = {
      ...createPlayerSchema(),
      ...playerData,
      id: uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((s) => {
      const cur = Array.isArray(s?.players) ? s.players : [];
      return {
        ...(s || { players: [], matches: [] }),
        players: [...cur, newPlayer],
      };
    });

    setShowPlayerForm(false);
  };

  const handleUpdatePlayer = (playerId, updates) => {
    setState((s) => {
      const cur = Array.isArray(s?.players) ? s.players : [];
      return {
        ...(s || { players: [], matches: [] }),
        players: cur.map((p) =>
          p.id === playerId
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p,
        ),
      };
    });
  };

  const handleDeletePlayer = (playerId) => {
    if (
      !confirm(
        "Sei sicuro di voler eliminare questo giocatore? Questa azione non può essere annullata.",
      )
    ) {
      return;
    }

    setState((s) => {
      const cur = Array.isArray(s?.players) ? s.players : [];
      return {
        ...(s || { players: [], matches: [] }),
        players: cur.filter((p) => p.id !== playerId),
      };
    });

    setSelectedPlayerId(null);
  };

  const handleCreateFromAccount = () => {
    if (!user) return;

    const playerData = {
      firstName: user.firstName || user.displayName?.split(" ")[0] || "",
      lastName: user.lastName || user.displayName?.split(" ")[1] || "",
      name: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
      email: user.email || "",
      linkedAccountId: user.uid,
      linkedAccountEmail: user.email,
      isAccountLinked: true,
      category: PLAYER_CATEGORIES.MEMBER,
    };

    handleAddPlayer(playerData);
  };

  return (
    <>
      <Section title="CRM Giocatori" T={T}>
        {/* Header con statistiche e azioni */}
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 xl:p-3 mb-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Statistiche */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-3 flex-1">
              <div className="text-center">
                <div className="text-2xl xl:text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <div className={`text-xs ${T.subtext}`}>Totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-xl font-bold text-green-600 dark:text-green-400">
                  {stats.members}
                </div>
                <div className={`text-xs ${T.subtext}`}>Membri</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.active}
                </div>
                <div className={`text-xs ${T.subtext}`}>Attivi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.withAccount}
                </div>
                <div className={`text-xs ${T.subtext}`}>Con Account</div>
              </div>
            </div>

            {/* Azioni principali */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowPlayerForm(true)}
                className={`${T.btnPrimary} px-4 py-2 text-sm`}
              >
                ➕ Nuovo Giocatore
              </button>
              <button
                onClick={handleCreateFromAccount}
                disabled={!user}
                className={`${T.btnSecondary} px-4 py-2 text-sm`}
              >
                👤 Crea da Account
              </button>
              <button
                onClick={() => setShowTools(true)}
                className={`${T.btnSecondary} px-4 py-2 text-sm`}
              >
                🛠️ Strumenti
              </button>
            </div>
          </div>
        </div>

        {/* Filtri e ricerca */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cerca per nome, email, telefono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${T.input} w-full`}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`${T.input} min-w-[150px]`}
            >
              <option value="all">Tutte le categorie</option>
              <option value={PLAYER_CATEGORIES.MEMBER}>Membri</option>
              <option value={PLAYER_CATEGORIES.NON_MEMBER}>Non Membri</option>
              <option value={PLAYER_CATEGORIES.GUEST}>Ospiti</option>
              <option value={PLAYER_CATEGORIES.VIP}>VIP</option>
            </select>
          </div>
        </div>

        {/* Lista giocatori */}
        <div className="space-y-4">
          {filteredPlayers.length === 0 ? (
            <div
              className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl`}
            >
              <div className="text-6xl mb-4">👥</div>
              <h3 className={`text-xl font-bold mb-2 ${T.text}`}>
                Nessun giocatore trovato
              </h3>
              <p className={`${T.subtext} mb-4`}>
                {searchTerm || filterCategory !== "all"
                  ? "Prova a modificare i filtri di ricerca"
                  : "Inizia aggiungendo il primo giocatore al tuo CRM"}
              </p>
              <button
                onClick={() => setShowPlayerForm(true)}
                className={`${T.btnPrimary} px-6 py-3`}
              >
                ➕ Aggiungi Primo Giocatore
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [@media(min-width:2200px)]:grid-cols-5 items-stretch">
              {filteredPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  playersById={playersById}
                  onEdit={() => {
                    setEditingPlayer(player);
                    setShowPlayerForm(true);
                  }}
                  onDelete={() => handleDeletePlayer(player.id)}
                  onView={() => setSelectedPlayerId(player.id)}
                  onStats={() => onOpenStats?.(player.id)}
                  T={T}
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Modal dettagli giocatore */}
      {selectedPlayer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPlayerId(null)}
          title={`${selectedPlayer.name || "Giocatore"} - Dettagli`}
          size="large"
        >
          <PlayerDetails
            player={selectedPlayer}
            onUpdate={(updates) =>
              handleUpdatePlayer(selectedPlayer.id, updates)
            }
            onClose={() => setSelectedPlayerId(null)}
            T={T}
          />
        </Modal>
      )}

      {/* Modal form giocatore */}
      {showPlayerForm && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowPlayerForm(false);
            setEditingPlayer(null);
          }}
          title={editingPlayer ? "Modifica Giocatore" : "Nuovo Giocatore"}
          size="large"
        >
          <PlayerForm
            player={editingPlayer}
            onSave={
              editingPlayer
                ? (updates) => {
                    handleUpdatePlayer(editingPlayer.id, updates);
                    setShowPlayerForm(false);
                    setEditingPlayer(null);
                  }
                : handleAddPlayer
            }
            onCancel={() => {
              setShowPlayerForm(false);
              setEditingPlayer(null);
            }}
            T={T}
          />
        </Modal>
      )}

      {/* Modal strumenti CRM */}
      {showTools && (
        <Modal
          isOpen={true}
          onClose={() => setShowTools(false)}
          title="Strumenti CRM"
          size="large"
        >
          <CRMTools
            players={players}
            onClose={() => setShowTools(false)}
            onBulkOperation={(action) => {
              // Implementa le operazioni bulk
              console.log("Bulk operation:", action);
            }}
            onRefreshData={() => {
              // Refresh data se necessario
              console.log("Refreshing data...");
            }}
            T={T}
          />
        </Modal>
      )}
    </>
  );
}
