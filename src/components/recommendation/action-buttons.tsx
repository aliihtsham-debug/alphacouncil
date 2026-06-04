"use client";

/**
 * Action Buttons Component
 *
 * Approve, Modify, Reject buttons with loading states and confirmation dialogs.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Check, X, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ActionButtonsProps {
  isExecuting: boolean;
  showModify: boolean;
  onApprove: () => void;
  onReject: () => void;
  onToggleModify: () => void;
  className?: string;
}

export function ActionButtons({
  isExecuting,
  showModify,
  onApprove,
  onReject,
  onToggleModify,
  className,
}: ActionButtonsProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleApproveClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmApprove = () => {
    setShowConfirm(false);
    onApprove();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={className}
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            variant="success"
            size="lg"
            className="gap-2"
            onClick={handleApproveClick}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Check className="h-5 w-5" />
            )}
            {isExecuting ? "Executing..." : "Approve Trade"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={onToggleModify}
            disabled={isExecuting}
          >
            <Edit3 className="h-5 w-5" />
            {showModify ? "Cancel Modify" : "Modify"}
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="gap-2"
            onClick={onReject}
            disabled={isExecuting}
          >
            <X className="h-5 w-5" />
            Reject
          </Button>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Trade Execution</DialogTitle>
            <DialogDescription>
              You are about to execute this trade via Trust Wallet. This action
              will initiate a blockchain transaction that cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleConfirmApprove}>
              Confirm & Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
