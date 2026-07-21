"use client";

import { Copy, Check, Send } from "lucide-react";

interface StudentCredentialsModalProps {
  credentials: any;
  onClose: () => void;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  isSendingWhatsApp: boolean;
  sendCredentialsViaWhatsApp: () => void;
  content: any;
}

export function StudentCredentialsModal({
  credentials,
  onClose,
  copiedField,
  copyToClipboard,
  isSendingWhatsApp,
  sendCredentialsViaWhatsApp,
  content,
}: StudentCredentialsModalProps) {
  if (!credentials) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="surface-panel w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-on-surface">
          {content.credentials}
        </h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface-variant">
                {content.studentEmail}
              </p>
              <p className="text-sm text-on-surface">
                {credentials.studentCredentials.email}
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  credentials.studentCredentials.email,
                  "student-email"
                )
              }
              className="p-1 hover:bg-surface-container-high rounded"
            >
              {copiedField === "student-email" ? (
                <Check size={16} className="text-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface-variant">
                {content.studentPassword}
              </p>
              <p className="text-sm text-on-surface">
                {credentials.studentCredentials.password}
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  credentials.studentCredentials.password,
                  "student-password"
                )
              }
              className="p-1 hover:bg-surface-container-high rounded"
            >
              {copiedField === "student-password" ? (
                <Check size={16} className="text-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface-variant">
                {content.parentEmail}
              </p>
              <p className="text-sm text-on-surface">
                {credentials.parentCredentials.email}
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  credentials.parentCredentials.email,
                  "parent-email"
                )
              }
              className="p-1 hover:bg-surface-container-high rounded"
            >
              {copiedField === "parent-email" ? (
                <Check size={16} className="text-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface-variant">
                {content.parentPassword}
              </p>
              <p className="text-sm text-on-surface">
                {credentials.parentCredentials.password}
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  credentials.parentCredentials.password,
                  "parent-password"
                )
              }
              className="p-1 hover:bg-surface-container-high rounded"
            >
              {copiedField === "parent-password" ? (
                <Check size={16} className="text-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant">
            <button
              onClick={sendCredentialsViaWhatsApp}
              disabled={isSendingWhatsApp || !credentials.parentWhatsapp}
              className="btn-primary w-full"
            >
              <Send size={16} />
              {isSendingWhatsApp ? "Sending..." : content.sendWhatsApp}
            </button>
            {!credentials.parentWhatsapp && (
              <p className="text-xs text-on-surface-variant mt-2">
                {content.parentPhoneRequired}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            {content.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}