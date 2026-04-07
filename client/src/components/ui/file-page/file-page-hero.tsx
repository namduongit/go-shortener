import Button from "../button/button";

interface FilePageHeroProps {
    onOpenCreateFolder: () => void;
    onOpenUploadFile: () => void;
}

const FilePageHero = ({ onOpenCreateFolder, onOpenUploadFile }: FilePageHeroProps) => {
    return (
        <header className="rounded-3xl border border-gray-300/90 bg-[#f8fbff] p-5 md:p-7">
            <div>
                <p className="text-sm font-semibold text-[#5f6368]">File Manager</p>
                <h1 className="mt-1 text-3xl font-semibold text-[#202124] md:text-4xl">Kho tệp và thư mục</h1>
                <p className="mt-2 text-sm text-[#5f6368]">Cloud lưu trữ file, tệp và chia sẻ hình ảnh.</p>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
                <Button
                    className="rounded-md border border-gray-300/90 bg-white px-5 py-2 text-sm font-semibold text-[#1a73e8] transition hover:bg-[#edf3fe]"
                    onClick={onOpenCreateFolder}
                >
                    <i className="fa-regular fa-folder-open mr-2"></i>
                    Tạo thư mục
                </Button>
                <Button
                    className="rounded-md bg-[#1a73e8] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#175fc0]"
                    onClick={onOpenUploadFile}
                >
                    <i className="fa-solid fa-arrow-up-from-bracket mr-2"></i>
                    Tải tệp lên
                </Button>
            </div>
        </header>
    );
};

export default FilePageHero;
