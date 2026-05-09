import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

/* ─── Types ─────────────────────────────────────────── */
type SectionId = "overview" | "guide-register" | "guide-token" | "use-api" | "library" | "contact";

interface NavItem {
  id: SectionId;
  label: string;
  parent?: string;
}

/* ─── Navigation structure ───────────────────────────── */
const NAV: NavItem[] = [
  { id: "overview",       label: "Tổng quan" },
  { id: "guide-register", label: "Đăng ký tài khoản", parent: "Hướng dẫn" },
  { id: "guide-token",    label: "Tạo API Token",      parent: "Hướng dẫn" },
  { id: "use-api",        label: "Sử dụng API" },
  { id: "library",        label: "Thư viện" },
  { id: "contact",        label: "Liên lạc" },
];

/* ─── API endpoint data ──────────────────────────────── */
const API_GROUPS = [
  {
    group: "Upload ảnh (qua API Token)",
    items: [
      { method: "POST", path: "/api/token/presign-upload",              desc: "Khởi tạo session & nhận presigned URL" },
      { method: "POST", path: "/api/token/sign-upload/:uuid",           desc: "Lấy URL ký để upload từng part" },
      { method: "POST", path: "/api/token/complete-upload/:uuid",        desc: "Hoàn thành upload đơn (single)" },
      { method: "POST", path: "/api/token/complete-multipart-upload/:uuid", desc: "Hoàn thành upload nhiều part" },
    ],
  },
  {
    group: "Xác thực (Cookie session)",
    items: [
      { method: "POST", path: "/auth/register",                  desc: "Đăng ký tài khoản mới" },
      { method: "POST", path: "/auth/login",                     desc: "Đăng nhập & nhận cookie phiên" },
      { method: "POST", path: "/auth/logout",                    desc: "Đăng xuất, xóa cookie" },
      { method: "GET",  path: "/auth/activation",                desc: "Kích hoạt tài khoản qua email" },
    ],
  },
  {
    group: "File & Folder",
    items: [
      { method: "GET",    path: "/api/guard/files",              desc: "Danh sách file" },
      { method: "DELETE", path: "/api/guard/files/:uuid",        desc: "Xóa file" },
      { method: "GET",    path: "/api/guard/folders",            desc: "Danh sách folder" },
      { method: "POST",   path: "/api/guard/folders",            desc: "Tạo folder mới" },
      { method: "DELETE", path: "/api/guard/folders/:uuid",      desc: "Xóa folder" },
    ],
  },
];

const METHOD_STYLE: Record<string, string> = {
  GET:    "bg-blue-50 text-blue-700 border-blue-200",
  POST:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  PATCH:  "bg-violet-50 text-violet-700 border-violet-200",
  PUT:    "bg-amber-50 text-amber-700 border-amber-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
};

/* ─── Code block ─────────────────────────────────────── */
const Code = ({ children }: { children: string }) => (
  <pre className="doc-code">
    <code>{children}</code>
  </pre>
);

/* ─── Section content components ─────────────────────── */
const Overview = () => (
  <section id="overview" className="doc-section">
    <p className="doc-badge">GMS Cloud</p>
    <h1 className="doc-h1">Tài liệu API</h1>
    <p className="doc-lead">
      GMS Cloud cung cấp REST API cho phép bạn tích hợp lưu trữ ảnh và quản lý file trực tiếp vào ứng dụng của mình.
      Tất cả response đều ở định dạng JSON.
    </p>

    <div className="doc-info-box">
      <i className="fa-solid fa-circle-info text-blue-500 mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-blue-900 mb-1">Base URL</p>
        <code className="font-mono text-sm text-blue-800">https://api.gms-cloud.namduong.dev</code>
      </div>
    </div>

    <h2 className="doc-h2">Hai phương thức xác thực</h2>
    <div className="doc-grid-2">
      <div className="doc-card">
        <div className="flex items-center gap-2 mb-2">
          <span className="doc-tag-blue">Cookie Session</span>
        </div>
        <p className="text-sm text-gray-600">
          Dành cho ứng dụng web. Đăng nhập qua <code className="doc-inline-code">/auth/login</code>, cookie
          <code className="doc-inline-code">accessToken</code> được set tự động.
          Gửi kèm <code className="doc-inline-code">credentials: "include"</code> với mỗi request.
        </p>
      </div>
      <div className="doc-card">
        <div className="flex items-center gap-2 mb-2">
          <span className="doc-tag-purple">API Token</span>
        </div>
        <p className="text-sm text-gray-600">
          Dành cho tích hợp server-to-server. Tạo token tại trang tài khoản, gửi header
          <code className="doc-inline-code">X-Public-Key</code> và <code className="doc-inline-code">X-Private-Key</code> với mỗi request.
        </p>
      </div>
    </div>
  </section>
);

