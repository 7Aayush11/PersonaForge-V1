import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";

const api = process.env.REACT_APP_API_URL;

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  min-height: 100vh;
  background: #0b0e14;
  padding: 40px 24px 80px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 12px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageTitle = styled.h1`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 22px;
  font-weight: 700;
  color: #e6eef8;
  margin: 0;
`;

const PlanBadge = styled.span`
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 99px;
  ${(p) =>
    p.$premium
      ? `
    background: rgba(255, 107, 53, 0.18);
    color: #ff6b35;
    border: 1px solid rgba(255, 107, 53, 0.3);
  `
      : `
    background: rgba(139, 149, 167, 0.12);
    color: #8b95a7;
    border: 1px solid rgba(139, 149, 167, 0.2);
  `}
`;

const NewBtn = styled.button`
  background: ${(p) => (p.$locked ? "transparent" : "#ff6b35")};
  border: ${(p) =>
    p.$locked ? "1px solid rgba(255,107,53,0.3)" : "none"};
  color: ${(p) => (p.$locked ? "#ff6b35" : "#fff")};
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 13px;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: opacity 0.15s, background 0.15s;

  &:hover {
    opacity: 0.85;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  background: #141a24;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.16);
    transform: translateY(-2px);
  }
`;

const CardPreview = styled.div`
  height: 160px;
  background: linear-gradient(135deg, #1c2430 0%, #0f1520 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  position: relative;
  overflow: hidden;
`;

const CardPreviewPattern = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle at 30% 40%,
    rgba(255, 107, 53, 0.08) 0%,
    transparent 60%
  );
`;

const CardBody = styled.div`
  padding: 14px 16px;
`;

const CardTitle = styled.p`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 14px;
  font-weight: 600;
  color: #e6eef8;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardMeta = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 12px;
  color: #8b95a7;
  margin: 0;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const ActionBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #8b95a7;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 7px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: #e6eef8;
    background: rgba(255, 255, 255, 0.09);
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 24px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
`;

const EmptyTitle = styled.p`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 17px;
  font-weight: 600;
  color: #e6eef8;
  margin: 0 0 6px;
`;

const EmptyDesc = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 14px;
  color: #8b95a7;
  margin: 0;
`;

const LoadingRow = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #8b95a7;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 14px;
  gap: 10px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard({
  user,
  onOpen,
  onNew,
  entitlements,
  onUpgrade,
}) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const token =
    user?.access_token ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("sb-access-token")
      : null);

  const tier = entitlements?.tier || "free";
  const isPremium = tier === "premium";

  // Free tier users with 1+ portfolios are locked from creating more
  const isNewLocked =
    tier === "free" && portfolios.length >= 1;

  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`${api}/portfolios`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Failed to load portfolios (${res.status})`);
      }

      const data = await res.json();
      setPortfolios(data.portfolios || data || []);
    } catch (e) {
      console.error("Failed to load portfolios:", e);
      setLoadError("We couldn't load your portfolios. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user) {
      setPortfolios([]);
      setLoading(false);
      return;
    }

    fetchPortfolios();
  }, [user, fetchPortfolios]);

  const handleNew = () => {
    if (isNewLocked) {
      onUpgrade && onUpgrade();
    } else {
      onNew && onNew();
    }
  };

  const badgeLabel = isPremium
    ? "Premium ✦"
    : tier === "guest"
    ? "Guest"
    : "Free Plan";

  return (
    <Wrapper>
      <TopRow>
        <TitleGroup>
          <PageTitle>My Portfolios</PageTitle>
          <PlanBadge $premium={isPremium}>{badgeLabel}</PlanBadge>
        </TitleGroup>

        <NewBtn $locked={isNewLocked} onClick={handleNew}>
          {isNewLocked ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Upgrade for more
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Portfolio
            </>
          )}
        </NewBtn>
      </TopRow>

      <Grid>
        {loading ? (
          <LoadingRow>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
              </path>
            </svg>
            Loading portfolios…
          </LoadingRow>
        ) : loadError ? (
          <EmptyState>
            <EmptyTitle>Could not load portfolios</EmptyTitle>
            <EmptyDesc>{loadError}</EmptyDesc>
            <ActionBtn onClick={fetchPortfolios}>Try again</ActionBtn>
          </EmptyState>
        ) : portfolios.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📂</EmptyIcon>
            <EmptyTitle>No portfolios yet</EmptyTitle>
            <EmptyDesc>
              Generate your first portfolio from the home page.
            </EmptyDesc>
          </EmptyState>
        ) : (
          portfolios.map((p, i) => (
            <Card key={p.id || p.slug || i} onClick={() => onOpen && onOpen(p)}>
              <CardPreview>
                <CardPreviewPattern />
                <span style={{ position: "relative", opacity: 0.5 }}>
                  {p.name
                    ? p.name.slice(0, 2).toUpperCase()
                    : `P${i + 1}`}
                </span>
              </CardPreview>
              <CardBody>
                <CardTitle>{p.name || p.slug || `Portfolio ${i + 1}`}</CardTitle>
                <CardMeta>
                  {p.deployed_url
                    ? p.deployed_url.replace(/^https?:\/\//, "")
                    : p.created_at
                    ? new Date(p.created_at).toLocaleDateString()
                    : "Draft"}
                </CardMeta>
              </CardBody>
              <CardActions>
                <ActionBtn onClick={(e) => { e.stopPropagation(); onOpen && onOpen(p); }}>
                  Open
                </ActionBtn>
                {p.deployed_url && (
                  <ActionBtn
                    as="a"
                    href={p.deployed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit ↗
                  </ActionBtn>
                )}
              </CardActions>
            </Card>
          ))
        )}
      </Grid>
    </Wrapper>
  );
}