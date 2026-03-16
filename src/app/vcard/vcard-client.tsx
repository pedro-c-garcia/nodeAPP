"use client";

import { useState } from "react";
import QRCode from "qrcode";

type CreatePayload = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  company: string;
  title: string;
};

type CreateResponse = {
  id: string;
};

export function VCardClient() {
  // Local form state for vCard creation.
  const [form, setForm] = useState<CreatePayload>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    company: "",
    title: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  function updateField(name: keyof CreatePayload, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Persist contact and get the id to build the vCard URL.
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Erro ao criar vCard.");
      }
      const payload: CreateResponse = await res.json();
      const base = window.location.origin;
      const url = `${base}/vcard/${payload.id}`;
      setDownloadUrl(url);
      // Generate a QR code locally as a data URL.
      const qr = await QRCode.toDataURL(url, { width: 220, margin: 1 });
      setQrDataUrl(qr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ marginTop: 24 }}>
      <div className="card">
        <h1>Gestao de vCard</h1>
        <p className="muted">
          Crie um contacto e gere um QR Code que descarrega o ficheiro .vcf.
        </p>
        <form className="form-row" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="phoneNumber">Phone</label>
            <input
              id="phoneNumber"
              value={form.phoneNumber}
              onChange={(e) => updateField("phoneNumber", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              value={form.company}
              onChange={(e) => updateField("company", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <button className="button" type="submit" disabled={loading}>
            {loading ? "A gerar..." : "Gerar vCard"}
          </button>
        </form>
        <div className="line-box" />
        {error && <p className="muted">{error}</p>}
      </div>

      {downloadUrl && (
        <div className="card">
          <h2>Download e QR Code</h2>
          <p className="muted">Link direto para o vCard:</p>
          <p>
            <a href={downloadUrl}>{downloadUrl}</a>
          </p>
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="QR code para vCard"
              width={220}
              height={220}
            />
          )}
        </div>
      )}
    </section>
  );
}
