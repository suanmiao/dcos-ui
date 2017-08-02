import classNames from "classnames/dedupe";
import React, { Component } from "react";

const MAX_NUM_COLS = 2;

class DoDontPanel extends Component {
  getGroupedChildren() {
    const { children } = this.props;
    const childrenCopy = children.slice();
    const groupings = [];

    while (childrenCopy.length > 0) {
      groupings.push(childrenCopy.splice(0, MAX_NUM_COLS));
    }

    return groupings;
  }

  render() {
    const { className } = this.props;
    const classes = classNames("do-dont-panel", className);

    const childrenGroups = this.getGroupedChildren();

    return (
      <div className={classes}>
        <div className="do-dont-table">
          {childrenGroups.map(function(grouping) {
            return (
              <div className="do-dont-row">
                {grouping.map(function(child) {
                  return <div className="do-dont-cell">{child}</div>;
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

DoDontPanel.propTypes = {
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = DoDontPanel;
