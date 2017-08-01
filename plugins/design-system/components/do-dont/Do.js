import classNames from "classnames/dedupe";
import React, { Component } from "react";

class Do extends Component {
  getTitle() {
    return "Do";
  }

  render() {
    const { className, description } = this.props;
    const classes = classNames("do-dont-container", className);

    return (
      <div className={classes}>
        <div className="do-dont-divider green" />
        <div className="do-dont-title green">
          {this.getTitle()}
        </div>
        <div className="do-dont-desc">
          {description}
        </div>
        {this.props.children}
      </div>
    );
  }
}

Do.propTypes = {
  description: React.PropTypes.string.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = Do;
