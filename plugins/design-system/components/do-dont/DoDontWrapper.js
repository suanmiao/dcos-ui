import classNames from "classnames/dedupe";
import React, { Component } from "react";

class DoDontWrapper extends Component {
  render() {
    const { className } = this.props;
    const classes = classNames("do-dont-wrapper", className);

    return (
      <div className={classes}>
        {this.props.children}
      </div>
    );
  }
}

DoDontWrapper.propTypes = {
  numOfCols: React.PropTypes.number.isRequired,
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = DoDontWrapper;
