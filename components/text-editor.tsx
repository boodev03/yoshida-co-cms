import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Sanitize HTML content to remove unwanted attributes like Figma metadata
const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== "string") return "";

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Function to recursively clean elements
  const cleanElement = (element: Element): void => {
    // Remove unwanted attributes, keeping only basic formatting attributes
    const allowedAttributes = ["href", "target", "src", "alt", "title"];
    const attributesToRemove: string[] = [];

    // Collect attributes to remove
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (!allowedAttributes.includes(attr.name)) {
        attributesToRemove.push(attr.name);
      }
    }

    // Remove unwanted attributes
    attributesToRemove.forEach((attrName) => {
      element.removeAttribute(attrName);
    });

    // Recursively clean child elements
    Array.from(element.children).forEach((child) => {
      cleanElement(child);
    });
  };

  // Function to unwrap unnecessary elements
  const unwrapElement = (element: Element): void => {
    const parent = element.parentNode;
    if (!parent) return;

    // Move all child nodes to the parent
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }

    // Remove the empty element
    parent.removeChild(element);
  };

  // Function to check if an element should be unwrapped
  const shouldUnwrap = (element: Element): boolean => {
    const tagName = element.tagName.toLowerCase();

    // Unwrap empty spans and divs
    if (
      (tagName === "span" || tagName === "div") &&
      element.attributes.length === 0
    ) {
      // Check if it's just a wrapper with no meaningful formatting
      const hasFormattingChildren = Array.from(element.children).some(
        (child) => {
          const childTag = child.tagName.toLowerCase();
          return [
            "b",
            "strong",
            "i",
            "em",
            "u",
            "a",
            "ul",
            "ol",
            "li",
          ].includes(childTag);
        }
      );

      // If it's just a wrapper div/span with plain text or other wrapper elements, unwrap it
      if (!hasFormattingChildren) {
        return true;
      }
    }

    return false;
  };

  // Clean all child elements first
  Array.from(tempDiv.children).forEach((child) => {
    cleanElement(child);
  });

  // Then unwrap unnecessary elements (do this multiple times to handle nested wrappers)
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    // Prevent infinite loops
    changed = false;
    iterations++;

    const elements = Array.from(tempDiv.querySelectorAll("span, div"));
    elements.forEach((element) => {
      if (shouldUnwrap(element)) {
        unwrapElement(element);
        changed = true;
      }
    });
  }

  // Clean up extra whitespace and normalize line breaks
  let result = tempDiv.innerHTML;

  // Replace multiple consecutive <br> tags with paragraph breaks
  result = result.replace(/(<br\s*\/?>){2,}/gi, "</p><p>");

  // Wrap content in paragraphs if it's not already wrapped
  if (result && !result.match(/^<(p|div|h[1-6]|ul|ol)/i)) {
    result = `<p>${result}</p>`;
  }

  // Clean up empty paragraphs
  result = result.replace(/<p><\/p>/gi, "");

  return result;
};

export function TextEditor({ value, onChange, placeholder }: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const sanitizedContent = sanitizeHTML(editorRef.current.innerHTML);
      onChange(sanitizedContent);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const sanitizedContent = sanitizeHTML(editorRef.current.innerHTML);
      onChange(sanitizedContent);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    // Get plain text from clipboard
    const text = e.clipboardData.getData("text/plain");

    // Insert plain text at cursor position
    document.execCommand("insertText", false, text);

    // Trigger content update
    if (editorRef.current) {
      const sanitizedContent = sanitizeHTML(editorRef.current.innerHTML);
      onChange(sanitizedContent);
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("bold")}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("italic")}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "min-h-[120px] p-3 outline-none text-base",
          "prose prose-sm max-w-none",
          "[&_ul]:list-disc [&_ul]:ml-6",
          "[&_ol]:list-decimal [&_ol]:ml-6",
          "[&_li]:mb-1",
          !value && !isFocused && "text-gray-500"
        )}
        data-placeholder={placeholder}
        style={{
          whiteSpace: "pre-wrap",
        }}
      />
      {!value && !isFocused && (
        <div className="absolute top-[52px] left-3 text-gray-500 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
}
