"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

type ContactRow = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  company: string;
  title: string;
};

type ContactsClientProps = {
  contacts: ContactRow[];
  pagination: {
    baseQuery: string;
    page: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

export function ContactsClient({ contacts, pagination }: ContactsClientProps) {
  // Popup state for the selected contact.
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  async function openPopup(id: string) {
    // Build the vCard URL and generate QR locally.
    const url = `${window.location.origin}/vcard/${id}`;
    const qr = await QRCode.toDataURL(url, { width: 220, margin: 1 });
    setLink(url);
    setQrDataUrl(qr);
    setOpen(true);
  }

  return (
    <>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Empresa</th>
              <th>Titulo</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>vCard</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{`${contact.firstName} ${contact.lastName}`}</td>
                <td>{contact.company || "-"}</td>
                <td>{contact.title || "-"}</td>
                <td>{contact.phoneNumber || "-"}</td>
                <td>{contact.email || "-"}</td>
                <td>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => openPopup(contact.id)}
                  >
                    Ver QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-row" style={{ marginTop: 12 }}>
          {pagination.hasPrev ? (
            <Link
              className="button secondary"
              href={`/vcard/contacts?${pagination.baseQuery}&page=${pagination.page - 1}`}
            >
              Anterior
            </Link>
          ) : (
            <span className="muted">Anterior</span>
          )}
          {pagination.hasNext ? (
            <Link
              className="button secondary"
              href={`/vcard/contacts?${pagination.baseQuery}&page=${pagination.page + 1}`}
            >
              Proxima
            </Link>
          ) : (
            <span className="muted">Proxima</span>
          )}
        </div>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>vCard</h3>
            {link && (
              <p>
                <a href={link}>{link}</a>
              </p>
            )}
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR code vCard" width={220} height={220} />
            )}
            <div className="form-row" style={{ marginTop: 12 }}>
              <button className="button secondary" onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
