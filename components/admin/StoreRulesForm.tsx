"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useStoreConfig } from "@/context/StoreConfigContext";
import { sha256Hex } from "@/lib/hash";
import { PLACEHOLDER_WHATSAPP_NUMBER } from "@/lib/types";

export default function StoreRulesForm() {
  const { t } = useLocale();
  const { rules, updateRules } = useStoreConfig();
  const [deliveryFee, setDeliveryFee] = useState(String(rules.deliveryFee));
  const [bulkMaxPrice, setBulkMaxPrice] = useState(String(rules.bulkMaxPrice));
  const [bulkMinQty, setBulkMinQty] = useState(String(rules.bulkMinQty));
  const [bulkFreeDeliveryQty, setBulkFreeDeliveryQty] = useState(String(rules.bulkFreeDeliveryQty));
  const [whatsappNumbers, setWhatsappNumbers] = useState(rules.whatsappNumbers);
  const [newNumber, setNewNumber] = useState("");
  const [socialTiktok, setSocialTiktok] = useState(rules.socialTiktok);
  const [socialInstagram, setSocialInstagram] = useState(rules.socialInstagram);
  const [socialFacebook, setSocialFacebook] = useState(rules.socialFacebook);
  const [contactEmail, setContactEmail] = useState(rules.contactEmail);
  const [contactPhones, setContactPhones] = useState(rules.contactPhones);
  const [newContactPhone, setNewContactPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  function handleAddContactPhone() {
    const trimmed = newContactPhone.trim();
    if (!trimmed) return;
    setContactPhones((prev) => [...prev, trimmed]);
    setNewContactPhone("");
  }

  function handleRemoveContactPhone(idx: number) {
    setContactPhones((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSavePassword() {
    const trimmed = newPassword.trim();
    if (!trimmed) return;
    const hash = await sha256Hex(trimmed);
    updateRules({ ...rules, adminPasswordHash: hash });
    setNewPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2000);
  }

  function handleAddNumber() {
    const trimmed = newNumber.trim().replace(/[^\d]/g, "");
    if (!trimmed) return;
    setWhatsappNumbers((prev) => [...prev, trimmed]);
    setNewNumber("");
  }

  function handleRemoveNumber(idx: number) {
    setWhatsappNumbers((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleEditNumber(idx: number, value: string) {
    const digits = value.replace(/[^\d]/g, "");
    setWhatsappNumbers((prev) => prev.map((n, i) => (i === idx ? digits : n)));
  }

  function handleMakePrimary(idx: number) {
    setWhatsappNumbers((prev) => {
      const next = [...prev];
      const [chosen] = next.splice(idx, 1);
      return [chosen, ...next];
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateRules({
      ...rules,
      deliveryFee: Number(deliveryFee) || 0,
      bulkMaxPrice: Number(bulkMaxPrice) || 0,
      bulkMinQty: Math.max(1, Math.round(Number(bulkMinQty) || 1)),
      bulkFreeDeliveryQty: Math.max(1, Math.round(Number(bulkFreeDeliveryQty) || 1)),
      whatsappNumbers: whatsappNumbers.length ? whatsappNumbers : rules.whatsappNumbers,
      socialTiktok: socialTiktok.trim(),
      socialInstagram: socialInstagram.trim(),
      socialFacebook: socialFacebook.trim(),
      contactEmail: contactEmail.trim(),
      contactPhones,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <div>
        <label htmlFor="r-fee" className="mb-1 block text-xs font-medium text-foreground-soft">
          Costo de entrega (USD)
        </label>
        <input
          id="r-fee"
          type="number"
          min="0"
          step="0.01"
          value={deliveryFee}
          onChange={(e) => setDeliveryFee(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="r-maxprice" className="mb-1 block text-xs font-medium text-foreground-soft">
          Regla de cantidad minima: articulos con precio menor a (USD)
        </label>
        <input
          id="r-maxprice"
          type="number"
          min="0"
          step="0.01"
          value={bulkMaxPrice}
          onChange={(e) => setBulkMaxPrice(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="r-minqty" className="mb-1 block text-xs font-medium text-foreground-soft">
          Cantidad minima por pedido (para esos articulos)
        </label>
        <input
          id="r-minqty"
          type="number"
          min="1"
          step="1"
          value={bulkMinQty}
          onChange={(e) => setBulkMinQty(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="r-freeqty" className="mb-1 block text-xs font-medium text-foreground-soft">
          Cantidad para envio gratis (mismo articulo)
        </label>
        <input
          id="r-freeqty"
          type="number"
          min="1"
          step="1"
          value={bulkFreeDeliveryQty}
          onChange={(e) => setBulkFreeDeliveryQty(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />
      </div>
      <div className="sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-foreground-soft">
          Numeros de WhatsApp (el primero recibe los pedidos, los demas son de respaldo)
        </span>
        {whatsappNumbers[0] === PLACEHOLDER_WHATSAPP_NUMBER && (
          <p className="mb-2 rounded-xl bg-brand-danger/10 px-3 py-2 text-xs text-brand-danger">
            El numero principal sigue siendo el de prueba. Los clientes no podran enviar pedidos hasta
            que agregues tu numero real y lo marques como &quot;principal&quot;, luego presiones Guardar.
          </p>
        )}
        {whatsappNumbers.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {whatsappNumbers.map((num, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <input
                  type="text"
                  value={num}
                  onChange={(e) => handleEditNumber(idx, e.target.value)}
                  className="w-full flex-1 bg-transparent tabular-nums outline-none"
                />
                {idx === 0 ? (
                  <span className="whitespace-nowrap text-[11px] font-semibold text-brand-pink-deep">
                    principal
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMakePrimary(idx)}
                    className="whitespace-nowrap text-xs underline text-foreground-soft"
                  >
                    Hacer principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveNumber(idx)}
                  className="whitespace-nowrap text-xs underline text-brand-danger"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            placeholder="Ej. 16505551234 (codigo de pais + numero, sin espacios)"
            className="w-full flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={handleAddNumber}
            className="rounded-xl border border-brand-pink px-4 text-sm font-semibold text-brand-pink-deep"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="sm:col-span-2 mt-2 border-t border-border pt-3.5">
        <span className="mb-1 block text-xs font-medium text-foreground-soft">{t.admin_social_contact}</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            type="text"
            value={socialTiktok}
            onChange={(e) => setSocialTiktok(e.target.value)}
            placeholder="https://tiktok.com/@..."
            aria-label="TikTok"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
          />
          <input
            type="text"
            value={socialInstagram}
            onChange={(e) => setSocialInstagram(e.target.value)}
            placeholder="https://instagram.com/..."
            aria-label="Instagram"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
          />
          <input
            type="text"
            value={socialFacebook}
            onChange={(e) => setSocialFacebook(e.target.value)}
            placeholder="https://facebook.com/..."
            aria-label="Facebook"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="r-email" className="mb-1 block text-xs font-medium text-foreground-soft">
          {t.admin_contact_email}
        </label>
        <input
          id="r-email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="hola@evessweets.com"
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-foreground-soft">{t.admin_contact_phones}</span>
        {contactPhones.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {contactPhones.map((num, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <span className="w-full flex-1 tabular-nums">{num}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveContactPhone(idx)}
                  className="whitespace-nowrap text-xs underline text-brand-danger"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            placeholder="Ej. (650) 555-1234"
            className="w-full flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={handleAddContactPhone}
            className="rounded-xl border border-brand-pink px-4 text-sm font-semibold text-brand-pink-deep"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-brand-pink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
        >
          Guardar
        </button>
        {saved && <span className="ml-3 text-xs text-brand-ok">Guardado.</span>}
      </div>

      <div className="sm:col-span-2 mt-2 border-t border-border pt-3.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="r-new-password" className="mb-1 block text-xs font-medium text-foreground-soft">
              {t.admin_change_password}
            </label>
            <input
              id="r-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t.admin_new_password_placeholder}
              autoComplete="new-password"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSavePassword}
            className="rounded-xl border border-brand-pink px-4 py-2.5 text-sm font-semibold text-brand-pink-deep"
          >
            {t.admin_new_password}
          </button>
          {passwordSaved && <span className="text-xs text-brand-ok">{t.admin_password_saved}</span>}
        </div>
      </div>
    </form>
  );
}
