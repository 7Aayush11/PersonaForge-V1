import styled from 'styled-components';

const Bar = styled.footer`
  padding: 20px 28px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  text-align: center;
`;

const Note = styled.p`
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
`;

export default function Footer() {
  return (
    <Bar>
      <Note>No signup to generate. Resumes are deleted from our servers once your portfolio is built.</Note>
      <Note>&copy; {new Date().getFullYear()} PersonaForge</Note>
    </Bar>
  );
}