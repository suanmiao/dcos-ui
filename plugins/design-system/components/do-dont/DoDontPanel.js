import classNames from "classnames/dedupe";
import React, { Component } from "react";

class DoDontPanel extends Component {
  getGroupedChildren() {
    const { numOfCols, children } = this.props;
    const childrenCopy = children.slice();
    const groupings = [];

    while (childrenCopy.length > 0) {
      groupings.push(childrenCopy.splice(0, numOfCols));
    }

    return groupings;
  }

  render() {
    const { className } = this.props;
    const classes = classNames("do-dont-panel", className);

    const childrenGroups = this.getGroupedChildren();

    return (
      <div className={classes}>
        <table className="do-dont-table">
          {childrenGroups.map(function(grouping) {
            return (
              <tr>
                {grouping.map(function(child) {
                  return <td>{child}</td>;
                })}
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
}

DoDontPanel.propTypes = {
  numOfCols: React.PropTypes.number.isRequired,
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = DoDontPanel;
