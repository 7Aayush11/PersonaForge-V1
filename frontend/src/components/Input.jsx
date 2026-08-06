import React from 'react';
import styled from 'styled-components';

const Input = ({ onChange, accept = ".pdf,.jpg,.png", text = "Choose file" }) => {
  return (
    <StyledWrapper>
      <label className="inputLabel">
        <span className="labelText">{text}</span>
        <input
          className="input"
          type="file"
          accept={accept}
          onChange={onChange}
          aria-label="Upload file"
        />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`

  .inputLabel {
    position: relative;
    display: inline-block;
    width: 15em;
    height: 2.5em;
    border-radius: 10px;
    overflow: hidden;
  }

  .labelText {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: linear-gradient(90deg, rgba(74,157,236,0.18), rgba(124,58,237,0.12));
    color: #e1e1e1;
    font-weight: 700;
    transition: all 0.25s ease;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 0 18px;
    gap: 10px;
    box-shadow: 0 6px 18px rgba(2,6,23,0.45);
  }

  .inputLabel:hover .labelText,
  .inputLabel:focus-within .labelText {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(2,6,23,0.6), 0 0 0 6px rgba(74,157,236,0.06);
    background: linear-gradient(90deg, rgba(74,157,236,0.26), rgba(124,58,237,0.18));
  }

  .labelText::before{
    content: "📤";
    display: inline-block;
    font-size: 18px;
    margin-right: 8px;
  }

  .input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

export default Input;
