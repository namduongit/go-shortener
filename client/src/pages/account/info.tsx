const accountInfo = {
    email: "minh.hoang@brand.com",
    name: "Hoàng Minh",
    birthday: "14/07/1995",
    company: "Brand Studio",
    plan: "Studio Unlimited",
};

const AccountInfoPage = () => {
    return (
        <div className="space-y-8">
            <header className="rounded-3xl border border-[#ded7c7] bg-white/95 p-10 shadow-[0_25px_90px_rgba(20,16,12,0.12)]">
                <p className="text-xs uppercase tracking-[0.45em] text-[#8b714c]">Tài khoản</p>
                <h1 className="mt-3 text-4xl font-serif text-[#1f1d19]">Thông tin hồ sơ</h1>
                <p className="mt-2 text-sm text-[#4d493f]">Kiểm tra thông tin liên quan đến cá nhân và gói dịch vụ hiện tại.</p>
            </header>

            <section className="rounded-3xl border border-[#dcd5c5] bg-white/95 p-8 shadow-[0_20px_70px_rgba(20,16,12,0.08)]">
                <table className="w-full text-left text-sm text-[#3a3630]">
                    <tbody>
                        {Object.entries(accountInfo).map(([key, value], index) => (
                            <tr key={key} className={index % 2 === 0 ? "bg-white" : "bg-[#fbf9f3]"}>
                                <td className="px-4 py-4 text-xs uppercase tracking-[0.3em] text-[#8b714c]">{key}</td>
                                <td className="px-4 py-4 text-[#2d2a26] font-semibold">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default AccountInfoPage;
