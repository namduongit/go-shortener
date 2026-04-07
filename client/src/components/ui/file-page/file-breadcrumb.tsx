interface FileBreadcrumbProps {
    path: string[];
    onGoRoot: () => void;
    onGoPath: (index: number) => void;
}

const FileBreadcrumb = ({ path, onGoRoot, onGoPath }: FileBreadcrumbProps) => {
    return (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-300/90 bg-white px-4 py-3 text-sm text-[#5f6368]">
            <button
                className="rounded-2xl px-2 py-1 font-semibold text-[#1a73e8] transition hover:bg-[#e8f0fe]"
                onClick={onGoRoot}
            >
                GMS Cloud
            </button>
            {path.map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                    <span>/</span>
                    <button
                        className="rounded-lg px-2 py-1 font-semibold text-[#1a73e8] transition hover:bg-[#e8f0fe]"
                        onClick={() => onGoPath(index)}
                    >
                        {item}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default FileBreadcrumb;
