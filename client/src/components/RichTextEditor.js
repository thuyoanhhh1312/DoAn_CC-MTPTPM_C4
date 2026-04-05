// client/src/components/RichTextEditor.jsx
import { useEffect, useRef, useState } from "react";

// Adapter upload ảnh lên backend
class BlogImageUploadAdapter {
  constructor(loader, uploadUrl) {
    this.loader = loader;
    this.uploadUrl = uploadUrl;
    this.controller = new AbortController();
  }

  // CKEditor sẽ gọi hàm này khi upload
  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          const data = new FormData();
          data.append("upload", file); // field name phải trùng với multer.single('upload')

          fetch(this.uploadUrl, {
            method: "POST",
            body: data,
            signal: this.controller.signal,
          })
            .then(async (res) => {
              if (!res.ok) {
                const err = await res.text();
                throw new Error(
                  err || `Upload failed with status ${res.status}`,
                );
              }
              return res.json();
            })
            .then((json) => {
              if (!json || !json.url) {
                throw new Error("Invalid upload response");
              }

              // CKEditor cần return object có key "default"
              resolve({
                default: json.url,
              });
            })
            .catch((err) => {
              console.error("Upload error:", err);
              reject(err);
            });
        }),
    );
  }

  // Nếu user cancel
  abort() {
    this.controller.abort();
  }
}

const CKEDITOR_CDN_URL =
  "https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/ckeditor.js";

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const [mode, setMode] = useState("loading");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const loadCkeditorScript = () =>
    new Promise((resolve, reject) => {
      if (window.ClassicEditor) {
        resolve(window.ClassicEditor);
        return;
      }

      const existing = document.querySelector(
        'script[data-ckeditor="classic"]',
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(window.ClassicEditor));
        existing.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.src = CKEDITOR_CDN_URL;
      script.async = true;
      script.dataset.ckeditor = "classic";
      script.onload = () => resolve(window.ClassicEditor);
      script.onerror = reject;
      document.body.appendChild(script);
    });

  useEffect(() => {
    if (editorInstanceRef.current) return;

    const API_BASE =
      import.meta.env.VITE_API_URL || "http://localhost:3001/api";
    const uploadUrl = `${API_BASE}/uploads/blog-image`;

    const init = async () => {
      try {
        await loadCkeditorScript();
      } catch (error) {
        console.error("Không thể tải CKEditor, fallback sang textarea:", error);
        setMode("fallback");
        return;
      }

      if (!window.ClassicEditor || !editorRef.current) {
        setMode("fallback");
        return;
      }

      window.ClassicEditor.create(editorRef.current, {
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "|",
          "imageUpload", // dùng plugin upload ảnh
          "blockQuote",
          "insertTable",
          "undo",
          "redo",
        ],
      })
        .then((editor) => {
          editorInstanceRef.current = editor;
          setMode("editor");

          // Gắn adapter upload cho FileRepository
          editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
            new BlogImageUploadAdapter(loader, uploadUrl);

          // set data ban đầu
          editor.setData(initialValueRef.current || "");

          // lắng nghe thay đổi
          editor.model.document.on("change:data", () => {
            onChangeRef.current(editor.getData());
          });
        })
        .catch((error) => {
          console.error("CKEditor init error:", error);
          setMode("fallback");
        });
    };

    init();

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy().catch(console.error);
        editorInstanceRef.current = null;
      }
    };
  }, []);

  // nếu prop value đổi từ ngoài vào (trang edit)
  useEffect(() => {
    if (!editorInstanceRef.current) return;
    const current = editorInstanceRef.current.getData();
    if (value !== current) {
      editorInstanceRef.current.setData(value || "");
    }
  }, [value]);

  if (mode === "fallback") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        placeholder="Nhập nội dung bài viết..."
        className="w-full p-4 min-h-[220px] border rounded-xl outline-none focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20"
      />
    );
  }

  return (
    <div className="border rounded min-h-[200px]">
      {mode === "loading" && (
        <div className="p-3 text-sm text-gray-500">
          Đang tải trình soạn thảo...
        </div>
      )}
      <div ref={editorRef} />
    </div>
  );
};

export default RichTextEditor;
