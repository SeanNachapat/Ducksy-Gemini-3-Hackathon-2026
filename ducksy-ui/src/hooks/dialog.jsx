"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DialogContext = createContext(null);

const sizeClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-2xl",
      full: "max-w-4xl",
};

export function DialogProvider({ children }) {
      const [isOpen, setIsOpen] = useState(false);
      const [options, setOptions] = useState(null);

      const open = useCallback((newOptions) => {
            setOptions({
                  showCloseButton: true,
                  closeOnOverlayClick: true,
                  size: "xl",
                  ...newOptions,
            });
            setIsOpen(true);
      }, []);

      const close = useCallback(() => {
            setIsOpen(false);
            options?.onClose?.();
            setTimeout(() => setOptions(null), 200);
      }, [options]);

      const update = useCallback((newOptions) => {
            setOptions((prev) => (prev ? { ...prev, ...newOptions } : null));
      }, []);

      return (
            <DialogContext.Provider value={{ isOpen, open, close, update }}>
                  {children}
                  <AnimatePresence>
                        {isOpen && options && (
                              <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                    onClick={() => options.closeOnOverlayClick && close()}
                              >
                                    <motion.div
                                          initial={{ scale: 0.95, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          exit={{ scale: 0.95, opacity: 0 }}
                                          className={`bg-neutral-900 border border-neutral-800 rounded-2xl w-full ${sizeClasses[options.size || "xl"]} max-h-[80vh] overflow-hidden`}
                                          onClick={(e) => e.stopPropagation()}
                                    >
                                          {/* Header */}
                                          {(options.title || options.showCloseButton) && (
                                                <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                                                      <h3 className="font-semibold text-white">
                                                            {options.title || ""}
                                                      </h3>
                                                      {options.showCloseButton && (
                                                            <button
                                                                  onClick={close}
                                                                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors text-white"
                                                            >
                                                                  ✕
                                                            </button>
                                                      )}
                                                </div>
                                          )}

                                          {/* Content */}
                                          <div className="p-4 overflow-y-auto max-h-[60vh]">
                                                {options.content}
                                          </div>
                                    </motion.div>
                              </motion.div>
                        )}
                  </AnimatePresence>
            </DialogContext.Provider>
      );
}

export function useDialog() {
      const context = useContext(DialogContext);
      if (!context) {
            throw new Error("useDialog must be used within a DialogProvider");
      }
      return context;
}

export function useConfirmDialog() {
      const { open, close } = useDialog();

      const confirm = useCallback(
            ({
                  title = "Confirm",
                  message,
                  confirmText = "Confirm",
                  cancelText = "Cancel",
                  onConfirm,
                  onCancel,
                  variant = "default",
                  addons = null
            }) => {
                  open({
                        title,
                        size: "sm",
                        content: (
                              <div className="space-y-4">
                                    <p className="text-neutral-300">{message}</p>
                                    <div className="z-50">
                                          {addons}
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                          <button
                                                onClick={() => {
                                                      onCancel?.();
                                                      close();
                                                }}
                                                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                                          >
                                                {cancelText}
                                          </button>
                                          <button
                                                onClick={() => {
                                                      onConfirm();
                                                      close();
                                                }}
                                                className={`px-4 py-2 rounded-lg transition-colors ${variant === "danger"
                                                      ? "bg-red-600 hover:bg-red-500 text-white"
                                                      : "bg-amber-500 hover:bg-amber-400 text-black"
                                                      }`}
                                          >
                                                {confirmText}
                                          </button>
                                    </div>
                              </div>
                        ),
                  });
            },
            [open, close]
      );

      return { confirm };
}

export function useAlertDialog() {
      const { open, close } = useDialog();

      const alert = useCallback(
            ({
                  title = "Alert",
                  message,
                  buttonText = "OK",
                  onClose: onCloseCallback,
            }) => {
                  open({
                        title,
                        size: "sm",
                        content: (
                              <div className="space-y-4">
                                    <p className="text-neutral-300">{message}</p>
                                    <div className="flex justify-end">
                                          <button
                                                onClick={() => {
                                                      onCloseCallback?.();
                                                      close();
                                                }}
                                                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-colors"
                                          >
                                                {buttonText}
                                          </button>
                                    </div>
                              </div>
                        ),
                  });
            },
            [open, close]
      );

      return { alert };
}