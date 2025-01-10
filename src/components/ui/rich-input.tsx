import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ChatCenteredDots,
  HighlighterCircle,
  LinkSimple,
  ListBullets,
  ListNumbers,
  Minus,
  Paragraph as ParagraphIcon,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  TextAUnderline,
  TextB,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextIndent,
  TextItalic,
  TextOutdent,
  TextStrikethrough,
} from "@phosphor-icons/react";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import {
  BubbleMenu,
  Editor,
  EditorContent,
  EditorContentProps,
  useEditor,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { forwardRef, useCallback, useEffect } from "react";

import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

const Toolbar = ({ editor, isEdit }: { editor: Editor; isEdit: boolean }) => {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div
      className={cn(
        "flex-wrap gap-0.5 border rounded-t-md p-1 border-sky-400/80",
        isEdit ? "flex" : "hidden"
      )}
    >
      <TooltipProviderPage value="Bold">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            "hover:bg-sky-100",
            editor.isActive("bold") && "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().toggleBold().run()}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <TextB />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Italic">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            "hover:bg-sky-100",
            editor.isActive("italic") && "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <TextItalic />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Strikethrough">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            "hover:bg-sky-100",
            editor.isActive("strike") && "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <TextStrikethrough />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Underline">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            "hover:bg-sky-100",
            editor.isActive("underline") && "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <TextAUnderline />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Highlight">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            "hover:bg-sky-100",
            editor.isActive("highlight") && "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().toggleHighlight().run()}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <HighlighterCircle />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Hyperlink">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="px-2"
          onClick={setLink}
        >
          <LinkSimple />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Heading 1">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            editor.isActive("heading", { level: 1 }) &&
              "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <TextHOne />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Heading 2">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            editor.isActive("heading", { level: 2 }) &&
              "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <TextHTwo />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Heading 3">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            editor.isActive("heading", { level: 3 }) &&
              "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <TextHThree />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Paragraph">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            "hover:bg-sky-100",
            editor.isActive("paragraph") && "bg-sky-200 hover:bg-sky-200"
          )}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <ParagraphIcon />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Align Left">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            "hover:bg-sky-100",
            editor.isActive({ textAlign: "left" }) &&
              "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().setTextAlign("left").run()}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <TextAlignLeft />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Align Center">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            editor.isActive({ textAlign: "center" }) &&
              "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().setTextAlign("center").run()}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <TextAlignCenter />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Align Right">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            editor.isActive({ textAlign: "right" }) &&
              "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().setTextAlign("right").run()}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <TextAlignRight />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Align Justify">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            editor.isActive({ textAlign: "justify" }) &&
              "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().setTextAlign("justify").run()}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <TextAlignJustify />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Bullet List">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            "hover:bg-sky-100",
            editor.isActive("bulletList") && "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListBullets />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Numbered List">
        <Button
          size="icon"
          variant={"ghost"}
          className={cn(
            "hover:bg-sky-100",
            editor.isActive("orderedList") && "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListNumbers />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Outdent">
        <Button
          size="icon"
          variant="ghost"
          className="px-2"
          disabled={
            !editor.can().chain().focus().liftListItem("listItem").run()
          }
          onClick={() => editor.chain().focus().liftListItem("listItem").run()}
        >
          <TextOutdent />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Indent">
        <Button
          size="icon"
          variant="ghost"
          className="px-2 hover:bg-sky-100"
          disabled={
            !editor.can().chain().focus().sinkListItem("listItem").run()
          }
          onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
        >
          <TextIndent />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Note">
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "hover:bg-sky-100",
            editor.isActive("blockquote") && "bg-sky-200 hover:bg-sky-200"
          )}
          disabled={!editor.can().chain().focus().toggleBlockquote().run()}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <ChatCenteredDots />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Insert Horizontal Rule">
        <Button
          size="icon"
          variant="ghost"
          className="px-2 hover:bg-sky-100"
          disabled={!editor.can().chain().focus().setHorizontalRule().run()}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Undo">
        <Button
          size="icon"
          variant="ghost"
          className="px-2 hover:bg-sky-100"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <ArrowCounterClockwise />
        </Button>
      </TooltipProviderPage>

      <TooltipProviderPage value="Redo">
        <Button
          size="icon"
          variant="ghost"
          className="px-2 hover:bg-sky-100"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <ArrowClockwise />
        </Button>
      </TooltipProviderPage>
    </div>
  );
};

