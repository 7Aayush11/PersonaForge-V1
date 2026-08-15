import styled from 'styled-components';
import Input from "./Input";

const Wrap = styled.div`
  display: flex;
  justify-content: center;
`;

export default function Upload({ handleUpload }) {
  return (
    <Wrap>
      <Input onChange={handleUpload} text={"Upload resume"} />
    </Wrap>
  );
}