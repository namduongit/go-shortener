import { useCallback, useEffect, useState } from "react";
import type { UrlListResponse, UrlResponse } from "../../services/types/url.type";
import { useExecute } from "../../common/hooks/useExecute";
import { UrlModule } from "../../services/modules/url.modules";
import { formatDate } from "../../services/utils/date";

const UrlPage = () => {
    const { GetUrls } = UrlModule;
    const { execute } = useExecute<UrlListResponse>();
    const [urls, setUrls] = useState<UrlResponse[]>([]);

    const fetchUrls = useCallback(() => {
        execute(() => GetUrls(), {
            onSuccess: (data) => {
                if (data && Array.isArray(data.urls)) {
                    setUrls(data.urls);
                } else {
                    setUrls([]);
                }
            }
        })
    }, [execute, GetUrls]);

    useEffect(() => {
        void fetchUrls();
    }, []);

    return (
        <div className="space-y-8">
            <header className="rounded-3xl border border-[#ded7c7] bg-white/95 p-10 shadow-[0_25px_90px_rgba(20,16,12,0.12)]">
                <p className="text-xs uppercase tracking-[0.45em] text-[#8b714c]">Sort URL</p>
                <h1 className="mt-3 text-4xl font-serif text-[#1f1d19]">Bảng điều khiển URL</h1>
                <p className="mt-2 text-sm text-[#4d493f]">Theo dõi hiệu suất liên kết và giữ chúng gọn gàng, dễ nhớ.</p>
                <div className="mt-6 flex flex-col gap-3 md:flex-row">
                    <button className="rounded-2xl border border-[#c2b8a8] px-5 py-2 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#f4efe5]">Tạo URL mới</button>
                    <button className="rounded-2xl bg-[#2d2a26] px-5 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-[#1c1915]">Xuất thống kê</button>
                </div>
            </header>

            <section className="rounded-3xl border border-[#dcd5c5] bg-white/95 p-8 shadow-[0_20px_70px_rgba(20,16,12,0.08)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-serif text-[#1f1d19]">Danh sách đường dẫn</h2>
                        <p className="text-sm text-[#5a5347]">Mỗi shortcode đại diện cho một chiến dịch hoặc nội dung cụ thể.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="rounded-xl border border-[#d4ccbd] px-4 py-2 text-sm text-[#2d2a26] transition hover:bg-[#f7f3ea]">Sắp xếp</button>
                        <button className="rounded-xl border border-[#d4ccbd] px-4 py-2 text-sm text-[#2d2a26] transition hover:bg-[#f7f3ea]">Lọc</button>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-[#e5ddcf]">
                    <table className="w-full text-left text-sm text-[#3a3630]">
                        <thead className="bg-[#f7f3ea] text-xs uppercase tracking-wide text-[#7b6a4a]">
                            <tr>
                                <th className="px-4 py-3">Mã</th>
                                <th className="px-4 py-3">Short code</th>
                                <th className="px-4 py-3">Long URL</th>
                                <th className="px-4 py-3">Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {urls.map((item, index) => (
                                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-[#fbf9f3]"}>
                                    <td className="px-4 py-4 font-semibold text-[#2d2a26]">{item.id}</td>
                                    <td className="px-4 py-4">
                                        <span className="rounded-full border border-[#d4ccbd] px-3 py-1 text-xs font-semibold text-[#6b5a3a]">
                                            {item.short_code}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-[#4d493f]">{item.long_url}</td>
                                    <td className="px-4 py-4 text-[#4d493f]">{formatDate(item.created_at)}</td>
                                </tr>
                            ))}
                            {urls.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#7b7366]">
                                        Chưa có đường dẫn nào được tạo.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default UrlPage;
