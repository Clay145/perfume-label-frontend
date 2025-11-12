const handlePositionChange = (id, newPos) => {
  setLabelData((prev) => ({
    ...prev,
    positions: {
      ...prev.positions,
      [id]: newPos,
    },
  }));
};