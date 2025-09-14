// =============================================
// FILE: src/features/players/components/PlayerForm.jsx
// Form per creare/modificare giocatori nel CRM
// =============================================

import React, { useState, useEffect } from "react";
import { createPlayerSchema, PLAYER_CATEGORIES } from "../types/playerTypes.js";
import { DEFAULT_RATING } from "@lib/ids.js";

export default function PlayerForm({ player, onSave, onCancel, T }) {
  const [formData, setFormData] = useState(createPlayerSchema());
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (player) {
      setFormData({ ...createPlayerSchema(), ...player });
    }
  }, [player]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      let newData;

      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        newData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      } else {
        newData = { ...prev, [field]: value };
      }

      // Initialize instructor data when category is set to INSTRUCTOR
      if (
        field === "category" &&
        value === PLAYER_CATEGORIES.INSTRUCTOR &&
        !newData.instructorData?.isInstructor
      ) {
        newData.instructorData = {
          isInstructor: true,
          color: "#3B82F6",
          specialties: [],
          hourlyRate: 0,
          bio: "",
          certifications: [],
          ...newData.instructorData,
        };
      }

      // Clear instructor data when category is changed from INSTRUCTOR
      if (
        field === "category" &&
        value !== PLAYER_CATEGORIES.INSTRUCTOR &&
        prev.category === PLAYER_CATEGORIES.INSTRUCTOR
      ) {
        newData.instructorData = {
          ...newData.instructorData,
          isInstructor: false,
        };
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "Nome richiesto";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Cognome richiesto";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email non valida";
    }
    if (formData.phone && !/^[\d\s+\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Numero di telefono non valido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const playerData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      baseRating: Number(formData.baseRating) || DEFAULT_RATING,
      rating: Number(formData.rating) || formData.baseRating || DEFAULT_RATING,
    };

    onSave(playerData);
  };

  const tabs = [
    { id: "basic", label: "📝 Dati Base", icon: "📝" },
    { id: "contact", label: "📞 Contatti", icon: "📞" },
    { id: "sports", label: "🏃 Sport", icon: "🏃" },
    ...(formData.category === PLAYER_CATEGORIES.INSTRUCTOR
      ? [{ id: "instructor", label: "👨‍🏫 Istruttore", icon: "👨‍🏫" }]
      : []),
    { id: "wallet", label: "💰 Wallet", icon: "💰" },
    { id: "preferences", label: "⚙️ Preferenze", icon: "⚙️" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-lg">{tab.icon}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Dati Base */}
        {activeTab === "basic" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className={`${T.input} w-full ${errors.firstName ? "border-red-500" : ""}`}
                  placeholder="Nome del giocatore"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>
                  Cognome *
                </label>
                <input
                  type="text"
                  value={formData.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className={`${T.input} w-full ${errors.lastName ? "border-red-500" : ""}`}
                  placeholder="Cognome del giocatore"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Data di Nascita
              </label>
              <input
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className={`${T.input} w-full`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Codice Fiscale
              </label>
              <input
                type="text"
                value={formData.fiscalCode || ""}
                onChange={(e) =>
                  handleChange("fiscalCode", e.target.value.toUpperCase())
                }
                className={`${T.input} w-full`}
                placeholder="RSSMRA80A01H501U"
                maxLength={16}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Categoria
              </label>
              <select
                value={formData.category || PLAYER_CATEGORIES.NON_MEMBER}
                onChange={(e) => handleChange("category", e.target.value)}
                className={`${T.input} w-full`}
              >
                <option value={PLAYER_CATEGORIES.NON_MEMBER}>Non Membro</option>
                <option value={PLAYER_CATEGORIES.MEMBER}>Membro</option>
                <option value={PLAYER_CATEGORIES.GUEST}>Ospite</option>
                <option value={PLAYER_CATEGORIES.VIP}>VIP</option>
                <option value={PLAYER_CATEGORIES.INSTRUCTOR}>Istruttore</option>
              </select>
            </div>
          </div>
        )}

        {/* Contatti */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Email
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`${T.input} w-full ${errors.email ? "border-red-500" : ""}`}
                placeholder="email@esempio.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Telefono
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`${T.input} w-full ${errors.phone ? "border-red-500" : ""}`}
                placeholder="+39 123 456 7890"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className={`font-medium ${T.text}`}>Indirizzo</h4>

              <input
                type="text"
                value={formData.address?.street || ""}
                onChange={(e) => handleChange("address.street", e.target.value)}
                className={`${T.input} w-full`}
                placeholder="Via, numero civico"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.address?.city || ""}
                  onChange={(e) => handleChange("address.city", e.target.value)}
                  className={`${T.input} w-full`}
                  placeholder="Città"
                />
                <input
                  type="text"
                  value={formData.address?.province || ""}
                  onChange={(e) =>
                    handleChange("address.province", e.target.value)
                  }
                  className={`${T.input} w-full`}
                  placeholder="Provincia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.address?.postalCode || ""}
                  onChange={(e) =>
                    handleChange("address.postalCode", e.target.value)
                  }
                  className={`${T.input} w-full`}
                  placeholder="CAP"
                />
                <input
                  type="text"
                  value={formData.address?.country || "Italia"}
                  onChange={(e) =>
                    handleChange("address.country", e.target.value)
                  }
                  className={`${T.input} w-full`}
                  placeholder="Paese"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dati Sportivi */}
        {activeTab === "sports" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>
                  Rating Base
                </label>
                <input
                  type="number"
                  value={formData.baseRating || DEFAULT_RATING}
                  onChange={(e) =>
                    handleChange("baseRating", Number(e.target.value))
                  }
                  className={`${T.input} w-full`}
                  min="0"
                  max="3000"
                  step="10"
                />
                <p className={`text-xs ${T.subtext} mt-1`}>
                  Rating iniziale del giocatore (default: {DEFAULT_RATING})
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>
                  Rating Corrente
                </label>
                <input
                  type="number"
                  value={
                    formData.rating || formData.baseRating || DEFAULT_RATING
                  }
                  onChange={(e) =>
                    handleChange("rating", Number(e.target.value))
                  }
                  className={`${T.input} w-full`}
                  min="0"
                  max="3000"
                  step="10"
                />
                <p className={`text-xs ${T.subtext} mt-1`}>
                  Rating attuale (aggiornato automaticamente dai match)
                </p>
              </div>
            </div>

            <div>
              <label className={`flex items-center gap-2 ${T.text}`}>
                <input
                  type="checkbox"
                  checked={formData.isActive !== false}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="rounded"
                />
                Giocatore attivo
              </label>
              <p className={`text-xs ${T.subtext} mt-1`}>
                I giocatori inattivi non appaiono nelle selezioni per i match
              </p>
            </div>
          </div>
        )}

        {/* Configurazione Istruttore */}
        {activeTab === "instructor" &&
          formData.category === PLAYER_CATEGORIES.INSTRUCTOR && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${T.text} mb-1`}>
                    Tariffa Oraria (€)
                  </label>
                  <input
                    type="number"
                    value={formData.instructorData?.hourlyRate || 0}
                    onChange={(e) =>
                      handleChange(
                        "instructorData.hourlyRate",
                        Number(e.target.value),
                      )
                    }
                    className={`${T.input} w-full`}
                    min="0"
                    step="5"
                    placeholder="es. 50"
                  />
                  <p className={`text-xs ${T.subtext} mt-1`}>
                    Tariffa oraria per le lezioni
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${T.text} mb-1`}>
                    Colore Identificativo
                  </label>
                  <input
                    type="color"
                    value={formData.instructorData?.color || "#3B82F6"}
                    onChange={(e) =>
                      handleChange("instructorData.color", e.target.value)
                    }
                    className="w-full h-10 rounded border"
                  />
                  <p className={`text-xs ${T.subtext} mt-1`}>
                    Colore per identificare l'istruttore nel calendario
                  </p>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>
                  Biografia
                </label>
                <textarea
                  value={formData.instructorData?.bio || ""}
                  onChange={(e) =>
                    handleChange("instructorData.bio", e.target.value)
                  }
                  className={`${T.input} w-full`}
                  rows={3}
                  placeholder="Descrizione dell'esperienza e qualifiche dell'istruttore..."
                />
                <p className={`text-xs ${T.subtext} mt-1`}>
                  Breve descrizione che i clienti vedranno
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>
                  Specialità
                </label>
                <div className="space-y-2">
                  {/* Quick Add Common Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {["Padel", "Tennis", "Fitness", "Calcio", "Basket"].map(
                      (specialty) => (
                        <button
                          key={specialty}
                          type="button"
                          onClick={() => {
                            const currentSpecialties =
                              formData.instructorData?.specialties || [];
                            if (!currentSpecialties.includes(specialty)) {
                              handleChange("instructorData.specialties", [
                                ...currentSpecialties,
                                specialty,
                              ]);
                            }
                          }}
                          className={`px-3 py-1 text-sm rounded border ${
                            (
                              formData.instructorData?.specialties || []
                            ).includes(specialty)
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          }`}
                        >
                          {specialty}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Current Specialties */}
                  {(formData.instructorData?.specialties || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(formData.instructorData?.specialties || []).map(
                        (specialty, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            <span>{specialty}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentSpecialties =
                                  formData.instructorData?.specialties || [];
                                handleChange(
                                  "instructorData.specialties",
                                  currentSpecialties.filter(
                                    (s) => s !== specialty,
                                  ),
                                );
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
                <p className={`text-xs ${T.subtext} mt-1`}>
                  Specialità sportive dell'istruttore
                </p>
              </div>

              <div>
                <label className={`flex items-center gap-2 ${T.text}`}>
                  <input
                    type="checkbox"
                    checked={formData.instructorData?.isInstructor !== false}
                    onChange={(e) =>
                      handleChange(
                        "instructorData.isInstructor",
                        e.target.checked,
                      )
                    }
                    className="rounded"
                  />
                  Istruttore Attivo
                </label>
                <p className={`text-xs ${T.subtext} mt-1`}>
                  L'istruttore può ricevere prenotazioni lezioni
                </p>
              </div>
            </div>
          )}

        {/* Wallet */}
        {activeTab === "wallet" && (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Saldo Corrente (€)
              </label>
              <input
                type="number"
                value={formData.wallet?.balance || 0}
                onChange={(e) =>
                  handleChange("wallet.balance", Number(e.target.value))
                }
                className={`${T.input} w-full`}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <p className={`text-xs ${T.subtext} mt-1`}>
                Credito disponibile per prenotazioni e servizi
              </p>
            </div>

            <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
              <h4 className={`font-medium ${T.text} mb-2`}>
                Informazioni Wallet
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={T.subtext}>Transazioni:</span>
                  <span>{formData.wallet?.transactions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className={T.subtext}>Ultimo aggiornamento:</span>
                  <span>
                    {formData.wallet?.lastUpdate
                      ? new Date(
                          formData.wallet.lastUpdate,
                        ).toLocaleDateString()
                      : "Mai"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferenze */}
        {activeTab === "preferences" && (
          <div className="space-y-4">
            <div>
              <h4 className={`font-medium ${T.text} mb-3`}>
                Preferenze di Comunicazione
              </h4>
              <div className="space-y-3">
                <label className={`flex items-center gap-2 ${T.text}`}>
                  <input
                    type="checkbox"
                    checked={formData.communicationPreferences?.email !== false}
                    onChange={(e) =>
                      handleChange(
                        "communicationPreferences.email",
                        e.target.checked,
                      )
                    }
                    className="rounded"
                  />
                  Ricevi email
                </label>

                <label className={`flex items-center gap-2 ${T.text}`}>
                  <input
                    type="checkbox"
                    checked={formData.communicationPreferences?.sms === true}
                    onChange={(e) =>
                      handleChange(
                        "communicationPreferences.sms",
                        e.target.checked,
                      )
                    }
                    className="rounded"
                  />
                  Ricevi SMS
                </label>

                <label className={`flex items-center gap-2 ${T.text}`}>
                  <input
                    type="checkbox"
                    checked={
                      formData.communicationPreferences?.whatsapp === true
                    }
                    onChange={(e) =>
                      handleChange(
                        "communicationPreferences.whatsapp",
                        e.target.checked,
                      )
                    }
                    className="rounded"
                  />
                  Ricevi WhatsApp
                </label>

                <label className={`flex items-center gap-2 ${T.text}`}>
                  <input
                    type="checkbox"
                    checked={
                      formData.communicationPreferences?.notifications !== false
                    }
                    onChange={(e) =>
                      handleChange(
                        "communicationPreferences.notifications",
                        e.target.checked,
                      )
                    }
                    className="rounded"
                  />
                  Ricevi notifiche push
                </label>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Tag (separati da virgola)
              </label>
              <input
                type="text"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) =>
                  handleChange(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  )
                }
                className={`${T.input} w-full`}
                placeholder="principiante, mattiniero, competitivo"
              />
              <p className={`text-xs ${T.subtext} mt-1`}>
                I tag aiutano a categorizzare e filtrare i giocatori
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className={`${T.btnSecondary} px-6 py-2`}
        >
          Annulla
        </button>
        <button type="submit" className={`${T.btnPrimary} px-6 py-2`}>
          {player ? "Aggiorna" : "Crea"} Giocatore
        </button>
      </div>
    </form>
  );
}
