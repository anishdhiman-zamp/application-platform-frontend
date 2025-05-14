interface ArtifactsProps {
  onClose: () => void;
  onExpand: () => void;
}

// TODO: Implement the artifacts component

const Artifacts = ({ onClose, onExpand }: ArtifactsProps) => {
  return (
    <div>
      <button onClick={onClose}>Close</button>
      <button onClick={onExpand}>Expand</button>
    </div>
  );
};

export default Artifacts;
