import React, { useState } from "react";
import { AlbumProvider, useAlbum } from "./context/AlbumContext";
import MemoryAlbum from "./components/MemoryAlbum";
import StoryIntro from "./components/StoryIntro";
import BackgroundMusic from "./components/BackgroundMusic";
import StudioEditor from "./components/editor/StudioEditor";
import ShareModal from "./components/ShareModal";
import GiftEnvelope from "./components/GiftEnvelope";
import FloatingActionToggle from "./components/FloatingActionToggle";
import CreateOwnButton from "./components/CreateOwnButton";

const AlbumViewer: React.FC = () => {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const {
    album,
    isMobile,
    isRecipientMode,
    isAutoFlipping,
    toggleAutoFlip,
    setIsAutoFlipping,
  } = useAlbum();

  const handleCreateOwnAlbum = () => {
    if (typeof window !== "undefined") {
      window.location.hash = "";
      window.location.reload();
    }
  };

  const isStoryIntroActive =
    (!isRecipientMode || envelopeOpened) &&
    !introFinished &&
    album.storyIntro.enabled;

  return (
    <div
      className={`relative min-h-screen w-full transition-all duration-300 overflow-hidden ${
        isEditorOpen && !isMobile ? "pl-[410px]" : "pl-0"
      }`}
      style={{ backgroundColor: album.background.color }}
    >
      {/* 1. Tombol Musik Latar Bulat (Sudut Kiri Atas Canvas) */}
      {album.audio.enabled && (
        <BackgroundMusic
          src={album.audio.src}
          autoPlay={album.audio.autoPlay}
          loop={album.audio.loop}
          defaultVolume={album.audio.defaultVolume}
        />
      )}

      {/* 2. Tombol Otomatis Buka Lembaran Bulat (Sudut Kanan Atas Canvas) */}
      {introFinished && (
        <div className="fixed top-6 right-6 z-[60]">
          <button
            type="button"
            onClick={toggleAutoFlip}
            aria-label={isAutoFlipping ? "Jeda putar lembaran otomatis" : "Putar lembaran otomatis"}
            title={isAutoFlipping ? "Jeda putar lembaran otomatis" : "Putar lembaran otomatis (8s per lembar)"}
            className={`group flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md shadow-lg transition-all duration-300 active:scale-95 text-white ${
              isAutoFlipping
                ? "border-white/70 bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                : "border-white/20 bg-black/40 hover:border-white/50 hover:bg-black/60"
            }`}
          >
            {isAutoFlipping ? (
              // Ikon Jeda (Pause)
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              // Ikon Putar (Play)
              <svg
                className="h-4 w-4 ml-0.5 text-white/80 transition-colors group-hover:text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* 3. Floating Morphing Action Toggle (Mode Pembuat Saja) */}
      {introFinished && !isRecipientMode && !isEditorOpen && (
        <FloatingActionToggle
          onOpenSettings={() => setIsEditorOpen(true)}
          onOpenShare={() => setIsShareModalOpen(true)}
        />
      )}

      {/* 4. Dynamic Expandable CTA "Bikin Sendiri" (Mode Penerima Saja) */}
      {introFinished && isRecipientMode && (
        <CreateOwnButton onClick={handleCreateOwnAlbum} />
      )}

      {/* 5. Panel Studio Editor Split-View / Mobile Drawer */}
      <StudioEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* 6. Modal Bagikan Hadiah (Share Modal + QR Code) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* 7. Komponen Album 3D Fisik di latar belakang */}
      <MemoryAlbum
        onAutoFlipEnd={() => setIsAutoFlipping(false)}
      />

      {/* 8. Prolog Animasi Teks Sinematik (Story Intro) */}
      {isStoryIntroActive && (
        <StoryIntro
          config={album.storyIntro}
          onComplete={() => setIntroFinished(true)}
        />
      )}

      {/* 9. Amplop Pembuka Hadiah (Gift Envelope Unboxing) Khusus Mode Penerima */}
      {isRecipientMode && !envelopeOpened && (
        <GiftEnvelope
          albumTitle={album.covers.title}
          senderName={album.closingNote.author}
          onOpen={() => setEnvelopeOpened(true)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AlbumProvider>
      <AlbumViewer />
    </AlbumProvider>
  );
};

export default App;
