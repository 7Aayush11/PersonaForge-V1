import { useState, useEffect, useRef, useCallback } from "react";
import { assemblePreviewHTML } from "../utils/assemblePreview";

const MAX_HEAL_ATTEMPTS = 2;
const api = process.env.REACT_APP_API_URL;

export function useSelfHealingPreview(files, setFiles, addToast) {
  const [isHealing, setIsHealing] = useState(false);
  const lastGoodRef = useRef(null);
  const healAttemptsRef = useRef(0);
  const healingInFlightRef = useRef(false);
  const blobPathMapRef = useRef({});

  blobPathMapRef.current = {};
  const previewHtml = files ? assemblePreviewHTML(files, blobPathMapRef.current) : "";

  useEffect(() => {
    healAttemptsRef.current = 0;
  }, [files]);

  useEffect(() => {
    if (!files) return;
    const timer = setTimeout(() => {
      lastGoodRef.current = files;
    }, 1500);
    return () => clearTimeout(timer);
  }, [files]);

  const revertToLastGood = useCallback((reason) => {
    if (lastGoodRef.current) {
      setFiles(lastGoodRef.current);
    }
    addToast({
      type: "error",
      title: "Couldn't auto-fix this one",
      message: reason || "Reverted to your last working version. Try rephrasing your edit.",
    });
  }, [setFiles, addToast]);

  const attemptHeal = useCallback(async (errorMessage, implicatedPaths) => {
    if (healingInFlightRef.current) return;

    if (healAttemptsRef.current >= MAX_HEAL_ATTEMPTS) {
      revertToLastGood();
      return;
    }

    healingInFlightRef.current = true;
    healAttemptsRef.current += 1;
    setIsHealing(true);

    try {
      const res = await fetch(`${api}/self-heal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, error: errorMessage, implicated_files: implicatedPaths }),
      });

      const data = await res.json();

      if (!res.ok || !data.files || Object.keys(data.files).length === 0) {
        throw new Error(data.detail || "No fix returned");
      }

      setFiles((prev) => ({ ...prev, ...data.files }));
    } catch (e) {
      revertToLastGood();
    } finally {
      healingInFlightRef.current = false;
      setIsHealing(false);
    }
  }, [files, setFiles, revertToLastGood]);

  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type !== "PREVIEW_ERROR") return;
      const stack = event.data.message || "";
      const blobUrls = stack.match(/blob:[^\s)'"]+/g) || [];
      const implicated = [...new Set(blobUrls.map((u) => blobPathMapRef.current[u]).filter(Boolean))];
      attemptHeal(stack, implicated);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [attemptHeal]);

  return { previewHtml, isHealing };
}