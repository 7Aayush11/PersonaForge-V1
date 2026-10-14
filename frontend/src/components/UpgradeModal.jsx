import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const api = process.env.REACT_APP_API_URL;

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    amount_paise: 9900,
    description: "Billed every month",
    badge: null,
  },
  {
    id: "quarterly",
    label: "Quarterly",
    amount_paise: 24900,
    description: "Billed every 3 months",
    badge: "Best Value",
  },
];

function formatPrice(paise) {
  return `₹${(paise / 100).toFixed(0)}`;
}

function getPeriod(id) {
  if (id === "monthly") return "/mo";
  if (id === "quarterly") return "/3 mo";
  return "";
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Styled components ────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0 }
  to   { opacity: 1 }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) }
  to   { opacity: 1; transform: translateY(0) }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(11, 14, 20, 0.82);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ${fadeIn} 0.18s ease;
`;

const Modal = styled.div`
  background: #141a24;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.22s ease;
  padding: 32px 28px 28px;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  color: #8b95a7;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e6eef8;
  }
`;

const Eyebrow = styled.p`
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ff6b35;
  margin: 0 0 8px;
`;

const Title = styled.h2`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 24px;
  font-weight: 700;
  color: #e6eef8;
  margin: 0 0 6px;
  text-wrap: balance;
`;

const Subtitle = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 14px;
  color: #8b95a7;
  margin: 0 0 28px;
  line-height: 1.5;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.button`
  background: ${(p) =>
    p.$selected ? "rgba(255,107,53,0.12)" : "rgba(255,255,255,0.03)"};
  border: 1.5px solid
    ${(p) => (p.$selected ? "#ff6b35" : "rgba(255,255,255,0.08)")};
  border-radius: 12px;
  padding: 16px 14px;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${(p) =>
      p.$selected ? "#ff6b35" : "rgba(255,255,255,0.18)"};
    background: ${(p) =>
      p.$selected
        ? "rgba(255,107,53,0.15)"
        : "rgba(255,255,255,0.05)"};
  }
`;

const PlanBadge = styled.span`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff6b35;
  color: #fff;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 99px;
  white-space: nowrap;
`;

const PlanName = styled.p`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 13px;
  font-weight: 600;
  color: #e6eef8;
  margin: 0 0 8px;
`;

const PlanPrice = styled.p`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 22px;
  font-weight: 700;
  color: ${(p) => (p.$selected ? "#ff6b35" : "#e6eef8")};
  margin: 0 0 2px;
  transition: color 0.15s;

  span {
    font-size: 13px;
    font-weight: 400;
    color: #8b95a7;
  }
`;

const PlanDesc = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 11px;
  color: #8b95a7;
  margin: 0;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeatureItem = styled.li`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  color: #8b95a7;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "✓";
    color: #1abc9c;
    font-weight: 700;
    flex-shrink: 0;
  }
`;

const SubscribeBtn = styled.button`
  width: 100%;
  background: #ff6b35;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  color: #ef4444;
  margin: 12px 0 0;
  text-align: center;
`;

const SignInPrompt = styled.div`
  text-align: center;
  padding: 16px 0;

  p {
    font-family: var(--font-body, "Inter", sans-serif);
    font-size: 14px;
    color: #8b95a7;
    margin: 0 0 16px;
  }
`;

const SignInLink = styled.button`
  background: rgba(255, 107, 53, 0.15);
  color: #ff6b35;
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 8px;
  padding: 10px 20px;
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 107, 53, 0.25);
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function UpgradeModal({ onClose, onSuccess, user, onSignIn, addToast }) {
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token =
    user?.access_token ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("sb-access-token")
      : null);

  const isSignedIn = !!user;

  const handleSubscribe = async () => {
    setError(null);
    setLoading(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Could not load payment processor. Check your connection.");
      }

      // Create subscription
      const res = await fetch(`${api}/billing/create-subscription`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.detail?.message ||
            body?.detail ||
            "Failed to create subscription."
        );
      }

      const { key_id, subscription_id, amount_paise, name, description } =
        await res.json();

      // Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const options = {
          key: key_id,
          subscription_id,
          name: name || "PersonaForge Premium",
          description: description || "Premium subscription",
          amount: amount_paise,
          currency: "INR",
          theme: { color: "#FF6B35" },
          handler: async (response) => {
            try {
              const verifyRes = await fetch(`${api}/billing/verify`, {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_subscription_id: response.razorpay_subscription_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!verifyRes.ok) {
                const body = await verifyRes.json().catch(() => ({}));
                reject(
                  new Error(
                    body?.detail?.message || "Payment verification failed."
                  )
                );
                return;
              }

              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error("__DISMISSED__"));
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          reject(
            new Error(
              response.error?.description || "Payment failed. Please try again."
            )
          );
        });
        rzp.open();
      });

      addToast && addToast("Welcome to Premium! Enjoy unlimited access.", "success");
      onSuccess && onSuccess();
    } catch (err) {
      if (err.message === "__DISMISSED__") {
        // User dismissed the modal — not an error
      } else {
        setError(err.message || "Something went wrong.");
        addToast && addToast(err.message || "Payment failed.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal>
        <CloseBtn onClick={onClose} aria-label="Close">×</CloseBtn>

        <Eyebrow>Upgrade</Eyebrow>
        <Title>Go Premium</Title>
        <Subtitle>
          Unlock premium AI access, portfolio editing and deployment tools.
        </Subtitle>

        {!isSignedIn ? (
          <SignInPrompt>
            <p>Sign in first to subscribe and sync your premium access across devices.</p>
            <SignInLink
              onClick={() => {
                onClose();
                onSignIn && onSignIn();
              }}
            >
              Sign in to continue
            </SignInLink>
          </SignInPrompt>
        ) : (
          <>
            <PlansGrid>
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  $selected={selectedPlan === plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  aria-pressed={selectedPlan === plan.id}
                >
                  {plan.badge && <PlanBadge>{plan.badge}</PlanBadge>}
                  <PlanName>{plan.label}</PlanName>
                  <PlanPrice $selected={selectedPlan === plan.id}>
                    {formatPrice(plan.amount_paise)}
                    <span>{getPeriod(plan.id)}</span>
                  </PlanPrice>
                  <PlanDesc>{plan.description}</PlanDesc>
                </PlanCard>
              ))}
            </PlansGrid>

            <FeatureList>
              <FeatureItem>Premium AI model access and faster responses</FeatureItem>
              <FeatureItem>Unlimited portfolio generation and AI-assisted editing</FeatureItem>
              <FeatureItem>Download portfolio source as ZIP</FeatureItem>
            </FeatureList>

            <SubscribeBtn onClick={handleSubscribe} disabled={loading}>
              {loading ? "Processing…" : `Subscribe — ${formatPrice(PLANS.find((p) => p.id === selectedPlan)?.amount_paise || 0)}${getPeriod(selectedPlan)}`}
            </SubscribeBtn>

            {error && <ErrorMsg>{error}</ErrorMsg>}
          </>
        )}
      </Modal>
    </Overlay>
  );
}