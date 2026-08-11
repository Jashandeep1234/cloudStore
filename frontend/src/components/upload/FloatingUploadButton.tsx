import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingUploadButtonProps {
  onClick: () => void;
  isVisible?: boolean;
}

export const FloatingUploadButton = ({ onClick, isVisible = true }: FloatingUploadButtonProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <Button
            size="icon"
            className="w-14 h-14 rounded-full shadow-2xl hover:shadow-primary/50 transition-all"
            onClick={onClick}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
