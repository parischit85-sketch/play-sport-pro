// =============================================
// FILE: src/features/players/components/PlayerCard.jsx
// Card per visualizzare i giocatori nella lista CRM
// =============================================

import React from "react";
import { DEFAULT_RATING } from "@lib/ids.js";
import { PLAYER_CATEGORIES } from "../types/playerTypes.js";

export default function PlayerCard({
  player,
  playersById,
  onEdit,
  onDelete,
  onView,
  onStats,
  T,
}) {
  const liveRating =
    playersById?.[player.id]?.rating ?? player.rating ?? DEFAULT_RATING;

  // Categorie con colori
  const getCategoryStyle = (category) => {
    switch (category) {
      case PLAYER_CATEGORIES.MEMBER:
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case PLAYER_CATEGORIES.VIP:
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
      case PLAYER_CATEGORIES.GUEST:
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case PLAYER_CATEGORIES.MEMBER:
        return "Membro";
      case PLAYER_CATEGORIES.VIP:
        return "VIP";
      case PLAYER_CATEGORIES.GUEST:
        return "Ospite";
      case PLAYER_CATEGORIES.NON_MEMBER:
        return "Non Membro";
      default:
        return "N/A";
    }
  };

  const formatLastActivity = (date) => {
    if (!date) return "Mai";
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Oggi";
    if (days === 1) return "Ieri";
    if (days < 7) return `${days} giorni fa`;
    if (days < 30) return `${Math.floor(days / 7)} settimane fa`;
    return `${Math.floor(days / 30)} mesi fa`;
  };

  const subscription = player.subscriptions?.[player.subscriptions?.length - 1];
  const bookingsCount = player.bookingHistory?.length || 0;
  const notesCount = player.notes?.length || 0;
  const tags = player.tags || [];
  const joinedAt = player.createdAt
    ? new Date(player.createdAt).toLocaleDateString("it-IT")
    : null;

  return (
    <div
      className={`${T.cardBg} ${T.border} rounded-xl p-4 lg:p-3 xl:p-3 hover:shadow-md transition-shadow relative overflow-hidden h-full`}
    >
      {/* Desktop layout */}
      <div className="hidden lg:flex flex-col gap-2">
        {/* Row 1 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Avatar e info base */}
          <div className="flex items-center gap-3 flex-[2_2_320px] min-w-[280px]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {player.name ? player.name.charAt(0).toUpperCase() : "?"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={onView}
                  className="font-semibold text-lg hover:opacity-80 transition truncate"
                >
                  {player.name ||
                    `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
                    "Nome non disponibile"}
                </button>

                {player.isAccountLinked && (
                  <span
                    className="text-green-500 text-sm"
                    title="Account collegato"
                  >
                    🔗
                  </span>
                )}

                {!player.isActive && (
                  <span className="text-red-500 text-sm" title="Inattivo">
                    ⏸️
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 min-w-0">
                <span className="truncate max-w-[240px]">
                  {player.email || "Email non disponibile"}
                </span>
                {player.phone && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[140px]">
                      {player.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Categoria + Abbonamento */}
          <div className="flex flex-col items-start gap-1 min-w-[140px]">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(player.category)}`}
            >
              {getCategoryLabel(player.category)}
            </span>
            {subscription ? (
              <span
                className="text-[11px] text-green-700 dark:text-green-300"
                title={`Scadenza: ${subscription.endDate ? new Date(subscription.endDate).toLocaleDateString("it-IT") : "N/D"}`}
              >
                {subscription.type || "Abbonamento"}
              </span>
            ) : (
              <span className={`text-[11px] ${T.subtext}`}>
                Nessun abbonamento
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="text-center w-[84px] shrink-0">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Number(liveRating).toFixed(0)}
            </div>
            <div className={`text-xs ${T.subtext}`}>Rating</div>
          </div>

          {/* Wallet */}
          <div className="text-center w-[110px] shrink-0">
            <div className="font-semibold text-green-600 dark:text-green-400">
              €{(player.wallet?.balance || 0).toFixed(2)}
            </div>
            <div className={`text-xs ${T.subtext}`}>Credito</div>
          </div>

          {/* Ultima attività + Prenotazioni */}
          <div className="text-center min-w-[120px]">
            <div className="text-sm font-medium">
              {formatLastActivity(player.lastActivity)}
            </div>
            <div className={`text-xs ${T.subtext}`}>Ultima attività</div>
            <div className="text-xs mt-1">📅 {bookingsCount} prenot.</div>
          </div>

          {/* Note e Tag */}
          <div className="min-w-[220px] flex-1">
            <div className="flex items-center gap-2 text-xs mb-1">
              <span
                className={`${notesCount > 0 ? "text-orange-600 dark:text-orange-400" : T.subtext}`}
              >
                📝 {notesCount} note
              </span>
              <span
                className={`${tags.length > 0 ? "text-blue-600 dark:text-blue-400" : T.subtext}`}
              >
                🏷️ {tags.length} tag
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-[11px] break-words max-w-[10rem]"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className={`text-[11px] ${T.subtext}`}>
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Azioni */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onView}
              className={`${T.btnSecondary} px-3 py-1 text-sm`}
              title="Visualizza dettagli"
            >
              👁️
            </button>
            <button
              onClick={onEdit}
              className={`${T.btnSecondary} px-3 py-1 text-sm`}
              title="Modifica"
            >
              ✏️
            </button>
            <button
              onClick={onStats}
              className={`${T.btnSecondary} px-3 py-1 text-sm`}
              title="Statistiche"
            >
              📊
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Elimina"
            >
              🗑️
            </button>
          </div>
        </div>
        {/* Row 2: email/phone + note/tag + azioni compact se necessario */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 min-w-[300px] max-w-[600px] truncate">
            {player.email || "Email non disponibile"}
            {player.phone ? ` • ${player.phone}` : ""}
          </div>
          <div className="text-xs ${T.subtext}">
            📝 {notesCount} note • 🏷️ {tags.length} tag
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {player.name ? player.name.charAt(0).toUpperCase() : "?"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={onView}
                className="font-semibold text-lg hover:opacity-80 transition truncate"
              >
                {player.name ||
                  `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
                  "Nome non disponibile"}
              </button>

              {player.isAccountLinked && (
                <span
                  className="text-green-500 text-sm"
                  title="Account collegato"
                >
                  🔗
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 break-words">
              {player.email || "Email non disponibile"}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(player.category)}`}
              >
                {getCategoryLabel(player.category)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {Number(liveRating).toFixed(0)}
            </div>
            <div className={`text-xs ${T.subtext}`}>Rating</div>
          </div>
        </div>

        {/* Stats row mobile */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              €{(player.wallet?.balance || 0).toFixed(2)}
            </div>
            <div className={`text-xs ${T.subtext}`}>Credito</div>
          </div>
          <div>
            <div className="text-sm font-medium">
              {formatLastActivity(player.lastActivity)}
            </div>
            <div className={`text-xs ${T.subtext}`}>Ultima attività</div>
          </div>
        </div>

        {/* Extra info mobile */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="text-left">
            <div className={`${T.subtext}`}>Prenotazioni</div>
            <div>📅 {bookingsCount}</div>
          </div>
          <div className="text-left">
            <div className={`${T.subtext}`}>Note / Tag</div>
            <div>
              📝 {notesCount} / 🏷️ {tags.length}
            </div>
          </div>
        </div>

        {/* Azioni mobile */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className={`${T.btnSecondary} flex-1 py-2 text-sm`}
          >
            👁️ Dettagli
          </button>
          <button
            onClick={onStats}
            className={`${T.btnSecondary} flex-1 py-2 text-sm`}
          >
            📊 Stats
          </button>
          <button
            onClick={onEdit}
            className={`${T.btnSecondary} px-4 py-2 text-sm`}
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
