import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const toolbarButtons = [
  { label: "B", cmd: "bold", title: "Bold" },
  { label: "I", cmd: "italic", title: "Italic" },
  { label: "H2", cmd: "formatBlock", value: "h2", title: "Heading" },
  { label: "P", cmd: "formatBlock", value: "p", title: "Paragraph" },
  { label: "UL", cmd: "insertUnorderedList", title: "Bullet list" },
  { label: "OL", cmd: "insertOrderedList", title: "Numbered list" },
  { label: "❝", cmd: "formatBlock", value: "blockquote", title: "Quote" },
];

export default function RichTextEditor({ value, onChange, placeholder = "Start writing…" }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value && value !== lastEmitted.current) {
      ref.current.innerHTML = value;
      lastEmitted.current = value;
    }
  }, [value]);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) {
      const html = ref.current.innerHTML;
      lastEmitted.current = html;
      onChange(html);
    }
  }

  function insertLink() {
    const url = window.prompt("Enter URL:");
    if (url) exec("createLink", url);
  }

  function insertImage() {
    const url = window.prompt("Enter image URL:");
    if (url) exec("insertImage", url);
  }

  return (
    <div className="rounded-lg border border-[#dce4ea] focus-within:border-[#8ab5d6] focus-within:ring-2 focus-within:ring-[#8ab5d6]/40">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#e3e9f0] bg-[#f8fafc] p-2">
        {toolbarButtons.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={() => exec(b.cmd, b.value)}
            title={b.title}
            className="flex h-8 w-8 items-center justify-center rounded text-[12px] font-bold text-[#09123c] transition-colors hover:bg-white"
          >
            {b.label}
          </button>
        ))}
        <button
          type="button"
          onClick={insertLink}
          title="Link"
          className="flex h-8 w-8 items-center justify-center rounded text-[12px] font-bold text-[#09123c] transition-colors hover:bg-white"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={insertImage}
          title="Image"
          className="flex h-8 w-8 items-center justify-center rounded text-[12px] font-bold text-[#09123c] transition-colors hover:bg-white"
        >
          🖼
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          if (ref.current) {
            const html = ref.current.innerHTML;
            lastEmitted.current = html;
            onChange(html);
          }
        }}
        onBlur={() => {
          if (ref.current) {
            const html = ref.current.innerHTML;
            lastEmitted.current = html;
            onChange(html);
          }
        }}
        className="min-h-[320px] p-4 text-[14px] leading-relaxed text-[#09123c] outline-none [&_a]:text-[#cc091b] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#c8dce8] [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:text-[18px] [&_h2]:font-bold [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        data-placeholder={placeholder}
        style={{ emptyCells: "show" }}
      />
    </div>
  );
}