const GuideRegister = () => (
  <section id="guide-register" className="doc-section">
    <p className="doc-badge">Hướng dẫn</p>
    <h1 className="doc-h1">Đăng ký tài khoản</h1>
    <p className="doc-lead">Tạo tài khoản GMS Cloud để bắt đầu sử dụng dịch vụ lưu trữ ảnh.</p>

    <div className="doc-steps">
      <div className="doc-step">
        <div className="doc-step-num">1</div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Gọi API đăng ký</p>
          <Code>{`POST /auth/register
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "your_password"
}`}</Code>
        </div>
      </div>

      <div className="doc-step">
        <div className="doc-step-num">2</div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Xác nhận email</p>
          <p className="text-sm text-gray-600">
            Kiểm tra hộp thư và nhấn link kích hoạt. Tài khoản chưa kích hoạt sẽ không thể đăng nhập.
          </p>
        </div>
      </div>

      <div className="doc-step">
        <div className="doc-step-num">3</div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Đăng nhập</p>
          <Code>{`POST /auth/login
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "your_password"
}`}</Code>
          <p className="text-sm text-gray-500 mt-2">
            Cookie <code className="doc-inline-code">accessToken</code> được set tự động trong response.
          </p>
        </div>
      </div>
    </div>

    <div className="doc-info-box mt-6">
      <i className="fa-solid fa-circle-info text-blue-500 shrink-0" />
      <p className="text-sm text-blue-800">
        Hoặc đăng ký trực tiếp tại{" "}
        <Link to="/auth/register" className="font-semibold underline">
          gms-cloud.namduong.dev/auth/register
        </Link>
      </p>
    </div>
  </section>
);

const GuideToken = () => (
  <section id="guide-token" className="doc-section">
    <p className="doc-badge">Hướng dẫn</p>
    <h1 className="doc-h1">Tạo API Token</h1>
    <p className="doc-lead">
      API Token dùng để xác thực khi gọi endpoint upload ảnh từ server hoặc ứng dụng của bạn.
    </p>

    <div className="doc-steps">
      <div className="doc-step">
        <div className="doc-step-num">1</div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Đăng nhập tài khoản</p>
          <p className="text-sm text-gray-600">Truy cập dashboard và điều hướng đến <strong>Tài khoản → API</strong>.</p>
        </div>
      </div>

      <div className="doc-step">
        <div className="doc-step-num">2</div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Tạo token mới</p>
          <p className="text-sm text-gray-600 mb-3">Nhấn <strong>Tạo Token</strong>, đặt tên và thời hạn cho token.</p>
          <div className="doc-warning-box">
            <i className="fa-solid fa-triangle-exclamation text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Private Key chỉ hiển thị một lần.</strong> Hãy sao chép và lưu trữ an toàn ngay lập tức.
            </p>
          </div>
        </div>
      </div>

      <div className="doc-step">
        <div className="doc-step-num">3</div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Sử dụng token</p>
          <p className="text-sm text-gray-600 mb-2">Gửi cả hai key trong header của mỗi request:</p>
          <Code>{`X-Public-Key: your_public_key
X-Private-Key: your_private_key`}</Code>
        </div>
      </div>
    </div>

    <p className="text-sm text-gray-500 mt-4">
      Hoặc tạo token qua API (yêu cầu đăng nhập Cookie):
    </p>
    <Code>{`POST /api/guard/tokens
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "My App Token",
  "expires_at": "2026-12-31T00:00:00Z"
}`}</Code>
  </section>
);

