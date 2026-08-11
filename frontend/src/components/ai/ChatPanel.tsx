import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConversation, useAIMutations } from "@/hooks/useAI";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { formatDate } from "@/utils/formatters";
import { toast } from "sonner";

interface ChatPanelProps {
  conversationId: string;
  userId: string;
  onDeleted?: () => void;
}

interface OptimisticMessage {
  id: string;
  userMessage: string;
  aiResponse: string;
  createdAt: string;
  pending?: boolean;
}

export const ChatPanel = ({
  conversationId,
  userId,
  onDeleted,
}: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [optimisticMsgs, setOptimisticMsgs] = useState<OptimisticMessage[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversation, isLoading } = useConversation(conversationId);
  const { sendMessage, isSendingMessage, deleteConversation } =
    useAIMutations();

  // Merge server messages with optimistic messages
  const serverMessages = conversation?.messages ?? [];
  const allMessages: OptimisticMessage[] = [
    ...serverMessages.map((m) => ({
      id: m.id,
      userMessage: m.userMessage,
      aiResponse: m.aiResponse,
      createdAt: m.createdAt,
    })),
    ...optimisticMsgs,
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSendingMessage) return;
    setInput("");

    // Optimistic message
    const tempId = `optimistic-${Date.now()}`;
    const optimistic: OptimisticMessage = {
      id: tempId,
      userMessage: text,
      aiResponse: "",
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setOptimisticMsgs((prev) => [...prev, optimistic]);

    try {
      const res = await sendMessage({ conversationId, message: text });
      // Replace optimistic with server response
      setOptimisticMsgs((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
              id: res.messageId,
              userMessage: res.userMessage,
              aiResponse: res.aiResponse,
              createdAt: res.timestamp,
            }
            : m
        )
      );
    } catch {
      setOptimisticMsgs((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async () => {
    try {
      await deleteConversation({ id: conversationId, userId });
      toast.success("Conversation deleted");
      onDeleted?.();
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card shrink-0">
        <div>
          <p className="font-semibold text-sm">
            {conversation?.title ?? "AI Conversation"}
          </p>
          <p className="text-xs text-muted-foreground">
            {allMessages.length} message{allMessages.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Ask anything about your documents.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {allMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="flex items-end gap-2 max-w-[80%]">
                    <div className="bg-violet-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm shadow-sm shadow-violet-500/20">
                      {msg.userMessage}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                  </div>
                </div>

                {/* AI bubble */}
                <div className="flex justify-start">
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm">
                      {msg.pending ? (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Thinking…
                        </span>
                      ) : (
                        <span className="whitespace-pre-line leading-relaxed">
                          {msg.aiResponse}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-[10px] text-muted-foreground/60 text-center">
                  {formatDate(msg.createdAt)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-border/50 bg-card">
        <div className="flex items-end gap-2 bg-muted/40 border border-border/60 rounded-2xl px-4 py-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask about your documents… (Enter to send)"
            className="flex-1 bg-transparent text-sm outline-none resize-none min-h-[24px] max-h-32 placeholder:text-muted-foreground/60 leading-relaxed"
            style={{ height: "24px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "24px";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isSendingMessage}
            className="h-8 w-8 shrink-0 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-sm disabled:opacity-40"
          >
            {isSendingMessage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName="this conversation"
        onConfirm={handleDelete}
      />
    </div>
  );
};
