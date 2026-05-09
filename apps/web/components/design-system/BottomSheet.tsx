"use client";

import { Drawer } from "vaul";

function IClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => { if (!v) onClose(); }}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-[100]"
          style={{ background: "rgba(20,15,10,0.45)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
        <Drawer.Content
          className="bidan-dashboard flex flex-col"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            margin: "0 auto",
            zIndex: 101,
            width: "100%",
            maxWidth: "430px",
            borderRadius: "14px 14px 0 0",
            background: "var(--bidan-surface)",
            padding: "20px",
            paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
            maxHeight: "85dvh",
          }}
        >
          <div
            style={{
              margin: "0 auto 16px",
              width: "48px",
              height: "5px",
              borderRadius: "9999px",
              background: "var(--bidan-border)",
              flexShrink: 0,
            }}
          />
          <div className="mh" style={{ marginBottom: "20px", flexShrink: 0 }}>
            <Drawer.Title className="mt">{title}</Drawer.Title>
            <Drawer.Close asChild>
              <button className="cl" onClick={onClose} type="button" aria-label="Tutup">
                <IClose />
              </button>
            </Drawer.Close>
          </div>
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