const UseApi = () => (
  <section id="use-api" className="doc-section">
    <p className="doc-badge">Tài liệu</p>
    <h1 className="doc-h1">Sử dụng API</h1>
    <p className="doc-lead">
      Luồng upload ảnh gồm 3 bước: <strong>Presign</strong> → <strong>Upload trực tiếp lên S3</strong> → <strong>Complete</strong>.
      Chỉ chấp nhận file ảnh (<code className="doc-inline-code">image/*</code>).
    </p>

    <h2 className="doc-h2">Bước 1 — Presign</h2>
    <Code>{`POST /api/token/presign-upload
X-Public-Key: <public_key>
X-Private-Key: <private_key>
Content-Type: application/json

{
  "files": [
    {
      "client_file_id": "local-id-1",
      "name": "photo.jpg",
      "size": 204800,
      "type": "image/jpeg"
    }
  ]
}`}</Code>
    <p className="text-sm text-gray-500 mt-2 mb-6">
      Response trả về <code className="doc-inline-code">session_uuid</code> và <code className="doc-inline-code">mode</code> (<code className="doc-inline-code">single</code> hoặc <code className="doc-inline-code">multipart</code>).
    </p>

    <h2 className="doc-h2">Bước 2 — Lấy Presigned URL & Upload</h2>
    <Code>{`POST /api/token/sign-upload/:uuid
X-Public-Key: <public_key>
X-Private-Key: <private_key>
Content-Type: application/json

// Single:
{}

// Multipart (ví dụ 3 parts):
{ "is_multi": true, "parts": [1, 2, 3] }`}</Code>
    <p className="text-sm text-gray-500 mt-2 mb-2">Response trả về mảng <code className="doc-inline-code">upload_urls</code>. Upload file trực tiếp lên từng URL bằng <code className="doc-inline-code">PUT</code>:</p>
    <Code>{`PUT <presigned_url>
Content-Type: image/jpeg

<binary data>`}</Code>

    <h2 className="doc-h2">Bước 3 — Complete</h2>
    <p className="text-sm text-gray-600 mb-2">Single upload:</p>
    <Code>{`POST /api/token/complete-upload/:uuid
X-Public-Key: <public_key>
X-Private-Key: <private_key>`}</Code>
    <p className="text-sm text-gray-600 mt-4 mb-2">Multipart upload:</p>
    <Code>{`POST /api/token/complete-multipart-upload/:uuid
X-Public-Key: <public_key>
X-Private-Key: <private_key>
Content-Type: application/json

{
  "part_completes": [
    { "part_number": 1, "etag": "abc123", "size_bytes": 5242880 },
    { "part_number": 2, "etag": "def456", "size_bytes": 5242880 }
  ]
}`}</Code>

    <h2 className="doc-h2 mt-8">Tất cả endpoints</h2>
    <div className="space-y-6 mt-4">
      {API_GROUPS.map((g) => (
        <div key={g.group}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{g.group}</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {g.items.map((item) => (
                  <tr key={item.method + item.path} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 w-20">
                      <span className={`inline-block rounded border px-2 py-0.5 font-mono text-xs font-semibold ${METHOD_STYLE[item.method] ?? "bg-gray-100 text-gray-600"}`}>
                        {item.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-gray-700">{item.path}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Library = () => (
  <section id="library" className="doc-section">
    <p className="doc-badge">SDK</p>
    <h1 className="doc-h1">Thư viện</h1>
    <p className="doc-lead">Thư viện SDK đang được phát triển. Vui lòng quay lại sau.</p>
    <div className="doc-warning-box mt-4">
      <i className="fa-solid fa-clock text-amber-500 shrink-0" />
      <p className="text-sm text-amber-800">SDK JavaScript / Python sẽ sớm được phát hành. Hiện tại hãy sử dụng REST API trực tiếp.</p>
    </div>
  </section>
);

const Contact = () => (
  <section id="contact" className="doc-section">
    <p className="doc-badge">Hỗ trợ</p>
    <h1 className="doc-h1">Liên lạc</h1>
    <p className="doc-lead">Gặp vấn đề hoặc có câu hỏi? Liên hệ với chúng tôi qua các kênh sau.</p>

    <div className="doc-grid-2 mt-4">
      <a href="mailto:nguyennamduong205@gmail.com" className="doc-card doc-card-link">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg bg-blue-50 grid place-items-center">
            <i className="fa-solid fa-envelope text-blue-600 text-sm" />
          </div>
          <span className="font-semibold text-gray-800">Email</span>
        </div>
        <p className="text-sm text-gray-500">nguyennamduong205@gmail.com</p>
      </a>

      <a href="https://github.com/namduongit" target="_blank" rel="noreferrer" className="doc-card doc-card-link">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg bg-gray-100 grid place-items-center">
            <i className="fa-brands fa-github text-gray-700 text-sm" />
          </div>
          <span className="font-semibold text-gray-800">GitHub</span>
        </div>
        <p className="text-sm text-gray-500">github.com/namduongit</p>
      </a>
    </div>

    <div className="doc-info-box mt-6">
      <i className="fa-solid fa-circle-info text-blue-500 shrink-0" />
      <p className="text-sm text-blue-800">
        Phản hồi thường trong vòng <strong>24–48 giờ</strong> trong ngày làm việc.
      </p>
    </div>
  </section>
);

/* ─── Section map ────────────────────────────────────── */
const SECTION_MAP: Record<SectionId, React.ReactNode> = {
  "overview":       <Overview />,
  "guide-register": <GuideRegister />,
  "guide-token":    <GuideToken />,
  "use-api":        <UseApi />,
  "library":        <Library />,
  "contact":        <Contact />,
};

/* ─── Main page ──────────────────────────────────────── */
const DocumentPage = () => {
  const [active, setActive] = useState<SectionId>("overview");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  // Group nav items
  const groups: { heading?: string; items: NavItem[] }[] = [];
  let currentHeading: string | undefined;
  let currentItems: NavItem[] = [];
  NAV.forEach((item) => {
    if (item.parent !== currentHeading) {
      if (currentItems.length) groups.push({ heading: currentHeading, items: currentItems });
      currentHeading = item.parent;
      currentItems = [item];
    } else {
      currentItems.push(item);
    }
  });
  if (currentItems.length) groups.push({ heading: currentHeading, items: currentItems });

  return (
    <>
      <style>{`
        .doc-section { max-width: 720px; }
        .doc-badge { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#1a73e8; margin-bottom:6px; }
        .doc-h1 { font-size:1.75rem; font-weight:700; color:#111; line-height:1.25; margin-bottom:.75rem; }
        .doc-h2 { font-size:1rem; font-weight:600; color:#111; margin-top:1.75rem; margin-bottom:.5rem; }
        .doc-lead { font-size:.9375rem; color:#444; line-height:1.7; margin-bottom:1.25rem; }
        .doc-code { background:#f8f9fc; border:1px solid #e5e7eb; border-radius:10px; padding:1rem 1.25rem; font-size:.8125rem; line-height:1.65; color:#1f2937; overflow-x:auto; margin:0; white-space:pre-wrap; }
        .doc-inline-code { background:#f3f4f6; border-radius:4px; padding:1px 5px; font-family:monospace; font-size:.8125rem; color:#374151; }
        .doc-info-box { display:flex; gap:.75rem; align-items:flex-start; background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:1rem 1.25rem; color:#1e40af; }
        .doc-warning-box { display:flex; gap:.75rem; align-items:flex-start; background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:1rem 1.25rem; }
        .doc-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:640px){ .doc-grid-2{ grid-template-columns:1fr; } }
        .doc-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:1.1rem 1.25rem; }
        .doc-card-link { text-decoration:none; transition:box-shadow .15s,border-color .15s; }
        .doc-card-link:hover { border-color:#1a73e8; box-shadow:0 0 0 3px rgba(26,115,232,.08); }
        .doc-tag-blue { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; border-radius:6px; padding:2px 8px; font-size:.75rem; font-weight:600; }
        .doc-tag-purple { background:#f5f3ff; color:#6d28d9; border:1px solid #ddd6fe; border-radius:6px; padding:2px 8px; font-size:.75rem; font-weight:600; }
        .doc-steps { display:flex; flex-direction:column; gap:1.5rem; margin-top:1.25rem; }
        .doc-step { display:flex; gap:1rem; align-items:flex-start; }
        .doc-step-num { width:28px; height:28px; border-radius:50%; background:#1a73e8; color:#fff; font-size:.8125rem; font-weight:700; display:grid; place-items:center; flex-shrink:0; margin-top:1px; }
        .nav-item { display:block; width:100%; text-align:left; padding:.45rem .75rem; border-radius:8px; font-size:.8125rem; cursor:pointer; transition:background .12s,color .12s; color:#444; border:none; background:transparent; }
        .nav-item:hover { background:#f3f4f6; color:#111; }
        .nav-item.active { background:#eff6ff; color:#1a73e8; font-weight:600; }
        .nav-heading { font-size:.6875rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#9ca3af; padding:.5rem .75rem .25rem; margin-top:.5rem; }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", height:"100vh", fontFamily:"'Inter',system-ui,sans-serif", background:"#fff" }}>
        {/* Top bar */}
        <header style={{ borderBottom:"1px solid #e5e7eb", background:"rgba(255,255,255,.95)", backdropFilter:"blur(8px)", position:"sticky", top:0, zIndex:30, flexShrink:0 }}>
          <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 1.5rem", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <Link to="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"#1a73e8", display:"grid", placeItems:"center", color:"#fff", fontSize:10, fontWeight:900, letterSpacing:".5px" }}>GMS</div>
              <span style={{ fontSize:14, fontWeight:600, color:"#111" }}>API Documentation</span>
            </Link>
            <div style={{ display:"flex", gap:8 }}>
              <Link to="/auth/login" style={{ padding:"6px 14px", borderRadius:8, border:"1px solid #d1d5db", fontSize:13, fontWeight:500, color:"#374151", textDecoration:"none" }}>Đăng nhập</Link>
              <Link to="/auth/register" style={{ padding:"6px 14px", borderRadius:8, background:"#1a73e8", fontSize:13, fontWeight:600, color:"#fff", textDecoration:"none" }}>Bắt đầu</Link>
            </div>
          </div>
        </header>

        {/* Body */}
        <div style={{ display:"flex", flex:1, overflow:"hidden", maxWidth:1280, margin:"0 auto", width:"100%" }}>
          {/* Sidebar */}
          <aside style={{ width:240, flexShrink:0, borderRight:"1px solid #f0f0f0", overflowY:"auto", padding:"1.25rem .75rem", background:"#fafafa" }}>
            {groups.map((g, gi) => (
              <div key={gi}>
                {g.heading && <p className="nav-heading">{g.heading}</p>}
                {g.items.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item${active === item.id ? " active" : ""}${g.heading ? " pl-4" : ""}`}
                    style={g.heading ? { paddingLeft:"1.25rem" } : {}}
                    onClick={() => setActive(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* Content */}
          <main ref={contentRef} style={{ flex:1, overflowY:"auto", padding:"2.5rem 3rem 4rem", background:"#fff" }}>
            {SECTION_MAP[active]}
          </main>
        </div>
      </div>
    </>
  );
};

export default DocumentPage;
