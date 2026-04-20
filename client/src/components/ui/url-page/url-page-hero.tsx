import Button from "../button/button";

interface UrlPageHeroProps {
    onOpenCreate: () => void;
}

const UrlPageHero = ({ onOpenCreate }: UrlPageHeroProps) => {
    return (
        <header className="p-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Quản lý URL</h1>
                    <span className="mt-1 block text-sm text-gray-500">Tạo, tìm kiếm và quản lý link rút gọn của bạn</span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={onOpenCreate}
                >
                    Tạo URL mới
                </Button>
                </div>
        </header>
    );
};

export default UrlPageHero;
