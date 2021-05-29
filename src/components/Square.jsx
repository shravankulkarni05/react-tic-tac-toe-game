import React from "react";

const square = (props) => {
  const square = props.square;

  const getMarkClasses = () => {
    let classes = "mark";
    if (square.markPlaceholder) {
      classes += " mark-placeholder";
    }
    if (square.chk) {
      classes +=
        square.state === props.players.x
          ? " x-marker"
          : square.state === props.players.o
          ? " o-marker"
          : "";
    }
    return classes;
  }

  return (
    <div
      className="square"
      style={{ cursor: square.chk ? "default" : "pointer" }}
      id={square.sqNo}
      onClick={() => props.placeMark()}
      onMouseEnter={() => props.squareMouseEnter()}
      onMouseLeave={() => props.squareMouseLeave()}
    >
      <span className={getMarkClasses()}>{square.state}</span>
    </div>
  );
};

export default square;
