import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { supabase } from "../supabaseClient";

const fadeUp = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

const Wrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  gap: 32px;
  overflow-y: auto;
  animation: ${fadeUp} 0.3s ease;
`;

const TopRow = styled.div`
  width: 100%;
  max-width: 860px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const NewBtn = styled.button`
  padding: 9px 20px;
  border-radius: 20px;
  border: none;
  background: var(--ember);
  color: #1a0f08;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: filter 0.15s ease;
  &:hover { filter: brightness(1.1); }
`;

const Grid = styled.div`
  width: 100%;
  max-width: 860px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s ease;
  &:hover { border-color: var(--steel); }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
`;

const Badge = styled.span`
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 3px 9px;
  border-radius: 20px;
  flex-shrink: 0;
  background: ${p => p.$live ? "rgba(26,188,156,0.12)" : "rgba(255,255,255,0.05)"};
  border: 1px solid ${p => p.$live ? "rgba(26,188,156,0.35)" : "var(--border)"};
  color: ${p => p.$live ? "var(--mint)" : "var(--text-muted)"};
`;

const CardMeta = styled.p`
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
`;

const LiveLink = styled.a`
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--steel);
  text-decoration: none;
  word-break: break-all;
  &:hover { text-decoration: underline; }
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  flex: 1;
  min-width: 80px;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { border-color: var(--steel); color: var(--text-primary); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const DangerBtn = styled(ActionBtn)`
  &:hover { border-color: var(--danger); color: var(--danger); }
`;

const ConfirmBox = styled.div`
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.25);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConfirmText = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--danger);
`;

const ConfirmRow = styled.div`display: flex; gap: 6px;`;

const EmptyState = styled.div`
  width: 100%;
  max-width: 860px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 24px;
  text-align: center;
`;

const EmptyIcon = styled.div`font-size: 48px; opacity: 0.4;`;
const EmptyTitle = styled.h3`margin: 0; font-family: var(--font-display); font-size: 20px; color: var(--text-primary);`;
const EmptyHint = styled.p`margin: 0; font-size: 14px; color: var(--text-muted); max-width: 360px; line-height: 1.6;`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 2px solid var(--border);
  border-top-color: var(--ember);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PortfolioCard({ portfolio, onEdit, onDelete, addToast, backendUrl }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const liveUrl = portfolio.deploy_status && portfolio.slug
    ? `${backendUrl}/p/${portfolio.slug}`
    : null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${process.env.REACT_APP_API_URL}/portfolios/${portfolio.portfolio_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast({ type: "error", title: "Delete failed", message: err.detail });
        return;
      }

      addToast({ type: "success", title: "Portfolio deleted", message: "All data has been removed." });
      onDelete(portfolio.portfolio_id);
    } catch (err) {
      addToast({ type: "error", title: "Delete failed", message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardTop>
        <CardTitle>{portfolio.slug || `Portfolio ${portfolio.portfolio_id.slice(0, 6)}`}</CardTitle>
        <Badge $live={portfolio.deploy_status}>{portfolio.deploy_status ? "Live" : "Draft"}</Badge>
      </CardTop>

      <CardMeta>Created {formatDate(portfolio.created_at)}</CardMeta>

      {liveUrl && (
        <LiveLink href={liveUrl} target="_blank" rel="noopener noreferrer">
          {liveUrl}
        </LiveLink>
      )}

      {!confirmDelete ? (
        <CardActions>
          <ActionBtn onClick={() => onEdit(portfolio.session_id)}>
            ✎ Edit
          </ActionBtn>
          <DangerBtn onClick={() => setConfirmDelete(true)} disabled={deleting}>
            Delete
          </DangerBtn>
        </CardActions>
      ) : (
        <ConfirmBox>
          <ConfirmText>This deletes the portfolio and takes down the live link permanently.</ConfirmText>
          <ConfirmRow>
            <DangerBtn onClick={handleDelete} disabled={deleting} style={{ flex: 1 }}>
              {deleting ? "Deleting…" : "Yes, delete"}
            </DangerBtn>
            <ActionBtn onClick={() => setConfirmDelete(false)} style={{ flex: 1 }}>
              Cancel
            </ActionBtn>
          </ConfirmRow>
        </ConfirmBox>
      )}
    </Card>
  );
}

export default function Dashboard({ user, onNewPortfolio, onEditPortfolio, addToast }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!user) return;
    fetchPortfolios();
  }, [user]);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${backendUrl}/portfolios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setPortfolios(data.portfolios || []);
    } catch (err) {
      addToast({ type: "error", title: "Couldn't load portfolios", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (portfolio_id) => {
    setPortfolios(prev => prev.filter(p => p.portfolio_id !== portfolio_id));
  };

  return (
    <Wrap>
      <TopRow>
        <PageTitle>My Portfolios</PageTitle>
        <NewBtn onClick={onNewPortfolio}>+ New Portfolio</NewBtn>
      </TopRow>

      {loading ? (
        <Spinner />
      ) : portfolios.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🗂️</EmptyIcon>
          <EmptyTitle>No portfolios yet</EmptyTitle>
          <EmptyHint>Upload a resume to generate your first portfolio — it takes under 30 seconds.</EmptyHint>
          <NewBtn onClick={onNewPortfolio}>Generate my first portfolio</NewBtn>
        </EmptyState>
      ) : (
        <Grid>
          {portfolios.map(p => (
            <PortfolioCard
              key={p.portfolio_id}
              portfolio={p}
              onEdit={onEditPortfolio}
              onDelete={handleDelete}
              addToast={addToast}
              backendUrl={backendUrl}
            />
          ))}
        </Grid>
      )}
    </Wrap>
  );
}