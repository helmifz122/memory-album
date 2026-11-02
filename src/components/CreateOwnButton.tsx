import React from "react";

interface CreateOwnButtonProps {
  onClick: () => void;
}

export const CreateOwnButton: React.FC<CreateOwnButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 left-6 z-40 select-none">
      <button
        type="button"
        onClick={onClick}
        aria-label="Bikin Album Sendiri"
        className="group relative flex h-10 w-10 hover:w-[145px] items-center justify-start overflow-hidden rounded-full border border-white/20 bg-black/40 backdrop-blur-md shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-black hover:border-white/30 active:scale-95 cursor-pointer text-white"
      >
        {/* Ikon Pensil Presisi */}
        <div className="flex h-full w-10 shrink-0 items-center justify-center text-white transition-all duration-300 group-hover:pl-0.5">
          <svg
            className="h-4 w-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>

        {/* Teks Bikin Sendiri Muncul Saat Hover */}
        <span className="whitespace-nowrap text-xs font-medium text-white tracking-wide opacity-0 transition-opacity duration-200 delay-75 group-hover:opacity-100 pr-3.5">
          Bikin Sendiri
        </span>
      </button>
    </div>
  );
};

export default CreateOwnButton;
