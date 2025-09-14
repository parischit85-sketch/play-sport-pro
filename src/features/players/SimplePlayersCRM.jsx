// Versione semplificata per il debug
import React, { useState } from "react";

export default function SimplePlayersCRM({ T, state, setState }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const players = Array.isArray(state?.players) ? state.players : [];

  const handleAddPlayer = () => {
    console.log("Add player clicked");
    setShowForm(true);
  };

  const handlePlayerClick = (player) => {
    console.log("Player clicked:", player);
    setSelectedPlayer(player);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${T?.text || "text-gray-900"}`}>
          CRM Giocatori ({players.length})
        </h1>

        <button
          onClick={handleAddPlayer}
          className={`${T?.btnPrimary || "bg-blue-500 hover:bg-blue-600 text-white"} px-6 py-3 rounded-lg`}
        >
          + Aggiungi Giocatore
        </button>
      </div>

      {/* Lista semplificata */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.length === 0 ? (
          <div
            className={`${T?.cardBg || "bg-white"} ${T?.border || "border"} rounded-xl p-6 col-span-full text-center`}
          >
            <div className="text-4xl mb-4">👥</div>
            <h3
              className={`text-lg font-semibold ${T?.text || "text-gray-900"} mb-2`}
            >
              Nessun giocatore presente
            </h3>
            <p className={`${T?.subtext || "text-gray-600"} mb-4`}>
              Inizia aggiungendo il primo giocatore al sistema CRM
            </p>
            <button
              onClick={handleAddPlayer}
              className={`${T?.btnPrimary || "bg-blue-500 hover:bg-blue-600 text-white"} px-6 py-3 rounded-lg`}
            >
              Aggiungi Primo Giocatore
            </button>
          </div>
        ) : (
          players.map((player) => (
            <div
              key={player.id}
              className={`${T?.cardBg || "bg-white"} ${T?.border || "border"} rounded-xl p-4`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {player.name?.charAt(0).toUpperCase() || "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold ${T?.text || "text-gray-900"} truncate`}
                  >
                    {player.name ||
                      `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
                      "Senza nome"}
                  </h3>
                  <p
                    className={`text-sm ${T?.subtext || "text-gray-600"} truncate`}
                  >
                    {player.email || "Nessuna email"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePlayerClick(player)}
                  className={`${T?.btnSecondary || "bg-gray-200 hover:bg-gray-300"} flex-1 py-2 rounded text-sm`}
                >
                  👁️ Dettagli
                </button>

                <button
                  onClick={() => {
                    console.log("Edit player:", player);
                    alert(`Modifica: ${player.name}`);
                  }}
                  className={`${T?.btnSecondary || "bg-gray-200 hover:bg-gray-300"} px-3 py-2 rounded text-sm`}
                >
                  ✏️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal semplice per form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${T?.cardBg || "bg-white"} rounded-xl w-full max-w-md p-6`}
          >
            <h2
              className={`text-xl font-bold ${T?.text || "text-gray-900"} mb-4`}
            >
              Aggiungi Nuovo Giocatore
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome completo"
                className={`${T?.input || "border rounded-lg px-3 py-2"} w-full`}
              />
              <input
                type="email"
                placeholder="Email"
                className={`${T?.input || "border rounded-lg px-3 py-2"} w-full`}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  // Qui aggiungeremo la logica per salvare
                  console.log("Save new player");
                  setShowForm(false);
                }}
                className={`${T?.btnPrimary || "bg-blue-500 hover:bg-blue-600 text-white"} flex-1 py-2 rounded`}
              >
                Salva
              </button>
              <button
                onClick={() => setShowForm(false)}
                className={`${T?.btnSecondary || "bg-gray-200 hover:bg-gray-300"} px-6 py-2 rounded`}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal dettagli */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${T?.cardBg || "bg-white"} rounded-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto`}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className={`text-xl font-bold ${T?.text || "text-gray-900"}`}>
                Dettagli Giocatore
              </h2>
              <button
                onClick={() => setSelectedPlayer(null)}
                className={`${T?.btnSecondary || "bg-gray-200 hover:bg-gray-300"} px-3 py-1 rounded text-sm`}
              >
                ✖️
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <strong>Nome:</strong> {selectedPlayer.name || "N/A"}
              </div>
              <div>
                <strong>Email:</strong> {selectedPlayer.email || "N/A"}
              </div>
              <div>
                <strong>Telefono:</strong> {selectedPlayer.phone || "N/A"}
              </div>
              <div>
                <strong>Categoria:</strong> {selectedPlayer.category || "N/A"}
              </div>
              <div>
                <strong>Rating:</strong> {selectedPlayer.rating || "N/A"}
              </div>
              <div>
                <strong>Wallet:</strong> €{selectedPlayer.wallet?.balance || 0}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