type RichInputProps = {
  content?: string;
  isEdit?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  editorClassName?: string;
} & Omit<
  EditorContentProps,
  "ref" | "editor" | "content" | "value" | "onChange" | "className"
>;

export const RichInput = forwardRef<Editor, RichInputProps>(
  (
    { content, isEdit = false, onChange, className, editorClassName, ...props },
    _ref // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Image,
        Underline,
        Highlight,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Link.extend({ inclusive: false }).configure({ openOnClick: false }),
      ],
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm prose-zinc max-h-[200px] max-w-none overflow-y-scroll dark:prose-invert focus:outline-none [&_*]:my-2",
            editorClassName
          ),
        },
      },
      content,
      parseOptions: { preserveWhitespace: "full" },
      onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    });

    const setLink = useCallback(() => {
      if (editor) {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        // cancelled
        if (url === null) {
          return;
        }

        // empty
        if (url === "") {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();

          return;
        }

        // update link
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
    }, [editor]);

    useEffect(() => {
      if (editor) {
        editor.setEditable(isEdit);
      }
    }, [isEdit]);

    if (!editor) {
      return (
        <div className="space-y-2">
          <Skeleton className={cn("h-[42px] w-full")} />
          <Skeleton className="h-[90px] w-full" />
        </div>
      );
    }

    return (
      <div>
        <Toolbar editor={editor} isEdit={isEdit} />
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex bg-white py-1 px-1.5 rounded-lg border shadow">
              <TooltipProviderPage value="Bold">
                <Button
                  size="icon"
                  variant={"ghost"}
                  className={cn(
                    "hover:bg-sky-100",
                    editor.isActive("bold") && "bg-sky-200 hover:bg-sky-200"
                  )}
                  disabled={!editor.can().chain().toggleBold().run()}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <TextB />
                </Button>
              </TooltipProviderPage>

              <TooltipProviderPage value="Italic">
                <Button
                  size="icon"
                  variant={"ghost"}
                  className={cn(
                    "hover:bg-sky-100",
                    editor.isActive("italic") && "bg-sky-200 hover:bg-sky-200"
                  )}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <TextItalic />
                </Button>
              </TooltipProviderPage>

              <TooltipProviderPage value="Strikethrough">
                <Button
                  size="icon"
                  variant={"ghost"}
                  className={cn(
                    "hover:bg-sky-100",
                    editor.isActive("strike") && "bg-sky-200 hover:bg-sky-200"
                  )}
                  disabled={!editor.can().chain().focus().toggleStrike().run()}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                  <TextStrikethrough />
                </Button>
              </TooltipProviderPage>

              <TooltipProviderPage value="Underline">
                <Button
                  size="icon"
                  variant={"ghost"}
                  className={cn(
                    "hover:bg-sky-100",
                    editor.isActive("underline") &&
                      "bg-sky-200 hover:bg-sky-200"
                  )}
                  disabled={
                    !editor.can().chain().focus().toggleUnderline().run()
                  }
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  <TextAUnderline />
                </Button>
              </TooltipProviderPage>

              <TooltipProviderPage value="Highlight">
                <Button
                  size="icon"
                  variant={"ghost"}
                  className={cn(
                    "hover:bg-sky-100",
                    editor.isActive("highlight") &&
                      "bg-sky-200 hover:bg-sky-200"
                  )}
                  disabled={
                    !editor.can().chain().focus().toggleHighlight().run()
                  }
                  onClick={() => editor.chain().focus().toggleHighlight().run()}
                >
                  <HighlighterCircle />
                </Button>
              </TooltipProviderPage>

              <TooltipProviderPage value="Hyperlink">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="px-2"
                  onClick={setLink}
                >
                  <LinkSimple />
                </Button>
              </TooltipProviderPage>
            </div>
          </BubbleMenu>
        )}
        <EditorContent
          editor={editor}
          className={cn(
            "grid min-h-[250px] w-full  border bg-transparent px-3 py-2 text-sm placeholder:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 antialiased border-sky-400/80",
            className,
            isEdit ? "border-t-0 rounded-b-md" : "rounded-md"
          )}
          {...props}
        />
      </div>
    );
  }
);

RichInput.displayName = "RichInput";
