import Button from "../../button/button";

interface CreateTokenModalProps {
    isOpen: boolean;
    publicToken: string;
    privateToken: string;
    onClose: () => void;
    onCopyToken: (token: string) => void | Promise<void>;
}

const TokenField = ({
    label,
    value,
    warning,
    onCopy,
}: {
    label: string;
    value: string;
    warning?: string;
    onCopy: () => void;
}) => (
    <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700">{label}</p>
        <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg border border-gray-300/90 bg-gray-50 px-3 py-2.5 font-mono text-xs text-gray-800">
                {value}
            </code>
            <Button
                type="button"
                onClick={onCopy}
                className="shrink-0 grid h-9 w-9 place-items-center rounded-lg border border-gray-300/90 text-gray-600 hover:bg-gray-50 transition-colors"
            >
                <i className="fa-regular fa-copy text-sm" />
            </Button>
        </div>
        {warning && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700">
                <i className="fa-solid fa-triangle-exclamation shrink-0" />
                {warning}
            </p>
        )}
    </div>
);

const CreateTokenModal = ({ isOpen, publicToken, privateToken, onClose, onCopyToken }: CreateTokenModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/45 px-4 py-6">
            <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow">
                <div className="flex items-center justify-between border-b border-gray-300/90 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Token đã được tạo</h3>
                        <p className="mt-1 text-sm text-gray-500">Sao chép và lưu trữ ngay — private token chỉ hiển thị một lần.</p>
                    </div>
                    <Button
                        type="button"
                        className="rounded-md border border-gray-300/90 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <TokenField
                        label="Public token"
                        value={publicToken}
                        onCopy={() => void onCopyToken(publicToken)}
                    />
                    <TokenField
                        label="Private token"
                        value={privateToken}
                        warning="Chỉ xuất hiện một lần duy nhất, hãy lưu lại ngay."
                        onCopy={() => void onCopyToken(privateToken)}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-300/90 px-6 py-4">
                    <Button
                        type="button"
                        className="rounded-md  border border-gray-300/90 px-4 py-1.5 text-gray-900 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Đã lưu, đóng lại
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateTokenModal;