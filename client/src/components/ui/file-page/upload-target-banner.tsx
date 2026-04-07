interface UploadTargetBannerProps {
    currentFolder: string | null;
    onGoRoot: () => void;
}

const UploadTargetBanner = ({ currentFolder, onGoRoot }: UploadTargetBannerProps) => {
    return (
        <div className="mt-4 rounded-2xl border border-gray-300/90 bg-[#f8fbff] px-4 py-3 text-sm text-[#5f6368]">
            Upload hiện tại sẽ lưu vào: <strong className="text-[#202124]">{currentFolder ?? "root"}</strong>
            {currentFolder && (
                <button
                    className="ml-3 rounded-full border border-gray-300/90 bg-white px-3 py-1 text-xs font-semibold text-[#1a73e8] transition hover:bg-[#e8f0fe]"
                    onClick={onGoRoot}
                >
                    Về root
                </button>
            )}
        </div>
    );
};

export default UploadTargetBanner;
