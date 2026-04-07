import Button from "../button/button";

interface UrlPageHeroProps {
    onOpenCreate: () => void;
    onSync: () => Promise<void>;
}

const UrlPageHero = ({ onOpenCreate, onSync }: UrlPageHeroProps) => {
    return (
        <header className="rounded-3xl border border-gray-300/90 bg-[#f8fbff] p-5 md:p-7">
            <div>
                <p className="text-sm font-semibold text-[#5f6368]">URL Manager</p>
                <h1 className="mt-1 text-3xl font-semibold text-[#202124] md:text-4xl">Kho đường dẫn rút gọn</h1>
                <p className="mt-2 text-sm text-[#5f6368]">Cloud quản lý link rút gọn nhanh, gọn và đồng bộ.</p>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
                <Button
                    className="rounded-md border border-gray-300/90 bg-white px-5 py-2 text-sm font-semibold text-[#1a73e8] transition hover:bg-[#edf3fe]"
                    onClick={onOpenCreate}
                >
                    <i className="fa-solid fa-link mr-2"></i>
                    Tạo URL mới
                </Button>
                <Button
                    className="rounded-md border border-gray-300/90 bg-white px-5 py-2 text-sm font-semibold text-[#1a73e8] transition hover:bg-[#edf3fe]"
                    onClick={() => void onSync()}
                >
                    <i className="fa-solid fa-rotate-right mr-2"></i>
                    Đồng bộ dữ liệu
                </Button>
            </div>
        </header>
    );
};

export default UrlPageHero;
